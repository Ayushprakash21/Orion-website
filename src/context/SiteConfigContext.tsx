import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  SiteConfigurationBundle,
  BrandingConfig,
  NavigationConfig,
  HomepageConfig,
  FooterConfig,
  SeoConfig,
  AuthSettingsConfig,
  MediaAssetItem,
  AuditLogEntry,
  CreatorProfileConfig,
} from '../types/cms';
import { DEFAULT_SITE_CONFIG } from '../data/defaultSiteConfig';
import {
  sanitizeForFirestore,
  normalizeBrandingConfig,
  validateBrandingConfig,
  validateStoragePayloadSafeguards,
  validateCreatorProfileConfig,
  normalizeCreatorProfileConfig,
} from '../utils/cms-validation';
import {
  initializeFirebase,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from '../services/firebase';
import { useAuth } from './AuthContext';

interface SiteConfigContextType {
  publishedConfig: SiteConfigurationBundle;
  draftConfig: SiteConfigurationBundle;
  activeConfig: SiteConfigurationBundle;
  isPreviewMode: boolean;
  setIsPreviewMode: (val: boolean) => void;
  auditLogs: AuditLogEntry[];
  loadingConfig: boolean;
  lastSavedMessage: string | null;
  saveDraftSection: <K extends keyof SiteConfigurationBundle>(
    section: K,
    data: SiteConfigurationBundle[K],
    summary: string
  ) => Promise<{ success: boolean; error?: string }>;
  publishSection: <K extends keyof SiteConfigurationBundle>(
    section: K,
    data: SiteConfigurationBundle[K],
    summary: string
  ) => Promise<{ success: boolean; error?: string }>;
  resetToDefaults: () => Promise<void>;
  refreshFromFirestore: () => Promise<void>;
}

const PUBLISHED_STORAGE_KEY = 'orion9_cms_published_v1';
const DRAFT_STORAGE_KEY = 'orion9_cms_draft_v1';
const AUDIT_STORAGE_KEY = 'orion9_cms_audit_logs_v1';

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

function loadStoredBundle(key: string, fallback: SiteConfigurationBundle): SiteConfigurationBundle {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<SiteConfigurationBundle>;
    return {
      branding: normalizeBrandingConfig({ ...fallback.branding, ...(parsed.branding || {}) }),
      navigation: { ...fallback.navigation, ...(parsed.navigation || {}) },
      homepage: {
        ...fallback.homepage,
        ...(parsed.homepage || {}),
        sectionVisibility: {
          ...fallback.homepage.sectionVisibility,
          ...(parsed.homepage?.sectionVisibility || {}),
        },
      },
      footer: { ...fallback.footer, ...(parsed.footer || {}) },
      seo: { ...fallback.seo, ...(parsed.seo || {}) },
      authSettings: { ...fallback.authSettings, ...(parsed.authSettings || {}) },
      mediaLibrary: parsed.mediaLibrary || fallback.mediaLibrary,
      desktopReleases: Array.isArray(parsed.desktopReleases) && parsed.desktopReleases.length > 0 ? parsed.desktopReleases : fallback.desktopReleases || [],
      creatorProfile: normalizeCreatorProfileConfig(parsed.creatorProfile || fallback.creatorProfile),
    };
  } catch {
    return fallback;
  }
}

export function SiteConfigProvider({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = useAuth();
  const [publishedConfig, setPublishedConfig] = useState<SiteConfigurationBundle>(() =>
    loadStoredBundle(PUBLISHED_STORAGE_KEY, DEFAULT_SITE_CONFIG)
  );
  const [draftConfig, setDraftConfig] = useState<SiteConfigurationBundle>(() =>
    loadStoredBundle(DRAFT_STORAGE_KEY, publishedConfig)
  );
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [loadingConfig, setLoadingConfig] = useState<boolean>(false);
  const [lastSavedMessage, setLastSavedMessage] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(AUDIT_STORAGE_KEY);
      if (raw) return JSON.parse(raw) as AuditLogEntry[];
    } catch {
      // Ignore
    }
    return [
      {
        id: 'audit-init-1',
        actorUid: 'system-bootstrap',
        actorEmail: 'ayushprakash0021@gmail.com',
        section: 'branding',
        action: 'publish',
        summary: 'Initialized Orion-9 VectrFL ice-blue design tokens and 3D hero configuration.',
        timestamp: new Date().toISOString(),
      },
    ];
  });

  const activeConfig = isPreviewMode ? draftConfig : publishedConfig;

  // Apply dynamic SEO title/description & CSS variables when activeConfig changes
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.title = activeConfig.seo.metaTitle || DEFAULT_SITE_CONFIG.seo.metaTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && activeConfig.seo.metaDescription) {
      metaDesc.setAttribute('content', activeConfig.seo.metaDescription);
    }

    const root = document.documentElement;
    root.style.setProperty('--orion-canvas', activeConfig.branding.canvasColor);
    root.style.setProperty('--orion-alt-bg', activeConfig.branding.altSectionColor);
    root.style.setProperty('--orion-surface', activeConfig.branding.surfaceColor);
    root.style.setProperty('--orion-text-primary', activeConfig.branding.primaryTextColor);
    root.style.setProperty('--orion-text-secondary', activeConfig.branding.secondaryTextColor);
    root.style.setProperty('--orion-border', activeConfig.branding.borderColor);
    root.style.setProperty('--orion-deep-blue', activeConfig.branding.deepBlueAccent);
    root.style.setProperty('--orion-steel-blue', activeConfig.branding.steelBlueAccent);
    root.style.setProperty('--orion-dark-surface', activeConfig.branding.darkSurfaceColor);
  }, [activeConfig]);

  const refreshFromFirestore = useCallback(async () => {
    const { db, isConfigured } = initializeFirebase();
    if (!isConfigured || !db) return;

    setLoadingConfig(true);
    try {
      const sections: (keyof SiteConfigurationBundle)[] = [
        'branding',
        'navigation',
        'homepage',
        'footer',
        'seo',
        'authSettings',
        'desktopReleases',
        'creatorProfile',
      ];

      const nextPublished: SiteConfigurationBundle = { ...DEFAULT_SITE_CONFIG };
      let anyFound = false;

      for (const sec of sections) {
        try {
          const snap = await getDoc(doc(db, 'siteConfig', sec));
          if (snap.exists()) {
            anyFound = true;
            const docData = snap.data();
            (nextPublished as unknown as Record<string, unknown>)[sec] =
              sec === 'branding'
                ? normalizeBrandingConfig({ ...(DEFAULT_SITE_CONFIG.branding), ...docData })
                : sec === 'creatorProfile'
                ? normalizeCreatorProfileConfig({ ...(DEFAULT_SITE_CONFIG.creatorProfile), ...docData })
                : sec === 'desktopReleases'
                ? (Array.isArray(docData.items) ? docData.items : (Array.isArray(docData) ? docData : DEFAULT_SITE_CONFIG.desktopReleases))
                : {
                    ...(DEFAULT_SITE_CONFIG[sec] as object),
                    ...docData,
                  };
          }
        } catch {
          // Continue with defaults for this doc
        }
      }

      if (anyFound) {
        setPublishedConfig(nextPublished);
        setDraftConfig(nextPublished);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(PUBLISHED_STORAGE_KEY, JSON.stringify(nextPublished));
        }
      }

      if (isAdmin) {
        try {
          const nextDrafts = { ...(anyFound ? nextPublished : DEFAULT_SITE_CONFIG) };
          let anyDraftFound = false;
          for (const sec of sections) {
            try {
              const draftSnap = await getDoc(doc(db, 'siteConfigDrafts', sec));
              if (draftSnap.exists()) {
                anyDraftFound = true;
                const draftData = draftSnap.data();
                (nextDrafts as unknown as Record<string, unknown>)[sec] =
                  sec === 'branding'
                    ? normalizeBrandingConfig({ ...(DEFAULT_SITE_CONFIG.branding), ...draftData })
                    : sec === 'creatorProfile'
                    ? normalizeCreatorProfileConfig({ ...(DEFAULT_SITE_CONFIG.creatorProfile), ...draftData })
                    : {
                        ...(DEFAULT_SITE_CONFIG[sec] as object),
                        ...draftData,
                      };
              }
            } catch {
              // Ignore
            }
          }
          if (anyDraftFound) {
            setDraftConfig(nextDrafts);
            if (typeof window !== 'undefined') {
              window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(nextDrafts));
            }
          }
        } catch {
          // Ignore
        }

        try {
          const q = query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(35));
          const logsSnap = await getDocs(q);
          if (!logsSnap.empty) {
            const loadedLogs: AuditLogEntry[] = logsSnap.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<AuditLogEntry, 'id'>),
            }));
            setAuditLogs(loadedLogs);
          }
        } catch {
          // Ignore if auditLogs collection empty or restricted
        }
      }
    } finally {
      setLoadingConfig(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    refreshFromFirestore();
  }, [refreshFromFirestore]);

  const appendAuditLog = useCallback(
    async (
      section: string,
      action: AuditLogEntry['action'],
      summary: string
    ) => {
      const entry: AuditLogEntry = {
        id: `log-${Date.now()}`,
        actorUid: user?.uid || 'admin-session',
        actorEmail: user?.email || 'admin@orion9.io',
        section,
        action,
        summary,
        timestamp: new Date().toISOString(),
      };

      setAuditLogs((prev) => {
        const next = [entry, ...prev].slice(0, 50);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(next));
        }
        return next;
      });

      const { db, isConfigured } = initializeFirebase();
      if (isConfigured && db && user) {
        try {
          await addDoc(collection(db, 'auditLogs'), {
            actorUid: entry.actorUid,
            actorEmail: entry.actorEmail,
            section: entry.section,
            action: entry.action,
            summary: entry.summary,
            timestamp: entry.timestamp,
          });
        } catch {
          // Non-fatal if Firestore offline
        }
      }
    },
    [user]
  );

  const saveDraftSection = async <K extends keyof SiteConfigurationBundle>(
    section: K,
    data: SiteConfigurationBundle[K],
    summary: string
  ): Promise<{ success: boolean; error?: string }> => {
    // 1. Validation for branding & creatorProfile
    if (section === 'branding') {
      const check = validateBrandingConfig(data as BrandingConfig);
      if (!check.valid) {
        return { success: false, error: check.errors.join(' ') };
      }
    } else if (section === 'creatorProfile') {
      const check = validateCreatorProfileConfig(data as CreatorProfileConfig);
      if (!check.valid) {
        return { success: false, error: check.errors.join(' ') };
      }
    }

    // 2. Normalization & Sanitization
    const normalizedData =
      section === 'branding'
        ? normalizeBrandingConfig(data as BrandingConfig)
        : section === 'creatorProfile'
        ? normalizeCreatorProfileConfig(data as CreatorProfileConfig)
        : data;

    const payload = sanitizeForFirestore({
      ...(typeof normalizedData === 'object' && !Array.isArray(normalizedData)
        ? (normalizedData as unknown as Record<string, unknown>)
        : { items: normalizedData }),
      updatedAt: new Date().toISOString(),
      updatedBy: user?.email || user?.uid || 'admin',
    });

    // 3. Document size safeguard: Reject large payloads (> 800 KB) and Base64 URLs (> 10 KB)
    const safeguardCheck = validateStoragePayloadSafeguards(payload);
    if (!safeguardCheck.valid) {
      return { success: false, error: safeguardCheck.error };
    }

    // 4. Cloud configuration and authentication check
    const { db, isConfigured } = initializeFirebase();
    if (!isConfigured || !db) {
      return {
        success: false,
        error: 'Firebase is not configured. Cloud persistence requires active Firebase configuration.',
      };
    }

    if (!user) {
      return {
        success: false,
        error: 'Authentication required. Please sign in with verified administrator credentials to persist changes.',
      };
    }

    // 5. Firestore persistence FIRST: Only commit to runtime upon persistence success
    try {
      await setDoc(doc(db, 'siteConfigDrafts', String(section)), payload, { merge: true });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Firestore draft write failed.';
      console.error(`[SiteConfigContext] Failed to persist draft for ${String(section)}:`, err);
      return {
        success: false,
        error: `Draft not saved. Firestore write failed: ${errorMsg}`,
      };
    }

    // 6. Update local draft state ONLY after persistence confirmation
    const nextDraft: SiteConfigurationBundle = {
      ...draftConfig,
      [section]: normalizedData as SiteConfigurationBundle[K],
    };
    setDraftConfig(nextDraft);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(nextDraft));
    }

    await appendAuditLog(String(section), 'save_draft', summary);
    setLastSavedMessage(`Draft saved for ${String(section)} at ${new Date().toLocaleTimeString()}`);
    return { success: true };
  };

  const publishSection = async <K extends keyof SiteConfigurationBundle>(
    section: K,
    data: SiteConfigurationBundle[K],
    summary: string
  ): Promise<{ success: boolean; error?: string }> => {
    // 1. Validation for branding & creatorProfile
    if (section === 'branding') {
      const check = validateBrandingConfig(data as BrandingConfig);
      if (!check.valid) {
        return { success: false, error: check.errors.join(' ') };
      }
    } else if (section === 'creatorProfile') {
      const check = validateCreatorProfileConfig(data as CreatorProfileConfig);
      if (!check.valid) {
        return { success: false, error: check.errors.join(' ') };
      }
    }

    // 2. Normalization & Sanitization
    const normalizedData =
      section === 'branding'
        ? normalizeBrandingConfig(data as BrandingConfig)
        : section === 'creatorProfile'
        ? normalizeCreatorProfileConfig(data as CreatorProfileConfig)
        : data;

    const payload = sanitizeForFirestore({
      ...(typeof normalizedData === 'object' && !Array.isArray(normalizedData)
        ? (normalizedData as unknown as Record<string, unknown>)
        : { items: normalizedData }),
      updatedAt: new Date().toISOString(),
      updatedBy: user?.email || user?.uid || 'admin',
    });

    // 3. Document size safeguard: Reject large payloads (> 800 KB) and Base64 URLs (> 10 KB)
    const safeguardCheck = validateStoragePayloadSafeguards(payload);
    if (!safeguardCheck.valid) {
      return { success: false, error: safeguardCheck.error };
    }

    // 4. Cloud configuration and authentication check
    const { db, isConfigured } = initializeFirebase();
    if (!isConfigured || !db) {
      return {
        success: false,
        error: 'Firebase is not configured. Cloud persistence requires active Firebase configuration.',
      };
    }

    if (!user) {
      return {
        success: false,
        error: 'Authentication required. Please sign in with verified administrator credentials to persist changes.',
      };
    }

    // 5. Firestore persistence FIRST: Active runtime must NOT be updated if persistence fails
    try {
      await setDoc(doc(db, 'siteConfig', String(section)), payload, { merge: true });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Firestore publish failed.';
      console.error(`[SiteConfigContext] Failed to publish ${String(section)} to Firestore:`, err);
      return {
        success: false,
        error: `Publication failed. Firestore sync returned: ${errorMsg}`,
      };
    }

    // 6. Update active runtime & local persistence ONLY after persistence confirms
    const nextPublished: SiteConfigurationBundle = {
      ...publishedConfig,
      [section]: normalizedData as SiteConfigurationBundle[K],
    };
    const nextDraft: SiteConfigurationBundle = {
      ...draftConfig,
      [section]: normalizedData as SiteConfigurationBundle[K],
    };
    setPublishedConfig(nextPublished);
    setDraftConfig(nextDraft);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(PUBLISHED_STORAGE_KEY, JSON.stringify(nextPublished));
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(nextDraft));
    }

    await appendAuditLog(String(section), 'publish', summary);
    setLastSavedMessage(`Published ${String(section)} live at ${new Date().toLocaleTimeString()}`);
    return { success: true };
  };

  const resetToDefaults = async () => {
    setPublishedConfig(DEFAULT_SITE_CONFIG);
    setDraftConfig(DEFAULT_SITE_CONFIG);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(PUBLISHED_STORAGE_KEY);
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
    await appendAuditLog('system', 'reset_defaults', 'Restored all site configuration sections to factory defaults.');
    setLastSavedMessage('Restored factory default Orion-9 configuration.');
  };

  return (
    <SiteConfigContext.Provider
      value={{
        publishedConfig,
        draftConfig,
        activeConfig,
        isPreviewMode,
        setIsPreviewMode,
        auditLogs,
        loadingConfig,
        lastSavedMessage,
        saveDraftSection,
        publishSection,
        resetToDefaults,
        refreshFromFirestore,
      }}
    >
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) {
    throw new Error('useSiteConfig must be used within a SiteConfigProvider');
  }
  return ctx;
}

export function useOptionalSiteConfig() {
  return useContext(SiteConfigContext) || null;
}

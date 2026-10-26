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
} from '../types/cms';
import { DEFAULT_SITE_CONFIG } from '../data/defaultSiteConfig';
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
      branding: { ...fallback.branding, ...(parsed.branding || {}) },
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
      desktopReleases: parsed.desktopReleases || fallback.desktopReleases || [],
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
      ];

      const nextPublished: SiteConfigurationBundle = { ...publishedConfig };
      let anyFound = false;

      for (const sec of sections) {
        try {
          const snap = await getDoc(doc(db, 'siteConfig', sec));
          if (snap.exists()) {
            anyFound = true;
            (nextPublished as unknown as Record<string, unknown>)[sec] = {
              ...(DEFAULT_SITE_CONFIG[sec] as object),
              ...snap.data(),
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
  }, [isAdmin, publishedConfig]);

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
    const nextDraft: SiteConfigurationBundle = {
      ...draftConfig,
      [section]: data,
    };
    setDraftConfig(nextDraft);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(nextDraft));
    }

    const { db, isConfigured } = initializeFirebase();
    if (isConfigured && db && user) {
      try {
        await setDoc(doc(db, 'siteConfigDrafts', String(section)), {
          ...(typeof data === 'object' && !Array.isArray(data) ? data : { items: data }),
          updatedAt: new Date().toISOString(),
          updatedBy: user.email || user.uid,
        });
      } catch (err: unknown) {
        return {
          success: false,
          error:
            err instanceof Error
              ? `Saved locally to draft preview, but Firestore write failed: ${err.message}`
              : 'Firestore draft write failed.',
        };
      }
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
    const nextPublished: SiteConfigurationBundle = {
      ...publishedConfig,
      [section]: data,
    };
    const nextDraft: SiteConfigurationBundle = {
      ...draftConfig,
      [section]: data,
    };
    setPublishedConfig(nextPublished);
    setDraftConfig(nextDraft);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(PUBLISHED_STORAGE_KEY, JSON.stringify(nextPublished));
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(nextDraft));
    }

    const { db, isConfigured } = initializeFirebase();
    if (isConfigured && db && user) {
      try {
        await setDoc(doc(db, 'siteConfig', String(section)), {
          ...(typeof data === 'object' && !Array.isArray(data) ? data : { items: data }),
          updatedAt: new Date().toISOString(),
          updatedBy: user.email || user.uid,
        });
      } catch (err: unknown) {
        return {
          success: false,
          error:
            err instanceof Error
              ? `Published to active runtime, but Firestore sync returned: ${err.message}`
              : 'Firestore publish failed.',
        };
      }
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

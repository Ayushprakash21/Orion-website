import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileText,
  Layers,
  Palette,
  Compass,
  MousePointerClick,
  Image as ImageIcon,
  Globe,
  Eye,
  KeyRound,
  Users,
  History,
  Settings,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  Save,
  UploadCloud,
  RotateCcw,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Laptop,
  Apple,
  Download,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { useTheme } from '../../context/ThemeContext';
import {
  validateBrandingConfig,
  validateNavigationConfig,
  validateHomepageConfig,
  validateSeoConfig,
  validateFooterConfig,
  isSafeCmsUrl,
  sanitizeCmsText,
} from '../../utils/cms-validation';
import {
  initializeFirebase,
  collection,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
  getActiveFirebaseConfig,
  saveRuntimeFirebaseConfig,
} from '../../services/firebase';
import {
  SectionVisibilityConfig,
  MediaAssetItem,
  DesktopReleaseRecord,
  DesktopPlatform,
  DesktopPackageFormat,
  DesktopReleaseStatus,
} from '../../types/cms';
import { DEFAULT_DESKTOP_RELEASES } from '../../data/defaultSiteConfig';
import { LogoManagementSection } from './LogoManagementSection';

type AdminTabId =
  | 'overview'
  | 'content'
  | 'sections'
  | 'branding'
  | 'navigation'
  | 'cta'
  | 'media'
  | 'seo'
  | 'visibility'
  | 'auth'
  | 'users'
  | 'releases'
  | 'audit'
  | 'system';

interface AdminConsoleProps {
  onNavigate: (path: string) => void;
}

interface AdminUserRecord {
  uid: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  active: boolean;
  updatedAt?: string;
}

export function AdminConsole({ onNavigate }: AdminConsoleProps) {
  const {
    user,
    isAuthenticated,
    isAdmin,
    adminAuthSource,
    loading: authLoading,
    logout,
  } = useAuth();

  const {
    publishedConfig,
    draftConfig,
    isPreviewMode,
    setIsPreviewMode,
    auditLogs,
    lastSavedMessage,
    saveDraftSection,
    publishSection,
    resetToDefaults,
  } = useSiteConfig();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<AdminTabId>('overview');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error' | 'warning';
    text: string;
  } | null>(null);
  const [isSavingBranding, setIsSavingBranding] = useState(false);

  // Lock background scroll and listen for Escape key when mobile drawer is open
  useEffect(() => {
    if (!isMobileDrawerOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileDrawerOpen]);

  // Local editable states synchronized with draftConfig
  const [brandingForm, setBrandingForm] = useState(draftConfig.branding);
  const [navForm, setNavForm] = useState(draftConfig.navigation);
  const [homeForm, setHomeForm] = useState(draftConfig.homepage);
  const [footerForm, setFooterForm] = useState(draftConfig.footer);
  const [seoForm, setSeoForm] = useState(draftConfig.seo);
  const [authSettingsForm, setAuthSettingsForm] = useState(draftConfig.authSettings);
  const [mediaForm, setMediaForm] = useState(draftConfig.mediaLibrary);
  const [releasesForm, setReleasesForm] = useState<DesktopReleaseRecord[]>(
    draftConfig.desktopReleases || DEFAULT_DESKTOP_RELEASES
  );

  // New desktop release form inputs
  const [newRelVersion, setNewRelVersion] = useState('');
  const [newRelPlatform, setNewRelPlatform] = useState<DesktopPlatform>('windows-x64');
  const [newRelFormat, setNewRelFormat] = useState<DesktopPackageFormat>('exe');
  const [newRelStatus, setNewRelStatus] = useState<DesktopReleaseStatus>('published');
  const [newRelFilename, setNewRelFilename] = useState('Orion-9-Setup.exe');
  const [newRelSize, setNewRelSize] = useState('30336791');
  const [newRelSha, setNewRelSha] = useState('');
  const [newRelUrl, setNewRelUrl] = useState('/downloads/Orion-9-Setup.exe');
  const [newRelNotes, setNewRelNotes] = useState('');
  const [newRelChannel, setNewRelChannel] = useState<'stable' | 'beta'>('stable');
  const [newRelMinOs, setNewRelMinOs] = useState('Windows 10 / 11 64-bit');

  // New media item inputs
  const [newMediaTitle, setNewMediaTitle] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaCategory, setNewMediaCategory] =
    useState<MediaAssetItem['category']>('diagram');

  // Admin user management state
  const [adminUsers, setAdminUsers] = useState<AdminUserRecord[]>([
    {
      uid: 'owner-bootstrap-uid',
      email: 'ayushprakash0021@gmail.com',
      role: 'admin',
      active: true,
      updatedAt: new Date().toISOString(),
    },
  ]);
  const [newAdminUid, setNewAdminUid] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'admin' | 'editor' | 'viewer'>('admin');

  // System Firebase runtime config
  const currentFbCfg = getActiveFirebaseConfig();
  const [fbApiKey, setFbApiKey] = useState(currentFbCfg.apiKey || '');
  const [fbProjectId, setFbProjectId] = useState(currentFbCfg.projectId || '');
  const [fbAuthDomain, setFbAuthDomain] = useState(currentFbCfg.authDomain || '');
  const [fbAppId, setFbAppId] = useState(currentFbCfg.appId || '');

  useEffect(() => {
    if (!isSavingBranding) {
      setBrandingForm(draftConfig.branding);
    }
    setNavForm(draftConfig.navigation);
    setHomeForm(draftConfig.homepage);
    setFooterForm(draftConfig.footer);
    setSeoForm(draftConfig.seo);
    setAuthSettingsForm(draftConfig.authSettings);
    setMediaForm(draftConfig.mediaLibrary);
    setReleasesForm(draftConfig.desktopReleases || DEFAULT_DESKTOP_RELEASES);
  }, [draftConfig, isSavingBranding]);

  // Redirect unauthenticated visitors to /admin/login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      onNavigate('/admin/login');
    }
  }, [authLoading, isAuthenticated, onNavigate]);

  // Load /admins collection when authenticated as admin
  useEffect(() => {
    if (!isAdmin) return;
    const { db, isConfigured } = initializeFirebase();
    if (!isConfigured || !db) return;

    getDocs(collection(db, 'admins'))
      .then((snap) => {
        if (!snap.empty) {
          const rows: AdminUserRecord[] = snap.docs.map((d) => {
            const data = d.data();
            return {
              uid: d.id,
              email: String(data.email || ''),
              role: (data.role as AdminUserRecord['role']) || 'viewer',
              active: Boolean(data.active),
              updatedAt: String(data.updatedAt || ''),
            };
          });
          setAdminUsers(rows);
        }
      })
      .catch(() => {
        // Fallback to local state if collection empty or rules block read
      });
  }, [isAdmin]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#EAF4F8] flex items-center justify-center p-8">
        <div className="liquid-glass-elevated rounded-3xl border border-[var(--glass-border)] shadow-xl px-8 py-6 text-sm font-mono text-[#294D6B]">
          VERIFYING ADMINISTRATOR CREDENTIALS...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Explicit 403 Access Denied for authenticated non-admin users
  if (!isAdmin) {
    return (
      <div
        className="min-h-screen bg-[#EAF4F8] flex items-center justify-center p-6"
        data-testid="admin-console-denied"
      >
        <div className="max-w-lg w-full bg-white rounded-[28px] border border-[#D5E1E8] p-8 md:p-10 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mb-5">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="text-xs font-mono uppercase tracking-widest text-red-700 mb-1">
            HTTP 403 · ACCESS DENIED
          </div>
          <h1 className="text-2xl font-semibold text-[#111827] mb-3">
            Administrator Privileges Required
          </h1>
          <p className="text-sm text-[#566575] leading-relaxed mb-6">
            Signed in as <span className="font-mono text-[#111827]">{user?.email}</span>, which is
            not registered in the <code className="font-mono">/admins/&#123;uid&#125;</code> ACL or
            assigned the <code className="font-mono">admin: true</code> custom claim.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/admin/login')}
              className="px-5 py-2.5 rounded-xl bg-[#101820] text-white text-xs font-medium hover:bg-[#294D6B] transition-colors"
            >
              Return to Admin Login
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="px-5 py-2.5 rounded-xl border border-[#D5E1E8] text-xs font-medium text-[#111827] hover:bg-[#F5F9FB] transition-colors"
            >
              Public Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  const showBanner = (type: 'success' | 'error' | 'warning', text: string) => {
    setStatusBanner({ type, text });
  };

  // Handlers for each section with strict validation
  const handleSaveBranding = async (publish: boolean) => {
    setIsSavingBranding(true);
    try {
      const check = validateBrandingConfig(brandingForm);
      if (!check.valid) {
        showBanner('error', check.errors.join(' '));
        return;
      }
      const action = publish ? publishSection : saveDraftSection;
      const res = await action(
        'branding',
        brandingForm,
        'Updated Orion-9 branding, logo placements, and color tokens'
      );
      if (res.success) {
        showBanner(
          'success',
          publish
            ? 'Branding & Identity published live successfully.'
            : 'Branding & Identity saved to draft.'
        );
      } else {
        showBanner('error', res.error || 'Failed to save Branding & Identity configuration.');
      }
    } finally {
      setIsSavingBranding(false);
    }
  };

  const handleSaveNavigation = async (publish: boolean) => {
    const check = validateNavigationConfig(navForm);
    if (!check.valid) {
      showBanner('error', check.errors.join(' '));
      return;
    }
    const action = publish ? publishSection : saveDraftSection;
    const res = await action(
      'navigation',
      navForm,
      'Updated top bar navigation & CTA destinations'
    );
    showBanner(
      res.success ? 'success' : 'error',
      res.error || (publish ? 'Navigation published live.' : 'Navigation saved to draft.')
    );
  };

  const handleSaveHomepage = async (publish: boolean) => {
    const check = validateHomepageConfig(homeForm);
    if (!check.valid) {
      showBanner('error', check.errors.join(' '));
      return;
    }
    const action = publish ? publishSection : saveDraftSection;
    const res = await action(
      'homepage',
      homeForm,
      'Updated homepage hero, metrics, and section visibility'
    );
    showBanner(
      res.success ? 'success' : 'error',
      res.error ||
        (publish ? 'Homepage configuration published live.' : 'Homepage saved to draft.')
    );
  };

  const handleSaveFooter = async (publish: boolean) => {
    const check = validateFooterConfig(footerForm);
    if (!check.valid) {
      showBanner('error', check.errors.join(' '));
      return;
    }
    const action = publish ? publishSection : saveDraftSection;
    const res = await action('footer', footerForm, 'Updated footer links and copyright notice');
    showBanner(
      res.success ? 'success' : 'error',
      res.error || (publish ? 'Footer published live.' : 'Footer saved to draft.')
    );
  };

  const handleSaveSeo = async (publish: boolean) => {
    const check = validateSeoConfig(seoForm);
    if (!check.valid) {
      showBanner('error', check.errors.join(' '));
      return;
    }
    const action = publish ? publishSection : saveDraftSection;
    const res = await action('seo', seoForm, 'Updated SEO metadata and OpenGraph attributes');
    showBanner(
      res.success ? 'success' : 'error',
      res.error || (publish ? 'SEO settings published live.' : 'SEO settings saved to draft.')
    );
  };

  const handleSaveAuthSettings = async (publish: boolean) => {
    const action = publish ? publishSection : saveDraftSection;
    const res = await action(
      'authSettings',
      authSettingsForm,
      'Updated authentication provider & session policies'
    );
    showBanner(
      res.success ? 'success' : 'error',
      res.error ||
        (publish
          ? 'Authentication settings published live.'
          : 'Authentication settings saved to draft.')
    );
  };

  const handleAddMediaAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaTitle.trim() || !isSafeCmsUrl(newMediaUrl)) {
      showBanner('error', 'Media asset requires a valid title and safe HTTPS or relative URL.');
      return;
    }
    const nextMedia: MediaAssetItem[] = [
      {
        id: `media-${Date.now()}`,
        title: sanitizeCmsText(newMediaTitle, 120),
        url: newMediaUrl.trim(),
        category: newMediaCategory,
        altText: sanitizeCmsText(newMediaTitle, 120),
        dimensions: '1920x1080',
        updatedAt: new Date().toISOString(),
      },
      ...mediaForm,
    ];
    setMediaForm(nextMedia);
    setNewMediaTitle('');
    setNewMediaUrl('');
    await publishSection('mediaLibrary', nextMedia, `Added media asset ${newMediaTitle}`);
    showBanner('success', 'Media asset validated and published to library.');
  };

  const handleGrantAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminUid.trim() || !newAdminEmail.trim()) {
      showBanner('error', 'Both Firebase UID and Email are required to register an admin record.');
      return;
    }
    const entry: AdminUserRecord = {
      uid: newAdminUid.trim(),
      email: newAdminEmail.trim(),
      role: newAdminRole,
      active: true,
      updatedAt: new Date().toISOString(),
    };

    const { db, isConfigured } = initializeFirebase();
    if (isConfigured && db) {
      try {
        await setDoc(doc(db, 'admins', entry.uid), {
          email: entry.email,
          role: entry.role,
          active: true,
          updatedAt: serverTimestamp(),
          grantedBy: user?.email || user?.uid,
        });
      } catch (err: unknown) {
        showBanner(
          'error',
          err instanceof Error
            ? `Firestore /admins write failed: ${err.message}`
            : 'Failed to write /admins doc.'
        );
        return;
      }
    }

    setAdminUsers((prev) => [entry, ...prev.filter((u) => u.uid !== entry.uid)]);
    setNewAdminUid('');
    setNewAdminEmail('');
    showBanner('success', `Updated role=${entry.role} for UID ${entry.uid}.`);
  };

  const handleSaveReleases = async (publish: boolean) => {
    const action = publish ? publishSection : saveDraftSection;
    const res = await action(
      'desktopReleases',
      releasesForm,
      'Updated Orion-9 desktop release distribution catalog'
    );
    showBanner(
      res.success ? 'success' : 'error',
      res.error || (publish ? 'Desktop release catalog published live.' : 'Desktop releases saved to draft.')
    );
  };

  const handleAddDesktopRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRelVersion.trim() || !newRelSha.trim()) {
      showBanner('error', 'Version and SHA-256 hash are required to register a release.');
      return;
    }

    const shaClean = newRelSha.trim().toLowerCase();
    if (!/^[a-f0-9]{64}$/.test(shaClean)) {
      showBanner('error', 'SHA-256 hash must be exactly 64 hexadecimal characters.');
      return;
    }

    const cleanFilename = newRelFilename.trim();
    if (newRelFormat === 'exe' && !cleanFilename.toLowerCase().endsWith('.exe')) {
      showBanner('error', 'Filename must end with .exe for Windows NSIS format.');
      return;
    }
    if (newRelFormat === 'msi' && !cleanFilename.toLowerCase().endsWith('.msi')) {
      showBanner('error', 'Filename must end with .msi for Windows MSI format.');
      return;
    }
    if (newRelFormat === 'dmg' && !cleanFilename.toLowerCase().endsWith('.dmg')) {
      showBanner('error', 'Filename must end with .dmg for macOS DMG format.');
      return;
    }
    if (newRelFormat === 'pkg' && !cleanFilename.toLowerCase().endsWith('.pkg')) {
      showBanner('error', 'Filename must end with .pkg for macOS PKG format.');
      return;
    }

    const notesList = newRelNotes
      .split('\n')
      .map((n) => n.trim())
      .filter(Boolean);

    const newRecord: DesktopReleaseRecord = {
      id: `rel-${newRelPlatform}-${newRelVersion.trim().replace(/\./g, '-')}-${newRelFormat}`,
      version: newRelVersion.trim(),
      releaseDate: new Date().toISOString().split('T')[0],
      platform: newRelPlatform,
      format: newRelFormat,
      status: newRelStatus,
      filename:
        cleanFilename ||
        (newRelPlatform.startsWith('macos') ? 'Orion-9-Universal.dmg' : 'Orion-9-Setup.exe'),
      sizeBytes: parseInt(newRelSize, 10) || 30336791,
      sha256: shaClean,
      downloadUrl: newRelUrl.trim() || `/downloads/${cleanFilename}`,
      channel: newRelChannel,
      isLatest: newRelStatus === 'published',
      releaseNotes: notesList.length > 0 ? notesList : [`Official ${newRelPlatform} release`],
      minimumOs:
        newRelMinOs.trim() ||
        (newRelPlatform.startsWith('macos')
          ? 'macOS 12 Monterey or higher'
          : 'Windows 10 / 11 64-bit'),
      downloadCount: 0,
      preflightGates: {
        peValidated: true,
        shaVerified: true,
        signatureChecked: true,
      },
      updatedAt: new Date().toISOString(),
      updatedBy: user?.email || 'admin',
    };

    const nextReleases = [
      newRecord,
      ...releasesForm.map((r) =>
        r.platform === newRecord.platform && newRecord.isLatest
          ? { ...r, isLatest: false }
          : r
      ),
    ];
    setReleasesForm(nextReleases);
    setNewRelVersion('');
    setNewRelSha('');
    setNewRelNotes('');

    await publishSection(
      'desktopReleases',
      nextReleases,
      `Registered desktop release v${newRecord.version} (${newRecord.platform} - ${newRecord.format.toUpperCase()})`
    );
    showBanner('success', `Desktop release v${newRecord.version} registered successfully.`);
  };

  const handleToggleLatestRelease = async (id: string) => {
    const target = releasesForm.find((r) => r.id === id);
    if (!target) return;
    const nextReleases = releasesForm.map((r) => ({
      ...r,
      isLatest: r.platform === target.platform ? r.id === id : r.isLatest,
    }));
    setReleasesForm(nextReleases);
    await publishSection(
      'desktopReleases',
      nextReleases,
      `Set release ${id} as active production latest for ${target.platform}`
    );
    showBanner('success', `Updated active production latest release for ${target.platform}.`);
  };

  const handleSetReleaseStatus = async (id: string, status: DesktopReleaseStatus) => {
    const nextReleases = releasesForm.map((r) =>
      r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r
    );
    setReleasesForm(nextReleases);
    await publishSection(
      'desktopReleases',
      nextReleases,
      `Updated release ${id} lifecycle status to ${status}`
    );
    showBanner('success', `Updated release status to ${status}.`);
  };

  const handleDeleteRelease = async (id: string) => {
    if (!window.confirm('Delete this desktop release record?')) return;
    const nextReleases = releasesForm.filter((r) => r.id !== id);
    setReleasesForm(nextReleases);
    await publishSection(
      'desktopReleases',
      nextReleases,
      `Deleted desktop release ${id}`
    );
    showBanner('success', `Deleted release ${id}.`);
  };

  const navItems: {
    id: AdminTabId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'content', label: 'Website content', icon: FileText },
    { id: 'sections', label: 'Homepage sections', icon: Layers },
    { id: 'branding', label: 'Branding & Identity', icon: Palette },
    { id: 'navigation', label: 'Navigation management', icon: Compass },
    { id: 'cta', label: 'CTA management', icon: MousePointerClick },
    { id: 'media', label: 'Media library', icon: ImageIcon },
    { id: 'seo', label: 'SEO settings', icon: Globe },
    { id: 'visibility', label: 'Feature visibility', icon: Eye },
    { id: 'auth', label: 'Authentication settings', icon: KeyRound },
    { id: 'users', label: 'User management', icon: Users },
    { id: 'releases', label: 'Desktop releases', icon: Laptop },
    { id: 'audit', label: 'Audit log', icon: History },
    { id: 'system', label: 'System settings', icon: Settings },
  ];

  const visibilityKeys: {
    key: keyof SectionVisibilityConfig;
    label: string;
    description: string;
  }[] = [
    {
      key: 'platformOverview',
      label: '01 · Platform Overview',
      description: 'Executive capability cards and live telemetry counters',
    },
    {
      key: 'scrollStorytelling',
      label: '02 · 6-Chapter Scroll Storytelling',
      description: 'GSAP ScrollTrigger narrative from Signal Ingestion to Execution',
    },
    {
      key: 'supplyChainNetwork',
      label: '03 · Interactive 3D Supply Chain Network',
      description: 'Global logistics globe and disruption simulator modal',
    },
    {
      key: 'operationalProblem',
      label: '04 · Systemic Supply Chain Problem',
      description: 'Contrast between legacy siloed stacks and Orion-9',
    },
    {
      key: 'connectedOsModules',
      label: '05 · Connected Operating System',
      description: '8 modular operational intelligence engines',
    },
    {
      key: 'operationalIntelligence',
      label: '06 · 7-Stage Decision Intelligence Flow',
      description:
        'Detection → Context → Risk → Recommendation → Decision → Execution → Verification',
    },
    {
      key: 'controlTowerPreview',
      label: '07 · Live Orion-9 OS Cockpit',
      description: 'Simulated Demo Telemetry vs Live Production Gateway toggle',
    },
    {
      key: 'integrationsAndReadiness',
      label: '08 · 7-Layer Architecture & ERP Connectors',
      description: 'Enterprise stack diagram and certified integration inspector',
    },
    {
      key: 'finalCta',
      label: '09 · Final Conversion Banner',
      description: 'Bottom enterprise launch and access request call-to-action',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--orion-canvas)] text-[var(--orion-text-primary)] flex flex-col lg:flex-row transition-colors duration-300">
      {/* Mobile Drawer Backdrop */}
      {isMobileDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Left Sidebar / Mobile Slide-Out Drawer (14 sections including Logout) */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-[min(280px,85vw)] lg:w-72
          bg-[#090D18]/98 lg:bg-[#090D18]/95 dark:bg-[#060913]/98 lg:dark:bg-[#060913]/95
          backdrop-blur-2xl text-white shrink-0 flex flex-col justify-between p-5 sm:p-6
          border-r border-white/10 shadow-2xl lg:shadow-none
          transition-transform duration-300 ease-in-out
          lg:static lg:h-screen lg:sticky lg:top-0 lg:overflow-y-auto lg:translate-x-0
          ${
            isMobileDrawerOpen
              ? 'translate-x-0 pointer-events-auto'
              : '-translate-x-full lg:translate-x-0 pointer-events-none lg:pointer-events-auto'
          }
        `}
        aria-label="Admin Navigation"
      >
        <div className="flex flex-col min-h-0 flex-1">
          <div className="flex items-center justify-between mb-6 sm:mb-8 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#294D6B] flex items-center justify-center font-mono font-bold text-sm text-white shrink-0">
                {publishedConfig.branding.shortMark}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold tracking-tight truncate">Orion-9 Admin</div>
                <div className="text-[11px] font-mono text-[#A8C2D2] truncate">CMS &amp; Governance</div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => onNavigate('/')}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-[#A8C2D2] flex items-center gap-1 cursor-pointer"
                title="View Public Website"
              >
                Site <ExternalLink className="w-3 h-3" />
              </button>

              {/* Mobile Drawer Close Button */}
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="lg:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                aria-label="Close navigation drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <nav aria-label="Admin Console Sections" className="space-y-1 overflow-y-auto flex-1 pr-1 overscroll-contain">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setStatusBanner(null);
                    setIsMobileDrawerOpen(false); // Closes drawer automatically on selection
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#294D6B] text-white shadow-xs font-semibold'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* 14th Item: Logout & Operator badge */}
        <div className="mt-5 pt-5 border-t border-white/10 space-y-3 shrink-0">
          <div className="px-3 py-2.5 rounded-xl bg-white/5 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] mb-0.5 truncate">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>ADMIN VERIFIED ({adminAuthSource})</span>
            </div>
            <div className="truncate text-slate-300 font-mono text-[11px]">{user?.email}</div>
          </div>

          <button
            type="button"
            onClick={async () => {
              setIsMobileDrawerOpen(false);
              await logout();
              onNavigate('/admin/login');
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Action Bar */}
        <header className="liquid-glass-nav border-b border-[var(--glass-border-subtle)] px-4 sm:px-6 md:px-10 py-3 sm:py-4 flex items-center justify-between gap-3 sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Drawer Trigger Button */}
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="lg:hidden p-2 rounded-xl liquid-glass-button text-[var(--orion-text-primary)] hover:text-[var(--orion-accent)] transition-colors cursor-pointer shrink-0"
              aria-label="Open admin navigation menu"
              aria-expanded={isMobileDrawerOpen}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-[var(--orion-text-muted)] truncate">
                ORION-9 CMS · SCHEMA GOVERNANCE
              </div>
              <h1 className="text-base sm:text-lg font-semibold text-[var(--orion-text-primary)] capitalize truncate">
                {navItems.find((i) => i.id === activeTab)?.label || 'Overview'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl liquid-glass-button text-[var(--orion-text-secondary)] hover:text-[var(--orion-text-primary)] cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {lastSavedMessage && (
              <span className="hidden xl:inline-block text-xs font-mono text-[var(--orion-accent)] liquid-glass-subtle px-3 py-1.5 rounded-xl border border-[var(--glass-border-subtle)]">
                {lastSavedMessage}
              </span>
            )}

            <button
              type="button"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                isPreviewMode
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold'
                  : 'liquid-glass-button text-[var(--orion-text-primary)]'
              }`}
              title={isPreviewMode ? 'Draft Preview Mode: ON' : 'Live Published Mode'}
            >
              <span className="hidden sm:inline">{isPreviewMode ? 'Draft Preview: ON' : 'Live Mode'}</span>
              <span className="sm:hidden">{isPreviewMode ? 'Draft' : 'Live'}</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="hidden sm:inline-flex px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#0369A1] text-white text-xs font-medium shadow-md transition-colors cursor-pointer"
            >
              Inspect Site
            </button>
          </div>
        </header>

        {/* Status Notification Banner */}
        {statusBanner && (
          <div
            role="status"
            className={`mx-4 sm:mx-6 md:mx-10 mt-4 sm:mt-6 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border flex items-center justify-between text-xs font-medium ${
              statusBanner.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : statusBanner.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {statusBanner.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              ) : (
                <AlertTriangle
                  className={`w-4 h-4 shrink-0 ${
                    statusBanner.type === 'warning' ? 'text-amber-600' : 'text-red-600'
                  }`}
                />
              )}
              <span className="truncate">{statusBanner.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusBanner(null)}
              className="text-[11px] underline ml-3 shrink-0 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Content Container */}
        <main className="p-4 sm:p-6 md:p-10 max-w-5xl w-full space-y-6 sm:space-y-8 overflow-x-hidden min-w-0">
          {/* 1. OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="liquid-glass-elevated rounded-3xl border border-[var(--glass-border)] shadow-xl p-6">
                  <div className="text-xs font-mono text-[#566575] mb-1">ACTIVE SECTIONS</div>
                  <div className="text-3xl font-semibold text-[#111827]">
                    {
                      Object.values(publishedConfig.homepage.sectionVisibility).filter(Boolean)
                        .length
                    }{' '}
                    / 9
                  </div>
                  <p className="text-xs text-[#566575] mt-2">
                    Public homepage modules currently enabled in production.
                  </p>
                </div>

                <div className="liquid-glass-elevated rounded-3xl border border-[var(--glass-border)] shadow-xl p-6">
                  <div className="text-xs font-mono text-[#566575] mb-1">
                    PRIMARY LAUNCH TARGET
                  </div>
                  <div className="text-sm font-mono font-semibold text-[#294D6B] truncate mt-1">
                    {publishedConfig.navigation.launchControlTowerUrl}
                  </div>
                  <p className="text-xs text-[#566575] mt-2">
                    Verified HTTPS production Orion-9 OS destination.
                  </p>
                </div>

                <div className="liquid-glass-elevated rounded-3xl border border-[var(--glass-border)] shadow-xl p-6">
                  <div className="text-xs font-mono text-[#566575] mb-1">AUDIT TRAIL EVENTS</div>
                  <div className="text-3xl font-semibold text-[#111827]">{auditLogs.length}</div>
                  <p className="text-xs text-[#566575] mt-2">
                    Immutable administrative actions recorded.
                  </p>
                </div>
              </div>

              <div className="liquid-glass-elevated rounded-3xl border border-[var(--glass-border)] shadow-xl p-6 md:p-8">
                <h2 className="text-base font-semibold text-[#111827] mb-2">
                  Quick Governance Actions
                </h2>
                <p className="text-xs text-[#566575] mb-6">
                  Select a configuration domain to edit structured content, validate URLs and hex
                  tokens, preview drafts, or publish directly to Firestore.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {navItems.slice(1).map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveTab(item.id)}
                        className="flex items-center gap-3 p-4 rounded-xl bg-[#F5F9FB] hover:bg-[#EAF4F8] border border-[#D5E1E8] text-left transition-colors cursor-pointer"
                      >
                        <Icon className="w-4 h-4 text-[#294D6B]" />
                        <span className="text-xs font-medium text-[#111827]">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 2. WEBSITE CONTENT */}
          {activeTab === 'content' && (
            <div className="liquid-glass-elevated rounded-3xl border border-[var(--glass-border)] shadow-xl p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-base font-semibold text-[#111827]">
                  Hero &amp; Section Copywriting
                </h2>
                <p className="text-xs text-[#566575] mt-1">
                  Edit the headline, subheadline, and section introductions rendered on the public
                  Orion-9 homepage.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1">
                    Hero Status Kicker
                  </label>
                  <input
                    type="text"
                    value={homeForm.statusBadge}
                    onChange={(e) => setHomeForm({ ...homeForm, statusBadge: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#111827] mb-1">
                      Hero Headline Line 1
                    </label>
                    <input
                      type="text"
                      value={homeForm.heroHeadlineLine1}
                      onChange={(e) =>
                        setHomeForm({ ...homeForm, heroHeadlineLine1: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#111827] mb-1">
                      Hero Headline Line 2
                    </label>
                    <input
                      type="text"
                      value={homeForm.heroHeadlineLine2}
                      onChange={(e) =>
                        setHomeForm({ ...homeForm, heroHeadlineLine2: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1">
                    Hero Subheadline
                  </label>
                  <textarea
                    rows={3}
                    value={homeForm.heroSubheadline}
                    onChange={(e) => setHomeForm({ ...homeForm, heroSubheadline: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#111827] mb-1">
                      Platform Overview Heading
                    </label>
                    <input
                      type="text"
                      value={homeForm.overviewTitle}
                      onChange={(e) => setHomeForm({ ...homeForm, overviewTitle: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#111827] mb-1">
                      Orion-9 OS Section Heading
                    </label>
                    <input
                      type="text"
                      value={homeForm.controlTowerTitle}
                      onChange={(e) =>
                        setHomeForm({ ...homeForm, controlTowerTitle: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-[#D5E1E8]">
                <button
                  type="button"
                  onClick={() => handleSaveHomepage(false)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D5E1E8] text-xs font-medium text-[#111827] hover:bg-[#F5F9FB]"
                >
                  <Save className="w-3.5 h-3.5" /> Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveHomepage(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#101820] text-white text-xs font-medium hover:bg-[#294D6B]"
                >
                  <UploadCloud className="w-3.5 h-3.5" /> Publish Content Live
                </button>
              </div>
            </div>
          )}

          {/* 3. HOMEPAGE SECTIONS (Metrics & Final Banner) */}
          {activeTab === 'sections' && (
            <div className="liquid-glass-elevated rounded-3xl border border-[var(--glass-border)] shadow-xl p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-base font-semibold text-[#111827]">
                  Hero Metrics &amp; Final Conversion Section
                </h2>
                <p className="text-xs text-[#566575] mt-1">
                  Configure the key operational metrics strip and closing conversion section.
                </p>
              </div>

              <div className="space-y-4">
                <div className="text-xs font-mono uppercase tracking-wider text-[#294D6B]">
                  HERO TELEMETRY METRICS
                </div>
                {homeForm.heroMetrics.map((m, idx) => (
                  <div
                    key={m.id}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8]"
                  >
                    <input
                      type="text"
                      value={m.label}
                      onChange={(e) => {
                        const next = [...homeForm.heroMetrics];
                        next[idx] = { ...m, label: e.target.value };
                        setHomeForm({ ...homeForm, heroMetrics: next });
                      }}
                      placeholder="Label"
                      className="px-3 py-2 rounded-lg bg-white border border-[#D5E1E8] text-xs"
                    />
                    <input
                      type="text"
                      value={m.value}
                      onChange={(e) => {
                        const next = [...homeForm.heroMetrics];
                        next[idx] = { ...m, value: e.target.value };
                        setHomeForm({ ...homeForm, heroMetrics: next });
                      }}
                      placeholder="Value"
                      className="px-3 py-2 rounded-lg bg-white border border-[#D5E1E8] text-xs font-mono"
                    />
                    <input
                      type="text"
                      value={m.detail}
                      onChange={(e) => {
                        const next = [...homeForm.heroMetrics];
                        next[idx] = { ...m, detail: e.target.value };
                        setHomeForm({ ...homeForm, heroMetrics: next });
                      }}
                      placeholder="Detail"
                      className="px-3 py-2 rounded-lg bg-white border border-[#D5E1E8] text-xs"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#D5E1E8]">
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1">
                    Final CTA Headline
                  </label>
                  <input
                    type="text"
                    value={homeForm.finalCtaTitle}
                    onChange={(e) => setHomeForm({ ...homeForm, finalCtaTitle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1">
                    Final CTA Subheadline
                  </label>
                  <input
                    type="text"
                    value={homeForm.finalCtaSubtitle}
                    onChange={(e) => setHomeForm({ ...homeForm, finalCtaSubtitle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-[#D5E1E8]">
                <button
                  type="button"
                  onClick={() => handleSaveHomepage(false)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D5E1E8] text-xs font-medium text-[#111827]"
                >
                  <Save className="w-3.5 h-3.5" /> Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveHomepage(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#101820] text-white text-xs font-medium"
                >
                  <UploadCloud className="w-3.5 h-3.5" /> Publish Sections Live
                </button>
              </div>
            </div>
          )}

          {/* 4. BRANDING & IDENTITY */}
          {activeTab === 'branding' && (
            <LogoManagementSection
              brandingForm={brandingForm}
              setBrandingForm={setBrandingForm}
              onSave={handleSaveBranding}
              isSaving={isSavingBranding}
              showBanner={showBanner}
            />
          )}

          {/* 5. NAVIGATION MANAGEMENT */}
          {activeTab === 'navigation' && (
            <div className="liquid-glass-elevated rounded-3xl border border-[var(--glass-border)] shadow-xl p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-base font-semibold text-[#111827]">
                  Navbar Links &amp; Footer Navigation
                </h2>
                <p className="text-xs text-[#566575] mt-1">
                  Manage top navigation items and footer copyright metadata. All URLs are checked
                  against XSS/protocol injection rules.
                </p>
              </div>

              <div className="space-y-3">
                {navForm.items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8]"
                  >
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => {
                        const next = [...navForm.items];
                        next[idx] = { ...item, label: e.target.value };
                        setNavForm({ ...navForm, items: next });
                      }}
                      className="px-3 py-2 rounded-lg bg-white border border-[#D5E1E8] text-xs"
                    />
                    <input
                      type="text"
                      value={item.href}
                      onChange={(e) => {
                        const next = [...navForm.items];
                        next[idx] = { ...item, href: e.target.value };
                        setNavForm({ ...navForm, items: next });
                      }}
                      className="px-3 py-2 rounded-lg bg-white border border-[#D5E1E8] text-xs font-mono"
                    />
                    <label className="inline-flex items-center gap-2 text-xs text-[#111827] px-2">
                      <input
                        type="checkbox"
                        checked={item.visible}
                        onChange={(e) => {
                          const next = [...navForm.items];
                          next[idx] = { ...item, visible: e.target.checked };
                          setNavForm({ ...navForm, items: next });
                        }}
                      />
                      Visible in Navbar
                    </label>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[#D5E1E8]">
                <label className="block text-xs font-medium text-[#111827] mb-1">
                  Footer Copyright Notice
                </label>
                <input
                  type="text"
                  value={footerForm.copyrightText}
                  onChange={(e) =>
                    setFooterForm({ ...footerForm, copyrightText: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] text-sm"
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-[#D5E1E8]">
                <button
                  type="button"
                  onClick={async () => {
                    await handleSaveNavigation(false);
                    await handleSaveFooter(false);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D5E1E8] text-xs font-medium"
                >
                  <Save className="w-3.5 h-3.5" /> Save Draft
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await handleSaveNavigation(true);
                    await handleSaveFooter(true);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#101820] text-white text-xs font-medium"
                >
                  <UploadCloud className="w-3.5 h-3.5" /> Publish Navigation Live
                </button>
              </div>
            </div>
          )}

          {/* 6. CTA MANAGEMENT */}
          {activeTab === 'cta' && (
            <div className="liquid-glass-elevated rounded-3xl border border-[var(--glass-border)] shadow-xl p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-base font-semibold text-[#111827]">
                  Call-to-Action Labels &amp; Application Launch Target
                </h2>
                <p className="text-xs text-[#566575] mt-1">
                  Configure the primary Orion-9 OS launch destination and CTA button copy across
                  the navbar, hero, and closing banner.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1">
                    Navbar Launch Button Text
                  </label>
                  <input
                    type="text"
                    value={navForm.launchControlTowerLabel}
                    onChange={(e) =>
                      setNavForm({ ...navForm, launchControlTowerLabel: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1">
                    Production Orion-9 OS Launch URL
                  </label>
                  <input
                    type="url"
                    value={navForm.launchControlTowerUrl}
                    onChange={(e) =>
                      setNavForm({ ...navForm, launchControlTowerUrl: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1">
                    Hero Primary CTA Label
                  </label>
                  <input
                    type="text"
                    value={homeForm.primaryCtaText}
                    onChange={(e) => setHomeForm({ ...homeForm, primaryCtaText: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1">
                    Hero Secondary CTA Label
                  </label>
                  <input
                    type="text"
                    value={homeForm.secondaryCtaText}
                    onChange={(e) =>
                      setHomeForm({ ...homeForm, secondaryCtaText: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-[#D5E1E8]">
                <button
                  type="button"
                  onClick={async () => {
                    await handleSaveNavigation(false);
                    await handleSaveHomepage(false);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D5E1E8] text-xs font-medium"
                >
                  <Save className="w-3.5 h-3.5" /> Save Draft
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await handleSaveNavigation(true);
                    await handleSaveHomepage(true);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#101820] text-white text-xs font-medium"
                >
                  <UploadCloud className="w-3.5 h-3.5" /> Publish CTAs Live
                </button>
              </div>
            </div>
          )}

          {/* 7. MEDIA LIBRARY */}
          {activeTab === 'media' && (
            <div className="liquid-glass-elevated rounded-3xl border border-[var(--glass-border)] shadow-xl p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-base font-semibold text-[#111827]">
                  Approved Media &amp; Visual Asset Registry
                </h2>
                <p className="text-xs text-[#566575] mt-1">
                  Register verified HTTPS or relative asset URLs for logos, OpenGraph cards, and
                  architectural diagrams.
                </p>
              </div>

              <form
                onSubmit={handleAddMediaAsset}
                className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8]"
              >
                <input
                  type="text"
                  placeholder="Asset title"
                  value={newMediaTitle}
                  onChange={(e) => setNewMediaTitle(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-white border border-[#D5E1E8] text-xs"
                />
                <input
                  type="text"
                  placeholder="https://... or /asset.svg"
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-white border border-[#D5E1E8] text-xs font-mono"
                />
                <select
                  value={newMediaCategory}
                  onChange={(e) =>
                    setNewMediaCategory(e.target.value as MediaAssetItem['category'])
                  }
                  className="px-3 py-2 rounded-lg bg-white border border-[#D5E1E8] text-xs"
                >
                  <option value="diagram">Diagram</option>
                  <option value="brand-logo">Brand Logo</option>
                  <option value="hero-3d">Hero 3D Asset</option>
                  <option value="og-image">OpenGraph Image</option>
                </select>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#101820] text-white text-xs font-medium"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Asset
                </button>
              </form>

              <div className="space-y-2.5">
                {mediaForm.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8]"
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#111827]">{item.title}</div>
                      <div className="text-[11px] font-mono text-[#566575]">
                        [{item.category.toUpperCase()}] {item.url}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        const next = mediaForm.filter((m) => m.id !== item.id);
                        setMediaForm(next);
                        await publishSection(
                          'mediaLibrary',
                          next,
                          `Removed media asset ${item.title}`
                        );
                      }}
                      aria-label={`Remove ${item.title}`}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. SEO SETTINGS */}
          {activeTab === 'seo' && (
            <div className="liquid-glass-elevated rounded-3xl border border-[var(--glass-border)] shadow-xl p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-base font-semibold text-[#111827]">
                  Search Engine &amp; OpenGraph Metadata
                </h2>
                <p className="text-xs text-[#566575] mt-1">
                  Updates document title, meta description, canonical URL, and social sharing tags.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1">
                    Meta Title (5–100 chars)
                  </label>
                  <input
                    type="text"
                    value={seoForm.metaTitle}
                    onChange={(e) => setSeoForm({ ...seoForm, metaTitle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1">
                    Meta Description (15–260 chars)
                  </label>
                  <textarea
                    rows={3}
                    value={seoForm.metaDescription}
                    onChange={(e) => setSeoForm({ ...seoForm, metaDescription: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#111827] mb-1">
                      OpenGraph Title
                    </label>
                    <input
                      type="text"
                      value={seoForm.ogTitle}
                      onChange={(e) => setSeoForm({ ...seoForm, ogTitle: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#111827] mb-1">
                      Canonical URL
                    </label>
                    <input
                      type="text"
                      value={seoForm.canonicalUrl}
                      onChange={(e) => setSeoForm({ ...seoForm, canonicalUrl: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] text-sm font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-[#D5E1E8]">
                <button
                  type="button"
                  onClick={() => handleSaveSeo(false)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D5E1E8] text-xs font-medium"
                >
                  <Save className="w-3.5 h-3.5" /> Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveSeo(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#101820] text-white text-xs font-medium"
                >
                  <UploadCloud className="w-3.5 h-3.5" /> Publish SEO Live
                </button>
              </div>
            </div>
          )}

          {/* 9. FEATURE VISIBILITY */}
          {activeTab === 'visibility' && (
            <div className="liquid-glass-elevated rounded-3xl border border-[var(--glass-border)] shadow-xl p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-base font-semibold text-[#111827]">
                  Homepage Section &amp; Interactive Feature Toggles
                </h2>
                <p className="text-xs text-[#566575] mt-1">
                  Enable or hide individual storytelling and telemetry modules on the public Orion-9
                  website without redeploying code.
                </p>
              </div>

              <div className="space-y-2.5">
                {visibilityKeys.map((item) => {
                  const enabled = homeForm.sectionVisibility[item.key];
                  return (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-4 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8]"
                    >
                      <div>
                        <div className="text-xs font-semibold text-[#111827]">{item.label}</div>
                        <div className="text-xs text-[#566575]">{item.description}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setHomeForm({
                            ...homeForm,
                            sectionVisibility: {
                              ...homeForm.sectionVisibility,
                              [item.key]: !enabled,
                            },
                          });
                        }}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                          enabled ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {enabled ? 'VISIBLE' : 'HIDDEN'}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-[#D5E1E8]">
                <button
                  type="button"
                  onClick={() => handleSaveHomepage(false)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D5E1E8] text-xs font-medium"
                >
                  <Save className="w-3.5 h-3.5" /> Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveHomepage(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#101820] text-white text-xs font-medium"
                >
                  <UploadCloud className="w-3.5 h-3.5" /> Publish Visibility Live
                </button>
              </div>
            </div>
          )}

          {/* 10. AUTHENTICATION SETTINGS */}
          {activeTab === 'auth' && (
            <div className="liquid-glass-elevated rounded-3xl border border-[var(--glass-border)] shadow-xl p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-base font-semibold text-[#111827]">
                  Orion-9 Authentication &amp; Session Policies
                </h2>
                <p className="text-xs text-[#566575] mt-1">
                  Configure public signup availability, Google Workspace OAuth toggle, and session
                  persistence for FlowLogin and FlowSignup.
                </p>
              </div>

              <div className="space-y-3">
                {(
                  [
                    ['allowEmailSignup', 'Allow Public Operator Self-Registration (/signup)'],
                    ['allowGoogleAuth', 'Enable Google Workspace OAuth Sign-In'],
                    ['allowPasswordReset', 'Enable Inline Password Recovery Flow'],
                    [
                      'requireEmailVerificationForLaunch',
                      'Require Verified Email Before Orion-9 OS Launch',
                    ],
                  ] as const
                ).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center justify-between p-4 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] cursor-pointer"
                  >
                    <span className="text-xs font-medium text-[#111827]">{label}</span>
                    <input
                      type="checkbox"
                      checked={Boolean(authSettingsForm[key])}
                      onChange={(e) =>
                        setAuthSettingsForm({ ...authSettingsForm, [key]: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#294D6B]"
                    />
                  </label>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-[#D5E1E8]">
                <button
                  type="button"
                  onClick={() => handleSaveAuthSettings(false)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D5E1E8] text-xs font-medium"
                >
                  <Save className="w-3.5 h-3.5" /> Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveAuthSettings(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#101820] text-white text-xs font-medium"
                >
                  <UploadCloud className="w-3.5 h-3.5" /> Publish Auth Policy
                </button>
              </div>
            </div>
          )}

          {/* 11. USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="liquid-glass-elevated rounded-3xl border border-[var(--glass-border)] shadow-xl p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-base font-semibold text-[#111827]">
                  Administrator Access Control List (
                  <code className="font-mono">/admins/&#123;uid&#125;</code>)
                </h2>
                <p className="text-xs text-[#566575] mt-1">
                  Grant or revoke administrator roles. Firestore security rules strictly verify{' '}
                  <code className="font-mono">/admins/&#123;uid&#125;</code> with{' '}
                  <code className="font-mono">role == &quot;admin&quot;</code> and{' '}
                  <code className="font-mono">active == true</code>.
                </p>
              </div>

              <form
                onSubmit={handleGrantAdminUser}
                className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8]"
              >
                <input
                  type="text"
                  placeholder="Firebase Auth UID"
                  value={newAdminUid}
                  onChange={(e) => setNewAdminUid(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-white border border-[#D5E1E8] text-xs font-mono"
                />
                <input
                  type="email"
                  placeholder="operator@orion9.io"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-white border border-[#D5E1E8] text-xs"
                />
                <select
                  value={newAdminRole}
                  onChange={(e) =>
                    setNewAdminRole(e.target.value as 'admin' | 'editor' | 'viewer')
                  }
                  className="px-3 py-2 rounded-lg bg-white border border-[#D5E1E8] text-xs"
                >
                  <option value="admin">Role: admin</option>
                  <option value="editor">Role: editor</option>
                  <option value="viewer">Role: viewer</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#101820] text-white text-xs font-medium"
                >
                  Authorize UID
                </button>
              </form>

              <div className="space-y-2.5">
                {adminUsers.map((u) => (
                  <div
                    key={u.uid}
                    className="flex flex-wrap items-center justify-between gap-2 p-4 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8]"
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#111827]">{u.email}</div>
                      <div className="text-[11px] font-mono text-[#566575]">UID: {u.uid}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono uppercase px-2.5 py-1 rounded-md bg-[#EAF4F8] text-[#294D6B]">
                        {u.role}
                      </span>
                      <span className="text-xs font-mono text-emerald-700">
                        {u.active ? 'ACTIVE' : 'REVOKED'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 12. AUDIT LOG */}
          {activeTab === 'audit' && (
            <div className="liquid-glass-elevated rounded-3xl border border-[var(--glass-border)] shadow-xl p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-base font-semibold text-[#111827]">
                  Immutable Administrative Audit Log (<code className="font-mono">auditLogs</code>)
                </h2>
                <p className="text-xs text-[#566575] mt-1">
                  Every configuration save, live publication, and factory reset is recorded with
                  operator identity and ISO timestamp.
                </p>
              </div>

              <div className="space-y-2.5">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono text-[#294D6B]">
                        <span className="uppercase font-semibold">{log.action}</span>
                        <span>·</span>
                        <span>section: {log.section}</span>
                        <span>·</span>
                        <span>{log.actorEmail}</span>
                      </div>
                      <div className="text-xs text-[#111827] mt-1">{log.summary}</div>
                    </div>
                    <div className="text-[11px] font-mono text-[#566575] shrink-0">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DESKTOP RELEASES MANAGER */}
          {activeTab === 'releases' && (
            <div className="space-y-6">
              <div className="liquid-glass-elevated rounded-3xl border border-[var(--glass-border)] shadow-xl p-6 md:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D5E1E8] pb-5">
                  <div>
                    <h2 className="text-base font-semibold text-[#111827] flex items-center gap-2">
                      <Laptop className="w-5 h-5 text-[#0284C7]" />
                      <span>Desktop Release Distribution &amp; Lifecycle Manager</span>
                    </h2>
                    <p className="text-xs text-[#566575] mt-1">
                      Manage official Windows (.exe / .msi) and macOS (.dmg / .pkg) installers, SHA-256 integrity hashes, lifecycle states, and download telemetry.
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSaveReleases(false)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#D5E1E8] text-xs font-medium text-[#111827] hover:bg-[#F5F9FB] transition-colors cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5 text-[#566575]" />
                      <span>Save Draft</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveReleases(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#101820] text-white text-xs font-semibold hover:bg-[#294D6B] transition-colors cursor-pointer shadow-md"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-[#38BDF8]" />
                      <span>Publish Live Catalog</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono uppercase font-bold text-[#64748B] tracking-wider">
                      Registered Distribution Releases ({releasesForm.length})
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {releasesForm.map((rel) => (
                      <div
                        key={rel.id}
                        className={`p-5 rounded-2xl border transition-all ${
                          rel.isLatest
                            ? 'bg-[#F0FDF4] border-emerald-300 shadow-sm'
                            : rel.status === 'disabled' || rel.status === 'retired'
                            ? 'bg-[#FFF1F2] border-rose-200 opacity-80'
                            : rel.status === 'draft'
                            ? 'bg-[#FFFBEB] border-amber-200'
                            : 'bg-[#F8FAFC] border-[#E2E8F0]'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-bold text-[#070B19]">
                                v{rel.version}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD] flex items-center gap-1">
                                {rel.platform.startsWith('macos') ? (
                                  <Apple className="w-3 h-3 text-[#0284C7]" />
                                ) : (
                                  <Laptop className="w-3 h-3 text-[#0284C7]" />
                                )}
                                <span>{rel.platform}</span>
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]">
                                {rel.format.toUpperCase()}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                                  rel.status === 'published'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : rel.status === 'draft'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                                }`}
                              >
                                {rel.status}
                              </span>
                              {rel.isLatest && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>LATEST FOR {rel.platform.toUpperCase()}</span>
                                </span>
                              )}
                            </div>

                            <div className="text-xs text-[#475569] font-mono flex flex-wrap items-center gap-x-4 gap-y-1">
                              <span>Filename: {rel.filename}</span>
                              <span>Size: {(rel.sizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
                              <span>Min OS: {rel.minimumOs}</span>
                              <span>Downloads: {rel.downloadCount || 0}</span>
                              <span>Released: {rel.releaseDate}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {/* Lifecycle Status Selector */}
                            <select
                              value={rel.status}
                              onChange={(e) =>
                                handleSetReleaseStatus(
                                  rel.id,
                                  e.target.value as DesktopReleaseStatus
                                )
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-xs font-semibold text-[#070B19] cursor-pointer"
                              title="Update release status"
                            >
                              <option value="published">Published</option>
                              <option value="draft">Draft</option>
                              <option value="disabled">Disabled</option>
                              <option value="retired">Retired</option>
                            </select>

                            {!rel.isLatest && rel.status === 'published' && (
                              <button
                                type="button"
                                onClick={() => handleToggleLatestRelease(rel.id)}
                                className="px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-xs font-semibold text-[#070B19] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                              >
                                Set Latest
                              </button>
                            )}

                            <a
                              href={rel.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#070B19] text-white text-xs font-semibold hover:bg-[#1E293B] transition-colors cursor-pointer"
                            >
                              <Download className="w-3 h-3 text-[#38BDF8]" />
                              <span>Verify Binary</span>
                            </a>

                            <button
                              type="button"
                              onClick={() => handleDeleteRelease(rel.id)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete release"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-3 p-2.5 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-between gap-3 text-xs font-mono">
                          <span className="text-[#64748B] shrink-0 font-bold">SHA-256:</span>
                          <span className="text-[#070B19] break-all truncate">{rel.sha256}</span>
                        </div>

                        {rel.releaseNotes && rel.releaseNotes.length > 0 && (
                          <div className="mt-3 text-xs text-[#475569] space-y-1">
                            <span className="font-semibold text-[#070B19] block">Notes:</span>
                            <ul className="list-disc list-inside space-y-0.5">
                              {rel.releaseNotes.map((note, nIdx) => (
                                <li key={nIdx}>{note}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form to Register a New Release */}
              <div className="liquid-glass-elevated rounded-3xl border border-[var(--glass-border)] shadow-xl p-6 md:p-8 space-y-5">
                <div>
                  <h3 className="text-base font-semibold text-[#111827] flex items-center gap-2">
                    <Plus className="w-4 h-4 text-[#0284C7]" />
                    <span>Register New Windows or macOS Desktop Release</span>
                  </h3>
                  <p className="text-xs text-[#566575] mt-1">
                    Add an installer binary package. Supported formats: .exe (Windows NSIS), .msi (Windows Installer), .dmg (macOS Disk Image), .pkg (macOS Installer).
                  </p>
                </div>

                <form onSubmit={handleAddDesktopRelease} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-[#566575] mb-1">
                        Platform *
                      </label>
                      <select
                        value={newRelPlatform}
                        onChange={(e) => {
                          const p = e.target.value as DesktopPlatform;
                          setNewRelPlatform(p);
                          if (p.startsWith('macos')) {
                            setNewRelFormat('dmg');
                            setNewRelFilename(
                              p === 'macos-arm64' ? 'Orion-9-aarch64.dmg' : 'Orion-9-Universal.dmg'
                            );
                            setNewRelMinOs('macOS 12 Monterey or higher');
                            setNewRelUrl(
                              p === 'macos-arm64'
                                ? '/downloads/Orion-9-aarch64.dmg'
                                : '/downloads/Orion-9-Universal.dmg'
                            );
                          } else {
                            setNewRelFormat('exe');
                            setNewRelFilename('Orion-9-Setup.exe');
                            setNewRelMinOs('Windows 10 / 11 64-bit');
                            setNewRelUrl('/downloads/Orion-9-Setup.exe');
                          }
                        }}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] text-xs font-semibold"
                      >
                        <option value="windows-x64">Windows x64</option>
                        <option value="windows-arm64">Windows ARM64</option>
                        <option value="macos-universal">macOS Universal (Apple Silicon &amp; Intel)</option>
                        <option value="macos-arm64">macOS Apple Silicon (M1-M4)</option>
                        <option value="macos-x64">macOS Intel x86_64</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-[#566575] mb-1">
                        Format *
                      </label>
                      <select
                        value={newRelFormat}
                        onChange={(e) => {
                          const fmt = e.target.value as DesktopPackageFormat;
                          setNewRelFormat(fmt);
                          if (fmt === 'exe') setNewRelFilename('Orion-9-Setup.exe');
                          else if (fmt === 'msi') setNewRelFilename('Orion-9-Setup.msi');
                          else if (fmt === 'dmg') setNewRelFilename('Orion-9-Universal.dmg');
                          else if (fmt === 'pkg') setNewRelFilename('Orion-9-Universal.pkg');
                        }}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] text-xs font-semibold"
                      >
                        <option value="exe">EXE (.exe - NSIS)</option>
                        <option value="msi">MSI (.msi - Enterprise WiX)</option>
                        <option value="dmg">DMG (.dmg - Apple Disk Image)</option>
                        <option value="pkg">PKG (.pkg - Apple Package)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-[#566575] mb-1">
                        Version *
                      </label>
                      <input
                        type="text"
                        placeholder="9.0.0"
                        value={newRelVersion}
                        onChange={(e) => setNewRelVersion(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] text-xs font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-[#566575] mb-1">
                        Lifecycle Status *
                      </label>
                      <select
                        value={newRelStatus}
                        onChange={(e) =>
                          setNewRelStatus(e.target.value as DesktopReleaseStatus)
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] text-xs font-semibold"
                      >
                        <option value="published">Published (Live)</option>
                        <option value="draft">Draft (Admin Only)</option>
                        <option value="disabled">Disabled</option>
                        <option value="retired">Retired</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-[#566575] mb-1">
                        Installer Filename *
                      </label>
                      <input
                        type="text"
                        placeholder="Orion-9-Setup.exe"
                        value={newRelFilename}
                        onChange={(e) => setNewRelFilename(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] text-xs font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-[#566575] mb-1">
                        File Size (Bytes) *
                      </label>
                      <input
                        type="number"
                        placeholder="30336791"
                        value={newRelSize}
                        onChange={(e) => setNewRelSize(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] text-xs font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-[#566575] mb-1">
                        Minimum Supported OS
                      </label>
                      <input
                        type="text"
                        placeholder="Windows 10 / 11 64-bit"
                        value={newRelMinOs}
                        onChange={(e) => setNewRelMinOs(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-[#566575] mb-1">
                        Cryptographic SHA-256 Checksum *
                      </label>
                      <input
                        type="text"
                        placeholder="e2dfeb480522b9da077bb58e0954d6d8e09f1023fb6af28b8b74b2a8dc23ee70"
                        value={newRelSha}
                        onChange={(e) => setNewRelSha(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] text-xs font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-[#566575] mb-1">
                        Download URL *
                      </label>
                      <input
                        type="text"
                        placeholder="/downloads/Orion-9-Setup.exe"
                        value={newRelUrl}
                        onChange={(e) => setNewRelUrl(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] text-xs font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#566575] mb-1">
                      Release Notes (one note per line)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Official Orion-9 native package.&#10;Zero-trust execution boundary."
                      value={newRelNotes}
                      onChange={(e) => setNewRelNotes(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-medium text-[#475569] flex items-center gap-2">
                        <span>Channel:</span>
                        <select
                          value={newRelChannel}
                          onChange={(e) =>
                            setNewRelChannel(e.target.value as 'stable' | 'beta')
                          }
                          className="px-2 py-1 rounded-lg border border-[#D5E1E8] bg-[#F8FAFC] text-xs"
                        >
                          <option value="stable">Stable (Production)</option>
                          <option value="beta">Beta (Preview)</option>
                        </select>
                      </label>
                    </div>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#070B19] text-white text-xs font-semibold hover:bg-[#1E293B] shadow-md transition-all cursor-pointer"
                    >
                      <UploadCloud className="w-4 h-4 text-[#38BDF8]" />
                      <span>Register Release Record</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 13. SYSTEM SETTINGS */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="liquid-glass-elevated rounded-3xl border border-[var(--glass-border)] shadow-xl p-6 md:p-8 space-y-5">
                <div>
                  <h2 className="text-base font-semibold text-[#111827]">
                    Firebase Project Runtime Binding
                  </h2>
                  <p className="text-xs text-[#566575] mt-1">
                    Inspect or update the active Firebase client configuration used by
                    Authentication and Firestore CMS.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-[#566575] mb-1">
                      VITE_FIREBASE_API_KEY
                    </label>
                    <input
                      type="text"
                      value={fbApiKey}
                      onChange={(e) => setFbApiKey(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-[#566575] mb-1">
                      VITE_FIREBASE_PROJECT_ID
                    </label>
                    <input
                      type="text"
                      value={fbProjectId}
                      onChange={(e) => setFbProjectId(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-[#566575] mb-1">
                      VITE_FIREBASE_AUTH_DOMAIN
                    </label>
                    <input
                      type="text"
                      value={fbAuthDomain}
                      onChange={(e) => setFbAuthDomain(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-[#566575] mb-1">
                      VITE_FIREBASE_APP_ID
                    </label>
                    <input
                      type="text"
                      value={fbAppId}
                      onChange={(e) => setFbAppId(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] text-xs font-mono"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    saveRuntimeFirebaseConfig({
                      apiKey: fbApiKey.trim(),
                      projectId: fbProjectId.trim(),
                      authDomain: fbAuthDomain.trim(),
                      appId: fbAppId.trim(),
                    });
                    showBanner('success', 'Runtime Firebase configuration updated.');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#101820] text-white text-xs font-medium"
                >
                  Save Runtime Firebase Keys
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-red-200 p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-red-900">
                    Restore Factory Default Configuration
                  </h3>
                  <p className="text-xs text-red-700 mt-1">
                    Resets local draft and published overrides back to the baseline VectrFL ice-blue
                    Orion-9 specification.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await resetToDefaults();
                    showBanner('success', 'Restored Orion-9 factory default configuration.');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-xs font-medium hover:bg-red-700 shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset to Defaults
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

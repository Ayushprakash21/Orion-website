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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSiteConfig } from '../../context/SiteConfigContext';
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
import { SectionVisibilityConfig, MediaAssetItem } from '../../types/cms';

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

  const [activeTab, setActiveTab] = useState<AdminTabId>('overview');
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Local editable states synchronized with draftConfig
  const [brandingForm, setBrandingForm] = useState(draftConfig.branding);
  const [navForm, setNavForm] = useState(draftConfig.navigation);
  const [homeForm, setHomeForm] = useState(draftConfig.homepage);
  const [footerForm, setFooterForm] = useState(draftConfig.footer);
  const [seoForm, setSeoForm] = useState(draftConfig.seo);
  const [authSettingsForm, setAuthSettingsForm] = useState(draftConfig.authSettings);
  const [mediaForm, setMediaForm] = useState(draftConfig.mediaLibrary);

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
    setBrandingForm(draftConfig.branding);
    setNavForm(draftConfig.navigation);
    setHomeForm(draftConfig.homepage);
    setFooterForm(draftConfig.footer);
    setSeoForm(draftConfig.seo);
    setAuthSettingsForm(draftConfig.authSettings);
    setMediaForm(draftConfig.mediaLibrary);
  }, [draftConfig]);

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
        <div className="bg-white rounded-2xl border border-[#D5E1E8] px-8 py-6 text-sm font-mono text-[#294D6B]">
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

  const showBanner = (type: 'success' | 'error', text: string) => {
    setStatusBanner({ type, text });
  };

  // Handlers for each section with strict validation
  const handleSaveBranding = async (publish: boolean) => {
    const check = validateBrandingConfig(brandingForm);
    if (!check.valid) {
      showBanner('error', check.errors.join(' '));
      return;
    }
    const action = publish ? publishSection : saveDraftSection;
    const res = await action(
      'branding',
      brandingForm,
      'Updated Orion-9 branding and color tokens'
    );
    showBanner(
      res.success ? 'success' : 'error',
      res.error || (publish ? 'Branding published live.' : 'Branding saved to draft.')
    );
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

  const navItems: {
    id: AdminTabId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'content', label: 'Website content', icon: FileText },
    { id: 'sections', label: 'Homepage sections', icon: Layers },
    { id: 'branding', label: 'Branding & theme', icon: Palette },
    { id: 'navigation', label: 'Navigation management', icon: Compass },
    { id: 'cta', label: 'CTA management', icon: MousePointerClick },
    { id: 'media', label: 'Media library', icon: ImageIcon },
    { id: 'seo', label: 'SEO settings', icon: Globe },
    { id: 'visibility', label: 'Feature visibility', icon: Eye },
    { id: 'auth', label: 'Authentication settings', icon: KeyRound },
    { id: 'users', label: 'User management', icon: Users },
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
      label: '07 · Live Control Tower Cockpit',
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
    <div className="min-h-screen bg-[#EAF4F8] text-[#111827] flex flex-col lg:flex-row">
      {/* Left Sidebar Navigation (14 sections including Logout) */}
      <aside className="w-full lg:w-72 bg-[#101820] text-white shrink-0 flex flex-col justify-between p-6 border-b lg:border-b-0 lg:border-r border-white/10">
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#294D6B] flex items-center justify-center font-mono font-bold text-sm text-white">
                {publishedConfig.branding.shortMark}
              </div>
              <div>
                <div className="text-sm font-semibold tracking-tight">Orion-9 Admin</div>
                <div className="text-[11px] font-mono text-[#A8C2D2]">CMS &amp; Governance</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-[#A8C2D2] flex items-center gap-1"
              title="View Public Website"
            >
              Site <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <nav aria-label="Admin Console Sections" className="space-y-1">
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
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#294D6B] text-white shadow-xs'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* 14th Item: Logout & Operator badge */}
        <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
          <div className="px-3 py-2.5 rounded-xl bg-white/5 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] mb-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              ADMIN VERIFIED ({adminAuthSource})
            </div>
            <div className="truncate text-slate-300 font-mono text-[11px]">{user?.email}</div>
          </div>

          <button
            type="button"
            onClick={async () => {
              await logout();
              onNavigate('/admin/login');
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Action Bar */}
        <header className="bg-white/90 backdrop-blur-md border-b border-[#D5E1E8] px-6 md:px-10 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#566575]">
              ORION-9 ENTERPRISE CMS · FIRESTORE SCHEMA GOVERNANCE
            </div>
            <h1 className="text-lg font-semibold text-[#111827] capitalize">
              {navItems.find((i) => i.id === activeTab)?.label || 'Overview'}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {lastSavedMessage && (
              <span className="text-xs font-mono text-[#294D6B] bg-[#EAF4F8] px-3 py-1.5 rounded-lg">
                {lastSavedMessage}
              </span>
            )}

            <button
              type="button"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                isPreviewMode
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-[#F5F9FB] border-[#D5E1E8] text-[#111827]'
              }`}
            >
              {isPreviewMode ? 'Draft Preview Mode: ON' : 'Live Published Mode'}
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="px-4 py-2 rounded-xl bg-[#101820] text-white text-xs font-medium hover:bg-[#294D6B] transition-colors cursor-pointer"
            >
              Inspect Live Homepage
            </button>
          </div>
        </header>

        {/* Status Notification Banner */}
        {statusBanner && (
          <div
            role="status"
            className={`mx-6 md:mx-10 mt-6 p-4 rounded-2xl border flex items-center justify-between text-xs font-medium ${
              statusBanner.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {statusBanner.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{statusBanner.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusBanner(null)}
              className="text-[11px] underline ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Content Container */}
        <main className="p-6 md:p-10 max-w-5xl w-full space-y-8">
          {/* 1. OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white rounded-2xl border border-[#D5E1E8] p-6">
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

                <div className="bg-white rounded-2xl border border-[#D5E1E8] p-6">
                  <div className="text-xs font-mono text-[#566575] mb-1">
                    PRIMARY LAUNCH TARGET
                  </div>
                  <div className="text-sm font-mono font-semibold text-[#294D6B] truncate mt-1">
                    {publishedConfig.navigation.launchControlTowerUrl}
                  </div>
                  <p className="text-xs text-[#566575] mt-2">
                    Verified HTTPS production Control Tower destination.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-[#D5E1E8] p-6">
                  <div className="text-xs font-mono text-[#566575] mb-1">AUDIT TRAIL EVENTS</div>
                  <div className="text-3xl font-semibold text-[#111827]">{auditLogs.length}</div>
                  <p className="text-xs text-[#566575] mt-2">
                    Immutable administrative actions recorded.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#D5E1E8] p-6 md:p-8">
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
            <div className="bg-white rounded-2xl border border-[#D5E1E8] p-6 md:p-8 space-y-6">
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
                      Control Tower Section Heading
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
            <div className="bg-white rounded-2xl border border-[#D5E1E8] p-6 md:p-8 space-y-6">
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

          {/* 4. BRANDING & THEME */}
          {activeTab === 'branding' && (
            <div className="bg-white rounded-2xl border border-[#D5E1E8] p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-base font-semibold text-[#111827]">
                  Brand Identity &amp; VectrFL Ice-Blue Color Tokens
                </h2>
                <p className="text-xs text-[#566575] mt-1">
                  All color tokens are validated as 6-digit hex codes before saving to prevent
                  malformed CSS injection.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={brandingForm.companyName}
                    onChange={(e) =>
                      setBrandingForm({ ...brandingForm, companyName: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1">
                    Short Mark
                  </label>
                  <input
                    type="text"
                    value={brandingForm.shortMark}
                    onChange={(e) =>
                      setBrandingForm({ ...brandingForm, shortMark: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1">
                    Brand Tagline
                  </label>
                  <input
                    type="text"
                    value={brandingForm.tagline}
                    onChange={(e) => setBrandingForm({ ...brandingForm, tagline: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(
                  [
                    ['canvasColor', 'Main Canvas (#EAF4F8)'],
                    ['altSectionColor', 'Alternate Section (#F5F9FB)'],
                    ['surfaceColor', 'White Surface (#FFFFFF)'],
                    ['primaryTextColor', 'Primary Text (#111827)'],
                    ['secondaryTextColor', 'Secondary Text (#566575)'],
                    ['borderColor', 'Border Hairline (#D5E1E8)'],
                    ['deepBlueAccent', 'Deep Blue Accent (#294D6B)'],
                    ['steelBlueAccent', 'Steel Blue Accent (#A8C2D2)'],
                    ['darkSurfaceColor', 'Dark App Surface (#101820)'],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="p-3.5 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8]">
                    <label className="block text-[11px] font-mono text-[#566575] mb-1.5">
                      {label}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={brandingForm[key]}
                        onChange={(e) =>
                          setBrandingForm({ ...brandingForm, [key]: e.target.value.toUpperCase() })
                        }
                        className="w-8 h-8 rounded-lg border border-[#D5E1E8] cursor-pointer"
                      />
                      <input
                        type="text"
                        value={brandingForm[key]}
                        onChange={(e) =>
                          setBrandingForm({ ...brandingForm, [key]: e.target.value })
                        }
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#D5E1E8] text-xs font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-[#D5E1E8]">
                <button
                  type="button"
                  onClick={() => handleSaveBranding(false)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D5E1E8] text-xs font-medium"
                >
                  <Save className="w-3.5 h-3.5" /> Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveBranding(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#101820] text-white text-xs font-medium"
                >
                  <UploadCloud className="w-3.5 h-3.5" /> Publish Theme Live
                </button>
              </div>
            </div>
          )}

          {/* 5. NAVIGATION MANAGEMENT */}
          {activeTab === 'navigation' && (
            <div className="bg-white rounded-2xl border border-[#D5E1E8] p-6 md:p-8 space-y-6">
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
            <div className="bg-white rounded-2xl border border-[#D5E1E8] p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-base font-semibold text-[#111827]">
                  Call-to-Action Labels &amp; Application Launch Target
                </h2>
                <p className="text-xs text-[#566575] mt-1">
                  Configure the primary Control Tower launch destination and CTA button copy across
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
                    Production Control Tower Launch URL
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
            <div className="bg-white rounded-2xl border border-[#D5E1E8] p-6 md:p-8 space-y-6">
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
            <div className="bg-white rounded-2xl border border-[#D5E1E8] p-6 md:p-8 space-y-6">
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
            <div className="bg-white rounded-2xl border border-[#D5E1E8] p-6 md:p-8 space-y-6">
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
            <div className="bg-white rounded-2xl border border-[#D5E1E8] p-6 md:p-8 space-y-6">
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
                      'Require Verified Email Before Control Tower Launch',
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
            <div className="bg-white rounded-2xl border border-[#D5E1E8] p-6 md:p-8 space-y-6">
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
            <div className="bg-white rounded-2xl border border-[#D5E1E8] p-6 md:p-8 space-y-6">
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

          {/* 13. SYSTEM SETTINGS */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-[#D5E1E8] p-6 md:p-8 space-y-5">
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

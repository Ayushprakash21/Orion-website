import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { DEFAULT_DESKTOP_RELEASES } from '../data/defaultSiteConfig';
import type { DesktopPlatform, DesktopReleaseRecord, ReleasePlatform, AppReleaseRecord } from '../types/cms';
import { OrionNovaDownloadButton } from './OrionNovaDownloadButton';
import { getRegisteredReleases } from '../services/releaseService';
import {
  downloadDesktopInstaller,
  validateReleaseForDownload,
  checkReleaseAvailability,
  DesktopDownloadError,
} from '../services/downloadService';
import {
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Apple,
  X,
  Lock,
  ArrowRight,
  AlertTriangle,
  Terminal,
  Cpu,
  FileText,
  Database,
  Smartphone,
  ExternalLink,
  Info,
} from 'lucide-react';

export type PublicDistributionPlatform = 'windows' | 'macos' | 'android' | 'ios';

interface DesktopDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (path: string) => void;
  initialPlatform?: PublicDistributionPlatform;
}

export const DesktopDownloadModal: React.FC<DesktopDownloadModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  initialPlatform,
}) => {
  const { user, isAuthenticated, username } = useAuth();
  const { activeConfig } = useSiteConfig();

  const [selectedPlatform, setSelectedPlatform] = useState<PublicDistributionPlatform>('windows');
  const [selectedFormat, setSelectedFormat] = useState<string>('exe');
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Background scroll locking & Escape key listener
  useEffect(() => {
    if (!isOpen) {
      setDownloadSuccess(false);
      setDownloadError(null);
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const platParam = params.get('platform');
      if (platParam === 'macos' || platParam === 'mac') {
        setSelectedPlatform('macos');
        setSelectedFormat('dmg');
      } else if (platParam === 'windows' || platParam === 'win') {
        setSelectedPlatform('windows');
        setSelectedFormat('exe');
      } else if (platParam === 'android' || platParam === 'apk') {
        setSelectedPlatform('android');
        setSelectedFormat('apk');
      } else if (platParam === 'ios' || platParam === 'ipa') {
        setSelectedPlatform('ios');
        setSelectedFormat('ipa');
      } else if (initialPlatform) {
        setSelectedPlatform(initialPlatform);
        setSelectedFormat(
          initialPlatform === 'macos'
            ? 'dmg'
            : initialPlatform === 'android'
              ? 'apk'
              : initialPlatform === 'ios'
                ? 'ipa'
                : 'exe'
        );
      }
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, initialPlatform, onClose]);

  const [liveCatalog, setLiveCatalog] = useState<DesktopReleaseRecord[]>([]);

  // Synchronize with authoritative live releases from Firestore /releases
  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      getRegisteredReleases()
        .then((records) => {
          if (isMounted && records && records.length > 0) {
            setLiveCatalog(records as DesktopReleaseRecord[]);
          }
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const catalog: DesktopReleaseRecord[] =
    liveCatalog.length > 0
      ? liveCatalog
      : activeConfig.desktopReleases && activeConfig.desktopReleases.length > 0
        ? activeConfig.desktopReleases
        : DEFAULT_DESKTOP_RELEASES;

  // Filter releases by current platform tab
  const platformReleases = catalog.filter((r) => {
    if (selectedPlatform === 'windows') return r.platform.startsWith('windows');
    if (selectedPlatform === 'macos') return r.platform.startsWith('macos');
    if (selectedPlatform === 'android') return r.platform.startsWith('android');
    if (selectedPlatform === 'ios') return r.platform.startsWith('ios');
    return false;
  });

  // Authoritative active release: Must be strictly published to be downloadable
  const activeRelease: DesktopReleaseRecord | undefined =
    platformReleases.find((r) => r.status === 'published' && r.isLatest) ||
    platformReleases.find((r) => r.status === 'published' && r.format === selectedFormat) ||
    platformReleases.find((r) => r.status === 'published');

  // Optional background verification probe for release artifact on distribution storage
  const verifyAvailability = useCallback(async () => {
    if (!activeRelease) return;
    try {
      await checkReleaseAvailability(activeRelease);
    } catch {
      // Retain active metadata
    }
  }, [activeRelease]);

  useEffect(() => {
    if (isOpen && activeRelease) {
      verifyAvailability();
    }
  }, [isOpen, activeRelease, verifyAvailability]);

  if (!isOpen) return null;

  const handleCopyHash = () => {
    if (!activeRelease?.sha256) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(activeRelease.sha256);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2200);
    }
  };

  const handleCopyCommand = () => {
    const cmd = getVerificationCommand();
    if (!cmd) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(cmd);
      setCopiedCommand(true);
      setTimeout(() => setCopiedCommand(false), 2200);
    }
  };

  const handlePlatformChange = (plat: PublicDistributionPlatform) => {
    setSelectedPlatform(plat);
    setSelectedFormat(
      plat === 'windows' ? 'exe' : plat === 'macos' ? 'dmg' : plat === 'android' ? 'apk' : 'ipa'
    );
    setDownloadSuccess(false);
    setDownloadError(null);
  };

  const handleNavigateAuth = (mode: 'login' | 'signup') => {
    onClose();
    if (onNavigate) {
      onNavigate(`/${mode}?redirect=/download&platform=${selectedPlatform}`);
    } else {
      window.location.href = `/${mode}?redirect=/download&platform=${selectedPlatform}`;
    }
  };

  const handleAuthenticatedDownload = async () => {
    if (!isAuthenticated) {
      handleNavigateAuth('login');
      return;
    }

    if (!activeRelease) {
      setDownloadError(`No published release available for ${selectedPlatform}.`);
      return;
    }

    if (isDownloading) return;

    setDownloadError(null);
    setDownloadSuccess(false);

    // Pre-flight lifecycle verification
    const validation = validateReleaseForDownload(
      activeRelease,
      user?.email?.includes('admin') ? 'admin' : undefined
    );
    if (!validation.allowed) {
      setDownloadError(validation.error || 'Distribution is restricted.');
      return;
    }

    setIsDownloading(true);

    try {
      const result = await downloadDesktopInstaller(activeRelease);
      if (result.success) {
        activeRelease.downloadCount = (activeRelease.downloadCount || 0) + 1;
        setDownloadSuccess(true);
      }
    } catch (err: unknown) {
      const message =
        err instanceof DesktopDownloadError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Unknown download failure';
      setDownloadError(message);
    } finally {
      setIsDownloading(false);
    }
  };

  const getVerificationCommand = () => {
    if (!activeRelease?.filename) return '';
    if (selectedPlatform === 'windows') {
      return `Get-FileHash -Algorithm SHA256 .\\${activeRelease.filename}`;
    }
    return `shasum -a 256 ./${activeRelease.filename}`;
  };

  const formatSize = (bytes?: number) => {
    if (!bytes || bytes <= 0) return 'Pending';
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto overflow-x-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="download-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl lg:max-w-[640px] max-h-[calc(100dvh-16px)] sm:max-h-[90vh] bg-[#F8FAFC] rounded-2xl sm:rounded-3xl border border-[#D9E2EF] shadow-[0_25px_60px_-15px_rgba(15,23,42,0.18)] flex flex-col text-[#0F172A] animate-in zoom-in-95 duration-200 my-auto overflow-hidden min-w-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Clean Enterprise Header Bar */}
        <div className="flex items-center justify-between px-3.5 sm:px-6 py-3 sm:py-4 border-b border-[#D9E2EF] bg-white shrink-0 select-none gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {/* Platform Icon Squircle */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#0284C7] flex items-center justify-center text-white shadow-xs shrink-0">
              {selectedPlatform === 'windows' ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.951-1.801" />
                </svg>
              ) : selectedPlatform === 'macos' ? (
                <Apple className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              ) : (
                <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              )}
            </div>

            {/* Product Title + Badges */}
            <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
              <h3
                id="download-modal-title"
                className="text-sm sm:text-lg font-bold text-[#0F172A] tracking-tight truncate"
              >
                Orion-9 {selectedPlatform === 'android' || selectedPlatform === 'ios' ? 'Mobile' : 'Desktop'}
              </h3>
              <div className="flex items-center gap-1 shrink-0">
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-mono font-semibold bg-[#EFF6FF] text-[#0284C7] border border-[#BFDBFE]">
                  {activeRelease ? `v${activeRelease.version}` : 'v9.0.0'}
                </span>
                <span
                  className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider ${
                    activeRelease && activeRelease.status === 'published'
                      ? 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {activeRelease && activeRelease.status === 'published' ? 'PUBLISHED' : 'STAGED'}
                </span>
              </div>
            </div>
          </div>

          {/* Functional Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content Area */}
        <div className="p-3.5 sm:p-5 space-y-3 sm:space-y-3.5 overflow-y-auto min-h-0 flex-1 bg-[#F8FAFC] custom-scrollbar min-w-0">
          {/* Segmented Platform Switcher */}
          <div className="bg-[#E2E8F0]/80 p-1 sm:p-1.5 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-1.5 border border-[#D9E2EF] shadow-2xs w-full">
            <button
              type="button"
              onClick={() => handlePlatformChange('windows')}
              className={`py-2 px-1.5 sm:px-2.5 rounded-xl flex items-center justify-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold transition-all cursor-pointer min-w-0 ${
                selectedPlatform === 'windows'
                  ? 'bg-[#0284C7] text-white shadow-xs font-bold'
                  : 'bg-white/80 hover:bg-white text-[#475569] hover:text-[#0F172A] border border-[#D9E2EF]/60'
              }`}
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.951-1.801" />
              </svg>
              <span className="truncate">Windows (.exe)</span>
            </button>
            <button
              type="button"
              onClick={() => handlePlatformChange('macos')}
              className={`py-2 px-1.5 sm:px-2.5 rounded-xl flex items-center justify-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold transition-all cursor-pointer min-w-0 ${
                selectedPlatform === 'macos'
                  ? 'bg-[#0284C7] text-white shadow-xs font-bold'
                  : 'bg-white/80 hover:bg-white text-[#475569] hover:text-[#0F172A] border border-[#D9E2EF]/60'
              }`}
            >
              <Apple className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">macOS (.dmg)</span>
            </button>
            <button
              type="button"
              onClick={() => handlePlatformChange('android')}
              className={`py-2 px-1.5 sm:px-2.5 rounded-xl flex items-center justify-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold transition-all cursor-pointer min-w-0 ${
                selectedPlatform === 'android'
                  ? 'bg-[#0284C7] text-white shadow-xs font-bold'
                  : 'bg-white/80 hover:bg-white text-[#475569] hover:text-[#0F172A] border border-[#D9E2EF]/60'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Android (.apk)</span>
            </button>
            <button
              type="button"
              onClick={() => handlePlatformChange('ios')}
              className={`py-2 px-1.5 sm:px-2.5 rounded-xl flex items-center justify-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold transition-all cursor-pointer min-w-0 ${
                selectedPlatform === 'ios'
                  ? 'bg-[#0284C7] text-white shadow-xs font-bold'
                  : 'bg-white/80 hover:bg-white text-[#475569] hover:text-[#0F172A] border border-[#D9E2EF]/60'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">iOS (.ipa)</span>
            </button>
          </div>

          {/* User Session Banner */}
          {!isAuthenticated ? (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-2.5 shadow-2xs">
              <div className="flex items-start gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 border border-amber-200">
                  <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-xs sm:text-[13px] font-bold text-amber-900 uppercase font-mono tracking-wider">
                    User Authentication Required
                  </h4>
                  <p className="text-[11px] sm:text-xs text-amber-800 leading-relaxed">
                    To prevent unverified distribution and preserve cryptographic boundary controls, Orion-9 packages require an authenticated user profile.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => handleNavigateAuth('login')}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs sm:text-[13px] font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <span>Sign In to Download</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigateAuth('signup')}
                  className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-xs sm:text-[13px] font-semibold text-slate-700 transition-colors cursor-pointer text-center"
                >
                  Create Account
                </button>
              </div>
            </div>
          ) : (
            <div className="px-3.5 py-2.5 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-between gap-2.5 text-xs shadow-2xs">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                <span className="truncate text-[#475569] text-xs sm:text-[13px] font-medium">
                  User Session:{' '}
                  <strong className="font-mono text-[#047857] font-semibold truncate ml-1">
                    {user?.email || username}
                  </strong>
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-mono uppercase bg-white text-[#047857] px-2.5 py-0.5 rounded-full font-bold border border-[#A7F3D0] shrink-0 tracking-wider">
                AUTHORIZED
              </span>
            </div>
          )}

          {/* Specification Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {/* Platform */}
            <div className="p-2.5 sm:p-3.5 rounded-2xl bg-white border border-[#D9E2EF] flex flex-col justify-between shadow-2xs min-h-[78px] sm:min-h-[84px]">
              <Cpu className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#0284C7] mb-1 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase tracking-wider block mb-0.5">
                  PLATFORM
                </span>
                <span className="text-xs sm:text-[13px] font-bold text-[#0F172A] block font-mono truncate">
                  {activeRelease ? activeRelease.platform : selectedPlatform}
                </span>
              </div>
            </div>

            {/* Format */}
            <div className="p-2.5 sm:p-3.5 rounded-2xl bg-white border border-[#D9E2EF] flex flex-col justify-between shadow-2xs min-h-[78px] sm:min-h-[84px]">
              <FileText className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#0284C7] mb-1 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase tracking-wider block mb-0.5">
                  FORMAT
                </span>
                <span className="text-xs sm:text-[13px] font-bold text-[#0F172A] block uppercase font-mono">
                  {activeRelease ? activeRelease.format : selectedFormat}
                </span>
              </div>
            </div>

            {/* Package Size */}
            <div className="p-2.5 sm:p-3.5 rounded-2xl bg-white border border-[#D9E2EF] flex flex-col justify-between shadow-2xs min-h-[78px] sm:min-h-[84px]">
              <Database className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#0284C7] mb-1 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase tracking-wider block mb-0.5">
                  PACKAGE SIZE
                </span>
                <span className="text-xs sm:text-[13px] font-bold text-[#0F172A] block font-mono truncate">
                  {formatSize(activeRelease?.sizeBytes)}
                </span>
              </div>
            </div>

            {/* Min OS Requirement */}
            <div className="p-2.5 sm:p-3.5 rounded-2xl bg-white border border-[#D9E2EF] flex flex-col justify-between shadow-2xs min-h-[78px] sm:min-h-[84px]">
              {selectedPlatform === 'windows' ? (
                <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#0284C7] mb-1 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.951-1.801" />
                </svg>
              ) : selectedPlatform === 'macos' ? (
                <Apple className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#0284C7] mb-1 shrink-0" />
              ) : (
                <Smartphone className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#0284C7] mb-1 shrink-0" />
              )}
              <div className="min-w-0">
                <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase tracking-wider block mb-0.5">
                  MIN OS
                </span>
                <span
                  className="text-[11px] sm:text-xs font-bold text-[#0F172A] block leading-tight break-words"
                  title={activeRelease?.minimumOs || 'Universal'}
                >
                  {activeRelease?.minimumOs || (selectedPlatform === 'windows' ? 'Windows 10 / 11 64-bit' : selectedPlatform === 'macos' ? 'macOS 12+ (Universal)' : selectedPlatform === 'android' ? 'Android 10+' : 'iOS 16+')}
                </span>
              </div>
            </div>
          </div>

          {/* iOS Special Notice & External URL */}
          {selectedPlatform === 'ios' && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 text-xs sm:text-[13px] space-y-2">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="font-bold">iOS Installation Notice:</strong>
                  <p className="text-[11px] sm:text-xs text-sky-800 leading-relaxed">
                    Direct installation of iOS .ipa packages requires Apple developer device registration or enterprise mobile device management (MDM). For unmanaged iPhones, please use official TestFlight or App Store distribution.
                  </p>
                </div>
              </div>
              {activeRelease?.externalUrl && (
                <div className="pt-1">
                  <a
                    href={activeRelease.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0284C7] text-white font-bold text-xs hover:bg-[#0369A1] transition-all shadow-xs"
                  >
                    <span>Open in TestFlight / App Store</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* SHA-256 Panel */}
          {activeRelease?.sha256 ? (
            <div className="rounded-2xl bg-[#0B1528] text-white p-3.5 sm:p-4 space-y-3 shadow-md border border-[#1E293B]">
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 text-xs sm:text-[13px] font-bold text-white uppercase font-mono tracking-wider min-w-0">
                  <ShieldCheck className="w-4 h-4 text-[#38BDF8] shrink-0" />
                  <span className="truncate">SHA-256 INTEGRITY HASH</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyHash}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[#38BDF8] hover:text-white text-xs font-mono font-medium transition-colors cursor-pointer shrink-0 border border-white/10"
                  aria-label="Copy SHA-256 hash"
                >
                  {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedHash ? 'Copied' : 'Copy Hash'}</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#050B14] border border-white/10 font-mono text-[11px] sm:text-xs text-slate-100 break-all select-all leading-relaxed tracking-wide">
                {activeRelease.sha256}
              </div>

              <div className="pt-1.5 border-t border-white/10 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[11px] font-mono text-slate-300 flex items-center gap-1.5 font-medium truncate">
                    <Terminal className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                    <span className="truncate">Verification Command ({selectedPlatform === 'windows' ? 'PowerShell' : 'Terminal'})</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCommand}
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-[#38BDF8] hover:text-white transition-colors cursor-pointer shrink-0"
                    aria-label="Copy verification command"
                  >
                    {copiedCommand ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCommand ? 'Copied' : 'Copy Command'}</span>
                  </button>
                </div>
                <div className="p-2 rounded-lg bg-[#050B14] border border-white/10 font-mono text-[10px] sm:text-[11px] text-[#38BDF8] break-all select-all">
                  {getVerificationCommand()}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#D9E2EF] text-center space-y-2 shadow-2xs">
              <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto" />
              <div className="text-xs sm:text-sm font-bold text-[#0F172A]">No Published Release Available</div>
              <p className="text-xs text-[#64748B] max-w-md mx-auto leading-relaxed">
                An official release for {selectedPlatform} has not yet been published to the distribution network. Please select another platform or check back soon.
              </p>
            </div>
          )}

          {/* High-Contrast Light-Mode Error Banner */}
          {downloadError && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FEF2F2] border border-[#FCA5A5] text-left flex items-start gap-2.5 sm:gap-3 shadow-2xs">
              <AlertTriangle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
              <div className="space-y-0.5 min-w-0 flex-1">
                <strong className="font-bold text-[#991B1B] text-xs sm:text-sm block">Download Aborted</strong>
                <p className="text-[11px] sm:text-xs text-[#B91C1C] leading-relaxed break-words font-medium">
                  {downloadError}
                </p>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {downloadSuccess && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-left text-xs sm:text-[13px] text-[#047857] flex items-center gap-2.5 shadow-2xs">
              <CheckCircle2 className="w-4.5 h-4.5 text-[#059669] shrink-0" />
              <span>
                Download complete: <strong>{activeRelease?.filename}</strong> streamed and verified via SHA-256. Saved to your downloads directory.
              </span>
            </div>
          )}
        </div>

        {/* Pinned Clean Light Footer */}
        <div className="p-3 sm:p-4 border-t border-[#D9E2EF] bg-white shrink-0 flex items-center gap-2 sm:gap-3.5">
          <div className="flex-1 min-w-0">
            <OrionNovaDownloadButton
              filename={activeRelease ? activeRelease.filename : `Orion-9-${selectedPlatform}`}
              version={activeRelease ? activeRelease.version : '9.0.0'}
              platform={selectedPlatform}
              isAuthenticated={isAuthenticated}
              onDownload={handleAuthenticatedDownload}
              onNavigateAuth={handleNavigateAuth}
              disabled={!activeRelease || isDownloading}
            />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 sm:px-6 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] font-semibold text-xs sm:text-sm border border-[#E2E8F0] transition-colors cursor-pointer text-center shrink-0"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { DEFAULT_DESKTOP_RELEASES } from '../data/defaultSiteConfig';
import { DesktopPlatform, DesktopReleaseRecord } from '../types/cms';
import { OrionNovaDownloadButton } from './OrionNovaDownloadButton';
import {
  downloadDesktopInstaller,
  validateReleaseForDownload,
  DesktopDownloadError,
} from '../services/downloadService';
import {
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Laptop,
  Apple,
  X,
  Lock,
  ArrowRight,
  AlertTriangle,
  Terminal,
} from 'lucide-react';

interface DesktopDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (path: string) => void;
  initialPlatform?: 'windows' | 'macos';
}

export const DesktopDownloadModal: React.FC<DesktopDownloadModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  initialPlatform,
}) => {
  const { user, isAuthenticated, username } = useAuth();
  const { activeConfig } = useSiteConfig();

  // Read URL query params if present (e.g. ?platform=macos)
  const [selectedPlatform, setSelectedPlatform] = useState<'windows' | 'macos'>('windows');
  const [selectedFormat, setSelectedFormat] = useState<string>('exe');
  const [copiedHash, setCopiedHash] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Background scroll locking & Escape key listener
  useEffect(() => {
    if (!isOpen) {
      setDownloadError(null);
      setDownloadSuccess(false);
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
      } else if (initialPlatform) {
        setSelectedPlatform(initialPlatform);
        setSelectedFormat(initialPlatform === 'macos' ? 'dmg' : 'exe');
      }
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, initialPlatform, onClose]);

  if (!isOpen) return null;

  const catalog: DesktopReleaseRecord[] =
    activeConfig.desktopReleases && activeConfig.desktopReleases.length > 0
      ? activeConfig.desktopReleases
      : DEFAULT_DESKTOP_RELEASES;

  // Filter releases by current platform tab
  const platformReleases = catalog.filter((r) => {
    if (selectedPlatform === 'windows') {
      return r.platform.startsWith('windows');
    }
    return r.platform.startsWith('macos');
  });

  // Current active release matching selected format or latest
  const activeRelease: DesktopReleaseRecord =
    platformReleases.find((r) => r.format === selectedFormat) ||
    platformReleases.find((r) => r.isLatest) ||
    platformReleases[0] ||
    DEFAULT_DESKTOP_RELEASES[0];

  const handleCopyHash = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(activeRelease.sha256);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2200);
    }
  };

  const handlePlatformChange = (plat: 'windows' | 'macos') => {
    setSelectedPlatform(plat);
    setSelectedFormat(plat === 'windows' ? 'exe' : 'dmg');
    setDownloadError(null);
    setDownloadSuccess(false);
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

    if (isDownloading) return;

    setDownloadError(null);
    setDownloadSuccess(false);

    // Pre-flight lifecycle verification
    const validation = validateReleaseForDownload(
      activeRelease,
      user?.email === 'admin@orion9.local' ? 'admin' : undefined
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
      throw err;
    } finally {
      setIsDownloading(false);
    }
  };

  const getVerificationCommand = () => {
    if (selectedPlatform === 'windows') {
      return `Get-FileHash -Algorithm SHA256 .\\${activeRelease.filename}`;
    }
    return `shasum -a 256 ./${activeRelease.filename}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="download-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-[calc(100vw-24px)] sm:w-full max-w-xl lg:max-w-[620px] max-h-[calc(100dvh-24px)] sm:max-h-[88vh] liquid-glass-elevated liquid-glass-interactive rounded-3xl border border-white/15 dark:border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.85)] flex flex-col text-[var(--orion-text-primary)] animate-in zoom-in-95 duration-200 my-auto overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* macOS Window Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 bg-slate-900/80 backdrop-blur-md shrink-0 select-none">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            {/* macOS Traffic Lights */}
            <div className="flex items-center gap-1.5 shrink-0 mr-0.5">
              <button
                type="button"
                onClick={onClose}
                className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] hover:opacity-80 transition cursor-pointer"
                aria-label="Close dialog"
                title="Close"
              />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
            </div>

            <div className="h-4 w-[1px] bg-white/15 shrink-0 hidden min-[360px]:block" aria-hidden="true" />

            {/* Application Icon */}
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-sky-500/10 border border-sky-400/25 flex items-center justify-center text-sky-400 shadow-2xs shrink-0">
              {selectedPlatform === 'windows' ? (
                <Laptop className="w-4 h-4 text-sky-400" />
              ) : (
                <Apple className="w-4 h-4 text-sky-400" />
              )}
            </div>

            {/* Product Title + Badges on Single Baseline */}
            <div className="min-w-0 flex items-center gap-1.5 sm:gap-2">
              <h3
                id="download-modal-title"
                className="text-sm sm:text-base font-bold text-white tracking-tight truncate"
              >
                Orion-9 Desktop
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-white/10 text-sky-300 border border-white/10 shrink-0">
                v{activeRelease.version}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 ${
                  activeRelease.status === 'published'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                }`}
              >
                {activeRelease.status}
              </span>
            </div>
          </div>

          {/* Window Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0 ml-2"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content Area (Scrollable on short screens) */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-4.5 overflow-y-auto min-h-0 flex-1 custom-scrollbar">
          {/* Segmented Platform Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-black/50 border border-white/10 shadow-inner">
            <button
              type="button"
              onClick={() => handlePlatformChange('windows')}
              className={`flex-1 h-10 sm:h-11 flex items-center justify-center gap-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedPlatform === 'windows'
                  ? 'bg-gradient-to-b from-white/20 to-white/10 text-white shadow-md border border-white/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Laptop className={`w-4 h-4 ${selectedPlatform === 'windows' ? 'text-sky-400' : 'text-slate-400'}`} />
              <span>Windows (.exe)</span>
            </button>
            <button
              type="button"
              onClick={() => handlePlatformChange('macos')}
              className={`flex-1 h-10 sm:h-11 flex items-center justify-center gap-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedPlatform === 'macos'
                  ? 'bg-gradient-to-b from-white/20 to-white/10 text-white shadow-md border border-white/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Apple className={`w-4 h-4 ${selectedPlatform === 'macos' ? 'text-sky-400' : 'text-slate-400'}`} />
              <span>macOS (.dmg)</span>
            </button>
          </div>

          {/* Authentication Gate */}
          {!isAuthenticated ? (
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/25 text-left space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="text-xs font-bold text-amber-400 uppercase font-mono tracking-wider">
                    User Authentication Required
                  </h4>
                  <p className="text-xs text-amber-200/90 leading-relaxed">
                    To prevent unverified distribution and preserve cryptographic boundary controls, Orion-9 workstation installers require an authenticated user profile.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleNavigateAuth('login')}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:from-[#0369A1] hover:to-[#075985] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                >
                  <span>Sign In to Download</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigateAuth('signup')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-colors cursor-pointer text-center"
                >
                  Create Account
                </button>
              </div>
            </div>
          ) : (
            <div className="px-3.5 py-2.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/25 flex items-center justify-between gap-3 text-xs shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate text-slate-300">
                  User Session:{' '}
                  <strong className="font-mono text-emerald-300 font-semibold truncate">
                    {user?.email || username}
                  </strong>
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md font-bold border border-emerald-500/30 shrink-0">
                Authorized
              </span>
            </div>
          )}

          {/* Metadata Grid (4 Uniform Responsive Cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-900/60 border border-white/10 flex flex-col justify-between min-h-[66px]">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                PLATFORM
              </span>
              <span className="text-xs sm:text-[13px] font-semibold text-white tracking-tight mt-1 truncate">
                {activeRelease.platform}
              </span>
            </div>
            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-900/60 border border-white/10 flex flex-col justify-between min-h-[66px]">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                FORMAT
              </span>
              <span className="text-xs sm:text-[13px] font-semibold text-white tracking-tight mt-1 truncate">
                {activeRelease.format.toUpperCase()}
              </span>
            </div>
            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-900/60 border border-white/10 flex flex-col justify-between min-h-[66px]">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                PACKAGE SIZE
              </span>
              <span className="text-xs sm:text-[13px] font-semibold text-white tracking-tight mt-1 truncate">
                {(activeRelease.sizeBytes / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
            <div
              className="p-3 sm:p-3.5 rounded-xl bg-slate-900/60 border border-white/10 flex flex-col justify-between min-h-[66px]"
              title={activeRelease.minimumOs}
            >
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                MIN OS
              </span>
              <span className="text-xs sm:text-[13px] font-semibold text-white tracking-tight mt-1 truncate">
                {activeRelease.minimumOs}
              </span>
            </div>
          </div>

          {/* Cryptographic SHA-256 Card in Terminal Obsidian Glass */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/90 border border-white/10 shadow-inner space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-sky-400 flex items-center gap-1.5 text-[11px] tracking-wider truncate">
                <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                <span>SHA-256 INTEGRITY HASH</span>
              </span>
              <button
                type="button"
                onClick={handleCopyHash}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-[11px] font-medium text-slate-300 hover:text-white transition-colors cursor-pointer border border-white/10 shrink-0"
              >
                {copiedHash ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Hash</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-2.5 bg-black/70 rounded-xl border border-white/10 font-mono text-[10px] sm:text-[11px] text-slate-300 select-all break-all leading-relaxed">
              {activeRelease.sha256}
            </div>

            <div className="space-y-1.5 text-slate-400 font-mono">
              <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                <Terminal className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>Verify terminal command:</span>
              </div>
              <div className="p-2 rounded-lg bg-black/60 border border-white/5 font-mono text-[10px] text-sky-300 select-all break-all">
                {getVerificationCommand()}
              </div>
            </div>
          </div>

          {/* Error Banner in Flow */}
          {downloadError && (
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-left text-xs text-rose-300 flex items-start gap-2.5 leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 min-w-0">
                <strong className="font-semibold text-rose-300 block">Download Aborted:</strong>
                <span className="break-words">{downloadError}</span>
              </div>
            </div>
          )}

          {/* Success Banner in Flow */}
          {downloadSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-left text-xs text-emerald-300 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Installer binary stream verified. Check your downloads directory.</span>
            </div>
          )}
        </div>

        {/* Pinned Modal Action Footer */}
        <div className="p-3.5 sm:p-5 border-t border-white/10 bg-slate-900/70 backdrop-blur-md shrink-0 flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:flex-1">
            <OrionNovaDownloadButton
              filename={activeRelease.filename}
              version={activeRelease.version}
              platform={selectedPlatform}
              isAuthenticated={isAuthenticated}
              onDownload={handleAuthenticatedDownload}
              onNavigateAuth={handleNavigateAuth}
              disabled={activeRelease.status === 'disabled' || activeRelease.status === 'retired' || isDownloading}
            />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer text-center shrink-0"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

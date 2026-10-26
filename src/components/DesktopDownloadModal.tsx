import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { DEFAULT_DESKTOP_RELEASES } from '../data/defaultSiteConfig';
import { DesktopPlatform, DesktopReleaseRecord } from '../types/cms';
import { OrionNovaDownloadButton } from './OrionNovaDownloadButton';
import {
  Download,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Laptop,
  Apple,
  X,
  FileCheck,
  HardDrive,
  Info,
  Lock,
  ArrowRight,
  AlertTriangle,
  Loader2,
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

    setDownloadError(null);
    setDownloadSuccess(false);

    // Security check: Never download disabled or retired releases
    if (activeRelease.status === 'disabled' || activeRelease.status === 'retired') {
      setDownloadError(
        `Release v${activeRelease.version} (${activeRelease.platform}) has been ${activeRelease.status} by administrators and is unavailable for distribution.`
      );
      return;
    }

    setIsDownloading(true);

    try {
      const response = await fetch(activeRelease.downloadUrl, {
        method: 'GET',
        headers: {
          Accept:
            'application/octet-stream, application/vnd.microsoft.portable-executable, application/x-apple-diskimage, */*',
        },
      });

      // Defect protection: Verify we did not receive an HTML SPA fallback redirect!
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        throw new Error(
          `Binary streaming error: Endpoint returned HTML fallback (${contentType}) instead of authentic desktop installer binary.`
        );
      }

      if (!response.ok) {
        throw new Error(
          `HTTP download failed: Server responded with status ${response.status} ${response.statusText}`
        );
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = activeRelease.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Increment local telemetry
      activeRelease.downloadCount = (activeRelease.downloadCount || 0) + 1;
      setDownloadSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown download failure';
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="download-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-[calc(100vw-24px)] sm:w-full max-w-lg lg:max-w-xl max-h-[calc(100dvh-28px)] sm:max-h-[88vh] liquid-glass-elevated border border-[var(--glass-border)] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col text-[var(--orion-text-primary)] animate-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* macOS Window Header Bar */}
        <div className="flex items-center justify-between px-3.5 sm:px-6 py-3 sm:py-4 border-b border-[var(--glass-border-subtle)] bg-white/40 dark:bg-black/30 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* macOS Window Traffic Lights - hidden on narrow screens */}
            <div className="hidden sm:flex items-center gap-1.5 mr-1 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] hover:opacity-80 transition cursor-pointer"
                aria-label="Close"
              />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
            </div>

            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl liquid-glass-subtle flex items-center justify-center text-[var(--orion-accent)] shadow-2xs shrink-0">
              {selectedPlatform === 'windows' ? (
                <Laptop className="w-4 h-4 text-[var(--orion-accent)]" />
              ) : (
                <Apple className="w-4 h-4 text-[var(--orion-accent)]" />
              )}
            </div>
            <div className="min-w-0 flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h3
                id="download-modal-title"
                className="text-sm sm:text-base font-bold text-[var(--orion-text-primary)] tracking-tight truncate"
              >
                Orion-9 Desktop
              </h3>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-semibold liquid-glass-badge text-[var(--orion-accent)] shrink-0">
                v{activeRelease.version}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold uppercase shrink-0 ${
                  activeRelease.status === 'published'
                    ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20'
                    : 'bg-amber-500/15 text-amber-500 border border-amber-500/20'
                }`}
              >
                {activeRelease.status}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full liquid-glass-button flex items-center justify-center text-[var(--orion-text-muted)] hover:text-[var(--orion-text-primary)] transition-colors cursor-pointer shrink-0 ml-2"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto min-h-0 flex-1 overscroll-contain">
          {/* Segmented Platform Switcher */}
          <div className="flex items-center justify-between gap-1.5 sm:gap-2 p-1.5 liquid-glass-subtle rounded-2xl border border-[var(--glass-border-subtle)]">
            <button
              type="button"
              onClick={() => handlePlatformChange('windows')}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-2 sm:px-4 rounded-xl text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
                selectedPlatform === 'windows'
                  ? 'bg-[var(--orion-surface)] text-[var(--orion-text-primary)] shadow-sm'
                  : 'text-[var(--orion-text-muted)] hover:text-[var(--orion-text-primary)]'
              }`}
            >
              <Laptop className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--orion-accent)] shrink-0" />
              <span className="truncate">Windows (.exe)</span>
            </button>
            <button
              type="button"
              onClick={() => handlePlatformChange('macos')}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-2 sm:px-4 rounded-xl text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
                selectedPlatform === 'macos'
                  ? 'bg-[var(--orion-surface)] text-[var(--orion-text-primary)] shadow-sm'
                  : 'text-[var(--orion-text-muted)] hover:text-[var(--orion-text-primary)]'
              }`}
            >
              <Apple className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--orion-accent)] shrink-0" />
              <span className="truncate">macOS (.dmg)</span>
            </button>
          </div>

          {/* Authentication Gate */}
          {!isAuthenticated ? (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-left space-y-2.5 sm:space-y-3">
              <div className="flex items-start gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="text-[11px] sm:text-xs font-bold text-amber-600 dark:text-amber-400 uppercase font-mono tracking-wider">
                    Operator Authentication Required
                  </h4>
                  <p className="text-[11px] sm:text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                    To prevent unverified distribution and preserve cryptographic boundary controls, Orion-9 workstation installers require an authenticated operator profile.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleNavigateAuth('login')}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#0369A1] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                >
                  <span>Sign In to Download</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigateAuth('signup')}
                  className="w-full sm:w-auto px-4 py-2 sm:py-2.5 rounded-xl liquid-glass-button text-xs font-semibold text-[var(--orion-text-primary)] transition-colors cursor-pointer text-center"
                >
                  Create Account
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-2 text-xs text-emerald-600 dark:text-emerald-400">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="truncate">
                  Operator Session:{' '}
                  <strong className="font-mono">{user?.email || username}</strong>
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-emerald-500/20 px-2 py-0.5 rounded-md font-semibold shrink-0">
                Authorized
              </span>
            </div>
          )}

          {/* Metadata Grid in Liquid Glass (Responsive 1/2/4 columns) */}
          <div className="grid grid-cols-1 min-[340px]:grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
            <div className="p-2.5 sm:p-3 rounded-xl liquid-glass-card">
              <span className="text-[9px] sm:text-[10px] font-mono font-bold text-[var(--orion-text-muted)] uppercase tracking-wider block">
                Platform
              </span>
              <span className="text-xs font-semibold text-[var(--orion-text-primary)] mt-0.5 block truncate">
                {activeRelease.platform}
              </span>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl liquid-glass-card">
              <span className="text-[9px] sm:text-[10px] font-mono font-bold text-[var(--orion-text-muted)] uppercase tracking-wider block">
                Format
              </span>
              <span className="text-xs font-semibold text-[var(--orion-text-primary)] mt-0.5 block truncate">
                {activeRelease.format.toUpperCase()}
              </span>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl liquid-glass-card">
              <span className="text-[9px] sm:text-[10px] font-mono font-bold text-[var(--orion-text-muted)] uppercase tracking-wider block">
                Package Size
              </span>
              <span className="text-xs font-semibold text-[var(--orion-text-primary)] mt-0.5 block truncate">
                {(activeRelease.sizeBytes / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl liquid-glass-card">
              <span className="text-[9px] sm:text-[10px] font-mono font-bold text-[var(--orion-text-muted)] uppercase tracking-wider block">
                Min OS
              </span>
              <span className="text-xs font-semibold text-[var(--orion-text-primary)] mt-0.5 block truncate">
                {activeRelease.minimumOs}
              </span>
            </div>
          </div>

          {/* Cryptographic SHA-256 Card in Terminal Glass */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-black/40 dark:bg-black/60 border border-[var(--glass-border)] space-y-2.5">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-mono font-bold text-sky-400 flex items-center gap-1.5 text-[10px] sm:text-[11px] truncate">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="truncate">SHA-256 INTEGRITY HASH</span>
              </span>
              <button
                type="button"
                onClick={handleCopyHash}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] sm:text-[11px] font-medium text-white transition-colors cursor-pointer border border-white/10 shrink-0"
              >
                {copiedHash ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-400" />
                    <span>Copy Hash</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-2.5 bg-black/60 rounded-xl border border-white/10 font-mono text-[10px] sm:text-[11px] text-slate-300 break-all select-all leading-relaxed">
              {activeRelease.sha256}
            </div>
            <div className="flex flex-col gap-1 text-[10px] sm:text-[11px] text-slate-400 font-mono">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Terminal className="w-3 h-3 text-sky-400 shrink-0" />
                <span>Verify terminal command:</span>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-white/5 text-sky-300 break-all font-mono text-[10px] select-all">
                {getVerificationCommand()}
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {downloadError && (
            <div className="p-3 sm:p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-left text-xs text-rose-500 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block">Download Aborted:</strong>
                <span>{downloadError}</span>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {downloadSuccess && (
            <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-left text-xs text-emerald-500 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Installer binary stream verified. Check your downloads directory.</span>
            </div>
          )}

          {/* NovaDownload Integrated Action Controls */}
          <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3">
            <div className="w-full sm:flex-1">
              <OrionNovaDownloadButton
                filename={activeRelease.filename}
                version={activeRelease.version}
                platform={selectedPlatform}
                isAuthenticated={isAuthenticated}
                onDownload={handleAuthenticatedDownload}
                onNavigateAuth={handleNavigateAuth}
                disabled={activeRelease.status === 'disabled' || activeRelease.status === 'retired'}
              />
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 sm:py-3.5 rounded-xl liquid-glass-button text-xs font-semibold text-[var(--orion-text-secondary)] hover:text-[var(--orion-text-primary)] transition-colors cursor-pointer text-center"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

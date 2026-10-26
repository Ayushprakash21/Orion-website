import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { DEFAULT_DESKTOP_RELEASES } from '../data/defaultSiteConfig';
import { DesktopPlatform, DesktopReleaseRecord } from '../types/cms';
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

  useEffect(() => {
    if (!isOpen) {
      setDownloadError(null);
      setDownloadSuccess(false);
      return;
    }

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
  }, [isOpen, initialPlatform]);

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

  const formatBytes = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB (${bytes.toLocaleString()} bytes)`;
  };

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
          Accept: 'application/octet-stream, application/vnd.microsoft.portable-executable, application/x-apple-diskimage, */*',
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
      const objectUrl = window.URL.createObjectURL(blob);

      // Trigger genuine client-side download with immutable filename
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = activeRelease.filename;
      anchor.setAttribute('aria-hidden', 'true');
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      // Revoke blob URL after invocation
      setTimeout(() => {
        window.URL.revokeObjectURL(objectUrl);
      }, 5000);

      // Increment local telemetry
      activeRelease.downloadCount = (activeRelease.downloadCount || 0) + 1;
      setDownloadSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown download failure';
      setDownloadError(message);
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070B19]/75 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="download-modal-title"
    >
      <div
        className="relative w-full max-w-2xl bg-white border border-[#DCE7F0] rounded-3xl shadow-2xl overflow-hidden flex flex-col text-[#070B19] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#DCE7F0] bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#070B19] flex items-center justify-center text-white shadow-md">
              {selectedPlatform === 'windows' ? (
                <Laptop className="w-5 h-5 text-[#38BDF8]" />
              ) : (
                <Apple className="w-5 h-5 text-[#38BDF8]" />
              )}
            </div>
            <div>
              <h3
                id="download-modal-title"
                className="text-lg font-bold text-[#070B19] tracking-tight flex items-center gap-2"
              >
                <span>Orion-9 Desktop Distribution</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]">
                  v{activeRelease.version}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    activeRelease.status === 'published'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {activeRelease.status}
                </span>
              </h3>
              <p className="text-xs text-[#64748B]">
                Authenticated Enterprise Installer Portal &bull; Windows &amp; macOS Releases
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#DCE7F0] flex items-center justify-center text-[#64748B] hover:text-[#070B19] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Platform Switcher Tabs */}
          <div className="flex items-center justify-between gap-3 p-1.5 bg-[#F1F5F9] rounded-2xl border border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => handlePlatformChange('windows')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedPlatform === 'windows'
                  ? 'bg-white text-[#070B19] shadow-sm border border-[#CBD5E1]'
                  : 'text-[#64748B] hover:text-[#070B19]'
              }`}
            >
              <Laptop className="w-4 h-4 text-[#0284C7]" />
              <span>Windows 64-bit</span>
            </button>
            <button
              type="button"
              onClick={() => handlePlatformChange('macos')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedPlatform === 'macos'
                  ? 'bg-white text-[#070B19] shadow-sm border border-[#CBD5E1]'
                  : 'text-[#64748B] hover:text-[#070B19]'
              }`}
            >
              <Apple className="w-4 h-4 text-[#0284C7]" />
              <span>macOS (Universal / M-Series)</span>
            </button>
          </div>

          {/* Package Format Selector (EXE vs MSI for Windows, Universal vs ARM64 for macOS) */}
          {platformReleases.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-[#64748B] uppercase font-bold">
                Package Format:
              </span>
              <div className="flex items-center gap-2">
                {platformReleases.map((rel) => (
                  <button
                    key={rel.id}
                    type="button"
                    onClick={() => {
                      setSelectedFormat(rel.format);
                      setDownloadError(null);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                      activeRelease.id === rel.id
                        ? 'bg-[#070B19] text-white font-bold'
                        : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] border border-[#CBD5E1]'
                    }`}
                  >
                    {rel.filename} ({rel.format.toUpperCase()})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Authentication Status Gate */}
          {!isAuthenticated ? (
            <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-left space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-amber-900 uppercase font-mono tracking-wider">
                    Operator Authentication Required
                  </h4>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    To prevent unverified distribution and preserve cryptographic boundary controls, Orion-9 desktop installers require an authenticated operator session.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleNavigateAuth('login')}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#070B19] text-white text-xs font-semibold hover:bg-[#1E293B] shadow-md transition-all cursor-pointer"
                >
                  <span>Sign In to Download</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#38BDF8]" />
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigateAuth('signup')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#D5E1E8] bg-white text-xs font-semibold text-[#111827] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Operator Session Verified:{' '}
                  <strong className="font-mono">{user?.email || username}</strong>
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-semibold">
                Authorized
              </span>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase tracking-wider block">
                Platform
              </span>
              <span className="text-xs font-semibold text-[#070B19] mt-0.5 block truncate">
                {activeRelease.platform}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase tracking-wider block">
                Format
              </span>
              <span className="text-xs font-semibold text-[#070B19] mt-0.5 block">
                {activeRelease.format.toUpperCase()} Installer
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase tracking-wider block">
                Package Size
              </span>
              <span className="text-xs font-semibold text-[#070B19] mt-0.5 block">
                {(activeRelease.sizeBytes / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase tracking-wider block">
                Min OS
              </span>
              <span className="text-xs font-semibold text-[#070B19] mt-0.5 block truncate">
                {activeRelease.minimumOs}
              </span>
            </div>
          </div>

          {/* SHA-256 Checksum Card */}
          <div className="p-4 rounded-2xl bg-[#F1F5F9] border border-[#E2E8F0] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-[#475569] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#0284C7]" />
                <span>CRYPTOGRAPHIC SHA-256 INTEGRITY HASH</span>
              </span>
              <button
                type="button"
                onClick={handleCopyHash}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#CBD5E1] text-[11px] font-medium text-[#070B19] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
              >
                {copiedHash ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>Copy Hash</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-[#CBD5E1] font-mono text-[11px] text-[#334155] break-all select-all">
              {activeRelease.sha256}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[#64748B] font-mono">
              <Terminal className="w-3 h-3 text-[#0284C7]" />
              <span>Verify terminal command: <code className="bg-white/80 px-1 py-0.5 rounded border border-[#CBD5E1]">{getVerificationCommand()}</code></span>
            </div>
          </div>

          {/* Release Highlights */}
          {activeRelease.releaseNotes && activeRelease.releaseNotes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-[#64748B]">
                Release Highlights (v{activeRelease.version} &bull; {activeRelease.filename})
              </h4>
              <ul className="space-y-1.5">
                {activeRelease.releaseNotes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-[#334155]">
                    <CheckCircle2 className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Error Banner */}
          {downloadError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-left text-xs text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block">Download Aborted:</strong>
                <span>{downloadError}</span>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {downloadSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-left text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Installer binary stream started successfully. Check your browser downloads folder.</span>
            </div>
          )}

          {/* Download Action Controls */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleAuthenticatedDownload}
                disabled={isDownloading}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#070B19] text-white font-semibold text-sm hover:bg-[#1E293B] shadow-lg transition-all cursor-pointer disabled:opacity-60"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 text-[#38BDF8] animate-spin" />
                    <span>Streaming Installer Binary...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-[#38BDF8]" />
                    <span>Download {activeRelease.filename}</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleNavigateAuth('login')}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#070B19] text-white font-semibold text-sm hover:bg-[#1E293B] shadow-lg transition-all cursor-pointer"
              >
                <Lock className="w-4 h-4 text-[#38BDF8]" />
                <span>Authenticate to Download {activeRelease.filename}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>

          {/* Security & Integrity Architecture Notice */}
          <div className="p-3.5 rounded-2xl bg-[#EAF4FB] border border-[#BAE6FD] text-left text-xs text-[#0369A1] space-y-1">
            <div className="flex items-center gap-1.5 font-semibold">
              <Info className="w-3.5 h-3.5" />
              <span>Cryptographic Packaging Guarantee</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#0c4a6e]">
              All Orion-9 workstation binaries are compiled with strict PE / Mach-O header integrity, SHA-256 digests, and hardware-isolated execution boundaries. No plain web redirect is ever treated as an installer binary.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';
import { DEFAULT_DESKTOP_RELEASES } from '../data/defaultSiteConfig';
import {
  Download,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Laptop,
  X,
  FileCheck,
  HardDrive,
  Info,
} from 'lucide-react';

interface DesktopDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopDownloadModal: React.FC<DesktopDownloadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { activeConfig } = useSiteConfig();
  const [copiedHash, setCopiedHash] = useState(false);

  if (!isOpen) return null;

  const latestRelease =
    activeConfig.desktopReleases?.find((r) => r.isLatest) ||
    DEFAULT_DESKTOP_RELEASES[0];

  const formatBytes = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB (${bytes.toLocaleString()} bytes)`;
  };

  const handleCopyHash = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(latestRelease.sha256);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2200);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070B19]/70 backdrop-blur-md animate-in fade-in duration-200"
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
              <Laptop className="w-5 h-5 text-[#38BDF8]" />
            </div>
            <div>
              <h3
                id="download-modal-title"
                className="text-lg font-bold text-[#070B19] tracking-tight flex items-center gap-2"
              >
                <span>Orion-9 Desktop</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]">
                  v{latestRelease.version}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  STABLE
                </span>
              </h3>
              <p className="text-xs text-[#64748B]">
                Native Windows 64-bit Supply Chain Workstation
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
          {/* Metadata Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase tracking-wider block">
                Platform
              </span>
              <span className="text-xs font-semibold text-[#070B19] mt-0.5 block">
                Windows 10/11 x64
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase tracking-wider block">
                Package Format
              </span>
              <span className="text-xs font-semibold text-[#070B19] mt-0.5 block">
                NSIS Installer (.exe)
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase tracking-wider block">
                Download Size
              </span>
              <span className="text-xs font-semibold text-[#070B19] mt-0.5 block">
                {formatBytes(latestRelease.sizeBytes).split(' ')[0]} MB
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase tracking-wider block">
                Runtime
              </span>
              <span className="text-xs font-semibold text-[#070B19] mt-0.5 block">
                Tauri 2 + WebView2
              </span>
            </div>
          </div>

          {/* SHA-256 Checksum Card */}
          <div className="p-4 rounded-2xl bg-[#F1F5F9] border border-[#E2E8F0] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-[#475569] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#0284C7]" />
                <span>CRYPTOGRAPHIC SHA-256 CHECKSUM</span>
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
              {latestRelease.sha256}
            </div>
          </div>

          {/* Release Highlights */}
          {latestRelease.releaseNotes && latestRelease.releaseNotes.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-[#64748B]">
                Release Highlights (v{latestRelease.version})
              </h4>
              <ul className="space-y-2">
                {latestRelease.releaseNotes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-[#334155]">
                    <CheckCircle2 className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Direct Download Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <a
              href={latestRelease.downloadUrl}
              download={latestRelease.filename}
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#070B19] text-white font-semibold text-sm hover:bg-[#1E293B] shadow-lg transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#38BDF8]" />
              <span>Download {latestRelease.filename}</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>

          {/* Notice & Instructions */}
          <div className="p-3.5 rounded-2xl bg-[#EAF4FB] border border-[#BAE6FD] text-left text-xs text-[#0369A1] space-y-1">
            <div className="flex items-center gap-1.5 font-semibold">
              <Info className="w-3.5 h-3.5" />
              <span>Local Deployment Note</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#0c4a6e]">
              To run or install locally without internet access, launch <code className="font-mono bg-white/70 px-1 py-0.5 rounded">npm start</code> in the WebOS repository to serve the authentic package directly from <code className="font-mono bg-white/70 px-1 py-0.5 rounded">http://localhost:3000/downloads/Orion-9-Setup.exe</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

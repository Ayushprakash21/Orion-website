import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  FileText,
  Download,
  Trash2,
  Eye,
  Filter,
  Plus,
  ArrowUpRight,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Archive,
  RefreshCw,
  ExternalLink,
  Laptop,
  Apple,
  Smartphone,
  Layers,
  Sparkles,
  Info,
  Clock,
  HardDrive,
  Database,
  Hash,
  X,
} from 'lucide-react';
import { DEFAULT_DESKTOP_RELEASES } from '../../data/defaultSiteConfig.ts';
import type {
  AppReleaseRecord,
  ReleasePlatform,
  ReleasePackageFormat,
  ReleasePublicationStatus,
  ReleaseChannel,
} from '../../types/cms.ts';
import {
  getRegisteredReleases,
  uploadReleaseToStorage,
  publishApplicationRelease,
  unpublishApplicationRelease,
  rollbackApplicationRelease,
  deleteApplicationRelease,
  persistReleaseRecord,
  validateReleaseBinaryHeader,
  computeFileSha256,
  MAX_RELEASE_FILE_SIZE_BYTES,
  MAX_DESKTOP_RELEASE_SIZE_BYTES,
  MAX_MOBILE_RELEASE_SIZE_BYTES,
  PERMITTED_PLATFORM_EXTENSIONS,
  type UploadReleaseProgress,
} from '../../services/releaseService.ts';
import { useTheme } from '../../context/ThemeContext.tsx';

interface ReleaseManagementSectionProps {
  userEmail?: string;
  isAdmin: boolean;
  onNotification?: (type: 'success' | 'error' | 'warning', message: string) => void;
}

export const ReleaseManagementSection: React.FC<ReleaseManagementSectionProps> = ({
  userEmail = 'admin@orion-9.com',
  isAdmin,
  onNotification,
}) => {
  const { theme } = useTheme();
  const [releases, setReleases] = useState<AppReleaseRecord[]>(DEFAULT_DESKTOP_RELEASES);
  const [loading, setLoading] = useState(false);
  const [platformFilter, setPlatformFilter] = useState<'all' | 'windows' | 'macos' | 'android' | 'ios'>('all');
  const [channelFilter, setChannelFilter] = useState<'all' | ReleaseChannel>('all');
  const [copiedHashId, setCopiedHashId] = useState<string | null>(null);
  const [copiedUrlId, setCopiedUrlId] = useState<string | null>(null);

  // Upload Form State
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formProduct, setFormProduct] = useState('Orion-9');
  const [formPlatform, setFormPlatform] = useState<ReleasePlatform>('windows-x64');
  const [formVersion, setFormVersion] = useState('');
  const [formChannel, setFormChannel] = useState<ReleaseChannel>('stable');
  const [formMinOs, setFormMinOs] = useState('Windows 10 / 11 64-bit');
  const [formReleaseNotes, setFormReleaseNotes] = useState('');
  const [formExternalUrl, setFormExternalUrl] = useState('');
  const [publishOnUpload, setPublishOnUpload] = useState(false);

  // Upload & Verification Progress
  const [uploadProgress, setUploadProgress] = useState<UploadReleaseProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Selected Detail Modal
  const [selectedRelease, setSelectedRelease] = useState<AppReleaseRecord | null>(null);

  // Confirmation Modal
  const [confirmAction, setConfirmAction] = useState<{
    type: 'publish' | 'unpublish' | 'rollback' | 'delete';
    release: AppReleaseRecord;
  } | null>(null);
  const [isActionPending, setIsActionPending] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load releases on mount
  const refreshReleases = async () => {
    setLoading(true);
    try {
      const records = await getRegisteredReleases();
      setReleases(records);
    } catch (err: unknown) {
      if (onNotification) {
        onNotification('error', `Failed to load releases: ${(err as Error).message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshReleases();
  }, []);

  // Update default minimum OS when platform selection changes
  useEffect(() => {
    if (formPlatform.startsWith('windows')) {
      setFormMinOs('Windows 10 / 11 64-bit');
    } else if (formPlatform.startsWith('macos')) {
      setFormMinOs('macOS 12 Monterey or higher');
    } else if (formPlatform.startsWith('android')) {
      setFormMinOs('Android 10 (API Level 29) or higher');
    } else if (formPlatform.startsWith('ios')) {
      setFormMinOs('iOS 16.0 or higher');
    }
    // Reset file if it doesn't match new platform
    if (selectedFile) {
      validateReleaseBinaryHeader(selectedFile, formPlatform).then((res) => {
        if (!res.valid) {
          setSelectedFile(null);
          setValidationError(res.error || null);
        } else {
          setValidationError(null);
        }
      });
    }
  }, [formPlatform]);

  // Handle file change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValidationError(null);
    const check = await validateReleaseBinaryHeader(file, formPlatform);
    if (!check.valid) {
      setValidationError(check.error || 'Invalid file format.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    // Pre-populate version if filename has a version pattern like v9.1.0
    const match = file.name.match(/v?(\d+\.\d+\.\d+)/i);
    if (match && match[1] && !formVersion) {
      setFormVersion(match[1]);
    }
  };

  // Execute Upload
  const handleExecuteUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setValidationError('Please select a valid release binary to upload.');
      return;
    }
    if (!formVersion.trim()) {
      setValidationError('Please provide a release version number (e.g. 9.1.0).');
      return;
    }

    setIsUploading(true);
    setValidationError(null);

    try {
      const uploadRes = await uploadReleaseToStorage(
        selectedFile,
        {
          platform: formPlatform,
          version: formVersion.trim(),
          channel: formChannel,
          product: formProduct.trim(),
        },
        (progress) => {
          setUploadProgress(progress);
        }
      );

      const format: ReleasePackageFormat = selectedFile.name.endsWith('.exe')
        ? 'exe'
        : selectedFile.name.endsWith('.dmg')
          ? 'dmg'
          : selectedFile.name.endsWith('.apk')
            ? 'apk'
            : selectedFile.name.endsWith('.ipa')
              ? 'ipa'
              : selectedFile.name.endsWith('.msi')
                ? 'msi'
                : 'exe';

      const initialStatus: ReleasePublicationStatus = publishOnUpload ? 'published' : 'verified';
      const notesList = formReleaseNotes
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      const newRecord: AppReleaseRecord = {
        id: `rel-${formPlatform}-${formVersion.trim().replace(/\./g, '-')}-${Date.now().toString(36)}`,
        productId: formProduct.toLowerCase().replace(/\s+/g, '-'),
        productName: formProduct,
        version: formVersion.trim(),
        releaseDate: new Date().toISOString().slice(0, 10),
        platform: formPlatform,
        format,
        status: initialStatus,
        filename: uploadRes.filename,
        objectKey: uploadRes.key,
        sizeBytes: uploadRes.sizeBytes,
        sha256: uploadRes.sha256,
        downloadUrl: uploadRes.url,
        channel: formChannel,
        isLatest: publishOnUpload,
        releaseNotes: notesList.length > 0 ? notesList : [`Official release ${formVersion.trim()}`],
        minimumOs: formMinOs.trim(),
        downloadCount: 0,
        externalUrl: formExternalUrl.trim() || undefined,
        uploadedAt: uploadRes.uploadedAt,
        publishedAt: publishOnUpload ? new Date().toISOString() : undefined,
        createdBy: userEmail,
        publishedBy: publishOnUpload ? userEmail : undefined,
        preflightGates: {
          formatValidated: true,
          shaVerified: true,
          signatureChecked: true,
        },
      };

      const updatedListWithNew = [...releases.filter((r) => r.id !== newRecord.id), newRecord];
      setReleases(updatedListWithNew);

      if (publishOnUpload) {
        const publishRes = await publishApplicationRelease(
          newRecord.id,
          userEmail,
          updatedListWithNew
        );
        if (publishRes.success) {
          setReleases(publishRes.updatedList);
        } else {
          // If auto-publish failed, save as verified
          newRecord.status = 'verified';
          newRecord.isLatest = false;
          await persistReleaseRecord(newRecord, userEmail, updatedListWithNew);
        }
      } else {
        await persistReleaseRecord(newRecord, userEmail, releases);
      }

      try {
        const fresh = await getRegisteredReleases();
        if (fresh && fresh.length > 0 && fresh.some((r) => r.id === newRecord.id)) {
          setReleases(fresh);
        }
      } catch {
        // Keep updatedListWithNew
      }

      if (onNotification) {
        onNotification(
          'success',
          `Successfully uploaded and verified ${newRecord.filename} (SHA-256: ${newRecord.sha256.slice(0, 12)}...)`
        );
      }

      // Reset form
      setShowUploadForm(false);
      setSelectedFile(null);
      setFormVersion('');
      setFormReleaseNotes('');
      setFormExternalUrl('');
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: unknown) {
      setValidationError((err as Error).message);
      if (onNotification) {
        onNotification('error', `Upload failed: ${(err as Error).message}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Perform confirmed action
  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    setIsActionPending(true);

    try {
      const { type, release } = confirmAction;
      if (type === 'publish') {
        const res = await publishApplicationRelease(release.id, userEmail, releases);
        if (res.success) {
          setReleases(res.updatedList);
          if (onNotification) onNotification('success', `Published ${release.version} (${release.platform}) live.`);
        } else {
          if (onNotification) onNotification('error', res.error || 'Publish failed.');
        }
      } else if (type === 'unpublish') {
        const res = await unpublishApplicationRelease(release.id, userEmail, releases);
        if (res.success) {
          setReleases(res.updatedList);
          if (onNotification) onNotification('success', `Unpublished ${release.version}.`);
        } else {
          if (onNotification) onNotification('error', res.error || 'Unpublish failed.');
        }
      } else if (type === 'rollback') {
        const res = await rollbackApplicationRelease(release.id, userEmail, releases);
        if (res.success) {
          setReleases(res.updatedList);
          if (onNotification) onNotification('success', `Rolled back to v${release.version} (${release.platform}).`);
        } else {
          if (onNotification) onNotification('error', res.error || 'Rollback failed.');
        }
      } else if (type === 'delete') {
        const res = await deleteApplicationRelease(release.id, userEmail, releases);
        if (res.success) {
          setReleases(res.updatedList);
          if (onNotification) onNotification('success', `Deleted release ${release.filename}.`);
        } else {
          if (onNotification) onNotification('error', res.error || 'Delete failed.');
        }
      }
    } finally {
      setIsActionPending(false);
      setConfirmAction(null);
    }
  };

  const copyToClipboard = (text: string, type: 'hash' | 'url', id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      if (type === 'hash') {
        setCopiedHashId(id);
        setTimeout(() => setCopiedHashId(null), 2000);
      } else {
        setCopiedUrlId(id);
        setTimeout(() => setCopiedUrlId(null), 2000);
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes <= 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  // Filtered release rows
  const filteredReleases = releases.filter((r) => {
    if (platformFilter !== 'all') {
      if (platformFilter === 'windows' && !r.platform.startsWith('windows')) return false;
      if (platformFilter === 'macos' && !r.platform.startsWith('macos')) return false;
      if (platformFilter === 'android' && !r.platform.startsWith('android')) return false;
      if (platformFilter === 'ios' && !r.platform.startsWith('ios')) return false;
    }
    if (channelFilter !== 'all' && r.channel !== channelFilter) {
      return false;
    }
    return true;
  });

  const getPlatformIcon = (platform: ReleasePlatform) => {
    if (platform.startsWith('windows')) return <Laptop className="w-4 h-4 text-sky-500" />;
    if (platform.startsWith('macos')) return <Apple className="w-4 h-4 text-slate-800 dark:text-white" />;
    if (platform.startsWith('android')) return <Smartphone className="w-4 h-4 text-emerald-500" />;
    if (platform.startsWith('ios')) return <Smartphone className="w-4 h-4 text-indigo-500" />;
    return <Layers className="w-4 h-4 text-slate-500" />;
  };

  const getStatusBadge = (status: ReleasePublicationStatus) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            PUBLISHED
          </span>
        );
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#D4AF37]/15 text-[#F5D76E] border border-[#38301D]">
            <ShieldCheck className="w-3 h-3 shrink-0 text-[#D4AF37]" />
            VERIFIED
          </span>
        );
      case 'unverified':
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-950/60 text-amber-400 border border-amber-800">
            <Clock className="w-3 h-3 shrink-0" />
            UNVERIFIED
          </span>
        );
      case 'superseded':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#1B1B1B] text-[#D4AF37] border border-[#38301D]">
            <RotateCcw className="w-3 h-3 shrink-0 text-[#D4AF37]" />
            SUPERSEDED
          </span>
        );
      case 'archived':
      case 'retired':
      case 'disabled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#1B1B1B] text-[#737373] border border-[#292929]">
            <Archive className="w-3 h-3 shrink-0" />
            ARCHIVED
          </span>
        );
      case 'uploading':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#D4AF37]/20 text-[#F5D76E] border border-[#38301D]">
            <RefreshCw className="w-3 h-3 animate-spin shrink-0 text-[#D4AF37]" />
            UPLOADING
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-950/60 text-red-400 border border-red-800">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            FAILED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#1B1B1B] text-[#737373] border border-[#292929]">
            NOT UPLOADED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="liquid-glass-elevated rounded-3xl border border-[#292929] bg-[#141414] shadow-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#292929] pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#D4AF37]/15 text-[#F5D76E] border border-[#38301D]">
                DISTRIBUTION CONTROL PLANE
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                R2 DURABLE STORAGE
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#F5F5F5]">
              Release & Distribution Manager
            </h2>
            <p className="text-xs sm:text-sm text-[#A3A3A3] max-w-3xl">
              Publish, verify, replace and roll back official binaries for Windows (.exe), macOS (.dmg), Android (.apk), and iOS (.ipa). Binary files are stored securely in Cloudflare R2 with real cryptographic SHA-256 integrity hashes. Maximum permitted release file size: 250 MB.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={refreshReleases}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#292929] bg-[#1B1B1B] text-xs font-semibold text-[#F5F5F5] hover:bg-[#222222] hover:border-[#38301D] transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] hover:brightness-105 text-[#080808] text-xs font-bold transition-all shadow-[0_4px_16px_rgba(212,175,55,0.25)] cursor-pointer"
            >
              {showUploadForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{showUploadForm ? 'Close Form' : 'Upload New Release'}</span>
            </button>
          </div>
        </div>

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5">
          <div className="p-3.5 rounded-2xl bg-[#101010] border border-[#292929] shadow-2xs">
            <div className="text-[10px] font-mono uppercase font-bold text-[#A3A3A3]">Total Releases</div>
            <div className="text-xl font-bold text-[#F5F5F5] mt-0.5">{releases.length}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#101010] border border-emerald-900/40 shadow-2xs">
            <div className="text-[10px] font-mono uppercase font-bold text-emerald-400">Published Active</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">
              {releases.filter((r) => r.status === 'published').length}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#101010] border border-[#38301D] shadow-2xs">
            <div className="text-[10px] font-mono uppercase font-bold text-[#F5D76E]">Verified Staged</div>
            <div className="text-xl font-bold text-[#F5D76E] mt-0.5">
              {releases.filter((r) => r.status === 'verified').length}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#101010] border border-[#292929] shadow-2xs">
            <div className="text-[10px] font-mono uppercase font-bold text-[#D4AF37]">Mobile (.apk / .ipa)</div>
            <div className="text-xl font-bold text-[#F5F5F5] mt-0.5">
              {releases.filter((r) => r.format === 'apk' || r.format === 'ipa').length}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION B: UPLOAD RELEASE FORM */}
      {showUploadForm && (
        <form
          onSubmit={handleExecuteUpload}
          className="liquid-glass-elevated rounded-3xl border border-[#38301D] bg-[#141414] shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-[#292929] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/15 flex items-center justify-center text-[#F5D76E] border border-[#38301D]">
                <UploadCloud className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F5F5F5]">Upload & Distribute New Release</h3>
                <p className="text-xs text-[#A3A3A3]">
                  Select target platform (Windows, macOS, Android, iOS), provide version and notes, and stream genuine binary to Cloudflare R2. Max size: 250 MB.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowUploadForm(false)}
              className="p-1.5 rounded-lg text-[#737373] hover:text-[#F5F5F5] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {validationError && (
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/60 flex items-start justify-between gap-3 text-red-300 text-xs">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <div className="space-y-1">
                  <span className="font-bold">Release Upload Notice:</span>
                  <div className="text-[11px] leading-relaxed break-words">{validationError}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setValidationError(null)}
                className="text-[11px] font-semibold text-red-400 hover:underline shrink-0 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Primary Platform Target Picker Cards */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#F5F5F5]">
              Select Target Platform *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Windows */}
              <button
                type="button"
                onClick={() => setFormPlatform('windows-x64')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  formPlatform.startsWith('windows')
                    ? 'bg-[#D4AF37]/15 border-[#D4AF37] ring-2 ring-[#D4AF37]/30 text-[#F5D76E]'
                    : 'bg-[#101010] border-[#292929] text-[#A3A3A3] hover:border-[#38301D] hover:text-[#F5F5F5]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Laptop className={`w-5 h-5 ${formPlatform.startsWith('windows') ? 'text-[#F5D76E]' : 'text-[#737373]'}`} />
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#1B1B1B] text-[#A3A3A3] border border-[#292929] font-bold">
                    .exe
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-[#F5F5F5]">Windows Desktop</div>
                  <div className="text-[10px] text-[#737373]">x64 & ARM64 binaries</div>
                </div>
              </button>

              {/* macOS */}
              <button
                type="button"
                onClick={() => setFormPlatform('macos-universal')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  formPlatform.startsWith('macos')
                    ? 'bg-[#D4AF37]/15 border-[#D4AF37] ring-2 ring-[#D4AF37]/30 text-[#F5D76E]'
                    : 'bg-[#101010] border-[#292929] text-[#A3A3A3] hover:border-[#38301D] hover:text-[#F5F5F5]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Apple className={`w-5 h-5 ${formPlatform.startsWith('macos') ? 'text-[#F5D76E]' : 'text-[#737373]'}`} />
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#1B1B1B] text-[#A3A3A3] border border-[#292929] font-bold">
                    .dmg
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-[#F5F5F5]">macOS Desktop</div>
                  <div className="text-[10px] text-[#737373]">Universal & Apple Silicon</div>
                </div>
              </button>

              {/* Android */}
              <button
                type="button"
                onClick={() => setFormPlatform('android-universal')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  formPlatform.startsWith('android')
                    ? 'bg-[#D4AF37]/15 border-[#D4AF37] ring-2 ring-[#D4AF37]/30 text-[#F5D76E]'
                    : 'bg-[#101010] border-[#292929] text-[#A3A3A3] hover:border-[#38301D] hover:text-[#F5F5F5]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Smartphone className={`w-5 h-5 ${formPlatform.startsWith('android') ? 'text-[#F5D76E]' : 'text-[#737373]'}`} />
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#1B1B1B] text-[#A3A3A3] border border-[#292929] font-bold">
                    .apk
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-[#F5F5F5] flex items-center gap-1">
                    Android APK
                  </div>
                  <div className="text-[10px] text-[#737373]">Universal & ARM64 package</div>
                </div>
              </button>

              {/* iOS */}
              <button
                type="button"
                onClick={() => setFormPlatform('ios-universal')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  formPlatform.startsWith('ios')
                    ? 'bg-[#D4AF37]/15 border-[#D4AF37] ring-2 ring-[#D4AF37]/30 text-[#F5D76E]'
                    : 'bg-[#101010] border-[#292929] text-[#A3A3A3] hover:border-[#38301D] hover:text-[#F5F5F5]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Smartphone className={`w-5 h-5 ${formPlatform.startsWith('ios') ? 'text-[#F5D76E]' : 'text-[#737373]'}`} />
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#1B1B1B] text-[#A3A3A3] border border-[#292929] font-bold">
                    .ipa
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-[#F5F5F5]">iOS Package</div>
                  <div className="text-[10px] text-[#737373]">Device & TestFlight IPA</div>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Architecture / Package Variant */}
            <div>
              <label className="block text-xs font-bold text-[#F5F5F5] mb-1.5">
                Target Architecture & Variant *
              </label>
              <select
                value={formPlatform}
                onChange={(e) => setFormPlatform(e.target.value as ReleasePlatform)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#101010] border border-[#292929] text-xs font-semibold text-[#F5F5F5] cursor-pointer focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
              >
                <optgroup label="Windows Desktop (.exe / .msi)">
                  <option value="windows-x64">Windows 64-bit (x64) — .exe / .msi</option>
                  <option value="windows-arm64">Windows ARM64 — .exe / .msi</option>
                </optgroup>
                <optgroup label="macOS Desktop (.dmg / .pkg)">
                  <option value="macos-universal">macOS Universal (Apple Silicon & Intel) — .dmg / .pkg</option>
                  <option value="macos-arm64">macOS Apple Silicon (M1-M4) — .dmg / .pkg</option>
                  <option value="macos-x64">macOS Intel (x86_64) — .dmg / .pkg</option>
                </optgroup>
                <optgroup label="Android Mobile (.apk)">
                  <option value="android-universal">Android Universal — .apk</option>
                  <option value="android-arm64">Android ARM64-v8a — .apk</option>
                </optgroup>
                <optgroup label="iOS Mobile (.ipa)">
                  <option value="ios-universal">iOS Universal — .ipa</option>
                  <option value="ios-arm64">iOS ARM64 (Device) — .ipa</option>
                </optgroup>
              </select>
            </div>

            {/* Version Input */}
            <div>
              <label className="block text-xs font-bold text-[#F5F5F5] mb-1.5">
                Semantic Version *
              </label>
              <input
                type="text"
                value={formVersion}
                onChange={(e) => setFormVersion(e.target.value)}
                placeholder="e.g. 9.1.0"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#101010] border border-[#292929] text-xs font-mono font-semibold text-[#F5F5F5] placeholder:text-[#737373] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
              />
            </div>

            {/* Release Channel */}
            <div>
              <label className="block text-xs font-bold text-[#F5F5F5] mb-1.5">
                Release Channel *
              </label>
              <select
                value={formChannel}
                onChange={(e) => setFormChannel(e.target.value as ReleaseChannel)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#101010] border border-[#292929] text-xs font-semibold text-[#F5F5F5] cursor-pointer focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
              >
                <option value="stable">Stable (Production Public Distribution)</option>
                <option value="beta">Beta (Preview & Community Testing)</option>
                <option value="internal">Internal (Dev & QA Engineers Only)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Minimum Supported OS */}
            <div>
              <label className="block text-xs font-bold text-[#F5F5F5] mb-1.5">
                Minimum Supported OS Requirement
              </label>
              <input
                type="text"
                value={formMinOs}
                onChange={(e) => setFormMinOs(e.target.value)}
                placeholder="e.g. Windows 10 / 11 64-bit"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#101010] border border-[#292929] text-xs font-medium text-[#F5F5F5] placeholder:text-[#737373] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
              />
            </div>

            {/* External URL (TestFlight / App Store / Play Store) */}
            <div>
              <label className="block text-xs font-bold text-[#F5F5F5] mb-1.5">
                External Distribution URL (App Store / TestFlight / Play Store)
              </label>
              <input
                type="url"
                value={formExternalUrl}
                onChange={(e) => setFormExternalUrl(e.target.value)}
                placeholder="https://testflight.apple.com/join/... or https://play.google.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#101010] border border-[#292929] text-xs font-medium text-[#F5F5F5] placeholder:text-[#737373] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
              />
            </div>
          </div>

          {/* Release Notes */}
          <div>
            <label className="block text-xs font-bold text-[#F5F5F5] mb-1.5">
              Release Notes (one bullet point per line)
            </label>
            <textarea
              rows={3}
              value={formReleaseNotes}
              onChange={(e) => setFormReleaseNotes(e.target.value)}
              placeholder="Added hardware acceleration for Apple Silicon M4&#10;Integrated zero-trust edge streaming&#10;Security patch for telemetry transport"
              className="w-full px-3.5 py-2 rounded-xl bg-[#101010] border border-[#292929] text-xs font-medium text-[#F5F5F5] placeholder:text-[#737373] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
            />
          </div>

          {/* Drag & Drop Binary File Upload Well */}
          <div>
            <label className="block text-xs font-bold text-[#F5F5F5] mb-1.5">
              Release Binary File *
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                selectedFile
                  ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                  : 'border-[#292929] hover:border-[#38301D] bg-[#101010]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={(PERMITTED_PLATFORM_EXTENSIONS[formPlatform] || []).join(',')}
                onChange={handleFileChange}
              />

              {selectedFile ? (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 text-[#F5D76E] border border-[#38301D] flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-[#F5F5F5]">{selectedFile.name}</div>
                  <div className="text-[11px] text-[#A3A3A3] font-mono">
                    Size: {formatFileSize(selectedFile.size)} · Type: {selectedFile.type || 'binary/octet-stream'}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-[11px] text-red-400 hover:underline pt-1 font-semibold cursor-pointer"
                  >
                    Remove and choose another file
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <UploadCloud className="w-8 h-8 text-[#D4AF37]" />
                  <div className="text-xs font-semibold text-[#F5F5F5]">
                    Click to browse or drag & drop the official installer binary here
                  </div>
                  <div className="text-[11px] text-[#737373]">
                    Permitted for {formPlatform}:{' '}
                    <span className="font-mono font-bold text-[#F5D76E]">
                      {(PERMITTED_PLATFORM_EXTENSIONS[formPlatform] || []).join(' or ')}
                    </span>{' '}
                    · Max size: 250 MB (250 MiB)
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Upload Progress Bar */}
          {uploadProgress && (
            <div className="p-4 rounded-2xl bg-[#101010] border border-[#292929] space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="capitalize text-[#F5D76E] font-bold">
                  {uploadProgress.detail || (
                    <>
                      {uploadProgress.stage === 'validating' && 'Validating Binary Header & Platform Format...'}
                      {uploadProgress.stage === 'hashing' && 'Calculating Client SHA-256 Checksum...'}
                      {uploadProgress.stage === 'initializing' && 'Initializing Cloudflare R2 Upload Session...'}
                      {uploadProgress.stage === 'uploading' && 'Streaming Binary Chunks to Cloudflare R2...'}
                      {uploadProgress.stage === 'assembling' && 'Assembling & Finalizing R2 Release Artifact...'}
                      {uploadProgress.stage === 'verifying' && 'Verifying Integrity & Magic Headers in R2...'}
                      {uploadProgress.stage === 'completed' && 'Upload & Integrity Verification Complete!'}
                    </>
                  )}
                </span>
                <span className="font-mono text-[#F5D76E] font-bold">{uploadProgress.pct}%</span>
              </div>
              <div className="w-full bg-[#1B1B1B] rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress.pct}%` }}
                />
              </div>
              {uploadProgress.loadedBytes > 0 && uploadProgress.totalBytes > 0 && (
                <div className="flex items-center justify-between text-[11px] text-[#A3A3A3] font-mono">
                  <span>
                    Transferred: {formatFileSize(uploadProgress.loadedBytes)} / {formatFileSize(uploadProgress.totalBytes)}
                    {uploadProgress.currentPart && uploadProgress.totalParts ? ` · Part ${uploadProgress.currentPart}/${uploadProgress.totalParts}` : ''}
                  </span>
                  <span className="uppercase font-bold tracking-wider text-[10px] text-[#D4AF37]">{uploadProgress.stage}</span>
                </div>
              )}
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={publishOnUpload}
                onChange={(e) => setPublishOnUpload(e.target.checked)}
                className="w-4 h-4 rounded text-[#D4AF37] accent-[#D4AF37] focus:ring-[#D4AF37]"
              />
              <span className="text-xs font-medium text-[#A3A3A3]">
                Publish immediately on successful verification (replaces previous live release)
              </span>
            </label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                disabled={isUploading}
                className="px-4 py-2.5 rounded-xl border border-[#292929] bg-[#1B1B1B] text-xs font-semibold text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#222222] cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isUploading || !selectedFile}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] hover:brightness-105 disabled:opacity-50 text-[#080808] text-xs font-bold transition-all shadow-[0_4px_16px_rgba(212,175,55,0.25)] cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Release...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload & Verify Binary</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* SECTION A: RELEASES OVERVIEW TABLE */}
      <div className="liquid-glass-elevated rounded-3xl border border-[#292929] bg-[#141414] shadow-2xl p-6 sm:p-8 space-y-5">
        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#292929] pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#A3A3A3] mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-[#D4AF37]" /> Filter:
            </span>
            {(['all', 'windows', 'macos', 'android', 'ios'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlatformFilter(p)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                  platformFilter === p
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] text-[#080808] font-bold shadow-[0_2px_8px_rgba(212,175,55,0.25)]'
                    : 'bg-[#101010] text-[#A3A3A3] border border-[#292929] hover:text-[#F5F5F5] hover:bg-[#1B1B1B]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#A3A3A3]">Channel:</span>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value as any)}
              className="px-2.5 py-1 rounded-xl bg-[#101010] border border-[#292929] text-xs font-semibold text-[#F5F5F5] cursor-pointer focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
            >
              <option value="all">All Channels</option>
              <option value="stable">Stable</option>
              <option value="beta">Beta</option>
              <option value="internal">Internal</option>
            </select>
          </div>
        </div>

        {/* Table or Cards */}
        {loading && releases.length === 0 ? (
          <div className="py-12 text-center text-xs font-mono text-[#A3A3A3] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" />
            <span>LOADING REGISTERED APPLICATION RELEASES...</span>
          </div>
        ) : filteredReleases.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#A3A3A3] space-y-2">
            <HardDrive className="w-8 h-8 text-[#737373] mx-auto" />
            <div className="font-semibold text-[#F5F5F5]">No releases found matching criteria</div>
            <p className="text-[11px] text-[#737373]">Upload a new release using the button above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#292929] text-[#A3A3A3] uppercase text-[10px] font-mono tracking-wider">
                  <th className="py-3 px-3 font-bold">Product & Platform</th>
                  <th className="py-3 px-3 font-bold">Version & Channel</th>
                  <th className="py-3 px-3 font-bold">Format / Size</th>
                  <th className="py-3 px-3 font-bold">Status</th>
                  <th className="py-3 px-3 font-bold">SHA-256 Integrity</th>
                  <th className="py-3 px-3 font-bold">Updated By</th>
                  <th className="py-3 px-3 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#292929]">
                {filteredReleases.map((rel) => (
                  <tr
                    key={rel.id}
                    className="hover:bg-[#1B1B1B] transition-colors group"
                  >
                    {/* Platform & Product */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#1B1B1B] border border-[#292929] flex items-center justify-center shrink-0">
                          {getPlatformIcon(rel.platform)}
                        </div>
                        <div>
                          <div className="font-bold text-[#F5F5F5]">
                            {rel.productName || 'Orion-9'}
                          </div>
                          <div className="text-[11px] text-[#737373] font-mono">
                            {rel.platform}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Version & Channel */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-[#F5F5F5] text-xs">
                          v{rel.version}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            rel.channel === 'stable'
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                              : rel.channel === 'beta'
                                ? 'bg-amber-950/60 text-amber-300 border border-amber-800'
                                : 'bg-[#1B1B1B] text-[#A3A3A3] border border-[#292929]'
                          }`}
                        >
                          {rel.channel}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#737373] font-mono mt-0.5">
                        {rel.publishedAt ? new Date(rel.publishedAt).toLocaleDateString() : rel.releaseDate}
                      </div>
                    </td>

                    {/* Format / Size */}
                    <td className="py-3.5 px-3">
                      <div className="font-bold uppercase text-[#F5F5F5] font-mono">
                        .{rel.format}
                      </div>
                      <div className="text-[11px] text-[#A3A3A3] font-mono">
                        {formatFileSize(rel.sizeBytes)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">{getStatusBadge(rel.status)}</td>

                    {/* SHA-256 */}
                    <td className="py-3.5 px-3">
                      {rel.sha256 ? (
                        <div className="flex items-center gap-1.5">
                          <code className="text-[10px] font-mono text-[#D4AF37] bg-[#101010] px-2 py-0.5 rounded border border-[#38301D] max-w-[120px] truncate">
                            {rel.sha256.slice(0, 10)}...{rel.sha256.slice(-6)}
                          </code>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(rel.sha256, 'hash', rel.id)}
                            className="p-1 rounded text-[#737373] hover:text-[#D4AF37] cursor-pointer"
                            title="Copy full SHA-256 hash"
                          >
                            {copiedHashId === rel.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#737373] italic">No hash</span>
                      )}
                    </td>

                    {/* Updated By */}
                    <td className="py-3.5 px-3 text-[11px] text-[#737373] font-mono truncate max-w-[130px]">
                      {rel.updatedBy || rel.createdBy || 'System'}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Details */}
                        <button
                          type="button"
                          onClick={() => setSelectedRelease(rel)}
                          className="p-1.5 rounded-lg border border-[#292929] bg-[#1B1B1B] text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#222222] cursor-pointer"
                          title="View release details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Copy Download URL */}
                        {rel.downloadUrl && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(rel.downloadUrl, 'url', rel.id)}
                            className="p-1.5 rounded-lg border border-[#292929] bg-[#1B1B1B] text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#222222] cursor-pointer"
                            title="Copy download URL"
                          >
                            {copiedUrlId === rel.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}

                        {/* Publish Action (for verified / draft / superseded) */}
                        {rel.status !== 'published' && isAdmin && (
                          <button
                            type="button"
                            onClick={() => setConfirmAction({ type: 'publish', release: rel })}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer"
                          >
                            Publish
                          </button>
                        )}

                        {/* Unpublish Action */}
                        {rel.status === 'published' && isAdmin && (
                          <button
                            type="button"
                            onClick={() => setConfirmAction({ type: 'unpublish', release: rel })}
                            className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold cursor-pointer"
                          >
                            Unpublish
                          </button>
                        )}

                        {/* Rollback Action (for superseded releases) */}
                        {rel.status === 'superseded' && isAdmin && (
                          <button
                            type="button"
                            onClick={() => setConfirmAction({ type: 'rollback', release: rel })}
                            className="px-2.5 py-1 rounded-lg bg-[#D4AF37]/20 border border-[#38301D] text-[#F5D76E] hover:bg-[#D4AF37]/30 text-[11px] font-bold cursor-pointer"
                            title="Roll back distribution to this release"
                          >
                            Rollback
                          </button>
                        )}

                        {/* Delete Action (only permitted if not currently published) */}
                        {rel.status !== 'published' && isAdmin && (
                          <button
                            type="button"
                            onClick={() => setConfirmAction({ type: 'delete', release: rel })}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-800/40 cursor-pointer"
                            title="Delete release record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedRelease && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#141414] rounded-3xl border border-[#292929] max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#292929] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1B1B1B] border border-[#292929] flex items-center justify-center">
                  {getPlatformIcon(selectedRelease.platform)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F5F5F5]">
                    {selectedRelease.productName} v{selectedRelease.version}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#737373]">
                    <span>{selectedRelease.platform}</span>
                    <span>·</span>
                    <span>{selectedRelease.format.toUpperCase()}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRelease(null)}
                className="p-2 rounded-xl text-[#737373] hover:text-[#F5F5F5] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#101010] border border-[#292929]">
                  <div className="text-[10px] font-mono font-bold text-[#737373] uppercase">Status</div>
                  <div className="mt-1">{getStatusBadge(selectedRelease.status)}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#101010] border border-[#292929]">
                  <div className="text-[10px] font-mono font-bold text-[#737373] uppercase">Package Size</div>
                  <div className="font-mono font-bold text-[#F5F5F5] mt-1">
                    {formatFileSize(selectedRelease.sizeBytes)} ({selectedRelease.sizeBytes.toLocaleString()} bytes)
                  </div>
                </div>
              </div>

              {/* SHA-256 Box */}
              <div className="p-3.5 rounded-xl bg-[#101010] text-[#F5F5F5] space-y-1.5 border border-[#38301D]">
                <div className="flex items-center justify-between text-[11px] text-[#A3A3A3]">
                  <span className="font-bold flex items-center gap-1.5 text-[#F5D76E]">
                    <Hash className="w-3.5 h-3.5 text-[#D4AF37]" /> Verified Cryptographic SHA-256
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedRelease.sha256, 'hash', selectedRelease.id)}
                    className="inline-flex items-center gap-1 text-[10px] font-mono text-[#D4AF37] hover:underline cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Hash</span>
                  </button>
                </div>
                <div className="font-mono text-[11px] text-[#F5F5F5] break-all bg-[#080808] border border-[#292929] p-2.5 rounded-lg select-all">
                  {selectedRelease.sha256}
                </div>
              </div>

              {/* Download URL Box */}
              <div className="p-3.5 rounded-xl bg-[#101010] border border-[#292929] space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#F5F5F5]">Authoritative CDN Streaming URL</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedRelease.downloadUrl, 'url', selectedRelease.id)}
                    className="inline-flex items-center gap-1 text-[10px] font-mono text-[#D4AF37] hover:underline cursor-pointer font-bold"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy URL</span>
                  </button>
                </div>
                <div className="font-mono text-[11px] text-[#A3A3A3] break-all select-all">
                  {selectedRelease.downloadUrl}
                </div>
              </div>

              {/* Release Notes */}
              {selectedRelease.releaseNotes && selectedRelease.releaseNotes.length > 0 && (
                <div className="space-y-1.5">
                  <div className="font-bold text-[#F5F5F5]">Release Notes:</div>
                  <ul className="list-disc list-inside space-y-1 text-[#A3A3A3] pl-1">
                    {selectedRelease.releaseNotes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* External URL if present */}
              {selectedRelease.externalUrl && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="font-bold text-[#F5F5F5]">External Store:</span>
                  <a
                    href={selectedRelease.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#D4AF37] hover:underline inline-flex items-center gap-1 font-mono font-bold"
                  >
                    <span>{selectedRelease.externalUrl}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRelease(null)}
                className="px-4 py-2 rounded-xl bg-[#1B1B1B] text-[#F5F5F5] border border-[#292929] text-xs font-semibold hover:bg-[#222222] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#141414] rounded-3xl border border-[#292929] max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  confirmAction.type === 'delete'
                    ? 'bg-red-950/60 text-red-400 border border-red-800'
                    : confirmAction.type === 'publish'
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                      : 'bg-amber-950/60 text-amber-400 border border-amber-800'
                }`}
              >
                {confirmAction.type === 'delete' ? (
                  <Trash2 className="w-5 h-5" />
                ) : confirmAction.type === 'publish' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F5F5F5] capitalize">
                  {confirmAction.type === 'rollback'
                    ? 'Confirm Rollback'
                    : `${confirmAction.type} Release`}
                </h3>
                <div className="text-xs text-[#737373] font-mono">
                  {confirmAction.release.filename} (v{confirmAction.release.version})
                </div>
              </div>
            </div>

            <p className="text-xs text-[#A3A3A3] leading-relaxed">
              {confirmAction.type === 'publish' && (
                <>
                  Are you sure you want to publish <strong className="text-[#F5F5F5]">v{confirmAction.release.version}</strong>? This will immediately make it the active production distribution for <strong className="text-[#F5F5F5]">{confirmAction.release.platform}</strong>, and mark any previous active release as superseded.
                </>
              )}
              {confirmAction.type === 'unpublish' && (
                <>
                  Are you sure you want to unpublish <strong className="text-[#F5F5F5]">v{confirmAction.release.version}</strong>? Public users will no longer be able to download this version from the website until another release is published.
                </>
              )}
              {confirmAction.type === 'rollback' && (
                <>
                  Are you sure you want to roll back the distribution to <strong className="text-[#F5F5F5]">v{confirmAction.release.version}</strong>? It will become the live published release for <strong className="text-[#F5F5F5]">{confirmAction.release.platform}</strong>.
                </>
              )}
              {confirmAction.type === 'delete' && (
                <>
                  Are you sure you want to delete the release record for <strong className="text-[#F5F5F5]">{confirmAction.release.filename}</strong>? This cannot be undone.
                </>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                disabled={isActionPending}
                className="px-4 py-2 rounded-xl border border-[#292929] bg-[#1B1B1B] text-xs font-semibold text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#222222] cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={isActionPending}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                  confirmAction.type === 'delete'
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : confirmAction.type === 'publish'
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] text-[#080808] font-bold shadow-[0_2px_8px_rgba(212,175,55,0.25)]'
                      : 'bg-[#1B1B1B] border border-[#292929] text-[#F5F5F5] hover:bg-[#222222]'
                }`}
              >
                {isActionPending ? 'Processing...' : `Confirm ${confirmAction.type}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

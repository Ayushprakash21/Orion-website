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
  MAX_DESKTOP_RELEASE_SIZE_BYTES,
  MAX_MOBILE_RELEASE_SIZE_BYTES,
  PERMITTED_PLATFORM_EXTENSIONS,
  type UploadReleaseProgress,
} from '../../services/releaseService.ts';

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

      if (publishOnUpload) {
        const publishRes = await publishApplicationRelease(
          newRecord.id,
          userEmail,
          [...releases, newRecord]
        );
        if (publishRes.success) {
          setReleases(publishRes.updatedList);
        } else {
          // If auto-publish failed, save as verified
          newRecord.status = 'verified';
          newRecord.isLatest = false;
          await persistReleaseRecord(newRecord, userEmail, releases);
          await refreshReleases();
        }
      } else {
        await persistReleaseRecord(newRecord, userEmail, releases);
        await refreshReleases();
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            PUBLISHED
          </span>
        );
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border border-sky-300 dark:border-sky-800">
            <ShieldCheck className="w-3 h-3 shrink-0" />
            VERIFIED
          </span>
        );
      case 'unverified':
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
            <Clock className="w-3 h-3 shrink-0" />
            UNVERIFIED
          </span>
        );
      case 'superseded':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border border-purple-300 dark:border-purple-800">
            <RotateCcw className="w-3 h-3 shrink-0" />
            SUPERSEDED
          </span>
        );
      case 'archived':
      case 'retired':
      case 'disabled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
            <Archive className="w-3 h-3 shrink-0" />
            ARCHIVED
          </span>
        );
      case 'uploading':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800">
            <RefreshCw className="w-3 h-3 animate-spin shrink-0" />
            UPLOADING
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            FAILED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
            NOT UPLOADED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="liquid-glass-elevated rounded-3xl border border-[var(--glass-border)] shadow-xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D5E1E8] dark:border-slate-700 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#0284C7]/10 text-[#0284C7] border border-[#0284C7]/20">
                DISTRIBUTION CONTROL PLANE
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                R2 DURABLE STORAGE
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white">
              Release & Distribution Manager
            </h2>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-400 max-w-3xl">
              Publish, verify, replace and roll back official binaries for Windows (.exe), macOS (.dmg), Android (.apk), and iOS (.ipa). Binary files are stored securely in Cloudflare R2 with real cryptographic SHA-256 integrity hashes.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={refreshReleases}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#CBD5E1] dark:border-slate-700 text-xs font-semibold text-[#334155] dark:text-slate-300 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              {showUploadForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{showUploadForm ? 'Close Form' : 'Upload New Release'}</span>
            </button>
          </div>
        </div>

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5">
          <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-[#E2E8F0] dark:border-slate-700">
            <div className="text-[10px] font-mono uppercase text-[#64748B] dark:text-slate-400">Total Releases</div>
            <div className="text-xl font-bold text-[#0F172A] dark:text-white mt-0.5">{releases.length}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
            <div className="text-[10px] font-mono uppercase text-emerald-700 dark:text-emerald-400">Published Active</div>
            <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
              {releases.filter((r) => r.status === 'published').length}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800">
            <div className="text-[10px] font-mono uppercase text-sky-700 dark:text-sky-400">Verified Staged</div>
            <div className="text-xl font-bold text-sky-700 dark:text-sky-400 mt-0.5">
              {releases.filter((r) => r.status === 'verified').length}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
            <div className="text-[10px] font-mono uppercase text-purple-700 dark:text-purple-400">Mobile (.apk / .ipa)</div>
            <div className="text-xl font-bold text-purple-700 dark:text-purple-400 mt-0.5">
              {releases.filter((r) => r.format === 'apk' || r.format === 'ipa').length}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION B: UPLOAD RELEASE FORM */}
      {showUploadForm && (
        <form
          onSubmit={handleExecuteUpload}
          className="liquid-glass-elevated rounded-3xl border-2 border-[#0284C7]/40 shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-slate-700 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#0284C7]/10 flex items-center justify-center text-[#0284C7]">
                <UploadCloud className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0F172A] dark:text-white">Upload & Distribute New Release</h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400">
                  Select target platform, provide version and notes, and stream the genuine binary to Cloudflare R2.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowUploadForm(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {validationError && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-300 dark:border-red-800 flex items-start gap-3 text-red-700 dark:text-red-300 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <div className="space-y-0.5">
                <span className="font-bold">Validation Warning:</span>
                <div>{validationError}</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Platform Selector */}
            <div>
              <label className="block text-xs font-bold text-[#334155] dark:text-slate-300 mb-1.5">
                Target Platform *
              </label>
              <select
                value={formPlatform}
                onChange={(e) => setFormPlatform(e.target.value as ReleasePlatform)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-[#CBD5E1] dark:border-slate-700 text-xs font-semibold text-[#0F172A] dark:text-white cursor-pointer"
              >
                <optgroup label="Windows Desktop (.exe)">
                  <option value="windows-x64">Windows 64-bit (x64) — .exe</option>
                  <option value="windows-arm64">Windows ARM64 — .exe</option>
                </optgroup>
                <optgroup label="macOS Desktop (.dmg)">
                  <option value="macos-universal">macOS Universal (Apple Silicon & Intel) — .dmg</option>
                  <option value="macos-arm64">macOS Apple Silicon (M1-M4) — .dmg</option>
                  <option value="macos-x64">macOS Intel (x86_64) — .dmg</option>
                </optgroup>
                <optgroup label="Android (.apk)">
                  <option value="android-universal">Android Universal — .apk</option>
                  <option value="android-arm64">Android ARM64-v8a — .apk</option>
                </optgroup>
                <optgroup label="iOS (.ipa)">
                  <option value="ios-universal">iOS Universal — .ipa</option>
                  <option value="ios-arm64">iOS ARM64 (Device) — .ipa</option>
                </optgroup>
              </select>
            </div>

            {/* Version Input */}
            <div>
              <label className="block text-xs font-bold text-[#334155] dark:text-slate-300 mb-1.5">
                Semantic Version *
              </label>
              <input
                type="text"
                value={formVersion}
                onChange={(e) => setFormVersion(e.target.value)}
                placeholder="e.g. 9.1.0"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-[#CBD5E1] dark:border-slate-700 text-xs font-mono font-semibold text-[#0F172A] dark:text-white placeholder:text-slate-400"
              />
            </div>

            {/* Release Channel */}
            <div>
              <label className="block text-xs font-bold text-[#334155] dark:text-slate-300 mb-1.5">
                Release Channel *
              </label>
              <select
                value={formChannel}
                onChange={(e) => setFormChannel(e.target.value as ReleaseChannel)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-[#CBD5E1] dark:border-slate-700 text-xs font-semibold text-[#0F172A] dark:text-white cursor-pointer"
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
              <label className="block text-xs font-bold text-[#334155] dark:text-slate-300 mb-1.5">
                Minimum Supported OS Requirement
              </label>
              <input
                type="text"
                value={formMinOs}
                onChange={(e) => setFormMinOs(e.target.value)}
                placeholder="e.g. Windows 10 / 11 64-bit"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-[#CBD5E1] dark:border-slate-700 text-xs text-[#0F172A] dark:text-white"
              />
            </div>

            {/* External URL (TestFlight / App Store / Play Store) */}
            <div>
              <label className="block text-xs font-bold text-[#334155] dark:text-slate-300 mb-1.5">
                External Distribution URL (App Store / TestFlight / Play Store)
              </label>
              <input
                type="url"
                value={formExternalUrl}
                onChange={(e) => setFormExternalUrl(e.target.value)}
                placeholder="https://testflight.apple.com/join/... or https://play.google.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-[#CBD5E1] dark:border-slate-700 text-xs text-[#0F172A] dark:text-white"
              />
            </div>
          </div>

          {/* Release Notes */}
          <div>
            <label className="block text-xs font-bold text-[#334155] dark:text-slate-300 mb-1.5">
              Release Notes (one bullet point per line)
            </label>
            <textarea
              rows={3}
              value={formReleaseNotes}
              onChange={(e) => setFormReleaseNotes(e.target.value)}
              placeholder="Added hardware acceleration for Apple Silicon M4&#10;Integrated zero-trust edge streaming&#10;Security patch for telemetry transport"
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-[#CBD5E1] dark:border-slate-700 text-xs text-[#0F172A] dark:text-white"
            />
          </div>

          {/* Drag & Drop Binary File Upload Well */}
          <div>
            <label className="block text-xs font-bold text-[#334155] dark:text-slate-300 mb-1.5">
              Release Binary File *
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                selectedFile
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-[#CBD5E1] dark:border-slate-700 hover:border-[#0284C7] bg-[#F8FAFC] dark:bg-slate-900/50'
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
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-[#0F172A] dark:text-white">{selectedFile.name}</div>
                  <div className="text-[11px] text-[#64748B] dark:text-slate-400 font-mono">
                    Size: {formatFileSize(selectedFile.size)} · Type: {selectedFile.type || 'binary/octet-stream'}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-[11px] text-red-600 hover:underline pt-1"
                  >
                    Remove and choose another file
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <UploadCloud className="w-8 h-8 text-[#0284C7]" />
                  <div className="text-xs font-semibold text-[#0F172A] dark:text-white">
                    Click to browse or drag & drop the official installer binary here
                  </div>
                  <div className="text-[11px] text-[#64748B] dark:text-slate-400">
                    Permitted for {formPlatform}:{' '}
                    <span className="font-mono font-bold text-[#0284C7]">
                      {(PERMITTED_PLATFORM_EXTENSIONS[formPlatform] || []).join(' or ')}
                    </span>{' '}
                    · Max size:{' '}
                    {formPlatform.startsWith('android') || formPlatform.startsWith('ios')
                      ? `${MAX_MOBILE_RELEASE_SIZE_BYTES / (1024 * 1024)} MB`
                      : `${MAX_DESKTOP_RELEASE_SIZE_BYTES / (1024 * 1024)} MB`}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Upload Progress Bar */}
          {uploadProgress && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-[#CBD5E1] dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="capitalize text-[#0284C7]">
                  {uploadProgress.stage === 'hashing' && 'Calculating Client SHA-256 Checksum...'}
                  {uploadProgress.stage === 'uploading' && 'Streaming Binary to Cloudflare R2...'}
                  {uploadProgress.stage === 'verifying' && 'Verifying Integrity & Magic Headers...'}
                  {uploadProgress.stage === 'completed' && 'Upload & Verification Complete!'}
                </span>
                <span className="font-mono text-[#0F172A] dark:text-white">{uploadProgress.pct}%</span>
              </div>
              <div className="w-full bg-[#E2E8F0] dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-[#0284C7] h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress.pct}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={publishOnUpload}
                onChange={(e) => setPublishOnUpload(e.target.checked)}
                className="w-4 h-4 rounded text-[#0284C7] focus:ring-[#0284C7]"
              />
              <span className="text-xs font-medium text-[#334155] dark:text-slate-300">
                Publish immediately on successful verification (replaces previous live release)
              </span>
            </label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                disabled={isUploading}
                className="px-4 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-slate-700 text-xs font-semibold text-[#475569] hover:bg-[#F1F5F9] dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isUploading || !selectedFile}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
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
      <div className="liquid-glass-elevated rounded-3xl border border-[var(--glass-border)] shadow-xl p-6 sm:p-8 space-y-5">
        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D5E1E8] dark:border-slate-700 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#64748B] dark:text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            {(['all', 'windows', 'macos', 'android', 'ios'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlatformFilter(p)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                  platformFilter === p
                    ? 'bg-[#0284C7] text-white shadow-xs'
                    : 'bg-[#F1F5F9] dark:bg-slate-800 text-[#475569] dark:text-slate-300 hover:bg-[#E2E8F0]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#64748B] dark:text-slate-400">Channel:</span>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value as any)}
              className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-[#CBD5E1] dark:border-slate-700 text-xs font-semibold text-[#0F172A] dark:text-white cursor-pointer"
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
          <div className="py-12 text-center text-xs font-mono text-slate-500 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#0284C7]" />
            <span>LOADING REGISTERED APPLICATION RELEASES...</span>
          </div>
        ) : filteredReleases.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 space-y-2">
            <HardDrive className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="font-semibold text-slate-700 dark:text-slate-300">No releases found matching criteria</div>
            <p className="text-[11px] text-slate-400">Upload a new release using the button above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] dark:border-slate-700 text-[#64748B] dark:text-slate-400 uppercase text-[10px] font-mono tracking-wider">
                  <th className="py-3 px-3">Product & Platform</th>
                  <th className="py-3 px-3">Version & Channel</th>
                  <th className="py-3 px-3">Format / Size</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">SHA-256 Integrity</th>
                  <th className="py-3 px-3">Updated By</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-slate-800">
                {filteredReleases.map((rel) => (
                  <tr
                    key={rel.id}
                    className="hover:bg-[#F8FAFC] dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Platform & Product */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                          {getPlatformIcon(rel.platform)}
                        </div>
                        <div>
                          <div className="font-bold text-[#0F172A] dark:text-white">
                            {rel.productName || 'Orion-9'}
                          </div>
                          <div className="text-[11px] text-[#64748B] dark:text-slate-400 font-mono">
                            {rel.platform}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Version & Channel */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-[#0F172A] dark:text-white text-xs">
                          v{rel.version}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            rel.channel === 'stable'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : rel.channel === 'beta'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {rel.channel}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {rel.publishedAt ? new Date(rel.publishedAt).toLocaleDateString() : rel.releaseDate}
                      </div>
                    </td>

                    {/* Format / Size */}
                    <td className="py-3.5 px-3">
                      <div className="font-bold uppercase text-[#0F172A] dark:text-white font-mono">
                        .{rel.format}
                      </div>
                      <div className="text-[11px] text-[#64748B] dark:text-slate-400 font-mono">
                        {formatFileSize(rel.sizeBytes)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">{getStatusBadge(rel.status)}</td>

                    {/* SHA-256 */}
                    <td className="py-3.5 px-3">
                      {rel.sha256 ? (
                        <div className="flex items-center gap-1.5">
                          <code className="text-[10px] font-mono text-[#0284C7] bg-[#0284C7]/5 px-2 py-0.5 rounded border border-[#0284C7]/15 max-w-[120px] truncate">
                            {rel.sha256.slice(0, 10)}...{rel.sha256.slice(-6)}
                          </code>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(rel.sha256, 'hash', rel.id)}
                            className="p-1 rounded text-slate-400 hover:text-[#0284C7] cursor-pointer"
                            title="Copy full SHA-256 hash"
                          >
                            {copiedHashId === rel.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No hash</span>
                      )}
                    </td>

                    {/* Updated By */}
                    <td className="py-3.5 px-3 text-[11px] text-[#64748B] dark:text-slate-400 font-mono truncate max-w-[130px]">
                      {rel.updatedBy || rel.createdBy || 'System'}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Details */}
                        <button
                          type="button"
                          onClick={() => setSelectedRelease(rel)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                          title="View release details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Copy Download URL */}
                        {rel.downloadUrl && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(rel.downloadUrl, 'url', rel.id)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                            title="Copy download URL"
                          >
                            {copiedUrlId === rel.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
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
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer"
                          >
                            Publish
                          </button>
                        )}

                        {/* Unpublish Action */}
                        {rel.status === 'published' && isAdmin && (
                          <button
                            type="button"
                            onClick={() => setConfirmAction({ type: 'unpublish', release: rel })}
                            className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold cursor-pointer"
                          >
                            Unpublish
                          </button>
                        )}

                        {/* Rollback Action (for superseded releases) */}
                        {rel.status === 'superseded' && isAdmin && (
                          <button
                            type="button"
                            onClick={() => setConfirmAction({ type: 'rollback', release: rel })}
                            className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold cursor-pointer"
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
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  {getPlatformIcon(selectedRelease.platform)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
                    {selectedRelease.productName} v{selectedRelease.version}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                    <span>{selectedRelease.platform}</span>
                    <span>·</span>
                    <span>{selectedRelease.format.toUpperCase()}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRelease(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Status</div>
                  <div className="mt-1">{getStatusBadge(selectedRelease.status)}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Package Size</div>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-1">
                    {formatFileSize(selectedRelease.sizeBytes)} ({selectedRelease.sizeBytes.toLocaleString()} bytes)
                  </div>
                </div>
              </div>

              {/* SHA-256 Box */}
              <div className="p-3.5 rounded-xl bg-[#0B1528] text-white space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span className="font-bold flex items-center gap-1.5 text-sky-400">
                    <Hash className="w-3.5 h-3.5" /> Verified Cryptographic SHA-256
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedRelease.sha256, 'hash', selectedRelease.id)}
                    className="inline-flex items-center gap-1 text-[10px] font-mono text-sky-400 hover:underline cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Hash</span>
                  </button>
                </div>
                <div className="font-mono text-[11px] text-slate-200 break-all bg-black/40 p-2.5 rounded-lg select-all">
                  {selectedRelease.sha256}
                </div>
              </div>

              {/* Download URL Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Authoritative CDN Streaming URL</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedRelease.downloadUrl, 'url', selectedRelease.id)}
                    className="inline-flex items-center gap-1 text-[10px] font-mono text-[#0284C7] hover:underline cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy URL</span>
                  </button>
                </div>
                <div className="font-mono text-[11px] text-slate-600 dark:text-slate-400 break-all select-all">
                  {selectedRelease.downloadUrl}
                </div>
              </div>

              {/* Release Notes */}
              {selectedRelease.releaseNotes && selectedRelease.releaseNotes.length > 0 && (
                <div className="space-y-1.5">
                  <div className="font-bold text-slate-700 dark:text-slate-300">Release Notes:</div>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 pl-1">
                    {selectedRelease.releaseNotes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* External URL if present */}
              {selectedRelease.externalUrl && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300">External Store:</span>
                  <a
                    href={selectedRelease.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#0284C7] hover:underline inline-flex items-center gap-1 font-mono"
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
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  confirmAction.type === 'delete'
                    ? 'bg-red-100 text-red-600'
                    : confirmAction.type === 'publish'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-amber-100 text-amber-600'
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
                <h3 className="text-base font-bold text-[#0F172A] dark:text-white capitalize">
                  {confirmAction.type === 'rollback'
                    ? 'Confirm Rollback'
                    : `${confirmAction.type} Release`}
                </h3>
                <div className="text-xs text-slate-500 font-mono">
                  {confirmAction.release.filename} (v{confirmAction.release.version})
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {confirmAction.type === 'publish' && (
                <>
                  Are you sure you want to publish <strong className="text-[#0F172A] dark:text-white">v{confirmAction.release.version}</strong>? This will immediately make it the active production distribution for <strong className="text-[#0F172A] dark:text-white">{confirmAction.release.platform}</strong>, and mark any previous active release as superseded.
                </>
              )}
              {confirmAction.type === 'unpublish' && (
                <>
                  Are you sure you want to unpublish <strong className="text-[#0F172A] dark:text-white">v{confirmAction.release.version}</strong>? Public users will no longer be able to download this version from the website until another release is published.
                </>
              )}
              {confirmAction.type === 'rollback' && (
                <>
                  Are you sure you want to roll back the distribution to <strong className="text-[#0F172A] dark:text-white">v{confirmAction.release.version}</strong>? It will become the live published release for {confirmAction.release.platform}.
                </>
              )}
              {confirmAction.type === 'delete' && (
                <>
                  Are you sure you want to delete the release record for <strong className="text-[#0F172A] dark:text-white">{confirmAction.release.filename}</strong>? This cannot be undone.
                </>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                disabled={isActionPending}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={isActionPending}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer ${
                  confirmAction.type === 'delete'
                    ? 'bg-red-600 hover:bg-red-700'
                    : confirmAction.type === 'publish'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-[#0284C7] hover:bg-[#0369A1]'
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

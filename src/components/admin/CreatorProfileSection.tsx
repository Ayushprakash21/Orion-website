/**
 * ORION-9 CREATOR PROFILE MANAGEMENT COMPONENT
 * Settings → Creator Profile
 *
 * Dedicated admin control for uploading, replacing, and managing the project creator's
 * photographic identity stored in secure asset storage.
 * Synchronizes with the public About Page (#created-by) while preserving creator attribution.
 */

import React, { useState, useRef } from 'react';
import {
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileImage,
  Sun,
  Moon,
  Info,
  Save,
  UploadCloud,
  Check,
  User,
  Quote,
  Shield,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { CreatorProfileConfig, LogoPlacementMetadata } from '../../types/cms';
import {
  uploadCreatorProfileImage,
} from '../../services/brandingStorage';
import { DEFAULT_CREATOR_PROFILE } from '../../data/defaultSiteConfig';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { useAuth } from '../../context/AuthContext';

interface CreatorProfileSectionProps {
  creatorForm: CreatorProfileConfig;
  setCreatorForm: React.Dispatch<React.SetStateAction<CreatorProfileConfig>>;
  onSave: (publish: boolean) => Promise<void>;
  isSaving: boolean;
  showBanner: (type: 'success' | 'error' | 'warning', message: string) => void;
}

export const CreatorProfileSection: React.FC<CreatorProfileSectionProps> = ({
  creatorForm,
  setCreatorForm,
  onSave,
  isSaving,
  showBanner,
}) => {
  const [previewTone, setPreviewTone] = useState<'light' | 'dark' | 'canvas'>('light');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { user, isAdmin, loading: authLoading } = useAuth();
  const { publishedConfig } = useSiteConfig();

  const currentUrl = creatorForm.avatarUrl;
  const publishedUrl = publishedConfig?.creatorProfile?.avatarUrl;
  const isCustom = Boolean(currentUrl);
  const isPublishedLive = Boolean(isCustom && currentUrl === publishedUrl);
  const isDraftOnly = Boolean(isCustom && currentUrl !== publishedUrl);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (authLoading) {
      showBanner('warning', 'Verifying administrator session, please wait a moment...');
      return;
    }

    if (!user && !isAdmin) {
      const authErr = 'Authentication required: You must be signed in as an administrator to upload assets.';
      setUploadError(authErr);
      showBanner('error', authErr);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      let token: string | undefined;
      if (user) {
        try {
          token = await user.getIdToken(true).catch(() => user.getIdToken(false));
        } catch {
          token = await user.getIdToken(false).catch(() => undefined);
        }
      }

      const metadata = await uploadCreatorProfileImage(
        file,
        (pct) => setUploadProgress(pct),
        token
      );

      setCreatorForm((prev) => ({
        ...prev,
        avatarUrl: metadata.url,
        avatarMetadata: metadata,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.email || user?.uid || 'admin',
      }));

      showBanner(
        'success',
        `Creator photograph uploaded successfully (${metadata.fileType}, ${metadata.dimensions}). Remember to Save Draft or Publish Live.`
      );
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Failed to upload creator photograph.';
      setUploadError(msg);
      showBanner('error', msg);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = () => {
    setCreatorForm((prev) => ({
      ...prev,
      avatarUrl: null,
      avatarMetadata: null,
      updatedAt: new Date().toISOString(),
      updatedBy: user?.email || user?.uid || 'admin',
    }));
    showBanner(
      'warning',
      'Creator photograph removed from working configuration. Fallback initials "AP" will be active. Save Draft or Publish Live to persist.'
    );
  };

  const handleResetToDefaults = () => {
    setCreatorForm({ ...DEFAULT_CREATOR_PROFILE });
    showBanner(
      'warning',
      'Creator profile reset to default repository attribution. Save Draft or Publish Live to persist.'
    );
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* 1. Header Banner */}
      <div className="liquid-glass-elevated rounded-3xl border border-[var(--glass-border)] shadow-xl p-6 md:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--glass-border-subtle)] pb-5">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#0284C7] mb-1">
              <User className="w-4 h-4" />
              <span>ORION-9 FOUNDER &amp; ARCHITECT IDENTITY</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--orion-text-primary)]">
              Creator Profile &amp; Photograph
            </h2>
            <p className="text-xs sm:text-sm text-[var(--orion-text-secondary)] mt-1">
              Manage the creator photograph and attribution displayed on the public About page.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isPublishedLive ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Published Live
              </span>
            ) : isDraftOnly ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <AlertCircle className="w-3.5 h-3.5" />
                Unpublished Draft
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                <Shield className="w-3.5 h-3.5" />
                Default Identity
              </span>
            )}
          </div>
        </div>

        {/* 2. Photo Upload & Preview Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start pt-2">
          {/* Left Column: Visual Preview with tone switcher */}
          <div className="md:col-span-5 flex flex-col items-center p-6 rounded-2xl border border-[var(--glass-border)] bg-[var(--orion-surface)]/60 space-y-4">
            <div className="flex items-center justify-between w-full text-xs font-mono text-[var(--orion-text-muted)]">
              <span className="font-semibold uppercase tracking-wider">Preview Surface</span>
              <div className="flex items-center gap-1 bg-[var(--orion-alt-bg)] p-1 rounded-lg border border-[var(--glass-border-subtle)]">
                <button
                  type="button"
                  onClick={() => setPreviewTone('light')}
                  className={`p-1 rounded ${previewTone === 'light' ? 'bg-white dark:bg-slate-800 shadow-xs text-sky-600' : 'text-slate-400'}`}
                  title="Light Surface"
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTone('dark')}
                  className={`p-1 rounded ${previewTone === 'dark' ? 'bg-white dark:bg-slate-800 shadow-xs text-sky-600' : 'text-slate-400'}`}
                  title="Dark Surface"
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Avatar Frame (Matches About Page creator card: w-24 h-24 rounded-2xl) */}
            <div
              className={`w-32 h-32 rounded-3xl p-2 flex items-center justify-center transition-colors border ${
                previewTone === 'light'
                  ? 'bg-sky-50 border-sky-200'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              {currentUrl ? (
                <img
                  src={currentUrl}
                  alt={creatorForm.name}
                  className="w-28 h-28 rounded-2xl object-cover shadow-xl shadow-sky-600/20 border border-[var(--glass-border)]"
                />
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-[#0284C7] to-[#070B19] text-white flex items-center justify-center font-bold text-3xl shadow-xl shadow-sky-600/20">
                  AP
                </div>
              )}
            </div>

            <div className="text-center">
              <p className="text-xs font-mono font-medium text-[var(--orion-text-primary)]">
                {currentUrl ? 'Custom Photograph Active' : 'Fallback "AP" Avatar Active'}
              </p>
              <p className="text-[11px] text-[var(--orion-text-muted)] mt-0.5">
                Displays at 80×80 px on the public About page
              </p>
            </div>
          </div>

          {/* Right Column: Actions & Photograph Upload Controls */}
          <div className="md:col-span-7 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-[var(--orion-text-primary)]">
                Photograph Controls
              </h3>
              <p className="text-xs text-[var(--orion-text-secondary)] mt-0.5">
                Upload your portrait in PNG, JPEG, WebP, or SVG format (max 5 MB).
              </p>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={handleFileChange}
              className="hidden"
              data-testid="creator-photo-file-input"
            />

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isSaving || authLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-medium transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                data-testid="creator-upload-button"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{currentUrl ? 'Replace Photograph' : 'Upload Photograph'}</span>
              </button>

              {currentUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={isUploading || isSaving}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-rose-300 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                  data-testid="creator-remove-button"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Photograph</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleResetToDefaults}
                disabled={isUploading || isSaving}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[var(--glass-border)] text-xs text-[var(--orion-text-secondary)] hover:bg-[var(--orion-alt-bg)] transition-colors cursor-pointer disabled:opacity-50"
                title="Restore default attribution"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
            </div>

            {/* Upload Progress Indicator */}
            {isUploading && (
              <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/40 space-y-2">
                <div className="flex items-center justify-between text-xs text-sky-800 dark:text-sky-300 font-medium">
                  <span className="flex items-center gap-1.5">
                    <UploadCloud className="w-4 h-4 animate-bounce" />
                    Uploading photograph...
                  </span>
                  <span className="font-mono">{uploadProgress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-sky-200 dark:bg-sky-900 overflow-hidden">
                  <div
                    className="h-full bg-[#0284C7] transition-all duration-150 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Upload Error Banner */}
            {uploadError && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <div className="space-y-0.5">
                  <p className="font-semibold">Upload failed</p>
                  <p>{uploadError}</p>
                </div>
              </div>
            )}

            {/* Metadata Card */}
            {currentUrl && (
              <div className="p-3.5 rounded-xl bg-[var(--orion-alt-bg)] border border-[var(--glass-border-subtle)] text-xs font-mono space-y-1.5">
                <div className="flex items-center justify-between text-[var(--orion-text-muted)] text-[11px] pb-1 border-b border-[var(--glass-border-subtle)]">
                  <span className="font-sans font-semibold uppercase tracking-wider text-[#0284C7]">
                    Asset Metadata
                  </span>
                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Verified Asset
                  </span>
                </div>
                {creatorForm.avatarMetadata?.originalFilename && (
                  <div className="truncate text-[var(--orion-text-secondary)]">
                    <span className="text-[var(--orion-text-muted)]">File:</span>{' '}
                    {creatorForm.avatarMetadata.originalFilename}
                  </div>
                )}
                {creatorForm.avatarMetadata?.dimensions && (
                  <div className="text-[var(--orion-text-secondary)]">
                    <span className="text-[var(--orion-text-muted)]">Dimensions:</span>{' '}
                    {creatorForm.avatarMetadata.dimensions}
                  </div>
                )}
                {creatorForm.avatarMetadata?.sizeBytes && (
                  <div className="text-[var(--orion-text-secondary)]">
                    <span className="text-[var(--orion-text-muted)]">Size:</span>{' '}
                    {(creatorForm.avatarMetadata.sizeBytes / 1024).toFixed(1)} KB
                  </div>
                )}
                <div className="truncate text-[var(--orion-text-muted)] text-[10px] pt-1">
                  <span>URL:</span> <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="text-[#0284C7] hover:underline">{currentUrl}</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Creator Profile Fields & Attribution */}
      <div className="liquid-glass-elevated rounded-3xl border border-[var(--glass-border)] shadow-xl p-6 md:p-8 space-y-5">
        <div className="border-b border-[var(--glass-border-subtle)] pb-4">
          <h3 className="text-base font-semibold text-[var(--orion-text-primary)]">
            Attribution &amp; Founder Note
          </h3>
          <p className="text-xs text-[var(--orion-text-secondary)] mt-0.5">
            These fields populate the creator card and founder note in the About page (#created-by).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--orion-text-primary)]">
              Creator Name
            </label>
            <input
              type="text"
              value={creatorForm.name}
              onChange={(e) => setCreatorForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full px-3.5 py-2 rounded-xl bg-[var(--orion-surface)] border border-[var(--glass-border)] text-xs text-[var(--orion-text-primary)] focus:outline-hidden focus:border-[#0284C7]"
              data-testid="creator-name-input"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--orion-text-primary)]">
              Role &amp; Architectural Title
            </label>
            <input
              type="text"
              value={creatorForm.role}
              onChange={(e) => setCreatorForm((prev) => ({ ...prev, role: e.target.value }))}
              className="w-full px-3.5 py-2 rounded-xl bg-[var(--orion-surface)] border border-[var(--glass-border)] text-xs text-[var(--orion-text-primary)] focus:outline-hidden focus:border-[#0284C7]"
              data-testid="creator-role-input"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-[var(--orion-text-primary)]">
              Foundational Question / Quote
            </label>
            <input
              type="text"
              value={creatorForm.quote}
              onChange={(e) => setCreatorForm((prev) => ({ ...prev, quote: e.target.value }))}
              className="w-full px-3.5 py-2 rounded-xl bg-[var(--orion-surface)] border border-[var(--glass-border)] text-xs text-[var(--orion-text-primary)] focus:outline-hidden focus:border-[#0284C7]"
              data-testid="creator-quote-input"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--orion-text-primary)]">
              Source Repository
            </label>
            <input
              type="text"
              value={creatorForm.repository}
              onChange={(e) => setCreatorForm((prev) => ({ ...prev, repository: e.target.value }))}
              className="w-full px-3.5 py-2 rounded-xl bg-[var(--orion-surface)] border border-[var(--glass-border)] text-xs text-[var(--orion-text-primary)] font-mono focus:outline-hidden focus:border-[#0284C7]"
              data-testid="creator-repo-input"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--orion-text-primary)]">
              System Status
            </label>
            <input
              type="text"
              value={creatorForm.status}
              onChange={(e) => setCreatorForm((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full px-3.5 py-2 rounded-xl bg-[var(--orion-surface)] border border-[var(--glass-border)] text-xs text-[var(--orion-text-primary)] font-mono focus:outline-hidden focus:border-[#0284C7]"
              data-testid="creator-status-input"
            />
          </div>
        </div>

        {/* 4. Bottom Actions: Save Draft & Publish Live */}
        <div className="pt-4 border-t border-[var(--glass-border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-[var(--orion-text-muted)] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>Drafts are private to administrators. Publish Live syncs to the public About page.</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => onSave(false)}
              disabled={isSaving || isUploading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--glass-border)] bg-[var(--orion-surface)] hover:bg-[var(--orion-alt-bg)] text-xs font-medium text-[var(--orion-text-primary)] transition-colors cursor-pointer disabled:opacity-50"
              data-testid="creator-save-draft-button"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
            </button>

            <button
              type="button"
              onClick={() => onSave(true)}
              disabled={isSaving || isUploading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold transition-colors shadow-md shadow-sky-600/20 cursor-pointer disabled:opacity-50"
              data-testid="creator-publish-button"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Publishing...' : 'Publish Live'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

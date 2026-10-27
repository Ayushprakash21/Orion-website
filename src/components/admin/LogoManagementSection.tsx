/**
 * ORION-9 UNIFIED WEBSITE LOGO MANAGEMENT COMPONENT
 * Settings → Branding & Identity
 * 
 * Provides ONE unified upload control for the canonical Website Brand Logo.
 * Uploading and publishing updates all static placements across:
 * 1. Website header (Navbar)
 * 2. Authentication pages (sign-in, sign-up, password reset, verification)
 * 3. Website footer & closing enterprise CTA
 * 
 * The 3D animated hero centerpiece on the homepage remains strictly autonomous and untouched.
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
  Sparkles,
  Cloud,
} from 'lucide-react';
import { BrandingConfig, LogoPlacementConfig } from '../../types/cms';
import { uploadBrandingLogoAsset, DEFAULT_R2_BUCKET } from '../../services/brandingStorage';
import { OrionLogo } from '../OrionLogo';
import { DEFAULT_LOGO_PLACEMENT_CONFIG } from '../../data/defaultSiteConfig';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { useAuth } from '../../context/AuthContext';

interface LogoManagementSectionProps {
  brandingForm: BrandingConfig;
  setBrandingForm: React.Dispatch<React.SetStateAction<BrandingConfig>>;
  onSave: (publish: boolean) => Promise<void>;
  isSaving: boolean;
  showBanner: (type: 'success' | 'error' | 'warning', message: string) => void;
}

export const LogoManagementSection: React.FC<LogoManagementSectionProps> = ({
  brandingForm,
  setBrandingForm,
  onSave,
  isSaving,
  showBanner,
}) => {
  // Preview background tone ('light' | 'dark' | 'canvas')
  const [previewTone, setPreviewTone] = useState<'light' | 'dark' | 'canvas'>('light');

  // Upload state
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Authentication & Canonical shared logo resolution
  const { user } = useAuth();
  const { publishedConfig } = useSiteConfig();
  const sharedConfig = brandingForm.sharedLogoConfig;
  const isCustom = Boolean(
    sharedConfig?.useCustom &&
    (sharedConfig?.customUrl || sharedConfig?.url || brandingForm.sharedLogo)
  );

  const currentUrl = isCustom
    ? (sharedConfig?.customUrl || sharedConfig?.url || brandingForm.sharedLogo || null)
    : null;

  const publishedSharedUrl =
    publishedConfig?.branding?.sharedLogoConfig?.customUrl ||
    publishedConfig?.branding?.sharedLogo ||
    null;

  const isPublishedLive = Boolean(isCustom && currentUrl && currentUrl === publishedSharedUrl);

  const handleToneChange = (tone: 'light' | 'dark' | 'canvas') => {
    setPreviewTone(tone);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      const token = user ? await user.getIdToken() : undefined;
      const metadata = await uploadBrandingLogoAsset(
        'shared',
        file,
        (pct) => setUploadProgress(pct),
        token
      );

      // Create new canonical LogoPlacementConfig
      const newPlacementConfig: LogoPlacementConfig = {
        useCustom: true,
        customUrl: metadata.url,
        url: metadata.url,
        originalFilename: file.name,
        dimensions: metadata.dimensions ?? null,
        fileType: metadata.fileType ?? null,
        sizeBytes: metadata.sizeBytes ?? null,
        uploadedAt: metadata.uploadedAt ?? new Date().toISOString(),
        updatedBy: null,
      };

      // Synchronize sharedLogo and all static placements simultaneously
      setBrandingForm((prev) => ({
        ...prev,
        logoUrl: metadata.url,
        sharedLogo: metadata.url,
        sharedLogoConfig: newPlacementConfig,
        headerLogo: metadata.url,
        headerLogoConfig: { ...newPlacementConfig },
        authLogo: metadata.url,
        authLogoConfig: { ...newPlacementConfig },
        footerLogo: metadata.url,
        footerLogoConfig: { ...newPlacementConfig },
      }));

      showBanner(
        'success',
        'Website Brand Logo uploaded successfully! Click "Publish Live" to apply to the header, auth pages, and footer.'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Logo upload failed.';
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

  const handleRestoreDefault = () => {
    const defaultConfigVal: LogoPlacementConfig = {
      ...DEFAULT_LOGO_PLACEMENT_CONFIG,
    };

    setBrandingForm((prev) => ({
      ...prev,
      sharedLogo: null,
      sharedLogoConfig: defaultConfigVal,
      headerLogo: null,
      headerLogoConfig: defaultConfigVal,
      authLogo: null,
      authLogoConfig: defaultConfigVal,
      footerLogo: null,
      footerLogoConfig: defaultConfigVal,
    }));

    setUploadError(null);
    showBanner('success', 'Restored default ORION-9 logo for all website placements.');
  };

  // Preview background styles
  const previewBgClasses = {
    light: 'bg-white border-[#E2E8F0] text-[#070B19]',
    dark: 'bg-[#070B19] border-[#1E293B] text-white',
    canvas: 'bg-[#EAF4F8] border-[#D5E1E8] text-[#111827]',
  };

  return (
    <div className="space-y-8">
      {/* SECTION HEADER & ACTIONS */}
      <div className="liquid-glass-elevated rounded-3xl border border-[var(--glass-border)] p-6 md:p-8 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--glass-border-subtle)] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#0284C7] uppercase tracking-wider">
                Settings → Branding &amp; Identity
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#111827] mt-1">
              Website Brand Logo
            </h2>
            <p className="text-xs text-[#566575] mt-1">
              Upload your ORION-9 logo once to update the website header, authentication pages, and footer.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={isSaving || isUploading}
              onClick={() => onSave(false)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#D5E1E8] bg-white hover:bg-[#F5F9FB] text-xs font-semibold text-[#111827] transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 text-[#566575]" />
              <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
            </button>
            <button
              type="button"
              disabled={isSaving || isUploading}
              onClick={() => onSave(true)}
              className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-[#070B19] hover:bg-[#1E293B] text-white text-xs font-semibold transition shadow-md shadow-slate-900/20 cursor-pointer disabled:opacity-50"
            >
              <UploadCloud className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>{isSaving ? 'Publishing...' : 'Publish Live'}</span>
            </button>
          </div>
        </div>

        {/* Informational Guidance Alert */}
        <div className="p-3.5 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] text-xs text-[#0369A1] flex items-start gap-2.5">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#0284C7]" />
          <div className="space-y-0.5">
            <span className="font-semibold block text-[#0C4A6E]">Cloudflare R2 Storage &amp; Unified Static Propagation:</span>
            <span>
              Uploading a logo here securely stores the asset in Cloudflare R2 bucket <code className="px-1.5 py-0.5 rounded bg-[#E0F2FE] font-mono text-[#0369A1]">{DEFAULT_R2_BUCKET}</code> and synchronizes the header, login/signup/reset pages, and footer with one shared CDN asset reference.
              The large 3D animated hero centerpiece on the homepage remains completely autonomous and unaffected.
            </span>
          </div>
        </div>
      </div>

      {/* ONE UNIFIED LOGO MANAGEMENT CARD */}
      <div className="max-w-3xl mx-auto">
        <div className="liquid-glass-card rounded-3xl border border-[var(--glass-border)] p-6 sm:p-8 space-y-6 shadow-md hover:border-[var(--orion-accent)] transition">
          {/* Card Title & Status Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--glass-border-subtle)] pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-bold text-lg text-[#111827]">Website Brand Logo</h3>
                {isUploading ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] animate-pulse">
                    <Cloud className="w-3 h-3 text-[#D97706]" />
                    UPLOADING TO CLOUDFLARE R2...
                  </span>
                ) : isPublishedLive ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]">
                    <Check className="w-3 h-3 text-[#16a34a]" />
                    PUBLISHED LIVE
                  </span>
                ) : isCustom ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
                    <Check className="w-3 h-3 text-[#0284C7]" />
                    STAGED IN DRAFT (UNPUBLISHED)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
                    DEFAULT ORION-9
                  </span>
                )}
              </div>
              <p className="text-xs text-[#566575] mt-1 leading-relaxed">
                Upload your ORION-9 logo once to update the website header, authentication pages, and footer.
              </p>
            </div>

            {/* Contrast Preview Toggles */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <span className="text-xs text-[#64748B] font-medium mr-1">Preview:</span>
              <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => handleToneChange('light')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                    previewTone === 'light'
                      ? 'bg-white shadow-xs text-[#070B19] font-semibold'
                      : 'text-[#64748B] hover:text-[#111827]'
                  }`}
                >
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => handleToneChange('dark')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                    previewTone === 'dark'
                      ? 'bg-[#070B19] text-white shadow-xs font-semibold'
                      : 'text-[#64748B] hover:text-[#111827]'
                  }`}
                >
                  Dark
                </button>
                <button
                  type="button"
                  onClick={() => handleToneChange('canvas')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                    previewTone === 'canvas'
                      ? 'bg-white text-[#0284C7] shadow-xs font-semibold'
                      : 'text-[#64748B] hover:text-[#111827]'
                  }`}
                >
                  Canvas
                </button>
              </div>
            </div>
          </div>

          {/* Single Unified Logo Preview */}
          <div className="space-y-3">
            <div
              className={`h-40 sm:h-48 rounded-2xl border flex items-center justify-center p-6 transition-all duration-200 overflow-hidden relative ${previewBgClasses[previewTone]}`}
            >
              <div className="transform scale-125 sm:scale-150 transition-transform">
                <OrionLogo
                  companyName={brandingForm.companyName || 'Orion-9'}
                  size="lg"
                  tone={previewTone === 'dark' ? 'light' : 'dark'}
                  placement="default"
                  customLogoUrl={currentUrl}
                />
              </div>

              {/* Subdued tone watermark */}
              <span className="absolute bottom-2 right-3 text-[10px] font-mono opacity-40 uppercase tracking-widest pointer-events-none">
                {previewTone} mode
              </span>
            </div>
          </div>

          {/* Usage Indicator: "This logo will appear in:" */}
          <div className="p-4 rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD] text-xs space-y-2.5">
            <div className="flex items-center gap-2 font-semibold text-[#0369A1]">
              <CheckCircle2 className="w-4 h-4 text-[#0284C7] shrink-0" />
              <span>This logo will appear in:</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#0C4A6E] pl-6 list-disc">
              <li>Website header</li>
              <li>Sign-in and sign-up pages</li>
              <li>Password reset and verification pages</li>
              <li>Website footer and closing CTA, where applicable</li>
            </ul>
          </div>

          {/* Supported Formats & Dimensions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
              <span className="font-semibold text-[#334155] block">Supported File Formats</span>
              <p className="text-[#64748B]">SVG, PNG, WebP, JPG (Maximum 5 MB)</p>
            </div>
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
              <span className="font-semibold text-[#334155] block">Recommended Dimensions</span>
              <p className="text-[#64748B]">Vector SVG (Scalable) or 512×512 px / 2:1 landscape</p>
            </div>
          </div>

          {/* Metadata Display for Custom Asset */}
          {isCustom && sharedConfig && (
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs space-y-1.5 font-mono">
              <div className="flex items-center justify-between text-[#334155]">
                <span className="text-[#64748B]">Active Asset:</span>
                <span className="font-medium text-[#0F172A] truncate max-w-xs">
                  {sharedConfig.originalFilename || 'Custom uploaded asset'}
                </span>
              </div>
              {sharedConfig.dimensions && (
                <div className="flex items-center justify-between text-[#334155]">
                  <span className="text-[#64748B]">Dimensions:</span>
                  <span>{sharedConfig.dimensions}</span>
                </div>
              )}
              {sharedConfig.fileType && (
                <div className="flex items-center justify-between text-[#334155]">
                  <span className="text-[#64748B]">Format:</span>
                  <span>{sharedConfig.fileType}</span>
                </div>
              )}
              {sharedConfig.sizeBytes && (
                <div className="flex items-center justify-between text-[#334155]">
                  <span className="text-[#64748B]">Size:</span>
                  <span>{(sharedConfig.sizeBytes / 1024).toFixed(1)} KB</span>
                </div>
              )}
            </div>
          )}

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs text-[#0284C7] font-mono">
                <span className="flex items-center gap-1.5">
                  <Cloud className="w-3.5 h-3.5 text-[#0284C7] animate-bounce" />
                  Uploading brand asset to Cloudflare R2 ({DEFAULT_R2_BUCKET})...
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#0284C7] h-full transition-all duration-150 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Error Alert */}
          {uploadError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Upload Error:</span>
                <span>{uploadError}</span>
              </div>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".svg,.png,.jpg,.jpeg,.webp"
            className="hidden"
          />

          {/* Action Buttons: One Upload Button, Replace, Restore Default */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            {isCustom ? (
              <>
                <button
                  type="button"
                  disabled={isUploading || isSaving}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>Replace Logo</span>
                </button>
                <button
                  type="button"
                  disabled={isUploading || isSaving}
                  onClick={handleRestoreDefault}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl border border-[#D5E1E8] bg-white hover:bg-[#F8FAFC] text-[#475569] hover:text-[#0F172A] text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4 text-[#64748B]" />
                  <span>Remove Custom Logo / Restore Default</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={isUploading || isSaving}
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3.5 px-4 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-sky-600/20 transition cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Logo</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

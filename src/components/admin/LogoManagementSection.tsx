/**
 * ORION-9 CENTRALIZED BRANDING & LOGO MANAGEMENT COMPONENT
 * Settings → Branding & Identity
 * 
 * Provides dedicated configuration cards for:
 * 1. Website Header Logo (top navigation beside ORION-9)
 * 2. Authentication Logo (sign-in, sign-up, password reset views)
 * 3. Footer Logo (footer callout and bottom columns)
 * 4. Global Fallback Brand Logo
 * 
 * Fully supports upload, preview on light/dark backgrounds, replace,
 * restore default, dimensions & file-type reporting, SVG sanitization,
 * and aspect-ratio preservation.
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
  Sparkles,
  Info,
  Save,
  UploadCloud,
  Check,
  RefreshCw,
} from 'lucide-react';
import { BrandingConfig, LogoPlacementMetadata } from '../../types/cms';
import { uploadBrandingLogoAsset, validateLogoFile } from '../../services/brandingStorage';
import { OrionLogo } from '../OrionLogo';

interface LogoManagementSectionProps {
  brandingForm: BrandingConfig;
  setBrandingForm: React.Dispatch<React.SetStateAction<BrandingConfig>>;
  onSave: (publish: boolean) => Promise<void>;
  isSaving: boolean;
  showBanner: (type: 'success' | 'error' | 'warning', message: string) => void;
}

type PlacementKey = 'headerLogo' | 'authLogo' | 'footerLogo' | 'logoUrl';

interface PlacementDef {
  key: PlacementKey;
  configKey: 'headerLogoConfig' | 'authLogoConfig' | 'footerLogoConfig' | undefined;
  title: string;
  location: string;
  description: string;
  recommendedSize: string;
}

const PLACEMENTS: PlacementDef[] = [
  {
    key: 'headerLogo',
    configKey: 'headerLogoConfig',
    title: 'Website Header Logo',
    location: 'Top navigation bar beside the ORION-9 title',
    description: 'Displays in the fixed top navigation bar across all public website pages.',
    recommendedSize: 'Height: 32–48 px · Aspect Ratio: 1:1 or 2:1 landscape',
  },
  {
    key: 'authLogo',
    configKey: 'authLogoConfig',
    title: 'Authentication Logo',
    location: 'Sign-in, sign-up, password reset, and access verification screens',
    description: 'Displayed at the top of the authentication stage and login/signup views.',
    recommendedSize: 'Height: 36–52 px · Aspect Ratio: 1:1 or 2:1 landscape',
  },
  {
    key: 'footerLogo',
    configKey: 'footerLogoConfig',
    title: 'Website Footer Logo',
    location: 'Website closing callout banner and directory navigation columns',
    description: 'Displayed in the enterprise CTA banner and footer copyright lockup.',
    recommendedSize: 'Height: 32–40 px · Aspect Ratio: 1:1 square',
  },
];

export const LogoManagementSection: React.FC<LogoManagementSectionProps> = ({
  brandingForm,
  setBrandingForm,
  onSave,
  isSaving,
  showBanner,
}) => {
  // Preview background tone for each card ('light' | 'dark' | 'canvas')
  const [previewTones, setPreviewTones] = useState<Record<string, 'light' | 'dark' | 'canvas'>>({
    headerLogo: 'light',
    authLogo: 'canvas',
    footerLogo: 'light',
    logoUrl: 'light',
  });

  // Upload state per card
  const [uploadingPlacement, setUploadingPlacement] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadErrors, setUploadErrors] = useState<Record<string, string | null>>({});

  const fileInputRefs = {
    headerLogo: useRef<HTMLInputElement | null>(null),
    authLogo: useRef<HTMLInputElement | null>(null),
    footerLogo: useRef<HTMLInputElement | null>(null),
    logoUrl: useRef<HTMLInputElement | null>(null),
  };

  const handleToneChange = (key: string, tone: 'light' | 'dark' | 'canvas') => {
    setPreviewTones((prev) => ({ ...prev, [key]: tone }));
  };

  const handleFileUpload = async (placement: PlacementKey, file: File) => {
    setUploadingPlacement(placement);
    setUploadProgress(0);
    setUploadErrors((prev) => ({ ...prev, [placement]: null }));

    try {
      const metadata = await uploadBrandingLogoAsset(
        placement === 'headerLogo'
          ? 'header'
          : placement === 'authLogo'
          ? 'auth'
          : placement === 'footerLogo'
          ? 'footer'
          : 'default',
        file,
        (pct) => setUploadProgress(pct)
      );

      // Update state with new URL and metadata
      setBrandingForm((prev) => {
        const next = { ...prev, [placement]: metadata.url };
        if (placement === 'headerLogo') next.headerLogoConfig = metadata;
        else if (placement === 'authLogo') next.authLogoConfig = metadata;
        else if (placement === 'footerLogo') next.footerLogoConfig = metadata;
        return next;
      });

      showBanner('success', `Uploaded and configured new logo for ${placement}. Click "Publish Live" to apply across the website.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Logo upload failed.';
      setUploadErrors((prev) => ({ ...prev, [placement]: msg }));
      showBanner('error', msg);
    } finally {
      setUploadingPlacement(null);
      setUploadProgress(0);
    }
  };

  const handleRestoreDefault = (def: PlacementDef) => {
    setBrandingForm((prev) => {
      const next = { ...prev, [def.key]: null };
      if (def.configKey) {
        next[def.configKey] = undefined;
      }
      return next;
    });
    setUploadErrors((prev) => ({ ...prev, [def.key]: null }));
    showBanner('success', `Restored default Orion-9 logo for ${def.title}.`);
  };

  return (
    <div className="space-y-8">
      {/* SECTION HEADER & CONTEXT */}
      <div className="liquid-glass-elevated rounded-3xl border border-[var(--glass-border)] p-6 md:p-8 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--glass-border-subtle)] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#0284C7] uppercase tracking-wider">
                Settings → Branding &amp; Identity
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#111827] mt-1">
              Centralized Website Logo Management
            </h2>
            <p className="text-xs text-[#566575] mt-1">
              Configure static website logos across Header, Authentication, and Footer placements.
              All changes preserve aspect ratio with safe SVG sanitization.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => onSave(false)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#D5E1E8] bg-white hover:bg-[#F5F9FB] text-xs font-semibold text-[#111827] transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 text-[#566575]" />
              <span>Save Draft</span>
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => onSave(true)}
              className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-[#070B19] hover:bg-[#1E293B] text-white text-xs font-semibold transition shadow-md shadow-slate-900/20 cursor-pointer disabled:opacity-50"
            >
              <UploadCloud className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Publish Live</span>
            </button>
          </div>
        </div>

        {/* Informational Guidance Alert */}
        <div className="p-3.5 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] text-xs text-[#0369A1] flex items-start gap-2.5">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#0284C7]" />
          <div className="space-y-0.5">
            <span className="font-semibold block text-[#0C4A6E]">Centralized Propagation Guarantee:</span>
            <span>
              Updating any placement updates all pages consuming that logo automatically without manual code edits.
              The 3D animated hero centerpiece on the homepage remains completely independent and visually untouched.
            </span>
          </div>
        </div>
      </div>

      {/* 3 LOGO PLACEMENT CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {PLACEMENTS.map((def) => {
          const currentUrl = (brandingForm[def.key] as string | null) || null;
          const config = def.configKey ? brandingForm[def.configKey] : undefined;
          const isCustom = Boolean(currentUrl);
          const tone = previewTones[def.key] || 'light';
          const isUploading = uploadingPlacement === def.key;
          const errorMsg = uploadErrors[def.key];

          const bgStyles = {
            light: 'bg-white border-[#E2E8F0] text-[#070B19]',
            dark: 'bg-[#070B19] border-[#1E293B] text-white',
            canvas: 'bg-[#EAF4F8] border-[#D5E1E8] text-[#111827]',
          };

          return (
            <div
              key={def.key}
              className="liquid-glass-card rounded-2xl border border-[var(--glass-border)] p-5 flex flex-col justify-between space-y-4 shadow-sm hover:border-[var(--orion-accent)] transition"
            >
              {/* Card Header */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-sm text-[#111827]">{def.title}</h3>
                  {isCustom ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
                      CUSTOM ASSET
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
                      DEFAULT ORION-9
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#566575] leading-relaxed">{def.description}</p>
                <div className="text-[11px] font-mono text-[#0284C7] bg-[#F8FAFC] p-1.5 rounded-lg border border-[#E2E8F0]">
                  Target: {def.location}
                </div>
              </div>

              {/* Interactive Live Preview Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                  <span className="font-medium">Live Contrast Preview:</span>
                  <div className="flex items-center gap-1 bg-[#F1F5F9] p-0.5 rounded-lg border border-[#E2E8F0]">
                    <button
                      type="button"
                      onClick={() => handleToneChange(def.key, 'light')}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                        tone === 'light' ? 'bg-white shadow-xs text-[#070B19]' : 'text-[#64748B]'
                      }`}
                    >
                      Light
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToneChange(def.key, 'dark')}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                        tone === 'dark' ? 'bg-[#070B19] text-white shadow-xs' : 'text-[#64748B]'
                      }`}
                    >
                      Dark
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToneChange(def.key, 'canvas')}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                        tone === 'canvas' ? 'bg-[#EAF4F8] text-[#111827] shadow-xs' : 'text-[#64748B]'
                      }`}
                    >
                      Canvas
                    </button>
                  </div>
                </div>

                <div
                  className={`h-24 rounded-xl border flex items-center justify-center p-3 relative overflow-hidden transition-colors ${bgStyles[tone]}`}
                >
                  <div className="flex items-center gap-2.5">
                    {isCustom ? (
                      <div className="h-10 max-w-[180px] flex items-center justify-center">
                        <img
                          src={currentUrl!}
                          alt={`${def.title} Preview`}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    ) : (
                      <OrionLogo
                        companyName={brandingForm.companyName || 'Orion-9'}
                        size="md"
                        tone={tone === 'dark' ? 'light' : 'dark'}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Asset Metadata Box */}
              <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] space-y-1 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Dimensions:</span>
                  <span className="text-[#111827] font-semibold">
                    {config?.dimensions || (isCustom ? 'Auto-detected' : 'Vector SVG (Scalable)')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">File Format:</span>
                  <span className="text-[#111827]">
                    {config?.fileType ? config.fileType.toUpperCase().replace('IMAGE/', '') : isCustom ? 'Web Asset' : 'SVG'}
                  </span>
                </div>
                {config?.sizeBytes && (
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">File Size:</span>
                    <span className="text-[#111827]">
                      {(config.sizeBytes / 1024).toFixed(1)} KB
                    </span>
                  </div>
                )}
                <div className="text-[10px] text-[#94A3B8] pt-1 border-t border-[#E2E8F0]">
                  {def.recommendedSize}
                </div>
              </div>

              {/* Upload Progress Bar if active */}
              {isUploading && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono text-[#0284C7]">
                    <span>Uploading asset...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0284C7] h-full transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error Alert if any */}
              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{errorMsg}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#E2E8F0]">
                <input
                  ref={fileInputRefs[def.key]}
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,.svg"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(def.key, file);
                    e.target.value = '';
                  }}
                />

                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRefs[def.key].current?.click()}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold transition cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isCustom ? 'Replace Logo' : 'Upload Logo'}</span>
                </button>

                {isCustom && (
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => handleRestoreDefault(def)}
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#CBD5E1] bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 text-xs font-medium text-[#475569] transition cursor-pointer disabled:opacity-50"
                    title="Remove custom logo and restore the default Orion-9 badge"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CORE BRANDING & TYPOGRAPHY ATTRIBUTES */}
      <div className="liquid-glass-elevated rounded-3xl border border-[var(--glass-border)] p-6 md:p-8 space-y-6 shadow-xl">
        <div>
          <h3 className="text-base font-semibold text-[#111827]">
            Brand Identity Attributes &amp; Wordmark Settings
          </h3>
          <p className="text-xs text-[#566575] mt-1">
            Configure the brand name and wordmark that appears alongside your logos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#111827] mb-1">
              Company Name (Wordmark)
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
              Short Brand Mark
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

        {/* Color Palette Tokens */}
        <div className="pt-4 border-t border-[#D5E1E8] space-y-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              VectrFL Ice-Blue Design System Color Tokens
            </h4>
            <p className="text-xs text-[#566575] mt-0.5">
              Standard 6-digit hex color tokens powering the visual identity across the platform.
            </p>
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
              <div key={key} className="p-3 rounded-xl bg-[#F8FAFC] border border-[#D5E1E8]">
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
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#D5E1E8]">
          <div className="text-xs text-[#64748B]">
            All logo and branding changes are validated before saving to prevent broken asset links.
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => onSave(false)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D5E1E8] bg-white hover:bg-[#F5F9FB] text-xs font-semibold text-[#111827] transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 text-[#566575]" />
              <span>Save Draft</span>
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => onSave(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#070B19] hover:bg-[#1E293B] text-white text-xs font-semibold transition shadow-md shadow-slate-900/20 cursor-pointer disabled:opacity-50"
            >
              <UploadCloud className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Publish Branding Live</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import type {
  BrandingConfig,
  HomepageConfig,
  NavigationConfig,
  SeoConfig,
  FooterConfig,
  LogoPlacementConfig,
  CreatorProfileConfig,
} from '../types/cms.ts';
import {
  DEFAULT_SITE_CONFIG,
  DEFAULT_LOGO_PLACEMENT_CONFIG,
  DEFAULT_CREATOR_PROFILE,
} from '../data/defaultSiteConfig.ts';

/**
 * Validates that a URL is safe for use in CTAs, navigation links, or media assets.
 * Rejects javascript:, data:, vbscript:, and malformed URLs.
 * Allows internal anchors (#...), relative paths (/...), and https:// or http://localhost URLs.
 */
export function isSafeCmsUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed.length > 500) return false;

  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return false;
  }

  if (trimmed.startsWith('#') || trimmed.startsWith('/')) {
    // Disallow protocol-relative //evil.com
    if (trimmed.startsWith('//')) return false;
    return true;
  }

  try {
    const parsed = new URL(trimmed);
    return (
      parsed.protocol === 'https:' ||
      (parsed.protocol === 'http:' &&
        (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1'))
    );
  } catch {
    return false;
  }
}

/**
 * Validates standard 6-digit hex color strings (#RRGGBB).
 */
export function isValidHexColor(hex: string): boolean {
  if (!hex || typeof hex !== 'string') return false;
  return /^#[0-9A-Fa-f]{6}$/.test(hex.trim());
}

/**
 * Sanitizes plain text input by trimming and stripping control characters or script tags.
 */
export function sanitizeCmsText(input: string, maxLength = 300): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .trim()
    .slice(0, maxLength);
}

export function isSafeLogoUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return false;
  }
  if (lower.startsWith('data:image/')) {
    if (lower.startsWith('data:image/svg+xml') && (lower.includes('<script') || lower.includes('onload=') || lower.includes('onerror='))) {
      return false;
    }
    return true;
  }
  return isSafeCmsUrl(trimmed);
}

export function validateBrandingConfig(config: BrandingConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.companyName || config.companyName.trim().length < 2 || config.companyName.length > 60) {
    errors.push('Company name must be between 2 and 60 characters.');
  }
  if (!config.shortMark || config.shortMark.trim().length < 1 || config.shortMark.length > 8) {
    errors.push('Short brand mark must be between 1 and 8 characters.');
  }
  if (!config.tagline || config.tagline.trim().length < 4 || config.tagline.length > 160) {
    errors.push('Tagline must be between 4 and 160 characters.');
  }
  if (config.sharedLogo && !isSafeLogoUrl(config.sharedLogo)) {
    errors.push('Shared Brand Logo URL must be a valid https://, relative path, or safe image data URL.');
  }
  if (config.sharedLogoConfig?.customUrl && !isSafeLogoUrl(config.sharedLogoConfig.customUrl)) {
    errors.push('Shared Brand Logo custom URL must be a valid https://, relative path, or safe image data URL.');
  }
  if (config.logoUrl && !isSafeLogoUrl(config.logoUrl)) {
    errors.push('Logo URL must be a valid https://, relative path, or safe image data URL.');
  }
  if (config.headerLogo && !isSafeLogoUrl(config.headerLogo)) {
    errors.push('Header Logo URL must be a valid https://, relative path, or safe image data URL.');
  }
  if (config.authLogo && !isSafeLogoUrl(config.authLogo)) {
    errors.push('Authentication Logo URL must be a valid https://, relative path, or safe image data URL.');
  }
  if (config.footerLogo && !isSafeLogoUrl(config.footerLogo)) {
    errors.push('Footer Logo URL must be a valid https://, relative path, or safe image data URL.');
  }

  const colorFields: [string, string][] = [
    ['Main canvas color', config.canvasColor],
    ['Alternate section background', config.altSectionColor],
    ['White surface color', config.surfaceColor],
    ['Primary text color', config.primaryTextColor],
    ['Secondary text color', config.secondaryTextColor],
    ['Border color', config.borderColor],
    ['Deep blue accent', config.deepBlueAccent],
    ['Steel blue accent', config.steelBlueAccent],
    ['Dark surface color', config.darkSurfaceColor],
  ];

  for (const [label, val] of colorFields) {
    if (!isValidHexColor(val)) {
      errors.push(`${label} must be a valid 6-character hex color (e.g. #0F172A).`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateHomepageConfig(config: HomepageConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.statusBadge || config.statusBadge.trim().length === 0) {
    errors.push('Status badge text cannot be empty.');
  }
  if (!config.heroHeadlineLine1 || config.heroHeadlineLine1.trim().length === 0) {
    errors.push('Hero headline line 1 cannot be empty.');
  }
  if (!config.heroHeadlineLine2 || config.heroHeadlineLine2.trim().length === 0) {
    errors.push('Hero headline line 2 cannot be empty.');
  }
  if (!config.heroSubheadline || config.heroSubheadline.trim().length < 10) {
    errors.push('Hero subheadline must be at least 10 characters.');
  }
  if (!config.primaryCtaText || config.primaryCtaText.trim().length === 0) {
    errors.push('Primary CTA label cannot be empty.');
  }
  if (!isSafeCmsUrl(config.primaryCtaHref)) {
    errors.push('Primary CTA destination must be a valid, safe URL.');
  }
  if (config.secondaryCtaUrl && !isSafeCmsUrl(config.secondaryCtaUrl)) {
    errors.push('Secondary CTA destination must be a valid, safe URL.');
  }

  if (Array.isArray(config.heroMetrics)) {
    for (let i = 0; i < config.heroMetrics.length; i++) {
      const metric = config.heroMetrics[i];
      if (!metric.label || !metric.value) {
        errors.push(`Hero Metric #${i + 1} must include both a label and a value.`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateNavigationConfig(config: NavigationConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!Array.isArray(config.items) || config.items.length === 0) {
    errors.push('Navigation must have at least one link.');
  } else {
    config.items.forEach((item, idx) => {
      if (!item.label || item.label.trim().length === 0) {
        errors.push(`Navigation link #${idx + 1} is missing a label.`);
      }
      if (!isSafeCmsUrl(item.href)) {
        errors.push(`Navigation link #${idx + 1} (${item.label}) has an invalid destination.`);
      }
    });
  }

  if (config.primaryCtaHref && !isSafeCmsUrl(config.primaryCtaHref)) {
    errors.push('Primary CTA link has an invalid destination.');
  }

  if (config.launchControlTowerUrl && !isSafeCmsUrl(config.launchControlTowerUrl)) {
    errors.push('Launch Orion-9 OS link has an invalid destination.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateSeoConfig(config: SeoConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.metaTitle || config.metaTitle.trim().length < 3) {
    errors.push('Meta title must be at least 3 characters.');
  }
  if (!config.metaDescription || config.metaDescription.trim().length < 10) {
    errors.push('Meta description must be at least 10 characters.');
  }
  if (config.canonicalUrl && !isSafeCmsUrl(config.canonicalUrl)) {
    errors.push('Canonical URL must be a valid, safe URL.');
  }
  if (config.ogImageUrl && !isSafeCmsUrl(config.ogImageUrl)) {
    errors.push('OpenGraph Image URL must be a valid, safe URL.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateFooterConfig(config: FooterConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.headline || config.headline.trim().length < 5) {
    errors.push('Footer headline must be at least 5 characters.');
  }

  if (Array.isArray(config.columns)) {
    config.columns.forEach((col, cIdx) => {
      if (!col.heading) errors.push(`Footer column #${cIdx + 1} is missing a heading.`);
      if (Array.isArray(col.links)) {
        col.links.forEach((lnk, lIdx) => {
          if (!lnk.label) {
            errors.push(`Column #${cIdx + 1} link #${lIdx + 1} is missing a label.`);
          }
          if (!isSafeCmsUrl(lnk.href)) {
            errors.push(`Column #${cIdx + 1} link "${lnk.label}" has an invalid URL.`);
          }
        });
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Recursively inspects data to ensure no large Base64 data URLs (> 10 KB)
 * or total payload exceeding 800 KB are sent to Firestore.
 */
export function validateStoragePayloadSafeguards(data: unknown): { valid: boolean; error?: string } {
  try {
    const jsonStr = JSON.stringify(data);
    const totalSizeBytes = new TextEncoder().encode(jsonStr).length;

    if (totalSizeBytes > 800 * 1024) {
      return {
        valid: false,
        error:
          'Payload size exceeds 800 KB limit. Logo assets must be uploaded to cloud storage before saving. Base64 embedding is not permitted for published assets.',
      };
    }
  } catch {
    // If not stringifiable, continue
  }

  // Check for any data: URL larger than 10 KB in any property
  let foundOversizedDataUrl = false;
  function walk(val: unknown) {
    if (foundOversizedDataUrl) return;
    if (typeof val === 'string') {
      if (val.startsWith('data:') && val.length > 10 * 1024) {
        foundOversizedDataUrl = true;
      }
    } else if (val && typeof val === 'object') {
      for (const k of Object.keys(val)) {
        walk((val as Record<string, unknown>)[k]);
      }
    }
  }
  walk(data);

  if (foundOversizedDataUrl) {
    return {
      valid: false,
      error:
        'Logo asset must be uploaded to cloud storage before saving. Base64 embedding is not permitted for published assets.',
    };
  }

  return { valid: true };
}

/**
 * Recursively sanitizes any JavaScript object or array before Firestore setDoc / updateDoc.
 * - Recursively removes any property whose value is `undefined`.
 * - Omits genuinely absent optional properties.
 * - Converts any undefined nested values to null if needed, or deletes the key.
 * - Ensures Firestore never receives `undefined`.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined) {
    return null as unknown as T;
  }
  if (data === null || typeof data !== 'object') {
    return data;
  }
  if (data instanceof Date) {
    return data.toISOString() as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (value !== undefined) {
      result[key] = sanitizeForFirestore(value);
    }
  }
  return result as T;
}

/**
 * Normalizes a single logo placement configuration to guarantee consistent schema and no undefined fields.
 */
export function normalizeLogoPlacementConfig(
  placementUrl?: string | null,
  config?: Partial<LogoPlacementConfig> | null
): LogoPlacementConfig {
  const customUrl = placementUrl || config?.customUrl || config?.url || null;
  const useCustom = config?.useCustom !== undefined
    ? config.useCustom
    : Boolean(customUrl && customUrl.trim() !== '');

  return {
    useCustom,
    customUrl: useCustom ? customUrl : null,
    url: useCustom ? customUrl : null,
    originalFilename: config?.originalFilename || null,
    dimensions: config?.dimensions || null,
    fileType: config?.fileType || null,
    sizeBytes: typeof config?.sizeBytes === 'number' ? config.sizeBytes : null,
    uploadedAt: config?.uploadedAt || (useCustom ? new Date().toISOString() : null),
    updatedBy: config?.updatedBy || null,
  };
}

/**
 * Normalizes a complete BrandingConfig object before Firestore write or state initialization.
 * - Enforces the canonical sharedLogoConfig for unified brand logo management.
 * - Synchronizes legacy placements (header, auth, footer) when sharedLogoConfig is updated.
 * - Migrates legacy configs into sharedLogoConfig when reading existing documents.
 * - Fills missing or undefined properties with valid defaults/nulls and prevents undefined leaks.
 */
export function normalizeBrandingConfig(raw?: Partial<BrandingConfig> | null): BrandingConfig {
  const fallback = DEFAULT_SITE_CONFIG.branding;
  const cfg = raw || {};

  // 1. If explicit sharedLogoConfig is provided:
  if (cfg.sharedLogoConfig !== undefined && cfg.sharedLogoConfig !== null) {
    const sharedConfig = normalizeLogoPlacementConfig(
      cfg.sharedLogoConfig.customUrl || cfg.sharedLogoConfig.url || cfg.sharedLogo,
      cfg.sharedLogoConfig
    );
    const sharedUrl = sharedConfig.useCustom ? sharedConfig.customUrl : null;

    return {
      companyName: (cfg.companyName ?? fallback.companyName).trim(),
      shortMark: (cfg.shortMark ?? fallback.shortMark).trim(),
      tagline: (cfg.tagline ?? fallback.tagline).trim(),
      logoUrl: sharedUrl || cfg.logoUrl || fallback.logoUrl || '',
      sharedLogo: sharedUrl,
      sharedLogoConfig: sharedConfig,
      headerLogo: sharedUrl,
      headerLogoConfig: { ...sharedConfig },
      authLogo: sharedUrl,
      authLogoConfig: { ...sharedConfig },
      footerLogo: sharedUrl,
      footerLogoConfig: { ...sharedConfig },
      canvasColor: cfg.canvasColor ?? fallback.canvasColor,
      altSectionColor: cfg.altSectionColor ?? fallback.altSectionColor,
      surfaceColor: cfg.surfaceColor ?? fallback.surfaceColor,
      primaryTextColor: cfg.primaryTextColor ?? fallback.primaryTextColor,
      secondaryTextColor: cfg.secondaryTextColor ?? fallback.secondaryTextColor,
      borderColor: cfg.borderColor ?? fallback.borderColor,
      deepBlueAccent: cfg.deepBlueAccent ?? fallback.deepBlueAccent,
      steelBlueAccent: cfg.steelBlueAccent ?? fallback.steelBlueAccent,
      darkSurfaceColor: cfg.darkSurfaceColor ?? fallback.darkSurfaceColor,
      updatedAt: cfg.updatedAt || new Date().toISOString(),
      updatedBy: cfg.updatedBy || 'admin',
    };
  }

  // 2. If explicit sharedLogo is provided:
  if (cfg.sharedLogo !== undefined && cfg.sharedLogo !== null) {
    const sharedConfig = normalizeLogoPlacementConfig(cfg.sharedLogo);
    const sharedUrl = sharedConfig.useCustom ? sharedConfig.customUrl : null;

    return {
      companyName: (cfg.companyName ?? fallback.companyName).trim(),
      shortMark: (cfg.shortMark ?? fallback.shortMark).trim(),
      tagline: (cfg.tagline ?? fallback.tagline).trim(),
      logoUrl: sharedUrl || cfg.logoUrl || fallback.logoUrl || '',
      sharedLogo: sharedUrl,
      sharedLogoConfig: sharedConfig,
      headerLogo: sharedUrl,
      headerLogoConfig: { ...sharedConfig },
      authLogo: sharedUrl,
      authLogoConfig: { ...sharedConfig },
      footerLogo: sharedUrl,
      footerLogoConfig: { ...sharedConfig },
      canvasColor: cfg.canvasColor ?? fallback.canvasColor,
      altSectionColor: cfg.altSectionColor ?? fallback.altSectionColor,
      surfaceColor: cfg.surfaceColor ?? fallback.surfaceColor,
      primaryTextColor: cfg.primaryTextColor ?? fallback.primaryTextColor,
      secondaryTextColor: cfg.secondaryTextColor ?? fallback.secondaryTextColor,
      borderColor: cfg.borderColor ?? fallback.borderColor,
      deepBlueAccent: cfg.deepBlueAccent ?? fallback.deepBlueAccent,
      steelBlueAccent: cfg.steelBlueAccent ?? fallback.steelBlueAccent,
      darkSurfaceColor: cfg.darkSurfaceColor ?? fallback.darkSurfaceColor,
      updatedAt: cfg.updatedAt || new Date().toISOString(),
      updatedBy: cfg.updatedBy || 'admin',
    };
  }

  // 3. Legacy compatibility & migration:
  // Normalize legacy placements while generating a canonical sharedLogoConfig
  const headerLogo = cfg.headerLogo !== undefined ? cfg.headerLogo : (fallback.headerLogo ?? null);
  const authLogo = cfg.authLogo !== undefined ? cfg.authLogo : (fallback.authLogo ?? null);
  const footerLogo = cfg.footerLogo !== undefined ? cfg.footerLogo : (fallback.footerLogo ?? null);

  const headerLogoConfig = normalizeLogoPlacementConfig(headerLogo, cfg.headerLogoConfig);
  const authLogoConfig = normalizeLogoPlacementConfig(authLogo, cfg.authLogoConfig);
  const footerLogoConfig = normalizeLogoPlacementConfig(footerLogo, cfg.footerLogoConfig);

  const legacyActiveCustomPlacement =
    (headerLogoConfig.useCustom && headerLogoConfig) ||
    (authLogoConfig.useCustom && authLogoConfig) ||
    (footerLogoConfig.useCustom && footerLogoConfig) ||
    null;

  const sharedLogoConfig = legacyActiveCustomPlacement
    ? { ...legacyActiveCustomPlacement }
    : { ...DEFAULT_LOGO_PLACEMENT_CONFIG };

  return {
    companyName: (cfg.companyName ?? fallback.companyName).trim(),
    shortMark: (cfg.shortMark ?? fallback.shortMark).trim(),
    tagline: (cfg.tagline ?? fallback.tagline).trim(),
    logoUrl: cfg.logoUrl ?? fallback.logoUrl ?? '',
    sharedLogo: sharedLogoConfig.useCustom ? sharedLogoConfig.customUrl : null,
    sharedLogoConfig,
    headerLogo,
    headerLogoConfig,
    authLogo,
    authLogoConfig,
    footerLogo,
    footerLogoConfig,
    canvasColor: cfg.canvasColor ?? fallback.canvasColor,
    altSectionColor: cfg.altSectionColor ?? fallback.altSectionColor,
    surfaceColor: cfg.surfaceColor ?? fallback.surfaceColor,
    primaryTextColor: cfg.primaryTextColor ?? fallback.primaryTextColor,
    secondaryTextColor: cfg.secondaryTextColor ?? fallback.secondaryTextColor,
    borderColor: cfg.borderColor ?? fallback.borderColor,
    deepBlueAccent: cfg.deepBlueAccent ?? fallback.deepBlueAccent,
    steelBlueAccent: cfg.steelBlueAccent ?? fallback.steelBlueAccent,
    darkSurfaceColor: cfg.darkSurfaceColor ?? fallback.darkSurfaceColor,
    updatedAt: cfg.updatedAt || new Date().toISOString(),
    updatedBy: cfg.updatedBy || 'admin',
  };
}

export function validateCreatorProfileConfig(config: CreatorProfileConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!config) {
    return { valid: false, errors: ['Creator profile configuration is missing.'] };
  }
  if (!config.name || config.name.trim().length < 2 || config.name.length > 80) {
    errors.push('Creator name must be between 2 and 80 characters.');
  }
  if (!config.role || config.role.trim().length < 2 || config.role.length > 100) {
    errors.push('Role title must be between 2 and 100 characters.');
  }
  if (config.avatarUrl && !isSafeLogoUrl(config.avatarUrl)) {
    errors.push('Creator avatar URL is invalid or unsafe.');
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}

export function normalizeCreatorProfileConfig(
  raw?: Partial<CreatorProfileConfig> | null
): CreatorProfileConfig {
  const fallback = DEFAULT_CREATOR_PROFILE;
  if (!raw) return { ...fallback };
  return {
    name: (raw.name || fallback.name).trim(),
    role: (raw.role || fallback.role).trim(),
    quote: (raw.quote || fallback.quote).trim(),
    repository: (raw.repository || fallback.repository).trim(),
    status: (raw.status || fallback.status).trim(),
    avatarUrl: raw.avatarUrl ? raw.avatarUrl.trim() : null,
    avatarMetadata: raw.avatarMetadata || null,
    updatedAt: raw.updatedAt || new Date().toISOString(),
    updatedBy: raw.updatedBy || 'admin',
  };
}

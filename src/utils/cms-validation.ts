import {
  BrandingConfig,
  HomepageConfig,
  NavigationConfig,
  SeoConfig,
  FooterConfig,
} from '../types/cms';

/**
 * Validates that a URL is safe for use in CTAs, navigation links, or media assets.
 * Rejects javascript:, data:, vbscript:, and malformed URLs.
 * Allows internal anchors (#...), relative paths (/...), and https:// or http://localhost URLs.
 */
/**
 * Validates that an image URL or uploaded data URI is safe for logo and media display.
 * Supports https://, relative paths (/...), and safe base64 data URIs (data:image/...).
 */
export function isSafeCmsImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed.length > 5242880) return false; // Up to 5MB

  const lower = trimmed.toLowerCase();
  // Safe base64 image data URIs
  if (
    lower.startsWith('data:image/png;base64,') ||
    lower.startsWith('data:image/jpeg;base64,') ||
    lower.startsWith('data:image/jpg;base64,') ||
    lower.startsWith('data:image/svg+xml;base64,') ||
    lower.startsWith('data:image/webp;base64,') ||
    lower.startsWith('data:image/gif;base64,')
  ) {
    return true;
  }

  // Reject unsafe schemes
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return false;
  }

  if (trimmed.startsWith('#') || trimmed.startsWith('/')) {
    if (trimmed.startsWith('//')) return false;
    return true;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:') return true;
    if (
      parsed.protocol === 'http:' &&
      (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

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
    if (parsed.protocol === 'https:') return true;
    if (
      parsed.protocol === 'http:' &&
      (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')
    ) {
      return true;
    }
    return false;
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
  if (config.logoUrl && !isSafeCmsImageUrl(config.logoUrl)) {
    errors.push('Logo URL must be a valid https://, relative /assets/ path, or uploaded image.');
  }
  if (config.customOrbUrl && !isSafeCmsImageUrl(config.customOrbUrl)) {
    errors.push('Auth Orb URL must be a valid https://, relative path, or uploaded image.');
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

  for (const [label, value] of colorFields) {
    if (!isValidHexColor(value)) {
      errors.push(`${label} must be a valid 6-digit hex color (e.g. #EAF4F8).`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateNavigationConfig(config: NavigationConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.primaryCtaLabel || config.primaryCtaLabel.trim().length < 2 || config.primaryCtaLabel.length > 45) {
    errors.push('Primary CTA label must be between 2 and 45 characters.');
  }
  if (!isSafeCmsUrl(config.primaryCtaHref)) {
    errors.push('Primary CTA destination must be a safe URL or section anchor.');
  }
  if (!config.launchControlTowerLabel || config.launchControlTowerLabel.trim().length < 2 || config.launchControlTowerLabel.length > 45) {
    errors.push('Launch Control Tower label must be between 2 and 45 characters.');
  }
  if (!isSafeCmsUrl(config.launchControlTowerUrl)) {
    errors.push('Launch Control Tower URL must be a valid https:// URL.');
  }

  config.items.forEach((item, idx) => {
    if (!item.label || item.label.trim().length === 0 || item.label.length > 40) {
      errors.push(`Navigation item #${idx + 1} label must be 1–40 characters.`);
    }
    if (!isSafeCmsUrl(item.href)) {
      errors.push(`Navigation item "${item.label || idx + 1}" has an unsafe or invalid URL.`);
    }
  });

  return { valid: errors.length === 0, errors };
}

export function validateHomepageConfig(config: HomepageConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.heroHeadlineLine1 || config.heroHeadlineLine1.trim().length < 3 || config.heroHeadlineLine1.length > 90) {
    errors.push('Hero headline line 1 must be between 3 and 90 characters.');
  }
  if (!config.heroHeadlineLine2 || config.heroHeadlineLine2.trim().length < 3 || config.heroHeadlineLine2.length > 90) {
    errors.push('Hero headline line 2 must be between 3 and 90 characters.');
  }
  if (!config.heroSubheadline || config.heroSubheadline.trim().length < 10 || config.heroSubheadline.length > 360) {
    errors.push('Hero subheadline must be between 10 and 360 characters.');
  }
  if (!config.primaryCtaText || config.primaryCtaText.trim().length < 2 || config.primaryCtaText.length > 45) {
    errors.push('Hero Primary CTA text must be between 2 and 45 characters.');
  }
  if (!isSafeCmsUrl(config.primaryCtaHref)) {
    errors.push('Hero Primary CTA link must be a safe anchor or https:// URL.');
  }
  if (!config.secondaryCtaText || config.secondaryCtaText.trim().length < 2 || config.secondaryCtaText.length > 45) {
    errors.push('Hero Secondary CTA text must be between 2 and 45 characters.');
  }
  if (!isSafeCmsUrl(config.secondaryCtaUrl)) {
    errors.push('Hero Secondary CTA URL must be a safe anchor or https:// URL.');
  }

  return { valid: errors.length === 0, errors };
}

export function validateSeoConfig(config: SeoConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.metaTitle || config.metaTitle.trim().length < 5 || config.metaTitle.length > 100) {
    errors.push('Meta title must be between 5 and 100 characters.');
  }
  if (!config.metaDescription || config.metaDescription.trim().length < 15 || config.metaDescription.length > 260) {
    errors.push('Meta description must be between 15 and 260 characters.');
  }
  if (config.ogImageUrl && !isSafeCmsUrl(config.ogImageUrl)) {
    errors.push('OpenGraph image URL must be a valid https:// or relative / path.');
  }
  if (config.canonicalUrl && !isSafeCmsUrl(config.canonicalUrl)) {
    errors.push('Canonical URL must be a valid https:// URL.');
  }

  return { valid: errors.length === 0, errors };
}

export function validateFooterConfig(config: FooterConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!config.headline || config.headline.trim().length < 3 || config.headline.length > 120) {
    errors.push('Footer headline must be between 3 and 120 characters.');
  }
  if (!config.copyrightText || config.copyrightText.trim().length < 4 || config.copyrightText.length > 160) {
    errors.push('Copyright notice must be between 4 and 160 characters.');
  }
  return { valid: errors.length === 0, errors };
}

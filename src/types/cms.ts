export interface NavItemConfig {
  id: string;
  label: string;
  href: string;
  visible: boolean;
}

export interface LogoPlacementMetadata {
  url: string;
  dimensions?: string;
  fileType?: string;
  sizeBytes?: number;
  uploadedAt?: string;
  originalFilename?: string;
}

export interface LogoPlacementConfig {
  useCustom: boolean;
  customUrl: string | null;
  url?: string | null;
  originalFilename?: string | null;
  dimensions?: string | null;
  fileType?: string | null;
  sizeBytes?: number | null;
  uploadedAt?: string | null;
  updatedBy?: string | null;
}

export interface BrandingConfig {
  companyName: string;
  shortMark: string;
  tagline: string;
  logoUrl: string;
  // Canonical unified static website logo
  sharedLogo?: string | null;
  sharedLogoConfig?: LogoPlacementConfig | null;
  // Legacy placements preserved for compatibility & migration
  headerLogo?: string | null;
  headerLogoConfig?: LogoPlacementConfig | null;
  authLogo?: string | null;
  authLogoConfig?: LogoPlacementConfig | null;
  footerLogo?: string | null;
  footerLogoConfig?: LogoPlacementConfig | null;
  canvasColor: string;
  altSectionColor: string;
  surfaceColor: string;
  primaryTextColor: string;
  secondaryTextColor: string;
  borderColor: string;
  deepBlueAccent: string;
  steelBlueAccent: string;
  darkSurfaceColor: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface NavigationConfig {
  items: NavItemConfig[];
  showSignIn: boolean;
  showSignUp: boolean;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  launchControlTowerLabel: string;
  launchControlTowerUrl: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface HeroMetricItem {
  id: string;
  label: string;
  value: string;
  detail: string;
}

export interface SectionVisibilityConfig {
  platformOverview: boolean;
  scrollStorytelling: boolean;
  supplyChainNetwork: boolean;
  operationalProblem: boolean;
  connectedOsModules: boolean;
  operationalIntelligence: boolean;
  controlTowerPreview: boolean;
  integrationsAndReadiness: boolean;
  finalCta: boolean;
}

export interface HomepageConfig {
  statusBadge: string;
  heroHeadlineLine1: string;
  heroHeadlineLine2: string;
  heroSubheadline: string;
  primaryCtaText: string;
  primaryCtaHref: string;
  secondaryCtaText: string;
  secondaryCtaUrl: string;
  heroMetrics: HeroMetricItem[];
  overviewEyebrow: string;
  overviewTitle: string;
  overviewDescription: string;
  networkEyebrow: string;
  networkTitle: string;
  networkSubtitle: string;
  intelligenceEyebrow: string;
  intelligenceTitle: string;
  intelligenceSubtitle: string;
  controlTowerEyebrow: string;
  controlTowerTitle: string;
  controlTowerSubtitle: string;
  integrationsEyebrow: string;
  integrationsTitle: string;
  integrationsSubtitle: string;
  finalCtaEyebrow: string;
  finalCtaTitle: string;
  finalCtaSubtitle: string;
  sectionVisibility: SectionVisibilityConfig;
  updatedAt?: string;
  updatedBy?: string;
}

export interface FooterLinkGroup {
  id: string;
  heading: string;
  links: { label: string; href: string }[];
}

export interface FooterConfig {
  headline: string;
  description: string;
  copyrightText: string;
  securityBadges: string[];
  columns: FooterLinkGroup[];
  updatedAt?: string;
  updatedBy?: string;
}

export interface SeoConfig {
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  canonicalUrl: string;
  indexable: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

export interface AuthSettingsConfig {
  allowEmailSignup: boolean;
  allowGoogleAuth: boolean;
  allowPasswordReset: boolean;
  requireEmailVerificationForLaunch: boolean;
  sessionPersistenceMode: 'local' | 'session';
  updatedAt?: string;
  updatedBy?: string;
}

export interface MediaAssetItem {
  id: string;
  title: string;
  category: 'hero-3d' | 'brand-logo' | 'og-image' | 'diagram';
  url: string;
  altText: string;
  dimensions: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorUid: string;
  actorEmail: string;
  section: string;
  action: 'publish' | 'save_draft' | 'reset_defaults' | 'auth_config' | 'role_check';
  summary: string;
  timestamp: string;
}

export type DesktopPlatform =
  | 'windows-x64'
  | 'windows-arm64'
  | 'macos-universal'
  | 'macos-arm64'
  | 'macos-x64';

export type DesktopPackageFormat = 'exe' | 'msi' | 'dmg' | 'pkg';

export type DesktopReleaseStatus = 'draft' | 'published' | 'disabled' | 'retired';

export interface DesktopReleaseRecord {
  id: string;
  version: string;
  releaseDate: string;
  platform: DesktopPlatform;
  format: DesktopPackageFormat;
  status: DesktopReleaseStatus;
  filename: string;
  sizeBytes: number;
  sha256: string;
  downloadUrl: string;
  channel: 'stable' | 'beta';
  isLatest: boolean;
  releaseNotes: string[];
  minimumOs: string;
  downloadCount: number;
  preflightGates: {
    peValidated: boolean;
    shaVerified: boolean;
    signatureChecked: boolean;
  };
  updatedAt?: string;
  updatedBy?: string;
}

export interface SiteConfigurationBundle {
  branding: BrandingConfig;
  navigation: NavigationConfig;
  homepage: HomepageConfig;
  footer: FooterConfig;
  seo: SeoConfig;
  authSettings: AuthSettingsConfig;
  mediaLibrary: MediaAssetItem[];
  desktopReleases?: DesktopReleaseRecord[];
}

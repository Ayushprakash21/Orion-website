export interface NavItemConfig {
  id: string;
  label: string;
  href: string;
  visible: boolean;
}

export interface BrandingConfig {
  companyName: string;
  shortMark: string;
  tagline: string;
  logoUrl: string;
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

export interface SiteConfigurationBundle {
  branding: BrandingConfig;
  navigation: NavigationConfig;
  homepage: HomepageConfig;
  footer: FooterConfig;
  seo: SeoConfig;
  authSettings: AuthSettingsConfig;
  mediaLibrary: MediaAssetItem[];
}

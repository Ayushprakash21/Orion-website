import { SiteConfigurationBundle, DesktopReleaseRecord } from '../types/cms';
import { DEFAULT_ORION_APP_URL } from '../utils/auth-validation';

export const DEFAULT_DESKTOP_RELEASES: DesktopReleaseRecord[] = [
  {
    id: 'rel-9-0-0',
    version: '9.0.0',
    releaseDate: '2026-10-26',
    platform: 'windows-x64',
    filename: 'Orion-9-Setup.exe',
    sizeBytes: 30336791,
    sha256: 'e2dfeb480522b9da077bb58e0954d6d8e09f1023fb6af28b8b74b2a8dc23ee70',
    downloadUrl: `${DEFAULT_ORION_APP_URL}api/download/desktop`,
    channel: 'stable',
    isLatest: true,
    releaseNotes: [
      'Official Orion-9 Windows 64-bit installer with NSIS packaging.',
      'Native WebView2 runtime surface for unconstrained web and system integration.',
      'Integrated enterprise single sign-on with Firebase and Cloudflare Edge.',
      'Zero-trust security boundary with verified cryptographic PE integrity hash.'
    ],
    minimumOs: 'Windows 10 / 11 64-bit',
    preflightGates: {
      peValidated: true,
      shaVerified: true,
      signatureChecked: true,
    },
  }
];

export const DEFAULT_SITE_CONFIG: SiteConfigurationBundle = {
  branding: {
    companyName: 'Orion-9',
    shortMark: 'Ω9',
    tagline: 'The New Standard in Supply Chain Control',
    logoUrl: '',
    canvasColor: '#F2F9FD',
    altSectionColor: '#FFFFFF',
    surfaceColor: '#FFFFFF',
    primaryTextColor: '#070B19',
    secondaryTextColor: '#475569',
    borderColor: '#DCE7F0',
    deepBlueAccent: '#070B19',
    steelBlueAccent: '#94B8D0',
    darkSurfaceColor: '#050716',
  },
  navigation: {
    items: [
      { id: 'nav-overview', label: 'Our Process', href: '#process', visible: true },
      { id: 'nav-network', label: 'Capabilities', href: '#capabilities', visible: true },
      { id: 'nav-tower', label: 'Control Tower', href: '#control-tower', visible: true },
      { id: 'nav-integrations', label: 'Readiness', href: '#faq', visible: true },
    ],
    showSignIn: true,
    showSignUp: true,
    primaryCtaLabel: 'Launch Control Tower',
    primaryCtaHref: DEFAULT_ORION_APP_URL,
    launchControlTowerLabel: 'Launch Control Tower',
    launchControlTowerUrl: DEFAULT_ORION_APP_URL,
  },
  homepage: {
    statusBadge: 'ORION-9 OS · SUPPLY CHAIN OPERATING SYSTEM',
    heroHeadlineLine1: 'The New Standard in',
    heroHeadlineLine2: 'Supply Chain Control',
    heroSubheadline:
      'Autonomous risk sensing, canonical graph intelligence, and governed execution—built to keep global operations moving.',
    primaryCtaText: 'Launch Control Tower',
    primaryCtaHref: DEFAULT_ORION_APP_URL,
    secondaryCtaText: 'Scroll to Discover Our Process',
    secondaryCtaUrl: '#process',
    heroMetrics: [
      {
        id: 'hm-1',
        label: 'SYNCHRONIZED NODES',
        value: '142 Ports & Hubs',
        detail: 'Real-time AIS, ADS-B & telematics lock',
      },
      {
        id: 'hm-2',
        label: 'SIGNAL THROUGHPUT',
        value: '42.8K Events/s',
        detail: 'Canonical ontology reconciliation',
      },
      {
        id: 'hm-3',
        label: 'DECISION LATENCY',
        value: '< 180 Seconds',
        detail: 'From anomaly detection to governed reroute',
      },
      {
        id: 'hm-4',
        label: 'SLA INTEGRITY',
        value: '99.8% Protected',
        detail: 'Multi-objective cost & speed optimization',
      },
    ],
    overviewEyebrow: '01 / PROCESS',
    overviewTitle: 'Signal Activation, Simplified.',
    overviewDescription:
      'Connect your ERP, TMS, and carrier endpoints once, and Orion-9 handles the rest.',
    networkEyebrow: '02 / VERIFICATION',
    networkTitle: 'Cleared to Count.',
    networkSubtitle:
      'Every vessel manifest, customs clearance, and sub-assembly lot is continuously verified against live port berth capacity.',
    intelligenceEyebrow: '03 / SOLVER MATRIX',
    intelligenceTitle: 'Proven Corridor Match.',
    intelligenceSubtitle:
      'Evaluates 8,500+ multi-objective reroute pathways per second to protect your SLAs.',
    controlTowerEyebrow: '04 / GOVERNED EXECUTION',
    controlTowerTitle: 'Seamless Governed Arrival.',
    controlTowerSubtitle:
      'Authorized interventions dispatch directly into SAP, Oracle, and carrier EDI with cryptographic auditability.',
    integrationsEyebrow: '05 / CAPABILITIES',
    integrationsTitle: "Designed for today's operations, beyond legacy supply chain workflows.",
    integrationsSubtitle:
      'Rapid activation, rigorous graph resolution, 100% verification before arrival, and controlled SLA outcomes.',
    finalCtaEyebrow: '06 / PRODUCTION DEPLOYMENT',
    finalCtaTitle: 'Command your supply chain with fast response, and execution you can rely on.',
    finalCtaSubtitle:
      'Create an operator account, connect your enterprise ERP, or launch the live Orion-9 Control Tower.',
    sectionVisibility: {
      platformOverview: true,
      scrollStorytelling: true,
      supplyChainNetwork: true,
      operationalProblem: true,
      connectedOsModules: true,
      operationalIntelligence: true,
      controlTowerPreview: true,
      integrationsAndReadiness: true,
      finalCta: true,
    },
  },
  footer: {
    headline: 'Command your supply chain with fast response, and execution you can rely on.',
    description:
      'Unifying real-time multi-modal telemetry, canonical graph digital twins, stochastic risk optimization, and governed workflow actuation.',
    copyrightText: `© ${new Date().getFullYear()} Orion-9 Technologies Inc. All rights reserved.`,
    securityBadges: ['SOC 2 TYPE II CERTIFIED', 'ISO 27001 COMPLIANT', 'ZERO-TRUST ARCHITECTURE'],
    columns: [
      {
        id: 'col-platform',
        heading: 'Platform',
        links: [
          { label: 'Our Process', href: '#process' },
          { label: 'Capabilities', href: '#capabilities' },
          { label: 'Control Tower Cockpit', href: '#control-tower' },
          { label: 'Operational Readiness', href: '#faq' },
        ],
      },
      {
        id: 'col-intelligence',
        heading: 'Architecture & Access',
        links: [
          { label: 'Operator Sign In', href: '/login' },
          { label: 'Create Account', href: '/signup' },
          { label: 'Admin Console', href: '/admin/login' },
        ],
      },
    ],
  },
  seo: {
    metaTitle: 'Orion-9 | The New Standard in Supply Chain Control',
    metaDescription:
      'Orion-9 is an AI-powered Supply Chain Operating System and Control Tower connecting global freight visibility, inventory intelligence, risk sensing, and governed execution.',
    ogTitle: 'Orion-9 | Autonomous Supply Chain Operating System',
    ogDescription:
      'Autonomous risk sensing, canonical graph intelligence, and governed execution—engineered to keep global operations moving.',
    ogImageUrl: '',
    canonicalUrl: 'https://orion-9-webos.ai.studio/',
    indexable: true,
  },
  authSettings: {
    allowEmailSignup: true,
    allowGoogleAuth: true,
    allowPasswordReset: true,
    requireEmailVerificationForLaunch: false,
    sessionPersistenceMode: 'local',
  },
  mediaLibrary: [
    {
      id: 'media-1',
      title: 'Orion-9 Miniature Supply-Chain World',
      category: 'hero-3d',
      url: '/#process',
      altText: 'Full-viewport scroll-choreographed 3D miniature supply chain world',
      dimensions: 'Full-Viewport WebGL Stage',
      updatedAt: '2026-10-26',
    },
    {
      id: 'media-2',
      title: 'Isometric Operational Capabilities Suite',
      category: 'diagram',
      url: '/#capabilities',
      altText: '4-column isometric technical illustration suite',
      dimensions: 'Responsive Editorial Grid',
      updatedAt: '2026-10-26',
    },
    {
      id: 'media-3',
      title: 'Control Tower Operational Cockpit',
      category: 'diagram',
      url: '/#control-tower',
      altText: 'Live vs bottleneck vs autonomous bypass telemetry inspection',
      dimensions: '1440x900 HD Interface',
      updatedAt: '2026-10-26',
    },
  ],
  desktopReleases: DEFAULT_DESKTOP_RELEASES,
};

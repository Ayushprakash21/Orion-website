import { SiteConfigurationBundle } from '../types/cms';
import { DEFAULT_ORION_APP_URL } from '../utils/auth-validation';

export const DEFAULT_SITE_CONFIG: SiteConfigurationBundle = {
  branding: {
    companyName: 'Orion-9',
    shortMark: 'Ω9',
    tagline: 'The Intelligence Layer for Global Supply Chains',
    logoUrl: '',
    canvasColor: '#EAF4F8',
    altSectionColor: '#F5F9FB',
    surfaceColor: '#FFFFFF',
    primaryTextColor: '#111827',
    secondaryTextColor: '#566575',
    borderColor: '#D5E1E8',
    deepBlueAccent: '#294D6B',
    steelBlueAccent: '#A8C2D2',
    darkSurfaceColor: '#101820',
  },
  navigation: {
    items: [
      { id: 'nav-overview', label: 'Platform', href: '#platform-overview', visible: true },
      { id: 'nav-network', label: 'Global Network', href: '#network', visible: true },
      { id: 'nav-intelligence', label: 'Decision Engine', href: '#intelligence-pipeline', visible: true },
      { id: 'nav-tower', label: 'Control Tower', href: '#control-tower-preview', visible: true },
      { id: 'nav-integrations', label: 'Architecture', href: '#architecture', visible: true },
    ],
    showSignIn: true,
    showSignUp: true,
    primaryCtaLabel: 'Explore Orion-9',
    primaryCtaHref: '#platform-overview',
    launchControlTowerLabel: 'Launch Control Tower',
    launchControlTowerUrl: DEFAULT_ORION_APP_URL,
  },
  homepage: {
    statusBadge: 'ORION-9 OS · AUTONOMOUS SUPPLY CHAIN CONTROL TOWER',
    heroHeadlineLine1: 'Global logistics,',
    heroHeadlineLine2: 'orchestrated in real time.',
    heroSubheadline:
      'Orion-9 unifies multi-tier supplier telemetry, maritime and air corridors, inventory buffers, and governed AI decision workflows inside one spatial operating system.',
    primaryCtaText: 'Explore Orion-9',
    primaryCtaHref: '#platform-overview',
    secondaryCtaText: 'Launch Control Tower',
    secondaryCtaUrl: DEFAULT_ORION_APP_URL,
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
        value: '99.4% Protected',
        detail: 'Multi-objective cost & speed optimization',
      },
    ],
    overviewEyebrow: '01 · PLATFORM OVERVIEW',
    overviewTitle: 'An AI-Powered Supply Chain Operating System & Control Tower.',
    overviewDescription:
      'Built for complex global enterprises, Orion-9 replaces fragmented spreadsheets, delayed EDI batches, and isolated regional dashboards with a living digital twin of your entire physical operation.',
    networkEyebrow: '02 · SUPPLY CHAIN NETWORK',
    networkTitle: 'Every Vessel, Aircraft, Corridor, and Warehouse in Motion.',
    networkSubtitle:
      'Inspect live multi-modal corridors across sea, air, and continental road networks. Simulate chokepoint disruptions and evaluate autonomous reroute pathways in 3D.',
    intelligenceEyebrow: '03 · OPERATIONAL INTELLIGENCE',
    intelligenceTitle: 'From Raw Signal Detection to Governed Execution.',
    intelligenceSubtitle:
      'Orion-9 transforms fragmented logistics telemetry into deterministic, auditable operational actions across a seven-stage intelligence pipeline.',
    controlTowerEyebrow: '04 · CONTROL TOWER EXPERIENCE',
    controlTowerTitle: 'One Command Cockpit for Global Operations.',
    controlTowerSubtitle:
      'Monitor live shipment trajectories, multi-echelon inventory buffers, and AI-prioritized exceptions with clear separation between interactive simulation and production telemetry.',
    integrationsEyebrow: '05 · INTEGRATIONS & ENTERPRISE READINESS',
    integrationsTitle: 'Seven Layers of Resilient Orchestration.',
    integrationsSubtitle:
      'Bi-directional adapters for SAP S/4HANA, Oracle SCM, Manhattan WMS, carrier EDIFACT streams, and sovereign zero-trust deployment environments.',
    finalCtaEyebrow: '06 · PRODUCTION DEPLOYMENT',
    finalCtaTitle: 'Ready to orchestrate your global supply chain?',
    finalCtaSubtitle:
      'Create an operator account, sign in to your workspace, or launch the live Orion-9 Control Tower.',
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
    headline: 'The Intelligence Layer for Global Supply Chains.',
    description:
      'Unifying real-time multi-modal telemetry, canonical graph digital twins, stochastic risk optimization, and governed workflow actuation.',
    copyrightText: `© ${new Date().getFullYear()} Orion-9 Technologies Inc. All rights reserved.`,
    securityBadges: ['SOC 2 TYPE II CERTIFIED', 'ISO 27001 COMPLIANT', 'ZERO-TRUST ARCHITECTURE'],
    columns: [
      {
        id: 'col-platform',
        heading: 'Platform',
        links: [
          { label: 'Platform Overview', href: '#platform-overview' },
          { label: '3D Narrative Chapters', href: '#storytelling' },
          { label: 'Global Supply Network', href: '#network' },
          { label: '8 Core OS Modules', href: '#os-modules' },
        ],
      },
      {
        id: 'col-intelligence',
        heading: 'Intelligence & Trust',
        links: [
          { label: '7-Stage Decision Pipeline', href: '#intelligence-pipeline' },
          { label: 'Control Tower Cockpit', href: '#control-tower-preview' },
          { label: 'Enterprise Integrations', href: '#architecture' },
          { label: 'Admin Console', href: '/admin/login' },
        ],
      },
    ],
  },
  seo: {
    metaTitle: 'Orion-9 | The Intelligence Layer for Global Supply Chains',
    metaDescription:
      'Orion-9 is an AI-powered Supply Chain Operating System and Control Tower connecting global freight visibility, inventory intelligence, risk sensing, and governed execution.',
    ogTitle: 'Orion-9 | Autonomous Supply Chain Operating System',
    ogDescription:
      'Unify global logistics routes, supplier networks, inventory buffers, and AI decision workflows in real time.',
    ogImageUrl: '',
    canonicalUrl: 'https://orion-9.ayushprakash0021.workers.dev/',
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
      title: 'Orion-9 Global 3D Orbital Core',
      category: 'hero-3d',
      url: '/#hero-3d-scene',
      altText: 'Interactive Three.js 3D global supply chain centerpiece with graphite geometry and ice-blue lighting',
      dimensions: 'Responsive WebGL Viewport',
      updatedAt: '2026-10-25',
    },
    {
      id: 'media-2',
      title: 'Multi-Modal Corridor Digital Twin',
      category: 'diagram',
      url: '/#network',
      altText: 'Real-time maritime, air cargo, and continental road freight simulation canvas',
      dimensions: '16:9 Interactive Stage',
      updatedAt: '2026-10-25',
    },
    {
      id: 'media-3',
      title: 'Control Tower Operational Cockpit',
      category: 'diagram',
      url: '/#control-tower-preview',
      altText: 'Dark application surface (#101820) showcasing live vs simulated shipment telemetry',
      dimensions: '1440x900 HD Interface',
      updatedAt: '2026-10-25',
    },
  ],
};

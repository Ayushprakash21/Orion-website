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
    secondaryTextColor: '#4A5568',
    borderColor: '#D5E1E8',
    deepBlueAccent: '#294D6B',
    steelBlueAccent: '#A8C2D2',
    darkSurfaceColor: '#0B131F',
  },
  navigation: {
    items: [
      { id: 'nav-overview', label: 'Platform', href: '#problem', visible: true },
      { id: 'nav-network', label: 'Global Network', href: '#network', visible: true },
      { id: 'nav-intelligence', label: 'Decision Intelligence', href: '#intelligence', visible: true },
      { id: 'nav-tower', label: 'Control Tower', href: '#control-tower', visible: true },
      { id: 'nav-integrations', label: 'Architecture', href: '#architecture', visible: true },
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
    heroHeadlineLine1: 'One intelligent system for',
    heroHeadlineLine2: "the world's supply chains.",
    heroSubheadline:
      'Orion-9 connects enterprise supply-chain data, identifies operational risks across global corridors, and coordinates governed decisions across the network in real time.',
    primaryCtaText: 'Launch Control Tower',
    primaryCtaHref: DEFAULT_ORION_APP_URL,
    secondaryCtaText: 'Explore the Platform',
    secondaryCtaUrl: '#problem',
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
    overviewEyebrow: '01 / PLATFORM OVERVIEW',
    overviewTitle: 'An AI-Powered Supply Chain Operating System & Control Tower.',
    overviewDescription:
      'Built for complex global enterprises, Orion-9 replaces fragmented spreadsheets, delayed EDI batches, and isolated regional dashboards with a living digital twin of your entire physical operation.',
    networkEyebrow: '02 / GLOBAL TOPOLOGY',
    networkTitle: 'One Connected Physical Picture.',
    networkSubtitle:
      'From raw semiconductor foundries to deep-water berths, intermodal corridors, and factory assembly lines.',
    intelligenceEyebrow: '03 / DECISION INTELLIGENCE',
    intelligenceTitle: 'From Signal to Governed Decision.',
    intelligenceSubtitle:
      'Transform real-time logistics events into auditable, multi-objective operational interventions in minutes.',
    controlTowerEyebrow: '04 / CONTROL TOWER COCKPIT',
    controlTowerTitle: 'One Command Cockpit for Global Operations.',
    controlTowerSubtitle:
      'Monitor live shipment trajectories, multi-echelon inventory buffers, and authorized exception interventions.',
    integrationsEyebrow: '05 / ENTERPRISE ARCHITECTURE',
    integrationsTitle: 'Engineered for Zero-Trust Enterprise Scale.',
    integrationsSubtitle:
      'A 4-pillar architectural foundation connecting legacy enterprise infrastructure with deterministic autonomous intelligence.',
    finalCtaEyebrow: '06 / PRODUCTION DEPLOYMENT',
    finalCtaTitle: 'Ready to orchestrate your global supply chain?',
    finalCtaSubtitle:
      'Create an operator account, connect your enterprise ERP, or launch the live Orion-9 Control Tower.',
    sectionVisibility: {
      platformOverview: true,
      scrollStorytelling: false,
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
          { label: 'Systemic Problem', href: '#problem' },
          { label: 'Global Network Topology', href: '#network' },
          { label: 'Decision Intelligence', href: '#intelligence' },
          { label: 'Control Tower Cockpit', href: '#control-tower' },
        ],
      },
      {
        id: 'col-intelligence',
        heading: 'Architecture & Access',
        links: [
          { label: 'Enterprise Architecture', href: '#architecture' },
          { label: 'Operator Sign In', href: '/login' },
          { label: 'Create Account', href: '/signup' },
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
      'Orion-9 connects enterprise supply-chain data, identifies operational risks, and coordinates governed decisions across the network in real time.',
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
      title: 'Orion-9 Sculptural Logistics Network',
      category: 'hero-3d',
      url: '/#hero-3d-scene',
      altText: 'Interactive Three.js sculptural logistics network with steel-blue and graphite craft',
      dimensions: 'Responsive WebGL Stage',
      updatedAt: '2026-10-26',
    },
    {
      id: 'media-2',
      title: 'Multi-Modal Corridor Digital Twin',
      category: 'diagram',
      url: '/#network',
      altText: 'Real-time maritime, air cargo, and continental road freight simulation canvas',
      dimensions: '16:9 Interactive Stage',
      updatedAt: '2026-10-26',
    },
    {
      id: 'media-3',
      title: 'Control Tower Operational Cockpit',
      category: 'diagram',
      url: '/#control-tower',
      altText: 'Dark application surface (#0B131F) showcasing live vs simulated shipment telemetry',
      dimensions: '1440x900 HD Interface',
      updatedAt: '2026-10-26',
    },
  ],
};

import React, { useEffect, useState } from 'react';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { useSiteConfig } from '../../context/SiteConfigContext';
import {
  Sparkles,
  Layers,
  Compass,
  Lightbulb,
  User,
  Shield,
  Activity,
  History,
  Zap,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Database,
  Cpu,
  Lock,
  ChevronRight,
  ExternalLink,
  Quote,
  Clock,
  Check,
  Server,
  FileCode,
} from 'lucide-react';

interface AboutPageProps {
  onNavigate?: (path: string) => void;
  onOpenDownload?: () => void;
}

// Section Anchors for Sticky Sub-Nav
const SECTION_NAV = [
  { id: 'overview', label: 'Overview' },
  { id: 'why-orion-9', label: 'Why Orion-9' },
  { id: 'the-idea', label: 'The Idea' },
  { id: 'created-by', label: 'Created By' },
  { id: 'core-principles', label: 'Core Principles' },
  { id: 'system-architecture', label: 'Architecture' },
  { id: 'whats-new', label: "What's New" },
  { id: 'documentation', label: 'Documentation' },
];

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, onOpenDownload }) => {
  const { activeConfig } = useSiteConfig();
  const companyName = activeConfig.branding.companyName || 'Orion-9';
  const creator = activeConfig.creatorProfile;
  const [avatarLoadFailed, setAvatarLoadFailed] = useState<boolean>(false);

  const [activeSection, setActiveSection] = useState<string>('overview');

  useEffect(() => {
    // Check initial hash on mount
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setActiveSection(hash);
      const el = document.getElementById(hash);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 120);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleHashChange = () => {
      const currentHash = window.location.hash.replace('#', '');
      if (currentHash) {
        setActiveSection(currentHash);
        const el = document.getElementById(currentHash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    // Dynamic scroll spy for sticky sub-nav
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-15% 0px -70% 0px',
        threshold: 0,
      }
    );

    const sectionElements = SECTION_NAV
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    sectionElements.forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      observer.disconnect();
    };
  }, []);

  const scrollToAnchor = (id: string) => {
    setActiveSection(id);
    if (id === 'overview') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.pushState({}, '', '/about');
      return;
    }
    window.history.pushState({}, '', `#${id}`);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRoute = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  // 10-Step Operating Loop from OS Repository
  const operatingLoop = [
    { num: '01', label: 'SENSE', desc: 'Continuous telemetry ingestion across logistics nodes and external risk feeds.' },
    { num: '02', label: 'UNDERSTAND', desc: 'Connect signals to suppliers, shipments, SKUs, and commitments in the world graph.' },
    { num: '03', label: 'PREDICT', desc: 'Forecast lead-time drift, buffer depletion, and stockout probabilities.' },
    { num: '04', label: 'SIMULATE', desc: 'Test alternative mitigation corridors, inventory reallocations, and expedites.' },
    { num: '05', label: 'DECIDE', desc: 'Compare financial costs against service-level agreements and SLA penalties.' },
    { num: '06', label: 'APPROVE', desc: 'Apply business rules and human-in-the-loop authorization thresholds.' },
    { num: '07', label: 'ACT', desc: 'Dispatch validated kernel commands directly to execution endpoints.' },
    { num: '08', label: 'VERIFY', desc: 'Measure post-execution telemetry against expected outcomes.' },
    { num: '09', label: 'REMEMBER', desc: 'Store decision rationale, causation chains, and supplier performance in memory.' },
    { num: '10', label: 'LEARN', desc: 'Continuously refine optimization weights and recommendations based on real outcomes.' },
  ];

  // 7 Core Principles from OS Repository
  const corePrinciples = [
    {
      num: '01',
      title: 'One Operating Environment',
      desc: 'Replaces fragmented ERP modules, supply chain software tools, spreadsheets, and disconnected dashboards with a single unified operating system environment.',
      icon: Layers,
    },
    {
      num: '02',
      title: 'Data Connected',
      desc: 'Builds a dynamic entity-relationship world graph connecting suppliers, purchase orders, shipments, warehouses, SKUs, inventory buffers, and customer commitments.',
      icon: Database,
    },
    {
      num: '03',
      title: 'Events Drive Awareness',
      desc: 'Operates on continuous, real-time event signals rather than delayed batch ETLs, allowing immediate sensing of disruptions, anomalies, and lead time variance.',
      icon: Zap,
    },
    {
      num: '04',
      title: 'AI Governed',
      desc: 'Combines predictive machine learning with deterministic policy constraints to automate root-cause detection, risk scoring, and counterfactual simulation.',
      icon: Cpu,
    },
    {
      num: '05',
      title: 'Humans in Control',
      desc: 'Enforces human-in-the-loop authorization thresholds, step-up security verification, granular RBAC, and policy boundaries before executing financial or operational actions.',
      icon: Shield,
    },
    {
      num: '06',
      title: 'Decisions Create Outcomes',
      desc: 'Transforms raw intelligence into prioritized operational decisions, comparing costs, service-level trade-offs, and economic impact before action.',
      icon: Activity,
    },
    {
      num: '07',
      title: 'System Learns',
      desc: 'Continuously measures expected vs actual outcomes of executed decisions, storing resolution history in the memory fabric to improve future recommendations.',
      icon: Sparkles,
    },
  ];

  // 14 Core Engines Status from OS Repository
  const coreEngines = [
    { name: 'DATA ENGINE', status: 'IMPLEMENTED', purpose: 'Ingestion, normalization, and entity resolution across enterprise feeds.' },
    { name: 'WORLD MODEL', status: 'IMPLEMENTED', purpose: 'Current, historical, and future digital twin state representation.' },
    { name: 'EVENT ENGINE', status: 'IMPLEMENTED', purpose: 'High-velocity operational event detection and telemetry routing.' },
    { name: 'INTELLIGENCE ENGINE', status: 'IMPLEMENTED', purpose: 'Domain-specific analytical intelligence and inventory ATP calculations.' },
    { name: 'PREDICTION ENGINE', status: 'IMPLEMENTED', purpose: 'Lead-time forecasting and downstream stockout probability estimation.' },
    { name: 'RISK ENGINE', status: 'IMPLEMENTED', purpose: 'Multi-category vulnerability scoring across routes, suppliers, and tiers.' },
    { name: 'CAUSAL ENGINE', status: 'PARTIALLY IMPLEMENTED', purpose: 'Root cause and multi-echelon consequence graph analysis.' },
    { name: 'DECISION ENGINE', status: 'IMPLEMENTED', purpose: 'Resolution recommendations, cost optimization, and economic trade-offs.' },
    { name: 'SCENARIO ENGINE', status: 'IMPLEMENTED', purpose: 'Stress testing, digital sandboxing, and counterfactual reasoning.' },
    { name: 'POLICY ENGINE', status: 'IMPLEMENTED', purpose: 'Enterprise business policies, financial thresholds, and governance gates.' },
    { name: 'WORKFLOW ENGINE', status: 'IMPLEMENTED', purpose: 'Cross-functional orchestration, human approvals, and escalations.' },
    { name: 'AUTOPILOT', status: 'IMPLEMENTED', purpose: 'Autonomous operational execution across governed maturity levels L1 to L3.' },
    { name: 'MEMORY ENGINE', status: 'IMPLEMENTED', purpose: 'Decision memory retention, resolution history, and supplier scorecards.' },
    { name: 'AUDIT ENGINE', status: 'IMPLEMENTED', purpose: 'Append-only immutable audit trail of all commands, policies, and actions.' },
  ];

  return (
    <div className="min-h-screen bg-[var(--orion-canvas)] text-[var(--orion-text-primary)] flex flex-col font-sans transition-colors duration-300 relative selection:bg-[#0284C7] selection:text-white">
      {/* Ambient background glow with local overflow clipping */}
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-[550px] overflow-hidden" aria-hidden="true">
        <div className="w-[1100px] h-[550px] mx-auto bg-gradient-to-b from-[#0284C7]/15 to-transparent blur-3xl opacity-60 rounded-full" />
      </div>

      {/* Floating Website Header */}
      <Navbar onNavigate={onNavigate} onOpenDownload={onOpenDownload} />

      <main className="flex-1 pt-20 sm:pt-24 pb-16">
        {/* ==========================================================================
            STICKY SECTION NAVIGATION STRIP (Pinned across all sections)
           ========================================================================== */}
        <div className="sticky top-16 sm:top-20 z-40 py-2.5 bg-[var(--orion-canvas)]/85 backdrop-blur-md border-b border-[var(--glass-border-subtle)] transition-colors">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
            <div className="liquid-glass-elevated border border-[var(--glass-border)] rounded-2xl p-1.5 shadow-md flex items-center gap-1 overflow-x-auto custom-scrollbar">
              {SECTION_NAV.map((item) => {
                const isSelected = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.id === 'documentation') {
                        handleRoute('/docs');
                      } else {
                        scrollToAnchor(item.id);
                      }
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#070B19] dark:bg-white text-white dark:text-[#070B19] font-semibold shadow-sm'
                        : 'text-[var(--orion-text-secondary)] hover:text-[var(--orion-text-primary)] hover:bg-[var(--glass-surface-subtle)]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ==========================================================================
            1. HERO & SYSTEM OVERVIEW (#overview)
           ========================================================================== */}
        <section id="overview" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pt-6 pb-12 sm:pb-16 scroll-mt-32">
          <div className="space-y-6 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full liquid-glass-badge text-[var(--orion-accent)] font-mono text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ORION-9 OPERATING SYSTEM &middot; SYSTEM GENESIS &amp; ARCHITECTURE</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-editorial font-bold text-[var(--orion-text-primary)] tracking-tight leading-[1.12]">
              The intelligent operating environment for global supply chains.
            </h1>

            <p className="text-base sm:text-xl text-[var(--orion-text-secondary)] leading-relaxed font-sans max-w-3xl">
              Orion-9 is being developed as an intelligent operating environment for supply-chain operations, connecting operational information, workflows, risk analysis, and governed decisions.
            </p>

            {/* Quick Action Navigation Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => scrollToAnchor('why-orion-9')}
                className="px-5 py-3 rounded-xl bg-[#070B19] dark:bg-white text-white dark:text-[#070B19] hover:bg-[#1E293B] dark:hover:bg-slate-100 text-xs font-semibold shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <span>Why Orion-9</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => scrollToAnchor('system-architecture')}
                className="px-5 py-3 rounded-xl liquid-glass-button text-xs font-semibold text-[var(--orion-text-primary)] hover:border-[var(--orion-accent)] transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <span>System Architecture</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoute('/docs')}
                className="px-5 py-3 rounded-xl liquid-glass-button text-xs font-semibold text-[var(--orion-accent)] hover:border-[var(--orion-accent)] transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Technical Documentation Manual</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Grounded Platform Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 font-mono text-xs">
            <div className="liquid-glass-card rounded-2xl p-6 border border-[var(--glass-border-subtle)] space-y-2">
              <div className="flex justify-between items-center text-[var(--orion-text-muted)] text-[10px] uppercase font-bold tracking-widest">
                <span>Unified Control Plane</span>
                <Layers className="w-4 h-4 text-[#0284C7]" />
              </div>
              <div className="text-xl font-bold text-[var(--orion-text-primary)] font-sans">Single Operating System</div>
              <p className="text-[11px] text-[var(--orion-text-secondary)] leading-relaxed font-sans">
                Consolidates disconnected ERP tables, spreadsheets, and dashboards into a live operating cockpit.
              </p>
            </div>

            <div className="liquid-glass-card rounded-2xl p-6 border border-[var(--glass-border-subtle)] space-y-2">
              <div className="flex justify-between items-center text-[var(--orion-text-muted)] text-[10px] uppercase font-bold tracking-widest">
                <span>Signal Processing</span>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl font-bold text-[var(--orion-text-primary)] font-sans">Event-Driven Fabric</div>
              <p className="text-[11px] text-[var(--orion-text-secondary)] leading-relaxed font-sans">
                Continuous telemetry processing sensing route bottlenecks, weather delays, and supplier lead-time variances.
              </p>
            </div>

            <div className="liquid-glass-card rounded-2xl p-6 border border-[var(--glass-border-subtle)] space-y-2">
              <div className="flex justify-between items-center text-[var(--orion-text-muted)] text-[10px] uppercase font-bold tracking-widest">
                <span>Enterprise Governance</span>
                <Shield className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-bold text-[var(--orion-text-primary)] font-sans">Fail-Closed Security</div>
              <p className="text-[11px] text-[var(--orion-text-secondary)] leading-relaxed font-sans">
                Deterministic permission enforcement, human authorization gates, and multi-tenant cryptographic isolation.
              </p>
            </div>

            <div className="liquid-glass-card rounded-2xl p-6 border border-[var(--glass-border-subtle)] space-y-2">
              <div className="flex justify-between items-center text-[var(--orion-text-muted)] text-[10px] uppercase font-bold tracking-widest">
                <span>Continuous Memory</span>
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-xl font-bold text-[var(--orion-text-primary)] font-sans">Closed-Loop Learning</div>
              <p className="text-[11px] text-[var(--orion-text-secondary)] leading-relaxed font-sans">
                Measures actual post-resolution outcomes against simulated expectations to refine future recommendations.
              </p>
            </div>
          </div>
        </section>

        {/* ==========================================================================
            2. WHY ORION-9 (#why-orion-9)
           ========================================================================== */}
        <section id="why-orion-9" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-12 border-t border-[var(--glass-border-subtle)] scroll-mt-32">
          <div className="max-w-3xl space-y-3 mb-8">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#0284C7]">
              <Compass className="w-4 h-4" />
              <span>THE OPERATIONAL IMPERATIVE</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-editorial font-bold text-[var(--orion-text-primary)]">
              Why Orion-9 was conceived
            </h2>
            <p className="text-sm sm:text-base text-[var(--orion-text-secondary)] leading-relaxed">
              Modern global commerce depends entirely on resilient supply chains. Yet operations are predominantly run with software designed in the 1990s: fragmented ERP systems, disconnected spreadsheets, delayed visibility, and reactive firefighting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* The Crisis Card */}
            <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-red-500/20 bg-red-500/5 dark:bg-red-950/10 space-y-4">
              <div className="flex items-center gap-2.5 text-red-600 dark:text-red-400 font-semibold text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>The Crisis of Legacy Enterprise Software</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-[var(--orion-text-secondary)] leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                  <span>
                    <strong className="text-[var(--orion-text-primary)]">Fragmented ERP Silos:</strong> Core data is fractured across SAP, Oracle, TMS, and WMS modules with zero unified real-time visibility.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                  <span>
                    <strong className="text-[var(--orion-text-primary)]">Disconnected Spreadsheets:</strong> Planners spend up to 70% of weekly cycles compiling static VLOOKUP formulas and reconciling stale records.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                  <span>
                    <strong className="text-[var(--orion-text-primary)]">Delayed Visibility &amp; Firefighting:</strong> Disruptions are surfaced days after occurring, resulting in expensive air expediting fees and plant downtime.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                  <span>
                    <strong className="text-[var(--orion-text-primary)]">Dashboard Fatigue:</strong> Hundreds of colorful metric charts without prioritized decision proposals or direct execution mechanisms.
                  </span>
                </li>
              </ul>
            </div>

            {/* The Orion-9 Solution Card */}
            <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-sky-500/30 bg-sky-500/5 dark:bg-sky-950/10 space-y-4">
              <div className="flex items-center gap-2.5 text-[#0284C7] font-semibold text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>The Orion-9 Operating Environment Solution</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-[var(--orion-text-secondary)] leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] mt-2 shrink-0" />
                  <span>
                    <strong className="text-[var(--orion-text-primary)]">Unified World Graph:</strong> Connects suppliers, purchase orders, containers, hubs, and customer fulfillments into an authoritative digital twin.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] mt-2 shrink-0" />
                  <span>
                    <strong className="text-[var(--orion-text-primary)]">Event-Driven Telemetry:</strong> Real-time signal sensing detects delays, port bottlenecks, and stockout threats within milliseconds.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] mt-2 shrink-0" />
                  <span>
                    <strong className="text-[var(--orion-text-primary)]">AI-Assisted Decisions:</strong> Runs counterfactual simulations evaluating financial cost trade-offs against service-level commitments.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] mt-2 shrink-0" />
                  <span>
                    <strong className="text-[var(--orion-text-primary)]">Closed-Loop Governance:</strong> Governed kernel commands execute directly into enterprise systems with human authorization and immutable audit logging.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Architectural Contrast Table */}
          <div className="liquid-glass-elevated rounded-3xl p-6 sm:p-8 border border-[var(--glass-border)] shadow-xl overflow-hidden space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--orion-text-muted)]">
              ARCHITECTURAL CONTRAST &middot; TRADITIONAL SOFTWARE VS ORION-9 OS
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans border-collapse">
                <thead>
                  <tr className="border-b border-[var(--glass-border-subtle)] text-[var(--orion-text-muted)] font-mono">
                    <th className="py-3 px-4 uppercase font-semibold">Operational Dimension</th>
                    <th className="py-3 px-4 uppercase font-semibold text-rose-600 dark:text-rose-400">Traditional ERP &amp; Dashboards</th>
                    <th className="py-3 px-4 uppercase font-semibold text-[#0284C7]">Orion-9 Operating System</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--glass-border-subtle)] text-[var(--orion-text-secondary)]">
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-[var(--orion-text-primary)]">Data Architecture</td>
                    <td className="py-3.5 px-4">Static relational tables, batch nightly ETLs</td>
                    <td className="py-3.5 px-4 text-[#0284C7] font-medium">Dynamic event-driven world graph &amp; live state engine</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-[var(--orion-text-primary)]">Awareness Speed</td>
                    <td className="py-3.5 px-4">Days or weeks via end-of-month reporting cycles</td>
                    <td className="py-3.5 px-4 text-[#0284C7] font-medium">Continuous sub-second operational signal sensing</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-[var(--orion-text-primary)]">Decision Intelligence</td>
                    <td className="py-3.5 px-4">Manual human estimation, subjective intuition</td>
                    <td className="py-3.5 px-4 text-[#0284C7] font-medium">AI prediction &amp; counterfactual simulation models</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-[var(--orion-text-primary)]">Execution Mode</td>
                    <td className="py-3.5 px-4">Manual emails, phone calls, fragmented system logins</td>
                    <td className="py-3.5 px-4 text-[#0284C7] font-medium">Governed closed-loop kernel command bus with human gates</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-[var(--orion-text-primary)]">Security Model</td>
                    <td className="py-3.5 px-4">Perimeter-based with broad ambient database permissions</td>
                    <td className="py-3.5 px-4 text-[#0284C7] font-medium">Fail-closed Zero-Trust multi-tenant authorization rules</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ==========================================================================
            3. THE IDEA (#the-idea)
           ========================================================================== */}
        <section id="the-idea" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-12 border-t border-[var(--glass-border-subtle)] scroll-mt-32">
          <div className="max-w-3xl space-y-3 mb-8">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-500">
              <Lightbulb className="w-4 h-4" />
              <span>THE FOUNDATIONAL CONCEPT</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-editorial font-bold text-[var(--orion-text-primary)]">
              &ldquo;What if the supply chain had an operating system?&rdquo;
            </h2>
            <p className="text-sm sm:text-base text-[var(--orion-text-secondary)] leading-relaxed">
              The project was sparked by a singular architectural proposition: Shifting enterprise computing from static database records to a continuous, self-aware operating system.
            </p>
          </div>

          <div className="liquid-glass-elevated rounded-3xl p-6 sm:p-10 border border-[var(--glass-border)] shadow-xl space-y-8">
            <div className="space-y-4 text-xs sm:text-sm text-[var(--orion-text-secondary)] leading-relaxed font-sans max-w-4xl">
              <p className="text-sm sm:text-base text-[var(--orion-text-primary)] font-medium">
                Just as a personal computer operating system manages memory, hardware peripherals, network sockets, and CPU instructions seamlessly beneath a user interface, Orion-9 coordinates suppliers, maritime transit corridors, warehouse buffers, purchase orders, and customer fulfillments beneath an intelligent control plane.
              </p>
              <p>
                When a disruption occurs—such as a port labor strike, factory shutdown, or sudden demand surge—the operating system does not wait for a human user to stumble upon a broken KPI chart. Instead, the OS detects the signal immediately, calculates the downstream blast radius across all dependent SKUs and orders, evaluates alternative recovery routes, validates enterprise policy constraints, and stages an optimized resolution for supervisor authorization.
              </p>
            </div>

            {/* 10-Step Closed Operating Loop */}
            <div className="space-y-4 pt-4 border-t border-[var(--glass-border-subtle)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--orion-text-muted)]">
                  THE 10-STAGE ORION-9 OPERATING LOOP
                </span>
                <span className="text-[11px] font-mono text-[var(--orion-accent)]">Continuous Closed Loop</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {operatingLoop.map((step) => (
                  <div
                    key={step.num}
                    className="liquid-glass rounded-2xl p-4 border border-[var(--glass-border-subtle)] space-y-1.5 hover:border-[var(--orion-accent)] transition-all"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="font-bold text-[#0284C7]">{step.num}</span>
                      <span className="font-semibold text-[var(--orion-text-primary)] uppercase tracking-wider">{step.label}</span>
                    </div>
                    <p className="text-[11px] text-[var(--orion-text-secondary)] leading-relaxed font-sans">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================================
            4. CREATED BY (#created-by)
           ========================================================================== */}
        <section id="created-by" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-12 border-t border-[var(--glass-border-subtle)] scroll-mt-32">
          <div className="max-w-3xl space-y-3 mb-8">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#0284C7]">
              <User className="w-4 h-4" />
              <span>ORIGIN &amp; ARCHITECTURAL DIRECTION</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-editorial font-bold text-[var(--orion-text-primary)]">
              Created by Ayush Prakash
            </h2>
            <p className="text-sm sm:text-base text-[var(--orion-text-secondary)] leading-relaxed">
              The project creator, system architect, and origin vision documented in the authoritative Orion-9 operating system repository.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Creator Card */}
            <div
              data-testid="about-creator-card"
              className="lg:col-span-4 liquid-glass-elevated rounded-3xl p-6 sm:p-8 border border-[var(--glass-border)] shadow-xl space-y-5"
            >
              {creator?.avatarUrl && !avatarLoadFailed ? (
                <img
                  data-testid="about-creator-avatar"
                  src={creator.avatarUrl}
                  alt={creator?.name || 'Ayush Prakash'}
                  onError={() => setAvatarLoadFailed(true)}
                  className="w-20 h-20 rounded-2xl object-cover shadow-lg shadow-sky-600/20 border border-[var(--glass-border)]"
                />
              ) : (
                <div
                  data-testid="about-creator-avatar-fallback"
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0284C7] to-[#070B19] text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-sky-600/20"
                >
                  AP
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-[var(--orion-text-primary)]">
                  {creator?.name || 'Ayush Prakash'}
                </h3>
                <p className="text-xs font-mono text-[var(--orion-text-muted)] uppercase tracking-wider mt-0.5">
                  {creator?.role || 'Creator & Supply Chain OS Architect'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--orion-alt-bg)]/80 border border-[var(--glass-border-subtle)] text-xs text-[var(--orion-text-secondary)] italic space-y-1">
                <Quote className="w-4 h-4 text-[#0284C7]" />
                <p>&ldquo;{creator?.quote || 'What if the supply chain had an operating system?'}&rdquo;</p>
              </div>

              <div className="pt-2 border-t border-[var(--glass-border-subtle)] text-[11px] font-mono text-[var(--orion-text-muted)] space-y-1">
                <div>
                  Source: <code className="text-[var(--orion-text-primary)]">{creator?.repository || 'Ayushprakash21/orion-9'}</code>
                </div>
                <div>Status: {creator?.status || 'Primary System Maintainer'}</div>
              </div>
            </div>

            {/* Founder Note Card */}
            <div className="lg:col-span-8 liquid-glass-card rounded-3xl p-6 sm:p-8 border border-[var(--glass-border)] shadow-lg space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0284C7] border-l-2 border-[#0284C7] pl-3">
                FOUNDER NOTE &middot; ARCHITECTURAL PHILOSOPHY
              </h3>

              <div className="text-xs sm:text-sm text-[var(--orion-text-secondary)] leading-relaxed space-y-4 font-sans">
                <p>
                  &ldquo;Orion-9 was created out of a fundamental observation: modern supply chains run the world, yet they are managed using tools designed in the 1990s—fragmented ERP systems, endless disconnected spreadsheets, email threads, and frantic firefighting. Enterprise supply chains are not a collection of static tables; they are dynamic, high-velocity networks of signals, events, constraints, and operational dependencies.&rdquo;
                </p>
                <p>
                  &ldquo;Orion-9 was born to bridge this gap: building a true Operating System for the supply chain where data is unified, events trigger real-time awareness, AI governs risks, decisions create measurable outcomes, and the entire system continuously learns from every action.&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--glass-border-subtle)] flex flex-wrap items-center justify-between text-xs font-mono text-[var(--orion-text-muted)]">
                <span>Repository Authority: Ayushprakash21/orion-9</span>
                <span className="text-emerald-600 font-medium">Verified Source</span>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================================
            5. CORE PRINCIPLES (#core-principles)
           ========================================================================== */}
        <section id="core-principles" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-12 border-t border-[var(--glass-border-subtle)] scroll-mt-32">
          <div className="max-w-3xl space-y-3 mb-8">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#0284C7]">
              <Sparkles className="w-4 h-4" />
              <span>THE 7 PRINCIPLES OF ORION-9</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-editorial font-bold text-[var(--orion-text-primary)]">
              Foundational architectural tenets
            </h2>
            <p className="text-sm sm:text-base text-[var(--orion-text-secondary)] leading-relaxed">
              Seven governing principles that guide every algorithm, telemetry pipeline, security rule, and user interaction in Orion-9.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {corePrinciples.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.num}
                  className="liquid-glass-card rounded-3xl p-6 border border-[var(--glass-border-subtle)] space-y-4 hover:border-[var(--orion-accent)] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-mono font-bold text-[#0284C7]">{p.num}</span>
                      <div className="w-9 h-9 rounded-xl bg-[#0284C7]/10 text-[#0284C7] flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-[var(--orion-text-primary)]">{p.title}</h3>
                    <p className="text-xs text-[var(--orion-text-secondary)] leading-relaxed font-sans">{p.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ==========================================================================
            6. SYSTEM ARCHITECTURE & ENGINES (#system-architecture)
           ========================================================================== */}
        <section id="system-architecture" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-12 border-t border-[var(--glass-border-subtle)] scroll-mt-32">
          <div className="max-w-3xl space-y-3 mb-8">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#0284C7]">
              <Layers className="w-4 h-4" />
              <span>KERNEL ARCHITECTURE &amp; ENGINES</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-editorial font-bold text-[var(--orion-text-primary)]">
              System architecture specification
            </h2>
            <p className="text-sm sm:text-base text-[var(--orion-text-secondary)] leading-relaxed">
              Orion-9 is built on an autonomous, event-driven kernel architecture powered by Google Firebase (Authentication, Cloud Firestore, Storage) and local-first IndexedDB offline synchronization.
            </p>
          </div>

          {/* Kernel Pipeline Flow Diagram */}
          <div className="liquid-glass-elevated rounded-3xl p-6 sm:p-8 border border-[var(--glass-border)] shadow-xl space-y-6 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--glass-border-subtle)] pb-4">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--orion-text-primary)]">
                  FAIL-CLOSED KERNEL COMMAND PIPELINE
                </h3>
                <p className="text-[11px] text-[var(--orion-text-secondary)] mt-0.5">
                  Every state mutation dispatches through KernelCommandBus with strict authorization barriers
                </p>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                ZERO PRIVILEGE ESCALATION
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 font-mono text-[11px] text-center">
              <div className="liquid-glass rounded-xl p-3 border border-[var(--glass-border-subtle)]">
                <div className="text-[10px] text-[var(--orion-text-muted)]">01</div>
                <div className="font-bold text-[var(--orion-text-primary)] mt-1">Command Bus</div>
              </div>
              <div className="liquid-glass rounded-xl p-3 border border-[var(--glass-border-subtle)]">
                <div className="text-[10px] text-[var(--orion-text-muted)]">02</div>
                <div className="font-bold text-[var(--orion-text-primary)] mt-1">Auth / Tenant</div>
              </div>
              <div className="liquid-glass rounded-xl p-3 border border-red-500/30 bg-red-500/5">
                <div className="text-[10px] text-red-500 font-bold">03 FAIL-CLOSED</div>
                <div className="font-bold text-red-600 dark:text-red-400 mt-1">RBAC Gate</div>
              </div>
              <div className="liquid-glass rounded-xl p-3 border border-[var(--glass-border-subtle)]">
                <div className="text-[10px] text-[var(--orion-text-muted)]">04</div>
                <div className="font-bold text-[var(--orion-text-primary)] mt-1">Policy &amp; Risk</div>
              </div>
              <div className="liquid-glass rounded-xl p-3 border border-amber-500/30 bg-amber-500/5">
                <div className="text-[10px] text-amber-600 font-bold">05 HUMAN</div>
                <div className="font-bold text-amber-700 dark:text-amber-400 mt-1">Approval Gate</div>
              </div>
              <div className="liquid-glass rounded-xl p-3 border border-[var(--glass-border-subtle)]">
                <div className="text-[10px] text-[var(--orion-text-muted)]">06</div>
                <div className="font-bold text-[var(--orion-text-primary)] mt-1">State Engine</div>
              </div>
              <div className="liquid-glass rounded-xl p-3 border border-emerald-500/30 bg-emerald-500/5">
                <div className="text-[10px] text-emerald-600 font-bold">07 CLOUD</div>
                <div className="font-bold text-emerald-700 dark:text-emerald-400 mt-1">Firestore Tx</div>
              </div>
              <div className="liquid-glass rounded-xl p-3 border border-[var(--glass-border-subtle)]">
                <div className="text-[10px] text-[var(--orion-text-muted)]">08</div>
                <div className="font-bold text-[var(--orion-text-primary)] mt-1">Immutable Audit</div>
              </div>
            </div>
          </div>

          {/* 14 Core Engines Status Matrix */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--orion-text-muted)] border-l-2 border-[#0284C7] pl-3">
                14 CORE ORION-9 ENGINES &middot; IMPLEMENTATION STATUS
              </h3>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  13 Implemented
                </span>
                <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  1 Partially Implemented
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coreEngines.map((engine, idx) => {
                const isPart = engine.status.includes('PARTIAL');
                return (
                  <div
                    key={idx}
                    className="liquid-glass rounded-2xl p-4 border border-[var(--glass-border-subtle)] flex flex-col justify-between space-y-2.5"
                  >
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="font-bold text-[var(--orion-text-primary)]">{engine.name}</span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          isPart
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {engine.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--orion-text-secondary)] leading-relaxed font-sans">
                      {engine.purpose}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 text-center">
              <button
                type="button"
                onClick={() => handleRoute('/docs/architecture/kernel')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl liquid-glass-button text-xs font-semibold text-[#0284C7] hover:border-[#0284C7] transition cursor-pointer"
              >
                <span>Read Full Kernel Architecture Documentation</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* ==========================================================================
            7. EVOLUTION & WHAT'S NEW (#whats-new)
           ========================================================================== */}
        <section id="whats-new" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-12 border-t border-[var(--glass-border-subtle)] scroll-mt-32">
          <div className="max-w-3xl space-y-3 mb-8">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#0284C7]">
              <History className="w-4 h-4" />
              <span>PROJECT MILESTONES &amp; RECENT UPDATES</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-editorial font-bold text-[var(--orion-text-primary)]">
              Evolution &amp; What&rsquo;s New
            </h2>
            <p className="text-sm sm:text-base text-[var(--orion-text-secondary)] leading-relaxed">
              Grounded development progression from initial event fabric proof-of-concept to the current hardened v9.4.2 production baseline.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Timeline Column */}
            <div className="lg:col-span-6 space-y-6">
              <div className="relative border-l-2 border-[var(--glass-border)] pl-6 space-y-8 ml-3">
                {/* Milestone 1: v9.4.2 */}
                <div className="relative">
                  <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#0284C7] border-4 border-[var(--orion-canvas)] shadow-sm" />
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-[#0284C7]">v9.4.2 (Current Baseline)</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                      VERIFIED RELEASE BASELINE
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[var(--orion-text-primary)] mt-1">Native OS Experience &amp; Cloud Persistence</h4>
                  <p className="text-xs text-[var(--orion-text-secondary)] leading-relaxed mt-1 font-sans">
                    Native OS Settings application, canonical About Orion-9 Origin experience, two-stage user authentication, unified Website Brand Logo synchronization across header/auth/footer, and strict Cloud Firestore security rules.
                  </p>
                </div>

                {/* Milestone 2: v9.0.0 */}
                <div className="relative">
                  <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-indigo-500 border-4 border-[var(--orion-canvas)] shadow-sm" />
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">v9.0.0</span>
                  <h4 className="text-sm font-bold text-[var(--orion-text-primary)] mt-1">Aurora Design System &amp; AI Copilot</h4>
                  <p className="text-xs text-[var(--orion-text-secondary)] leading-relaxed mt-1 font-sans">
                    Introduced the Aurora dark-mode desktop shell, window manager state machine, multi-agent AI copilot runtime with deterministic tool calls, and synthetic supply chain test models.
                  </p>
                </div>

                {/* Milestone 3: v5.0.0 */}
                <div className="relative">
                  <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-slate-400 border-4 border-[var(--orion-canvas)] shadow-sm" />
                  <span className="text-xs font-mono font-bold text-[var(--orion-text-muted)]">v5.0.0</span>
                  <h4 className="text-sm font-bold text-[var(--orion-text-primary)] mt-1">Event Fabric &amp; Control Tower Real-Time Engine</h4>
                  <p className="text-xs text-[var(--orion-text-secondary)] leading-relaxed mt-1 font-sans">
                    Sub-second signal processing, real-time disruption blast radius estimation, and automated purchase order expediting workflows.
                  </p>
                </div>
              </div>
            </div>

            {/* What's New Feature Cards */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="liquid-glass-card rounded-2xl p-5 border border-[var(--glass-border-subtle)] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0284C7]">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Unified Brand Logo Sync</span>
                </div>
                <p className="text-xs text-[var(--orion-text-secondary)] leading-relaxed font-sans">
                  Single upload in Admin &rarr; Branding synchronously persists to website header, authentication pages, and footer across devices.
                </p>
              </div>

              <div className="liquid-glass-card rounded-2xl p-5 border border-[var(--glass-border-subtle)] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0284C7]">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Native OS Settings Window</span>
                </div>
                <p className="text-xs text-[var(--orion-text-secondary)] leading-relaxed font-sans">
                  Rebuilt account and system settings into a full native window with category search, admin privileges, and audit log inspection.
                </p>
              </div>

              <div className="liquid-glass-card rounded-2xl p-5 border border-[var(--glass-border-subtle)] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0284C7]">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Interactive Docs Manual</span>
                </div>
                <p className="text-xs text-[var(--orion-text-secondary)] leading-relaxed font-sans">
                  44 comprehensive engineering articles, 118 application catalog explorer, and live interactive simulations matching website tokens.
                </p>
              </div>

              <div className="liquid-glass-card rounded-2xl p-5 border border-[var(--glass-border-subtle)] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0284C7]">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Two-Stage Authentication</span>
                </div>
                <p className="text-xs text-[var(--orion-text-secondary)] leading-relaxed font-sans">
                  Single login portal for users and administrators with server-side Firebase JWT verification and zero client-side credential comparisons.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================================
            8. HELP & DOCUMENTATION (#documentation)
           ========================================================================== */}
        <section id="documentation" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-12 border-t border-[var(--glass-border-subtle)] scroll-mt-32">
          <div className="liquid-glass-elevated rounded-3xl p-8 sm:p-12 border border-[var(--glass-border)] shadow-xl relative overflow-hidden">
            <div className="max-w-2xl space-y-4 relative z-10">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#0284C7]">
                <BookOpen className="w-4 h-4" />
                <span>EXPLORE TECHNICAL SPECIFICATIONS</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-editorial font-bold text-[var(--orion-text-primary)]">
                Ready to inspect the complete engineering manual?
              </h2>
              <p className="text-sm sm:text-base text-[var(--orion-text-secondary)] leading-relaxed font-sans">
                Browse all 44 architectural guides, operational runbooks, deterministic supply-chain formulas, and the 118 application catalog in our integrated documentation manual.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleRoute('/docs')}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:from-[#0369A1] hover:to-[#075985] text-white text-xs font-semibold transition shadow-md shadow-sky-600/20 cursor-pointer inline-flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Open Documentation Manual</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleRoute('/docs/features')}
                  className="px-5 py-3.5 rounded-xl liquid-glass-button text-xs font-semibold text-[var(--orion-text-primary)] transition cursor-pointer inline-flex items-center gap-2"
                >
                  <span>118 Application Catalog</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer with newly integrated About Orion-9 Column */}
      <Footer onNavigate={onNavigate} onOpenDownload={onOpenDownload} />
    </div>
  );
};

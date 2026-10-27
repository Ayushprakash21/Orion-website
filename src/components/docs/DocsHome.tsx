import React from 'react';
import {
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { DesktopTourDemo } from './DesktopTourDemo';
import { DataFlowExplorerDemo } from './DataFlowExplorerDemo';
import { DocsFeatureExplorer } from './DocsFeatureExplorer';
import coverageData from '../../data/docs/coverage.json';

export const DocsHome: React.FC<{
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
}> = ({ onNavigate, onOpenSearch }) => {
  return (
    <div className="space-y-16 sm:space-y-20 pb-24">
      {/* 1. HERO SECTION */}
      <section className="relative pt-2 sm:pt-6 pb-6 border-b border-[var(--glass-border-subtle)]">
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-badge text-[11px] font-mono uppercase tracking-wider text-[var(--orion-accent)] font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ORION-9 OS MANUAL & TECHNICAL REFERENCE</span>
            <span className="opacity-40">|</span>
            <span className="text-emerald-500 font-bold">Certified v9.0.0</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-editorial font-bold tracking-tight text-[var(--orion-text-primary)] leading-tight">
            Orion-9 Documentation
          </h1>

          <p className="text-sm sm:text-base text-[var(--orion-text-secondary)] leading-relaxed font-sans max-w-2xl">
            The authoritative engineering manual, operational guides, deterministic SCM formulas, and architecture blueprints for the Orion-9 intelligent supply chain operating system.
          </p>

          {/* Prominent Search Bar */}
          <div className="pt-2 max-w-xl">
            <button
              type="button"
              onClick={onOpenSearch}
              className="w-full px-4.5 py-3.5 rounded-2xl liquid-glass-input hover:border-[var(--orion-accent)] text-[var(--orion-text-muted)] hover:text-[var(--orion-text-primary)] transition flex items-center justify-between text-xs sm:text-sm font-sans cursor-pointer shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 text-[var(--orion-accent)]" />
                <span>Search 44 articles, 118 applications, and formulas...</span>
              </div>
              <kbd className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 text-[var(--orion-text-muted)]">
                Ctrl + K
              </kbd>
            </button>
          </div>

          {/* Quick Links */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-sans">
            <button
              type="button"
              onClick={() => onNavigate('/docs/getting-started/quick-start')}
              className="px-4.5 py-2.5 rounded-xl bg-[#070B19] hover:bg-[#1E293B] text-white font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-slate-900/10"
            >
              <span>Quick Start Guide</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#38BDF8]" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/docs/architecture/system-overview')}
              className="px-4.5 py-2.5 rounded-xl border border-[var(--glass-border-subtle)] bg-white/70 dark:bg-white/5 hover:bg-white text-[var(--orion-text-primary)] font-semibold transition cursor-pointer shadow-2xs"
            >
              System Architecture
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/docs/applications/application-catalog')}
              className="px-4.5 py-2.5 rounded-xl border border-[var(--glass-border-subtle)] bg-white/70 dark:bg-white/5 hover:bg-white text-[var(--orion-text-primary)] font-semibold transition cursor-pointer shadow-2xs"
            >
              118 Application Catalog
            </button>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE ANIMATED DESKTOP TOUR */}
      <section className="space-y-4">
        <div>
          <span className="text-[11px] font-mono font-bold tracking-widest text-[var(--orion-accent)] uppercase">
            SECTION 01 · SYSTEM SIMULATOR
          </span>
          <h2 className="text-2xl sm:text-3xl font-editorial font-bold text-[var(--orion-text-primary)] mt-1">
            Interactive Orion-9 OS Tour
          </h2>
          <p className="text-xs sm:text-sm text-[var(--orion-text-secondary)] mt-1 max-w-2xl font-sans">
            Explore the multi-window desktop shell, Dynamic Island activity capsule, application registry, and governed command controls.
          </p>
        </div>

        <DesktopTourDemo onNavigate={onNavigate} />
      </section>

      {/* 3. SUPPLY CHAIN DATA PIPELINE EXPLORER */}
      <section className="space-y-4">
        <div>
          <span className="text-[11px] font-mono font-bold tracking-widest text-[var(--orion-accent)] uppercase">
            SECTION 02 · ARCHITECTURAL DATA FLOW
          </span>
          <h2 className="text-2xl sm:text-3xl font-editorial font-bold text-[var(--orion-text-primary)] mt-1">
            End-to-End Data Fabric Explorer
          </h2>
          <p className="text-xs sm:text-sm text-[var(--orion-text-secondary)] mt-1 max-w-2xl font-sans">
            Inspect how external EDI and ERP payloads are ingested, validated, transformed into canonical schemas, and synchronized across Cloud Firestore.
          </p>
        </div>

        <DataFlowExplorerDemo onNavigate={onNavigate} />
      </section>

      {/* 4. GETTING STARTED 6-STEP PANEL */}
      <section className="space-y-4">
        <div>
          <span className="text-[11px] font-mono font-bold tracking-widest text-[var(--orion-accent)] uppercase">
            SECTION 03 · OPERATIONAL ONBOARDING
          </span>
          <h2 className="text-2xl sm:text-3xl font-editorial font-bold text-[var(--orion-text-primary)] mt-1">
            Getting Started Path
          </h2>
          <p className="text-xs sm:text-sm text-[var(--orion-text-secondary)] mt-1 font-sans">
            Essential onboarding paths for enterprise operators and systems engineers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              step: '01',
              title: 'System Concept',
              desc: 'Understand the operating system paradigm vs conventional SaaS dashboards.',
              path: '/docs/getting-started/overview',
            },
            {
              step: '02',
              title: 'First Login',
              desc: 'Select DEMO or LIVE mode, authenticate via Firebase, and launch the desktop.',
              path: '/docs/getting-started/quick-start',
            },
            {
              step: '03',
              title: 'Desktop Navigation',
              desc: 'Master window tiling, z-index elevation, snapping, and the Dynamic Island.',
              path: '/docs/os/desktop',
            },
            {
              step: '04',
              title: 'Command Center',
              desc: 'Monitor global freight corridors, warehouse ASRS buffers, and SLA posture.',
              path: '/docs/applications/control-tower',
            },
            {
              step: '05',
              title: 'AI Copilot',
              desc: 'Query inventory, analyze disruptions, and execute governed tool actions.',
              path: '/docs/applications/copilot',
            },
            {
              step: '06',
              title: 'Integrations & EDI',
              desc: 'Configure SAP, Oracle, and EDI 850/856/810/830 connectors.',
              path: '/docs/applications/integrations',
            },
          ].map((item) => (
            <div
              key={item.step}
              onClick={() => onNavigate(item.path)}
              className="liquid-glass-card rounded-2xl p-6 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 border border-[var(--glass-border)] flex flex-col justify-between space-y-4 group cursor-pointer"
            >
              <div>
                <span className="text-[11px] font-mono font-bold text-[var(--orion-accent)] tracking-wider">
                  STEP {item.step}
                </span>
                <h4 className="text-base font-bold text-[var(--orion-text-primary)] mt-1.5 group-hover:text-[var(--orion-accent)] transition font-sans">
                  {item.title}
                </h4>
                <p className="text-xs sm:text-sm text-[var(--orion-text-secondary)] font-sans mt-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <div className="pt-2 flex items-center justify-between text-xs font-semibold text-[var(--orion-accent)]">
                <span>View Manual</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. INTERACTIVE FEATURE EXPLORER */}
      <section className="space-y-4 pt-4 border-t border-[var(--glass-border-subtle)]">
        <div>
          <span className="text-[11px] font-mono font-bold tracking-widest text-[var(--orion-accent)] uppercase">
            SECTION 04 · CAPABILITY CATALOG
          </span>
          <h2 className="text-2xl sm:text-3xl font-editorial font-bold text-[var(--orion-text-primary)] mt-1">
            Master Feature Explorer
          </h2>
          <p className="text-xs sm:text-sm text-[var(--orion-text-secondary)] mt-1 max-w-2xl font-sans">
            Filtered directory of all 118 verified enterprise capabilities, deterministic calculation engines, and platform services.
          </p>
        </div>

        <DocsFeatureExplorer onNavigate={onNavigate} />
      </section>

      {/* 6. DOCUMENTATION COVERAGE & CERTIFICATION AUDIT STATUS */}
      <section className="liquid-glass-elevated p-6 sm:p-8 rounded-3xl border border-[var(--glass-border)] shadow-md space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--glass-border-subtle)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--orion-text-primary)] font-sans">
                {coverageData.complianceCertification}
              </h3>
              <span className="text-xs text-[var(--orion-text-muted)] font-mono">
                Audit Verified: {coverageData.lastAuditDate}
              </span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            100% Core Engine Coverage
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans">
          <div className="p-4 rounded-2xl liquid-glass border border-[var(--glass-border-subtle)] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[var(--orion-text-muted)] block">Inventoried Modules</span>
            <span className="text-xl font-bold text-[var(--orion-text-primary)] block font-editorial">
              {coverageData.totalModulesInventoried} Apps
            </span>
          </div>

          <div className="p-4 rounded-2xl liquid-glass border border-[var(--glass-border-subtle)] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[var(--orion-text-muted)] block">SCM Engines</span>
            <span className="text-xl font-bold text-[var(--orion-accent)] block font-editorial">
              {coverageData.verifiedCoreEngines} Engines
            </span>
          </div>

          <div className="p-4 rounded-2xl liquid-glass border border-[var(--glass-border-subtle)] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[var(--orion-text-muted)] block">Manual Articles</span>
            <span className="text-xl font-bold text-emerald-500 block font-editorial">
              {coverageData.documentedArticles} Articles
            </span>
          </div>

          <div className="p-4 rounded-2xl liquid-glass border border-[var(--glass-border-subtle)] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[var(--orion-text-muted)] block">Security Rules</span>
            <span className="text-xl font-bold text-[var(--orion-text-primary)] block font-editorial">
              {coverageData.firestoreSecurityRulesCount} Rules
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

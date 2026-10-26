import React from 'react';
import {
  BookOpen,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Activity,
  Layers,
  Database,
  ExternalLink,
  Code2,
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
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-6 sm:pt-10 pb-8 border-b border-slate-800">
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ORION-9 OS MANUAL & TECHNICAL REFERENCE</span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400">Certified v9.0.0</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-editorial font-bold tracking-tight text-white leading-tight">
            Orion-9 Documentation
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans max-w-2xl">
            The authoritative engineering manual, operational guides, deterministic SCM formulas, and architecture blueprints for the Orion-9 intelligent supply chain operating system.
          </p>

          {/* Prominent Search Bar */}
          <div className="pt-2 max-w-xl">
            <button
              type="button"
              onClick={onOpenSearch}
              className="w-full px-4 py-3.5 rounded-2xl border border-slate-700 bg-slate-900/80 hover:border-cyan-500/50 hover:bg-slate-900 text-slate-400 hover:text-white transition flex items-center justify-between text-xs sm:text-sm font-mono cursor-pointer shadow-xl"
            >
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 text-cyan-400" />
                <span>Search 44 articles, 118 applications, and formulas...</span>
              </div>
              <kbd className="px-2 py-1 rounded-md text-[11px] bg-slate-800 border border-slate-700 text-slate-300">
                Ctrl + K
              </kbd>
            </button>
          </div>

          {/* Quick Links */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-mono">
            <button
              type="button"
              onClick={() => onNavigate('/docs/getting-started/quick-start')}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <span>Quick Start Guide</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/docs/architecture/system-overview')}
              className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 transition cursor-pointer"
            >
              System Architecture
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/docs/applications/application-catalog')}
              className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 transition cursor-pointer"
            >
              118 Application Catalog
            </button>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE ANIMATED DESKTOP TOUR */}
      <section className="space-y-4">
        <div>
          <span className="text-[11px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
            SECTION 01 · SYSTEM SIMULATOR
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Interactive Orion-9 OS Tour
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl font-sans">
            Explore the multi-window desktop shell, Dynamic Island activity capsule, application registry, and governed command controls.
          </p>
        </div>

        <DesktopTourDemo onNavigate={onNavigate} />
      </section>

      {/* 3. SUPPLY CHAIN DATA PIPELINE EXPLORER */}
      <section className="space-y-4">
        <div>
          <span className="text-[11px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
            SECTION 02 · ARCHITECTURAL DATA FLOW
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            End-to-End Data Fabric Explorer
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl font-sans">
            Inspect how external EDI and ERP payloads are ingested, validated, transformed into canonical schemas, and synchronized across Cloud Firestore.
          </p>
        </div>

        <DataFlowExplorerDemo onNavigate={onNavigate} />
      </section>

      {/* 4. GETTING STARTED 6-STEP PANEL */}
      <section className="space-y-4">
        <div>
          <span className="text-[11px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
            SECTION 03 · OPERATIONAL ONBOARDING
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Getting Started Path
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
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
              className="p-5 rounded-2xl border border-slate-800 bg-[#070B19]/70 hover:border-cyan-500/40 hover:bg-slate-900/50 transition cursor-pointer flex flex-col justify-between space-y-3 shadow-md group"
            >
              <div>
                <span className="text-cyan-400 font-bold text-[11px]">STEP {item.step}</span>
                <h4 className="text-sm font-bold text-white mt-1 group-hover:text-cyan-300 transition">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-400 font-sans mt-1.5 leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <div className="pt-2 flex items-center justify-between text-[11px] text-cyan-400">
                <span>View Manual</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. INTERACTIVE FEATURE EXPLORER */}
      <section className="space-y-4 pt-4 border-t border-slate-800">
        <div>
          <span className="text-[11px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
            SECTION 04 · CAPABILITY CATALOG
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Master Feature Explorer
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl font-sans">
            Filtered directory of all 118 verified enterprise capabilities, deterministic calculation engines, and platform services.
          </p>
        </div>

        <DocsFeatureExplorer onNavigate={onNavigate} />
      </section>

      {/* 6. DOCUMENTATION COVERAGE & CERTIFICATION AUDIT STATUS */}
      <section className="p-6 rounded-2xl border border-slate-800 bg-[#030712] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                {coverageData.complianceCertification}
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                Audit Verified: {coverageData.lastAuditDate}
              </span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            100% Core Engine Coverage
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <span className="text-slate-500 text-[10px] block uppercase">Inventoried Modules</span>
            <span className="text-lg font-bold text-white mt-0.5 block">
              {coverageData.totalModulesInventoried} Apps
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <span className="text-slate-500 text-[10px] block uppercase">Deterministic SCM Engines</span>
            <span className="text-lg font-bold text-cyan-400 mt-0.5 block">
              {coverageData.verifiedCoreEngines} Engines
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <span className="text-slate-500 text-[10px] block uppercase">Manual Articles</span>
            <span className="text-lg font-bold text-emerald-400 mt-0.5 block">
              {coverageData.documentedArticles} Articles
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <span className="text-slate-500 text-[10px] block uppercase">Security Rules Invariants</span>
            <span className="text-lg font-bold text-white mt-0.5 block">
              {coverageData.firestoreSecurityRulesCount} Rules
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

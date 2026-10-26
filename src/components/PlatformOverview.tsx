import React from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';
import { useAuth } from '../context/AuthContext';
import {
  Layers,
  Globe2,
  Cpu,
  ShieldCheck,
  ArrowRight,
  Activity,
  GitBranch,
  Database,
} from 'lucide-react';

export const PlatformOverview: React.FC = () => {
  const { activeConfig } = useSiteConfig();
  const { launchOrion } = useAuth();
  const hp = activeConfig.homepage;

  const pillars = [
    {
      id: 'pillar-1',
      tag: 'UNIFIED ONTOLOGY',
      title: 'Canonical Supply Chain Graph',
      description:
        'Harmonizes purchase orders, SKU part hierarchies, bills of lading, warehouse bins, and multi-tier supplier dependencies into a single live digital twin.',
      metric: '< 0.02% Schema Drift',
      icon: Database,
    },
    {
      id: 'pillar-2',
      tag: 'MULTI-MODAL VISIBILITY',
      title: 'Sub-Minute Global Telemetry',
      description:
        'Ingests satellite AIS ocean tracking, ADS-B cargo flight vectors, and continental GPS truck telematics across 142 international ports and hubs.',
      metric: '42,800 Signals / Sec',
      icon: Globe2,
    },
    {
      id: 'pillar-3',
      tag: 'DECISION INTELLIGENCE',
      title: 'Governed Autonomous Execution',
      description:
        'Evaluates cost, SLA, and inventory buffer trade-offs when disruptions hit, then dispatches authorized ERP and carrier reroutes with cryptographic auditability.',
      metric: '< 180s Mitigation Loop',
      icon: Cpu,
    },
  ];

  return (
    <section
      id="platform-overview"
      className="py-24 lg:py-32 bg-[var(--orion-canvas)] text-[var(--orion-text-primary)] border-b border-[var(--glass-border-subtle)] relative transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Editorial Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end mb-16">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-badge text-[11px] font-mono uppercase tracking-widest text-[var(--orion-accent)] font-semibold shadow-xs">
              <Layers className="w-3.5 h-3.5" />
              <span>{hp.overviewEyebrow}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] text-[var(--orion-text-primary)] leading-[1.06]">
              {hp.overviewTitle}
            </h2>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <p className="text-base text-[var(--orion-text-secondary)] leading-relaxed">
              {hp.overviewDescription}
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => launchOrion()}
                className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[var(--orion-accent)] hover:text-[var(--orion-text-primary)] transition-colors cursor-pointer"
              >
                <span>Open Orion-9 OS Environment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 3 Core Architectural Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                className="group rounded-3xl liquid-glass-card p-7 sm:p-8 hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full liquid-glass-badge text-[var(--orion-accent)] font-mono text-[10px] font-semibold tracking-wider uppercase">
                      {pillar.tag}
                    </span>
                    <div className="w-10 h-10 rounded-2xl liquid-glass text-[var(--orion-accent)] flex items-center justify-center shadow-xs border border-[var(--glass-border)]">
                      <Icon className="w-5 h-5 text-[#A8C2D2]" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-[var(--orion-text-primary)] tracking-tight">
                    {pillar.title}
                  </h3>

                  <p className="text-sm text-[var(--orion-text-secondary)] leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-[var(--glass-border-subtle)] flex items-center justify-between font-mono text-xs">
                  <span className="text-[var(--orion-text-muted)]">BENCHMARK</span>
                  <span className="font-bold text-[var(--orion-accent)]">{pillar.metric}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Architectural Diagram Banner (Dark Application Surface #101820) */}
        <div className="mt-10 rounded-3xl liquid-glass-elevated border border-[var(--glass-border)] p-6 sm:p-8 text-[var(--orion-text-primary)] shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-5 space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--orion-accent)] uppercase tracking-widest">
                <Activity className="w-3.5 h-3.5" />
                <span>CLOSED-LOOP OPERATING ARCHITECTURE</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                Ingest. Reconcile. Optimize. Execute.
              </h3>
              <p className="text-xs sm:text-sm text-[var(--orion-text-secondary)] leading-relaxed">
                Every physical freight signal is bound to enterprise financial and inventory records in real time.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-4 rounded-2xl liquid-glass-subtle border border-[var(--glass-border)] space-y-1">
                <span className="text-[10px] text-[var(--orion-accent)] font-semibold block">01 · INGESTION</span>
                <p className="font-bold text-[var(--orion-text-primary)]">ERP + WMS + Carrier Feeds</p>
                <p className="text-[11px] text-[var(--orion-text-secondary)] font-sans">SAP, Oracle, EDI 856/315, AIS</p>
              </div>
              <div className="p-4 rounded-2xl liquid-glass-subtle border border-[var(--glass-border)] space-y-1">
                <span className="text-[10px] text-[var(--orion-accent)] font-semibold block">02 · DIGITAL TWIN</span>
                <p className="font-bold text-[var(--orion-text-primary)]">Orion-9 Graph Ontology</p>
                <p className="text-[11px] text-[var(--orion-text-secondary)] font-sans">Continuous SLA &amp; risk scoring</p>
              </div>
              <div className="p-4 rounded-2xl liquid-glass-subtle border border-[var(--glass-border)] space-y-1">
                <span className="text-[10px] text-[var(--orion-accent)] font-semibold block">03 · ACTUATION</span>
                <p className="font-bold text-[var(--orion-text-primary)]">Governed Dispatch</p>
                <p className="text-[11px] text-[var(--orion-text-secondary)] font-sans">Audited carrier &amp; PO updates</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

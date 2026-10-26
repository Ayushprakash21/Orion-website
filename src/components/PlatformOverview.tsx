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
      className="py-24 lg:py-32 bg-[#F5F9FB] border-b border-[#D5E1E8] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Editorial Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end mb-16">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#D5E1E8] text-[11px] font-mono uppercase tracking-widest text-[#294D6B] font-semibold shadow-2xs">
              <Layers className="w-3.5 h-3.5" />
              <span>{hp.overviewEyebrow}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] text-[#111827] leading-[1.06]">
              {hp.overviewTitle}
            </h2>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <p className="text-base text-[#566575] leading-relaxed">
              {hp.overviewDescription}
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => launchOrion()}
                className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#294D6B] hover:text-[#111827] transition-colors cursor-pointer"
              >
                <span>Open Control Tower Environment</span>
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
                className="group rounded-3xl bg-white border border-[#D5E1E8] p-7 sm:p-8 shadow-[0_12px_32px_rgba(16,24,32,0.04)] hover:border-[#294D6B]/50 hover:shadow-[0_18px_45px_rgba(41,77,107,0.09)] transition-all flex flex-col justify-between"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-[#EAF4F8] text-[#294D6B] font-mono text-[10px] font-semibold tracking-wider uppercase">
                      {pillar.tag}
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-[#101820] text-white flex items-center justify-center shadow-sm">
                      <Icon className="w-5 h-5 text-[#A8C2D2]" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-[#111827] tracking-tight">
                    {pillar.title}
                  </h3>

                  <p className="text-sm text-[#566575] leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-[#D5E1E8] flex items-center justify-between font-mono text-xs">
                  <span className="text-[#566575]">BENCHMARK</span>
                  <span className="font-bold text-[#294D6B]">{pillar.metric}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Architectural Diagram Banner (Dark Application Surface #101820) */}
        <div className="mt-10 rounded-3xl bg-[#101820] border border-[#294D6B]/40 p-6 sm:p-8 text-white shadow-[0_24px_60px_rgba(16,24,32,0.16)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-5 space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-mono text-[#A8C2D2] uppercase tracking-widest">
                <Activity className="w-3.5 h-3.5" />
                <span>CLOSED-LOOP OPERATING ARCHITECTURE</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                Ingest. Reconcile. Optimize. Execute.
              </h3>
              <p className="text-xs sm:text-sm text-[#A8C2D2]/85 leading-relaxed">
                Every physical freight signal is bound to enterprise financial and inventory records in real time.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                <span className="text-[10px] text-[#A8C2D2] block">01 · INGESTION</span>
                <p className="font-bold text-white">ERP + WMS + Carrier Feeds</p>
                <p className="text-[11px] text-white/60 font-sans">SAP, Oracle, EDI 856/315, AIS</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                <span className="text-[10px] text-[#A8C2D2] block">02 · DIGITAL TWIN</span>
                <p className="font-bold text-white">Orion-9 Graph Ontology</p>
                <p className="text-[11px] text-white/60 font-sans">Continuous SLA &amp; risk scoring</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                <span className="text-[10px] text-[#A8C2D2] block">03 · ACTUATION</span>
                <p className="font-bold text-white">Governed Dispatch</p>
                <p className="text-[11px] text-white/60 font-sans">Audited carrier &amp; PO updates</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

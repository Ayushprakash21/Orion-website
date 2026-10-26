import React, { useState } from 'react';
import {
  Cable,
  Database,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Server,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface Pillar {
  id: string;
  number: string;
  title: string;
  eyebrow: string;
  summary: string;
  connectors: string[];
  protocol: string;
  sla: string;
}

const pillars: Pillar[] = [
  {
    id: 'pillar-1',
    number: '01',
    eyebrow: 'INGESTION & CONNECTOR LAYER',
    title: 'Enterprise Integration Fabric',
    summary:
      'Bi-directional enterprise connectors and event streaming ingestion bridging legacy systems, carrier streams, and modern warehouse networks without custom point-to-point middleware.',
    connectors: ['SAP S/4HANA & ECC', 'Oracle SCM Cloud', 'Manhattan Associates WMS', 'Carrier EDI 850/856/304', 'Satellite AIS & ADS-B'],
    protocol: 'Kafka, gRPC, REST, AS2, WebSocket',
    sla: 'Sub-second event deduplication and streaming reconciliation',
  },
  {
    id: 'pillar-2',
    number: '02',
    eyebrow: 'SEMANTIC GRAPH & DIGITAL TWIN',
    title: 'Canonical Graph Data Model',
    summary:
      'Harmonizes orders, inventory units, bill-of-materials (BOM) hierarchies, bills of lading, and multi-tier supplier IDs into an unambiguous, synchronized operational graph.',
    connectors: ['Entity Resolution Engine', 'BOM Multi-Echelon Mapping', 'State Machine Registry', 'Global Geofence Index'],
    protocol: 'JSON-Schema, Protocol Buffers, W3C DID',
    sla: '100% Schema validation & cryptographic state integrity',
  },
  {
    id: 'pillar-3',
    number: '03',
    eyebrow: 'OPTIMIZATION & SOLVER MATRIX',
    title: 'Decision Intelligence Layer',
    summary:
      'Stochastic solvers and multi-objective optimization algorithms evaluating landed costs, SLA penalties, emissions, and transit velocity in real time.',
    connectors: ['Mixed-Integer Linear Solvers', 'Monte Carlo Disruption Models', 'Pareto Frontier Evaluator', 'Lead-Time Variance Predictors'],
    protocol: 'High-Performance Mathematical Solvers',
    sla: '< 180ms decision formulation & scenario scoring',
  },
  {
    id: 'pillar-4',
    number: '04',
    eyebrow: 'CLOSED-LOOP ORCHESTRATION',
    title: 'Governed Autonomous Execution',
    summary:
      'Dispatches policy-approved reroutes directly into carrier booking APIs, warehouse staging bays, and customs clearance queues with immutable audit logging.',
    connectors: ['Carrier Booking API Adapters', 'WMS Staging Webhooks', 'Two-Person Authorization Gate', 'Append-Only Audit Ledger'],
    protocol: 'TLS 1.3, mTLS Zero-Trust, Signed Webhooks',
    sla: 'Zero unauthorized freight commitments or shadow overrides',
  },
];

export const ArchitectureConnectivity: React.FC = () => {
  const [selectedPillarId, setSelectedPillarId] = useState<string>('pillar-1');
  const activePillar = pillars.find((p) => p.id === selectedPillarId) || pillars[0];

  return (
    <section id="architecture" className="py-24 sm:py-32 bg-[#EAF4F8] border-b border-[#D5E1E8] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Section Header */}
        <div className="max-w-3xl mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#D5E1E8] text-xs font-mono text-[#294D6B]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#294D6B]" />
            <span className="font-semibold text-[#111827]">05 / ENTERPRISE ARCHITECTURE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.03em] text-[#111827] leading-[1.08]">
            Engineered for Zero-Trust Enterprise Scale.
          </h2>

          <p className="text-base sm:text-lg text-[#4A5568] leading-relaxed">
            A 4-pillar architectural foundation connecting legacy enterprise infrastructure
            with deterministic, closed-loop autonomous intelligence.
          </p>
        </div>

        {/* 4 Pillars Interactive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {pillars.map((pillar) => {
            const isSelected = selectedPillarId === pillar.id;
            return (
              <button
                key={pillar.id}
                type="button"
                onClick={() => setSelectedPillarId(pillar.id)}
                className={`p-6 sm:p-7 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white border-[#294D6B] shadow-[0_16px_36px_rgba(41,77,107,0.14)] scale-[1.02]'
                    : 'bg-white/80 border-[#D5E1E8] hover:bg-white hover:border-[#294D6B]/40 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-4">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${
                        isSelected
                          ? 'bg-[#294D6B] text-white'
                          : 'bg-[#EAF4F8] text-[#566575]'
                      }`}
                    >
                      {pillar.number}
                    </span>
                    <span className="text-[10px] text-[#566575] font-semibold uppercase">
                      PILLAR
                    </span>
                  </div>

                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#294D6B] block mb-1">
                    {pillar.eyebrow}
                  </span>

                  <h3 className="text-lg font-bold text-[#111827] leading-tight mb-2">
                    {pillar.title}
                  </h3>

                  <p className="text-xs text-[#566575] line-clamp-3 leading-relaxed">
                    {pillar.summary}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#D5E1E8]/70 flex items-center justify-between text-[11px] font-mono">
                  <span className={isSelected ? 'text-[#294D6B] font-bold' : 'text-slate-400'}>
                    {isSelected ? '● SELECTED' : 'VIEW DETAILS'}
                  </span>
                  <ArrowRight
                    className={`w-3.5 h-3.5 transition-transform ${
                      isSelected ? 'text-[#294D6B] translate-x-1' : 'text-slate-400'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Detailed Architectural Deep-Dive Card */}
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#D5E1E8] shadow-[0_16px_40px_rgba(20,40,65,0.06)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF4F8] text-xs font-mono text-[#294D6B]">
              <span className="font-semibold">PILLAR {activePillar.number}</span>
              <span>/</span>
              <span>{activePillar.eyebrow}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">
              {activePillar.title}
            </h3>

            <p className="text-base text-[#4A5568] leading-relaxed">
              {activePillar.summary}
            </p>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#566575] block">
                Enterprise Interfaces & Connectors:
              </span>
              <div className="flex flex-wrap gap-2">
                {activePillar.connectors.map((c) => (
                  <span
                    key={c}
                    className="px-3 py-1 rounded-full bg-[#F5F9FB] border border-[#D5E1E8] text-xs font-medium text-[#111827]"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#F5F9FB] rounded-2xl p-6 sm:p-8 border border-[#D5E1E8] space-y-4 font-mono text-xs">
            <div className="text-[11px] text-[#566575] uppercase tracking-wider pb-2 border-b border-[#D5E1E8]">
              Architectural Invariants & Protocols
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[#566575] block text-[10px] uppercase">
                  Transport & Protocol Standards:
                </span>
                <p className="text-[#111827] font-bold text-xs mt-0.5">{activePillar.protocol}</p>
              </div>

              <div className="pt-2 border-t border-[#D5E1E8]/70">
                <span className="text-[#566575] block text-[10px] uppercase">
                  Execution Guarantee & SLA:
                </span>
                <p className="text-[#294D6B] font-bold text-xs mt-0.5">{activePillar.sla}</p>
              </div>

              <div className="pt-2 border-t border-[#D5E1E8]/70 flex items-center gap-2 text-emerald-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px] font-sans font-semibold">
                  SOC 2 Type II & ISO 27001 Certified Architecture
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

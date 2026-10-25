import React, { useState } from 'react';
import { Layers, ShieldCheck, Database, GitMerge, Bot, UserCheck, LayoutDashboard, Lock, ArrowDown } from 'lucide-react';

interface Layer {
  number: string;
  title: string;
  summary: string;
  components: string[];
  securityNote: string;
}

const architectureLayers: Layer[] = [
  {
    number: '07',
    title: 'Operational Dashboards & User Experiences',
    summary: 'Role-based operational control towers, interactive risk maps, executive summaries, and mobile alert centers.',
    components: ['Control Tower Web UI', 'Executive Summaries', 'Mobile Incident App', 'Custom Viewports'],
    securityNote: 'Multi-factor authentication, granular RBAC, session integrity validation',
  },
  {
    number: '06',
    title: 'Workflow Orchestration & Governance',
    summary: 'Controlled operational pipelines, multi-party sign-off gates, policy-bounded automation, and audit logging.',
    components: ['Approval Sign-off Gates', 'State Machine Executor', 'Automated Fallback Holds', 'Immutable Audit Trails'],
    securityNote: 'Two-person financial thresholds, immutable append-only event log',
  },
  {
    number: '05',
    title: 'AI-Assisted Intelligence & Decision Support',
    summary: 'Contextual reasoning models, exception summarization, multi-scenario evaluation, and natural language query.',
    components: ['Grounded LLM Copilot', 'Disruption Narratives', 'Mitigation Scenarios', 'Root-Cause Synthesis'],
    securityNote: 'Zero-hallucination parameter boundaries, strictly human-in-the-loop approvals',
  },
  {
    number: '04',
    title: 'Supply Chain Engines',
    summary: 'Continuous computation engines for inventory buffer health, predicted transit ETAs, network risk, and routing.',
    components: ['Multi-Echelon Inventory', 'Dynamic ETA Predictor', 'Network Graph Engine', 'Cost Optimization Solver'],
    securityNote: 'Deterministic algorithm boundaries, mathematically verified state transitions',
  },
  {
    number: '03',
    title: 'Event Processing & Reconciliation',
    summary: 'High-throughput stream processing, out-of-order event resolution, electronic message deduplication, and anomaly triage.',
    components: ['Distributed Event Bus', 'Stream Reconciliation', 'Deduplication Pipeline', 'Threshold Anomaly Filters'],
    securityNote: 'Idempotent delivery guarantees, transactional isolation boundaries',
  },
  {
    number: '02',
    title: 'Canonical Data & Master Data Intelligence',
    summary: 'Standardized ontology mapping orders, items, shipments, suppliers, locations, and lead times across heterogenous ERP schemas.',
    components: ['Unified Supply Chain Schema', 'Entity Disambiguation', 'BOM Relationship Graph', 'Master Location Registry'],
    securityNote: 'Strict JSON schema enforcement, cryptographic integrity checksums',
  },
  {
    number: '01',
    title: 'Enterprise Integrations',
    summary: 'Bidirectional connectors to enterprise ERPs, warehouse management systems, transportation carrier feeds, and IoT sensors.',
    components: ['SAP / Oracle Connectors', 'WMS API Adapters', 'Carrier EDI (856/850/304)', 'Port & AIS Radar Feeds'],
    securityNote: 'Encrypted TLS 1.3 transport, mutual TLS certificate auth, rate-limited egress',
  },
];

export const SystemArchitecture: React.FC = () => {
  const [activeLayerIndex, setActiveLayerIndex] = useState<number | null>(0);

  return (
    <section id="architecture" className="py-24 bg-[#0f1626] border-b border-white/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 space-y-4">
          <div className="text-xs font-mono uppercase tracking-widest text-[#f5f5f5]">
            ENGINEERING & INFRASTRUCTURE
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Designed for Connected Operations.
          </h2>
          <p className="text-base sm:text-lg text-white/70 leading-relaxed">
            Orion-9 is built on an enterprise multi-layer architecture engineered for traceable data flows, integration boundaries, controlled human access, observability, and fail-safe recovery.
          </p>
        </div>

        {/* Layered Stack Diagram */}
        <div className="space-y-3 max-w-5xl mx-auto">
          {architectureLayers.map((layer, idx) => {
            const isSelected = activeLayerIndex === idx;

            return (
              <div
                key={layer.number}
                onClick={() => setActiveLayerIndex(isSelected ? null : idx)}
                className={`rounded-xl border p-5 sm:p-6 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#1d293d] border-[#f5f5f5]/70 shadow-xl shadow-cyan-950/30 ring-1 ring-[#f5f5f5]/40'
                    : 'bg-[#151e30] border-white/10 hover:border-white/25 hover:bg-[#182338]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-4">
                    <span className="font-mono text-xs font-bold text-[#f5f5f5] px-2.5 py-1 rounded bg-[#f5f5f5]/10 border border-[#f5f5f5]/20 shrink-0">
                      LAYER {layer.number}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight">{layer.title}</h3>
                      <p className="text-xs sm:text-sm text-white/60 mt-0.5 line-clamp-1">{layer.summary}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <span className="text-xs font-mono text-white/40 hidden md:inline">
                      {isSelected ? 'COLLAPSE' : 'INSPECT'}
                    </span>
                    <ArrowDown
                      className={`w-4 h-4 text-white/50 transition-transform ${isSelected ? 'rotate-180 text-[#f5f5f5]' : ''}`}
                    />
                  </div>
                </div>

                {/* Expanded Details */}
                {isSelected && (
                  <div className="mt-5 pt-5 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-200">
                    <div>
                      <span className="text-xs font-mono text-white/40 uppercase tracking-wider block mb-2">
                        Core System Subsystems
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {layer.components.map((c, cIdx) => (
                          <span
                            key={cIdx}
                            className="text-xs font-mono px-2.5 py-1 rounded bg-[#0f1626] border border-white/10 text-white/80"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-mono text-white/40 uppercase tracking-wider block mb-2">
                        Security & Boundary Invariants
                      </span>
                      <div className="flex items-center gap-2 text-xs text-[#f5f5f5] font-mono bg-[#0f1626] p-2.5 rounded-lg border border-white/10">
                        <Lock className="w-3.5 h-3.5 shrink-0" />
                        <span>{layer.securityNote}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Architectural Principles Banner */}
        <div className="mt-14 max-w-5xl mx-auto p-6 rounded-2xl bg-[#0a0f1b] border border-white/10 flex flex-wrap items-center justify-between gap-6 text-xs font-mono text-white/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#f5f5f5]" />
            <span className="text-white/80 font-semibold">TRACEABLE DATA FLOWS</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/30" aria-hidden="true">·</span>
            <span className="text-white/80 font-semibold">CONTROLLED ACCESS BOUNDARIES</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/30" aria-hidden="true">·</span>
            <span className="text-white/80 font-semibold">HUMAN SUPERVISION GATES</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/30" aria-hidden="true">·</span>
            <span className="text-white/80 font-semibold">EVENT-DRIVEN FAULT RECOVERY</span>
          </div>
        </div>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import {
  Cable,
  Database,
  Cpu,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

interface ArchLayer {
  number: string;
  name: string;
  executiveSummary: string;
  primarySystems: string[];
  technicalSpecs: string;
}

const architectureLayers: ArchLayer[] = [
  {
    number: '01',
    name: 'Integration & Ingestion Fabric',
    executiveSummary:
      'Connects your existing ERPs, warehouse management systems, carrier EDI streams, and satellite telemetry into a unified real-time event pipeline without custom middleware.',
    primarySystems: ['SAP S/4HANA', 'Oracle SCM', 'Manhattan WMS', 'Carrier EDI (850/856)', 'Satellite AIS / ADS-B'],
    technicalSpecs: 'Kafka, gRPC, and AS2 endpoints with sub-second event deduplication and cryptographic transport encryption.',
  },
  {
    number: '02',
    name: 'Canonical Graph & Master Data Model',
    executiveSummary:
      'Harmonizes disparate part numbers, purchase orders, carrier manifests, and bill-of-materials into an unambiguous, synchronized digital twin of physical operations.',
    primarySystems: ['Entity Disambiguation Engine', 'BOM Relationship Graph', 'Master Location Registry', 'Multi-Tier Supplier Index'],
    technicalSpecs: 'Strict schema enforcement and state machine validation across enterprise boundaries.',
  },
  {
    number: '03',
    name: 'Decision Intelligence & Optimization Matrix',
    executiveSummary:
      'Continuously simulates supply-chain vulnerabilities, models multi-echelon safety stock burn rates, and computes mathematically optimal mitigation pathways.',
    primarySystems: ['Mixed-Integer Linear Solvers', 'Monte Carlo Disruption Models', 'Pareto Trade-Off Evaluator', 'Lead-Time Predictor'],
    technicalSpecs: 'Sub-second multi-scenario evaluation balancing expedite cost, transit speed, and Scope 3 emissions.',
  },
  {
    number: '04',
    name: 'Governed Closed-Loop Execution',
    executiveSummary:
      'Dispatches policy-approved interventions directly into carrier booking APIs and warehouse staging bays, backed by immutable audit trails and two-person authorization thresholds.',
    primarySystems: ['Carrier Booking API Gateways', 'WMS Dispatch Adapters', 'Two-Person Authorization Gate', 'Append-Only Audit Ledger'],
    technicalSpecs: 'Zero-trust mTLS non-repudiation and tamper-evident event logging.',
  },
];

export const ArchitectureConnectivity: React.FC = () => {
  const [expandedLayer, setExpandedLayer] = useState<string | null>(null);

  return (
    <section id="architecture" className="py-24 sm:py-32 bg-[#EAF4F8] border-b border-[#D5E1E8] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14 space-y-4">
          <span className="text-xs font-semibold text-[#294D6B] uppercase tracking-wider block">
            System Architecture
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.03em] text-[#111827] leading-[1.08]">
            Engineered for enterprise scale and deterministic trust.
          </h2>

          <p className="text-base sm:text-lg text-[#4A5568] leading-relaxed">
            A 4-tier modular platform connecting legacy core systems with real-time autonomous intelligence
            and policy-bounded governance.
          </p>
        </div>

        {/* Dimensional Architecture Stack */}
        <div className="space-y-4 max-w-5xl mx-auto">
          {architectureLayers.map((layer) => {
            const isExpanded = expandedLayer === layer.number;
            return (
              <div
                key={layer.number}
                className="p-7 sm:p-8 rounded-3xl bg-white border border-[#D5E1E8] shadow-[0_10px_30px_rgba(20,40,65,0.04)] hover:shadow-[0_16px_40px_rgba(20,40,65,0.08)] transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-4">
                    <span className="w-10 h-10 rounded-2xl bg-[#EAF4F8] border border-[#D5E1E8] text-[#294D6B] font-mono font-bold text-sm flex items-center justify-center shrink-0">
                      {layer.number}
                    </span>

                    <div>
                      <h3 className="text-xl font-bold text-[#111827] tracking-tight">
                        {layer.name}
                      </h3>
                      <p className="text-xs text-[#566575] mt-0.5">
                        {layer.primarySystems.slice(0, 3).join(' · ')}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedLayer(isExpanded ? null : layer.number)}
                    className="self-start sm:self-auto px-4 py-2 rounded-full border border-[#D5E1E8] text-xs font-medium text-[#4A5568] hover:text-[#111827] hover:border-[#294D6B] transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{isExpanded ? 'Hide Specs' : 'View Specifications'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <p className="text-sm text-[#4A5568] leading-relaxed mt-4 pt-4 border-t border-[#EAF4F8]">
                  {layer.executiveSummary}
                </p>

                {/* Progressive Disclosure: Technical Invariants */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-[#EAF4F8] bg-[#F5F9FB] rounded-2xl p-5 space-y-3 text-xs">
                    <div>
                      <span className="font-semibold text-[#111827] block mb-1">
                        Connected Enterprise Platforms:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {layer.primarySystems.map((sys) => (
                          <span
                            key={sys}
                            className="px-3 py-1 rounded-full bg-white border border-[#D5E1E8] text-[#111827] font-medium"
                          >
                            {sys}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#D5E1E8]/60">
                      <span className="font-semibold text-[#111827] block mb-0.5">
                        Technical Protocols &amp; Guarantees:
                      </span>
                      <p className="text-[#566575]">{layer.technicalSpecs}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

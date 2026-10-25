import React, { useState } from 'react';
import { Network, Search, GitBranch, Share2, Check, ArrowRight } from 'lucide-react';

interface Stage {
  number: string;
  name: string;
  tagline: string;
  description: string;
  signals: string[];
  visualItems: { label: string; status: string; detail: string }[];
  accent: string;
}

const stages: Stage[] = [
  {
    number: '01',
    name: 'Connect',
    tagline: 'Bring operational signals together.',
    description:
      'Ingest real-time streaming telemetry and enterprise transactional data across suppliers, ERP backbones, distribution hubs, purchase orders, and transportation corridors into one unified canonical pipeline.',
    signals: ['Tier-1 & Tier-2 Suppliers', 'Global ERP Core (SAP / Oracle)', 'Regional WMS Nodes', 'In-Transit Carrier EDI & GPS'],
    visualItems: [
      { label: 'Supplier EDI Streams', status: 'SYNCHRONIZED', detail: '850 PO / 856 ASN real-time ingestion' },
      { label: 'Carrier Telemetry', status: 'CONNECTED', detail: 'Vessel AIS and truck geofence transit streams' },
      { label: 'ERP Master Graph', status: 'MAPPED', detail: 'Canonical entity harmonization complete' },
    ],
    accent: '#f5f5f5',
  },
  {
    number: '02',
    name: 'Understand',
    tagline: 'Transform events into operational intelligence.',
    description:
      'Evaluate incoming signals against live inventory buffers, promised SLAs, and transit bottlenecks. Correlate upstream factory slowdowns and port dwell times with downstream delivery exposure before customers are impacted.',
    signals: ['Critical Inventory Stockout Exposure', 'Port Congestion Dwell Anomaly', 'Tier-2 Raw Material Chokepoints', 'Lead-Time Variance Alerts'],
    visualItems: [
      { label: 'Exception Identification', status: 'ACTIVE', detail: '48hr dwell threshold exceeded at gateway port' },
      { label: 'Stockout Exposure', status: 'DETECTED', detail: 'Regional DC safety stock buffer drops below 6 days' },
      { label: 'Supplier Vulnerability', status: 'FLAGGED', detail: 'Component factory line stoppage verified upstream' },
    ],
    accent: '#d4d4d4',
  },
  {
    number: '03',
    name: 'Decide',
    tagline: 'Evaluate the next best action.',
    description:
      'Simulate alternative operational responses through multi-objective optimization. Compare air expedition vs multi-modal rail rerouting, balancing expedited freight costs against stockout penalties and carbon emission impact.',
    signals: ['Dynamic Scenario Modeling', 'Cost vs Speed Trade-off Curves', 'Customer SLA Penalty Assessment', 'Air vs Rail Freight Trade-offs'],
    visualItems: [
      { label: 'Mitigation Plan A (Air Expedition)', status: 'EVALUATED', detail: 'Recovers SLA 100%, +$18.4k freight budget premium' },
      { label: 'Mitigation Plan B (Intermodal Split)', status: 'RECOMMENDED', detail: 'Protects key retail accounts, balanced cost profile' },
      { label: 'Mitigation Plan C (Safety Buffer Pull)', status: 'ALTERNATE', detail: 'Reallocates buffer from secondary warehouse' },
    ],
    accent: '#f5f5f5',
  },
  {
    number: '04',
    name: 'Orchestrate',
    tagline: 'Coordinate execution across the network.',
    description:
      'Execute chosen mitigation pathways synchronously across partner networks. Dispatch electronic purchase order revisions, update transport carrier manifests, and notify affected warehouse docks with full human approval governance.',
    signals: ['Autonomous Workflow Dispatch', 'ERP Transaction Rebalancing', 'Carrier Booking Rescheduling', 'Human-Supervised Approval Gates'],
    visualItems: [
      { label: 'Carrier Manifest Update', status: 'DISPATCHED', detail: 'Automated booking change sent via EDI 304' },
      { label: 'ERP Order Re-allocation', status: 'EXECUTED', detail: 'Inventory reservation synchronized in core ledger' },
      { label: 'Audited Governance Log', status: 'VERIFIED', detail: 'Two-person sign-off timestamped and archived' },
    ],
    accent: '#f5f5f5',
  },
];

export const OperatingJourney: React.FC = () => {
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const currentStage = stages[activeStageIndex];

  return (
    <section className="py-24 bg-[#0a0f1b] border-b border-white/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14 space-y-4">
          <div className="text-xs font-mono uppercase tracking-widest text-[#f5f5f5]">
            SCROLL-DRIVEN OPERATING JOURNEY
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            From Fragmented Signals
            <br />
            to Coordinated Execution.
          </h2>
          <p className="text-base sm:text-lg text-white/70 leading-relaxed">
            Experience how Orion-9 bridges raw telemetry, analytical reasoning, and autonomous field orchestration in four continuous stages.
          </p>
        </div>

        {/* Desktop Stage Switcher / Stepper (Tabs with clean states) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-10">
          {stages.map((stage, idx) => {
            const isActive = idx === activeStageIndex;
            return (
              <button
                key={stage.number}
                type="button"
                onClick={() => setActiveStageIndex(idx)}
                className={`p-4 sm:p-5 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'bg-[#151e30] border-[#f5f5f5]/70 shadow-lg shadow-cyan-950/30'
                    : 'bg-[#0f1626] border-white/10 hover:border-white/20 hover:bg-[#121a2b]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-white/40">STAGE {stage.number}</span>
                  {isActive && (
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.accent }} />
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">{stage.name}</h3>
                <p className="text-xs text-white/50 mt-1 line-clamp-1">{stage.tagline}</p>
              </button>
            );
          })}
        </div>

        {/* Active Stage Detailed Stage Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Stage Explanation & Signals */}
          <div className="lg:col-span-6 bg-[#151e30] rounded-2xl border border-white/15 p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-[#f5f5f5] font-bold">STAGE {currentStage.number} // 04</span>
                <span className="text-white/30" aria-hidden="true">·</span>
                <span className="text-white/60 uppercase">{currentStage.name} PHASE</span>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                  &ldquo;{currentStage.tagline}&rdquo;
                </h3>
                <p className="text-sm sm:text-base text-white/70 leading-relaxed font-normal">
                  {currentStage.description}
                </p>
              </div>

              {/* Signals list */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <span className="text-xs font-mono text-white/40 uppercase tracking-wider block">
                  Synchronized Signal Sources
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentStage.signals.map((sig, sIdx) => (
                    <div
                      key={sIdx}
                      className="flex items-center gap-2 text-xs text-white/80 p-2.5 rounded-lg bg-[#0f1626]/80 border border-white/5"
                    >
                      <Check className="w-3.5 h-3.5 shrink-0 text-[#f5f5f5]" />
                      <span className="truncate">{sig}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stage Navigation Stepper controls */}
            <div className="pt-8 flex items-center justify-between text-xs font-mono text-white/50">
              <button
                type="button"
                disabled={activeStageIndex === 0}
                onClick={() => setActiveStageIndex((prev) => Math.max(0, prev - 1))}
                className="hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                ← Previous Stage
              </button>
              <span>{activeStageIndex + 1} OF 4</span>
              <button
                type="button"
                disabled={activeStageIndex === stages.length - 1}
                onClick={() => setActiveStageIndex((prev) => Math.min(stages.length - 1, prev + 1))}
                className="hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors text-[#f5f5f5]"
              >
                Next Stage →
              </button>
            </div>
          </div>

          {/* Right Column: Visual Telemetry Node View */}
          <div className="lg:col-span-6 bg-[#1d293d] rounded-2xl border border-white/15 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <span className="text-xs font-mono text-white/50 uppercase tracking-wider">
                  Operational Control Surface
                </span>
                <span className="text-xs font-mono text-[#f5f5f5]">STAGE {currentStage.number} PROTOCOL</span>
              </div>

              {/* Visual Items Feed */}
              <div className="space-y-4">
                {currentStage.visualItems.map((item, vIdx) => (
                  <div
                    key={vIdx}
                    className="p-4 rounded-xl bg-[#151e30]/90 border border-white/10 space-y-1.5 transition-all hover:border-white/20"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white tracking-tight">{item.label}</span>
                      <span
                        className="font-mono text-[11px] px-2 py-0.5 rounded bg-white/5 border border-white/10"
                        style={{ color: currentStage.accent }}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed font-mono">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Architecture Invariant notice */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/40">
              <span>SECURITY: AUDITED DETERMINISTIC BOUNDARIES</span>
              <span className="text-[#f5f5f5]">ZERO LATENCY PIPELINE</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

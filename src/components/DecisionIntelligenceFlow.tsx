import React, { useState } from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';
import { Radio, ShieldCheck, ArrowRight } from 'lucide-react';

interface PipelineStep {
  step: string;
  name: string;
  category: string;
  detail: string;
  systemAction: string;
  invariant: string;
}

// 7-Stage Operational Intelligence Pipeline required by specification:
// Detection -> Context -> Risk assessment -> Recommendation -> Decision -> Execution -> Verification
const pipelineSteps: PipelineStep[] = [
  {
    step: '01',
    name: 'Detection',
    category: 'TELEMETRY INGESTION',
    detail:
      'Carrier AIS feed reports a 48-hour unplanned anchorage delay at Singapore gateway port affecting 4 container vessels.',
    systemAction:
      'Automated stream ingestion triggers threshold anomaly filter and correlates bills of lading in sub-second latency.',
    invariant: 'Idempotent event queue prevents duplicate alert storms.',
  },
  {
    step: '02',
    name: 'Context',
    category: 'CANONICAL GRAPH CORRELATION',
    detail:
      'Orion-9 resolves vessel manifests against purchase orders, supplier batch IDs, and downstream assembly schedules.',
    systemAction:
      'Maps delayed containers to 18,400 critical lithography & sensor sub-assemblies destined for Frankfurt manufacturing.',
    invariant: '100% entity resolution across ERP, WMS, and TMS records.',
  },
  {
    step: '03',
    name: 'Risk Assessment',
    category: 'IMPACT & BUFFER MODELING',
    detail:
      'Multi-echelon safety stock simulation calculates exact line-stoppage exposure across European production facilities.',
    systemAction:
      'Identifies a 5-day buffer exhaustion window in Plant DE-02 with $1.4M projected SLA penalty if unmitigated.',
    invariant: 'Lead-time variance accounts for customs and drayage handoffs.',
  },
  {
    step: '04',
    name: 'Recommendation',
    category: 'MULTI-OBJECTIVE OPTIMIZATION',
    detail:
      'Stochastic solver evaluates 3 candidate pathways balancing expedited freight cost, transit speed, and carbon impact.',
    systemAction:
      'Recommends priority split: air-freight top 15% critical components via Dubai sea-air bridge while re-slotting bulk ocean.',
    invariant: '100% SLA protection achieved with bounded +$42k expedite trade-off.',
  },
  {
    step: '05',
    name: 'Decision',
    category: 'GOVERNED AUTHORIZATION',
    detail:
      'Recommended intervention routes to the Supply Chain Director with full financial, SLA, and upstream lineage context.',
    systemAction:
      'Enforces policy-bounded two-person sign-off threshold prior to committing external carrier capacity.',
    invariant: 'Zero unauthorized financial commitments or shadow overrides.',
  },
  {
    step: '06',
    name: 'Execution',
    category: 'AUTONOMOUS NETWORK DISPATCH',
    detail:
      'Upon cryptographic approval, Orion-9 dispatches EDI 304 booking updates to air carrier and updates SAP purchase orders.',
    systemAction:
      'Simultaneously re-allocates Frankfurt warehouse receiving dock appointments and drayage dispatch.',
    invariant: 'Transactional rollback guard if partner API rejects booking.',
  },
  {
    step: '07',
    name: 'Verification',
    category: 'CLOSED-LOOP AUDIT & LINEAGE',
    detail:
      'ADS-B flight departure and customs clearance telemetry confirm recovery of assembly buffer above 99.4% threshold.',
    systemAction:
      'Commits immutable audit record linking anomaly detection, human decision signature, and verified outcome.',
    invariant: 'Append-only cryptographic operational ledger.',
  },
];

export const DecisionIntelligenceFlow: React.FC = () => {
  const { activeConfig } = useSiteConfig();
  const hp = activeConfig.homepage;
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const activeStep = pipelineSteps[activeStepIndex];

  return (
    <section
      id="intelligence-pipeline"
      className="py-24 bg-[#EAF4F8] border-b border-[#D5E1E8] relative text-xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#D5E1E8] text-[11px] font-mono uppercase tracking-widest text-[#294D6B] font-semibold">
            <Radio className="w-3.5 h-3.5" />
            <span>{hp.intelligenceEyebrow}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] text-[#111827] leading-tight">
            {hp.intelligenceTitle}
          </h2>
          <p className="text-sm sm:text-base text-[#566575] leading-relaxed">
            {hp.intelligenceSubtitle}
          </p>
        </div>

        {/* 7-Stage Pipeline Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 mb-8 font-mono">
          {pipelineSteps.map((s, idx) => {
            const isCurrent = idx === activeStepIndex;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setActiveStepIndex(idx)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#101820] text-white border-[#101820] shadow-[0_14px_32px_rgba(16,24,32,0.16)]'
                    : 'bg-white text-[#111827] border-[#D5E1E8] hover:border-[#294D6B]/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 text-[10px]">
                  <span className={isCurrent ? 'text-[#A8C2D2]' : 'text-[#566575]'}>
                    STAGE {s.step}
                  </span>
                  {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-[#A8C2D2]" />}
                </div>
                <h4 className="text-xs font-bold tracking-tight font-sans">{s.name}</h4>
                <span
                  className={`text-[9px] mt-1 block uppercase truncate ${
                    isCurrent ? 'text-[#A8C2D2]/80' : 'text-[#566575]'
                  }`}
                >
                  {s.category}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Stage Detail Card */}
        <div className="p-7 sm:p-10 rounded-3xl bg-white border border-[#D5E1E8] shadow-[0_20px_50px_rgba(16,24,32,0.06)] space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#D5E1E8] font-mono text-xs text-[#566575]">
            <div className="flex items-center gap-2">
              <span className="text-[#294D6B] font-bold">
                PIPELINE STAGE {activeStep.step} OF 07
              </span>
              <span className="text-[#D5E1E8]" aria-hidden="true">
                /
              </span>
              <span className="uppercase text-[#111827] font-semibold">{activeStep.category}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#294D6B] text-[11px] font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>DETERMINISTIC GOVERNANCE</span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight">
              {activeStep.name}: {activeStep.detail}
            </h3>
            <p className="text-sm sm:text-base text-[#566575] leading-relaxed">
              {activeStep.systemAction}
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F9FB] border border-[#D5E1E8] space-y-1 font-mono">
            <span className="text-[10px] text-[#294D6B] font-bold uppercase block">
              ARCHITECTURAL INVARIANT
            </span>
            <p className="text-[#111827] font-medium text-xs font-sans">{activeStep.invariant}</p>
          </div>

          {/* Stepper Footer Controls */}
          <div className="pt-4 flex items-center justify-between font-mono text-xs text-[#566575] border-t border-[#D5E1E8]">
            <button
              type="button"
              disabled={activeStepIndex === 0}
              onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
              className="px-4 py-2 rounded-full border border-[#D5E1E8] bg-[#F5F9FB] text-[#111827] font-semibold hover:border-[#294D6B] disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              ← PREVIOUS STAGE
            </button>
            <span className="font-bold text-[#111827]">
              STAGE {activeStepIndex + 1} OF {pipelineSteps.length}
            </span>
            <button
              type="button"
              disabled={activeStepIndex === pipelineSteps.length - 1}
              onClick={() =>
                setActiveStepIndex((prev) => Math.min(pipelineSteps.length - 1, prev + 1))
              }
              className="px-4 py-2 rounded-full bg-[#101820] text-white font-semibold hover:bg-[#294D6B] disabled:opacity-35 disabled:pointer-events-none transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>NEXT STAGE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

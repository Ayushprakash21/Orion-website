import React, { useState } from 'react';
import {
  Radio,
  GitBranch,
  AlertTriangle,
  Scale,
  ShieldCheck,
  Send,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

interface Stage {
  number: string;
  name: string;
  tagline: string;
  detail: string;
  telemetryMetric: string;
  guarantee: string;
}

const stages: Stage[] = [
  {
    number: '01',
    name: 'Signal Detection',
    tagline: 'Sub-second anomaly ingestion from satellite AIS',
    detail:
      'Carrier satellite AIS stream alerts to a 48-hour unplanned anchorage delay outside Singapore gateway port affecting 4 container vessels.',
    telemetryMetric: 'Ingestion Latency: 120ms · Deduplicated',
    guarantee: 'Idempotent streaming pipeline eliminates alert fatigue.',
  },
  {
    number: '02',
    name: 'Contextualization',
    tagline: 'Canonical graph correlation with enterprise ERP',
    detail:
      'Orion-9 resolves container manifests against active purchase orders, identifying 18,400 critical lithography sub-assemblies destined for Frankfurt Plant DE-02.',
    telemetryMetric: '100% Entity Resolution across SAP & Manhattan WMS',
    guarantee: 'Unambiguous bill-of-lading to component mapping.',
  },
  {
    number: '03',
    name: 'Risk Modeling',
    tagline: 'Multi-echelon buffer burn-rate simulation',
    detail:
      'Plant inventory buffer models project a stockout in 5 business days, triggering a projected $1.4M downtime penalty if unmitigated.',
    telemetryMetric: 'Stockout Window: Day 5 · $1.4M SLA Exposure',
    guarantee: 'Considers drayage delays and customs clearance variance.',
  },
  {
    number: '04',
    name: 'Optimization',
    tagline: 'Stochastic multi-objective Pareto solver',
    detail:
      'The solver evaluates 3 candidate pathways balancing expedite cost, transit speed, and emissions, recommending an air-freight split for the top 15% critical parts via Dubai.',
    telemetryMetric: '100% SLA Protection · Bounded +$42k Expedite Cost',
    guarantee: 'Zero assembly line stoppages; lowest landed landed cost curve.',
  },
  {
    number: '05',
    name: 'Governed Sign-off',
    tagline: 'Policy-enforced operator authorization',
    detail:
      'The proposed split routes to the Supply Chain Director with full financial, SLA, and lineage context, enforcing the corporate sign-off policy.',
    telemetryMetric: 'Two-Person Authorization Policy Enforced',
    guarantee: 'Zero unauthorized freight commitments or shadow overrides.',
  },
  {
    number: '06',
    name: 'Autonomous Execution',
    tagline: 'Closed-loop carrier API booking & ERP update',
    detail:
      'Orion-9 dispatches booking requests to Emirates SkyCargo APIs, updates SAP PO delivery dates, and reschedules customs appointments automatically.',
    telemetryMetric: 'Closed-loop API confirmation received in 4.2 seconds',
    guarantee: 'Cryptographic non-repudiation audit log entry created.',
  },
];

export const DecisionIntelligenceFlow: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const current = stages[activeStep];

  return (
    <section id="intelligence" className="py-24 sm:py-32 bg-[#EAF4F8] border-b border-[#D5E1E8] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Section Header */}
        <div className="max-w-3xl mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#D5E1E8] text-xs font-mono text-[#294D6B]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#294D6B]" />
            <span className="font-semibold text-[#111827]">03 / DECISION INTELLIGENCE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.03em] text-[#111827] leading-[1.08]">
            From Signal to Governed Decision.
          </h2>

          <p className="text-base sm:text-lg text-[#4A5568] leading-relaxed">
            Witness how Orion-9 transforms a raw maritime anomaly into an auditable,
            multi-objective intervention in minutes rather than days.
          </p>
        </div>

        {/* Horizontal Visual Sequence Stepper */}
        <div className="mb-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {stages.map((stage, idx) => {
              const isSelected = activeStep === idx;
              const isPast = activeStep > idx;
              return (
                <button
                  key={stage.number}
                  type="button"
                  onClick={() => setActiveStep(idx)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white border-[#294D6B] shadow-[0_8px_20px_rgba(41,77,107,0.12)] scale-[1.02]'
                      : 'bg-white/70 border-[#D5E1E8] hover:bg-white hover:border-[#294D6B]/30'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span
                      className={`font-bold ${
                        isSelected
                          ? 'text-[#294D6B]'
                          : isPast
                          ? 'text-slate-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {stage.number}
                    </span>
                    {isPast && <CheckCircle2 className="w-3.5 h-3.5 text-[#294D6B]" />}
                  </div>
                  <span className="text-xs font-bold text-[#111827] leading-snug">
                    {stage.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Stage Detailed Progression Card */}
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#D5E1E8] shadow-[0_16px_40px_rgba(20,40,65,0.06)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF4F8] text-xs font-mono text-[#294D6B]">
              <span className="font-semibold">STAGE {current.number}</span>
              <span>/</span>
              <span>{current.name.toUpperCase()}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">
              {current.tagline}
            </h3>

            <p className="text-base text-[#4A5568] leading-relaxed max-w-xl">
              {current.detail}
            </p>

            <div className="pt-2 flex items-center gap-4">
              <button
                type="button"
                onClick={() => setActiveStep((prev) => (prev + 1) % stages.length)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#101820] text-white text-xs font-semibold hover:bg-[#294D6B] transition-colors cursor-pointer"
              >
                <span>Advance Sequence</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#A8C2D2]" />
              </button>

              <span className="text-xs font-mono text-[#566575]">
                Step {activeStep + 1} of {stages.length}
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#F5F9FB] rounded-2xl p-6 sm:p-8 border border-[#D5E1E8] space-y-4">
            <div className="text-[11px] font-mono text-[#566575] uppercase tracking-wider pb-2 border-b border-[#D5E1E8]">
              Automated Operational Telemetry
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#D5E1E8] space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#294D6B] block font-semibold">
                Execution Guarantee:
              </span>
              <p className="text-xs text-[#111827] font-medium">{current.guarantee}</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#D5E1E8] space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#566575] block font-semibold">
                Active Benchmark:
              </span>
              <p className="text-xs font-mono text-[#294D6B] font-bold">
                {current.telemetryMetric}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

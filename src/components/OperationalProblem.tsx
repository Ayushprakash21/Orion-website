import React from 'react';
import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface ProblemItem {
  number: string;
  title: string;
  symptom: string;
  consequence: string;
  resolution: string;
}

const problems: ProblemItem[] = [
  {
    number: '01',
    title: 'Fragmented Transactional Silos',
    symptom:
      'ERPs, warehouse systems (WMS), and carrier platforms maintain conflicting data schemas and delayed batch updates.',
    consequence:
      'Inventory records disagree across facilities, creating ghost stock and misleading allocation commitments.',
    resolution:
      'Orion-9 canonical graph unifies multi-system data into one continuously synchronized operational topology.',
  },
  {
    number: '02',
    title: 'Blind Intermodal Handoffs',
    symptom:
      'Transfers between ocean container berths, rail ramps, and drayage trucks depend on asynchronous EDI messages.',
    consequence:
      'Vessel dwell spikes and missed container pickups compound into severe detention fees and delayed assembly lines.',
    resolution:
      'Continuous milestone telemetry dynamically books terminal gate slots before vessels berth.',
  },
  {
    number: '03',
    title: 'Latent Upstream Risk Signals',
    symptom:
      'Tier-2 component delays, material shortages, and labor actions surface days after shipments fail to depart.',
    consequence:
      'Operations teams are forced into expensive emergency air freight with zero lead time to optimize costs.',
    resolution:
      'Predictive multi-tier monitoring detects supplier variances 5 to 7 days before physical impact.',
  },
  {
    number: '04',
    title: 'Uncoordinated Local Firefighting',
    symptom:
      'Logistics, procurement, and manufacturing teams execute contradictory workarounds via email and spreadsheets.',
    consequence:
      'Expediting one order cannibalizes critical subcomponents from another, triggering cascading SLA failures.',
    resolution:
      'Multi-objective solvers model enterprise trade-offs to protect overarching delivery commitments.',
  },
];

export const OperationalProblem: React.FC = () => {
  return (
    <section id="problem" className="py-24 sm:py-32 bg-[#EAF4F8] border-b border-[#D5E1E8] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Section Header */}
        <div className="max-w-3xl mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#D5E1E8] text-xs font-mono text-[#294D6B]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#294D6B]" />
            <span className="font-semibold text-[#111827]">01 / THE SYSTEMIC PROBLEM</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.03em] text-[#111827] leading-[1.08]">
            The Cost of Fragmented Decisions.
          </h2>

          <p className="text-base sm:text-lg text-[#4A5568] leading-relaxed">
            Modern enterprise supply chains span thousands of suppliers, transit corridors,
            and software platforms. When these layers operate in isolation, small variances
            rapidly escalate into network-wide gridlock.
          </p>
        </div>

        {/* 4 Editorial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {problems.map((prob) => (
            <div
              key={prob.number}
              className="p-8 sm:p-10 rounded-3xl bg-white border border-[#D5E1E8] shadow-[0_10px_30px_rgba(20,40,65,0.04)] hover:shadow-[0_16px_40px_rgba(20,40,65,0.08)] hover:border-[#294D6B]/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#D5E1E8]/70 mb-6 text-xs font-mono text-[#566575]">
                  <span className="font-semibold text-[#111827]">PROBLEM // {prob.number}</span>
                  <span className="text-[#294D6B] font-medium">LEGACY BOTTLENECK</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight mb-4">
                  {prob.title}
                </h3>

                <div className="space-y-4 text-sm leading-relaxed text-[#4A5568]">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#566575] block mb-1">
                      Systemic Variance
                    </span>
                    <p>{prob.symptom}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F5F9FB] border border-[#D5E1E8]/80 text-[#111827]">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-amber-700 block mb-1 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Operational Consequence
                    </span>
                    <p className="text-xs text-[#334155]">{prob.consequence}</p>
                  </div>
                </div>
              </div>

              {/* Orion-9 Resolution */}
              <div className="mt-8 pt-5 border-t border-[#D5E1E8]/70 flex items-start gap-3 text-xs text-[#294D6B]">
                <CheckCircle2 className="w-4 h-4 text-[#294D6B] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#111827] block font-mono text-[11px] uppercase tracking-wider mb-0.5">
                    Orion-9 Orchestration:
                  </span>
                  <p className="text-[#4A5568]">{prob.resolution}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

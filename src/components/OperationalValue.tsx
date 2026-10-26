import React from 'react';
import { Clock, Eye, GitPullRequest, ShieldAlert, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ValueOutcome {
  title: string;
  conceptSubtitle: string;
  description: string;
  operationalShift: {
    from: string;
    to: string;
  };
  icon: React.ElementType;
  accent: string;
}

const valueOutcomes: ValueOutcome[] = [
  {
    title: 'Earlier Identification of Disruptions',
    conceptSubtitle: 'Upstream Anomaly Detection',
    description:
      'Continuous multi-echelon signal analysis surfaces supplier slowdowns, port dwell variances, and inventory anomalies days before downstream stockouts materialize.',
    operationalShift: {
      from: 'Reactive firefighting after freight is already delayed',
      to: 'Proactive early-warning triggers at tier-2 factory & port origin',
    },
    icon: Clock,
    accent: '#f5f5f5',
  },
  {
    title: 'Greater Visibility Across Supply Chain Operations',
    conceptSubtitle: 'Unified Master Network',
    description:
      'Harmonize fragmented logistics records into a single coherent operational graph, linking purchase orders to production runs, container berths, and warehouse dock bays.',
    operationalShift: {
      from: 'Siloed spreadsheets and disconnected ERP / WMS portals',
      to: 'Single-source-of-truth operational network with bi-directional lineage',
    },
    icon: Eye,
    accent: '#f5f5f5',
  },
  {
    title: 'More Coordinated Operational Decisions',
    conceptSubtitle: 'Cross-Functional Trade-Offs',
    description:
      'Evaluate multi-objective trade-offs between expedited air freight costs, safety stock depletion, customer SLA commitments, and carbon footprint implications.',
    operationalShift: {
      from: 'Isolated functional decisions made with incomplete context',
      to: 'Systemic mitigation pathways with clear cost and SLA impact curves',
    },
    icon: GitPullRequest,
    accent: '#f5f5f5',
  },
  {
    title: 'Better Control of Exception-Management Workflows',
    conceptSubtitle: 'Governed Workflow Execution',
    description:
      'Automate routine resolution playbooks while enforcing strict human approval boundaries, dual sign-off thresholds, and immutable audit compliance.',
    operationalShift: {
      from: 'Uncontrolled ad-hoc emails and manual carrier rebooking',
      to: 'Deterministic execution with explicit governance and auditability',
    },
    icon: ShieldAlert,
    accent: '#d4d4d4',
  },
];

export const OperationalValue: React.FC = () => {
  const { launchOrion } = useAuth();

  return (
    <section id="value" className="py-24 bg-[#0a0f1b] border-b border-white/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 space-y-4">
          <div className="text-xs font-mono uppercase tracking-widest text-[#f5f5f5]">
            OPERATIONAL IMPACT
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Move from Visibility
            <br />
            to Action.
          </h2>
          <p className="text-base sm:text-lg text-white/70 leading-relaxed">
            True operational resilience is not simply observing disruptions—it is the capacity to understand systemic consequences and execute coordinated responses at scale.
          </p>
        </div>

        {/* 4 Outcome Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {valueOutcomes.map((item, idx) => {
            const Icon = item.icon;

            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#151e30] border border-white/10 p-7 sm:p-8 flex flex-col justify-between hover:border-white/25 hover:bg-[#182338] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-mono uppercase tracking-wider text-white/40">
                      OUTCOME 0{idx + 1} // {item.conceptSubtitle}
                    </span>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center border"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: item.accent }} />
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight">
                    {item.title}
                  </h3>

                  <p className="text-sm text-white/70 leading-relaxed mb-6 font-normal">
                    {item.description}
                  </p>
                </div>

                {/* Conceptual Operational Shift Box */}
                <div className="pt-5 border-t border-white/10 space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-[#0f1626] border border-white/5 space-y-1">
                    <span className="text-red-400 font-bold block">PREVIOUS STATE:</span>
                    <span className="text-white/60">{item.operationalShift.from}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0f1626] border border-[#f5f5f5]/20 space-y-1">
                    <span className="text-[#f5f5f5] font-bold block">ORION-9 STATE:</span>
                    <span className="text-white/90">{item.operationalShift.to}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Conversion Action Bar */}
        <div className="mt-16 rounded-3xl bg-gradient-to-r from-[#151e30] via-[#1d293d] to-[#151e30] border border-white/15 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="text-xs font-mono uppercase tracking-widest text-[#f5f5f5]">
              READY FOR OPERATIONAL COMMAND
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Access the Orion-9 Control Tower
            </h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Connect your enterprise supply chain data and experience the intelligence layer built for modern operations.
            </p>
          </div>

          <button
            type="button"
            onClick={() => launchOrion()}
            className="flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#f5f5f5] text-[#0f1626] font-bold text-sm uppercase tracking-wider shadow-xl shadow-[#f5f5f5]/25 hover:bg-[#e5e5e5] hover:shadow-[#f5f5f5]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-all transform hover:-translate-y-0.5 whitespace-nowrap shrink-0"
          >
            <span>Launch Orion-9 →</span>
          </button>
        </div>
      </div>
    </section>
  );
};

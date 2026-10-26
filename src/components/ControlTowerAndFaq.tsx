import React, { useState } from 'react';
import { ChevronDown, ArrowUpRight, ShieldCheck, Activity, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ScenarioRecord {
  id: 'nominal' | 'bottleneck' | 'bypass';
  code: string;
  label: string;
  corridor: string;
  statusText: string;
  etaDelta: string;
  slaProtection: string;
  financialImpact: string;
  summary: string;
  actionTaken: string;
}

const SCENARIOS: ScenarioRecord[] = [
  {
    id: 'nominal',
    code: 'STATE 01',
    label: 'Nominal Global Flow',
    corridor: 'Shanghai (SHA) → Rotterdam (RTM) → Frankfurt (FRA)',
    statusText: 'ALL CORRIDORS SYNCHRONIZED',
    etaDelta: '38.0h Remaining (On Schedule)',
    slaProtection: '99.8% Nominal',
    financialImpact: '$0 Exposure',
    summary:
      '142 maritime and air cargo gateways streaming continuous AIS, ADS-B, and plant ERP consumption telemetry into the canonical graph.',
    actionTaken: 'Automated berth-lock and customs pre-clearance active on MV-Orion-01.',
  },
  {
    id: 'bottleneck',
    code: 'STATE 02',
    label: 'Corridor Disruption Detected',
    corridor: 'Red Sea / Suez Maritime Chokepoint',
    statusText: '72H ANCHORAGE QUEUE DETECTED',
    etaDelta: '+72.0h Delay Projected',
    slaProtection: '84.6% At Risk',
    financialImpact: '$1.42M Assembly Risk',
    summary:
      'Unplanned congestion stalls 18,400 lithography sub-assemblies bound for Frankfurt Plant DE-02, threatening safety stock exhaustion in 46 hours.',
    actionTaken: 'Stochastic solver triggered: ranking 8,500 Sea-Air split and rail bypass options.',
  },
  {
    id: 'bypass',
    code: 'STATE 03',
    label: 'Autonomous Sea-Air Bypass',
    corridor: 'Jebel Ali Port → Dubai (DXB) Air Bridge → Frankfurt (FRA)',
    statusText: 'GOVERNED REROUTE EXECUTED',
    etaDelta: '41.2h Verified Arrival (+68.8h Saved)',
    slaProtection: '99.4% Protected',
    financialImpact: '$1.38M Net Protected',
    summary:
      'Priority lot split at Jebel Ali and transferred to Cargo Flight OA-804 with automated SAP purchase order and EDI 304 manifest reconciliation.',
    actionTaken: 'Cryptographically signed execution verified across carrier, customs, and plant WMS.',
  },
];

const FAQ_ITEMS = [
  {
    question: 'How fast can Orion-9 connect to our existing ERP, TMS, and carrier feeds?',
    answer:
      'Orion-9 includes pre-built canonical adapters for SAP S/4HANA, Oracle Cloud SCM, Manhattan WMS, project44, FourKites, and raw satellite AIS / ADS-B telemetry. Most enterprise corridors begin streaming into the digital twin within 48 hours without modifying legacy schemas.',
  },
  {
    question: 'How does governed autonomous execution prevent unauthorized changes?',
    answer:
      'Every solver recommendation operates inside deterministic Zero-Trust policy bounds. You define financial thresholds, approved carrier pools, and two-person cryptographic sign-off rules—ensuring Orion-9 only dispatches EDI bookings or ERP updates that satisfy your exact governance criteria.',
  },
  {
    question: 'What happens when a maritime or air corridor experiences a sudden disruption?',
    answer:
      'Within milliseconds of an AIS berth delay, weather closure, or customs hold, Orion-9 traces the exact bill-of-materials impact down to individual factory assembly lines and evaluates 8,500+ multi-objective reroute scenarios to protect your SLA at minimum expedite cost.',
  },
  {
    question: 'Is Orion-9 compliant with enterprise security and audit requirements?',
    answer:
      'Yes. Orion-9 is engineered with SOC 2 Type II controls, ISO 27001 alignment, tenant-isolated encryption, and an immutable cryptographic audit log recording every telemetry input, solver simulation, and operator authorization.',
  },
];

export const ControlTowerAndFaq: React.FC = () => {
  const { launchOrion, destinationUrl } = useAuth();
  const [selectedScenario, setSelectedScenario] = useState<ScenarioRecord>(SCENARIOS[2]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <div className="w-full bg-white text-[#070B19]">
      {/* ==========================================================================
          PART A: ARCHITECTURAL CONTROL TOWER LIVE INSPECTION (#control-tower)
         ========================================================================== */}
      <section
        id="control-tower"
        className="max-w-[1440px] mx-auto px-6 sm:px-12 py-20 sm:py-28 border-t border-[#E2ECF4]"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-12">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#0284C7] font-medium block mb-3">
              LIVE CONTROL TOWER TELEMETRY
            </span>
            <h2 className="font-editorial text-3xl sm:text-5xl font-bold tracking-[-0.02em] leading-[1.1] text-[#070B19]">
              From corridor anomaly to verified execution.
            </h2>
          </div>

          {/* Scenario Switcher Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {SCENARIOS.map((sc) => {
              const active = sc.id === selectedScenario.id;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => setSelectedScenario(sc)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#070B19] text-white shadow-xs'
                      : 'bg-[#F2F9FD] text-[#334155] hover:bg-[#E2F0FA] border border-[#D4E4F0]'
                  }`}
                >
                  {sc.code} · {sc.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Clean Architectural Telemetry Inspection Frame */}
        <div className="rounded-3xl bg-[#070B19] text-white p-6 sm:p-10 lg:p-12 border border-[#1E293B]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-mono uppercase tracking-wider text-[#38BDF8] font-medium">
                  {selectedScenario.statusText}
                </span>
                <span className="text-white/40" aria-hidden="true">·</span>
                <span className="text-xs font-mono text-white/70">
                  {selectedScenario.corridor}
                </span>
              </div>

              <h3 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-bold tracking-[-0.015em] text-white leading-tight">
                {selectedScenario.summary}
              </h3>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-white/85 font-mono">
                  {selectedScenario.actionTaken}
                </p>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[11px] font-mono uppercase tracking-wider text-white/55 block">
                  CORRIDOR ETA WINDOW
                </span>
                <span className="text-lg sm:text-xl font-bold text-white mt-1.5 block tabular-nums">
                  {selectedScenario.etaDelta}
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[11px] font-mono uppercase tracking-wider text-white/55 block">
                  SLA INTEGRITY
                </span>
                <span className="text-lg sm:text-xl font-bold text-[#38BDF8] mt-1.5 block tabular-nums">
                  {selectedScenario.slaProtection}
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[11px] font-mono uppercase tracking-wider text-white/55 block">
                  FINANCIAL PROTECTION
                </span>
                <span className="text-lg sm:text-xl font-bold text-white mt-1.5 block tabular-nums">
                  {selectedScenario.financialImpact}
                </span>
              </div>

              <button
                type="button"
                onClick={() => launchOrion(destinationUrl)}
                className="p-5 rounded-2xl bg-white text-[#070B19] hover:bg-[#E0F2FE] transition-colors flex flex-col justify-between text-left cursor-pointer group"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[11px] font-mono uppercase tracking-wider font-medium text-[#0284C7]">
                    LIVE COCKPIT
                  </span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <span className="text-base font-bold mt-2 block">
                  Launch Control Tower
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          PART B: SPLIT FAQ ACCORDION SECTION (#faq)
         ========================================================================== */}
      <section
        id="faq"
        className="max-w-[1440px] mx-auto px-6 sm:px-12 py-20 sm:py-28 border-t border-[#E2ECF4]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left 5 Columns: Editorial Heading */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-[-0.02em] leading-[1.1] text-[#070B19]">
              Operational readiness, answered clearly.
            </h2>
            <p className="text-sm sm:text-base text-[#475569] max-w-sm leading-relaxed">
              How Orion-9 integrates with your enterprise stack, governs autonomous decisions, and secures global corridors.
            </p>
          </div>

          {/* Right 7 Columns: Clean Expandable Rows */}
          <div className="lg:col-span-7 border-t border-[#DCE7F0]">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={item.question} className="border-b border-[#DCE7F0]">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full py-6 flex items-center justify-between gap-6 text-left cursor-pointer group"
                    aria-expanded={isOpen}
                  >
                    <span className="font-editorial text-base sm:text-lg font-bold text-[#070B19] group-hover:text-[#0284C7] transition-colors">
                      {item.question}
                    </span>
                    <span className="w-7 h-7 rounded-xs bg-[#070B19] text-white flex items-center justify-center shrink-0 transition-transform duration-200">
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="pb-6 pr-12 text-xs sm:text-sm text-[#475569] leading-relaxed">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

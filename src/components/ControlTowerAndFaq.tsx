import React, { useState } from 'react';
import { ChevronDown, ArrowUpRight, ShieldCheck, Activity, CheckCircle2, Sliders, Globe, Radio } from 'lucide-react';
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
  const { user, launchOrion, destinationUrl } = useAuth();
  const [selectedScenario, setSelectedScenario] = useState<ScenarioRecord>(SCENARIOS[2]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <div className="w-full bg-[var(--orion-canvas)] text-[var(--orion-text-primary)] transition-colors duration-300">
      {/* ==========================================================================
          PART A: ARCHITECTURAL CONTROL TOWER LIVE INSPECTION (#control-tower)
         ========================================================================== */}
      <section
        id="control-tower"
        className="max-w-[1440px] mx-auto px-6 sm:px-12 py-20 sm:py-28 border-t border-[var(--glass-border-subtle)]"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-badge text-[11px] font-mono uppercase tracking-wider text-[var(--orion-accent)] font-semibold mb-3">
              <Radio className="w-3.5 h-3.5 animate-pulse text-[var(--orion-accent)]" />
              <span>LIVE ORION-9 OS TELEMETRY</span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] leading-[1.08] text-[var(--orion-text-primary)]">
              From corridor anomaly to verified execution.
            </h2>
            <p className="text-sm sm:text-base text-[var(--orion-text-secondary)] mt-3 max-w-2xl">
              Inspect multi-tier telemetry streams in real time. Compare autonomous mitigation scenarios with deterministic trade-off analysis.
            </p>
          </div>

          {/* Scenario Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl liquid-glass-subtle">
            {SCENARIOS.map((sc) => {
              const active = sc.id === selectedScenario.id;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => setSelectedScenario(sc)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-[var(--orion-text-primary)] text-[var(--orion-surface)] shadow-sm'
                      : 'text-[var(--orion-text-secondary)] hover:text-[var(--orion-text-primary)] hover:bg-white/40 dark:hover:bg-white/10'
                  }`}
                >
                  {sc.code} · {sc.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* macOS Liquid Glass Operational Window Frame */}
        <div className="rounded-3xl liquid-glass-elevated border border-[var(--glass-border)] overflow-hidden shadow-2xl transition-all duration-300">
          {/* macOS Window Titlebar */}
          <div className="px-6 py-4 border-b border-[var(--glass-border-subtle)] bg-white/40 dark:bg-black/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] shadow-2xs" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] shadow-2xs" />
                <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] shadow-2xs" />
              </div>
              <span className="text-[var(--orion-text-muted)] font-mono text-[11px]">
                orion-control-tower.cockpit — Telemetry Active (216 Nodes)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-mono font-semibold border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                AIS / ADS-B SYNCHRONIZED
              </span>
            </div>
          </div>

          {/* Window Body */}
          <div className="p-6 sm:p-10 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1 rounded-full liquid-glass-badge text-xs font-mono uppercase tracking-wider text-[var(--orion-accent)] font-semibold">
                    {selectedScenario.statusText}
                  </span>
                  <span className="text-[var(--orion-text-muted)]" aria-hidden="true">·</span>
                  <span className="text-xs font-mono text-[var(--orion-text-secondary)]">
                    {selectedScenario.corridor}
                  </span>
                </div>

                <h3 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--orion-text-primary)] leading-snug">
                  {selectedScenario.summary}
                </h3>

                <div className="p-4 rounded-2xl liquid-glass-subtle border border-[var(--glass-border)] flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[var(--orion-accent)] shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-[var(--orion-text-primary)] font-mono">
                    {selectedScenario.actionTaken}
                  </p>
                </div>
              </div>

              {/* KPI Glass Cards */}
              <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl liquid-glass-card">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--orion-text-muted)] block">
                    CORRIDOR ETA WINDOW
                  </span>
                  <span className="text-lg sm:text-xl font-bold text-[var(--orion-text-primary)] mt-1.5 block tabular-nums">
                    {selectedScenario.etaDelta}
                  </span>
                </div>

                <div className="p-5 rounded-2xl liquid-glass-card">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--orion-text-muted)] block">
                    SLA INTEGRITY
                  </span>
                  <span className="text-lg sm:text-xl font-bold text-[var(--orion-accent)] mt-1.5 block tabular-nums">
                    {selectedScenario.slaProtection}
                  </span>
                </div>

                <div className="p-5 rounded-2xl liquid-glass-card">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--orion-text-muted)] block">
                    FINANCIAL PROTECTION
                  </span>
                  <span className="text-lg sm:text-xl font-bold text-[var(--orion-text-primary)] mt-1.5 block tabular-nums">
                    {selectedScenario.financialImpact}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => launchOrion(destinationUrl)}
                  className="p-5 rounded-2xl liquid-glass-elevated hover:bg-[var(--orion-accent)] hover:text-white transition-all duration-200 flex flex-col justify-between text-left cursor-pointer group shadow-md"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-[var(--orion-accent)] group-hover:text-white transition-colors">
                      LIVE COCKPIT
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-[var(--orion-accent)] group-hover:text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                  <span className="text-sm font-bold mt-2 block text-[var(--orion-text-primary)] group-hover:text-white transition-colors">
                    {user ? 'Launch Orion-9 OS' : 'Sign in to Orion-9 OS'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          PART B: SPLIT FAQ ACCORDION SECTION (#faq)
         ========================================================================== */}
      <section
        id="faq"
        className="max-w-[1440px] mx-auto px-6 sm:px-12 py-20 sm:py-28 border-t border-[var(--glass-border-subtle)]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Heading */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-badge text-[11px] font-mono uppercase tracking-wider text-[var(--orion-accent)] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Enterprise FAQ</span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight leading-tight text-[var(--orion-text-primary)]">
              Operational readiness, answered clearly.
            </h2>
            <p className="text-sm sm:text-base text-[var(--orion-text-secondary)] max-w-sm leading-relaxed">
              How Orion-9 integrates with your enterprise stack, governs autonomous decisions, and secures global corridors.
            </p>
          </div>

          {/* Right Column: Liquid Glass Expandable Rows */}
          <div className="lg:col-span-7 space-y-3">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={item.question}
                  className="rounded-2xl liquid-glass-card border border-[var(--glass-border)] transition-all duration-200 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 sm:p-6 flex items-center justify-between gap-6 text-left cursor-pointer group"
                    aria-expanded={isOpen}
                  >
                    <span className="font-editorial text-base sm:text-lg font-bold text-[var(--orion-text-primary)] group-hover:text-[var(--orion-accent)] transition-colors">
                      {item.question}
                    </span>
                    <span className="w-8 h-8 rounded-xl liquid-glass-button text-[var(--orion-text-primary)] flex items-center justify-center shrink-0 transition-transform duration-200">
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-[var(--orion-accent)]' : ''
                        }`}
                      />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-[var(--orion-text-secondary)] leading-relaxed border-t border-[var(--glass-border-subtle)] pt-4 animate-in fade-in duration-150">
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

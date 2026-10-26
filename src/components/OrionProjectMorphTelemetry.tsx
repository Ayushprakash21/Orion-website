import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import {
  Activity,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Layers,
  Cpu,
  Factory,
  Package,
  Plane,
  Ship,
  Sparkles,
  Radio,
  FileCheck2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export interface TelemetryScenario {
  id: 'nominal' | 'bottleneck' | 'bypass';
  code: string;
  badge: string;
  title: string;
  headline: string;
  corridor: string;
  background: string;
  accent: string;
  accentBorder: string;
  accentGlow: string;
  etaDelta: string;
  slaProtection: string;
  financialImpact: string;
  inventoryBuffer: string;
  summary: string;
  actionTaken: string;
  erpReconciliation: string;
  stages: {
    name: string;
    stage: string;
    status: 'nominal' | 'warning' | 'mitigated';
    metric: string;
    subtext: string;
    icon: 'raw' | 'supplier' | 'manufacturing' | 'warehouse' | 'transport' | 'customer';
  }[];
}

const SCENARIOS: TelemetryScenario[] = [
  {
    id: 'nominal',
    code: 'STATE 01',
    badge: 'ALL CORRIDORS NOMINAL',
    title: 'Nominal Global Flow',
    headline: 'GLOBAL FLOW NOMINAL',
    corridor: 'Shanghai (SHA) → Rotterdam (RTM) → Frankfurt (FRA)',
    background: '#070f1e',
    accent: '#38BDF8',
    accentBorder: 'rgba(56, 189, 248, 0.35)',
    accentGlow: 'rgba(56, 189, 248, 0.2)',
    etaDelta: '38.0h (On Schedule)',
    slaProtection: '99.8% Nominal',
    financialImpact: '$0 Exposure',
    inventoryBuffer: '124h Safety Buffer',
    summary:
      'Multi-tier graph active across 142 maritime gateways, 34 foundry fab lines, and 12 ASRS automated fulfillment hubs. All material, wafer, and assembly allocations streaming synchronously.',
    actionTaken:
      'Continuous dynamic buffer monitoring. Automated customs pre-clearance locked for MV Orion Voyager at Rotterdam Gateway.',
    erpReconciliation: 'SAP S/4HANA PO #889211 locked · EDI 304 verified · 0 reconciliations required',
    stages: [
      {
        name: 'Origins',
        stage: 'Raw Materials',
        status: 'nominal',
        metric: '99.9% Yield',
        subtext: 'Silicon & Lithium feedstocks',
        icon: 'raw',
      },
      {
        name: 'Tier-1 Fab',
        stage: 'Foundry Suppliers',
        status: 'nominal',
        metric: '100% On-Time',
        subtext: 'Hsinchu & Singapore wafers',
        icon: 'supplier',
      },
      {
        name: 'Frankfurt DE-02',
        stage: 'Smart Manufacturing',
        status: 'nominal',
        metric: '44 u/h Active',
        subtext: 'Cleanroom Assembly Line 4',
        icon: 'manufacturing',
      },
      {
        name: 'ASRS Hub 04',
        stage: 'High-Bay Warehousing',
        status: 'nominal',
        metric: '124h Stock',
        subtext: 'Dynamic safety buffer',
        icon: 'warehouse',
      },
      {
        name: 'MV Orion Voyager',
        stage: 'Multimodal Transport',
        status: 'nominal',
        metric: '19.4 kts',
        subtext: 'Via Suez maritime corridor',
        icon: 'transport',
      },
      {
        name: 'OEM Customers',
        stage: 'Customer Delivery',
        status: 'nominal',
        metric: '99.8% OTIF',
        subtext: 'Contractual SLAs protected',
        icon: 'customer',
      },
    ],
  },
  {
    id: 'bottleneck',
    code: 'STATE 02',
    badge: 'CRITICAL BOTTLENECK DETECTED',
    title: 'Corridor Disruption',
    headline: 'CORRIDOR DISRUPTED',
    corridor: 'Red Sea / Bab-el-Mandeb Chokepoint Queue',
    background: '#1a0b12',
    accent: '#FB7185',
    accentBorder: 'rgba(251, 113, 133, 0.4)',
    accentGlow: 'rgba(251, 113, 133, 0.22)',
    etaDelta: '+72.0h Delay Projected',
    slaProtection: '84.6% At Risk',
    financialImpact: '$1.42M Assembly Risk',
    inventoryBuffer: '46h (Critical Line-Halt)',
    summary:
      'Unplanned geopolitical choke delays vessel carrying 18,400 lithography sub-assemblies. Frankfurt Plant DE-02 buffer depleted to 46h, threatening cleanroom shutdown in 2 days.',
    actionTaken:
      'Autonomous Orion-9 solver triggered: ranking 8,500 Sea-Air multimodal bypass solutions with real-time carbon, tariff, and SLA cost optimization.',
    erpReconciliation: 'SAP S/4HANA exception flagged · Inbound PO #889211 held at customs hold queue',
    stages: [
      {
        name: 'Origins',
        stage: 'Raw Materials',
        status: 'nominal',
        metric: 'Standard',
        subtext: 'Feedstock dispatch cleared',
        icon: 'raw',
      },
      {
        name: 'Tier-1 Fab',
        stage: 'Foundry Suppliers',
        status: 'nominal',
        metric: 'Dispatched',
        subtext: 'Substrate batches released',
        icon: 'supplier',
      },
      {
        name: 'Frankfurt DE-02',
        stage: 'Smart Manufacturing',
        status: 'warning',
        metric: 'Buffer Depleting',
        subtext: 'Line-halt in 46.2 hours',
        icon: 'manufacturing',
      },
      {
        name: 'ASRS Hub 04',
        stage: 'High-Bay Warehousing',
        status: 'warning',
        metric: '46h Reserve',
        subtext: 'Below minimum safety threshold',
        icon: 'warehouse',
      },
      {
        name: 'Red Sea Queue',
        stage: 'Multimodal Transport',
        status: 'warning',
        metric: '+72h Stall',
        subtext: 'MV Orion Voyager held in queue',
        icon: 'transport',
      },
      {
        name: 'OEM Customers',
        stage: 'Customer Delivery',
        status: 'warning',
        metric: '84.6% SLA',
        subtext: '$1.42M contractual exposure',
        icon: 'customer',
      },
    ],
  },
  {
    id: 'bypass',
    code: 'STATE 03',
    badge: 'AUTONOMOUS RECOVERY EXECUTED',
    title: 'Autonomous Air Bypass',
    headline: 'AUTONOMOUS BYPASS',
    corridor: 'Jebel Ali Port → Dubai (DXB) Air Bridge → Frankfurt (FRA)',
    background: '#04171d',
    accent: '#34D399',
    accentBorder: 'rgba(52, 211, 153, 0.35)',
    accentGlow: 'rgba(52, 211, 153, 0.22)',
    etaDelta: '41.2h (+68.8h Saved)',
    slaProtection: '99.4% Protected',
    financialImpact: '$1.38M Net Protected',
    inventoryBuffer: '118h Restored Buffer',
    summary:
      'Autonomous lot split executed at Jebel Ali. Critical lithography batches transferred to Emirates SkyCargo OA-804 via bonded corridor, landing at FRA 68.8 hours ahead of schedule.',
    actionTaken:
      'End-to-end cryptographic execution completed: Carrier booking, bonded customs clearance, SAP line allocation, and automated EDI 304 manifest reconciled.',
    erpReconciliation: 'SAP PO #889211 split into #889211-A (Air) & #889211-B (Sea) · EDI 304 confirmed',
    stages: [
      {
        name: 'Origins',
        stage: 'Raw Materials',
        status: 'nominal',
        metric: 'Optimal',
        subtext: 'Upstream supply verified',
        icon: 'raw',
      },
      {
        name: 'Tier-1 Fab',
        stage: 'Foundry Suppliers',
        status: 'nominal',
        metric: 'Synchronized',
        subtext: 'Continuous batch flow',
        icon: 'supplier',
      },
      {
        name: 'Frankfurt DE-02',
        stage: 'Smart Manufacturing',
        status: 'mitigated',
        metric: '100% Restored',
        subtext: 'Lithography Line 4 protected',
        icon: 'manufacturing',
      },
      {
        name: 'ASRS Hub 04',
        stage: 'High-Bay Warehousing',
        status: 'mitigated',
        metric: '118h Safety',
        subtext: 'Buffer restocked via FRA hub',
        icon: 'warehouse',
      },
      {
        name: 'Flight OA-804',
        stage: 'Multimodal Transport',
        status: 'mitigated',
        metric: 'Air Bypass',
        subtext: 'Jebel Ali to DXB to FRA Cargo',
        icon: 'transport',
      },
      {
        name: 'OEM Customers',
        stage: 'Customer Delivery',
        status: 'mitigated',
        metric: '99.4% OTIF',
        subtext: 'Zero assembly penalties incurred',
        icon: 'customer',
      },
    ],
  },
];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const OrionProjectMorphTelemetry: React.FC = () => {
  const { user, launchOrion, destinationUrl } = useAuth();
  const [activeIndex, setActiveIndex] = useState(2); // Start on State 03 (Autonomous Bypass)
  const [travelDirection, setTravelDirection] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;

  // Spring Parallax physics
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 65, damping: 22, mass: 0.6 });
  const smoothY = useSpring(pointerY, { stiffness: 65, damping: 22, mass: 0.6 });

  const activeScenario = SCENARIOS[activeIndex];

  const goTo = (nextIndex: number) => {
    const total = SCENARIOS.length;
    const normalized = (nextIndex + total) % total;
    if (normalized === activeIndexRef.current) return;

    const previous = activeIndexRef.current;
    const rawDelta = normalized - previous;
    const direction =
      Math.abs(rawDelta) > total / 2 ? -Math.sign(rawDelta) : Math.sign(rawDelta);

    setTravelDirection(direction || 1);
    setActiveIndex(normalized);
  };

  // Auto-play interval
  useEffect(() => {
    if (!isAutoPlaying || (isHovered && !prefersReducedMotion)) return undefined;

    const interval = setInterval(() => {
      goTo((activeIndexRef.current + 1) % SCENARIOS.length);
    }, 5500);

    return () => clearInterval(interval);
  }, [isAutoPlaying, isHovered, prefersReducedMotion]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    pointerX.set(x * 12);
    pointerY.set(y * 8);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    pointerX.set(0);
    pointerY.set(0);
  };

  const renderStageIcon = (type: string) => {
    switch (type) {
      case 'raw':
        return <Layers className="w-4 h-4" />;
      case 'supplier':
        return <Cpu className="w-4 h-4" />;
      case 'manufacturing':
        return <Factory className="w-4 h-4" />;
      case 'warehouse':
        return <Package className="w-4 h-4" />;
      case 'transport':
        return activeScenario.id === 'bypass' ? <Plane className="w-4 h-4" /> : <Ship className="w-4 h-4" />;
      case 'customer':
      default:
        return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  return (
    <section
      id="control-tower"
      aria-label="Orion-9 Supply Chain Telemetry Experience"
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      className="relative w-full overflow-hidden transition-colors duration-700 py-16 sm:py-24 border-t border-[var(--glass-border-subtle)]"
    >
      {/* Background Dynamic Color Morphing */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        animate={{ backgroundColor: activeScenario.background }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.85, ease: EASE }}
      />

      {/* Soft Cyber Ambient Noise / Radial Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at 18% 25%, rgba(56,189,248,0.15) 0 1px, transparent 1.5px), radial-gradient(circle at 82% 75%, rgba(52,211,153,0.12) 0 1px, transparent 1.5px), linear-gradient(135deg, rgba(255,255,255,0.03), transparent 60%)',
          backgroundSize: '48px 48px, 60px 60px, 100% 100%',
        }}
      />

      <div className="relative max-w-[1440px] mx-auto px-6 sm:px-12 z-10">
        {/* Top Header & Scenario Switcher Bar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full liquid-glass-badge text-[11px] font-mono uppercase tracking-wider text-[var(--orion-accent)] font-semibold mb-3">
              <Radio className="w-3.5 h-3.5 animate-pulse text-[var(--orion-accent)]" />
              <span>SIMULATED DEMONSTRATION TELEMETRY • LIVE AI TELEMETRY</span>
            </div>

            {/* Staggered Letter-by-Letter Animated Title (ProjectMorph adaptation) */}
            <div className="overflow-hidden py-1">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeScenario.id}
                  className="flex flex-wrap items-baseline gap-x-3"
                >
                  <h2 className="font-editorial text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] leading-[1.08] text-white">
                    {activeScenario.headline.split('').map((char, index) => (
                      <span key={index} className="inline-block overflow-hidden">
                        <motion.span
                          custom={travelDirection}
                          variants={{
                            initial: (dir: number) => ({
                              y: prefersReducedMotion ? 0 : dir > 0 ? '110%' : '-110%',
                              opacity: prefersReducedMotion ? 1 : 0,
                            }),
                            animate: {
                              y: '0%',
                              opacity: 1,
                              transition: {
                                duration: prefersReducedMotion ? 0 : 0.5,
                                delay: index * 0.02,
                                ease: EASE,
                              },
                            },
                            exit: (dir: number) => ({
                              y: prefersReducedMotion ? 0 : dir > 0 ? '-110%' : '110%',
                              opacity: prefersReducedMotion ? 1 : 0,
                              transition: {
                                duration: prefersReducedMotion ? 0 : 0.35,
                                ease: EASE,
                              },
                            }),
                          }}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          className="inline-block"
                        >
                          {char === ' ' ? '\u00A0' : char}
                        </motion.span>
                      </span>
                    ))}
                  </h2>
                </motion.div>
              </AnimatePresence>
            </div>

            <p className="text-sm sm:text-base text-slate-300 mt-2.5 max-w-2xl">
              Inspect multi-tier telemetry streams in real time. Compare autonomous mitigation scenarios with deterministic trade-off analysis.
            </p>
          </div>

          {/* Controls: Prev/Next, Play/Pause, and Scenario Selector Pills */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl liquid-glass-subtle border border-white/10 backdrop-blur-xl">
            {SCENARIOS.map((sc, idx) => {
              const active = idx === activeIndex;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => goTo(idx)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? 'bg-white text-slate-900 shadow-md font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      active
                        ? sc.id === 'bottleneck'
                          ? 'bg-rose-500'
                          : sc.id === 'bypass'
                          ? 'bg-emerald-500'
                          : 'bg-sky-500'
                        : 'bg-slate-500'
                    }`}
                  />
                  <span>{sc.code}</span>
                </button>
              );
            })}

            <div className="h-4 w-px bg-white/20 mx-1" />

            {/* Navigation Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => goTo(activeIndex - 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                aria-label="Previous Scenario"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                aria-label={isAutoPlaying ? 'Pause Slideshow' : 'Resume Slideshow'}
              >
                {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => goTo(activeIndex + 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                aria-label="Next Scenario"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* macOS Cockpit Operational Window Frame with Parallax */}
        <motion.div
          style={{ x: prefersReducedMotion ? 0 : smoothX, y: prefersReducedMotion ? 0 : smoothY }}
          className="rounded-3xl liquid-glass-elevated border border-white/15 overflow-hidden shadow-2xl transition-all duration-300 bg-slate-950/70 backdrop-blur-2xl"
        >
          {/* macOS Window Titlebar */}
          <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
              </div>
              <span className="text-slate-400 font-mono text-[11px] truncate">
                orion-control-tower.cockpit — {activeScenario.code}: {activeScenario.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                style={{
                  borderColor: activeScenario.accentBorder,
                  color: activeScenario.accent,
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-semibold border bg-white/5"
              >
                <span
                  style={{ backgroundColor: activeScenario.accent }}
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                />
                {activeScenario.badge}
              </span>
            </div>
          </div>

          {/* Window Body: End-to-End Interconnected Supply Chain Visualization */}
          <div className="p-6 sm:p-8 lg:p-10 space-y-8">
            {/* 6-Stage End-to-End Pipeline Visualization */}
            <div>
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-mono font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-sky-400" />
                  <span>END-TO-END SUPPLY CHAIN JOURNEY (TIER-N TO CUSTOMER)</span>
                </span>
                <span className="font-mono text-slate-400 text-[10px]">
                  Corridor: <span className="text-white font-medium">{activeScenario.corridor}</span>
                </span>
              </div>

              {/* Responsive 6-Column Pipeline Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {activeScenario.stages.map((stage, idx) => {
                  const isNominal = stage.status === 'nominal';
                  const isWarning = stage.status === 'warning';
                  const isMitigated = stage.status === 'mitigated';

                  return (
                    <motion.div
                      key={stage.name}
                      initial={false}
                      animate={{
                        scale: [0.98, 1],
                        opacity: 1,
                      }}
                      transition={{ duration: 0.35, delay: idx * 0.05 }}
                      className={`p-3.5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between min-h-[110px] ${
                        isWarning
                          ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                          : isMitigated
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                          : 'bg-white/5 border-white/10 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            isWarning
                              ? 'bg-rose-500/20 text-rose-400'
                              : isMitigated
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-sky-500/20 text-sky-400'
                          }`}
                        >
                          {renderStageIcon(stage.icon)}
                        </div>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/40">
                          0{idx + 1}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block truncate">
                          {stage.stage}
                        </span>
                        <span className="text-xs font-bold text-white block truncate mt-0.5">
                          {stage.name}
                        </span>
                        <div className="mt-1 flex items-center justify-between text-[10px] font-mono">
                          <span
                            className={`font-semibold ${
                              isWarning
                                ? 'text-rose-400'
                                : isMitigated
                                ? 'text-emerald-400'
                                : 'text-sky-400'
                            }`}
                          >
                            {stage.metric}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Main Interactive Details & Metrics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2 border-t border-white/10">
              <div className="lg:col-span-7 space-y-5">
                <div className="flex items-center gap-3">
                  <span
                    style={{
                      borderColor: activeScenario.accentBorder,
                      color: activeScenario.accent,
                    }}
                    className="px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider border bg-white/5"
                  >
                    {activeScenario.badge}
                  </span>
                  <span className="text-slate-500">·</span>
                  <span className="text-xs font-mono text-slate-300">
                    {activeScenario.corridor}
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeScenario.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <h3 className="font-editorial text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white leading-snug">
                      {activeScenario.summary}
                    </h3>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                      {activeScenario.id === 'bottleneck' ? (
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2
                          style={{ color: activeScenario.accent }}
                          className="w-4 h-4 shrink-0 mt-0.5"
                        />
                      )}
                      <p className="text-xs sm:text-sm text-slate-200 font-mono leading-relaxed">
                        {activeScenario.actionTaken}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between text-xs font-mono text-slate-300">
                      <span className="flex items-center gap-2 text-[11px] text-sky-400">
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>ERP AUDIT RECONCILIATION:</span>
                      </span>
                      <span className="text-slate-400 text-[10px] truncate max-w-sm">
                        {activeScenario.erpReconciliation}
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* 4 Live KPI Cards + CTA Button */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl liquid-glass-card bg-white/5 border border-white/10">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                    CORRIDOR ETA WINDOW
                  </span>
                  <span className="text-base sm:text-lg font-bold text-white mt-1 block tabular-nums">
                    {activeScenario.etaDelta}
                  </span>
                </div>

                <div className="p-4 rounded-2xl liquid-glass-card bg-white/5 border border-white/10">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                    SLA INTEGRITY
                  </span>
                  <span
                    style={{ color: activeScenario.accent }}
                    className="text-base sm:text-lg font-bold mt-1 block tabular-nums"
                  >
                    {activeScenario.slaProtection}
                  </span>
                </div>

                <div className="p-4 rounded-2xl liquid-glass-card bg-white/5 border border-white/10">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                    FINANCIAL IMPACT
                  </span>
                  <span className="text-base sm:text-lg font-bold text-white mt-1 block tabular-nums">
                    {activeScenario.financialImpact}
                  </span>
                </div>

                <div className="p-4 rounded-2xl liquid-glass-card bg-white/5 border border-white/10">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                    INVENTORY BUFFER
                  </span>
                  <span
                    className={`text-base sm:text-lg font-bold mt-1 block tabular-nums ${
                      activeScenario.id === 'bottleneck'
                        ? 'text-rose-400'
                        : activeScenario.id === 'bypass'
                        ? 'text-emerald-400'
                        : 'text-sky-400'
                    }`}
                  >
                    {activeScenario.inventoryBuffer}
                  </span>
                </div>

                {/* Direct Launch / Sign in CTA button */}
                <button
                  type="button"
                  onClick={() => launchOrion(destinationUrl)}
                  className="col-span-2 p-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white transition-all duration-200 flex items-center justify-between text-left cursor-pointer group shadow-lg"
                >
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-sky-200 block">
                      OPERATIONAL ENVIRONMENT
                    </span>
                    <span className="text-sm font-bold text-white block mt-0.5">
                      {user ? 'Launch Orion-9 OS Cockpit' : 'Sign in to Orion-9 OS'}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-blue-600 transition-colors">
                    <ArrowUpRight className="w-4 h-4 text-white group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

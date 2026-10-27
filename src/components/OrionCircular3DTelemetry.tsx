/**
 * ORION-9 TELEMETRY & MULTIMODAL CORRIDOR EXPERIENCE
 * Circular 3D Carousel with Guaranteed Centered Active State
 * 
 * Requirements:
 * 1. Active State Centered: The currently active card (State 01, 02, or 03)
 *    is ALWAYS positioned at the exact horizontal and vertical center of the stage.
 * 2. Automatic State Transitions: Automatically advances every 10 seconds
 *    (State 01 -> State 02 -> State 03 -> State 01) continuously with tab visibility protection.
 * 3. Minimal Scenario Selector: Clean pill navigation for State 01, 02, and 03
 *    with responsive touch/drag swipe support.
 * 4. Preserved Dark Enterprise Aesthetics: Deep navy/black background (#030712),
 *    crisp supply-chain cards, SVG telemetry flows, high contrast typography.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowUpRight,
  Radio,
  Layers,
  Cpu,
  Factory,
  Package,
  Ship,
  Plane,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export interface TelemetryScenarioCard {
  id: string;
  code: string;
  scenarioNumber: string;
  title: string;
  statusText: string;
  corridor: string;
  keyMetric: string;
  slaMetric: string;
  accent: string;
  accentGlow: string;
  badgeBg: string;
  badgeBorder: string;
  stateType: 'nominal' | 'disruption' | 'recovery';
}

const SCENARIO_CARDS: TelemetryScenarioCard[] = [
  {
    id: 'global-flow',
    code: 'STATE 01',
    scenarioNumber: '01',
    title: 'Global Supply Chain Flow',
    statusText: 'ALL CORRIDORS NOMINAL',
    corridor: 'Shanghai (SHA) → Rotterdam (RTM) → Frankfurt (FRA)',
    keyMetric: '124h Safety Buffer',
    slaMetric: '99.8% Nominal OTIF',
    accent: '#38BDF8',
    accentGlow: 'rgba(56, 189, 248, 0.25)',
    badgeBg: 'rgba(56, 189, 248, 0.1)',
    badgeBorder: 'rgba(56, 189, 248, 0.3)',
    stateType: 'nominal',
  },
  {
    id: 'disruption',
    code: 'STATE 02',
    scenarioNumber: '02',
    title: 'Disruption Detected',
    statusText: 'CORRIDOR BOTTLENECK',
    corridor: 'Red Sea / Bab-el-Mandeb Chokepoint Queue',
    keyMetric: '+72h Delay Projected',
    slaMetric: '$1.42M Assembly Risk',
    accent: '#F43F5E',
    accentGlow: 'rgba(244, 63, 94, 0.25)',
    badgeBg: 'rgba(244, 63, 94, 0.12)',
    badgeBorder: 'rgba(244, 63, 94, 0.35)',
    stateType: 'disruption',
  },
  {
    id: 'recovery',
    code: 'STATE 03',
    scenarioNumber: '03',
    title: 'Autonomous Recovery',
    statusText: 'AIR-BYPASS EXECUTED',
    corridor: 'Jebel Ali Port → Dubai DXB Air Bridge → FRA',
    keyMetric: '+68.8h Lead Time Saved',
    slaMetric: '99.4% Protected SLA',
    accent: '#10B981',
    accentGlow: 'rgba(16, 185, 129, 0.25)',
    badgeBg: 'rgba(16, 185, 129, 0.12)',
    badgeBorder: 'rgba(16, 185, 129, 0.35)',
    stateType: 'recovery',
  },
];

export const OrionCircular3DTelemetry: React.FC = () => {
  let user: unknown = null;
  let launchOrion: (url?: string) => void = () => {};
  let destinationUrl = '#';

  try {
    const auth = useAuth();
    user = auth.user;
    launchOrion = auth.launchOrion;
    destinationUrl = auth.destinationUrl;
  } catch {
    // Safe fallback when rendered in isolated test environments
  }

  const prefersReducedMotion = useReducedMotion();

  // Active state index: 0 = State 01, 1 = State 02, 2 = State 03
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const activeIndexRef = useRef<number>(0);
  activeIndexRef.current = activeIndex;

  // Responsive dimensions
  const [windowWidth, setWindowWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  const cardWidth = isMobile ? 260 : isTablet ? 290 : 316;
  const cardHeight = isMobile ? 350 : isTablet ? 385 : 405;
  const spreadDistance = isMobile ? 185 : isTablet ? 330 : 420;

  // Navigation handlers
  const next = useCallback(() => {
    setActiveIndex((curr) => (curr + 1) % SCENARIO_CARDS.length);
  }, []);

  const previous = useCallback(() => {
    setActiveIndex((curr) => (curr - 1 + SCENARIO_CARDS.length) % SCENARIO_CARDS.length);
  }, []);

  const selectScenario = useCallback((targetIndex: number) => {
    setActiveIndex(targetIndex);
  }, []);

  // =========================================================================
  // 10-SECOND AUTOMATIC STATE TRANSITION LOOP
  // Sequence: State 01 -> State 02 -> State 03 -> State 01 (Repeats continuously)
  // Cleaned up on unmount, protected against inactive tab queue pileup.
  // =========================================================================
  useEffect(() => {
    if (prefersReducedMotion) return;

    let timerId: ReturnType<typeof setTimeout> | null = null;

    const startTimer = () => {
      timerId = setTimeout(() => {
        if (!document.hidden) {
          next();
        }
      }, 10000);
    };

    startTimer();

    const handleVisibilityChange = () => {
      if (timerId) clearTimeout(timerId);
      if (!document.hidden) {
        startTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timerId) clearTimeout(timerId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [next, activeIndex, prefersReducedMotion]);

  // Pointer drag/swipe interaction
  const interactionRef = useRef({
    active: false,
    startX: 0,
    moved: false,
    cardIndex: null as number | null,
  });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const cardEl = (e.target as HTMLElement).closest('[data-card-index]');
    const cIndex = cardEl ? Number((cardEl as HTMLElement).dataset.cardIndex) : null;

    interactionRef.current = {
      active: true,
      startX: e.clientX,
      moved: false,
      cardIndex: cIndex,
    };

    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      // Fallback
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const inter = interactionRef.current;
    if (!inter.active) return;
    const deltaX = e.clientX - inter.startX;
    if (Math.abs(deltaX) > 10) {
      inter.moved = true;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const inter = interactionRef.current;
    if (!inter.active) return;

    const deltaX = e.clientX - inter.startX;
    const wasMoved = inter.moved;
    const clickedCard = inter.cardIndex;

    inter.active = false;

    if (wasMoved && Math.abs(deltaX) > 40) {
      if (deltaX < 0) {
        next();
      } else {
        previous();
      }
    } else if (!wasMoved && clickedCard !== null && clickedCard !== activeIndex) {
      selectScenario(clickedCard);
    }

    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {
      // Fallback
    }
  };

  // Renders the supply chain illustration for each card
  const renderSupplyChainIllustration = (card: TelemetryScenarioCard) => {
    const isDisruption = card.stateType === 'disruption';
    const isRecovery = card.stateType === 'recovery';
    const lineColor = isDisruption ? '#F43F5E' : isRecovery ? '#10B981' : '#38BDF8';

    return (
      <div className="w-full h-[155px] relative rounded-2xl bg-black/40 border border-white/10 p-3 flex flex-col justify-between overflow-hidden select-none">
        {/* Subtle Ambient Grid */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        {/* Top Node Row: 1. Raw Origins -> 2. Tier-1 Fab -> 3. Frankfurt DE-02 */}
        <div className="relative z-10 flex items-center justify-between px-1">
          {/* Node 1: Raw Materials */}
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="text-[9px] font-mono text-slate-300 mt-1">Raw Origins</span>
          </div>

          {/* Flow Line 1 */}
          <div className="flex-1 h-0.5 mx-2 bg-gradient-to-r from-sky-400/50 to-sky-400/80 relative">
            <div className="w-1.5 h-1.5 rounded-full bg-sky-300 absolute -top-0.5 left-1/2 -translate-x-1/2 animate-ping" />
          </div>

          {/* Node 2: Tier-1 Fab */}
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300">
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <span className="text-[9px] font-mono text-slate-300 mt-1">Tier-1 Fab</span>
          </div>

          {/* Flow Line 2 */}
          <div
            className={`flex-1 h-0.5 mx-2 relative ${
              isDisruption
                ? 'bg-rose-500/60'
                : isRecovery
                ? 'bg-emerald-400/60'
                : 'bg-sky-400/60'
            }`}
          />

          {/* Node 3: Frankfurt DE-02 */}
          <div className="flex flex-col items-center">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                isDisruption
                  ? 'bg-rose-500/30 border border-rose-400 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                  : isRecovery
                  ? 'bg-emerald-500/30 border border-emerald-400 text-emerald-300'
                  : 'bg-sky-500/20 border border-sky-400/40 text-sky-300'
              }`}
            >
              <Factory className="w-3.5 h-3.5" />
            </div>
            <span className="text-[9px] font-mono text-slate-300 mt-1">Frankfurt Plant</span>
          </div>
        </div>

        {/* Transit Corridor Center Track (Multimodal Route) */}
        <div className="relative z-10 py-1 px-1">
          <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              {isRecovery ? (
                <>
                  <Plane className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span className="text-emerald-300 font-semibold">DXB Air Bypass</span>
                </>
              ) : isDisruption ? (
                <>
                  <AlertTriangle className="w-3 h-3 text-rose-400 animate-pulse" />
                  <span className="text-rose-300 font-semibold">Red Sea Choke</span>
                </>
              ) : (
                <>
                  <Ship className="w-3 h-3 text-sky-300" />
                  <span className="text-sky-300">Maritime Canal</span>
                </>
              )}
            </span>
            <span className="text-[9px] opacity-75">
              {isDisruption ? 'Delayed +72h' : isRecovery ? 'Saved +68.8h' : 'On Schedule'}
            </span>
          </div>

          {/* The Visual Corridor Track Bar */}
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative border border-white/10">
            {isDisruption ? (
              <div className="h-full bg-gradient-to-r from-emerald-500 via-rose-500 to-rose-600 w-3/4 rounded-full relative">
                <span className="absolute right-0 top-0 bottom-0 w-2 bg-white animate-ping" />
              </div>
            ) : isRecovery ? (
              <div className="h-full bg-gradient-to-r from-sky-400 via-teal-400 to-emerald-400 w-full rounded-full" />
            ) : (
              <div className="h-full bg-gradient-to-r from-sky-500 to-blue-500 w-full rounded-full" />
            )}
          </div>
        </div>

        {/* Bottom Node Row: 4. ASRS Warehouse -> 5. Multimodal -> 6. End Customer */}
        <div className="relative z-10 flex items-center justify-between px-1">
          {/* Node 4: ASRS Hub */}
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300">
              <Package className="w-3.5 h-3.5" />
            </div>
            <span className="text-[9px] font-mono text-slate-300 mt-1">ASRS Hub 04</span>
          </div>

          {/* Flow Line 3 */}
          <div className="flex-1 h-0.5 mx-2 bg-slate-700 relative">
            <div
              style={{ backgroundColor: lineColor }}
              className="h-full w-full"
            />
          </div>

          {/* Node 5: Multimodal Gateway */}
          <div className="flex flex-col items-center">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                isDisruption
                  ? 'bg-rose-500/25 border border-rose-500/60 text-rose-400'
                  : isRecovery
                  ? 'bg-emerald-500/25 border border-emerald-500/60 text-emerald-400'
                  : 'bg-sky-500/20 border border-sky-400/40 text-sky-300'
              }`}
            >
              {isRecovery ? <Plane className="w-3.5 h-3.5" /> : <Ship className="w-3.5 h-3.5" />}
            </div>
            <span className="text-[9px] font-mono text-slate-300 mt-1">
              {isRecovery ? 'Air Gateway' : 'Sea Port'}
            </span>
          </div>

          {/* Flow Line 4 */}
          <div className="flex-1 h-0.5 mx-2 bg-slate-700 relative">
            <div
              style={{ backgroundColor: lineColor }}
              className="h-full w-full"
            />
          </div>

          {/* Node 6: OEM Customer Delivery */}
          <div className="flex flex-col items-center">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                isDisruption
                  ? 'bg-slate-800 border border-slate-700 text-slate-400'
                  : 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <span className="text-[9px] font-mono text-slate-300 mt-1">OEM Customer</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      id="control-tower"
      aria-label="Orion-9 Supply Chain Telemetry Experience"
      className="relative w-full overflow-hidden bg-[#030712] text-white pt-20 sm:pt-28 pb-16 sm:pb-20 scroll-mt-28 border-t border-white/10"
    >
      {/* Background Soft Cyber Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 30%, rgba(56,189,248,0.14) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(16,185,129,0.08) 0%, transparent 50%)',
        }}
      />

      <div className="relative max-w-[1380px] mx-auto px-4 sm:px-8 z-10 flex flex-col items-center">
        {/* Top Section Header */}
        <div className="flex flex-col items-center text-center max-w-2xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 text-[11px] font-mono uppercase tracking-wider text-sky-400 font-semibold mb-2.5">
            <Radio className="w-3 h-3 text-sky-400 animate-pulse" />
            <span>ORION-9 OS TELEMETRY</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            From corridor anomaly to verified execution.
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md">
            Inspect real-time multimodal intelligence across global corridors.
          </p>
        </div>

        {/* =====================================================================
            MINIMAL SCENARIO SWITCHER STRIP (WITHOUT PLAY/PAUSE CONTROLS)
           ===================================================================== */}
        <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl liquid-glass-clear mb-6 shadow-lg max-w-[calc(100vw-2rem)] overflow-x-auto scrollbar-none">
          {SCENARIO_CARDS.map((card, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={card.id}
                type="button"
                data-scenario-index={idx}
                onClick={() => selectScenario(idx)}
                className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-md scale-[1.02] dark:bg-white dark:text-slate-900'
                    : 'text-[var(--orion-text-secondary)] hover:text-[var(--orion-text-primary)] hover:bg-white/20 dark:hover:bg-white/10'
                }`}
              >
                <span
                  style={{
                    backgroundColor: isActive ? card.accent : '#64748B',
                  }}
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                />
                <span className="whitespace-nowrap">
                  {card.code}: {card.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* =====================================================================
            CIRCULAR 3D STAGE (Active card is GUARANTEED to be in the exact center)
           ===================================================================== */}
        <div
          className="relative w-full flex items-center justify-center overflow-visible cursor-grab active:cursor-grabbing"
          style={{
            height: isMobile ? '390px' : '470px',
            perspective: isMobile ? '800px' : '1100px',
            perspectiveOrigin: '50% 50%',
            touchAction: 'pan-y',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onDragStart={(e) => e.preventDefault()}
        >
          {SCENARIO_CARDS.map((card, index) => {
            // Determine relative cyclic offset from the active card:
            // diff = 0  -> Active card (EXACT CENTER)
            // diff = +1 -> Right supporting card
            // diff = -1 -> Left supporting card
            const count = SCENARIO_CARDS.length;
            let diff = (index - activeIndex) % count;
            if (diff > 1) diff -= count;
            if (diff < -1) diff += count;

            const isCenter = diff === 0;

            // Mathematical positioning relative to the container's center:
            // Active center card is ALWAYS at x = 0, z = 120, rotateY = 0, scale = 1.0
            const x = diff * spreadDistance;
            const z = isCenter ? (isMobile ? 50 : 120) : (isMobile ? -30 : -45);
            const rotateY = isCenter ? 0 : diff * (isMobile ? -24 : -34);
            const scale = isCenter ? 1.0 : isMobile ? 0.74 : 0.82;
            const opacity = isCenter ? 1.0 : isMobile ? 0.45 : 0.65;
            const zIndex = isCenter ? 30 : 10;

            return (
              <motion.div
                key={card.id}
                data-card-index={index}
                className="absolute left-1/2 top-1/2"
                style={{
                  width: cardWidth,
                  height: cardHeight,
                  marginLeft: -cardWidth / 2,
                  marginTop: -cardHeight / 2,
                  zIndex,
                  transformStyle: 'preserve-3d',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                }}
                animate={{
                  x,
                  y: 0,
                  z,
                  rotateY,
                  scale,
                  opacity,
                  filter: isCenter ? 'blur(0px)' : 'blur(0.5px)',
                }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.75,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {/* 3D Card Canvas with Liquid Glass Material Engine */}
                <div
                  className={`relative w-full h-full rounded-[24px] overflow-hidden p-5 flex flex-col justify-between border transition-all ${
                    isCenter
                      ? 'liquid-glass-elevated liquid-glass-interactive shadow-[0_25px_60px_rgba(0,0,0,0.95)] ring-1 ring-white/10'
                      : 'liquid-glass-card shadow-[0_12px_36px_rgba(0,0,0,0.7)]'
                  }`}
                  style={{
                    backgroundColor: '#070E1A',
                  }}
                >
                  {/* Subtle Card Accent Gradient on Border/Top */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                      background: `radial-gradient(circle at 50% 0%, ${card.accent}, transparent 60%)`,
                    }}
                  />

                  {/* Top Bar: Scenario Code & Status Badge */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span
                      style={{
                        backgroundColor: card.badgeBg,
                        borderColor: card.badgeBorder,
                        color: card.accent,
                      }}
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider border"
                    >
                      {card.statusText}
                    </span>

                    <span className="text-[11px] font-mono font-bold text-slate-500">
                      {card.code}
                    </span>
                  </div>

                  {/* Connected Visual Supply Chain Diagram */}
                  <div className="relative z-10 my-2">
                    {renderSupplyChainIllustration(card)}
                  </div>

                  {/* Card Bottom: Primary Heading and Key Metrics */}
                  <div className="relative z-10">
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                      {card.title}
                    </h3>

                    {/* Concise 2-Metric Strip */}
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10 text-left">
                      <div>
                        <span className="text-[9px] font-mono uppercase text-slate-400 block tracking-wider">
                          CORRIDOR STATUS
                        </span>
                        <span
                          style={{ color: card.accent }}
                          className="text-xs font-bold block mt-0.5 truncate"
                        >
                          {card.keyMetric}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono uppercase text-slate-400 block tracking-wider">
                          SLA IMPACT
                        </span>
                        <span className="text-xs font-bold text-white block mt-0.5 truncate">
                          {card.slaMetric}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA: Launch Orion-9 OS */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={() => launchOrion(destinationUrl)}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
          >
            <span>{user ? 'Launch Orion-9 OS Cockpit' : 'Sign in to Orion-9 OS'}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-sky-200" />
          </button>
        </div>
      </div>
    </section>
  );
};

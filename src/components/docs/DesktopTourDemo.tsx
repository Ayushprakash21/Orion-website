import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Layout,
  Activity,
  Monitor,
  ExternalLink,
} from 'lucide-react';

interface TourStep {
  id: string;
  number: string;
  title: string;
  shortDesc: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
  hotspot: { x: string; y: string };
  simulatedVisual: {
    label: string;
    badge: string;
    elements: string[];
    telemetry: string;
  };
  articlePath: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'desktop-workspace',
    number: '01',
    title: 'Desktop Workspace & Grid',
    shortDesc: 'Multi-window desktop with live wallpaper & icon snapping.',
    detail:
      'The foundational workspace provides drag-and-drop icon placement, right-click contextual actions, WebGL kinetic particle flows, and window elevation layering.',
    icon: Monitor,
    hotspot: { x: '25%', y: '40%' },
    simulatedVisual: {
      label: 'ORION-9 WORKSPACE',
      badge: 'DESKTOP SHELL',
      elements: [
        'Desktop Icons: Command Center, Inventory, Shipments',
        'Kinetic PBR Studio Ground & Canvas Backdrop',
        'Right-Click Context Menu: New Window, Clean Icons',
      ],
      telemetry: 'Display: 4K Ultra-HD · Scale: 100% · WebGL Active',
    },
    articlePath: '/docs/os/desktop',
  },
  {
    id: 'system-bar',
    number: '02',
    title: 'Top System Bar & Clock',
    shortDesc: 'Ambient OS status, network health, and active app title.',
    detail:
      'The top system bar maintains persistent system telemetry: active tenant ID, latency to Cloud Firestore (<24ms), notification center trigger, and global UTC clock.',
    icon: Layout,
    hotspot: { x: '80%', y: '12%' },
    simulatedVisual: {
      label: 'SYSTEM BAR TELEMETRY',
      badge: 'TOP BAR',
      elements: [
        'Active Application: Supply Chain Command Center',
        'Network Status: Firestore Connected (21ms)',
        'Tenant: Enterprise Alpha · Clock: 04:20:00 UTC',
      ],
      telemetry: 'Latency: 21ms · Buffer: 0 uncommitted · Fail-closed: OK',
    },
    articlePath: '/docs/os/taskbar-and-notifications',
  },
  {
    id: 'dynamic-island',
    number: '03',
    title: 'Dynamic Island Capsule',
    shortDesc: 'Contextual notification & active activity telemetry pill.',
    detail:
      'The macOS-inspired Dynamic Island capsule morphs to surface active disruptions, EDI batch sync progress, and incoming order notifications with progressive disclosure.',
    icon: Activity,
    hotspot: { x: '50%', y: '12%' },
    simulatedVisual: {
      label: 'DYNAMIC ISLAND CAPSULE',
      badge: 'LIVE ACTIVITY',
      elements: [
        'Nominal State: ● Corridor Nominal · 42.8k sig/s',
        'Disruption Alert: 2 Critical Customs Holds (Expanded)',
        'Background Sync: EDI 856 Ingestion Active (92%)',
      ],
      telemetry: 'Capsule Width: 320px · State: EXPANDED_ALERT',
    },
    articlePath: '/docs/os/dynamic-island',
  },
  {
    id: 'window-management',
    number: '04',
    title: 'Window Layering & Snapping',
    shortDesc: 'Z-index elevation, edge snapping & minimize tray.',
    detail:
      'Enterprise users can snap windows into split-screen views, minimize heavy analytics into the taskbar, and restore saved workspace layouts with zero latency.',
    icon: Layout,
    hotspot: { x: '55%', y: '48%' },
    simulatedVisual: {
      label: 'WINDOW MANAGER (AERO-GRID)',
      badge: 'AERO STACK',
      elements: [
        'Active Focus: EDI 850 Order Stream (Z: 104)',
        'Tiling Mode: 50/50 Dual-Pane Split Layout',
        'Aero-Snap Threshold: 16px Edge Magnetic Snapping',
      ],
      telemetry: 'Active Windows: 4 · Memory: 242MB · GPU: 60fps',
    },
    articlePath: '/docs/os/window-management',
  },
  {
    id: 'dock-launcher',
    number: '05',
    title: 'App Launcher & Dock',
    shortDesc: 'Instant spotlight search and curated desktop dock.',
    detail:
      'Quick-launch any of the 118 native applications or execute natural-language queries through the unified Command Palette (Ctrl+Space).',
    icon: Layout,
    hotspot: { x: '50%', y: '88%' },
    simulatedVisual: {
      label: 'APPLICATION DOCK & LAUNCHER',
      badge: 'APP DOCK',
      elements: [
        'Pinned: Control Tower, ASRS, Freight Route Planner',
        'Recent: Predictive ETA Lab, Inventory Optimizer',
        'Spotlight: Press Ctrl+Space for Instant Command Palette',
      ],
      telemetry: 'Registered Apps: 118 · Search Latency: <2ms',
    },
    articlePath: '/docs/os/windows-and-app-launcher',
  },
  {
    id: 'control-tower',
    number: '06',
    title: 'Supply Chain Command Center',
    shortDesc: 'Real-time multi-modal logistics & corridor tracking.',
    detail:
      'Visualise maritime vessels, cargo aircraft, and intermodal freight trains across global geodesic corridors with deterministic delay calculation engines.',
    icon: Monitor,
    hotspot: { x: '35%', y: '50%' },
    simulatedVisual: {
      label: 'CONTROL TOWER ACTIVE HUD',
      badge: 'CORE SCM',
      elements: [
        'Tracking: 2,841 Active Multi-Modal Freight Units',
        'Customs Clearance Posture: 98.4% Nominal',
        'Autonomous Reroute: Pacific Express Flight #902 Active',
      ],
      telemetry: 'Active Geodesic Corridors: 142 · SLA Score: 99.2%',
    },
    articlePath: '/docs/applications/control-tower',
  },
  {
    id: 'theme-studio',
    number: '07',
    title: 'Personalization & Themes',
    shortDesc: 'Light, dark, high-contrast & custom accent palette.',
    detail:
      'Switch between macOS Liquid Glass, Obsidian Dark, and Crisp Enterprise Light modes with real-time CSS variable interpolation across all windows.',
    icon: Layout,
    hotspot: { x: '75%', y: '75%' },
    simulatedVisual: {
      label: 'THEME & ENVIRONMENT ENGINE',
      badge: 'THEME TOKENS',
      elements: [
        'Active Theme: macOS Liquid Glass (Default)',
        'Accent Color: Cerulean Sky Blue (#0284C7)',
        'Display Modes: Light / Dark / High-Contrast Accessible',
      ],
      telemetry: 'CSS Variables: 34 Active Tokens · GPU Accelerated',
    },
    articlePath: '/docs/os/themes-and-personalization',
  },
  {
    id: 'hardware-settings',
    number: '08',
    title: 'Hardware & Tenant Security',
    shortDesc: 'Role-based access, device certificates & GPU tier.',
    detail:
      'Hardware acceleration status, WebGL renderer capabilities, biometric authentication, and strict multi-tenant isolation enforced by Cloud Firestore security rules.',
    icon: Monitor,
    hotspot: { x: '20%', y: '20%' },
    simulatedVisual: {
      label: 'ENTERPRISE SECURITY & TELEMETRY',
      badge: 'ZERO TRUST',
      elements: [
        'Authorization: Verified Administrator (Bootstrap Owner)',
        'Security Rules: Fail-Closed Granular Firestore RBAC',
        'Audit Logging: Immutable Activity Log Ingestion Active',
      ],
      telemetry: 'Auth State: VERIFIED · Hardware Crypto: ACTIVE',
    },
    articlePath: '/docs/os/system-settings-and-hardware',
  },
];

export const DesktopTourDemo: React.FC<{ onNavigate?: (path: string) => void }> = ({
  onNavigate,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const prefersReduced = useReducedMotion();

  const nextStep = useCallback(() => {
    setCurrentStepIndex((prev) => (prev + 1) % TOUR_STEPS.length);
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStepIndex((prev) => (prev - 1 + TOUR_STEPS.length) % TOUR_STEPS.length);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      if (!document.hidden) {
        nextStep();
      }
    }, 6000);
    return () => clearInterval(timer);
  }, [isPlaying, nextStep]);

  const activeStep = TOUR_STEPS[currentStepIndex];
  const StepIcon = activeStep.icon;

  return (
    <div className="w-full my-8 rounded-3xl liquid-glass-elevated border border-[var(--glass-border)] shadow-xl overflow-hidden">
      {/* Tour Header Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-[var(--glass-border-subtle)] bg-white/40 dark:bg-black/20">
        <div className="flex items-center gap-3">
          {/* macOS Window Traffic Lights */}
          <div className="flex items-center gap-1.5 mr-1 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--orion-text-primary)] font-sans">
              Interactive Desktop Tour
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#0284C7]/10 text-[#0284C7] border border-[#0284C7]/20 uppercase">
              Simulation
            </span>
          </div>
          <span className="text-xs text-[var(--orion-text-muted)] font-mono">· Step {activeStep.number} of 08</span>
        </div>

        {/* Playback & Step Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? 'Pause Tour' : 'Play Tour'}
            className="px-3 py-1.5 rounded-xl border border-[var(--glass-border-subtle)] bg-white/70 dark:bg-white/5 hover:bg-white text-[var(--orion-text-primary)] transition cursor-pointer text-xs flex items-center gap-1.5 shadow-2xs font-sans font-semibold"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-500" /> : <Play className="w-3.5 h-3.5 text-emerald-500" />}
            <span className="hidden sm:inline text-xs">{isPlaying ? 'Pause' : 'Auto'}</span>
          </button>

          <button
            type="button"
            onClick={prevStep}
            aria-label="Previous Step"
            className="p-1.5 rounded-xl border border-[var(--glass-border-subtle)] bg-white/70 dark:bg-white/5 hover:bg-white text-[var(--orion-text-primary)] transition cursor-pointer shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={nextStep}
            aria-label="Next Step"
            className="p-1.5 rounded-xl border border-[var(--glass-border-subtle)] bg-white/70 dark:bg-white/5 hover:bg-white text-[var(--orion-text-primary)] transition cursor-pointer shadow-2xs"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setCurrentStepIndex(0)}
            aria-label="Reset Tour"
            className="p-1.5 rounded-xl border border-[var(--glass-border-subtle)] bg-white/70 dark:bg-white/5 hover:bg-white text-[var(--orion-text-muted)] hover:text-[var(--orion-text-primary)] transition cursor-pointer shadow-2xs"
            title="Restart Tour"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Simulated Interactive OS Desktop Stage */}
      <div className="relative w-full h-[360px] sm:h-[420px] bg-[#070B19] overflow-hidden select-none border-b border-[var(--glass-border-subtle)]">
        {/* Subtle Background Grid & Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070B19] via-transparent to-[#070B19]/50 pointer-events-none" />

        {/* Top Simulated System Bar */}
        <div className="absolute top-0 left-0 right-0 h-7 bg-[#0A101D]/90 border-b border-white/10 px-3.5 flex items-center justify-between text-[11px] font-mono text-slate-300 z-10 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-white tracking-wide">ORION-9</span>
            <span className="opacity-70">File</span>
            <span className="opacity-70">View</span>
            <span className="opacity-70">Window</span>
            <span className="text-[#38BDF8]">Help</span>
          </div>

          {/* Simulated Dynamic Island Pill */}
          <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full liquid-glass-clear text-[10px] text-cyan-300 shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Nominal · 42.8k sig/s</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-emerald-400">Online (21ms)</span>
            <span className="opacity-70">04:20 UTC</span>
          </div>
        </div>

        {/* Simulated Floating Window Presentation */}
        <div className="absolute inset-0 pt-12 pb-14 px-6 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep.id}
              initial={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10 }}
              animate={prefersReduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-xl rounded-2xl liquid-glass-elevated liquid-glass-interactive shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden"
            >
              {/* Window Titlebar */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--glass-border-subtle)] bg-white/20 dark:bg-black/40">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-xs text-slate-200 font-semibold">
                    {activeStep.simulatedVisual.label}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0284C7]/20 text-[#38BDF8] border border-[#0284C7]/30">
                  {activeStep.simulatedVisual.badge}
                </span>
              </div>

              {/* Window Interior Content */}
              <div className="p-5 space-y-3 font-mono text-xs text-slate-200">
                <div className="space-y-2">
                  {activeStep.simulatedVisual.elements.map((el, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-slate-300">
                      <span className="text-[#38BDF8]">›</span>
                      <span>{el}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{activeStep.simulatedVisual.telemetry}</span>
                  <span className="text-emerald-400 font-bold">ACTIVE</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Animated Hotspot Indicator */}
        <div
          style={{ left: activeStep.hotspot.x, top: activeStep.hotspot.y }}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-500"
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute w-8 h-8 rounded-full bg-[#38BDF8]/25 animate-ping" />
            <span className="w-4 h-4 rounded-full bg-[#0284C7] shadow-[0_0_14px_rgba(2,132,199,0.9)] border-2 border-white" />
          </div>
        </div>

        {/* Bottom Simulated Dock with Role A Clear Glass */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-2xl liquid-glass-clear flex items-center gap-2.5 z-10 shadow-lg">
          {TOUR_STEPS.map((st, i) => {
            const isCur = i === currentStepIndex;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setCurrentStepIndex(i)}
                aria-label={`Jump to ${st.title}`}
                className={`w-7 h-7 rounded-xl flex items-center justify-center transition cursor-pointer text-xs font-mono ${
                  isCur
                    ? 'bg-[#0284C7] text-white font-bold shadow-md scale-110'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {st.number}
              </button>
            );
          })}
        </div>
      </div>

      {/* Narrative Footer & Link to Full Documentation Article */}
      <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-white/40 dark:bg-black/20">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#0284C7]/10 border border-[#0284C7]/20 text-[#0284C7] shrink-0 mt-0.5">
            <StepIcon className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[var(--orion-text-primary)] flex items-center gap-2 font-sans">
              <span>{activeStep.title}</span>
              <span className="text-[10px] font-mono text-[var(--orion-accent)] uppercase tracking-wider font-semibold">
                [{activeStep.shortDesc}]
              </span>
            </h4>
            <p className="text-xs sm:text-sm text-[var(--orion-text-secondary)] leading-relaxed max-w-2xl font-sans">
              {activeStep.detail}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate && onNavigate(activeStep.articlePath)}
          className="self-start sm:self-center px-4 py-2 rounded-xl border border-[var(--glass-border-subtle)] bg-white/70 dark:bg-white/5 hover:bg-white text-[var(--orion-text-primary)] hover:border-[var(--orion-accent)] font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs font-sans"
        >
          <span>Read Full Article</span>
          <ExternalLink className="w-3.5 h-3.5 text-[var(--orion-accent)]" />
        </button>
      </div>
    </div>
  );
};

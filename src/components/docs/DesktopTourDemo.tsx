import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Layout,
  Layers,
  Activity,
  Bot,
  Settings,
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
    id: 'app-launcher',
    number: '04',
    title: 'Application Launcher (118 Apps)',
    shortDesc: 'Universal command palette & categorized module catalog.',
    detail:
      'Pressing Alt + Space or clicking the Dock launcher opens the universal catalog indexing all 118 applications across Operations, Control, Intelligence, Platform, and AI.',
    icon: Layers,
    hotspot: { x: '15%', y: '85%' },
    simulatedVisual: {
      label: 'APPLICATION REGISTRY',
      badge: 'COMMAND PALETTE',
      elements: [
        'Operations: Command Center, Inventory, Procurement',
        'Control: Exceptions, Approval Center, Policy Engine',
        'Platform: Integration Fabric, Data Quality, Sync Monitor',
      ],
      telemetry: 'Registry: 118 Installed · Search Index: Instant',
    },
    articlePath: '/docs/os/windows-and-navigation',
  },
  {
    id: 'window-manager',
    number: '05',
    title: 'Window Management & Tiling',
    shortDesc: 'Freeform floating, half-screen snapping, and stacking.',
    detail:
      'The window geometry engine supports freeform dragging, boundary clamping, half-screen edge snapping, minimize-to-dock, and strict z-index focus elevation.',
    icon: Layout,
    hotspot: { x: '50%', y: '50%' },
    simulatedVisual: {
      label: 'WINDOW GEOMETRY ENGINE',
      badge: 'Z-INDEX 105',
      elements: [
        'Titlebar: Minimize (-), Maximize (+), Close (x)',
        'Boundary Guard: Clamps within viewport coordinates',
        'Snapping: Drag to left/right for split-screen 50%',
      ],
      telemetry: 'Active Windows: 3 · Active Focus: Inventory Management',
    },
    articlePath: '/docs/os/window-management',
  },
  {
    id: 'control-tower',
    number: '06',
    title: 'Supply Chain Control Tower',
    shortDesc: 'Global multimodal logistics and exception cockpit.',
    detail:
      'The centerpiece cockpit tracks global freight corridors, warehouse ASRS buffers, port congestion choke points, and SLA delivery milestones in real time.',
    icon: Sparkles,
    hotspot: { x: '55%', y: '45%' },
    simulatedVisual: {
      label: 'COMMAND CENTER COCKPIT',
      badge: 'REALTIME GIS',
      elements: [
        'Global Map: Road, Rail, Maritime & Air Corridors',
        'SLA Posture: 99.8% Protected · 142 Connected Hubs',
        'Disruption Engine: Automated Bypass Corridors',
      ],
      telemetry: 'OTIF: 98.6% · Total Freight in Transit: $48.2M',
    },
    articlePath: '/docs/applications/control-tower',
  },
  {
    id: 'copilot',
    number: '07',
    title: 'Governed Orion AI Copilot',
    shortDesc: 'Conversational assistant with Kernel Command Bus tools.',
    detail:
      'Connects natural language queries to authoritative supply-chain engines. Tools operate under strict role permissions with human approval gates on critical transactions.',
    icon: Bot,
    hotspot: { x: '75%', y: '60%' },
    simulatedVisual: {
      label: 'AI COPILOT RUNTIME',
      badge: 'GOVERNED AGENT',
      elements: [
        'Prompt: "Analyze Rotterdam congestion and reroute PO-8492"',
        'Tool Call: query_corridor_telemetry() -> Authorized',
        'Action: Draft Bypass via Antwerp (Requires Human Approval)',
      ],
      telemetry: 'Role: AI_AGENT · Fail-Closed Check: Passed · Zero Hallucination',
    },
    articlePath: '/docs/applications/copilot',
  },
  {
    id: 'settings',
    number: '08',
    title: 'Personalization & Settings',
    shortDesc: 'Calibrated themes, independent text size, and diagnostics.',
    detail:
      'Provides four enterprise color themes, accessibility font sizing, display scale controls, offline storage management, and hardware diagnostic reporting.',
    icon: Settings,
    hotspot: { x: '35%', y: '70%' },
    simulatedVisual: {
      label: 'SYSTEM PREFERENCES',
      badge: 'ACCESSIBILITY',
      elements: [
        'Theme: Deep Midnight (#030712) / Slate / Pure OLED',
        'Scale: 100% · Independent Font Scaling: 14px Base',
        'Offline Cache: IndexedDB (2.4MB / 50MB Quota)',
      ],
      telemetry: 'WCAG AA Compliant · Reduced Motion: Respected',
    },
    articlePath: '/docs/os/personalization',
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
    const interval = setInterval(() => {
      if (!document.hidden) {
        nextStep();
      }
    }, 7000);
    return () => clearInterval(interval);
  }, [isPlaying, nextStep]);

  const activeStep = TOUR_STEPS[currentStepIndex];
  const StepIcon = activeStep.icon;

  return (
    <div className="w-full my-8 rounded-2xl border border-slate-800 bg-[#070B19]/90 backdrop-blur-xl shadow-2xl overflow-hidden">
      {/* Tour Header Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-mono font-semibold tracking-wider text-cyan-400 uppercase">
            Interactive Desktop Tour
          </span>
          <span className="text-xs text-slate-400">· Step {activeStep.number} of 08</span>
        </div>

        {/* Playback & Step Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? 'Pause Tour' : 'Play Tour'}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer text-xs flex items-center gap-1.5"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            <span className="hidden sm:inline font-mono text-[11px]">{isPlaying ? 'Pause' : 'Auto'}</span>
          </button>

          <button
            type="button"
            onClick={prevStep}
            aria-label="Previous Step"
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={nextStep}
            aria-label="Next Step"
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setCurrentStepIndex(0)}
            aria-label="Reset Tour"
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            title="Restart Tour"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Simulated Interactive OS Desktop Stage */}
      <div className="relative w-full h-[360px] sm:h-[420px] bg-[#030712] overflow-hidden select-none border-b border-slate-800">
        {/* Subtle Background Grid & Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-[#030712]/50 pointer-events-none" />

        {/* Top Simulated System Bar */}
        <div className="absolute top-0 left-0 right-0 h-7 bg-slate-900/90 border-b border-slate-800/70 px-3 flex items-center justify-between text-[11px] font-mono text-slate-400 z-10">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wide">ORION-9</span>
            <span>File</span>
            <span>View</span>
            <span>Window</span>
            <span className="text-cyan-400">Help</span>
          </div>

          {/* Simulated Dynamic Island Pill */}
          <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-950/80 border border-slate-800 text-[10px] text-cyan-300 shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Nominal · 42.8k sig/s</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-emerald-400">Online (21ms)</span>
            <span>04:20 UTC</span>
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
              className="w-full max-w-xl rounded-xl border border-cyan-500/30 bg-slate-900/95 shadow-[0_16px_48px_rgba(0,0,0,0.6)] backdrop-blur-md overflow-hidden"
            >
              {/* Window Titlebar */}
              <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-800 bg-slate-950/70">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-xs text-slate-300 font-semibold">
                    {activeStep.simulatedVisual.label}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {activeStep.simulatedVisual.badge}
                </span>
              </div>

              {/* Window Interior Content */}
              <div className="p-4 sm:p-5 space-y-3 font-mono text-xs">
                <div className="space-y-1.5">
                  {activeStep.simulatedVisual.elements.map((el, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-300">
                      <span className="text-cyan-400">›</span>
                      <span>{el}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
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
            <span className="absolute w-8 h-8 rounded-full bg-cyan-400/20 animate-ping" />
            <span className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)] border-2 border-white" />
          </div>
        </div>

        {/* Bottom Simulated Dock */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-2xl bg-slate-900/90 border border-slate-800/80 flex items-center gap-3 backdrop-blur-md z-10 shadow-lg">
          {TOUR_STEPS.map((st, i) => {
            const isCur = i === currentStepIndex;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setCurrentStepIndex(i)}
                aria-label={`Jump to ${st.title}`}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition cursor-pointer text-xs ${
                  isCur
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md scale-110'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {st.number}
              </button>
            );
          })}
        </div>
      </div>

      {/* Narrative Footer & Link to Full Documentation Article */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/60">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0 mt-0.5">
            <StepIcon className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <span>{activeStep.title}</span>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                [{activeStep.shortDesc}]
              </span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
              {activeStep.detail}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate && onNavigate(activeStep.articlePath)}
          className="self-start sm:self-center px-3.5 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-mono text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <span>Read Full Article</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

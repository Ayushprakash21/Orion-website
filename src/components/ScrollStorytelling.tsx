import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Globe,
  Truck,
  Ship,
  Plane,
  Cpu,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Layers,
} from 'lucide-react';

interface StoryScene {
  id: string;
  stepNumber: string;
  title: string;
  tagline: string;
  narrative: string;
  visualHighlights: string[];
  telemetryStream: { label: string; value: string; statusColor: string }[];
  accent: string;
  badge: string;
}

const storyScenes: StoryScene[] = [
  {
    id: 'scene-global',
    stepNumber: '01',
    title: 'The Connected Global Network',
    tagline: 'See every signal across the physical supply chain.',
    badge: 'STAGE 1: GLOBAL TOPOLOGY',
    narrative:
      'Fragmented systems converge into a living digital model. Commercial maritime corridors, intercontinental air freight, and ground trucking grids illuminate as continuous data streams into the Orion-9 unified canonical ontology.',
    visualHighlights: [
      'Simultaneous multimodal route illumination (Ocean, Air, Road)',
      'Live container vessel telemetry and high-altitude flight tracking',
      'Central hexagonal intelligence hub actively correlating transit signals',
    ],
    telemetryStream: [
      { label: 'Ingested Telemetry Events', value: '42,800 / sec', statusColor: '#f5f5f5' },
      { label: 'Active Enterprise Nodes', value: '8 Superports & Hubs', statusColor: '#f5f5f5' },
      { label: 'Cross-Echelon Reconciliation', value: '100% Synced', statusColor: '#f5f5f5' },
    ],
    accent: '#f5f5f5',
  },
  {
    id: 'scene-road',
    stepNumber: '02',
    title: 'Precision Road Logistics & Warehousing',
    tagline: 'Last-mile and continental freight with automated visibility.',
    badge: 'STAGE 2: GROUND FREIGHT',
    narrative:
      'Focusing down into distribution corridors. Commercial trucks move along illuminated highways equipped with headlight beams and geofence telemetry, synchronizing with automated warehouse receiving docks and intermodal rail ramps.',
    visualHighlights: [
      'Articulated semi-trailers navigating dynamic waypoint corridors',
      'Continuous speed, ETA, and temperature-controlled telemetry tracking',
      'Automated cross-dock inventory allocation upon gateway approach',
    ],
    telemetryStream: [
      { label: 'Highway Corridors Active', value: 'Rhine-Alpine & US-I80', statusColor: '#f5f5f5' },
      { label: 'Fleet Speed / Compliance', value: '88 km/h Average', statusColor: '#f4f6fa' },
      { label: 'Dock Turnaround Interval', value: '42 mins (Optimal)', statusColor: '#f5f5f5' },
    ],
    accent: '#f5f5f5',
  },
  {
    id: 'scene-ocean',
    stepNumber: '03',
    title: 'Maritime Deep-Sea Corridors & Superports',
    tagline: 'Moving bulk industrial capacity across oceans.',
    badge: 'STAGE 3: MARITIME MAJESTY',
    narrative:
      'Tracing ocean container titans from Shanghai to Rotterdam and Los Angeles. Automated gantry cranes stack 24,000 TEU container blocks, while vessel AIS trackers verify sea lanes, fuel efficiency, and port berth availability.',
    visualHighlights: [
      'Ultra-large container vessels traversing Trans-Pacific and Asia-Europe routes',
      'Multicolor container stack modeling with realistic water wake illumination',
      'Berth saturation and port turnaround lead-time calculations',
    ],
    telemetryStream: [
      { label: 'Maritime Capacity In-Transit', value: '45,400 TEU Combined', statusColor: '#f5f5f5' },
      { label: 'Average Ocean Transit', value: '18.4 Days', statusColor: '#f4f6fa' },
      { label: 'Port Berth Congestion Index', value: '1.2h Average Dwell', statusColor: '#f5f5f5' },
    ],
    accent: '#b8b8b8',
  },
  {
    id: 'scene-air',
    stepNumber: '04',
    title: 'High-Altitude Express Air Cargo',
    tagline: 'Rapid expedition for high-value critical components.',
    badge: 'STAGE 4: AIR FREIGHT EXPEDITION',
    narrative:
      'Soaring above cloud cover along parabolic high-altitude arcs. Cargo aircraft carry silicon microchips, aerospace spares, and active cold-chain pharmaceuticals between international hubs, outstripping ground bottlenecks.',
    visualHighlights: [
      'Parabolic 3D flight arcs with realistic banking and aircraft attitude',
      'Sub-minute cold-chain temperature telemetry monitoring',
      'Dynamic sea-to-air transshipment handshakes at Dubai and Frankfurt',
    ],
    telemetryStream: [
      { label: 'High-Speed Transit Velocity', value: '885 km/h Groundspeed', statusColor: '#f5f5f5' },
      { label: 'Cold-Chain Telemetry Status', value: '+4.2°C Stabilized', statusColor: '#f5f5f5' },
      { label: 'Time-Critical Recovery', value: '87% Expedited Savings', statusColor: '#f5f5f5' },
    ],
    accent: '#f5f5f5',
  },
  {
    id: 'scene-intelligence',
    stepNumber: '05',
    title: 'Autonomous Supply Chain Intelligence',
    tagline: 'Orchestrating every decision with AI and human governance.',
    badge: 'STAGE 5: SYSTEMIC INTELLIGENCE',
    narrative:
      'The entire physical and digital network culminates in Orion-9’s Intelligent Control Tower. When disruptions strike, Orion-9 simulates multi-scenario trade-offs, ranks the best operational response, and coordinates execution with full auditability.',
    visualHighlights: [
      'Grounded AI Copilot disruption reasoning and anomaly explanation',
      'Multi-objective cost versus speed versus carbon penalty solvers',
      'Deterministic approval boundaries with two-person financial sign-off',
    ],
    telemetryStream: [
      { label: 'Disruption Resolution Latency', value: '< 180 Seconds', statusColor: '#f5f5f5' },
      { label: 'Autonomous Boundary Health', value: 'Zero Breaches', statusColor: '#f5f5f5' },
      { label: 'Audit Trail Signature', value: 'Immutable & Verified', statusColor: '#f5f5f5' },
    ],
    accent: '#d4d4d4',
  },
];

export const ScrollStorytelling: React.FC = () => {
  const rootRef = useRef<HTMLElement | null>(null);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-motion-reveal]',
        { y: 34, opacity: 0, filter: 'blur(5px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.85, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: root, start: 'top 78%', once: true } }
      );
      const panels = gsap.utils.toArray<HTMLElement>('[data-story-panel]');
      panels.forEach((panel) => {
        gsap.fromTo(panel, { y: 24, opacity: 0.72 }, { y: 0, opacity: 1, ease: 'none',
          scrollTrigger: { trigger: panel, start: 'top 88%', end: 'top 54%', scrub: 0.7 } });
      });
      gsap.to('[data-story-progress]', { scaleX: 1, ease: 'none',
        scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: true } });
    }, root);
    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => { window.clearTimeout(refresh); ctx.revert(); };
  }, []);
  const currentScene = storyScenes[activeSceneIndex];

  return (
    <section ref={rootRef} data-story-root className="py-24 bg-[#050505] border-b border-white/10 relative overflow-hidden">
      <div className="pointer-events-none absolute left-0 top-0 h-px w-full bg-white/10"><div data-story-progress className="h-full w-full origin-left scale-x-0 bg-white" /></div>
      <div className="motion-scanline absolute inset-0 opacity-20" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div data-motion-reveal className="max-w-3xl mb-14 space-y-4 relative">
          <div className="text-xs font-mono uppercase tracking-widest text-[#f5f5f5]">
            SCROLL-CONTROLLED NARRATIVE JOURNEY
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Explore the Living Network.
          </h2>
          <p className="text-base sm:text-lg text-white/70 leading-relaxed">
            Step through the interconnected logistics infrastructure that Orion-9 unifies into one intelligent operating system.
          </p>
        </div>

        {/* Scene Selection Nav (Horizontal Scrollable Tabs with clean states) */}
        <div data-motion-reveal className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10 relative">
          {storyScenes.map((scene, idx) => {
            const isActive = idx === activeSceneIndex;
            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => setActiveSceneIndex(idx)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'bg-[#151e30] border-[#f5f5f5]/80 shadow-xl shadow-black/40 ring-1 ring-[#f5f5f5]/30'
                    : 'bg-[#0b1220] border-white/10 hover:border-white/20 hover:bg-[#0e1728]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-white/40">SCENE {scene.stepNumber}</span>
                  {isActive && (
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: scene.accent }} />
                  )}
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight line-clamp-1">{scene.title}</h3>
                <p className="text-[11px] text-white/50 mt-1 line-clamp-1">{scene.tagline}</p>
              </button>
            );
          })}
        </div>

        {/* Active Scene Showcase Panel */}
        <div data-story-panel className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative">
          {/* Left Column: Scene Narrative and Core Highlights */}
          <div className="lg:col-span-7 rounded-2xl bg-[#0b1220] border border-white/15 p-6 sm:p-10 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-[#f5f5f5] font-bold">{currentScene.badge}</span>
                <span className="text-white/30" aria-hidden="true">·</span>
                <span className="text-white/50">STEP {currentScene.stepNumber} OF 05</span>
              </div>

              <div>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
                  {currentScene.title}
                </h3>
                <p className="text-base text-white/80 leading-relaxed font-normal">
                  {currentScene.narrative}
                </p>
              </div>

              {/* Visual Highlights List */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <span className="text-xs font-mono text-white/40 uppercase tracking-wider block">
                  Observed Physical & Digital Signals
                </span>
                <div className="space-y-2">
                  {currentScene.visualHighlights.map((highlight, hIdx) => (
                    <div
                      key={hIdx}
                      className="flex items-start gap-3 text-xs text-white/80 p-3 rounded-lg bg-[#05080d] border border-white/5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#f5f5f5] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stepper Navigation Buttons */}
            <div className="pt-8 flex items-center justify-between text-xs font-mono text-white/50 border-t border-white/10 mt-8">
              <button
                type="button"
                disabled={activeSceneIndex === 0}
                onClick={() => setActiveSceneIndex((prev) => Math.max(0, prev - 1))}
                className="hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                ← Previous Scene
              </button>
              <span>SCENE {activeSceneIndex + 1} OF 5</span>
              <button
                type="button"
                disabled={activeSceneIndex === storyScenes.length - 1}
                onClick={() => setActiveSceneIndex((prev) => Math.min(storyScenes.length - 1, prev + 1))}
                className="hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors text-[#f5f5f5] font-semibold"
              >
                Next Scene →
              </button>
            </div>
          </div>

          {/* Right Column: Live Telemetry Feeds and Operational Invariants */}
          <div className="lg:col-span-5 rounded-2xl bg-[#111b2b] border border-white/15 p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="text-xs font-mono text-white/50 uppercase tracking-wider">
                  Live Operational Telemetry
                </span>
                <span className="text-xs font-mono text-[#f5f5f5]">STREAM ACTIVE</span>
              </div>

              {/* Telemetry Stream Cards */}
              <div className="space-y-4">
                {currentScene.telemetryStream.map((item, tIdx) => (
                  <div
                    key={tIdx}
                    className="p-4 rounded-xl bg-[#0b1220] border border-white/10 space-y-1.5"
                  >
                    <span className="text-xs font-mono text-white/50 block">{item.label}</span>
                    <span
                      className="text-lg font-bold font-mono tabular-nums block"
                      style={{ color: "#f5f5f5" }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Invariant Footer */}
            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/40">
              <span>CANONICAL ONTOLOGY</span>
              <span className="text-[#f5f5f5]">ENTERPRISE READY</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuth } from '../context/AuthContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { HeroDiorama, HeroCameraPreset } from './HeroDiorama';
import {
  ArrowRight,
  ChevronDown,
  ShieldCheck,
  Radio,
  Globe2,
  Compass,
  Zap,
  AlertTriangle,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const CAMERA_PRESET_LABELS: { id: HeroCameraPreset; label: string; sub: string }[] = [
  { id: 'orbit', label: 'Global Orbit', sub: '142 Nodes' },
  { id: 'shanghai', label: 'Shanghai Port', sub: 'SHA Gateway' },
  { id: 'airbridge', label: 'Air Corridor', sub: 'OA-804 Geodesic' },
  { id: 'rotterdam', label: 'Rotterdam Hub', sub: 'RTM Intermodal' },
];

export const Hero: React.FC = () => {
  const { launchOrion, destinationUrl } = useAuth();
  const { activeConfig } = useSiteConfig();
  const heroRef = useRef<HTMLElement | null>(null);

  const [liveEventsPerSec, setLiveEventsPerSec] = useState<number>(42840);
  const [activePreset, setActivePreset] = useState<HeroCameraPreset>('orbit');
  const [disruptionSimulated, setDisruptionSimulated] = useState<boolean>(false);
  const [heroScrollProgress, setHeroScrollProgress] = useState<number>(0);

  const hp = activeConfig.homepage;

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveEventsPerSec((prev) => prev + Math.floor(Math.random() * 29) - 12);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  // Coordinated Opening Title Sequence & Scroll-Synchronized Hero Exit Choreography
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion || !heroRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Step 1: 3D Logistics World emerges from horizon
      tl.fromTo(
        '.hero-step-3d',
        { opacity: 0, scale: 1.03 },
        { opacity: 1, scale: 1, duration: 1.25, ease: 'power2.out' },
        0.05
      )
        // Step 2: Status badge reveals cleanly
        .fromTo(
          '.hero-step-pill',
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.55 },
          0.14
        )
        // Step 3: Masked clip-path line-by-line headline reveal
        .fromTo(
          '.hero-headline-line',
          { yPercent: 108, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.92,
            stagger: 0.14,
            ease: 'power4.out',
          },
          0.22
        )
        // Step 4: Supporting narrative copy
        .fromTo(
          '.hero-step-copy',
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.7 },
          0.48
        )
        // Step 5: Pill CTAs
        .fromTo(
          '.hero-step-cta',
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.65, stagger: 0.1 },
          0.58
        )
        // Step 6: Interactive 3D Camera Controller & Telemetry Dock
        .fromTo(
          '.hero-step-hud',
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.85 },
          0.52
        );

      // Scroll-driven exit choreography: push camera forward into the world as user scrolls down
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          setHeroScrollProgress(self.progress);
        },
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden border-b border-[#D5E1E8] bg-[#EAF4F8]"
    >
      {/* Real-Time 3D Logistics Digital Twin Centerpiece */}
      <HeroDiorama
        activePreset={activePreset}
        disruptionSimulated={disruptionSimulated}
        scrollProgress={heroScrollProgress}
      />

      {/* Subtle Architectural Framing Hairlines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(to right, #D5E1E8 1px, transparent 1px), linear-gradient(to bottom, #D5E1E8 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
        aria-hidden="true"
      />

      {/* Main Content Viewport */}
      <div className="relative z-20 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-14 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Masked Editorial Typography & Pill CTAs */}
          <div className="lg:col-span-7 space-y-6 bg-gradient-to-r from-[#EAF4F8]/96 via-[#EAF4F8]/90 to-transparent rounded-3xl p-4 sm:p-6 -mx-4 sm:-mx-6">
            {/* Operational Status Badge */}
            <div className="hero-step-pill inline-flex flex-wrap items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-[#D5E1E8] shadow-[0_4px_14px_rgba(16,24,32,0.04)] text-[11px] font-mono tracking-wider uppercase text-[#566575]">
              <span className="w-2 h-2 rounded-full bg-[#294D6B]" />
              <span className="font-semibold text-[#111827]">
                {hp.statusBadge}
              </span>
              <span className="text-[#D5E1E8] hidden sm:inline" aria-hidden="true">
                |
              </span>
              <span className="text-[#294D6B] font-semibold hidden sm:inline tabular-nums">
                {liveEventsPerSec.toLocaleString()} SIG/S
              </span>
            </div>

            {/* Masked Clip-Path Editorial Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-[4.75rem] font-extrabold tracking-[-0.035em] text-[#111827] leading-[0.98]">
              <span className="block overflow-hidden pb-1">
                <span className="hero-headline-line block">
                  {hp.heroHeadlineLine1}
                </span>
              </span>
              <span className="block overflow-hidden pb-1 mt-1">
                <span className="hero-headline-line block text-[#294D6B]">
                  {hp.heroHeadlineLine2}
                </span>
              </span>
            </h1>

            {/* Supporting Product Description */}
            <p className="hero-step-copy text-base sm:text-xl text-[#1E293B] leading-relaxed max-w-xl font-medium">
              {hp.heroSubheadline}
            </p>

            {/* Primary & Secondary Rounded Pill CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <a
                href="#cinematic-story"
                className="hero-step-cta group inline-flex items-center gap-2.5 px-7 py-4 rounded-full bg-[#101820] text-white font-semibold text-sm hover:bg-[#294D6B] transition-all shadow-[0_14px_32px_rgba(16,24,32,0.18)] active:scale-[0.99]"
              >
                <Compass className="w-4 h-4 text-[#A8C2D2]" />
                <span>{hp.primaryCtaText}</span>
              </a>

              <button
                type="button"
                onClick={() => launchOrion(hp.secondaryCtaUrl)}
                className="hero-step-cta group inline-flex items-center gap-2.5 px-7 py-4 rounded-full bg-white border border-[#D5E1E8] text-[#111827] font-semibold text-sm hover:border-[#294D6B] hover:bg-[#F5F9FB] transition-all shadow-[0_6px_20px_rgba(16,24,32,0.05)] cursor-pointer active:scale-[0.99]"
              >
                <span>{hp.secondaryCtaText}</span>
                <ArrowRight className="w-4 h-4 text-[#294D6B] transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* Verified Target Deployment Indicator */}
            <div className="hero-step-copy pt-1 flex flex-wrap items-center gap-2 text-xs font-mono text-[#294D6B]">
              <ShieldCheck className="w-4 h-4 text-[#294D6B]" />
              <span>Live Control Tower Runtime:</span>
              <span className="text-[#111827] font-semibold underline decoration-[#294D6B]">
                {destinationUrl}
              </span>
            </div>
          </div>

          {/* Right Column: Interactive 3D Camera Choreography & Live Disruption Dock */}
          <div className="lg:col-span-5 flex flex-col justify-end lg:items-end lg:min-h-[460px] pointer-events-none">
            <div className="hero-step-hud w-full max-w-md rounded-2xl bg-[#101820] border border-[#294D6B]/55 p-4 font-mono space-y-3.5 pointer-events-auto shadow-[0_24px_60px_rgba(16,24,32,0.24)] text-white">
              <div className="flex items-center justify-between text-[10px] text-[#A8C2D2] border-b border-white/10 pb-2.5">
                <span className="flex items-center gap-1.5 text-white font-semibold">
                  <Radio className="w-3.5 h-3.5 text-[#7DD3FC]" />
                  ORION-9 3D DIGITAL TWIN
                </span>
                <span className="flex items-center gap-1 text-[#A8C2D2]">
                  <Globe2 className="w-3 h-3" />
                  SHA · SIN · DXB · RTM · FRA
                </span>
              </div>

              {/* Interactive 3D Camera Focus Switcher */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[9px] text-[#A8C2D2] uppercase tracking-wider">
                  <span>3D CAMERA TELEMETRY TARGET</span>
                  <span className="text-[#7DD3FC]">CLICK TO FLY CAMERA</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {CAMERA_PRESET_LABELS.map((preset) => {
                    const isActive = activePreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setActivePreset(preset.id)}
                        className={`px-2.5 py-2 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isActive
                            ? 'bg-[#294D6B] border-[#7DD3FC]/60 text-white shadow-sm'
                            : 'bg-white/[0.04] border-white/10 text-[#A8C2D2] hover:text-white hover:border-white/25'
                        }`}
                      >
                        <span className="text-[10px] font-bold truncate">
                          {preset.label}
                        </span>
                        <span className="text-[9px] opacity-75">
                          {preset.sub}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {hp.heroMetrics.map((m) => (
                  <div
                    key={m.id}
                    className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10"
                  >
                    <span className="text-[9px] text-[#A8C2D2] block uppercase tracking-wider">
                      {m.label}
                    </span>
                    <span className="text-xs font-bold text-white tabular-nums block mt-0.5">
                      {m.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Live Disruption & Autonomous Bypass Toggle */}
              <div className="pt-1 flex items-center justify-between gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setDisruptionSimulated((prev) => !prev)}
                  className={`w-full py-2 px-3 rounded-xl border text-[10px] font-bold transition-all cursor-pointer flex items-center justify-between ${
                    disruptionSimulated
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                      : 'bg-white/[0.05] border-white/15 text-[#A8C2D2] hover:text-white hover:border-[#7DD3FC]/50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {disruptionSimulated ? (
                      <Zap className="w-3.5 h-3.5 text-emerald-300" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-[#7DD3FC]" />
                    )}
                    <span>
                      {disruptionSimulated
                        ? 'SEA-AIR BYPASS ACTIVE (DXB → FRA)'
                        : 'TEST CORRIDOR DISRUPTION & BYPASS'}
                    </span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-black/30 text-[9px] text-white">
                    {disruptionSimulated ? 'RESET' : 'SIMULATE'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Capabilities & Scroll Choreography Ribbon */}
      <div className="relative z-20 w-full bg-[#F5F9FB] border-t border-[#D5E1E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#566575]">
          <div className="flex flex-wrap items-center gap-6">
            <span className="text-[#294D6B] font-semibold uppercase">
              UNIFIED ARCHITECTURE:
            </span>
            <span className="text-[#111827] font-medium">
              MULTI-MODAL CANONICAL GRAPH
            </span>
            <span className="text-[#D5E1E8] hidden sm:inline" aria-hidden="true">
              /
            </span>
            <span className="text-[#566575] hidden sm:inline">
              REAL-TIME AIS &amp; ADS-B TELEMETRY
            </span>
            <span className="text-[#D5E1E8] hidden md:inline" aria-hidden="true">
              /
            </span>
            <span className="text-[#566575] hidden md:inline">
              GOVERNED AI EXECUTION
            </span>
          </div>
          <a
            href="#cinematic-story"
            className="flex items-center gap-1.5 text-[#294D6B] hover:text-[#111827] transition-colors font-semibold"
          >
            <span>Enter 6-Chapter 3D Narrative</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
};

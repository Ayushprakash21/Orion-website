import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useAuth } from '../context/AuthContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { HeroSculpturalNetwork } from './HeroSculpturalNetwork';
import {
  ArrowRight,
  ShieldCheck,
  Compass,
  CheckCircle2,
  Database,
  Cpu,
  Layers,
} from 'lucide-react';

export const Hero: React.FC = () => {
  const { launchOrion, destinationUrl, openAuthModal } = useAuth();
  const { activeConfig } = useSiteConfig();
  const heroRef = useRef<HTMLElement | null>(null);
  const hp = activeConfig.homepage;

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion || !heroRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // 1. Reveal Eyebrow badge
      tl.fromTo(
        '.hero-eyebrow',
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.6 }
      )
        // 2. Line-by-line editorial headline reveal
        .fromTo(
          '.hero-headline-line',
          { yPercent: 100, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.85,
            stagger: 0.12,
            ease: 'power4.out',
          },
          '-=0.3'
        )
        // 3. Supporting copy reveal
        .fromTo(
          '.hero-copy',
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.65 },
          '-=0.45'
        )
        // 4. Pill CTAs reveal
        .fromTo(
          '.hero-cta-group',
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.6 },
          '-=0.4'
        )
        // 5. Capability strip
        .fromTo(
          '.hero-trust-strip',
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.55 },
          '-=0.3'
        )
        // 6. Sculptural visual container resolves
        .fromTo(
          '.hero-visual-card',
          { opacity: 0, scale: 0.98, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 0.9, ease: 'power3.out' },
          0.2
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative pt-12 sm:pt-20 pb-20 sm:pb-28 bg-[#EAF4F8] border-b border-[#D5E1E8] overflow-hidden"
    >
      {/* Subtle background radial ambient glow to elevate the porcelain ice-blue atmosphere */}
      <div
        className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-b from-[#DCEAF2]/60 to-transparent rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Refined Editorial Typography & CTAs */}
          <div className="lg:col-span-6 space-y-7">
            {/* Small Product Eyebrow */}
            <div className="hero-eyebrow inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/95 border border-[#D5E1E8] shadow-[0_2px_10px_rgba(20,40,65,0.04)] text-xs font-mono text-[#294D6B]">
              <span className="w-2 h-2 rounded-full bg-[#294D6B]" />
              <span className="font-semibold text-[#111827]">ORION-9</span>
              <span className="text-[#D5E1E8]">/</span>
              <span className="text-[#566575]">SUPPLY CHAIN OPERATING SYSTEM</span>
            </div>

            {/* Editorial Display Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[4rem] font-bold tracking-[-0.035em] text-[#111827] leading-[1.04]">
              <span className="block overflow-hidden pb-1">
                <span className="hero-headline-line block">
                  One intelligent system for
                </span>
              </span>
              <span className="block overflow-hidden pb-1">
                <span className="hero-headline-line block text-[#294D6B]">
                  the world's supply chains.
                </span>
              </span>
            </h1>

            {/* Concise Supporting Copy */}
            <p className="hero-copy text-base sm:text-lg text-[#4A5568] leading-relaxed max-w-xl font-normal">
              Orion-9 connects enterprise supply-chain data, identifies operational
              risks across global corridors, and coordinates governed decisions
              across the physical network in real time.
            </p>

            {/* Two Refined Rounded Pill CTAs */}
            <div className="hero-cta-group pt-1 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={() => launchOrion(hp.secondaryCtaUrl)}
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#101820] text-white font-medium text-sm hover:bg-[#294D6B] transition-all shadow-[0_8px_24px_rgba(16,24,32,0.14)] active:scale-[0.99] cursor-pointer"
              >
                <span>Launch Control Tower</span>
                <ArrowRight className="w-4 h-4 text-[#A8C2D2] transition-transform group-hover:translate-x-1" />
              </button>

              <a
                href="#problem"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white border border-[#D5E1E8] text-[#111827] font-medium text-sm hover:bg-[#F5F9FB] hover:border-[#294D6B]/40 transition-all shadow-[0_2px_8px_rgba(16,24,32,0.03)] active:scale-[0.99]"
              >
                <Compass className="w-4 h-4 text-[#294D6B]" />
                <span>Explore the Platform</span>
              </a>
            </div>

            {/* Restrained Trust & Capability Strip */}
            <div className="hero-trust-strip pt-4 border-t border-[#D5E1E8]/70 flex flex-wrap items-center gap-6 text-xs text-[#566575]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#294D6B]" />
                <span>Enterprise Zero-Trust</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#294D6B]" />
                <span>Canonical Graph Ontology</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#294D6B]" />
                <span>Governed Decision Automation</span>
              </div>
            </div>
          </div>

          {/* Right Column: One Sculptural Logistics Centerpiece */}
          <div className="lg:col-span-6 hero-visual-card">
            <HeroSculpturalNetwork />
          </div>
        </div>
      </div>
    </section>
  );
};

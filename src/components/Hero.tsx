import React from 'react';
import { useAuth } from '../context/AuthContext';
import { HeroDiorama } from './HeroDiorama';
import { ArrowRight, ChevronDown, Activity, Network, ShieldCheck } from 'lucide-react';

export const Hero: React.FC = () => {
  const { launchOrion, destinationUrl } = useAuth();

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden border-b border-white/10">
      {/* Cinematic Night Miniature Supply Chain Canvas Diorama */}
      <HeroDiorama />

      {/* Hero Foreground Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-12 flex-1 flex flex-col justify-center">
        <div className="max-w-3xl space-y-6">
          {/* Subtle Small Label (Anti-Pill: Clean unboxed text) */}
          <div className="flex items-center gap-3 text-xs tracking-widest uppercase font-mono text-[#f5f5f5]">
            <span>AI-POWERED SUPPLY CHAIN OPERATIONS</span>
            <span className="text-white/30" aria-hidden="true">·</span>
            <span className="text-white/60">AUTONOMOUS ORCHESTRATION</span>
          </div>

          {/* Primary Display Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] text-balance">
            Your Supply Chain.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/95 to-white/70">
              One Intelligent System.
            </span>
          </h1>

          {/* Supporting Copy */}
          <p className="text-lg sm:text-xl text-white/75 leading-relaxed max-w-2xl font-normal">
            Orion-9 connects supply chain data, operational workflows, risk intelligence, and AI-powered decisions in one unified control tower.
          </p>

          {/* Brand Supporting Statement */}
          <p className="text-sm sm:text-base font-medium text-[#f5f5f5]/90 tracking-wide font-mono">
            &ldquo;See every signal. Predict every disruption. Orchestrate every decision.&rdquo;
          </p>

          {/* Action Button Row */}
          <div className="pt-4 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={launchOrion}
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#f5f5f5] text-[#0f1626] font-bold text-sm uppercase tracking-wider shadow-xl shadow-[#f5f5f5]/25 hover:bg-[#e5e5e5] hover:shadow-[#f5f5f5]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1626] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Launch Orion-9</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#platform"
              className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#151e30] border border-white/20 text-white font-medium text-sm tracking-wide hover:bg-[#1d293d] hover:border-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5f5f5] transition-all"
            >
              <span>Explore the Platform</span>
            </a>
          </div>

          {/* Live Destination Trust Indicator */}
          <div className="pt-3 flex items-center gap-2 text-xs text-white/50 font-mono">
            <ShieldCheck className="w-4 h-4 text-[#f5f5f5]" />
            <span>Target Deployment:</span>
            <span className="text-white/80 underline decoration-white/20">{destinationUrl}</span>
          </div>
        </div>
      </div>

      {/* Bottom Telemetry Strip (Subtle Operational Metrics - No Fake Slop) */}
      <div className="relative z-10 w-full bg-[#0a0f1b]/80 border-t border-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-white/60">
          <div className="flex items-center gap-6">
            <span className="text-white/40">SYSTEM TOPOLOGY:</span>
            <span className="text-white/90">MULTI-TIER INTEGRATION</span>
            <span className="text-white/30 hidden sm:inline" aria-hidden="true">/</span>
            <span className="text-white/90 hidden sm:inline">EVENT-DRIVEN STREAM</span>
            <span className="text-white/30 hidden md:inline" aria-hidden="true">/</span>
            <span className="text-white/90 hidden md:inline">CANONICAL RECONCILIATION</span>
          </div>
          <a
            href="#platform"
            className="flex items-center gap-1.5 text-[#f5f5f5] hover:text-white transition-colors"
          >
            <span>Platform Overview</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
};

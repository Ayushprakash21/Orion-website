import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { HeroSculpturalNetwork } from './HeroSculpturalNetwork';
import {
  ArrowRight,
  ShieldCheck,
  Compass,
  CheckCircle2,
  Database,
} from 'lucide-react';

export const Hero: React.FC = () => {
  const { launchOrion, destinationUrl } = useAuth();
  const { activeConfig } = useSiteConfig();
  const hp = activeConfig.homepage;

  return (
    <section
      className="relative pt-10 sm:pt-16 pb-20 sm:pb-28 bg-[var(--orion-canvas)] text-[var(--orion-text-primary)] border-b border-[var(--glass-border-subtle)] overflow-hidden transition-colors duration-300"
    >
      {/* Delicate ambient background glow */}
      <div
        className="absolute top-0 right-1/4 w-[640px] h-[640px] bg-gradient-to-b from-[#DCEAF2]/60 to-transparent rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Editorial Column */}
          <div className="lg:col-span-6 space-y-7 animate-[fadeIn_0.6s_ease-out]">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-badge text-xs font-medium text-[var(--orion-text-primary)] shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#294D6B]" />
              <span className="font-semibold text-[#111827]">ORION-9</span>
              <span className="text-[#D5E1E8]">/</span>
              <span>Autonomous Supply Chain OS</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[4.15rem] font-bold tracking-[-0.035em] text-[var(--orion-text-primary)] leading-[1.03]">
              <span className="block">One intelligent system for</span>
              <span className="block text-[var(--orion-accent)]">the world's supply chains.</span>
            </h1>

            <p className="text-base sm:text-lg text-[var(--orion-text-secondary)] leading-relaxed max-w-xl">
              Orion-9 connects enterprise supply-chain data, identifies operational
              risks across global corridors, and coordinates governed decisions
              across the physical network in real time.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={() => launchOrion(hp.secondaryCtaUrl || destinationUrl)}
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[var(--orion-text-primary)] text-[var(--orion-surface)] font-medium text-sm hover:bg-[var(--orion-accent)] hover:text-white transition-all shadow-lg active:scale-[0.99] cursor-pointer"
              >
                <span>Launch Orion-9 OS</span>
                <ArrowRight className="w-4 h-4 text-[#A8C2D2] transition-transform group-hover:translate-x-1" />
              </button>

              <a
                href="#problem"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full liquid-glass-button text-[var(--orion-text-primary)] font-medium text-sm transition-all shadow-xs active:scale-[0.99]"
              >
                <Compass className="w-4 h-4 text-[#294D6B]" />
                <span>Explore the Platform</span>
              </a>
            </div>

            <div className="pt-4 border-t border-[var(--glass-border-subtle)] flex flex-wrap items-center gap-6 text-xs text-[var(--orion-text-muted)]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#294D6B]" />
                <span>Zero-Trust Security</span>
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

          {/* 3D Visual Column */}
          <div className="lg:col-span-6 animate-[fadeIn_0.9s_ease-out]">
            <HeroSculpturalNetwork />
          </div>
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';
import { ArrowRight, UserPlus, Compass } from 'lucide-react';

interface FinalCTAProps {
  onLaunchApp: () => void;
  onOpenAuth: (mode?: 'login' | 'signup' | 'forgot') => void;
  onNavigate?: (path: string) => void;
  isAuthenticated: boolean;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({
  onLaunchApp,
  onOpenAuth,
  onNavigate,
  isAuthenticated,
}) => {
  const { activeConfig } = useSiteConfig();
  const hp = activeConfig.homepage;

  const handleRoute = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      onOpenAuth('signup');
    }
  };

  return (
    <section className="relative py-28 lg:py-36 bg-[var(--orion-canvas)] text-[var(--orion-text-primary)] border-b border-[var(--glass-border-subtle)] overflow-hidden transition-colors duration-300">
      {/* Soft Ambient Radial Atmosphere */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[var(--orion-accent)]/15 rounded-full blur-[140px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-badge text-[11px] font-mono uppercase tracking-widest text-[var(--orion-accent)] font-semibold mx-auto block">
          Get Started with Orion-9
        </span>

        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--orion-text-primary)] tracking-[-0.035em] leading-[1.04]">
          {hp.finalCtaTitle || 'Ready to orchestrate your global supply chain?'}
        </h2>

        <p className="text-base sm:text-lg text-[var(--orion-text-secondary)] max-w-2xl mx-auto leading-relaxed">
          {hp.finalCtaSubtitle ||
            'Deploy an autonomous intelligence layer over your existing ERPs and freight carriers.'}
        </p>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={onLaunchApp}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[var(--orion-text-primary)] text-[var(--orion-surface)] font-medium text-sm rounded-full hover:bg-[var(--orion-accent)] hover:text-white transition-all shadow-lg active:scale-[0.99] group cursor-pointer"
          >
            <span>Launch Orion-9 OS</span>
            <ArrowRight className="w-4 h-4 text-[#A8C2D2] transition-transform group-hover:translate-x-1" />
          </button>

          {!isAuthenticated && (
            <button
              type="button"
              onClick={() => handleRoute('/signup')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 liquid-glass-button text-[var(--orion-text-primary)] font-medium text-sm rounded-full transition-all shadow-xs cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-[#294D6B]" />
              <span>Create Account</span>
            </button>
          )}

          <a
            href="#network"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 liquid-glass-subtle text-[var(--orion-text-secondary)] hover:text-[var(--orion-text-primary)] font-medium text-sm rounded-full border border-[var(--glass-border)] transition-all"
          >
            <Compass className="w-4 h-4 text-[#294D6B]" />
            <span>Explore Global Topology</span>
          </a>
        </div>
      </div>
    </section>
  );
};

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
    <section className="relative py-28 lg:py-36 bg-[#F5F9FB] border-b border-[#D5E1E8] overflow-hidden">
      {/* Soft Ambient Radial Atmosphere */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[340px] bg-[#A8C2D2]/20 rounded-full blur-[140px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <span className="text-xs font-semibold text-[#294D6B] uppercase tracking-wider block">
          Get Started with Orion-9
        </span>

        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#111827] tracking-[-0.035em] leading-[1.04]">
          {hp.finalCtaTitle || 'Ready to orchestrate your global supply chain?'}
        </h2>

        <p className="text-base sm:text-lg text-[#4A5568] max-w-2xl mx-auto leading-relaxed">
          {hp.finalCtaSubtitle ||
            'Deploy an autonomous intelligence layer over your existing ERPs and freight carriers.'}
        </p>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={onLaunchApp}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#111827] text-white font-medium text-sm rounded-full hover:bg-[#294D6B] transition-all shadow-[0_8px_24px_rgba(17,24,39,0.14)] active:scale-[0.99] group cursor-pointer"
          >
            <span>Launch Control Tower</span>
            <ArrowRight className="w-4 h-4 text-[#A8C2D2] transition-transform group-hover:translate-x-1" />
          </button>

          {!isAuthenticated && (
            <button
              type="button"
              onClick={() => handleRoute('/signup')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 bg-white text-[#111827] font-medium text-sm rounded-full border border-[#D5E1E8] hover:border-[#294D6B]/50 hover:bg-[#F5F9FB] transition-all shadow-2xs cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-[#294D6B]" />
              <span>Create Operator Account</span>
            </button>
          )}

          <a
            href="#network"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 bg-transparent text-[#4A5568] font-medium text-sm rounded-full border border-[#D5E1E8] hover:border-[#294D6B] hover:text-[#111827] transition-all"
          >
            <Compass className="w-4 h-4 text-[#294D6B]" />
            <span>Explore Global Topology</span>
          </a>
        </div>
      </div>
    </section>
  );
};

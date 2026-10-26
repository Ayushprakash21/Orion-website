import React from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';
import { ArrowRight, ShieldCheck, Compass, ExternalLink, UserPlus } from 'lucide-react';

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
      {/* Subtle ice-blue radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[360px] bg-[#A8C2D2]/25 rounded-full blur-[140px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[#D5E1E8] bg-white text-[#294D6B] font-mono text-xs font-semibold shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#294D6B]" />
          <span>{hp.finalCtaEyebrow || '06 / PRODUCTION DEPLOYMENT'}</span>
          <span className="text-[#D5E1E8]">|</span>
          <span className="text-[#566575]">v2.5 PRODUCTION READY</span>
        </div>

        {/* Editorial Headline */}
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#111827] tracking-[-0.035em] max-w-4xl mx-auto leading-[1.04]">
          {hp.finalCtaTitle || 'Ready to orchestrate your global supply chain?'}
        </h2>

        {/* Subtitle */}
        <p className="text-[#4A5568] text-base sm:text-xl max-w-2xl mx-auto font-normal leading-relaxed">
          {hp.finalCtaSubtitle ||
            'Create an operator account, connect your enterprise ERP, or launch the live Orion-9 Control Tower.'}
        </p>

        {/* Pill CTA Button Group */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={onLaunchApp}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#101820] text-white font-semibold text-sm rounded-full hover:bg-[#294D6B] transition-all shadow-[0_12px_30px_rgba(16,24,32,0.16)] active:scale-[0.99] group cursor-pointer"
          >
            <span>Launch Control Tower</span>
            <ArrowRight className="w-4 h-4 text-[#A8C2D2] transition-transform group-hover:translate-x-1" />
          </button>

          {!isAuthenticated && (
            <>
              <button
                type="button"
                onClick={() => handleRoute('/signup')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 bg-white text-[#111827] font-semibold text-sm rounded-full border border-[#D5E1E8] hover:border-[#294D6B]/50 hover:bg-[#F5F9FB] transition-all shadow-2xs cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-[#294D6B]" />
                <span>Create Operator Account</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoute('/login')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 bg-transparent text-[#294D6B] font-semibold text-sm rounded-full hover:bg-white/70 transition-all cursor-pointer"
              >
                <span>Operator Sign In</span>
              </button>
            </>
          )}

          <a
            href="#network"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 bg-transparent text-[#566575] font-semibold text-sm rounded-full border border-[#D5E1E8] hover:border-[#294D6B] hover:text-[#111827] transition-all"
          >
            <Compass className="w-4 h-4 text-[#294D6B]" />
            <span>Explore Topology</span>
          </a>
        </div>

        {/* Live Metrics Ribbons */}
        <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="p-5 bg-white border border-[#D5E1E8] rounded-2xl text-left shadow-2xs">
            <div className="text-[11px] font-mono text-[#566575] uppercase">Live Global Nodes</div>
            <div className="text-2xl font-mono font-bold text-[#111827] mt-1">142+</div>
            <div className="text-[11px] text-[#294D6B] font-medium mt-0.5">Ports &amp; Air Hubs</div>
          </div>

          <div className="p-5 bg-white border border-[#D5E1E8] rounded-2xl text-left shadow-2xs">
            <div className="text-[11px] font-mono text-[#566575] uppercase">Decision Latency</div>
            <div className="text-2xl font-mono font-bold text-[#111827] mt-1">&lt; 180s</div>
            <div className="text-[11px] text-[#294D6B] font-medium mt-0.5">Anomaly to Reroute</div>
          </div>

          <div className="p-5 bg-white border border-[#D5E1E8] rounded-2xl text-left shadow-2xs">
            <div className="text-[11px] font-mono text-[#566575] uppercase">SLA Integrity</div>
            <div className="text-2xl font-mono font-bold text-[#111827] mt-1">99.8%</div>
            <div className="text-[11px] text-[#294D6B] font-medium mt-0.5">Protected Delivery</div>
          </div>

          <div className="p-5 bg-white border border-[#D5E1E8] rounded-2xl text-left shadow-2xs">
            <div className="text-[11px] font-mono text-[#566575] uppercase">Security Standard</div>
            <div className="text-2xl font-mono font-bold text-[#111827] mt-1">SOC 2</div>
            <div className="text-[11px] text-[#294D6B] font-medium mt-0.5">Type II Verified</div>
          </div>
        </div>
      </div>
    </section>
  );
};

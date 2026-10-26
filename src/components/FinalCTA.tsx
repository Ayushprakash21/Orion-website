import React from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';
import { ArrowRight, ShieldCheck, Terminal, Compass, ExternalLink, UserPlus } from 'lucide-react';

interface FinalCTAProps {
  onLaunchApp: () => void;
  onOpenAuth: () => void;
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
      onOpenAuth();
    }
  };

  return (
    <section className="relative py-28 lg:py-36 bg-[#F5F9FB] border-b border-[#D5E1E8] overflow-hidden">
      {/* Subtle ice-blue radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[360px] bg-[#A8C2D2]/30 rounded-full blur-[130px] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[#D5E1E8] bg-white text-[#294D6B] font-mono text-xs font-semibold mb-8 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#294D6B]" />
          <span>{hp.finalCtaEyebrow}</span>
          <span className="text-[#D5E1E8]">|</span>
          <span className="text-[#566575]">v2.5 PRODUCTION READY</span>
        </div>

        {/* Headline */}
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#111827] tracking-[-0.035em] max-w-4xl mx-auto leading-[1.04]">
          {hp.finalCtaTitle}
        </h2>

        {/* Subtitle */}
        <p className="mt-5 text-[#566575] text-base sm:text-xl max-w-2xl mx-auto font-normal leading-relaxed">
          {hp.finalCtaSubtitle}
        </p>

        {/* Pill CTA Button Group */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={onLaunchApp}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#101820] text-white font-semibold text-sm rounded-full hover:bg-[#294D6B] transition-all duration-200 shadow-[0_14px_32px_rgba(16,24,32,0.18)] active:scale-[0.99] group cursor-pointer"
          >
            <span>Launch Control Tower</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          {!isAuthenticated && (
            <>
              <button
                type="button"
                onClick={() => handleRoute('/signup')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 bg-white text-[#111827] font-semibold text-sm rounded-full border border-[#D5E1E8] hover:border-[#294D6B] transition-all duration-200 shadow-2xs cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-[#294D6B]" />
                <span>Create Operator Account</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoute('/login')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 bg-transparent text-[#294D6B] font-semibold text-sm rounded-full hover:bg-white/70 transition-all duration-200 cursor-pointer"
              >
                <span>Operator Sign In</span>
              </button>
            </>
          )}

          <a
            href="#network"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 bg-transparent text-[#566575] font-semibold text-sm rounded-full border border-[#D5E1E8] hover:border-[#294D6B] hover:text-[#111827] transition-all duration-200"
          >
            <Compass className="w-4 h-4 text-[#294D6B]" />
            <span>Explore 3D Network</span>
          </a>
        </div>

        {/* Live Metrics Ribbons */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="p-5 bg-white border border-[#D5E1E8] rounded-2xl text-left shadow-2xs">
            <div className="text-[11px] font-mono text-[#566575] uppercase">Live Global Nodes</div>
            <div className="text-2xl font-mono font-bold text-[#111827] mt-1">142+</div>
            <div className="text-[11px] text-[#294D6B] font-medium mt-0.5">Berths, Ports, Air Hubs</div>
          </div>
          <div className="p-5 bg-white border border-[#D5E1E8] rounded-2xl text-left shadow-2xs">
            <div className="text-[11px] font-mono text-[#566575] uppercase">Telemetry Ingestion</div>
            <div className="text-2xl font-mono font-bold text-[#111827] mt-1">42.8K / s</div>
            <div className="text-[11px] text-[#294D6B] font-medium mt-0.5">Sub-second AIS / GPS</div>
          </div>
          <div className="p-5 bg-white border border-[#D5E1E8] rounded-2xl text-left shadow-2xs">
            <div className="text-[11px] font-mono text-[#566575] uppercase">SLA Protection</div>
            <div className="text-2xl font-mono font-bold text-[#111827] mt-1">99.4%</div>
            <div className="text-[11px] text-[#294D6B] font-medium mt-0.5">Closed-loop resolution</div>
          </div>
          <div className="p-5 bg-white border border-[#D5E1E8] rounded-2xl text-left shadow-2xs">
            <div className="text-[11px] font-mono text-[#566575] uppercase">Decision Latency</div>
            <div className="text-2xl font-mono font-bold text-[#111827] mt-1">&lt; 3.0 min</div>
            <div className="text-[11px] text-[#294D6B] font-medium mt-0.5">Vs. 72h manual triage</div>
          </div>
        </div>

        {/* Security & Verification Badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-[#566575]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#294D6B]" />
            SOC 2 TYPE II CERTIFIED
          </span>
          <span className="text-[#D5E1E8]">•</span>
          <span className="flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-[#294D6B]" />
            ENTERPRISE SLA 99.99%
          </span>
          <span className="text-[#D5E1E8]">•</span>
          <span className="flex items-center gap-1.5">
            <ExternalLink className="w-4 h-4 text-[#294D6B]" />
            ORION-9.AYUSHPRAKASH0021.WORKERS.DEV
          </span>
        </div>
      </div>
    </section>
  );
};

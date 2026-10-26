import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { ArrowRight, ShieldCheck, Lock } from 'lucide-react';

interface FooterProps {
  onNavigate?: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { launchOrion, destinationUrl, isAuthenticated } = useAuth();
  const { activeConfig } = useSiteConfig();
  const { branding, footer } = activeConfig;

  const handleRoute = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const platformLinks = [
    { label: 'Systemic Disruption Cascade', href: '#problem' },
    { label: 'Global Topology', href: '#network' },
    { label: 'Decision Intelligence', href: '#decision-story' },
    { label: 'Control Tower Cockpit', href: '#control-tower' },
  ];

  const accessLinks = [
    { label: 'System Architecture', href: '#architecture' },
    { label: 'Operator Sign In', href: '/login' },
    { label: 'Create Account', href: '/signup' },
    { label: 'Admin Console', href: '/admin/login' },
  ];

  return (
    <footer className="bg-[#EAF4F8] text-[#566575] border-t border-[#D5E1E8] pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-16 border-b border-[#D5E1E8]">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#111827] text-white flex items-center justify-center font-mono text-xs font-bold tracking-tight">
                {branding.shortMark || 'Ω9'}
              </div>
              <span className="text-xl font-bold tracking-tight text-[#111827]">
                {branding.companyName || 'Orion-9'}
              </span>
            </div>

            <p className="text-sm font-semibold text-[#111827]">
              The Intelligence Layer for Global Supply Chains.
            </p>

            <p className="text-xs text-[#566575] max-w-sm leading-relaxed">
              Unifying real-time multi-modal telemetry, canonical graph digital twins,
              stochastic risk optimization, and governed autonomous execution.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-[#294D6B]">
              <ShieldCheck className="w-4 h-4" />
              <span>Production Target:</span>
              <span className="font-medium underline">{destinationUrl}</span>
            </div>
          </div>

          {/* Platform Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#111827]">
              Platform Narrative
            </h4>
            <ul className="space-y-2 text-xs">
              {platformLinks.map((lnk) => (
                <li key={lnk.label}>
                  <a href={lnk.href} className="text-[#566575] hover:text-[#111827] transition-colors">
                    {lnk.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Access & Administration */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#111827]">
              Access &amp; Deployment
            </h4>
            <ul className="space-y-2 text-xs">
              {accessLinks.map((lnk) => (
                <li key={lnk.label}>
                  <button
                    type="button"
                    onClick={() => handleRoute(lnk.href)}
                    className="text-[#566575] hover:text-[#111827] transition-colors cursor-pointer text-left"
                  >
                    {lnk.label}
                  </button>
                </li>
              ))}
            </ul>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => launchOrion()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#111827] text-white text-xs font-medium hover:bg-[#294D6B] transition-all cursor-pointer shadow-xs"
              >
                <span>Launch Control Tower</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#A8C2D2]" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#566575]">
          <p>© {new Date().getFullYear()} Orion-9 Technologies Inc. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <span className="px-2.5 py-1 rounded-full bg-white border border-[#D5E1E8] text-[#294D6B] font-medium">
              SOC 2 TYPE II CERTIFIED
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white border border-[#D5E1E8] text-[#294D6B] font-medium">
              ISO 27001 COMPLIANT
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white border border-[#D5E1E8] text-[#294D6B] font-medium">
              ZERO-TRUST ARCHITECTURE
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

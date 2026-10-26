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

  return (
    <footer className="bg-[#EAF4F8] text-[#566575] border-t border-[#D5E1E8] pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-16 border-b border-[#D5E1E8]">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#101820] text-white flex items-center justify-center font-mono text-xs font-bold tracking-tighter">
                {branding.shortMark}
              </div>
              <span className="text-xl font-bold tracking-tight text-[#111827]">
                {branding.companyName}
              </span>
            </div>
            <p className="text-base text-[#111827] font-semibold">
              {footer.headline}
            </p>
            <p className="text-sm text-[#566575] max-w-md leading-relaxed">
              {footer.description}
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-mono text-[#294D6B]">
              <ShieldCheck className="w-4 h-4" />
              <span>Production Target:</span>
              <span className="underline">{destinationUrl}</span>
            </div>
          </div>

          {/* Dynamic CMS Link Columns */}
          {footer.columns.map((col) => (
            <div key={col.id} className="md:col-span-2 space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-[#294D6B] font-bold">
                {col.heading}
              </h4>
              <ul className="space-y-2.5 text-sm">
                {col.links.map((lnk, idx) => (
                  <li key={idx}>
                    {lnk.href.startsWith('/') && !lnk.href.startsWith('/#') ? (
                      <button
                        type="button"
                        onClick={() => handleRoute(lnk.href)}
                        className="text-[#566575] hover:text-[#111827] transition-colors cursor-pointer"
                      >
                        {lnk.label}
                      </button>
                    ) : (
                      <a
                        href={lnk.href}
                        className="text-[#566575] hover:text-[#111827] transition-colors"
                      >
                        {lnk.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Access Orion-9 Column */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#294D6B] font-bold">
              Deployment &amp; Access
            </h4>
            <p className="text-xs text-[#566575] leading-relaxed">
              Deployable in private cloud, sovereign air-gapped clusters, or managed multi-region edge instances.
            </p>
            <div className="flex flex-col gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => launchOrion()}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#101820] text-white text-xs font-semibold hover:bg-[#294D6B] transition-all cursor-pointer shadow-sm"
              >
                <span>Launch Control Tower</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {!isAuthenticated && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRoute('/login')}
                    className="py-2.5 px-3 rounded-full bg-white border border-[#D5E1E8] text-[#111827] hover:border-[#294D6B] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Log In
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoute('/signup')}
                    className="py-2.5 px-3 rounded-full bg-white border border-[#D5E1E8] text-[#111827] hover:border-[#294D6B] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Sign Up
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => handleRoute('/admin/login')}
                className="inline-flex items-center justify-center gap-1.5 py-2 text-[11px] font-mono text-[#566575] hover:text-[#294D6B] transition-colors cursor-pointer"
              >
                <Lock className="w-3 h-3" />
                <span>Enterprise Admin Console</span>
              </button>
            </div>
          </div>
        </div>

        {/* Copyright & Security Line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#566575]">
          <p>{footer.copyrightText}</p>
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            {footer.securityBadges.map((badge, bIdx) => (
              <span
                key={bIdx}
                className="px-2.5 py-1 rounded-full bg-white border border-[#D5E1E8] text-[#294D6B] font-semibold"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

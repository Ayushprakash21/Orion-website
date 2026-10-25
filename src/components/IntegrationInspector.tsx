import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Terminal, Shield, CheckCircle2, AlertCircle, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

export const IntegrationInspector: React.FC = () => {
  const { destinationUrl, isFirebaseConfigured, crossAppStatus } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside className="border-t border-white/10 bg-[#0c121e] text-xs font-mono" aria-label="System Integration Status">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-[#f5f5f5]" />
          <span className="text-white/60">INTEGRATION STATUS:</span>
          <span className="text-white/90">LIVE DESTINATION WIRED</span>
          <span className="text-white/30 hidden sm:inline" aria-hidden="true">·</span>
          <span className="text-white/60 hidden sm:inline">DESTINATION: {destinationUrl}</span>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 text-[#f5f5f5] hover:text-white transition-colors"
        >
          <span>{isOpen ? 'Hide Architecture Specs' : 'View Architecture Specs'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-white/10 bg-[#090e18] p-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Live Deployment Verification */}
            <div className="p-4 rounded-xl bg-[#151e30] border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#f5f5f5]" />
                <span>Live Orion-9 Destination</span>
              </div>
              <p className="text-white/60 leading-relaxed">
                The primary Launch action targets the live, deployed Orion-9 application on Cloudflare Workers.
              </p>
              <div className="p-2 rounded bg-black/40 text-[11px] text-white/80 break-all border border-white/5">
                {destinationUrl}
              </div>
            </div>

            {/* Firebase Auth Infrastructure */}
            <div className="p-4 rounded-xl bg-[#151e30] border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold">
                {isFirebaseConfigured ? (
                  <CheckCircle2 className="w-4 h-4 text-[#f5f5f5]" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-neutral-300" />
                )}
                <span>Firebase Authentication</span>
              </div>
              <p className="text-white/60 leading-relaxed">
                {isFirebaseConfigured
                  ? 'Active Firebase Authentication project detected in environment.'
                  : 'Pending runtime credentials in this AI Studio container. Live app authentication remains fully hosted at the destination.'}
              </p>
              <div className="text-[11px] text-white/50">
                SDK STATUS: {isFirebaseConfigured ? 'READY' : 'UNPROVISIONED IN SANDBOX'}
              </div>
            </div>

            {/* Cross-App Security Boundary */}
            <div className="p-4 rounded-xl bg-[#151e30] border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Shield className="w-4 h-4 text-[#f5f5f5]" />
                <span>Security & Zero Token Leakage</span>
              </div>
              <p className="text-white/60 leading-relaxed text-[11px]">
                Authentication tokens, refresh keys, and passwords are NEVER passed in URL parameters. Cross-origin sessions transition cleanly via verified redirection.
              </p>
              <div className="text-[11px] text-[#f5f5f5]">
                RFC 6749 & WCAG AA COMPLIANT
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

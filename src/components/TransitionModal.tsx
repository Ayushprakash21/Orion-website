import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ExternalLink, Loader2, Lock, AlertTriangle } from 'lucide-react';

export const TransitionModal: React.FC = () => {
  const { isTransitioning, transitionMessage, destinationUrl, crossAppStatus } = useAuth();

  if (!isTransitioning) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300"
      role="alertdialog"
      aria-live="assertive"
    >
      <div className="relative w-full max-w-lg bg-[#151e30] border border-cyan-400/40 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 text-center">
        {/* Pulsing Command Icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#1d293d] border border-cyan-400/50 mx-auto flex items-center justify-center text-[#f5f5f5] shadow-xl shadow-cyan-950/50">
          <Loader2 className="w-8 h-8 animate-spin text-[#f5f5f5]" />
        </div>

        {/* Transition State Title */}
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-[#f5f5f5] block">
            VERIFIED SECURE TRANSITION
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Connecting to Orion-9
          </h3>
          <p className="text-sm text-white/70 leading-relaxed max-w-md mx-auto">
            {transitionMessage || 'Transitioning to the deployed Orion-9 Operating System...'}
          </p>
        </div>

        {/* Destination Whitelist Verification Badge */}
        <div className="p-4 rounded-xl bg-[#0f1626] border border-white/10 text-left space-y-2.5 font-mono text-xs">
          <div className="flex items-center justify-between text-white/60">
            <span>DESTINATION URL:</span>
            <span className="flex items-center gap-1 text-[#f5f5f5]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>VERIFIED TRUSTED HOST</span>
            </span>
          </div>
          <div className="text-white text-xs break-all bg-black/40 p-2.5 rounded border border-white/5">
            {destinationUrl}
          </div>
        </div>

        {/* Cross-Application Session Notice (Documented Security Architecture) */}
        <div className="p-3.5 rounded-xl bg-[#1d293d]/80 border border-white/10 text-left text-xs text-white/70 space-y-1.5">
          <div className="flex items-center gap-1.5 text-white font-semibold">
            <Lock className="w-3.5 h-3.5 text-[#f5f5f5]" />
            <span>Cross-Application Security Boundary</span>
          </div>
          <p className="text-white/60 leading-relaxed text-[11px]">
            {crossAppStatus.note}
          </p>
        </div>

        {/* Manual Fallback Link */}
        <div className="pt-2">
          <a
            href={destinationUrl}
            className="inline-flex items-center gap-2 text-xs font-mono text-[#f5f5f5] hover:underline"
          >
            <span>Proceed to Orion-9 immediately</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

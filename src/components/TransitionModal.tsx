import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ExternalLink, Loader2, Lock } from 'lucide-react';

export const TransitionModal: React.FC = () => {
  const { isTransitioning, transitionMessage, destinationUrl, crossAppStatus } = useAuth();

  if (!isTransitioning) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-300"
      role="alertdialog"
      aria-live="assertive"
    >
      <div className="relative w-full max-w-lg liquid-glass-elevated border border-[var(--glass-border)] rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 text-center text-[var(--orion-text-primary)]">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0284C7] to-[#38BDF8] mx-auto flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
          <Loader2 className="w-7 h-7 animate-spin text-white" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--orion-accent)] font-bold block">
            VERIFIED DIRECT ROUTE DISPATCH
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--orion-text-primary)]">
            Connecting to Orion-9
          </h3>
          <p className="text-xs sm:text-sm text-[var(--orion-text-secondary)] leading-relaxed max-w-md mx-auto">
            {transitionMessage || 'Transitioning to the deployed Orion-9 Operating System...'}
          </p>
        </div>

        <div className="p-4 rounded-2xl liquid-glass-subtle border border-[var(--glass-border-subtle)] text-left space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between text-[var(--orion-text-muted)] text-[11px]">
            <span>DESTINATION URL:</span>
            <span className="flex items-center gap-1.5 text-[var(--orion-accent)] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>VERIFIED HOST</span>
            </span>
          </div>
          <div className="text-[var(--orion-text-primary)] text-xs break-all liquid-glass-card p-2.5 rounded-xl border border-[var(--glass-border)]">
            {destinationUrl}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl liquid-glass-subtle border border-[var(--glass-border-subtle)] text-left text-xs text-[var(--orion-text-secondary)] space-y-1.5">
          <div className="flex items-center gap-1.5 text-[var(--orion-text-primary)] font-semibold font-mono text-xs">
            <Lock className="w-3.5 h-3.5 text-[var(--orion-accent)]" />
            <span>Cryptographic Boundary Verification</span>
          </div>
          <p className="text-[var(--orion-text-muted)] leading-relaxed text-[11px]">{crossAppStatus.note}</p>
        </div>

        <div className="pt-1">
          <a
            href={destinationUrl}
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[var(--orion-accent)] hover:underline cursor-pointer"
          >
            <span>Proceed to Orion-9 immediately</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};

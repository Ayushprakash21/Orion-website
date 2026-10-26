import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ExternalLink, Loader2, Lock } from 'lucide-react';

export const TransitionModal: React.FC = () => {
  const { isTransitioning, transitionMessage, destinationUrl, crossAppStatus } = useAuth();

  if (!isTransitioning) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101820]/65 backdrop-blur-md animate-in fade-in duration-300"
      role="alertdialog"
      aria-live="assertive"
    >
      <div className="relative w-full max-w-lg bg-white border border-[#D5E1E8] rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 text-center text-[#111827]">
        <div className="w-14 h-14 rounded-2xl bg-[#101820] mx-auto flex items-center justify-center text-white shadow-lg">
          <Loader2 className="w-7 h-7 animate-spin text-[#A8C2D2]" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-[#294D6B] font-bold block">
            VERIFIED DIRECT ROUTE DISPATCH
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">
            Connecting to Orion-9
          </h3>
          <p className="text-sm text-[#566575] leading-relaxed max-w-md mx-auto">
            {transitionMessage || 'Transitioning to the deployed Orion-9 Operating System...'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#F5F9FB] border border-[#D5E1E8] text-left space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between text-[#566575]">
            <span>DESTINATION URL:</span>
            <span className="flex items-center gap-1.5 text-[#294D6B] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>VERIFIED TRUSTED HOST</span>
            </span>
          </div>
          <div className="text-[#111827] text-xs break-all bg-white p-2.5 rounded-xl border border-[#D5E1E8]">
            {destinationUrl}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#EAF4F8] border border-[#D5E1E8] text-left text-xs text-[#566575] space-y-1.5">
          <div className="flex items-center gap-1.5 text-[#111827] font-semibold font-mono text-xs">
            <Lock className="w-3.5 h-3.5 text-[#294D6B]" />
            <span>Cryptographic Boundary Verification</span>
          </div>
          <p className="text-[#566575] leading-relaxed text-[11px]">{crossAppStatus.note}</p>
        </div>

        <div className="pt-1">
          <a
            href={destinationUrl}
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#294D6B] hover:underline cursor-pointer"
          >
            <span>Proceed to Orion-9 immediately</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};

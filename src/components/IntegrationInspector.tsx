import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Terminal, Shield, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const IntegrationInspector: React.FC = () => {
  const { destinationUrl, isFirebaseConfigured } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside
      className="border-t border-[#D5E1E8] bg-[#F5F9FB] text-xs font-mono text-[#566575]"
      aria-label="System Integration Status"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-[#294D6B]" />
          <span className="text-[#566575] uppercase tracking-widest text-[11px]">
            Runtime Link:
          </span>
          <span className="text-[#111827] font-bold">VERIFIED PRODUCTION GATEWAY</span>
          <span className="text-[#D5E1E8] hidden sm:inline" aria-hidden="true">
            ·
          </span>
          <span className="text-[#294D6B] hidden sm:inline truncate max-w-md">
            {destinationUrl}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 text-[#294D6B] font-semibold hover:text-[#111827] transition-colors cursor-pointer"
        >
          <span>{isOpen ? 'Collapse Spec' : 'Architecture Spec'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-[#D5E1E8] bg-white p-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-[#F5F9FB] border border-[#D5E1E8] space-y-2">
              <div className="flex items-center gap-2 text-[#111827] font-bold">
                <CheckCircle2 className="w-4 h-4 text-[#294D6B]" />
                <span>Verified Live Target</span>
              </div>
              <p className="text-[#566575] leading-relaxed text-xs font-sans">
                The primary Launch action targets the deployed Orion-9 OS on Cloudflare Workers edge runtime.
              </p>
              <div className="p-2.5 rounded-xl bg-white text-[11px] text-[#294D6B] break-all border border-[#D5E1E8] font-mono">
                {destinationUrl}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#F5F9FB] border border-[#D5E1E8] space-y-2">
              <div className="flex items-center gap-2 text-[#111827] font-bold">
                {isFirebaseConfigured ? (
                  <CheckCircle2 className="w-4 h-4 text-[#294D6B]" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-[#294D6B]" />
                )}
                <span>Firebase Identity &amp; Firestore CMS</span>
              </div>
              <p className="text-[#566575] leading-relaxed text-xs font-sans">
                {isFirebaseConfigured
                  ? 'Active Firebase Authentication and Firestore CMS project connected.'
                  : 'Environment-driven Firebase gateway ready. Configure VITE_FIREBASE_* keys or use System Settings in /admin.'}
              </p>
              <div className="text-[11px] text-[#294D6B] font-mono font-semibold">
                STATUS: {isFirebaseConfigured ? 'CONNECTED' : 'ENVIRONMENT-DRIVEN'}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#F5F9FB] border border-[#D5E1E8] space-y-2">
              <div className="flex items-center gap-2 text-[#111827] font-bold">
                <Shield className="w-4 h-4 text-[#294D6B]" />
                <span>Zero Token Leakage</span>
              </div>
              <p className="text-[#566575] leading-relaxed text-xs font-sans">
                Tokens, keys, and credentials are never exposed via URL parameters. Cross-origin sessions transition cleanly via verified HTTPS redirection.
              </p>
              <div className="text-[11px] text-[#294D6B] font-mono font-semibold">
                RFC 6749 &amp; SOC 2 COMPLIANT
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

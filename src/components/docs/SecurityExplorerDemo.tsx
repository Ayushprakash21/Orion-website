import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  Key,
  FileCheck,
  AlertOctagon,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

interface SecurityLayer {
  id: string;
  number: string;
  title: string;
  mechanism: string;
  ruleCode: string;
  attackMitigation: string;
  evidenceDoc: string;
}

const SECURITY_LAYERS: SecurityLayer[] = [
  {
    id: 'auth-authority',
    number: '01',
    title: 'Single Authentication Authority',
    mechanism: 'Firebase Authentication SDK with enforced server-side JWT verification.',
    ruleCode: 'await auth.verifyIdToken(token, checkRevoked = true);',
    attackMitigation: 'Eliminates client-side credential comparisons and credential-stuffing bypasses.',
    evidenceDoc: 'ORION-9-LOGIN-AUTHENTICATION-CERTIFICATION.md',
  },
  {
    id: 'tenant-isolation',
    number: '02',
    title: 'Cryptographic Tenant Isolation',
    mechanism: 'Every Firestore document and query is bound to the validated request token tenantId.',
    ruleCode: 'allow read, write: if request.auth.token.tenantId == resource.data.tenantId;',
    attackMitigation: 'Prevents BOLA / IDOR attacks and cross-tenant data exfiltration.',
    evidenceDoc: 'ORION-9-DATABASE-SECURITY-MATRIX.md',
  },
  {
    id: 'fail-closed-kernel',
    number: '03',
    title: 'Fail-Closed Command Execution',
    mechanism: 'All mutations dispatch via KernelCommandBus. If authorization fails, execution aborts immediately.',
    ruleCode: 'if (!roleCanExecute(actor.role, command.type)) throw new UnauthorizedCommandError();',
    attackMitigation: 'Zero privilege escalation; unauthorized actions never reach backend database layers.',
    evidenceDoc: 'ORION-9-KERNEL.md',
  },
  {
    id: 'immutable-audit',
    number: '04',
    title: 'Immutable Audit Ledger',
    mechanism: 'Append-only audit collection with correlationId and causationId tracking.',
    ruleCode: 'match /audit_logs/{id} { allow create: if isKernelServer(); allow update, delete: if false; }',
    attackMitigation: 'Guarantees unalterable non-repudiation for compliance (SOX, SOC 2, ISO 27001).',
    evidenceDoc: 'ORION9_SECURITY_AND_RELEASE_READINESS.md',
  },
];

export const SecurityExplorerDemo: React.FC<{ onNavigate?: (path: string) => void }> = ({
  onNavigate,
}) => {
  const [activeLayerIndex, setActiveLayerIndex] = useState<number>(0);

  const activeLayer = SECURITY_LAYERS[activeLayerIndex];

  return (
    <div className="w-full my-8 rounded-2xl liquid-glass-elevated border border-[var(--glass-border)] shadow-xl overflow-hidden">
      {/* Simulation Disclaimer Bar */}
      <div className="px-5 py-2 bg-amber-500/10 border-b border-amber-500/20 text-[11px] text-amber-800 font-sans flex items-center justify-between">
        <span className="font-semibold tracking-wide">
          SECURITY ARCHITECTURE SPECIFICATION &middot; READ-ONLY REFERENCE
        </span>
        <span className="text-[10px] text-amber-700/80">Fail-Closed Verification Engine</span>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 border-b border-[var(--glass-border-subtle)] bg-[var(--glass-surface-subtle)]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/50 shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50 shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/50 shadow-sm" />
          </div>
          <div>
            <span className="text-xs font-semibold text-[var(--orion-text-primary)]">
              Defense-in-Depth Security Layers
            </span>
            <span className="text-xs text-[var(--orion-text-muted)] ml-2">
              Multi-Tenant Zero-Trust Model
            </span>
          </div>
        </div>

        {/* Layer Selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--orion-surface)] border border-[var(--glass-border-subtle)] shadow-xs">
          {SECURITY_LAYERS.map((layer, i) => (
            <button
              key={layer.id}
              type="button"
              onClick={() => setActiveLayerIndex(i)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeLayerIndex === i
                  ? 'bg-[#070B19] text-white shadow-sm'
                  : 'text-[var(--orion-text-secondary)] hover:text-[var(--orion-text-primary)] hover:bg-[var(--glass-surface-subtle)]'
              }`}
            >
              <span className="font-mono text-[11px] opacity-75">{layer.number}</span>
              <span className="hidden sm:inline">{layer.title.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Layer Content */}
      <div className="p-5 sm:p-6 space-y-4 bg-gradient-to-b from-transparent to-[var(--orion-alt-bg)]/30">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeLayer.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 tracking-wider uppercase mb-2">
                SECURITY PILLAR {activeLayer.number} / 04
              </span>
              <h3 className="text-base sm:text-lg font-editorial font-bold text-[var(--orion-text-primary)]">
                {activeLayer.title}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--orion-text-secondary)] mt-1 leading-relaxed font-sans">
                {activeLayer.mechanism}
              </p>
            </div>

            {/* Code Specification Box */}
            <div className="p-4 rounded-xl border border-[var(--glass-border)] bg-[#070B19] text-slate-100 font-mono text-xs space-y-2 shadow-inner">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Enforcement Invariant
              </span>
              <code className="text-emerald-400 block overflow-x-auto py-1">
                {activeLayer.ruleCode}
              </code>
            </div>

            {/* Mitigation & Evidence Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-xl border border-[var(--glass-border-subtle)] bg-[var(--orion-surface)] shadow-xs">
                <span className="text-[10px] font-bold text-[var(--orion-text-muted)] uppercase tracking-wider block mb-1">
                  Threat Mitigation
                </span>
                <p className="text-[var(--orion-text-secondary)] leading-relaxed font-sans">
                  {activeLayer.attackMitigation}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[var(--glass-border-subtle)] bg-[var(--orion-surface)] shadow-xs">
                <span className="text-[10px] font-bold text-[#0284C7] uppercase tracking-wider block mb-1">
                  Audit Certification
                </span>
                <p className="text-[var(--orion-text-secondary)] leading-relaxed font-sans">
                  Validated in <code className="text-[#0284C7] font-semibold">{activeLayer.evidenceDoc}</code>
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-[var(--glass-border-subtle)] bg-[var(--glass-surface-subtle)] flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-[var(--orion-text-muted)] font-mono text-[11px]">
          Security Test Suite: <code className="text-emerald-700 font-semibold">scripts/runSecurityTests.mjs</code> (100% Pass)
        </span>
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('/docs/security/access-control')}
          className="text-[#0284C7] hover:underline font-medium transition flex items-center gap-1 cursor-pointer"
        >
          <span>Access Control Security Manual</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

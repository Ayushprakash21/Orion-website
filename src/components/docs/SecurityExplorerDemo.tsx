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
  Server,
  Layers,
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
    <div className="w-full my-8 rounded-2xl border border-slate-800 bg-[#070B19]/90 backdrop-blur-xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-semibold tracking-wider text-emerald-400 uppercase">
            Defense-in-Depth Security Explorer
          </span>
          <span className="text-xs text-slate-400">· Fail-Closed Architecture</span>
        </div>

        {/* Layer Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/70 border border-slate-800">
          {SECURITY_LAYERS.map((layer, i) => (
            <button
              key={layer.id}
              type="button"
              onClick={() => setActiveLayerIndex(i)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeLayerIndex === i
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{layer.number}</span>
              <span className="hidden sm:inline">{layer.title.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Layer Content */}
      <div className="p-5 sm:p-6 bg-[#030712]/90 space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeLayer.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-wider uppercase">
                SECURITY PILLAR {activeLayer.number} / 04
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                {activeLayer.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed font-sans">
                {activeLayer.mechanism}
              </p>
            </div>

            {/* Code Specification Box */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 font-mono text-xs space-y-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Enforcement Invariant
              </span>
              <code className="text-emerald-400 block overflow-x-auto py-1">
                {activeLayer.ruleCode}
              </code>
            </div>

            {/* Mitigation & Evidence Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Threat Mitigation
                </span>
                <p className="text-slate-300 leading-relaxed font-sans">
                  {activeLayer.attackMitigation}
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                  Audit Certification
                </span>
                <p className="text-slate-300 leading-relaxed font-sans">
                  Validated in <code className="text-cyan-400">{activeLayer.evidenceDoc}</code>
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-slate-800/80 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <span className="text-slate-400">
          Security Test Suite: <code className="text-emerald-400">scripts/runSecurityTests.mjs</code> (100% Pass)
        </span>
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('/docs/security/access-control')}
          className="text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1 cursor-pointer"
        >
          <span>Access Control Security Manual</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

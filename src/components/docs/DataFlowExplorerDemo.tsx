import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Database,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Layers,
  Sparkles,
  Bot,
  ExternalLink,
  Cpu,
} from 'lucide-react';

interface PipelineNode {
  id: string;
  step: string;
  title: string;
  subtitle: string;
  input: string;
  processing: string;
  output: string;
  subsystem: string;
  failureMode: string;
  articlePath: string;
}

const PIPELINE_NODES: PipelineNode[] = [
  {
    id: 'ingestion',
    step: '01',
    title: 'Ingestion & Connectors',
    subtitle: 'EDI, SAP RFC, REST & SFTP',
    input: 'Raw EDI 850/856/810, SAP IDoc XML, partner REST JSON, CSV files.',
    processing: 'TLS termination, signature verification, rate-limiting, raw payload archiving.',
    output: 'Validated raw payload envelope with source timestamps.',
    subsystem: 'src/integration/IntegrationFabric.ts & server.ts',
    failureMode: 'Rejected at edge with 401 Unauthorized or 429 Too Many Requests.',
    articlePath: '/docs/applications/integrations',
  },
  {
    id: 'validation',
    step: '02',
    title: 'Validation & Quality Guard',
    subtitle: 'Referential Integrity Checks',
    input: 'Raw payload envelope.',
    processing: 'Schema validation, HS code check, duplicate invoice detection, partner ID lookup.',
    output: 'Verified clean payload or exception quarantine envelope.',
    subsystem: 'src/scm/canonical/ScmReferentialIntegrityEngine.ts',
    failureMode: 'Quarantined in Dead-Letter Queue (integration_dlq) with error telemetry.',
    articlePath: '/docs/applications/data-quality',
  },
  {
    id: 'canonical',
    step: '03',
    title: 'Canonical Mapping',
    subtitle: 'Unified Supply Chain Schema',
    input: 'Verified external proprietary format payload.',
    processing: 'Transforms partner-specific formats into standardized internal TypeScript interfaces.',
    output: 'Canonical ScmPurchaseOrder, ScmShipment, or ScmInventoryItem entity.',
    subsystem: 'src/scm/canonical/ScmCanonicalRegistry.ts',
    failureMode: 'Emits CANONICAL_MAPPING_ERROR event and notifies administrator.',
    articlePath: '/docs/architecture/integration-fabric',
  },
  {
    id: 'persistence',
    step: '04',
    title: 'Dual-Tier Persistence',
    subtitle: 'Firestore ACID + IndexedDB',
    input: 'Canonical entity transaction.',
    processing: 'Fail-closed authorization, tenant assertion, ACID Firestore transaction, local cache write.',
    output: 'Persisted Firestore document and synchronized IndexedDB local record.',
    subsystem: 'src/core/database/FirestoreAuthority.ts',
    failureMode: 'Transaction aborts on constraint violation; local mutations buffer in outbox.',
    articlePath: '/docs/architecture/persistence',
  },
  {
    id: 'event-fabric',
    step: '05',
    title: 'Event Fabric & Audit',
    subtitle: 'Immutable Causation Trails',
    input: 'Committed state change transaction.',
    processing: 'Generates correlationId and causationId; records immutable audit trace in audit_logs.',
    output: 'Published event broadcast to reactive listeners and compliance log.',
    subsystem: 'src/kernel/KernelCommandBus.ts & EventFabric.ts',
    failureMode: 'Fail-closed: If audit write fails, transaction is marked UNVERIFIED.',
    articlePath: '/docs/architecture/event-flow',
  },
  {
    id: 'control-tower',
    step: '06',
    title: 'Control Tower & Telemetry',
    subtitle: 'Real-Time Operational Cockpit',
    input: 'Published event stream and corridor telemetry.',
    processing: 'Calculates OTIF, Available-to-Promise (ATP), corridor transit ETA, and bottleneck severity.',
    output: 'Real-time GIS map updates, Dynamic Island alerts, executive KPI bar.',
    subsystem: 'src/components/Dashboard.tsx & ScmBusinessRuleEngine.ts',
    failureMode: 'Displays amber latency indicator if Firestore stream drops > 5000ms.',
    articlePath: '/docs/applications/control-tower',
  },
  {
    id: 'copilot-action',
    step: '07',
    title: 'Governed AI & Action Center',
    subtitle: 'Human-in-the-Loop Resolution',
    input: 'Detected disruption (e.g. port strike, stockout risk).',
    processing: 'Evaluates alternate routing, checks policy bounds, drafts PO or bypass manifest.',
    output: 'Governed operational action (Executed autonomously or dispatched to Approval Queue).',
    subsystem: 'src/ai/OrionAIGateway.ts & src/components/ApprovalCenter.tsx',
    failureMode: 'Actions outside pre-set policy require two-party human approval before execution.',
    articlePath: '/docs/applications/copilot',
  },
];

export const DataFlowExplorerDemo: React.FC<{ onNavigate?: (path: string) => void }> = ({
  onNavigate,
}) => {
  const [activeNodeIndex, setActiveNodeIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const prefersReduced = useReducedMotion();

  const nextNode = useCallback(() => {
    setActiveNodeIndex((prev) => (prev + 1) % PIPELINE_NODES.length);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      if (!document.hidden) {
        nextNode();
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [isPlaying, nextNode]);

  const activeNode = PIPELINE_NODES[activeNodeIndex];

  return (
    <div className="w-full my-8 rounded-2xl border border-slate-800 bg-[#070B19]/90 backdrop-blur-xl shadow-2xl overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-mono font-semibold tracking-wider text-cyan-400 uppercase">
            Supply Chain Data Pipeline Architecture
          </span>
          <span className="text-xs text-slate-400">· Node {activeNode.step} of 07</span>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer text-xs flex items-center gap-1.5"
            aria-label={isPlaying ? 'Pause Animation' : 'Auto Play'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            <span className="font-mono text-[11px]">{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveNodeIndex(0)}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            title="Reset Pipeline"
            aria-label="Reset Pipeline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Horizontal Pipeline Visualizer */}
      <div className="p-5 sm:p-6 overflow-x-auto scrollbar-none border-b border-slate-800 bg-[#030712]/70">
        <div className="flex items-center justify-between gap-2 min-w-[700px]">
          {PIPELINE_NODES.map((node, i) => {
            const isCurrent = i === activeNodeIndex;
            const isPassed = i < activeNodeIndex;
            return (
              <React.Fragment key={node.id}>
                {/* Node Pill */}
                <button
                  type="button"
                  onClick={() => setActiveNodeIndex(i)}
                  className={`flex flex-col items-center p-2.5 rounded-xl border transition-all cursor-pointer text-center min-w-[95px] ${
                    isCurrent
                      ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_16px_rgba(34,211,238,0.25)] scale-105'
                      : isPassed
                      ? 'border-slate-700 bg-slate-900/60 text-slate-300'
                      : 'border-slate-800 bg-slate-950/40 text-slate-500 hover:border-slate-700'
                  }`}
                >
                  <span
                    className={`font-mono text-[10px] font-bold ${
                      isCurrent ? 'text-cyan-400' : isPassed ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    STAGE {node.step}
                  </span>
                  <span
                    className={`text-xs font-semibold mt-1 leading-tight ${
                      isCurrent ? 'text-white' : 'text-slate-300'
                    }`}
                  >
                    {node.title.split(' ')[0]}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 mt-0.5 line-clamp-1">
                    {node.subtitle.split(' ')[0]}
                  </span>
                </button>

                {/* Connecting Animated Pipeline Link */}
                {i < PIPELINE_NODES.length - 1 && (
                  <div className="flex-1 h-0.5 bg-slate-800 relative mx-1">
                    {isCurrent && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-sky-300 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                        initial={{ scaleX: 0, originX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
                      />
                    )}
                    {isPassed && <div className="absolute inset-0 bg-cyan-600/60" />}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Active Stage Inspection Card */}
      <div className="p-5 sm:p-6 bg-slate-950/60">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeNode.id}
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
                  STAGE {activeNode.step} · ARCHITECTURAL INSPECTOR
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                  {activeNode.title} — {activeNode.subtitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate(activeNode.articlePath)}
                className="px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-mono text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
              >
                <span>Read Architecture Docs</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Grid of Telemetry Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 font-mono text-xs">
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  1. Ingress Payload
                </span>
                <p className="text-slate-300 leading-relaxed font-sans">{activeNode.input}</p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                  2. Subsystem Processing
                </span>
                <p className="text-slate-300 leading-relaxed font-sans">{activeNode.processing}</p>
                <span className="text-[10px] text-cyan-400/80 mt-2 block truncate">
                  Impl: {activeNode.subsystem}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 sm:col-span-2 lg:col-span-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  3. Failure & Quarantine
                </span>
                <p className="text-slate-300 leading-relaxed font-sans">{activeNode.failureMode}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

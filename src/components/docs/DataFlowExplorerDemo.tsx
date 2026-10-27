import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  ExternalLink,
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
    subtitle: 'Unified SCM Schema Transform',
    input: 'Clean source payloads.',
    processing: 'Field transformation into unified PurchaseOrder, Shipment, InventoryUnit models.',
    output: 'Strictly typed canonical SCM entities ready for graph ingestion.',
    subsystem: 'src/scm/canonical/ScmCanonicalSchemaMapper.ts',
    failureMode: 'Unmapped custom fields preserved in rawJson extension bag without data loss.',
    articlePath: '/docs/architecture/integration-fabric',
  },
  {
    id: 'graph',
    step: '04',
    title: 'Supply Chain Knowledge Graph',
    subtitle: 'Bi-Directional Multi-Echelon Graph',
    input: 'Canonical entities.',
    processing: 'Topology updates, PO-to-shipment edge linking, Tier-1 to Tier-N BOM expansion.',
    output: 'Real-time bipartite dependency graph in memory.',
    subsystem: 'src/scm/graph/SupplyChainGraphResolutionEngine.ts',
    failureMode: 'Graph reconciliation alarms triggered if cyclical shipment dependencies occur.',
    articlePath: '/docs/architecture/system-overview',
  },
  {
    id: 'engines',
    step: '05',
    title: 'Deterministic SCM Calculation',
    subtitle: 'Safety Stock, EOQ & Landed Cost',
    input: 'Active graph state & demand telemetry.',
    processing: 'Continuous deterministic evaluation: Kingman formula, Silver-Meal, dynamic safety buffers.',
    output: 'Recommended orders, reorder point alerts, and inventory stockout warnings.',
    subsystem: 'src/scm/engines/SafetyStockDynamicBufferEngine.ts',
    failureMode: 'Fallback to deterministic base formulas if live AIS/telemetry stream drops.',
    articlePath: '/docs/applications/inventory',
  },
  {
    id: 'copilot',
    step: '06',
    title: 'AI Copilot Orchestration',
    subtitle: 'Governed Tool Call Execution',
    input: 'Engine alerts, user natural-language queries, disruption events.',
    processing: 'Tool selection via Gemini API, pre-execution human confirmation, policy validation.',
    output: 'Autonomous route bypass proposals, purchase order drafts, warehouse expedites.',
    subsystem: 'src/copilot/CopilotOrchestrationAgent.ts',
    failureMode: 'Strict human-in-the-loop requirement: high-value actions reject autonomous execution.',
    articlePath: '/docs/applications/copilot',
  },
  {
    id: 'persistence',
    step: '07',
    title: 'Cloud Firestore Persistence',
    subtitle: 'Fail-Closed Security Rules Sync',
    input: 'Validated mutations, operational events, audit logs.',
    processing: 'Multi-tenant document write, transactional batch commits, immutable audit logging.',
    output: 'Synchronized live state across all connected desktop and web clients.',
    subsystem: 'firestore.rules & src/services/firebase.ts',
    failureMode: 'Fail-closed: unauthenticated or invalid writes rejected at Firestore engine level.',
    articlePath: '/docs/security/firestore-security-rules',
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
    <div className="w-full my-8 rounded-3xl liquid-glass-elevated border border-[var(--glass-border)] shadow-xl overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-[var(--glass-border-subtle)] bg-white/40 dark:bg-black/20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 mr-1 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--orion-text-primary)] font-sans">
              Supply Chain Data Pipeline Architecture
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#0284C7]/10 text-[#0284C7] border border-[#0284C7]/20 uppercase">
              Architecture Inspector
            </span>
          </div>
          <span className="text-xs text-[var(--orion-text-muted)] font-mono">· Node {activeNode.step} of 07</span>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1.5 rounded-xl border border-[var(--glass-border-subtle)] bg-white/70 dark:bg-white/5 hover:bg-white text-[var(--orion-text-primary)] transition cursor-pointer text-xs flex items-center gap-1.5 shadow-2xs font-sans font-semibold"
            aria-label={isPlaying ? 'Pause Animation' : 'Auto Play'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-500" /> : <Play className="w-3.5 h-3.5 text-emerald-500" />}
            <span className="text-xs font-sans">{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveNodeIndex(0)}
            className="p-1.5 rounded-xl border border-[var(--glass-border-subtle)] bg-white/70 dark:bg-white/5 hover:bg-white text-[var(--orion-text-muted)] hover:text-[var(--orion-text-primary)] transition cursor-pointer shadow-2xs"
            title="Reset Pipeline"
            aria-label="Reset Pipeline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Horizontal Pipeline Visualizer */}
      <div className="p-6 overflow-x-auto scrollbar-none border-b border-[var(--glass-border-subtle)] bg-white/30 dark:bg-black/30">
        <div className="flex items-center justify-between gap-3 min-w-[700px]">
          {PIPELINE_NODES.map((node, i) => {
            const isCurrent = i === activeNodeIndex;
            const isPassed = i < activeNodeIndex;
            return (
              <React.Fragment key={node.id}>
                {/* Node Pill */}
                <button
                  type="button"
                  onClick={() => setActiveNodeIndex(i)}
                  className={`flex flex-col items-center p-3 rounded-2xl border transition-all cursor-pointer text-center min-w-[105px] ${
                    isCurrent
                      ? 'border-[#0284C7] bg-[#0284C7]/10 shadow-md scale-105'
                      : isPassed
                      ? 'border-[var(--glass-border-subtle)] bg-white/70 dark:bg-white/5 text-[var(--orion-text-primary)]'
                      : 'border-[var(--glass-border-subtle)] bg-white/40 dark:bg-white/5 text-[var(--orion-text-muted)] hover:border-[#0284C7]/50'
                  }`}
                >
                  <span
                    className={`font-mono text-[10px] font-bold ${
                      isCurrent ? 'text-[#0284C7]' : isPassed ? 'text-[var(--orion-text-secondary)]' : 'text-[var(--orion-text-muted)]'
                    }`}
                  >
                    STAGE {node.step}
                  </span>
                  <span
                    className={`text-xs font-bold mt-1 leading-tight font-sans ${
                      isCurrent ? 'text-[var(--orion-text-primary)]' : 'text-[var(--orion-text-secondary)]'
                    }`}
                  >
                    {node.title.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-[var(--orion-text-muted)] mt-0.5 line-clamp-1 font-sans">
                    {node.subtitle.split(' ')[0]}
                  </span>
                </button>

                {/* Connecting Animated Pipeline Link */}
                {i < PIPELINE_NODES.length - 1 && (
                  <div className="flex-1 h-0.5 bg-[var(--glass-border-subtle)] relative mx-1">
                    {isCurrent && (
                      <motion.div
                        className="absolute inset-0 bg-[#0284C7] shadow-[0_0_8px_rgba(2,132,199,0.8)]"
                        initial={{ scaleX: 0, originX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
                      />
                    )}
                    {isPassed && <div className="absolute inset-0 bg-[#0284C7]/50" />}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Active Stage Inspection Card */}
      <div className="p-6 sm:p-8 bg-white/40 dark:bg-black/20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeNode.id}
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-[var(--orion-accent)] uppercase">
                  STAGE {activeNode.step} · ARCHITECTURAL INSPECTOR
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[var(--orion-text-primary)] mt-0.5 font-sans">
                  {activeNode.title} — {activeNode.subtitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate(activeNode.articlePath)}
                className="px-4 py-2 rounded-xl border border-[var(--glass-border-subtle)] bg-white/70 dark:bg-white/5 hover:bg-white text-[var(--orion-text-primary)] hover:border-[var(--orion-accent)] font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs font-sans"
              >
                <span>Read Architecture Docs</span>
                <ExternalLink className="w-3.5 h-3.5 text-[var(--orion-accent)]" />
              </button>
            </div>

            {/* Grid of Telemetry Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-sans">
              <div className="p-4 rounded-2xl liquid-glass border border-[var(--glass-border-subtle)] space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-[var(--orion-text-muted)] uppercase tracking-wider block">
                  1. Ingress Payload
                </span>
                <p className="text-[var(--orion-text-secondary)] leading-relaxed font-sans">{activeNode.input}</p>
              </div>

              <div className="p-4 rounded-2xl liquid-glass border border-[var(--glass-border-subtle)] space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-[var(--orion-accent)] uppercase tracking-wider block">
                  2. Subsystem Processing
                </span>
                <p className="text-[var(--orion-text-secondary)] leading-relaxed font-sans">{activeNode.processing}</p>
                <span className="text-[10px] font-mono text-[var(--orion-text-muted)] mt-2 block truncate">
                  Impl: {activeNode.subsystem}
                </span>
              </div>

              <div className="p-4 rounded-2xl liquid-glass border border-[var(--glass-border-subtle)] space-y-1.5 sm:col-span-2 lg:col-span-1">
                <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-wider block flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  3. Failure & Quarantine
                </span>
                <p className="text-[var(--orion-text-secondary)] leading-relaxed font-sans">{activeNode.failureMode}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

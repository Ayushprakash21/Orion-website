import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  User,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Code2,
} from 'lucide-react';

interface CopilotPreset {
  id: string;
  label: string;
  prompt: string;
  intent: string;
  toolCall: string;
  dataLookup: string;
  response: string;
  approvalRequired: boolean;
}

const COPILOT_PRESETS: CopilotPreset[] = [
  {
    id: 'inventory-check',
    label: 'Inventory & ATP Query',
    prompt: 'Check Available-to-Promise for SKU-7740 (Lithium-Ion Battery Cells) at Berlin Plant.',
    intent: 'QUERY_INVENTORY_ATP',
    toolCall: 'AvailableToPromiseEngine.calculateATP("SKU-7740", "PLANT-BERLIN")',
    dataLookup: 'OnHand: 12,400 | Reserved: 4,100 | Inbound PO: 2,000 | SafetyStock: 1,500',
    response:
      'Current Available-to-Promise for SKU-7740 at Berlin is **8,800 units** (Formula: 12,400 On-Hand - 4,100 Reserved + 2,000 Inbound - 1,500 Safety Stock). The next scheduled replenishment (PO-9412) arrives on Oct 29.',
    approvalRequired: false,
  },
  {
    id: 'reroute-disruption',
    label: 'Disruption Reroute Proposal',
    prompt: 'Rotterdam port strike has delayed Container SHP-9024 by 48 hours. What is our best bypass?',
    intent: 'DISRUPTION_BYPASS_ANALYSIS',
    toolCall: 'NetworkDesignEngine.evaluateBypassRoutes("SHP-9024", { delayHours: 48 })',
    dataLookup: 'Analyzed 3 Corridors: Antwerp Rail (+$14K, 8h), Hamburg Barge (+$6K, 28h), Air Bypass (+$82K, 4h)',
    response:
      'I recommend routing via Antwerp Rail Intermodal Hub. Expected arrival is delayed by only 8 hours (vs 48 hours), avoiding three manufacturing line stoppages. Total incremental freight cost is $14,200.',
    approvalRequired: true,
  },
  {
    id: 'draft-po',
    label: 'Requisition Proposal',
    prompt: 'Draft an expedited Purchase Order for 500 microcontrollers from Tier-1 Supplier Murata.',
    intent: 'DRAFT_PURCHASE_ORDER',
    toolCall: 'KernelCommandBus.dispatch({ type: "DRAFT_PO", supplierId: "SUP-MURATA", quantity: 500 })',
    dataLookup: 'Supplier Capacity: 94% Nominal | Unit Cost: $18.40 | Estimated Lead Time: 3 Days',
    response:
      'I have drafted Purchase Order **PO-9842** for 500 microcontrollers ($9,200 USD). This requisition has been staged in the **Approval Center** and awaits supervisor authorization before transmission.',
    approvalRequired: true,
  },
];

export const CopilotInteractionDemo: React.FC<{ onNavigate?: (path: string) => void }> = ({
  onNavigate,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('inventory-check');
  const [demoState, setDemoState] = useState<'idle' | 'interpreting' | 'querying' | 'complete'>('complete');

  const preset = COPILOT_PRESETS.find((p) => p.id === selectedPresetId) || COPILOT_PRESETS[0];

  const handleSelectPreset = (id: string) => {
    setSelectedPresetId(id);
    setDemoState('interpreting');
    setTimeout(() => {
      setDemoState('querying');
      setTimeout(() => {
        setDemoState('complete');
      }, 700);
    }, 600);
  };

  return (
    <div className="w-full my-8 rounded-2xl border border-slate-800 bg-[#070B19]/90 backdrop-blur-xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-mono font-semibold tracking-wider text-cyan-400 uppercase">
            Governed AI Copilot Workflow Simulator
          </span>
          <span className="text-xs text-slate-400">· Zero Hallucination Pipeline</span>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/70 border border-slate-800">
          {COPILOT_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPreset(p.id)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition cursor-pointer ${
                selectedPresetId === p.id
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Chat Window */}
      <div className="p-5 sm:p-6 bg-[#030712]/90 space-y-4">
        {/* User Prompt Bubble */}
        <div className="flex items-start gap-3 max-w-2xl">
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-300">
            <User className="w-4 h-4" />
          </div>
          <div className="p-3.5 rounded-2xl rounded-tl-sm bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-200">
            {preset.prompt}
          </div>
        </div>

        {/* AI Copilot Response & Governed Steps */}
        <div className="flex items-start gap-3 max-w-3xl">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400">
            <Bot className="w-4 h-4" />
          </div>
          <div className="flex-1 space-y-3">
            {/* Step Telemetry Tray */}
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/70 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-[11px] border-b border-slate-800/80 pb-1.5">
                <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Intent: {preset.intent}
                </span>
                <span className="text-emerald-400">Auth Gate: PASS (AI_AGENT)</span>
              </div>

              <div className="text-slate-300">
                <span className="text-slate-500">Tool Execution: </span>
                <code className="text-sky-300">{preset.toolCall}</code>
              </div>

              <div className="text-slate-400 text-[11px]">
                <span className="text-slate-500">Authoritative Data: </span>
                <span>{preset.dataLookup}</span>
              </div>
            </div>

            {/* Synthesized Response */}
            <div className="p-4 rounded-2xl rounded-tl-sm bg-cyan-950/20 border border-cyan-500/20 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
              <p>{preset.response}</p>
            </div>

            {/* Approval Gate Pill if Mutation Involved */}
            {preset.approvalRequired && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg border border-amber-500/30 bg-amber-950/20 text-xs text-amber-300 font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  <strong>Governance Policy:</strong> Consequential mutations require Human Authorization in the Approval Center before execution.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer link */}
      <div className="px-5 py-3.5 border-t border-slate-800/80 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <span className="text-slate-400">
          Source: <code className="text-cyan-400">src/components/AICopilot.tsx</code> & <code className="text-sky-300">src/ai/OrionAIGateway.ts</code>
        </span>
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('/docs/applications/copilot')}
          className="text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1 cursor-pointer"
        >
          <span>Copilot Architecture Manual</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

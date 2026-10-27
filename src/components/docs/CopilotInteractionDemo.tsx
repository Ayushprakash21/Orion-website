import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  User,
  Sparkles,
  AlertTriangle,
  ExternalLink,
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
      'Current Available-to-Promise for SKU-7740 at Berlin is 8,800 units (Formula: 12,400 On-Hand - 4,100 Reserved + 2,000 Inbound - 1,500 Safety Stock). The next scheduled replenishment (PO-9412) arrives on Oct 29.',
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
      'I have drafted Purchase Order PO-9842 for 500 microcontrollers ($9,200 USD). This requisition has been staged in the Approval Center and awaits supervisor authorization before transmission.',
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
      }, 500);
    }, 400);
  };

  return (
    <div className="w-full my-8 rounded-2xl liquid-glass-elevated border border-[var(--glass-border)] shadow-xl overflow-hidden">
      {/* Simulation Disclaimer Bar */}
      <div className="px-5 py-2 bg-amber-500/10 border-b border-amber-500/20 text-[11px] text-amber-800 font-sans flex items-center justify-between">
        <span className="font-semibold tracking-wide">
          INTERACTIVE DEMONSTRATION &middot; SIMULATION ONLY
        </span>
        <span className="text-[10px] text-amber-700/80">Governed AI Pipeline Preview</span>
      </div>

      {/* Window Titlebar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 border-b border-[var(--glass-border-subtle)] bg-[var(--glass-surface-subtle)]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/50 shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50 shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/50 shadow-sm" />
          </div>
          <div>
            <span className="text-xs font-semibold text-[var(--orion-text-primary)]">
              Governed AI Copilot
            </span>
            <span className="text-xs text-[var(--orion-text-muted)] ml-2">
              Deterministic Tool Bus Execution
            </span>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--orion-surface)] border border-[var(--glass-border-subtle)] shadow-xs">
          {COPILOT_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPreset(p.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                selectedPresetId === p.id
                  ? 'bg-[#070B19] text-white shadow-sm'
                  : 'text-[var(--orion-text-secondary)] hover:text-[var(--orion-text-primary)] hover:bg-[var(--glass-surface-subtle)]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Chat Window */}
      <div className="p-5 sm:p-6 space-y-4 bg-gradient-to-b from-transparent to-[var(--orion-alt-bg)]/30">
        {/* User Prompt Bubble */}
        <div className="flex items-start gap-3 max-w-2xl">
          <div className="w-8 h-8 rounded-xl bg-[var(--orion-surface)] border border-[var(--glass-border)] shadow-sm flex items-center justify-center shrink-0 text-[var(--orion-text-secondary)]">
            <User className="w-4 h-4" />
          </div>
          <div className="p-3.5 rounded-2xl rounded-tl-sm bg-[var(--orion-surface)] border border-[var(--glass-border-subtle)] shadow-sm text-xs sm:text-sm text-[var(--orion-text-primary)]">
            {preset.prompt}
          </div>
        </div>

        {/* AI Copilot Response & Governed Steps */}
        <div className="flex items-start gap-3 max-w-3xl">
          <div className="w-8 h-8 rounded-xl bg-[#0284C7]/10 border border-[#0284C7]/20 flex items-center justify-center shrink-0 text-[#0284C7] shadow-sm">
            <Bot className="w-4 h-4" />
          </div>
          <div className="flex-1 space-y-3">
            {/* Step Telemetry Tray */}
            <div className="p-3.5 rounded-xl border border-[var(--glass-border-subtle)] bg-[var(--orion-surface)] shadow-xs text-xs space-y-2">
              <div className="flex items-center justify-between text-[11px] border-b border-[var(--glass-border-subtle)] pb-2 font-mono">
                <span className="text-[#0284C7] font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Intent: {preset.intent}
                </span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Auth Gate: PASS (AI_AGENT)
                </span>
              </div>

              <div className="text-[var(--orion-text-secondary)] font-mono text-[11px]">
                <span className="text-[var(--orion-text-muted)]">Tool Execution: </span>
                <code className="text-[#0284C7] font-semibold">{preset.toolCall}</code>
              </div>

              <div className="text-[var(--orion-text-secondary)] font-mono text-[11px]">
                <span className="text-[var(--orion-text-muted)]">Authoritative Data: </span>
                <span>{preset.dataLookup}</span>
              </div>
            </div>

            {/* Synthesized Response */}
            <div className="p-4 rounded-2xl rounded-tl-sm bg-[var(--orion-surface)] border border-[var(--glass-border)] shadow-sm text-xs sm:text-sm text-[var(--orion-text-primary)] leading-relaxed font-sans">
              <p>{preset.response}</p>
            </div>

            {/* Approval Gate Pill if Mutation Involved */}
            {preset.approvalRequired && (
              <div className="flex items-center gap-2 p-3 rounded-xl border border-amber-300 bg-amber-50/90 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  <strong>Governance Policy:</strong> Consequential mutations require Human Authorization in the Approval Center before execution.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer link */}
      <div className="px-5 py-3 border-t border-[var(--glass-border-subtle)] bg-[var(--glass-surface-subtle)] flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-[var(--orion-text-muted)] font-mono text-[11px]">
          Source: <code className="text-[var(--orion-text-primary)]">src/components/AICopilot.tsx</code>
        </span>
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('/docs/applications/copilot')}
          className="text-[#0284C7] hover:underline font-medium transition flex items-center gap-1 cursor-pointer"
        >
          <span>Copilot Architecture Manual</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

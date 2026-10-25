import React, { useState } from 'react';
import { DISRUPTION_SCENARIOS } from '../data/logisticsNetwork';
import { DisruptionScenario } from '../types/logistics';
import {
  AlertTriangle,
  Bot,
  Zap,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Sliders,
  DollarSign,
  Clock,
  X,
  FileText,
} from 'lucide-react';

interface DisruptionSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyMitigation?: (scenarioTitle: string, optionTitle: string) => void;
}

export const DisruptionSimulatorModal: React.FC<DisruptionSimulatorModalProps> = ({
  isOpen,
  onClose,
  onApplyMitigation,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<DisruptionScenario>(DISRUPTION_SCENARIOS[0]);
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    DISRUPTION_SCENARIOS[0].mitigationOptions.find((o) => o.recommended)?.id ||
      DISRUPTION_SCENARIOS[0].mitigationOptions[0].id
  );
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionSuccess, setExecutionSuccess] = useState(false);

  if (!isOpen) return null;

  const handleScenarioChange = (scenario: DisruptionScenario) => {
    setSelectedScenario(scenario);
    const rec = scenario.mitigationOptions.find((o) => o.recommended);
    setSelectedOptionId(rec ? rec.id : scenario.mitigationOptions[0].id);
    setExecutionSuccess(false);
  };

  const handleExecute = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      setExecutionSuccess(true);
      const chosenOption = selectedScenario.mitigationOptions.find((o) => o.id === selectedOptionId);
      if (onApplyMitigation && chosenOption) {
        onApplyMitigation(selectedScenario.title, chosenOption.title);
      }
    }, 1400);
  };

  const currentOption = selectedScenario.mitigationOptions.find((o) => o.id === selectedOptionId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="disruption-modal-title"
    >
      <div className="relative w-full max-w-4xl bg-[#151e30] border border-amber-400/40 rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close disruption simulator"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-300 uppercase tracking-widest">
            <AlertTriangle className="w-4 h-4" />
            <span>ORION-9 AI DISRUPTION & MITIGATION SIMULATOR</span>
          </div>
          <h3 id="disruption-modal-title" className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Autonomous Incident Triage & Scenario Evaluation
          </h3>
          <p className="text-sm text-white/70">
            Simulate real-world supply chain anomalies, inspect Orion-9’s contextual AI reasoning, and compare multi-objective trade-off curves before governed execution.
          </p>
        </div>

        {/* Scenario Selection Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {DISRUPTION_SCENARIOS.map((scenario) => {
            const isSelected = scenario.id === selectedScenario.id;
            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => handleScenarioChange(scenario)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-[#1d293d] border-amber-400/70 shadow-lg shadow-amber-950/30'
                    : 'bg-[#0f1626] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-neutral-300 border border-amber-500/20">
                    {scenario.severity.toUpperCase()} SEVERITY
                  </span>
                  <span className="text-xs font-mono text-white/50">{scenario.location}</span>
                </div>
                <h4 className="text-sm font-bold text-white tracking-tight">{scenario.title}</h4>
              </button>
            );
          })}
        </div>

        {/* Scenario Deep Dive: Anomaly Signal & Root Cause */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-[#0f1626] border border-white/10 space-y-1.5">
            <span className="text-xs font-mono text-neutral-300 uppercase tracking-wider block">
              01. Detected Incident & Anomaly
            </span>
            <p className="text-xs text-white/80 leading-relaxed font-mono">
              {selectedScenario.summary}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0f1626] border border-white/10 space-y-1.5">
            <span className="text-xs font-mono text-[#f5f5f5] uppercase tracking-wider block">
              02. Upstream Lead-Time Ripple Effect
            </span>
            <p className="text-xs text-white/80 leading-relaxed font-mono">
              {selectedScenario.upstreamImpact}
            </p>
          </div>
        </div>

        {/* AI Copilot Reasoning & Scenario Options */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <Bot className="w-4 h-4 text-[#f5f5f5]" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              AI Copilot Evaluated Trade-Off Pathways
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedScenario.mitigationOptions.map((opt) => {
              const isSelected = opt.id === selectedOptionId;
              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    setSelectedOptionId(opt.id);
                    setExecutionSuccess(false);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#1d293d] border-[#f5f5f5] shadow-xl shadow-lime-950/40 ring-1 ring-[#f5f5f5]/40'
                      : 'bg-[#0f1626] border-white/10 hover:border-white/25'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-white/40">SCENARIO PATH</span>
                      {opt.recommended && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#f5f5f5]/10 text-[#f5f5f5] border border-[#f5f5f5]/30">
                          RECOMMENDED
                        </span>
                      )}
                    </div>
                    <h5 className="text-sm font-bold text-white tracking-tight">{opt.title}</h5>
                    <p className="text-xs text-white/60 leading-relaxed">{opt.actionDescription}</p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-white/10 space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between text-white/70">
                      <span>BUDGET:</span>
                      <span className="text-white font-bold">{opt.costImpact}</span>
                    </div>
                    <div className="flex justify-between text-white/70">
                      <span>SLA RECOVERY:</span>
                      <span className="text-[#f5f5f5] font-bold">{opt.timeRecovery}</span>
                    </div>
                    <div className="flex justify-between text-white/70">
                      <span>RISK SCORE:</span>
                      <span className="text-neutral-300">{opt.riskScore}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Execution & Governance Bar */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-white/60">
            <ShieldAlert className="w-4 h-4 text-[#f5f5f5]" />
            <span>GOVERNANCE: REQUIRES DUAL HUMAN SIGN-OFF TO DISPATCH</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {executionSuccess ? (
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 font-mono text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>DISPATCHED & AUDIT TRAIL COMMITTED</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleExecute}
                disabled={isExecuting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#f5f5f5] text-[#0f1626] font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#f5f5f5]/20 hover:bg-[#e5e5e5] transition-all disabled:opacity-50"
              >
                {isExecuting ? (
                  <span>Dispatching Electronic Orders...</span>
                ) : (
                  <>
                    <span>Execute Autonomous Reroute</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

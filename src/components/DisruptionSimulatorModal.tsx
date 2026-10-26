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
  X,
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
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="disruption-modal-title"
    >
      <div className="relative w-full max-w-4xl bg-[#0b0b0b] border border-white/20 rounded-sm shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto text-[#f5f5f5]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-1.5 rounded-sm text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close disruption simulator"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5 mb-6">
          <div className="flex items-center gap-2 text-[11px] font-mono text-white/60 uppercase tracking-widest">
            <AlertTriangle className="w-3.5 h-3.5 text-white" />
            <span>AI INCIDENT RESOLUTION & MITIGATION ENGINE</span>
          </div>
          <h3 id="disruption-modal-title" className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Autonomous Incident Triage & Scenario Evaluation
          </h3>
          <p className="text-xs sm:text-sm text-[#a0a0a0]">
            Simulate physical bottlenecks, inspect Orion-9’s contextual AI reasoning, and compare multi-objective trade-off curves before governed execution.
          </p>
        </div>

        {/* Scenario Selection Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 font-mono text-xs">
          {DISRUPTION_SCENARIOS.map((scenario) => {
            const isSelected = scenario.id === selectedScenario.id;
            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => handleScenarioChange(scenario)}
                className={`p-4 rounded-sm border text-left transition-all ${
                  isSelected
                    ? 'bg-[#171717] border-white shadow-lg'
                    : 'bg-[#050505] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-white/10 text-white border border-white/20">
                    {scenario.severity.toUpperCase()} SEVERITY
                  </span>
                  <span className="text-[10px] text-white/40">{scenario.location}</span>
                </div>
                <h4 className="text-xs font-bold text-white tracking-tight">{scenario.title}</h4>
              </button>
            );
          })}
        </div>

        {/* Anomaly Signal & Upstream Ripple Effect */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 font-mono text-xs">
          <div className="p-4 rounded-sm bg-[#050505] border border-white/10 space-y-1.5">
            <span className="text-[10px] text-white/50 uppercase tracking-wider block">
              01. DETECTED ANOMALY SIGNAL
            </span>
            <p className="text-xs text-white/80 leading-relaxed">
              {selectedScenario.summary}
            </p>
          </div>

          <div className="p-4 rounded-sm bg-[#050505] border border-white/10 space-y-1.5">
            <span className="text-[10px] text-white/50 uppercase tracking-wider block">
              02. UPSTREAM SUPPLY CHAIN IMPACT
            </span>
            <p className="text-xs text-white/80 leading-relaxed">
              {selectedScenario.upstreamImpact}
            </p>
          </div>
        </div>

        {/* AI Copilot Evaluated Options */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 pb-2 border-b border-white/10 font-mono text-xs text-white/60">
            <Bot className="w-4 h-4 text-white" />
            <span className="uppercase tracking-wider font-semibold">
              AI COPILOT EVALUATED TRADE-OFF PATHWAYS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {selectedScenario.mitigationOptions.map((opt) => {
              const isSelected = opt.id === selectedOptionId;
              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    setSelectedOptionId(opt.id);
                    setExecutionSuccess(false);
                  }}
                  className={`p-4 rounded-sm border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#171717] border-white shadow-lg ring-1 ring-white/30'
                      : 'bg-[#050505] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="text-white/40">SCENARIO</span>
                      {opt.recommended && (
                        <span className="px-1.5 py-0.5 rounded-sm bg-white text-black font-bold">
                          RECOMMENDED
                        </span>
                      )}
                    </div>
                    <h5 className="text-xs font-bold text-white tracking-tight">{opt.title}</h5>
                    <p className="text-[11px] text-white/60 leading-relaxed">{opt.actionDescription}</p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-white/10 space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between text-white/60">
                      <span>BUDGET:</span>
                      <span className="text-white font-medium">{opt.costImpact}</span>
                    </div>
                    <div className="flex justify-between text-white/60">
                      <span>SLA RECOVERY:</span>
                      <span className="text-white font-medium">{opt.timeRecovery}</span>
                    </div>
                    <div className="flex justify-between text-white/60">
                      <span>RISK SCORE:</span>
                      <span className="text-white/80">{opt.riskScore}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Execution & Governance Bar */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-2 text-white/50">
            <ShieldAlert className="w-4 h-4 text-white/70" />
            <span>GOVERNANCE: REQUIRES DUAL HUMAN SIGN-OFF TO DISPATCH</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {executionSuccess ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-sm bg-[#171717] border border-white/40 text-white font-bold">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>DISPATCHED & AUDIT TRAIL COMMITTED</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleExecute}
                disabled={isExecuting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm bg-white text-black font-bold uppercase tracking-wider hover:bg-[#e8e8e8] transition-all disabled:opacity-50"
              >
                {isExecuting ? (
                  <span>Dispatching Electronic Orders...</span>
                ) : (
                  <>
                    <span>Execute Autonomous Mitigation</span>
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

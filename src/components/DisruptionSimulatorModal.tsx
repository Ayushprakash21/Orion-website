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
  Loader2,
  Sliders,
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="disruption-modal-title"
    >
      <div className="relative w-full max-w-4xl liquid-glass-elevated border border-[var(--glass-border)] rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto text-[var(--orion-text-primary)]">
        {/* macOS Traffic Lights Header & Close */}
        <div className="flex items-center justify-between pb-5 mb-5 border-b border-[var(--glass-border-subtle)]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] hover:opacity-80 transition cursor-pointer"
              aria-label="Close"
            />
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
            <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
            <span className="ml-2 text-[10px] font-mono uppercase tracking-wider text-[var(--orion-accent)] font-semibold">
              SIMULATOR · ORION-SOLVER V9.2
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full liquid-glass-button flex items-center justify-center text-[var(--orion-text-muted)] hover:text-[var(--orion-text-primary)] transition-colors cursor-pointer"
            aria-label="Close disruption simulator"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Header */}
        <div className="space-y-1.5 mb-6">
          <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--orion-accent)] uppercase tracking-wider font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>AI INCIDENT RESOLUTION & MITIGATION ENGINE</span>
          </div>
          <h3 id="disruption-modal-title" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--orion-text-primary)]">
            Autonomous Incident Triage &amp; Scenario Evaluation
          </h3>
          <p className="text-xs sm:text-sm text-[var(--orion-text-secondary)] leading-relaxed">
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
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'liquid-glass-elevated border-[var(--orion-accent)] shadow-md ring-1 ring-[var(--orion-accent)]/30'
                    : 'liquid-glass-subtle border-[var(--glass-border-subtle)] hover:border-[var(--glass-border)]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full liquid-glass-badge text-[var(--orion-accent)] font-semibold font-mono">
                    {scenario.severity.toUpperCase()} SEVERITY
                  </span>
                  <span className="text-[10px] text-[var(--orion-text-muted)]">{scenario.location}</span>
                </div>
                <h4 className="text-xs font-bold text-[var(--orion-text-primary)] tracking-tight">{scenario.title}</h4>
              </button>
            );
          })}
        </div>

        {/* Anomaly Signal & Upstream Ripple Effect */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 font-mono text-xs">
          <div className="p-4 rounded-2xl liquid-glass-subtle border border-[var(--glass-border-subtle)] space-y-1.5">
            <span className="text-[10px] text-[var(--orion-text-muted)] uppercase tracking-wider block font-semibold">
              01. DETECTED ANOMALY SIGNAL
            </span>
            <p className="text-xs text-[var(--orion-text-secondary)] leading-relaxed">
              {selectedScenario.summary}
            </p>
          </div>

          <div className="p-4 rounded-2xl liquid-glass-subtle border border-[var(--glass-border-subtle)] space-y-1.5">
            <span className="text-[10px] text-[var(--orion-text-muted)] uppercase tracking-wider block font-semibold">
              02. UPSTREAM SUPPLY CHAIN IMPACT
            </span>
            <p className="text-xs text-[var(--orion-text-secondary)] leading-relaxed">
              {selectedScenario.upstreamImpact}
            </p>
          </div>
        </div>

        {/* AI Copilot Evaluated Options */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--glass-border-subtle)] font-mono text-xs text-[var(--orion-text-muted)]">
            <Bot className="w-4 h-4 text-[var(--orion-accent)]" />
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
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'liquid-glass-elevated border-[var(--orion-accent)] shadow-md ring-1 ring-[var(--orion-accent)]/30'
                      : 'liquid-glass-card border-[var(--glass-border)] hover:border-[var(--glass-border-highlight)]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="text-[var(--orion-text-muted)]">PATHWAY</span>
                      {opt.recommended && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 font-bold">
                          RECOMMENDED
                        </span>
                      )}
                    </div>
                    <h5 className="text-xs font-bold text-[var(--orion-text-primary)] tracking-tight">{opt.title}</h5>
                    <p className="text-[11px] text-[var(--orion-text-secondary)] leading-relaxed">{opt.actionDescription}</p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[var(--glass-border-subtle)] space-y-1.5 font-mono text-[11px]">
                    <div className="flex justify-between text-[var(--orion-text-muted)]">
                      <span>BUDGET:</span>
                      <span className="text-[var(--orion-text-primary)] font-semibold">{opt.costImpact}</span>
                    </div>
                    <div className="flex justify-between text-[var(--orion-text-muted)]">
                      <span>SLA RECOVERY:</span>
                      <span className="text-[var(--orion-accent)] font-semibold">{opt.timeRecovery}</span>
                    </div>
                    <div className="flex justify-between text-[var(--orion-text-muted)]">
                      <span>RISK SCORE:</span>
                      <span className="text-[var(--orion-text-primary)]">{opt.riskScore}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Execution & Governance Bar */}
        <div className="pt-4 border-t border-[var(--glass-border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-2 text-[var(--orion-text-muted)]">
            <ShieldAlert className="w-4 h-4 text-[var(--orion-accent)]" />
            <span>GOVERNANCE: REQUIRES CRYPTOGRAPHIC DUAL SIGN-OFF</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {executionSuccess ? (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>DISPATCHED &amp; AUDIT TRAIL COMMITTED</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleExecute}
                disabled={isExecuting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:from-[#0369A1] hover:to-[#075985] text-white font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-sky-600/20"
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-sky-200" />
                    <span>Dispatching Orders...</span>
                  </>
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

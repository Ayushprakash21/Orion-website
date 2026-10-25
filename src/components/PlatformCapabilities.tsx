import React, { useState } from 'react';
import {
  Compass,
  Cpu,
  Bot,
  Zap,
  Boxes,
  LineChart,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Workflow,
} from 'lucide-react';

interface CapabilityItem {
  id: string;
  letter: string;
  title: string;
  shortDesc: string;
  icon: React.ElementType;
  accent: string;
  operationalFocus: string[];
  architectureDetail: {
    inputs: string;
    processing: string;
    outcome: string;
    governance: string;
  };
}

const capabilities: CapabilityItem[] = [
  {
    id: 'control-tower',
    letter: 'A',
    title: 'Control Tower',
    shortDesc: 'Monitor orders, inventory, shipments, suppliers, and exceptions from a unified operational view.',
    icon: Compass,
    accent: '#f5f5f5',
    operationalFocus: ['Multi-tier shipment milestones', 'Unified inventory exposure', 'Supplier exception detection'],
    architectureDetail: {
      inputs: 'TMS feeds, WMS telemetry, supplier EDI 856/850, ocean/air AIS vessel tracks',
      processing: 'Near real-time stream aggregation, anomaly detection thresholding, multi-echelon graph correlation',
      outcome: 'Single-pane operational visibility with proactive disruption triage',
      governance: 'Role-based access control, regional permission scopes, unchangeable audit logs',
    },
  },
  {
    id: 'integration-fabric',
    letter: 'B',
    title: 'Integration Fabric',
    shortDesc: 'Connect enterprise systems through structured integration patterns, canonical data mapping, event processing, and reconciliation.',
    icon: Cpu,
    accent: '#f5f5f5',
    operationalFocus: ['Canonical data translation', 'Idempotent event processing', 'Continuous reconciliation'],
    architectureDetail: {
      inputs: 'Enterprise ERPs (SAP/Oracle), legacy databases, webhook streams, proprietary warehouse APIs',
      processing: 'Automated schema normalization, bidirectional message queues, cryptographic event checksums',
      outcome: 'Harmonized master data across disconnected global facilities',
      governance: 'TLS 1.3 transport, schema version pinning, automated circuit-breaker quarantine',
    },
  },
  {
    id: 'ai-copilot',
    letter: 'C',
    title: 'AI Copilot',
    shortDesc: 'Use AI-assisted operational analysis to explain exceptions, summarize risk, and help users explore supply chain decisions.',
    icon: Bot,
    accent: '#f5f5f5',
    operationalFocus: ['Contextual exception narratives', 'Dynamic risk summarization', 'Decision hypothesis exploration'],
    architectureDetail: {
      inputs: 'Live operational state, contextual supplier history, multimodal trade notices, weather alerts',
      processing: 'Server-side LLM reasoning, grounded operational prompt templates, bounded search spaces',
      outcome: 'Concise incident root-cause explanations and actionable candidate interventions',
      governance: 'Human-in-the-loop review, verified fact grounding, zero model hallucinations in execution path',
    },
  },
  {
    id: 'autonomous-operations',
    letter: 'D',
    title: 'Autonomous Operations',
    shortDesc: 'Support controlled workflow automation, approval boundaries, exception handling, and human-supervised execution.',
    icon: Zap,
    accent: '#f5f5f5',
    operationalFocus: ['Controlled workflow automation', 'Explicit approval boundaries', 'Human-supervised execution'],
    architectureDetail: {
      inputs: 'Validated exception triggers, inventory reorder thresholds, dynamic carrier rerouting events',
      processing: 'Deterministic state machine execution, policy-based boundary constraints, rollback hooks',
      outcome: 'Sub-second resolution for routine logistics bottlenecks without operator fatigue',
      governance: 'Mandatory two-person sign-off for financial threshold breaches, automated fallback to manual hold',
    },
  },
  {
    id: 'digital-twin',
    letter: 'E',
    title: 'Supply Chain Digital Twin',
    shortDesc: 'Represent supply chain relationships, operational dependencies, and potential disruptions.',
    icon: Boxes,
    accent: '#d4d4d4',
    operationalFocus: ['Multi-echelon dependency graphs', 'Lead-time variability models', 'Port & factory choke points'],
    architectureDetail: {
      inputs: 'Global physical node coordinates, transit corridors, transit lead times, tier-1/2 supplier BOM links',
      processing: 'Graph-based dependency traversal, capacity constraint modeling, what-if stress tests',
      outcome: 'Continuous digital mirror of physical supply network dynamics and vulnerability surfaces',
      governance: 'Temporal versioning, historical state snapshots, differential network comparison',
    },
  },
  {
    id: 'decision-intelligence',
    letter: 'F',
    title: 'Decision Intelligence',
    shortDesc: 'Evaluate scenarios, identify risks, and help teams understand operational trade-offs.',
    icon: LineChart,
    accent: '#d4d4d4',
    operationalFocus: ['Multi-objective cost vs speed trade-offs', 'Carbon impact calculations', 'Inventory buffer optimization'],
    architectureDetail: {
      inputs: 'Real-time spot freight indices, contractual service-level agreements, holding cost factors',
      processing: 'Multi-criteria optimization solvers, Monte Carlo risk simulation, penalty matrix scoring',
      outcome: 'Ranked mitigation options with explicit cost, ETA, and SLA impact trade-off curves',
      governance: 'Transparent decision rationale logging, executive review dashboards, compliance verification',
    },
  },
];

export const PlatformCapabilities: React.FC = () => {
  const [selectedCapability, setSelectedCapability] = useState<CapabilityItem>(capabilities[0]);

  return (
    <section id="platform" className="py-24 bg-[#0f1626] border-b border-white/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 space-y-4">
          <div className="text-xs font-mono uppercase tracking-widest text-[#f5f5f5]">
            SYSTEM CORE CAPABILITIES
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            One Operating System.
            <br />
            Every Supply Chain Signal.
          </h2>
          <p className="text-base sm:text-lg text-white/70 leading-relaxed">
            Orion-9 brings fragmented operational systems together, transforming disconnected events into coordinated decisions.
          </p>
        </div>

        {/* 6 Premium Capability Cards Grid */}
        <div id="capabilities" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap) => {
            const isSelected = selectedCapability.id === cap.id;
            const Icon = cap.icon;

            return (
              <div
                key={cap.id}
                onClick={() => setSelectedCapability(cap)}
                className={`relative rounded-2xl p-7 transition-all cursor-pointer border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#1d293d] border-[#f5f5f5]/60 shadow-xl shadow-black/40 ring-1 ring-[#f5f5f5]/40'
                    : 'bg-[#151e30] border-white/10 hover:border-white/25 hover:bg-[#182338]'
                }`}
              >
                <div>
                  {/* Top Bar inside card: clean editorial index + icon */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs font-mono font-bold tracking-wider text-white/40">
                      [{cap.letter}]
                    </span>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center border transition-colors"
                      style={{
                        backgroundColor: isSelected ? 'rgba(63, 216, 255, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                        borderColor: isSelected ? 'rgba(63, 216, 255, 0.4)' : 'rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: cap.accent }} />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-2.5 tracking-tight">
                    {cap.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-white/70 leading-relaxed mb-6 font-normal">
                    {cap.shortDesc}
                  </p>
                </div>

                {/* Focus Items List */}
                <div className="pt-4 border-t border-white/10 space-y-2">
                  {cap.operationalFocus.map((focus, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-white/60">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: cap.accent }} />
                      <span className="truncate">{focus}</span>
                    </div>
                  ))}

                  <div className="pt-3 flex items-center justify-between text-xs font-mono font-medium">
                    <span style={{ color: isSelected ? cap.accent : 'rgba(255, 255, 255, 0.5)' }}>
                      {isSelected ? 'Inspecting Architecture' : 'Click to inspect'}
                    </span>
                    <ArrowRight
                      className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'translate-x-1 text-white' : 'text-white/40'}`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Capability Architecture Inspector */}
        <div className="mt-12 rounded-2xl bg-[#151e30] border border-white/15 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Layers className="w-5 h-5 text-[#f5f5f5]" />
              <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Operational Pipeline: {selectedCapability.title}
              </h4>
            </div>
            <div className="text-xs font-mono text-white/50">
              LAYER STATUS: <span className="text-[#f5f5f5]">PRODUCTION READY</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
            <div className="space-y-2">
              <span className="text-xs font-mono text-white/40 uppercase tracking-wider block">
                01. Operational Inputs
              </span>
              <p className="text-sm text-white/80 leading-relaxed">
                {selectedCapability.architectureDetail.inputs}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono text-white/40 uppercase tracking-wider block">
                02. Real-Time Engine
              </span>
              <p className="text-sm text-white/80 leading-relaxed">
                {selectedCapability.architectureDetail.processing}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono text-white/40 uppercase tracking-wider block">
                03. Actionable Outcome
              </span>
              <p className="text-sm text-white/80 leading-relaxed">
                {selectedCapability.architectureDetail.outcome}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono text-white/40 uppercase tracking-wider block">
                04. Enterprise Governance
              </span>
              <p className="text-sm text-white/80 leading-relaxed">
                {selectedCapability.architectureDetail.governance}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

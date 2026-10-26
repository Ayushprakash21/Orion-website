import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Ship,
  Warehouse,
  Factory,
  Building,
  Zap,
} from 'lucide-react';

export const OperationalProblem: React.FC = () => {
  const [viewMode, setViewMode] = useState<'legacy' | 'orion'>('legacy');

  return (
    <section id="problem" className="py-24 sm:py-32 bg-[#EAF4F8] border-b border-[#D5E1E8] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold text-[#294D6B] uppercase tracking-wider block">
              The Disruption Cascade
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.03em] text-[#111827] leading-[1.08]">
              How a minor variance spirals into systemic crisis.
            </h2>

            <p className="text-base sm:text-lg text-[#4A5568] leading-relaxed">
              When global logistics systems operate in silos, a routine 48-hour port delay compounds
              unnoticed until assembly lines starve and customer contracts fail.
            </p>
          </div>

          {/* Interactive Mode Toggle: Legacy vs Orion-9 */}
          <div className="inline-flex items-center p-1.5 rounded-full bg-white border border-[#D5E1E8] shadow-xs self-start lg:self-end">
            <button
              type="button"
              onClick={() => setViewMode('legacy')}
              className={`px-5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-2 ${
                viewMode === 'legacy'
                  ? 'bg-[#111827] text-white shadow-xs'
                  : 'text-[#4A5568] hover:text-[#111827]'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Disconnected Silos</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('orion')}
              className={`px-5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-2 ${
                viewMode === 'orion'
                  ? 'bg-[#294D6B] text-white shadow-xs'
                  : 'text-[#4A5568] hover:text-[#111827]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>Orion-9 Orchestration</span>
            </button>
          </div>
        </div>

        {/* Visual Cascade Stage */}
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#D5E1E8] shadow-[0_20px_50px_rgba(20,40,65,0.06)] relative overflow-hidden">
          {/* Visual Progress Connector Line */}
          <div className="hidden lg:block absolute top-1/2 left-16 right-16 h-0.5 bg-[#E2EBF0] -translate-y-8 z-0" />

          {/* 4 Connected Cascade Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {/* Stage 1: Port Bottleneck */}
            <div className="space-y-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  viewMode === 'legacy'
                    ? 'bg-amber-50 border border-amber-200 text-amber-700 shadow-sm'
                    : 'bg-[#EAF4F8] border border-[#D5E1E8] text-[#294D6B]'
                }`}
              >
                <Ship className="w-6 h-6" />
              </div>

              <div>
                <span className="text-xs font-mono text-[#566575] block uppercase mb-1">
                  Step 01 · Origin Port
                </span>
                <h3 className="text-lg font-bold text-[#111827] tracking-tight">
                  48-Hour Berth Delay
                </h3>
              </div>

              <p className="text-xs text-[#4A5568] leading-relaxed">
                {viewMode === 'legacy'
                  ? 'Vessel anchorage delay outside Singapore gateway port goes unnoticed by downstream ERPs running on daily batch updates.'
                  : 'Carrier satellite AIS stream detects anchorage congestion in sub-second latency, instantly alerting canonical graph models.'}
              </p>
            </div>

            {/* Stage 2: Inventory Buffer Exhaustion */}
            <div className="space-y-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  viewMode === 'legacy'
                    ? 'bg-rose-50 border border-rose-200 text-rose-700 shadow-sm'
                    : 'bg-[#EAF4F8] border border-[#D5E1E8] text-[#294D6B]'
                }`}
              >
                <Warehouse className="w-6 h-6" />
              </div>

              <div>
                <span className="text-xs font-mono text-[#566575] block uppercase mb-1">
                  Step 02 · Warehouse Buffer
                </span>
                <h3 className="text-lg font-bold text-[#111827] tracking-tight">
                  {viewMode === 'legacy' ? 'Buffer Gaps Emerge' : 'Safety Stock Protected'}
                </h3>
              </div>

              <p className="text-xs text-[#4A5568] leading-relaxed">
                {viewMode === 'legacy'
                  ? 'Warehouse safety stock rapidly burns down over 5 business days without proactive warning, reaching zero buffer.'
                  : 'Automated multi-echelon solvers predict buffer exhaustion 5 days in advance, preserving stock allocations.'}
              </p>
            </div>

            {/* Stage 3: Plant Stoppage */}
            <div className="space-y-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  viewMode === 'legacy'
                    ? 'bg-rose-50 border border-rose-200 text-rose-700 shadow-sm'
                    : 'bg-[#EAF4F8] border border-[#D5E1E8] text-[#294D6B]'
                }`}
              >
                <Factory className="w-6 h-6" />
              </div>

              <div>
                <span className="text-xs font-mono text-[#566575] block uppercase mb-1">
                  Step 03 · Manufacturing
                </span>
                <h3 className="text-lg font-bold text-[#111827] tracking-tight">
                  {viewMode === 'legacy' ? 'Assembly Line Halts' : 'Production Continuity'}
                </h3>
              </div>

              <p className="text-xs text-[#4A5568] leading-relaxed">
                {viewMode === 'legacy'
                  ? 'Plant DE-02 runs out of critical sensor sub-assemblies. Emergency workarounds compete blindly with other orders.'
                  : 'Orion-9 dispatches a priority air split for critical components via Dubai, preventing line stoppages.'}
              </p>
            </div>

            {/* Stage 4: Enterprise Impact */}
            <div className="space-y-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  viewMode === 'legacy'
                    ? 'bg-rose-50 border border-rose-200 text-rose-700 shadow-sm'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-sm'
                }`}
              >
                <Building className="w-6 h-6" />
              </div>

              <div>
                <span className="text-xs font-mono text-[#566575] block uppercase mb-1">
                  Step 04 · Business Outcome
                </span>
                <h3 className="text-lg font-bold text-[#111827] tracking-tight">
                  {viewMode === 'legacy' ? '$1.4M SLA Penalty' : '100% Contract Integrity'}
                </h3>
              </div>

              <p className="text-xs text-[#4A5568] leading-relaxed">
                {viewMode === 'legacy'
                  ? 'Cascading missed commitments incur severe contractual fines and permanent customer relationship erosion.'
                  : 'All contractual delivery windows are preserved with bounded +$42k freight expedite cost.'}
              </p>
            </div>
          </div>

          {/* Bottom Summary Bar */}
          <div className="mt-12 pt-6 border-t border-[#E2EBF0] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#111827]">Operational Mode:</span>
              <span className="text-[#566575]">
                {viewMode === 'legacy'
                  ? 'Disconnected Silos (Fragmented ERP, manual emails, blind handoffs)'
                  : 'Orion-9 Autonomous Control (Canonical graph, stochastic solvers, governed action)'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'legacy' ? 'orion' : 'legacy')}
              className="text-[#294D6B] font-semibold hover:underline cursor-pointer self-start sm:self-auto"
            >
              Toggle to {viewMode === 'legacy' ? 'Orion-9 Orchestration' : 'Disconnected Silos'} →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

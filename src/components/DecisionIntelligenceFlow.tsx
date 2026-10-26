import React, { useState } from 'react';
import {
  Radio,
  GitBranch,
  Scale,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Lock,
  Sparkles,
} from 'lucide-react';

interface StoryScene {
  step: string;
  phase: string;
  headline: string;
  story: string;
  resolutionImpact: string;
  governanceType: 'Automated Sensing' | 'Graph Correlation' | 'Stochastic Solver' | 'Human Policy Authorization';
}

const scenes: StoryScene[] = [
  {
    step: '01',
    phase: 'Detection',
    headline: 'Anomalous 48-Hour Berth Congestion Sensed at Singapore',
    story:
      'Carrier satellite AIS stream alerts to an unplanned anchorage delay affecting 4 container vessels. Instead of waiting for a manual email days later, the event enters Orion-9 in real time.',
    resolutionImpact: 'Detection latency under 180ms · No alert storms',
    governanceType: 'Automated Sensing',
  },
  {
    step: '02',
    phase: 'Contextualization',
    headline: '18,400 Critical Lithography Components Isolated',
    story:
      'Orion-9 resolves container manifests against active purchase orders and plant bills of materials, determining that Frankfurt Plant DE-02 faces a complete line stoppage in 5 days if unmitigated.',
    resolutionImpact: '100% Entity resolution across SAP ERP and Manhattan WMS',
    governanceType: 'Graph Correlation',
  },
  {
    step: '03',
    phase: 'Optimization',
    headline: 'Multi-Objective Trade-Off: Sea-Air Hybrid Split',
    story:
      'The solver models candidate pathways balancing landed cost, speed, and Scope 3 carbon impact. It recommends expediting the top 15% critical components via Dubai air cargo while keeping bulk materials on ocean freight.',
    resolutionImpact: '100% Assembly SLA protected · Bounded +$42,000 expedite trade-off',
    governanceType: 'Stochastic Solver',
  },
  {
    step: '04',
    phase: 'Execution',
    headline: 'Two-Person Governed Sign-off and Closed-Loop API Booking',
    story:
      'Because the freight commitment exceeds the $25k governance threshold, Orion-9 routes the proposal to the Logistics Director with full financial context. Upon one-click sign-off, booking requests dispatch directly to carrier APIs.',
    resolutionImpact: 'Zero shadow overrides · Cryptographic non-repudiation audit trail',
    governanceType: 'Human Policy Authorization',
  },
];

export const DecisionIntelligenceFlow: React.FC = () => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const current = scenes[currentSceneIndex];

  return (
    <section id="decision-story" className="py-24 sm:py-32 bg-[#EAF4F8] border-b border-[#D5E1E8] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14 space-y-4">
          <span className="text-xs font-semibold text-[#294D6B] uppercase tracking-wider block">
            Decision Intelligence in Motion
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.03em] text-[#111827] leading-[1.08]">
            From raw signal to governed execution.
          </h2>

          <p className="text-base sm:text-lg text-[#4A5568] leading-relaxed">
            Follow a live disruption scenario: how Orion-9 detects an unexpected maritime delay,
            maps affected enterprise commitments, and guides operators to the optimal intervention.
          </p>
        </div>

        {/* Narrative Stage */}
        <div className="rounded-3xl bg-white border border-[#D5E1E8] shadow-[0_20px_50px_rgba(20,40,65,0.06)] p-8 sm:p-12 relative overflow-hidden">
          {/* Top Scene Progress Track */}
          <div className="flex items-center justify-between pb-8 mb-8 border-b border-[#D5E1E8]/80 flex-wrap gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              {scenes.map((scene, idx) => (
                <button
                  key={scene.step}
                  type="button"
                  onClick={() => setCurrentSceneIndex(idx)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-2 ${
                    currentSceneIndex === idx
                      ? 'bg-[#111827] text-white shadow-xs'
                      : currentSceneIndex > idx
                      ? 'bg-[#EAF4F8] text-[#294D6B]'
                      : 'bg-white border border-[#D5E1E8] text-[#566575] hover:text-[#111827]'
                  }`}
                >
                  <span className="font-mono text-[11px] font-bold">{scene.step}</span>
                  <span className="hidden sm:inline">{scene.phase}</span>
                </button>
              ))}
            </div>

            <span className="text-xs text-[#566575] font-medium">
              Scene {currentSceneIndex + 1} of {scenes.length}
            </span>
          </div>

          {/* Main Story Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF4F8] text-xs font-medium text-[#294D6B]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Governance Level: {current.governanceType}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight leading-snug">
                {current.headline}
              </h3>

              <p className="text-base text-[#4A5568] leading-relaxed">
                {current.story}
              </p>

              {/* Interactive Authorization Action in Scene 4 */}
              {currentSceneIndex === 3 && (
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={isAuthorized}
                    onClick={() => setIsAuthorized(true)}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      isAuthorized
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-[#294D6B] hover:bg-[#1D364B] text-white shadow-sm'
                    }`}
                  >
                    {isAuthorized ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Policy Authorized · Dispatched to Carrier APIs</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Sign Off Reroute Intervention (+$42,000)</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="pt-4 flex items-center gap-3">
                <button
                  type="button"
                  disabled={currentSceneIndex === 0}
                  onClick={() => setCurrentSceneIndex((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2 rounded-full border border-[#D5E1E8] text-xs font-medium text-[#4A5568] hover:text-[#111827] hover:bg-[#F5F9FB] transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  disabled={currentSceneIndex === scenes.length - 1}
                  onClick={() => setCurrentSceneIndex((prev) => Math.min(scenes.length - 1, prev + 1))}
                  className="px-5 py-2 rounded-full bg-[#111827] text-white text-xs font-medium hover:bg-[#294D6B] transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center gap-1"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Contextual Visual Outcome Card */}
            <div className="lg:col-span-5 rounded-2xl bg-[#F5F9FB] border border-[#D5E1E8] p-7 space-y-5">
              <span className="text-xs font-semibold text-[#111827] block pb-2 border-b border-[#D5E1E8]">
                Deterministic Outcome Benchmark
              </span>

              <div className="space-y-3 text-xs leading-relaxed">
                <div>
                  <span className="text-[11px] text-[#566575] uppercase block mb-1">
                    Systemic Guarantee:
                  </span>
                  <p className="font-semibold text-[#111827] text-sm">
                    {current.resolutionImpact}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#D5E1E8]/70">
                  <span className="text-[11px] text-[#566575] uppercase block mb-1">
                    Enterprise Lineage:
                  </span>
                  <p className="text-[#4A5568]">
                    Full origin-to-destination traceability preserved with tamper-evident audit logging.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

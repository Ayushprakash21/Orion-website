import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import {
  Ship,
  Plane,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export const ControlTowerPreview: React.FC = () => {
  const { launchOrion, destinationUrl } = useAuth();
  const [activeTab, setActiveTab] = useState<'incident' | 'solution' | 'log'>('incident');
  const [isResolved, setIsResolved] = useState<boolean>(false);

  return (
    <section id="control-tower" className="py-24 sm:py-32 bg-[#F5F9FB] border-b border-[#D5E1E8] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold text-[#294D6B] uppercase tracking-wider block">
              Control Tower Cockpit
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.03em] text-[#111827] leading-[1.08]">
              One command surface for global operations.
            </h2>

            <p className="text-base sm:text-lg text-[#4A5568] leading-relaxed">
              Designed for logistics directors and supply chain operators. Monitor exceptions across global corridors,
              evaluate recommended trade-offs, and commit governed interventions with complete confidence.
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => launchOrion(destinationUrl)}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#111827] text-white text-xs font-semibold hover:bg-[#294D6B] transition-all shadow-[0_8px_24px_rgba(17,24,39,0.14)] cursor-pointer"
            >
              <span>Launch Live Control Tower</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#A8C2D2]" />
            </button>
          </div>
        </div>

        {/* Intentionally Composed Dark Product Window (#0B131F) */}
        <div className="rounded-3xl border border-[#294D6B]/30 bg-[#0B131F] text-white shadow-[0_24px_60px_rgba(11,19,31,0.22)] overflow-hidden">
          {/* Bezel Titlebar */}
          <div className="px-6 py-4 border-b border-white/10 bg-[#070D16] flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-white/20 hidden sm:inline">|</span>
              <span className="font-semibold text-white tracking-wide">
                ORION-9 CONTROL TOWER · EXCEPTION RESOLVER
              </span>
            </div>

            {/* View Selector */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab('incident')}
                className={`px-3.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                  activeTab === 'incident'
                    ? 'bg-[#294D6B] text-white shadow-xs'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Incident Summary
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('solution')}
                className={`px-3.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                  activeTab === 'solution'
                    ? 'bg-[#294D6B] text-white shadow-xs'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Recommended Mitigation
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('log')}
                className={`px-3.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                  activeTab === 'log'
                    ? 'bg-[#294D6B] text-white shadow-xs'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Audit Trail
              </button>
            </div>
          </div>

          {/* Product View Content */}
          <div className="p-6 sm:p-10">
            {activeTab === 'incident' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div>
                    <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider block mb-1">
                      Active High-Priority Exception · Corridor SEA-EUR-04
                    </span>
                    <h4 className="text-xl font-bold text-white">
                      Singapore PSA Anchorage Dwell +48 Hours
                    </h4>
                  </div>
                  <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono">
                    ACTION PENDING
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                    <span className="text-[11px] text-[#94A3B8] uppercase block">Affected Vessel</span>
                    <p className="text-base font-semibold text-white">Ever Golden (Voyage 084)</p>
                    <p className="text-xs text-[#94A3B8]">4,200 TEU Lithography Cargo</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                    <span className="text-[11px] text-[#94A3B8] uppercase block">Downstream Impact</span>
                    <p className="text-base font-semibold text-white">Frankfurt Plant DE-02</p>
                    <p className="text-xs text-rose-300">Stockout Risk in 5 Days</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                    <span className="text-[11px] text-[#94A3B8] uppercase block">Contractual Exposure</span>
                    <p className="text-base font-semibold text-white">$1,400,000</p>
                    <p className="text-xs text-[#94A3B8]">Tier-1 Automotive SLA Penalty</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'solution' && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#294D6B] text-white flex items-center justify-center">
                        <Plane className="w-5 h-5 text-[#7DD3FC]" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">
                          Sea-Air Hybrid Reroute via Dubai DWC
                        </h4>
                        <p className="text-xs text-[#94A3B8]">
                          Expedites 15% critical sub-assemblies via air freight; keeps bulk on ocean schedule.
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-mono text-emerald-400 font-bold block">100% SLA Protected</span>
                      <span className="text-xs text-[#94A3B8]">Cost: +$42,000</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                      <ShieldCheck className="w-4 h-4 text-[#7DD3FC]" />
                      <span>Two-person approval threshold met</span>
                    </div>

                    <button
                      type="button"
                      disabled={isResolved}
                      onClick={() => setIsResolved(true)}
                      className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                        isResolved
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-[#294D6B] hover:bg-[#3B6B91] text-white shadow-xs'
                      }`}
                    >
                      {isResolved ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Intervention Committed & Dispatched</span>
                        </>
                      ) : (
                        <>
                          <span>Authorize Mitigation Now</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'log' && (
              <div className="space-y-4 text-xs font-mono">
                <div className="flex items-center justify-between text-[#94A3B8] pb-2 border-b border-white/10">
                  <span>AUDIT TRAIL EVENT LEDGER</span>
                  <span className="text-emerald-400">● IMMUTABLE REPOSITORY</span>
                </div>

                <div className="space-y-2 text-[#94A3B8]">
                  <p>14:32:04 UTC · Telemetry anomaly logged from AIS Satellite feeder</p>
                  <p>14:32:05 UTC · Entity graph mapped container 4,200 TEU to Plant DE-02</p>
                  <p>14:32:08 UTC · Multi-objective solver generated 3 candidate solutions</p>
                  <p className="text-white">14:32:15 UTC · Recommended Sea-Air split queued for operator review</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

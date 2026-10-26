import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import {
  Ship,
  Plane,
  Building2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const ControlTowerPreview: React.FC = () => {
  const { launchOrion, destinationUrl } = useAuth();
  const { activeConfig } = useSiteConfig();
  const [activeTab, setActiveTab] = useState<'shipments' | 'inventory' | 'exceptions'>('shipments');
  const [rerouteAuthorized, setRerouteAuthorized] = useState<boolean>(false);

  return (
    <section id="control-tower" className="py-24 sm:py-32 bg-[#F5F9FB] border-b border-[#D5E1E8] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#D5E1E8] text-xs font-mono text-[#294D6B]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#294D6B]" />
              <span className="font-semibold text-[#111827]">04 / CONTROL TOWER COCKPIT</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.03em] text-[#111827] leading-[1.08]">
              One Command Cockpit for Global Operations.
            </h2>

            <p className="text-base sm:text-lg text-[#4A5568] leading-relaxed">
              Designed for enterprise logistics directors, inventory managers, and supply chain operators.
              Gain end-to-end visibility and authorize governed reroutes from a single screen.
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => launchOrion(destinationUrl)}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#101820] text-white text-xs font-semibold hover:bg-[#294D6B] transition-all shadow-[0_8px_24px_rgba(16,24,32,0.12)] cursor-pointer"
            >
              <span>Launch Live Control Tower</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#A8C2D2]" />
            </button>
          </div>
        </div>

        {/* Contained Dark Navy Product Interface (#0B131F) */}
        <div className="rounded-3xl border border-[#294D6B]/30 bg-[#0B131F] text-white shadow-[0_24px_60px_rgba(11,19,31,0.25)] overflow-hidden">
          {/* Interface Bezel Bar */}
          <div className="px-6 py-4 border-b border-white/10 bg-[#070D16] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-white/30 hidden sm:inline">|</span>
              <span className="font-semibold text-white tracking-wide">
                ORION-9 INTELLIGENT CONTROL TOWER
              </span>
            </div>

            {/* View Switchers */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab('shipments')}
                className={`px-3.5 py-1 rounded-full text-[11px] font-sans font-medium transition-all cursor-pointer ${
                  activeTab === 'shipments'
                    ? 'bg-[#294D6B] text-white shadow-xs'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Inbound Freight
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('inventory')}
                className={`px-3.5 py-1 rounded-full text-[11px] font-sans font-medium transition-all cursor-pointer ${
                  activeTab === 'inventory'
                    ? 'bg-[#294D6B] text-white shadow-xs'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Buffer Exposure
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('exceptions')}
                className={`px-3.5 py-1 rounded-full text-[11px] font-sans font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'exceptions'
                    ? 'bg-[#294D6B] text-white shadow-xs'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <span>Exceptions</span>
                <span className="w-4 h-4 rounded-full bg-amber-500/30 text-amber-300 text-[10px] flex items-center justify-center font-bold">
                  2
                </span>
              </button>
            </div>
          </div>

          {/* Interactive Interface Content */}
          <div className="p-6 sm:p-8">
            {activeTab === 'shipments' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8] pb-2 border-b border-white/10">
                  <span>ACTIVE MULTI-MODAL CONSIGNMENTS (1,420 TRACKED)</span>
                  <span className="text-emerald-400">● 99.4% ON-TIME CORRIDOR RATE</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[#7DD3FC]/40 transition-colors">
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="flex items-center gap-1.5 text-white font-semibold">
                        <Ship className="w-4 h-4 text-[#7DD3FC]" />
                        Ever Golden · V.084
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                        ON SCHEDULE
                      </span>
                    </div>
                    <div className="text-xs text-[#94A3B8] space-y-1">
                      <p>Route: Shanghai Gateway → Rotterdam Hub</p>
                      <p>Cargo: 4,200 TEU Lithography Components</p>
                      <p className="font-mono text-white font-semibold pt-2">ETA: Oct 29 · Berth 04</p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[#7DD3FC]/40 transition-colors">
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="flex items-center gap-1.5 text-white font-semibold">
                        <Plane className="w-4 h-4 text-[#7DD3FC]" />
                        Flight OA-804 [Air Cargo]
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono">
                        IN FLIGHT
                      </span>
                    </div>
                    <div className="text-xs text-[#94A3B8] space-y-1">
                      <p>Route: Dubai DWC → Frankfurt FRA</p>
                      <p>Cargo: Expedited Sensor Sub-Assemblies</p>
                      <p className="font-mono text-white font-semibold pt-2">ETA: Today 18:40 UTC</p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-white/[0.04] border border-amber-500/30 hover:border-amber-400/50 transition-colors">
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="flex items-center gap-1.5 text-white font-semibold">
                        <Ship className="w-4 h-4 text-amber-400" />
                        CMA CGM Magellan
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono">
                        PORT DWELL +48H
                      </span>
                    </div>
                    <div className="text-xs text-[#94A3B8] space-y-1">
                      <p>Route: Singapore PSA → Hamburg</p>
                      <p>Cargo: Raw Silicon & Wafer Ingot</p>
                      <p className="font-mono text-amber-300 font-semibold pt-2">
                        Recommendation: Air Split Active
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8] pb-2 border-b border-white/10">
                  <span>PLANT BUFFER HEALTH & STOCKOUT HORIZONS</span>
                  <span className="text-[#7DD3FC]">DYNAMIC SAFETY STOCK LOCK</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">Frankfurt Plant DE-02 (Automotive Assembly)</span>
                      <span className="text-amber-400 font-mono text-xs">Buffer: 4.8 Days</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-amber-400 h-2 rounded-full w-[45%]" />
                    </div>
                    <p className="text-xs text-[#94A3B8]">
                      Exposure: Lithography components delayed by Singapore anchorage delay.
                      Resolution proposed below in Exceptions tab.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">Chicago Hub US-01 (Heavy Equipment)</span>
                      <span className="text-emerald-400 font-mono text-xs">Buffer: 21.4 Days</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-emerald-400 h-2 rounded-full w-[88%]" />
                    </div>
                    <p className="text-xs text-[#94A3B8]">
                      All critical BOM line items fully buffered through Q4 production quotas.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'exceptions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8] pb-2 border-b border-white/10">
                  <span>POLICY-GOVERNED EXCEPTION QUEUE (1 PENDING SIGN-OFF)</span>
                  <span className="text-amber-400 font-semibold">ACTION REQUIRED</span>
                </div>

                <div className="p-6 rounded-2xl bg-white/[0.05] border border-white/15 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          Singapore PSA Bottleneck · Split Priority Air Freight
                        </h4>
                        <p className="text-xs text-[#94A3B8]">
                          Protects Frankfurt Plant DE-02 assembly line from $1.4M downtime penalty.
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono text-white block">+$42,000 Expedite</span>
                      <span className="text-[10px] text-emerald-400 font-mono">100% SLA Saved</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                      <ShieldCheck className="w-4 h-4 text-[#7DD3FC]" />
                      <span>Governance rule: 2-person sign-off for freight &gt;$25k</span>
                    </div>

                    <button
                      type="button"
                      disabled={rerouteAuthorized}
                      onClick={() => setRerouteAuthorized(true)}
                      className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        rerouteAuthorized
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-[#294D6B] hover:bg-[#3B6B91] text-white shadow-xs'
                      }`}
                    >
                      {rerouteAuthorized ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Intervention Authorized & Dispatched</span>
                        </>
                      ) : (
                        <>
                          <span>Authorize Governed Reroute</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

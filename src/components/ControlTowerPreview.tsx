import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import {
  Ship,
  Building2,
  AlertTriangle,
  ArrowRight,
  Radio,
  ShieldCheck,
  Database,
} from 'lucide-react';

export const ControlTowerPreview: React.FC = () => {
  const { launchOrion, destinationUrl, isAuthenticated } = useAuth();
  const { activeConfig } = useSiteConfig();
  const hp = activeConfig.homepage;

  const [activeTab, setActiveTab] = useState<'shipments' | 'inventory' | 'exceptions'>('shipments');
  const [telemetryMode, setTelemetryMode] = useState<'simulated' | 'live_spec'>('simulated');

  return (
    <section
      id="control-tower-preview"
      className="py-24 bg-[#F5F9FB] border-b border-[#D5E1E8] relative text-xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#D5E1E8] text-[11px] font-mono uppercase tracking-widest text-[#294D6B] font-semibold">
              <Database className="w-3.5 h-3.5" />
              <span>{hp.controlTowerEyebrow}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] text-[#111827] leading-tight">
              {hp.controlTowerTitle}
            </h2>
            <p className="text-sm sm:text-base text-[#566575] leading-relaxed">
              {hp.controlTowerSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start lg:self-end">
            {/* Explicit Mode Selector distinguishing Simulated Demo Telemetry from Live Operational Data */}
            <div className="inline-flex items-center rounded-full border border-[#D5E1E8] bg-white p-1 font-mono text-[11px]">
              <button
                type="button"
                onClick={() => setTelemetryMode('simulated')}
                className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer ${
                  telemetryMode === 'simulated'
                    ? 'bg-[#294D6B] text-white font-bold'
                    : 'text-[#566575] hover:text-[#111827]'
                }`}
              >
                Simulated Demo Telemetry
              </button>
              <button
                type="button"
                onClick={() => setTelemetryMode('live_spec')}
                className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer ${
                  telemetryMode === 'live_spec'
                    ? 'bg-[#101820] text-white font-bold'
                    : 'text-[#566575] hover:text-[#111827]'
                }`}
              >
                Live Production Gateway
              </button>
            </div>

            <button
              type="button"
              onClick={() => launchOrion()}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#101820] text-white font-semibold text-xs hover:bg-[#294D6B] transition-all shadow-[0_10px_25px_rgba(16,24,32,0.14)] cursor-pointer"
            >
              <span>Launch Live Operating System</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dark Application Surface (#101820) Control Tower Cockpit Frame */}
        <div className="rounded-3xl border border-[#294D6B]/40 bg-[#101820] text-white overflow-hidden shadow-[0_28px_70px_rgba(16,24,32,0.22)] font-mono">
          {/* Cockpit Top Bar */}
          <div className="p-4 bg-[#101820] border-b border-white/10 flex flex-wrap items-center justify-between gap-4 text-[11px] text-[#A8C2D2]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 font-bold text-white">
                <span className="w-2 h-2 rounded-full bg-[#7DD3FC]" />
                <span>ORION-9 CONTROL TOWER COCKPIT</span>
              </div>
              <span className="text-white/20" aria-hidden="true">
                /
              </span>
              <span>
                DATA STREAM:{' '}
                <strong className="text-white">
                  {telemetryMode === 'simulated'
                    ? 'INTERACTIVE SANDBOX SIMULATION'
                    : 'LIVE CLOUDFLARE WORKERS RUNTIME'}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2 text-[10px]">
              <span className="px-2.5 py-1 rounded-full bg-[#294D6B]/50 text-white border border-[#A8C2D2]/30">
                {telemetryMode === 'simulated' ? 'DEMO TELEMETRY' : 'PRODUCTION ENDPOINT'}
              </span>
              <span className="text-[#A8C2D2] hidden sm:inline">{destinationUrl}</span>
            </div>
          </div>

          {/* Cockpit Main Body Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
            {/* Left Nav Drawer */}
            <div className="lg:col-span-3 p-5 bg-[#0c131a] border-r border-white/10 space-y-5">
              <div className="space-y-1.5">
                <span className="text-[10px] text-[#A8C2D2] uppercase block px-2 mb-2">
                  OPERATIONAL VIEWS
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('shipments')}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer ${
                    activeTab === 'shipments'
                      ? 'bg-[#294D6B] text-white font-bold'
                      : 'text-[#A8C2D2] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Ship className="w-3.5 h-3.5" />
                    <span>Inbound Shipments</span>
                  </div>
                  <span className="text-[10px] opacity-80">1,420</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('inventory')}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer ${
                    activeTab === 'inventory'
                      ? 'bg-[#294D6B] text-white font-bold'
                      : 'text-[#A8C2D2] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Inventory Buffers</span>
                  </div>
                  <span className="text-[10px] opacity-80">98.2%</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('exceptions')}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer ${
                    activeTab === 'exceptions'
                      ? 'bg-[#294D6B] text-white font-bold'
                      : 'text-[#A8C2D2] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Active Exceptions</span>
                  </div>
                  <span className="text-[10px] text-white px-2 py-0.5 rounded-full bg-amber-500/30 border border-amber-400/40">
                    02
                  </span>
                </button>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2 text-[10px] text-[#A8C2D2]">
                <span className="uppercase block text-white/60">SUBSYSTEM HEALTH</span>
                <div className="flex justify-between">
                  <span>CANONICAL GRAPH:</span>
                  <span className="text-white font-bold">100% SYNC</span>
                </div>
                <div className="flex justify-between">
                  <span>AIS / ADS-B BUS:</span>
                  <span className="text-white font-bold">CONNECTED</span>
                </div>
                <div className="flex justify-between">
                  <span>DECISION SOLVER:</span>
                  <span className="text-white font-bold">NOMINAL</span>
                </div>
              </div>
            </div>

            {/* Right Operational Content */}
            <div className="lg:col-span-9 p-6 space-y-5 bg-[#101820]">
              {telemetryMode === 'live_spec' ? (
                <div className="rounded-2xl border border-[#A8C2D2]/30 bg-white/[0.03] p-6 space-y-4">
                  <div className="flex items-center gap-2 text-[#A8C2D2] text-xs font-bold">
                    <Radio className="w-4 h-4 text-[#7DD3FC]" />
                    <span>LIVE PRODUCTION CONTROL TOWER HANDOFF</span>
                  </div>
                  <h3 className="text-xl font-bold text-white font-sans">
                    Dedicated Production Workspace at {destinationUrl}
                  </h3>
                  <p className="text-xs text-[#A8C2D2] font-sans leading-relaxed">
                    To protect tenant data isolation and cryptographic origin boundaries, live production ERP, carrier, and purchase order telemetry runs inside the dedicated Orion-9 Control Tower deployment.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => launchOrion()}
                      className="px-5 py-2.5 rounded-full bg-white text-[#101820] font-sans font-bold text-xs hover:bg-[#EAF4F8] transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <span>Open Live Production Control Tower</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] text-[#A8C2D2]">
                      {isAuthenticated
                        ? 'Authenticated operator session ready for launch'
                        : 'Direct launch supported'}
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2 text-white font-bold uppercase">
                  <span>
                    {activeTab === 'shipments'
                      ? 'SIMULATED INBOUND FREIGHT RECORDS'
                      : activeTab === 'inventory'
                        ? 'SIMULATED MULTI-ECHELON INVENTORY BUFFERS'
                        : 'SIMULATED RISK EXCEPTIONS & REROUTES'}
                  </span>
                </div>
                <div className="text-[10px] text-[#A8C2D2]">
                  TELEMETRY SOURCE: <span className="text-white font-bold">SANDBOX DIGITAL TWIN</span>
                </div>
              </div>

              {activeTab === 'shipments' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-[10px] text-[#A8C2D2] uppercase">
                        <th className="pb-2.5 font-normal">TRACKING ID</th>
                        <th className="pb-2.5 font-normal">MODE / CARRIER</th>
                        <th className="pb-2.5 font-normal">ORIGIN → DESTINATION</th>
                        <th className="pb-2.5 font-normal">STATUS</th>
                        <th className="pb-2.5 font-normal">ETA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-white/90">
                      <tr className="hover:bg-white/5">
                        <td className="py-3 font-bold text-white">OR-PAC-984</td>
                        <td>Ocean / Pacific Titan</td>
                        <td>Shanghai [SHA] → LA [LAX]</td>
                        <td>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 text-[10px]">
                            ON SCHEDULE
                          </span>
                        </td>
                        <td className="tabular-nums">28h 00m</td>
                      </tr>
                      <tr className="hover:bg-white/5">
                        <td className="py-3 font-bold text-white">OR-AIR-804</td>
                        <td>Air / Flight OA-804</td>
                        <td>Tokyo [NRT] → Frankfurt [FRA]</td>
                        <td>
                          <span className="px-2 py-0.5 rounded-full bg-[#294D6B] text-white text-[10px]">
                            STRATOSPHERIC IN-FLIGHT
                          </span>
                        </td>
                        <td className="tabular-nums">04h 05m</td>
                      </tr>
                      <tr className="hover:bg-white/5">
                        <td className="py-3 font-bold text-white">OR-TRK-482</td>
                        <td>Road / TR-14 Semi</td>
                        <td>Rotterdam [RTM] → Frankfurt [FRA]</td>
                        <td>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 text-[10px]">
                            HIGHWAY EN ROUTE
                          </span>
                        </td>
                        <td className="tabular-nums">01h 50m</td>
                      </tr>
                      <tr className="hover:bg-white/5">
                        <td className="py-3 font-bold text-white">OR-SEA-992</td>
                        <td>Ocean / Horizon Titan</td>
                        <td>Shanghai [SHA] → Rotterdam [RTM]</td>
                        <td>
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 text-[10px]">
                            REROUTE ADVISED
                          </span>
                        </td>
                        <td className="tabular-nums">47h 20m</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'inventory' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { hub: 'Frankfurt Assembly Hub [FRA]', sku: 'Lithography Wafer Array', cover: '14.2 Days', status: 'HEALTHY (99.4%)' },
                    { hub: 'Chicago Rail Cross-Dock [ORD]', sku: 'Powertrain Inverter Pack', cover: '9.8 Days', status: 'NOMINAL (96.8%)' },
                    { hub: 'Rotterdam Europort [RTM]', sku: 'Cold-Chain Biologics Precursor', cover: '6.4 Days', status: 'REPLENISHING' },
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                      <span className="text-[10px] text-[#A8C2D2] block">{item.hub}</span>
                      <p className="font-bold text-white font-sans">{item.sku}</p>
                      <div className="pt-2 border-t border-white/10 flex justify-between text-[11px]">
                        <span className="text-[#A8C2D2]">BUFFER: {item.cover}</span>
                        <span className="text-white font-bold">{item.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'exceptions' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-amber-200">
                      <span>EXCEPTION #EX-209 · SUEZ MARITIME CORRIDOR</span>
                      <span className="font-bold">AI BYPASS READY</span>
                    </div>
                    <p className="text-xs font-bold text-white font-sans">
                      72h Berth Queue Delay — Sea-to-Air Split via Dubai [DXB] Recommended
                    </p>
                    <p className="text-[11px] text-[#A8C2D2] font-sans">
                      Protects Frankfurt assembly line schedule with +$42,000 expedited air allocation.
                    </p>
                  </div>
                </div>
              )}

              {/* Explicit Transparency Banner */}
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#A8C2D2]">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#A8C2D2]" />
                  <span>
                    SIMULATED DEMO TELEMETRY SHOWN FOR PUBLIC PREVIEW — LAUNCH CONTROL TOWER FOR LIVE PRODUCTION DATA
                  </span>
                </span>
                <span className="text-white font-bold">ORION-9 ENGINE v2.5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

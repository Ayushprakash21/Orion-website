import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Package,
  Truck,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Clock,
  DollarSign,
} from 'lucide-react';

type ControlTowerTab = 'inventory' | 'shipments' | 'exceptions' | 'scenario';

export const ControlTowerDemo: React.FC<{ onNavigate?: (path: string) => void }> = ({
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<ControlTowerTab>('inventory');

  return (
    <div className="w-full my-8 rounded-2xl border border-slate-800 bg-[#070B19]/90 backdrop-blur-xl shadow-2xl overflow-hidden">
      {/* Header & Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-mono font-semibold tracking-wider text-cyan-400 uppercase">
            Control Tower Operational Interface
          </span>
          <span className="text-xs text-slate-400">· Live Telemetry Simulator</span>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/70 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'inventory'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Inventory</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shipments')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'shipments'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Shipments</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('exceptions')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'exceptions'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Exceptions</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scenario')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'scenario'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Scenario Lab</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Tab View */}
      <div className="p-5 sm:p-6 bg-[#030712]/80 min-h-[280px]">
        <AnimatePresence mode="wait">
          {activeTab === 'inventory' && (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-cyan-400 font-semibold uppercase tracking-wider">
                  Multi-Echelon Stock Positions & Formula Verification
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Total Valuation: $24.8M · 99.8% Record Fidelity
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Total On-Hand</span>
                  <div className="text-xl font-mono font-bold text-white mt-1">142,850 Units</div>
                  <span className="text-[10px] text-emerald-400 mt-0.5 block">Across 6 Global Hubs</span>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Allocated / Reserved</span>
                  <div className="text-xl font-mono font-bold text-amber-300 mt-1">38,420 Units</div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Committed to active orders</span>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Available-to-Promise (ATP)</span>
                  <div className="text-xl font-mono font-bold text-cyan-400 mt-1">86,930 Units</div>
                  <span className="text-[10px] text-cyan-400 mt-0.5 block">Formula: OnHand - Res + Inbound</span>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Days of Inventory (DIO)</span>
                  <div className="text-xl font-mono font-bold text-white mt-1">32.4 Days</div>
                  <span className="text-[10px] text-emerald-400 mt-0.5 block">-4.2 Days vs SCM Target</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/70 font-mono text-xs flex flex-wrap items-center justify-between gap-3">
                <span className="text-slate-300">
                  Engine: <code className="text-cyan-400">AvailableToPromiseEngine.ts</code> · Database: <code className="text-sky-300">inventory_items</code>
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('/docs/applications/inventory')}
                  className="text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  <span>Inventory Documentation</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'shipments' && (
            <motion.div
              key="shipments"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-cyan-400 font-semibold uppercase tracking-wider">
                  Active Multimodal Logistics Tracking
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  48 Active Consignments · 98.4% OTIF
                </span>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <div>
                      <span className="font-bold text-white">SHP-9024 · Trans-Atlantic Maritime</span>
                      <span className="text-slate-400 block text-[11px]">Rotterdam &rarr; Newark · 850 TEU Container Carrier</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-bold block">NOMINAL (ETA: Oct 29, 14:00 UTC)</span>
                    <span className="text-slate-500 text-[10px]">Speed: 18.2 kts · Geofence: Mid-Atlantic</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-950/20 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <div>
                      <span className="font-bold text-white">SHP-8812 · Intercontinental Air Corridor</span>
                      <span className="text-slate-400 block text-[11px]">Taipei &rarr; Frankfurt · High-Priority Semiconductors</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-400 font-bold block">HOLD RESOLVED (ETA: Oct 28, 08:30 UTC)</span>
                    <span className="text-slate-400 text-[10px]">Autonomous Air Bypass Activated</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/70 font-mono text-xs flex flex-wrap items-center justify-between gap-3">
                <span className="text-slate-300">
                  Engine: <code className="text-cyan-400">LogisticsOptimizationEngine.ts</code> · Collection: <code className="text-sky-300">shipments</code>
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('/docs/applications/control-tower')}
                  className="text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  <span>Control Tower Documentation</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'exceptions' && (
            <motion.div
              key="exceptions"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-cyan-400 font-semibold uppercase tracking-wider">
                  Active Operational Exceptions & Approvals
                </span>
                <span className="text-[11px] font-mono text-rose-400">
                  1 Critical · 2 Warnings Requiring Human Review
                </span>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-950/20 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      CRITICAL: PORT CONGESTION
                    </span>
                    <span className="text-slate-400 text-[11px]">Financial Exposure: $148,000</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">Rotterdam Terminal 4 Bottleneck (+48h Delay)</h4>
                  <p className="text-slate-300 text-xs font-sans">
                    Autonomous mitigation proposed: Reroute 140 containers via Antwerp rail hub. Requires human approval.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/70 font-mono text-xs flex flex-wrap items-center justify-between gap-3">
                <span className="text-slate-300">
                  Engine: <code className="text-cyan-400">AlertEngine.ts</code> & <code className="text-cyan-400">ApprovalCenter.tsx</code>
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('/docs/applications/control-tower')}
                  className="text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  <span>Exceptions Documentation</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'scenario' && (
            <motion.div
              key="scenario"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-cyan-400 font-semibold uppercase tracking-wider">
                  Scenario Lab: Counterfactual Simulation
                </span>
                <span className="text-[11px] font-mono text-emerald-400">
                  Zero Live Mutation · Sandbox Mode
                </span>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-bold">Simulated Event: 7-Day Canal Transit Disruption</span>
                  <span className="text-cyan-400 font-bold">Scenario ID: SCN-7712</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Do-Nothing Impact</span>
                    <span className="text-rose-400 font-bold text-sm">-$1.42M Revenue</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Air Bypass Cost</span>
                    <span className="text-amber-300 font-bold text-sm">+$240K Freight</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Net Protected Value</span>
                    <span className="text-emerald-400 font-bold text-sm">+$1.18M Retained</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/70 font-mono text-xs flex flex-wrap items-center justify-between gap-3">
                <span className="text-slate-300">
                  Engine: <code className="text-cyan-400">NetworkDesignEngine.ts</code> · UI: <code className="text-sky-300">ScenarioLab.tsx</code>
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('/docs/applications/scenarios')}
                  className="text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  <span>Scenario Documentation</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

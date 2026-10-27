import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Truck,
  AlertTriangle,
  ExternalLink,
  TrendingUp,
} from 'lucide-react';

type ControlTowerTab = 'inventory' | 'shipments' | 'exceptions' | 'scenario';

export const ControlTowerDemo: React.FC<{ onNavigate?: (path: string) => void }> = ({
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<ControlTowerTab>('inventory');

  return (
    <div className="w-full my-8 rounded-3xl liquid-glass-elevated border border-[var(--glass-border)] shadow-xl overflow-hidden">
      {/* Header & Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-[var(--glass-border-subtle)] bg-white/40 dark:bg-black/20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 mr-1 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--orion-text-primary)] font-sans">
              Control Tower Operational Interface
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#0284C7]/10 text-[#0284C7] border border-[#0284C7]/20 uppercase">
              Simulator
            </span>
          </div>
          <span className="text-xs text-[var(--orion-text-muted)] font-mono">· Live Telemetry</span>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-2xl liquid-glass border border-[var(--glass-border-subtle)]">
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 rounded-xl text-xs font-sans font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'inventory'
                ? 'bg-[#070B19] dark:bg-white text-white dark:text-[#070B19] shadow-xs'
                : 'text-[var(--orion-text-secondary)] hover:text-[var(--orion-text-primary)]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Inventory</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shipments')}
            className={`px-3 py-1.5 rounded-xl text-xs font-sans font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'shipments'
                ? 'bg-[#070B19] dark:bg-white text-white dark:text-[#070B19] shadow-xs'
                : 'text-[var(--orion-text-secondary)] hover:text-[var(--orion-text-primary)]'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Shipments</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('exceptions')}
            className={`px-3 py-1.5 rounded-xl text-xs font-sans font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'exceptions'
                ? 'bg-[#070B19] dark:bg-white text-white dark:text-[#070B19] shadow-xs'
                : 'text-[var(--orion-text-secondary)] hover:text-[var(--orion-text-primary)]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Exceptions</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scenario')}
            className={`px-3 py-1.5 rounded-xl text-xs font-sans font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'scenario'
                ? 'bg-[#070B19] dark:bg-white text-white dark:text-[#070B19] shadow-xs'
                : 'text-[var(--orion-text-secondary)] hover:text-[var(--orion-text-primary)]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Scenario Lab</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Tab View */}
      <div className="p-6 sm:p-8 bg-white/40 dark:bg-black/20 min-h-[280px]">
        <AnimatePresence mode="wait">
          {activeTab === 'inventory' && (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-[var(--orion-accent)] font-semibold uppercase tracking-wider">
                  Multi-Echelon Stock Positions & Formula Verification
                </span>
                <span className="text-xs font-mono text-[var(--orion-text-muted)]">
                  Total Valuation: $24.8M · 99.8% Record Fidelity
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl liquid-glass border border-[var(--glass-border-subtle)]">
                  <span className="text-[10px] font-mono text-[var(--orion-text-muted)] uppercase">Total On-Hand</span>
                  <div className="text-xl font-bold text-[var(--orion-text-primary)] mt-1 font-editorial">142,850 Units</div>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 block font-sans">Across 6 Global Hubs</span>
                </div>
                <div className="p-4 rounded-2xl liquid-glass border border-[var(--glass-border-subtle)]">
                  <span className="text-[10px] font-mono text-[var(--orion-text-muted)] uppercase">Allocated / Reserved</span>
                  <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1 font-editorial">38,420 Units</div>
                  <span className="text-[11px] text-[var(--orion-text-secondary)] mt-0.5 block font-sans">Committed to active orders</span>
                </div>
                <div className="p-4 rounded-2xl liquid-glass border border-[var(--glass-border-subtle)]">
                  <span className="text-[10px] font-mono text-[var(--orion-text-muted)] uppercase">Available-to-Promise (ATP)</span>
                  <div className="text-xl font-bold text-[var(--orion-accent)] mt-1 font-editorial">86,930 Units</div>
                  <span className="text-[11px] text-[var(--orion-accent)] mt-0.5 block font-sans">OnHand - Res + Inbound</span>
                </div>
                <div className="p-4 rounded-2xl liquid-glass border border-[var(--glass-border-subtle)]">
                  <span className="text-[10px] font-mono text-[var(--orion-text-muted)] uppercase">Days of Inventory (DIO)</span>
                  <div className="text-xl font-bold text-[var(--orion-text-primary)] mt-1 font-editorial">32.4 Days</div>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 block font-sans">-4.2 Days vs SCM Target</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl liquid-glass border border-[var(--glass-border-subtle)] font-sans text-xs flex flex-wrap items-center justify-between gap-3">
                <span className="text-[var(--orion-text-secondary)]">
                  Engine: <code className="font-mono text-[var(--orion-accent)]">AvailableToPromiseEngine.ts</code> · Database: <code className="font-mono text-[#0284C7]">inventory_items</code>
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('/docs/applications/inventory')}
                  className="text-[var(--orion-accent)] hover:text-[#0369A1] transition flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <span>Inventory Documentation</span>
                  <ExternalLink className="w-3.5 h-3.5" />
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
                <span className="text-[11px] font-mono text-[var(--orion-accent)] font-semibold uppercase tracking-wider">
                  Active Multimodal Logistics Tracking
                </span>
                <span className="text-xs font-mono text-[var(--orion-text-muted)]">
                  48 Active Consignments · 98.4% OTIF
                </span>
              </div>

              <div className="space-y-2.5 font-sans text-xs">
                <div className="p-4 rounded-2xl liquid-glass border border-[var(--glass-border-subtle)] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <span className="font-bold text-[var(--orion-text-primary)]">SHP-9024 · Trans-Atlantic Maritime</span>
                      <span className="text-[var(--orion-text-secondary)] block text-[11px]">Rotterdam &rarr; Newark · 850 TEU Container Carrier</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      ON TRACK
                    </span>
                    <span className="text-[11px] text-[var(--orion-text-muted)] block mt-0.5">ETA: Oct 29, 14:00</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl liquid-glass border border-[var(--glass-border-subtle)] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                    <div>
                      <span className="font-bold text-[var(--orion-text-primary)]">SHP-8812 · Pacific Air Freight Express</span>
                      <span className="text-[var(--orion-text-secondary)] block text-[11px]">Shanghai &rarr; Los Angeles · High-Value Avionics</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      CUSTOMS HOLD (RESOLVED)
                    </span>
                    <span className="text-[11px] text-[var(--orion-text-muted)] block mt-0.5">ETA: Oct 27, 21:30</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl liquid-glass border border-[var(--glass-border-subtle)] font-sans text-xs flex flex-wrap items-center justify-between gap-3">
                <span className="text-[var(--orion-text-secondary)]">
                  Engine: <code className="font-mono text-[var(--orion-accent)]">PredictiveEtaEngine.ts</code> · Database: <code className="font-mono text-[#0284C7]">active_shipments</code>
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('/docs/applications/shipments')}
                  className="text-[var(--orion-accent)] hover:text-[#0369A1] transition flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <span>Shipment Documentation</span>
                  <ExternalLink className="w-3.5 h-3.5" />
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
                <span className="text-[11px] font-mono text-rose-500 font-semibold uppercase tracking-wider">
                  Live Exception Management & Automated Resolution
                </span>
                <span className="text-xs font-mono text-[var(--orion-text-muted)]">
                  3 Exceptions Active · 2 Auto-Resolved
                </span>
              </div>

              <div className="space-y-2.5 font-sans text-xs">
                <div className="p-4 rounded-2xl liquid-glass border border-rose-500/30 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                    <div>
                      <span className="font-bold text-[var(--orion-text-primary)]">Customs Manifest Mismatch: EDI 856 vs EDI 810</span>
                      <span className="text-[var(--orion-text-secondary)] block text-[11px]">Consignment #EXP-4401 · HS Code 8542.31 variance detected</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    CRITICAL SEVERITY
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl liquid-glass border border-[var(--glass-border-subtle)] font-sans text-xs flex flex-wrap items-center justify-between gap-3">
                <span className="text-[var(--orion-text-secondary)]">
                  Engine: <code className="font-mono text-[var(--orion-accent)]">ExceptionManager.ts</code> · Database: <code className="font-mono text-[#0284C7]">exceptions</code>
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('/docs/applications/exceptions')}
                  className="text-[var(--orion-accent)] hover:text-[#0369A1] transition flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <span>Exception Documentation</span>
                  <ExternalLink className="w-3.5 h-3.5" />
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
                <span className="text-[11px] font-mono text-[var(--orion-accent)] font-semibold uppercase tracking-wider">
                  Scenario Lab: Counterfactual Simulation
                </span>
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  Zero Live Mutation · Sandbox Mode
                </span>
              </div>

              <div className="p-5 rounded-2xl liquid-glass border border-[var(--glass-border-subtle)] space-y-4 font-sans text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--orion-text-primary)] font-bold text-sm">Simulated Event: 7-Day Canal Transit Disruption</span>
                  <span className="text-[var(--orion-accent)] font-mono font-bold">Scenario ID: SCN-7712</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-white/70 dark:bg-white/5 border border-[var(--glass-border-subtle)]">
                    <span className="text-[var(--orion-text-muted)] text-[10px] uppercase font-mono block">Do-Nothing Impact</span>
                    <span className="text-rose-600 dark:text-rose-400 font-bold text-base mt-1 block">-$1.42M Revenue</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/70 dark:bg-white/5 border border-[var(--glass-border-subtle)]">
                    <span className="text-[var(--orion-text-muted)] text-[10px] uppercase font-mono block">Air Bypass Cost</span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold text-base mt-1 block">+$240K Freight</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/70 dark:bg-white/5 border border-[var(--glass-border-subtle)]">
                    <span className="text-[var(--orion-text-muted)] text-[10px] uppercase font-mono block">Net Protected Value</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-base mt-1 block">+$1.18M Retained</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl liquid-glass border border-[var(--glass-border-subtle)] font-sans text-xs flex flex-wrap items-center justify-between gap-3">
                <span className="text-[var(--orion-text-secondary)]">
                  Engine: <code className="font-mono text-[var(--orion-accent)]">NetworkDesignEngine.ts</code> · UI: <code className="font-mono text-[#0284C7]">ScenarioLab.tsx</code>
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('/docs/applications/scenarios')}
                  className="text-[var(--orion-accent)] hover:text-[#0369A1] transition flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <span>Scenario Documentation</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

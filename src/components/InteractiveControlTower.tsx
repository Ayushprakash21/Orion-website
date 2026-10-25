import React, { useState } from 'react';
import { GlobalLogisticsScene, ScenePerspective } from './GlobalLogisticsScene';
import { DisruptionSimulatorModal } from './DisruptionSimulatorModal';
import { LOGISTICS_VEHICLES, LOGISTICS_NODES } from '../data/logisticsNetwork';
import { LogisticsVehicle, LogisticsNode, TransportMode } from '../types/logistics';
import {
  Ship,
  Plane,
  Truck,
  Building2,
  Compass,
  AlertTriangle,
  Zap,
  Activity,
  Layers,
  SlidersHorizontal,
  ChevronRight,
  Maximize2,
} from 'lucide-react';

export const InteractiveControlTower: React.FC = () => {
  const [activePerspective, setActivePerspective] = useState<ScenePerspective>('global');
  const [activeFilter, setActiveFilter] = useState<TransportMode | 'all'>('all');
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [selectedEntity, setSelectedEntity] = useState<LogisticsVehicle | LogisticsNode | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [activeDisruptionAlert, setActiveDisruptionAlert] = useState<string | null>(null);

  const filteredVehicles =
    activeFilter === 'all'
      ? LOGISTICS_VEHICLES
      : LOGISTICS_VEHICLES.filter((v) => v.mode === activeFilter);

  const handleMitigationApplied = (scenarioTitle: string, optionTitle: string) => {
    setActiveDisruptionAlert(`Mitigation active: ${optionTitle} applied to "${scenarioTitle}".`);
    setTimeout(() => {
      setActiveDisruptionAlert(null);
    }, 8000);
  };

  return (
    <section id="control-tower-experience" className="py-20 bg-[#070b14] border-b border-white/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#f5f5f5]">
              <Compass className="w-4 h-4 text-[#f5f5f5]" />
              <span>INTERACTIVE MULTIMODAL CONTROL TOWER</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Explore Live Global Logistics.
            </h2>
            <p className="text-base text-white/70 leading-relaxed">
              Navigate international supply routes in real-time. Track commercial ships traversing ocean corridors, cargo aircraft along high-altitude arcs, and freight trucks servicing continental hubs.
            </p>
          </div>

          {/* Action Button: Simulate Disruption */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSimulatorOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-amber-400/10 border border-amber-400/50 text-neutral-300 font-mono text-xs font-bold uppercase tracking-wider hover:bg-amber-400/20 shadow-lg shadow-amber-950/40 transition-all active:scale-[0.98]"
            >
              <AlertTriangle className="w-4 h-4 text-neutral-300" />
              <span>Simulate Regional Disruption</span>
            </button>
          </div>
        </div>

        {/* Real-Time Operational Telemetry Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 font-mono">
          <div className="p-4 rounded-xl bg-[#0f1626] border border-white/10 space-y-1">
            <span className="text-[11px] text-white/40 block">ACTIVE MULTIMODAL FLEET</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white tabular-nums">216</span>
              <span className="text-xs text-[#f5f5f5]">VESSELS & JETS</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0f1626] border border-white/10 space-y-1">
            <span className="text-[11px] text-white/40 block">CONTAINER VOLUME IN-FLIGHT</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white tabular-nums">8,420</span>
              <span className="text-xs text-white/60">TEU EQUIV</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0f1626] border border-white/10 space-y-1">
            <span className="text-[11px] text-white/40 block">NETWORK SLA INTEGRITY</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#f5f5f5] tabular-nums">98.4%</span>
              <span className="text-xs text-white/60">NOMINAL</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0f1626] border border-white/10 space-y-1">
            <span className="text-[11px] text-white/40 block">UPSTREAM ANOMALIES</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-neutral-300 tabular-nums">02</span>
              <span className="text-xs text-neutral-300/80">FLAGGED</span>
            </div>
          </div>
        </div>

        {/* Optional Active Disruption Notice Banner */}
        {activeDisruptionAlert && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/70 border border-emerald-400/40 text-emerald-200 text-xs font-mono flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{activeDisruptionAlert}</span>
            </div>
            <button
              onClick={() => setActiveDisruptionAlert(null)}
              className="text-white/60 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main 3D Viewport Frame */}
        <div className="rounded-3xl border border-white/15 overflow-hidden shadow-2xl relative bg-[#0a0f1b]">
          {/* Integrated Viewport Toolbar */}
          <div className="p-4 bg-[#0f1626]/90 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
            {/* Perspective View Selectors */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#151e30] border border-white/10 text-xs font-mono">
              <button
                type="button"
                onClick={() => setActivePerspective('global')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activePerspective === 'global' ? 'bg-[#f5f5f5] text-[#0f1626] font-bold' : 'text-white/70 hover:text-white'
                }`}
              >
                Global Overview
              </button>
              <button
                type="button"
                onClick={() => setActivePerspective('ocean')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activePerspective === 'ocean' ? 'bg-[#f5f5f5] text-[#0f1626] font-bold' : 'text-white/70 hover:text-white'
                }`}
              >
                Maritime Lanes
              </button>
              <button
                type="button"
                onClick={() => setActivePerspective('air')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activePerspective === 'air' ? 'bg-[#f5f5f5] text-[#0f1626] font-bold' : 'text-white/70 hover:text-white'
                }`}
              >
                Air Corridors
              </button>
              <button
                type="button"
                onClick={() => setActivePerspective('road')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activePerspective === 'road' ? 'bg-[#f5f5f5] text-[#0f1626] font-bold' : 'text-white/70 hover:text-white'
                }`}
              >
                Road Freight
              </button>
            </div>

            {/* Transport Mode Layer Filters */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-white/40 hidden sm:inline">MODE FILTER:</span>
              <div className="flex items-center gap-1 bg-[#151e30] p-1 rounded-xl border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className={`px-2.5 py-1 rounded-lg ${activeFilter === 'all' ? 'bg-white/20 text-white font-bold' : 'text-white/60 hover:text-white'}`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('ocean')}
                  className={`px-2 py-1 rounded-lg flex items-center gap-1 ${activeFilter === 'ocean' ? 'bg-[#b8b8b8]/30 text-[#f5f5f5] font-bold' : 'text-white/60 hover:text-white'}`}
                >
                  <Ship className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Ocean</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('air')}
                  className={`px-2 py-1 rounded-lg flex items-center gap-1 ${activeFilter === 'air' ? 'bg-[#f5f5f5]/30 text-[#f5f5f5] font-bold' : 'text-white/60 hover:text-white'}`}
                >
                  <Plane className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Air</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('road')}
                  className={`px-2 py-1 rounded-lg flex items-center gap-1 ${activeFilter === 'road' ? 'bg-[#f5f5f5]/30 text-[#f5f5f5] font-bold' : 'text-white/60 hover:text-white'}`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Road</span>
                </button>
              </div>

              {/* Speed Multiplier */}
              <div className="flex items-center gap-1 bg-[#151e30] p-1 rounded-xl border border-white/10 text-xs font-mono">
                <button
                  onClick={() => setSpeedMultiplier(1)}
                  className={`px-2 py-1 rounded-lg ${speedMultiplier === 1 ? 'bg-white/20 text-white font-bold' : 'text-white/50'}`}
                >
                  1x
                </button>
                <button
                  onClick={() => setSpeedMultiplier(2)}
                  className={`px-2 py-1 rounded-lg ${speedMultiplier === 2 ? 'bg-white/20 text-white font-bold' : 'text-white/50'}`}
                >
                  2x
                </button>
                <button
                  onClick={() => setSpeedMultiplier(5)}
                  className={`px-2 py-1 rounded-lg ${speedMultiplier === 5 ? 'bg-white/20 text-white font-bold' : 'text-white/50'}`}
                >
                  5x
                </button>
              </div>
            </div>
          </div>

          {/* Three.js 3D Canvas Scene Viewport */}
          <GlobalLogisticsScene
            activePerspective={activePerspective}
            onSelectEntity={(e) => setSelectedEntity(e)}
            selectedEntityId={selectedEntity?.id}
            speedMultiplier={speedMultiplier}
            activeFilter={activeFilter}
          />
        </div>

        {/* Live Active Entity Roster Grid (Quick Click to Inspect) */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#0f1626] border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-white/10">
              <span className="text-white/60 uppercase">Maritime Vessels</span>
              <span className="text-[#f5f5f5]">OCEAN FREIGHT</span>
            </div>
            <div className="space-y-2">
              {LOGISTICS_VEHICLES.filter((v) => v.mode === 'ocean').map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedEntity(v)}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs transition-colors flex items-center justify-between ${
                    selectedEntity?.id === v.id
                      ? 'bg-[#1d293d] border-[#f5f5f5] text-white'
                      : 'bg-[#151e30] border-white/5 text-white/80 hover:bg-[#182338]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Ship className="w-3.5 h-3.5 text-[#f5f5f5]" />
                    <span className="font-semibold">{v.name}</span>
                  </div>
                  <span className="font-mono text-[11px] text-white/50">{v.teuOrTonnage}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0f1626] border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-white/10">
              <span className="text-white/60 uppercase">Cargo Aircraft</span>
              <span className="text-[#f5f5f5]">AIR CORRIDORS</span>
            </div>
            <div className="space-y-2">
              {LOGISTICS_VEHICLES.filter((v) => v.mode === 'air').map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedEntity(v)}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs transition-colors flex items-center justify-between ${
                    selectedEntity?.id === v.id
                      ? 'bg-[#1d293d] border-[#f5f5f5] text-white'
                      : 'bg-[#151e30] border-white/5 text-white/80 hover:bg-[#182338]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Plane className="w-3.5 h-3.5 text-[#f5f5f5]" />
                    <span className="font-semibold">{v.name}</span>
                  </div>
                  <span className="font-mono text-[11px] text-white/50">{v.speedKmH} km/h</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0f1626] border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-white/10">
              <span className="text-white/60 uppercase">Ground Freight Trucks</span>
              <span className="text-[#f5f5f5]">ROAD LOGISTICS</span>
            </div>
            <div className="space-y-2">
              {LOGISTICS_VEHICLES.filter((v) => v.mode === 'road').map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedEntity(v)}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs transition-colors flex items-center justify-between ${
                    selectedEntity?.id === v.id
                      ? 'bg-[#1d293d] border-[#f5f5f5] text-white'
                      : 'bg-[#151e30] border-white/5 text-white/80 hover:bg-[#182338]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-[#f5f5f5]" />
                    <span className="font-semibold">{v.name}</span>
                  </div>
                  <span className="font-mono text-[11px] text-white/50">{v.teuOrTonnage}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Disruption Simulator Modal */}
      <DisruptionSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onApplyMitigation={handleMitigationApplied}
      />
    </section>
  );
};

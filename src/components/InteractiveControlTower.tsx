import React, { useState } from 'react';
import { GlobalLogisticsScene, ScenePerspective } from './GlobalLogisticsScene';
import { DisruptionSimulatorModal } from './DisruptionSimulatorModal';
import { LOGISTICS_VEHICLES, LOGISTICS_NODES } from '../data/logisticsNetwork';
import { LogisticsVehicle, LogisticsNode, TransportMode } from '../types/logistics';
import { useSiteConfig } from '../context/SiteConfigContext';
import {
  Ship,
  Plane,
  Truck,
  Compass,
  AlertTriangle,
  Zap,
  MapPin,
} from 'lucide-react';

export const InteractiveControlTower: React.FC = () => {
  const { activeConfig } = useSiteConfig();
  const hp = activeConfig.homepage;

  const [activePerspective, setActivePerspective] = useState<ScenePerspective>('global');
  const [activeFilter, setActiveFilter] = useState<TransportMode | 'all'>('all');
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [selectedEntity, setSelectedEntity] = useState<LogisticsVehicle | LogisticsNode | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [disruptionActive, setDisruptionActive] = useState<boolean>(false);
  const [activeDisruptionAlert, setActiveDisruptionAlert] = useState<string | null>(null);

  const handleMitigationApplied = (scenarioTitle: string, optionTitle: string) => {
    setDisruptionActive(true);
    setActiveDisruptionAlert(
      `Autonomous Mitigation Active: ${optionTitle} applied to "${scenarioTitle}". 3D Corridor rerouted.`
    );
  };

  return (
    <section id="network" className="py-24 bg-[var(--orion-canvas)] text-[var(--orion-text-primary)] border-b border-[var(--glass-border-subtle)] relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-badge text-[11px] font-mono uppercase tracking-widest text-[var(--orion-accent)] font-semibold">
              <Compass className="w-3.5 h-3.5" />
              <span>{hp.networkEyebrow}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] text-[var(--orion-text-primary)] leading-tight">
              {hp.networkTitle}
            </h2>
            <p className="text-sm sm:text-base text-[var(--orion-text-secondary)] leading-relaxed">
              {hp.networkSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setDisruptionActive((prev) => !prev)}
              className={`flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-xs transition-all cursor-pointer border ${
                disruptionActive
                  ? 'bg-amber-500 text-[#101820] border-amber-400 font-bold'
                  : 'bg-white text-[#111827] border-[#D5E1E8] hover:border-[#294D6B]'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>
                {disruptionActive
                  ? '3D Bypass Corridor: ACTIVE'
                  : 'Toggle 3D Disruption State'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsSimulatorOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-[var(--orion-text-primary)] text-[var(--orion-surface)] font-semibold text-xs hover:bg-[var(--orion-accent)] hover:text-white transition-all shadow-md cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-[#A8C2D2]" />
              <span>Open Scenario Solver</span>
            </button>
          </div>
        </div>

        {/* Telemetry Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 font-mono text-xs">
          <div className="p-5 rounded-2xl liquid-glass-card space-y-1">
            <span className="text-[10px] text-[var(--orion-text-muted)] font-mono uppercase tracking-wider block">ACTIVE MULTIMODAL FLEET</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[var(--orion-text-primary)] tabular-nums">216</span>
              <span className="text-[11px] text-[var(--orion-accent)] font-semibold">COMMERCIAL UNITS</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl liquid-glass-card space-y-1">
            <span className="text-[10px] text-[var(--orion-text-muted)] font-mono uppercase tracking-wider block">CONTAINER VOLUME IN-FLIGHT</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[var(--orion-text-primary)] tabular-nums">8,420</span>
              <span className="text-[11px] text-[var(--orion-accent)] font-semibold">TEU EQUIV</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl liquid-glass-card space-y-1">
            <span className="text-[10px] text-[var(--orion-text-muted)] font-mono uppercase tracking-wider block">NETWORK SLA INTEGRITY</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[var(--orion-text-primary)] tabular-nums">
                {disruptionActive ? '99.4%' : '98.4%'}
              </span>
              <span className="text-[11px] text-[var(--orion-accent)] font-semibold">
                {disruptionActive ? 'BYPASS PROTECTED' : 'NOMINAL'}
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl liquid-glass-card space-y-1">
            <span className="text-[10px] text-[var(--orion-text-muted)] font-mono uppercase tracking-wider block">ACTIVE EXCEPTIONS</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[var(--orion-text-primary)] tabular-nums">
                {disruptionActive ? '01' : '02'}
              </span>
              <span className="text-[11px] text-[var(--orion-accent)] font-semibold">
                {disruptionActive ? 'REROUTED' : 'TRIAGED'}
              </span>
            </div>
          </div>
        </div>

        {/* Active Disruption Alert Banner */}
        {activeDisruptionAlert && (
          <div className="mb-6 p-4 rounded-2xl bg-[#101820] border border-[#294D6B] text-white text-xs font-mono flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-[#7DD3FC] shrink-0" />
              <span>{activeDisruptionAlert}</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveDisruptionAlert(null)}
              className="text-[#A8C2D2] hover:text-white cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 3D Scene Viewport Frame */}
        <div className="rounded-3xl border border-[#D5E1E8] overflow-hidden shadow-[0_24px_60px_rgba(16,24,32,0.14)] relative bg-[#101820]">
          {/* Viewport Toolbar */}
          <div className="p-3.5 bg-[#101820] border-b border-white/10 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
            <div className="flex flex-wrap items-center gap-1 p-1 rounded-full bg-white/[0.05] border border-white/10">
              {(['global', 'ocean', 'air', 'road'] as ScenePerspective[]).map((persp) => (
                <button
                  key={persp}
                  type="button"
                  onClick={() => {
                    setSelectedEntity(null);
                    setActivePerspective(persp);
                  }}
                  className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer capitalize ${
                    activePerspective === persp && !selectedEntity
                      ? 'bg-white text-[#101820] font-bold'
                      : 'text-[#A8C2D2] hover:text-white'
                  }`}
                >
                  {persp === 'global'
                    ? 'Global Network'
                    : persp === 'ocean'
                      ? 'Ocean Freight'
                      : persp === 'air'
                        ? 'Air Cargo'
                        : 'Ground Logistics'}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Quick Hub Camera Jump Pills */}
              <div className="hidden xl:flex items-center gap-1 bg-white/[0.05] p-1 rounded-full border border-white/10">
                <span className="px-2 text-[10px] text-[#A8C2D2] flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  HUBS:
                </span>
                {LOGISTICS_NODES.slice(0, 5).map((node) => (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() =>
                      setSelectedEntity(
                        selectedEntity?.id === node.id ? null : node
                      )
                    }
                    className={`px-2.5 py-1 rounded-full text-[10px] cursor-pointer ${
                      selectedEntity?.id === node.id
                        ? 'bg-[#7DD3FC] text-[#101820] font-bold'
                        : 'text-[#A8C2D2] hover:text-white'
                    }`}
                  >
                    {node.code}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-white/[0.05] p-1 rounded-full border border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1 rounded-full cursor-pointer ${
                    activeFilter === 'all'
                      ? 'bg-white text-[#101820] font-bold'
                      : 'text-[#A8C2D2] hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('ocean')}
                  className={`px-3 py-1 rounded-full flex items-center gap-1 cursor-pointer ${
                    activeFilter === 'ocean'
                      ? 'bg-white text-[#101820] font-bold'
                      : 'text-[#A8C2D2] hover:text-white'
                  }`}
                >
                  <Ship className="w-3 h-3" />
                  <span className="hidden sm:inline">Ocean</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('air')}
                  className={`px-3 py-1 rounded-full flex items-center gap-1 cursor-pointer ${
                    activeFilter === 'air'
                      ? 'bg-white text-[#101820] font-bold'
                      : 'text-[#A8C2D2] hover:text-white'
                  }`}
                >
                  <Plane className="w-3 h-3" />
                  <span className="hidden sm:inline">Air</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('road')}
                  className={`px-3 py-1 rounded-full flex items-center gap-1 cursor-pointer ${
                    activeFilter === 'road'
                      ? 'bg-white text-[#101820] font-bold'
                      : 'text-[#A8C2D2] hover:text-white'
                  }`}
                >
                  <Truck className="w-3 h-3" />
                  <span className="hidden sm:inline">Road</span>
                </button>
              </div>

              <div className="flex items-center gap-1 bg-white/[0.05] p-1 rounded-full border border-white/10">
                {[1, 2, 5].map((mult) => (
                  <button
                    key={mult}
                    type="button"
                    onClick={() => setSpeedMultiplier(mult)}
                    className={`px-2.5 py-1 rounded-full cursor-pointer ${
                      speedMultiplier === mult
                        ? 'bg-white text-[#101820] font-bold'
                        : 'text-[#A8C2D2]'
                    }`}
                  >
                    {mult}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          <GlobalLogisticsScene
            activePerspective={activePerspective}
            onSelectEntity={(e) => setSelectedEntity(e)}
            selectedEntityId={selectedEntity?.id}
            speedMultiplier={speedMultiplier}
            activeFilter={activeFilter}
            disruptionActive={disruptionActive}
          />
        </div>

        {/* Fleet Directory Strip */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          {[
            { mode: 'ocean' as const, label: 'OCEAN FREIGHT', sub: '2 VESSELS IN TRANSIT', Icon: Ship },
            { mode: 'air' as const, label: 'AIR CORRIDORS', sub: '2 FLIGHTS EN ROUTE', Icon: Plane },
            { mode: 'road' as const, label: 'GROUND FREIGHT', sub: '2 ROAD FLEETS DISPATCHED', Icon: Truck },
          ].map(({ mode, label, sub, Icon }) => (
            <div
              key={mode}
              className="p-4 rounded-2xl liquid-glass-card space-y-2.5"
            >
              <div className="flex items-center justify-between text-[11px] pb-2 border-b border-[var(--glass-border-subtle)] text-[var(--orion-text-muted)]">
                <span className="font-bold text-[#294D6B]">{label}</span>
                <span>{sub}</span>
              </div>
              <div className="space-y-1.5">
                {LOGISTICS_VEHICLES.filter((v) => v.mode === mode).map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() =>
                      setSelectedEntity(selectedEntity?.id === v.id ? null : v)
                    }
                    className={`w-full p-2.5 rounded-xl border text-left transition-colors flex items-center justify-between cursor-pointer ${
                      selectedEntity?.id === v.id
                        ? 'bg-[#101820] border-[#101820] text-white'
                        : 'bg-[#F5F9FB] border-[#D5E1E8] text-[#111827] hover:border-[#294D6B]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className="w-3.5 h-3.5 text-[#294D6B]" />
                      <span className="truncate font-semibold">{v.name}</span>
                    </div>
                    <span className="text-[10px] opacity-75">
                      {mode === 'air' ? `${v.speedKmH} km/h` : v.teuOrTonnage}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <DisruptionSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onApplyMitigation={handleMitigationApplied}
      />
    </section>
  );
};

import React, { useState } from 'react';
import {
  Factory,
  Ship,
  Plane,
  Warehouse,
  Building2,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Compass,
} from 'lucide-react';

interface NetworkPoint {
  id: string;
  name: string;
  role: string;
  location: string;
  description: string;
  xPercent: number; // For plotting on interactive map canvas
  yPercent: number;
  highlight: string;
  icon: 'factory' | 'ship' | 'plane' | 'warehouse' | 'building';
}

const networkPoints: NetworkPoint[] = [
  {
    id: 'origin',
    name: 'Tier-1 Silicon & Sensor Foundries',
    role: 'Origin Component Fabrication',
    location: 'Taipei / Shenzhen Cluster',
    description:
      'Component assembly milestones, purchase order states, and critical raw materials tracked at source before dispatch.',
    xPercent: 12,
    yPercent: 62,
    highlight: '18,400 Sub-Assemblies Monitored',
    icon: 'factory',
  },
  {
    id: 'port',
    name: 'Deep-Water Gateway Port',
    role: 'Maritime Berth & Transshipment',
    location: 'Shanghai Gateway Berth 04',
    description:
      'Continuous satellite AIS tracking and berth queue simulation, automating terminal gate slots before container vessels arrive.',
    xPercent: 32,
    yPercent: 48,
    highlight: 'Automated Gate Appointments',
    icon: 'ship',
  },
  {
    id: 'airbridge',
    name: 'Geodesic Air Cargo Bridge',
    role: 'High-Velocity Intermodal Corridor',
    location: 'Dubai DWC Corridor',
    description:
      'ADS-B flight tracking with sub-minute reroute bypass capabilities, balancing freight speed and Scope 3 carbon impact.',
    xPercent: 54,
    yPercent: 28,
    highlight: 'Dynamic Transit Acceleration',
    icon: 'plane',
  },
  {
    id: 'hub',
    name: 'Automated Regional Hub',
    role: 'Multi-Echelon Fulfillment',
    location: 'Frankfurt Intermodal Center',
    description:
      'Real-time warehouse buffer calculations, dynamic cross-dock staging, and automated drayage dispatch.',
    xPercent: 74,
    yPercent: 52,
    highlight: 'Zero Stockout Exposure',
    icon: 'warehouse',
  },
  {
    id: 'plant',
    name: 'Final Assembly Plant',
    role: 'Production & Customer Demand',
    location: 'Enterprise Automotive Plant DE-02',
    description:
      'Synchronized parts delivery aligned with factory shift schedules, assembly line BOMs, and customer SLA commitments.',
    xPercent: 92,
    yPercent: 38,
    highlight: '100% On-Time Delivery Guarantee',
    icon: 'building',
  },
];

export const OneConnectedNetwork: React.FC = () => {
  const [activePointId, setActivePointId] = useState<string>('port');
  const activePoint = networkPoints.find((p) => p.id === activePointId) || networkPoints[1];

  return (
    <section id="network" className="py-24 sm:py-32 bg-[#F5F9FB] border-b border-[#D5E1E8] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14 space-y-4">
          <span className="text-xs font-semibold text-[#294D6B] uppercase tracking-wider block">
            Unified Global Topology
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.03em] text-[#111827] leading-[1.08]">
            One continuous operational picture.
          </h2>

          <p className="text-base sm:text-lg text-[#4A5568] leading-relaxed">
            From raw component foundries to deep-water container terminals, geodesic air bridges,
            and assembly lines — Orion-9 connects every node through an uninterrupted operational thread.
          </p>
        </div>

        {/* Expansive Interactive Network Environment */}
        <div className="rounded-3xl bg-white border border-[#D5E1E8] shadow-[0_20px_50px_rgba(20,40,65,0.06)] p-6 sm:p-10 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visual Topology Stage */}
            <div className="lg:col-span-8 relative h-[380px] sm:h-[460px] rounded-2xl bg-gradient-to-b from-[#F0F6FA] to-[#EAF4F8] border border-[#D5E1E8] overflow-hidden p-6 select-none">
              {/* Subtle Geodesic Grid Hairlines */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(circle, #294D6B 1px, transparent 1px)',
                  backgroundSize: '32px 32px',
                }}
              />

              {/* Continuous Animated SVG Route */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M 80 250 C 180 180, 240 220, 290 190 C 370 140, 440 90, 520 120 C 600 150, 680 220, 760 190 C 820 160, 880 140, 940 160"
                  fill="none"
                  stroke="#C5D8E6"
                  strokeWidth="3"
                  strokeDasharray="6 6"
                />
                <path
                  d="M 80 250 C 180 180, 240 220, 290 190 C 370 140, 440 90, 520 120 C 600 150, 680 220, 760 190 C 820 160, 880 140, 940 160"
                  fill="none"
                  stroke="#294D6B"
                  strokeWidth="2.5"
                  className="opacity-80"
                />
              </svg>

              {/* Interactive Node Markers */}
              {networkPoints.map((point) => {
                const isSelected = activePointId === point.id;
                return (
                  <button
                    key={point.id}
                    type="button"
                    onClick={() => setActivePointId(point.id)}
                    style={{
                      left: `${point.xPercent}%`,
                      top: `${point.yPercent}%`,
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 transition-all cursor-pointer group flex flex-col items-center focus:outline-hidden ${
                      isSelected ? 'scale-110' : 'hover:scale-105'
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-md ${
                        isSelected
                          ? 'bg-[#111827] text-white ring-4 ring-[#294D6B]/20 shadow-lg'
                          : 'bg-white text-[#294D6B] border border-[#D5E1E8] hover:border-[#294D6B]'
                      }`}
                    >
                      {point.icon === 'factory' && <Factory className="w-5 h-5" />}
                      {point.icon === 'ship' && <Ship className="w-5 h-5" />}
                      {point.icon === 'plane' && <Plane className="w-5 h-5" />}
                      {point.icon === 'warehouse' && <Warehouse className="w-5 h-5" />}
                      {point.icon === 'building' && <Building2 className="w-5 h-5" />}
                    </div>

                    <span
                      className={`mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap transition-all shadow-2xs ${
                        isSelected
                          ? 'bg-[#111827] text-white'
                          : 'bg-white/95 text-[#4A5568] border border-[#D5E1E8]'
                      }`}
                    >
                      {point.location.split('/')[0]}
                    </span>
                  </button>
                );
              })}

              <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 text-xs text-[#566575] bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-full border border-[#D5E1E8]">
                <Compass className="w-3.5 h-3.5 text-[#294D6B]" />
                <span>Select any node on the corridor to inspect operational flow</span>
              </div>
            </div>

            {/* Focused Information Panel for Selected Node */}
            <div className="lg:col-span-4 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#294D6B] uppercase tracking-wider block">
                  {activePoint.role}
                </span>

                <h3 className="text-2xl font-bold text-[#111827] tracking-tight">
                  {activePoint.name}
                </h3>

                <p className="text-xs text-[#566575] font-medium">
                  Location: {activePoint.location}
                </p>
              </div>

              <p className="text-sm text-[#4A5568] leading-relaxed">
                {activePoint.description}
              </p>

              <div className="p-4 rounded-2xl bg-[#F5F9FB] border border-[#D5E1E8] space-y-1">
                <span className="text-[11px] font-semibold text-[#111827] block">
                  Live Operational Invariant:
                </span>
                <p className="text-xs text-[#294D6B] font-medium">
                  {activePoint.highlight}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-[#566575]">
                <span>Continuous Corridor Status:</span>
                <span className="font-semibold text-emerald-600">● 100% Synchronized</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

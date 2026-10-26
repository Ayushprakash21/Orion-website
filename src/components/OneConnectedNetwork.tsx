import React, { useState } from 'react';
import {
  Factory,
  Ship,
  Plane,
  Warehouse,
  Building,
  CheckCircle2,
  ArrowRight,
  Radio,
  Sparkles,
} from 'lucide-react';

interface NetworkNode {
  id: string;
  step: string;
  title: string;
  category: string;
  location: string;
  summary: string;
  telemetry: {
    label: string;
    value: string;
  }[];
  connectedTo: string;
}

const networkNodes: NetworkNode[] = [
  {
    id: 'node-suppliers',
    step: '01',
    title: 'Tier-1 & Tier-2 Suppliers',
    category: 'ORIGIN FOUNDRIES',
    location: 'Shenzhen / Taipei / Penang',
    summary:
      'Continuous component fabrication milestones, purchase order states, and critical raw material buffers synchronized at the point of origin.',
    telemetry: [
      { label: 'Foundry Status', value: '100% Nominal' },
      { label: 'Active POs', value: '1,420 Tracked' },
      { label: 'Lead Variance', value: '±0.8 Days' },
    ],
    connectedTo: 'Deep-Water Ports',
  },
  {
    id: 'node-ports',
    step: '02',
    title: 'Deep-Water Superports',
    category: 'MARITIME GATEWAYS',
    location: 'Shanghai / Singapore / Rotterdam',
    summary:
      'Satellite AIS tracking, berth queue simulation, and automated gate appointments for container vessels before arrival.',
    telemetry: [
      { label: 'Berth Dwell', value: '3.8 Hours' },
      { label: 'Gate Clearance', value: 'Automated' },
      { label: 'TEU Volume', value: '48,200 Locked' },
    ],
    connectedTo: 'Intermodal Corridors',
  },
  {
    id: 'node-corridors',
    step: '03',
    title: 'Intermodal Air & Rail Corridors',
    category: 'LONG-HAUL TRANSIT',
    location: 'Dubai Sea-Air / Eurasian Rail',
    summary:
      'Real-time transit state tracking across geodesic flight arcs and rail networks, providing sub-minute chokepoint bypass capabilities.',
    telemetry: [
      { label: 'Flight Tracking', value: 'ADS-B Geodesic' },
      { label: 'Corridor Health', value: '100% Uncongested' },
      { label: 'Bypass Window', value: '< 180 Seconds' },
    ],
    connectedTo: 'Regional Fulfillment',
  },
  {
    id: 'node-warehouses',
    step: '04',
    title: 'Regional Fulfillment Hubs',
    category: 'INVENTORY BUFFERS',
    location: 'Frankfurt / Chicago / Tokyo',
    summary:
      'Multi-echelon safety stock monitoring, real-time burn-rate calculations, and automated cross-dock staging allocations.',
    telemetry: [
      { label: 'Stock Exposure', value: '0 Critical Gaps' },
      { label: 'Buffer Health', value: '99.4% Protected' },
      { label: 'WMS Sync', value: 'Real-Time gRPC' },
    ],
    connectedTo: 'Customer Delivery',
  },
  {
    id: 'node-demand',
    step: '05',
    title: 'Assembly & Customer Demand',
    category: 'DESTINATION PRODUCTION',
    location: 'Enterprise Manufacturing Plants',
    summary:
      'Deterministic delivery commitments reconciled against factory shift schedules, assembly line BOMs, and customer SLAs.',
    telemetry: [
      { label: 'Line Stoppage Risk', value: '0.00%' },
      { label: 'SLA Integrity', value: '99.8% On-Time' },
      { label: 'Audit Trail', value: 'Cryptographic' },
    ],
    connectedTo: 'Closed Loop',
  },
];

export const OneConnectedNetwork: React.FC = () => {
  const [activeNodeId, setActiveNodeId] = useState<string>('node-corridors');
  const activeNode = networkNodes.find((n) => n.id === activeNodeId) || networkNodes[2];

  return (
    <section id="network" className="py-24 sm:py-32 bg-[#F5F9FB] border-b border-[#D5E1E8] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Section Header */}
        <div className="max-w-3xl mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#D5E1E8] text-xs font-mono text-[#294D6B]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#294D6B]" />
            <span className="font-semibold text-[#111827]">02 / GLOBAL TOPOLOGY</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.03em] text-[#111827] leading-[1.08]">
            One Connected Physical Picture.
          </h2>

          <p className="text-base sm:text-lg text-[#4A5568] leading-relaxed">
            From raw semiconductor fabs in Asia to intermodal European rail hubs and automotive
            assembly lines, Orion-9 unifies the complete physical route into one living operational picture.
          </p>
        </div>

        {/* Coherent Connected Timeline & Route Visualization */}
        <div className="relative mb-12">
          {/* Visual Route Track */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-[#D5E1E8] -translate-y-1/2 z-0" />

          {/* 5 Network Nodes Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
            {networkNodes.map((node, index) => {
              const isActive = activeNodeId === node.id;
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setActiveNodeId(node.id)}
                  className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? 'bg-white border-[#294D6B] shadow-[0_12px_30px_rgba(41,77,107,0.12)] scale-[1.02]'
                      : 'bg-white/80 border-[#D5E1E8] hover:bg-white hover:border-[#294D6B]/40 shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                          isActive
                            ? 'bg-[#294D6B] text-white'
                            : 'bg-[#EAF4F8] text-[#566575]'
                        }`}
                      >
                        {node.step}
                      </span>
                      <span className="text-[10px] text-[#566575] font-semibold uppercase">
                        {node.category.split(' ')[0]}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#111827] leading-snug">
                      {node.title}
                    </h4>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#D5E1E8]/70 text-[11px] text-[#566575] flex items-center justify-between">
                    <span>{node.location.split('/')[0]}</span>
                    <span
                      className={`text-[10px] font-mono font-semibold ${
                        isActive ? 'text-[#294D6B]' : 'text-slate-400'
                      }`}
                    >
                      {isActive ? '● ACTIVE' : 'INSPECT'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Operational Inspection Card for Selected Node */}
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#D5E1E8] shadow-[0_16px_40px_rgba(20,40,65,0.06)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF4F8] text-xs font-mono text-[#294D6B]">
              <span className="font-semibold">NODE {activeNode.step}</span>
              <span>/</span>
              <span>{activeNode.location}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">
              {activeNode.title}
            </h3>

            <p className="text-base text-[#4A5568] leading-relaxed max-w-xl">
              {activeNode.summary}
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs font-mono text-[#294D6B]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Downstream Synced Route:</span>
              <span className="font-semibold text-[#111827]">{activeNode.connectedTo}</span>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#F5F9FB] rounded-2xl p-6 border border-[#D5E1E8] space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between text-[#566575] border-b border-[#D5E1E8] pb-3">
              <span className="font-bold text-[#111827]">LIVE TELEMETRY STREAM</span>
              <span className="text-[#294D6B] flex items-center gap-1">
                <Radio className="w-3 h-3 text-[#294D6B] animate-pulse" />
                VERIFIED LOCK
              </span>
            </div>

            <div className="space-y-3">
              {activeNode.telemetry.map((t, idx) => (
                <div
                  key={t.label}
                  className="flex items-center justify-between py-1.5 border-b border-[#D5E1E8]/50 last:border-0"
                >
                  <span className="text-[#566575]">{t.label}:</span>
                  <span className="font-bold text-[#111827] text-sm">{t.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

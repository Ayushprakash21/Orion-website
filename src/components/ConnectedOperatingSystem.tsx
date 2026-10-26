import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Cpu } from 'lucide-react';

interface CoreModule {
  id: string;
  number: string;
  title: string;
  tagline: string;
  description: string;
  technicalCapabilities: string[];
  dataProtocols: string;
}

const coreModules: CoreModule[] = [
  {
    id: 'mod-integration',
    number: '01',
    title: 'Integration Fabric',
    tagline: 'Connect enterprise systems without custom middleware.',
    description:
      'Bidirectional connectors to legacy ERPs, modern warehouse management systems (WMS), carrier telemetry streams, and IoT sensor networks.',
    technicalCapabilities: [
      'SAP & Oracle bi-directional sync',
      'EDI 850 / 856 / 304 ingestion',
      'Sub-second event deduplication',
    ],
    dataProtocols: 'REST, GraphQL, Kafka, gRPC, AS2',
  },
  {
    id: 'mod-masterdata',
    number: '02',
    title: 'Master Data Intelligence',
    tagline: 'A canonical schema for global enterprise entities.',
    description:
      'Harmonizes orders, line items, part numbers, bills of lading, and multi-tier supplier identifiers into an unambiguous operational graph.',
    technicalCapabilities: [
      'Cross-system entity resolution',
      'BOM multi-echelon mapping',
      'Cryptographic state integrity',
    ],
    dataProtocols: 'JSON-Schema, Protocol Buffers, W3C DID',
  },
  {
    id: 'mod-inventory',
    number: '03',
    title: 'Inventory Intelligence',
    tagline: 'Real-time multi-echelon stock exposure calculation.',
    description:
      'Monitors stock in-transit, safety buffers, lead-time variances, and demand drift across global fulfillment hubs and factory staging docks.',
    technicalCapabilities: [
      'Dynamic safety stock optimization',
      'In-transit buffer burn rates',
      'Stockout risk projection',
    ],
    dataProtocols: 'Continuous streaming state machines',
  },
  {
    id: 'mod-visibility',
    number: '04',
    title: 'Shipment Visibility',
    tagline: 'Track physical movements across sea, air, and land.',
    description:
      'Unifies carrier AIS radar, flight telemetry, and telematics to calculate accurate estimated times of arrival and port congestion dwell intervals.',
    technicalCapabilities: [
      'Geodesic flight arc tracking',
      'Port berth queue prediction',
      'Automated geofence check-ins',
    ],
    dataProtocols: 'AIS Satellite, ADS-B, GPS Telematics',
  },
  {
    id: 'mod-risk',
    number: '05',
    title: 'Supply Chain Risk',
    tagline: 'Detect vulnerabilities before disruptions compound.',
    description:
      'Evaluates geopolitical choke-points, extreme weather forecasts, labor actions, and carrier capacity strain to calculate real-time vulnerability indices.',
    technicalCapabilities: [
      'Multi-tier dependency scanning',
      'Corridor bottleneck alerts',
      'Lead-time variance anomaly triage',
    ],
    dataProtocols: 'NOAA Weather Feeds, Port Authority AIS',
  },
  {
    id: 'mod-decision',
    number: '06',
    title: 'Decision Intelligence',
    tagline: 'Evaluate multi-objective operational trade-offs.',
    description:
      'Mathematical solvers compare expedite costs against customer SLA penalties and carbon metrics to rank candidate mitigation pathways.',
    technicalCapabilities: [
      'Cost vs Speed optimization curves',
      'SLA penalty minimization',
      'Monte Carlo stress testing',
    ],
    dataProtocols: 'Linear / Integer Mathematical Solvers',
  },
  {
    id: 'mod-automation',
    number: '07',
    title: 'Operational Automation',
    tagline: 'Governed workflow execution across partner networks.',
    description:
      'Executes approved resolutions directly: re-routes purchase orders, updates carrier bookings, and schedules dock appointments with full auditability.',
    technicalCapabilities: [
      'Policy-bounded execution loops',
      'Automated hold thresholds',
      'Two-person sign-off verification',
    ],
    dataProtocols: 'Idempotent Webhook Dispatches, EDI 304',
  },
  {
    id: 'mod-copilot',
    number: '08',
    title: 'Operational Reasoning Engine',
    tagline: 'Contextual root-cause synthesis for operations teams.',
    description:
      'Synthesizes complex network exceptions, traces upstream bill-of-material dependencies, and guides operations teams through scenario evaluation.',
    technicalCapabilities: [
      'Deterministic dependency tracing',
      'Bounded execution guardrails',
      'Historical incident lineage',
    ],
    dataProtocols: 'Graph Traversal & State Solvers',
  },
];

export const ConnectedOperatingSystem: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<CoreModule>(coreModules[0]);

  return (
    <section id="os-modules" className="py-24 bg-[#F5F9FB] border-b border-[#D5E1E8] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#D5E1E8] text-[11px] font-mono uppercase tracking-widest text-[#294D6B] font-semibold">
            <Cpu className="w-3.5 h-3.5" />
            <span>THE PLATFORM ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] text-[#111827] leading-tight">
            One Connected Operating System.
          </h2>
          <p className="text-sm sm:text-base text-[#566575] leading-relaxed">
            Eight interconnected modules working in unison to transform disconnected logistics events into coordinated, governed decisions.
          </p>
        </div>

        {/* 8 Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {coreModules.map((mod) => {
            const isSelected = selectedModule.id === mod.id;
            return (
              <div
                key={mod.id}
                onClick={() => setSelectedModule(mod)}
                className={`p-6 rounded-3xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#101820] text-white border-[#101820] shadow-[0_20px_50px_rgba(16,24,32,0.18)]'
                    : 'bg-white text-[#111827] border-[#D5E1E8] hover:border-[#294D6B]/50 shadow-2xs'
                }`}
              >
                <div>
                  <div
                    className={`flex items-center justify-between pb-2.5 border-b mb-3 font-mono text-[10px] ${
                      isSelected ? 'border-white/15 text-[#A8C2D2]' : 'border-[#D5E1E8] text-[#566575]'
                    }`}
                  >
                    <span>MODULE {mod.number}</span>
                    {isSelected && <span className="text-white font-bold">ACTIVE</span>}
                  </div>

                  <h3 className="text-base font-bold tracking-tight mb-2">{mod.title}</h3>

                  <p
                    className={`text-xs leading-relaxed mb-4 ${
                      isSelected ? 'text-[#A8C2D2]' : 'text-[#566575]'
                    }`}
                  >
                    {mod.description}
                  </p>
                </div>

                <div
                  className={`pt-3 border-t flex items-center justify-between font-mono text-[10px] ${
                    isSelected ? 'border-white/15 text-white' : 'border-[#D5E1E8] text-[#294D6B]'
                  }`}
                >
                  <span className="truncate pr-2">{mod.tagline}</span>
                  <ArrowRight
                    className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                      isSelected ? 'translate-x-1 text-[#A8C2D2]' : ''
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Module Inspector Bar */}
        <div className="mt-8 p-6 sm:p-8 rounded-3xl bg-white border border-[#D5E1E8] shadow-[0_12px_32px_rgba(16,24,32,0.04)] font-mono text-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#D5E1E8]">
            <div className="flex items-center gap-2">
              <span className="text-[#566575]">INSPECTING MODULE:</span>
              <span className="text-[#111827] font-bold uppercase">{selectedModule.title}</span>
            </div>
            <div className="text-[#566575] text-[11px]">
              DATA PROTOCOLS: <span className="text-[#294D6B] font-bold">{selectedModule.dataProtocols}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedModule.technicalCapabilities.map((cap, cIdx) => (
              <div
                key={cIdx}
                className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-[#F5F9FB] border border-[#D5E1E8] text-[#111827] font-sans font-medium"
              >
                <CheckCircle2 className="w-4 h-4 text-[#294D6B] shrink-0" />
                <span className="text-xs">{cap}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';
import {
  Cpu,
  ShieldCheck,
  ArrowRight,
  Server,
  Cable,
  CheckCircle2,
} from 'lucide-react';

interface ArchitectureLayer {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  technologies: string[];
  latency: string;
  throughput: string;
}

const ARCHITECTURE_LAYERS: ArchitectureLayer[] = [
  {
    id: 'layer-7',
    number: '07',
    title: 'Autonomous Execution & Actuation Layer',
    subtitle: 'Closed-loop multi-agent dispatch & API webhooks',
    description:
      'Direct actuation into port gate systems, carrier booking APIs, warehouse management dispatchers, and customs clearance queues with cryptographic non-repudiation.',
    technologies: [
      'EDI 214/304/315',
      'REST / GraphQL Gateways',
      'Autonomous Agent Runtime',
      'mTLS Non-repudiation',
    ],
    latency: '< 180ms',
    throughput: '42,000 tx/sec',
  },
  {
    id: 'layer-6',
    number: '06',
    title: 'Decision Intelligence & Multi-Objective Solver',
    subtitle: 'Stochastic optimization & constrained graph routing',
    description:
      'Dynamic trade-off curve calculation balancing landed cost, customer SLA penalties, emissions profile (Scope 3 GHG), and carrier reliability weights in real time.',
    technologies: [
      'Mixed-Integer Linear Programming',
      'Graph Neural Networks',
      'Monte Carlo Simulation',
      'Pareto Frontier Engine',
    ],
    latency: '< 650ms',
    throughput: '8,500 scenarios/sec',
  },
  {
    id: 'layer-5',
    number: '05',
    title: 'Digital Twin & Global Graph Fabric',
    subtitle: 'Unified operational topology and state machine',
    description:
      'Continuously updated graph model representing every port berth, rail ramp, highway corridor, SKU container, and customs border as a real-time state machine.',
    technologies: [
      'Temporal Graph Database',
      'Distributed Actor System',
      'Event Sourcing',
      'Geospatial H3 Hexagonal Grid',
    ],
    latency: '< 45ms',
    throughput: '320,000 nodes/sec',
  },
  {
    id: 'layer-4',
    number: '04',
    title: 'Real-Time Streaming & Complex Event Processing',
    subtitle: 'Telemetry ingestion, geofence triggers & AIS/ADS-B pipelines',
    description:
      'High-throughput stream processing engine parsing sub-second telemetry across 180,000+ active vessels, 65,000+ cargo aircraft, and 450,000+ GPS IoT telematics trackers.',
    technologies: [
      'Apache Kafka Backbone',
      'Flink Streaming CEP',
      'Protobuf Serialization',
      'Edge Ingestion Relays',
    ],
    latency: '< 12ms',
    throughput: '1.4M events/sec',
  },
  {
    id: 'layer-3',
    number: '03',
    title: 'Semantic Normalization & Canonical Schema Engine',
    subtitle: 'Heterogeneous data homogenization and entity resolution',
    description:
      'Translates legacy EDIFACT, ANSI X12, flat files, and bespoke carrier JSON formats into unified canonical supply chain ontologies without data loss.',
    technologies: [
      'Semantic Schema Registry',
      'Probabilistic Entity Matching',
      'JSON-LD Ontologies',
      'Automated EDI Transpiler',
    ],
    latency: '< 25ms',
    throughput: '95,000 msgs/sec',
  },
  {
    id: 'layer-2',
    number: '02',
    title: 'Universal Enterprise Ingestion & ERP Connectors',
    subtitle: 'Certified enterprise integrations and bi-directional synchronizers',
    description:
      'Zero-code native sync connectors for SAP S/4HANA, Oracle SCM Cloud, Blue Yonder, Manhattan Associates, Descartes, and Flexport with bidirectional state hydration.',
    technologies: [
      'SAP NetWeaver RFC',
      'Oracle Integration Cloud',
      'Change Data Capture (CDC)',
      'Kafka Connect Clusters',
    ],
    latency: '< 120ms',
    throughput: '500+ connectors',
  },
  {
    id: 'layer-1',
    number: '01',
    title: 'Zero-Trust Infrastructure & Sovereign Boundary',
    subtitle: 'SOC2 Type II, ISO 27001, and regional data residency',
    description:
      'End-to-end envelope encryption, role-based hardware security modules, partitioned multi-region clusters, and air-gapped sovereign cloud deployments.',
    technologies: [
      'AES-256-GCM Hardware HSM',
      'eBPF Kernel Network Isolation',
      'Kubernetes Multi-Cluster',
      'GDPR/ITAR Sovereign Zones',
    ],
    latency: 'Sub-millisecond overhead',
    throughput: 'Enterprise SLA 99.99%',
  },
];

const ECOSYSTEM_INTEGRATIONS = [
  { name: 'SAP S/4HANA', category: 'Enterprise ERP', badge: 'Certified Partner' },
  { name: 'Oracle SCM Cloud', category: 'Enterprise ERP', badge: 'Bidirectional Sync' },
  { name: 'Blue Yonder', category: 'Supply Chain Planning', badge: 'Native Adapter' },
  { name: 'Manhattan Associates', category: 'WMS & Yard Management', badge: 'Sub-second Stream' },
  { name: 'Descartes Systems', category: 'Customs & Compliance', badge: 'Automated Filing' },
  { name: 'Maersk API & EDIFACT', category: 'Ocean Carrier Telemetry', badge: 'Direct AIS Feed' },
  { name: 'MSC Direct Line', category: 'Ocean Carrier Telemetry', badge: 'Real-time AIS Link' },
  { name: 'IATA Cargo-XML', category: 'Air Freight Exchange', badge: 'AWB Validation' },
  { name: 'project44 / FourKites', category: 'Visibility Aggregators', badge: 'Cross-Network Relay' },
  { name: 'Geotab / Samsara', category: 'Fleet Telematics IoT', badge: 'Sub-minute GPS Push' },
  { name: 'Salesforce OMS', category: 'Order Management', badge: 'Fulfillment Webhooks' },
  { name: 'Snowflake / Databricks', category: 'Analytics Lakehouse', badge: 'Zero-ETL Share' },
];

export const ArchitectureConnectivity: React.FC = () => {
  const { activeConfig } = useSiteConfig();
  const hp = activeConfig.homepage;
  const [selectedLayerId, setSelectedLayerId] = useState<string>('layer-6');
  const selectedLayer =
    ARCHITECTURE_LAYERS.find((l) => l.id === selectedLayerId) || ARCHITECTURE_LAYERS[1];

  return (
    <section
      id="architecture"
      className="relative py-24 lg:py-32 bg-[#EAF4F8] border-b border-[#D5E1E8] overflow-hidden"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#D5E1E8] text-[#294D6B] font-mono text-[11px] font-semibold uppercase tracking-widest">
            <Cable className="w-3.5 h-3.5" />
            <span>{hp.integrationsEyebrow}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] text-[#111827] leading-tight">
            {hp.integrationsTitle}
          </h2>
          <p className="text-sm sm:text-base text-[#566575] leading-relaxed">
            {hp.integrationsSubtitle}
          </p>
        </div>

        {/* Layer Stack Interactive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-20">
          {/* Left: Layer Selector Stack */}
          <div className="lg:col-span-6 space-y-2.5">
            <div className="text-xs font-mono text-[#566575] uppercase tracking-widest mb-3 flex items-center justify-between">
              <span>Stack Hierarchy (Top to Base)</span>
              <span className="text-[#294D6B] font-bold">Layer 07 → 01</span>
            </div>

            {ARCHITECTURE_LAYERS.map((layer) => {
              const isSelected = layer.id === selectedLayerId;
              return (
                <button
                  key={layer.id}
                  type="button"
                  onClick={() => setSelectedLayerId(layer.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between group cursor-pointer ${
                    isSelected
                      ? 'bg-[#101820] text-white border-[#101820] shadow-[0_14px_30px_rgba(16,24,32,0.14)]'
                      : 'bg-white text-[#111827] border-[#D5E1E8] hover:border-[#294D6B]/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`font-mono text-xs px-2.5 py-1 rounded-xl border ${
                        isSelected
                          ? 'bg-[#294D6B] text-white border-[#A8C2D2]/30 font-bold'
                          : 'bg-[#F5F9FB] text-[#294D6B] border-[#D5E1E8] font-semibold'
                      }`}
                    >
                      {layer.number}
                    </span>
                    <div>
                      <div className="text-sm font-bold">{layer.title}</div>
                      <div
                        className={`text-xs font-mono mt-0.5 truncate max-w-[260px] sm:max-w-md ${
                          isSelected ? 'text-[#A8C2D2]' : 'text-[#566575]'
                        }`}
                      >
                        {layer.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-3">
                    <span
                      className={`text-[11px] font-mono px-2.5 py-1 rounded-full ${
                        isSelected
                          ? 'bg-white/10 text-white'
                          : 'bg-[#F5F9FB] text-[#294D6B] border border-[#D5E1E8]'
                      }`}
                    >
                      {layer.latency}
                    </span>
                    <ArrowRight
                      className={`w-4 h-4 transition-transform ${
                        isSelected
                          ? 'text-[#A8C2D2] translate-x-1'
                          : 'text-[#566575] group-hover:text-[#111827]'
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Selected Layer Deep Dive */}
          <div className="lg:col-span-6 bg-white border border-[#D5E1E8] rounded-3xl p-7 sm:p-9 shadow-[0_20px_50px_rgba(16,24,32,0.06)]">
            <div className="flex items-center justify-between border-b border-[#D5E1E8] pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#294D6B]" />
                <span className="font-mono text-xs text-[#294D6B] font-bold uppercase tracking-widest">
                  Layer Inspector · {selectedLayer.number}
                </span>
              </div>
              <div className="font-mono text-xs text-[#566575]">ACTIVE SUBSYSTEM</div>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-[#111827] mb-1.5">
              {selectedLayer.title}
            </h3>
            <p className="text-xs font-mono text-[#294D6B] font-semibold mb-6">
              {selectedLayer.subtitle}
            </p>

            <p className="text-[#566575] text-sm leading-relaxed mb-8 bg-[#F5F9FB] p-5 border border-[#D5E1E8] rounded-2xl">
              {selectedLayer.description}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-[#F5F9FB] border border-[#D5E1E8] rounded-2xl">
                <div className="text-xs font-mono text-[#566575] uppercase">Operational Latency</div>
                <div className="text-xl font-mono font-bold text-[#111827] mt-1">
                  {selectedLayer.latency}
                </div>
              </div>
              <div className="p-4 bg-[#F5F9FB] border border-[#D5E1E8] rounded-2xl">
                <div className="text-xs font-mono text-[#566575] uppercase">System Throughput</div>
                <div className="text-xl font-mono font-bold text-[#294D6B] mt-1">
                  {selectedLayer.throughput}
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs font-mono text-[#566575] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#294D6B]" />
                <span>Underlying Protocols &amp; Frameworks</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedLayer.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-3.5 py-1.5 bg-[#EAF4F8] border border-[#D5E1E8] rounded-full text-xs font-mono text-[#111827] font-medium flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#294D6B]" />
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#D5E1E8] flex items-center justify-between text-xs text-[#566575] font-mono">
              <span className="flex items-center gap-1.5 text-[#294D6B] font-semibold">
                <ShieldCheck className="w-4 h-4" />
                Deterministic Verification Enabled
              </span>
              <span>ISO 27001 / SOC 2 Type II</span>
            </div>
          </div>
        </div>

        {/* Certified Enterprise Ingestion Matrix */}
        <div className="bg-white border border-[#D5E1E8] rounded-3xl p-7 sm:p-9 shadow-[0_16px_40px_rgba(16,24,32,0.04)]">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#D5E1E8] pb-6 mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 font-mono text-xs text-[#294D6B] font-bold uppercase tracking-wider mb-2">
                <Cable className="w-3.5 h-3.5" />
                Certified Ingestion Ecosystem
              </div>
              <h3 className="text-2xl font-bold text-[#111827] tracking-tight">
                Integrates into existing ERP, WMS, TMS, and carrier stacks in hours.
              </h3>
            </div>
            <p className="text-xs font-mono text-[#566575] max-w-sm">
              Non-invasive CDC listeners and bidirectional webhooks maintain synchronization without altering host enterprise schemas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ECOSYSTEM_INTEGRATIONS.map((connector) => (
              <div
                key={connector.name}
                className="p-4 bg-[#F5F9FB] border border-[#D5E1E8] rounded-2xl hover:border-[#294D6B]/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-[11px] font-mono text-[#566575] uppercase">
                    {connector.category}
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#294D6B]" />
                </div>
                <div className="text-sm font-bold text-[#111827]">{connector.name}</div>
                <div className="mt-3 text-[11px] font-mono text-[#294D6B] bg-white px-2.5 py-0.5 border border-[#D5E1E8] rounded-full inline-block font-semibold">
                  {connector.badge}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between p-4 bg-[#101820] text-white rounded-2xl gap-4">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-[#A8C2D2] shrink-0" />
              <div className="text-xs text-[#A8C2D2]">
                <span className="font-bold text-white">Custom In-House Logistics Stack?</span> Orion-9 provides native gRPC/REST SDKs and OpenAPI 3.1 definitions for immediate pipeline mapping.
              </div>
            </div>
            <span className="font-mono text-xs text-white shrink-0 px-3.5 py-1.5 bg-[#294D6B] rounded-full font-semibold">
              SLO: 99.995% Uptime
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

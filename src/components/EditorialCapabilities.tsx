import React from 'react';

export const EditorialCapabilities: React.FC = () => {
  const capabilities = [
    {
      id: 'rapid-activation',
      tag: 'CAPABILITY · 01',
      title: 'Rapid Activation',
      description:
        'Connect ERP, TMS, WMS, and satellite AIS streams in hours—deploying a live canonical operating picture without months of brittle custom integration.',
      illustration: (
        <svg viewBox="0 0 120 120" className="w-24 h-24 sm:w-28 sm:h-28" fill="none" aria-hidden="true">
          {/* Isometric Base Plinth */}
          <polygon
            points="60,72 102,50 60,28 18,50"
            fill="currentColor"
            className="text-sky-100 dark:text-sky-950/60"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <polygon
            points="18,50 60,72 60,92 18,70"
            fill="currentColor"
            className="text-sky-200 dark:text-sky-900/60"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <polygon
            points="102,50 60,72 60,92 102,70"
            fill="currentColor"
            className="text-white dark:text-slate-800"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          {/* Isometric Elevated Telemetry Core */}
          <polygon
            points="60,52 84,39 60,26 36,39"
            fill="#0284C7"
            fillOpacity="0.25"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          {/* Fast-Response Lightning / Signal Vector */}
          <path
            d="M64 16L48 38H62L55 58L75 34H61L64 16Z"
            fill="#0284C7"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          {/* Corner Telemetry Pins */}
          <circle cx="32" cy="50" r="3" fill="currentColor" />
          <circle cx="88" cy="50" r="3" fill="#0284C7" />
          <circle cx="60" cy="64" r="3" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: 'rigorous-resolution',
      tag: 'CAPABILITY · 02',
      title: 'Rigorous Graph Resolution',
      description:
        'Every purchase order, container manifest, and Tier-N sub-assembly lot is continuously reconciled across 142 global superports and air hubs.',
      illustration: (
        <svg viewBox="0 0 120 120" className="w-24 h-24 sm:w-28 sm:h-28" fill="none" aria-hidden="true">
          <polygon
            points="60,94 100,73 60,52 20,73"
            fill="currentColor"
            className="text-sky-100 dark:text-sky-950/60"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <polygon
            points="60,76 100,55 60,34 20,55"
            fill="currentColor"
            className="text-white dark:text-slate-800"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <polygon
            points="60,58 92,41 60,24 28,41"
            fill="currentColor"
            className="text-sky-200 dark:text-sky-900/60"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <line
            x1="60"
            y1="14"
            x2="60"
            y2="84"
            stroke="#0284C7"
            strokeWidth="2.2"
            strokeDasharray="3 3"
          />
          <ellipse
            cx="60"
            cy="41"
            rx="14"
            ry="7.5"
            fill="#0284C7"
            fillOpacity="0.28"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <circle cx="60" cy="41" r="3.2" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: 'governed-decisions',
      tag: 'CAPABILITY · 03',
      title: 'Governed Decisions',
      description:
        'Stochastic solvers evaluate 8,500+ reroute scenarios inside deterministic Zero-Trust policy bounds with cryptographic sign-off verification.',
      illustration: (
        <svg viewBox="0 0 120 120" className="w-24 h-24 sm:w-28 sm:h-28" fill="none" aria-hidden="true">
          <polygon
            points="60,72 102,50 60,28 18,50"
            fill="currentColor"
            className="text-sky-100 dark:text-sky-950/60"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <polygon
            points="18,50 60,72 60,92 18,70"
            fill="currentColor"
            className="text-sky-200 dark:text-sky-900/60"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <polygon
            points="102,50 60,72 60,92 102,70"
            fill="currentColor"
            className="text-white dark:text-slate-800"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M60 22L78 30V48C78 60 60 68 60 68C60 68 42 60 42 48V30L60 22Z"
            fill="#0284C7"
            fillOpacity="0.22"
            stroke="#0284C7"
            strokeWidth="1.8"
          />
          <path
            d="M52 45L58 51L68 39"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: 'controlled-outcomes',
      tag: 'CAPABILITY · 04',
      title: 'Controlled Outcomes',
      description:
        'Predictable arrival windows, protected factory assembly buffers, and lower expedite spend across every maritime, air, and rail corridor.',
      illustration: (
        <svg viewBox="0 0 120 120" className="w-24 h-24 sm:w-28 sm:h-28" fill="none" aria-hidden="true">
          <polygon
            points="60,88 104,65 60,42 16,65"
            fill="currentColor"
            className="text-sky-100 dark:text-sky-950/60"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <line x1="38" y1="53.5" x2="82" y2="76.5" stroke="currentColor" strokeWidth="1.2" />
          <line x1="82" y1="53.5" x2="38" y2="76.5" stroke="currentColor" strokeWidth="1.2" />
          <polygon
            points="60,54 78,44 60,34 42,44"
            fill="#0284C7"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <polygon
            points="42,44 60,54 60,70 42,60"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <polygon
            points="78,44 60,54 60,70 78,60"
            fill="currentColor"
            className="text-white dark:text-slate-800"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M60 14V30M60 14L53 21M60 14L67 21"
            stroke="#0284C7"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ];

  return (
    <section
      id="capabilities"
      className="w-full bg-[var(--orion-canvas)] text-[var(--orion-text-primary)] pt-28 sm:pt-36 pb-24 border-t border-[var(--glass-border-subtle)] relative overflow-hidden transition-colors duration-300"
    >
      {/* Ambient background light spot */}
      <div
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-sky-400/10 dark:bg-sky-500/5 blur-[120px] rounded-full"
        aria-hidden="true"
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        {/* Large Editorial Headline */}
        <div className="max-w-4xl pb-14 sm:pb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-badge text-[11px] font-mono uppercase tracking-wider text-[var(--orion-accent)] font-semibold">
            <span>Enterprise Architecture Capabilities</span>
          </div>
          <h2 className="font-editorial text-3xl sm:text-5xl lg:text-[50px] font-extrabold tracking-[-0.03em] leading-[1.08] text-[var(--orion-text-primary)]">
            Designed for today’s operations,
            <br className="hidden sm:inline" /> beyond legacy supply chain workflows.
          </h2>
          <p className="text-base text-[var(--orion-text-secondary)] max-w-2xl leading-relaxed">
            Eliminate blind spots between tier-1 purchase orders, multi-modal transport manifests, and factory assembly schedules with continuous deterministic reconciliation.
          </p>
        </div>

        {/* 4-Column Liquid Glass Card Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
          {capabilities.map((item, index) => (
            <div
              key={item.id}
              className="liquid-glass-card liquid-glass-interactive rounded-3xl p-7 flex flex-col justify-between group hover:shadow-xl transition-all duration-300"
            >
              <div>
                <div
                  data-testid={`capability-icon-${item.id}`}
                  style={{ animationDelay: `${index * 0.65}s` }}
                  className="mb-6 orion-capability-icon-float text-[var(--orion-text-primary)] flex items-center justify-center h-28"
                >
                  {item.illustration}
                </div>
                <span className="text-[10px] font-mono tracking-widest text-[var(--orion-accent)] font-semibold block mb-2">
                  {item.tag}
                </span>
                <h3 className="font-editorial text-xl font-bold tracking-tight text-[var(--orion-text-primary)] mb-2.5">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--orion-text-secondary)] leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-[var(--glass-border-subtle)] flex items-center justify-between text-[11px] font-mono text-[var(--orion-text-muted)]">
                <span>VERIFIED ONTOLOGY</span>
                <span className="text-emerald-500 font-semibold">ACTIVE</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { ChevronDown, ShieldCheck } from 'lucide-react';
import { OrionCircular3DTelemetry } from './OrionCircular3DTelemetry';
import { SectionBadge } from './SectionBadge';

const FAQ_ITEMS = [
  {
    question: 'How fast can Orion-9 connect to our existing ERP, TMS, and carrier feeds?',
    answer:
      'Orion-9 includes pre-built canonical adapters for SAP S/4HANA, Oracle Cloud SCM, Manhattan WMS, project44, FourKites, and raw satellite AIS / ADS-B telemetry. Most enterprise corridors begin streaming into the digital twin within 48 hours without modifying legacy schemas.',
  },
  {
    question: 'How does governed autonomous execution prevent unauthorized changes?',
    answer:
      'Every solver recommendation operates inside deterministic Zero-Trust policy bounds. You define financial thresholds, approved carrier pools, and two-person cryptographic sign-off rules—ensuring Orion-9 only dispatches EDI bookings or ERP updates that satisfy your exact governance criteria.',
  },
  {
    question: 'What happens when a maritime or air corridor experiences a sudden disruption?',
    answer:
      'Within milliseconds of an AIS berth delay, weather closure, or customs hold, Orion-9 traces the exact bill-of-materials impact down to individual factory assembly lines and evaluates 8,500+ multi-objective reroute scenarios to protect your SLA at minimum expedite cost.',
  },
  {
    question: 'Is Orion-9 compliant with enterprise security and audit requirements?',
    answer:
      'Yes. Orion-9 is engineered with SOC 2 Type II controls, ISO 27001 alignment, tenant-isolated encryption, and an immutable cryptographic audit log recording every telemetry input, solver simulation, and operator authorization.',
  },
];

export const ControlTowerAndFaq: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <div className="w-full bg-[var(--orion-canvas)] text-[var(--orion-text-primary)] transition-colors duration-300">
      {/* ==========================================================================
          PART A: REBUILT ORION-9 CIRCULAR 3D TELEMETRY EXPERIENCE (#control-tower)
         ========================================================================== */}
      <OrionCircular3DTelemetry />

      {/* ==========================================================================
          PART B: SPLIT FAQ ACCORDION SECTION (#faq)
         ========================================================================== */}
      <section
        id="faq"
        className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-16 sm:py-28 border-t border-[var(--glass-border-subtle)]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Heading */}
          <div className="lg:col-span-5 space-y-4">
            <SectionBadge icon={<ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}>
              Enterprise FAQ
            </SectionBadge>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight leading-tight text-[var(--orion-text-primary)]">
              Operational readiness, answered clearly.
            </h2>
            <p className="text-sm sm:text-base text-[var(--orion-text-secondary)] max-w-sm leading-relaxed">
              How Orion-9 integrates with your enterprise stack, governs autonomous decisions, and secures global corridors.
            </p>
          </div>

          {/* Right Column: Liquid Glass Expandable Rows */}
          <div className="lg:col-span-7 space-y-3">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={item.question}
                  className="rounded-2xl liquid-glass-card border border-[var(--glass-border)] transition-all duration-200 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 sm:p-6 flex items-center justify-between gap-6 text-left cursor-pointer group"
                    aria-expanded={isOpen}
                  >
                    <span className="font-editorial text-base sm:text-lg font-bold text-[var(--orion-text-primary)] group-hover:text-[var(--orion-accent)] transition-colors">
                      {item.question}
                    </span>
                    <span className="w-8 h-8 rounded-xl liquid-glass-button text-[var(--orion-text-primary)] flex items-center justify-center shrink-0 transition-transform duration-200">
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-[var(--orion-accent)]' : ''
                        }`}
                      />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-[var(--orion-text-secondary)] leading-relaxed border-t border-[var(--glass-border-subtle)] pt-4 animate-in fade-in duration-150">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

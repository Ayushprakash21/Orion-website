import React from 'react';

export const EditorialCapabilities: React.FC = () => {
  const capabilities = [
    {
      id: 'rapid-activation',
      title: 'Rapid Activation',
      description:
        'Connect ERP, TMS, WMS, and satellite AIS streams in hours—deploying a live canonical operating picture without months of brittle custom integration.',
      illustration: (
        <svg viewBox="0 0 120 120" className="w-28 h-28" fill="none" aria-hidden="true">
          {/* Isometric Base Plinth */}
          <polygon
            points="60,72 102,50 60,28 18,50"
            fill="#E6F3FC"
            stroke="#070B19"
            strokeWidth="1.6"
          />
          <polygon
            points="18,50 60,72 60,92 18,70"
            fill="#CCE6F8"
            stroke="#070B19"
            strokeWidth="1.6"
          />
          <polygon
            points="102,50 60,72 60,92 102,70"
            fill="#FFFFFF"
            stroke="#070B19"
            strokeWidth="1.6"
          />
          {/* Isometric Elevated Telemetry Core */}
          <polygon
            points="60,52 84,39 60,26 36,39"
            fill="#00A8FF"
            fillOpacity="0.22"
            stroke="#070B19"
            strokeWidth="1.6"
          />
          {/* Fast-Response Lightning / Signal Vector */}
          <path
            d="M64 16L48 38H62L55 58L75 34H61L64 16Z"
            fill="#00A8FF"
            stroke="#070B19"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          {/* Corner Telemetry Pins */}
          <circle cx="32" cy="50" r="3" fill="#070B19" />
          <circle cx="88" cy="50" r="3" fill="#00A8FF" />
          <circle cx="60" cy="64" r="3" fill="#070B19" />
        </svg>
      ),
    },
    {
      id: 'rigorous-resolution',
      title: 'Rigorous Graph Resolution',
      description:
        'Every purchase order, container manifest, and Tier-N sub-assembly lot is continuously reconciled across 142 global superports and air hubs.',
      illustration: (
        <svg viewBox="0 0 120 120" className="w-28 h-28" fill="none" aria-hidden="true">
          {/* Stacked Isometric Ontological Planes */}
          <polygon
            points="60,94 100,73 60,52 20,73"
            fill="#E6F3FC"
            stroke="#070B19"
            strokeWidth="1.6"
          />
          <polygon
            points="60,76 100,55 60,34 20,55"
            fill="#FFFFFF"
            stroke="#070B19"
            strokeWidth="1.6"
          />
          <polygon
            points="60,58 92,41 60,24 28,41"
            fill="#CCE6F8"
            stroke="#070B19"
            strokeWidth="1.6"
          />
          {/* Vertical Verification Axis */}
          <line
            x1="60"
            y1="14"
            x2="60"
            y2="84"
            stroke="#00A8FF"
            strokeWidth="2.2"
            strokeDasharray="3 3"
          />
          {/* Precision Inspection Ring */}
          <ellipse
            cx="60"
            cy="41"
            rx="14"
            ry="7.5"
            fill="#00A8FF"
            fillOpacity="0.28"
            stroke="#070B19"
            strokeWidth="1.6"
          />
          <circle cx="60" cy="41" r="3.5" fill="#070B19" />
        </svg>
      ),
    },
    {
      id: 'verified-before-arrival',
      title: '100% Verified Before Arrival',
      description:
        'Shipments and autonomous reroutes pass customs, berth availability, and Zero-Trust policy gates before dispatch—so execution works from day one.',
      illustration: (
        <svg viewBox="0 0 120 120" className="w-28 h-28" fill="none" aria-hidden="true">
          {/* Isometric Container / Vault Block */}
          <polygon
            points="60,48 94,30 60,12 26,30"
            fill="#E6F3FC"
            stroke="#070B19"
            strokeWidth="1.6"
          />
          <polygon
            points="26,30 60,48 60,88 26,70"
            fill="#CCE6F8"
            stroke="#070B19"
            strokeWidth="1.6"
          />
          <polygon
            points="94,30 60,48 60,88 94,70"
            fill="#FFFFFF"
            stroke="#070B19"
            strokeWidth="1.6"
          />
          {/* Verification Checkmark Shield */}
          <circle
            cx="76"
            cy="64"
            r="16"
            fill="#070B19"
            stroke="#FFFFFF"
            strokeWidth="2"
          />
          <path
            d="M69 64.5L74 69.5L84 59.5"
            stroke="#00A8FF"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: 'controlled-outcomes',
      title: 'Controlled Outcomes',
      description:
        'Predictable arrival windows, protected factory assembly buffers, and lower expedite spend across every maritime, air, and rail corridor.',
      illustration: (
        <svg viewBox="0 0 120 120" className="w-28 h-28" fill="none" aria-hidden="true">
          {/* Isometric Precision Matrix Grid */}
          <polygon
            points="60,88 104,65 60,42 16,65"
            fill="#E6F3FC"
            stroke="#070B19"
            strokeWidth="1.6"
          />
          <line x1="38" y1="53.5" x2="82" y2="76.5" stroke="#070B19" strokeWidth="1.2" />
          <line x1="82" y1="53.5" x2="38" y2="76.5" stroke="#070B19" strokeWidth="1.2" />
          {/* Elevated Target Cube */}
          <polygon
            points="60,54 78,44 60,34 42,44"
            fill="#00A8FF"
            stroke="#070B19"
            strokeWidth="1.6"
          />
          <polygon
            points="42,44 60,54 60,70 42,60"
            fill="#070B19"
            stroke="#070B19"
            strokeWidth="1.6"
          />
          <polygon
            points="78,44 60,54 60,70 78,60"
            fill="#FFFFFF"
            stroke="#070B19"
            strokeWidth="1.6"
          />
          {/* Upward Controlled Trajectory Arrow */}
          <path
            d="M60 14V30M60 14L53 21M60 14L67 21"
            stroke="#070B19"
            strokeWidth="2"
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
      className="w-full bg-white text-[#070B19] pt-28 sm:pt-36 pb-24 border-t border-[#E2ECF4]"
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-12">
        {/* Large Editorial 2-Line Headline */}
        <div className="max-w-4xl pb-16 sm:pb-24">
          <h2 className="font-editorial text-3xl sm:text-5xl lg:text-[52px] font-bold tracking-[-0.02em] leading-[1.1] text-[#070B19]">
            Designed for today’s operations,
            <br className="hidden sm:inline" /> beyond legacy supply chain workflows.
          </h2>
        </div>

        {/* 4-Column Isometric Feature Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10">
          {capabilities.map((item) => (
            <div key={item.id} className="flex flex-col items-start">
              <div className="mb-8">{item.illustration}</div>
              <h3 className="font-editorial text-xl sm:text-[22px] font-bold tracking-[-0.015em] text-[#070B19] mb-3">
                {item.title}
              </h3>
              <p className="text-sm text-[#475569] leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

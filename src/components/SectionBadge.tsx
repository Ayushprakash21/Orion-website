import React from 'react';

export interface SectionBadgeProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  id?: string;
  sectionNumber?: string;
  category?: string;
  align?: 'left' | 'center' | 'right';
  darkCanvas?: boolean; // When section is inherently dark across both light/dark themes (e.g. #control-tower)
}

/**
 * Premium Editorial Section Identifier for Orion-9.
 * Replaces generic SaaS pill badges with an authoritative, high-end editorial section header:
 * - Clean uppercase typography with controlled letter spacing
 * - Larger visual presence than supporting prose, strictly subordinate to main h2
 * - Small geometric accent & section indexing marker
 * - Restrained Orion-9 Blue in Light Mode (#0284C7) / Metallic Gold in Dark Mode (#D4AF37)
 * - Trailing/flanking subtle hairline dividers
 * - Non-clickable, non-pill editorial identity
 */
export const SectionBadge: React.FC<SectionBadgeProps> = ({
  children,
  icon,
  className = '',
  id,
  sectionNumber,
  category,
  align = 'left',
  darkCanvas = false,
}) => {
  const isCenter = align === 'center';

  return (
    <div
      id={id}
      className={`select-none flex ${
        isCenter ? 'flex-col items-center text-center' : 'flex-col items-start text-left'
      } ${className}`}
    >
      {/* Primary Section Identifier Row */}
      <div
        className={`inline-flex items-center gap-2 sm:gap-2.5 max-w-full ${
          isCenter ? 'justify-center text-center' : 'justify-start text-left'
        }`}
      >
        {/* Flanking hairline divider for centered alignment */}
        {isCenter && (
          <span
            className={`hidden sm:inline-block w-8 sm:w-14 h-px ${
              darkCanvas
                ? 'bg-gradient-to-l from-white/30 dark:from-[#38301D] to-transparent'
                : 'bg-gradient-to-l from-slate-300 dark:from-[#38301D] to-transparent'
            } shrink-0 mr-1`}
            aria-hidden="true"
          />
        )}

        {/* Leading Geometric Accent & Section Number */}
        <span
          className={`inline-flex items-center gap-1.5 sm:gap-2 shrink-0 ${
            darkCanvas
              ? 'text-sky-400 dark:text-[#D4AF37]'
              : 'text-[#0284C7] dark:text-[#D4AF37]'
          }`}
        >
          {/* Precision 45-degree diamond glyph */}
          <span
            className={`w-1.5 h-1.5 rotate-45 shrink-0 ${
              darkCanvas
                ? 'bg-sky-400 dark:bg-[#D4AF37] shadow-[0_0_8px_rgba(56,189,248,0.5)] dark:shadow-[0_0_8px_rgba(212,175,55,0.3)]'
                : 'bg-[#0284C7] dark:bg-[#D4AF37] shadow-[0_0_8px_rgba(2,132,199,0.35)] dark:shadow-[0_0_8px_rgba(212,175,55,0.3)]'
            }`}
            aria-hidden="true"
          />
          {sectionNumber && (
            <span className="font-mono text-xs sm:text-[13px] font-bold tracking-[0.2em] sm:tracking-[0.25em]">
              {sectionNumber}
            </span>
          )}
          {sectionNumber && (
            <span
              className={`font-mono text-xs font-light ${
                darkCanvas ? 'text-white/40 dark:text-[#737373]' : 'text-slate-300 dark:text-[#38301D]'
              }`}
            >
              /
            </span>
          )}
        </span>

        {/* Optional Icon */}
        {icon && (
          <span
            className={`inline-flex items-center justify-center shrink-0 ${
              darkCanvas
                ? 'text-sky-400 dark:text-[#D4AF37]'
                : 'text-[#0284C7] dark:text-[#D4AF37]'
            }`}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}

        {/* Section Identifier Text */}
        <span
          className={`text-xs sm:text-sm md:text-[15px] font-mono font-bold uppercase tracking-[0.16em] sm:tracking-[0.22em] leading-normal break-words ${
            darkCanvas
              ? 'text-white dark:text-[#F5F5F5]'
              : 'text-slate-900 dark:text-[#F5F5F5]'
          }`}
        >
          {children}
        </span>

        {/* Trailing hairline divider */}
        {isCenter ? (
          <>
            <span
              className={`w-1.5 h-1.5 rotate-45 shrink-0 ${
                darkCanvas
                  ? 'bg-sky-400 dark:bg-[#D4AF37] shadow-[0_0_8px_rgba(56,189,248,0.5)] dark:shadow-[0_0_8px_rgba(212,175,55,0.3)]'
                  : 'bg-[#0284C7] dark:bg-[#D4AF37] shadow-[0_0_8px_rgba(2,132,199,0.35)] dark:shadow-[0_0_8px_rgba(212,175,55,0.3)]'
              }`}
              aria-hidden="true"
            />
            <span
              className={`hidden sm:inline-block w-8 sm:w-14 h-px ${
                darkCanvas
                  ? 'bg-gradient-to-r from-white/30 dark:from-[#38301D] to-transparent'
                  : 'bg-gradient-to-r from-slate-300 dark:from-[#38301D] to-transparent'
              } shrink-0 ml-1`}
              aria-hidden="true"
            />
          </>
        ) : (
          <span
            className={`hidden sm:inline-block w-10 sm:w-20 h-px ${
              darkCanvas
                ? 'bg-gradient-to-r from-white/30 dark:from-[#38301D] to-transparent'
                : 'bg-gradient-to-r from-slate-300/80 dark:from-[#38301D] to-transparent'
            } shrink-0 ml-1`}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Optional Category Sub-tag if provided */}
      {category && (
        <span className="text-[11px] font-mono uppercase tracking-[0.28em] text-slate-500 dark:text-[#A3A3A3] mt-1 pl-3.5">
          {category}
        </span>
      )}
    </div>
  );
};

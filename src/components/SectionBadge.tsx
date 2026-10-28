import React from 'react';

export interface SectionBadgeProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  id?: string;
}

/**
 * Shared Authoritative Section Badge / Eyebrow Pill.
 * Standardizes typography hierarchy across all Orion-9 sections:
 * - 12px mobile / 13px desktop
 * - 600 weight (semibold)
 * - Monospace font, uppercase lettering, balanced letter-spacing (tracking-wider)
 * - Outlined pill shape with cyan/blue border and subtle glass backdrop
 * - Vertically centered icons proportionate to typography
 */
export const SectionBadge: React.FC<SectionBadgeProps> = ({
  children,
  icon,
  className = '',
  id,
}) => {
  return (
    <div
      id={id}
      className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full liquid-glass-badge text-xs sm:text-[13px] font-mono font-semibold uppercase tracking-wider text-[var(--orion-accent)] border border-sky-400/30 shadow-xs transition-colors select-none ${className}`}
    >
      {icon && (
        <span className="inline-flex items-center justify-center shrink-0 text-[var(--orion-accent)]" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="leading-none whitespace-normal text-center">{children}</span>
    </div>
  );
};

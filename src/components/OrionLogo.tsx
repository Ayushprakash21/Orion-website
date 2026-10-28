import React, { useState, useEffect } from 'react';
import { useOptionalSiteConfig } from '../context/SiteConfigContext';
import type { HeroIntroSequenceState } from '../utils/cinematic-choreography';
import { Orion3DLogo } from './Orion3DLogo';

export interface OrionLogoProps {
  companyName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  tone?: 'dark' | 'light';
  showMark?: boolean;
  className?: string;
  placement?: 'header' | 'auth' | 'footer' | 'default';
  customLogoUrl?: string | null;
}

/**
 * Compact Orion-9 Brand Lockup for Header, Auth Views, and Footer.
 * Shares the authoritative minimalist Infinity-9 vector identity.
 */
export const OrionLogo: React.FC<OrionLogoProps> = ({
  companyName = 'Orion-9',
  size = 'md',
  tone = 'dark',
  showMark = true,
  className = '',
  placement,
  customLogoUrl,
}) => {
  const isLight = tone === 'light';
  const [imgError, setImgError] = useState(false);
  const siteConfig = useOptionalSiteConfig();
  const branding = siteConfig?.activeConfig?.branding;

  let effectiveLogoUrl = customLogoUrl;
  if (effectiveLogoUrl === undefined && branding) {
    // Canonical unified brand logo takes precedence across all static placements
    if (branding.sharedLogoConfig) {
      effectiveLogoUrl = branding.sharedLogoConfig.useCustom
        ? (branding.sharedLogoConfig.customUrl || branding.sharedLogoConfig.url || null)
        : null;
    } else if (branding.sharedLogo) {
      effectiveLogoUrl = branding.sharedLogo;
    } else {
      // Fallback to legacy placements or default brand logo
      if (placement === 'header') {
        effectiveLogoUrl = branding.headerLogo || branding.logoUrl || null;
      } else if (placement === 'auth') {
        effectiveLogoUrl = branding.authLogo || branding.logoUrl || null;
      } else if (placement === 'footer') {
        effectiveLogoUrl = branding.footerLogo || branding.logoUrl || null;
      } else {
        effectiveLogoUrl = branding.logoUrl || null;
      }
    }
  }

  useEffect(() => {
    setImgError(false);
  }, [effectiveLogoUrl]);

  const hasCustomLogo = Boolean(effectiveLogoUrl && !imgError);

  const markSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-9 h-9',
    xl: 'w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-xl sm:text-[22px] lg:text-2xl',
  };

  const primaryStroke = isLight ? '#FFFFFF' : '#070B19';
  const badgeBg = isLight ? '#FFFFFF' : '#070B19';

  return (
    <span
      className={`inline-flex items-center ${
        size === 'xl' ? 'gap-3 sm:gap-3.5' : 'gap-2.5'
      } select-none ${className}`}
    >
      {showMark && (
        <span
          className={`${markSizes[size]} ${
            size === 'xl' ? 'rounded-xl p-1 sm:p-1.5' : 'rounded-lg p-0.5'
          } flex items-center justify-center shrink-0 shadow-2xs border border-[#38BDF8]/30 overflow-hidden`}
          style={{ backgroundColor: badgeBg }}
          aria-hidden="true"
        >
          {hasCustomLogo ? (
            <img
              src={effectiveLogoUrl!}
              alt={`${companyName} Logo`}
              className="w-full h-full object-contain select-none"
              onError={() => {
                console.warn(
                  `[OrionLogo] Failed to load brand logo from "${effectiveLogoUrl}". Falling back to default vector mark.`
                );
                setImgError(true);
              }}
            />
          ) : (
            <svg
              viewBox="0 0 800 520"
              className="w-full h-full p-0.5"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="orionBadgeGrad" x1="472" y1="16" x2="788" y2="478" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#0284C7" />
                  <stop offset="45%" stopColor="#00D2FF" />
                  <stop offset="100%" stopColor="#38BDF8" />
                </linearGradient>
              </defs>
              {/* 1. Under-Bridge Returning Ribbon */}
              <path
                d="M 148 368 L 268 440 C 338 416 390 336 448 238 C 500 144 548 102 616 102 C 662 102 694 128 704 168 L 772 142 C 748 62 682 16 596 16 C 502 16 438 96 376 198 C 324 286 280 354 218 368 Z"
                fill="#0284C7"
                opacity="0.82"
              />
              {/* 2. Left Loop Lower Return Fold */}
              <path
                d="M 16 238 C 16 360 106 454 224 454 C 250 454 274 448 298 438 L 176 362 C 128 342 102 296 102 238 Z"
                fill={isLight ? '#0F172A' : '#64748B'}
              />
              {/* 3. Right Loop & Angled Numeral '9' Stem */}
              <path
                d="M 564 16 C 694 8 788 96 788 212 C 788 284 742 346 612 478 L 472 478 L 654 286 C 696 242 704 180 674 136 C 644 96 588 90 532 118 L 484 62 C 510 32 536 18 564 16 Z"
                fill="url(#orionBadgeGrad)"
              />
              {/* 4. Foreground Left Loop & Center Diagonal Bridge */}
              <path
                d="M 16 238 C 16 112 104 16 220 16 C 316 16 384 96 458 192 C 528 280 578 326 638 322 C 680 318 714 286 728 238 L 668 308 C 638 344 594 360 546 354 C 480 346 426 284 360 198 C 298 118 256 86 204 86 C 138 86 94 144 94 226 C 94 288 128 338 176 362 L 64 362 C 32 326 16 284 16 238 Z"
                fill={isLight ? '#07111F' : '#FFFFFF'}
              />
            </svg>
          )}
        </span>
      )}
      <span
        className={`font-wordmark ${textSizes[size]} font-bold tracking-[-0.02em] leading-none whitespace-nowrap`}
        style={{ color: primaryStroke }}
      >
        <span>ORION</span>
        <span className="text-[#0284C7] dark:text-[#38BDF8]">-</span>
        <span className="text-[#00D2FF]">9</span>
      </span>
    </span>
  );
};

interface OrionHeroBrandLockupProps {
  introState: HeroIntroSequenceState;
  headlineText: string;
  supportingParagraph: string;
}

/**
 * Authoritative Orion-9 Cinematic Hero Logo Reveal.
 * Recreates and animates the exact master Orion-9 brand identity (Image 2) on transparent background:
 * - High-contrast brushed platinum and luminous electric-cyan Infinity-9 Mobius ribbon
 * - Outer orbital arc with right dark-sphere node & 4-pointed cyan-white starburst flare
 * - Modern geometric sans-serif `ORION-9` wordmark with illuminated cyan `-9`
 * - Deep space obsidian contrast halo ensuring crisp contrast across light & dark viewports
 * - Supporting hero headline and description positioned cleanly beneath the logo
 */
export const OrionHeroBrandLockup: React.FC<OrionHeroBrandLockupProps> = ({
  introState,
  headlineText,
  supportingParagraph,
}) => {
  // Geometry-following light sweep progress: uses initial reveal (Stage 2) then post-reveal 8s loop
  const isPostRevealLoop = introState.revealComplete && !introState.reducedMotion;
  const activeLightProgress = isPostRevealLoop
    ? introState.ambientLoopLightProgress
    : introState.infinityLightProgress;
  const activeLightOpacity = isPostRevealLoop
    ? introState.ambientLoopLightProgress > 0.01 && introState.ambientLoopLightProgress < 0.99
      ? Math.sin(introState.ambientLoopLightProgress * Math.PI) * 0.72
      : 0
    : introState.infinityOpacity *
      (1 - (introState.revealComplete ? 0.58 : 0));

  const infinityCurveLength = 1620;
  const infinityDashOffset = (1 - activeLightProgress) * infinityCurveLength;

  const orbitalArcLength = 1080;
  const orbitalDashOffset = (1 - introState.infinityLightProgress) * orbitalArcLength;

  // Wordmark chrome sweep position (-520 -> +520 in local wordmark space)
  const activeChromeSweep = isPostRevealLoop
    ? introState.ambientLoopChromeSweep
    : introState.wordmarkChromeSweep;
  const chromeSweepX = -520 + activeChromeSweep * 1040;
  const chromeSweepOpacity = isPostRevealLoop
    ? introState.ambientLoopChromeSweep > 0.01 && introState.ambientLoopChromeSweep < 0.99
      ? Math.sin(introState.ambientLoopChromeSweep * Math.PI) * 0.65
      : 0
    : introState.wordmarkChromeSweep > 0.02 && introState.wordmarkChromeSweep < 0.98
      ? Math.sin(introState.wordmarkChromeSweep * Math.PI) * 0.92
      : 0;

  return (
    <div
      data-testid="orion-hero-brand-lockup"
      className="relative flex flex-col items-center justify-center text-center w-full max-w-4xl mx-auto px-4 pb-11 sm:pb-[68px] lg:pb-[84px]"
    >
      {/* ==========================================================================
          MASTER 3D ORION-9 EMBLEM & METALLIC TYPOGRAPHY LOCKUP
          Precision-engineered physical 3D metallic emblem with studio reflections,
          beveled chamfers, subtle contact shadow, and live pointer interactivity.
         ========================================================================== */}
      <div
        data-testid="orion-hero-animated-logo"
        className="relative w-[260px] sm:w-[285px] md:w-[310px] lg:w-[330px] flex flex-col items-center justify-center select-none translate-y-0"
      >
        {/* Stage 1 — Atmosphere: Soft radiant sky-white atmosphere behind logo (no dark halo) */}
        <div
          aria-hidden="true"
          data-testid="orion-hero-ambient-glow"
          className="pointer-events-none absolute w-[240px] h-[200px] sm:w-[300px] sm:h-[240px] lg:w-[340px] lg:h-[260px] top-2 rounded-full blur-3xl -z-10"
          style={{
            opacity: introState.ambientGlowOpacity,
            background:
              'radial-gradient(circle at 50% 45%, rgba(186, 230, 253, 0.45) 0%, rgba(224, 242, 254, 0.20) 45%, rgba(255, 255, 255, 0) 72%)',
          }}
        />

        {/* 3D Precision-Engineered Physical Metallic Emblem */}
        <div
          data-testid="orion-stage2-infinity"
          className="w-full aspect-[1000/640] relative flex items-center justify-center overflow-visible"
          style={{
            opacity: introState.infinityOpacity,
            transform: `scale(${introState.logoScale.toFixed(4)})`,
            transformOrigin: 'center center',
          }}
        >
          <Orion3DLogo
            introState={introState}
            className="w-full h-full"
            enablePointerInteraction={!introState.reducedMotion}
          />
        </div>

        {/* Crisp Vector Typography: ORION-9 Wordmark & Taglines */}
        <div className="w-full aspect-[1000/280] -mt-1 relative">
          <svg
            viewBox="0 650 1000 280"
            className="w-full h-full overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Orion-9 — Supply Chain Intelligence"
          >
            <defs>
              {/* Deep 3D Obsidian Black Gradient with Subtle Bevel Highlight for ORION-9 (Reference Target) */}
              <linearGradient id="orionBlack3DGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2A374A" />
                <stop offset="10%" stopColor="#141E2D" />
                <stop offset="45%" stopColor="#080E18" />
                <stop offset="100%" stopColor="#040810" />
              </linearGradient>

              {/* Restrained Lacquer Gleam Reflection Sweep Gradient */}
              <linearGradient id="orionBlackReflection" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                <stop offset="38%" stopColor="#94A3B8" stopOpacity="0.45" />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.75" />
                <stop offset="62%" stopColor="#94A3B8" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>

              {/* Dimensional Drop Shadow for High-Contrast Pop */}
              <filter id="orionWordmarkShadow" x="-20%" y="-30%" width="140%" height="180%">
                <feDropShadow dx="0" dy="5" stdDeviation="4.5" floodColor="#040914" floodOpacity="0.45" />
                <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#040914" floodOpacity="0.65" />
              </filter>

              <clipPath id="orionWordmarkGlyphClip">
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  style={{
                    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    fontWeight: 900,
                    fontSize: '122px',
                    letterSpacing: '0.09em',
                  }}
                >
                  ORION-9
                </text>
              </clipPath>
            </defs>

            {/* ==========================================================================
                STAGE 3: MODERN 3D "ORION-9" WORDMARK IN BLACK (MATCHING REFERENCE TARGET)
               ========================================================================== */}
            <g
              data-testid="orion-stage3-wordmark"
              style={{
                opacity: introState.wordmarkOpacity,
                transform: `translate3d(0, ${introState.wordmarkTranslateY.toFixed(2)}px, 0)`,
              }}
            >
              <g transform="translate(500, 770)" filter="url(#orionWordmarkShadow)">
                {/* Authoritative High-Contrast Sans-Serif ORION-9 in Solid 3D Black */}
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  stroke="#040810"
                  strokeWidth="3.0"
                  strokeLinejoin="round"
                  paintOrder="stroke fill"
                  style={{
                    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    fontWeight: 900,
                    fontSize: '122px',
                    letterSpacing: '0.09em',
                  }}
                >
                  <tspan fill="url(#orionBlack3DGradient)">ORION-9</tspan>
                </text>

                {/* Strictly Glyph-Clipped Subtle Lacquer Reflection Highlight */}
                <g clipPath="url(#orionWordmarkGlyphClip)">
                  <rect
                    x={chromeSweepX}
                    y="-110"
                    width="160"
                    height="135"
                    fill="url(#orionBlackReflection)"
                    transform="skewX(-22)"
                    style={{
                      opacity: chromeSweepOpacity * 0.7,
                    }}
                  />
                </g>
              </g>
            </g>

            {/* ==========================================================================
                STAGE 4A: PRIMARY TAGLINE — "SUPPLY CHAIN INTELLIGENCE"
               ========================================================================== */}
            <g
              data-testid="orion-stage4-primary-tagline"
              style={{
                opacity: introState.primaryTaglineOpacity,
              }}
            >
              <text
                x="500"
                y="850"
                textAnchor="middle"
                fill="currentColor"
                className="text-[#070E1C] dark:text-[#F5F5F7]"
                style={{
                  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  fontWeight: 800,
                  fontSize: '28px',
                  letterSpacing: '0.32em',
                }}
              >
                SUPPLY CHAIN INTELLIGENCE
              </text>
            </g>

            {/* ==========================================================================
                STAGE 4B: SECONDARY TAGLINE — "A MORE RESILIENT TOMORROW"
               ========================================================================== */}
            <g
              data-testid="orion-stage4-secondary-tagline"
              style={{
                opacity: introState.secondaryTaglineOpacity,
              }}
            >
              {/* Left Cyan Accent Line */}
              <g
                style={{
                  transform: `scaleX(${introState.secondaryTaglineRuleScale.toFixed(3)})`,
                  transformOrigin: '235px 898px',
                }}
              >
                <polygon
                  points="235,897 348,897 348,899.5 235,899.5"
                  fill="#0284C7"
                />
              </g>

              {/* Center Tagline */}
              <text
                x="500"
                y="902"
                textAnchor="middle"
                fill="#0284C7"
                style={{
                  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  fontWeight: 700,
                  fontSize: '13.5px',
                  letterSpacing: '0.16em',
                }}
              >
                A MORE RESILIENT TOMORROW
              </text>

              {/* Right Cyan Accent Line */}
              <g
                style={{
                  transform: `scaleX(${introState.secondaryTaglineRuleScale.toFixed(3)})`,
                  transformOrigin: '765px 898px',
                }}
              >
                <polygon
                  points="652,897 765,897 765,899.5 652,899.5"
                  fill="#0284C7"
                />
              </g>
            </g>
          </svg>
        </div>
      </div>

      {/* ==========================================================================
          STAGE 5: SUPPORTING HEADLINE & DESCRIPTION BENEATH THE COMPLETE LOGO
         ========================================================================== */}
      <div
        data-testid="orion-hero-supporting-text-block"
        style={{
          opacity: introState.supportingTextOpacity,
          transform: `translate3d(0, ${introState.supportingTextTranslateY.toFixed(2)}px, 0)`,
        }}
        className="max-w-2xl mx-auto mt-2 sm:mt-4 flex flex-col items-center"
      >
        <h1
          data-testid="orion-hero-editorial-headline"
          className="font-editorial text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-extrabold tracking-[-0.03em] leading-[1.12] text-[var(--orion-text-primary)]"
        >
          {headlineText}
        </h1>

        <p
          data-testid="orion-hero-supporting-description"
          className="text-xs sm:text-sm text-[var(--orion-text-secondary)] mt-2.5 max-w-xl mx-auto leading-relaxed"
        >
          {supportingParagraph}
        </p>
      </div>
    </div>
  );
};

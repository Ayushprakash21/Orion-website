import React, { useState, useEffect } from 'react';
import { useOptionalSiteConfig } from '../context/SiteConfigContext';
import type { HeroIntroSequenceState } from '../utils/cinematic-choreography';

interface OrionLogoProps {
  companyName?: string;
  size?: 'sm' | 'md' | 'lg';
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
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  };

  const primaryStroke = isLight ? '#FFFFFF' : '#070B19';
  const badgeBg = isLight ? '#FFFFFF' : '#070B19';

  return (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {showMark && (
        <span
          className={`${markSizes[size]} rounded-lg flex items-center justify-center shrink-0 shadow-2xs border border-[#38BDF8]/30 overflow-hidden p-0.5`}
          style={{ backgroundColor: badgeBg }}
          aria-hidden="true"
        >
          {hasCustomLogo ? (
            <img
              src={effectiveLogoUrl!}
              alt={`${companyName} Logo`}
              className="w-full h-full object-contain select-none"
              onError={() => setImgError(true)}
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
        className={`font-wordmark ${textSizes[size]} font-black tracking-[-0.02em] leading-none whitespace-nowrap`}
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
          MASTER UPLOADED ORION-9 LOGO (TRANSPARENT LAYERED SVG + GEOMETRY LIGHT)
          Preserves exact 245px desktop / 145px mobile size, moved upward by 80px
          with a luxurious deep obsidian contrast halo (Image 2 style)
         ========================================================================== */}
      <div
        data-testid="orion-hero-animated-logo"
        className="relative w-[145px] sm:w-[205px] md:w-[227.5px] lg:w-[245px] aspect-[1000/930] flex items-center justify-center select-none -translate-y-[80px]"
      >
        {/* Stage 1 — Atmosphere: Radiant cyan ambient glow behind logo */}
        <div
          aria-hidden="true"
          data-testid="orion-hero-ambient-glow"
          className="pointer-events-none absolute w-[160px] h-[140px] sm:w-[240px] sm:h-[190px] lg:w-[300px] lg:h-[240px] top-0 rounded-full blur-3xl -z-10"
          style={{
            opacity: introState.ambientGlowOpacity,
            background:
              'radial-gradient(circle at 54% 42%, rgba(0, 220, 255, 0.45) 0%, rgba(2, 132, 199, 0.22) 48%, rgba(2, 132, 199, 0) 76%)',
          }}
        />

        {/* Deep Obsidian Space Backdrop: Guarantees Image 2's rich contrast on all backgrounds */}
        <div
          aria-hidden="true"
          data-testid="orion-hero-logo-contrast-shadow"
          className="pointer-events-none absolute -inset-10 rounded-full -z-10"
          style={{
            opacity: introState.infinityOpacity,
            background:
              'radial-gradient(ellipse 72% 64% at 50% 48%, rgba(3, 7, 18, 0.94) 0%, rgba(3, 7, 18, 0.78) 46%, rgba(3, 7, 18, 0) 78%)',
            filter: 'blur(16px)',
          }}
        />

        <svg
          viewBox="0 0 1000 930"
          className="w-full h-full overflow-visible drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Orion-9 — Supply Chain Intelligence"
        >
          <defs>
            {/* Under-Bridge Brushed Steel-Blue Metallic Gradient */}
            <linearGradient id="orionUnderBridgeMetal" x1="180" y1="590" x2="720" y2="190" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1E4B82" />
              <stop offset="22%" stopColor="#94B5D4" />
              <stop offset="44%" stopColor="#163E70" />
              <stop offset="68%" stopColor="#4676A6" />
              <stop offset="86%" stopColor="#E2EDF8" />
              <stop offset="100%" stopColor="#FFFFFF" />
            </linearGradient>

            {/* Right Loop & Angled Numeral "9" Stem Brushed Platinum-to-Blue Gradient */}
            <linearGradient id="orionRightNineFacet" x1="620" y1="185" x2="740" y2="655" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0E2B52" />
              <stop offset="18%" stopColor="#D8E6F5" />
              <stop offset="34%" stopColor="#FFFFFF" />
              <stop offset="52%" stopColor="#8AAECF" />
              <stop offset="70%" stopColor="#12396B" />
              <stop offset="86%" stopColor="#E6F2FC" />
              <stop offset="100%" stopColor="#0080FF" />
            </linearGradient>

            {/* Foreground Left Loop & Center Diagonal Bridge Brushed Platinum-Chrome Gradient */}
            <linearGradient id="orionForegroundRibbon" x1="115" y1="215" x2="715" y2="555" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6084AA" />
              <stop offset="18%" stopColor="#F1F7FD" />
              <stop offset="30%" stopColor="#FFFFFF" />
              <stop offset="46%" stopColor="#9AB9D8" />
              <stop offset="65%" stopColor="#2E7BF6" />
              <stop offset="84%" stopColor="#00C4FF" />
              <stop offset="100%" stopColor="#072854" />
            </linearGradient>

            {/* Left Loop Lower-Left Brushed Silver Return Fold */}
            <linearGradient id="orionLeftBottomFold" x1="115" y1="360" x2="385" y2="620" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#D8E6F5" />
              <stop offset="38%" stopColor="#4C749E" />
              <stop offset="72%" stopColor="#F8FBFF" />
              <stop offset="100%" stopColor="#1B4980" />
            </linearGradient>

            {/* Deep Electric-Blue 3D Recessed Inner Wall Gradient */}
            <linearGradient id="orionElectricWall" x1="210" y1="260" x2="680" y2="565" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#041533" />
              <stop offset="26%" stopColor="#0055CC" />
              <stop offset="54%" stopColor="#00EAFF" />
              <stop offset="80%" stopColor="#0077FF" />
              <stop offset="100%" stopColor="#041B44" />
            </linearGradient>

            {/* Travelling Electric-Blue & Cyan Energy Beam Gradient */}
            <linearGradient id="orionEnergyPulseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0055FF" stopOpacity="0" />
              <stop offset="35%" stopColor="#00B8FF" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#E6FBFF" stopOpacity="1" />
              <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
            </linearGradient>

            {/* Dark Orbital Sphere Fill */}
            <radialGradient id="orionOrbitalSphere" cx="45%" cy="42%" r="58%">
              <stop offset="0%" stopColor="#00040A" />
              <stop offset="68%" stopColor="#041126" />
              <stop offset="92%" stopColor="#0066CC" />
              <stop offset="100%" stopColor="#00E1FF" />
            </radialGradient>

            {/* Starburst Focal Glow */}
            <radialGradient id="orionStarburstHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="22%" stopColor="#80EAFF" stopOpacity="0.92" />
              <stop offset="52%" stopColor="#0088FF" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#0044AA" stopOpacity="0" />
            </radialGradient>

            {/* ORION-9 Wordmark Metallic Fill (Silver-Chrome Left to Ice-Cyan Right) */}
            <linearGradient id="orionWordmarkMetal" x1="-360" y1="-50" x2="360" y2="30" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="30%" stopColor="#F8FAFC" />
              <stop offset="65%" stopColor="#E2E8F0" />
              <stop offset="85%" stopColor="#BAE6FD" />
              <stop offset="100%" stopColor="#00E5FF" />
            </linearGradient>

            {/* Chrome Reflection Sweep Gradient */}
            <linearGradient id="orionChromeReflection" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="38%" stopColor="#E0F2FE" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="62%" stopColor="#7DD3FC" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            <clipPath id="orionWordmarkGlyphClip">
              <text
                x="0"
                y="0"
                textAnchor="middle"
                style={{
                  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  fontWeight: 900,
                  fontSize: '116px',
                  letterSpacing: '0.07em',
                }}
              >
                ORION-9
              </text>
            </clipPath>

            <filter id="orionCyanGlowFilter" x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ==========================================================================
              STAGE 2: INFINITY-9 SYMBOL, ORBITAL RING, DARK SPHERE & STARBURST FLARE
             ========================================================================== */}
          <g
            data-testid="orion-stage2-infinity"
            style={{
              opacity: introState.infinityOpacity,
              transform: `scale(${introState.logoScale.toFixed(4)})`,
              transformOrigin: '500px 380px',
            }}
          >
            {/* 2A. Outer Orbital Arc */}
            <path
              d="M 76 392 A 428 402 0 0 1 923 308"
              stroke="#030712"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={orbitalArcLength}
              strokeDashoffset={orbitalDashOffset}
            />
            <path
              d="M 76 392 A 428 402 0 0 1 923 308"
              stroke="#38BDF8"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeDasharray={orbitalArcLength}
              strokeDashoffset={orbitalDashOffset}
            />
            <path
              d="M 930 380 A 428 402 0 0 1 786 665"
              stroke="#030712"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="360"
              strokeDashoffset={(1 - introState.infinityLightProgress) * 360}
            />
            <path
              d="M 930 380 A 428 402 0 0 1 786 665"
              stroke="#38BDF8"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeDasharray="360"
              strokeDashoffset={(1 - introState.infinityLightProgress) * 360}
            />

            {/* 2B. FACET 1 — Under-Bridge Metallic Ribbon */}
            <path
              d="M 232 536 L 352 608 C 424 584, 476 502, 534 402 C 588 308, 636 266, 706 266 C 752 266, 786 292, 796 334 L 866 306 C 842 226, 774 182, 686 182 C 592 182, 526 264, 464 368 C 412 456, 368 524, 304 536 Z"
              fill="url(#orionUnderBridgeMetal)"
              stroke="#030712"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Inner Electric-Blue Channel */}
            <path
              d="M 294 532 C 362 522, 412 454, 466 364 C 520 274, 574 222, 642 204 L 668 264 C 608 278, 562 326, 512 412 C 460 502, 408 572, 344 598 Z"
              fill="#0066EE"
              opacity="0.88"
            />

            {/* 2C. FACET 2 — Right Loop Outer Arch & Angled Numeral "9" Stem */}
            <path
              d="M 654 184 C 786 176, 882 264, 882 382 C 882 454, 836 518, 702 654 L 546 654 L 748 456 C 792 412, 800 348, 768 302 C 738 262, 680 256, 622 284 L 574 226 C 600 198, 626 186, 654 184 Z"
              fill="url(#orionRightNineFacet)"
              stroke="#030712"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Glowing Electric-Cyan Bevel on Right Outer Rim */}
            <path
              d="M 880 368 C 880 448, 834 514, 702 654 L 548 654"
              stroke="#00E1FF"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#orionCyanGlowFilter)"
            />

            {/* 2D. FACET 3 — Left Loop Lower-Left Return Fold */}
            <path
              d="M 106 404 C 106 528, 198 622, 318 622 C 344 622, 368 616, 392 606 L 266 532 C 218 512, 192 464, 192 404 Z"
              fill="url(#orionLeftBottomFold)"
              stroke="#030712"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Left Loop Inner Electric-Blue Wall */}
            <path
              d="M 192 404 C 192 322, 248 268, 318 268 C 362 268, 404 298, 448 352 L 422 392 C 384 344, 348 312, 304 312 C 248 312, 212 354, 212 414 C 212 468, 244 512, 294 532 L 266 532 C 218 512, 192 464, 192 404 Z"
              fill="url(#orionElectricWall)"
              stroke="#00C8FF"
              strokeWidth="2"
            />

            {/* 2E. FACET 4 — Hero Foreground Ribbon */}
            <path
              d="M 308 266 C 378 266, 436 334, 508 424 C 578 512, 636 566, 712 562 C 774 558, 824 514, 846 452 L 778 426 C 760 472, 724 496, 680 494 C 624 492, 574 438, 506 352 C 436 264, 380 218, 308 218 Z"
              fill="url(#orionElectricWall)"
              stroke="#030712"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Main Brushed Platinum-Silver Foreground Ribbon Surface */}
            <path
              d="M 106 408 C 106 280, 196 182, 314 182 C 412 182, 478 266, 554 362 C 624 450, 674 496, 734 492 C 778 488, 812 454, 826 404 L 764 478 C 734 514, 688 530, 638 524 C 572 516, 516 452, 448 364 C 386 284, 344 252, 292 252 C 224 252, 182 312, 182 396 C 182 458, 216 508, 266 532 L 154 532 C 122 496, 106 454, 106 408 Z"
              fill="url(#orionForegroundRibbon)"
              stroke="#030712"
              strokeWidth="4"
              strokeLinejoin="round"
            />

            {/* Razor-Sharp Cyan Edge Illumination Along the Center Diagonal Crossover */}
            <path
              d="M 318 258 C 384 268, 444 342, 518 434 C 584 516, 642 560, 716 556"
              stroke="#00F0FF"
              strokeWidth="5"
              strokeLinecap="round"
              filter="url(#orionCyanGlowFilter)"
            />

            {/* 2F. Energy Light Sweep */}
            <path
              data-testid="orion-infinity-light-sweep"
              d="M 314 188 C 202 188, 114 282, 114 404 C 114 522, 204 614, 322 614 C 412 614, 472 512, 530 404 C 588 296, 636 190, 724 190 C 816 190, 878 272, 878 378 C 878 450, 832 516, 702 654 L 548 654"
              stroke="url(#orionEnergyPulseGrad)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={`340 ${infinityCurveLength}`}
              strokeDashoffset={infinityDashOffset}
              style={{
                opacity: activeLightOpacity,
              }}
              filter="url(#orionCyanGlowFilter)"
            />

            {/* 2G. Right Dark Orbital Sphere Node */}
            <g>
              <circle
                cx="928"
                cy="344"
                r="44"
                fill="url(#orionStarburstHalo)"
                style={{ opacity: 0.45 + introState.focalHighlightIntensity * 0.35 }}
              />
              <circle
                cx="928"
                cy="344"
                r="34"
                fill="url(#orionOrbitalSphere)"
                stroke="#00D2FF"
                strokeWidth="3.5"
              />
              <path
                d="M 954 344 L 976 344"
                stroke="#7DD3FC"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </g>

            {/* 2H. 4-Pointed Cyan-White Starburst Flare at (773, 206) */}
            <g
              data-testid="orion-focal-starburst"
              style={{
                opacity: 0.45 + introState.focalHighlightIntensity * 0.55,
                transform: `scale(${(0.95 + introState.focalHighlightIntensity * 0.12).toFixed(3)})`,
                transformOrigin: '773px 206px',
              }}
            >
              <circle cx="773" cy="206" r="78" fill="url(#orionStarburstHalo)" />
              <path
                d="M 773 44 L 783 192 L 938 206 L 783 220 L 773 362 L 763 220 L 622 206 L 763 192 Z"
                fill="#00A8FF"
                stroke="#0066DD"
                strokeWidth="1.5"
              />
              <path
                d="M 773 72 L 779 197 L 912 206 L 779 215 L 773 334 L 767 215 L 648 206 L 767 197 Z"
                fill="#FFFFFF"
              />
              <circle cx="773" cy="206" r="14" fill="#FFFFFF" />
            </g>
          </g>

          {/* ==========================================================================
              STAGE 3: MODERN GEOMETRIC "ORION-9" WORDMARK WITH RADIANT CYAN "-9"
             ========================================================================== */}
          <g
            data-testid="orion-stage3-wordmark"
            style={{
              opacity: introState.wordmarkOpacity,
              transform: `translate3d(0, ${introState.wordmarkTranslateY.toFixed(2)}px, 0)`,
            }}
          >
            <g transform="translate(500, 776)">
              {/* Clean Sans-Serif ORION-9: Platinum-White "ORION" + Radiant Cyan "-9" */}
              <text
                x="0"
                y="0"
                textAnchor="middle"
                style={{
                  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  fontWeight: 900,
                  fontSize: '106px',
                  letterSpacing: '0.08em',
                }}
              >
                <tspan fill="#FFFFFF">ORION</tspan>
                <tspan fill="#38BDF8">-</tspan>
                <tspan fill="#00E5FF">9</tspan>
              </text>

              {/* Strictly Glyph-Clipped Chrome Reflection Highlight */}
              <g clipPath="url(#orionWordmarkGlyphClip)">
                <rect
                  x={chromeSweepX}
                  y="-110"
                  width="150"
                  height="135"
                  fill="url(#orionChromeReflection)"
                  transform="skewX(-22)"
                  style={{
                    opacity: chromeSweepOpacity,
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
              y="844"
              textAnchor="middle"
              fill="#BAE6FD"
              style={{
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                fontWeight: 700,
                fontSize: '28px',
                letterSpacing: '0.28em',
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
            {/* Left Tapered Needle Bar */}
            <g
              style={{
                transform: `scaleX(${introState.secondaryTaglineRuleScale.toFixed(3)})`,
                transformOrigin: '214px 900px',
              }}
            >
              <polygon
                points="54,900 84,898 212,898 212,902 84,902"
                fill="#7DD3FC"
              />
            </g>

            {/* Center Tagline */}
            <text
              x="500"
              y="903"
              textAnchor="middle"
              fill="#E0F2FE"
              style={{
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                fontWeight: 600,
                fontSize: '18px',
                letterSpacing: '0.22em',
              }}
            >
              A MORE RESILIENT TOMORROW
            </text>

            {/* Right Tapered Needle Bar */}
            <g
              style={{
                transform: `scaleX(${introState.secondaryTaglineRuleScale.toFixed(3)})`,
                transformOrigin: '786px 900px',
              }}
            >
              <polygon
                points="946,900 916,898 788,898 788,902 916,902"
                fill="#7DD3FC"
              />
            </g>
          </g>
        </svg>
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
        className="max-w-2xl mx-auto -mt-10 sm:-mt-8 flex flex-col items-center"
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

import fs from 'fs';
import path from 'path';

const brandingDir = 'public/assets/branding';
if (!fs.existsSync(brandingDir)) {
  fs.mkdirSync(brandingDir, { recursive: true });
}

// =============================================================================
// REFINED MATHEMATICAL ORION-9 INFINITY-9 VECTOR GEOMETRY
// ViewBox: 0 0 800 520 (Symbol), 0 0 800 660 (Logo with Wordmark)
// Preserves the authoritative geometry of the O-9 Mobius ribbon with parallel 9-stem
// =============================================================================

// Foreground Ribbon: Left Loop ('O' lobe) looping around top and sweeping across center diagonal
const pathForeground = `M 16 238 C 16 112 104 16 220 16 C 316 16 384 96 458 192 C 528 280 578 326 638 322 C 680 318 714 286 728 238 L 668 308 C 638 344 594 360 546 354 C 480 346 426 284 360 198 C 298 118 256 86 204 86 C 138 86 94 144 94 226 C 94 288 128 338 176 362 L 64 362 C 32 326 16 284 16 238 Z`;

// Numeral 9 Stem & Right Loop: Sweeps around top of right loop and descends down at 45 deg
const pathNineStem = `M 564 16 C 694 8 788 96 788 212 C 788 284 742 346 612 478 L 472 478 L 654 286 C 696 242 704 180 674 136 C 644 96 588 90 532 118 L 484 62 C 510 32 536 18 564 16 Z`;

// Under-Bridge Loop: Passes beneath the center diagonal with clean negative-space clearance
const pathUnderBridge = `M 148 368 L 268 440 C 338 416 390 336 448 238 C 500 144 548 102 616 102 C 662 102 694 128 704 168 L 772 142 C 748 62 682 16 596 16 C 502 16 438 96 376 198 C 324 286 280 354 218 368 Z`;

// Left Loop Lower-Left Return Fold
const pathLeftFold = `M 16 238 C 16 360 106 454 224 454 C 250 454 274 448 298 438 L 176 362 C 128 342 102 296 102 238 Z`;

// =============================================================================
// ASSET 1: orion9-mark.svg (Primary Symbol: Deep Navy & Electric Cyan)
// =============================================================================
const orion9MarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" fill="none">
  <defs>
    <linearGradient id="orionNavyGrad" x1="16" y1="16" x2="600" y2="400" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#07111F" />
      <stop offset="55%" stop-color="#0E284D" />
      <stop offset="100%" stop-color="#0284C7" />
    </linearGradient>
    <linearGradient id="orionCyanGrad" x1="472" y1="16" x2="788" y2="478" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0284C7" />
      <stop offset="42%" stop-color="#00D2FF" />
      <stop offset="100%" stop-color="#38BDF8" />
    </linearGradient>
  </defs>

  <!-- 1. Under-Bridge Returning Ribbon -->
  <path d="${pathUnderBridge}" fill="#0284C7" opacity="0.82" />

  <!-- 2. Left Loop Lower Return Fold -->
  <path d="${pathLeftFold}" fill="#0E284D" />

  <!-- 3. Right Loop & Angled Numeral "9" Stem -->
  <path d="${pathNineStem}" fill="url(#orionCyanGrad)" />

  <!-- 4. Foreground Left Loop & Center Diagonal Bridge -->
  <path d="${pathForeground}" fill="url(#orionNavyGrad)" />
</svg>`;

// =============================================================================
// ASSET 2: orion9-mark-mono.svg (Monochrome Symbol - Pure Solid Vector)
// =============================================================================
const orion9MarkMonoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" fill="none">
  <!-- Solid Monochrome Silhouette with negative space balance -->
  <path d="${pathUnderBridge}" fill="currentColor" opacity="0.4" />
  <path d="${pathLeftFold}" fill="currentColor" opacity="0.72" />
  <path d="${pathNineStem}" fill="currentColor" />
  <path d="${pathForeground}" fill="currentColor" />
</svg>`;

// =============================================================================
// ASSET 3: orion9-logo.svg (Primary Full Logo for Universal & Light Canvas)
// =============================================================================
const orion9LogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 660" fill="none">
  <defs>
    <linearGradient id="logoNavyGrad" x1="16" y1="16" x2="600" y2="400" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#07111F" />
      <stop offset="55%" stop-color="#0E284D" />
      <stop offset="100%" stop-color="#0284C7" />
    </linearGradient>
    <linearGradient id="logoCyanGrad" x1="472" y1="16" x2="788" y2="478" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0284C7" />
      <stop offset="42%" stop-color="#00D2FF" />
      <stop offset="100%" stop-color="#38BDF8" />
    </linearGradient>
  </defs>

  <!-- SYMBOL -->
  <g transform="translate(0, 0)">
    <path d="${pathUnderBridge}" fill="#0284C7" opacity="0.82" />
    <path d="${pathLeftFold}" fill="#0E284D" />
    <path d="${pathNineStem}" fill="url(#logoCyanGrad)" />
    <path d="${pathForeground}" fill="url(#logoNavyGrad)" />
  </g>

  <!-- WORDMARK: "ORION-9" in Modern Geometric Sans-Serif -->
  <g transform="translate(400, 616)">
    <text
      x="0"
      y="0"
      text-anchor="middle"
      font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      font-weight="900"
      font-size="94"
      letter-spacing="0.08em"
    ><tspan fill="#07111F">ORION</tspan><tspan fill="#0284C7">-</tspan><tspan fill="#00D2FF">9</tspan></text>
  </g>
</svg>`;

// =============================================================================
// ASSET 4: orion9-logo-dark.svg (Optimized specifically for Dark Canvas)
// =============================================================================
const orion9LogoDarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 660" fill="none">
  <defs>
    <linearGradient id="darkWhiteGrad" x1="16" y1="16" x2="600" y2="400" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="60%" stop-color="#F1F5F9" />
      <stop offset="100%" stop-color="#BAE6FD" />
    </linearGradient>
    <linearGradient id="darkCyanGrad" x1="472" y1="16" x2="788" y2="478" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="45%" stop-color="#00E5FF" />
      <stop offset="100%" stop-color="#7DD3FC" />
    </linearGradient>
  </defs>

  <!-- SYMBOL -->
  <g transform="translate(0, 0)">
    <path d="${pathUnderBridge}" fill="#0284C7" opacity="0.65" />
    <path d="${pathLeftFold}" fill="#94A3B8" />
    <path d="${pathNineStem}" fill="url(#darkCyanGrad)" />
    <path d="${pathForeground}" fill="url(#darkWhiteGrad)" />
  </g>

  <!-- WORDMARK: White "ORION" + Radiant Cyan "-9" -->
  <g transform="translate(400, 616)">
    <text
      x="0"
      y="0"
      text-anchor="middle"
      font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      font-weight="900"
      font-size="94"
      letter-spacing="0.08em"
    ><tspan fill="#FFFFFF">ORION</tspan><tspan fill="#38BDF8">-</tspan><tspan fill="#00E5FF">9</tspan></text>
  </g>
</svg>`;

// =============================================================================
// ASSET 5: orion9-logo-mono.svg (Monochrome Symbol + Wordmark)
// =============================================================================
const orion9LogoMonoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 660" fill="none">
  <!-- SYMBOL -->
  <g transform="translate(0, 0)">
    <path d="${pathUnderBridge}" fill="currentColor" opacity="0.4" />
    <path d="${pathLeftFold}" fill="currentColor" opacity="0.72" />
    <path d="${pathNineStem}" fill="currentColor" />
    <path d="${pathForeground}" fill="currentColor" />
  </g>

  <!-- WORDMARK -->
  <g transform="translate(400, 616)">
    <text
      x="0"
      y="0"
      text-anchor="middle"
      fill="currentColor"
      font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      font-weight="900"
      font-size="94"
      letter-spacing="0.08em"
    >ORION-9</text>
  </g>
</svg>`;

// Write all SVGs to both branding dir and root public dir
const files = [
  { path: 'public/assets/branding/orion9-mark.svg', content: orion9MarkSvg },
  { path: 'public/assets/branding/orion9-mark-mono.svg', content: orion9MarkMonoSvg },
  { path: 'public/assets/branding/orion9-logo.svg', content: orion9LogoSvg },
  { path: 'public/assets/branding/orion9-logo-dark.svg', content: orion9LogoDarkSvg },
  { path: 'public/assets/branding/orion9-logo-mono.svg', content: orion9LogoMonoSvg },
  { path: 'public/orion9-mark.svg', content: orion9MarkSvg },
  { path: 'public/orion9-mark-mono.svg', content: orion9MarkMonoSvg },
  { path: 'public/orion9-logo.svg', content: orion9LogoSvg },
  { path: 'public/orion9-logo-dark.svg', content: orion9LogoDarkSvg },
  { path: 'public/orion9-logo-mono.svg', content: orion9LogoMonoSvg },
];

files.forEach(f => {
  fs.writeFileSync(f.path, f.content, 'utf8');
  console.log(`Saved ${f.path}`);
});

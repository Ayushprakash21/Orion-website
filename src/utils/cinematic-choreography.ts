export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export type DecisionStageId =
  | 'EVENT_DETECTED'
  | 'CONTEXT_ASSEMBLED'
  | 'OPTIONS_ EVALUATED'
  | 'ACTION_SELECTED'
  | 'EXECUTION_VERIFIED';

export interface DecisionExecutionStage {
  id: string;
  index: number;
  label: string;
  shortCode: string;
  summary: string;
  metricLabel: string;
  metricValue: string;
  completed: boolean;
  active: boolean;
}

export interface ChapterDefinition {
  index: number;
  number: string;
  id: string;
  title: string;
  subtitle: string;
  narrative: string;
  cameraPos: Vec3;
  lookAt: Vec3;
  fov: number;
  metricLabel: string;
  metricValue: string;
  corridorStatus: 'NOMINAL' | 'TRACKING' | 'CONNECTED' | 'DISRUPTED' | 'ANALYZING' | 'BYPASS_ACTIVE';
}

export interface ChoreographyState {
  scrollProgress: number;
  activeChapterIndex: number;
  chapterLocalProgress: number;
  cameraPos: Vec3;
  lookAt: Vec3;
  fov: number;
  routeDrawProgress: number;
  shipmentTrackingWeight: number;
  networkDensityWeight: number;
  disruptionSeverity: number;
  intelligenceGraphWeight: number;
  bypassCorridorProgress: number;
  estimatedEtaHours: number;
  slaIntegrityPercent: number;
  financialExposureUsd: number;
  decisionStages: DecisionExecutionStage[];
  activeDecisionStageIndex: number;
}

/**
 * 4-Stage Process Narrative for the continuous 3D Miniature Supply-Chain World
 * (Matches the exact bottom-left progressive 01-04 HUD and camera choreography)
 */
export interface WorldProcessStep {
  index: number;
  number: '01' | '02' | '03' | '04';
  id: string;
  title: string;
  description: string;
  telemetryTag: string;
  scrollTarget: number;
}

export interface WorldScrollState {
  scrollProgress: number;
  isHeroPhase: boolean;
  heroOpacity: number;
  heroTranslateY: number;
  processHudOpacity: number;
  activeStepIndex: number; // 0..3 corresponding to 01..04
  stepLocalProgress: number;
  cameraPos: Vec3;
  lookAt: Vec3;
  fov: number;
  originSignalPulse: number;
  cyanBeamProgress: number; // 0..1 along the continuous pipeline from Command Hub to Solver Matrix
  checkpointScanWeight: number;
  matrixWaveWeight: number;
  chevronSweepProgress: number;
  emblemLockWeight: number;
}

export const WORLD_PROCESS_STEPS: WorldProcessStep[] = [
  {
    index: 0,
    number: '01',
    id: 'signal-activation',
    title: 'Signal Activation, Simplified',
    description:
      'Connect your ERP, TMS, and carrier endpoints once, and Orion-9 handles the rest—harmonizing satellite AIS, air cargo telemetry, and multi-tier inventory streams into one live operating picture.',
    telemetryTag: '42.8K EVENTS/SEC · ZERO-LATENCY INGESTION',
    scrollTarget: 0.25,
  },
  {
    index: 1,
    number: '02',
    id: 'canonical-verification',
    title: 'Cleared to Count',
    description:
      'Every vessel manifest, customs clearance, and sub-assembly lot is continuously verified against live port berth capacity and factory burn rates—isolating corridor anomalies before they cascade.',
    telemetryTag: '142 GLOBAL HUBS · 100% ENTITY RESOLUTION',
    scrollTarget: 0.50,
  },
  {
    index: 2,
    number: '03',
    id: 'stochastic-solver',
    title: 'Proven Corridor Match',
    description:
      'When disruptions strike, our stochastic solver evaluates 8,500+ multi-objective reroute pathways per second—selecting the exact Sea-Air split and carrier allocation proven to protect your SLAs.',
    telemetryTag: '8,500 SIMULATIONS/S · PARETO OPTIMAL',
    scrollTarget: 0.73,
  },
  {
    index: 3,
    number: '04',
    id: 'seamless-execution',
    title: 'Seamless Governed Arrival',
    description:
      'Authorized interventions dispatch directly into SAP, Oracle, and carrier EDI with cryptographic auditability—arriving verified, compliant, and ready to execute from day one.',
    telemetryTag: '99.8% SLA PROTECTED · CLOSED-LOOP DISPATCH',
    scrollTarget: 0.95,
  },
];

export const HERO_WORDMARK_CHARS = ['O', 'R', 'I', 'O', 'N', '-', '9'] as const;

export interface HeroIntroSequenceState {
  elapsedMs: number;
  reducedMotion: boolean;
  /** Stage 1 (0.0s - 0.6s): Background environment & localized ambient blue glow */
  environmentOpacity: number;
  ambientGlowOpacity: number;
  /** Stage 2 (0.35s - 1.85s): Infinity-9 symbol activation, geometry-following electric-blue/cyan light & starburst focal highlight */
  infinityOpacity: number;
  infinityLightProgress: number;
  infinityMetallicSweep: number;
  focalHighlightIntensity: number;
  /** Stage 3 (1.45s - 2.45s): ORION-9 metallic wordmark reveal & chrome reflection sweep */
  wordmarkOpacity: number;
  wordmarkTranslateY: number;
  wordmarkChromeSweep: number;
  /** Stage 4 (2.15s - 3.25s): Sequential tagline reveals ("SUPPLY CHAIN INTELLIGENCE" -> "A MORE RESILIENT TOMORROW") */
  primaryTaglineOpacity: number;
  primaryTaglineSweep: number;
  secondaryTaglineOpacity: number;
  secondaryTaglineRuleScale: number;
  /** Stage 5 (3.0s - 3.8s): Final settled composition, supporting hero copy & subtle 8s post-reveal loop */
  revealComplete: boolean;
  supportingTextOpacity: number;
  supportingTextTranslateY: number;
  /** Post-reveal ambient loop (0..1 every 8s, active only after reveal completes) */
  ambientLoopLightProgress: number;
  ambientLoopChromeSweep: number;
  /** Legacy compatibility fields */
  logoOpacity: number;
  logoScale: number;
  logoStrokeProgress: number;
  logoLightSweepProgress: number;
  logoGlowIntensity: number;
  wordmarkCharProgress: number[];
  wordmarkComplete: boolean;
  logoFloatOffsetY: number;
}

/**
 * Evaluates the 5-stage (3.8-second) cinematic Orion-9 logo reveal and subsequent
 * 8-second subtle ambient loop:
 * - Stage 1 (0ms - 600ms): Atmosphere & localized ambient blue glow behind logo
 * - Stage 2 (350ms - 1850ms): Infinity-9 symbol powers on with geometry-following electric-blue/cyan light & focal highlight
 * - Stage 3 (1450ms - 2450ms): Metallic ORION-9 wordmark reveals with subtle vertical transition & chrome reflection sweep
 * - Stage 4 (2150ms - 3250ms): "SUPPLY CHAIN INTELLIGENCE" then "A MORE RESILIENT TOMORROW" reveal in sequence
 * - Stage 5 (3000ms - 3800ms): Intense glow settles, complete logo stays sharp, supporting hero copy reveals, and 8s subtle loop begins
 */
export function evaluateHeroIntroSequence(
  elapsedMs: number,
  reducedMotion = false
): HeroIntroSequenceState {
  if (reducedMotion) {
    return {
      elapsedMs: Math.max(0, elapsedMs),
      reducedMotion: true,
      environmentOpacity: 1,
      ambientGlowOpacity: 0.28,
      infinityOpacity: 1,
      infinityLightProgress: 1,
      infinityMetallicSweep: 1,
      focalHighlightIntensity: 0.35,
      wordmarkOpacity: 1,
      wordmarkTranslateY: 0,
      wordmarkChromeSweep: 1,
      primaryTaglineOpacity: 1,
      primaryTaglineSweep: 1,
      secondaryTaglineOpacity: 1,
      secondaryTaglineRuleScale: 1,
      revealComplete: true,
      supportingTextOpacity: 1,
      supportingTextTranslateY: 0,
      ambientLoopLightProgress: 0,
      ambientLoopChromeSweep: 0,
      logoOpacity: 1,
      logoScale: 1,
      logoStrokeProgress: 1,
      logoLightSweepProgress: 1,
      logoGlowIntensity: 0.25,
      wordmarkCharProgress: HERO_WORDMARK_CHARS.map(() => 1),
      wordmarkComplete: true,
      logoFloatOffsetY: 0,
    };
  }

  const t = Math.max(0, elapsedMs);

  // Stage 1 — Atmosphere (0ms -> 600ms)
  const environmentOpacity = clamp01(0.35 + smoothstep(0, 600, t) * 0.65);
  const revealGlowRise = smoothstep(80, 900, t);
  const revealGlowSettle = smoothstep(2800, 3700, t);
  const ambientGlowOpacity = Number(
    (revealGlowRise * (0.68 - revealGlowSettle * 0.38)).toFixed(4)
  );

  // Stage 2 — Infinity activation (350ms -> 1850ms)
  const infinityOpacity = smoothstep(300, 950, t);
  const infinityLightProgress = smoothstep(350, 1800, t);
  const infinityMetallicSweep = smoothstep(450, 1850, t);
  // Brief, controlled blue-white highlight at the upper-right starburst focal point (peaks around 1250ms, settles to 0.38)
  const focalRise = smoothstep(750, 1250, t);
  const focalSettle = smoothstep(1350, 2400, t);
  const focalHighlightIntensity = Number(
    (focalRise * (1.0 - focalSettle * 0.62)).toFixed(4)
  );

  // Stage 3 — Wordmark reveal (1450ms -> 2450ms)
  const wordmarkOpacity = smoothstep(1450, 2150, t);
  const wordmarkTranslateY = lerpScalar(10, 0, smoothstep(1450, 2200, t));
  const wordmarkChromeSweep = smoothstep(1550, 2450, t);

  // Stage 4 — Sequential Taglines (2150ms -> 3250ms)
  // First: "SUPPLY CHAIN INTELLIGENCE" (2150ms -> 2750ms)
  const primaryTaglineOpacity = smoothstep(2150, 2700, t);
  const primaryTaglineSweep = smoothstep(2200, 2850, t);
  // Second: "A MORE RESILIENT TOMORROW" (2600ms -> 3200ms)
  const secondaryTaglineOpacity = smoothstep(2600, 3180, t);
  const secondaryTaglineRuleScale = smoothstep(2600, 3250, t);

  // Stage 5 — Final composition & supporting hero copy (2950ms -> 3750ms)
  const supportingTextOpacity = smoothstep(2950, 3650, t);
  const supportingTextTranslateY = lerpScalar(8, 0, smoothstep(2950, 3650, t));
  const revealComplete = t >= 3750;

  // Post-reveal subtle ambient loop (8000ms period after 3800ms)
  let ambientLoopLightProgress = 0;
  let ambientLoopChromeSweep = 0;
  if (t > 3800) {
    const loopPhase = ((t - 3800) % 8000) / 8000;
    // Soft blue light travels around the infinity symbol over the first 45% of each 8s cycle
    ambientLoopLightProgress = loopPhase < 0.45 ? smoothstep(0, 0.45, loopPhase) : 0;
    // Occasional subtle metallic reflection across the wordmark between 50% and 78% of each 8s cycle
    ambientLoopChromeSweep =
      loopPhase >= 0.5 && loopPhase <= 0.78
        ? smoothstep(0.5, 0.78, loopPhase)
        : 0;
  }

  const wordmarkCharProgress = HERO_WORDMARK_CHARS.map((_, idx) => {
    const start = 1450 + idx * 55;
    return smoothstep(start, start + 420, t);
  });

  return {
    elapsedMs: t,
    reducedMotion: false,
    environmentOpacity,
    ambientGlowOpacity,
    infinityOpacity,
    infinityLightProgress,
    infinityMetallicSweep,
    focalHighlightIntensity,
    wordmarkOpacity,
    wordmarkTranslateY,
    wordmarkChromeSweep,
    primaryTaglineOpacity,
    primaryTaglineSweep,
    secondaryTaglineOpacity,
    secondaryTaglineRuleScale,
    revealComplete,
    supportingTextOpacity,
    supportingTextTranslateY,
    ambientLoopLightProgress,
    ambientLoopChromeSweep,
    logoOpacity: infinityOpacity,
    logoScale: lerpScalar(0.96, 1.0, infinityOpacity),
    logoStrokeProgress: infinityLightProgress,
    logoLightSweepProgress: infinityMetallicSweep,
    logoGlowIntensity: ambientGlowOpacity,
    wordmarkCharProgress,
    wordmarkComplete: wordmarkOpacity >= 0.999,
    logoFloatOffsetY: 0,
  };
}

const WORLD_CAMERA_KEYFRAMES: { at: number; pos: Vec3; lookAt: Vec3; fov: number }[] = [
  // 0.00: Opening Hero Panorama — framed so the 3D supply-chain landscape sits cleanly below the centered ORION-9 brand lockup
  {
    at: 0.0,
    pos: { x: -24, y: 26.5, z: 56 },
    lookAt: { x: -6, y: 9.2, z: -2 },
    fov: 31,
  },
  // 0.14: Gliding toward Orion-9 Command Hub as red/blue ground traces converge
  {
    at: 0.14,
    pos: { x: -12, y: 15.5, z: 36 },
    lookAt: { x: -1, y: 3.0, z: -1 },
    fov: 30,
  },
  // 0.27: Stage 01 Focus — Orion-9 Command Hub facade & glowing cyan conduit ignition
  {
    at: 0.27,
    pos: { x: -2, y: 12.5, z: 28 },
    lookAt: { x: 4, y: 2.8, z: -1 },
    fov: 29,
  },
  // 0.50: Stage 02 Focus — Tracking the cyan energy pipeline past twin cooling silos, container yards & inspection gate
  {
    at: 0.50,
    pos: { x: 30, y: 14.5, z: 31 },
    lookAt: { x: 35, y: 2.5, z: -1 },
    fov: 29,
  },
  // 0.73: Stage 03 Focus — Approaching the Intermodal Distribution Warehouse, Port Terminal & Air-Freight Hub
  {
    at: 0.73,
    pos: { x: 54, y: 22.0, z: 42.0 },
    lookAt: { x: 73, y: 2.0, z: 1.0 },
    fov: 32,
  },
  // 0.95: Stage 04 Focus — Commanding overview of the Global Distribution Hub, Port Ship Berth, Loading Bays & Air Terminal
  {
    at: 0.95,
    pos: { x: 74, y: 37.0, z: 38.0 },
    lookAt: { x: 74, y: 1.2, z: 1.5 },
    fov: 33,
  },
  // 1.00: Settled elevated architectural overview of the living distribution hub before transitioning to Capabilities
  {
    at: 1.0,
    pos: { x: 75, y: 38.0, z: 36.0 },
    lookAt: { x: 75, y: 1.0, z: 1.5 },
    fov: 33,
  },
];

export const STORY_CHAPTERS: ChapterDefinition[] = [
  {
    index: 0,
    number: '01',
    id: 'world-awakens',
    title: 'The World Awakens',
    subtitle: 'Global Telemetry & Corridor Initialization',
    narrative:
      'Across 142 maritime superports, air cargo hubs, and continental rail gateways, Orion-9 initializes a live spatial twin—drawing geodesic trade corridors as physical movements synchronize with enterprise state.',
    cameraPos: { x: 18, y: 78, z: 146 },
    lookAt: { x: 8, y: 4, z: -6 },
    fov: 40,
    metricLabel: 'GLOBAL SIGNAL INGESTION',
    metricValue: '42,840 SIG/S',
    corridorStatus: 'NOMINAL',
  },
  {
    index: 1,
    number: '02',
    id: 'follow-shipment',
    title: 'Follow the Shipment',
    subtitle: 'Multi-Modal Corridor Tracking',
    narrative:
      'Camera locks onto Priority Shipment #OR-88412 departing Shanghai Gateway. Watch continuous telemetry handoffs as ultra-large container vessel MV-Orion-01 connects with intercontinental air and ground fleets.',
    cameraPos: { x: 52, y: 24, z: 48 },
    lookAt: { x: 34, y: 3, z: 8 },
    fov: 35,
    metricLabel: 'TRACKED CONSIGNMENT',
    metricValue: 'OR-88412 · +4.2°C',
    corridorStatus: 'TRACKING',
  },
  {
    index: 2,
    number: '03',
    id: 'network-connects',
    title: 'The Network Connects',
    subtitle: 'Multi-Echelon Topological Graph',
    narrative:
      'Individual shipments never move in isolation. Orion-9 expands outward to bind Tier-1 semiconductor foundries, ocean berths, regional distribution centers, and assembly plants into a single canonical graph.',
    cameraPos: { x: -8, y: 92, z: 124 },
    lookAt: { x: 6, y: 12, z: -8 },
    fov: 42,
    metricLabel: 'HARMONIZED ENTITIES',
    metricValue: '1.42M NODES',
    corridorStatus: 'CONNECTED',
  },
  {
    index: 3,
    number: '04',
    id: 'disruption-detected',
    title: 'Disruption on the Corridor',
    subtitle: 'Bottleneck Detection & Downstream Impact',
    narrative:
      'An unplanned 72-hour maritime bottleneck strikes the Suez approach corridor. Orion-9 immediately highlights the stalled sea lane, propagating delay shockwaves forward to calculate exact European assembly buffer exhaustion.',
    cameraPos: { x: 16, y: 28, z: 44 },
    lookAt: { x: 8, y: 2, z: 6 },
    fov: 34,
    metricLabel: 'DOWNSTREAM SLA RISK',
    metricValue: '$1.42M EXPOSED',
    corridorStatus: 'DISRUPTED',
  },
  {
    index: 4,
    number: '05',
    id: 'orion-intelligence',
    title: 'Orion-9 Decision Intelligence',
    subtitle: 'Stochastic Scenario & Trade-Off Solver',
    narrative:
      'The physical map elevates into an operational reasoning matrix. Orion-9 correlates affected purchase orders, safety stock burn rates, and carrier spot capacities—evaluating 8,500 multi-objective reroute simulations in sub-second latency.',
    cameraPos: { x: 4, y: 64, z: 86 },
    lookAt: { x: 4, y: 22, z: -10 },
    fov: 38,
    metricLabel: 'SOLVER EVALUATION',
    metricValue: '3 PATHWAYS RANKED',
    corridorStatus: 'ANALYZING',
  },
  {
    index: 5,
    number: '06',
    id: 'decision-execution',
    title: 'Decision and Autonomous Execution',
    subtitle: 'Governed Sea-Air Bypass & Verified Recovery',
    narrative:
      'With policy-bounded authorization, Orion-9 dispatches a Sea-Air split via Dubai Cargo Megahub (DXB) onto Flight OA-804 to Frankfurt and updates SAP purchase orders—recovering the production schedule with full auditability.',
    cameraPos: { x: -16, y: 36, z: 58 },
    lookAt: { x: -4, y: 10, z: -18 },
    fov: 36,
    metricLabel: 'VERIFIED OUTCOME',
    metricValue: '99.4% SLA PROTECTED',
    corridorStatus: 'BYPASS_ACTIVE',
  },
];

const DECISION_STAGE_TEMPLATES = [
  {
    id: 'EVENT_DETECTED',
    label: 'EVENT DETECTED',
    shortCode: '01 · DETECT',
    summary: 'AIS & port berth telemetry flag 72h anchorage queue on primary Asia-Europe sea lane.',
    metricLabel: 'LATENCY',
    metricValue: '12 ms',
  },
  {
    id: 'CONTEXT_ASSEMBLED',
    label: 'CONTEXT ASSEMBLED',
    shortCode: '02 · CONTEXT',
    summary: 'Manifests mapped to PO-88412 and 18,400 lithography sub-assemblies for Frankfurt Plant DE-02.',
    metricLabel: 'GRAPH LINKS',
    metricValue: '100% MAPPED',
  },
  {
    id: 'OPTIONS_EVALUATED',
    label: 'OPTIONS EVALUATED',
    shortCode: '03 · SOLVE',
    summary: 'Pareto solver ranks Sea-Air split via Dubai (DXB) against bulk ocean hold and rail expedite.',
    metricLabel: 'SCENARIOS',
    metricValue: '8,500 / S',
  },
  {
    id: 'ACTION_SELECTED',
    label: 'ACTION SELECTED',
    shortCode: '04 · AUTHORIZE',
    summary: 'Governed sign-off commits +$42K air bridge to eliminate $1.42M line-stoppage penalty.',
    metricLabel: 'NET SAVINGS',
    metricValue: '$1.38M PROTECTED',
  },
  {
    id: 'EXECUTION_VERIFIED',
    label: 'EXECUTION VERIFIED',
    shortCode: '05 · VERIFY',
    summary: 'EDI 304 booking & SAP schedule lines updated; Flight OA-804 airborne with verified ETA recovery.',
    metricLabel: 'SLA RECOVERY',
    metricValue: '99.4% NOMINAL',
  },
];

export function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const span = edge1 - edge0;
  if (Math.abs(span) < 1e-6) return x >= edge1 ? 1 : 0;
  const t = clamp01((x - edge0) / span);
  return t * t * (3 - 2 * t);
}

export function lerpScalar(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpVec3(a: Vec3, b: Vec3, t: number): Vec3 {
  return {
    x: lerpScalar(a.x, b.x, t),
    y: lerpScalar(a.y, b.y, t),
    z: lerpScalar(a.z, b.z, t),
  };
}

/**
 * Catmull-Rom spline interpolation across 4 control points for silky continuous camera motion
 */
export function catmullRomVec3(p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, t: number): Vec3 {
  const t2 = t * t;
  const t3 = t2 * t;

  const calc = (v0: number, v1: number, v2: number, v3: number) =>
    0.5 *
    (2 * v1 +
      (-v0 + v2) * t +
      (2 * v0 - 5 * v1 + 4 * v2 - v3) * t2 +
      (-v0 + 3 * v1 - 3 * v2 + v3) * t3);

  return {
    x: calc(p0.x, p1.x, p2.x, p3.x),
    y: calc(p0.y, p1.y, p2.y, p3.y),
    z: calc(p0.z, p1.z, p2.z, p3.z),
  };
}

/**
 * Evaluates the continuous 3D miniature world camera and 4-stage process state (`01`-`04`)
 * for any normalized scroll progress in [0, 1].
 */
export function evaluateWorldScrollState(rawScrollProgress: number): WorldScrollState {
  const p = clamp01(rawScrollProgress);

  // Hero phase is active at the top of the scroll container (0.00 -> 0.16)
  const heroFade = 1 - smoothstep(0.06, 0.165, p);
  const isHeroPhase = p < 0.155;
  const heroTranslateY = -smoothstep(0.04, 0.17, p) * 48;

  // Bottom-left 01..04 progressive HUD fades in smoothly as hero fades out
  const processHudOpacity = smoothstep(0.13, 0.21, p);

  // Determine which of the 4 steps (01..04) is active
  let activeStepIndex = 0;
  let stepLocalProgress = 0;
  if (p < 0.39) {
    activeStepIndex = 0;
    stepLocalProgress = clamp01((p - 0.14) / 0.25);
  } else if (p < 0.62) {
    activeStepIndex = 1;
    stepLocalProgress = clamp01((p - 0.39) / 0.23);
  } else if (p < 0.82) {
    activeStepIndex = 2;
    stepLocalProgress = clamp01((p - 0.62) / 0.20);
  } else {
    activeStepIndex = 3;
    stepLocalProgress = clamp01((p - 0.82) / 0.18);
  }

  // Find surrounding camera keyframes and interpolate via Catmull-Rom spline
  let kIdx = 0;
  for (let i = 0; i < WORLD_CAMERA_KEYFRAMES.length - 1; i++) {
    if (p >= WORLD_CAMERA_KEYFRAMES[i].at && p <= WORLD_CAMERA_KEYFRAMES[i + 1].at) {
      kIdx = i;
      break;
    }
  }
  const k0 = WORLD_CAMERA_KEYFRAMES[Math.max(0, kIdx - 1)];
  const k1 = WORLD_CAMERA_KEYFRAMES[kIdx];
  const k2 = WORLD_CAMERA_KEYFRAMES[Math.min(WORLD_CAMERA_KEYFRAMES.length - 1, kIdx + 1)];
  const k3 = WORLD_CAMERA_KEYFRAMES[Math.min(WORLD_CAMERA_KEYFRAMES.length - 1, kIdx + 2)];

  const segSpan = Math.max(1e-5, k2.at - k1.at);
  const localT = smoothstep(0, 1, (p - k1.at) / segSpan);

  const cameraPos = catmullRomVec3(k0.pos, k1.pos, k2.pos, k3.pos, localT);
  const lookAt = catmullRomVec3(k0.lookAt, k1.lookAt, k2.lookAt, k3.lookAt, localT);
  const fov = lerpScalar(k1.fov, k2.fov, localT);

  // Scene choreography weights
  const originSignalPulse = 1 - smoothstep(0.32, 0.52, p) * 0.5;
  const cyanBeamProgress = smoothstep(0.14, 0.78, p);
  const checkpointScanWeight = smoothstep(0.34, 0.46, p) * (1 - smoothstep(0.64, 0.76, p));
  const matrixWaveWeight = smoothstep(0.56, 0.70, p);
  const chevronSweepProgress = smoothstep(0.76, 0.91, p);
  const emblemLockWeight = smoothstep(0.85, 0.97, p);

  return {
    scrollProgress: p,
    isHeroPhase,
    heroOpacity: heroFade,
    heroTranslateY,
    processHudOpacity,
    activeStepIndex,
    stepLocalProgress,
    cameraPos,
    lookAt,
    fov,
    originSignalPulse,
    cyanBeamProgress,
    checkpointScanWeight,
    matrixWaveWeight,
    chevronSweepProgress,
    emblemLockWeight,
  };
}

/**
 * Evaluates the complete synchronized 3D camera, scene weights, operational metrics,
 * and 5-stage decision pipeline state for any scroll progress in [0, 1].
 */
export function evaluateScrollChoreography(
  rawScrollProgress: number,
  manualDisruptionOverride?: boolean | null
): ChoreographyState {
  const p = clamp01(rawScrollProgress);
  const totalChapters = STORY_CHAPTERS.length; // 6
  const scaled = p * (totalChapters - 1);
  const segIndex = Math.min(totalChapters - 2, Math.floor(scaled));
  const segT = smoothstep(0, 1, scaled - segIndex);

  const activeChapterIndex = Math.min(
    totalChapters - 1,
    Math.floor(p * totalChapters + 0.0001)
  );
  const chapterSpan = 1 / totalChapters;
  const chapterLocalProgress = clamp01(
    (p - activeChapterIndex * chapterSpan) / chapterSpan
  );

  // Smooth Catmull-Rom camera interpolation across the 6 chapters
  const i0 = Math.max(0, segIndex - 1);
  const i1 = segIndex;
  const i2 = Math.min(totalChapters - 1, segIndex + 1);
  const i3 = Math.min(totalChapters - 1, segIndex + 2);

  const cameraPos = catmullRomVec3(
    STORY_CHAPTERS[i0].cameraPos,
    STORY_CHAPTERS[i1].cameraPos,
    STORY_CHAPTERS[i2].cameraPos,
    STORY_CHAPTERS[i3].cameraPos,
    segT
  );

  const lookAt = catmullRomVec3(
    STORY_CHAPTERS[i0].lookAt,
    STORY_CHAPTERS[i1].lookAt,
    STORY_CHAPTERS[i2].lookAt,
    STORY_CHAPTERS[i3].lookAt,
    segT
  );

  const fov = lerpScalar(STORY_CHAPTERS[i1].fov, STORY_CHAPTERS[i2].fov, segT);

  const routeDrawProgress = clamp01(0.22 + smoothstep(0.0, 0.18, p) * 0.78);
  const shipmentTrackingWeight =
    smoothstep(0.11, 0.2, p) * (1 - smoothstep(0.34, 0.44, p));
  const networkDensityWeight = smoothstep(0.26, 0.4, p);

  let disruptionSeverity =
    smoothstep(0.46, 0.56, p) * (1 - smoothstep(0.84, 0.95, p) * 0.65);

  if (manualDisruptionOverride === true) {
    disruptionSeverity = Math.max(disruptionSeverity, 0.92);
  } else if (manualDisruptionOverride === false) {
    disruptionSeverity = 0;
  }

  const intelligenceGraphWeight =
    smoothstep(0.62, 0.72, p) * (1 - smoothstep(0.92, 1.0, p) * 0.3);

  const bypassCorridorProgress =
    manualDisruptionOverride === true && p < 0.76
      ? 0.85
      : smoothstep(0.74, 0.93, p);

  const baseEta = 38.0;
  const disruptionPenaltyHours = disruptionSeverity * 72.0 * (1 - bypassCorridorProgress * 0.94);
  const estimatedEtaHours = Number((baseEta + disruptionPenaltyHours).toFixed(1));

  const slaIntegrityPercent = Number(
    (99.4 - disruptionSeverity * 14.8 * (1 - bypassCorridorProgress * 0.96)).toFixed(1)
  );

  const financialExposureUsd = Math.round(
    disruptionSeverity * 1420000 * (1 - bypassCorridorProgress * 0.97)
  );

  const decisionProgress = smoothstep(0.5, 0.96, p);
  const activeDecisionStageIndex = Math.min(
    DECISION_STAGE_TEMPLATES.length - 1,
    Math.floor(decisionProgress * DECISION_STAGE_TEMPLATES.length)
  );

  const decisionStages: DecisionExecutionStage[] = DECISION_STAGE_TEMPLATES.map((tpl, idx) => ({
    id: tpl.id,
    index: idx,
    label: tpl.label,
    shortCode: tpl.shortCode,
    summary: tpl.summary,
    metricLabel: tpl.metricLabel,
    metricValue: tpl.metricValue,
    completed: decisionProgress > (idx + 0.85) / DECISION_STAGE_TEMPLATES.length,
    active: idx === activeDecisionStageIndex && p >= 0.48,
  }));

  return {
    scrollProgress: p,
    activeChapterIndex,
    chapterLocalProgress,
    cameraPos,
    lookAt,
    fov,
    routeDrawProgress,
    shipmentTrackingWeight,
    networkDensityWeight,
    disruptionSeverity,
    intelligenceGraphWeight,
    bypassCorridorProgress,
    estimatedEtaHours,
    slaIntegrityPercent,
    financialExposureUsd,
    decisionStages,
    activeDecisionStageIndex,
  };
}

/**
 * Evaluates a vehicle's normalized progress, speed multiplier, and banking angle
 * along a corridor given current operational state.
 */
export function evaluateVehicleKinematics(params: {
  baseProgress: number;
  baseSpeed: number;
  elapsedSeconds: number;
  mode: 'AIR' | 'OCEAN' | 'ROAD';
  isDisruptedCorridor: boolean;
  isBypassCorridor: boolean;
  disruptionSeverity: number;
  bypassCorridorProgress: number;
}): {
  progress: number;
  effectiveSpeedMultiplier: number;
  bankAngleRad: number;
  operationalState: 'NOMINAL' | 'DELAYED' | 'EXPEDITED';
} {
  const {
    baseProgress,
    baseSpeed,
    elapsedSeconds,
    mode,
    isDisruptedCorridor,
    isBypassCorridor,
    disruptionSeverity,
    bypassCorridorProgress,
  } = params;

  let effectiveSpeedMultiplier = 1.0;
  let operationalState: 'NOMINAL' | 'DELAYED' | 'EXPEDITED' = 'NOMINAL';

  if (isDisruptedCorridor && disruptionSeverity > 0.35) {
    effectiveSpeedMultiplier = Math.max(0.18, 1.0 - disruptionSeverity * 0.78);
    operationalState = 'DELAYED';
  } else if (isBypassCorridor && bypassCorridorProgress > 0.2) {
    effectiveSpeedMultiplier = 1.35 + bypassCorridorProgress * 0.45;
    operationalState = 'EXPEDITED';
  }

  const rawProgress =
    (baseProgress + Math.max(0, elapsedSeconds) * baseSpeed * effectiveSpeedMultiplier) % 1.0;
  const progress = rawProgress < 0 ? rawProgress + 1.0 : rawProgress;

  const bankAngleRad =
    mode === 'AIR'
      ? Math.sin(progress * Math.PI * 2) * 0.22 * Math.min(1.4, effectiveSpeedMultiplier)
      : mode === 'OCEAN'
        ? Math.sin(elapsedSeconds * 1.4 + baseProgress * 10) * 0.025
        : 0;

  return {
    progress,
    effectiveSpeedMultiplier,
    bankAngleRad,
    operationalState,
  };
}

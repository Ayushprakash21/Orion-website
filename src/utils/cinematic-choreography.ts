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
    shortSummary: 'Governed sign-off commits +$42K air bridge to eliminate $1.42M line-stoppage penalty.',
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

  // Chapter 1 (0.00 -> 0.16): Progressive route drawing from 0.22 to 1.0
  const routeDrawProgress = clamp01(0.22 + smoothstep(0.0, 0.18, p) * 0.78);

  // Chapter 2 (0.14 -> 0.36): Shipment tracking highlight weight
  const shipmentTrackingWeight =
    smoothstep(0.11, 0.2, p) * (1 - smoothstep(0.34, 0.44, p));

  // Chapter 3 (0.30 -> 0.56): Multi-echelon network density & data flow streams
  const networkDensityWeight = smoothstep(0.26, 0.4, p);

  // Chapter 4 & 5 (0.48 -> 0.88): Disruption severity on primary maritime corridor
  let disruptionSeverity =
    smoothstep(0.46, 0.56, p) * (1 - smoothstep(0.84, 0.95, p) * 0.65);

  if (manualDisruptionOverride === true) {
    disruptionSeverity = Math.max(disruptionSeverity, 0.92);
  } else if (manualDisruptionOverride === false) {
    disruptionSeverity = 0;
  }

  // Chapter 5 (0.64 -> 0.92): Orion-9 Intelligence ontology rings & solver links
  const intelligenceGraphWeight =
    smoothstep(0.62, 0.72, p) * (1 - smoothstep(0.92, 1.0, p) * 0.3);

  // Chapter 6 (0.76 -> 1.00): Autonomous Sea-Air Bypass corridor progressive activation
  const bypassCorridorProgress =
    manualDisruptionOverride === true && p < 0.76
      ? 0.85
      : smoothstep(0.74, 0.93, p);

  // Dynamic operational metrics synchronized with narrative state
  const baseEta = 38.0;
  const disruptionPenaltyHours = disruptionSeverity * 72.0 * (1 - bypassCorridorProgress * 0.94);
  const estimatedEtaHours = Number((baseEta + disruptionPenaltyHours).toFixed(1));

  const slaIntegrityPercent = Number(
    (99.4 - disruptionSeverity * 14.8 * (1 - bypassCorridorProgress * 0.96)).toFixed(1)
  );

  const financialExposureUsd = Math.round(
    disruptionSeverity * 1420000 * (1 - bypassCorridorProgress * 0.97)
  );

  // 5-Stage Decision & Execution sequence progression across Chapters 4, 5, and 6
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

  // Subtle realistic banking roll for cargo aircraft along curved geodesic trajectories
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

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  STORY_CHAPTERS,
  WORLD_PROCESS_STEPS,
  HERO_WORDMARK_CHARS,
  evaluateHeroIntroSequence,
  evaluateWorldScrollState,
  evaluateScrollChoreography,
  evaluateVehicleKinematics,
  clamp01,
  smoothstep,
} from './cinematic-choreography.ts';

describe('Orion-9 Continuous 3D Miniature World & Process Choreography', () => {
  it('orchestrates the 5-stage 3.8s Orion-9 logo reveal sequence, 8s ambient loop, and respects prefers-reduced-motion', () => {
    assert.deepEqual(HERO_WORDMARK_CHARS, ['O', 'R', 'I', 'O', 'N', '-', '9']);

    // Stage 1 (t = 200ms): Atmosphere & ambient glow rising before infinity activation
    const s1 = evaluateHeroIntroSequence(200, false);
    assert.ok(s1.environmentOpacity > 0.4);
    assert.ok(s1.ambientGlowOpacity > 0);
    assert.equal(s1.infinityOpacity, 0);
    assert.equal(s1.wordmarkOpacity, 0);
    assert.equal(s1.primaryTaglineOpacity, 0);

    // Stage 2 (t = 1150ms): Infinity-9 symbol active with electric-blue light sweep & focal starburst highlight before wordmark
    const s2 = evaluateHeroIntroSequence(1150, false);
    assert.equal(s2.infinityOpacity, 1);
    assert.ok(s2.infinityLightProgress > 0.45 && s2.infinityLightProgress < 1);
    assert.ok(s2.focalHighlightIntensity > 0.75);
    assert.equal(s2.wordmarkOpacity, 0);

    // Stage 3 (t = 1950ms): Metallic ORION-9 wordmark revealing & chrome sweep active before taglines
    const s3 = evaluateHeroIntroSequence(1950, false);
    assert.ok(s3.wordmarkOpacity > 0.65);
    assert.ok(s3.wordmarkChromeSweep > 0.3);
    assert.equal(s3.primaryTaglineOpacity, 0);

    // Stage 4a (t = 2500ms): "SUPPLY CHAIN INTELLIGENCE" revealing before "A MORE RESILIENT TOMORROW"
    const s4a = evaluateHeroIntroSequence(2500, false);
    assert.ok(s4a.primaryTaglineOpacity > 0.55);
    assert.equal(s4a.secondaryTaglineOpacity, 0);

    // Stage 4b (t = 2950ms): "A MORE RESILIENT TOMORROW" revealing
    const s4b = evaluateHeroIntroSequence(2950, false);
    assert.equal(s4b.primaryTaglineOpacity, 1);
    assert.ok(s4b.secondaryTaglineOpacity > 0.5);

    // Stage 5 (t = 3800ms): Complete logo settled & supporting copy visible
    const s5 = evaluateHeroIntroSequence(3800, false);
    assert.equal(s5.revealComplete, true);
    assert.equal(s5.supportingTextOpacity, 1);
    assert.ok(s5.ambientGlowOpacity <= 0.35);

    // Post-reveal 8s subtle ambient loop (t = 5400ms -> 1600ms into 8s cycle)
    const loop1 = evaluateHeroIntroSequence(5400, false);
    assert.ok(loop1.ambientLoopLightProgress > 0.3 && loop1.ambientLoopLightProgress < 0.8);

    // Reduced motion renders static, fully completed state immediately at t = 0
    const reduced = evaluateHeroIntroSequence(0, true);
    assert.equal(reduced.revealComplete, true);
    assert.equal(reduced.infinityOpacity, 1);
    assert.equal(reduced.wordmarkOpacity, 1);
    assert.equal(reduced.primaryTaglineOpacity, 1);
    assert.equal(reduced.secondaryTaglineOpacity, 1);
    assert.equal(reduced.supportingTextOpacity, 1);
    assert.equal(reduced.ambientLoopLightProgress, 0);
  });

  it('defines the 4 progressive operational steps (01-04) and transitions from Hero Vista through Emblem Lock', () => {
    assert.equal(WORLD_PROCESS_STEPS.length, 4);
    assert.equal(WORLD_PROCESS_STEPS[0].number, '01');
    assert.equal(WORLD_PROCESS_STEPS[1].number, '02');
    assert.equal(WORLD_PROCESS_STEPS[2].number, '03');
    assert.equal(WORLD_PROCESS_STEPS[3].number, '04');

    const heroStart = evaluateWorldScrollState(0.0);
    assert.equal(heroStart.isHeroPhase, true);
    assert.equal(heroStart.heroOpacity, 1);
    assert.equal(heroStart.processHudOpacity, 0);

    const step1 = evaluateWorldScrollState(0.26);
    assert.equal(step1.isHeroPhase, false);
    assert.equal(step1.activeStepIndex, 0);
    assert.ok(step1.processHudOpacity > 0.95);
    assert.ok(step1.cyanBeamProgress > 0.05);

    const step2 = evaluateWorldScrollState(0.50);
    assert.equal(step2.activeStepIndex, 1);
    assert.ok(step2.checkpointScanWeight > 0.8);
    assert.ok(step2.cameraPos.x > step1.cameraPos.x + 20, 'Camera pans right along the cyan pipeline');

    const step3 = evaluateWorldScrollState(0.73);
    assert.equal(step3.activeStepIndex, 2);
    assert.ok(step3.matrixWaveWeight > 0.9);
    assert.ok(step3.cameraPos.x > step2.cameraPos.x + 20, 'Camera tracks into the Solver Matrix');

    const step4 = evaluateWorldScrollState(0.96);
    assert.equal(step4.activeStepIndex, 3);
    assert.ok(step4.emblemLockWeight > 0.9);
    assert.ok(step4.cameraPos.y > 35, 'Camera pitches high above the diamond grid for top-down emblem lock');
  });

  it('defines all 6 storytelling chapters in chronological order', () => {
    assert.equal(STORY_CHAPTERS.length, 6);
    assert.equal(STORY_CHAPTERS[0].title, 'The World Awakens');
    assert.equal(STORY_CHAPTERS[5].title, 'Decision and Autonomous Execution');
  });

  it('smoothly interpolates camera positions and progressive route drawing across Chapters 1 to 6', () => {
    const startState = evaluateScrollChoreography(0);
    const ch2State = evaluateScrollChoreography(0.22);
    const ch4State = evaluateScrollChoreography(0.58);
    const endState = evaluateScrollChoreography(1);

    assert.equal(startState.activeChapterIndex, 0);
    assert.ok(startState.routeDrawProgress < 0.3);
    assert.ok(ch2State.routeDrawProgress >= 0.99);
    assert.ok(ch2State.shipmentTrackingWeight > 0.7);

    const distStartToCh2 = Math.hypot(
      ch2State.cameraPos.x - startState.cameraPos.x,
      ch2State.cameraPos.y - startState.cameraPos.y,
      ch2State.cameraPos.z - startState.cameraPos.z
    );
    assert.ok(distStartToCh2 > 45);

    assert.equal(ch4State.activeChapterIndex, 3);
    assert.ok(ch4State.disruptionSeverity > 0.85);
    assert.equal(endState.activeChapterIndex, 5);
    assert.ok(endState.bypassCorridorProgress > 0.95);
    assert.ok(endState.slaIntegrityPercent >= 98.5);
  });

  it('modulates vehicle speed and state under corridor disruption vs autonomous bypass', () => {
    const nominalOcean = evaluateVehicleKinematics({
      baseProgress: 0.2,
      baseSpeed: 0.03,
      elapsedSeconds: 5,
      mode: 'OCEAN',
      isDisruptedCorridor: true,
      isBypassCorridor: false,
      disruptionSeverity: 0,
      bypassCorridorProgress: 0,
    });
    assert.equal(nominalOcean.operationalState, 'NOMINAL');

    const disruptedOcean = evaluateVehicleKinematics({
      baseProgress: 0.2,
      baseSpeed: 0.03,
      elapsedSeconds: 5,
      mode: 'OCEAN',
      isDisruptedCorridor: true,
      isBypassCorridor: false,
      disruptionSeverity: 0.9,
      bypassCorridorProgress: 0,
    });
    assert.equal(disruptedOcean.operationalState, 'DELAYED');

    const expeditedAir = evaluateVehicleKinematics({
      baseProgress: 0.1,
      baseSpeed: 0.05,
      elapsedSeconds: 4,
      mode: 'AIR',
      isDisruptedCorridor: false,
      isBypassCorridor: true,
      disruptionSeverity: 0.8,
      bypassCorridorProgress: 0.95,
    });
    assert.equal(expeditedAir.operationalState, 'EXPEDITED');
  });

  it('clamps out-of-range inputs safely without NaN', () => {
    assert.equal(clamp01(-5), 0);
    assert.equal(clamp01(42), 1);
    assert.equal(clamp01(Number.NaN), 0);
    assert.ok(Math.abs(smoothstep(0.2, 0.8, 0.5) - 0.5) < 1e-12);
  });
});

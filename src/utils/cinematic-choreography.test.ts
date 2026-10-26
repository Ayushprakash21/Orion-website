import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  STORY_CHAPTERS,
  evaluateScrollChoreography,
  evaluateVehicleKinematics,
  clamp01,
  smoothstep,
} from './cinematic-choreography';

describe('Orion-9 Cinematic Choreography & Trajectory Engine', () => {
  it('defines all 6 required storytelling chapters in chronological order', () => {
    assert.equal(STORY_CHAPTERS.length, 6);
    assert.equal(STORY_CHAPTERS[0].title, 'The World Awakens');
    assert.equal(STORY_CHAPTERS[1].title, 'Follow the Shipment');
    assert.equal(STORY_CHAPTERS[2].title, 'The Network Connects');
    assert.equal(STORY_CHAPTERS[3].title, 'Disruption on the Corridor');
    assert.equal(STORY_CHAPTERS[4].title, 'Orion-9 Decision Intelligence');
    assert.equal(STORY_CHAPTERS[5].title, 'Decision and Autonomous Execution');
  });

  it('smoothly interpolates camera positions and progressive route drawing across Chapters 1 to 6', () => {
    const startState = evaluateScrollChoreography(0);
    const ch2State = evaluateScrollChoreography(0.22);
    const ch4State = evaluateScrollChoreography(0.58);
    const endState = evaluateScrollChoreography(1);

    assert.equal(startState.activeChapterIndex, 0);
    assert.ok(startState.routeDrawProgress < 0.3, 'Routes start partially drawn in Chapter 1');
    assert.ok(ch2State.routeDrawProgress >= 0.99, 'Routes finish drawing by Chapter 2');
    assert.ok(ch2State.shipmentTrackingWeight > 0.7, 'Chapter 2 activates shipment tracking focus');

    // Camera moves materially between chapters
    const distStartToCh2 = Math.hypot(
      ch2State.cameraPos.x - startState.cameraPos.x,
      ch2State.cameraPos.y - startState.cameraPos.y,
      ch2State.cameraPos.z - startState.cameraPos.z
    );
    assert.ok(distStartToCh2 > 45, `Expected camera to move >45 units, moved ${distStartToCh2}`);

    // Chapter 4 activates disruption severity and increases ETA / financial exposure
    assert.equal(ch4State.activeChapterIndex, 3);
    assert.ok(ch4State.disruptionSeverity > 0.85);
    assert.ok(ch4State.estimatedEtaHours > startState.estimatedEtaHours + 40);
    assert.ok(ch4State.financialExposureUsd > 800000);

    // Chapter 6 activates the autonomous Sea-Air bypass corridor and recovers SLA & ETA
    assert.equal(endState.activeChapterIndex, 5);
    assert.ok(endState.bypassCorridorProgress > 0.95);
    assert.ok(endState.slaIntegrityPercent >= 98.5);
    assert.ok(endState.estimatedEtaHours < ch4State.estimatedEtaHours - 40);
    assert.equal(endState.decisionStages.length, 5);
    assert.equal(endState.decisionStages[4].label, 'EXECUTION VERIFIED');
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
    assert.equal(nominalOcean.effectiveSpeedMultiplier, 1.0);

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
    assert.ok(disruptedOcean.effectiveSpeedMultiplier < 0.35);

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
    assert.ok(expeditedAir.effectiveSpeedMultiplier > 1.5);
    assert.notEqual(expeditedAir.bankAngleRad, 0);
  });

  it('clamps out-of-range inputs safely without NaN', () => {
    assert.equal(clamp01(-5), 0);
    assert.equal(clamp01(42), 1);
    assert.equal(clamp01(Number.NaN), 0);
    assert.ok(Math.abs(smoothstep(0.2, 0.8, 0.5) - 0.5) < 1e-12);
  });
});

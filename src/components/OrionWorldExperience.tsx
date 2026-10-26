/**
 * ORION-9 MASTER ANIMATION — END-TO-END INTELLIGENT SUPPLY CHAIN OPERATING SYSTEM
 * Homepage Centerpiece Interactive Digital Twin
 * 
 * Communicates the complete physical and intelligence journey spanning:
 * Scene 1: Raw Material Origins (Mining, Agriculture, Material Processing)
 * Scene 2: Supplier & Component Network (Tier-1/Tier-2 Foundries & Facilities)
 * Scene 3: Intelligent Manufacturing (Smart Factory, Robotic Arms, Optical QC)
 * Scene 4: Warehousing & Inventory (ASRS High-Bay Storage, AGVs, Replenishment)
 * Scene 5: Multimodal Global Distribution (Deepwater Port, Cargo Jets, Rail & Road)
 * Scene 6: Retail, Business & End Customer (Fulfillment, Verified Proof-of-Delivery)
 * Scene 7: Orion-9 Intelligence Engine (Neural Knowledge Graph, Real-Time Ingestion)
 * Scene 8: Predictive Disruption & Stochastic Reroute (Simulated Demonstration Scenario)
 * Scene 9: Global Digital Twin Overview (Continuous End-to-End Operating Picture)
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  SUPPLY_CHAIN_SCENES,
  evaluateMasterSupplyChainState,
  evaluateHeroIntroSequence,
  clamp01,
  lerpScalar,
  catmullRomVec3,
  smoothstep,
  type MasterSupplyChainState,
} from '../utils/cinematic-choreography';
import {
  detectSoftwareWebGL,
  createGpuFramePacer,
  setupStudioEnvironment,
  createRoutePulseShaderMaterial,
} from '../utils/three-logistics-craft';
import { buildEndToEndSupplyChainWorld } from '../utils/end-to-end-supply-chain-craft';
import { useSiteConfig } from '../context/SiteConfigContext';
import { OrionHeroBrandLockup } from './OrionLogo';
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Zap,
  Globe2,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export const OrionWorldExperience: React.FC = () => {
  const { activeConfig } = useSiteConfig();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  const scrollProgressRef = useRef<number>(0);
  const smoothedScrollRef = useRef<number>(0);

  const [hudState, setHudState] = useState<MasterSupplyChainState>(() =>
    evaluateMasterSupplyChainState(0)
  );
  const lastHudUpdateRef = useRef<number>(0);

  // Interactive Disruption Simulation State
  const [manualDisruption, setManualDisruption] = useState<boolean | null>(null);
  const [isSimulatingReroute, setIsSimulatingReroute] = useState<boolean>(false);

  // 5-Stage Hero Logo Intro State (Preserves initial 3.8s reveal & ambient loop)
  const [introState, setIntroState] = useState(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return evaluateHeroIntroSequence(0, prefersReduced);
  });

  useEffect(() => {
    const mediaQuery =
      typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;

    if (mediaQuery?.matches) {
      setIntroState(evaluateHeroIntroSequence(4000, true));
      return;
    }

    let rafId = 0;
    const startTime = performance.now();
    let lastAmbientUpdate = 0;

    const stepIntro = (now: number) => {
      const elapsed = now - startTime;
      const reduced = mediaQuery?.matches ?? false;
      if (reduced) {
        setIntroState(evaluateHeroIntroSequence(4000, true));
        return;
      }

      if (elapsed <= 3850) {
        setIntroState(evaluateHeroIntroSequence(elapsed, false));
      } else if (scrollProgressRef.current < 0.16 && now - lastAmbientUpdate >= 64) {
        lastAmbientUpdate = now;
        setIntroState(evaluateHeroIntroSequence(elapsed, false));
      }

      rafId = window.requestAnimationFrame(stepIntro);
    };

    rafId = window.requestAnimationFrame(stepIntro);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        window.cancelAnimationFrame(rafId);
        setIntroState(evaluateHeroIntroSequence(4000, true));
      }
    };

    mediaQuery?.addEventListener('change', handleMotionChange);
    return () => {
      window.cancelAnimationFrame(rafId);
      mediaQuery?.removeEventListener('change', handleMotionChange);
    };
  }, []);

  const scrollToNormalizedProgress = useCallback((targetP: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const containerTop = window.scrollY + rect.top;
    const scrollableHeight = Math.max(1, container.offsetHeight - window.innerHeight);
    window.scrollTo({
      top: containerTop + clamp01(targetP) * scrollableHeight,
      behavior: 'smooth',
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const scrollable = Math.max(1, container.offsetHeight - window.innerHeight);
      const raw = clamp01(-rect.top / scrollable);
      scrollProgressRef.current = raw;
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // Trigger Simulated Disruption Scenario
  const handleTriggerDisruption = () => {
    setManualDisruption(true);
    setIsSimulatingReroute(false);
  };

  const handleExecuteReroute = () => {
    setIsSimulatingReroute(true);
    setTimeout(() => {
      setManualDisruption(false);
      setIsSimulatingReroute(false);
    }, 1800);
  };

  const handleResetSimulation = () => {
    setManualDisruption(null);
    setIsSimulatingReroute(false);
  };

  // Three.js World Construction
  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const skyColor = new THREE.Color(0xe6f3fb);
    scene.background = skyColor;
    scene.fog = new THREE.Fog(0xe6f3fb, 75, 230);

    const camera = new THREE.PerspectiveCamera(31, width / height, 0.5, 320);
    const initialChoreo = evaluateMasterSupplyChainState(0);
    camera.position.set(
      initialChoreo.cameraPos.x,
      initialChoreo.cameraPos.y,
      initialChoreo.cameraPos.z
    );
    camera.lookAt(
      initialChoreo.lookAt.x,
      initialChoreo.lookAt.y,
      initialChoreo.lookAt.z
    );

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: false,
      });
    } catch {
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    const envTexture = setupStudioEnvironment(renderer, scene);

    // Studio Lighting for Digital Twin Atmosphere
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x99bdd8, 0.92);
    hemiLight.position.set(0, 70, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfffdf8, 1.75);
    dirLight.position.set(-35, 60, 40);
    if (!isSoftwareGl) {
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.camera.near = 10;
      dirLight.shadow.camera.far = 240;
      dirLight.shadow.camera.left = -90;
      dirLight.shadow.camera.right = 110;
      dirLight.shadow.camera.top = 60;
      dirLight.shadow.camera.bottom = -60;
      dirLight.shadow.bias = -0.0004;
    }
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0xa4d4f4, 0.65);
    rimLight.position.set(50, 35, -45);
    scene.add(rimLight);

    // Build the Complete Procedural 3D World Rig
    const worldRig = buildEndToEndSupplyChainWorld(isSoftwareGl);
    scene.add(worldRig.rootGroup);

    // Continuous Ground Plane
    const groundGeo = new THREE.PlaneGeometry(420, 260);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xdfeff9,
      roughness: 0.85,
      metalness: 0.04,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.receiveShadow = !isSoftwareGl;
    scene.add(groundMesh);

    // Precision Architectural Grid
    const gridHelper = new THREE.GridHelper(380, 95, 0xbfd8ea, 0xd4e7f3);
    gridHelper.position.set(0, 0.025, 0);
    scene.add(gridHelper);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const clock = new THREE.Clock();
    const framePacer = createGpuFramePacer(renderer, isSoftwareGl);

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const tick = () => {
      const dt = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      const targetScroll = scrollProgressRef.current;
      const damping = 1 - Math.exp(-8.0 * Math.max(0.016, dt));
      smoothedScrollRef.current = lerpScalar(smoothedScrollRef.current, targetScroll, damping);

      const state = evaluateMasterSupplyChainState(smoothedScrollRef.current, manualDisruption);

      // Smooth camera interpolation
      camera.position.lerp(new THREE.Vector3(state.cameraPos.x, state.cameraPos.y, state.cameraPos.z), 0.08);
      
      const currentLookAt = new THREE.Vector3();
      camera.getWorldDirection(currentLookAt);
      const targetLookAt = new THREE.Vector3(state.lookAt.x, state.lookAt.y, state.lookAt.z);
      camera.lookAt(targetLookAt);

      if (Math.abs(camera.fov - state.fov) > 0.05) {
        camera.fov = lerpScalar(camera.fov, state.fov, 0.08);
        camera.updateProjectionMatrix();
      }

      // 1. Robotic Arms Kinematics (Smart Factory Assembly)
      worldRig.roboticArms.forEach((arm, idx) => {
        const cycle = elapsed * 1.5 + arm.phase;
        arm.upperArm.rotation.z = Math.sin(cycle) * 0.45;
        arm.forearm.rotation.z = Math.cos(cycle * 1.2) * 0.55;
        arm.base.rotation.y = Math.sin(cycle * 0.7) * 0.6;
        arm.sparkLight.intensity = (Math.sin(cycle * 8) > 0.3) ? 1.8 : 0.2;
      });

      // 2. Optical QC Scanner Laser Line
      if (worldRig.qcScannerMesh) {
        worldRig.qcScannerMesh.scale.y = 0.85 + Math.sin(elapsed * 4.2) * 0.15;
      }

      // 3. Conveyor Items Flow through Factory
      worldRig.conveyorItems.forEach((ci) => {
        ci.mesh.position.x += dt * 1.8;
        if (ci.mesh.position.x > ci.endX) {
          ci.mesh.position.x = ci.startX;
        }
      });

      // 4. ASRS High-Bay Storage Carrier Lift
      worldRig.asrsCarriers.forEach((ac) => {
        const phase = (Math.sin(elapsed * ac.speed) + 1) * 0.5;
        ac.mesh.position.y = lerpScalar(ac.startY, ac.targetY, phase);
      });

      // 5. Autonomous Guided Vehicles (AGVs) Navigation
      worldRig.agvVehicles.forEach((agv) => {
        const span = agv.maxZ - agv.minZ;
        const phase = (Math.sin(elapsed * agv.speed) + 1) * 0.5;
        agv.group.position.z = agv.minZ + phase * span;
        agv.group.rotation.y = Math.cos(elapsed * agv.speed) >= 0 ? 0 : Math.PI;
      });

      // 6. Gantry Crane Container Trolleys
      worldRig.craneTrolleys.forEach((ct) => {
        ct.group.position.z = ct.baseZ + Math.sin(elapsed * 0.85 + ct.phase) * 2.2;
      });

      // 7. Quarry Haul Trucks
      worldRig.haulTrucks.forEach((ht) => {
        ht.group.position.x = ht.startX + ((elapsed * ht.speed * 2.5) % (ht.endX - ht.startX + 1));
      });

      // 8. Overhead High-Altitude Cargo Jet
      if (worldRig.cargoJet) {
        worldRig.cargoJet.position.x = -80 + ((elapsed * 5.2) % 180);
      }

      // 9. Neural Intelligence Graph Pulses
      worldRig.intelligencePulses.forEach((ring, idx) => {
        const pulse = 0.8 + 0.3 * Math.sin(elapsed * 3.5 + idx * 0.8);
        ring.scale.set(pulse, pulse, 1);
      });

      // 10. Disruption Simulation Event Rig
      const isDisrupted = manualDisruption === true || (state.activeSceneIndex === 7 && manualDisruption !== false);
      const isRerouted = isSimulatingReroute || manualDisruption === false || (state.activeSceneIndex === 7 && state.sceneLocalProgress > 0.55);

      if (worldRig.disruptionRig) {
        const dRig = worldRig.disruptionRig;
        const warnMat = dRig.supplierWarningBeacon.material as THREE.MeshStandardMaterial;
        const bneckMat = dRig.bottleneckFlowMesh.material as THREE.MeshStandardMaterial;
        const bypassMat = dRig.bypassCorridorMesh.material as THREE.MeshStandardMaterial;
        const facMat = dRig.factoryStatusBeacon.material as THREE.MeshStandardMaterial;

        if (isDisrupted && !isRerouted) {
          // Warning state: Supplier bottleneck active
          const blink = 0.5 + 0.5 * Math.sin(elapsed * 7.5);
          warnMat.emissive.setHex(0xef4444);
          warnMat.emissiveIntensity = 1.0 + blink * 1.5;
          bneckMat.emissive.setHex(0xf59e0b);
          bneckMat.emissiveIntensity = 0.8 + blink * 0.8;
          bypassMat.emissiveIntensity = 0.15;
          dRig.bypassGlowLight.intensity = 0.2;
          facMat.emissive.setHex(0xf59e0b);
        } else if (isRerouted) {
          // Rerouted state: Stochastic Pareto bypass active & production recovered
          warnMat.emissive.setHex(0x38bdf8);
          warnMat.emissiveIntensity = 0.6;
          bneckMat.emissive.setHex(0x38bdf8);
          bneckMat.emissiveIntensity = 0.5;
          bypassMat.emissive.setHex(0x0088ff);
          bypassMat.emissiveIntensity = 1.6 + 0.4 * Math.sin(elapsed * 5.0);
          dRig.bypassGlowLight.intensity = 2.4;
          facMat.emissive.setHex(0x10b981);
          facMat.emissiveIntensity = 1.4;
        } else {
          // Nominal operating state
          warnMat.emissive.setHex(0x0088ff);
          warnMat.emissiveIntensity = 0.4;
          bneckMat.emissive.setHex(0x0088ff);
          bneckMat.emissiveIntensity = 0.5;
          bypassMat.emissiveIntensity = 0.3;
          dRig.bypassGlowLight.intensity = 0.4;
          facMat.emissive.setHex(0x10b981);
        }
      }

      renderer.render(scene, camera);

      const now = performance.now();
      if (now - lastHudUpdateRef.current > 60) {
        lastHudUpdateRef.current = now;
        setHudState(state);
      }

      framePacer.scheduleNext(tick);
    };

    framePacer.scheduleNext(tick);

    return () => {
      window.removeEventListener('resize', handleResize);
      framePacer.dispose();
      envTexture.dispose();
      renderer.dispose();
    };
  }, [manualDisruption, isSimulatingReroute]);

  const heroLine1 =
    activeConfig.homepage.heroHeadlineLine1 || 'The New Standard in';
  const heroLine2 =
    activeConfig.homepage.heroHeadlineLine2 || 'Supply Chain Control';

  const currentScene = hudState.activeScene || SUPPLY_CHAIN_SCENES[0];
  const isDisruptionScene = hudState.activeSceneIndex === 7;

  return (
    <section
      id="process"
      ref={containerRef}
      className="relative w-full h-[520vh] bg-[#E6F3FB] select-none"
      aria-label="Orion-9 End-to-End Intelligent Supply Chain World"
    >
      {/* Sticky Full-Viewport 3D Stage */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden">
        {/* Dedicated WebGL Canvas Mount */}
        <div
          ref={canvasMountRef}
          style={{ opacity: introState.environmentOpacity }}
          className="absolute inset-0 w-full h-full z-0 transition-opacity duration-150"
        />

        {/* ==========================================================================
            1. HERO OVERLAY (ORION-9 CENTERPIECE REVEAL — SCENE 0 & 9 INTEGRATION)
           ========================================================================== */}
        <div
          style={{
            opacity: hudState.heroOpacity,
            transform: `translate3d(0, ${hudState.heroTranslateY}px, 0)`,
            pointerEvents: hudState.heroOpacity > 0.25 ? 'auto' : 'none',
          }}
          className="absolute inset-0 z-10 flex flex-col items-center justify-between pt-16 sm:pt-20 pb-0 px-4 sm:px-6 text-center transition-opacity duration-75"
        >
          <div className="flex-1 flex items-center justify-center w-full">
            <OrionHeroBrandLockup
              introState={introState}
              headlineText={`${heroLine1} ${heroLine2}`.trim()}
              supportingParagraph="From raw materials to suppliers, smart manufacturing, automated warehousing, multimodal transit, and customer delivery—an end-to-end intelligent operating system."
            />
          </div>

          {/* Bottom-Center Scroll Prompt */}
          <div
            style={{ opacity: introState.supportingTextOpacity }}
            className="flex flex-col items-center shrink-0 mb-4"
          >
            <button
              type="button"
              onClick={() => scrollToNormalizedProgress(0.14)}
              className="px-5 py-2.5 rounded-full liquid-glass-button text-xs font-semibold text-[var(--orion-text-primary)] hover:border-[#0284C7] transition-all cursor-pointer shadow-sm hover:scale-[1.02] flex items-center gap-2"
            >
              <span>Explore the Complete Supply Chain</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#0284C7]" />
            </button>
            <div className="w-px h-6 sm:h-8 bg-[var(--orion-text-primary)]/40 mt-1" />
          </div>
        </div>

        {/* ==========================================================================
            2. TOP HORIZONTAL SUPPLY CHAIN STAGE NAVIGATOR (9 SCENES)
           ========================================================================== */}
        <div
          style={{
            opacity: hudState.heroOpacity < 0.85 ? 1 : 0,
            pointerEvents: hudState.heroOpacity < 0.85 ? 'auto' : 'none',
          }}
          className="absolute top-20 sm:top-22 left-0 right-0 z-30 flex justify-center px-4 transition-opacity duration-300"
        >
          <nav
            aria-label="Supply Chain Stage Navigator"
            className="flex items-center gap-1 sm:gap-1.5 p-1.5 rounded-full liquid-glass-elevated border border-[var(--glass-border)] shadow-lg overflow-x-auto max-w-full scrollbar-none"
          >
            {SUPPLY_CHAIN_SCENES.map((scene, idx) => {
              const isActive = hudState.activeSceneIndex === idx;
              return (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() => scrollToNormalizedProgress(scene.scrollTarget)}
                  className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#070B19] text-white shadow-xs font-semibold scale-[1.02]'
                      : 'text-[var(--orion-text-secondary)] hover:text-[var(--orion-text-primary)] hover:bg-white/40'
                  }`}
                >
                  <span className="font-mono text-[10px] opacity-75 mr-1">{scene.number}</span>
                  <span>{scene.shortLabel.split(' ')[1] || scene.shortLabel}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* ==========================================================================
            3. BOTTOM-LEFT PROGRESSIVE 9-STAGE OPERATIONAL HUD
           ========================================================================== */}
        <div
          style={{
            opacity: hudState.heroOpacity < 0.75 ? 1 : 0,
            pointerEvents: hudState.heroOpacity < 0.75 ? 'auto' : 'none',
          }}
          className="absolute bottom-6 sm:bottom-10 left-4 sm:left-10 z-20 w-[calc(100%-2rem)] max-w-[480px] transition-opacity duration-300"
        >
          <div className="liquid-glass-elevated rounded-3xl p-5 sm:p-6 shadow-2xl border border-[var(--glass-border)] space-y-4">
            {/* Header Stage Indicator */}
            <div className="flex items-center justify-between border-b border-[var(--glass-border-subtle)] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#070B19] text-white font-mono text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                  {currentScene.number}
                </span>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#0284C7] font-bold block">
                    STAGE {currentScene.number} OF 09 · OPERATING SYSTEM
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-[#111827] leading-tight">
                    {currentScene.title}
                  </h2>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F0F9FF] border border-[#BAE6FD] text-[10px] font-mono font-semibold text-[#0369A1]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] animate-pulse" />
                <span>LIVE LOCKED</span>
              </div>
            </div>

            {/* Subtitle & Narrative */}
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-[#475569] block">
                {currentScene.subtitle}
              </span>
              <p className="text-xs text-[#566575] leading-relaxed">
                {currentScene.narrative}
              </p>
            </div>

            {/* Live Telemetry KPI Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[var(--glass-border-subtle)]">
              {currentScene.metrics.map((m) => (
                <div
                  key={m.label}
                  className="p-2 rounded-xl bg-white/70 border border-[#E2E8F0] space-y-0.5"
                >
                  <span className="text-[9px] font-mono uppercase tracking-wider text-[#64748B] block truncate">
                    {m.label}
                  </span>
                  <span className={`text-xs font-bold block font-mono ${
                    m.status === 'warning' ? 'text-amber-600' : 'text-[#070B19]'
                  }`}>
                    {m.value}
                  </span>
                </div>
              ))}
            </div>

            {/* ======================================================================
                SCENE 8: PREDICTIVE DISRUPTION INTERACTIVE CONTROLS (SIMULATED)
               ====================================================================== */}
            {isDisruptionScene && (
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>SIMULATED DEMONSTRATION SCENARIO</span>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-200/60 text-amber-900 font-semibold">
                    PARETO SOLVER
                  </span>
                </div>

                <p className="text-[11px] text-amber-800 leading-snug">
                  Demonstration of closed-loop disruption resolution: A simulated 48h bottleneck occurs at the primary supplier. Orion-9 computes alternative multi-modal paths in sub-second latency.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleTriggerDisruption}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] transition shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Trigger 48h Bottleneck</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteReroute}
                    className="px-3 py-1.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-semibold text-[11px] transition shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Execute Air Bypass</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetSimulation}
                    className="p-1.5 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 text-amber-800 transition cursor-pointer"
                    aria-label="Reset simulation"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Telemetry Tagline */}
            <div className="text-[10px] font-mono text-[#0284C7] bg-[#F8FAFC] px-3 py-1.5 rounded-xl border border-[#E2E8F0] flex items-center justify-between">
              <span className="truncate">{currentScene.telemetryTag}</span>
              <span className="text-[9px] text-[#64748B] shrink-0 ml-2">ORION-9 KERNEL</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

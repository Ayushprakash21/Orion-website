/**
 * ORION-9 MASTER ANIMATION — END-TO-END INTELLIGENT SUPPLY CHAIN OPERATING SYSTEM
 * Homepage Centerpiece Interactive Digital Twin
 * 
 * Re-architected with:
 * 1. Proportional 7-stage supply chain visible together:
 *    Raw materials → Supplier → Factory → Warehouse → Distribution centre → Retailer → End customer
 * 2. Continuous path-based motion (NO JUMPING):
 *    Trucks, cargo ships, aircraft, forklifts, and conveyors move along closed trajectories.
 * 3. Stable camera framing with responsive desktop/tablet/mobile composition.
 * 4. Only ONE short heading per scenario:
 *    SCENE 01: "Global Supply Chain Flow"
 *    SCENE 02: "Disruption Detected"
 *    SCENE 03: "Autonomous Recovery"
 * 5. Smooth transitions between all 3 scenarios.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  evaluateHeroIntroSequence,
  clamp01,
  lerpScalar,
} from '../utils/cinematic-choreography';
import {
  detectSoftwareWebGL,
  createGpuFramePacer,
  setupStudioEnvironment,
} from '../utils/three-logistics-craft';
import {
  buildEndToEndSupplyChainWorld,
  type Scene3DRig,
} from '../utils/end-to-end-supply-chain-craft';
import { useSiteConfig } from '../context/SiteConfigContext';
import { OrionHeroBrandLockup } from './OrionLogo';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  ArrowRight,
} from 'lucide-react';

export interface SupplyChainScenario {
  id: 'global-flow' | 'disruption' | 'recovery';
  sceneNumber: '01' | '02' | '03';
  code: string;
  title: string;
  statusBadge: string;
  accent: string;
  accentBg: string;
  accentBorder: string;
}

export const SUPPLY_CHAIN_SCENARIOS: SupplyChainScenario[] = [
  {
    id: 'global-flow',
    sceneNumber: '01',
    code: 'SCENE 01',
    title: 'Global Supply Chain Flow',
    statusBadge: 'ALL CORRIDORS NOMINAL',
    accent: '#0284c7',
    accentBg: 'rgba(2, 132, 199, 0.08)',
    accentBorder: 'rgba(2, 132, 199, 0.25)',
  },
  {
    id: 'disruption',
    sceneNumber: '02',
    code: 'SCENE 02',
    title: 'Disruption Detected',
    statusBadge: 'MARITIME CHOKEPOINT BOTTLENECK',
    accent: '#d97706',
    accentBg: 'rgba(217, 119, 6, 0.08)',
    accentBorder: 'rgba(217, 119, 6, 0.3)',
  },
  {
    id: 'recovery',
    sceneNumber: '03',
    code: 'SCENE 03',
    title: 'Autonomous Recovery',
    statusBadge: 'EXPRESS AIR-BYPASS ACTIVE',
    accent: '#059669',
    accentBg: 'rgba(5, 150, 105, 0.08)',
    accentBorder: 'rgba(5, 150, 105, 0.3)',
  },
];

export const OrionWorldExperience: React.FC = () => {
  const { activeConfig } = useSiteConfig();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  // Scenario state (0 = Global Flow, 1 = Disruption, 2 = Recovery)
  const [activeScenarioIdx, setActiveScenarioIdx] = useState<number>(0);
  const scenarioIdxRef = useRef<number>(0);
  scenarioIdxRef.current = activeScenarioIdx;

  const [autoPlay, setAutoPlay] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  // Scroll tracking for gentle hero transition
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const scrollProgressRef = useRef<number>(0);

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
      } else if (scrollProgressRef.current < 0.25 && now - lastAmbientUpdate >= 64) {
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

  // Track scroll position to fade the hero copy smoothly into the simulation
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const scrollable = Math.max(1, container.offsetHeight - window.innerHeight);
      const raw = clamp01(-rect.top / scrollable);
      scrollProgressRef.current = raw;
      setScrollProgress(raw);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // Autoplay loop: gently cycles scenarios every 12 seconds
  useEffect(() => {
    if (!autoPlay || isHovered) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = window.setTimeout(() => {
      setActiveScenarioIdx((curr) => (curr + 1) % SUPPLY_CHAIN_SCENARIOS.length);
    }, 12000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [autoPlay, isHovered, activeScenarioIdx]);

  const selectScenario = useCallback((idx: number) => {
    setActiveScenarioIdx(idx);
  }, []);

  const nextScenario = useCallback(() => {
    setActiveScenarioIdx((curr) => (curr + 1) % SUPPLY_CHAIN_SCENARIOS.length);
  }, []);

  const prevScenario = useCallback(() => {
    setActiveScenarioIdx(
      (curr) => (curr - 1 + SUPPLY_CHAIN_SCENARIOS.length) % SUPPLY_CHAIN_SCENARIOS.length
    );
  }, []);

  // Three.js World Construction
  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const skyColor = new THREE.Color(0xe8f4fc);
    scene.background = skyColor;
    scene.fog = new THREE.Fog(0xe8f4fc, 70, 160);

    // Balanced stable camera framing: entire width from X: -32 to +32 visible at once
    const isMobile = width < 768;
    const camera = new THREE.PerspectiveCamera(isMobile ? 38 : 32, width / height, 0.5, 260);
    camera.position.set(0, isMobile ? 54 : 38, isMobile ? 74 : 52);
    camera.lookAt(0, 0, 0);

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
    renderer.toneMappingExposure = 1.08;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    const envTexture = setupStudioEnvironment(renderer, scene);

    // Studio Lighting for Digital Twin Atmosphere
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xa0c4e0, 0.95);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfffdf6, 1.85);
    dirLight.position.set(-25, 45, 30);
    if (!isSoftwareGl) {
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.camera.near = 10;
      dirLight.shadow.camera.far = 160;
      dirLight.shadow.camera.left = -50;
      dirLight.shadow.camera.right = 50;
      dirLight.shadow.camera.top = 30;
      dirLight.shadow.camera.bottom = -30;
      dirLight.shadow.bias = -0.0003;
    }
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0xaed7f4, 0.65);
    rimLight.position.set(35, 25, -30);
    scene.add(rimLight);

    // Build the Procedural 7-Stage World Rig
    const worldRig = buildEndToEndSupplyChainWorld(isSoftwareGl);
    scene.add(worldRig.rootGroup);

    // Continuous Ground Plane
    const groundGeo = new THREE.PlaneGeometry(160, 90);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xe2f0fa,
      roughness: 0.88,
      metalness: 0.03,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.receiveShadow = !isSoftwareGl;
    scene.add(groundMesh);

    // Precision Architectural Grid
    const gridHelper = new THREE.GridHelper(140, 70, 0xb8d7ed, 0xd4e9f7);
    gridHelper.position.set(0, 0.02, 0);
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
      const mob = w < 768;
      camera.aspect = w / h;
      camera.fov = mob ? 38 : 32;
      camera.position.set(0, mob ? 54 : 38, mob ? 74 : 52);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Tick Loop
    const tick = () => {
      const dt = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      const currentScenario = scenarioIdxRef.current; // 0 = flow, 1 = disruption, 2 = recovery

      // =====================================================================
      // 1. CONTINUOUS VEHICLE KINEMATICS (Closed-loop Catmull-Rom Trajectories)
      // =====================================================================
      const updateVehicle = (
        v: { group: THREE.Group; curve: THREE.CatmullRomCurve3; speed: number; currentT: number },
        speedMultiplier = 1.0
      ) => {
        v.currentT = (v.currentT + dt * v.speed * speedMultiplier) % 1.0;
        const pos = v.curve.getPointAt(v.currentT);
        const tangent = v.curve.getTangentAt(v.currentT);
        v.group.position.copy(pos);
        const headingY = Math.atan2(tangent.x, tangent.z);
        v.group.rotation.y = headingY;
      };

      // Truck 1: Raw Materials <-> Supplier <-> Factory
      updateVehicle(worldRig.truck1);

      // Truck 2: Factory <-> Warehouse <-> Distribution
      updateVehicle(worldRig.truck2);

      // Delivery Van: Distribution <-> Retailer <-> Customer
      updateVehicle(worldRig.deliveryVan);

      // Forklift: Indoor warehouse pallet transit
      updateVehicle(worldRig.forklift);

      // High-Altitude Aircraft Circuit
      updateVehicle(worldRig.cargoJet);

      // Container Ship kinematics under scenario modulation
      let shipSpeedMul = 1.0;
      if (currentScenario === 1) {
        // Disruption scenario: Maritime ship slows down at chokepoint zone
        const isNearChokepoint = worldRig.containerShip.currentT > 0.15 && worldRig.containerShip.currentT < 0.65;
        shipSpeedMul = isNearChokepoint ? 0.22 : 0.65;
      }
      updateVehicle(worldRig.containerShip, shipSpeedMul);

      // Bypass Aircraft: Active in Scenario 3
      if (currentScenario === 2) {
        worldRig.bypassAircraft.group.visible = true;
        updateVehicle(worldRig.bypassAircraft, 1.25);
      } else {
        worldRig.bypassAircraft.group.visible = false;
      }

      // =====================================================================
      // 2. INTERNAL MACHINERY & WORKER PROCEDURAL DYNAMICS
      // =====================================================================
      // Robotic Arms inside Smart Factory
      worldRig.roboticArms.forEach((arm) => {
        const cycle = elapsed * 1.6 + arm.phase;
        arm.upperArm.rotation.z = Math.sin(cycle) * 0.4;
        arm.forearm.rotation.z = Math.cos(cycle * 1.3) * 0.45;
        arm.base.rotation.y = Math.sin(cycle * 0.8) * 0.55;
        arm.sparkLight.intensity = Math.sin(cycle * 7) > 0.4 ? 1.4 : 0.15;
      });

      // Holographic Optical QC Scanner Laser
      if (worldRig.qcScannerMesh) {
        worldRig.qcScannerMesh.scale.y = 0.9 + Math.sin(elapsed * 4.5) * 0.12;
      }

      // Conveyor items flow through factory
      worldRig.conveyorItems.forEach((ci) => {
        ci.mesh.position.x += dt * 1.4;
        if (ci.mesh.position.x > ci.endX) {
          ci.mesh.position.x = ci.startX;
        }
      });

      // ASRS Vertical Elevator Carriage
      worldRig.asrsCarriers.forEach((ac) => {
        const phase = (Math.sin(elapsed * ac.speed) + 1) * 0.5;
        ac.mesh.position.y = lerpScalar(ac.startY, ac.targetY, phase);
      });

      // Gantry Crane Trolley Hoist
      worldRig.craneTrolleys.forEach((ct) => {
        ct.group.position.z = ct.baseZ + Math.sin(elapsed * 0.75 + ct.phase) * 1.2;
      });

      // Stylized Worker Idle Breathing & Posture
      worldRig.workers.forEach((w) => {
        const breath = Math.sin(elapsed * 2.2 + w.phase) * 0.02;
        w.group.position.y = w.baseY + breath;
      });

      // =====================================================================
      // 3. SCENARIO DISRUPTION & RECOVERY VISUAL STATES
      // =====================================================================
      const dRig = worldRig.disruptionRig;
      const sBeacons = worldRig.statusBeacons;

      if (currentScenario === 0) {
        // SCENE 01: Global Supply Chain Flow (Nominal)
        dRig.chokepointBeacon.visible = false;
        dRig.chokepointCorridor.visible = false;
        dRig.bypassCorridor.visible = false;
        dRig.bypassGlowLight.intensity = 0;

        (sBeacons.supplier.material as THREE.MeshStandardMaterial).emissive.setHex(0x0284c7);
        (sBeacons.factory.material as THREE.MeshStandardMaterial).emissive.setHex(0x10b981);
        (sBeacons.warehouse.material as THREE.MeshStandardMaterial).emissive.setHex(0x10b981);
        (sBeacons.port.material as THREE.MeshStandardMaterial).emissive.setHex(0x0284c7);
      } else if (currentScenario === 1) {
        // SCENE 02: Disruption Detected (Restrained Amber Chokepoint Pulse)
        dRig.chokepointBeacon.visible = true;
        dRig.chokepointCorridor.visible = true;
        dRig.bypassCorridor.visible = false;
        dRig.bypassGlowLight.intensity = 0;

        const pulse = 0.6 + 0.4 * Math.sin(elapsed * 6.0);
        const chokeMat = dRig.chokepointCorridor.material as THREE.MeshStandardMaterial;
        chokeMat.emissive.setHex(0xf59e0b);
        chokeMat.emissiveIntensity = 1.0 + pulse * 1.2;

        (sBeacons.supplier.material as THREE.MeshStandardMaterial).emissive.setHex(0xf59e0b);
        (sBeacons.factory.material as THREE.MeshStandardMaterial).emissive.setHex(0xf59e0b);
        (sBeacons.warehouse.material as THREE.MeshStandardMaterial).emissive.setHex(0x10b981); // Downstream continues
        (sBeacons.port.material as THREE.MeshStandardMaterial).emissive.setHex(0xf59e0b);
      } else if (currentScenario === 2) {
        // SCENE 03: Autonomous Recovery (Air Bypass Active & Recovered Equilibrium)
        dRig.chokepointBeacon.visible = false;
        dRig.chokepointCorridor.visible = false;
        dRig.bypassCorridor.visible = true;
        dRig.bypassGlowLight.intensity = 2.0;

        const bypassMat = dRig.bypassCorridor.material as THREE.MeshStandardMaterial;
        bypassMat.emissive.setHex(0x10b981);
        bypassMat.emissiveIntensity = 1.4 + 0.4 * Math.sin(elapsed * 4.5);

        (sBeacons.supplier.material as THREE.MeshStandardMaterial).emissive.setHex(0x10b981);
        (sBeacons.factory.material as THREE.MeshStandardMaterial).emissive.setHex(0x10b981);
        (sBeacons.warehouse.material as THREE.MeshStandardMaterial).emissive.setHex(0x10b981);
        (sBeacons.port.material as THREE.MeshStandardMaterial).emissive.setHex(0x10b981);
      }

      renderer.render(scene, camera);
      framePacer.scheduleNext(tick);
    };

    framePacer.scheduleNext(tick);

    return () => {
      window.removeEventListener('resize', handleResize);
      framePacer.dispose();
      envTexture.dispose();
      renderer.dispose();
    };
  }, []);

  const heroLine1 =
    activeConfig.homepage.heroHeadlineLine1 || 'The New Standard in';
  const heroLine2 =
    activeConfig.homepage.heroHeadlineLine2 || 'Supply Chain Control';

  const currentScenario = SUPPLY_CHAIN_SCENARIOS[activeScenarioIdx];

  // Hero fade: when scrolling down, hero copy smoothly yields focus to the simulation
  const heroOpacity = clamp01(1 - scrollProgress * 2.8);
  const heroTranslateY = -scrollProgress * 60;
  const isSimulationFocused = scrollProgress > 0.16;

  return (
    <section
      id="process"
      ref={containerRef}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      className="relative w-full h-[145vh] bg-[#E8F4FC] select-none overflow-visible"
      aria-label="Orion-9 End-to-End Intelligent Supply Chain Digital Twin"
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
            1. HERO OVERLAY (ORION-9 INITIAL BRAND REVEAL — SCROLLS SMOOTHLY AWAY)
           ========================================================================== */}
        <div
          style={{
            opacity: heroOpacity,
            transform: `translate3d(0, ${heroTranslateY}px, 0)`,
            pointerEvents: heroOpacity > 0.3 ? 'auto' : 'none',
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

          {/* Bottom-Center Scroll Cue */}
          <div
            style={{ opacity: introState.supportingTextOpacity }}
            className="flex flex-col items-center shrink-0 mb-4"
          >
            <div className="px-4 py-2 rounded-full liquid-glass-button text-xs font-semibold text-[var(--orion-text-primary)] shadow-sm flex items-center gap-2">
              <span>Scroll to explore the complete supply chain</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#0284C7]" />
            </div>
            <div className="w-px h-6 bg-[var(--orion-text-primary)]/40 mt-1" />
          </div>
        </div>

        {/* ==========================================================================
            2. MINIMAL SCENARIO HEADER (Strictly ONE SHORT HEADING per requirement)
           ========================================================================== */}
        <div
          style={{
            opacity: isSimulationFocused || heroOpacity < 0.4 ? 1 : 0,
            transform: `translate3d(0, ${isSimulationFocused || heroOpacity < 0.4 ? 0 : -16}px, 0)`,
            pointerEvents: isSimulationFocused || heroOpacity < 0.4 ? 'auto' : 'none',
          }}
          className="absolute top-20 sm:top-24 left-0 right-0 z-20 flex flex-col items-center text-center px-4 transition-all duration-300"
        >
          {/* Subtle Status Pill above heading */}
          <div
            style={{
              backgroundColor: currentScenario.accentBg,
              borderColor: currentScenario.accentBorder,
              color: currentScenario.accent,
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider border mb-2 shadow-xs backdrop-blur-md"
          >
            <span
              style={{ backgroundColor: currentScenario.accent }}
              className="w-1.5 h-1.5 rounded-full animate-pulse"
            />
            <span>{currentScenario.statusBadge}</span>
          </div>

          {/* ONLY ONE SHORT HEADING (Strict Requirement: No paragraphs, no extra cards) */}
          <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#081326] drop-shadow-xs px-2">
            {currentScenario.title}
          </h2>
        </div>

        {/* ==========================================================================
            3. SCENARIO SWITCHER CONTROLS (Smooth Navigation between 3 Scenes)
           ========================================================================== */}
        <div
          style={{
            opacity: isSimulationFocused || heroOpacity < 0.4 ? 1 : 0,
            transform: `translate3d(0, ${isSimulationFocused || heroOpacity < 0.4 ? 0 : 16}px, 0)`,
            pointerEvents: isSimulationFocused || heroOpacity < 0.4 ? 'auto' : 'none',
          }}
          className="absolute bottom-6 sm:bottom-10 left-0 right-0 z-20 flex justify-center px-3 transition-all duration-300"
        >
          <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-white/90 border border-[#B8D7ED]/80 backdrop-blur-xl shadow-xl max-w-[calc(100vw-1.5rem)] overflow-x-auto scrollbar-none">
            {/* Scenario Pills */}
            {SUPPLY_CHAIN_SCENARIOS.map((scenario, idx) => {
              const isActive = idx === activeScenarioIdx;
              return (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => selectScenario(idx)}
                  className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 ${
                    isActive
                      ? 'bg-[#081326] text-white shadow-md scale-[1.02]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <span
                    style={{
                      backgroundColor: isActive ? scenario.accent : '#94A3B8',
                    }}
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                  />
                  <span className="whitespace-nowrap">
                    <span className="hidden sm:inline">{scenario.code}: </span>
                    <span>{scenario.title}</span>
                  </span>
                </button>
              );
            })}

            <div className="h-4 w-px bg-slate-300 mx-1" />

            {/* Prev / Play-Pause / Next Controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevScenario}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                aria-label="Previous scenario"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setAutoPlay(!autoPlay)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                aria-label={autoPlay ? 'Pause auto-play' : 'Resume auto-play'}
              >
                {autoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={nextScenario}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                aria-label="Next scenario"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

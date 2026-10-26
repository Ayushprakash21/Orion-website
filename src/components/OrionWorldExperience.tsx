/**
 * ORION-9 MASTER ANIMATION — END-TO-END INTELLIGENT SUPPLY CHAIN OPERATING SYSTEM
 * Homepage Centerpiece Interactive Digital Twin
 * 
 * Re-architected from visual references (Reference Screenshots 3 & 4):
 * 1. Scroll = 0: High-angle panoramic hero composition matching Reference Screenshot 3
 *    (Centered OrionHeroBrandLockup, "The New Standard in Supply Chain Control", "Scroll to Discover Our Process").
 * 2. Scroll > 0.16: Smooth camera glide along the glowing pipeline through all 7 stages matching Reference Screenshot 4.
 * 3. Bottom-left floating liquid-glass card displaying the 7 supply chain stages:
 *    - 01 Raw Materials Origin
 *    - 02 Supplier & Component Fabrication
 *    - 03 Smart Manufacturing Hub
 *    - 04 Automated High-Bay Warehousing & ASRS
 *    - 05 Multimodal Logistics (Canal Port, Elevated Highway, Air-Cargo Hub)
 *    - 06 Regional Retail Distribution
 *    - 07 Customer Destination & SLA Verification
 * 4. Compact, proportional layout:
 *    - ~30% reduced card footprint so the 3D supply-chain landscape remains front and center.
 *    - No clutter or floating intelligence engine cards on the homepage.
 * 5. Continuous path-based motion (NO JUMPING or coordinate resets):
 *    - Cargo ships along deepwater canal
 *    - Freight trucks along elevated highway
 *    - Hub trucks docking at warehouse bays
 *    - Intermodal shuttle between port quay and air terminal
 *    - Airborne cargo aircraft along flight corridor
 *    - Articulated robotic assembly arms with spark effects
 *    - High-bay ASRS vertical elevator carriage
 *    - Optical QC laser scanner
 *    - Gantry crane container hoists
 *    - Rotating wind turbines on ridge
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  SUPPLY_CHAIN_7_STAGES,
  evaluateWorldScrollState,
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
import { ArrowRight } from 'lucide-react';

const STAGE_HEADINGS: readonly string[] = [
  'Raw Material Origins',
  'Supplier Fabrication',
  'Manufacturing & Assembly',
  'Warehouse & Inventory',
  'Global Distribution',
  'Regional Distribution',
  'Customer Fulfillment',
];

const STATION_LOCATIONS = [
  { x: -42, y: 1.5, z: 1 },    // Stage 0: Raw Material Origins
  { x: -26, y: 1.8, z: -1 },   // Stage 1: Supplier Fabrication
  { x: 2, y: 2.8, z: -1 },     // Stage 2: Manufacturing & Assembly
  { x: 70, y: 3.5, z: 0 },     // Stage 3: Warehouse & Inventory
  { x: 35, y: 4.2, z: 3 },     // Stage 4: Global Distribution
  { x: 68, y: 1.8, z: 6 },     // Stage 5: Regional Distribution
  { x: 88, y: 2.0, z: 1 },     // Stage 6: Customer Fulfillment
] as const;

export const OrionWorldExperience: React.FC = () => {
  const { activeConfig } = useSiteConfig();
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  // Scroll tracking & smoothed camera interpolation
  const scrollProgressRef = useRef<number>(0);
  const smoothedScrollRef = useRef<number>(0);
  const [hudState, setHudState] = useState(() => evaluateWorldScrollState(0));
  const lastHudUpdateRef = useRef<number>(0);

  // 10-Second Automatic Transition System (advances smoothly through stages when viewing)
  const autoStage7IndexRef = useRef<number>(0);
  const targetAutoProgressRef = useRef<number>(0.18);
  const isAutoAdvancingRef = useRef<boolean>(false);
  const lastUserScrollTimestampRef = useRef<number>(0);

  useEffect(() => {
    const AUTO_STAGE_INTERVAL_MS = 10000; // 10 seconds
    let timerId: ReturnType<typeof setInterval> | null = null;

    const startAutoTimer = () => {
      if (timerId) clearInterval(timerId);
      timerId = setInterval(() => {
        if (document.hidden) return;
        const now = performance.now();
        // If user hasn't scrolled in the last 6s and is in process view
        if (now - lastUserScrollTimestampRef.current >= 6000 && scrollProgressRef.current >= 0.12) {
          isAutoAdvancingRef.current = true;
          autoStage7IndexRef.current = (autoStage7IndexRef.current + 1) % SUPPLY_CHAIN_7_STAGES.length;
          targetAutoProgressRef.current = SUPPLY_CHAIN_7_STAGES[autoStage7IndexRef.current].scrollTarget;
        }
      }, AUTO_STAGE_INTERVAL_MS);
    };

    startAutoTimer();

    const handleVisibility = () => {
      if (document.hidden) {
        if (timerId) clearInterval(timerId);
      } else {
        startAutoTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      if (timerId) clearInterval(timerId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

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
      } else if (scrollProgressRef.current < 0.22 && now - lastAmbientUpdate >= 64) {
        // Throttled ambient loop while hero is visible
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
      lastUserScrollTimestampRef.current = performance.now();
      isAutoAdvancingRef.current = false;
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

  // Three.js 3D World Construction
  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const skyColor = new THREE.Color(0xe6f3fb);
    scene.background = skyColor;
    scene.fog = new THREE.Fog(0xe6f3fb, 65, 185);

    const isMobile = width < 768;
    const initialChoreo = evaluateWorldScrollState(0);
    const camera = new THREE.PerspectiveCamera(isMobile ? 36 : 31, width / height, 0.5, 260);
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
    renderer.toneMappingExposure = 1.04;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    const envTexture = setupStudioEnvironment(renderer, scene);

    // Calibrated studio lighting: directional key + cool ice-blue shadow fill
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x99bdd8, 0.92);
    hemiLight.position.set(0, 60, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfffdf8, 1.75);
    dirLight.position.set(-28, 52, 34);
    if (!isSoftwareGl) {
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.camera.near = 10;
      dirLight.shadow.camera.far = 195;
      dirLight.shadow.camera.left = -55;
      dirLight.shadow.camera.right = 105;
      dirLight.shadow.camera.top = 50;
      dirLight.shadow.camera.bottom = -50;
      dirLight.shadow.bias = -0.0005;
    }
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0xa4d4f4, 0.6);
    rimLight.position.set(45, 28, -36);
    scene.add(rimLight);

    // Continuous Architectural Ground Plane & Subtle Grid Lines
    const groundGeo = new THREE.PlaneGeometry(360, 240);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xdfeff9,
      roughness: 0.85,
      metalness: 0.04,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.receiveShadow = !isSoftwareGl;
    scene.add(groundMesh);

    const gridHelper = new THREE.GridHelper(300, 75, 0xbfd8ea, 0xcfe4f2);
    gridHelper.position.set(28, 0.025, 0);
    scene.add(gridHelper);

    // =======================================================================
    // DYNAMIC ACTIVE-STATION VISUAL HIGHLIGHT RIG (Requirement 5)
    // Subtly illuminates the currently active supply-chain station with focused
    // spotlight lighting and ground beacon halo.
    // =======================================================================
    const stationHaloGeo = new THREE.RingGeometry(3.0, 3.7, 32);
    stationHaloGeo.rotateX(-Math.PI / 2);
    const stationHaloMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });
    const stationHaloMesh = new THREE.Mesh(stationHaloGeo, stationHaloMat);
    stationHaloMesh.position.set(-42, 0.08, 1);
    scene.add(stationHaloMesh);

    const stationSpotlight = new THREE.SpotLight(0x38bdf8, 2.2, 55, Math.PI / 5, 0.5, 1.2);
    stationSpotlight.position.set(-42, 22, 10);
    const stationTarget = new THREE.Object3D();
    stationTarget.position.set(-42, 1.2, 1);
    scene.add(stationTarget);
    stationSpotlight.target = stationTarget;
    scene.add(stationSpotlight);

    // Build the Procedural 7-Stage World Rig
    const worldRig: Scene3DRig = buildEndToEndSupplyChainWorld(isSoftwareGl);
    scene.add(worldRig.rootGroup);

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
      camera.fov = mob ? 36 : 31;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Tick Loop
    const tick = () => {
      const dt = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // Smooth scroll lerp for stable, cinematic camera gliding
      // Supports both manual scrolling and automatic 10-second stage transitions
      const rawScroll = scrollProgressRef.current;
      let targetProgress = rawScroll;
      if (
        isAutoAdvancingRef.current &&
        performance.now() - lastUserScrollTimestampRef.current >= 6000
      ) {
        targetProgress = targetAutoProgressRef.current;
      }
      smoothedScrollRef.current += (targetProgress - smoothedScrollRef.current) * 0.085;
      const currentScroll = smoothedScrollRef.current;

      const state = evaluateWorldScrollState(currentScroll);

      // Camera interpolation along Catmull-Rom keyframes
      camera.position.set(state.cameraPos.x, state.cameraPos.y, state.cameraPos.z);
      camera.lookAt(state.lookAt.x, state.lookAt.y, state.lookAt.z);

      // Dynamically highlight the active supply-chain station (Requirement 5)
      const targetStationCoord =
        STATION_LOCATIONS[state.activeStage7Index] || STATION_LOCATIONS[0];
      stationHaloMesh.position.x += (targetStationCoord.x - stationHaloMesh.position.x) * 0.08;
      stationHaloMesh.position.z += (targetStationCoord.z - stationHaloMesh.position.z) * 0.08;
      stationHaloMesh.position.y = 0.08;

      stationTarget.position.x = stationHaloMesh.position.x;
      stationTarget.position.y = targetStationCoord.y;
      stationTarget.position.z = stationHaloMesh.position.z;

      stationSpotlight.position.x = stationHaloMesh.position.x;
      stationSpotlight.position.z = stationHaloMesh.position.z + 9;
      stationSpotlight.position.y = 20;

      // Subtle breath/pulse on the active station beacon
      stationHaloMat.opacity = 0.42 + 0.28 * Math.sin(elapsed * 3.6);

      // Update Route Pulse Shader for the Continuous Cyan Pipeline
      if (worldRig.cyanPipelineMat.uniforms) {
        worldRig.cyanPipelineMat.uniforms.uTime.value = elapsed;
        worldRig.cyanPipelineMat.uniforms.uDrawProgress.value = Math.max(0.2, state.cyanBeamProgress);
      }

      // =======================================================================
      // 1. CONTINUOUS VEHICLE KINEMATICS (NO JUMPING OR RESET COORD TELEPORTATION)
      // =======================================================================
      // Maritime Vessel 1: Continuous canal transit with smooth wrapping
      worldRig.ship1.position.x = -42 + ((elapsed * 1.15) % 48);

      // Maritime Vessel 2: Continuous canal transit eastbound
      worldRig.ship2.position.x = 52 + ((elapsed * 1.0) % 46);

      // Highway Freight Truck 1 (Westbound on elevated deck)
      worldRig.truck1.position.x = -38 + ((elapsed * 4.6) % 120);

      // Highway Freight Truck 2 (Eastbound on elevated deck)
      worldRig.truck2.position.x = 86 - ((elapsed * 4.1) % 120);

      // Warehouse Hub Trucks: Docking & departure harmonic cycle (Trucks 1 & 2)
      const bayCycle1 = (elapsed * 0.32) % 1.0;
      const bayZ1 = bayCycle1 < 0.45 ? lerpScalar(5.8, 7.6, bayCycle1 / 0.45) : lerpScalar(7.6, 5.8, (bayCycle1 - 0.45) / 0.55);
      worldRig.hubTruck1.position.set(-4.65, 0.22, bayZ1);

      const bayCycle2 = (elapsed * 0.32 + 0.5) % 1.0;
      const bayZ2 = bayCycle2 < 0.45 ? lerpScalar(5.8, 7.6, bayCycle2 / 0.45) : lerpScalar(7.6, 5.8, (bayCycle2 - 0.45) / 0.55);
      worldRig.hubTruck2.position.set(4.65, 0.22, bayZ2);

      // Intermodal Shuttle Truck: Continuous transit between Port Quay (+9) & Air Terminal (-10)
      const shuttlePhase = (Math.sin(elapsed * 0.52) + 1) * 0.5;
      worldRig.hubTruck3.position.set(13.5, 0.22, lerpScalar(-9.5, 8.5, shuttlePhase));
      worldRig.hubTruck3.rotation.y = Math.cos(elapsed * 0.52) >= 0 ? 0 : Math.PI;

      // Airborne Cargo Jet: Continuous high-altitude glide
      worldRig.cargoJet.position.x = 12 + ((elapsed * 3.4) % 80);
      worldRig.cargoJet.position.y = 11.2 + Math.sin(elapsed * 1.3) * 0.35;

      // Ensure Disruption & Bypass Rigs remain safely dormant
      const dRig = worldRig.disruptionRig;
      dRig.warningBeacon.visible = false;
      dRig.warningLight.intensity = 0;
      dRig.bypassConduit.visible = false;
      dRig.bypassGlowLight.intensity = 0;
      worldRig.bypassAircraft.visible = false;
      worldRig.redTube1Mat.color.setHex(0xff3b30);
      worldRig.redTube1Mat.emissive.setHex(0xff3b30);
      worldRig.redTube1Mat.emissiveIntensity = 1.35;

      // =======================================================================
      // 2. FACILITY MACHINERY, ROBOTICS & PROCEDURAL DYNAMICS
      // =======================================================================
      // Wind Turbines Rotation
      for (let i = 0; i < worldRig.turbineRotors.length; i++) {
        worldRig.turbineRotors[i].rotation.z += dt * (1.2 + i * 0.15);
      }

      // Smart Factory Articulated Robotic Arms
      worldRig.roboticArms.forEach((arm) => {
        const cycle = elapsed * 1.8 + arm.phase;
        arm.upperArm.rotation.z = Math.sin(cycle) * 0.38;
        arm.forearm.rotation.z = Math.cos(cycle * 1.2) * 0.42;
        arm.base.rotation.y = Math.sin(cycle * 0.7) * 0.52;
        arm.sparkLight.intensity = Math.sin(cycle * 6.5) > 0.4 ? 1.6 : 0.15;
      });

      // Inline Optical QC Laser Vertical Sweep
      if (worldRig.qcScannerMesh) {
        worldRig.qcScannerMesh.scale.y = 0.9 + Math.sin(elapsed * 4.8) * 0.14;
      }

      // Factory Conveyor Belt Items Transit
      worldRig.conveyorItems.forEach((ci) => {
        ci.mesh.position.x += dt * 1.6;
        if (ci.mesh.position.x > ci.endX) {
          ci.mesh.position.x = ci.startX;
        }
      });

      // High-Bay Warehouse ASRS Vertical Elevator Lift
      if (worldRig.asrsCarrier) {
        worldRig.asrsCarrier.position.y = 1.2 + ((Math.sin(elapsed * 1.1) + 1) * 0.5) * 4.2;
      }

      // Port Gantry Crane Trolley Hoist Transits
      worldRig.craneTrolleys.forEach((ct) => {
        ct.group.position.z = ct.baseZ + Math.sin(elapsed * 0.82 + ct.phase) * 2.2;
      });

      // Inspection Gates Scan Lighting
      for (let i = 0; i < worldRig.checkpointGates.length; i++) {
        const gMat = worldRig.checkpointGates[i].material as THREE.MeshStandardMaterial;
        gMat.emissiveIntensity = 0.6 + state.checkpointScanWeight * (1.2 + 0.6 * Math.sin(elapsed * 4.2 + i));
      }

      // Warehouse Skylights & Dock Beacons Activation
      const hubActivation = Math.max(state.matrixWaveWeight, state.emblemLockWeight);
      for (let i = 0; i < worldRig.skylightMats.length; i++) {
        const pulse = 0.5 + 0.5 * Math.sin(elapsed * 2.6 - i * 0.4);
        worldRig.skylightMats[i].emissiveIntensity = 0.18 + hubActivation * (0.55 + 0.45 * pulse);
      }
      for (let i = 0; i < worldRig.bayBeaconMats.length; i++) {
        const dockPulse = 0.5 + 0.5 * Math.sin(elapsed * 3.2 + i * 0.85);
        worldRig.bayBeaconMats[i].emissiveIntensity = 0.5 + hubActivation * (0.8 + 0.6 * dockPulse);
      }

      worldRig.roofEmblemMat.emissiveIntensity = 0.65 + state.emblemLockWeight * 1.15;

      renderer.render(scene, camera);

      const now = performance.now();
      if (now - lastHudUpdateRef.current > 50) {
        lastHudUpdateRef.current = now;
        setHudState(state);
        autoStage7IndexRef.current = state.activeStage7Index;
      }

      framePacer.scheduleNext(tick);
    };

    framePacer.scheduleNext(tick);

    return () => {
      window.removeEventListener('resize', handleResize);
      framePacer.dispose();
      stationHaloGeo.dispose();
      stationHaloMat.dispose();
      envTexture.dispose();
      renderer.dispose();
    };
  }, []);

  const heroLine1 =
    activeConfig.homepage.heroHeadlineLine1 || 'The New Standard in';
  const heroLine2 =
    activeConfig.homepage.heroHeadlineLine2 || 'Supply Chain Control';

  return (
    <section
      id="process"
      ref={containerRef}
      className="relative w-full h-[480vh] bg-[#E6F3FB] select-none overflow-visible"
      aria-label="Orion-9 3D Supply Chain Operating World and Process"
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
            1. HERO OVERLAY (ORION-9 INITIAL BRAND REVEAL — MATCHES SCREENSHOT 3)
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
            className="flex flex-col items-center shrink-0 mb-4 sm:mb-6"
          >
            <button
              type="button"
              onClick={() => scrollToNormalizedProgress(0.18)}
              className="px-5 py-2.5 rounded-lg bg-white border border-[#BDD6E8] text-xs font-semibold text-[#070B19] hover:border-[#070B19] transition-colors cursor-pointer shadow-xs flex items-center gap-2"
            >
              <span>Scroll to Discover Our Process</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#0284C7]" />
            </button>
            <div className="w-px h-6 sm:h-8 bg-[#070B19]/40 mt-1" />
          </div>
        </div>

        {/* ==========================================================================
            2. MINIMAL DYNAMIC LEFT-ALIGNED STAGE HEADING INDICATOR
               Replaces large card, badges, descriptions, telemetry tags, and numbered
               navigation strip with pure, left-aligned typography, subtle transition,
               and restrained cyan accent dot.
           ========================================================================== */}
        <div
          style={{
            opacity: hudState.processHudOpacity,
            pointerEvents: 'none',
          }}
          className="absolute bottom-8 sm:bottom-12 md:bottom-14 left-6 sm:left-10 md:left-14 z-20 transition-opacity duration-300"
          aria-live="polite"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={hudState.activeStage7Index}
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -14 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 10 }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-2.5 sm:gap-3"
            >
              <span
                className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#0284C7] shadow-[0_0_10px_rgba(2,132,199,0.75)] shrink-0"
                aria-hidden="true"
              />
              <h2 className="font-editorial text-lg sm:text-2xl md:text-[26px] font-bold tracking-[-0.015em] text-[#070B19] select-none whitespace-nowrap drop-shadow-xs">
                {STAGE_HEADINGS[hudState.activeStage7Index] || STAGE_HEADINGS[0]}
              </h2>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

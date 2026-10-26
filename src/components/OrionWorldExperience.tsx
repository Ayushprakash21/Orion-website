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
 * 4. Continuous path-based motion (NO JUMPING or coordinate resets):
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
 * 5. Orion-9 Intelligence Demonstration (Simulated Demonstration):
 *    - Interactive control widget allowing user to toggle:
 *      [Nominal Flow], [Simulate Supplier Delay], [Autonomous Bypass Recovery]
 *    - Amber warning beacon & alert conduit pulse at supplier node
 *    - Emerald-green bypass corridor lights up with express air-cargo flight
 *    - Downstream SLA protected & verified recovery
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  SUPPLY_CHAIN_7_STAGES,
  WORLD_PROCESS_STEPS,
  evaluateWorldScrollState,
  evaluateHeroIntroSequence,
  clamp01,
  lerpScalar,
  type SupplyChainProcessStage,
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
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  Play,
  Pause,
} from 'lucide-react';

export type IntelligenceDemoMode = 'nominal' | 'delay' | 'recovery';

export const OrionWorldExperience: React.FC = () => {
  const { activeConfig } = useSiteConfig();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  // Scroll tracking & smoothed camera interpolation
  const scrollProgressRef = useRef<number>(0);
  const smoothedScrollRef = useRef<number>(0);
  const [hudState, setHudState] = useState(() => evaluateWorldScrollState(0));
  const lastHudUpdateRef = useRef<number>(0);

  // Orion-9 Intelligence Simulation State
  const [demoMode, setDemoMode] = useState<IntelligenceDemoMode>('nominal');
  const demoModeRef = useRef<IntelligenceDemoMode>('nominal');
  demoModeRef.current = demoMode;

  // Auto-tour or manual autoplay through 7 stages
  const [autoTour, setAutoTour] = useState<boolean>(false);
  const autoTourRef = useRef<boolean>(false);
  autoTourRef.current = autoTour;

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
      const rawScroll = scrollProgressRef.current;
      smoothedScrollRef.current += (rawScroll - smoothedScrollRef.current) * 0.085;
      const currentScroll = smoothedScrollRef.current;

      const state = evaluateWorldScrollState(currentScroll);

      // Camera interpolation along Catmull-Rom keyframes
      camera.position.set(state.cameraPos.x, state.cameraPos.y, state.cameraPos.z);
      camera.lookAt(state.lookAt.x, state.lookAt.y, state.lookAt.z);

      // Update Route Pulse Shader for the Continuous Cyan Pipeline
      if (worldRig.cyanPipelineMat.uniforms) {
        worldRig.cyanPipelineMat.uniforms.uTime.value = elapsed;
        worldRig.cyanPipelineMat.uniforms.uDrawProgress.value = Math.max(0.2, state.cyanBeamProgress);
      }

      // =======================================================================
      // 1. CONTINUOUS VEHICLE KINEMATICS (NO JUMPING OR RESET COORD TELEPORTATION)
      // =======================================================================
      const currentMode = demoModeRef.current;

      // Maritime Vessel 1: Continuous canal transit with smooth wrapping
      const ship1Speed = currentMode === 'delay' ? 0.35 : 1.15;
      worldRig.ship1.position.x = -42 + ((elapsed * ship1Speed) % 48);

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

      // =======================================================================
      // 2. ORION-9 INTELLIGENCE SIMULATION DYNAMICS (DELAY & AUTONOMOUS RECOVERY)
      // =======================================================================
      const dRig = worldRig.disruptionRig;

      if (currentMode === 'nominal') {
        dRig.warningBeacon.visible = false;
        dRig.warningLight.intensity = 0;
        dRig.bypassConduit.visible = false;
        dRig.bypassGlowLight.intensity = 0;
        worldRig.bypassAircraft.visible = false;
        worldRig.redTube1Mat.color.setHex(0xff3b30);
        worldRig.redTube1Mat.emissive.setHex(0xff3b30);
        worldRig.redTube1Mat.emissiveIntensity = 1.35;
      } else if (currentMode === 'delay') {
        // Supplier bottleneck alert: pulsating amber beacon and warning conduit
        dRig.warningBeacon.visible = true;
        const pulse = 0.5 + 0.5 * Math.sin(elapsed * 6.5);
        dRig.warningLight.intensity = 1.8 + pulse * 1.5;
        dRig.bypassConduit.visible = false;
        dRig.bypassGlowLight.intensity = 0;
        worldRig.bypassAircraft.visible = false;
        worldRig.redTube1Mat.color.setHex(0xf59e0b);
        worldRig.redTube1Mat.emissive.setHex(0xf59e0b);
        worldRig.redTube1Mat.emissiveIntensity = 1.6 + pulse * 1.2;
      } else if (currentMode === 'recovery') {
        // Autonomous bypass active: emerald conduit illuminated & bypass aircraft airborne
        dRig.warningBeacon.visible = false;
        dRig.warningLight.intensity = 0;
        dRig.bypassConduit.visible = true;
        const recoveryPulse = 0.6 + 0.4 * Math.sin(elapsed * 4.8);
        dRig.bypassGlowLight.intensity = 2.2 + recoveryPulse * 0.8;
        worldRig.bypassConduitMat.emissiveIntensity = 1.4 + recoveryPulse * 0.6;

        worldRig.bypassAircraft.visible = true;
        const bypassT = (elapsed * 0.18) % 1.0;
        worldRig.bypassAircraft.position.set(
          lerpScalar(-14, 68, bypassT),
          9.5 + Math.sin(bypassT * Math.PI) * 1.8,
          -12
        );
        worldRig.bypassAircraft.rotation.y = Math.PI / 2;

        worldRig.redTube1Mat.color.setHex(0x10b981);
        worldRig.redTube1Mat.emissive.setHex(0x10b981);
        worldRig.redTube1Mat.emissiveIntensity = 1.2;
      }

      // =======================================================================
      // 3. FACILITY MACHINERY, ROBOTICS & WORKER PROCEDURAL DYNAMICS
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
  }, []);

  const heroLine1 =
    activeConfig.homepage.heroHeadlineLine1 || 'The New Standard in';
  const heroLine2 =
    activeConfig.homepage.heroHeadlineLine2 || 'Supply Chain Control';

  // Active Stage Resolution out of the 7 stages
  const activeStage: SupplyChainProcessStage =
    SUPPLY_CHAIN_7_STAGES[hudState.activeStage7Index] || SUPPLY_CHAIN_7_STAGES[0];

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
            2. ORION-9 INTELLIGENCE DEMONSTRATION WIDGET (TOP-RIGHT SIMULATED CONTROLS)
           ========================================================================== */}
        <div
          style={{
            opacity: hudState.processHudOpacity,
            pointerEvents: hudState.processHudOpacity > 0.2 ? 'auto' : 'none',
          }}
          className="absolute top-20 sm:top-24 right-4 sm:right-8 z-20 transition-all duration-300 max-w-[340px]"
        >
          <div className="p-3 sm:p-3.5 rounded-2xl bg-white/92 border border-[#B8D7ED]/80 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold tracking-wider text-[#0284C7]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ORION-9 INTELLIGENCE ENGINE</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                SIMULATION
              </span>
            </div>

            {/* Mode Trigger Buttons */}
            <div className="grid grid-cols-3 gap-1.5 mb-2.5">
              <button
                type="button"
                data-mode="nominal"
                onClick={() => setDemoMode('nominal')}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-mono font-semibold transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                  demoMode === 'nominal'
                    ? 'bg-[#081326] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                <span>Nominal</span>
                <span className="text-[9px] opacity-75">Corridors OK</span>
              </button>

              <button
                type="button"
                data-mode="delay"
                onClick={() => setDemoMode('delay')}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-mono font-semibold transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                  demoMode === 'delay'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 border border-amber-200/60 hover:bg-amber-100/70'
                }`}
              >
                <span>Simulate Delay</span>
                <span className="text-[9px] opacity-75">Amber Beacon</span>
              </button>

              <button
                type="button"
                data-mode="recovery"
                onClick={() => setDemoMode('recovery')}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-mono font-semibold transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                  demoMode === 'recovery'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 hover:bg-emerald-100/70'
                }`}
              >
                <span>Autonomous</span>
                <span className="text-[9px] opacity-75">Air Bypass</span>
              </button>
            </div>

            {/* Live Operational Status Line */}
            <div className="text-[10px] font-mono flex items-center gap-1.5 pt-1.5 border-t border-slate-200/70 text-slate-600">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  demoMode === 'nominal'
                    ? 'bg-[#0284C7]'
                    : demoMode === 'delay'
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-emerald-500'
                }`}
              />
              <span className="truncate">
                {demoMode === 'nominal' && 'Corridors nominal · 42.8K sig/s'}
                {demoMode === 'delay' && 'Alert: Ingestion buffer delay flagged'}
                {demoMode === 'recovery' && 'Bypass active · 99.8% SLA protected'}
              </span>
            </div>
          </div>
        </div>

        {/* ==========================================================================
            3. BOTTOM-LEFT 7-STAGE PROCESS HUD (MATCHES REFERENCE SCREENSHOT 4)
           ========================================================================== */}
        <div
          style={{
            opacity: hudState.processHudOpacity,
            pointerEvents: hudState.processHudOpacity > 0.2 ? 'auto' : 'none',
          }}
          className="absolute bottom-6 sm:bottom-10 left-4 sm:left-10 z-20 w-[calc(100%-2rem)] max-w-[480px] transition-all duration-300"
        >
          {/* Main Liquid-Glass Stage Card */}
          <div className="bg-white/96 border border-[#C8DFEE] rounded-2xl p-4 sm:p-5 shadow-[0_12px_36px_rgba(7,11,25,0.08)] mb-3 backdrop-blur-md">
            <div className="flex items-start gap-3 sm:gap-3.5">
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#070B19] text-white font-mono text-xs sm:text-sm font-semibold flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                {activeStage.number}
              </span>
              <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-wider text-[#0284C7] uppercase">
                    STAGE {activeStage.number} / 07 · {activeStage.stageName}
                  </span>
                </div>
                <h2 className="font-editorial text-lg sm:text-2xl font-bold tracking-[-0.015em] text-[#070B19] leading-tight">
                  {activeStage.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
                  {activeStage.description}
                </p>
                <div className="pt-1 flex items-center gap-2 text-[11px] font-mono text-[#0284C7] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] animate-pulse" />
                  <span>{activeStage.telemetryTag}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 7-Stage Interactive Pill Navigation (01 to 07) */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-white/90 border border-[#B8D7ED]/80 backdrop-blur-md shadow-md overflow-x-auto scrollbar-none">
            {SUPPLY_CHAIN_7_STAGES.map((st, idx) => {
              const isCurrent = idx === hudState.activeStage7Index;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => scrollToNormalizedProgress(st.scrollTarget)}
                  aria-label={`Jump to stage ${st.number}: ${st.title}`}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition cursor-pointer flex items-center gap-1 shrink-0 ${
                    isCurrent
                      ? 'bg-[#070B19] text-white shadow-xs scale-[1.03]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      isCurrent ? 'bg-[#38BDF8]' : 'bg-slate-400'
                    }`}
                  />
                  <span>{st.number}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

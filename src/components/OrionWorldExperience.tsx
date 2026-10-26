import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  WORLD_PROCESS_STEPS,
  evaluateWorldScrollState,
  evaluateHeroIntroSequence,
  clamp01,
  lerpScalar,
} from '../utils/cinematic-choreography';
import {
  detectSoftwareWebGL,
  createGpuFramePacer,
  setupStudioEnvironment,
  createRoutePulseShaderMaterial,
  createCompositeContainerShip,
  createCompositeCargoAircraft,
  createCompositeFreightTruck,
} from '../utils/three-logistics-craft';
import { useSiteConfig } from '../context/SiteConfigContext';
import { OrionHeroBrandLockup } from './OrionLogo';

export const OrionWorldExperience: React.FC = () => {
  const { activeConfig } = useSiteConfig();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  const scrollProgressRef = useRef<number>(0);
  const smoothedScrollRef = useRef<number>(0);
  const [hudState, setHudState] = useState(() => evaluateWorldScrollState(0));
  const lastHudUpdateRef = useRef<number>(0);

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
        // Throttled post-reveal 8s ambient loop (~15fps only while hero is visible)
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

  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const skyColor = new THREE.Color(0xe6f3fb);
    scene.background = skyColor;
    scene.fog = new THREE.Fog(0xe6f3fb, 68, 185);

    const camera = new THREE.PerspectiveCamera(31, width / height, 0.5, 260);
    const initialChoreo = evaluateWorldScrollState(0);
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
    renderer.toneMappingExposure = 1.02;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    const envTexture = setupStudioEnvironment(renderer, scene);

    // Calibrated architectural lighting: crisp directional key + cool ice-blue shadow fill
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x99bdd8, 0.88);
    hemiLight.position.set(0, 60, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfffdf8, 1.65);
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

    const rimLight = new THREE.DirectionalLight(0xa4d4f4, 0.55);
    rimLight.position.set(45, 28, -36);
    scene.add(rimLight);

    // Shared architectural materials with crisp volumetric contrast
    const whiteArchMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.62,
      metalness: 0.08,
    });
    const iceSlateMat = new THREE.MeshStandardMaterial({
      color: 0xcbe2f2,
      roughness: 0.45,
      metalness: 0.15,
    });
    const steelBlueMat = new THREE.MeshStandardMaterial({
      color: 0x3b6e96,
      roughness: 0.36,
      metalness: 0.35,
    });
    const darkNavyMat = new THREE.MeshStandardMaterial({
      color: 0x0b1930,
      roughness: 0.32,
      metalness: 0.45,
    });
    const glassBlueMat = new THREE.MeshStandardMaterial({
      color: 0x98c4e4,
      roughness: 0.22,
      metalness: 0.35,
    });
    const roadSurfaceMat = new THREE.MeshStandardMaterial({
      color: 0xd0e6f5,
      roughness: 0.78,
      metalness: 0.05,
    });
    const runwaySurfaceMat = new THREE.MeshStandardMaterial({
      color: 0xc2dced,
      roughness: 0.65,
      metalness: 0.08,
    });
    const archEdgeMat = new THREE.LineBasicMaterial({
      color: 0xa6c7df,
      transparent: true,
      opacity: 0.55,
    });
    const cyanEmissiveMat = new THREE.MeshStandardMaterial({
      color: 0x0099ff,
      emissive: new THREE.Color(0x0088ff),
      emissiveIntensity: 1.5,
      roughness: 0.2,
      metalness: 0.1,
    });
    const redSignalMat = new THREE.MeshStandardMaterial({
      color: 0xff3b30,
      emissive: new THREE.Color(0xff3b30),
      emissiveIntensity: 1.35,
      roughness: 0.25,
      metalness: 0.1,
    });

    // ============================================================================
    // 1. CONTINUOUS ARCHITECTURAL GROUND PLANE, SHIPPING CANAL & HIGHWAY NETWORK
    // ============================================================================
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

    // Subtle architectural grid lines on ground (offset Y = 0.025)
    const gridHelper = new THREE.GridHelper(300, 75, 0xbfd8ea, 0xcfe4f2);
    gridHelper.position.set(28, 0.025, 0);
    scene.add(gridHelper);

    // Continuous deep-water shipping canal spanning from opening port to Distribution Hub Berth (X: -65 to +105, Z: 18.5)
    const canalGeo = new THREE.PlaneGeometry(176, 13.5);
    canalGeo.rotateX(-Math.PI / 2);
    const canalMat = new THREE.MeshStandardMaterial({
      color: 0xb6daf2,
      roughness: 0.2,
      metalness: 0.28,
    });
    const canalMesh = new THREE.Mesh(canalGeo, canalMat);
    canalMesh.position.set(20, 0.05, 18.8);
    scene.add(canalMesh);

    // Continuous concrete quay wall along the shipping canal & port terminal
    const quayGeo = new THREE.BoxGeometry(176, 0.5, 1.2);
    const quayMesh = new THREE.Mesh(quayGeo, whiteArchMat);
    quayMesh.position.set(20, 0.25, 11.9);
    scene.add(quayMesh);

    // Elevated Highway Corridor & Intermodal Logistics Road Network (X: -48 to +94, Z: 8.4)
    const highwayGroup = new THREE.Group();
    const deckGeo = new THREE.BoxGeometry(144, 0.36, 3.5);
    const deckMesh = new THREE.Mesh(deckGeo, roadSurfaceMat);
    deckMesh.position.set(22, 1.15, 8.4);
    highwayGroup.add(deckMesh);

    const railGeo = new THREE.BoxGeometry(144, 0.48, 0.18);
    const railNorth = new THREE.Mesh(railGeo, whiteArchMat);
    railNorth.position.set(22, 1.38, 6.72);
    const railSouth = new THREE.Mesh(railGeo, whiteArchMat);
    railSouth.position.set(22, 1.38, 10.08);
    highwayGroup.add(railNorth, railSouth);

    const pierGeo = new THREE.BoxGeometry(0.95, 1.1, 2.4);
    for (let px = -42; px <= 90; px += 11) {
      const pier = new THREE.Mesh(pierGeo, iceSlateMat);
      pier.position.set(px, 0.55, 8.4);
      highwayGroup.add(pier);
    }
    scene.add(highwayGroup);

    // ============================================================================
    // 2. ZONE 0: SKYLINE TOWERS & PORT GANTY CRANES IN HERO VISTA
    // ============================================================================
    const createArchitecturalTower = (
      x: number,
      z: number,
      w: number,
      h: number,
      d: number
    ) => {
      const tower = new THREE.Group();
      tower.position.set(x, 0, z);

      const coreGeo = new THREE.BoxGeometry(w, h, d);
      const core = new THREE.Mesh(coreGeo, whiteArchMat);
      core.position.y = h / 2;
      core.castShadow = !isSoftwareGl;
      core.receiveShadow = !isSoftwareGl;
      core.add(new THREE.LineSegments(new THREE.EdgesGeometry(coreGeo), archEdgeMat));
      tower.add(core);

      const bandCount = Math.floor(h / 2.2);
      const bandGeo = new THREE.BoxGeometry(w + 0.08, 0.45, d + 0.08);
      for (let i = 1; i <= bandCount; i++) {
        const band = new THREE.Mesh(bandGeo, glassBlueMat);
        band.position.y = i * 2.0;
        tower.add(band);
      }

      const crownGeo = new THREE.BoxGeometry(w * 0.68, 1.2, d * 0.68);
      const crown = new THREE.Mesh(crownGeo, iceSlateMat);
      crown.position.y = h + 0.6;
      tower.add(crown);

      return tower;
    };

    const towersData = [
      { x: -42, z: -12, w: 5.0, h: 21, d: 5.0 },
      { x: -35, z: -15, w: 5.4, h: 17.5, d: 5.2 },
      { x: -28, z: -11, w: 4.4, h: 12.0, d: 4.4 },
      { x: -22, z: -14, w: 4.6, h: 9.5, d: 4.4 },
      { x: -46, z: -5, w: 4.0, h: 14.0, d: 4.0 },
      { x: -15, z: -16, w: 4.2, h: 7.5, d: 4.2 },
    ];
    towersData.forEach((t) => {
      scene.add(createArchitecturalTower(t.x, t.z, t.w, t.h, t.d));
    });

    // Reusable Ship-to-Shore Port Gantry Crane builder
    const craneTrolleys: { group: THREE.Group; baseZ: number; phase: number }[] = [];
    const createPortGantryCrane = (x: number, z: number, phaseOffset: number) => {
      const craneGroup = new THREE.Group();
      craneGroup.position.set(x, 0, z);

      const legGeo = new THREE.BoxGeometry(0.45, 7.6, 0.45);
      const legOffsets = [
        [-1.6, -1.2],
        [1.6, -1.2],
        [-1.6, 1.2],
        [1.6, 1.2],
      ];
      legOffsets.forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(legGeo, whiteArchMat);
        leg.position.set(lx, 3.8, lz);
        leg.castShadow = !isSoftwareGl;
        craneGroup.add(leg);
      });

      // Cross-beams
      const crossBeamGeo = new THREE.BoxGeometry(3.6, 0.42, 2.8);
      const midBeam = new THREE.Mesh(crossBeamGeo, iceSlateMat);
      midBeam.position.set(0, 4.2, 0);
      craneGroup.add(midBeam);

      // High cantilevered boom extending over the shipping canal (+Z)
      const boomGeo = new THREE.BoxGeometry(1.6, 0.55, 10.5);
      const boom = new THREE.Mesh(boomGeo, steelBlueMat);
      boom.position.set(0, 7.6, 2.8);
      boom.castShadow = !isSoftwareGl;
      craneGroup.add(boom);

      // Apex A-frame tower & machinery house
      const houseGeo = new THREE.BoxGeometry(2.6, 1.2, 2.4);
      const house = new THREE.Mesh(houseGeo, whiteArchMat);
      house.position.set(0, 8.3, -0.5);
      craneGroup.add(house);

      // Animated container spreader trolley + suspended container
      const trolleyGroup = new THREE.Group();
      trolleyGroup.position.set(0, 7.2, 3.5);

      const trolleyCar = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.35, 1.2),
        darkNavyMat
      );
      trolleyGroup.add(trolleyCar);

      const cableGeo = new THREE.CylinderGeometry(0.05, 0.05, 2.8, 6);
      const cable = new THREE.Mesh(cableGeo, iceSlateMat);
      cable.position.y = -1.4;
      trolleyGroup.add(cable);

      const liftedContainer = new THREE.Mesh(
        new THREE.BoxGeometry(1.15, 0.95, 2.2),
        new THREE.MeshStandardMaterial({
          color: 0x0284c7,
          roughness: 0.35,
          metalness: 0.25,
        })
      );
      liftedContainer.position.y = -2.85;
      trolleyGroup.add(liftedContainer);

      craneGroup.add(trolleyGroup);
      craneTrolleys.push({ group: trolleyGroup, baseZ: 3.2, phase: phaseOffset });

      return craneGroup;
    };

    // Place Gantry Cranes at Opening Port (-28, -18) and at Final Distribution Hub Port (68, 82)
    scene.add(createPortGantryCrane(-28, 12.2, 0.0));
    scene.add(createPortGantryCrane(-18, 12.2, 1.6));
    scene.add(createPortGantryCrane(67, 12.2, 0.8));
    scene.add(createPortGantryCrane(81, 12.2, 2.4));

    // Wind Turbines on the ridge
    const turbineRotors: THREE.Group[] = [];
    const createWindTurbine = (x: number, z: number, height: number) => {
      const group = new THREE.Group();
      group.position.set(x, 0, z);

      const mastGeo = new THREE.CylinderGeometry(0.18, 0.42, height, 12);
      const mast = new THREE.Mesh(mastGeo, whiteArchMat);
      mast.position.y = height / 2;
      group.add(mast);

      const nacelleGeo = new THREE.CapsuleGeometry(0.32, 1.1, 6, 12);
      nacelleGeo.rotateX(Math.PI / 2);
      const nacelle = new THREE.Mesh(nacelleGeo, iceSlateMat);
      nacelle.position.set(0, height, 0.2);
      group.add(nacelle);

      const rotorGroup = new THREE.Group();
      rotorGroup.position.set(0, height, 0.85);
      const bladeGeo = new THREE.BoxGeometry(0.24, 3.6, 0.08);
      bladeGeo.translate(0, 1.7, 0);
      for (let b = 0; b < 3; b++) {
        const blade = new THREE.Mesh(bladeGeo, whiteArchMat);
        blade.rotation.z = (b * Math.PI * 2) / 3;
        rotorGroup.add(blade);
      }
      group.add(rotorGroup);
      turbineRotors.push(rotorGroup);
      return group;
    };

    [
      { x: -38, z: -22, h: 13 },
      { x: 24, z: -21, h: 13.5 },
      { x: 46, z: -18, h: 14 },
    ].forEach((tb) => scene.add(createWindTurbine(tb.x, tb.z, tb.h)));

    // ============================================================================
    // 3. ZONE 1: ORION-9 CENTRAL COMMAND HUB (Stage 01 Target at X: 2, Z: -1)
    // ============================================================================
    const commandHubGroup = new THREE.Group();
    commandHubGroup.position.set(2, 0, -1);

    const hubPodiumGeo = new THREE.BoxGeometry(12.8, 0.55, 9.6);
    const hubPodium = new THREE.Mesh(hubPodiumGeo, iceSlateMat);
    hubPodium.position.y = 0.28;
    commandHubGroup.add(hubPodium);

    const hubBodyGeo = new THREE.BoxGeometry(9.6, 4.4, 6.6);
    const hubBody = new THREE.Mesh(hubBodyGeo, whiteArchMat);
    hubBody.position.set(0, 2.75, 0);
    hubBody.castShadow = !isSoftwareGl;
    hubBody.receiveShadow = !isSoftwareGl;
    hubBody.add(new THREE.LineSegments(new THREE.EdgesGeometry(hubBodyGeo), archEdgeMat));
    commandHubGroup.add(hubBody);

    const hubGlassGeo = new THREE.BoxGeometry(9.8, 1.35, 6.8);
    const hubGlass = new THREE.Mesh(hubGlassGeo, glassBlueMat);
    hubGlass.position.set(0, 3.25, 0);
    commandHubGroup.add(hubGlass);

    const hubRoofGeo = new THREE.BoxGeometry(10.6, 0.48, 7.4);
    const hubRoof = new THREE.Mesh(hubRoofGeo, iceSlateMat);
    hubRoof.position.set(0, 5.15, 0);
    hubRoof.add(new THREE.LineSegments(new THREE.EdgesGeometry(hubRoofGeo), archEdgeMat));
    commandHubGroup.add(hubRoof);

    // Glowing Orion-9 Emblem on Command Hub Facade
    const facadeEmblemGroup = new THREE.Group();
    facadeEmblemGroup.position.set(1.8, 2.6, 3.42);
    const emblemBarGeo = new THREE.BoxGeometry(1.95, 0.46, 0.18);
    const bar1 = new THREE.Mesh(emblemBarGeo, cyanEmissiveMat);
    bar1.rotation.z = Math.PI / 4;
    const bar2 = new THREE.Mesh(emblemBarGeo, cyanEmissiveMat);
    bar2.rotation.z = -Math.PI / 4;
    facadeEmblemGroup.add(bar1, bar2);
    commandHubGroup.add(facadeEmblemGroup);

    const domeGeo = new THREE.SphereGeometry(0.75, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    [-2.6, -0.8].forEach((dx) => {
      const dome = new THREE.Mesh(domeGeo, whiteArchMat);
      dome.position.set(dx, 5.38, -1.2);
      commandHubGroup.add(dome);
    });

    scene.add(commandHubGroup);

    // ============================================================================
    // 4. GLOWING RED ORIGIN TRACES & CONTINUOUS ELECTRIC-CYAN PIPELINE
    // ============================================================================
    const redTracePoints1 = [
      new THREE.Vector3(-36, 0.16, 4),
      new THREE.Vector3(-22, 0.16, 4),
      new THREE.Vector3(-14, 0.16, -1),
      new THREE.Vector3(-3, 0.16, -1),
    ];
    const redCurve1 = new THREE.CatmullRomCurve3(redTracePoints1);
    const redTubeGeo1 = new THREE.TubeGeometry(redCurve1, 64, 0.18, 8, false);
    const redTube1 = new THREE.Mesh(redTubeGeo1, redSignalMat);
    scene.add(redTube1);

    const redTracePoints2 = [
      new THREE.Vector3(-26, 0.16, 6.2),
      new THREE.Vector3(-14, 0.16, 2.2),
      new THREE.Vector3(-3, 0.16, 0.5),
    ];
    const redCurve2 = new THREE.CatmullRomCurve3(redTracePoints2);
    const redTubeGeo2 = new THREE.TubeGeometry(redCurve2, 48, 0.15, 8, false);
    const redTube2 = new THREE.Mesh(redTubeGeo2, redSignalMat);
    scene.add(redTube2);

    // Continuous Electric-Cyan Energy Pipeline from Command Hub (X: 6.5) -> Zone 2 -> Global Distribution Warehouse Hub (X: 64.5)
    const cyanPipelinePoints = [
      new THREE.Vector3(6.5, 0.38, -1.0),
      new THREE.Vector3(15.0, 0.38, -1.0),
      new THREE.Vector3(23.0, 0.38, 2.2),
      new THREE.Vector3(34.0, 0.38, -2.5),
      new THREE.Vector3(46.0, 0.38, 1.5),
      new THREE.Vector3(56.0, 0.38, -1.0),
      new THREE.Vector3(64.5, 0.38, -1.0),
    ];
    const cyanPipelineCurve = new THREE.CatmullRomCurve3(cyanPipelinePoints);
    const cyanPipelineGeo = new THREE.TubeGeometry(cyanPipelineCurve, 140, 0.32, 12, false);
    const cyanPipelineMat = createRoutePulseShaderMaterial({
      baseColorHex: 0x0077ee,
      pulseColorHex: 0x7dd3fc,
      initialDrawProgress: 0.18,
      opacity: 0.98,
    });
    const cyanPipelineMesh = new THREE.Mesh(cyanPipelineGeo, cyanPipelineMat);
    scene.add(cyanPipelineMesh);

    const channelGeo = new THREE.TubeGeometry(cyanPipelineCurve, 100, 0.46, 8, false);
    const channelMesh = new THREE.Mesh(channelGeo, iceSlateMat);
    channelMesh.position.y = -0.2;
    scene.add(channelMesh);

    // ============================================================================
    // 5. ZONE 2: TWIN COOLING TOWERS, CONTAINER YARDS & INSPECTION GATES (X: 18..54)
    // ============================================================================
    const createCoolingTower = (x: number, z: number, radius: number, h: number) => {
      const group = new THREE.Group();
      group.position.set(x, 0, z);

      const pts = [
        new THREE.Vector2(radius * 1.18, 0),
        new THREE.Vector2(radius * 0.96, h * 0.35),
        new THREE.Vector2(radius * 0.82, h * 0.7),
        new THREE.Vector2(radius * 0.92, h),
        new THREE.Vector2(radius * 0.78, h),
      ];
      const latheGeo = new THREE.LatheGeometry(pts, 28);
      const shell = new THREE.Mesh(latheGeo, whiteArchMat);
      shell.castShadow = !isSoftwareGl;
      shell.receiveShadow = !isSoftwareGl;
      group.add(shell);

      const rimGeo = new THREE.RingGeometry(radius * 0.75, radius * 0.92, 28);
      rimGeo.rotateX(-Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, glassBlueMat);
      rim.position.y = h + 0.04;
      group.add(rim);

      return group;
    };

    scene.add(createCoolingTower(24, -9.5, 3.2, 8.5));
    scene.add(createCoolingTower(32, -10.5, 2.8, 7.6));

    const checkpointGates: THREE.Mesh[] = [];
    [19, 34, 48].forEach((gx) => {
      const pt = cyanPipelineCurve.getPointAt((gx - 6.5) / 58);
      const gateGroup = new THREE.Group();
      gateGroup.position.set(pt.x, 0, pt.z);

      const archGeo = new THREE.BoxGeometry(1.25, 3.6, 4.6);
      const arch = new THREE.Mesh(archGeo, whiteArchMat);
      arch.position.y = 1.8;
      arch.add(new THREE.LineSegments(new THREE.EdgesGeometry(archGeo), archEdgeMat));
      gateGroup.add(arch);

      const scannerGeo = new THREE.BoxGeometry(1.36, 0.35, 4.78);
      const scanner = new THREE.Mesh(scannerGeo, cyanEmissiveMat.clone());
      scanner.position.y = 3.25;
      gateGroup.add(scanner);
      checkpointGates.push(scanner);

      scene.add(gateGroup);
    });

    const containerColors = [0xffffff, 0xcbe2f2, 0x8abce0, 0x0b1930];
    const boxGeo = new THREE.BoxGeometry(2.4, 1.1, 1.15);
    const yardPositions = [
      { x: 22, z: 4.8, stacks: 3 },
      { x: 25.5, z: 4.8, stacks: 2 },
      { x: 37, z: 4.8, stacks: 3 },
      { x: 40.5, z: 4.8, stacks: 2 },
      { x: 42, z: -7.5, stacks: 3 },
      { x: 45.5, z: -7.5, stacks: 2 },
    ];
    yardPositions.forEach((yp, idx) => {
      for (let s = 0; s < yp.stacks; s++) {
        const cMat = new THREE.MeshStandardMaterial({
          color: containerColors[(idx + s) % containerColors.length],
          roughness: 0.45,
          metalness: 0.2,
        });
        const container = new THREE.Mesh(boxGeo, cMat);
        container.position.set(yp.x, 0.55 + s * 1.12, yp.z);
        container.castShadow = !isSoftwareGl;
        scene.add(container);
      }
    });

    // ============================================================================
    // 6. ZONE 3 & 4: LIVING GLOBAL LOGISTICS WAREHOUSE & INTERMODAL DISTRIBUTION HUB (X: 75, Z: -1)
    // ============================================================================
    const distributionHubGroup = new THREE.Group();
    distributionHubGroup.position.set(75, 0, -1);
    scene.add(distributionHubGroup);

    // 6A. Paved Intermodal Distribution Apron & Connected Roadways
    const hubApronGeo = new THREE.BoxGeometry(34, 0.18, 22);
    const hubApron = new THREE.Mesh(hubApronGeo, roadSurfaceMat);
    hubApron.position.set(0, 0.09, 0.5);
    hubApron.receiveShadow = !isSoftwareGl;
    distributionHubGroup.add(hubApron);

    // North-South Intermodal Connector Roads linking Port Quay (+Z) <-> Warehouse Bays <-> Air Cargo Apron (-Z)
    [-13.5, 13.5].forEach((rx) => {
      const roadLinkGeo = new THREE.BoxGeometry(3.2, 0.22, 26);
      const roadLink = new THREE.Mesh(roadLinkGeo, roadSurfaceMat);
      roadLink.position.set(rx, 0.11, 0);
      distributionHubGroup.add(roadLink);
    });

    // 6B. Primary Global Distribution Warehouse Facility (Multi-Bay Architectural Building)
    const whWidth = 21.5;
    const whHeight = 4.8;
    const whDepth = 10.6;

    const whMainGeo = new THREE.BoxGeometry(whWidth, whHeight, whDepth);
    const whMain = new THREE.Mesh(whMainGeo, whiteArchMat);
    whMain.position.set(0, whHeight / 2 + 0.18, -0.8);
    whMain.castShadow = !isSoftwareGl;
    whMain.receiveShadow = !isSoftwareGl;
    whMain.add(new THREE.LineSegments(new THREE.EdgesGeometry(whMainGeo), archEdgeMat));
    distributionHubGroup.add(whMain);

    // Upper clerestory glass band around warehouse perimeter
    const whGlassGeo = new THREE.BoxGeometry(whWidth + 0.12, 0.95, whDepth + 0.12);
    const whGlass = new THREE.Mesh(whGlassGeo, glassBlueMat);
    whGlass.position.set(0, 3.85, -0.8);
    distributionHubGroup.add(whGlass);

    // Stepped architectural roof deck
    const whRoofGeo = new THREE.BoxGeometry(whWidth - 1.2, 0.42, whDepth - 1.2);
    const whRoof = new THREE.Mesh(whRoofGeo, iceSlateMat);
    whRoof.position.set(0, whHeight + 0.38, -0.8);
    whRoof.add(new THREE.LineSegments(new THREE.EdgesGeometry(whRoofGeo), archEdgeMat));
    distributionHubGroup.add(whRoof);

    // 8 Illuminated Rooftop Skylight Modules & Sorting Telemetry Bays
    const skylightMats: THREE.MeshStandardMaterial[] = [];
    const skylightFrameGeo = new THREE.BoxGeometry(3.6, 0.22, 2.4);
    const skylightGeo = new THREE.BoxGeometry(3.2, 0.28, 2.0);
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 4; col++) {
        const sx = -6.6 + col * 4.4;
        const sz = -2.6 + row * 3.6;

        const frameMesh = new THREE.Mesh(skylightFrameGeo, steelBlueMat);
        frameMesh.position.set(sx, whHeight + 0.62, sz);
        distributionHubGroup.add(frameMesh);

        const sMat = new THREE.MeshStandardMaterial({
          color: 0x98c4e4,
          emissive: new THREE.Color(0x0088ff),
          emissiveIntensity: 0.25,
          roughness: 0.2,
          metalness: 0.3,
        });
        const skyMesh = new THREE.Mesh(skylightGeo, sMat);
        skyMesh.position.set(sx, whHeight + 0.68, sz);
        distributionHubGroup.add(skyMesh);
        skylightMats.push(sMat);
      }
    }

    // Sculpted Rooftop Orion-9 Hub Emblem (Visible from elevated Step 04 camera)
    const roofEmblemGroup = new THREE.Group();
    roofEmblemGroup.position.set(0, whHeight + 0.88, -0.8);
    const roofBaseDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(2.3, 2.3, 0.14, 6),
      darkNavyMat
    );
    roofEmblemGroup.add(roofBaseDisc);

    const roofRingGeo = new THREE.RingGeometry(1.35, 1.95, 6);
    roofRingGeo.rotateX(-Math.PI / 2);
    const roofEmblemMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: new THREE.Color(0x00a8ff),
      emissiveIntensity: 0.9,
      roughness: 0.25,
      metalness: 0.3,
      side: THREE.DoubleSide,
    });
    const roofRing = new THREE.Mesh(roofRingGeo, roofEmblemMat);
    roofRing.position.y = 0.09;
    roofEmblemGroup.add(roofRing);
    distributionHubGroup.add(roofEmblemGroup);

    // 6C. Six South Truck Loading Bays (Facing +Z toward the Port & Highway Apron)
    const canopyGeo = new THREE.BoxGeometry(whWidth - 1.0, 0.32, 2.4);
    const canopyMesh = new THREE.Mesh(canopyGeo, steelBlueMat);
    canopyMesh.position.set(0, 2.95, 5.2);
    distributionHubGroup.add(canopyMesh);

    const bayDoorGeo = new THREE.BoxGeometry(2.1, 2.35, 0.16);
    const bayApronGeo = new THREE.BoxGeometry(2.3, 0.06, 3.2);
    const bayBeaconMats: THREE.MeshStandardMaterial[] = [];

    for (let b = 0; b < 6; b++) {
      const bx = -7.75 + b * 3.1;
      const doorMesh = new THREE.Mesh(bayDoorGeo, darkNavyMat);
      doorMesh.position.set(bx, 1.38, 4.52);
      distributionHubGroup.add(doorMesh);

      const levelerApron = new THREE.Mesh(bayApronGeo, iceSlateMat);
      levelerApron.position.set(bx, 0.21, 6.2);
      distributionHubGroup.add(levelerApron);

      const beaconMat = new THREE.MeshStandardMaterial({
        color: 0x00a8ff,
        emissive: new THREE.Color(0x0088ff),
        emissiveIntensity: 0.8,
      });
      const beaconMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.22, 0.2),
        beaconMat
      );
      beaconMesh.position.set(bx, 2.72, 4.58);
      distributionHubGroup.add(beaconMesh);
      bayBeaconMats.push(beaconMat);
    }

    // 6D. Active Cargo Staging Zones (East & West Container Stacks + Automated Conveyor Link)
    const hubContainerPositions = [
      { x: -12.8, z: 5.5, stacks: 3 },
      { x: -12.8, z: 2.5, stacks: 2 },
      { x: 12.8, z: 5.5, stacks: 3 },
      { x: 12.8, z: 2.5, stacks: 2 },
      { x: -12.8, z: -4.5, stacks: 2 },
      { x: 12.8, z: -4.5, stacks: 2 },
    ];
    hubContainerPositions.forEach((cp, idx) => {
      for (let s = 0; s < cp.stacks; s++) {
        const cMat = new THREE.MeshStandardMaterial({
          color: containerColors[(idx + s) % containerColors.length],
          roughness: 0.4,
          metalness: 0.25,
        });
        const cMesh = new THREE.Mesh(boxGeo, cMat);
        cMesh.position.set(cp.x, 0.65 + s * 1.12, cp.z);
        cMesh.castShadow = !isSoftwareGl;
        distributionHubGroup.add(cMesh);
      }
    });

    // Automated Air-Cargo Transfer Bridge connecting Warehouse North Gate to Air-Freight Apron
    const bridgeCorridorGeo = new THREE.BoxGeometry(3.4, 1.8, 5.2);
    const bridgeCorridor = new THREE.Mesh(bridgeCorridorGeo, iceSlateMat);
    bridgeCorridor.position.set(0, 1.2, -8.2);
    bridgeCorridor.add(
      new THREE.LineSegments(new THREE.EdgesGeometry(bridgeCorridorGeo), archEdgeMat)
    );
    distributionHubGroup.add(bridgeCorridor);

    // 6E. Adjacent Air-Freight Terminal & Runway North of Warehouse (Z: -13.2)
    const airTerminalGroup = new THREE.Group();
    airTerminalGroup.position.set(75, 0, -13.2);
    scene.add(airTerminalGroup);

    const runwayGeo = new THREE.BoxGeometry(52, 0.16, 6.4);
    const runwayMesh = new THREE.Mesh(runwayGeo, runwaySurfaceMat);
    runwayMesh.position.set(0, 0.08, 0);
    runwayMesh.receiveShadow = !isSoftwareGl;
    airTerminalGroup.add(runwayMesh);

    // Runway Centerline Dashes (offset Y = 0.19 to prevent Z-fighting)
    const dashGeo = new THREE.BoxGeometry(2.4, 0.04, 0.28);
    for (let dx = -22; dx <= 22; dx += 4.8) {
      const dash = new THREE.Mesh(dashGeo, whiteArchMat);
      dash.position.set(dx, 0.19, 0);
      airTerminalGroup.add(dash);
    }

    // Air-Freight Terminal Hangar & Control Annex
    const hangarGeo = new THREE.BoxGeometry(9.5, 3.4, 4.2);
    const hangarMesh = new THREE.Mesh(hangarGeo, whiteArchMat);
    hangarMesh.position.set(-13, 1.7, -5.2);
    hangarMesh.castShadow = !isSoftwareGl;
    hangarMesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(hangarGeo), archEdgeMat));
    airTerminalGroup.add(hangarMesh);

    // Parked Cargo Aircraft on the Air-Freight Apron being loaded
    const apronJet = createCompositeCargoAircraft(0x0284c7);
    apronJet.scale.setScalar(0.45);
    apronJet.rotation.y = Math.PI / 2;
    apronJet.position.set(3.5, 0.6, 0.2);
    airTerminalGroup.add(apronJet);

    // ============================================================================
    // 7. ANIMATED INTERMODAL FLEET (CONTAINER SHIPS, WAREHOUSE TRUCKS & CARGO AIRCRAFT)
    // ============================================================================
    // Ship 1: Operating in the opening canal
    const ship1 = createCompositeContainerShip(0x1d4ed8);
    ship1.scale.setScalar(0.5);
    ship1.rotation.y = Math.PI / 2;
    ship1.position.set(-32, 0.08, 15.6);
    scene.add(ship1);

    // Ship 2: Arriving at the Global Distribution Hub Port Berth (X: 64..82, Z: 15.8)
    const ship2 = createCompositeContainerShip(0x0284c7);
    ship2.scale.setScalar(0.56);
    ship2.rotation.y = Math.PI / 2;
    ship2.position.set(72, 0.08, 15.8);
    scene.add(ship2);

    // Highway Freight Trucks along main corridor
    const truck1 = createCompositeFreightTruck(0x091428);
    truck1.scale.setScalar(0.32);
    truck1.rotation.y = Math.PI / 2;
    truck1.position.set(-24, 1.35, 7.8);
    scene.add(truck1);

    const truck2 = createCompositeFreightTruck(0x0284c7);
    truck2.scale.setScalar(0.32);
    truck2.rotation.y = -Math.PI / 2;
    truck2.position.set(22, 1.35, 9.0);
    scene.add(truck2);

    // Distribution Hub Delivery Trucks docking at & departing Warehouse Loading Bays
    const hubTruck1 = createCompositeFreightTruck(0x070b19);
    hubTruck1.scale.setScalar(0.35);
    hubTruck1.rotation.y = 0;
    distributionHubGroup.add(hubTruck1);

    const hubTruck2 = createCompositeFreightTruck(0x0284c7);
    hubTruck2.scale.setScalar(0.35);
    hubTruck2.rotation.y = 0;
    distributionHubGroup.add(hubTruck2);

    // Hub Shuttle Truck moving along the East Intermodal Connector between Port & Air Terminal
    const hubTruck3 = createCompositeFreightTruck(0x1e3a8a);
    hubTruck3.scale.setScalar(0.35);
    hubTruck3.rotation.y = Math.PI;
    distributionHubGroup.add(hubTruck3);

    // Airborne Cargo Freighter arriving/departing over the Air-Freight Terminal
    const cargoJet = createCompositeCargoAircraft(0x091428);
    cargoJet.scale.setScalar(0.44);
    cargoJet.position.set(28, 10.5, -12);
    cargoJet.rotation.y = Math.PI * 0.44;
    scene.add(cargoJet);

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
      const damping = 1 - Math.exp(-8.5 * Math.max(0.016, dt));
      smoothedScrollRef.current = lerpScalar(smoothedScrollRef.current, targetScroll, damping);

      const state = evaluateWorldScrollState(smoothedScrollRef.current);

      camera.position.set(state.cameraPos.x, state.cameraPos.y, state.cameraPos.z);
      camera.lookAt(state.lookAt.x, state.lookAt.y, state.lookAt.z);
      if (Math.abs(camera.fov - state.fov) > 0.05) {
        camera.fov = state.fov;
        camera.updateProjectionMatrix();
      }

      cyanPipelineMat.uniforms.uTime.value = elapsed;
      cyanPipelineMat.uniforms.uDrawProgress.value = Math.max(
        0.14,
        state.cyanBeamProgress
      );

      for (let i = 0; i < turbineRotors.length; i++) {
        turbineRotors[i].rotation.z = elapsed * 0.9 + i * 1.1;
      }

      // Animate Gantry Crane Trolleys transferring containers between ship & dock
      for (let i = 0; i < craneTrolleys.length; i++) {
        const ct = craneTrolleys[i];
        ct.group.position.z = ct.baseZ + Math.sin(elapsed * 0.85 + ct.phase) * 2.4;
      }

      // Animate Ships, Highway Trucks, and Air-Cargo Fleet along connected corridors
      ship1.position.x = -38 + ((elapsed * 1.2) % 24);
      ship2.position.x = 58 + ((elapsed * 1.05) % 26);

      truck1.position.x = -38 + ((elapsed * 4.5) % 115);
      truck2.position.x = 82 - ((elapsed * 3.9) % 115);

      // Warehouse Bay Docking & Departure Cycle for Hub Trucks 1 & 2
      const bayCycle1 = (elapsed * 0.35) % 1.0;
      const bayZ1 =
        bayCycle1 < 0.45
          ? lerpScalar(5.8, 7.6, bayCycle1 / 0.45)
          : lerpScalar(7.6, 5.8, (bayCycle1 - 0.45) / 0.55);
      hubTruck1.position.set(-4.65, 0.22, bayZ1);

      const bayCycle2 = ((elapsed * 0.35) + 0.5) % 1.0;
      const bayZ2 =
        bayCycle2 < 0.45
          ? lerpScalar(5.8, 7.6, bayCycle2 / 0.45)
          : lerpScalar(7.6, 5.8, (bayCycle2 - 0.45) / 0.55);
      hubTruck2.position.set(4.65, 0.22, bayZ2);

      // Intermodal Connector Shuttle Truck moving between Port Apron (+9) and Air Cargo Terminal (-10)
      const shuttlePhase = (Math.sin(elapsed * 0.55) + 1) * 0.5;
      hubTruck3.position.set(13.5, 0.22, lerpScalar(-9.5, 8.5, shuttlePhase));
      hubTruck3.rotation.y = Math.cos(elapsed * 0.55) >= 0 ? 0 : Math.PI;

      // Airborne Cargo Aircraft glide path over the distribution hub
      cargoJet.position.x = 18 + ((elapsed * 3.1) % 72);
      cargoJet.position.y = 11.8 + Math.sin(elapsed * 1.2) * 0.35;

      for (let i = 0; i < checkpointGates.length; i++) {
        const gMat = checkpointGates[i].material as THREE.MeshStandardMaterial;
        gMat.emissiveIntensity =
          0.6 + state.checkpointScanWeight * (1.2 + 0.6 * Math.sin(elapsed * 4 + i));
      }

      // Illuminate Warehouse Skylights, Dock Beacons, and Rooftop Emblem during Steps 03 & 04
      const hubActivation = Math.max(state.matrixWaveWeight, state.emblemLockWeight);
      for (let i = 0; i < skylightMats.length; i++) {
        const pulse = 0.5 + 0.5 * Math.sin(elapsed * 2.8 - i * 0.45);
        skylightMats[i].emissiveIntensity = 0.15 + hubActivation * (0.55 + 0.45 * pulse);
      }

      for (let i = 0; i < bayBeaconMats.length; i++) {
        const dockPulse = 0.5 + 0.5 * Math.sin(elapsed * 3.5 + i * 0.9);
        bayBeaconMats[i].emissiveIntensity = 0.5 + hubActivation * (0.8 + 0.6 * dockPulse);
      }

      roofEmblemMat.emissiveIntensity = 0.65 + state.emblemLockWeight * 1.15;

      renderer.render(scene, camera);

      const now = performance.now();
      if (now - lastHudUpdateRef.current > 65) {
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

  return (
    <section
      id="process"
      ref={containerRef}
      className="relative w-full h-[480vh] bg-[#E6F3FB] select-none"
      aria-label="Orion-9 3D Supply Chain Operating World and Process"
    >
      {/* Sticky Full-Viewport 3D Stage */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden">
        {/* Dedicated Empty WebGL Canvas Mount */}
        <div
          ref={canvasMountRef}
          style={{ opacity: introState.environmentOpacity }}
          className="absolute inset-0 w-full h-full z-0 transition-opacity duration-150"
        />

        {/* ==========================================================================
            1. CENTERED ENTERPRISE HERO OVERLAY (5-STAGE CINEMATIC LOGO REVEAL)
           ========================================================================== */}
        <div
          style={{
            opacity: hudState.heroOpacity,
            transform: `translate3d(0, ${hudState.heroTranslateY}px, 0)`,
            pointerEvents: hudState.heroOpacity > 0.25 ? 'auto' : 'none',
          }}
          className="absolute inset-0 z-10 flex flex-col items-center justify-between pt-18 sm:pt-20 pb-0 px-4 sm:px-6 text-center transition-opacity duration-75"
        >
          <div className="flex-1 flex items-center justify-center w-full">
            <OrionHeroBrandLockup
              introState={introState}
              headlineText={`${heroLine1} ${heroLine2}`.trim()}
              supportingParagraph="Autonomous risk sensing, canonical graph intelligence, and governed execution—built to keep global operations moving."
            />
          </div>

          {/* Bottom-Center Scroll Prompt */}
          <div
            style={{ opacity: introState.supportingTextOpacity }}
            className="flex flex-col items-center shrink-0"
          >
            <button
              type="button"
              onClick={() => scrollToNormalizedProgress(0.26)}
              className="px-5 py-2.5 rounded-lg bg-white border border-[#BDD6E8] text-xs font-semibold text-[#070B19] hover:border-[#070B19] transition-colors cursor-pointer shadow-2xs"
            >
              Scroll to Discover Our Process
            </button>
            <div className="w-px h-6 sm:h-8 bg-[#070B19]/40 mt-1" />
          </div>
        </div>

        {/* ==========================================================================
            2. BOTTOM-LEFT PROGRESSIVE 4-STEP ACCORDION HUD (01-04)
           ========================================================================== */}
        <div
          style={{
            opacity: hudState.processHudOpacity,
            pointerEvents: hudState.processHudOpacity > 0.2 ? 'auto' : 'none',
          }}
          className="absolute bottom-8 sm:bottom-12 left-5 sm:left-12 z-20 w-[calc(100%-2.5rem)] max-w-[430px]"
        >
          <div className="flex flex-col gap-2.5">
            {WORLD_PROCESS_STEPS.map((step, idx) => {
              const isActive = hudState.activeStepIndex === idx;
              return (
                <div
                  key={step.id}
                  className="transition-all duration-300"
                >
                  {isActive ? (
                    <div className="bg-white/96 border border-[#C8DFEE] rounded-2xl p-5 shadow-[0_12px_32px_rgba(7,11,25,0.06)]">
                      <div className="flex items-start gap-3.5">
                        <span className="w-7 h-7 rounded-md bg-[#070B19] text-white font-mono text-xs font-medium flex items-center justify-center shrink-0 mt-0.5">
                          {step.number}
                        </span>
                        <div className="space-y-2">
                          <h2 className="font-editorial text-xl sm:text-2xl font-bold tracking-[-0.015em] text-[#070B19] leading-tight">
                            {step.title}
                          </h2>
                          <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
                            {step.description}
                          </p>
                          <div className="pt-1 flex items-center gap-2 text-[11px] font-mono text-[#0284C7] font-medium">
                            <span>{step.telemetryTag}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => scrollToNormalizedProgress(step.scrollTarget)}
                      aria-label={`Jump to step ${step.number}: ${step.title}`}
                      className="group inline-flex items-center gap-2.5 text-left cursor-pointer focus:outline-hidden"
                    >
                      <span className="w-7 h-7 rounded-md bg-[#070B19] text-white font-mono text-xs font-medium flex items-center justify-center group-hover:bg-[#0284C7] transition-colors shadow-2xs">
                        {step.number}
                      </span>
                      <span className="text-xs font-semibold text-[#070B19]/0 group-hover:text-[#070B19]/85 transition-colors">
                        {step.title}
                      </span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

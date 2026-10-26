import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  STORY_CHAPTERS,
  evaluateScrollChoreography,
  evaluateVehicleKinematics,
  ChoreographyState,
} from '../utils/cinematic-choreography';
import {
  detectSoftwareWebGL,
  createGpuFramePacer,
  setupStudioEnvironment,
  createRoutePulseShaderMaterial,
  createPlanetarySurfaceMaterial,
  createCompositeContainerShip,
  createCompositeCargoAircraft,
  createCompositeFreightTruck,
  createCompositeSuperportHub,
  RoutePulseMaterial,
} from '../utils/three-logistics-craft';
import {
  Compass,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Radio,
  ShieldCheck,
  Navigation,
  Zap,
  Layers,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface HubFocusPoint {
  id: string;
  code: string;
  name: string;
  role: string;
  pos: THREE.Vector3;
  camOffset: THREE.Vector3;
  metrics: string;
}

const HUB_NODES: HubFocusPoint[] = [
  {
    id: 'sha',
    code: 'SHA',
    name: 'Shanghai Gateway Port',
    role: 'Tier-1 Foundry & Ocean Origin',
    pos: new THREE.Vector3(64, 2.2, -6),
    camOffset: new THREE.Vector3(78, 22, 26),
    metrics: '18,400 Lithography Units · Berth 04',
  },
  {
    id: 'sin',
    code: 'SIN',
    name: 'Singapore PSA Megahub',
    role: 'Transshipment & Bunker Relay',
    pos: new THREE.Vector3(44, 1.8, 20),
    camOffset: new THREE.Vector3(56, 20, 48),
    metrics: '99.6% Crane Efficiency · 4.2h Dwell',
  },
  {
    id: 'suez',
    code: 'SUEZ',
    name: 'Red Sea / Suez Chokepoint',
    role: 'Maritime Corridor Bottleneck',
    pos: new THREE.Vector3(8, 1.4, 6),
    camOffset: new THREE.Vector3(16, 24, 38),
    metrics: '+72h Queue Anomaly Detected',
  },
  {
    id: 'dxb',
    code: 'DXB',
    name: 'Dubai Sea-Air Cargo Bridge',
    role: 'Autonomous Bypass Intermodal Hub',
    pos: new THREE.Vector3(18, 2.0, 2),
    camOffset: new THREE.Vector3(26, 24, 34),
    metrics: 'Priority Air Allocation · Flight OA-804',
  },
  {
    id: 'rtm',
    code: 'RTM',
    name: 'Rotterdam Europort',
    role: 'European Deepwater Terminal',
    pos: new THREE.Vector3(-12, 2.2, -24),
    camOffset: new THREE.Vector3(-22, 22, 8),
    metrics: 'Automated Rail & Road Cross-Dock',
  },
  {
    id: 'fra',
    code: 'FRA',
    name: 'Frankfurt Plant DE-02',
    role: 'Destination Assembly & Air Hub',
    pos: new THREE.Vector3(2, 2.4, -19),
    camOffset: new THREE.Vector3(6, 24, 14),
    metrics: 'SLA Buffer: 14.2 Days Protected',
  },
];

export const ScrollStorytelling: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const chapterCardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scrollProgressRef = useRef<number>(0);
  const manualDisruptionRef = useRef<boolean | null>(null);
  const focusedHubIdRef = useRef<string | null>(null);

  const [choreography, setChoreography] = useState<ChoreographyState>(() =>
    evaluateScrollChoreography(0, null)
  );
  const [manualDisruption, setManualDisruption] = useState<boolean | null>(null);
  const [focusedHubId, setFocusedHubId] = useState<string | null>(null);

  useEffect(() => {
    manualDisruptionRef.current = manualDisruption;
    setChoreography(
      evaluateScrollChoreography(scrollProgressRef.current, manualDisruption)
    );
  }, [manualDisruption]);

  useEffect(() => {
    focusedHubIdRef.current = focusedHubId;
  }, [focusedHubId]);

  useEffect(() => {
    const mount = canvasMountRef.current;
    const sectionEl = sectionRef.current;
    if (!mount || !sectionEl) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const isSoftwareGl = detectSoftwareWebGL();

    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b131e, 0.0022);

    const camera = new THREE.PerspectiveCamera(40, width / height, 1, 1600);
    const currentCamPos = new THREE.Vector3(18, 78, 146);
    const currentLookAt = new THREE.Vector3(8, 4, -6);
    camera.position.copy(currentCamPos);
    camera.lookAt(currentLookAt);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setClearColor(0x0b131e, 1);
    renderer.setSize(width, height);
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2)
    );
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);

    const envTexture = setupStudioEnvironment(renderer, scene);

    // Warm/Cool Studio Lighting
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x0f172a, 1.3);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.4);
    keyLight.position.set(85, 140, 95);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.85);
    rimLight.position.set(-95, 65, -75);
    scene.add(rimLight);

    const worldGroup = new THREE.Group();
    worldGroup.position.set(6, -6, 0);
    scene.add(worldGroup);

    // 1. Curved Planetary Bathymetric Plinth
    const baseDiskGeo = new THREE.CylinderGeometry(116, 120, 3.6, 72);
    const sideMat = new THREE.MeshStandardMaterial({
      color: 0x080d14,
      roughness: 0.5,
      metalness: 0.6,
    });
    const planetarySurfaceMat = createPlanetarySurfaceMaterial(false);
    const baseDisk = new THREE.Mesh(baseDiskGeo, [
      sideMat,
      planetarySurfaceMat,
      sideMat,
    ]);
    baseDisk.position.y = -2.1;
    worldGroup.add(baseDisk);

    // 2. Sculpted Continental Tectonic Plates
    const continents = [
      { x: 38, z: -16, w: 62, d: 36, h: 2.3 },
      { x: 58, z: -6, w: 32, d: 24, h: 3.2 },
      { x: -4, z: -24, w: 36, d: 22, h: 2.7 },
      { x: 16, z: 4, w: 26, d: 18, h: 2.1 },
      { x: -56, z: -14, w: 46, d: 30, h: 2.7 },
      { x: 42, z: 18, w: 24, d: 14, h: 1.9 },
    ];
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x132030,
      roughness: 0.42,
      metalness: 0.62,
    });
    const plateEdgeMat = new THREE.LineBasicMaterial({
      color: 0x64748b,
      transparent: true,
      opacity: 0.55,
    });

    continents.forEach((c) => {
      const geo = new THREE.BoxGeometry(c.w, c.h, c.d);
      const mesh = new THREE.Mesh(geo, plateMat);
      mesh.position.set(c.x, c.h / 2 - 0.3, c.z);
      mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), plateEdgeMat));
      worldGroup.add(mesh);
    });

    // 3. Superport & Hub Complexes + Chapter 5 Intelligence Ontology Rings
    const hubVisuals: {
      id: string;
      ringMesh: THREE.Mesh;
      ontologyRing: THREE.Mesh;
      uplinkLine: THREE.Line;
    }[] = [];

    const corePos = new THREE.Vector3(6, 38, -8);

    HUB_NODES.forEach((h) => {
      const built = createCompositeSuperportHub({
        height: h.id === 'suez' ? 5.5 : 9.5,
        isPrimaryGateway: h.id !== 'suez',
      });
      built.group.position.copy(h.pos);
      worldGroup.add(built.group);

      // Chapter 5 Floating Operational Ontology Ring above each Hub
      const ontoGeo = new THREE.TorusGeometry(6.2, 0.16, 10, 48);
      ontoGeo.rotateX(Math.PI / 2);
      const ontoMat = new THREE.MeshBasicMaterial({
        color: h.id === 'suez' ? 0xf59e0b : 0x38bdf8,
        transparent: true,
        opacity: 0.0,
      });
      const ontoRing = new THREE.Mesh(ontoGeo, ontoMat);
      ontoRing.position.set(h.pos.x, h.pos.y + 13.5, h.pos.z);
      worldGroup.add(ontoRing);

      // Vertical Uplink Beam to Orbital Intelligence Core
      const beamPts = [
        new THREE.Vector3(h.pos.x, h.pos.y + 10, h.pos.z),
        corePos.clone(),
      ];
      const beamGeo = new THREE.BufferGeometry().setFromPoints(beamPts);
      const beamMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.15,
      });
      const uplinkLine = new THREE.Line(beamGeo, beamMat);
      worldGroup.add(uplinkLine);

      hubVisuals.push({
        id: h.id,
        ringMesh: built.ringMesh,
        ontologyRing: ontoRing,
        uplinkLine,
      });
    });

    // 4. Chapter 4 Suez Disruption Shockwave Rings
    const shockwaveGroup = new THREE.Group();
    shockwaveGroup.position.set(8, 1.8, 6);
    worldGroup.add(shockwaveGroup);

    const shockRings: THREE.Mesh[] = [];
    [5, 9, 14].forEach((rad) => {
      const sGeo = new THREE.RingGeometry(rad, rad + 0.55, 48);
      sGeo.rotateX(-Math.PI / 2);
      const sMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      });
      const sMesh = new THREE.Mesh(sGeo, sMat);
      shockwaveGroup.add(sMesh);
      shockRings.push(sMesh);
    });

    // 5. Chapter 5 Orbital Intelligence Core
    const coreGroup = new THREE.Group();
    coreGroup.position.copy(corePos);
    worldGroup.add(coreGroup);

    const coreOuterRing = new THREE.Mesh(
      new THREE.TorusGeometry(20, 0.28, 12, 96).rotateX(Math.PI / 2),
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.45,
      })
    );
    coreGroup.add(coreOuterRing);

    const coreInnerRing = new THREE.Mesh(
      new THREE.TorusGeometry(12.5, 0.22, 12, 64).rotateX(Math.PI / 2.3),
      new THREE.MeshBasicMaterial({
        color: 0xa8c2d2,
        transparent: true,
        opacity: 0.5,
      })
    );
    coreGroup.add(coreInnerRing);

    const coreOcta = new THREE.Mesh(
      new THREE.OctahedronGeometry(4.0, 0),
      new THREE.MeshStandardMaterial({
        color: 0x101820,
        emissive: 0x0284c7,
        emissiveIntensity: 0.85,
        metalness: 0.85,
        roughness: 0.15,
      })
    );
    coreGroup.add(coreOcta);

    // 6. Multi-Modal Routes & Composite 3D Fleet
    // Route A: Primary Maritime Lane (SHA -> SIN -> SUEZ -> RTM)
    const primarySeaCurve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(64, 1.3, -6),
        new THREE.Vector3(56, 1.3, 12),
        new THREE.Vector3(44, 1.3, 20),
        new THREE.Vector3(24, 1.3, 18),
        new THREE.Vector3(8, 1.3, 6),
        new THREE.Vector3(-10, 1.3, -8),
        new THREE.Vector3(-12, 1.3, -24),
      ],
      false,
      'catmullrom',
      0.25
    );
    const primarySeaMat = createRoutePulseShaderMaterial({
      baseColorHex: 0x294d6b,
      pulseColorHex: 0x38bdf8,
      initialDrawProgress: 0.25,
      opacity: 0.92,
    });
    const primarySeaTube = new THREE.Mesh(
      new THREE.TubeGeometry(primarySeaCurve, 84, 0.48, 8, false),
      primarySeaMat
    );
    worldGroup.add(primarySeaTube);

    const primaryShip = createCompositeContainerShip(0x294d6b);
    primaryShip.scale.setScalar(0.92);
    worldGroup.add(primaryShip);

    // Shipment Tracking Halo around Primary Ship (Highlighted in Chapter 2)
    const trackingHalo = new THREE.Mesh(
      new THREE.RingGeometry(5.6, 6.4, 36).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      })
    );
    trackingHalo.position.y = 0.25;
    primaryShip.add(trackingHalo);

    // Route B: Chapter 6 Autonomous Sea-Air Bypass Corridor (SIN -> DXB -> FRA)
    const bypassAirCurve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(44, 2.2, 20),
        new THREE.Vector3(30, 8.5, 11),
        new THREE.Vector3(18, 4.0, 2),
        new THREE.Vector3(10, 28.0, -9),
        new THREE.Vector3(2, 5.5, -19),
      ],
      false,
      'catmullrom',
      0.25
    );
    const bypassAirMat = createRoutePulseShaderMaterial({
      baseColorHex: 0x059669,
      pulseColorHex: 0x34d399,
      initialDrawProgress: 0.0,
      opacity: 0.96,
    });
    bypassAirMat.uniforms.uBypassLevel.value = 1.0;
    const bypassAirTube = new THREE.Mesh(
      new THREE.TubeGeometry(bypassAirCurve, 72, 0.44, 8, false),
      bypassAirMat
    );
    worldGroup.add(bypassAirTube);

    const bypassJet = createCompositeCargoAircraft(0x059669);
    bypassJet.scale.setScalar(0.86);
    worldGroup.add(bypassJet);

    // Route C: Trans-Eurasian Geodesic Air Bridge (SHA -> FRA)
    const eurasiaAirCurve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(64, 5.5, -6),
        new THREE.Vector3(38, 30, -18),
        new THREE.Vector3(16, 32, -20),
        new THREE.Vector3(2, 5.5, -19),
      ],
      false,
      'catmullrom',
      0.25
    );
    const eurasiaAirMat = createRoutePulseShaderMaterial({
      baseColorHex: 0x1e40af,
      pulseColorHex: 0x7dd3fc,
      initialDrawProgress: 0.25,
      opacity: 0.8,
    });
    const eurasiaAirTube = new THREE.Mesh(
      new THREE.TubeGeometry(eurasiaAirCurve, 64, 0.34, 8, false),
      eurasiaAirMat
    );
    worldGroup.add(eurasiaAirTube);

    const eurasiaJet = createCompositeCargoAircraft(0x294d6b);
    eurasiaJet.scale.setScalar(0.76);
    worldGroup.add(eurasiaJet);

    // Route D: European Intermodal Ground Corridor (RTM -> FRA)
    const euroRoadCurve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-12, 2.6, -24),
        new THREE.Vector3(-5, 2.8, -22),
        new THREE.Vector3(2, 2.6, -19),
      ],
      false,
      'catmullrom',
      0.25
    );
    const euroRoadMat = createRoutePulseShaderMaterial({
      baseColorHex: 0x475569,
      pulseColorHex: 0xe2e8f0,
      initialDrawProgress: 0.25,
      opacity: 0.85,
    });
    const euroRoadTube = new THREE.Mesh(
      new THREE.TubeGeometry(euroRoadCurve, 40, 0.3, 6, false),
      euroRoadMat
    );
    worldGroup.add(euroRoadTube);

    const euroTruck = createCompositeFreightTruck(0x294d6b);
    euroTruck.scale.setScalar(0.84);
    worldGroup.add(euroTruck);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Master GSAP ScrollTrigger scrubbing across the entire 6-chapter section
    const st = ScrollTrigger.create({
      trigger: sectionEl,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate: (self) => {
        scrollProgressRef.current = self.progress;
        setChoreography(
          evaluateScrollChoreography(self.progress, manualDisruptionRef.current)
        );
      },
    });

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const pacer = createGpuFramePacer(renderer, isSoftwareGl);
    let lastTimeMs = performance.now();
    const startTimeMs = lastTimeMs;
    const lookTarget = new THREE.Vector3();

    const tick = () => {
      const nowMs = performance.now();
      const dt = Math.min((nowMs - lastTimeMs) / 1000, 0.1);
      lastTimeMs = nowMs;
      const elapsed = (nowMs - startTimeMs) / 1000;
      const damp = 1 - Math.exp(-5.0 * dt);

      const state = evaluateScrollChoreography(
        scrollProgressRef.current,
        manualDisruptionRef.current
      );

      // Update planetary bathymetry surface shader
      planetarySurfaceMat.uniforms.uTime.value = elapsed;
      planetarySurfaceMat.uniforms.uDisruptionAlert.value +=
        (state.disruptionSeverity -
          planetarySurfaceMat.uniforms.uDisruptionAlert.value) *
        damp;

      // Update Primary Maritime Route & Ship (Chapter 1 draw, Chapter 2 track, Chapter 4 disruption)
      primarySeaMat.uniforms.uTime.value = elapsed;
      primarySeaMat.uniforms.uDrawProgress.value = state.routeDrawProgress;
      primarySeaMat.uniforms.uAlertLevel.value +=
        (state.disruptionSeverity - primarySeaMat.uniforms.uAlertLevel.value) *
        damp;

      const shipKin = evaluateVehicleKinematics({
        baseProgress: 0.24,
        baseSpeed: prefersReducedMotion ? 0 : 0.022,
        elapsedSeconds: elapsed,
        mode: 'OCEAN',
        isDisruptedCorridor: true,
        isBypassCorridor: false,
        disruptionSeverity: state.disruptionSeverity,
        bypassCorridorProgress: state.bypassCorridorProgress,
      });

      // In Chapter 2, bias ship position near the active tracking camera corridor
      const shipT =
        state.shipmentTrackingWeight > 0.25
          ? (0.18 + state.chapterLocalProgress * 0.28) % 1.0
          : shipKin.progress;
      const shipPos = primarySeaCurve.getPointAt(shipT);
      const shipTan = primarySeaCurve.getTangentAt(shipT).normalize();
      primaryShip.position.copy(shipPos);
      lookTarget.copy(shipPos).add(shipTan);
      primaryShip.lookAt(lookTarget);
      (trackingHalo.material as THREE.MeshBasicMaterial).opacity =
        state.shipmentTrackingWeight * 0.85;

      // Update Chapter 6 Autonomous Sea-Air Bypass Corridor & Jet
      bypassAirMat.uniforms.uTime.value = elapsed * 1.35;
      bypassAirMat.uniforms.uDrawProgress.value +=
        (state.bypassCorridorProgress -
          bypassAirMat.uniforms.uDrawProgress.value) *
        damp;

      const bypassVisible = state.bypassCorridorProgress > 0.05;
      bypassJet.visible = bypassVisible;
      if (bypassVisible) {
        const bypassKin = evaluateVehicleKinematics({
          baseProgress: 0.12,
          baseSpeed: prefersReducedMotion ? 0 : 0.055,
          elapsedSeconds: elapsed,
          mode: 'AIR',
          isDisruptedCorridor: false,
          isBypassCorridor: true,
          disruptionSeverity: state.disruptionSeverity,
          bypassCorridorProgress: state.bypassCorridorProgress,
        });
        const bPt = bypassAirCurve.getPointAt(bypassKin.progress);
        const bTan = bypassAirCurve.getTangentAt(bypassKin.progress).normalize();
        bypassJet.position.copy(bPt);
        lookTarget.copy(bPt).add(bTan);
        bypassJet.lookAt(lookTarget);
        bypassJet.rotateZ(bypassKin.bankAngleRad);
      }

      // Update Eurasia Air & European Ground Fleet
      eurasiaAirMat.uniforms.uTime.value = elapsed;
      eurasiaAirMat.uniforms.uDrawProgress.value = state.routeDrawProgress;
      const airT = (0.35 + (prefersReducedMotion ? 0 : elapsed * 0.042)) % 1.0;
      const airPt = eurasiaAirCurve.getPointAt(airT);
      const airTan = eurasiaAirCurve.getTangentAt(airT).normalize();
      eurasiaJet.position.copy(airPt);
      lookTarget.copy(airPt).add(airTan);
      eurasiaJet.lookAt(lookTarget);

      euroRoadMat.uniforms.uTime.value = elapsed;
      euroRoadMat.uniforms.uDrawProgress.value = state.routeDrawProgress;
      const roadT = (0.4 + (prefersReducedMotion ? 0 : elapsed * 0.035)) % 1.0;
      const roadPt = euroRoadCurve.getPointAt(roadT);
      const roadTan = euroRoadCurve.getTangentAt(roadT).normalize();
      euroTruck.position.copy(roadPt);
      lookTarget.copy(roadPt).add(roadTan);
      euroTruck.lookAt(lookTarget);

      // Update Chapter 4 Suez Shockwave Rings
      shockRings.forEach((r, idx) => {
        const phase = (elapsed * 0.65 + idx * 0.33) % 1.0;
        const scale = 0.6 + phase * 1.4;
        r.scale.set(scale, scale, 1);
        (r.material as THREE.MeshBasicMaterial).opacity =
          state.disruptionSeverity * (1 - phase) * 0.75;
      });

      // Update Chapter 3 & 5 Hub Ontology Rings & Orbital Core Uplinks
      hubVisuals.forEach((hv, idx) => {
        hv.ontologyRing.rotation.z = elapsed * 0.35 + idx;
        (hv.ontologyRing.material as THREE.MeshBasicMaterial).opacity =
          state.intelligenceGraphWeight * 0.85;
        (hv.uplinkLine.material as THREE.LineBasicMaterial).opacity =
          0.12 +
          state.networkDensityWeight * 0.25 +
          state.intelligenceGraphWeight * 0.45;
      });

      coreOuterRing.rotation.z = elapsed * 0.22;
      coreInnerRing.rotation.y = -elapsed * 0.35;
      coreOcta.rotation.y = elapsed * 0.5;

      // Determine Target Camera Position & LookAt (Scroll Choreography OR Interactive Hub Focus)
      const focusedHub = HUB_NODES.find((h) => h.id === focusedHubIdRef.current);
      let targetPosX = state.cameraPos.x;
      let targetPosY = state.cameraPos.y;
      let targetPosZ = state.cameraPos.z;
      let targetLookX = state.lookAt.x;
      let targetLookY = state.lookAt.y;
      let targetLookZ = state.lookAt.z;

      if (focusedHub) {
        targetPosX = focusedHub.camOffset.x;
        targetPosY = focusedHub.camOffset.y;
        targetPosZ = focusedHub.camOffset.z;
        targetLookX = focusedHub.pos.x;
        targetLookY = focusedHub.pos.y + 3;
        targetLookZ = focusedHub.pos.z;
      } else if (state.shipmentTrackingWeight > 0.45) {
        // In Chapter 2, smoothly track the moving container vessel along its spline
        targetLookX =
          state.lookAt.x * (1 - state.shipmentTrackingWeight * 0.5) +
          shipPos.x * (state.shipmentTrackingWeight * 0.5);
        targetLookZ =
          state.lookAt.z * (1 - state.shipmentTrackingWeight * 0.5) +
          shipPos.z * (state.shipmentTrackingWeight * 0.5);
      }

      currentCamPos.x += (targetPosX - currentCamPos.x) * damp;
      currentCamPos.y += (targetPosY - currentCamPos.y) * damp;
      currentCamPos.z += (targetPosZ - currentCamPos.z) * damp;

      currentLookAt.x += (targetLookX - currentLookAt.x) * damp;
      currentLookAt.y += (targetLookY - currentLookAt.y) * damp;
      currentLookAt.z += (targetLookZ - currentLookAt.z) * damp;

      camera.position.copy(currentCamPos);
      camera.lookAt(currentLookAt);

      if (Math.abs(camera.fov - state.fov) > 0.05) {
        camera.fov += (state.fov - camera.fov) * damp;
        camera.updateProjectionMatrix();
      }

      renderer.render(scene, camera);
      pacer.scheduleNext(tick);
    };

    pacer.scheduleNext(tick);

    return () => {
      st.kill();
      pacer.dispose();
      window.removeEventListener('resize', handleResize);
      envTexture.dispose();
      renderer.dispose();
      if (mount && renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  const currentChapter =
    STORY_CHAPTERS[choreography.activeChapterIndex] || STORY_CHAPTERS[0];
  const focusedHub = HUB_NODES.find((h) => h.id === focusedHubId);

  const handleJumpToChapter = (chapterIndex: number) => {
    setFocusedHubId(null);
    const cardEl = chapterCardRefs.current[chapterIndex];
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <section
      id="cinematic-story"
      ref={sectionRef}
      className="relative bg-[#0B131E] text-white border-b border-[#D5E1E8]"
    >
      {/* Sticky Full-Viewport 3D Choreography Stage */}
      <div className="sticky top-20 h-[calc(100vh-5rem)] w-full overflow-hidden">
        {/* Dedicated Three.js Canvas Mount */}
        <div ref={canvasMountRef} className="absolute inset-0 w-full h-full" />

        {/* Subtle Vignette for Editorial Contrast */}
        <div
          className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#0B131E]/90 via-[#0B131E]/35 to-transparent lg:w-[52%]"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#0B131E]/85 via-transparent to-[#0B131E]/55"
          aria-hidden="true"
        />

        {/* Top Pinned Choreography Bar: 6-Chapter Timeline Scrubber & Hub Telemetry Selector */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex flex-wrap items-center justify-between gap-3">
          {/* 6-Chapter Interactive Progress Stepper */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-[#101820] border border-white/15 font-mono text-[11px]">
            {STORY_CHAPTERS.map((ch, idx) => {
              const isActive = idx === choreography.activeChapterIndex;
              const isPassed = idx < choreography.activeChapterIndex;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => handleJumpToChapter(idx)}
                  className={`px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#294D6B] text-white font-bold shadow-sm'
                      : isPassed
                        ? 'text-[#7DD3FC] hover:text-white'
                        : 'text-[#A8C2D2]/70 hover:text-white'
                  }`}
                >
                  <span>{ch.number}</span>
                  <span className="hidden xl:inline">{ch.title}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive 3D Hub Camera Selector + Disruption Override */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
            <div className="hidden md:flex items-center gap-1 p-1 rounded-full bg-[#101820] border border-white/15">
              <span className="px-2 text-[#A8C2D2]">INSPECT HUB:</span>
              {HUB_NODES.map((hub) => {
                const isSelected = focusedHubId === hub.id;
                return (
                  <button
                    key={hub.id}
                    type="button"
                    onClick={() =>
                      setFocusedHubId(isSelected ? null : hub.id)
                    }
                    className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#7DD3FC] text-[#101820] font-bold'
                        : 'text-[#A8C2D2] hover:text-white'
                    }`}
                  >
                    {hub.code}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() =>
                setManualDisruption((prev) => (prev === true ? null : true))
              }
              className={`px-3.5 py-1.5 rounded-full border font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                manualDisruption === true
                  ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                  : 'bg-[#101820] border-white/15 text-[#A8C2D2] hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span>
                {manualDisruption === true
                  ? 'Disruption Override: ON'
                  : 'Simulate Suez Bottleneck'}
              </span>
            </button>
          </div>
        </div>

        {/* Left-Aligned Active Chapter Narrative Card (Anchored cleanly below Top Toolbar) */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pointer-events-none">
          <div
            key={currentChapter.id}
            className="max-w-lg w-full rounded-3xl p-6 sm:p-8 border bg-[#101820]/96 border-[#7DD3FC]/55 shadow-[0_28px_70px_rgba(0,0,0,0.55)] pointer-events-auto transition-all duration-300"
          >
            {/* Chapter Eyebrow */}
            <div className="flex items-center justify-between gap-3 pb-3.5 mb-4 border-b border-white/10 font-mono text-xs">
              <span className="flex items-center gap-2 text-[#7DD3FC] font-bold">
                <Compass className="w-4 h-4" />
                <span>
                  CHAPTER {currentChapter.number} OF 06 · {currentChapter.corridorStatus}
                </span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[10px]">
                {currentChapter.metricValue}
              </span>
            </div>

            {/* Chapter Title & Subtitle */}
            <div className="space-y-1.5 mb-3.5">
              <div className="text-[11px] font-mono uppercase tracking-widest text-[#A8C2D2]">
                {currentChapter.subtitle}
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-[-0.03em] text-white leading-tight">
                {currentChapter.title}
              </h2>
            </div>

            {/* Chapter Narrative Copy */}
            <p className="text-sm sm:text-base text-[#D5E1E8] leading-relaxed mb-5">
              {currentChapter.narrative}
            </p>

            {/* Chapter-Specific Interactive Action / Telemetry Strip */}
            {choreography.activeChapterIndex === 3 && (
              <div className="mb-4 p-3.5 rounded-2xl bg-amber-500/15 border border-amber-400/40 font-mono text-xs space-y-1">
                <div className="flex items-center justify-between text-amber-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    SUEZ APPROACH BOTTLENECK
                  </span>
                  <span>+72H QUEUE</span>
                </div>
                <p className="text-[11px] text-amber-100/90 font-sans">
                  Primary sea lane transitions to alert state; Frankfurt assembly buffer projected to breach safety threshold in 5.2 days.
                </p>
              </div>
            )}

            {choreography.activeChapterIndex === 5 && (
              <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 font-mono text-xs space-y-1">
                <div className="flex items-center justify-between text-emerald-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    AUTONOMOUS SEA-AIR BYPASS VERIFIED
                  </span>
                  <span>99.4% SLA</span>
                </div>
                <p className="text-[11px] text-emerald-100/90 font-sans">
                  Priority cargo transferred at Dubai (DXB) onto Flight OA-804 to Frankfurt (FRA) with SAP PO schedule lines automatically synchronized.
                </p>
              </div>
            )}

            {/* Bottom Telemetry Bar */}
            <div className="pt-3.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-[#A8C2D2]">
              <div>
                <span className="text-white/50 block text-[9px]">
                  {currentChapter.metricLabel}
                </span>
                <span className="text-white font-bold">
                  {currentChapter.metricValue}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {choreography.activeChapterIndex > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      handleJumpToChapter(choreography.activeChapterIndex - 1)
                    }
                    className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors cursor-pointer"
                  >
                    ← Prev
                  </button>
                )}
                {choreography.activeChapterIndex < STORY_CHAPTERS.length - 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      handleJumpToChapter(choreography.activeChapterIndex + 1)
                    }
                    className="px-3.5 py-1.5 rounded-full bg-[#294D6B] hover:bg-[#38BDF8] hover:text-[#101820] text-white font-bold transition-colors cursor-pointer"
                  >
                    Next Chapter →
                  </button>
                ) : (
                  <a
                    href="#network"
                    className="px-3.5 py-1.5 rounded-full bg-emerald-500 text-[#101820] font-bold hover:bg-emerald-400 transition-colors"
                  >
                    Open Interactive Sandbox ↓
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom-Right Pinned Operational Telemetry & 5-Stage Decision Execution HUD */}
        <div className="hidden lg:flex flex-col justify-end items-end absolute bottom-6 right-8 z-20 pointer-events-none max-w-md w-full space-y-3">
          {/* Focused Hub Inspection Card (When user clicks a Hub) */}
          {focusedHub && (
            <div className="w-full rounded-2xl bg-[#101820] border border-[#7DD3FC]/50 p-4 font-mono text-xs pointer-events-auto shadow-2xl space-y-2">
              <div className="flex items-center justify-between text-[10px] text-[#7DD3FC]">
                <span className="font-bold flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5" />
                  HUB CAMERA LOCK · {focusedHub.code}
                </span>
                <button
                  type="button"
                  onClick={() => setFocusedHubId(null)}
                  className="underline text-[#A8C2D2] hover:text-white cursor-pointer"
                >
                  Release Camera
                </button>
              </div>
              <div className="text-sm font-bold text-white font-sans">
                {focusedHub.name}
              </div>
              <div className="text-[11px] text-[#A8C2D2]">{focusedHub.role}</div>
              <div className="pt-2 border-t border-white/10 text-[11px] text-emerald-300">
                {focusedHub.metrics}
              </div>
            </div>
          )}

          {/* Live Synchronized Scene State & Decision Pipeline Card */}
          <div className="w-full rounded-2xl bg-[#101820] border border-white/15 p-4 font-mono text-xs pointer-events-auto shadow-2xl space-y-3">
            <div className="flex items-center justify-between text-[10px] text-[#A8C2D2] border-b border-white/10 pb-2">
              <span className="flex items-center gap-1.5 text-white font-bold">
                <Radio className="w-3.5 h-3.5 text-[#7DD3FC]" />
                CHAPTER {currentChapter.number} · {currentChapter.corridorStatus}
              </span>
              <span className="tabular-nums text-[#7DD3FC]">
                SCROLL {Math.round(choreography.scrollProgress * 100)}%
              </span>
            </div>

            {/* Real-Time Corridor Metrics */}
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                <span className="text-[#A8C2D2] block">CORRIDOR ETA</span>
                <span
                  className={`text-xs font-bold tabular-nums mt-0.5 block ${
                    choreography.disruptionSeverity > 0.5 &&
                    choreography.bypassCorridorProgress < 0.5
                      ? 'text-amber-300'
                      : 'text-emerald-300'
                  }`}
                >
                  {choreography.estimatedEtaHours}h
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                <span className="text-[#A8C2D2] block">SLA INTEGRITY</span>
                <span className="text-xs font-bold text-white tabular-nums mt-0.5 block">
                  {choreography.slaIntegrityPercent}%
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                <span className="text-[#A8C2D2] block">EXPOSURE</span>
                <span
                  className={`text-xs font-bold tabular-nums mt-0.5 block ${
                    choreography.financialExposureUsd > 250000
                      ? 'text-amber-300'
                      : 'text-emerald-300'
                  }`}
                >
                  ${(choreography.financialExposureUsd / 1000).toFixed(0)}K
                </span>
              </div>
            </div>

            {/* 5-Stage Decision & Autonomous Execution Pipeline */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[9px] text-[#A8C2D2] uppercase">
                <span>GOVERNED DECISION SEQUENCE</span>
                <span className="text-[#7DD3FC]">
                  {choreography.bypassCorridorProgress > 0.6
                    ? 'SEA-AIR BYPASS ACTIVE'
                    : choreography.disruptionSeverity > 0.4
                      ? 'EVALUATING MITIGATION'
                      : 'MONITORING TELEMETRY'}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {choreography.decisionStages.map((stItem) => (
                  <div
                    key={stItem.id}
                    className={`px-1.5 py-1.5 rounded-lg border text-center transition-colors ${
                      stItem.active
                        ? 'bg-[#294D6B] border-[#7DD3FC] text-white font-bold'
                        : stItem.completed
                          ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                          : 'bg-white/[0.03] border-white/10 text-[#A8C2D2]/60'
                    }`}
                  >
                    <span className="text-[8px] block truncate">
                      {stItem.shortCode}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-[#A8C2D2] font-sans leading-snug pt-0.5">
                {
                  choreography.decisionStages[
                    choreography.activeDecisionStageIndex
                  ]?.summary
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll-Driven Waypoint Track (6 Chapters Driving the Pinned 3D World) */}
      <div
        className="relative z-0 pointer-events-none"
        aria-hidden="true"
      >
        {STORY_CHAPTERS.map((chapter, idx) => (
          <div
            key={chapter.id}
            ref={(el) => {
              chapterCardRefs.current[idx] = el;
            }}
            className="h-[82vh]"
          />
        ))}
      </div>
    </section>
  );
};

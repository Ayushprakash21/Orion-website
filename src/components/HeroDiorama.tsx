import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
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
import { evaluateVehicleKinematics } from '../utils/cinematic-choreography';

export type HeroCameraPreset = 'orbit' | 'shanghai' | 'airbridge' | 'rotterdam';

interface HeroDioramaProps {
  activePreset?: HeroCameraPreset;
  disruptionSimulated?: boolean;
  scrollProgress?: number;
}

interface ProjectedCallout {
  id: string;
  label: string;
  sublabel: string;
  mode: 'AIR' | 'OCEAN' | 'ROAD' | 'HUB';
  status: 'NOMINAL' | 'DELAYED' | 'EXPEDITED';
  x: number;
  y: number;
  visible: boolean;
}

const CAMERA_PRESETS: Record<
  HeroCameraPreset,
  { pos: THREE.Vector3; lookAt: THREE.Vector3; fov: number }
> = {
  orbit: {
    pos: new THREE.Vector3(16, 62, 128),
    lookAt: new THREE.Vector3(-10, 6, -4),
    fov: 39,
  },
  shanghai: {
    pos: new THREE.Vector3(74, 24, 32),
    lookAt: new THREE.Vector3(48, 4, -4),
    fov: 34,
  },
  airbridge: {
    pos: new THREE.Vector3(18, 44, 62),
    lookAt: new THREE.Vector3(14, 20, -20),
    fov: 36,
  },
  rotterdam: {
    pos: new THREE.Vector3(-18, 22, 16),
    lookAt: new THREE.Vector3(-6, 4, -22),
    fov: 34,
  },
};

export const HeroDiorama: React.FC<HeroDioramaProps> = ({
  activePreset = 'orbit',
  disruptionSimulated = false,
  scrollProgress = 0,
}) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const presetRef = useRef<HeroCameraPreset>(activePreset);
  const disruptionRef = useRef<boolean>(disruptionSimulated);
  const scrollRef = useRef<number>(scrollProgress);
  const [callouts, setCallouts] = useState<ProjectedCallout[]>([]);

  useEffect(() => {
    presetRef.current = activePreset;
  }, [activePreset]);

  useEffect(() => {
    disruptionRef.current = disruptionSimulated;
  }, [disruptionSimulated]);

  useEffect(() => {
    scrollRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const isSoftwareGl = detectSoftwareWebGL();

    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xeaf4f8, 0.0024);

    const camera = new THREE.PerspectiveCamera(39, width / height, 1, 1600);
    const currentCamPos = CAMERA_PRESETS.orbit.pos.clone();
    const currentLookAt = CAMERA_PRESETS.orbit.lookAt.clone();
    camera.position.copy(currentCamPos);
    camera.lookAt(currentLookAt);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2)
    );
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    mount.appendChild(renderer.domElement);

    const envTexture = setupStudioEnvironment(renderer, scene);

    // Warm/Cool Studio Lighting Contrast
    const hemiLight = new THREE.HemisphereLight(0xf5f9fb, 0x1e354d, 1.35);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.3);
    keyLight.position.set(90, 150, 110);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x60a5fa, 1.75);
    rimLight.position.set(-110, 70, -85);
    scene.add(rimLight);

    const worldGroup = new THREE.Group();
    worldGroup.position.set(22, -7, 0);
    worldGroup.rotation.x = 0.07;
    scene.add(worldGroup);

    // 1. Curved Planetary Bathymetric Plinth with Custom GLSL Shader
    const baseDiskGeo = new THREE.CylinderGeometry(114, 118, 3.4, 72);
    const baseSideMat = new THREE.MeshStandardMaterial({
      color: 0x0c131c,
      roughness: 0.45,
      metalness: 0.55,
    });
    const planetaryTopMat = createPlanetarySurfaceMaterial(true);
    const baseDisk = new THREE.Mesh(baseDiskGeo, [
      baseSideMat,
      planetaryTopMat,
      baseSideMat,
    ]);
    baseDisk.position.y = -2.0;
    worldGroup.add(baseDisk);

    // Outer steel-blue precision bezel ring
    const bezelGeo = new THREE.RingGeometry(113.2, 115.2, 96);
    bezelGeo.rotateX(-Math.PI / 2);
    const bezelMat = new THREE.MeshBasicMaterial({
      color: 0x294d6b,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
    });
    const bezelMesh = new THREE.Mesh(bezelGeo, bezelMat);
    bezelMesh.position.y = -0.25;
    worldGroup.add(bezelMesh);

    // 2. Sculpted Multi-Tier Continental Tectonic Relief Plates
    const continentsData = [
      { x: 38, z: -16, w: 60, d: 36, h: 2.2 }, // Eurasia East
      { x: 58, z: -6, w: 30, d: 24, h: 3.1 },  // Coastal China / East Asia
      { x: -4, z: -24, w: 34, d: 22, h: 2.6 }, // Western Europe
      { x: 16, z: 4, w: 24, d: 18, h: 2.1 },   // Middle East / Arabian Peninsula
      { x: -56, z: -14, w: 46, d: 30, h: 2.7 }, // North America
      { x: 42, z: 18, w: 24, d: 14, h: 1.9 },  // Southeast Asia Archipelago
    ];

    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x162230,
      roughness: 0.4,
      metalness: 0.62,
    });
    const plateEdgeMat = new THREE.LineBasicMaterial({
      color: 0xa8c2d2,
      transparent: true,
      opacity: 0.58,
    });

    continentsData.forEach((c) => {
      const geo = new THREE.BoxGeometry(c.w, c.h, c.d);
      const mesh = new THREE.Mesh(geo, plateMat);
      mesh.position.set(c.x, c.h / 2 - 0.3, c.z);
      worldGroup.add(mesh);

      const edges = new THREE.EdgesGeometry(geo);
      mesh.add(new THREE.LineSegments(edges, plateEdgeMat));
    });

    // Instanced Urban / Logistics Micro-Cluster Nodes across Continental Shelves
    const clusterCount = 48;
    const clusterGeo = new THREE.BoxGeometry(0.85, 1.4, 0.85);
    const clusterMat = new THREE.MeshStandardMaterial({
      color: 0x294d6b,
      roughness: 0.35,
      metalness: 0.65,
    });
    const clusterInstanced = new THREE.InstancedMesh(
      clusterGeo,
      clusterMat,
      clusterCount
    );
    const dummy = new THREE.Object3D();
    for (let i = 0; i < clusterCount; i++) {
      const cont = continentsData[i % continentsData.length];
      const angle = (i * 1.6180339) * Math.PI * 2;
      const rx = Math.cos(angle) * (cont.w * 0.36 * ((i % 5) / 5 + 0.2));
      const rz = Math.sin(angle) * (cont.d * 0.36 * (((i + 2) % 5) / 5 + 0.2));
      const hScale = 0.6 + (i % 4) * 0.45;
      dummy.position.set(
        cont.x + rx,
        cont.h - 0.3 + (1.4 * hScale) / 2,
        cont.z + rz
      );
      dummy.scale.set(1, hScale, 1);
      dummy.updateMatrix();
      clusterInstanced.setMatrixAt(i, dummy.matrix);
    }
    clusterInstanced.instanceMatrix.needsUpdate = true;
    worldGroup.add(clusterInstanced);

    // 3. Central Orion-9 Orbital Orchestration Core
    const coreGroup = new THREE.Group();
    coreGroup.position.set(6, 36, -8);
    worldGroup.add(coreGroup);

    const outerRingGeo = new THREE.TorusGeometry(19, 0.26, 12, 96);
    outerRingGeo.rotateX(Math.PI / 2);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0x294d6b,
      transparent: true,
      opacity: 0.72,
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    coreGroup.add(outerRing);

    const innerRingGeo = new THREE.TorusGeometry(12, 0.22, 12, 64);
    innerRingGeo.rotateX(Math.PI / 2.25);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.65,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    coreGroup.add(innerRing);

    const coreOctaGeo = new THREE.OctahedronGeometry(3.8, 0);
    const coreOctaMat = new THREE.MeshStandardMaterial({
      color: 0x101820,
      emissive: 0x294d6b,
      emissiveIntensity: 0.7,
      metalness: 0.85,
      roughness: 0.15,
    });
    const coreOcta = new THREE.Mesh(coreOctaGeo, coreOctaMat);
    coreGroup.add(coreOcta);

    const coreWire = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.OctahedronGeometry(5.2, 0)),
      new THREE.LineBasicMaterial({
        color: 0x7dd3fc,
        transparent: true,
        opacity: 0.88,
      })
    );
    coreGroup.add(coreWire);

    // 4. Composite 6-Part Global Superports & Intermodal Gateways
    const hubs = [
      { id: 'sha', code: 'SHA-PORT', pos: new THREE.Vector3(64, 2.5, -6), height: 10.5, primary: true },
      { id: 'sin', code: 'SIN-PSA', pos: new THREE.Vector3(44, 1.6, 20), height: 8.8, primary: true },
      { id: 'dxb', code: 'DXB-HUB', pos: new THREE.Vector3(18, 1.8, 4), height: 9.2, primary: true },
      { id: 'rtm', code: 'RTM-EURO', pos: new THREE.Vector3(-12, 2.2, -24), height: 9.8, primary: true },
      { id: 'fra', code: 'FRA-AIR', pos: new THREE.Vector3(2, 2.2, -19), height: 11.2, primary: false },
      { id: 'lax', code: 'LAX-TERM', pos: new THREE.Vector3(-68, 2.2, -4), height: 9.0, primary: true },
      { id: 'ord', code: 'ORD-RAIL', pos: new THREE.Vector3(-42, 2.2, -16), height: 8.4, primary: false },
    ];

    const hubRings: THREE.Mesh[] = [];
    hubs.forEach((h) => {
      const built = createCompositeSuperportHub({
        height: h.height,
        isPrimaryGateway: h.primary,
      });
      built.group.position.copy(h.pos);
      worldGroup.add(built.group);
      hubRings.push(built.ringMesh);

      const beamPts = [
        new THREE.Vector3(h.pos.x, h.pos.y + h.height + 1.4, h.pos.z),
        new THREE.Vector3(
          coreGroup.position.x,
          coreGroup.position.y,
          coreGroup.position.z
        ),
      ];
      const beamGeo = new THREE.BufferGeometry().setFromPoints(beamPts);
      const beamMat = new THREE.LineBasicMaterial({
        color: 0x294d6b,
        transparent: true,
        opacity: 0.3,
      });
      worldGroup.add(new THREE.Line(beamGeo, beamMat));
    });

    // 5. Animated Corridors with Custom GLSL Traveling-Pulse Shaders & Composite 3D Fleet
    interface FleetRouteItem {
      id: string;
      label: string;
      sublabel: string;
      mode: 'AIR' | 'OCEAN' | 'ROAD';
      mesh: THREE.Group;
      shaderMat: RoutePulseMaterial;
      curve: THREE.CatmullRomCurve3;
      baseProgress: number;
      speed: number;
      showCallout: boolean;
      isPrimaryMaritime?: boolean;
      isBypassCorridor?: boolean;
    }

    const fleetItems: FleetRouteItem[] = [];

    const routeDefinitions = [
      {
        id: 'sea-sha-rtm',
        label: 'MV-ORION-01 · 24K TEU',
        sublabel: 'SHA → SIN → RTM SEA CORRIDOR',
        mode: 'OCEAN' as const,
        speed: 0.024,
        initialProgress: 0.28,
        showCallout: true,
        isPrimaryMaritime: true,
        baseColor: 0x294d6b,
        pulseColor: 0x38bdf8,
        points: [
          new THREE.Vector3(64, 1.3, -6),
          new THREE.Vector3(58, 1.3, 12),
          new THREE.Vector3(44, 1.3, 20),
          new THREE.Vector3(24, 1.3, 20),
          new THREE.Vector3(8, 1.3, 6),
          new THREE.Vector3(-14, 1.3, -8),
          new THREE.Vector3(-12, 1.3, -24),
        ],
      },
      {
        id: 'air-sha-fra',
        label: 'FLIGHT OA-804 · CARGO JET',
        sublabel: 'SHA → FRA · 890 KM/H GEODESIC',
        mode: 'AIR' as const,
        speed: 0.048,
        initialProgress: 0.36,
        showCallout: true,
        isBypassCorridor: true,
        baseColor: 0x1e40af,
        pulseColor: 0x7dd3fc,
        points: [
          new THREE.Vector3(64, 5.5, -6),
          new THREE.Vector3(40, 28, -16),
          new THREE.Vector3(18, 33, -18),
          new THREE.Vector3(2, 6, -19),
        ],
      },
      {
        id: 'air-fra-ord',
        label: 'FLIGHT AC-912 · COLD CHAIN',
        sublabel: 'FRA → ORD · +4.2°C BIOLOGICS',
        mode: 'AIR' as const,
        speed: 0.042,
        initialProgress: 0.62,
        showCallout: true,
        baseColor: 0x294d6b,
        pulseColor: 0x93c5fd,
        points: [
          new THREE.Vector3(2, 6, -19),
          new THREE.Vector3(-18, 29, -26),
          new THREE.Vector3(-32, 24, -22),
          new THREE.Vector3(-42, 5.5, -16),
        ],
      },
      {
        id: 'road-rtm-fra',
        label: 'CONVOY TR-409 · INTERMODAL',
        sublabel: 'RTM → FRA · 99.8% SLA SYNC',
        mode: 'ROAD' as const,
        speed: 0.036,
        initialProgress: 0.46,
        showCallout: true,
        baseColor: 0x334155,
        pulseColor: 0xe2e8f0,
        points: [
          new THREE.Vector3(-12, 2.6, -24),
          new THREE.Vector3(-5, 2.8, -22),
          new THREE.Vector3(2, 2.6, -19),
          new THREE.Vector3(14, 2.6, -15),
        ],
      },
      {
        id: 'sea-pac-lax',
        label: 'MV-TITAN-08 · 18K TEU',
        sublabel: 'TRANS-PACIFIC GATEWAY',
        mode: 'OCEAN' as const,
        speed: 0.026,
        initialProgress: 0.52,
        showCallout: false,
        baseColor: 0x294d6b,
        pulseColor: 0x7dd3fc,
        points: [
          new THREE.Vector3(-96, 1.3, 18),
          new THREE.Vector3(-82, 1.3, 8),
          new THREE.Vector3(-68, 1.3, -4),
        ],
      },
    ];

    routeDefinitions.forEach((def) => {
      const curve = new THREE.CatmullRomCurve3(
        def.points,
        false,
        'catmullrom',
        0.25
      );
      const radius =
        def.mode === 'AIR' ? 0.36 : def.mode === 'OCEAN' ? 0.44 : 0.3;
      const tubeGeo = new THREE.TubeGeometry(curve, 72, radius, 8, false);
      const shaderMat = createRoutePulseShaderMaterial({
        baseColorHex: def.baseColor,
        pulseColorHex: def.pulseColor,
        initialDrawProgress: 0.05,
        opacity: 0.92,
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, shaderMat);
      worldGroup.add(tubeMesh);

      let vehicleMesh: THREE.Group;
      if (def.mode === 'AIR') {
        vehicleMesh = createCompositeCargoAircraft(0x294d6b);
        vehicleMesh.scale.setScalar(0.78);
      } else if (def.mode === 'OCEAN') {
        vehicleMesh = createCompositeContainerShip(0x294d6b);
        vehicleMesh.scale.setScalar(0.85);
      } else {
        vehicleMesh = createCompositeFreightTruck(0x294d6b);
        vehicleMesh.scale.setScalar(0.82);
      }
      worldGroup.add(vehicleMesh);

      fleetItems.push({
        id: def.id,
        label: def.label,
        sublabel: def.sublabel,
        mode: def.mode,
        mesh: vehicleMesh,
        shaderMat,
        curve,
        baseProgress: def.initialProgress,
        speed: def.speed,
        showCallout: def.showCallout,
        isPrimaryMaritime: def.isPrimaryMaritime,
        isBypassCorridor: def.isBypassCorridor,
      });
    });

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const mouseTarget = { x: 0, y: 0 };
    const mouseCurrent = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion) return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      mouseTarget.x = nx * 10;
      mouseTarget.y = -ny * 6;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

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
    const tempVec = new THREE.Vector3();
    const lookTarget = new THREE.Vector3();
    let frameCount = 0;

    const tick = () => {
      const nowMs = performance.now();
      const dt = Math.min((nowMs - lastTimeMs) / 1000, 0.1);
      lastTimeMs = nowMs;
      const elapsed = (nowMs - startTimeMs) / 1000;
      frameCount++;

      const damp = 1 - Math.exp(-4.5 * dt);
      const isDisrupted = disruptionRef.current;
      const scrollVal = scrollRef.current;

      // Progressive opening corridor draw over the first 2.2 seconds
      const introDrawProgress = prefersReducedMotion
        ? 1.0
        : Math.min(1.0, 0.18 + elapsed * 0.42);

      // Update planetary bathymetry shader
      planetaryTopMat.uniforms.uTime.value = elapsed;
      planetaryTopMat.uniforms.uDisruptionAlert.value +=
        ((isDisrupted ? 1.0 : 0.0) -
          planetaryTopMat.uniforms.uDisruptionAlert.value) *
        damp;

      // Update orbital core & hub rings
      if (!prefersReducedMotion) {
        outerRing.rotation.z = elapsed * 0.2;
        innerRing.rotation.y = -elapsed * 0.32;
        coreOcta.rotation.y = elapsed * 0.48;
        coreWire.rotation.y = -elapsed * 0.3;
        hubRings.forEach((r, idx) => {
          const s = 1 + Math.sin(elapsed * 2.2 + idx) * 0.08;
          r.scale.set(s, s, 1);
        });
      }

      // Smooth exponential camera damping toward active preset + scroll pull-in + cursor parallax
      const targetPreset =
        CAMERA_PRESETS[presetRef.current] || CAMERA_PRESETS.orbit;
      mouseCurrent.x += (mouseTarget.x - mouseCurrent.x) * damp;
      mouseCurrent.y += (mouseTarget.y - mouseCurrent.y) * damp;

      const scrollZoomZ = -scrollVal * 26;
      const scrollZoomY = -scrollVal * 12;

      const desiredX =
        targetPreset.pos.x +
        Math.sin(elapsed * 0.22) * 3.5 +
        mouseCurrent.x;
      const desiredY =
        targetPreset.pos.y +
        Math.cos(elapsed * 0.18) * 1.8 +
        mouseCurrent.y +
        scrollZoomY;
      const desiredZ = targetPreset.pos.z + scrollZoomZ;

      currentCamPos.x += (desiredX - currentCamPos.x) * damp;
      currentCamPos.y += (desiredY - currentCamPos.y) * damp;
      currentCamPos.z += (desiredZ - currentCamPos.z) * damp;

      currentLookAt.x +=
        (targetPreset.lookAt.x + mouseCurrent.x * 0.2 - currentLookAt.x) * damp;
      currentLookAt.y += (targetPreset.lookAt.y - currentLookAt.y) * damp;
      currentLookAt.z += (targetPreset.lookAt.z - currentLookAt.z) * damp;

      camera.position.copy(currentCamPos);
      camera.lookAt(currentLookAt);

      if (Math.abs(camera.fov - targetPreset.fov) > 0.05) {
        camera.fov += (targetPreset.fov - camera.fov) * damp;
        camera.updateProjectionMatrix();
      }

      // Update fleet kinematics & custom route shaders
      fleetItems.forEach((item) => {
        item.shaderMat.uniforms.uTime.value = elapsed;
        item.shaderMat.uniforms.uDrawProgress.value = introDrawProgress;

        const targetAlert =
          isDisrupted && item.isPrimaryMaritime ? 1.0 : 0.0;
        const targetBypass =
          isDisrupted && item.isBypassCorridor ? 1.0 : 0.0;

        item.shaderMat.uniforms.uAlertLevel.value +=
          (targetAlert - item.shaderMat.uniforms.uAlertLevel.value) * damp;
        item.shaderMat.uniforms.uBypassLevel.value +=
          (targetBypass - item.shaderMat.uniforms.uBypassLevel.value) * damp;

        const kin = evaluateVehicleKinematics({
          baseProgress: item.baseProgress,
          baseSpeed: prefersReducedMotion ? 0 : item.speed,
          elapsedSeconds: elapsed,
          mode: item.mode,
          isDisruptedCorridor: Boolean(item.isPrimaryMaritime),
          isBypassCorridor: Boolean(item.isBypassCorridor),
          disruptionSeverity: isDisrupted ? 0.92 : 0,
          bypassCorridorProgress: isDisrupted ? 0.95 : 0,
        });

        const pt = item.curve.getPointAt(kin.progress);
        const tangent = item.curve.getTangentAt(kin.progress).normalize();

        item.mesh.position.copy(pt);
        lookTarget.copy(pt).add(tangent);
        item.mesh.lookAt(lookTarget);
        item.mesh.rotateZ(kin.bankAngleRad);
      });

      renderer.render(scene, camera);

      // Throttled 2D Projected Telemetry Callouts (<= 10Hz)
      if (frameCount % 6 === 0 && mount) {
        const w = mount.clientWidth;
        const h = mount.clientHeight;
        const updated: ProjectedCallout[] = [];

        fleetItems
          .filter((f) => f.showCallout)
          .forEach((f) => {
            tempVec.copy(f.mesh.position);
            tempVec.y += 4.8;
            worldGroup.localToWorld(tempVec);
            tempVec.project(camera);

            const rawX = (tempVec.x * 0.5 + 0.5) * w;
            const rawY = (-(tempVec.y * 0.5) + 0.5) * h;
            const x = Math.max(w * 0.45, Math.min(w - 140, rawX));
            const y = Math.max(88, Math.min(h * 0.36, rawY));
            const visible =
              tempVec.z < 1 &&
              rawX > w * 0.42 &&
              rawX < w - 60 &&
              rawY > 70 &&
              rawY < h * 0.38;

            const status: 'NOMINAL' | 'DELAYED' | 'EXPEDITED' =
              isDisrupted && f.isPrimaryMaritime
                ? 'DELAYED'
                : isDisrupted && f.isBypassCorridor
                  ? 'EXPEDITED'
                  : 'NOMINAL';

            updated.push({
              id: f.id,
              label: f.label,
              sublabel: f.sublabel,
              mode: f.mode,
              status,
              x,
              y,
              visible,
            });
          });

        setCallouts(updated);
      }

      pacer.scheduleNext(tick);
    };

    pacer.scheduleNext(tick);

    return () => {
      pacer.dispose();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      envTexture.dispose();
      renderer.dispose();
      if (mount && renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      id="hero-3d-scene"
      className="hero-step-3d absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* Dedicated WebGL Mount Container */}
      <div ref={canvasMountRef} className="absolute inset-0 w-full h-full" />

      {/* Projected 3D Telemetry Callout Pills (No backdrop-blur over WebGL canvas) */}
      <div className="hidden md:block absolute inset-0 pointer-events-none z-10">
        {callouts.map(
          (c) =>
            c.visible && (
              <div
                key={c.id}
                style={{
                  transform: `translate3d(${Math.round(c.x)}px, ${Math.round(c.y)}px, 0)`,
                }}
                className="absolute top-0 left-0 -translate-x-1/2 -translate-y-full pb-2.5 transition-transform duration-100 ease-out"
              >
                <div
                  className={`px-3 py-1.5 rounded-xl border shadow-[0_12px_28px_rgba(16,24,32,0.14)] font-mono ${
                    c.status === 'DELAYED'
                      ? 'bg-[#101820] border-amber-400 text-white'
                      : c.status === 'EXPEDITED'
                        ? 'bg-[#101820] border-emerald-400 text-white'
                        : 'bg-white/95 border-[#D5E1E8] text-[#111827]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider whitespace-nowrap">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        c.status === 'DELAYED'
                          ? 'bg-amber-400'
                          : c.status === 'EXPEDITED'
                            ? 'bg-emerald-400'
                            : 'bg-[#294D6B]'
                      }`}
                    />
                    <span>{c.label}</span>
                  </div>
                  <div
                    className={`text-[9px] tracking-widest whitespace-nowrap ${
                      c.status === 'NOMINAL' ? 'text-[#566575]' : 'text-[#A8C2D2]'
                    }`}
                  >
                    {c.status === 'DELAYED'
                      ? 'CORRIDOR ALERT · REROUTING'
                      : c.status === 'EXPEDITED'
                        ? 'AUTONOMOUS BYPASS ACTIVE'
                        : c.sublabel}
                  </div>
                </div>
                <div className="w-px h-3 bg-[#294D6B]/55 mx-auto" />
              </div>
            )
        )}
      </div>

      {/* Soft Ice-Blue Atmospheric Vignettes so Editorial Copy on Left is Crisp */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#EAF4F8] via-[#EAF4F8]/78 to-transparent lg:w-[56%]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#EAF4F8] via-transparent to-[#EAF4F8]/45" />
    </div>
  );
};

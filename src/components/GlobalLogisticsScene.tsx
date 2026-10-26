import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  LOGISTICS_NODES,
  LOGISTICS_ROUTES,
  LOGISTICS_VEHICLES,
} from '../data/logisticsNetwork';
import {
  LogisticsNode,
  LogisticsVehicle,
  TransportMode,
} from '../types/logistics';
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

export type ScenePerspective = 'global' | 'ocean' | 'air' | 'road';

interface GlobalLogisticsSceneProps {
  activePerspective: ScenePerspective;
  onSelectEntity: (entity: LogisticsVehicle | LogisticsNode | null) => void;
  selectedEntityId?: string;
  speedMultiplier: number;
  activeFilter: TransportMode | 'all';
  disruptionActive?: boolean;
}

const PERSPECTIVES: Record<
  ScenePerspective,
  { pos: THREE.Vector3; lookAt: THREE.Vector3 }
> = {
  global: {
    pos: new THREE.Vector3(0, 74, 134),
    lookAt: new THREE.Vector3(0, 2, -6),
  },
  ocean: {
    pos: new THREE.Vector3(38, 28, 72),
    lookAt: new THREE.Vector3(24, 2, 12),
  },
  air: {
    pos: new THREE.Vector3(-18, 46, 84),
    lookAt: new THREE.Vector3(-8, 12, -16),
  },
  road: {
    pos: new THREE.Vector3(-2, 22, 14),
    lookAt: new THREE.Vector3(6, 2, -22),
  },
};

function latLngToWorld(lat: number, lng: number, y = 2.0): THREE.Vector3 {
  const x = THREE.MathUtils.clamp(lng * 0.54, -92, 92);
  const z = THREE.MathUtils.clamp(-lat * 0.68, -68, 68);
  return new THREE.Vector3(x, y, z);
}

export const GlobalLogisticsScene: React.FC<GlobalLogisticsSceneProps> = ({
  activePerspective,
  onSelectEntity,
  selectedEntityId,
  speedMultiplier,
  activeFilter,
  disruptionActive = false,
}) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const [hoveredLabel, setHoveredLabel] = useState<{
    name: string;
    detail: string;
    x: number;
    y: number;
  } | null>(null);

  const perspectiveRef = useRef<ScenePerspective>(activePerspective);
  const speedRef = useRef<number>(speedMultiplier);
  const filterRef = useRef<TransportMode | 'all'>(activeFilter);
  const selectedIdRef = useRef<string | undefined>(selectedEntityId);
  const disruptionRef = useRef<boolean>(disruptionActive);
  const onSelectRef = useRef(onSelectEntity);

  useEffect(() => {
    perspectiveRef.current = activePerspective;
  }, [activePerspective]);

  useEffect(() => {
    speedRef.current = speedMultiplier;
  }, [speedMultiplier]);

  useEffect(() => {
    filterRef.current = activeFilter;
  }, [activeFilter]);

  useEffect(() => {
    selectedIdRef.current = selectedEntityId;
  }, [selectedEntityId]);

  useEffect(() => {
    disruptionRef.current = disruptionActive;
  }, [disruptionActive]);

  useEffect(() => {
    onSelectRef.current = onSelectEntity;
  }, [onSelectEntity]);

  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const isSoftwareGl = detectSoftwareWebGL();

    const width = mount.clientWidth || 960;
    const height = mount.clientHeight || 580;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b131e, 0.0024);

    const camera = new THREE.PerspectiveCamera(40, width / height, 1, 1500);
    const currentCamPos = PERSPECTIVES.global.pos.clone();
    const currentLookAt = PERSPECTIVES.global.lookAt.clone();
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

    // Studio Warm/Cool Lighting
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x0f172a, 1.35);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.35);
    keyLight.position.set(80, 140, 90);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    rimLight.position.set(-90, 65, -75);
    scene.add(rimLight);

    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // 1. Curved Bathymetric Planetary Plinth
    const baseDiskGeo = new THREE.CylinderGeometry(118, 122, 3.4, 72);
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
    baseDisk.position.y = -2.0;
    worldGroup.add(baseDisk);

    // 2. Sculpted Continental Landmass Plates
    const continents = [
      { x: -56, z: -24, w: 46, d: 28, h: 2.2 }, // North America
      { x: 4, z: -34, w: 34, d: 22, h: 2.4 },   // Europe
      { x: 26, z: -16, w: 26, d: 20, h: 2.0 },  // MENA
      { x: 62, z: -20, w: 46, d: 30, h: 2.6 },  // East Asia
      { x: 54, z: 2, w: 26, d: 16, h: 1.9 },    // SE Asia
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

    // 3. Composite Superport & Hub Complexes (Interactive Raycast Targets)
    const interactableMeshes: THREE.Object3D[] = [];
    const nodeObjectsMap = new Map<string, THREE.Group>();

    LOGISTICS_NODES.forEach((node) => {
      const worldPos = latLngToWorld(node.lat, node.lng, 2.0);
      const height =
        node.type === 'superport'
          ? 8.8
          : node.type === 'air-cargo-hub'
            ? 10.2
            : 7.6;
      const built = createCompositeSuperportHub({
        height,
        isPrimaryGateway: node.type === 'superport',
      });
      built.group.position.copy(worldPos);
      built.group.userData = { entityType: 'node', entity: node };

      const hitSphere = new THREE.Mesh(
        new THREE.SphereGeometry(5.5, 8, 8),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hitSphere.position.y = height * 0.5;
      hitSphere.userData = { entityType: 'node', entity: node };
      built.group.add(hitSphere);
      interactableMeshes.push(hitSphere);

      worldGroup.add(built.group);
      nodeObjectsMap.set(node.id, built.group);
    });

    // 4. Custom GLSL Traveling-Pulse Routes & Curves
    const routeCurves = new Map<string, THREE.CatmullRomCurve3>();
    const routeTubeEntries: {
      routeId: string;
      mode: TransportMode;
      mesh: THREE.Mesh;
      shaderMat: RoutePulseMaterial;
    }[] = [];

    LOGISTICS_ROUTES.forEach((route) => {
      const totalPts = route.waypoints.length;
      const pts = route.waypoints.map(([lat, lng], idx) => {
        const t = totalPts > 1 ? idx / (totalPts - 1) : 0;
        const baseY =
          route.mode === 'air'
            ? 3.0 + Math.sin(t * Math.PI) * 24.0
            : route.mode === 'ocean'
              ? 1.3
              : 2.5;
        return latLngToWorld(lat, lng, baseY);
      });
      const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.25);
      routeCurves.set(route.id, curve);

      const radius =
        route.mode === 'air' ? 0.34 : route.mode === 'ocean' ? 0.44 : 0.28;
      const tubeGeo = new THREE.TubeGeometry(curve, 68, radius, 8, false);
      const baseColor =
        route.mode === 'air'
          ? 0x1e40af
          : route.mode === 'ocean'
            ? 0x294d6b
            : 0x475569;
      const pulseColor =
        route.mode === 'air'
          ? 0x7dd3fc
          : route.mode === 'ocean'
            ? 0x38bdf8
            : 0xe2e8f0;

      const shaderMat = createRoutePulseShaderMaterial({
        baseColorHex: baseColor,
        pulseColorHex: pulseColor,
        initialDrawProgress: 1.0,
        opacity: 0.9,
      });

      const tubeMesh = new THREE.Mesh(tubeGeo, shaderMat);
      worldGroup.add(tubeMesh);
      routeTubeEntries.push({
        routeId: route.id,
        mode: route.mode,
        mesh: tubeMesh,
        shaderMat,
      });
    });

    // 5. Composite 3D Fleet Vehicles (Ships, Swept-Wing Cargo Jets, Freight Trucks)
    interface ActiveVehicleEntry {
      vehicle: LogisticsVehicle;
      group: THREE.Group;
      curve: THREE.CatmullRomCurve3;
      baseProgress: number;
    }

    const activeVehicles: ActiveVehicleEntry[] = [];

    LOGISTICS_VEHICLES.forEach((vehicle) => {
      const curve = routeCurves.get(vehicle.routeId);
      if (!curve) return;

      let vGroup: THREE.Group;
      if (vehicle.mode === 'ocean') {
        vGroup = createCompositeContainerShip(0x294d6b);
        vGroup.scale.setScalar(0.86);
      } else if (vehicle.mode === 'air') {
        vGroup = createCompositeCargoAircraft(0x294d6b);
        vGroup.scale.setScalar(0.78);
      } else {
        vGroup = createCompositeFreightTruck(0x294d6b);
        vGroup.scale.setScalar(0.82);
      }

      const hitMesh = new THREE.Mesh(
        new THREE.SphereGeometry(5.2, 8, 8),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hitMesh.userData = { entityType: 'vehicle', entity: vehicle };
      vGroup.add(hitMesh);
      interactableMeshes.push(hitMesh);

      worldGroup.add(vGroup);
      activeVehicles.push({
        vehicle,
        group: vGroup,
        curve,
        baseProgress: vehicle.progress,
      });
    });

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Raycaster for Interactive Node & Vehicle Selection
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const getNormalizedPointer = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      return rect;
    };

    const handlePointerMove = (e: MouseEvent) => {
      const rect = getNormalizedPointer(e);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(interactableMeshes, false);

      if (hits.length > 0) {
        const data = hits[0].object.userData;
        if (data?.entity) {
          renderer.domElement.style.cursor = 'pointer';
          if (data.entityType === 'vehicle') {
            const v = data.entity as LogisticsVehicle;
            setHoveredLabel({
              name: v.name,
              detail: `${v.teuOrTonnage} · ${v.speedKmH} km/h`,
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
            });
          } else {
            const n = data.entity as LogisticsNode;
            setHoveredLabel({
              name: n.name,
              detail: `${n.city}, ${n.country} · ${n.activeShipments} Shipments`,
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
            });
          }
          return;
        }
      }
      renderer.domElement.style.cursor = 'grab';
      setHoveredLabel(null);
    };

    const handleClick = (e: MouseEvent) => {
      getNormalizedPointer(e);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(interactableMeshes, false);
      if (hits.length > 0) {
        const data = hits[0].object.userData;
        if (data?.entity) {
          onSelectRef.current(data.entity);
          return;
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', handlePointerMove, {
      passive: true,
    });
    renderer.domElement.addEventListener('click', handleClick);

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth || 960;
      const h = mount.clientHeight || 580;
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
      const damp = 1 - Math.exp(-4.5 * dt);

      const filter = filterRef.current;
      const isDisrupted = disruptionRef.current;
      const speedMult = prefersReducedMotion ? 0 : speedRef.current;

      planetarySurfaceMat.uniforms.uTime.value = elapsed;
      planetarySurfaceMat.uniforms.uDisruptionAlert.value +=
        ((isDisrupted ? 1.0 : 0.0) -
          planetarySurfaceMat.uniforms.uDisruptionAlert.value) *
        damp;

      // Update Route Shaders & Filter Visibility
      routeTubeEntries.forEach((rt) => {
        rt.mesh.visible = filter === 'all' || rt.mode === filter;
        rt.shaderMat.uniforms.uTime.value = elapsed * Math.max(0.5, speedMult);

        const isSuezRoute = rt.routeId === 'route-sea-sha-rtm';
        const isAirBypass =
          rt.routeId === 'route-air-nrt-fra' ||
          rt.routeId === 'route-air-dxb-ord';

        const targetAlert = isDisrupted && isSuezRoute ? 1.0 : 0.0;
        const targetBypass = isDisrupted && isAirBypass ? 1.0 : 0.0;

        rt.shaderMat.uniforms.uAlertLevel.value +=
          (targetAlert - rt.shaderMat.uniforms.uAlertLevel.value) * damp;
        rt.shaderMat.uniforms.uBypassLevel.value +=
          (targetBypass - rt.shaderMat.uniforms.uBypassLevel.value) * damp;
      });

      // Update Fleet Vehicles & Check if a Vehicle or Node is Selected for Camera Tracking
      let trackedEntityWorldPos: THREE.Vector3 | null = null;

      activeVehicles.forEach((entry) => {
        const isVisible = filter === 'all' || entry.vehicle.mode === filter;
        entry.group.visible = isVisible;
        if (!isVisible) return;

        const baseSpeed =
          entry.vehicle.mode === 'air'
            ? 0.045
            : entry.vehicle.mode === 'road'
              ? 0.032
              : 0.02;

        const kin = evaluateVehicleKinematics({
          baseProgress: entry.baseProgress,
          baseSpeed: baseSpeed * speedMult,
          elapsedSeconds: elapsed,
          mode:
            entry.vehicle.mode === 'air'
              ? 'AIR'
              : entry.vehicle.mode === 'ocean'
                ? 'OCEAN'
                : 'ROAD',
          isDisruptedCorridor: entry.vehicle.routeId === 'route-sea-sha-rtm',
          isBypassCorridor: entry.vehicle.routeId === 'route-air-nrt-fra',
          disruptionSeverity: isDisrupted ? 0.92 : 0,
          bypassCorridorProgress: isDisrupted ? 0.95 : 0,
        });

        const pt = entry.curve.getPointAt(kin.progress);
        const tan = entry.curve.getTangentAt(kin.progress).normalize();
        entry.group.position.copy(pt);
        lookTarget.copy(pt).add(tan);
        entry.group.lookAt(lookTarget);
        entry.group.rotateZ(kin.bankAngleRad);

        if (selectedIdRef.current === entry.vehicle.id) {
          trackedEntityWorldPos = pt.clone();
        }
      });

      if (!trackedEntityWorldPos && selectedIdRef.current) {
        const selectedNodeGroup = nodeObjectsMap.get(selectedIdRef.current);
        if (selectedNodeGroup) {
          trackedEntityWorldPos = selectedNodeGroup.position.clone();
        }
      }

      // Smooth Camera Choreography (Follow Selected Entity OR Active Perspective)
      const basePersp =
        PERSPECTIVES[perspectiveRef.current] || PERSPECTIVES.global;

      if (trackedEntityWorldPos) {
        const desiredCam = new THREE.Vector3(
          trackedEntityWorldPos.x + 14,
          Math.max(18, trackedEntityWorldPos.y + 20),
          trackedEntityWorldPos.z + 32
        );
        currentCamPos.lerp(desiredCam, damp);
        currentLookAt.lerp(trackedEntityWorldPos, damp);
      } else {
        const desiredX = basePersp.pos.x + Math.sin(elapsed * 0.2) * 4;
        const desiredY = basePersp.pos.y + Math.cos(elapsed * 0.16) * 2;
        const desiredZ = basePersp.pos.z;

        currentCamPos.x += (desiredX - currentCamPos.x) * damp;
        currentCamPos.y += (desiredY - currentCamPos.y) * damp;
        currentCamPos.z += (desiredZ - currentCamPos.z) * damp;
        currentLookAt.lerp(basePersp.lookAt, damp);
      }

      camera.position.copy(currentCamPos);
      camera.lookAt(currentLookAt);

      renderer.render(scene, camera);
      pacer.scheduleNext(tick);
    };

    pacer.scheduleNext(tick);

    return () => {
      pacer.dispose();
      renderer.domElement.removeEventListener('mousemove', handlePointerMove);
      renderer.domElement.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      envTexture.dispose();
      renderer.dispose();
      if (mount && renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  const selectedVehicle = LOGISTICS_VEHICLES.find(
    (v) => v.id === selectedEntityId
  );
  const selectedNode = LOGISTICS_NODES.find((n) => n.id === selectedEntityId);

  return (
    <div className="relative w-full h-[540px] sm:h-[620px] bg-[#0B131E] overflow-hidden select-none">
      {/* Dedicated WebGL Canvas Mount */}
      <div ref={canvasMountRef} className="w-full h-full" />

      {/* Hover Tooltip */}
      {hoveredLabel && (
        <div
          style={{
            transform: `translate3d(${Math.round(hoveredLabel.x + 14)}px, ${Math.round(hoveredLabel.y - 16)}px, 0)`,
          }}
          className="pointer-events-none absolute top-0 left-0 z-20 px-3.5 py-2 rounded-xl bg-[#101820] border border-[#7DD3FC]/50 text-xs text-white shadow-2xl font-mono"
        >
          <div className="font-bold text-white">{hoveredLabel.name}</div>
          <div className="text-[10px] text-[#7DD3FC]">{hoveredLabel.detail}</div>
        </div>
      )}

      {/* Selected Entity Telemetry Drawer Overlay (Right Side) */}
      {(selectedVehicle || selectedNode) && (
        <div className="absolute top-4 right-4 z-20 w-80 max-w-[calc(100%-2rem)] rounded-2xl bg-[#101820] border border-[#7DD3FC]/50 p-5 text-white shadow-2xl font-mono text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <span className="text-[10px] text-[#7DD3FC] font-bold uppercase tracking-wider">
              {selectedVehicle ? 'CAMERA LOCKED · VEHICLE' : 'CAMERA LOCKED · HUB'}
            </span>
            <button
              type="button"
              onClick={() => onSelectEntity(null)}
              className="text-[10px] text-[#A8C2D2] hover:text-white underline cursor-pointer"
            >
              Release Lock
            </button>
          </div>

          {selectedVehicle && (
            <div className="space-y-2.5">
              <div>
                <h4 className="text-base font-bold text-white font-sans">
                  {selectedVehicle.name}
                </h4>
                <p className="text-[11px] text-[#A8C2D2]">
                  {selectedVehicle.identifier} · {selectedVehicle.teuOrTonnage}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="p-2 rounded-lg bg-white/[0.04] border border-white/10">
                  <span className="text-[#A8C2D2] block">CARGO</span>
                  <span className="text-white font-bold line-clamp-1">
                    {selectedVehicle.cargoDescription}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.04] border border-white/10">
                  <span className="text-[#A8C2D2] block">VELOCITY</span>
                  <span className="text-emerald-300 font-bold">
                    {selectedVehicle.speedKmH} km/h
                  </span>
                </div>
              </div>
            </div>
          )}

          {selectedNode && (
            <div className="space-y-2.5">
              <div>
                <h4 className="text-base font-bold text-white font-sans">
                  {selectedNode.name}
                </h4>
                <p className="text-[11px] text-[#A8C2D2]">
                  {selectedNode.city}, {selectedNode.country} · {selectedNode.code}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="p-2 rounded-lg bg-white/[0.04] border border-white/10">
                  <span className="text-[#A8C2D2] block">SHIPMENTS</span>
                  <span className="text-white font-bold">
                    {selectedNode.activeShipments} Active
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.04] border border-white/10">
                  <span className="text-[#A8C2D2] block">CAPACITY SCORE</span>
                  <span className="text-emerald-300 font-bold">
                    {selectedNode.capacityScore}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom-Left Controls Legend */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none hidden sm:flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[#101820]/90 border border-white/15 font-mono text-[10px] text-[#A8C2D2]">
        <span>CLICK ANY 3D SHIP, AIRCRAFT, OR SUPERPORT TO LOCK CAMERA</span>
      </div>
    </div>
  );
};

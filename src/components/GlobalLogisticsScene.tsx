import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  LOGISTICS_NODES,
  LOGISTICS_ROUTES,
  LOGISTICS_VEHICLES,
} from '../data/logisticsNetwork';
import { LogisticsNode, LogisticsRoute, LogisticsVehicle, TransportMode } from '../types/logistics';
import {
  Ship,
  Plane,
  Truck,
  Building2,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Info,
  X,
  Play,
  Pause,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export type ScenePerspective = 'global' | 'road' | 'ocean' | 'air' | 'intelligence';

interface GlobalLogisticsSceneProps {
  activePerspective?: ScenePerspective;
  onSelectEntity?: (entity: LogisticsVehicle | LogisticsNode | null) => void;
  selectedEntityId?: string | null;
  speedMultiplier?: number;
  activeFilter?: TransportMode | 'all';
}

export const GlobalLogisticsScene: React.FC<GlobalLogisticsSceneProps> = ({
  activePerspective = 'global',
  onSelectEntity,
  selectedEntityId,
  speedMultiplier = 1,
  activeFilter = 'all',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [internalSelectedEntity, setInternalSelectedEntity] = useState<LogisticsVehicle | LogisticsNode | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  // References to keep render loop decoupled from state
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const vehicleGroupsRef = useRef<Map<string, { group: THREE.Group; vehicle: LogisticsVehicle; curve: THREE.CatmullRomCurve3 }>>(new Map());
  const nodeMeshesRef = useRef<Map<string, { mesh: THREE.Mesh; node: LogisticsNode }>>(new Map());
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 180, 260));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // Update camera target based on perspective
  useEffect(() => {
    switch (activePerspective) {
      case 'global':
        targetCamPosRef.current.set(0, 160, 260);
        targetLookAtRef.current.set(0, 0, 0);
        break;
      case 'road':
        // Zoom toward European / US road corridors
        targetCamPosRef.current.set(-50, 60, 90);
        targetLookAtRef.current.set(-30, 0, 10);
        break;
      case 'ocean':
        // Focus on oceanic shipping lanes
        targetCamPosRef.current.set(60, 75, 120);
        targetLookAtRef.current.set(20, -10, 0);
        break;
      case 'air':
        // High altitude perspective over trans-pacific & northern air arcs
        targetCamPosRef.current.set(0, 190, 140);
        targetLookAtRef.current.set(0, 20, 0);
        break;
      case 'intelligence':
        // Dynamic angle emphasizing central command hub
        targetCamPosRef.current.set(40, 120, 180);
        targetLookAtRef.current.set(0, 10, 0);
        break;
    }
  }, [activePerspective]);

  // Handle external selection sync
  useEffect(() => {
    if (!selectedEntityId) return;
    const v = LOGISTICS_VEHICLES.find((item) => item.id === selectedEntityId);
    if (v) setInternalSelectedEntity(v);
    else {
      const n = LOGISTICS_NODES.find((item) => item.id === selectedEntityId);
      if (n) setInternalSelectedEntity(n);
    }
  }, [selectedEntityId]);

  const handleSelect = useCallback(
    (entity: LogisticsVehicle | LogisticsNode | null) => {
      setInternalSelectedEntity(entity);
      if (onSelectEntity) onSelectEntity(entity);
    },
    [onSelectEntity]
  );

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Detect software WebGL to safeguard headless containers and low-end devices
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    // 2. Scene, Camera, Renderer
    const width = container.clientWidth || 1200;
    const height = container.clientHeight || 700;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x050505);
    scene.fog = new THREE.FogExp2(0x050505, 0.0022);

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000);
    camera.position.set(0, 160, 260);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 500;
    controls.minDistance = 30;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // prevent going beneath ground plane
    controls.target.set(0, 0, 0);

    // 4. Studio Environment & Lighting
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Directional Key Light
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(120, 220, 140);
    keyLight.castShadow = !isSoftwareGl;
    if (!isSoftwareGl) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 10;
      keyLight.shadow.camera.far = 600;
      keyLight.shadow.camera.left = -180;
      keyLight.shadow.camera.right = 180;
      keyLight.shadow.camera.top = 180;
      keyLight.shadow.camera.bottom = -180;
      keyLight.shadow.bias = -0.0005;
    }
    scene.add(keyLight);

    // Cool Fill Light (Cyan / Blue ambient fill)
    const hemiLight = new THREE.HemisphereLight(0xeaeaea, 0x080808, 0.85);
    scene.add(hemiLight);

    // Ground Logistics Grid Plane
    const gridHelper = new THREE.GridHelper(500, 50, 0x303030, 0x171717);
    gridHelper.position.y = -0.1;
    scene.add(gridHelper);

    // Subtle dark circular platform
    const platformGeo = new THREE.CylinderGeometry(240, 240, 2, 64);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x101010,
      roughness: 0.85,
      metalness: 0.2,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -1;
    platform.receiveShadow = !isSoftwareGl;
    scene.add(platform);

    // Lat/Lng to local coordinates converter
    const coordsMap = (lat: number, lng: number, altitude = 0) => {
      // Map global longitude (-180 to 180) and latitude (-90 to 90) onto an expansive stylized tactical terrain
      const x = (lng / 180) * 190;
      const z = -(lat / 90) * 110;
      return new THREE.Vector3(x, altitude, z);
    };

    // 5. Construct Logistics Nodes (Composite 3-5 part procedural models)
    const nodeMeshes = new Map<string, { mesh: THREE.Mesh; node: LogisticsNode }>();
    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    LOGISTICS_NODES.forEach((node) => {
      const pos = coordsMap(node.lat, node.lng, 0);

      const nGroup = new THREE.Group();
      nGroup.position.copy(pos);

      // Base pedestal
      const baseGeo = new THREE.CylinderGeometry(4.5, 5.5, 2, 16);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x303030,
        metalness: 0.8,
        roughness: 0.2,
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = 1;
      nGroup.add(baseMesh);

      // Tower / Terminal body
      const towerHeight = node.type === 'superport' ? 9 : node.type === 'air-cargo-hub' ? 12 : 7;
      const towerGeo = new THREE.BoxGeometry(3.5, towerHeight, 3.5);
      const towerMat = new THREE.MeshStandardMaterial({
        color: node.type === 'superport' ? 0x262626 : node.type === 'air-cargo-hub' ? 0x303030 : 0x222222,
        metalness: 0.5,
        roughness: 0.3,
      });
      const towerMesh = new THREE.Mesh(towerGeo, towerMat);
      towerMesh.position.y = 1 + towerHeight / 2;
      nGroup.add(towerMesh);

      // Glowing Beacon Top
      const beaconGeo = new THREE.SphereGeometry(1.6, 16, 16);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: node.status === 'strained' ? 0xbdbdbd : 0xf0f0f0,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.y = 1 + towerHeight + 1.2;
      nGroup.add(beacon);

      // Clickable proxy hit area
      const hitGeo = new THREE.SphereGeometry(7, 8, 8);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.position.y = towerHeight / 2;
      hitMesh.userData = { type: 'node', data: node };
      nGroup.add(hitMesh);

      nodeGroup.add(nGroup);
      nodeMeshes.set(node.id, { mesh: hitMesh, node });
    });
    nodeMeshesRef.current = nodeMeshes;

    // 6. Construct Multimodal Routes (Road, Ocean, Air)
    const routeCurves = new Map<string, THREE.CatmullRomCurve3>();
    const routesGroup = new THREE.Group();
    scene.add(routesGroup);

    LOGISTICS_ROUTES.forEach((route) => {
      const points: THREE.Vector3[] = [];
      route.waypoints.forEach((wp, idx) => {
        // Air routes arch higher into altitude
        let altitude = 0.5;
        if (route.mode === 'air') {
          const t = idx / (route.waypoints.length - 1);
          altitude = 18 + Math.sin(t * Math.PI) * 22; // smooth parabolic flight arc
        } else if (route.mode === 'road') {
          altitude = 0.8;
        } else if (route.mode === 'ocean') {
          altitude = 0.4;
        }
        points.push(coordsMap(wp[0], wp[1], altitude));
      });

      const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.2);
      routeCurves.set(route.id, curve);

      // Route Line Mesh
      const tubeGeo = new THREE.TubeGeometry(curve, 80, route.mode === 'air' ? 0.35 : 0.45, 6, false);
      const routeColor =
        route.mode === 'air' ? 0xffffff : route.mode === 'ocean' ? 0xbdbdbd : 0x929292;

      const tubeMat = new THREE.MeshBasicMaterial({
        color: routeColor,
        transparent: true,
        opacity: route.mode === 'air' ? 0.65 : 0.5,
        wireframe: false,
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      routesGroup.add(tubeMesh);
    });

    // 7. Construct Composite 3D Vehicle Models (Ships, Aircraft, Trucks)
    const vehicleGroups = new Map<string, { group: THREE.Group; vehicle: LogisticsVehicle; curve: THREE.CatmullRomCurve3 }>();
    const vehiclesMasterGroup = new THREE.Group();
    scene.add(vehiclesMasterGroup);

    // Helpers to build detailed composite vehicle groups:
    const buildCargoShip = (): THREE.Group => {
      const ship = new THREE.Group();
      // Hull
      const hullGeo = new THREE.BoxGeometry(4.5, 2.2, 12);
      const hullMat = new THREE.MeshStandardMaterial({ color: 0x171717, metalness: 0.8, roughness: 0.3 });
      const hull = new THREE.Mesh(hullGeo, hullMat);
      hull.position.y = 1.1;
      ship.add(hull);

      // Bow wedge
      const bowGeo = new THREE.ConeGeometry(2.2, 3.5, 4);
      bowGeo.rotateX(Math.PI / 2);
      bowGeo.rotateZ(Math.PI / 4);
      const bow = new THREE.Mesh(bowGeo, hullMat);
      bow.position.set(0, 1.1, 7);
      ship.add(bow);

      // Bridge / Superstructure
      const bridgeGeo = new THREE.BoxGeometry(3.6, 3.2, 3);
      const bridgeMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, metalness: 0.3, roughness: 0.4 });
      const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
      bridge.position.set(0, 3.5, -4);
      ship.add(bridge);

      // Container Stacks (Teal, Amber, Graphite)
      const stackColors = [0x858585, 0x9a9a9a, 0x303030, 0xffffff];
      for (let s = -2; s <= 3; s++) {
        const cGeo = new THREE.BoxGeometry(3.8, 1.4, 1.6);
        const cMat = new THREE.MeshStandardMaterial({
          color: stackColors[Math.abs(s) % stackColors.length],
          metalness: 0.6,
          roughness: 0.4,
        });
        const cMesh = new THREE.Mesh(cGeo, cMat);
        cMesh.position.set(0, 2.8, s * 1.8 - 0.5);
        ship.add(cMesh);
      }

      // Mast / Radar beacon
      const mastGeo = new THREE.CylinderGeometry(0.15, 0.2, 2);
      const mastMat = new THREE.MeshBasicMaterial({ color: 0xf0f0f0 });
      const mast = new THREE.Mesh(mastGeo, mastMat);
      mast.position.set(0, 6, -4);
      ship.add(mast);

      // Wake light line
      const wakeGeo = new THREE.PlaneGeometry(3, 8);
      wakeGeo.rotateX(-Math.PI / 2);
      const wakeMat = new THREE.MeshBasicMaterial({
        color: 0xf0f0f0,
        transparent: true,
        opacity: 0.35,
      });
      const wake = new THREE.Mesh(wakeGeo, wakeMat);
      wake.position.set(0, 0.1, -9);
      ship.add(wake);

      return ship;
    };

    const buildCargoAircraft = (): THREE.Group => {
      const plane = new THREE.Group();
      // Fuselage
      const fuseGeo = new THREE.CylinderGeometry(1.4, 1.4, 11, 16);
      fuseGeo.rotateX(Math.PI / 2);
      const fuseMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, metalness: 0.7, roughness: 0.25 });
      const fuselage = new THREE.Mesh(fuseGeo, fuseMat);
      fuselage.position.y = 1.4;
      plane.add(fuselage);

      // Nose nosecone
      const noseGeo = new THREE.ConeGeometry(1.4, 3, 16);
      noseGeo.rotateX(Math.PI / 2);
      const nose = new THREE.Mesh(noseGeo, fuseMat);
      nose.position.set(0, 1.4, 6.5);
      plane.add(nose);

      // Swept Wings
      const wingGeo = new THREE.BoxGeometry(16, 0.25, 3.2);
      const wingMat = new THREE.MeshStandardMaterial({ color: 0xcacaca, metalness: 0.6, roughness: 0.3 });
      const wings = new THREE.Mesh(wingGeo, wingMat);
      wings.position.set(0, 1.4, 0.8);
      plane.add(wings);

      // Twin Jet Engines
      const engineGeo = new THREE.CylinderGeometry(0.65, 0.65, 2.5, 12);
      engineGeo.rotateX(Math.PI / 2);
      const engineMat = new THREE.MeshStandardMaterial({ color: 0x292929, metalness: 0.8, roughness: 0.2 });
      const engineL = new THREE.Mesh(engineGeo, engineMat);
      engineL.position.set(-3.8, 0.6, 0.8);
      const engineR = new THREE.Mesh(engineGeo, engineMat);
      engineR.position.set(3.8, 0.6, 0.8);
      plane.add(engineL, engineR);

      // Vertical Tail Fin
      const tailGeo = new THREE.BoxGeometry(0.3, 3.2, 2.5);
      const tail = new THREE.Mesh(tailGeo, fuseMat);
      tail.position.set(0, 3.2, -4.5);
      plane.add(tail);

      // Wingtip beacon lights
      const lightL = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), new THREE.MeshBasicMaterial({ color: 0x9b9b9b }));
      lightL.position.set(-8, 1.4, 0.8);
      const lightR = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      lightR.position.set(8, 1.4, 0.8);
      plane.add(lightL, lightR);

      return plane;
    };

    const buildFreightTruck = (): THREE.Group => {
      const truck = new THREE.Group();
      // Cab
      const cabGeo = new THREE.BoxGeometry(2.4, 2.6, 2.8);
      const cabMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.7, roughness: 0.3 });
      const cab = new THREE.Mesh(cabGeo, cabMat);
      cab.position.set(0, 1.3, 2.8);
      truck.add(cab);

      // Windshield
      const winGeo = new THREE.BoxGeometry(2.2, 1.1, 0.8);
      const winMat = new THREE.MeshStandardMaterial({ color: 0x080808, metalness: 0.9, roughness: 0.1 });
      const win = new THREE.Mesh(winGeo, winMat);
      win.position.set(0, 1.8, 3.8);
      truck.add(win);

      // Cargo Trailer
      const trailerGeo = new THREE.BoxGeometry(2.6, 3.2, 7.5);
      const trailerMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.4, roughness: 0.5 });
      const trailer = new THREE.Mesh(trailerGeo, trailerMat);
      trailer.position.set(0, 1.9, -1.8);
      truck.add(trailer);

      // Headlight Beams
      const lightGeo = new THREE.ConeGeometry(1.2, 6, 8);
      lightGeo.rotateX(-Math.PI / 2);
      const lightMat = new THREE.MeshBasicMaterial({
        color: 0xfff7c2,
        transparent: true,
        opacity: 0.25,
      });
      const headlight = new THREE.Mesh(lightGeo, lightMat);
      headlight.position.set(0, 0.9, 6.8);
      truck.add(headlight);

      return truck;
    };

    // Instantiate vehicles
    LOGISTICS_VEHICLES.forEach((veh) => {
      const curve = routeCurves.get(veh.routeId);
      if (!curve) return;

      let vGroup: THREE.Group;
      if (veh.mode === 'ocean') {
        vGroup = buildCargoShip();
        vGroup.scale.set(0.48, 0.48, 0.48);
      } else if (veh.mode === 'air') {
        vGroup = buildCargoAircraft();
        vGroup.scale.set(0.42, 0.42, 0.42);
      } else {
        vGroup = buildFreightTruck();
        vGroup.scale.set(0.55, 0.55, 0.55);
      }

      // Hit area proxy for raycasting
      const hitBox = new THREE.Mesh(
        new THREE.SphereGeometry(6, 8, 8),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hitBox.userData = { type: 'vehicle', data: veh };
      vGroup.add(hitBox);

      vehiclesMasterGroup.add(vGroup);
      vehicleGroups.set(veh.id, { group: vGroup, vehicle: veh, curve });
    });
    vehicleGroupsRef.current = vehicleGroups;

    // 8. Raycasting interaction for mouse selection & hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      const interactiveHit = intersects.find((hit) => hit.object.userData?.type);

      if (interactiveHit) {
        container.style.cursor = 'pointer';
        const u = interactiveHit.object.userData;
        if (u.type === 'vehicle') setHoveredLabel(`${u.data.name} (${u.data.identifier})`);
        else if (u.type === 'node') setHoveredLabel(`${u.data.name} [${u.data.code}]`);
      } else {
        container.style.cursor = 'default';
        setHoveredLabel(null);
      }
    };

    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      const interactiveHit = intersects.find((hit) => hit.object.userData?.type);

      if (interactiveHit) {
        handleSelect(interactiveHit.object.userData.data);
      }
    };

    renderer.domElement.addEventListener('mousemove', onPointerMove);
    renderer.domElement.addEventListener('click', onClick);

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 10. Animation Loop (Paced loop on Software WebGL per Three.js skill)
    let animationFrameId = 0;
    const clock = new THREE.Clock();

    function renderLoop() {
      const delta = clock.getDelta();

      // Smooth camera interpolation towards target perspective
      camera.position.lerp(targetCamPosRef.current, 0.04);
      controls.target.lerp(targetLookAtRef.current, 0.04);
      controls.update();

      // Vehicle Movement Along Spline Routes
      if (isPlaying) {
        vehicleGroups.forEach(({ group, vehicle, curve }) => {
          // Progress calculation with speed multiplier
          const baseSpeed = vehicle.mode === 'air' ? 0.025 : vehicle.mode === 'road' ? 0.015 : 0.008;
          vehicle.progress = (vehicle.progress + baseSpeed * speedMultiplier * delta) % 1.0;

          // Position along Catmull-Rom curve
          const pt = curve.getPointAt(vehicle.progress);
          group.position.copy(pt);

          // Orientation along tangent
          const tangent = curve.getTangentAt(vehicle.progress).normalize();
          const targetPoint = pt.clone().add(tangent);
          group.lookAt(targetPoint);

          // Subtle flight banking for aircraft
          if (vehicle.mode === 'air') {
            group.rotateZ(Math.sin(vehicle.progress * Math.PI * 4) * 0.12);
          }
        });
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        // Paused pace on software WebGL to never starve host or Playwright
        animationFrameId = window.setTimeout(renderLoop, 50);
      } else {
        animationFrameId = requestAnimationFrame(renderLoop);
      }
    }

    renderLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', onPointerMove);
      renderer.domElement.removeEventListener('click', onClick);
      controls.dispose();
      renderer.dispose();
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [handleSelect, isPlaying, speedMultiplier]);

  return (
    <div className="relative w-full h-[620px] lg:h-[760px] bg-[#0a0f1b] overflow-hidden select-none">
      {/* Three.js Canvas Mount Ref */}
      <div ref={mountRef} className="w-full h-full" tabIndex={0} aria-label="3D Global Logistics Scene Viewport" />

      {/* Top Left: Scene Mode Indicator */}
      <div className="absolute top-5 left-5 z-20 flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#0f1626]/90 border border-white/15 backdrop-blur-md text-xs font-mono">
        <div className="w-2.5 h-2.5 rounded-full bg-[#f5f5f5]" />
        <span className="text-white/60">PERSPECTIVE:</span>
        <span className="text-white font-bold uppercase">{activePerspective} VIEW</span>
      </div>

      {/* Top Right: View Controls (Reset, Zoom, Play/Pause) */}
      <div className="absolute top-5 right-5 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2.5 rounded-xl bg-[#151e30]/90 border border-white/15 text-white/80 hover:text-white hover:bg-[#1d293d] backdrop-blur-md transition-colors"
          title={isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
          aria-label={isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
        >
          {isPlaying ? <Pause className="w-4 h-4 text-[#f5f5f5]" /> : <Play className="w-4 h-4 text-[#f5f5f5]" />}
        </button>

        <button
          type="button"
          onClick={() => {
            targetCamPosRef.current.set(0, 160, 260);
            targetLookAtRef.current.set(0, 0, 0);
          }}
          className="p-2.5 rounded-xl bg-[#151e30]/90 border border-white/15 text-white/80 hover:text-white hover:bg-[#1d293d] backdrop-blur-md transition-colors"
          title="Reset Camera View"
          aria-label="Reset Camera View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Hover tooltip */}
      {hoveredLabel && (
        <div className="absolute top-18 left-5 z-20 px-3 py-1.5 rounded-lg bg-[#151e30]/95 border border-cyan-400/50 text-xs font-mono text-white pointer-events-none shadow-xl animate-in fade-in">
          {hoveredLabel}
        </div>
      )}

      {/* Contextual Entity Inspection Panel (Collapsible bottom drawer per Three.js skill) */}
      {internalSelectedEntity && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-4 animate-in slide-in-from-bottom-4 duration-300">
          <div className="rounded-2xl bg-[#151e30]/98 border border-[#f5f5f5]/40 shadow-2xl p-5 backdrop-blur-md text-white">
            <div className="flex items-start justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1d293d] border border-white/20 flex items-center justify-center text-[#f5f5f5]">
                  {'mode' in internalSelectedEntity ? (
                    internalSelectedEntity.mode === 'ocean' ? (
                      <Ship className="w-5 h-5" />
                    ) : internalSelectedEntity.mode === 'air' ? (
                      <Plane className="w-5 h-5" />
                    ) : (
                      <Truck className="w-5 h-5" />
                    )
                  ) : (
                    <Building2 className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-white tracking-tight">
                      {internalSelectedEntity.name}
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/20 text-[#f5f5f5]">
                      {'identifier' in internalSelectedEntity
                        ? internalSelectedEntity.identifier
                        : internalSelectedEntity.code}
                    </span>
                  </div>
                  <p className="text-xs text-white/60">
                    {'cargoDescription' in internalSelectedEntity
                      ? internalSelectedEntity.cargoDescription
                      : internalSelectedEntity.details}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSelect(null)}
                className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
                aria-label="Close entity detail card"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-[#0f1626] border border-white/5">
                <span className="text-white/40 block text-[10px]">CURRENT STATUS</span>
                <span className="text-[#f5f5f5] font-bold">
                  {internalSelectedEntity.status.toUpperCase()}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0f1626] border border-white/5">
                <span className="text-white/40 block text-[10px]">
                  {'teuOrTonnage' in internalSelectedEntity ? 'CAPACITY / TONNAGE' : 'CAPACITY RATING'}
                </span>
                <span className="text-white font-medium">
                  {'teuOrTonnage' in internalSelectedEntity
                    ? internalSelectedEntity.teuOrTonnage
                    : `${internalSelectedEntity.capacityScore}% RATED`}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0f1626] border border-white/5">
                <span className="text-white/40 block text-[10px]">
                  {'etaMinutes' in internalSelectedEntity ? 'PROJECTED ETA' : 'ACTIVE SHIPMENTS'}
                </span>
                <span className="text-[#f5f5f5] font-medium">
                  {'etaMinutes' in internalSelectedEntity
                    ? `${Math.floor(internalSelectedEntity.etaMinutes / 60)}h ${internalSelectedEntity.etaMinutes % 60}m`
                    : `${internalSelectedEntity.activeShipments} SHIPMENTS`}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0f1626] border border-white/5">
                <span className="text-white/40 block text-[10px]">COLD-CHAIN / SENSORS</span>
                <span className="text-white/80">
                  {'tempControlled' in internalSelectedEntity
                    ? internalSelectedEntity.tempControlled
                      ? 'TELEMETRY ACTIVE'
                      : 'DRY BULK'
                    : 'AUTOMATED BERTH'}
                </span>
              </div>
            </div>

            {/* Simulated Data Disclaimer Notice */}
            <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-white/40">
              <span>ORION-9 MULTIMODAL SIMULATION TELEMETRY</span>
              <span className="text-[#f5f5f5]">LIVE DIGITAL TWIN</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Floating Legend (Restrained, anti-slop) */}
      <div className="absolute bottom-5 left-5 z-20 hidden md:flex items-center gap-4 px-4 py-2 rounded-xl bg-[#0f1626]/80 border border-white/10 backdrop-blur-md text-xs font-mono text-white/60">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#b8b8b8]" />
          <span>Ocean Freight</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#f5f5f5]" />
          <span>Air Cargo Arcs</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#f5f5f5]" />
          <span>Road Freight</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#d4d4d4]" />
          <span>Logistics Hubs</span>
        </div>
      </div>
    </div>
  );
};

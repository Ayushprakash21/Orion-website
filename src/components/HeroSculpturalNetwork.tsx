import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  detectSoftwareWebGL,
  createCompositeContainerShip,
  createCompositeCargoAircraft,
  createCompositeSuperportHub,
  createCompositeFreightTruck,
} from '../utils/three-logistics-craft';
import { Radio, Ship, Plane, Layers, Sparkles } from 'lucide-react';

export type CameraViewPreset = 'overview' | 'maritime' | 'airbridge';

interface HeroSculpturalNetworkProps {
  onPresetChange?: (preset: CameraViewPreset) => void;
}

export const HeroSculpturalNetwork: React.FC<HeroSculpturalNetworkProps> = ({
  onPresetChange,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activePreset, setActivePreset] = useState<CameraViewPreset>('overview');
  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [nodeMetric, setNodeMetric] = useState<string>('Live AIS/ADS-B Telemetry');

  const animationFrameRef = useRef<number | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(24, 28, 48));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const currentLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const CAM_PRESETS: Record<
    CameraViewPreset,
    { pos: THREE.Vector3; lookAt: THREE.Vector3; metric: string }
  > = {
    overview: {
      pos: new THREE.Vector3(26, 32, 50),
      lookAt: new THREE.Vector3(0, 2, 0),
      metric: 'Global Corridor Mesh · 142 Nodes Active',
    },
    maritime: {
      pos: new THREE.Vector3(12, 14, 28),
      lookAt: new THREE.Vector3(-6, 2, 6),
      metric: 'Shanghai Gateway Berth 04 · AIS Locked',
    },
    airbridge: {
      pos: new THREE.Vector3(8, 26, 34),
      lookAt: new THREE.Vector3(14, 12, -4),
      metric: 'Flight OA-804 Corridor · ADS-B Synchronized',
    },
  };

  const setPreset = useCallback(
    (preset: CameraViewPreset) => {
      setActivePreset(preset);
      const target = CAM_PRESETS[preset];
      targetCamPosRef.current.copy(target.pos);
      targetLookAtRef.current.copy(target.lookAt);
      setNodeMetric(target.metric);
      onPresetChange?.(preset);
    },
    [onPresetChange]
  );

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Detect if WebGL is supported
    try {
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
      return;
    }

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 520;

    // 1. Scene setup with soft porcelain/ice-blue atmosphere
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = null; // transparent to inherit soft card backdrop
    scene.fog = new THREE.FogExp2(0xeaf4f8, 0.009);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 500);
    camera.position.copy(CAM_PRESETS.overview.pos);
    cameraRef.current = camera;
    currentLookAtRef.current.copy(CAM_PRESETS.overview.lookAt);
    camera.lookAt(currentLookAtRef.current);

    // 3. Renderer with high DPR handling
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      rendererRef.current = renderer;
    } catch {
      setWebglSupported(false);
      return;
    }

    // 4. Studio Lighting tailored for clean, restrained graphite & steel-blue models
    const ambientLight = new THREE.AmbientLight(0xf0f7fb, 1.4);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    mainKeyLight.position.set(30, 45, 30);
    scene.add(mainKeyLight);

    const fillLight = new THREE.DirectionalLight(0xc9e2f2, 1.2);
    fillLight.position.set(-25, 20, -15);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 0.8);
    rimLight.position.set(0, 30, -35);
    scene.add(rimLight);

    // 5. Minimalist Sculptural Pedestal / Surface
    const pedestalGroup = new THREE.Group();
    scene.add(pedestalGroup);

    // Primary circular platform disc
    const platformGeo = new THREE.CylinderGeometry(36, 38, 1.5, 64);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0xf3f8fb,
      roughness: 0.35,
      metalness: 0.08,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -0.75;
    pedestalGroup.add(platform);

    // Outer subtle ring
    const ringGeo = new THREE.RingGeometry(36.2, 36.8, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xc2d9e7,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    pedestalGroup.add(ring);

    // Concentric coordinate grid lines on the platform
    const innerRingGeo = new THREE.RingGeometry(24, 24.3, 64);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0xd7e7f1,
      side: THREE.DoubleSide,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = 0.03;
    pedestalGroup.add(innerRing);

    // 6. Sculptural Models: Port Terminal, Container Vessel, Aircraft, Logistics Hub
    // Port Terminal (Left / Harbor side)
    const portHub = createCompositeSuperportHub({ height: 3.5, isPrimaryGateway: true });
    portHub.group.position.set(-18, 0, 4);
    portHub.group.scale.set(0.65, 0.65, 0.65);
    portHub.group.rotation.y = Math.PI / 6;
    pedestalGroup.add(portHub.group);

    // Container Vessel (Moored near port / cruising into channel)
    const ship = createCompositeContainerShip(0x294d6b);
    ship.position.set(-6, 0.3, 14);
    ship.scale.set(0.72, 0.72, 0.72);
    ship.rotation.y = -Math.PI / 4;
    pedestalGroup.add(ship);

    // Logistics & Intermodal Fulfillment Hub (Right / Inland side)
    const inlandHub = createCompositeSuperportHub({ height: 2.8, isPrimaryGateway: false });
    inlandHub.group.position.set(16, 0, -8);
    inlandHub.group.scale.set(0.55, 0.55, 0.55);
    inlandHub.group.rotation.y = -Math.PI / 3;
    pedestalGroup.add(inlandHub.group);

    // Delivery Fleet Truck near Inland Hub
    const truck = createCompositeFreightTruck(0x294d6b);
    truck.position.set(12, 0.2, 6);
    truck.scale.set(0.75, 0.75, 0.75);
    truck.rotation.y = Math.PI / 2.5;
    pedestalGroup.add(truck);

    // Cargo Aircraft (Cruising on geodesic climb)
    const aircraft = createCompositeCargoAircraft(0x294d6b);
    aircraft.position.set(6, 15, -2);
    aircraft.scale.set(0.7, 0.7, 0.7);
    aircraft.rotation.y = Math.PI / 3;
    aircraft.rotation.z = -0.15;
    aircraft.rotation.x = 0.12;
    pedestalGroup.add(aircraft);

    // 7. Signature Continuous Animated Spline Route
    // Connecting Port -> Ship -> Flight Arc -> Inland Hub -> Delivery Fleet
    const routePoints = [
      new THREE.Vector3(-18, 1.2, 4), // Port Terminal
      new THREE.Vector3(-6, 0.8, 14), // Container Ship
      new THREE.Vector3(2, 6, 8),     // Coastal Transition
      new THREE.Vector3(6, 15, -2),   // Cargo Aircraft Flight Waypoint
      new THREE.Vector3(12, 8, -6),   // Descent Corridor
      new THREE.Vector3(16, 1.2, -8), // Intermodal Hub
      new THREE.Vector3(12, 0.6, 6),  // Inland Freight Fleet
    ];

    const curve = new THREE.CatmullRomCurve3(routePoints);
    curve.curveType = 'catmullrom';
    curve.tension = 0.45;

    // Tube mesh for the route
    const tubeGeo = new THREE.TubeGeometry(curve, 100, 0.22, 10, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x294d6b,
      roughness: 0.2,
      metalness: 0.3,
      emissive: 0x1d364b,
      emissiveIntensity: 0.4,
    });
    const routeTube = new THREE.Mesh(tubeGeo, tubeMat);
    pedestalGroup.add(routeTube);

    // Glowing traveling pulses along the route
    const pulseCount = 3;
    const pulseMeshes: THREE.Mesh[] = [];
    const pulseGeo = new THREE.SphereGeometry(0.55, 16, 16);
    const pulseMat = new THREE.MeshBasicMaterial({
      color: 0x58a6ff,
      transparent: true,
      opacity: 0.95,
    });

    for (let i = 0; i < pulseCount; i++) {
      const pulse = new THREE.Mesh(pulseGeo, pulseMat);
      pedestalGroup.add(pulse);
      pulseMeshes.push(pulse);
    }

    // Secondary subtle halo line
    const routeLineGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(120));
    const routeLineMat = new THREE.LineBasicMaterial({
      color: 0xa8c2d2,
      transparent: true,
      opacity: 0.6,
      linewidth: 1,
    });
    const routeLine = new THREE.Line(routeLineGeo, routeLineMat);
    pedestalGroup.add(routeLine);

    // 8. Animation & Render Loop
    let clock = new THREE.Clock();
    let isDisposed = false;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mousePosRef.current = { x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) };
    };

    container.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      if (isDisposed) return;
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera interpolation toward target preset + subtle mouse parallax
      const parallaxX = mousePosRef.current.x * 2.5;
      const parallaxY = mousePosRef.current.y * 1.8;

      camera.position.x += (targetCamPosRef.current.x + parallaxX - camera.position.x) * 0.045;
      camera.position.y += (targetCamPosRef.current.y + parallaxY - camera.position.y) * 0.045;
      camera.position.z += (targetCamPosRef.current.z - camera.position.z) * 0.045;

      currentLookAtRef.current.x +=
        (targetLookAtRef.current.x - currentLookAtRef.current.x) * 0.05;
      currentLookAtRef.current.y +=
        (targetLookAtRef.current.y - currentLookAtRef.current.y) * 0.05;
      currentLookAtRef.current.z +=
        (targetLookAtRef.current.z - currentLookAtRef.current.z) * 0.05;

      camera.lookAt(currentLookAtRef.current);

      // Subtle gentle rotation of the whole sculpture
      pedestalGroup.rotation.y = Math.sin(elapsedTime * 0.12) * 0.08;

      // Gentle aircraft bobbing
      aircraft.position.y = 15 + Math.sin(elapsedTime * 1.4) * 0.6;
      aircraft.rotation.z = -0.15 + Math.sin(elapsedTime * 1.1) * 0.04;

      // Gentle vessel water buoyancy
      ship.position.y = 0.3 + Math.sin(elapsedTime * 1.2) * 0.15;
      ship.rotation.x = Math.sin(elapsedTime * 0.9) * 0.015;

      // Update traveling route pulses
      pulseMeshes.forEach((pulse, idx) => {
        const offset = (elapsedTime * 0.18 + idx / pulseCount) % 1;
        const pt = curve.getPointAt(offset);
        pulse.position.copy(pt);
      });

      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // 9. Resize Handling
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isDisposed = true;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      container.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      // Clean disposal
      try {
        renderer.dispose();
        platformGeo.dispose();
        platformMat.dispose();
        ringGeo.dispose();
        ringMat.dispose();
        tubeGeo.dispose();
        tubeMat.dispose();
        pulseGeo.dispose();
        pulseMat.dispose();
        routeLineGeo.dispose();
        routeLineMat.dispose();
      } catch {
        // Safe disposal fallback
      }
    };
  }, [setPreset]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        mousePosRef.current = { x: 0, y: 0 };
      }}
      className="relative w-full h-[460px] sm:h-[520px] lg:h-[580px] rounded-3xl bg-gradient-to-b from-white/90 via-[#F3F8FB]/80 to-[#EAF4F8]/90 border border-[#D5E1E8] shadow-[0_20px_50px_rgba(20,40,65,0.06)] overflow-hidden flex flex-col justify-between p-4 sm:p-6 select-none"
    >
      {/* Top Telemetry Header Pill */}
      <div className="relative z-10 flex items-center justify-between gap-3 flex-wrap">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-[#D5E1E8] shadow-xs text-[11px] font-mono text-[#294D6B]">
          <span className="w-2 h-2 rounded-full bg-[#294D6B] animate-pulse" />
          <span className="font-semibold text-[#111827]">ORION-9 NETWORK TWIN</span>
          <span className="text-[#D5E1E8]">|</span>
          <span className="text-[#566575] hidden sm:inline">{nodeMetric}</span>
        </div>

        {/* Camera Preset Switchers */}
        <div className="inline-flex items-center p-1 rounded-full bg-white/90 border border-[#D5E1E8] shadow-xs gap-1">
          <button
            type="button"
            onClick={() => setPreset('overview')}
            className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activePreset === 'overview'
                ? 'bg-[#101820] text-white shadow-xs'
                : 'text-[#566575] hover:text-[#111827]'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Overview</span>
          </button>
          <button
            type="button"
            onClick={() => setPreset('maritime')}
            className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activePreset === 'maritime'
                ? 'bg-[#101820] text-white shadow-xs'
                : 'text-[#566575] hover:text-[#111827]'
            }`}
          >
            <Ship className="w-3 h-3" />
            <span>Maritime</span>
          </button>
          <button
            type="button"
            onClick={() => setPreset('airbridge')}
            className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activePreset === 'airbridge'
                ? 'bg-[#101820] text-white shadow-xs'
                : 'text-[#566575] hover:text-[#111827]'
            }`}
          >
            <Plane className="w-3 h-3" />
            <span>Air Corridor</span>
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-0"
      />

      {/* Graceful Fallback if WebGL is disabled or unsupported */}
      {!webglSupported && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-white/80 z-0">
          <div className="w-16 h-16 rounded-2xl bg-[#EAF4F8] flex items-center justify-center text-[#294D6B] mb-4">
            <Radio className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-[#111827] mb-1">
            Global Logistics Network Digital Twin
          </h4>
          <p className="text-xs text-[#566575] max-w-sm">
            Interactive 3D model active on WebGL-supported devices. Tracking live ocean
            vessels, geodesic air corridors, and synchronized container terminals.
          </p>
        </div>
      )}

      {/* Bottom Architectural Callouts */}
      <div className="relative z-10 flex items-end justify-between gap-4 pointer-events-none">
        <div className="hidden sm:flex flex-col gap-1 text-[11px] font-mono text-[#566575] bg-white/90 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-[#D5E1E8] shadow-xs">
          <span className="font-semibold text-[#111827]">SYNCHRONIZED INFRASTRUCTURE</span>
          <span>Shanghai Ocean Port · Frankfurt Intermodal Rail · Dubai Air Gateway</span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#294D6B] bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-full border border-[#D5E1E8] shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#294D6B]" />
          <span>Interactive 3D Stage</span>
        </div>
      </div>
    </div>
  );
};

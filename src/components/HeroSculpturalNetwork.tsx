import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  createCompositeContainerShip,
  createCompositeCargoAircraft,
  createCompositeSuperportHub,
  createCompositeFreightTruck,
} from '../utils/three-logistics-craft';
import { Ship, Plane, Compass, Sparkles } from 'lucide-react';

export type CameraViewPreset = 'overview' | 'maritime' | 'airbridge';

export const HeroSculpturalNetwork: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activePreset, setActivePreset] = useState<CameraViewPreset>('overview');
  const [webglSupported, setWebglSupported] = useState<boolean>(true);

  const animationFrameRef = useRef<number | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(26, 30, 48));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 2, 0));
  const currentLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 2, 0));
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const CAM_PRESETS: Record<
    CameraViewPreset,
    { pos: THREE.Vector3; lookAt: THREE.Vector3 }
  > = {
    overview: {
      pos: new THREE.Vector3(26, 30, 48),
      lookAt: new THREE.Vector3(0, 2, 0),
    },
    maritime: {
      pos: new THREE.Vector3(10, 14, 26),
      lookAt: new THREE.Vector3(-6, 2, 8),
    },
    airbridge: {
      pos: new THREE.Vector3(8, 24, 32),
      lookAt: new THREE.Vector3(12, 12, -2),
    },
  };

  const setPreset = useCallback((preset: CameraViewPreset) => {
    setActivePreset(preset);
    const target = CAM_PRESETS[preset];
    targetCamPosRef.current.copy(target.pos);
    targetLookAtRef.current.copy(target.lookAt);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

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

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = null;
    scene.fog = new THREE.FogExp2(0xeaf4f8, 0.008);

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 500);
    camera.position.copy(CAM_PRESETS.overview.pos);
    cameraRef.current = camera;
    currentLookAtRef.current.copy(CAM_PRESETS.overview.lookAt);
    camera.lookAt(currentLookAtRef.current);

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

    // Soft Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xf0f7fb, 1.5);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    mainKeyLight.position.set(28, 42, 28);
    scene.add(mainKeyLight);

    const fillLight = new THREE.DirectionalLight(0xd5e6f2, 1.1);
    fillLight.position.set(-24, 18, -14);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xa5d4f2, 0.75);
    rimLight.position.set(0, 28, -32);
    scene.add(rimLight);

    // Sculptural Pedestal Platform
    const pedestalGroup = new THREE.Group();
    scene.add(pedestalGroup);

    const platformGeo = new THREE.CylinderGeometry(34, 36, 1.4, 64);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0xf5fafc,
      roughness: 0.35,
      metalness: 0.06,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -0.7;
    pedestalGroup.add(platform);

    const ringGeo = new THREE.RingGeometry(34.2, 34.7, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xc8dce8,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    pedestalGroup.add(ring);

    // Architectural Models
    const portHub = createCompositeSuperportHub({ height: 3.4, isPrimaryGateway: true });
    portHub.group.position.set(-16, 0, 4);
    portHub.group.scale.set(0.62, 0.62, 0.62);
    portHub.group.rotation.y = Math.PI / 6;
    pedestalGroup.add(portHub.group);

    const ship = createCompositeContainerShip(0x294d6b);
    ship.position.set(-5, 0.3, 13);
    ship.scale.set(0.7, 0.7, 0.7);
    ship.rotation.y = -Math.PI / 4;
    pedestalGroup.add(ship);

    const inlandHub = createCompositeSuperportHub({ height: 2.6, isPrimaryGateway: false });
    inlandHub.group.position.set(15, 0, -7);
    inlandHub.group.scale.set(0.52, 0.52, 0.52);
    inlandHub.group.rotation.y = -Math.PI / 3;
    pedestalGroup.add(inlandHub.group);

    const truck = createCompositeFreightTruck(0x294d6b);
    truck.position.set(11, 0.2, 6);
    truck.scale.set(0.72, 0.72, 0.72);
    truck.rotation.y = Math.PI / 2.5;
    pedestalGroup.add(truck);

    const aircraft = createCompositeCargoAircraft(0x294d6b);
    aircraft.position.set(6, 14, -2);
    aircraft.scale.set(0.68, 0.68, 0.68);
    aircraft.rotation.y = Math.PI / 3;
    aircraft.rotation.z = -0.12;
    pedestalGroup.add(aircraft);

    // Continuous Animated Route
    const routePoints = [
      new THREE.Vector3(-16, 1.2, 4),
      new THREE.Vector3(-5, 0.8, 13),
      new THREE.Vector3(2, 5, 8),
      new THREE.Vector3(6, 14, -2),
      new THREE.Vector3(12, 7, -5),
      new THREE.Vector3(15, 1.2, -7),
      new THREE.Vector3(11, 0.6, 6),
    ];

    const curve = new THREE.CatmullRomCurve3(routePoints);
    curve.curveType = 'catmullrom';
    curve.tension = 0.45;

    const tubeGeo = new THREE.TubeGeometry(curve, 100, 0.2, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x294d6b,
      roughness: 0.25,
      metalness: 0.3,
      emissive: 0x1d364b,
      emissiveIntensity: 0.35,
    });
    const routeTube = new THREE.Mesh(tubeGeo, tubeMat);
    pedestalGroup.add(routeTube);

    const pulseCount = 3;
    const pulseMeshes: THREE.Mesh[] = [];
    const pulseGeo = new THREE.SphereGeometry(0.5, 16, 16);
    const pulseMat = new THREE.MeshBasicMaterial({
      color: 0x4f96d6,
      transparent: true,
      opacity: 0.95,
    });

    for (let i = 0; i < pulseCount; i++) {
      const pulse = new THREE.Mesh(pulseGeo, pulseMat);
      pedestalGroup.add(pulse);
      pulseMeshes.push(pulse);
    }

    let isDisposed = false;
    let animClock = new THREE.Clock();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mousePosRef.current = { x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) };
    };

    container.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      if (isDisposed) return;
      const elapsedTime = animClock.getElapsedTime();

      const parallaxX = mousePosRef.current.x * 2.2;
      const parallaxY = mousePosRef.current.y * 1.5;

      camera.position.x += (targetCamPosRef.current.x + parallaxX - camera.position.x) * 0.045;
      camera.position.y += (targetCamPosRef.current.y + parallaxY - camera.position.y) * 0.045;
      camera.position.z += (targetCamPosRef.current.z - camera.position.z) * 0.045;

      currentLookAtRef.current.x += (targetLookAtRef.current.x - currentLookAtRef.current.x) * 0.05;
      currentLookAtRef.current.y += (targetLookAtRef.current.y - currentLookAtRef.current.y) * 0.05;
      currentLookAtRef.current.z += (targetLookAtRef.current.z - currentLookAtRef.current.z) * 0.05;

      camera.lookAt(currentLookAtRef.current);

      pedestalGroup.rotation.y = Math.sin(elapsedTime * 0.1) * 0.06;
      aircraft.position.y = 14 + Math.sin(elapsedTime * 1.3) * 0.45;
      ship.position.y = 0.3 + Math.sin(elapsedTime * 1.1) * 0.12;

      pulseMeshes.forEach((pulse, idx) => {
        const offset = (elapsedTime * 0.16 + idx / pulseCount) % 1;
        pulse.position.copy(curve.getPointAt(offset));
      });

      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

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
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      container.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
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
      } catch {}
    };
  }, [setPreset]);

  return (
    <div
      ref={containerRef}
      onMouseLeave={() => {
        mousePosRef.current = { x: 0, y: 0 };
      }}
      className="relative w-full h-[460px] sm:h-[520px] lg:h-[560px] rounded-3xl bg-gradient-to-b from-white/95 via-[#F4F9FC]/90 to-[#EAF4F8]/95 border border-[#D5E1E8] shadow-[0_20px_50px_rgba(20,40,65,0.06)] overflow-hidden flex flex-col justify-between p-5 select-none"
    >
      {/* Discreet Camera Controller */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="text-xs font-semibold text-[#111827] tracking-tight">
          Physical Network Model
        </span>

        <div className="inline-flex items-center p-1 rounded-full bg-white/90 border border-[#D5E1E8] shadow-xs gap-1">
          <button
            type="button"
            onClick={() => setPreset('overview')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activePreset === 'overview'
                ? 'bg-[#111827] text-white shadow-xs'
                : 'text-[#4A5568] hover:text-[#111827]'
            }`}
          >
            <Compass className="w-3 h-3" />
            <span>Overview</span>
          </button>
          <button
            type="button"
            onClick={() => setPreset('maritime')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activePreset === 'maritime'
                ? 'bg-[#111827] text-white shadow-xs'
                : 'text-[#4A5568] hover:text-[#111827]'
            }`}
          >
            <Ship className="w-3 h-3" />
            <span>Ocean</span>
          </button>
          <button
            type="button"
            onClick={() => setPreset('airbridge')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activePreset === 'airbridge'
                ? 'bg-[#111827] text-white shadow-xs'
                : 'text-[#4A5568] hover:text-[#111827]'
            }`}
          >
            <Plane className="w-3 h-3" />
            <span>Air Corridor</span>
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing" />

      {/* Fallback if WebGL unavailable */}
      {!webglSupported && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-white/90 z-0">
          <p className="text-sm font-semibold text-[#111827] mb-1">Interactive 3D Network Twin</p>
          <p className="text-xs text-[#566575] max-w-sm">
            Visual model active on WebGL-supported devices. Tracking ocean vessels, air cargo arcs, and container terminals.
          </p>
        </div>
      )}

      {/* Subtle Caption */}
      <div className="relative z-10 flex items-center justify-between text-xs text-[#566575]">
        <span>Shanghai Gateway · Dubai Air Corridor · Frankfurt Intermodal</span>
        <span className="flex items-center gap-1 text-[#294D6B]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Scene</span>
        </span>
      </div>
    </div>
  );
};

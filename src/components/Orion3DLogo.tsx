import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import type { HeroIntroSequenceState } from '../utils/cinematic-choreography';

export interface Orion3DLogoProps {
  introState?: HeroIntroSequenceState;
  className?: string;
  style?: React.CSSProperties;
  enablePointerInteraction?: boolean;
}

// Master authoritative SVG paths from Orion-9 brand identity (viewBox 0 0 1000 930)
const SVG_PATH_FACET1_UNDERBRIDGE =
  'M 232 536 L 352 608 C 424 584, 476 502, 534 402 C 588 308, 636 266, 706 266 C 752 266, 786 292, 796 334 L 866 306 C 842 226, 774 182, 686 182 C 592 182, 526 264, 464 368 C 412 456, 368 524, 304 536 Z';

const SVG_PATH_FACET1_BLUE_CHANNEL =
  'M 294 532 C 362 522, 412 454, 466 364 C 520 274, 574 222, 642 204 L 668 264 C 608 278, 562 326, 512 412 C 460 502, 408 572, 344 598 Z';

const SVG_PATH_FACET2_RIGHT_NINE =
  'M 654 184 C 786 176, 882 264, 882 382 C 882 454, 836 518, 702 654 L 546 654 L 748 456 C 792 412, 800 348, 768 302 C 738 262, 680 256, 622 284 L 574 226 C 600 198, 626 186, 654 184 Z';

const SVG_PATH_FACET3_LEFT_FOLD =
  'M 106 404 C 106 528, 198 622, 318 622 C 344 622, 368 616, 392 606 L 266 532 C 218 512, 192 464, 192 404 Z';

const SVG_PATH_FACET3_INNER_BLUE =
  'M 192 404 C 192 322, 248 268, 318 268 C 362 268, 404 298, 448 352 L 422 392 C 384 344, 348 312, 304 312 C 248 312, 212 354, 212 414 C 212 468, 244 512, 294 532 L 266 532 C 218 512, 192 464, 192 404 Z';

const SVG_PATH_FACET4_INNER_WALL =
  'M 308 266 C 378 266, 436 334, 508 424 C 578 512, 636 566, 712 562 C 774 558, 824 514, 846 452 L 778 426 C 760 472, 724 496, 680 494 C 624 492, 574 438, 506 352 C 436 264, 380 218, 308 218 Z';

const SVG_PATH_FACET4_FOREGROUND_RIBBON =
  'M 106 408 C 106 280, 196 182, 314 182 C 412 182, 478 266, 554 362 C 624 450, 674 496, 734 492 C 778 488, 812 454, 826 404 L 764 478 C 734 514, 688 530, 638 524 C 572 516, 516 452, 448 364 C 386 284, 344 252, 292 252 C 224 252, 182 312, 182 396 C 182 458, 216 508, 266 532 L 154 532 C 122 496, 106 454, 106 408 Z';

// Visual center of the SVG emblem (used to center all geometries around (0, 0, 0))
const EMBLEM_CENTER_X = 494;
const EMBLEM_CENTER_Y = 418;

/**
 * Helper to check WebGL capability
 */
function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    );
  } catch {
    return false;
  }
}

/**
 * Creates soft contact shadow texture (radial gradient with no dark blob)
 */
function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 256, 128);
    const grad = ctx.createRadialGradient(128, 64, 10, 128, 64, 110);
    grad.addColorStop(0, 'rgba(14, 28, 48, 0.28)');
    grad.addColorStop(0.35, 'rgba(14, 28, 48, 0.16)');
    grad.addColorStop(0.7, 'rgba(14, 28, 48, 0.05)');
    grad.addColorStop(1, 'rgba(14, 28, 48, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(128, 64, 120, 56, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Creates 4-pointed starburst shape in 2D
 */
function createStarburstShape(): THREE.Shape {
  const shape = new THREE.Shape();
  // Centered 4-pointed star
  const outerR = 36;
  const innerR = 7;
  for (let i = 0; i < 8; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / 4 - Math.PI / 2;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  }
  shape.closePath();
  return shape;
}

/**
 * Orion3DLogo — Authoritative Three.js 3D Emblem
 * Renders the Orion-9 Infinity-9 emblem as a precision-engineered physical 3D object:
 * - Extruded dimensional geometry with beveled chamfers
 * - Genuine z-depth separation: foreground silver ribbon clearly crossing over the underbridge
 * - Premium metallic physical materials: polished chrome, steel-blue, electric cyan
 * - Studio environment reflections and cinematic key, fill, and rim lights
 * - Subtle, restrained contact shadow (no dark obsidian blob)
 * - Smooth pointer parallax tilt with resting return damping
 * - Full prefers-reduced-motion support and graceful 2D vector fallback
 */
export const Orion3DLogo: React.FC<Orion3DLogoProps> = ({
  introState,
  className = '',
  style,
  enablePointerInteraction = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);

  // References for live interaction state across animation loop
  const interactionRef = useRef({
    targetRotX: Math.PI,
    targetRotY: 0,
    targetRotZ: 0,
    currentRotX: Math.PI,
    currentRotY: 0,
    currentRotZ: 0,
    isHovered: false,
    reducedMotion: false,
  });

  // Track introState dynamically in animation loop
  const introStateRef = useRef<HeroIntroSequenceState | undefined>(introState);
  useEffect(() => {
    introStateRef.current = introState;
  }, [introState]);

  useEffect(() => {
    if (!isWebGLAvailable()) {
      setWebglSupported(false);
      return;
    }

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    interactionRef.current.reducedMotion = mediaQuery.matches;
    const onMotionPreferenceChange = (e: MediaQueryListEvent) => {
      interactionRef.current.reducedMotion = e.matches;
    };
    mediaQuery.addEventListener('change', onMotionPreferenceChange);

    // Initial sizing
    let width = container.clientWidth || 300;
    let height = container.clientHeight || 260;

    // Scene & Camera setup
    const scene = new THREE.Scene();

    // Perspective camera with natural field of view
    const camera = new THREE.PerspectiveCamera(36, width / height, 1, 3000);
    camera.position.set(0, 0, 1180);
    camera.lookAt(0, 0, 0);

    // Renderer
    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    } catch {
      setWebglSupported(false);
      return;
    }

    // High Dynamic Range Studio Environment Generator
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const envScene = new THREE.Scene();
    // Radiant studio dome ensuring bright, realistic reflections across all metallic surfaces
    const domeGeometry = new THREE.SphereGeometry(120, 32, 16);
    const domeMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0xf6faff),
      side: THREE.BackSide,
    });
    envScene.add(new THREE.Mesh(domeGeometry, domeMaterial));

    // Key light reflection highlight panel
    const keyReflectionSphere = new THREE.Mesh(
      new THREE.SphereGeometry(24, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    keyReflectionSphere.position.set(40, 60, 50);
    envScene.add(keyReflectionSphere);

    // Soft sky / fill reflection highlight panel
    const fillReflectionSphere = new THREE.Mesh(
      new THREE.SphereGeometry(30, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xd8edff })
    );
    fillReflectionSphere.position.set(-50, -15, 40);
    envScene.add(fillReflectionSphere);

    // Vivid cyan rim reflection highlight panel
    const rimReflectionSphere = new THREE.Mesh(
      new THREE.SphereGeometry(28, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x00e5ff })
    );
    rimReflectionSphere.position.set(45, -50, -40);
    envScene.add(rimReflectionSphere);

    const envRenderTarget = pmremGenerator.fromScene(envScene, 0.04);
    scene.environment = envRenderTarget.texture;

    // Studio Directional Lights
    // 1. Soft Warm-White Key Light
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(260, 360, 480);
    scene.add(keyLight);

    // 2. Cool Ambient Fill Light
    const fillLight = new THREE.DirectionalLight(0xb2d7fa, 1.2);
    fillLight.position.set(-300, -140, 320);
    scene.add(fillLight);

    // 3. Crisp Electric-Cyan Rim Light
    const rimLight = new THREE.DirectionalLight(0x00e1ff, 2.0);
    rimLight.position.set(340, -260, -180);
    scene.add(rimLight);

    // 4. Studio Hemisphere Light for realistic top/bottom radiant contrast
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xa8ccee, 1.4);
    scene.add(hemiLight);

    // 5. Subtle Ambient Base
    const ambientLight = new THREE.AmbientLight(0x203554, 0.6);
    scene.add(ambientLight);

    // Hierarchy Groups
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Emblem Group: rotated 180 degrees around X axis so SVG coordinates match 3D space
    // while maintaining exact positive surface winding order and normal vectors.
    const emblemGroup = new THREE.Group();
    emblemGroup.rotation.x = Math.PI;
    rootGroup.add(emblemGroup);

    // Materials Definition
    // 1. Polished Chrome / Platinum Silver (Foreground Ribbon)
    const chromeMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xffffff),
      metalness: 0.72,
      roughness: 0.14,
      clearcoat: 0.75,
      clearcoatRoughness: 0.08,
      reflectivity: 1.0,
      envMapIntensity: 1.5,
    });

    // 2. Brushed Steel-Blue Metallic (Under-bridge Ribbon)
    const steelBlueMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x1b4878),
      emissive: new THREE.Color(0x0c2545),
      emissiveIntensity: 0.25,
      metalness: 0.72,
      roughness: 0.22,
      clearcoat: 0.45,
      clearcoatRoughness: 0.12,
      envMapIntensity: 1.2,
    });

    // 3. Platinum-to-Blue Metallic (Right Loop & Numeral "9" Arch)
    const nineArchMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x2b689e),
      emissive: new THREE.Color(0x0e2e50),
      emissiveIntensity: 0.2,
      metalness: 0.76,
      roughness: 0.16,
      clearcoat: 0.6,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1.35,
    });

    // 4. Brushed Silver Return Fold (Left Loop Bottom)
    const silverFoldMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xe4effa),
      metalness: 0.74,
      roughness: 0.15,
      clearcoat: 0.65,
      envMapIntensity: 1.3,
    });

    // 5. Deep Electric-Blue Recessed Inner Channel
    const innerBlueMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x0066ee),
      emissive: new THREE.Color(0x003ec8),
      emissiveIntensity: 0.65,
      metalness: 0.5,
      roughness: 0.2,
    });

    // 6. Luminous Electric-Cyan Bevel Trim
    const cyanGlowMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x00f0ff),
      emissive: new THREE.Color(0x00e1ff),
      emissiveIntensity: 1.1,
      metalness: 0.25,
      roughness: 0.08,
    });

    // Parse SVG paths and construct extruded 3D geometries
    const svgLoader = new SVGLoader();

    // Helper to extrude path with bevels and center relative to emblem visual center
    const createExtrudedMesh = (
      svgPathString: string,
      options: THREE.ExtrudeGeometryOptions,
      material: THREE.Material,
      localZ: number
    ): THREE.Mesh | null => {
      try {
        const svgXml = `<svg xmlns="http://www.w3.org/2000/svg"><path d="${svgPathString}" /></svg>`;
        const parsedData = svgLoader.parse(svgXml);
        if (!parsedData.paths.length) return null;

        const shapes = SVGLoader.createShapes(parsedData.paths[0]);
        if (!shapes.length) return null;

        const geometry = new THREE.ExtrudeGeometry(shapes, options);
        // Translate all geometries by common emblem center so alignment is mathematically exact
        geometry.translate(-EMBLEM_CENTER_X, -EMBLEM_CENTER_Y, 0);

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.z = localZ;
        return mesh;
      } catch (err) {
        console.warn('Error creating extruded mesh:', err);
        return null;
      }
    };

    // 1. Facet 1: Under-Bridge Metallic Ribbon (Extruded further back in Z)
    const meshFacet1 = createExtrudedMesh(
      SVG_PATH_FACET1_UNDERBRIDGE,
      {
        depth: 14,
        bevelEnabled: true,
        bevelThickness: 2.8,
        bevelSize: 2.0,
        bevelSegments: 3,
      },
      steelBlueMaterial,
      10 // Local +Z translates to world -Z (further from camera)
    );
    if (meshFacet1) emblemGroup.add(meshFacet1);

    // 2. Facet 1 Inner Blue Channel
    const meshFacet1Blue = createExtrudedMesh(
      SVG_PATH_FACET1_BLUE_CHANNEL,
      {
        depth: 10,
        bevelEnabled: true,
        bevelThickness: 1.5,
        bevelSize: 1.0,
        bevelSegments: 2,
      },
      innerBlueMaterial,
      8
    );
    if (meshFacet1Blue) emblemGroup.add(meshFacet1Blue);

    // 3. Facet 2: Right Loop Outer Arch & Angled Numeral "9" Stem
    const meshFacet2 = createExtrudedMesh(
      SVG_PATH_FACET2_RIGHT_NINE,
      {
        depth: 16,
        bevelEnabled: true,
        bevelThickness: 3.2,
        bevelSize: 2.2,
        bevelSegments: 4,
      },
      nineArchMaterial,
      -2
    );
    if (meshFacet2) emblemGroup.add(meshFacet2);

    // 4. Facet 3: Left Loop Lower-Left Return Fold
    const meshFacet3 = createExtrudedMesh(
      SVG_PATH_FACET3_LEFT_FOLD,
      {
        depth: 15,
        bevelEnabled: true,
        bevelThickness: 2.8,
        bevelSize: 1.8,
        bevelSegments: 3,
      },
      silverFoldMaterial,
      0
    );
    if (meshFacet3) emblemGroup.add(meshFacet3);

    // 5. Facet 3 Left Loop Inner Blue Wall
    const meshFacet3Blue = createExtrudedMesh(
      SVG_PATH_FACET3_INNER_BLUE,
      {
        depth: 9,
        bevelEnabled: true,
        bevelThickness: 1.5,
        bevelSize: 1.0,
        bevelSegments: 2,
      },
      innerBlueMaterial,
      2
    );
    if (meshFacet3Blue) emblemGroup.add(meshFacet3Blue);

    // 6. Facet 4 Recessed Inner Electric-Blue Wall
    const meshFacet4Blue = createExtrudedMesh(
      SVG_PATH_FACET4_INNER_WALL,
      {
        depth: 11,
        bevelEnabled: true,
        bevelThickness: 1.8,
        bevelSize: 1.2,
        bevelSegments: 2,
      },
      innerBlueMaterial,
      -6
    );
    if (meshFacet4Blue) emblemGroup.add(meshFacet4Blue);

    // 7. Facet 4: Hero Foreground Ribbon (Highest Z-elevation, crossing cleanly over underbridge)
    const meshFacet4 = createExtrudedMesh(
      SVG_PATH_FACET4_FOREGROUND_RIBBON,
      {
        depth: 18,
        bevelEnabled: true,
        bevelThickness: 3.6,
        bevelSize: 2.4,
        bevelSegments: 4,
      },
      chromeMaterial,
      -16 // Local -Z translates to world +Z (closest to camera, prominent foreground)
    );
    if (meshFacet4) emblemGroup.add(meshFacet4);

    // 8. 3D Outer Orbital Ring
    const orbitalCurve = new THREE.EllipseCurve(
      0,
      0, // ax, aY
      385,
      285, // xRadius, yRadius
      0,
      2 * Math.PI, // aStartAngle, aEndAngle
      false, // aClockwise
      0 // aRotation
    );
    const orbitalPoints = orbitalCurve.getPoints(90);
    const orbital3DPoints = orbitalPoints.map(
      (p) => new THREE.Vector3(p.x, p.y, (p.x / 385) * -45)
    );
    const orbitalPath = new THREE.CatmullRomCurve3(orbital3DPoints, true);
    const orbitalGeometry = new THREE.TubeGeometry(
      orbitalPath,
      90,
      2.6,
      12,
      true
    );
    const orbitalMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x38bdf8),
      emissive: new THREE.Color(0x0284c7),
      emissiveIntensity: 0.6,
      metalness: 0.88,
      roughness: 0.18,
    });
    const orbitalMesh = new THREE.Mesh(orbitalGeometry, orbitalMaterial);
    // Tilted elliptical orbit
    orbitalMesh.position.set(0, 0, 0);
    orbitalMesh.rotation.set(0.24, 0.16, -0.22);
    emblemGroup.add(orbitalMesh);

    // 9. Dark Orbital Sphere Node at (928, 344)
    // Convert (928, 344) to centered coords: (928 - 494, 344 - 418) = (434, -74)
    const sphereGroup = new THREE.Group();
    sphereGroup.position.set(434, -74, -12);

    const sphereGeometry = new THREE.SphereGeometry(17, 32, 32);
    const sphereMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x040c19),
      metalness: 0.95,
      roughness: 0.14,
      clearcoat: 0.85,
      clearcoatRoughness: 0.08,
      reflectivity: 0.95,
    });
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphereGroup.add(sphereMesh);

    // Glowing cyan equatorial ring around the dark node
    const sphereHaloGeometry = new THREE.TorusGeometry(21, 1.4, 16, 48);
    const sphereHaloMesh = new THREE.Mesh(sphereHaloGeometry, cyanGlowMaterial);
    sphereHaloMesh.rotation.x = Math.PI / 2.3;
    sphereGroup.add(sphereHaloMesh);

    emblemGroup.add(sphereGroup);

    // 10. 4-Pointed Cyan-White Starburst Flare at (773, 206)
    // Centered coords: (773 - 494, 206 - 418) = (279, -212)
    const starburstGroup = new THREE.Group();
    starburstGroup.position.set(279, -212, -22);

    const starburstShape = createStarburstShape();
    const starburstGeometry = new THREE.ExtrudeGeometry(starburstShape, {
      depth: 3.5,
      bevelEnabled: true,
      bevelThickness: 1.2,
      bevelSize: 0.8,
      bevelSegments: 2,
    });
    const starburstMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xffffff),
      emissive: new THREE.Color(0xddf5ff),
      emissiveIntensity: 1.4,
      metalness: 0.2,
      roughness: 0.1,
    });
    const starburstMesh = new THREE.Mesh(starburstGeometry, starburstMaterial);
    starburstGroup.add(starburstMesh);

    // Glowing cyan core center
    const starburstCoreGeometry = new THREE.SphereGeometry(5.5, 16, 16);
    const starburstCoreMesh = new THREE.Mesh(
      starburstCoreGeometry,
      cyanGlowMaterial
    );
    starburstCoreMesh.position.z = -2;
    starburstGroup.add(starburstCoreMesh);

    emblemGroup.add(starburstGroup);

    // 11. Subtle, Restrained Contact Shadow (Replaces oversized obsidian blob)
    const shadowTexture = createContactShadowTexture();
    const shadowPlaneGeometry = new THREE.PlaneGeometry(540, 150);
    const shadowPlaneMaterial = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowPlaneGeometry, shadowPlaneMaterial);
    // In local emblem space (with rotX = PI), negative Y translates to world -Y (bottom)
    shadowMesh.position.set(0, 240, 35);
    emblemGroup.add(shadowMesh);

    // Pointer Interaction Handlers
    const handlePointerMove = (e: PointerEvent) => {
      if (!enablePointerInteraction || interactionRef.current.reducedMotion)
        return;
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = ((e.clientY - rect.top) / rect.height) * 2 - 1;

      // Restrained tilt angles: ±12 deg yaw, ±8 deg pitch
      interactionRef.current.targetRotY = normX * 0.24;
      interactionRef.current.targetRotX = Math.PI - normY * 0.15;
      interactionRef.current.targetRotZ = normX * 0.04;
      interactionRef.current.isHovered = true;
    };

    const handlePointerLeave = () => {
      // Smoothly return to resting position
      interactionRef.current.targetRotX = Math.PI;
      interactionRef.current.targetRotY = 0;
      interactionRef.current.targetRotZ = 0;
      interactionRef.current.isHovered = false;
    };

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerleave', handlePointerLeave);

    // Resize Observer
    const handleResize = () => {
      if (!container || !renderer) return;
      const newWidth = container.clientWidth || 300;
      const newHeight = container.clientHeight || 260;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    // Animation Render Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      const state = introStateRef.current;
      const isReduced = interactionRef.current.reducedMotion;

      // Smooth damping lerp for pointer interaction
      const lerpFactor = 0.055;
      interactionRef.current.currentRotX +=
        (interactionRef.current.targetRotX -
          interactionRef.current.currentRotX) *
        lerpFactor;
      interactionRef.current.currentRotY +=
        (interactionRef.current.targetRotY -
          interactionRef.current.currentRotY) *
        lerpFactor;
      interactionRef.current.currentRotZ +=
        (interactionRef.current.targetRotZ -
          interactionRef.current.currentRotZ) *
        lerpFactor;

      // Subtle idle breathing oscillation (disabled if reduced motion)
      let idlePitch = 0;
      let idleYaw = 0;
      let idleFloat = 0;

      if (!isReduced) {
        idlePitch = Math.sin(elapsedTime * 1.2) * 0.02;
        idleYaw = Math.cos(elapsedTime * 0.8) * 0.025;
        idleFloat = Math.sin(elapsedTime * 1.5) * 3.5;
      }

      emblemGroup.rotation.x =
        interactionRef.current.currentRotX + idlePitch;
      emblemGroup.rotation.y =
        interactionRef.current.currentRotY + idleYaw;
      emblemGroup.rotation.z =
        interactionRef.current.currentRotZ;
      emblemGroup.position.y = idleFloat;

      // Gentle starburst shimmer
      const starScale =
        1 + (isReduced ? 0 : Math.sin(elapsedTime * 3.2) * 0.08);
      starburstGroup.scale.set(starScale, starScale, 1);

      // Intro sequence scaling & opacity integration
      if (state) {
        const scale = state.logoScale || 1;
        rootGroup.scale.set(scale, scale, scale);

        // Adjust rim light & starburst intensity based on intro focal highlight
        if (state.focalHighlightIntensity !== undefined) {
          rimLight.intensity = 1.4 + state.focalHighlightIntensity * 0.6;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Comprehensive Resource Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerleave', handlePointerLeave);
      mediaQuery.removeEventListener('change', onMotionPreferenceChange);
      resizeObserver.disconnect();

      // Traverse and dispose Three.js scene resources
      scene.traverse((object) => {
        if ((object as THREE.Mesh).isMesh) {
          const mesh = object as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => mat.dispose());
          } else if (mesh.material) {
            mesh.material.dispose();
          }
        }
      });

      shadowTexture.dispose();
      envRenderTarget.dispose();
      pmremGenerator.dispose();
      renderer.dispose();
    };
  }, [enablePointerInteraction]);

  // Graceful fallback to crisp 2D vector if WebGL is unavailable
  if (!webglSupported) {
    return (
      <div
        data-testid="orion-3d-logo-fallback"
        className={`relative flex items-center justify-center select-none ${className}`}
        style={style}
      >
        <svg
          viewBox="0 0 1000 660"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d={SVG_PATH_FACET1_UNDERBRIDGE}
            fill="#1E4B82"
            stroke="#030712"
            strokeWidth="3.5"
          />
          <path d={SVG_PATH_FACET1_BLUE_CHANNEL} fill="#0066EE" />
          <path
            d={SVG_PATH_FACET2_RIGHT_NINE}
            fill="#3B6E9C"
            stroke="#030712"
            strokeWidth="4"
          />
          <path
            d={SVG_PATH_FACET3_LEFT_FOLD}
            fill="#D8E6F5"
            stroke="#030712"
            strokeWidth="3.5"
          />
          <path d={SVG_PATH_FACET3_INNER_BLUE} fill="#0055CC" />
          <path d={SVG_PATH_FACET4_INNER_WALL} fill="#0055CC" />
          <path
            d={SVG_PATH_FACET4_FOREGROUND_RIBBON}
            fill="#F1F7FD"
            stroke="#030712"
            strokeWidth="4"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      data-testid="orion-3d-logo-container"
      className={`relative flex items-center justify-center cursor-grab active:cursor-grabbing select-none ${className}`}
      style={style}
    >
      <canvas
        ref={canvasRef}
        data-testid="orion-3d-logo-canvas"
        className="w-full h-full block"
      />
    </div>
  );
};

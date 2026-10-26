import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/**
 * Detects whether the browser is using a software WebGL rasterizer (e.g. SwiftShader / llvmpipe).
 */
export function detectSoftwareWebGL(): boolean {
  try {
    const probe = document.createElement('canvas').getContext('webgl2');
    if (!probe) return true;
    const dbg = probe.getExtension('WEBGL_debug_renderer_info');
    const gpu = String(
      probe.getParameter(dbg ? dbg.UNMASKED_RENDERER_WEBGL : probe.RENDERER)
    );
    probe.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

/**
 * Creates a GPU-synchronized frame pacer that uses gl.fenceSync on software WebGL
 * so the browser main thread never queues unbounded frames ahead of SwiftShader.
 */
export function createGpuFramePacer(
  renderer: THREE.WebGLRenderer,
  isSoftwareGl: boolean
) {
  let rafId = 0;
  let timeoutId = 0;
  let disposed = false;
  const gl = renderer.getContext() as WebGL2RenderingContext;

  const scheduleNext = (tick: () => void) => {
    if (disposed) return;
    if (!isSoftwareGl || typeof gl.fenceSync !== 'function') {
      rafId = requestAnimationFrame(tick);
      return;
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (disposed) {
        if (sync) gl.deleteSync(sync);
        return;
      }
      if (!sync) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      const status = gl.clientWaitSync(sync, 0, 0);
      if (status === gl.TIMEOUT_EXPIRED) {
        timeoutId = window.setTimeout(poll, 16);
        return;
      }
      gl.deleteSync(sync);
      timeoutId = window.setTimeout(() => {
        if (!disposed) {
          rafId = requestAnimationFrame(tick);
        }
      }, 16);
    };
    timeoutId = window.setTimeout(poll, 16);
  };

  const dispose = () => {
    disposed = true;
    cancelAnimationFrame(rafId);
    clearTimeout(timeoutId);
  };

  return { scheduleNext, dispose };
}

/**
 * Sets up RoomEnvironment PBR reflections + warm/cool studio lighting contrast.
 */
export function setupStudioEnvironment(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene
): THREE.Texture {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTexture;
  pmremGenerator.dispose();
  return envTexture;
}

export interface RoutePulseMaterial extends THREE.ShaderMaterial {
  uniforms: {
    uTime: { value: number };
    uDrawProgress: { value: number };
    uAlertLevel: { value: number };
    uBypassLevel: { value: number };
    uOpacity: { value: number };
    uBaseColor: { value: THREE.Color };
    uPulseColor: { value: THREE.Color };
  };
}

/**
 * Custom GLSL ShaderMaterial for animated 3D logistics routes (TubeGeometry).
 * Renders:
 * - Progressive route drawing (`uDrawProgress` in [0, 1])
 * - Multi-harmonic directional light pulses traveling along `vUv.x`
 * - Smooth semantic state shifts between Nominal (Steel/Ice-Cyan), Disrupted (Amber/Crimson),
 *   and Autonomous Bypass (Emerald/Electric Cyan).
 */
export function createRoutePulseShaderMaterial(params: {
  baseColorHex?: number;
  pulseColorHex?: number;
  initialDrawProgress?: number;
  opacity?: number;
}): RoutePulseMaterial {
  const {
    baseColorHex = 0x294d6b,
    pulseColorHex = 0x7dd3fc,
    initialDrawProgress = 1.0,
    opacity = 0.88,
  } = params;

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uDrawProgress: { value: initialDrawProgress },
      uAlertLevel: { value: 0.0 },
      uBypassLevel: { value: 0.0 },
      uOpacity: { value: opacity },
      uBaseColor: { value: new THREE.Color(baseColorHex) },
      uPulseColor: { value: new THREE.Color(pulseColorHex) },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPos;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vViewPos = -mvPos.xyz;
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uDrawProgress;
      uniform float uAlertLevel;
      uniform float uBypassLevel;
      uniform float uOpacity;
      uniform vec3 uBaseColor;
      uniform vec3 uPulseColor;

      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPos;

      void main() {
        if (vUv.x > uDrawProgress) {
          discard;
        }

        // Progressive draw leading-edge glow
        float drawEdge = smoothstep(uDrawProgress - 0.08, uDrawProgress, vUv.x);

        // Primary and secondary traveling telemetry packets along the spline
        float wave1 = fract(vUv.x * 3.0 - uTime * 0.55);
        float pulse1 = smoothstep(0.72, 0.98, wave1) * (1.0 - smoothstep(0.98, 1.0, wave1));

        float wave2 = fract(vUv.x * 6.0 - uTime * 0.85 + 0.35);
        float pulse2 = smoothstep(0.80, 0.97, wave2) * 0.65;

        float totalPulse = clamp(pulse1 + pulse2 + drawEdge * 0.9, 0.0, 1.0);

        // Semantic state colors
        vec3 alertBase = vec3(0.78, 0.22, 0.14);   // Crimson-amber corridor alert
        vec3 alertPulse = vec3(1.0, 0.68, 0.20);   // Bright amber warning pulse

        vec3 bypassBase = vec3(0.06, 0.52, 0.44);  // Autonomous emerald-teal corridor
        vec3 bypassPulse = vec3(0.35, 0.96, 0.78); // High-velocity mint-cyan pulse

        vec3 activeBase = mix(uBaseColor, alertBase, clamp(uAlertLevel, 0.0, 1.0));
        activeBase = mix(activeBase, bypassBase, clamp(uBypassLevel, 0.0, 1.0));

        vec3 activeHighlight = mix(uPulseColor, alertPulse, clamp(uAlertLevel, 0.0, 1.0));
        activeHighlight = mix(activeHighlight, bypassPulse, clamp(uBypassLevel, 0.0, 1.0));

        // Subtle rim glow on tube silhouette
        vec3 viewDir = normalize(vViewPos);
        float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 1.6);

        vec3 finalColor = mix(activeBase, activeHighlight, totalPulse);
        finalColor += activeHighlight * fresnel * 0.35;

        float alpha = uOpacity * (0.48 + totalPulse * 0.52);
        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
  }) as RoutePulseMaterial;

  return mat;
}

/**
 * Custom GLSL ShaderMaterial for the curved planetary bathymetric surface,
 * rendering geodesic lat/lon coordinates and a subtle radial telemetry scan wave.
 */
export function createPlanetarySurfaceMaterial(isLightTheme = true): THREE.ShaderMaterial {
  const deepGraphite = isLightTheme
    ? new THREE.Color(0x0f1822)
    : new THREE.Color(0x0b121a);
  const gridTint = new THREE.Color(0x294d6b);
  const scanTint = new THREE.Color(0x7dd3fc);

  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uDisruptionAlert: { value: 0 },
      uDeepColor: { value: deepGraphite },
      uGridColor: { value: gridTint },
      uScanColor: { value: scanTint },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vLocalPos;

      void main() {
        vUv = uv;
        vLocalPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uDisruptionAlert;
      uniform vec3 uDeepColor;
      uniform vec3 uGridColor;
      uniform vec3 uScanColor;

      varying vec2 vUv;
      varying vec3 vLocalPos;

      void main() {
        float dist = length(vLocalPos.xz) / 114.0;

        // Geodesic coordinate grid
        vec2 gridUv = vLocalPos.xz * 0.085;
        vec2 gridFract = abs(fract(gridUv - 0.5) - 0.5);
        float lineX = 1.0 - smoothstep(0.0, 0.045, gridFract.x);
        float lineY = 1.0 - smoothstep(0.0, 0.045, gridFract.y);
        float gridMask = max(lineX, lineY) * (1.0 - smoothstep(0.75, 1.0, dist));

        // Concentric radar rings
        float ringPattern = abs(fract(dist * 5.0) - 0.5);
        float ringMask = (1.0 - smoothstep(0.0, 0.03, ringPattern)) * 0.45;

        // Expanding orbital scan wave
        float scanRadius = fract(uTime * 0.12);
        float scanWave = (1.0 - smoothstep(0.0, 0.07, abs(dist - scanRadius))) * (1.0 - dist);

        vec3 col = uDeepColor;
        col = mix(col, uGridColor, (gridMask * 0.42 + ringMask * 0.35));

        vec3 activeScanColor = mix(uScanColor, vec3(0.96, 0.55, 0.22), uDisruptionAlert * 0.65);
        col += activeScanColor * scanWave * 0.32;

        // Subtle outer horizon vignette on plinth
        col = mix(col, uGridColor * 0.65, smoothstep(0.82, 1.0, dist) * 0.5);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

/**
 * Composite 10-part Ultra-Large Container Vessel (ULCV) 3D Model:
 * 1. Sculpted beveled hull (ExtrudeGeometry)
 * 2. Maritime waterline boot-top stripe
 * 3. Forward container stack (Steel Blue)
 * 4. Midship container stack (Ice Blue)
 * 5. Aft container stack (Deep Graphite / Cyan)
 * 6. White navigation superstructure tower
 * 7. Dark glass bridge command visor
 * 8. Radar & satellite comms mast
 * 9. Twin bow/stern deck cranes
 * 10. Hydrodynamic V-wake & contact shadow disc
 */
export function createCompositeContainerShip(accentColor = 0x294d6b): THREE.Group {
  const group = new THREE.Group();

  // 1. Sculpted ship hull (ExtrudeGeometry with pointed bow)
  const hullShape = new THREE.Shape();
  hullShape.moveTo(-1.7, -5.2);
  hullShape.lineTo(1.7, -5.2);
  hullShape.lineTo(1.85, 2.6);
  hullShape.lineTo(0, 5.6); // Pointed bow at +Z
  hullShape.lineTo(-1.85, 2.6);
  hullShape.closePath();

  const hullGeo = new THREE.ExtrudeGeometry(hullShape, {
    depth: 1.65,
    bevelEnabled: true,
    bevelThickness: 0.22,
    bevelSize: 0.18,
    bevelSegments: 2,
  });
  hullGeo.rotateX(Math.PI / 2);
  hullGeo.translate(0, 1.75, 0);

  const hullMat = new THREE.MeshStandardMaterial({
    color: 0x101820,
    roughness: 0.58,
    metalness: 0.42,
  });
  const hullMesh = new THREE.Mesh(hullGeo, hullMat);
  group.add(hullMesh);

  // Precision edge highlight on hull
  const hullEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(hullGeo, 28),
    new THREE.LineBasicMaterial({ color: 0xa8c2d2, transparent: true, opacity: 0.65 })
  );
  group.add(hullEdges);

  // 2. Waterline boot-top trim
  const trimGeo = new THREE.BoxGeometry(3.55, 0.32, 9.2);
  const trimMat = new THREE.MeshStandardMaterial({
    color: accentColor,
    roughness: 0.35,
    metalness: 0.5,
  });
  const trimMesh = new THREE.Mesh(trimGeo, trimMat);
  trimMesh.position.set(0, 0.45, -0.2);
  group.add(trimMesh);

  // 3, 4, 5. Multi-tier container bays with varied heights and roughness
  const bayConfigs = [
    { z: 2.0, h: 1.55, color: accentColor, roughness: 0.45 },
    { z: 0.2, h: 1.95, color: 0xa8c2d2, roughness: 0.32 },
    { z: -1.6, h: 1.75, color: 0x3b82f6, roughness: 0.4 },
  ];
  bayConfigs.forEach((bay) => {
    const bayGeo = new THREE.BoxGeometry(2.95, bay.h, 1.52);
    const bayMat = new THREE.MeshStandardMaterial({
      color: bay.color,
      roughness: bay.roughness,
      metalness: 0.35,
    });
    const bayMesh = new THREE.Mesh(bayGeo, bayMat);
    bayMesh.position.set(0, 1.85 + bay.h / 2, bay.z);
    bayMesh.add(
      new THREE.LineSegments(
        new THREE.EdgesGeometry(bayGeo),
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 })
      )
    );
    group.add(bayMesh);
  });

  // 6. Aft crisp-white navigation bridge superstructure
  const bridgeGeo = new THREE.BoxGeometry(2.8, 2.7, 1.85);
  const bridgeMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.22,
    metalness: 0.15,
  });
  const bridgeMesh = new THREE.Mesh(bridgeGeo, bridgeMat);
  bridgeMesh.position.set(0, 3.1, -3.55);
  group.add(bridgeMesh);

  // 7. Glossy dark cockpit bridge visor
  const visorGeo = new THREE.BoxGeometry(2.92, 0.48, 0.95);
  const visorMat = new THREE.MeshStandardMaterial({
    color: 0x090d14,
    roughness: 0.1,
    metalness: 0.85,
  });
  const visorMesh = new THREE.Mesh(visorGeo, visorMat);
  visorMesh.position.set(0, 3.95, -2.95);
  group.add(visorMesh);

  // 8. Satellite / AIS transponder mast
  const mastGeo = new THREE.CylinderGeometry(0.1, 0.18, 1.8, 8);
  const mastMat = new THREE.MeshStandardMaterial({
    color: 0xa8c2d2,
    roughness: 0.25,
    metalness: 0.8,
  });
  const mastMesh = new THREE.Mesh(mastGeo, mastMat);
  mastMesh.position.set(0, 5.2, -3.55);
  group.add(mastMesh);

  // 9.Hydrodynamic V-wake lines & contact shadow disc on water
  const shadowGeo = new THREE.CircleGeometry(4.8, 24);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x070c12,
    transparent: true,
    opacity: 0.38,
    depthWrite: false,
  });
  const shadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
  shadowDisc.position.y = 0.04;
  group.add(shadowDisc);

  const wakePts = [
    new THREE.Vector3(0, 0.12, 5.5),
    new THREE.Vector3(-2.8, 0.12, -6.5),
    new THREE.Vector3(0, 0.12, 5.5),
    new THREE.Vector3(2.8, 0.12, -6.5),
  ];
  const wakeGeo = new THREE.BufferGeometry().setFromPoints(wakePts);
  const wakeLines = new THREE.LineSegments(
    wakeGeo,
    new THREE.LineBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.55 })
  );
  group.add(wakeLines);

  return group;
}

/**
 * Composite 9-part Swept-Wing Cargo Freighter Aircraft (THREE.Group):
 * 1. Cylindrical main fuselage
 * 2. Tapered aerodynamic nose cone
 * 3. Glossy cockpit visor
 * 4. Swept main wing airfoil
 * 5 & 6. Left & right vertical winglets
 * 7 & 8. Twin under-wing turbofan engine nacelles
 * 9. Swept vertical tail fin + horizontal stabilizer
 */
export function createCompositeCargoAircraft(accentColor = 0x294d6b): THREE.Group {
  const group = new THREE.Group();

  // 1. Main cylindrical fuselage
  const fuseGeo = new THREE.CapsuleGeometry(0.78, 6.8, 6, 16);
  fuseGeo.rotateX(Math.PI / 2);
  const fuseMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.2,
    metalness: 0.25,
  });
  const fuseMesh = new THREE.Mesh(fuseGeo, fuseMat);
  group.add(fuseMesh);

  // Belly graphite stripe
  const bellyGeo = new THREE.BoxGeometry(1.42, 0.55, 6.6);
  const bellyMat = new THREE.MeshStandardMaterial({
    color: 0x101820,
    roughness: 0.55,
    metalness: 0.45,
  });
  const bellyMesh = new THREE.Mesh(bellyGeo, bellyMat);
  bellyMesh.position.set(0, -0.35, 0);
  group.add(bellyMesh);

  // 2. Cockpit dark glass visor
  const visorGeo = new THREE.BoxGeometry(1.18, 0.42, 1.35);
  const visorMat = new THREE.MeshStandardMaterial({
    color: 0x0a1018,
    roughness: 0.08,
    metalness: 0.9,
  });
  const visorMesh = new THREE.Mesh(visorGeo, visorMat);
  visorMesh.position.set(0, 0.42, 2.85);
  group.add(visorMesh);

  // 3. Swept-back main wings (ExtrudeGeometry)
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 1.8);
  wingShape.lineTo(6.4, -0.9);
  wingShape.lineTo(6.4, -1.85);
  wingShape.lineTo(0, -0.2);
  wingShape.lineTo(-6.4, -1.85);
  wingShape.lineTo(-6.4, -0.9);
  wingShape.closePath();

  const wingGeo = new THREE.ExtrudeGeometry(wingShape, {
    depth: 0.18,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.04,
    bevelSegments: 1,
  });
  wingGeo.rotateX(Math.PI / 2);
  const wingMat = new THREE.MeshStandardMaterial({
    color: accentColor,
    roughness: 0.35,
    metalness: 0.55,
  });
  const wingMesh = new THREE.Mesh(wingGeo, wingMat);
  wingMesh.position.set(0, 0.05, 0.3);
  group.add(wingMesh);

  // 4 & 5. Twin winglets
  [-6.35, 6.35].forEach((xPos) => {
    const wlGeo = new THREE.BoxGeometry(0.16, 0.95, 0.85);
    const wlMesh = new THREE.Mesh(wlGeo, wingMat);
    wlMesh.position.set(xPos, 0.48, -1.1);
    group.add(wlMesh);
  });

  // 6 & 7. Twin under-wing turbofan engine nacelles
  const nacelleGeo = new THREE.CylinderGeometry(0.38, 0.34, 1.75, 12);
  nacelleGeo.rotateX(Math.PI / 2);
  const nacelleMat = new THREE.MeshStandardMaterial({
    color: 0x101820,
    roughness: 0.3,
    metalness: 0.75,
  });
  [-2.6, 2.6].forEach((xPos) => {
    const nac = new THREE.Mesh(nacelleGeo, nacelleMat);
    nac.position.set(xPos, -0.42, 0.65);
    group.add(nac);
  });

  // 8. Swept vertical tail stabilizer
  const tailGeo = new THREE.BoxGeometry(0.24, 2.35, 1.75);
  const tailMesh = new THREE.Mesh(tailGeo, wingMat);
  tailMesh.position.set(0, 1.25, -3.25);
  tailMesh.rotation.x = -0.22;
  group.add(tailMesh);

  // 9. Horizontal tailplane
  const hTailGeo = new THREE.BoxGeometry(4.2, 0.14, 1.15);
  const hTailMesh = new THREE.Mesh(hTailGeo, bellyMat);
  hTailMesh.position.set(0, 0.35, -3.45);
  group.add(hTailMesh);

  return group;
}

/**
 * Composite 7-part Articulated Intermodal Freight Truck (THREE.Group):
 * 1. Aerodynamic tractor cab
 * 2. Dark wrap-around windshield visor
 * 3. Heavy chassis rail
 * 4. 40ft corrugated intermodal container trailer
 * 5. Refrigeration / telematics nose unit
 * 6. Wheel axle assemblies
 * 7. Ground contact shadow disc
 */
export function createCompositeFreightTruck(accentColor = 0x294d6b): THREE.Group {
  const group = new THREE.Group();

  // 1. Tractor cab
  const cabGeo = new THREE.BoxGeometry(1.75, 2.05, 2.1);
  const cabMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.22,
    metalness: 0.2,
  });
  const cabMesh = new THREE.Mesh(cabGeo, cabMat);
  cabMesh.position.set(0, 1.35, 2.35);
  group.add(cabMesh);

  // 2. Windshield visor
  const visorGeo = new THREE.BoxGeometry(1.82, 0.55, 0.85);
  const visorMat = new THREE.MeshStandardMaterial({
    color: 0x090e15,
    roughness: 0.08,
    metalness: 0.88,
  });
  const visorMesh = new THREE.Mesh(visorGeo, visorMat);
  visorMesh.position.set(0, 1.75, 3.02);
  group.add(visorMesh);

  // 3. Chassis frame
  const chassisGeo = new THREE.BoxGeometry(1.4, 0.35, 7.2);
  const chassisMat = new THREE.MeshStandardMaterial({
    color: 0x101820,
    roughness: 0.65,
    metalness: 0.5,
  });
  const chassisMesh = new THREE.Mesh(chassisGeo, chassisMat);
  chassisMesh.position.set(0, 0.52, -0.2);
  group.add(chassisMesh);

  // 4. Intermodal container trailer
  const trailerGeo = new THREE.BoxGeometry(1.98, 2.38, 5.4);
  const trailerMat = new THREE.MeshStandardMaterial({
    color: accentColor,
    roughness: 0.38,
    metalness: 0.45,
  });
  const trailerMesh = new THREE.Mesh(trailerGeo, trailerMat);
  trailerMesh.position.set(0, 1.85, -1.45);
  trailerMesh.add(
    new THREE.LineSegments(
      new THREE.EdgesGeometry(trailerGeo),
      new THREE.LineBasicMaterial({ color: 0xa8c2d2, transparent: true, opacity: 0.7 })
    )
  );
  group.add(trailerMesh);

  // 5. Wheel assemblies
  const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 2.1, 12);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelMat = new THREE.MeshStandardMaterial({
    color: 0x0b1017,
    roughness: 0.78,
    metalness: 0.2,
  });
  [2.5, -0.4, -3.1].forEach((zPos) => {
    const axle = new THREE.Mesh(wheelGeo, wheelMat);
    axle.position.set(0, 0.42, zPos);
    group.add(axle);
  });

  // 6. Ground contact shadow disc
  const shadowGeo = new THREE.CircleGeometry(3.2, 20);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x070c12,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });
  const shadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
  shadowDisc.position.y = 0.03;
  group.add(shadowDisc);

  return group;
}

/**
 * Composite 6-part Superport / Logistics Hub Complex (THREE.Group):
 * 1. Illuminated hexagonal / circular foundation pad
 * 2. Primary control tower with crisp edge highlights
 * 3. Automated distribution warehouse bay
 * 4. Ship-to-shore gantry crane portal + cantilevered boom
 * 5. Elevated telemetry beacon sphere
 * 6. Rotating radar ring
 */
export function createCompositeSuperportHub(params: {
  height: number;
  isPrimaryGateway?: boolean;
}): {
  group: THREE.Group;
  beaconMesh: THREE.Mesh;
  ringMesh: THREE.Mesh;
} {
  const { height, isPrimaryGateway = true } = params;
  const group = new THREE.Group();

  // 1. Foundation pad
  const padGeo = new THREE.CylinderGeometry(4.6, 5.1, 0.45, 24);
  const padMat = new THREE.MeshStandardMaterial({
    color: 0x101820,
    roughness: 0.45,
    metalness: 0.6,
  });
  const padMesh = new THREE.Mesh(padGeo, padMat);
  padMesh.position.y = 0.22;
  group.add(padMesh);

  const ringGeo = new THREE.RingGeometry(4.8, 5.6, 32);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x7dd3fc,
    transparent: true,
    opacity: 0.65,
    side: THREE.DoubleSide,
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.position.y = 0.08;
  group.add(ringMesh);

  // 2. Central Port Control Tower
  const towerGeo = new THREE.BoxGeometry(2.6, height, 2.6);
  const towerMat = new THREE.MeshStandardMaterial({
    color: 0x101820,
    roughness: 0.28,
    metalness: 0.72,
  });
  const towerMesh = new THREE.Mesh(towerGeo, towerMat);
  towerMesh.position.y = height / 2 + 0.4;
  towerMesh.add(
    new THREE.LineSegments(
      new THREE.EdgesGeometry(towerGeo),
      new THREE.LineBasicMaterial({ color: 0xa8c2d2, transparent: true, opacity: 0.85 })
    )
  );
  group.add(towerMesh);

  // 3. Automated Logistics Warehouse Bay beside tower
  const whGeo = new THREE.BoxGeometry(3.4, 2.2, 2.4);
  const whMat = new THREE.MeshStandardMaterial({
    color: 0x294d6b,
    roughness: 0.48,
    metalness: 0.42,
  });
  const whMesh = new THREE.Mesh(whGeo, whMat);
  whMesh.position.set(2.4, 1.4, 0.8);
  group.add(whMesh);

  // 4. Ship-to-Shore Gantry Crane Boom on Primary Gateways
  if (isPrimaryGateway) {
    const craneLegGeo = new THREE.BoxGeometry(0.32, height * 0.72, 1.4);
    const craneMat = new THREE.MeshStandardMaterial({
      color: 0xa8c2d2,
      roughness: 0.3,
      metalness: 0.75,
    });
    const craneLeg = new THREE.Mesh(craneLegGeo, craneMat);
    craneLeg.position.set(-2.3, (height * 0.72) / 2 + 0.4, -0.6);
    group.add(craneLeg);

    const boomGeo = new THREE.BoxGeometry(4.8, 0.32, 0.55);
    const boomMesh = new THREE.Mesh(boomGeo, craneMat);
    boomMesh.position.set(-3.2, height * 0.72 + 0.3, -0.6);
    group.add(boomMesh);
  }

  // 5. Beacon Sphere
  const beaconGeo = new THREE.SphereGeometry(0.95, 14, 14);
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
  beaconMesh.position.y = height + 1.4;
  group.add(beaconMesh);

  return { group, beaconMesh, ringMesh };
}

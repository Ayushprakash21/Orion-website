/**
 * ORION-9 MASTER ANIMATION — PROCEDURAL 3D SUPPLY CHAIN WORLD
 * 
 * Accurately recreates the visual language, architectural styling, and composition
 * from the reference screenshots (01f05dc), expanding it across the full 7-stage supply chain:
 * 
 * 1. Raw Materials (Excavation terraces, ore hoppers, silos, raw conduits)
 * 2. Suppliers (Precision foundries, filtration stacks, component conduits)
 * 3. Smart Manufacturing / Central Command Hub (Twin domes, glowing Orion-9 emblem, robotic arms, QC scanner)
 * 4. Warehousing & ASRS (High-bay racks, moving lift carriage, twin hyperbolic cooling towers)
 * 5. Multimodal Distribution (Deepwater canal, gantry cranes, container ships, elevated highway, air terminal)
 * 6. Regional Retail (Commercial storefront, canopy, delivery bays)
 * 7. End Customer (Enterprise campus, verified proof-of-delivery beacon)
 */

import * as THREE from 'three';
import {
  createRoutePulseShaderMaterial,
  createCompositeContainerShip,
  createCompositeCargoAircraft,
  createCompositeFreightTruck,
  type RoutePulseMaterial,
} from './three-logistics-craft';

export interface Scene3DRig {
  rootGroup: THREE.Group;
  cyanPipelineMat: RoutePulseMaterial;
  redTube1Mat: THREE.MeshStandardMaterial;
  redTube2Mat: THREE.MeshStandardMaterial;
  bypassConduitMat: THREE.MeshStandardMaterial;
  turbineRotors: THREE.Group[];
  craneTrolleys: { group: THREE.Group; baseZ: number; phase: number }[];
  checkpointGates: THREE.Mesh[];
  skylightMats: THREE.MeshStandardMaterial[];
  bayBeaconMats: THREE.MeshStandardMaterial[];
  roofEmblemMat: THREE.MeshStandardMaterial;
  facadeEmblem: THREE.Group;
  ship1: THREE.Group;
  ship2: THREE.Group;
  truck1: THREE.Group;
  truck2: THREE.Group;
  hubTruck1: THREE.Group;
  hubTruck2: THREE.Group;
  hubTruck3: THREE.Group;
  cargoJet: THREE.Group;
  bypassAircraft: THREE.Group;
  roboticArms: {
    base: THREE.Group;
    upperArm: THREE.Group;
    forearm: THREE.Group;
    sparkLight: THREE.PointLight;
    phase: number;
  }[];
  qcScannerMesh: THREE.Mesh;
  asrsCarrier: THREE.Mesh;
  conveyorItems: { mesh: THREE.Mesh; startX: number; endX: number; z: number; y: number }[];
  disruptionRig: {
    warningBeacon: THREE.Mesh;
    warningLight: THREE.PointLight;
    bypassConduit: THREE.Mesh;
    bypassGlowLight: THREE.PointLight;
  };
}

export function buildEndToEndSupplyChainWorld(isSoftwareGl: boolean): Scene3DRig {
  const rootGroup = new THREE.Group();

  // =========================================================================
  // 1. ARCHITECTURAL PBR MATERIALS (Matched to Reference Visuals)
  // =========================================================================
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
    transparent: true,
    opacity: 0.82,
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
    color: 0xff4d3b,
    emissive: new THREE.Color(0xff453a),
    emissiveIntensity: 1.4,
    roughness: 0.25,
    metalness: 0.1,
  });
  const amberWarningMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: new THREE.Color(0xf59e0b),
    emissiveIntensity: 1.6,
    roughness: 0.25,
    metalness: 0.1,
  });
  const greenVerifiedMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: new THREE.Color(0x10b981),
    emissiveIntensity: 1.5,
    roughness: 0.2,
    metalness: 0.1,
  });

  const turbineRotors: THREE.Group[] = [];
  const craneTrolleys: Scene3DRig['craneTrolleys'] = [];
  const checkpointGates: THREE.Mesh[] = [];
  const skylightMats: THREE.MeshStandardMaterial[] = [];
  const bayBeaconMats: THREE.MeshStandardMaterial[] = [];
  const roboticArms: Scene3DRig['roboticArms'] = [];
  const conveyorItems: Scene3DRig['conveyorItems'] = [];

  const addEdges = (mesh: THREE.Mesh, geo: THREE.BufferGeometry) => {
    mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), archEdgeMat));
  };

  // =========================================================================
  // 2. CONTINUOUS SHIPPING CANAL, CONCRETE QUAY & ELEVATED HIGHWAY
  // =========================================================================
  // Deep-water canal (X: -65 to +110, Z: 18.5)
  const canalGeo = new THREE.PlaneGeometry(185, 14);
  canalGeo.rotateX(-Math.PI / 2);
  const canalMat = new THREE.MeshStandardMaterial({
    color: 0xb6daf2,
    roughness: 0.2,
    metalness: 0.28,
  });
  const canalMesh = new THREE.Mesh(canalGeo, canalMat);
  canalMesh.position.set(22, 0.05, 18.8);
  rootGroup.add(canalMesh);

  // Concrete quay wall along shipping canal
  const quayGeo = new THREE.BoxGeometry(185, 0.5, 1.2);
  const quayMesh = new THREE.Mesh(quayGeo, whiteArchMat);
  quayMesh.position.set(22, 0.25, 11.9);
  rootGroup.add(quayMesh);

  // Elevated Highway Corridor with Piers (X: -55 to +115, Z: 8.4)
  const highwayGroup = new THREE.Group();
  const deckGeo = new THREE.BoxGeometry(170, 0.36, 3.5);
  const deckMesh = new THREE.Mesh(deckGeo, roadSurfaceMat);
  deckMesh.position.set(26, 1.15, 8.4);
  highwayGroup.add(deckMesh);

  const railGeo = new THREE.BoxGeometry(170, 0.48, 0.18);
  const railNorth = new THREE.Mesh(railGeo, whiteArchMat);
  railNorth.position.set(26, 1.38, 6.72);
  const railSouth = new THREE.Mesh(railGeo, whiteArchMat);
  railSouth.position.set(26, 1.38, 10.08);
  highwayGroup.add(railNorth, railSouth);

  const pierGeo = new THREE.BoxGeometry(0.95, 1.1, 2.4);
  for (let px = -50; px <= 105; px += 11) {
    const pier = new THREE.Mesh(pierGeo, iceSlateMat);
    pier.position.set(px, 0.55, 8.4);
    highwayGroup.add(pier);
  }
  rootGroup.add(highwayGroup);

  // =========================================================================
  // 3. SKYLINE TOWERS IN BACKGROUND (HERO VISTA DEPTH)
  // =========================================================================
  const createArchitecturalTower = (x: number, z: number, w: number, h: number, d: number) => {
    const tower = new THREE.Group();
    tower.position.set(x, 0, z);

    const coreGeo = new THREE.BoxGeometry(w, h, d);
    const core = new THREE.Mesh(coreGeo, whiteArchMat);
    core.position.y = h / 2;
    core.castShadow = !isSoftwareGl;
    core.receiveShadow = !isSoftwareGl;
    addEdges(core, coreGeo);
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

  [
    { x: -44, z: -14, w: 5.0, h: 21, d: 5.0 },
    { x: -36, z: -16, w: 5.4, h: 17.5, d: 5.2 },
    { x: -28, z: -12, w: 4.4, h: 12.0, d: 4.4 },
    { x: -22, z: -15, w: 4.6, h: 9.5, d: 4.4 },
    { x: -48, z: -6, w: 4.0, h: 14.0, d: 4.0 },
    { x: -16, z: -17, w: 4.2, h: 7.5, d: 4.2 },
  ].forEach((t) => {
    rootGroup.add(createArchitecturalTower(t.x, t.z, t.w, t.h, t.d));
  });

  // =========================================================================
  // 4. SHIP-TO-SHORE GANTRY CRANES ALONG QUAY
  // =========================================================================
  const createPortGantryCrane = (x: number, z: number, phaseOffset: number) => {
    const craneGroup = new THREE.Group();
    craneGroup.position.set(x, 0, z);

    const legGeo = new THREE.BoxGeometry(0.45, 7.6, 0.45);
    [[-1.6, -1.2], [1.6, -1.2], [-1.6, 1.2], [1.6, 1.2]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, whiteArchMat);
      leg.position.set(lx, 3.8, lz);
      leg.castShadow = !isSoftwareGl;
      craneGroup.add(leg);
    });

    const crossBeamGeo = new THREE.BoxGeometry(3.6, 0.42, 2.8);
    const midBeam = new THREE.Mesh(crossBeamGeo, iceSlateMat);
    midBeam.position.set(0, 4.2, 0);
    craneGroup.add(midBeam);

    const boomGeo = new THREE.BoxGeometry(1.6, 0.55, 10.5);
    const boom = new THREE.Mesh(boomGeo, steelBlueMat);
    boom.position.set(0, 7.6, 2.8);
    boom.castShadow = !isSoftwareGl;
    craneGroup.add(boom);

    const houseGeo = new THREE.BoxGeometry(2.6, 1.2, 2.4);
    const house = new THREE.Mesh(houseGeo, whiteArchMat);
    house.position.set(0, 8.3, -0.5);
    craneGroup.add(house);

    const trolleyGroup = new THREE.Group();
    trolleyGroup.position.set(0, 7.2, 3.5);

    const trolleyCar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.35, 1.2), darkNavyMat);
    trolleyGroup.add(trolleyCar);

    const cableGeo = new THREE.CylinderGeometry(0.05, 0.05, 2.8, 6);
    const cable = new THREE.Mesh(cableGeo, iceSlateMat);
    cable.position.y = -1.4;
    trolleyGroup.add(cable);

    const liftedContainer = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 0.95, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.35, metalness: 0.25 })
    );
    liftedContainer.position.y = -2.85;
    trolleyGroup.add(liftedContainer);

    craneGroup.add(trolleyGroup);
    craneTrolleys.push({ group: trolleyGroup, baseZ: 3.2, phase: phaseOffset });
    return craneGroup;
  };

  rootGroup.add(createPortGantryCrane(-28, 12.2, 0.0));
  rootGroup.add(createPortGantryCrane(-18, 12.2, 1.6));
  rootGroup.add(createPortGantryCrane(67, 12.2, 0.8));
  rootGroup.add(createPortGantryCrane(81, 12.2, 2.4));

  // =========================================================================
  // 5. WIND TURBINES ON THE RIDGE
  // =========================================================================
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
  ].forEach((tb) => rootGroup.add(createWindTurbine(tb.x, tb.z, tb.h)));

  // =========================================================================
  // 6. STAGE 1 & 2: RAW MATERIALS & SUPPLIERS (WEST WING, X ≈ -50 to -14)
  // Stepped quarry terraces, mineral hopper, component foundries
  // =========================================================================
  const rawGroup = new THREE.Group();
  rawGroup.position.set(-42, 0, 3);

  [6.5, 5.0, 3.8, 2.5].forEach((r, idx) => {
    const bGeo = new THREE.CylinderGeometry(r - 0.5, r, 0.45, 16);
    const bench = new THREE.Mesh(bGeo, iceSlateMat);
    bench.position.set(-2, idx * 0.38 + 0.2, -4);
    bench.receiveShadow = !isSoftwareGl;
    rawGroup.add(bench);
  });

  const hopperGeo = new THREE.BoxGeometry(4.2, 2.6, 3.2);
  const hopper = new THREE.Mesh(hopperGeo, whiteArchMat);
  hopper.position.set(3.2, 1.3, -2);
  addEdges(hopper, hopperGeo);
  rawGroup.add(hopper);

  // Twin silos
  [-1.0, 1.0].forEach((sx) => {
    const sGeo = new THREE.CylinderGeometry(0.7, 0.7, 3.2, 12);
    const silo = new THREE.Mesh(sGeo, iceSlateMat);
    silo.position.set(3.2 + sx, 1.6, -5.5);
    rawGroup.add(silo);
  });

  // Supplier foundry building
  const foundryGeo = new THREE.BoxGeometry(6.4, 2.8, 4.2);
  const foundry = new THREE.Mesh(foundryGeo, whiteArchMat);
  foundry.position.set(16, 1.4, -4);
  addEdges(foundry, foundryGeo);
  rawGroup.add(foundry);

  // Filtration stacks
  [-1.6, 0, 1.6].forEach((stx) => {
    const stackGeo = new THREE.CylinderGeometry(0.18, 0.24, 3.6, 10);
    const stack = new THREE.Mesh(stackGeo, steelBlueMat);
    stack.position.set(16 + stx, 2.8, -6.2);
    rawGroup.add(stack);
  });

  rootGroup.add(rawGroup);

  // =========================================================================
  // 7. STAGE 3: ORION-9 COMMAND HUB & SMART FACTORY (CENTER AT X: 2, Z: -1)
  // Twin domes, glowing Orion-9 facade cross emblem, robotic arms, optical QC
  // =========================================================================
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
  addEdges(hubBody, hubBodyGeo);
  commandHubGroup.add(hubBody);

  const hubGlassGeo = new THREE.BoxGeometry(9.8, 1.35, 6.8);
  const hubGlass = new THREE.Mesh(hubGlassGeo, glassBlueMat);
  hubGlass.position.set(0, 3.25, 0);
  commandHubGroup.add(hubGlass);

  const hubRoofGeo = new THREE.BoxGeometry(10.6, 0.48, 7.4);
  const hubRoof = new THREE.Mesh(hubRoofGeo, iceSlateMat);
  hubRoof.position.set(0, 5.15, 0);
  addEdges(hubRoof, hubRoofGeo);
  commandHubGroup.add(hubRoof);

  // Glowing Orion-9 Emblem on Command Hub Facade (Reference Screenshot 3 & 4)
  const facadeEmblemGroup = new THREE.Group();
  facadeEmblemGroup.position.set(1.8, 2.6, 3.42);
  const emblemBarGeo = new THREE.BoxGeometry(1.95, 0.46, 0.18);
  const bar1 = new THREE.Mesh(emblemBarGeo, cyanEmissiveMat);
  bar1.rotation.z = Math.PI / 4;
  const bar2 = new THREE.Mesh(emblemBarGeo, cyanEmissiveMat);
  bar2.rotation.z = -Math.PI / 4;
  facadeEmblemGroup.add(bar1, bar2);
  commandHubGroup.add(facadeEmblemGroup);

  // Twin domes on roof
  const domeGeo = new THREE.SphereGeometry(0.75, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  [-2.6, -0.8].forEach((dx) => {
    const dome = new THREE.Mesh(domeGeo, whiteArchMat);
    dome.position.set(dx, 5.38, -1.2);
    commandHubGroup.add(dome);
  });

  // Internal Assembly Conveyor Bed
  const convBedGeo = new THREE.BoxGeometry(6.8, 0.22, 0.85);
  const convBed = new THREE.Mesh(convBedGeo, darkNavyMat);
  convBed.position.set(0, 0.85, 0);
  commandHubGroup.add(convBed);

  // Articulated 6-Axis Robotic Arms
  const createRoboticArm = (x: number, z: number, phase: number) => {
    const armBase = new THREE.Group();
    armBase.position.set(x, 0.95, z);

    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.35, 0.28, 12), steelBlueMat);
    armBase.add(pedestal);

    const upperArm = new THREE.Group();
    upperArm.position.set(0, 0.2, 0);
    const upperLink = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.85, 0.22), whiteArchMat);
    upperLink.position.set(0, 0.42, 0);
    upperArm.add(upperLink);

    const forearm = new THREE.Group();
    forearm.position.set(0, 0.85, 0);
    const forearmLink = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.7, 0.18), steelBlueMat);
    forearmLink.position.set(0, 0.35, 0);
    const toolHead = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 0.22, 8), darkNavyMat);
    toolHead.position.set(0, 0.75, 0);
    toolHead.rotation.x = Math.PI / 2;
    forearm.add(forearmLink, toolHead);

    upperArm.add(forearm);
    armBase.add(upperArm);

    const sparkLight = new THREE.PointLight(0x38bdf8, 1.2, 2.4);
    sparkLight.position.set(0, 0.8, 0.2);
    forearm.add(sparkLight);

    commandHubGroup.add(armBase);
    roboticArms.push({ base: armBase, upperArm, forearm, sparkLight, phase });
  };

  createRoboticArm(-2.0, 1.2, 0.0);
  createRoboticArm(1.4, 1.2, 2.2);

  // Optical QC Scanner Arch
  const qcArchGeo = new THREE.BoxGeometry(0.3, 1.6, 1.6);
  const qcArch = new THREE.Mesh(qcArchGeo, whiteArchMat);
  qcArch.position.set(2.6, 1.4, 0);
  addEdges(qcArch, qcArchGeo);
  commandHubGroup.add(qcArch);

  const scanPlaneGeo = new THREE.PlaneGeometry(0.05, 1.35);
  const scanPlane = new THREE.Mesh(scanPlaneGeo, cyanEmissiveMat);
  scanPlane.position.set(2.6, 1.4, 0);
  scanPlane.rotation.y = Math.PI / 2;
  commandHubGroup.add(scanPlane);

  // Conveyor items
  for (let i = 0; i < 4; i++) {
    const item = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.35, 0.42),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.35, metalness: 0.25 })
    );
    item.position.set(-2.4 + i * 1.5, 1.05, 0);
    commandHubGroup.add(item);
    conveyorItems.push({ mesh: item, startX: -2.8, endX: 2.8, z: 0, y: 1.05 });
  }

  rootGroup.add(commandHubGroup);

  // =========================================================================
  // 8. GLOWING CORAL ORIGIN TRACES & CONTINUOUS ELECTRIC-CYAN PIPELINE
  // =========================================================================
  const redTrace1Points = [
    new THREE.Vector3(-36, 0.16, 4),
    new THREE.Vector3(-22, 0.16, 4),
    new THREE.Vector3(-14, 0.16, -1),
    new THREE.Vector3(-3, 0.16, -1),
  ];
  const redCurve1 = new THREE.CatmullRomCurve3(redTrace1Points);
  const redTubeGeo1 = new THREE.TubeGeometry(redCurve1, 64, 0.18, 8, false);
  const redTube1Mesh = new THREE.Mesh(redTubeGeo1, redSignalMat);
  rootGroup.add(redTube1Mesh);

  const redTrace2Points = [
    new THREE.Vector3(-26, 0.16, 6.2),
    new THREE.Vector3(-14, 0.16, 2.2),
    new THREE.Vector3(-3, 0.16, 0.5),
  ];
  const redCurve2 = new THREE.CatmullRomCurve3(redTrace2Points);
  const redTubeGeo2 = new THREE.TubeGeometry(redCurve2, 48, 0.15, 8, false);
  const redTube2Mesh = new THREE.Mesh(redTubeGeo2, redSignalMat);
  rootGroup.add(redTube2Mesh);

  // Continuous Electric-Cyan Energy Pipeline from Command Hub (X: 6.5) -> Distribution Warehouse Hub (X: 68.5)
  const cyanPipelinePoints = [
    new THREE.Vector3(6.5, 0.38, -1.0),
    new THREE.Vector3(15.0, 0.38, -1.0),
    new THREE.Vector3(23.0, 0.38, 2.2),
    new THREE.Vector3(34.0, 0.38, -2.5),
    new THREE.Vector3(46.0, 0.38, 1.5),
    new THREE.Vector3(56.0, 0.38, -1.0),
    new THREE.Vector3(68.5, 0.38, -1.0),
  ];
  const cyanPipelineCurve = new THREE.CatmullRomCurve3(cyanPipelinePoints);
  const cyanPipelineGeo = new THREE.TubeGeometry(cyanPipelineCurve, 140, 0.32, 12, false);
  const cyanPipelineMat = createRoutePulseShaderMaterial({
    baseColorHex: 0x0077ee,
    pulseColorHex: 0x7dd3fc,
    initialDrawProgress: 0.22,
    opacity: 0.98,
  });
  const cyanPipelineMesh = new THREE.Mesh(cyanPipelineGeo, cyanPipelineMat);
  rootGroup.add(cyanPipelineMesh);

  const channelGeo = new THREE.TubeGeometry(cyanPipelineCurve, 100, 0.46, 8, false);
  const channelMesh = new THREE.Mesh(channelGeo, iceSlateMat);
  channelMesh.position.y = -0.2;
  rootGroup.add(channelMesh);

  // =========================================================================
  // 9. TWIN COOLING TOWERS, INSPECTION GATES & CONTAINER YARDS (X: 18..54)
  // =========================================================================
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

  rootGroup.add(createCoolingTower(24, -9.5, 3.2, 8.5));
  rootGroup.add(createCoolingTower(32, -10.5, 2.8, 7.6));

  [19, 34, 48].forEach((gx) => {
    const pt = cyanPipelineCurve.getPointAt((gx - 6.5) / 62);
    const gateGroup = new THREE.Group();
    gateGroup.position.set(pt.x, 0, pt.z);

    const archGeo = new THREE.BoxGeometry(1.25, 3.6, 4.6);
    const arch = new THREE.Mesh(archGeo, whiteArchMat);
    arch.position.y = 1.8;
    addEdges(arch, archGeo);
    gateGroup.add(arch);

    const scannerGeo = new THREE.BoxGeometry(1.36, 0.35, 4.78);
    const scanner = new THREE.Mesh(scannerGeo, cyanEmissiveMat.clone());
    scanner.position.y = 3.25;
    gateGroup.add(scanner);
    checkpointGates.push(scanner);

    rootGroup.add(gateGroup);
  });

  // Container yards
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
      const cBox = new THREE.Mesh(boxGeo, cMat);
      cBox.position.set(yp.x, 0.55 + s * 1.12, yp.z);
      cBox.castShadow = !isSoftwareGl;
      rootGroup.add(cBox);
    }
  });

  // =========================================================================
  // 10. STAGE 4 & 5: GLOBAL DISTRIBUTION HUB, WAREHOUSE & AIR TERMINAL (X ≈ 65..85)
  // =========================================================================
  const distributionHubGroup = new THREE.Group();
  distributionHubGroup.position.set(70, 0, 0);

  const whWidth = 20.0;
  const whHeight = 6.4;
  const whDepth = 12.0;

  const whBodyGeo = new THREE.BoxGeometry(whWidth, whHeight, whDepth);
  const whBody = new THREE.Mesh(whBodyGeo, whiteArchMat);
  whBody.position.y = whHeight / 2;
  whBody.castShadow = !isSoftwareGl;
  whBody.receiveShadow = !isSoftwareGl;
  addEdges(whBody, whBodyGeo);
  distributionHubGroup.add(whBody);

  // Skylights on warehouse roof
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

  // Rooftop Emblem
  const roofEmblemGroup = new THREE.Group();
  roofEmblemGroup.position.set(0, whHeight + 0.88, -0.8);
  const roofBaseDisc = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 0.14, 6), darkNavyMat);
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

  // Six Truck Loading Bays
  const canopyGeo = new THREE.BoxGeometry(whWidth - 1.0, 0.32, 2.4);
  const canopyMesh = new THREE.Mesh(canopyGeo, steelBlueMat);
  canopyMesh.position.set(0, 2.95, 5.2);
  distributionHubGroup.add(canopyMesh);

  const bayDoorGeo = new THREE.BoxGeometry(2.1, 2.35, 0.16);
  const bayApronGeo = new THREE.BoxGeometry(2.3, 0.06, 3.2);

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
    const beaconMesh = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.22, 0.2), beaconMat);
    beaconMesh.position.set(bx, 2.72, 4.58);
    distributionHubGroup.add(beaconMesh);
    bayBeaconMats.push(beaconMat);
  }

  // ASRS Moving Elevator Carriage inside warehouse
  const asrsMastGeo = new THREE.BoxGeometry(0.3, 5.4, 0.3);
  const asrsMast = new THREE.Mesh(asrsMastGeo, steelBlueMat);
  asrsMast.position.set(0, 3.2, 0);
  distributionHubGroup.add(asrsMast);

  const asrsCarrierMesh = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.25, 1.2), cyanEmissiveMat);
  asrsCarrierMesh.position.set(0, 2.4, 0);
  distributionHubGroup.add(asrsCarrierMesh);

  rootGroup.add(distributionHubGroup);

  // Air-Freight Runway North of Warehouse
  const airTerminalGroup = new THREE.Group();
  airTerminalGroup.position.set(75, 0, -13.2);
  rootGroup.add(airTerminalGroup);

  const runwayGeo = new THREE.BoxGeometry(52, 0.16, 6.4);
  const runwayMesh = new THREE.Mesh(runwayGeo, runwaySurfaceMat);
  runwayMesh.position.set(0, 0.08, 0);
  runwayMesh.receiveShadow = !isSoftwareGl;
  airTerminalGroup.add(runwayMesh);

  const dashGeo = new THREE.BoxGeometry(2.4, 0.04, 0.28);
  for (let dx = -22; dx <= 22; dx += 4.8) {
    const dash = new THREE.Mesh(dashGeo, whiteArchMat);
    dash.position.set(dx, 0.19, 0);
    airTerminalGroup.add(dash);
  }

  const hangarGeo = new THREE.BoxGeometry(9.5, 3.4, 4.2);
  const hangarMesh = new THREE.Mesh(hangarGeo, whiteArchMat);
  hangarMesh.position.set(-13, 1.7, -5.2);
  addEdges(hangarMesh, hangarGeo);
  airTerminalGroup.add(hangarMesh);

  const apronJet = createCompositeCargoAircraft(0x0284c7);
  apronJet.scale.setScalar(0.45);
  apronJet.rotation.y = Math.PI / 2;
  apronJet.position.set(3.5, 0.6, 0.2);
  airTerminalGroup.add(apronJet);

  // =========================================================================
  // 11. STAGE 6 & 7: REGIONAL RETAIL & END CUSTOMER CAMPUS (X ≈ 90..115)
  // =========================================================================
  const retailGroup = new THREE.Group();
  retailGroup.position.set(98, 0, 4);

  const retailGeo = new THREE.BoxGeometry(6.5, 2.8, 4.5);
  const retailMesh = new THREE.Mesh(retailGeo, whiteArchMat);
  retailMesh.position.y = 1.4;
  addEdges(retailMesh, retailGeo);
  retailGroup.add(retailMesh);

  const retailCanopy = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.18, 1.4), steelBlueMat);
  retailCanopy.position.set(0, 2.2, 2.6);
  retailGroup.add(retailCanopy);
  rootGroup.add(retailGroup);

  const customerGroup = new THREE.Group();
  customerGroup.position.set(114, 0, -3);

  const campusGeo = new THREE.BoxGeometry(7.2, 3.6, 5.2);
  const campusMesh = new THREE.Mesh(campusGeo, whiteArchMat);
  campusMesh.position.y = 1.8;
  addEdges(campusMesh, campusGeo);
  customerGroup.add(campusMesh);

  const podRing = new THREE.Mesh(new THREE.RingGeometry(0.8, 1.2, 16), greenVerifiedMat);
  podRing.rotation.x = -Math.PI / 2;
  podRing.position.set(0, 0.04, 3.4);
  customerGroup.add(podRing);
  rootGroup.add(customerGroup);

  // =========================================================================
  // 12. ANIMATED FLEET (SHIPS, HIGHWAY TRUCKS, AIR-CARGO)
  // =========================================================================
  const ship1 = createCompositeContainerShip(0x1d4ed8);
  ship1.scale.setScalar(0.5);
  ship1.rotation.y = Math.PI / 2;
  ship1.position.set(-32, 0.08, 15.6);
  rootGroup.add(ship1);

  const ship2 = createCompositeContainerShip(0x0284c7);
  ship2.scale.setScalar(0.56);
  ship2.rotation.y = Math.PI / 2;
  ship2.position.set(72, 0.08, 15.8);
  rootGroup.add(ship2);

  const truck1 = createCompositeFreightTruck(0x091428);
  truck1.scale.setScalar(0.32);
  truck1.rotation.y = Math.PI / 2;
  truck1.position.set(-24, 1.35, 7.8);
  rootGroup.add(truck1);

  const truck2 = createCompositeFreightTruck(0x0284c7);
  truck2.scale.setScalar(0.32);
  truck2.rotation.y = -Math.PI / 2;
  truck2.position.set(22, 1.35, 9.0);
  rootGroup.add(truck2);

  const hubTruck1 = createCompositeFreightTruck(0x070b19);
  hubTruck1.scale.setScalar(0.35);
  hubTruck1.rotation.y = 0;
  distributionHubGroup.add(hubTruck1);

  const hubTruck2 = createCompositeFreightTruck(0x0284c7);
  hubTruck2.scale.setScalar(0.35);
  hubTruck2.rotation.y = 0;
  distributionHubGroup.add(hubTruck2);

  const hubTruck3 = createCompositeFreightTruck(0x1e3a8a);
  hubTruck3.scale.setScalar(0.35);
  hubTruck3.rotation.y = Math.PI;
  distributionHubGroup.add(hubTruck3);

  const cargoJet = createCompositeCargoAircraft(0x091428);
  cargoJet.scale.setScalar(0.44);
  cargoJet.position.set(28, 10.5, -12);
  cargoJet.rotation.y = Math.PI * 0.44;
  rootGroup.add(cargoJet);

  // =========================================================================
  // 13. ORION-9 INTELLIGENCE DISRUPTION & RECOVERY RIG (SIMULATED DEMO)
  // =========================================================================
  const warningBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.65, 16, 12), amberWarningMat);
  warningBeacon.position.set(-14, 2.5, -1);
  warningBeacon.visible = false;
  rootGroup.add(warningBeacon);

  const warningLight = new THREE.PointLight(0xf59e0b, 0, 12);
  warningLight.position.set(-14, 3.2, -1);
  rootGroup.add(warningLight);

  // Emerald green bypass corridor from Supplier directly to Distribution Hub
  const bypassCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-14, 1.2, -1),
    new THREE.Vector3(8, 9.5, -12),
    new THREE.Vector3(38, 9.5, -12),
    new THREE.Vector3(68, 1.8, -1),
  ]);
  const bypassConduitMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: new THREE.Color(0x10b981),
    emissiveIntensity: 0.2,
    roughness: 0.2,
    metalness: 0.1,
    transparent: true,
    opacity: 0.85,
  });
  const bypassConduit = new THREE.Mesh(
    new THREE.TubeGeometry(bypassCurve, 80, 0.26, 10, false),
    bypassConduitMat
  );
  bypassConduit.visible = false;
  rootGroup.add(bypassConduit);

  const bypassGlowLight = new THREE.PointLight(0x10b981, 0, 18);
  bypassGlowLight.position.set(23, 9.5, -12);
  rootGroup.add(bypassGlowLight);

  const bypassAircraft = createCompositeCargoAircraft(0x10b981);
  bypassAircraft.scale.setScalar(0.38);
  bypassAircraft.visible = false;
  rootGroup.add(bypassAircraft);

  return {
    rootGroup,
    cyanPipelineMat,
    redTube1Mat: redSignalMat,
    redTube2Mat: redSignalMat,
    bypassConduitMat,
    turbineRotors,
    craneTrolleys,
    checkpointGates,
    skylightMats,
    bayBeaconMats,
    roofEmblemMat,
    facadeEmblem: facadeEmblemGroup,
    ship1,
    ship2,
    truck1,
    truck2,
    hubTruck1,
    hubTruck2,
    hubTruck3,
    cargoJet,
    bypassAircraft,
    roboticArms,
    qcScannerMesh: scanPlane,
    asrsCarrier: asrsCarrierMesh,
    conveyorItems,
    disruptionRig: {
      warningBeacon,
      warningLight,
      bypassConduit,
      bypassGlowLight,
    },
  };
}

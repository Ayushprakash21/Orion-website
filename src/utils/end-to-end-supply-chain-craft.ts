/**
 * ORION-9 MASTER ANIMATION — RECOMPOSED 7-STAGE INDUSTRIAL SUPPLY CHAIN DIGITAL TWIN
 * 
 * Perfectly proportioned architectural miniatures, compact horizontal span (X: -32 to +32),
 * continuous closed-loop path motion (ZERO teleportation / jumping), and clear stage identification.
 * 
 * Supply Chain Journey:
 * Stage 1: Raw Materials (Excavation terraces, ore hopper, bulk conveyor)
 * Stage 2: Supplier (Precision foundries, filtration stacks, parts staging)
 * Stage 3: Factory (Smart manufacturing plant, articulated robotic arms, optical QC scan line)
 * Stage 4: Warehouse (High-bay ASRS rack tower, pallet staging, indoor forklift)
 * Stage 5: Multimodal Distribution Hub (Deepwater canal berth, container ship, gantry crane)
 * Stage 6: Retailer (Commercial storefront, delivery bay, customer parking)
 * Stage 7: End Customer (Enterprise client campus, verified proof-of-delivery point)
 */

import * as THREE from 'three';

export interface PathVehicle {
  group: THREE.Group;
  curve: THREE.CatmullRomCurve3;
  speed: number;
  offset: number;
  currentT: number;
}

export interface WorkerFigure {
  group: THREE.Group;
  baseY: number;
  phase: number;
}

export interface Scene3DRig {
  rootGroup: THREE.Group;
  // Vehicles on continuous closed loops
  truck1: PathVehicle;
  truck2: PathVehicle;
  deliveryVan: PathVehicle;
  containerShip: PathVehicle;
  cargoJet: PathVehicle;
  bypassAircraft: PathVehicle;
  forklift: PathVehicle;
  // Internal machinery
  roboticArms: {
    base: THREE.Group;
    upperArm: THREE.Group;
    forearm: THREE.Group;
    sparkLight: THREE.PointLight;
    phase: number;
  }[];
  qcScannerMesh: THREE.Mesh;
  asrsCarriers: { mesh: THREE.Mesh; startY: number; targetY: number; speed: number }[];
  conveyorItems: { mesh: THREE.Mesh; startX: number; endX: number; z: number; y: number }[];
  craneTrolleys: { group: THREE.Group; baseZ: number; phase: number }[];
  workers: WorkerFigure[];
  // Status beacons
  statusBeacons: {
    supplier: THREE.Mesh;
    factory: THREE.Mesh;
    warehouse: THREE.Mesh;
    port: THREE.Mesh;
    customer: THREE.Mesh;
  };
  disruptionRig: {
    chokepointBeacon: THREE.Mesh;
    chokepointCorridor: THREE.Mesh;
    bypassCorridor: THREE.Mesh;
    bypassGlowLight: THREE.PointLight;
  };
}

export function buildEndToEndSupplyChainWorld(isSoftwareGl: boolean): Scene3DRig {
  const rootGroup = new THREE.Group();

  // =========================================================================
  // 1. ARCHITECTURAL PBR MATERIALS
  // =========================================================================
  const whiteArchMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.45,
    metalness: 0.08,
  });
  const navyPlinthMat = new THREE.MeshStandardMaterial({
    color: 0x0f2744,
    roughness: 0.35,
    metalness: 0.35,
  });
  const steelBlueMat = new THREE.MeshStandardMaterial({
    color: 0x2563eb,
    roughness: 0.35,
    metalness: 0.25,
  });
  const iceSlateMat = new THREE.MeshStandardMaterial({
    color: 0xc8dded,
    roughness: 0.45,
    metalness: 0.12,
  });
  const glassBlueMat = new THREE.MeshStandardMaterial({
    color: 0x93c5fd,
    roughness: 0.12,
    metalness: 0.25,
    transparent: true,
    opacity: 0.8,
  });
  const asphaltRoadMat = new THREE.MeshStandardMaterial({
    color: 0xb4cce0,
    roughness: 0.82,
    metalness: 0.05,
  });
  const waterCanalMat = new THREE.MeshStandardMaterial({
    color: 0x60a5fa,
    roughness: 0.18,
    metalness: 0.35,
  });
  const archEdgeMat = new THREE.LineBasicMaterial({
    color: 0x7dd3fc,
    transparent: true,
    opacity: 0.65,
  });
  const cyanGlowMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    emissive: new THREE.Color(0x0284c7),
    emissiveIntensity: 1.4,
    roughness: 0.2,
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
  const hiVisYellowMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    roughness: 0.5,
    metalness: 0.1,
  });

  const roboticArms: Scene3DRig['roboticArms'] = [];
  const asrsCarriers: Scene3DRig['asrsCarriers'] = [];
  const conveyorItems: Scene3DRig['conveyorItems'] = [];
  const craneTrolleys: Scene3DRig['craneTrolleys'] = [];
  const workers: WorkerFigure[] = [];

  const addEdges = (mesh: THREE.Mesh, geo: THREE.BufferGeometry) => {
    mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), archEdgeMat));
  };

  // Helper to create small stylized worker figures (height 0.7)
  const createWorker = (x: number, y: number, z: number, phase: number, vestColor = 0xfacc15): WorkerFigure => {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    const torso = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.12, 0.28, 8),
      new THREE.MeshStandardMaterial({ color: vestColor, roughness: 0.4 })
    );
    torso.position.y = 0.28;

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), whiteArchMat);
    head.position.y = 0.5;

    const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.11, 0.05, 8), hiVisYellowMat);
    hat.position.y = 0.55;

    const legs = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.2, 6), navyPlinthMat);
    legs.position.y = 0.1;

    group.add(torso, head, hat, legs);
    rootGroup.add(group);

    const workerObj: WorkerFigure = { group, baseY: y, phase };
    workers.push(workerObj);
    return workerObj;
  };

  // Helper to add a clean, floating stage indicator label pin above each facility
  const addStageMarker = (parent: THREE.Group, num: string, yPos: number) => {
    const pin = new THREE.Group();
    pin.position.set(0, yPos, 0);

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.7, 6), navyPlinthMat);
    stem.position.y = 0.35;

    const badge = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.38, 0.1, 14),
      navyPlinthMat
    );
    badge.position.y = 0.7;
    badge.rotation.x = Math.PI / 4;

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.24, 0.34, 14),
      cyanGlowMat
    );
    ring.position.set(0, 0.76, 0.06);
    ring.rotation.x = -Math.PI / 4;

    pin.add(stem, badge, ring);
    parent.add(pin);
  };

  // =========================================================================
  // 2. STAGE 1: RAW MATERIALS (X ≈ -31, Z ≈ -3)
  // Stepped quarry terraces, mineral crushing hopper, silos, elevated truss
  // =========================================================================
  const stage1Group = new THREE.Group();
  stage1Group.position.set(-31, 0, -3);

  // Stepped quarry excavation benches
  [6.0, 4.6, 3.4, 2.2].forEach((r, idx) => {
    const bGeo = new THREE.CylinderGeometry(r - 0.45, r, 0.38, 16);
    const bench = new THREE.Mesh(bGeo, iceSlateMat);
    bench.position.set(-1.8, idx * 0.32 + 0.16, 0);
    bench.receiveShadow = !isSoftwareGl;
    stage1Group.add(bench);
  });

  // Ore Crushing Hopper Facility
  const hopperGeo = new THREE.BoxGeometry(3.6, 2.4, 2.8);
  const hopper = new THREE.Mesh(hopperGeo, whiteArchMat);
  hopper.position.set(3.2, 1.2, 1.8);
  addEdges(hopper, hopperGeo);
  stage1Group.add(hopper);

  const hopperBase = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.28, 3.0), navyPlinthMat);
  hopperBase.position.set(3.2, 0.14, 1.8);
  stage1Group.add(hopperBase);

  // Twin Bulk Storage Silos
  [-0.9, 0.9].forEach((sx) => {
    const sGeo = new THREE.CylinderGeometry(0.65, 0.65, 2.8, 12);
    const silo = new THREE.Mesh(sGeo, iceSlateMat);
    silo.position.set(3.2 + sx, 1.4, -1.5);
    stage1Group.add(silo);
  });

  // Elevated Ore Conveyor Gantry
  const trussGeo = new THREE.BoxGeometry(4.8, 0.22, 0.45);
  const truss = new THREE.Mesh(trussGeo, steelBlueMat);
  truss.position.set(0.8, 1.6, 0.8);
  truss.rotation.z = -0.15;
  stage1Group.add(truss);

  addStageMarker(stage1Group, '01', 2.8);
  rootGroup.add(stage1Group);

  // =========================================================================
  // 3. STAGE 2: TIER-1 SUPPLIER FOUNDRY & FAB (X ≈ -21, Z ≈ 4)
  // Component Foundry Building, Saw-tooth roof, Filtration Stacks, Loading Bay
  // =========================================================================
  const stage2Group = new THREE.Group();
  stage2Group.position.set(-21, 0, 4);

  const foundryGeo = new THREE.BoxGeometry(4.8, 2.2, 3.8);
  const foundry = new THREE.Mesh(foundryGeo, whiteArchMat);
  foundry.position.set(0, 1.1, 0);
  addEdges(foundry, foundryGeo);
  stage2Group.add(foundry);

  const foundryPlinth = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.25, 4.0), navyPlinthMat);
  foundryPlinth.position.set(0, 0.125, 0);
  stage2Group.add(foundryPlinth);

  // Filtration stacks
  [-1.3, 0, 1.3].forEach((stx) => {
    const stackGeo = new THREE.CylinderGeometry(0.16, 0.22, 3.2, 10);
    const stack = new THREE.Mesh(stackGeo, steelBlueMat);
    stack.position.set(stx, 2.4, -1.0);
    stage2Group.add(stack);
  });

  // Component staging dock
  const suppDockGeo = new THREE.BoxGeometry(3.6, 1.2, 1.8);
  const suppDock = new THREE.Mesh(suppDockGeo, iceSlateMat);
  suppDock.position.set(-0.4, 0.6, 2.4);
  addEdges(suppDock, suppDockGeo);
  stage2Group.add(suppDock);

  const suppBeacon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 0.14, 12),
    cyanGlowMat
  );
  suppBeacon.position.set(0, 2.3, 0);
  stage2Group.add(suppBeacon);

  addStageMarker(stage2Group, '02', 2.8);
  rootGroup.add(stage2Group);

  // =========================================================================
  // 4. STAGE 3: SMART FACTORY & AUTOMATED ASSEMBLY (X ≈ -10, Z ≈ -3)
  // Modern smart manufacturing pavilion, robotic arms, optical QC scanner
  // =========================================================================
  const stage3Group = new THREE.Group();
  stage3Group.position.set(-10, 0, -3);

  const factoryMainGeo = new THREE.BoxGeometry(6.2, 2.6, 4.6);
  const factoryMain = new THREE.Mesh(factoryMainGeo, whiteArchMat);
  factoryMain.position.set(0, 1.3, 0);
  addEdges(factoryMain, factoryMainGeo);
  stage3Group.add(factoryMain);

  const factoryPlinth = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.25, 4.8), navyPlinthMat);
  factoryPlinth.position.set(0, 0.125, 0);
  stage3Group.add(factoryPlinth);

  // Front Panorama Glass
  const factoryGlassGeo = new THREE.BoxGeometry(5.8, 1.6, 0.12);
  const factoryGlass = new THREE.Mesh(factoryGlassGeo, glassBlueMat);
  factoryGlass.position.set(0, 1.3, 2.32);
  stage3Group.add(factoryGlass);

  // Internal Assembly Conveyor Bed
  const convBedGeo = new THREE.BoxGeometry(5.2, 0.18, 0.7);
  const convBed = new THREE.Mesh(convBedGeo, navyPlinthMat);
  convBed.position.set(0, 0.45, 0.5);
  stage3Group.add(convBed);

  // Articulated 6-Axis Robotic Assembly Arms
  const createRoboticArm = (x: number, z: number, phase: number) => {
    const armBase = new THREE.Group();
    armBase.position.set(x, 0.55, z);

    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.3, 0.22, 10),
      steelBlueMat
    );
    armBase.add(pedestal);

    const upperArm = new THREE.Group();
    upperArm.position.set(0, 0.16, 0);
    const upperLink = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.75, 0.18), whiteArchMat);
    upperLink.position.set(0, 0.38, 0);
    upperArm.add(upperLink);

    const forearm = new THREE.Group();
    forearm.position.set(0, 0.75, 0);
    const forearmLink = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.6, 0.15), steelBlueMat);
    forearmLink.position.set(0, 0.3, 0);
    const toolHead = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.1, 0.2, 8), navyPlinthMat);
    toolHead.position.set(0, 0.65, 0);
    toolHead.rotation.x = Math.PI / 2;
    forearm.add(forearmLink, toolHead);

    upperArm.add(forearm);
    armBase.add(upperArm);

    const sparkLight = new THREE.PointLight(0x38bdf8, 1.2, 2.2);
    sparkLight.position.set(0, 0.7, 0.15);
    forearm.add(sparkLight);

    stage3Group.add(armBase);
    roboticArms.push({ base: armBase, upperArm, forearm, sparkLight, phase });
  };

  createRoboticArm(-1.4, 1.1, 0.0);
  createRoboticArm(1.0, 1.1, 2.1);

  // Optical QC Scanner Arch (Holographic Cyan Laser Line)
  const qcArchGeo = new THREE.BoxGeometry(0.26, 1.3, 1.3);
  const qcArch = new THREE.Mesh(qcArchGeo, whiteArchMat);
  qcArch.position.set(1.9, 1.0, 0.5);
  addEdges(qcArch, qcArchGeo);
  stage3Group.add(qcArch);

  const scanPlaneGeo = new THREE.PlaneGeometry(0.04, 1.1);
  const scanPlane = new THREE.Mesh(scanPlaneGeo, cyanGlowMat);
  scanPlane.position.set(1.9, 1.0, 0.5);
  scanPlane.rotation.y = Math.PI / 2;
  stage3Group.add(scanPlane);

  // Moving Assembly Goods on the conveyor
  for (let i = 0; i < 4; i++) {
    const item = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.28, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.35, metalness: 0.25 })
    );
    item.position.set(-1.8 + i * 1.2, 0.7, 0.5);
    stage3Group.add(item);
    conveyorItems.push({ mesh: item, startX: -2.2, endX: 2.2, z: 0.5, y: 0.7 });
  }

  const factoryBeacon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 0.14, 12),
    greenVerifiedMat
  );
  factoryBeacon.position.set(0, 2.7, 0);
  stage3Group.add(factoryBeacon);

  createWorker(-9.5, 0, -0.8, 0.5);
  addStageMarker(stage3Group, '03', 3.0);
  rootGroup.add(stage3Group);

  // =========================================================================
  // 5. STAGE 4: AUTOMATED WAREHOUSE & ASRS (X ≈ 1, Z ≈ 5)
  // High-bay rack structure, moving elevator carriage, indoor forklift
  // =========================================================================
  const stage4Group = new THREE.Group();
  stage4Group.position.set(1, 0, 5);

  const asrsGeo = new THREE.BoxGeometry(5.6, 3.2, 4.2);
  const asrsBuilding = new THREE.Mesh(asrsGeo, whiteArchMat);
  asrsBuilding.position.set(0, 1.6, 0);
  addEdges(asrsBuilding, asrsGeo);
  stage4Group.add(asrsBuilding);

  const asrsPlinth = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.25, 4.4), navyPlinthMat);
  asrsPlinth.position.set(0, 0.125, 0);
  stage4Group.add(asrsPlinth);

  // High-bay glass clerestory
  const asrsGlassGeo = new THREE.BoxGeometry(5.7, 0.65, 4.3);
  const asrsGlass = new THREE.Mesh(asrsGlassGeo, glassBlueMat);
  asrsGlass.position.set(0, 2.6, 0);
  stage4Group.add(asrsGlass);

  // Storage Rack Aisles
  [-1.3, 1.3].forEach((rz) => {
    for (let shelfY = 0.6; shelfY <= 2.4; shelfY += 0.65) {
      const shelf = new THREE.Mesh(
        new THREE.BoxGeometry(3.8, 0.06, 0.55),
        steelBlueMat
      );
      shelf.position.set(0, shelfY, rz);
      stage4Group.add(shelf);
    }
  });

  // ASRS Moving Storage Carrier
  const carrierMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.85, 0.15, 0.65),
    cyanGlowMat
  );
  carrierMesh.position.set(0, 1.3, 0);
  stage4Group.add(carrierMesh);
  asrsCarriers.push({ mesh: carrierMesh, startY: 0.6, targetY: 2.6, speed: 1.4 });

  const warehouseBeacon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 0.14, 12),
    greenVerifiedMat
  );
  warehouseBeacon.position.set(0, 3.3, 0);
  stage4Group.add(warehouseBeacon);

  createWorker(2.2, 0, 7.5, 2.1);
  addStageMarker(stage4Group, '04', 3.6);
  rootGroup.add(stage4Group);

  // =========================================================================
  // 6. STAGE 5: MULTIMODAL DISTRIBUTION HUB & PORT (X ≈ 12, Z ≈ -4)
  // Cross-dock terminal, deepwater canal berth, gantry crane
  // =========================================================================
  const stage5Group = new THREE.Group();
  stage5Group.position.set(12, 0, -4);

  const hubGeo = new THREE.BoxGeometry(5.4, 2.2, 3.8);
  const hub = new THREE.Mesh(hubGeo, whiteArchMat);
  hub.position.set(0, 1.1, 0);
  addEdges(hub, hubGeo);
  stage5Group.add(hub);

  const hubPlinth = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.25, 4.0), navyPlinthMat);
  hubPlinth.position.set(0, 0.125, 0);
  stage5Group.add(hubPlinth);

  // Cross-dock doors
  [-1.5, -0.5, 0.5, 1.5].forEach((dx) => {
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.95, 0.06), navyPlinthMat);
    door.position.set(dx, 0.48, 1.92);
    stage5Group.add(door);
  });

  // Deepwater Shipping Canal & Concrete Quay
  const canalGeo = new THREE.PlaneGeometry(24, 7.5);
  canalGeo.rotateX(-Math.PI / 2);
  const canal = new THREE.Mesh(canalGeo, waterCanalMat);
  canal.position.set(0, 0.04, -6.8);
  stage5Group.add(canal);

  const quayGeo = new THREE.BoxGeometry(24, 0.3, 1.4);
  const quay = new THREE.Mesh(quayGeo, whiteArchMat);
  quay.position.set(0, 0.15, -3.1);
  addEdges(quay, quayGeo);
  stage5Group.add(quay);

  // Gantry Container Crane
  const craneGroup = new THREE.Group();
  craneGroup.position.set(0, 0, -3.1);

  const legGeo = new THREE.BoxGeometry(0.2, 3.4, 0.2);
  [-1.0, 1.0].forEach((lx) => {
    [-0.55, 0.55].forEach((lz) => {
      const leg = new THREE.Mesh(legGeo, whiteArchMat);
      leg.position.set(lx, 1.7, lz);
      craneGroup.add(leg);
    });
  });

  const boomGeo = new THREE.BoxGeometry(0.8, 0.25, 5.0);
  const boom = new THREE.Mesh(boomGeo, steelBlueMat);
  boom.position.set(0, 3.4, -1.0);
  craneGroup.add(boom);

  const trolley = new THREE.Group();
  trolley.position.set(0, 3.15, -1.0);
  const hoist = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.5), navyPlinthMat);
  const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 1.1, 6), iceSlateMat);
  cable.position.y = -0.55;
  const craneCont = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.48, 1.1), cyanGlowMat);
  craneCont.position.y = -1.2;
  trolley.add(hoist, cable, craneCont);
  craneGroup.add(trolley);
  craneTrolleys.push({ group: trolley, baseZ: -1.0, phase: 0 });

  stage5Group.add(craneGroup);

  const portBeacon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 0.14, 12),
    greenVerifiedMat
  );
  portBeacon.position.set(0, 2.3, 0);
  stage5Group.add(portBeacon);

  addStageMarker(stage5Group, '05', 2.8);
  rootGroup.add(stage5Group);

  // =========================================================================
  // 7. STAGE 6: REGIONAL RETAILER (X ≈ 22, Z ≈ 4)
  // Commercial storefront, retail entrance canopy, delivery bay
  // =========================================================================
  const stage6Group = new THREE.Group();
  stage6Group.position.set(22, 0, 4);

  const retailGeo = new THREE.BoxGeometry(4.4, 2.1, 3.2);
  const retailStore = new THREE.Mesh(retailGeo, whiteArchMat);
  retailStore.position.set(0, 1.05, 0);
  addEdges(retailStore, retailGeo);
  stage6Group.add(retailStore);

  const retailPlinth = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.25, 3.4), navyPlinthMat);
  retailPlinth.position.set(0, 0.125, 0);
  stage6Group.add(retailPlinth);

  // Storefront glass
  const retailGlassGeo = new THREE.BoxGeometry(3.8, 1.3, 0.1);
  const retailGlass = new THREE.Mesh(retailGlassGeo, glassBlueMat);
  retailGlass.position.set(0, 0.95, 1.62);
  stage6Group.add(retailGlass);

  // Entrance canopy
  const canopyGeo = new THREE.BoxGeometry(4.0, 0.12, 0.9);
  const canopy = new THREE.Mesh(canopyGeo, steelBlueMat);
  canopy.position.set(0, 1.75, 2.0);
  stage6Group.add(canopy);

  createWorker(22.6, 0, 5.8, 1.2);
  addStageMarker(stage6Group, '06', 2.6);
  rootGroup.add(stage6Group);

  // =========================================================================
  // 8. STAGE 7: END CUSTOMER DELIVERY (X ≈ 31, Z ≈ -3)
  // Modern enterprise campus destination, proof-of-delivery point
  // =========================================================================
  const stage7Group = new THREE.Group();
  stage7Group.position.set(31, 0, -3);

  const clientCampusGeo = new THREE.BoxGeometry(4.6, 2.6, 3.6);
  const clientCampus = new THREE.Mesh(clientCampusGeo, whiteArchMat);
  clientCampus.position.set(0, 1.3, 0);
  addEdges(clientCampus, clientCampusGeo);
  stage7Group.add(clientCampus);

  const campusPlinth = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.25, 3.8), navyPlinthMat);
  campusPlinth.position.set(0, 0.125, 0);
  stage7Group.add(campusPlinth);

  // Proof-of-Delivery Optical Beacon Ring
  const podRing = new THREE.Mesh(
    new THREE.RingGeometry(0.5, 0.7, 16),
    greenVerifiedMat
  );
  podRing.rotation.x = -Math.PI / 2;
  podRing.position.set(0, 0.03, 2.5);
  stage7Group.add(podRing);

  const customerBeacon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 0.14, 12),
    greenVerifiedMat
  );
  customerBeacon.position.set(0, 2.7, 0);
  stage7Group.add(customerBeacon);

  addStageMarker(stage7Group, '07', 3.0);
  rootGroup.add(stage7Group);

  // =========================================================================
  // 9. CONTINUOUS TRANSPORT TRAJECTORIES (ZERO TELEPORTATION / JUMPING)
  // =========================================================================
  // Helper to build a detailed freight truck (Cab + Trailer + Wheels)
  const createTruckModel = (cabColor = 0x0f2744, trailerColor = 0x2563eb): THREE.Group => {
    const truck = new THREE.Group();
    const cab = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.7, 0.8),
      new THREE.MeshStandardMaterial({ color: cabColor, roughness: 0.35, metalness: 0.3 })
    );
    cab.position.set(0.55, 0.45, 0);

    const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.7), glassBlueMat);
    windshield.position.set(0.75, 0.56, 0);
    cab.add(windshield);

    const trailer = new THREE.Mesh(
      new THREE.BoxGeometry(1.35, 0.78, 0.8),
      new THREE.MeshStandardMaterial({ color: trailerColor, roughness: 0.45, metalness: 0.2 })
    );
    trailer.position.set(-0.5, 0.5, 0);

    const wheelGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.1, 10);
    wheelGeo.rotateX(Math.PI / 2);
    [-0.9, -0.15, 0.55].forEach((wx) => {
      [-0.4, 0.4].forEach((wz) => {
        const wheel = new THREE.Mesh(wheelGeo, navyPlinthMat);
        wheel.position.set(wx, 0.14, wz);
        truck.add(wheel);
      });
    });

    truck.add(cab, trailer);
    truck.scale.setScalar(0.72);
    return truck;
  };

  // Helper to build an electric delivery van
  const createDeliveryVanModel = (): THREE.Group => {
    const van = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.72, 0.72), whiteArchMat);
    body.position.set(0, 0.45, 0);

    const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.12, 0.74), cyanGlowMat);
    stripe.position.set(0, 0.42, 0);

    const wheelGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.08, 10);
    wheelGeo.rotateX(Math.PI / 2);
    [-0.45, 0.45].forEach((wx) => {
      [-0.38, 0.38].forEach((wz) => {
        const wheel = new THREE.Mesh(wheelGeo, navyPlinthMat);
        wheel.position.set(wx, 0.13, wz);
        van.add(wheel);
      });
    });

    van.add(body, stripe);
    van.scale.setScalar(0.72);
    return van;
  };

  // Helper to build a container ship
  const createShipModel = (): THREE.Group => {
    const ship = new THREE.Group();
    const hullGeo = new THREE.BoxGeometry(5.2, 0.95, 1.5);
    const hull = new THREE.Mesh(hullGeo, navyPlinthMat);
    hull.position.y = 0.48;
    ship.add(hull);

    const bowGeo = new THREE.ConeGeometry(0.75, 1.2, 4);
    bowGeo.rotateZ(-Math.PI / 2);
    const bow = new THREE.Mesh(bowGeo, navyPlinthMat);
    bow.position.set(3.2, 0.48, 0);
    ship.add(bow);

    const bridgeGeo = new THREE.BoxGeometry(0.95, 1.2, 1.2);
    const bridge = new THREE.Mesh(bridgeGeo, whiteArchMat);
    bridge.position.set(-1.5, 1.2, 0);
    ship.add(bridge);

    const colPalette = [0x0284c7, 0xffffff, 0xcbe2f2, 0x10b981];
    for (let cx = -0.7; cx <= 1.8; cx += 0.8) {
      for (let ch = 0; ch < 2; ch++) {
        const cMesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.72, 0.38, 1.2),
          new THREE.MeshStandardMaterial({ color: colPalette[(Math.floor(cx * 2) + ch) % 4] })
        );
        cMesh.position.set(cx, 1.05 + ch * 0.4, 0);
        ship.add(cMesh);
      }
    }

    ship.scale.setScalar(0.8);
    return ship;
  };

  // Helper to build a cargo aircraft
  const createAircraftModel = (isBypass = false): THREE.Group => {
    const jet = new THREE.Group();
    const fuseGeo = new THREE.CylinderGeometry(0.32, 0.38, 3.8, 12);
    fuseGeo.rotateZ(Math.PI / 2);
    const fuse = new THREE.Mesh(fuseGeo, whiteArchMat);
    jet.add(fuse);

    const wingGeo = new THREE.BoxGeometry(0.68, 0.06, 4.2);
    const wing = new THREE.Mesh(wingGeo, isBypass ? greenVerifiedMat : steelBlueMat);
    wing.position.set(0.1, 0, 0);
    jet.add(wing);

    const tailGeo = new THREE.BoxGeometry(0.55, 0.72, 0.06);
    const tail = new THREE.Mesh(tailGeo, isBypass ? greenVerifiedMat : steelBlueMat);
    tail.position.set(-1.6, 0.45, 0);
    jet.add(tail);

    jet.scale.setScalar(0.75);
    return jet;
  };

  // Helper to build a miniature forklift
  const createForkliftModel = (): THREE.Group => {
    const fl = new THREE.Group();
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.38, 0.55), hiVisYellowMat);
    chassis.position.y = 0.25;

    const cage = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.5, 0.45), navyPlinthMat);
    cage.position.set(-0.08, 0.6, 0);

    const mast = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.72, 0.38), steelBlueMat);
    mast.position.set(0.38, 0.45, 0);

    const pallet = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.18, 0.38), iceSlateMat);
    pallet.position.set(0.56, 0.26, 0);

    fl.add(chassis, cage, mast, pallet);
    fl.scale.setScalar(0.68);
    return fl;
  };

  // -------------------------------------------------------------------------
  // Path 1: Truck 1 (Raw Materials <-> Supplier <-> Factory) Closed Loop
  // -------------------------------------------------------------------------
  const truck1Points = [
    new THREE.Vector3(-29, 0.1, -1.8),
    new THREE.Vector3(-24, 0.1, 1.5),
    new THREE.Vector3(-19, 0.1, 2.5),  // Supplier dock
    new THREE.Vector3(-14, 0.1, 0.2),
    new THREE.Vector3(-11, 0.1, -1.6), // Factory dock
    new THREE.Vector3(-12, 0.1, -5.5), // Bypass service lane
    new THREE.Vector3(-22, 0.1, -5.5),
    new THREE.Vector3(-29, 0.1, -4.5),
  ];
  const truck1Curve = new THREE.CatmullRomCurve3(truck1Points, true);
  const truck1Mesh = createTruckModel(0x0f2744, 0x2563eb);
  rootGroup.add(truck1Mesh);

  // -------------------------------------------------------------------------
  // Path 2: Truck 2 (Factory <-> Warehouse <-> Distribution) Closed Loop
  // -------------------------------------------------------------------------
  const truck2Points = [
    new THREE.Vector3(-8, 0.1, -1.6),
    new THREE.Vector3(-3, 0.1, 1.4),
    new THREE.Vector3(1, 0.1, 3.0),    // Warehouse dock
    new THREE.Vector3(7, 0.1, 0.6),
    new THREE.Vector3(11, 0.1, -2.0),  // Distribution dock
    new THREE.Vector3(10, 0.1, -5.2),  // Return lane
    new THREE.Vector3(0, 0.1, -4.5),
    new THREE.Vector3(-8, 0.1, -4.0),
  ];
  const truck2Curve = new THREE.CatmullRomCurve3(truck2Points, true);
  const truck2Mesh = createTruckModel(0x0f2744, 0x0284c7);
  rootGroup.add(truck2Mesh);

  // -------------------------------------------------------------------------
  // Path 3: Delivery Van (Distribution <-> Retailer <-> Customer) Closed Loop
  // -------------------------------------------------------------------------
  const vanPoints = [
    new THREE.Vector3(14, 0.1, -2.0),
    new THREE.Vector3(18, 0.1, 1.2),
    new THREE.Vector3(22, 0.1, 2.5),   // Retailer dock
    new THREE.Vector3(27, 0.1, 0.6),
    new THREE.Vector3(30, 0.1, -1.6),  // Customer drop
    new THREE.Vector3(30, 0.1, -4.8),  // Return circuit
    new THREE.Vector3(22, 0.1, -4.8),
    new THREE.Vector3(14, 0.1, -4.0),
  ];
  const vanCurve = new THREE.CatmullRomCurve3(vanPoints, true);
  const vanMesh = createDeliveryVanModel();
  rootGroup.add(vanMesh);

  // -------------------------------------------------------------------------
  // Path 4: Container Ship Maritime Route Closed Loop
  // -------------------------------------------------------------------------
  const shipPoints = [
    new THREE.Vector3(3, 0.12, -8.8),
    new THREE.Vector3(9, 0.12, -9.0),
    new THREE.Vector3(14, 0.12, -8.6), // Port approach
    new THREE.Vector3(19, 0.12, -7.8),
    new THREE.Vector3(21, 0.12, -9.6), // Basin loop
    new THREE.Vector3(16, 0.12, -10.4),
    new THREE.Vector3(9, 0.12, -10.4),
    new THREE.Vector3(3, 0.12, -9.8),
  ];
  const shipCurve = new THREE.CatmullRomCurve3(shipPoints, true);
  const shipMesh = createShipModel();
  rootGroup.add(shipMesh);

  // -------------------------------------------------------------------------
  // Path 5: High-Altitude Cargo Aircraft Sky Circuit Closed Loop
  // -------------------------------------------------------------------------
  const airPoints = [
    new THREE.Vector3(-30, 10.5, -8),
    new THREE.Vector3(-12, 11.0, -10),
    new THREE.Vector3(12, 11.0, -10),
    new THREE.Vector3(30, 10.5, -8),
    new THREE.Vector3(28, 10.0, -4),
    new THREE.Vector3(12, 10.2, -5),
    new THREE.Vector3(-12, 10.2, -5),
    new THREE.Vector3(-28, 10.0, -4),
  ];
  const airCurve = new THREE.CatmullRomCurve3(airPoints, true);
  const jetMesh = createAircraftModel(false);
  rootGroup.add(jetMesh);

  // -------------------------------------------------------------------------
  // Path 6: Scene 03 Autonomous Air-Bypass Corridor
  // -------------------------------------------------------------------------
  const bypassPoints = [
    new THREE.Vector3(-21, 2.0, 3.5),   // Supplier hub ascent
    new THREE.Vector3(-10, 6.8, -1.5),
    new THREE.Vector3(2, 7.5, -3.0),    // Cruising altitude
    new THREE.Vector3(12, 2.5, -2.5),   // Distribution hub descent
    new THREE.Vector3(6, 4.5, -6.5),    // Return transit circuit
    new THREE.Vector3(-10, 4.5, -6.5),
  ];
  const bypassCurve = new THREE.CatmullRomCurve3(bypassPoints, true);
  const bypassJetMesh = createAircraftModel(true);
  bypassJetMesh.visible = false;
  rootGroup.add(bypassJetMesh);

  // -------------------------------------------------------------------------
  // Path 7: Indoor Forklift Loop in Warehouse Yard
  // -------------------------------------------------------------------------
  const forkliftPoints = [
    new THREE.Vector3(0.5, 0.1, 6.2),
    new THREE.Vector3(2.4, 0.1, 6.2),
    new THREE.Vector3(2.4, 0.1, 7.8),
    new THREE.Vector3(0.5, 0.1, 7.8),
  ];
  const forkliftCurve = new THREE.CatmullRomCurve3(forkliftPoints, true);
  const forkliftMesh = createForkliftModel();
  rootGroup.add(forkliftMesh);

  // -------------------------------------------------------------------------
  // Visual Ground Road Network (Styled Asphalt Ribbons)
  // -------------------------------------------------------------------------
  const addStyledRoad = (curve: THREE.CatmullRomCurve3) => {
    const pts = curve.getPoints(70);
    const roadGeo = new THREE.BufferGeometry().setFromPoints(pts);
    const roadLine = new THREE.Line(
      roadGeo,
      new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.6 })
    );
    roadLine.position.y = 0.03;
    rootGroup.add(roadLine);
  };

  addStyledRoad(truck1Curve);
  addStyledRoad(truck2Curve);
  addStyledRoad(vanCurve);

  // =========================================================================
  // 10. DISRUPTION & RECOVERY RIG (Scene 02 & Scene 03 elements)
  // =========================================================================
  const chokepointBeacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.38, 12, 12),
    amberWarningMat
  );
  chokepointBeacon.position.set(9, 1.8, -9.0);
  chokepointBeacon.visible = false;
  rootGroup.add(chokepointBeacon);

  const chokeSubCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(6, 0.28, -8.9),
    new THREE.Vector3(9, 0.28, -9.0),
    new THREE.Vector3(12, 0.28, -8.8),
  ]);
  const chokeTube = new THREE.Mesh(
    new THREE.TubeGeometry(chokeSubCurve, 20, 0.18, 8, false),
    amberWarningMat
  );
  chokeTube.visible = false;
  rootGroup.add(chokeTube);

  const bypassConduit = new THREE.Mesh(
    new THREE.TubeGeometry(bypassCurve, 50, 0.15, 8, true),
    greenVerifiedMat
  );
  bypassConduit.visible = false;
  rootGroup.add(bypassConduit);

  const bypassGlowLight = new THREE.PointLight(0x10b981, 0, 14);
  bypassGlowLight.position.set(0, 6.5, -2.5);
  rootGroup.add(bypassGlowLight);

  return {
    rootGroup,
    truck1: { group: truck1Mesh, curve: truck1Curve, speed: 0.038, offset: 0.0, currentT: 0 },
    truck2: { group: truck2Mesh, curve: truck2Curve, speed: 0.034, offset: 0.35, currentT: 0.35 },
    deliveryVan: { group: vanMesh, curve: vanCurve, speed: 0.042, offset: 0.65, currentT: 0.65 },
    containerShip: { group: shipMesh, curve: shipCurve, speed: 0.018, offset: 0.1, currentT: 0.1 },
    cargoJet: { group: jetMesh, curve: airCurve, speed: 0.045, offset: 0.0, currentT: 0 },
    bypassAircraft: { group: bypassJetMesh, curve: bypassCurve, speed: 0.052, offset: 0.0, currentT: 0 },
    forklift: { group: forkliftMesh, curve: forkliftCurve, speed: 0.055, offset: 0.0, currentT: 0 },
    roboticArms,
    qcScannerMesh: scanPlane,
    asrsCarriers,
    conveyorItems,
    craneTrolleys,
    workers,
    statusBeacons: {
      supplier: suppBeacon,
      factory: factoryBeacon,
      warehouse: warehouseBeacon,
      port: portBeacon,
      customer: customerBeacon,
    },
    disruptionRig: {
      chokepointBeacon,
      chokepointCorridor: chokeTube,
      bypassCorridor: bypassConduit,
      bypassGlowLight,
    },
  };
}

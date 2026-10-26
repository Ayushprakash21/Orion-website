/**
 * ORION-9 MASTER ANIMATION — END-TO-END INTELLIGENT SUPPLY CHAIN
 * 3D Procedural Craft & Industrial Digital Twin Geometry
 * 
 * Builds an authentic, cinematic, connected 3D representation spanning:
 * 1. Raw Material Origins (Mining, Agriculture, Material Extraction)
 * 2. Supplier & Component Network (Tier-1/Tier-2 Precision Foundries & Plants)
 * 3. Intelligent Manufacturing (Smart Factory, Robotic Arms, Automated QC)
 * 4. Warehousing & Inventory (ASRS High-Bay Racks, Automated Sorting, AGVs)
 * 5. Multimodal Global Distribution (Sea Port, Air Cargo, Rail & Highway)
 * 6. Retail & End Customer (Distribution, Retail Store, Enterprise Delivery)
 * 7. Orion-9 Intelligence Engine (Neural Graph, Real-Time Sensor Conduits)
 * 8. Predictive Disruption & Automated Stochastic Bypass (Simulated Event)
 * 9. Panoramic Global Reveal
 */

import * as THREE from 'three';

export interface Scene3DRig {
  rootGroup: THREE.Group;
  roboticArms: {
    base: THREE.Group;
    upperArm: THREE.Group;
    forearm: THREE.Group;
    sparkLight: THREE.PointLight;
    phase: number;
  }[];
  qcScannerMesh: THREE.Mesh;
  asrsCarriers: { mesh: THREE.Mesh; startY: number; targetY: number; speed: number }[];
  agvVehicles: { group: THREE.Group; pathX: number; minZ: number; maxZ: number; speed: number }[];
  conveyorItems: { mesh: THREE.Mesh; startX: number; endX: number; z: number; y: number }[];
  craneTrolleys: { group: THREE.Group; baseZ: number; phase: number }[];
  turbineRotors: THREE.Group[];
  haulTrucks: { group: THREE.Group; startX: number; endX: number; z: number; speed: number }[];
  deliveryVans: { group: THREE.Group; startZ: number; endZ: number; x: number; speed: number }[];
  cargoJet: THREE.Group;
  containerShips: THREE.Group[];
  freightTrucks: THREE.Group[];
  trainCars: THREE.Group[];
  intelligencePulses: THREE.Mesh[];
  disruptionRig: {
    supplierWarningBeacon: THREE.Mesh;
    bottleneckFlowMesh: THREE.Mesh;
    bypassCorridorMesh: THREE.Mesh;
    bypassGlowLight: THREE.PointLight;
    factoryStatusBeacon: THREE.Mesh;
  };
}

export function buildEndToEndSupplyChainWorld(isSoftwareGl: boolean): Scene3DRig {
  const rootGroup = new THREE.Group();

  // =========================================================================
  // 1. ARCHITECTURAL PBR MATERIALS
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
    roughness: 0.18,
    metalness: 0.35,
    transparent: true,
    opacity: 0.85,
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
  const quarryTerraceMat = new THREE.MeshStandardMaterial({
    color: 0xb9cee0,
    roughness: 0.92,
    metalness: 0.05,
  });
  const oreStockpileMat = new THREE.MeshStandardMaterial({
    color: 0x7391a8,
    roughness: 0.95,
    metalness: 0.12,
  });
  const cyanEmissiveMat = new THREE.MeshStandardMaterial({
    color: 0x0099ff,
    emissive: new THREE.Color(0x0088ff),
    emissiveIntensity: 1.4,
    roughness: 0.2,
    metalness: 0.1,
  });
  const amberWarningMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: new THREE.Color(0xf59e0b),
    emissiveIntensity: 1.5,
    roughness: 0.25,
    metalness: 0.1,
  });
  const greenVerifiedMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: new THREE.Color(0x10b981),
    emissiveIntensity: 1.4,
    roughness: 0.2,
    metalness: 0.1,
  });

  // Trackers
  const roboticArms: Scene3DRig['roboticArms'] = [];
  const asrsCarriers: Scene3DRig['asrsCarriers'] = [];
  const agvVehicles: Scene3DRig['agvVehicles'] = [];
  const conveyorItems: Scene3DRig['conveyorItems'] = [];
  const craneTrolleys: Scene3DRig['craneTrolleys'] = [];
  const turbineRotors: THREE.Group[] = [];
  const haulTrucks: Scene3DRig['haulTrucks'] = [];
  const deliveryVans: Scene3DRig['deliveryVans'] = [];
  const containerShips: THREE.Group[] = [];
  const freightTrucks: THREE.Group[] = [];
  const trainCars: THREE.Group[] = [];
  const intelligencePulses: THREE.Mesh[] = [];

  // =========================================================================
  // 2. SCENE 1: RAW MATERIAL ORIGINS (X: -110 to -70, Z: -20 to +25)
  // Stepped Excavation Terraces, Mineral Crushing Plant, Silos & Bulk Railhead
  // =========================================================================
  const rawMaterialsGroup = new THREE.Group();
  rawMaterialsGroup.position.set(-88, 0, 2);

  // Stepped circular mining benches (quarry terraces)
  const terraceRadii = [18, 14, 10, 6];
  terraceRadii.forEach((r, idx) => {
    const terraceGeo = new THREE.CylinderGeometry(r - 1.2, r, 0.9, 24);
    const terrace = new THREE.Mesh(terraceGeo, quarryTerraceMat);
    terrace.position.set(-6, idx * 0.7 + 0.35, -4);
    terrace.receiveShadow = !isSoftwareGl;
    rawMaterialsGroup.add(terrace);
  });

  // Mineral Ore stockpiles
  const oreGeo1 = new THREE.ConeGeometry(3.6, 2.4, 12);
  const oreStockpile1 = new THREE.Mesh(oreGeo1, oreStockpileMat);
  oreStockpile1.position.set(4, 1.2, -6);
  rawMaterialsGroup.add(oreStockpile1);

  const oreGeo2 = new THREE.ConeGeometry(2.8, 1.8, 12);
  const oreStockpile2 = new THREE.Mesh(oreGeo2, oreStockpileMat);
  oreStockpile2.position.set(8.5, 0.9, -4.5);
  rawMaterialsGroup.add(oreStockpile2);

  // Primary Mineral Crushing & Refinement Plant
  const crusherPlantGeo = new THREE.BoxGeometry(8.5, 5.2, 6.4);
  const crusherPlant = new THREE.Mesh(crusherPlantGeo, whiteArchMat);
  crusherPlant.position.set(6, 2.6, 6);
  crusherPlant.add(new THREE.LineSegments(new THREE.EdgesGeometry(crusherPlantGeo), archEdgeMat));
  rawMaterialsGroup.add(crusherPlant);

  // Twin Bulk Storage Silos
  const siloGeo = new THREE.CylinderGeometry(1.8, 1.8, 6.2, 16);
  [-2, 2].forEach((sx) => {
    const silo = new THREE.Mesh(siloGeo, iceSlateMat);
    silo.position.set(6 + sx, 3.1, 12);
    silo.castShadow = !isSoftwareGl;
    rawMaterialsGroup.add(silo);
  });

  // Elevated Ore Conveyor Gantry linking quarry to crushing plant
  const conveyorTrussGeo = new THREE.BoxGeometry(14, 0.5, 1.1);
  const conveyorTruss = new THREE.Mesh(conveyorTrussGeo, steelBlueMat);
  conveyorTruss.position.set(-0.5, 3.2, 1);
  conveyorTruss.rotation.z = -0.14;
  rawMaterialsGroup.add(conveyorTruss);

  // Heavy Mineral Haul Truck in quarry
  const haulTruck = new THREE.Group();
  const haulCab = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.4, 1.6), darkNavyMat);
  haulCab.position.set(-1.0, 1.0, 0);
  const haulBed = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.5, 2.0), steelBlueMat);
  haulBed.position.set(1.0, 1.2, 0);
  haulTruck.add(haulCab, haulBed);
  haulTruck.scale.setScalar(0.42);
  haulTruck.position.set(-4, 0.2, 4);
  rawMaterialsGroup.add(haulTruck);
  haulTrucks.push({ group: haulTruck, startX: -14, endX: 2, z: 4, speed: 1.2 });

  rootGroup.add(rawMaterialsGroup);

  // =========================================================================
  // 2. SCENE 2: SUPPLIER & COMPONENT NETWORK (X: -60 to -25, Z: -15 to +20)
  // Precision Fabrication Plant, Foundry, Staging Bays & Parts Outbound
  // =========================================================================
  const supplierGroup = new THREE.Group();
  supplierGroup.position.set(-46, 0, 0);

  // Component Foundry Building
  const foundryGeo = new THREE.BoxGeometry(11, 4.4, 7.8);
  const foundry = new THREE.Mesh(foundryGeo, whiteArchMat);
  foundry.position.set(0, 2.2, 4);
  foundry.add(new THREE.LineSegments(new THREE.EdgesGeometry(foundryGeo), archEdgeMat));
  supplierGroup.add(foundry);

  // Industrial Exhaust / Filter Stacks
  const stackGeo = new THREE.CylinderGeometry(0.35, 0.45, 6.8, 12);
  [-2.5, 0, 2.5].forEach((stx) => {
    const stack = new THREE.Mesh(stackGeo, steelBlueMat);
    stack.position.set(stx, 4.2, 1.2);
    supplierGroup.add(stack);
  });

  // High-Tech Component Staging Bay
  const stagingBayGeo = new THREE.BoxGeometry(8.2, 3.2, 5.4);
  const stagingBay = new THREE.Mesh(stagingBayGeo, iceSlateMat);
  stagingBay.position.set(-2, 1.6, -5.5);
  stagingBay.add(new THREE.LineSegments(new THREE.EdgesGeometry(stagingBayGeo), archEdgeMat));
  supplierGroup.add(stagingBay);

  // Glass observation gallery
  const galleryGeo = new THREE.BoxGeometry(6.4, 1.1, 0.3);
  const gallery = new THREE.Mesh(galleryGeo, glassBlueMat);
  gallery.position.set(0, 3.2, 7.95);
  supplierGroup.add(gallery);

  rootGroup.add(supplierGroup);

  // =========================================================================
  // 3. SCENE 3: INTELLIGENT MANUFACTURING (X: -15 to +18, Z: -10 to +18)
  // Smart Factory, 6-Axis Robotic Arms, Automated QC Optical Scanner
  // =========================================================================
  const factoryGroup = new THREE.Group();
  factoryGroup.position.set(0, 0, 0);

  // Transparent / Cutaway Smart Factory Building
  const factoryMainGeo = new THREE.BoxGeometry(18, 5.6, 12);
  const factoryMain = new THREE.Mesh(factoryMainGeo, whiteArchMat);
  factoryMain.position.set(0, 2.8, 0);
  factoryMain.add(new THREE.LineSegments(new THREE.EdgesGeometry(factoryMainGeo), archEdgeMat));
  factoryGroup.add(factoryMain);

  // Front Panorama Glass Cladding
  const factoryGlassGeo = new THREE.BoxGeometry(17.2, 3.4, 0.2);
  const factoryGlass = new THREE.Mesh(factoryGlassGeo, glassBlueMat);
  factoryGlass.position.set(0, 2.8, 6.05);
  factoryGroup.add(factoryGlass);

  // High-Precision Linear Assembly Conveyor through the factory floor
  const conveyorBedGeo = new THREE.BoxGeometry(15, 0.35, 1.4);
  const conveyorBed = new THREE.Mesh(conveyorBedGeo, darkNavyMat);
  conveyorBed.position.set(0, 0.9, 0);
  factoryGroup.add(conveyorBed);

  // Articulated 6-Axis Robotic Arms along assembly stations
  const createRoboticArm = (x: number, z: number, phase: number) => {
    const armBase = new THREE.Group();
    armBase.position.set(x, 1.08, z);

    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.65, 0.45, 16), steelBlueMat);
    armBase.add(pedestal);

    const upperArm = new THREE.Group();
    upperArm.position.set(0, 0.35, 0);
    const upperLink = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.6, 0.35), whiteArchMat);
    upperLink.position.set(0, 0.8, 0);
    upperArm.add(upperLink);

    const forearm = new THREE.Group();
    forearm.position.set(0, 1.6, 0);
    const forearmLink = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.3, 0.28), steelBlueMat);
    forearmLink.position.set(0, 0.65, 0);
    const toolHead = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.16, 0.35, 8), darkNavyMat);
    toolHead.position.set(0, 1.4, 0);
    toolHead.rotation.x = Math.PI / 2;
    forearm.add(forearmLink, toolHead);

    upperArm.add(forearm);
    armBase.add(upperArm);

    const sparkLight = new THREE.PointLight(0x38bdf8, 1.5, 3.5);
    sparkLight.position.set(0, 1.4, 0.3);
    forearm.add(sparkLight);

    factoryGroup.add(armBase);
    roboticArms.push({ base: armBase, upperArm, forearm, sparkLight, phase });
  };

  createRoboticArm(-4.5, 1.6, 0.0);
  createRoboticArm(-1.2, -1.6, 1.8);
  createRoboticArm(2.2, 1.6, 3.4);

  // Automated QC Optical Inspection Scanner Arch (Holographic Cyan Scanner)
  const qcArchGeo = new THREE.BoxGeometry(0.45, 2.6, 2.6);
  const qcArch = new THREE.Mesh(qcArchGeo, whiteArchMat);
  qcArch.position.set(4.8, 2.0, 0);
  qcArch.add(new THREE.LineSegments(new THREE.EdgesGeometry(qcArchGeo), archEdgeMat));
  factoryGroup.add(qcArch);

  // Holographic scan plane
  const scanPlaneGeo = new THREE.PlaneGeometry(0.08, 2.1);
  const scanPlane = new THREE.Mesh(scanPlaneGeo, cyanEmissiveMat);
  scanPlane.position.set(4.8, 2.0, 0);
  scanPlane.rotation.y = Math.PI / 2;
  factoryGroup.add(scanPlane);

  // Moving Assembly Goods on the conveyor
  for (let i = 0; i < 5; i++) {
    const item = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.55, 0.65),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.3 })
    );
    item.position.set(-6 + i * 2.8, 1.35, 0);
    factoryGroup.add(item);
    conveyorItems.push({ mesh: item, startX: -6.5, endX: 6.5, z: 0, y: 1.35 });
  }

  rootGroup.add(factoryGroup);

  // =========================================================================
  // 4. SCENE 4: WAREHOUSING & INVENTORY (X: +26 to +58, Z: -12 to +18)
  // High-Bay ASRS Storage Racks, Automated AGVs, Sorting Loop
  // =========================================================================
  const warehouseGroup = new THREE.Group();
  warehouseGroup.position.set(40, 0, 0);

  // ASRS High-Bay Warehouse Structure
  const asrsWidth = 19;
  const asrsHeight = 7.4;
  const asrsDepth = 12.5;

  const asrsBuildingGeo = new THREE.BoxGeometry(asrsWidth, asrsHeight, asrsDepth);
  const asrsBuilding = new THREE.Mesh(asrsBuildingGeo, whiteArchMat);
  asrsBuilding.position.set(0, asrsHeight / 2, 0);
  asrsBuilding.add(new THREE.LineSegments(new THREE.EdgesGeometry(asrsBuildingGeo), archEdgeMat));
  warehouseGroup.add(asrsBuilding);

  // Translucent cutaway glass roof & clerestory
  const asrsGlassGeo = new THREE.BoxGeometry(asrsWidth + 0.1, 1.4, asrsDepth + 0.1);
  const asrsGlass = new THREE.Mesh(asrsGlassGeo, glassBlueMat);
  asrsGlass.position.set(0, asrsHeight - 1.2, 0);
  warehouseGroup.add(asrsGlass);

  // High-Bay Rack Aisles inside
  const rackUprightGeo = new THREE.BoxGeometry(0.18, 5.2, 0.18);
  const rackShelfGeo = new THREE.BoxGeometry(12, 0.12, 1.1);
  [-3.8, 3.8].forEach((rz) => {
    for (let shelfY = 1.2; shelfY <= 5.0; shelfY += 1.2) {
      const shelf = new THREE.Mesh(rackShelfGeo, steelBlueMat);
      shelf.position.set(0, shelfY, rz);
      warehouseGroup.add(shelf);
    }
    for (let rx = -5.5; rx <= 5.5; rx += 2.2) {
      const up = new THREE.Mesh(rackUprightGeo, iceSlateMat);
      up.position.set(rx, 3.2, rz);
      warehouseGroup.add(up);
    }
  });

  // Animated ASRS Lift Mast & Moving Storage Carrier
  const mastGeo = new THREE.BoxGeometry(0.35, 5.8, 0.35);
  const asrsMast = new THREE.Mesh(mastGeo, darkNavyMat);
  asrsMast.position.set(0, 3.4, 0);
  warehouseGroup.add(asrsMast);

  const asrsCarrierGeo = new THREE.BoxGeometry(1.6, 0.28, 1.2);
  const asrsCarrier = new THREE.Mesh(asrsCarrierGeo, cyanEmissiveMat);
  asrsCarrier.position.set(0, 2.5, 0);
  warehouseGroup.add(asrsCarrier);
  asrsCarriers.push({ mesh: asrsCarrier, startY: 1.2, targetY: 5.2, speed: 1.8 });

  // Autonomous Guided Vehicles (AGVs) operating on warehouse floor
  const createAgv = (x: number, z: number, minZ: number, maxZ: number, speed: number) => {
    const agv = new THREE.Group();
    agv.position.set(x, 0.18, z);
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.28, 0.8), darkNavyMat);
    const sensor = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.3), cyanEmissiveMat);
    sensor.position.set(0.4, 0.2, 0);
    const pallet = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.45, 0.7), iceSlateMat);
    pallet.position.set(0, 0.4, 0);
    agv.add(body, sensor, pallet);
    warehouseGroup.add(agv);
    agvVehicles.push({ group: agv, pathX: x, minZ, maxZ, speed });
  };

  createAgv(-4.2, 2.0, -3.5, 3.5, 1.4);
  createAgv(4.2, -1.5, -3.5, 3.5, 1.6);

  rootGroup.add(warehouseGroup);

  // =========================================================================
  // 5. SCENE 5: MULTIMODAL GLOBAL DISTRIBUTION CORRIDOR (X: -70 to +110, Z: 10 to 35)
  // Deepwater Port Berth, Container Ship, Gantry Cranes, Rail Track, Airport
  // =========================================================================
  const multimodalGroup = new THREE.Group();
  multimodalGroup.position.set(20, 0, 18);

  // Deepwater Shipping Canal & Concrete Quay
  const canalGeo = new THREE.PlaneGeometry(190, 14);
  canalGeo.rotateX(-Math.PI / 2);
  const canalMat = new THREE.MeshStandardMaterial({
    color: 0x82b9dc,
    roughness: 0.18,
    metalness: 0.32,
  });
  const canal = new THREE.Mesh(canalGeo, canalMat);
  canal.position.set(0, 0.05, 3);
  multimodalGroup.add(canal);

  const quayGeo = new THREE.BoxGeometry(190, 0.55, 2.2);
  const quay = new THREE.Mesh(quayGeo, whiteArchMat);
  quay.position.set(0, 0.28, -4.5);
  multimodalGroup.add(quay);

  // Post-Panamax Container Gantry Cranes along quay
  const createGantryCrane = (x: number, phase: number) => {
    const crane = new THREE.Group();
    crane.position.set(x, 0, -4.2);

    const legGeo = new THREE.BoxGeometry(0.4, 7.5, 0.4);
    [-1.6, 1.6].forEach((lx) => {
      [-1.1, 1.1].forEach((lz) => {
        const leg = new THREE.Mesh(legGeo, whiteArchMat);
        leg.position.set(lx, 3.75, lz);
        crane.add(leg);
      });
    });

    const boomGeo = new THREE.BoxGeometry(1.5, 0.5, 10.5);
    const boom = new THREE.Mesh(boomGeo, steelBlueMat);
    boom.position.set(0, 7.5, 2.8);
    crane.add(boom);

    const trolleyGroup = new THREE.Group();
    trolleyGroup.position.set(0, 7.1, 2.5);
    const hoist = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.3, 1.1), darkNavyMat);
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.6, 6), iceSlateMat);
    cable.position.y = -1.3;
    const container = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.9, 2.2), cyanEmissiveMat);
    container.position.y = -2.7;
    trolleyGroup.add(hoist, cable, container);
    crane.add(trolleyGroup);

    craneTrolleys.push({ group: trolleyGroup, baseZ: 2.8, phase });
    multimodalGroup.add(crane);
  };

  createGantryCrane(-42, 0.0);
  createGantryCrane(-18, 1.8);
  createGantryCrane(26, 3.2);

  // Large Container Ship Berthed
  const shipGroup = new THREE.Group();
  const hullGeo = new THREE.BoxGeometry(22, 2.2, 5.2);
  const hull = new THREE.Mesh(hullGeo, darkNavyMat);
  hull.position.set(0, 0.8, 4.2);
  shipGroup.add(hull);

  // Container Stacks on ship deck
  const cColors = [0x0284c7, 0xffffff, 0xcbe2f2, 0x0b1930];
  for (let cx = -8; cx <= 8; cx += 2.6) {
    for (let h = 0; h < 3; h++) {
      const cBox = new THREE.Mesh(
        new THREE.BoxGeometry(2.3, 0.85, 4.2),
        new THREE.MeshStandardMaterial({ color: cColors[(Math.abs(cx) + h) % 4] })
      );
      cBox.position.set(cx, 2.2 + h * 0.9, 4.2);
      shipGroup.add(cBox);
    }
  }
  shipGroup.position.set(-15, 0, 0);
  multimodalGroup.add(shipGroup);
  containerShips.push(shipGroup);

  // Freight Rail Track alongside quay
  const railBedGeo = new THREE.BoxGeometry(190, 0.12, 1.8);
  const railBed = new THREE.Mesh(railBedGeo, roadSurfaceMat);
  railBed.position.set(0, 0.12, -7.5);
  multimodalGroup.add(railBed);

  const trainEngine = new THREE.Group();
  const locGeo = new THREE.BoxGeometry(5.2, 1.8, 1.4);
  const loc = new THREE.Mesh(locGeo, steelBlueMat);
  loc.position.y = 1.0;
  trainEngine.add(loc);
  trainEngine.position.set(10, 0.15, -7.5);
  multimodalGroup.add(trainEngine);
  trainCars.push(trainEngine);

  rootGroup.add(multimodalGroup);

  // =========================================================================
  // 6. SCENE 6: RETAIL, BUSINESS & END-CUSTOMER FULFILLMENT (X: +72 to +115, Z: -15 to +18)
  // Micro-Fulfillment Hub, Retail Storefront, Customer Destination
  // =========================================================================
  const customerGroup = new THREE.Group();
  customerGroup.position.set(88, 0, 0);

  // Modern Retail Storefront / Commercial Hub
  const storeGeo = new THREE.BoxGeometry(12.5, 4.2, 8.4);
  const store = new THREE.Mesh(storeGeo, whiteArchMat);
  store.position.set(0, 2.1, 0);
  store.add(new THREE.LineSegments(new THREE.EdgesGeometry(storeGeo), archEdgeMat));
  customerGroup.add(store);

  // Retail Storefront Glass Entrance
  const storeGlassGeo = new THREE.BoxGeometry(10.5, 2.6, 0.18);
  const storeGlass = new THREE.Mesh(storeGlassGeo, glassBlueMat);
  storeGlass.position.set(0, 1.8, 4.28);
  customerGroup.add(storeGlass);

  // Verified Proof-of-Delivery Optical Beacon on rooftop
  const podBeaconGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.28, 16);
  const podBeacon = new THREE.Mesh(podBeaconGeo, greenVerifiedMat);
  podBeacon.position.set(0, 4.35, 0);
  customerGroup.add(podBeacon);

  // Electric Last-Mile Delivery Vans
  const vanGeo = new THREE.BoxGeometry(2.4, 1.4, 1.3);
  const van = new THREE.Mesh(vanGeo, iceSlateMat);
  van.position.set(-6, 0.75, 6.2);
  customerGroup.add(van);
  deliveryVans.push({ group: customerGroup, startZ: 2, endZ: 14, x: -6, speed: 1.5 });

  rootGroup.add(customerGroup);

  // =========================================================================
  // 7. SCENE 7: ORION-9 INTELLIGENCE ENGINE & NEURAL DATA ARCS
  // Luminous data spline interconnecting: Raw Materials -> Suppliers -> Factory -> Warehouse -> Logistics -> Customer
  // =========================================================================
  const graphNodes = [
    new THREE.Vector3(-88, 3.5, 2),  // Raw Materials
    new THREE.Vector3(-46, 3.8, 0),  // Suppliers
    new THREE.Vector3(0, 4.5, 0),    // Smart Factory
    new THREE.Vector3(40, 5.0, 0),   // Warehouse
    new THREE.Vector3(68, 4.2, 12),  // Multimodal Port
    new THREE.Vector3(88, 3.6, 0),   // End Customer
  ];

  const mainDataCurve = new THREE.CatmullRomCurve3(graphNodes);
  const mainDataTubeGeo = new THREE.TubeGeometry(mainDataCurve, 180, 0.22, 10, false);
  const mainDataTube = new THREE.Mesh(mainDataTubeGeo, cyanEmissiveMat);
  rootGroup.add(mainDataTube);

  // Floating Pulse Sensor Beacons at each key node
  graphNodes.forEach((pos) => {
    const ringGeo = new THREE.RingGeometry(0.9, 1.3, 16);
    ringGeo.rotateX(-Math.PI / 2);
    const ring = new THREE.Mesh(ringGeo, cyanEmissiveMat);
    ring.position.copy(pos);
    ring.position.y += 1.8;
    rootGroup.add(ring);
    intelligencePulses.push(ring);
  });

  // =========================================================================
  // 8. SCENE 8: PREDICTIVE DISRUPTION & STOCHASTIC REROUTE RIG (Simulated)
  // Supplier Bottleneck Warning, Production Buffer Warning, Pareto Bypass Conduit
  // =========================================================================
  // Warning Beacon atop Supplier Node
  const warningBeaconGeo = new THREE.SphereGeometry(0.75, 16, 12);
  const supplierWarningBeacon = new THREE.Mesh(warningBeaconGeo, amberWarningMat);
  supplierWarningBeacon.position.set(-46, 5.8, 0);
  rootGroup.add(supplierWarningBeacon);

  // Bottlenecked Flow Tube (Supplier -> Factory)
  const bottleneckCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-46, 2.2, 0),
    new THREE.Vector3(-23, 2.2, 1.5),
    new THREE.Vector3(-5, 2.2, 0),
  ]);
  const bottleneckTubeGeo = new THREE.TubeGeometry(bottleneckCurve, 40, 0.18, 8, false);
  const bottleneckFlowMesh = new THREE.Mesh(bottleneckTubeGeo, amberWarningMat);
  rootGroup.add(bottleneckFlowMesh);

  // High-Speed Stochastic Pareto Bypass Conduit (Air-Sea Bypass Corridor)
  const bypassCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-46, 3.5, 0),
    new THREE.Vector3(-30, 8.5, -12),
    new THREE.Vector3(10, 8.5, -12),
    new THREE.Vector3(40, 4.2, 0),
  ]);
  const bypassTubeGeo = new THREE.TubeGeometry(bypassCurve, 80, 0.26, 10, false);
  const bypassCorridorMesh = new THREE.Mesh(bypassTubeGeo, cyanEmissiveMat);
  rootGroup.add(bypassCorridorMesh);

  const bypassGlowLight = new THREE.PointLight(0x0088ff, 2.2, 18);
  bypassGlowLight.position.set(-10, 8.5, -12);
  rootGroup.add(bypassGlowLight);

  // Factory Schedule Recovery Beacon
  const factoryStatusBeacon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.65, 0.65, 0.22, 16),
    greenVerifiedMat
  );
  factoryStatusBeacon.position.set(0, 5.85, 0);
  rootGroup.add(factoryStatusBeacon);

  // =========================================================================
  // 9. HIGH-ALTITUDE CARGO JET (Overhead Corridor)
  // =========================================================================
  const cargoJetGroup = new THREE.Group();
  const jetBodyGeo = new THREE.CylinderGeometry(0.7, 0.9, 10.5, 12);
  jetBodyGeo.rotateZ(Math.PI / 2);
  const jetBody = new THREE.Mesh(jetBodyGeo, whiteArchMat);
  const jetWingGeo = new THREE.BoxGeometry(1.6, 0.12, 11);
  const jetWing = new THREE.Mesh(jetWingGeo, steelBlueMat);
  cargoJetGroup.add(jetBody, jetWing);
  cargoJetGroup.position.set(0, 16, -18);
  cargoJetGroup.rotation.y = Math.PI / 2;
  rootGroup.add(cargoJetGroup);

  return {
    rootGroup,
    roboticArms,
    qcScannerMesh: scanPlane,
    asrsCarriers,
    agvVehicles,
    conveyorItems,
    craneTrolleys,
    turbineRotors,
    haulTrucks,
    deliveryVans,
    cargoJet: cargoJetGroup,
    containerShips,
    freightTrucks,
    trainCars,
    intelligencePulses,
    disruptionRig: {
      supplierWarningBeacon,
      bottleneckFlowMesh,
      bypassCorridorMesh,
      bypassGlowLight,
      factoryStatusBeacon,
    },
  };
}

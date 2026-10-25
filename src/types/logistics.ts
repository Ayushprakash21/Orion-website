export type TransportMode = 'ocean' | 'air' | 'road' | 'rail';

export interface LogisticsNode {
  id: string;
  name: string;
  code: string;
  city: string;
  country: string;
  type: 'superport' | 'air-cargo-hub' | 'distribution-center' | 'manufacturing';
  lat: number;
  lng: number;
  capacityScore: number;
  activeShipments: number;
  status: 'nominal' | 'strained' | 'exception';
  details: string;
}

export interface LogisticsRoute {
  id: string;
  name: string;
  mode: TransportMode;
  originId: string;
  destinationId: string;
  waypoints: [number, number][]; // [lat, lng][]
  distanceKm: number;
  transitHoursAvg: number;
  status: 'optimal' | 'congested' | 'diverted';
}

export interface LogisticsVehicle {
  id: string;
  name: string;
  identifier: string;
  mode: TransportMode;
  routeId: string;
  originNodeId: string;
  destinationNodeId: string;
  progress: number; // 0 to 1
  speedKmH: number;
  cargoDescription: string;
  teuOrTonnage: string;
  status: 'on_schedule' | 'minor_delay' | 'disrupted' | 'rerouting';
  etaMinutes: number;
  tempControlled: boolean;
  activeAlert?: string;
}

export interface DisruptionScenario {
  id: string;
  title: string;
  location: string;
  affectedMode: TransportMode;
  severity: 'high' | 'critical' | 'moderate';
  summary: string;
  upstreamImpact: string;
  rootCause: string;
  mitigationOptions: {
    id: string;
    title: string;
    costImpact: string;
    timeRecovery: string;
    riskScore: string;
    recommended?: boolean;
    actionDescription: string;
  }[];
}

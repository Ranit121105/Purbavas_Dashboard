export type NodeStatus = "Online" | "Offline" | "Low-Bandwidth";
export type HazardType =
  | "Flood"
  | "Fire"
  | "Pollution"
  | "Landslide"
  | "Extreme Heat"
  | "Normal";
export type RiskLevel = "Normal" | "Precursor Detected" | "Alert" | "Critical";

export interface HardwareGps {
  chipset: string;
  accuracyMeters: number;
  satellites: number;
  fixType: "3D Fix" | "2D Fix" | "DGPS";
  macAddress: string;
  altitudeMeters: number;
  lastGpsSync: string;
}

export interface SensorNode {
  id: string;
  name: string;
  location: {
    lat: number;
    lon: number;
    zone: string;
    altitude: number;
    gps: HardwareGps;
  };
  gps?: HardwareGps;
  status: NodeStatus;
  wifiSignal: number; // dBm -30 to -90
  batteryLevel: number; // 0-100%
  solarInput: number; // Watts
  lastSync: string;
  firmware: string;
  aiModel: string;
  telemetry: {
    temperature: number; // °C
    humidity: number; // %
    aqi: number; // PM2.5 µg/m³
    pm10: number;
    waterLevel: number; // meters
    soilMoisture: number; // %
    gasPpm: number; // ppm
    windSpeed: number; // km/h
    rainfall: number; // mm/hr
  };
  inference: {
    hazardType: HazardType;
    confidence: number; // 0-100
    riskLevel: RiskLevel;
    triggeredAt: string;
    recommendation: string;
  };
  history: {
    time: string;
    waterLevel: number;
    aqi: number;
    temperature: number;
    soilMoisture: number;
  }[];
}

export interface Alert {
  id: string;
  nodeId: string;
  nodeName: string;
  zone: string;
  hazardType: HazardType;
  riskLevel: RiskLevel;
  confidence: number;
  timestamp: string;
  message: string;
  recommendation: string;
  acknowledged: boolean;
  notified: boolean;
}

function generateHistory(
  baseWater: number,
  baseAqi: number,
  baseTemp: number,
  baseSoil: number
) {
  const history = [];
  const now = Date.now();
  // Generate 24 intervals representing 12 hours of 30-minute recorded telemetry
  for (let i = 23; i >= 0; i--) {
    const t = new Date(now - i * 30 * 60 * 1000);
    const hours = t.getHours().toString().padStart(2, "0");
    const minutes = t.getMinutes() < 30 ? "00" : "30";
    history.push({
      time: `${hours}:${minutes}`,
      waterLevel: parseFloat(
        Math.max(0, baseWater + (Math.random() - 0.5) * 0.4).toFixed(2)
      ),
      aqi: Math.round(Math.max(0, baseAqi + (Math.random() - 0.5) * 20)),
      temperature: parseFloat(
        (baseTemp + (Math.random() - 0.5) * 3).toFixed(1)
      ),
      soilMoisture: Math.round(
        Math.min(100, Math.max(0, baseSoil + (Math.random() - 0.5) * 10))
      ),
    });
  }
  return history;
}

export const INITIAL_NODES: SensorNode[] = [
  {
    id: "IND-ESP32-001",
    name: "Brahmaputra Alpha",
    location: {
      lat: 26.1820,
      lon: 91.7450,
      zone: "Zone A – Brahmaputra River Basin, Assam",
      altitude: 55,
      gps: {
        chipset: "NavIC / IRNSS Dual-GNSS",
        accuracyMeters: 1.4,
        satellites: 14,
        fixType: "3D Fix",
        macAddress: "48:E7:29:A1:3B:10",
        altitudeMeters: 55,
        lastGpsSync: "4s ago",
      },
    },
    status: "Online",
    wifiSignal: -44,
    batteryLevel: 88,
    solarInput: 4.5,
    lastSync: "10s ago",
    firmware: "v3.2.1-IND",
    aiModel: "FloodWatch-India v2.4",
    telemetry: {
      temperature: 29.8,
      humidity: 89,
      aqi: 38,
      pm10: 48,
      waterLevel: 4.12,
      soilMoisture: 88,
      gasPpm: 110,
      windSpeed: 16,
      rainfall: 38.4,
    },
    inference: {
      hazardType: "Flood",
      confidence: 94,
      riskLevel: "Critical",
      triggeredAt: "2 min ago",
      recommendation: "Critical flood crest detected on Brahmaputra basin. Alert Assam SDMA & evacuate riverine settlements immediately.",
    },
    history: generateHistory(4.0, 38, 30, 88),
  },
  {
    id: "IND-ESP32-002",
    name: "Garhwal Bravo",
    location: {
      lat: 30.4124,
      lon: 78.7845,
      zone: "Zone B – Garhwal Forest Cover, Uttarakhand",
      altitude: 1420,
      gps: {
        chipset: "NavIC / IRNSS Dual-GNSS",
        accuracyMeters: 2.1,
        satellites: 11,
        fixType: "3D Fix",
        macAddress: "48:E7:29:A1:3B:11",
        altitudeMeters: 1420,
        lastGpsSync: "8s ago",
      },
    },
    status: "Online",
    wifiSignal: -60,
    batteryLevel: 76,
    solarInput: 4.1,
    lastSync: "35s ago",
    firmware: "v3.2.1-IND",
    aiModel: "FireSentinel-Himalaya v1.5",
    telemetry: {
      temperature: 39.2,
      humidity: 19,
      aqi: 98,
      pm10: 135,
      waterLevel: 0.1,
      soilMoisture: 16,
      gasPpm: 510,
      windSpeed: 32,
      rainfall: 0,
    },
    inference: {
      hazardType: "Fire",
      confidence: 89,
      riskLevel: "Alert",
      triggeredAt: "8 min ago",
      recommendation: "Pine forest fire precursors identified. Dispatch Forest Department & SDRF rapid response teams.",
    },
    history: generateHistory(0.1, 98, 39, 16),
  },
  {
    id: "IND-ESP32-003",
    name: "Delhi NCR Charlie",
    location: {
      lat: 28.6315,
      lon: 77.2167,
      zone: "Zone C – Delhi NCR Urban Core",
      altitude: 216,
      gps: {
        chipset: "NavIC / IRNSS Dual-GNSS",
        accuracyMeters: 1.2,
        satellites: 16,
        fixType: "3D Fix",
        macAddress: "48:E7:29:A1:3B:12",
        altitudeMeters: 216,
        lastGpsSync: "2s ago",
      },
    },
    status: "Online",
    wifiSignal: -36,
    batteryLevel: 94,
    solarInput: 2.6,
    lastSync: "5s ago",
    firmware: "v3.3.0-IND",
    aiModel: "AirGuard-CPCB v3.0",
    telemetry: {
      temperature: 32.4,
      humidity: 58,
      aqi: 348,
      pm10: 420,
      waterLevel: 0.2,
      soilMoisture: 38,
      gasPpm: 390,
      windSpeed: 6,
      rainfall: 0,
    },
    inference: {
      hazardType: "Pollution",
      confidence: 96,
      riskLevel: "Alert",
      triggeredAt: "12 min ago",
      recommendation: "Severe hazardous AQI spike. Activate CPCB GRAP Stage IV emergency protocols & smog advisories.",
    },
    history: generateHistory(0.2, 348, 32, 38),
  },
  {
    id: "IND-ESP32-004",
    name: "Wayanad Delta",
    location: {
      lat: 11.6854,
      lon: 76.1320,
      zone: "Zone D – Wayanad Western Ghats, Kerala",
      altitude: 780,
      gps: {
        chipset: "NavIC / IRNSS Dual-GNSS",
        accuracyMeters: 2.4,
        satellites: 10,
        fixType: "3D Fix",
        macAddress: "48:E7:29:A1:3B:13",
        altitudeMeters: 780,
        lastGpsSync: "12s ago",
      },
    },
    status: "Online",
    wifiSignal: -68,
    batteryLevel: 58,
    solarInput: 4.8,
    lastSync: "2m ago",
    firmware: "v3.1.8-IND",
    aiModel: "GhatsSlide-AI v1.2",
    telemetry: {
      temperature: 24.8,
      humidity: 94,
      aqi: 22,
      pm10: 30,
      waterLevel: 1.8,
      soilMoisture: 93,
      gasPpm: 75,
      windSpeed: 18,
      rainfall: 44.5,
    },
    inference: {
      hazardType: "Landslide",
      confidence: 82,
      riskLevel: "Precursor Detected",
      triggeredAt: "18 min ago",
      recommendation: "High soil saturation on slope terrain. Issue slope landslide warning for Meppadi & Chooralmala.",
    },
    history: generateHistory(1.8, 22, 25, 93),
  },
  {
    id: "IND-ESP32-005",
    name: "Thar Echo",
    location: {
      lat: 27.1300,
      lon: 72.3600,
      zone: "Zone E – Thar Desert, Phalodi, Rajasthan",
      altitude: 180,
      gps: {
        chipset: "NavIC / IRNSS Dual-GNSS",
        accuracyMeters: 1.8,
        satellites: 13,
        fixType: "3D Fix",
        macAddress: "48:E7:29:A1:3B:14",
        altitudeMeters: 180,
        lastGpsSync: "5s ago",
      },
    },
    status: "Online",
    wifiSignal: -50,
    batteryLevel: 72,
    solarInput: 8.4,
    lastSync: "25s ago",
    firmware: "v3.2.1-IND",
    aiModel: "HeatWave-IMD v2.0",
    telemetry: {
      temperature: 47.8,
      humidity: 14,
      aqi: 72,
      pm10: 110,
      waterLevel: 0.05,
      soilMoisture: 9,
      gasPpm: 125,
      windSpeed: 24,
      rainfall: 0,
    },
    inference: {
      hazardType: "Extreme Heat",
      confidence: 91,
      riskLevel: "Alert",
      triggeredAt: "28 min ago",
      recommendation: "Severe heatwave conditions exceeding 47°C. Activate IMD Red Alert & open public cooling shelters.",
    },
    history: generateHistory(0.05, 72, 47, 9),
  },
  {
    id: "IND-ESP32-006",
    name: "Paradip Foxtrot",
    location: {
      lat: 20.2644,
      lon: 86.6710,
      zone: "Zone F – Coastal Belt, Paradip, Odisha",
      altitude: 8,
      gps: {
        chipset: "NavIC / IRNSS Dual-GNSS",
        accuracyMeters: 3.2,
        satellites: 9,
        fixType: "2D Fix",
        macAddress: "48:E7:29:A1:3B:15",
        altitudeMeters: 8,
        lastGpsSync: "1m ago",
      },
    },
    status: "Low-Bandwidth",
    wifiSignal: -80,
    batteryLevel: 42,
    solarInput: 1.8,
    lastSync: "6m ago",
    firmware: "v3.1.5-IND",
    aiModel: "CycloneWatch-BoB v1.4",
    telemetry: {
      temperature: 31.0,
      humidity: 86,
      aqi: 45,
      pm10: 55,
      waterLevel: 2.65,
      soilMoisture: 82,
      gasPpm: 90,
      windSpeed: 42,
      rainfall: 22.0,
    },
    inference: {
      hazardType: "Flood",
      confidence: 74,
      riskLevel: "Precursor Detected",
      triggeredAt: "35 min ago",
      recommendation: "Coastal tidal surge & storm depression warning. Advise fishermen against venturing into Bay of Bengal.",
    },
    history: generateHistory(2.6, 45, 31, 82),
  },
  {
    id: "IND-ESP32-007",
    name: "Sundarbans Golf",
    location: {
      lat: 22.1850,
      lon: 88.6670,
      zone: "Zone G – Sundarbans Estuary, West Bengal",
      altitude: 6,
      gps: {
        chipset: "NavIC / IRNSS Dual-GNSS",
        accuracyMeters: 2.0,
        satellites: 12,
        fixType: "3D Fix",
        macAddress: "48:E7:29:A1:3B:16",
        altitudeMeters: 6,
        lastGpsSync: "15s ago",
      },
    },
    status: "Online",
    wifiSignal: -58,
    batteryLevel: 79,
    solarInput: 5.2,
    lastSync: "45s ago",
    firmware: "v3.3.0-IND",
    aiModel: "DeltaSurge v1.1",
    telemetry: {
      temperature: 28.5,
      humidity: 92,
      aqi: 32,
      pm10: 40,
      waterLevel: 2.30,
      soilMoisture: 91,
      gasPpm: 85,
      windSpeed: 21,
      rainfall: 16.2,
    },
    inference: {
      hazardType: "Flood",
      confidence: 68,
      riskLevel: "Precursor Detected",
      triggeredAt: "50 min ago",
      recommendation: "Estuary embankment water level rising. Monitor tidal sluice gates.",
    },
    history: generateHistory(2.3, 32, 28, 91),
  },
  {
    id: "IND-ESP32-008",
    name: "Shimla Ridge Hotel",
    location: {
      lat: 31.1048,
      lon: 77.1734,
      zone: "Zone H – Shimla Ridge Slopes, Himachal",
      altitude: 2205,
      gps: {
        chipset: "NavIC / IRNSS Dual-GNSS",
        accuracyMeters: 1.6,
        satellites: 13,
        fixType: "3D Fix",
        macAddress: "48:E7:29:A1:3B:17",
        altitudeMeters: 2205,
        lastGpsSync: "8s ago",
      },
    },
    status: "Online",
    wifiSignal: -52,
    batteryLevel: 85,
    solarInput: 6.1,
    lastSync: "20s ago",
    firmware: "v3.2.1-IND",
    aiModel: "MultiHazard-India v1.0",
    telemetry: {
      temperature: 18.5,
      humidity: 62,
      aqi: 24,
      pm10: 31,
      waterLevel: 0.3,
      soilMoisture: 52,
      gasPpm: 60,
      windSpeed: 10,
      rainfall: 2.1,
    },
    inference: {
      hazardType: "Normal",
      confidence: 97,
      riskLevel: "Normal",
      triggeredAt: "—",
      recommendation: "No hazard detected. Mountain station telemetry nominal.",
    },
    history: generateHistory(0.3, 24, 18, 52),
  },
  {
    id: "IND-ESP32-009",
    name: "Leh Summit India",
    location: {
      lat: 34.1526,
      lon: 77.5771,
      zone: "Zone I – Leh High Altitude Observatory, Ladakh",
      altitude: 3520,
      gps: {
        chipset: "NavIC / IRNSS Dual-GNSS",
        accuracyMeters: 6.8,
        satellites: 5,
        fixType: "2D Fix",
        macAddress: "48:E7:29:A1:3B:18",
        altitudeMeters: 3520,
        lastGpsSync: "2h ago",
      },
    },
    status: "Offline",
    wifiSignal: -94,
    batteryLevel: 11,
    solarInput: 0,
    lastSync: "2h ago",
    firmware: "v3.1.5-IND",
    aiModel: "MultiHazard-India v1.0",
    telemetry: {
      temperature: 4.2,
      humidity: 45,
      aqi: 12,
      pm10: 16,
      waterLevel: 0.05,
      soilMoisture: 22,
      gasPpm: 35,
      windSpeed: 38,
      rainfall: 0,
    },
    inference: {
      hazardType: "Normal",
      confidence: 0,
      riskLevel: "Normal",
      triggeredAt: "—",
      recommendation: "Node offline. Dispatch ITBP / High-Altitude field maintenance team.",
    },
    history: generateHistory(0.05, 12, 4, 22),
  },
  {
    id: "IND-ESP32-010",
    name: "Deccan Juliet",
    location: {
      lat: 12.9716,
      lon: 77.5946,
      zone: "Zone J – Deccan Plateau, Bengaluru, Karnataka",
      altitude: 920,
      gps: {
        chipset: "NavIC / IRNSS Dual-GNSS",
        accuracyMeters: 1.1,
        satellites: 15,
        fixType: "3D Fix",
        macAddress: "48:E7:29:A1:3B:19",
        altitudeMeters: 920,
        lastGpsSync: "3s ago",
      },
    },
    status: "Online",
    wifiSignal: -40,
    batteryLevel: 96,
    solarInput: 7.5,
    lastSync: "6s ago",
    firmware: "v3.3.0-IND",
    aiModel: "MultiHazard-India v1.0",
    telemetry: {
      temperature: 27.4,
      humidity: 54,
      aqi: 48,
      pm10: 56,
      waterLevel: 0.2,
      soilMoisture: 40,
      gasPpm: 70,
      windSpeed: 12,
      rainfall: 0,
    },
    inference: {
      hazardType: "Normal",
      confidence: 98,
      riskLevel: "Normal",
      triggeredAt: "—",
      recommendation: "No action required. Environmental metrics nominal.",
    },
    history: generateHistory(0.2, 48, 27, 40),
  },
];

export const INITIAL_ALERTS: Alert[] = [
  {
    id: "ALT-IND-001",
    nodeId: "IND-ESP32-001",
    nodeName: "Brahmaputra Alpha",
    zone: "Zone A – Brahmaputra River Basin, Assam",
    hazardType: "Flood",
    riskLevel: "Critical",
    confidence: 94,
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    message:
      "Critical flood surge detected along Brahmaputra basin. Water level at 4.12m exceeding danger mark by 0.32m.",
    recommendation:
      "Evacuate low-lying river settlements immediately. Coordinate with Assam SDMA & NDRF.",
    acknowledged: false,
    notified: false,
  },
  {
    id: "ALT-IND-002",
    nodeId: "IND-ESP32-002",
    nodeName: "Garhwal Bravo",
    zone: "Zone B – Garhwal Forest Cover, Uttarakhand",
    hazardType: "Fire",
    riskLevel: "Alert",
    confidence: 89,
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    message:
      "Pine forest fire precursors detected. High gas concentration (510 ppm) with low humidity (19%) and dry winds.",
    recommendation: "Deploy Uttarakhand forest firefighting units & SDRF squads.",
    acknowledged: false,
    notified: true,
  },
  {
    id: "ALT-IND-003",
    nodeId: "IND-ESP32-003",
    nodeName: "Delhi NCR Charlie",
    zone: "Zone C – Delhi NCR Urban Core",
    hazardType: "Pollution",
    riskLevel: "Alert",
    confidence: 96,
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    message: "Severe hazardous air quality detected. PM2.5 AQI at 348 µg/m³. Severe smog density.",
    recommendation: "Enforce CPCB GRAP Stage IV emergency guidelines & advise public to stay indoors.",
    acknowledged: true,
    notified: true,
  },
  {
    id: "ALT-IND-004",
    nodeId: "IND-ESP32-005",
    nodeName: "Thar Echo",
    zone: "Zone E – Thar Desert, Phalodi, Rajasthan",
    hazardType: "Extreme Heat",
    riskLevel: "Alert",
    confidence: 91,
    timestamp: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    message:
      "Extreme heatwave threshold breached at 47.8°C. Surface temperature dangerous.",
    recommendation: "Activate IMD Red Alert heat protocols & distribute oral rehydration supplies.",
    acknowledged: false,
    notified: false,
  },
  {
    id: "ALT-IND-005",
    nodeId: "IND-ESP32-004",
    nodeName: "Wayanad Delta",
    zone: "Zone D – Wayanad Western Ghats, Kerala",
    hazardType: "Landslide",
    riskLevel: "Precursor Detected",
    confidence: 82,
    timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    message:
      "Critical slope soil saturation at 93% with continuous intense monsoon rainfall (44.5mm/hr).",
    recommendation: "Issue preemptive landslide alert for hilly settlements. Prepare evacuation routes.",
    acknowledged: false,
    notified: false,
  },
  {
    id: "ALT-IND-006",
    nodeId: "IND-ESP32-006",
    nodeName: "Paradip Foxtrot",
    zone: "Zone F – Coastal Belt, Paradip, Odisha",
    hazardType: "Flood",
    riskLevel: "Precursor Detected",
    confidence: 74,
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    message: "Coastal tidal surge & storm depression warning. Advise fishermen against venturing into Bay of Bengal.",
    recommendation: "Issue coastal warnings and monitor storm surge barriers.",
    acknowledged: false,
    notified: false,
  },
  {
    id: "ALT-IND-007",
    nodeId: "IND-ESP32-009",
    nodeName: "Leh Summit India",
    zone: "Zone I – Leh High Altitude Observatory, Ladakh",
    hazardType: "Normal",
    riskLevel: "Normal",
    confidence: 0,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    message: "High-altitude node went offline in Leh sector. Last battery level 11%. Solar sub-zero snow cover.",
    recommendation: "Dispatch field technician team to Ladakh observatory station.",
    acknowledged: false,
    notified: false,
  },
];

export const REGION_STATS = {
  totalNodes: 45,
  onlineNodes: 42,
  offlineNodes: 3,
  criticalAlerts: 1,
  activeAlerts: 4,
  highestRiskZone: "Zone A – Brahmaputra River Basin, Assam",
  systemStatus: "Operational (India Grid)",
  gatewayIP: "10.144.1.254",
  lastMeshSync: "3s ago",
};

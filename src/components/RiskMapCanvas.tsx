"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import type { SensorNode } from "@/lib/mockData";
import "leaflet/dist/leaflet.css";
import {
  AlertTriangle,
  Crosshair,
  MapPin,
  Radio,
  ShieldAlert,
  Layers,
  Cpu,
  Satellite,
  RotateCcw,
  Zap,
  Info,
} from "lucide-react";

interface Props {
  nodes: SensorNode[];
  onNodeClick: (node: SensorNode) => void;
  selectedNodeId: string | null;
}

const hazardStyle: Record<
  string,
  { color: string; icon: string; radius: number; label: string }
> = {
  Flood: { color: "#2563eb", icon: "≈", radius: 1400, label: "Flood Risk" },
  Fire: { color: "#dc2626", icon: "♨", radius: 1100, label: "Fire Risk" },
  Pollution: { color: "#7c3aed", icon: "≋", radius: 950, label: "Air Pollution Risk" },
  Landslide: { color: "#d97706", icon: "▲", radius: 1200, label: "Landslide Risk" },
  "Extreme Heat": { color: "#ea580c", icon: "☼", radius: 1000, label: "Heat Hazard Risk" },
};

const severityOpacity: Record<string, number> = {
  Critical: 0.42,
  Alert: 0.28,
  "Precursor Detected": 0.16,
  Normal: 0.08,
};

// Map tile layers including OpenFreeMap and resilient fallbacks
const TILE_LAYERS = [
  {
    id: "ofm-positron",
    name: "OpenFreeMap Positron (Light)",
    url: "https://tiles.openfreemap.org/styles/positron/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://openfreemap.org" target="_blank" rel="noopener noreferrer">OpenFreeMap</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
    subdomains: ["a", "b", "c"],
  },
  {
    id: "ofm-liberty",
    name: "OpenFreeMap Liberty",
    url: "https://tiles.openfreemap.org/styles/liberty/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://openfreemap.org" target="_blank" rel="noopener noreferrer">OpenFreeMap</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
    subdomains: ["a", "b", "c"],
  },
  {
    id: "carto-light",
    name: "CartoDB Light",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: ["a", "b", "c", "d"],
  },
  {
    id: "osm-standard",
    name: "OpenStreetMap Standard",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: ["a", "b", "c"],
  },
];

function createNodeMarkerIcon(node: SensorNode, isSelected: boolean) {
  const isNormal = node.inference.riskLevel === "Normal";
  const style = isNormal
    ? { color: "#0d9488", icon: "✓" }
    : hazardStyle[node.inference.hazardType] || { color: "#0d9488", icon: "●" };
  const isCritical = node.inference.riskLevel === "Critical";

  return L.divIcon({
    className: "risk-map-marker",
    html: `
      <div style="--marker-color:${style.color}; position: relative; width: 36px; height: 36px;" class="flex items-center justify-center">
        <span class="risk-marker ${isCritical ? "is-critical" : ""} ${
      isSelected ? "ring-4 ring-teal-500 scale-125 shadow-lg" : ""
    }">
          ${style.icon}
        </span>
        <span style="position: absolute; bottom: -14px; left: 50%; transform: translateX(-50%); font-size: 8px; font-weight: 700; background: rgba(255,255,255,0.92); color: #1e293b; padding: 1px 4px; border-radius: 4px; border: 1px solid #cbd5e1; white-space: nowrap; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
          ${node.name.split(" ")[1] ?? node.name}
        </span>
      </div>
    `,
    iconSize: [36, 44],
    iconAnchor: [18, 22],
  });
}

// Automatically triggers invalidateSize to avoid any blank / grey tile rendering issues
function MapLifecycleHelper({
  selectedNode,
}: {
  selectedNode?: SensorNode;
}) {
  const map = useMap();

  useEffect(() => {
    // Initial size invalidation
    const timer1 = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    const timer2 = setTimeout(() => {
      map.invalidateSize();
    }, 400);

    const handleResize = () => {
      map.invalidateSize();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener("resize", handleResize);
    };
  }, [map]);

  useEffect(() => {
    if (selectedNode) {
      map.flyTo([selectedNode.location.lat, selectedNode.location.lon], 12.5, {
        duration: 0.8,
      });
    }
  }, [map, selectedNode]);

  return null;
}

export default function RiskMapCanvas({
  nodes,
  onNodeClick,
  selectedNodeId,
}: Props) {
  const [tileLayerIndex, setTileLayerIndex] = useState(0);
  const [filterMode, setFilterMode] = useState<"all" | "risk-only">("all");
  const [showAccuracyRadius, setShowAccuracyRadius] = useState(true);

  const activeNode = useMemo(() => {
    if (selectedNodeId) {
      return nodes.find((n) => n.id === selectedNodeId) || nodes[0];
    }
    return (
      nodes.find((n) => n.inference.riskLevel === "Critical") ||
      nodes.find((n) => n.inference.riskLevel !== "Normal") ||
      nodes[0]
    );
  }, [nodes, selectedNodeId]);

  const displayedNodes = useMemo(() => {
    if (filterMode === "risk-only") {
      return nodes.filter(
        (n) => n.inference.riskLevel !== "Normal" && n.status !== "Offline"
      );
    }
    return nodes.filter((n) => n.status !== "Offline");
  }, [nodes, filterMode]);

  const currentTile = TILE_LAYERS[tileLayerIndex];

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-xs flex flex-col">
      {/* Map Viewport */}
      <div className="relative flex-1 w-full min-h-0">
        <MapContainer
          center={[14.22, 121.28]}
          zoom={10}
          scrollWheelZoom
          className="h-full w-full"
          aria-label="OpenFreeMap disaster risk detection network"
        >
          <TileLayer
            key={currentTile.id}
            attribution={currentTile.attribution}
            url={currentTile.url}
            maxZoom={19}
            subdomains={currentTile.subdomains}
          />

          <MapLifecycleHelper selectedNode={activeNode} />

          {/* Hardware Location Accuracy Halo & Hazard Zones */}
          {displayedNodes.map((node) => {
            const isSelected = node.id === selectedNodeId;
            const style = hazardStyle[node.inference.hazardType] || {
              color: "#0d9488",
              radius: 800,
            };
            const intensity =
              node.inference.riskLevel === "Critical"
                ? 1.4
                : node.inference.riskLevel === "Alert"
                ? 1.05
                : 0.75;
            const gps = node.location.gps;

            return (
              <div key={`group-${node.id}`}>
                {/* 1. Hardware GPS Accuracy Radius Circle (Precision setting) */}
                {showAccuracyRadius && gps && (
                  <Circle
                    center={[node.location.lat, node.location.lon]}
                    radius={Math.max(gps.accuracyMeters * 35, 120)}
                    pathOptions={{
                      color: "#0d9488",
                      fillColor: "#0d9488",
                      fillOpacity: 0.12,
                      weight: 1.5,
                      dashArray: "4, 4",
                    }}
                  />
                )}

                {/* 2. Hazard Risk Zone Circle (if in risk condition) */}
                {node.inference.riskLevel !== "Normal" && (
                  <Circle
                    center={[node.location.lat, node.location.lon]}
                    radius={style.radius * intensity}
                    pathOptions={{
                      color: style.color,
                      fillColor: style.color,
                      fillOpacity:
                        severityOpacity[node.inference.riskLevel] ?? 0.2,
                      weight: isSelected ? 3 : 1.5,
                      dashArray:
                        node.inference.riskLevel === "Precursor Detected"
                          ? "6, 6"
                          : undefined,
                    }}
                    eventHandlers={{ click: () => onNodeClick(node) }}
                  >
                    <Popup>
                      <div className="p-1 font-sans">
                        <div
                          className="flex items-center gap-1.5 text-xs font-black"
                          style={{ color: style.color }}
                        >
                          <ShieldAlert size={14} />
                          <span>{node.inference.hazardType} Risk Zone</span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-semibold mt-1">
                          Level: <b>{node.inference.riskLevel}</b> (Confidence:{" "}
                          {node.inference.confidence}%)
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          Zone: {node.location.zone}
                        </p>
                      </div>
                    </Popup>
                  </Circle>
                )}
              </div>
            );
          })}

          {/* Node Markers */}
          {displayedNodes.map((node) => {
            const isSelected = node.id === selectedNodeId;
            const style = hazardStyle[node.inference.hazardType] || {
              color: "#0d9488",
              label: "Normal",
            };
            const gps = node.location.gps;

            return (
              <Marker
                key={node.id}
                position={[node.location.lat, node.location.lon]}
                icon={createNodeMarkerIcon(node, isSelected)}
                eventHandlers={{ click: () => onNodeClick(node) }}
              >
                <Popup>
                  <div className="min-w-64 p-1.5 font-sans">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1.5 mb-2">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">
                          {node.name}
                        </h4>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                          <Cpu size={11} className="text-teal-600" />
                          <span>{gps?.chipset ?? "GNSS Module"}</span>
                        </div>
                      </div>
                      <span
                        className="text-[9px] font-black px-2 py-0.5 rounded-full text-white"
                        style={{
                          backgroundColor:
                            node.inference.riskLevel === "Normal"
                              ? "#16a34a"
                              : style.color,
                        }}
                      >
                        {node.inference.riskLevel}
                      </span>
                    </div>

                    {/* Precise Hardware Location Specs */}
                    {gps && (
                      <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-2 mb-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-teal-800 tracking-wider mb-1">
                          <Satellite size={12} className="text-teal-600" />
                          <span>Hardware GNSS Fix</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-700 font-mono">
                          <div>
                            Lat: <b className="text-slate-900">{node.location.lat.toFixed(5)}°N</b>
                          </div>
                          <div>
                            Lon: <b className="text-slate-900">{node.location.lon.toFixed(5)}°E</b>
                          </div>
                          <div>
                            Accuracy: <b className="text-teal-700">±{gps.accuracyMeters}m</b>
                          </div>
                          <div>
                            Alt: <b className="text-slate-900">{gps.altitudeMeters}m</b>
                          </div>
                          <div>
                            Sats: <b className="text-slate-900">{gps.satellites} Locked</b>
                          </div>
                          <div>
                            Fix: <b className="text-emerald-700">{gps.fixType}</b>
                          </div>
                        </div>
                        <div className="mt-1 text-[9px] text-slate-500 border-t border-teal-200/60 pt-1 flex justify-between">
                          <span>MAC: {gps.macAddress}</span>
                          <span>Sync: {gps.lastGpsSync}</span>
                        </div>
                      </div>
                    )}

                    {/* Telemetry Metrics */}
                    <div className="grid grid-cols-2 gap-1.5 text-[10px] mb-2 font-medium">
                      <div className="bg-blue-50/90 border border-blue-100 rounded-lg px-2 py-1 text-blue-900">
                        Water: <b>{node.telemetry.waterLevel}m</b>
                      </div>
                      <div className="bg-purple-50/90 border border-purple-100 rounded-lg px-2 py-1 text-purple-900">
                        AQI: <b>{node.telemetry.aqi}</b>
                      </div>
                      <div className="bg-orange-50/90 border border-orange-100 rounded-lg px-2 py-1 text-orange-900">
                        Temp: <b>{node.telemetry.temperature}°C</b>
                      </div>
                      <div className="bg-emerald-50/90 border border-emerald-100 rounded-lg px-2 py-1 text-emerald-900">
                        Soil: <b>{node.telemetry.soilMoisture}%</b>
                      </div>
                    </div>

                    {/* AI Assessment & Recommendation */}
                    {node.inference.riskLevel !== "Normal" && (
                      <div className="text-[10px] text-slate-700 bg-amber-50/90 border border-amber-200 rounded-lg p-2 mb-2">
                        <p className="font-bold text-amber-900 mb-0.5">
                          Detected: {node.inference.hazardType} ({node.inference.confidence}% conf.)
                        </p>
                        <p>{node.inference.recommendation}</p>
                      </div>
                    )}

                    <button
                      onClick={() => onNodeClick(node)}
                      className="w-full py-1.5 text-center text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-xs"
                    >
                      Inspect 30-Min Node Telemetry
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Top Controls Overlay */}
        <div className="absolute top-3 left-3 z-[500] flex flex-col gap-2 max-w-sm">
          {/* Main Hardware Location & Filter Card */}
          <div className="rounded-2xl bg-white/95 px-3.5 py-3 shadow-md backdrop-blur border border-slate-200/90">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-node-pulse" />
                <p className="text-[10px] font-black uppercase tracking-wider text-teal-800">
                  OpenFreeMap Hardware Detection
                </p>
              </div>
              <span className="text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md">
                30-Min Cycles
              </span>
            </div>

            {/* Hardware Node Selector */}
            <div className="flex items-center gap-1.5 mb-2">
              <Crosshair size={13} className="text-teal-600 shrink-0" />
              <select
                value={selectedNodeId ?? activeNode.id}
                onChange={(e) => {
                  const target = nodes.find((n) => n.id === e.target.value);
                  if (target) onNodeClick(target);
                }}
                className="text-[11px] font-semibold bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2 py-1 outline-none w-full cursor-pointer focus:border-teal-500"
              >
                <optgroup label="Detected Risk Nodes">
                  {nodes
                    .filter((n) => n.inference.riskLevel !== "Normal")
                    .map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name} · {n.inference.hazardType} ({n.inference.riskLevel})
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Nominal Hardware Nodes">
                  {nodes
                    .filter((n) => n.inference.riskLevel === "Normal")
                    .map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name} · Nominal Status
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>

            {/* Filter Toggle & Accuracy Toggle */}
            <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() =>
                  setFilterMode(filterMode === "all" ? "risk-only" : "all")
                }
                className={`text-[10px] font-bold py-1 px-2 rounded-lg border text-center transition-colors ${
                  filterMode === "risk-only"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {filterMode === "risk-only" ? "● Risk Zones Only" : "○ All 10 Nodes"}
              </button>

              <button
                type="button"
                onClick={() => setShowAccuracyRadius(!showAccuracyRadius)}
                className={`text-[10px] font-bold py-1 px-2 rounded-lg border text-center transition-colors ${
                  showAccuracyRadius
                    ? "bg-teal-50 text-teal-700 border-teal-200"
                    : "bg-slate-50 text-slate-500 border-slate-200"
                }`}
              >
                {showAccuracyRadius ? "GNSS Accuracy: ON" : "GNSS Accuracy: OFF"}
              </button>
            </div>
          </div>
        </div>

        {/* Top Right Controls: Tile Layer Switcher */}
        <div className="absolute top-3 right-3 z-[500] flex items-center gap-1.5">
          <div className="flex items-center gap-1 rounded-2xl bg-white/95 p-1 shadow-md backdrop-blur border border-slate-200/90 text-[10px]">
            <Layers size={13} className="text-slate-500 ml-1.5" />
            <select
              value={tileLayerIndex}
              onChange={(e) => setTileLayerIndex(Number(e.target.value))}
              className="font-semibold bg-transparent text-slate-700 rounded-lg px-2 py-1 outline-none cursor-pointer"
            >
              {TILE_LAYERS.map((tl, i) => (
                <option key={tl.id} value={i}>
                  {tl.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bottom Right: Hazard Legend */}
        <div className="absolute bottom-3 right-3 z-[500] rounded-2xl bg-white/95 px-3 py-2.5 shadow-md backdrop-blur border border-slate-200/90">
          <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
            Detected Risk Legend
          </p>
          <div className="space-y-1">
            {Object.entries(hazardStyle).map(([name, value]) => (
              <div
                key={name}
                className="flex items-center gap-2 text-[10px] font-semibold text-slate-700"
              >
                <span
                  className="grid h-4 w-4 place-items-center rounded-full text-white text-[9px] font-bold shrink-0"
                  style={{ background: value.color }}
                >
                  {value.icon}
                </span>
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Hardware GNSS Status Bar */}
      <div className="bg-white border-t border-slate-200 px-3.5 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-teal-700 font-bold">
            <Satellite size={14} className="animate-pulse text-teal-600" />
            <span>Hardware GNSS:</span>
            <span className="font-mono bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded text-[11px] text-teal-900">
              {activeNode.location.gps?.chipset ?? "GNSS Module"} ({activeNode.location.gps?.fixType ?? "3D Fix"})
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-slate-600 font-mono text-[11px]">
            <span>Lat: <b className="text-slate-900">{activeNode.location.lat.toFixed(5)}°N</b></span>
            <span>·</span>
            <span>Lon: <b className="text-slate-900">{activeNode.location.lon.toFixed(5)}°E</b></span>
            <span>·</span>
            <span>Acc: <b className="text-teal-700">±{activeNode.location.gps?.accuracyMeters ?? 2.1}m</b></span>
            <span>·</span>
            <span>Alt: <b className="text-slate-900">{activeNode.location.gps?.altitudeMeters ?? activeNode.location.altitude}m</b></span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-slate-500 font-medium">Node:</span>
          <span className="font-bold text-slate-800">{activeNode.name}</span>
          <span className="font-mono text-slate-400">({activeNode.location.gps?.macAddress ?? activeNode.id})</span>
        </div>
      </div>
    </div>
  );
}

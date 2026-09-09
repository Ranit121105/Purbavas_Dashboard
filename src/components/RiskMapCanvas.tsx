"use client";

import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import type { SensorNode } from "@/lib/mockData";
import "leaflet/dist/leaflet.css";
import { AlertTriangle, Crosshair, MapPin, Radio, ShieldAlert } from "lucide-react";

interface Props {
  nodes: SensorNode[];
  onNodeClick: (node: SensorNode) => void;
  selectedNodeId: string | null;
}

const hazardStyle: Record<string, { color: string; icon: string; radius: number; label: string }> = {
  Flood: { color: "#2563eb", icon: "≈", radius: 1200, label: "Flood Risk" },
  Fire: { color: "#dc2626", icon: "♨", radius: 950, label: "Fire Risk" },
  Pollution: { color: "#7c3aed", icon: "≋", radius: 850, label: "Air Pollution Risk" },
  Landslide: { color: "#d97706", icon: "▲", radius: 1050, label: "Landslide Risk" },
  "Extreme Heat": { color: "#ea580c", icon: "☼", radius: 900, label: "Heat Hazard Risk" },
};

const severityOpacity: Record<string, number> = {
  Critical: 0.45,
  Alert: 0.30,
  "Precursor Detected": 0.18,
};

function markerIcon(node: SensorNode, isSelected: boolean) {
  const style = hazardStyle[node.inference.hazardType] || { color: "#0d9488", icon: "●" };
  const isCritical = node.inference.riskLevel === "Critical";
  return L.divIcon({
    className: "risk-map-marker",
    html: `<span style="--marker-color:${style.color}" class="risk-marker ${isCritical ? "is-critical" : ""} ${isSelected ? "ring-4 ring-teal-500 scale-125" : ""}">${style.icon}</span>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function FocusSelected({ node }: { node?: SensorNode }) {
  const map = useMap();
  useEffect(() => {
    if (node) {
      map.flyTo([node.location.lat, node.location.lon], 12, { duration: 0.8 });
    }
  }, [map, node]);
  return null;
}

export default function RiskMapCanvas({ nodes, onNodeClick, selectedNodeId }: Props) {
  const riskNodes = nodes.filter(
    (node) => node.inference.riskLevel !== "Normal" && node.status !== "Offline"
  );
  const selected = riskNodes.find((node) => node.id === selectedNodeId);
  const [activeZoneFilter, setActiveZoneFilter] = useState<string>("all");

  const displayedNodes =
    activeZoneFilter === "all"
      ? riskNodes
      : riskNodes.filter((n) => n.id === activeZoneFilter);

  return (
    <div className="risk-map-shell relative h-full w-full overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-slate-100">
      <MapContainer
        center={[14.22, 121.28]}
        zoom={10}
        scrollWheelZoom
        className="h-full w-full"
        aria-label="Interactive disaster risk map powered by OpenFreeMap"
      >
        {/* OpenFreeMap tile layer (openfreemap.org) */}
        <TileLayer
          attribution='&copy; <a href="https://openfreemap.org" target="_blank" rel="noopener noreferrer">OpenFreeMap</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'
          url="https://tile.openfreemap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <FocusSelected node={selected} />

        {/* Hazard Risk Influence Radii */}
        {displayedNodes.map((node) => {
          const style = hazardStyle[node.inference.hazardType] || {
            color: "#0d9488",
            radius: 800,
          };
          const intensity =
            node.inference.riskLevel === "Critical"
              ? 1.35
              : node.inference.riskLevel === "Alert"
                ? 1.0
                : 0.75;
          const isSelected = node.id === selectedNodeId;

          return (
            <Circle
              key={`${node.id}-risk-radius`}
              center={[node.location.lat, node.location.lon]}
              radius={style.radius * intensity}
              pathOptions={{
                color: style.color,
                fillColor: style.color,
                fillOpacity: severityOpacity[node.inference.riskLevel] ?? 0.2,
                weight: isSelected ? 3.5 : 1.5,
                dashArray: node.inference.riskLevel === "Precursor Detected" ? "6, 6" : undefined,
              }}
              eventHandlers={{ click: () => onNodeClick(node) }}
            >
              <Popup>
                <div className="p-1 font-sans">
                  <div className="flex items-center gap-1.5 text-xs font-black" style={{ color: style.color }}>
                    <ShieldAlert size={14} />
                    <span>{node.inference.hazardType} Risk Zone</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-semibold mt-1">
                    Level: <b>{node.inference.riskLevel}</b> (Confidence: {node.inference.confidence}%)
                  </p>
                  <p className="text-[10px] text-slate-500">{node.location.zone}</p>
                </div>
              </Popup>
            </Circle>
          );
        })}

        {/* Risk Location Markers */}
        {displayedNodes.map((node) => {
          const style = hazardStyle[node.inference.hazardType] || {
            color: "#0d9488",
            label: "Hazard Risk",
          };
          const isSelected = node.id === selectedNodeId;

          return (
            <Marker
              key={node.id}
              position={[node.location.lat, node.location.lon]}
              icon={markerIcon(node, isSelected)}
              eventHandlers={{ click: () => onNodeClick(node) }}
            >
              <Popup>
                <div className="min-w-56 p-1.5 font-sans">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1.5 mb-1.5">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{node.name}</h4>
                      <p className="text-[9px] font-mono text-slate-500">
                        {node.id} · {node.location.lat.toFixed(3)}°N, {node.location.lon.toFixed(3)}°E
                      </p>
                    </div>
                    <span
                      className="text-[9px] font-black px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: style.color }}
                    >
                      {node.inference.riskLevel}
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-2 mb-2 border border-slate-100">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-500 font-medium">Detected Hazard:</span>
                      <span className="font-black" style={{ color: style.color }}>
                        {node.inference.hazardType}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-500 font-medium">AI Confidence:</span>
                      <span className="font-bold text-slate-800">{node.inference.confidence}%</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Capture Interval:</span>
                      <span className="font-semibold text-teal-700">30 minutes</span>
                    </div>
                  </div>

                  {/* Telemetry quick metrics */}
                  <div className="grid grid-cols-2 gap-1 text-[10px] mb-2">
                    <div className="bg-blue-50/80 rounded px-1.5 py-1 text-blue-800 font-medium">
                      Water: <b>{node.telemetry.waterLevel}m</b>
                    </div>
                    <div className="bg-purple-50/80 rounded px-1.5 py-1 text-purple-800 font-medium">
                      AQI: <b>{node.telemetry.aqi}</b>
                    </div>
                    <div className="bg-orange-50/80 rounded px-1.5 py-1 text-orange-800 font-medium">
                      Temp: <b>{node.telemetry.temperature}°C</b>
                    </div>
                    <div className="bg-emerald-50/80 rounded px-1.5 py-1 text-emerald-800 font-medium">
                      Soil: <b>{node.telemetry.soilMoisture}%</b>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-600 bg-amber-50/80 border border-amber-200 rounded p-1.5 mb-2">
                    <b>Action:</b> {node.inference.recommendation}
                  </div>

                  <button
                    onClick={() => onNodeClick(node)}
                    className="w-full py-1.5 text-center text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
                  >
                    View 30-min Telemetry
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Top Left: OpenFreeMap & Risk Detection Selector */}
      <div className="absolute left-3 top-3 z-[500] flex flex-col gap-2 max-w-xs">
        <div className="rounded-2xl bg-white/95 px-3.5 py-2.5 shadow-md backdrop-blur border border-slate-200/90">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-node-pulse" />
            <p className="text-[10px] font-black uppercase tracking-wider text-teal-700">
              OpenFreeMap · Location Risk Detection
            </p>
          </div>
          <p className="text-[11px] font-semibold text-slate-700">
            {riskNodes.length} active risk zones detected
          </p>

          {/* Quick jump to detected risk location */}
          <div className="mt-2 pt-2 border-t border-slate-200/80 flex items-center gap-1.5">
            <Crosshair size={12} className="text-teal-600 shrink-0" />
            <select
              value={selectedNodeId ?? activeZoneFilter}
              onChange={(e) => {
                const id = e.target.value;
                if (id === "all") {
                  setActiveZoneFilter("all");
                } else {
                  const target = riskNodes.find((n) => n.id === id);
                  if (target) onNodeClick(target);
                }
              }}
              className="text-[11px] font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2 py-1 outline-none w-full cursor-pointer focus:border-teal-500"
            >
              <option value="all">Detect All Risk Locations</option>
              {riskNodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} — {n.inference.hazardType} ({n.inference.riskLevel})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bottom Right: Hazard Legend */}
      <div className="absolute bottom-4 right-3 z-[500] rounded-2xl bg-white/95 px-3 py-2.5 shadow-md backdrop-blur border border-slate-200/90">
        <p className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
          Risk Hazard Type
        </p>
        <div className="space-y-1">
          {Object.entries(hazardStyle).map(([name, value]) => (
            <div key={name} className="flex items-center gap-2 text-[10px] font-semibold text-slate-700">
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
  );
}

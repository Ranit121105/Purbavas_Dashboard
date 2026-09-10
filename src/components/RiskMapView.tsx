"use client";

import { useState } from "react";
import NetworkMap from "./NetworkMap";
import TelemetryChart from "./TelemetryChart";
import type { SensorNode } from "@/lib/mockData";
import {
  Layers,
  Thermometer,
  Droplets,
  Wind,
  Flame,
  Mountain,
  Waves,
  Crosshair,
  MapPin,
  AlertTriangle,
} from "lucide-react";

interface RiskMapViewProps {
  nodes: SensorNode[];
  selectedNodeId?: string | null;
  selectedNode: SensorNode | null;
  onNodeClick: (node: SensorNode) => void;
}

type MapLayer = "all" | "flood" | "fire" | "pollution" | "landslide" | "heat";

const LAYER_CONFIG: Record<
  MapLayer,
  { label: string; icon: React.ReactNode; color: string; activeClass: string }
> = {
  all: { label: "All Risk Zones", icon: <Layers size={13} />, color: "text-teal-600", activeClass: "bg-teal-50 border-teal-300 text-teal-800" },
  flood: { label: "Flood Risk", icon: <Droplets size={13} />, color: "text-blue-600", activeClass: "bg-blue-50 border-blue-300 text-blue-800" },
  fire: { label: "Fire Risk", icon: <Flame size={13} />, color: "text-red-600", activeClass: "bg-red-50 border-red-300 text-red-800" },
  pollution: { label: "Pollution", icon: <Wind size={13} />, color: "text-purple-600", activeClass: "bg-purple-50 border-purple-300 text-purple-800" },
  landslide: { label: "Landslide", icon: <Mountain size={13} />, color: "text-amber-600", activeClass: "bg-amber-50 border-amber-300 text-amber-800" },
  heat: { label: "Extreme Heat", icon: <Thermometer size={13} />, color: "text-orange-600", activeClass: "bg-orange-50 border-orange-300 text-orange-800" },
};

export default function RiskMapView({ nodes, selectedNode, onNodeClick }: RiskMapViewProps) {
  const [activeLayer, setActiveLayer] = useState<MapLayer>("all");

  const filteredNodes =
    activeLayer === "all"
      ? nodes.filter((n) => n.inference.riskLevel !== "Normal" && n.status !== "Offline")
      : nodes.filter((n) => {
          const hazard = n.inference.hazardType.toLowerCase();
          return (
            n.inference.riskLevel !== "Normal" &&
            n.status !== "Offline" &&
            (hazard === activeLayer ||
              (activeLayer === "heat" && n.inference.hazardType === "Extreme Heat"))
          );
        });

  const chartNode = selectedNode ?? nodes.find(n => n.inference.riskLevel === "Critical") ?? nodes[0];

  return (
    <div className="space-y-4">
      {/* Layer Controls & Location Risk Detection Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex gap-1.5 flex-wrap">
          {(Object.entries(LAYER_CONFIG) as [MapLayer, (typeof LAYER_CONFIG)[MapLayer]][]).map(
            ([key, cfg]) => (
              <button
                key={key}
                onClick={() => setActiveLayer(key)}
                className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all shadow-xs ${
                  activeLayer === key
                    ? cfg.activeClass
                    : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span className={activeLayer === key ? "" : cfg.color}>{cfg.icon}</span>
                {cfg.label}
              </button>
            )
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs self-start">
          <MapPin size={13} className="text-teal-600" />
          <span>OpenFreeMap Standard</span>
        </div>
      </div>

      {/* Map + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map takes 2/3 */}
        <div className="lg:col-span-2 h-[500px]">
          <NetworkMap
            nodes={filteredNodes}
            onNodeClick={onNodeClick}
            selectedNodeId={selectedNode?.id ?? null}
          />
        </div>

        {/* Chart takes 1/3 */}
        <div className="h-[500px]">
          <TelemetryChart node={chartNode} />
        </div>
      </div>

      {/* Risk Summary Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Waves size={16} className="text-teal-600" />
            <div>
              <p className="text-xs font-bold text-slate-900">Detected India Disaster Risk Summary</p>
              <p className="text-[10px] text-slate-500 font-medium">30-minute interval sensor readings and edge AI risk classification</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded-lg">
            {nodes.filter((n) => n.inference.riskLevel !== "Normal").length} Hazards Detected
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                {["Zone / Location", "Node", "Detected Hazard", "Risk Level", "Water Level", "AQI", "Temp", "AI Confidence", "Action"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[9px] text-slate-500 uppercase tracking-widest font-bold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {nodes
                .filter((n) => n.inference.riskLevel !== "Normal")
                .sort((a, b) => {
                  const order = { Critical: 0, Alert: 1, "Precursor Detected": 2, Normal: 3 };
                  return order[a.inference.riskLevel] - order[b.inference.riskLevel];
                })
                .map((node) => {
                  const isSelected = node.id === selectedNode?.id;
                  return (
                    <tr
                      key={node.id}
                      onClick={() => onNodeClick(node)}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                        isSelected ? "bg-teal-50/60 font-medium" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-[11px] text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={11} className="text-teal-600 shrink-0" />
                          <span>{node.location.zone}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[11px] font-bold text-slate-900">
                        {node.name}
                        <span className="text-[9px] font-mono text-slate-400 block">{node.id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-bold text-slate-800">
                          {node.inference.hazardType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            node.inference.riskLevel === "Critical"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : node.inference.riskLevel === "Alert"
                                ? "bg-orange-50 text-orange-700 border-orange-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {node.inference.riskLevel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[11px] font-bold text-blue-600">
                        {node.telemetry.waterLevel}m
                      </td>
                      <td className="px-4 py-3 text-[11px] font-bold text-purple-600">
                        {node.telemetry.aqi}
                      </td>
                      <td className="px-4 py-3 text-[11px] font-bold text-orange-600">
                        {node.telemetry.temperature}°C
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-14 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                node.inference.confidence >= 85
                                  ? "bg-red-500"
                                  : node.inference.confidence >= 70
                                    ? "bg-orange-500"
                                    : "bg-amber-500"
                              }`}
                              style={{ width: `${node.inference.confidence}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-700">
                            {node.inference.confidence}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNodeClick(node);
                          }}
                          className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 px-2 py-1 rounded-lg transition-colors"
                        >
                          Detect on Map
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

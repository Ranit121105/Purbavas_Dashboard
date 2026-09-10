"use client";

import KpiCards from "./KpiCards";
import NetworkMap from "./NetworkMap";
import TelemetryChart from "./TelemetryChart";
import AlertsFeed from "./AlertsFeed";
import type { SensorNode, Alert } from "@/lib/mockData";
import {
  Activity,
  Cpu,
  Droplets,
  Flame,
  Mountain,
  Wind,
  Thermometer,
  Zap,
} from "lucide-react";

interface OverviewTabProps {
  nodes: SensorNode[];
  alerts: Alert[];
  selectedNode: SensorNode | null;
  onNodeClick: (node: SensorNode) => void;
  onAcknowledge: (id: string) => void;
  onNotify: (id: string) => void;
}

export default function OverviewTab({
  nodes,
  alerts,
  selectedNode,
  onNodeClick,
  onAcknowledge,
  onNotify,
}: OverviewTabProps) {
  const chartNode = selectedNode ?? nodes.find(n => n.inference.riskLevel === "Critical") ?? nodes[0];

  // Hazard type counts
  const hazardCounts = [
    { hazard: "Flood", count: nodes.filter(n => n.inference.hazardType === "Flood").length, icon: <Droplets size={14} />, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
    { hazard: "Fire", count: nodes.filter(n => n.inference.hazardType === "Fire").length, icon: <Flame size={14} />, color: "text-red-700", bg: "bg-red-50 border-red-200" },
    { hazard: "Pollution", count: nodes.filter(n => n.inference.hazardType === "Pollution").length, icon: <Wind size={14} />, color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
    { hazard: "Landslide", count: nodes.filter(n => n.inference.hazardType === "Landslide").length, icon: <Mountain size={14} />, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
    { hazard: "Extreme Heat", count: nodes.filter(n => n.inference.hazardType === "Extreme Heat").length, icon: <Thermometer size={14} />, color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
  ];

  const activeRiskNodesCount = nodes.filter(n => n.inference.riskLevel !== "Normal" && n.status !== "Offline").length;

  return (
    <div className="space-y-4">
      {/* Row 1: KPI Cards */}
      <KpiCards
        totalNodes={45}
        onlineNodes={42}
        criticalAlerts={alerts.filter((a) => a.riskLevel === "Critical").length}
        activeAlerts={alerts.filter((a) => a.riskLevel !== "Normal").length}
        hazardZonesCount={activeRiskNodesCount}
        highestRiskZone="Zone A – Brahmaputra River Basin, Assam"
      />

      {/* Row 2: OpenFreeMap Hardware Risk Detection Map + Live 30m Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Map */}
        <div className="lg:col-span-3 min-h-[500px] h-[520px]">
          <div className="h-full flex flex-col bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-2 px-1">
              <div className="flex items-center gap-2">
                <Activity size={15} className="text-teal-600" />
                <p className="text-xs font-bold text-slate-900">
                  OpenFreeMap Standard · India Disaster Risk Grid
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-node-pulse" />
                  <span className="text-[10px] text-teal-700 font-bold uppercase tracking-wider">
                    NAVIC HARDWARE LOCATED
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-0 relative">
              <NetworkMap
                nodes={nodes}
                onNodeClick={onNodeClick}
                selectedNodeId={selectedNode?.id ?? null}
              />
            </div>
          </div>
        </div>

        {/* Right panel: Telemetry Chart + Hazard Summary */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Telemetry Chart */}
          <div className="flex-1 min-h-[290px]">
            <TelemetryChart node={chartNode} />
          </div>

          {/* Hazard Distribution */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs">
            <div className="flex items-center gap-2 mb-2.5">
              <Zap size={14} className="text-amber-500" />
              <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                Active India Hazard Detection Summary
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1.5">
              {hazardCounts.map((h) => (
                <div key={h.hazard} className={`flex items-center justify-between px-3 py-1.5 rounded-xl border ${h.bg}`}>
                  <div className="flex items-center gap-2">
                    <span className={h.color}>{h.icon}</span>
                    <span className="text-[11px] text-slate-700 font-bold">{h.hazard}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-sm font-black ${h.color}`}>{h.count}</span>
                    <span className="text-[10px] text-slate-500 font-medium">sector{h.count !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Alert Feed */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Cpu size={15} className="text-red-600" />
          <p className="text-xs font-bold text-slate-900">Edge AI Alert Feed (30-Minute Assessment Cycles · India Grid)</p>
        </div>
        <AlertsFeed
          alerts={alerts}
          onAcknowledge={onAcknowledge}
          onNotify={onNotify}
        />
      </div>
    </div>
  );
}

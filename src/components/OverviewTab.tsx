"use client";

import KpiCards from "./KpiCards";
import NetworkMap from "./NetworkMap";
import TelemetryChart from "./TelemetryChart";
import AlertsFeed from "./AlertsFeed";
import type { SensorNode, Alert } from "@/lib/mockData";
import {
  BarChart2,
  Activity,
  Cpu,
  Droplets,
  Flame,
  Mountain,
  Wind,
  Thermometer,
  Zap,
  Clock,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface OverviewTabProps {
  nodes: SensorNode[];
  alerts: Alert[];
  selectedNode: SensorNode | null;
  onNodeClick: (node: SensorNode) => void;
  onAcknowledge: (id: string) => void;
  onNotify: (id: string) => void;
}

// Custom bar tooltip in light mode
function BarTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-lg">
        <p className="text-[10px] text-slate-500 mb-1 font-mono font-bold">{label} (Latest 30m record)</p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-xs text-slate-600 font-medium">
              {p.name}: <b className="text-slate-900">{p.value}</b>
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
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

  // Regional AQI by zone
  const aqiBarData = nodes
    .filter((n) => n.status !== "Offline")
    .slice(0, 8)
    .map((n) => ({
      name: n.name.split(" ")[1] ?? n.name,
      aqi: n.telemetry.aqi,
      temp: n.telemetry.temperature,
    }));

  // Hazard type counts
  const hazardCounts = [
    { hazard: "Flood", count: nodes.filter(n => n.inference.hazardType === "Flood").length, icon: <Droplets size={14} />, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
    { hazard: "Fire", count: nodes.filter(n => n.inference.hazardType === "Fire").length, icon: <Flame size={14} />, color: "text-red-700", bg: "bg-red-50 border-red-200" },
    { hazard: "Pollution", count: nodes.filter(n => n.inference.hazardType === "Pollution").length, icon: <Wind size={14} />, color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
    { hazard: "Landslide", count: nodes.filter(n => n.inference.hazardType === "Landslide").length, icon: <Mountain size={14} />, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
    { hazard: "Extreme Heat", count: nodes.filter(n => n.inference.hazardType === "Extreme Heat").length, icon: <Thermometer size={14} />, color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
  ];

  return (
    <div className="space-y-4">
      {/* Row 1: KPI Cards */}
      <KpiCards
        totalNodes={45}
        onlineNodes={42}
        criticalAlerts={alerts.filter((a) => a.riskLevel === "Critical").length}
        activeAlerts={alerts.filter((a) => a.riskLevel !== "Normal").length}
        avgAQI={Math.round(nodes.filter(n => n.status !== "Offline").reduce((a, b) => a + b.telemetry.aqi, 0) / Math.max(1, nodes.filter(n => n.status !== "Offline").length))}
        highestRiskZone="Zone A – River Basin"
      />

      {/* Row 2: Map + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Map */}
        <div className="lg:col-span-3 h-[420px]">
          <div className="h-full flex flex-col bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
            <div className="flex items-center gap-2 mb-2 px-1">
              <Activity size={15} className="text-teal-600" />
              <p className="text-xs font-bold text-slate-900">OpenFreeMap Risk Location Detection</p>
              <div className="ml-auto flex items-center gap-1.5 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-node-pulse" />
                <span className="text-[10px] text-teal-700 font-bold uppercase tracking-wider">RISK LOCATIONS</span>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <NetworkMap
                nodes={nodes}
                onNodeClick={onNodeClick}
                selectedNodeId={selectedNode?.id ?? null}
              />
            </div>
          </div>
        </div>

        {/* Right panel: Chart + Mini stats */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Telemetry Chart */}
          <div className="flex-1 min-h-64">
            <TelemetryChart node={chartNode} />
          </div>

          {/* Hazard Distribution */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs">
            <div className="flex items-center gap-2 mb-2.5">
              <Zap size={14} className="text-amber-500" />
              <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                Active Hazard Detection Summary
              </p>
            </div>
            <div className="space-y-1.5">
              {hazardCounts.map((h) => (
                <div key={h.hazard} className={`flex items-center justify-between px-3 py-1.5 rounded-xl border ${h.bg}`}>
                  <div className="flex items-center gap-2">
                    <span className={h.color}>{h.icon}</span>
                    <span className="text-[11px] text-slate-700 font-bold">{h.hazard}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-sm font-black ${h.color}`}>{h.count}</span>
                    <span className="text-[10px] text-slate-500 font-medium">zone{h.count !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Recorded conditions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wind size={15} className="text-purple-600" />
            <p className="text-xs font-bold text-slate-900">AQI & Temperature Comparison Across Monitored Nodes</p>
          </div>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
            30-Minute Interval Snapshot
          </span>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={aqiBarData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" strokeOpacity={1} />
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip content={<BarTooltip />} />
              <Bar dataKey="aqi" name="AQI (PM2.5)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="temp" name="Temperature (°C)" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 4: Alert Feed */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Cpu size={15} className="text-red-600" />
          <p className="text-xs font-bold text-slate-900">Edge AI Alert Feed (30-Minute Assessment Cycles)</p>
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

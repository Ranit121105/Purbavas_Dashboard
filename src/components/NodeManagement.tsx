"use client";

import { useState } from "react";
import {
  Cpu,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  Battery,
  Sun,
  Clock,
  ChevronRight,
  Signal,
  Thermometer,
  Droplets,
  Waves,
  Wind,
  Timer,
} from "lucide-react";
import type { SensorNode, NodeStatus, RiskLevel } from "@/lib/mockData";

interface NodeManagementProps {
  nodes: SensorNode[];
  onNodeSelect: (node: SensorNode) => void;
}

const STATUS_STYLE: Record<NodeStatus, { color: string; icon: React.ReactNode; bg: string }> = {
  Online: {
    color: "text-emerald-700",
    icon: <Wifi size={12} />,
    bg: "bg-emerald-50 border-emerald-200",
  },
  Offline: {
    color: "text-red-700",
    icon: <WifiOff size={12} />,
    bg: "bg-red-50 border-red-200",
  },
  "Low-Bandwidth": {
    color: "text-amber-700",
    icon: <Signal size={12} />,
    bg: "bg-amber-50 border-amber-200",
  },
};

const RISK_COLOR: Record<RiskLevel, string> = {
  Normal: "text-emerald-700",
  "Precursor Detected": "text-amber-700",
  Alert: "text-orange-700",
  Critical: "text-red-700",
};

const RISK_BG: Record<RiskLevel, string> = {
  Normal: "bg-emerald-50 border-emerald-200",
  "Precursor Detected": "bg-amber-50 border-amber-200",
  Alert: "bg-orange-50 border-orange-200",
  Critical: "bg-red-50 border-red-200",
};

export default function NodeManagement({ nodes, onNodeSelect }: NodeManagementProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<NodeStatus | "All">("All");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "All">("All");
  const [view, setView] = useState<"grid" | "table">("grid");

  const filtered = nodes.filter((n) => {
    const matchSearch =
      n.name.toLowerCase().includes(search.toLowerCase()) ||
      n.id.toLowerCase().includes(search.toLowerCase()) ||
      n.location.zone.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || n.status === statusFilter;
    const matchRisk =
      riskFilter === "All" || n.inference.riskLevel === riskFilter;
    return matchSearch && matchStatus && matchRisk;
  });

  const stats = {
    online: nodes.filter((n) => n.status === "Online").length,
    offline: nodes.filter((n) => n.status === "Offline").length,
    lowBand: nodes.filter((n) => n.status === "Low-Bandwidth").length,
    critical: nodes.filter((n) => n.inference.riskLevel === "Critical").length,
    alert: nodes.filter((n) => n.inference.riskLevel === "Alert").length,
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: "Online Nodes", value: stats.online, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", icon: <Wifi size={15} /> },
          { label: "Offline Nodes", value: stats.offline, color: "text-red-600", bg: "bg-red-50 border-red-200", icon: <WifiOff size={15} /> },
          { label: "Low-Bandwidth", value: stats.lowBand, color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: <Signal size={15} /> },
          { label: "Critical Risk", value: stats.critical, color: "text-red-600", bg: "bg-red-50 border-red-200", icon: <AlertTriangle size={15} /> },
          { label: "Alert Hazards", value: stats.alert, color: "text-orange-600", bg: "bg-orange-50 border-orange-200", icon: <CheckCircle size={15} /> },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} border rounded-2xl px-3.5 py-3 flex items-center gap-3 shadow-xs`}>
            <span className={s.color}>{s.icon}</span>
            <div>
              <p className="text-xl font-black text-slate-900 leading-tight">{s.value}</p>
              <p className="text-[10px] text-slate-600 font-semibold">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search nodes by name, ID, or zone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 rounded-xl pl-9 pr-3 py-2 outline-none focus:border-teal-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as NodeStatus | "All")}
              className="bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 rounded-xl px-2.5 py-2 outline-none cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Low-Bandwidth">Low-BW</option>
            </select>
          </div>

          {/* Risk Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value as RiskLevel | "All")}
            className="bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 rounded-xl px-2.5 py-2 outline-none cursor-pointer"
          >
            <option value="All">All Risk Levels</option>
            <option value="Critical">Critical</option>
            <option value="Alert">Alert</option>
            <option value="Precursor Detected">Precursor</option>
            <option value="Normal">Normal</option>
          </select>

          {/* View Toggle */}
          <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-0.5">
            {(["grid", "table"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-bold capitalize transition-all rounded-lg ${
                  view === v
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Nodes Grid / Table */}
      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((node) => {
            const statusStyle = STATUS_STYLE[node.status];
            const riskColor = RISK_COLOR[node.inference.riskLevel];
            const riskBg = RISK_BG[node.inference.riskLevel];
            const isCritical = node.inference.riskLevel === "Critical";

            return (
              <button
                key={node.id}
                onClick={() => onNodeSelect(node)}
                className={`text-left bg-white border rounded-2xl p-4 hover:shadow-md transition-all group shadow-xs ${
                  isCritical
                    ? "border-red-300 ring-1 ring-red-200"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* Top */}
                <div className="flex items-start justify-between mb-2.5">
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
                      {node.name}
                    </p>
                    <p className="text-[10px] font-mono text-slate-500 font-medium">{node.id}</p>
                  </div>
                  <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusStyle.bg} ${statusStyle.color}`}>
                    {statusStyle.icon}
                    {node.status}
                  </div>
                </div>

                {/* Risk Badge */}
                <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-xl border mb-3 ${riskBg} ${riskColor}`}>
                  {node.inference.riskLevel !== "Normal" && (
                    <AlertTriangle size={11} />
                  )}
                  {node.inference.riskLevel}
                  {node.inference.confidence > 0 && (
                    <span className="opacity-80">· {node.inference.confidence}%</span>
                  )}
                </div>

                {/* Telemetry Grid */}
                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  {[
                    { icon: <Thermometer size={11} />, label: "Temp", value: `${node.telemetry.temperature}°C`, color: "text-orange-600" },
                    { icon: <Droplets size={11} />, label: "Humid", value: `${node.telemetry.humidity}%`, color: "text-blue-600" },
                    { icon: <Waves size={11} />, label: "Water", value: `${node.telemetry.waterLevel}m`, color: "text-teal-600" },
                    { icon: <Wind size={11} />, label: "AQI", value: `${node.telemetry.aqi}`, color: "text-purple-600" },
                  ].map((t) => (
                    <div key={t.label} className="bg-slate-50 rounded-xl px-2 py-1.5 flex items-center gap-1.5 border border-slate-100">
                      <span className={t.color}>{t.icon}</span>
                      <div>
                        <p className="text-[8px] text-slate-500 font-medium">{t.label}</p>
                        <p className="text-[10px] font-bold text-slate-800">{t.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      <Battery size={11} className={node.batteryLevel > 50 ? "text-emerald-600" : node.batteryLevel > 25 ? "text-amber-600" : "text-red-600"} />
                      <span className="text-[9px] text-slate-500 font-semibold">{node.batteryLevel}%</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Sun size={11} className="text-amber-500" />
                      <span className="text-[9px] text-slate-500 font-semibold">{node.solarInput}W</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Timer size={11} className="text-teal-600" />
                      <span className="text-[9px] text-slate-500 font-semibold">30m</span>
                    </div>
                  </div>
                  <ChevronRight size={13} className="text-slate-400 group-hover:text-teal-600 transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {["Node", "Zone", "Status", "Risk Level", "AI Confidence", "Temp", "AQI", "Water", "Battery", "Capture", ""].map((h) => (
                    <th key={h} className="px-3.5 py-3 text-left text-[9px] text-slate-500 uppercase tracking-widest font-bold whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((node) => {
                  const statusStyle = STATUS_STYLE[node.status];
                  const riskColor = RISK_COLOR[node.inference.riskLevel];
                  return (
                    <tr
                      key={node.id}
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                      onClick={() => onNodeSelect(node)}
                    >
                      <td className="px-3.5 py-3">
                        <p className="font-bold text-slate-900 text-[11px] group-hover:text-teal-600 transition-colors">
                          {node.name}
                        </p>
                        <p className="text-[9px] font-mono text-slate-400 font-semibold">{node.id}</p>
                      </td>
                      <td className="px-3.5 py-3 text-[10px] text-slate-600 font-medium whitespace-nowrap max-w-28 truncate">
                        {node.location.zone}
                      </td>
                      <td className="px-3.5 py-3">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${statusStyle.bg} ${statusStyle.color}`}>
                          {statusStyle.icon} {node.status}
                        </span>
                      </td>
                      <td className="px-3.5 py-3">
                        <span className={`text-[10px] font-bold ${riskColor}`}>
                          {node.inference.riskLevel}
                        </span>
                      </td>
                      <td className="px-3.5 py-3">
                        <div className="flex items-center gap-1.5 min-w-16">
                          <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${node.inference.confidence >= 85 ? "bg-red-500" : node.inference.confidence >= 70 ? "bg-orange-500" : "bg-amber-500"}`}
                              style={{ width: `${node.inference.confidence}%` }}
                            />
                          </div>
                          <span className="text-[9px] text-slate-700 font-bold">
                            {node.inference.confidence > 0 ? `${node.inference.confidence}%` : "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-3.5 py-3 text-[11px] font-bold text-orange-600">
                        {node.telemetry.temperature}°C
                      </td>
                      <td className="px-3.5 py-3 text-[11px] font-bold text-purple-600">
                        {node.telemetry.aqi}
                      </td>
                      <td className="px-3.5 py-3 text-[11px] font-bold text-blue-600">
                        {node.telemetry.waterLevel}m
                      </td>
                      <td className="px-3.5 py-3">
                        <div className="flex items-center gap-1">
                          <div className="w-8 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${node.batteryLevel > 50 ? "bg-emerald-500" : node.batteryLevel > 25 ? "bg-amber-500" : "bg-red-500"}`}
                              style={{ width: `${node.batteryLevel}%` }}
                            />
                          </div>
                          <span className="text-[9px] text-slate-600 font-bold">{node.batteryLevel}%</span>
                        </div>
                      </td>
                      <td className="px-3.5 py-3 text-[10px] font-semibold text-teal-700">
                        30m interval
                      </td>
                      <td className="px-3.5 py-3">
                        <ChevronRight size={14} className="text-slate-400 group-hover:text-teal-600 transition-colors" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50/50">
            <p className="text-[10px] text-slate-500 font-semibold">
              Showing {filtered.length} of {nodes.length} nodes (30-minute interval updates)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

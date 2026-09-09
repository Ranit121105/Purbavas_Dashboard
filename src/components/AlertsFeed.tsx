"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Radio,
  Droplets,
  Flame,
  Wind,
  Mountain,
  Thermometer,
  Info,
  ChevronDown,
  ChevronUp,
  Phone,
  Timer,
} from "lucide-react";
import type { Alert, HazardType, RiskLevel } from "@/lib/mockData";

interface AlertsFeedProps {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
  onNotify: (id: string) => void;
}

const HAZARD_ICON: Record<HazardType, React.ReactNode> = {
  Flood: <Droplets size={14} />,
  Fire: <Flame size={14} />,
  Pollution: <Wind size={14} />,
  Landslide: <Mountain size={14} />,
  "Extreme Heat": <Thermometer size={14} />,
  Normal: <Info size={14} />,
};

const RISK_STYLES: Record<RiskLevel, { bg: string; border: string; text: string; badge: string }> = {
  Critical: {
    bg: "bg-red-50/70 hover:bg-red-50",
    border: "border-red-500",
    text: "text-red-700",
    badge: "bg-red-100 text-red-800 border-red-200",
  },
  Alert: {
    bg: "bg-orange-50/70 hover:bg-orange-50",
    border: "border-orange-500",
    text: "text-orange-700",
    badge: "bg-orange-100 text-orange-800 border-orange-200",
  },
  "Precursor Detected": {
    bg: "bg-amber-50/70 hover:bg-amber-50",
    border: "border-amber-500",
    text: "text-amber-800",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
  },
  Normal: {
    bg: "bg-slate-50/50 hover:bg-slate-50",
    border: "border-slate-300",
    text: "text-slate-600",
    badge: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

const HAZARD_COLOR: Record<HazardType, string> = {
  Flood: "text-blue-600",
  Fire: "text-red-600",
  Pollution: "text-purple-600",
  Landslide: "text-amber-600",
  "Extreme Heat": "text-orange-600",
  Normal: "text-slate-500",
};

function ConfidenceBar({ value, riskLevel }: { value: number; riskLevel: RiskLevel }) {
  const color =
    value >= 85
      ? "bg-red-500"
      : value >= 70
        ? "bg-orange-500"
        : value >= 50
          ? "bg-amber-500"
          : "bg-slate-400";

  return (
    <div className="flex items-center gap-2 min-w-28">
      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span
        className={`text-[10px] font-bold w-8 text-right ${
          value >= 85
            ? "text-red-700"
            : value >= 70
              ? "text-orange-700"
              : "text-amber-700"
        }`}
      >
        {value > 0 ? `${value}%` : "N/A"}
      </span>
    </div>
  );
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AlertsFeed({
  alerts,
  onAcknowledge,
  onNotify,
}: AlertsFeedProps) {
  const [filter, setFilter] = useState<RiskLevel | "All">("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"time" | "confidence">("time");

  const filtered = alerts
    .filter((a) => filter === "All" || a.riskLevel === filter)
    .sort((a, b) => {
      if (sortBy === "confidence") return b.confidence - a.confidence;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

  const unackCount = alerts.filter(
    (a) => !a.acknowledged && a.riskLevel !== "Normal"
  ).length;

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
              <Radio size={15} className="text-red-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Edge AI Alert Feed</p>
              <p className="text-[10px] text-slate-500 font-medium">
                Risk assessments evaluated every 30 minutes by ESP32 edge nodes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unackCount > 0 && (
              <span className="text-[10px] font-bold px-2.5 py-1 bg-red-100 text-red-700 border border-red-200 rounded-full animate-status-blink">
                {unackCount} Unread
              </span>
            )}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "time" | "confidence")}
              className="text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 rounded-xl px-2.5 py-1 outline-none cursor-pointer shadow-xs"
            >
              <option value="time">Sort: Latest</option>
              <option value="confidence">Sort: Confidence</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 flex-wrap">
          {(["All", "Critical", "Alert", "Precursor Detected", "Normal"] as const).map(
            (f) => {
              const count =
                f === "All"
                  ? alerts.length
                  : alerts.filter((a) => a.riskLevel === f).length;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-[11px] font-bold px-3 py-1 rounded-xl border transition-all ${
                    filter === f
                      ? f === "All"
                        ? "bg-teal-50 border-teal-300 text-teal-800 shadow-xs"
                        : f === "Critical"
                          ? "bg-red-50 border-red-300 text-red-800 shadow-xs"
                          : f === "Alert"
                            ? "bg-orange-50 border-orange-300 text-orange-800 shadow-xs"
                            : f === "Precursor Detected"
                              ? "bg-amber-50 border-amber-300 text-amber-800 shadow-xs"
                              : "bg-slate-100 border-slate-300 text-slate-800 shadow-xs"
                      : "border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {f}{" "}
                  <span className="opacity-60">({count})</span>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Table Header */}
      <div className="hidden md:grid grid-cols-[1fr_100px_120px_130px_140px_100px] gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
        {["Time / Node", "Hazard", "Risk Level", "AI Confidence", "Recommendation", "Actions"].map((h) => (
          <p key={h} className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">
            {h}
          </p>
        ))}
      </div>

      {/* Alert Rows */}
      <div className="overflow-y-auto max-h-80 divide-y divide-slate-100">
        {filtered.length === 0 && (
          <div className="flex items-center justify-center py-12 text-slate-500">
            <div className="text-center">
              <CheckCircle size={32} className="mx-auto mb-2 text-emerald-500" />
              <p className="text-sm font-bold text-slate-800">No alerts for this filter</p>
              <p className="text-xs text-slate-500 font-medium">30-minute system monitoring active</p>
            </div>
          </div>
        )}

        {filtered.map((alert) => {
          const styles = RISK_STYLES[alert.riskLevel];
          const isExpanded = expandedId === alert.id;
          const isAcked = alert.acknowledged;

          return (
            <div
              key={alert.id}
              className={`${styles.bg} border-l-4 ${styles.border} transition-all`}
            >
              {/* Main Row */}
              <div
                className="grid grid-cols-1 md:grid-cols-[1fr_100px_120px_130px_140px_100px] gap-2 px-4 py-3 items-center cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : alert.id)}
              >
                {/* Time / Node */}
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {!isAcked && alert.riskLevel !== "Normal" && (
                      <span
                        className={`w-2 h-2 rounded-full ${styles.text} bg-current animate-status-blink`}
                      />
                    )}
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {alert.nodeName}
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {alert.nodeId} · {timeAgo(alert.timestamp)} (30m cycle)
                  </p>
                  <p className="text-[10px] text-slate-600 truncate font-medium">{alert.zone}</p>
                </div>

                {/* Hazard Type */}
                <div className="flex items-center gap-1.5 hidden md:flex">
                  <span className={HAZARD_COLOR[alert.hazardType]}>
                    {HAZARD_ICON[alert.hazardType]}
                  </span>
                  <span className="text-[11px] text-slate-800 font-bold">
                    {alert.hazardType}
                  </span>
                </div>

                {/* Risk Level */}
                <div className="hidden md:block">
                  <span
                    className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border ${styles.badge}`}
                  >
                    {alert.riskLevel}
                  </span>
                </div>

                {/* AI Confidence */}
                <div className="hidden md:block">
                  <ConfidenceBar
                    value={alert.confidence}
                    riskLevel={alert.riskLevel}
                  />
                </div>

                {/* Recommendation */}
                <p className="text-[10px] text-slate-600 truncate hidden md:block leading-snug font-medium">
                  {alert.recommendation}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-1 hidden md:flex">
                  {!isAcked && alert.riskLevel !== "Normal" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAcknowledge(alert.id);
                      }}
                      className="flex items-center gap-1 text-[9px] font-bold px-2 py-1 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all shadow-xs"
                    >
                      <CheckCircle size={10} />
                      ACK
                    </button>
                  )}
                  {!alert.notified && alert.riskLevel !== "Normal" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNotify(alert.id);
                      }}
                      className="flex items-center gap-1 text-[9px] font-bold px-2 py-1 bg-red-100 border border-red-200 text-red-800 hover:bg-red-200 rounded-lg transition-all shadow-xs"
                    >
                      <Phone size={10} />
                      NOTIFY
                    </button>
                  )}
                  {(isAcked || alert.riskLevel === "Normal") && (
                    <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600">
                      <CheckCircle size={11} />
                      {isAcked ? "ACK'd" : "Clear"}
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedId(isExpanded ? null : alert.id);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronUp size={13} />
                    ) : (
                      <ChevronDown size={13} />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-4 pb-3 animate-fade-in">
                  <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
                    <div className="flex items-start gap-2 mb-2.5">
                      <AlertTriangle size={14} className={styles.text + " mt-0.5 shrink-0"} />
                      <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                        {alert.message}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Alert ID</p>
                        <p className="text-[11px] font-mono font-bold text-slate-800">{alert.id}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Timestamp</p>
                        <p className="text-[11px] font-mono text-slate-700">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Cycle</p>
                        <p className="text-[11px] text-teal-700 font-bold">30-min capture</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Notified</p>
                        <p className="text-[11px] font-semibold text-slate-700">
                          {alert.notified ? "✅ Authorities alerted" : "❌ Pending notify"}
                        </p>
                      </div>
                    </div>
                    {/* Mobile Action Buttons */}
                    <div className="flex gap-2 mt-3 md:hidden">
                      {!isAcked && alert.riskLevel !== "Normal" && (
                        <button
                          onClick={() => onAcknowledge(alert.id)}
                          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-slate-800 text-white rounded-xl shadow-xs"
                        >
                          <CheckCircle size={12} /> Acknowledge
                        </button>
                      )}
                      {!alert.notified && alert.riskLevel !== "Normal" && (
                        <button
                          onClick={() => onNotify(alert.id)}
                          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-red-600 text-white rounded-xl shadow-xs"
                        >
                          <Phone size={12} /> Notify Authorities
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
        <p className="text-[10px] text-slate-500 font-semibold">
          Showing {filtered.length} of {alerts.length} alerts (30-min recording interval)
        </p>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-node-pulse" />
          <p className="text-[10px] text-slate-600 font-semibold">30-min interval monitoring active</p>
        </div>
      </div>
    </div>
  );
}

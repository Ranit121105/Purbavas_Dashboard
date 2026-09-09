"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";
import type { SensorNode } from "@/lib/mockData";
import { Timer, TrendingUp } from "lucide-react";

interface TelemetryChartProps {
  node: SensorNode;
}

type MetricKey = "waterLevel" | "aqi" | "temperature" | "soilMoisture";

interface MetricConfig {
  label: string;
  color: string;
  unit: string;
  danger?: number;
  warning?: number;
}

const METRICS: Record<MetricKey, MetricConfig> = {
  waterLevel: {
    label: "Water Level",
    color: "#2563eb",
    unit: "m",
    danger: 4.0,
    warning: 2.5,
  },
  aqi: {
    label: "AQI (PM2.5)",
    color: "#7c3aed",
    unit: "µg/m³",
    danger: 150,
    warning: 100,
  },
  temperature: {
    label: "Temperature",
    color: "#ea580c",
    unit: "°C",
    danger: 40,
    warning: 35,
  },
  soilMoisture: {
    label: "Soil Moisture",
    color: "#059669",
    unit: "%",
    danger: 90,
    warning: 75,
  },
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
  unit: string;
}

function CustomTooltip({ active, payload, label, unit }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-lg">
        <p className="text-[10px] text-slate-500 mb-1 font-mono font-bold">
          Timestamp: {label} (30m sample)
        </p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-xs text-slate-600 font-medium">
              {p.name}:{" "}
              <span className="font-bold text-slate-900">
                {p.value} {unit}
              </span>
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function TelemetryChart({ node }: TelemetryChartProps) {
  const [activeMetric, setActiveMetric] = useState<MetricKey>("waterLevel");
  const [chartType, setChartType] = useState<"area" | "line">("area");

  const metric = METRICS[activeMetric];
  const data = node.history;

  const currentVal = node.telemetry[
    activeMetric === "aqi"
      ? "aqi"
      : activeMetric === "temperature"
        ? "temperature"
        : activeMetric === "soilMoisture"
          ? "soilMoisture"
          : "waterLevel"
  ] as number;

  const lastVal = data[data.length - 2]?.[activeMetric] ?? 0;
  const trend = currentVal > lastVal ? "↑" : currentVal < lastVal ? "↓" : "→";
  const trendColor =
    activeMetric === "soilMoisture"
      ? currentVal > lastVal
        ? "text-amber-600"
        : "text-emerald-600"
      : currentVal > lastVal
        ? "text-red-600"
        : "text-emerald-600";

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
              <Timer size={16} className="text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-slate-900">Telemetry (30-min interval)</p>
                <span className="text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded-md">
                  30m Sampling
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                {node.name} · Periodic 30-minute readings
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-xl shadow-xs">
            <TrendingUp size={12} className={trendColor} />
            <span className={`text-sm font-black ${trendColor}`}>
              {currentVal} {metric.unit}
            </span>
            <span className={`text-xs font-bold ${trendColor}`}>{trend}</span>
          </div>
        </div>

        {/* Metric Selector */}
        <div className="flex gap-1.5 flex-wrap items-center">
          {(Object.entries(METRICS) as [MetricKey, MetricConfig][]).map(
            ([key, m]) => (
              <button
                key={key}
                onClick={() => setActiveMetric(key)}
                className={`text-[11px] font-bold px-3 py-1.2 rounded-xl border transition-all ${
                  activeMetric === key
                    ? "shadow-xs"
                    : "border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
                style={
                  activeMetric === key
                    ? {
                        backgroundColor: m.color + "12",
                        borderColor: m.color + "45",
                        color: m.color,
                      }
                    : {}
                }
              >
                {m.label}
              </button>
            )
          )}

          <div className="ml-auto flex gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {(["area", "line"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setChartType(t)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all capitalize ${
                  chartType === t
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 p-3 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "area" ? (
            <AreaChart
              data={data}
              margin={{ top: 8, right: 12, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id={`gradient-${activeMetric}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={metric.color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={metric.color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                strokeOpacity={0.8}
              />
              <XAxis
                dataKey="time"
                tick={{ fill: "#64748b", fontSize: 9, fontFamily: "monospace", fontWeight: 600 }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
                interval={2}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 9, fontFamily: "monospace", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                width={35}
              />
              <Tooltip
                content={<CustomTooltip unit={metric.unit} />}
                cursor={{ stroke: metric.color, strokeWidth: 1.5, strokeDasharray: "3 3" }}
              />
              {metric.danger !== undefined && (
                <ReferenceLine
                  y={metric.danger}
                  stroke="#dc2626"
                  strokeDasharray="4 2"
                  strokeWidth={1}
                  label={{
                    value: "Danger",
                    fill: "#dc2626",
                    fontSize: 8,
                    fontWeight: 700,
                    position: "right",
                  }}
                />
              )}
              {metric.warning !== undefined && (
                <ReferenceLine
                  y={metric.warning}
                  stroke="#d97706"
                  strokeDasharray="4 2"
                  strokeWidth={1}
                  label={{
                    value: "Warning",
                    fill: "#d97706",
                    fontSize: 8,
                    fontWeight: 700,
                    position: "right",
                  }}
                />
              )}
              <Area
                type="monotone"
                dataKey={activeMetric}
                stroke={metric.color}
                strokeWidth={2}
                fill={`url(#gradient-${activeMetric})`}
                dot={false}
                activeDot={{ r: 5, fill: metric.color, stroke: "#ffffff", strokeWidth: 2 }}
                name={metric.label}
              />
            </AreaChart>
          ) : (
            <LineChart
              data={data}
              margin={{ top: 8, right: 12, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                strokeOpacity={0.8}
              />
              <XAxis
                dataKey="time"
                tick={{ fill: "#64748b", fontSize: 9, fontFamily: "monospace", fontWeight: 600 }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
                interval={2}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 9, fontFamily: "monospace", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                width={35}
              />
              <Tooltip
                content={<CustomTooltip unit={metric.unit} />}
                cursor={{ stroke: metric.color, strokeWidth: 1.5, strokeDasharray: "3 3" }}
              />
              {metric.danger !== undefined && (
                <ReferenceLine
                  y={metric.danger}
                  stroke="#dc2626"
                  strokeDasharray="4 2"
                  strokeWidth={1}
                />
              )}
              {metric.warning !== undefined && (
                <ReferenceLine
                  y={metric.warning}
                  stroke="#d97706"
                  strokeDasharray="4 2"
                  strokeWidth={1}
                />
              )}
              <Line
                type="monotone"
                dataKey={activeMetric}
                stroke={metric.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: metric.color, stroke: "#ffffff", strokeWidth: 2 }}
                name={metric.label}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Footer stats */}
      <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50/50 grid grid-cols-3 gap-3">
        {[
          {
            label: "Current Reading",
            value: `${currentVal} ${metric.unit}`,
            color: metric.color,
          },
          {
            label: "12h Max (30m interval)",
            value: `${Math.max(...data.map((d) => d[activeMetric])).toFixed(1)} ${metric.unit}`,
            color: "#dc2626",
          },
          {
            label: "12h Min (30m interval)",
            value: `${Math.min(...data.map((d) => d[activeMetric])).toFixed(1)} ${metric.unit}`,
            color: "#16a34a",
          },
        ].map((s) => (
          <div key={s.label}>
            <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">
              {s.label}
            </p>
            <p className="text-xs font-black" style={{ color: s.color }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

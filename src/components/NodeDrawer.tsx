"use client";

import { useEffect } from "react";
import {
  X,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  Sun,
  Cpu,
  Thermometer,
  Droplets,
  Wind,
  Waves,
  Sprout,
  Flame,
  Clock,
  Radio,
  Signal,
  CheckCircle,
  AlertTriangle,
  Gauge,
  Zap,
  Timer,
} from "lucide-react";
import type { SensorNode } from "@/lib/mockData";

interface NodeDrawerProps {
  node: SensorNode | null;
  onClose: () => void;
}

function SignalBars({ dbm }: { dbm: number }) {
  const strength =
    dbm >= -55 ? 4 : dbm >= -65 ? 3 : dbm >= -75 ? 2 : dbm >= -85 ? 1 : 0;
  return (
    <div className="flex items-end gap-1 h-4">
      {[1, 2, 3, 4].map((bar) => (
        <div
          key={bar}
          className={`rounded-xs w-2 transition-all ${
            bar <= strength ? "bg-emerald-500" : "bg-slate-200"
          }`}
          style={{ height: `${bar * 25}%` }}
        />
      ))}
    </div>
  );
}

function BatteryIndicator({ level }: { level: number }) {
  const color =
    level > 50 ? "text-emerald-600" : level > 25 ? "text-amber-600" : "text-red-600";
  const Icon = level > 20 ? Battery : BatteryLow;
  return (
    <div className="flex items-center gap-1">
      <Icon size={14} className={color} />
      <span className={`text-xs font-bold ${color}`}>{level}%</span>
    </div>
  );
}

const RISK_COLORS = {
  Normal: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
  "Precursor Detected": { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", dot: "bg-amber-500" },
  Alert: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", dot: "bg-orange-500" },
  Critical: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", dot: "bg-red-500" },
};

function TelemetryRow({
  icon,
  label,
  value,
  unit,
  warning,
  danger,
  max,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  warning?: number;
  danger?: number;
  max: number;
}) {
  const pct = Math.min(100, (value / max) * 100);
  const barColor =
    danger && value >= danger
      ? "bg-red-500"
      : warning && value >= warning
        ? "bg-amber-500"
        : "bg-teal-500";

  return (
    <div className="py-2.5 border-b border-slate-100 last:border-0">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">{icon}</span>
          <span className="text-xs text-slate-600 font-medium">{label}</span>
        </div>
        <span
          className={`text-sm font-bold font-mono ${
            danger && value >= danger
              ? "text-red-600 font-black"
              : warning && value >= warning
                ? "text-amber-600 font-black"
                : "text-slate-900"
          }`}
        >
          {value} <span className="text-[10px] font-normal text-slate-500">{unit}</span>
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function NodeDrawer({ node, onClose }: NodeDrawerProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!node) return null;

  const riskStyle = RISK_COLORS[node.inference.riskLevel];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white border-l border-slate-200 z-50 animate-slide-in-right overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-200 p-4 z-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    node.status === "Online"
                      ? "bg-emerald-500 animate-node-pulse"
                      : node.status === "Low-Bandwidth"
                        ? "bg-amber-500 animate-status-blink"
                        : "bg-red-500"
                  }`}
                />
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    node.status === "Online"
                      ? "text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md"
                      : node.status === "Low-Bandwidth"
                        ? "text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md"
                        : "text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md"
                  }`}
                >
                  {node.status}
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900">{node.name}</h2>
              <p className="text-[10px] font-mono text-slate-500 font-semibold">{node.id}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              aria-label="Close details"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* AI Inference Banner */}
          <div
            className={`rounded-2xl p-4 border ${riskStyle.bg} ${riskStyle.border} shadow-xs`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Radio size={15} className={riskStyle.text} />
                <p className="text-xs font-bold text-slate-900">Edge AI Inference</p>
              </div>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${riskStyle.bg} ${riskStyle.border} ${riskStyle.text} uppercase tracking-wider`}
              >
                {node.inference.riskLevel}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">AI Model</p>
                <p className="text-xs font-bold text-slate-900">{node.aiModel}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Hazard Type</p>
                <p className={`text-xs font-bold ${riskStyle.text}`}>
                  {node.inference.hazardType}
                </p>
              </div>
              <div>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Confidence</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        node.inference.confidence >= 85
                          ? "bg-red-500"
                          : node.inference.confidence >= 70
                            ? "bg-orange-500"
                            : "bg-amber-500"
                      } rounded-full`}
                      style={{ width: `${node.inference.confidence}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold ${riskStyle.text}`}>
                    {node.inference.confidence > 0 ? `${node.inference.confidence}%` : "N/A"}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Interval</p>
                <p className="text-xs text-slate-700 font-semibold">30-min cycle</p>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-200/80">
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1">
                Recommended Action
              </p>
              <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                {node.inference.recommendation}
              </p>
            </div>
          </div>

          {/* Hardware Status */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-3">
              Hardware Status
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {/* WiFi Signal */}
              <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-1.5 mb-1">
                  {node.status !== "Offline" ? (
                    <Wifi size={13} className="text-teal-600" />
                  ) : (
                    <WifiOff size={13} className="text-red-500" />
                  )}
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                    Signal
                  </p>
                </div>
                <SignalBars dbm={node.wifiSignal} />
                <p className="text-[10px] text-slate-600 font-mono font-bold mt-1">
                  {node.wifiSignal} dBm
                </p>
              </div>

              {/* Battery */}
              <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-1.5 mb-2">
                  <Battery size={13} className="text-amber-500" />
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                    Battery
                  </p>
                </div>
                <BatteryIndicator level={node.batteryLevel} />
                <div className="mt-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      node.batteryLevel > 50
                        ? "bg-emerald-500"
                        : node.batteryLevel > 25
                          ? "bg-amber-500"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${node.batteryLevel}%` }}
                  />
                </div>
              </div>

              {/* Solar Input */}
              <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sun size={13} className="text-amber-500" />
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                    Solar Input
                  </p>
                </div>
                <p className="text-sm font-black text-amber-600">
                  {node.solarInput}W
                </p>
                <p className="text-[9px] text-slate-500 font-medium">
                  {node.solarInput > 3 ? "Charging" : node.solarInput > 0 ? "Low light" : "No input"}
                </p>
              </div>

              {/* Last Sync */}
              <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock size={13} className="text-blue-600" />
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                    Last 30m Sync
                  </p>
                </div>
                <p className="text-sm font-black text-blue-600">{node.lastSync}</p>
                <p className="text-[9px] text-slate-500 font-mono font-medium">
                  FW: {node.firmware}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="mt-2.5 bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-xs">
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1">
                Monitored Coordinates & Zone
              </p>
              <p className="text-[11px] font-mono font-bold text-slate-800">
                {node.location.lat.toFixed(4)}°N, {node.location.lon.toFixed(4)}°E
              </p>
              <p className="text-[11px] text-slate-600 font-medium mt-0.5">{node.location.zone}</p>
            </div>
          </div>

          {/* Recorded telemetry */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Gauge size={14} className="text-teal-600" />
              <p className="text-xs text-slate-900 font-bold">
                Latest 30-Min Telemetry Readings
              </p>
              <div className="ml-auto flex items-center gap-1 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                <Timer size={11} className="text-teal-700" />
                <span className="text-[9px] text-teal-700 font-bold">30 min</span>
              </div>
            </div>

            <TelemetryRow
              icon={<Thermometer size={13} />}
              label="Temperature"
              value={node.telemetry.temperature}
              unit="°C"
              warning={35}
              danger={40}
              max={60}
            />
            <TelemetryRow
              icon={<Droplets size={13} />}
              label="Humidity"
              value={node.telemetry.humidity}
              unit="%"
              max={100}
            />
            <TelemetryRow
              icon={<Wind size={13} />}
              label="AQI (PM2.5)"
              value={node.telemetry.aqi}
              unit="µg/m³"
              warning={100}
              danger={150}
              max={300}
            />
            <TelemetryRow
              icon={<Waves size={13} />}
              label="Water Level"
              value={node.telemetry.waterLevel}
              unit="m"
              warning={2.5}
              danger={4.0}
              max={6}
            />
            <TelemetryRow
              icon={<Sprout size={13} />}
              label="Soil Moisture"
              value={node.telemetry.soilMoisture}
              unit="%"
              warning={75}
              danger={90}
              max={100}
            />
            <TelemetryRow
              icon={<Flame size={13} />}
              label="Gas (PPM)"
              value={node.telemetry.gasPpm}
              unit="ppm"
              warning={300}
              danger={450}
              max={600}
            />
            <TelemetryRow
              icon={<Zap size={13} />}
              label="Wind Speed"
              value={node.telemetry.windSpeed}
              unit="km/h"
              warning={50}
              danger={80}
              max={120}
            />
            <TelemetryRow
              icon={<Droplets size={13} />}
              label="Rainfall"
              value={node.telemetry.rainfall}
              unit="mm/hr"
              warning={15}
              danger={30}
              max={60}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold rounded-xl hover:bg-teal-100 transition-all shadow-xs">
              <Signal size={14} />
              Ping Node
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-all shadow-xs">
              <Cpu size={14} />
              Update Firmware
            </button>
          </div>

          {/* Firmware Info */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-bold">
              System Info
            </p>
            <div className="space-y-1.5">
              {[
                { label: "Firmware", value: node.firmware },
                { label: "AI Model", value: node.aiModel },
                { label: "Sampling Interval", value: "30 minutes" },
                { label: "Connectivity", value: "Wi-Fi 802.11n / LoRa fallback" },
                { label: "MCU", value: "ESP32-S3 @ 240MHz" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-medium">{item.label}</span>
                  <span className="text-[10px] text-slate-800 font-mono font-bold">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

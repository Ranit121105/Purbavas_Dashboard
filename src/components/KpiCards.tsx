"use client";

import { Cpu, AlertTriangle, Wind, MapPin, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardsProps {
  totalNodes: number;
  onlineNodes: number;
  criticalAlerts: number;
  activeAlerts: number;
  avgAQI: number;
  highestRiskZone: string;
}

function TrendIcon({ trend }: { trend: "up" | "down" | "flat" }) {
  if (trend === "up") return <TrendingUp size={12} className="text-red-500" />;
  if (trend === "down") return <TrendingDown size={12} className="text-emerald-500" />;
  return <Minus size={12} className="text-slate-400" />;
}

function AqiGrade(aqi: number) {
  if (aqi <= 50) return { label: "Good", color: "text-emerald-600" };
  if (aqi <= 100) return { label: "Moderate", color: "text-amber-600" };
  if (aqi <= 150) return { label: "Unhealthy", color: "text-orange-600" };
  return { label: "Hazardous", color: "text-red-600" };
}

export default function KpiCards({
  totalNodes,
  onlineNodes,
  criticalAlerts,
  activeAlerts,
  avgAQI,
  highestRiskZone,
}: KpiCardsProps) {
  const offlineNodes = totalNodes - onlineNodes;
  const aqiGrade = AqiGrade(avgAQI);

  const cards = [
    {
      title: "Active Nodes",
      value: `${onlineNodes}`,
      sub: `${offlineNodes} offline · ${totalNodes} total (30m sync)`,
      icon: <Cpu size={20} />,
      iconBg: "bg-teal-50 border-teal-200 text-teal-600",
      accentColor: "border-l-teal-500",
      valueSuffix: (
        <span className="text-sm font-semibold text-slate-400 ml-1">
          /{totalNodes}
        </span>
      ),
      badge: onlineNodes > totalNodes * 0.9 ? "Healthy" : "Degraded",
      badgeColor:
        onlineNodes > totalNodes * 0.9
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-amber-50 text-amber-700 border-amber-200",
      trend: "flat" as const,
      sparkBar: [(onlineNodes / totalNodes) * 100],
      sparkColor: "bg-teal-500",
    },
    {
      title: "Critical Alerts",
      value: `${criticalAlerts}`,
      sub: `${activeAlerts} total active alerts detected`,
      icon: <AlertTriangle size={20} />,
      iconBg:
        criticalAlerts > 0
          ? "bg-red-50 border-red-200 text-red-600"
          : "bg-slate-100 border-slate-200 text-slate-500",
      accentColor:
        criticalAlerts > 0 ? "border-l-red-500" : "border-l-slate-300",
      valueSuffix: null,
      badge: criticalAlerts > 0 ? "CRITICAL" : "Clear",
      badgeColor:
        criticalAlerts > 0
          ? "bg-red-50 text-red-700 border-red-200 animate-status-blink font-black"
          : "bg-emerald-50 text-emerald-700 border-emerald-200",
      trend: "up" as const,
      sparkBar: null,
      sparkColor: "bg-red-500",
    },
    {
      title: "Regional AQI",
      value: `${avgAQI}`,
      sub: `PM2.5 average · ${aqiGrade.label}`,
      icon: <Wind size={20} />,
      iconBg: "bg-purple-50 border-purple-200 text-purple-600",
      accentColor: "border-l-purple-500",
      valueSuffix: (
        <span className="text-sm font-semibold text-slate-400 ml-1">µg/m³</span>
      ),
      badge: aqiGrade.label,
      badgeColor:
        avgAQI <= 50
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : avgAQI <= 100
            ? "bg-amber-50 text-amber-700 border-amber-200"
            : "bg-orange-50 text-orange-700 border-orange-200",
      trend: "up" as const,
      sparkBar: null,
      sparkColor: "bg-purple-500",
    },
    {
      title: "Highest Risk Zone",
      value: "Zone A",
      sub: highestRiskZone,
      icon: <MapPin size={20} />,
      iconBg: "bg-orange-50 border-orange-200 text-orange-600",
      accentColor: "border-l-orange-500",
      valueSuffix: null,
      badge: "FLOOD · 91%",
      badgeColor: "bg-red-50 text-red-700 border-red-200",
      trend: "down" as const,
      sparkBar: null,
      sparkColor: "bg-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`bg-white border border-slate-200/90 border-l-4 ${card.accentColor} rounded-2xl p-4.5 hover:shadow-md transition-all duration-200 group cursor-default shadow-xs animate-slide-in-up`}
          style={{ animationDelay: `${i * 60}ms` }}
        >
          {/* Top Row */}
          <div className="flex items-start justify-between mb-3">
            <div
              className={`w-10 h-10 rounded-xl border ${card.iconBg} flex items-center justify-center transition-transform group-hover:scale-105`}
            >
              {card.icon}
            </div>
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${card.badgeColor} uppercase tracking-wider`}
            >
              {card.badge}
            </span>
          </div>

          {/* Value */}
          <div className="mb-1">
            <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">
              {card.title}
            </p>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {card.value}
              </span>
              {card.valueSuffix}
              <span className="ml-auto">
                <TrendIcon trend={card.trend} />
              </span>
            </div>
          </div>

          {/* Sub */}
          <p className="text-[11px] text-slate-500 font-medium truncate">{card.sub}</p>

          {/* Progress Bar */}
          {card.sparkBar && (
            <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${card.sparkColor} rounded-full transition-all duration-1000`}
                style={{ width: `${card.sparkBar[0]}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

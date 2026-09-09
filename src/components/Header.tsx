"use client";

import {
  Bell,
  Wifi,
  WifiOff,
  Shield,
  Clock,
  RefreshCw,
  ChevronRight,
  RadioTower,
  Timer,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { ActiveTab } from "./Sidebar";

interface HeaderProps {
  criticalAlerts: number;
  unreadAlerts: number;
  onlineNodes: number;
  totalNodes: number;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onAlertBellClick: () => void;
}

const tabLabels: Record<ActiveTab, string> = {
  overview: "Overview",
  riskmap: "Risk Map",
  alerts: "Alert Feed",
  nodes: "Node Management",
  settings: "Settings",
};

export default function Header({
  criticalAlerts,
  unreadAlerts,
  onlineNodes,
  totalNodes,
  activeTab,
  onAlertBellClick,
}: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const offlineCount = totalNodes - onlineNodes;

  return (
    <header className="bg-white/95 border-b border-slate-200 backdrop-blur-md px-4 md:px-6 py-3 sticky top-0 z-30 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Title & Breadcrumb */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <RadioTower size={12} className="text-teal-600" />
            <span className="font-semibold text-slate-600">EnvNet</span>
            <ChevronRight size={11} className="text-slate-400" />
            <span className="text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
              {tabLabels[activeTab]}
            </span>
          </div>
          <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tight truncate">
            Environmental Intelligence Network
          </h1>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Telemetry Interval indicator */}
          <div className="hidden xl:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
            <Timer size={13} className="text-teal-600" />
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-tight">INTERVAL</p>
              <p className="text-xs font-bold text-slate-800 leading-tight">
                30-min Telemetry
              </p>
            </div>
          </div>

          {/* Live Time */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
            <Clock size={13} className="text-teal-600" />
            <div className="text-right">
              <p className="text-xs font-mono font-bold text-slate-900 leading-tight">
                {formatTime(currentTime)}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">{formatDate(currentTime)}</p>
            </div>
          </div>

          {/* Node Status */}
          <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-node-pulse" />
              <Wifi size={13} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-tight">NODES</p>
              <p className="text-xs font-bold text-slate-900 leading-tight">
                {onlineNodes}
                <span className="text-slate-500 font-normal">/{totalNodes} Online</span>
              </p>
            </div>
            {offlineCount > 0 && (
              <div className="flex items-center gap-1 ml-1 pl-2 border-l border-slate-200">
                <WifiOff size={11} className="text-red-500" />
                <span className="text-[10px] text-red-600 font-bold">
                  {offlineCount} Down
                </span>
              </div>
            )}
          </div>

          {/* System Status */}
          <div className="hidden lg:flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5">
            <Shield size={13} className="text-emerald-600" />
            <div>
              <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider leading-tight">STATUS</p>
              <p className="text-xs font-bold text-emerald-700 leading-tight">
                Operational
              </p>
            </div>
          </div>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:text-teal-600 hover:bg-teal-50 hover:border-teal-200 transition-all shadow-xs"
            title="Refresh 30-minute interval data"
            aria-label="Refresh data"
          >
            <RefreshCw
              size={15}
              className={isRefreshing ? "animate-spin text-teal-600" : ""}
            />
          </button>

          {/* Notification Bell */}
          <button
            onClick={onAlertBellClick}
            className="relative p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all shadow-xs"
            title="Alerts"
            aria-label="View alerts"
          >
            <Bell size={15} className={unreadAlerts > 0 ? "text-red-500" : ""} />
            {unreadAlerts > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[9px] font-bold bg-red-500 text-white rounded-full shadow-sm animate-status-blink">
                {unreadAlerts}
              </span>
            )}
          </button>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-xs font-bold text-white shadow-xs cursor-pointer hover:opacity-90 transition-opacity">
            OC
          </div>
        </div>
      </div>

      {/* Critical Alert Banner */}
      {criticalAlerts > 0 && (
        <div className="mt-2.5 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3.5 py-1.5 animate-fade-in shadow-xs">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-status-blink shrink-0" />
          <p className="text-xs text-red-700 font-bold">
            ⚠️ {criticalAlerts} CRITICAL ALERT{criticalAlerts > 1 ? "S" : ""}{" "}
            DETECTED — Immediate flood risk action required in Zone A – River Basin
          </p>
        </div>
      )}
    </header>
  );
}

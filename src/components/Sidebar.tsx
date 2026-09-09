"use client";

import {
  LayoutDashboard,
  Map,
  BellRing,
  Cpu,
  Settings,
  Wifi,
  ChevronLeft,
  ChevronRight,
  Activity,
  Zap,
} from "lucide-react";

export type ActiveTab =
  | "overview"
  | "riskmap"
  | "alerts"
  | "nodes"
  | "settings";

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  criticalCount: number;
}

const navItems: {
  id: ActiveTab;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "overview",
    label: "Overview",
    icon: <LayoutDashboard size={19} />,
  },
  {
    id: "riskmap",
    label: "Risk Map",
    icon: <Map size={19} />,
  },
  {
    id: "alerts",
    label: "Alert Feed",
    icon: <BellRing size={19} />,
  },
  {
    id: "nodes",
    label: "Node Management",
    icon: <Cpu size={19} />,
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings size={19} />,
  },
];

export default function Sidebar({
  activeTab,
  onTabChange,
  collapsed,
  onToggleCollapse,
  criticalCount,
}: SidebarProps) {
  return (
    <aside
      className={`relative flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out ${
        collapsed ? "w-16" : "w-64"
      } min-h-screen shrink-0 shadow-sm`}
    >
      {/* Logo Area */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-200">
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-md shadow-teal-500/20">
            <Activity size={18} className="text-white" />
          </div>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-node-pulse" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-900 tracking-tight leading-tight">
              EnvNet
            </p>
            <p className="text-[10px] text-teal-600 font-bold tracking-widest uppercase">
              Control Center
            </p>
          </div>
        )}
      </div>

      {/* Network Indicator */}
      {!collapsed && (
        <div className="mx-3 mt-3 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="flex items-center gap-2">
            <Wifi size={13} className="text-teal-600 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-500 font-medium">
                MESH NETWORK (30m cycle)
              </p>
              <p className="text-[11px] text-emerald-600 font-bold">
                Active · 42/45 Nodes
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group relative ${
                isActive
                  ? "bg-teal-50 text-teal-700 border border-teal-200 shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
            >
              <span
                className={`shrink-0 transition-colors ${
                  isActive
                    ? "text-teal-600"
                    : "text-slate-400 group-hover:text-slate-700"
                }`}
              >
                {item.icon}
              </span>
              {!collapsed && <span>{item.label}</span>}

              {/* Alert badge */}
              {item.id === "alerts" && criticalCount > 0 && (
                <span
                  className={`${
                    collapsed ? "absolute top-1 right-1" : "ml-auto"
                  } flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-red-500 text-white rounded-full shadow-sm animate-status-blink`}
                >
                  {criticalCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Health */}
      {!collapsed && (
        <div className="m-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-bold">
            System Health
          </p>
          <div className="space-y-1.5">
            {[
              { label: "CPU", value: 23, color: "bg-emerald-500" },
              { label: "Memory", value: 61, color: "bg-blue-500" },
              { label: "Gateway", value: 100, color: "bg-teal-500" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 font-medium w-12">
                  {s.label}
                </span>
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${s.color} rounded-full transition-all duration-1000`}
                    style={{ width: `${s.value}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-600 font-bold w-7 text-right">
                  {s.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Version */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-slate-200">
          <div className="flex items-center gap-1.5">
            <Zap size={11} className="text-amber-500" />
            <p className="text-[10px] text-slate-500 font-medium">
              EnvNet OS v4.1.2 · 30-min sync
            </p>
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-16 w-6 h-6 bg-white border border-slate-300 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-400 transition-colors z-10 shadow-sm"
        aria-label="Toggle sidebar"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}

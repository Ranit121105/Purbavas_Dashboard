"use client";

import { useState, useCallback } from "react";
import Sidebar, { type ActiveTab } from "@/components/Sidebar";
import Header from "@/components/Header";
import OverviewTab from "@/components/OverviewTab";
import RiskMapView from "@/components/RiskMapView";
import AlertsFeed from "@/components/AlertsFeed";
import NodeManagement from "@/components/NodeManagement";
import SettingsPanel from "@/components/SettingsPanel";
import NodeDrawer from "@/components/NodeDrawer";
import {
  INITIAL_NODES,
  INITIAL_ALERTS,
  type SensorNode,
  type Alert,
} from "@/lib/mockData";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [nodes, setNodes] = useState<SensorNode[]>(INITIAL_NODES);
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [selectedNode, setSelectedNode] = useState<SensorNode | null>(null);
  const [drawerNode, setDrawerNode] = useState<SensorNode | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNodeClick = useCallback((node: SensorNode) => {
    setSelectedNode(node);
    setDrawerNode(node);
  }, []);

  const handleAcknowledge = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
  }, []);

  const handleNotify = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, notified: true, acknowledged: true } : a
      )
    );
  }, []);

  const criticalCount = alerts.filter(
    (a) => a.riskLevel === "Critical" && !a.acknowledged
  ).length;
  const unreadCount = alerts.filter(
    (a) => !a.acknowledged && a.riskLevel !== "Normal"
  ).length;

  return (
    <div className="flex min-h-screen bg-slate-100/60 text-slate-900 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile unless open */}
      <div
        className={`fixed lg:relative lg:flex z-50 lg:z-auto transition-transform duration-300 ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setMobileMenuOpen(false);
          }}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((p) => !p)}
          criticalCount={criticalCount}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/50">
        {/* Header */}
        <Header
          criticalAlerts={criticalCount}
          unreadAlerts={unreadCount}
          onlineNodes={42}
          totalNodes={45}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onAlertBellClick={() => setActiveTab("alerts")}
        />

        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-2.5 bg-white border-b border-slate-200">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h12M3 12h12M3 18h12" />
            </svg>
          </button>
          <span className="text-sm font-bold text-slate-900">
            {activeTab === "overview"
              ? "Overview"
              : activeTab === "riskmap"
                ? "Risk Map"
                : activeTab === "alerts"
                  ? "Alert Feed"
                  : activeTab === "nodes"
                    ? "Node Management"
                    : "Settings"}
          </span>
        </div>

        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-[1800px] mx-auto">
            {/* Tab Content */}
            {activeTab === "overview" && (
              <OverviewTab
                nodes={nodes}
                alerts={alerts}
                selectedNode={selectedNode}
                onNodeClick={handleNodeClick}
                onAcknowledge={handleAcknowledge}
                onNotify={handleNotify}
              />
            )}

            {activeTab === "riskmap" && (
              <RiskMapView
                nodes={nodes}
                selectedNode={selectedNode}
                onNodeClick={handleNodeClick}
              />
            )}

            {activeTab === "alerts" && (
              <div>
                <div className="mb-4">
                  <h2 className="text-lg font-black text-slate-900">Edge AI Alert Feed</h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Recorded risk assessments captured at synchronized 30-minute intervals
                  </p>
                </div>
                <AlertsFeed
                  alerts={alerts}
                  onAcknowledge={handleAcknowledge}
                  onNotify={handleNotify}
                />
              </div>
            )}

            {activeTab === "nodes" && (
              <div>
                <div className="mb-4">
                  <h2 className="text-lg font-black text-slate-900">
                    Node Management
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Monitor and manage all ESP32 sensor nodes in the network.
                    Click a node for detailed 30-min telemetry.
                  </p>
                </div>
                <NodeManagement
                  nodes={nodes}
                  onNodeSelect={handleNodeClick}
                />
              </div>
            )}

            {activeTab === "settings" && (
              <div>
                <div className="mb-4">
                  <h2 className="text-lg font-black text-slate-900">Settings</h2>
                  <p className="text-xs text-slate-500 font-medium">
                    System configuration and telemetry capture preferences
                  </p>
                </div>
                <SettingsPanel />
              </div>
            )}
          </div>
        </main>

        {/* Footer / Status Bar */}
        <footer className="border-t border-slate-200 bg-white px-4 md:px-6 py-2 shadow-xs">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-node-pulse" />
                <span className="text-[11px] text-slate-600 font-semibold">
                  System Operational
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-teal-500" />
                <span className="text-[11px] text-slate-600 font-medium">
                  Gateway: 10.144.1.254 (India Grid)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[11px] text-slate-600 font-medium">
                  Telemetry Sampling: 30-min interval
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-500 font-mono">
                EnvNet OS v4.1.2
              </span>
              <span className="text-[11px] text-slate-400">
                © 2024 Environmental Intelligence Network
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* Node Detail Drawer */}
      <NodeDrawer
        node={drawerNode}
        onClose={() => setDrawerNode(null)}
      />
    </div>
  );
}

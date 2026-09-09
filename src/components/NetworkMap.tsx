"use client";

import dynamic from "next/dynamic";
import type { SensorNode } from "@/lib/mockData";

interface NetworkMapProps {
  nodes: SensorNode[];
  onNodeClick: (node: SensorNode) => void;
  selectedNodeId: string | null;
}

const RiskMapCanvas = dynamic(() => import("./RiskMapCanvas"), {
  ssr: false,
  loading: () => <div className="h-full rounded-2xl bg-stone-100 animate-pulse" />,
});

export default function NetworkMap(props: NetworkMapProps) {
  return <RiskMapCanvas {...props} />;
}

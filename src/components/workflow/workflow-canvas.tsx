"use client";

import { useCallback, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useWorkflow } from "./workflow-provider";
import { IFCFileNode } from "./nodes/ifc-file-node";
import { PythonNode } from "./nodes/python-node";
import { Viewer3DPanel } from "./panels/viewer-3d-panel";
import { AIChatPanel } from "./panels/ai-chat-panel";
import { X } from "lucide-react";

const nodeTypes = {
  ifcFile: IFCFileNode,
  python: PythonNode,
};

export function WorkflowCanvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNode,
    showViewer,
    setShowViewer,
    showChat,
    setShowChat,
  } = useWorkflow();

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: any) => {
      setSelectedNode(node);
    },
    [setSelectedNode]
  );

  return (
    <div className="relative flex-1">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-zinc-950"
        defaultEdgeOptions={{
          type: "smoothstep",
          animated: true,
          style: { stroke: "#6366f1", strokeWidth: 2 },
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#27272a"
        />
        <Controls
          className="border border-zinc-700 bg-zinc-900 [&>button]:border-zinc-700 [&>button]:bg-zinc-800 [&>button]:text-zinc-300 [&>button:hover]:bg-zinc-700"
        />
        <MiniMap
          className="border border-zinc-700 bg-zinc-900"
          nodeColor="#3b82f6"
          maskColor="rgba(0, 0, 0, 0.6)"
        />

        {/* 3D Viewer Panel */}
        {showViewer && (
          <Panel position="top-left" className="m-4">
            <div className="relative w-[350px] overflow-hidden rounded-lg border border-cyan-400/50 bg-zinc-900 shadow-xl shadow-cyan-500/20">
              <div className="flex items-center justify-between border-b border-cyan-400/30 bg-cyan-500/10 px-4 py-2">
                <div className="flex items-center gap-2 text-sm font-medium text-cyan-400">
                  <span className="text-lg">🔲</span>
                  <span>3D Viewer</span>
                </div>
                <button
                  onClick={() => setShowViewer(false)}
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <Viewer3DPanel />
            </div>
          </Panel>
        )}

        {/* AI Chat Panel */}
        {showChat && (
          <Panel position="top-right" className="m-4">
            <div className="relative w-[400px] overflow-hidden rounded-lg border border-emerald-400/50 bg-zinc-900 shadow-xl shadow-emerald-500/20">
              <div className="flex items-center justify-between border-b border-emerald-400/30 bg-emerald-500/10 px-4 py-2">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-400">
                  <span className="text-lg">🤖</span>
                  <span>AI Chat</span>
                </div>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-emerald-400 hover:text-emerald-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <AIChatPanel />
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}

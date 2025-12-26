"use client";

import { useCallback, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  Panel,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useWorkflow } from "./workflow-provider";
import { IFCFileNode } from "./nodes/ifc-file-node";
import { PythonNode } from "./nodes/python-node";
import { AIChatNoteNode } from "./nodes/ai-chat-note-node";
import { Viewer3DPanel } from "./panels/viewer-3d-panel";
import { AIChatPanel } from "./panels/ai-chat-panel";
import { IFCUploadDialog } from "./dialogs/ifc-upload-dialog";
import { useNodeFileUpload } from "@/hooks/use-node-file-upload";
import { X } from "lucide-react";

const nodeTypes = {
  "ifc-file": IFCFileNode,
  python: PythonNode,
  "ai-chat": AIChatNoteNode,
};

export function WorkflowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = 
    useState<ReactFlowInstance | null>(null);

  // Sử dụng custom hook cho file upload
  const {
    uploadDialogOpen,
    onNodeDoubleClick,
    handleFileUpload,
    closeUploadDialog,
  } = useNodeFileUpload();

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    updateNodeData,
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

  // Xử lý khi kéo node từ sidebar vào canvas
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Xử lý khi thả node vào canvas
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (!type || !reactFlowWrapper.current || !reactFlowInstance) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      
      // Tính toán vị trí thả trong canvas
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // Tạo data mặc định cho từng loại node
      let nodeData: any = { label: type };
      
      if (type === "ifc-file") {
        nodeData = {
          label: "building.ifc",
          schema: "IFC2X3",
          elements: 108,
          filePath: "/path/to/building.ifc",
        };
      } else if (type === "python") {
        nodeData = {
          label: "Python Script",
          status: "idle",
        };
      } else if (type === "ai-chat") {
        nodeData = {
          label: "AI Chat",
          messages: [],
          note: "",
        };
      }

      // Thêm node mới vào canvas
      addNode(type, position, nodeData);
    },
    [addNode, reactFlowInstance]
  );

  const onInit = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
  }, []);

  return (
    <div className="relative flex-1" ref={reactFlowWrapper}>
      <ReactFlow
        onInit={onInit}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
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
      </ReactFlow>

      {/* IFC File Upload Dialog */}
      <IFCUploadDialog
        open={uploadDialogOpen}
        onClose={closeUploadDialog}
        onFileSelect={handleFileUpload}
      />
    </div>
  );
}

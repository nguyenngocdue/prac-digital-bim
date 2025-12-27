"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useWorkflow } from "./workflow-provider";
import { IFCFileNode } from "./nodes/ifc-file-node";
import { PythonNode } from "./nodes/python-node";
import { AIChatNoteNode } from "./nodes/ai-chat-note-node";
import { HttpNode } from "./nodes/http-node";
import { Viewer3DNode } from "./nodes/viewer-3d-node";
import { WebhookNode } from "./nodes/webhook-node";
import { FileUploadNode } from "./nodes/file-upload-node";
import { GetParameterNode } from "./nodes/get-parameter-node";
import { SetParameterNode } from "./nodes/set-parameter-node";
import { StringInputNode } from "./nodes/string-input-node";
import { NumberInputNode } from "./nodes/number-input-node";
import { IfElseNode } from "./nodes/if-else-node";
import { GltfViewerNode } from "./nodes/gltf-viewer-node";
import { IfcLoaderNode } from "./nodes/ifc-loader-node";
import { IFCUploadDialog } from "./dialogs/ifc-upload-dialog";
import { useNodeFileUpload } from "@/hooks/use-node-file-upload";

const nodeTypes = {
  "ifc-file": IFCFileNode,
  python: PythonNode,
  "ai-chat": AIChatNoteNode,
  http: HttpNode,
  "3d-viewer": Viewer3DNode,
  webhook: WebhookNode,
  "file-upload": FileUploadNode,
  "get-parameter": GetParameterNode,
  "set-parameter": SetParameterNode,
  "string-input": StringInputNode,
  "number-input": NumberInputNode,
  "if-else": IfElseNode,
  "gltf-viewer": GltfViewerNode,
  "ifc-loader": IfcLoaderNode,
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
    setSelectedNode,
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
      } else if (type === "ifc-loader") {
        nodeData = {
          label: "IfcLoader",
          status: "waiting",
          wasmPath: "/wasm/",
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
      } else if (type === "http") {
        nodeData = {
          label: "HTTP Request",
          method: "GET",
          url: "",
          timeout: 30000,
          headers: [],
          queryParams: [],
          body: "",
        };
      } else if (type === "3d-viewer") {
        nodeData = {
          label: "3D Viewer",
          status: "waiting",
          modelUrl: "",
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

  // Listen to theme changes from document class
  const [isDark, setIsDark] = useState(true);
  
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    
    checkTheme();
    
    // Watch for class changes on documentElement
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ["class"] 
    });
    
    return () => observer.disconnect();
  }, []);

  // Theme-aware styles
  const themeStyles = {
    canvas: isDark ? "bg-[#0a1628]" : "bg-slate-100",
    background: isDark ? "#1e3a5f" : "#cbd5e1",
    edge: isDark ? "#6366f1" : "#4f46e5",
    controls: isDark
      ? "border border-slate-700 bg-slate-900 [&>button]:border-slate-700 [&>button]:bg-slate-800 [&>button]:text-slate-300 [&>button:hover]:bg-slate-700"
      : "border border-slate-300 bg-white [&>button]:border-slate-200 [&>button]:bg-slate-50 [&>button]:text-slate-700 [&>button:hover]:bg-slate-100",
    minimap: {
      className: isDark
        ? "border border-slate-700 bg-slate-900"
        : "border border-slate-300 bg-white",
      nodeColor: isDark ? "#3b82f6" : "#2563eb",
      maskColor: isDark ? "rgba(10, 22, 40, 0.6)" : "rgba(255, 255, 255, 0.7)",
    },
  };

  return (
    <ReactFlowProvider>
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
          className={themeStyles.canvas}
          defaultEdgeOptions={{
            type: "smoothstep",
            animated: true,
            style: { stroke: themeStyles.edge, strokeWidth: 2 },
          }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color={themeStyles.background}
          />
          <Controls className={themeStyles.controls} />
          <MiniMap
            className={themeStyles.minimap.className}
            nodeColor={themeStyles.minimap.nodeColor}
            maskColor={themeStyles.minimap.maskColor}
          />
        </ReactFlow>

        {/* IFC File Upload Dialog */}
        <IFCUploadDialog
          open={uploadDialogOpen}
          onClose={closeUploadDialog}
          onFileSelect={handleFileUpload}
        />
      </div>
    </ReactFlowProvider>
  );
}

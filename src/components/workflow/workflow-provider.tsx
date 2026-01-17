"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Node, Edge, Connection, NodeChange, EdgeChange } from "@xyflow/react";
import { applyNodeChanges, applyEdgeChanges, addEdge } from "@xyflow/react";
import { useWorkflowExecution } from "./execution";
import type { WorkflowExecutionState, ExecutionStatus, ExecutionOptions } from "./execution";

type WorkflowContextType = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: string, position: { x: number; y: number }, data?: any) => void;
  updateNodeData: (nodeId: string, data: any) => void;
  deleteNode: (id: string) => void;
  selectedNode: Node | null;
  setSelectedNode: (node: Node | null) => void;
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  showInspector: boolean;
  setShowInspector: (show: boolean) => void;
  // Execution
  executionState: WorkflowExecutionState;
  isRunning: boolean;
  executeWorkflow: (options?: ExecutionOptions) => Promise<WorkflowExecutionState | undefined>;
  executeFromNode: (nodeId: string) => Promise<WorkflowExecutionState | undefined>;
  stopExecution: () => void;
  resetExecution: () => void;
  getNodeStatus: (nodeId: string) => ExecutionStatus;
};

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

const initialNodes: Node[] = [
];

const initialEdges: Edge[] = [];

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showInspector, setShowInspector] = useState(true);

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      )
    );
  }, []);

  // Workflow Execution
  const {
    executionState,
    isRunning,
    executeWorkflow,
    executeFromNode,
    stopExecution,
    resetExecution,
    getNodeStatus,
  } = useWorkflowExecution(nodes, edges, updateNodeData);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    []
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    []
  );

  const addNode = useCallback((type: string, position: { x: number; y: number }, data?: any) => {
    const id = `${type}-${Date.now()}`;
    const newNode: Node = {
      id,
      type,
      position,
      data: data || { label: type },
    };
    setNodes((nds) => [...nds, newNode]);
  }, []);

  const deleteNode = useCallback((id: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
  }, []);

  return (
    <WorkflowContext.Provider
      value={{
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        addNode,
        updateNodeData,
        deleteNode,
        selectedNode,
        setSelectedNode,
        showSidebar,
        setShowSidebar,
        showInspector,
        setShowInspector,
        // Execution
        executionState,
        isRunning,
        executeWorkflow,
        executeFromNode,
        stopExecution,
        resetExecution,
        getNodeStatus,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error("useWorkflow must be used within WorkflowProvider");
  }
  return context;
}

import type { Node } from "@xyflow/react";

// ============================================================================
// Execution Status
// ============================================================================

export type ExecutionStatus = 
  | "idle" 
  | "pending" 
  | "running" 
  | "success" 
  | "error" 
  | "skipped";

// ============================================================================
// Node Execution
// ============================================================================

export type NodeExecutionState = {
  nodeId: string;
  status: ExecutionStatus;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  output?: unknown;
  error?: string;
};

export type NodeExecutionContext = {
  node: Node;
  inputs: Record<string, unknown>; // Input từ các node trước
  updateProgress?: (progress: number) => void;
  updateNodeData?: (nodeId: string, data: any) => void;
};

export type NodeExecutor = (
  context: NodeExecutionContext
) => Promise<unknown>;

// ============================================================================
// Workflow Execution
// ============================================================================

export type WorkflowExecutionState = {
  status: ExecutionStatus;
  startTime?: Date;
  endTime?: Date;
  nodeStates: Record<string, NodeExecutionState>;
  currentNodeId?: string;
};

export type ExecutionOptions = {
  startNodeId?: string; // Node bắt đầu (mặc định là tất cả root nodes)
  stopOnError?: boolean; // Dừng khi gặp lỗi
  parallel?: boolean; // Cho phép chạy song song
};

// ============================================================================
// Execution Graph
// ============================================================================

export type ExecutionNode = {
  id: string;
  node: Node;
  dependencies: string[]; // IDs của các nodes phải chạy trước
  dependents: string[]; // IDs của các nodes phụ thuộc vào node này
};

export type ExecutionGraph = {
  nodes: Record<string, ExecutionNode>;
  executionOrder: string[]; // Topological sorted order
};

// ============================================================================
// Events
// ============================================================================

export type ExecutionEvent =
  | { type: "workflow:start" }
  | { type: "workflow:complete"; duration: number }
  | { type: "workflow:error"; error: string }
  | { type: "node:start"; nodeId: string }
  | { type: "node:complete"; nodeId: string; output: unknown; duration: number }
  | { type: "node:error"; nodeId: string; error: string }
  | { type: "node:skip"; nodeId: string; reason: string };

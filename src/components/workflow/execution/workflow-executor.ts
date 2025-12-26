import type { Node, Edge } from "@xyflow/react";
import type {
  ExecutionGraph,
  ExecutionNode,
  ExecutionOptions,
  WorkflowExecutionState,
  NodeExecutor,
  NodeExecutionContext,
  ExecutionEvent,
} from "./types";

// ============================================================================
// Graph Builder - Xây dựng đồ thị thực thi từ nodes và edges
// ============================================================================

export function buildExecutionGraph(
  nodes: Node[],
  edges: Edge[]
): ExecutionGraph {
  const graphNodes: Record<string, ExecutionNode> = {};

  // Khởi tạo tất cả nodes
  for (const node of nodes) {
    graphNodes[node.id] = {
      id: node.id,
      node,
      dependencies: [],
      dependents: [],
    };
  }

  // Xây dựng dependencies từ edges
  for (const edge of edges) {
    const sourceNode = graphNodes[edge.source];
    const targetNode = graphNodes[edge.target];

    if (sourceNode && targetNode) {
      targetNode.dependencies.push(edge.source);
      sourceNode.dependents.push(edge.target);
    }
  }

  // Topological sort để xác định thứ tự thực thi
  const executionOrder = topologicalSort(graphNodes);

  return {
    nodes: graphNodes,
    executionOrder,
  };
}

// ============================================================================
// Topological Sort - Kahn's Algorithm
// ============================================================================

function topologicalSort(nodes: Record<string, ExecutionNode>): string[] {
  const inDegree: Record<string, number> = {};
  const queue: string[] = [];
  const result: string[] = [];

  // Tính in-degree cho mỗi node
  for (const nodeId in nodes) {
    const node = nodes[nodeId];
    if (!node) continue;
    inDegree[nodeId] = node.dependencies.length;
    if (inDegree[nodeId] === 0) {
      queue.push(nodeId);
    }
  }

  // BFS
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    result.push(nodeId);

    const node = nodes[nodeId];
    if (!node) continue;
    for (const dependentId of node.dependents) {
      const deg = inDegree[dependentId];
      if (deg !== undefined) {
        inDegree[dependentId] = deg - 1;
        if (inDegree[dependentId] === 0) {
          queue.push(dependentId);
        }
      }
    }
  }

  // Kiểm tra cycle
  if (result.length !== Object.keys(nodes).length) {
    console.warn("Workflow contains a cycle!");
  }

  return result;
}

// ============================================================================
// Workflow Executor Class
// ============================================================================

export class WorkflowExecutor {
  private executors: Map<string, NodeExecutor> = new Map();
  private state: WorkflowExecutionState;
  private onEvent?: (event: ExecutionEvent) => void;
  private onUpdateNodeData?: (nodeId: string, data: any) => void;

  constructor() {
    this.state = this.createInitialState();
  }

  // Set update node data callback
  setUpdateNodeDataCallback(callback: (nodeId: string, data: any) => void): void {
    this.onUpdateNodeData = callback;
  }

  // Đăng ký executor cho từng loại node
  registerExecutor(nodeType: string, executor: NodeExecutor): void {
    this.executors.set(nodeType, executor);
  }

  // Đăng ký event listener
  setEventListener(listener: (event: ExecutionEvent) => void): void {
    this.onEvent = listener;
  }

  // Lấy state hiện tại
  getState(): WorkflowExecutionState {
    return { ...this.state };
  }

  // Reset state
  reset(): void {
    this.state = this.createInitialState();
  }

  // Chạy workflow
  async execute(
    nodes: Node[],
    edges: Edge[],
    options: ExecutionOptions = {}
  ): Promise<WorkflowExecutionState> {
    const { startNodeId, stopOnError = true, parallel = true } = options;

    // Build execution graph
    const graph = buildExecutionGraph(nodes, edges);

    // Reset state
    this.state = this.createInitialState();
    this.state.status = "running";
    this.state.startTime = new Date();

    // Initialize node states
    for (const nodeId of graph.executionOrder) {
      this.state.nodeStates[nodeId] = {
        nodeId,
        status: "pending",
      };
    }

    this.emit({ type: "workflow:start" });

    // Xác định nodes cần chạy
    let nodesToExecute = graph.executionOrder;
    if (startNodeId) {
      nodesToExecute = this.getNodesFromStart(graph, startNodeId);
    }

    // Track outputs
    const outputs: Record<string, unknown> = {};

    try {
      if (parallel) {
        await this.executeParallel(graph, nodesToExecute, outputs, stopOnError, edges);
      } else {
        await this.executeSequential(graph, nodesToExecute, outputs, stopOnError, edges);
      }

      this.state.status = "success";
    } catch (error) {
      this.state.status = "error";
      this.emit({
        type: "workflow:error",
        error: error instanceof Error ? error.message : String(error),
      });
    }

    this.state.endTime = new Date();
    const duration = this.state.endTime.getTime() - this.state.startTime!.getTime();

    this.emit({ type: "workflow:complete", duration });

    return this.state;
  }

  // Thực thi tuần tự
  private async executeSequential(
    graph: ExecutionGraph,
    nodeIds: string[],
    outputs: Record<string, unknown>,
    stopOnError: boolean,
    edges: Edge[]
  ): Promise<void> {
    for (const nodeId of nodeIds) {
      const success = await this.executeNode(graph, nodeId, outputs, edges);
      if (!success && stopOnError) {
        throw new Error(`Node ${nodeId} failed`);
      }
    }
  }

  // Thực thi song song (theo levels)
  private async executeParallel(
    graph: ExecutionGraph,
    nodeIds: string[],
    outputs: Record<string, unknown>,
    stopOnError: boolean,
    edges: Edge[]
  ): Promise<void> {
    const completed = new Set<string>();
    const pending = new Set(nodeIds);

    while (pending.size > 0) {
      // Tìm nodes có thể chạy (dependencies đã hoàn thành)
      const ready: string[] = [];
      for (const nodeId of pending) {
        const node = graph.nodes[nodeId];
        if (!node) continue;
        const depsCompleted = node.dependencies.every(
          (dep) => completed.has(dep) || !pending.has(dep)
        );
        if (depsCompleted) {
          ready.push(nodeId);
        }
      }

      if (ready.length === 0 && pending.size > 0) {
        throw new Error("Deadlock detected in workflow");
      }

      // Chạy song song các nodes ready
      const results = await Promise.allSettled(
        ready.map((nodeId) => this.executeNode(graph, nodeId, outputs, edges))
      );

      // Xử lý kết quả
      for (let i = 0; i < ready.length; i++) {
        const nodeId = ready[i];
        const result = results[i];

        if (nodeId) {
          pending.delete(nodeId);
          completed.add(nodeId);
        }

        if (result && result.status === "rejected" && stopOnError) {
          const reason = result.status === "rejected" ? (result as PromiseRejectedResult).reason : "Unknown error";
          throw new Error(`Node ${nodeId} failed: ${reason}`);
        }
      }
    }
  }

  // Thực thi một node
  private async executeNode(
    graph: ExecutionGraph,
    nodeId: string,
    outputs: Record<string, unknown>,
    edges: Edge[]
  ): Promise<boolean> {
    const execNode = graph.nodes[nodeId];
    if (!execNode) {
      throw new Error(`Node ${nodeId} not found in graph`);
    }
    const node = execNode.node;
    const nodeType = node.type || "default";

    // Cập nhật state
    this.state.currentNodeId = nodeId;
    this.state.nodeStates[nodeId] = {
      nodeId,
      status: "running",
      startTime: new Date(),
    };

    this.emit({ type: "node:start", nodeId });

    // Lấy executor
    const executor = this.executors.get(nodeType);
    if (!executor) {
      // Không có executor -> skip
      this.state.nodeStates[nodeId].status = "skipped";
      this.state.nodeStates[nodeId].endTime = new Date();
      this.emit({ type: "node:skip", nodeId, reason: `No executor for type: ${nodeType}` });
      return true;
    }

    // Collect inputs từ edges (theo handle ID)
    const inputs: Record<string, any> = {};
    const incomingEdges = edges.filter(e => e.target === nodeId);
    
    for (const edge of incomingEdges) {
      const sourceOutput = outputs[edge.source];
      const targetHandle = edge.targetHandle || 'input';
      
      // Map output to input handle
      if (sourceOutput) {
        inputs[targetHandle] = sourceOutput;
      }
    }

    // Create context
    const context: NodeExecutionContext = {
      node,
      inputs,
      updateNodeData: (nodeId: string, data: any) => {
        this.onUpdateNodeData?.(nodeId, data);
      },
    };

    try {
      const output = await executor(context);

      // Lưu output
      outputs[nodeId] = output;

      // Cập nhật state
      const endTime = new Date();
      const duration = endTime.getTime() - this.state.nodeStates[nodeId].startTime!.getTime();

      this.state.nodeStates[nodeId] = {
        ...this.state.nodeStates[nodeId],
        status: "success",
        endTime,
        duration,
        output,
      };

      this.emit({ type: "node:complete", nodeId, output, duration });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.state.nodeStates[nodeId] = {
        ...this.state.nodeStates[nodeId],
        status: "error",
        endTime: new Date(),
        error: errorMessage,
      };

      this.emit({ type: "node:error", nodeId, error: errorMessage });
      return false;
    }
  }

  // Helper: Lấy danh sách nodes từ startNode trở đi
  private getNodesFromStart(graph: ExecutionGraph, startNodeId: string): string[] {
    const result: string[] = [];
    const visited = new Set<string>();
    const queue = [startNodeId];

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (visited.has(nodeId)) continue;

      visited.add(nodeId);
      result.push(nodeId);

      const node = graph.nodes[nodeId];
      if (node) {
        queue.push(...node.dependents);
      }
    }

    // Sort theo execution order
    return graph.executionOrder.filter((id) => result.includes(id));
  }

  private createInitialState(): WorkflowExecutionState {
    return {
      status: "idle",
      nodeStates: {},
    };
  }

  private emit(event: ExecutionEvent): void {
    this.onEvent?.(event);
  }
}

// Singleton instance
export const workflowExecutor = new WorkflowExecutor();

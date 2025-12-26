"use client";

import { useState, useCallback, useEffect } from "react";
import type { Node, Edge } from "@xyflow/react";
import {
  workflowExecutor,
  buildExecutionGraph,
} from "../workflow-executor";
import { registerAllExecutors } from "../node-executors";
import type {
  WorkflowExecutionState,
  ExecutionOptions,
  ExecutionEvent,
  ExecutionStatus,
} from "../types";

// Register executors once
let executorsRegistered = false;

export function useWorkflowExecution(nodes: Node[], edges: Edge[]) {
  const [executionState, setExecutionState] = useState<WorkflowExecutionState>({
    status: "idle",
    nodeStates: {},
  });
  const [isRunning, setIsRunning] = useState(false);

  // Register executors
  useEffect(() => {
    if (!executorsRegistered) {
      registerAllExecutors();
      executorsRegistered = true;
    }
  }, []);

  // Handle execution events
  const handleEvent = useCallback((event: ExecutionEvent) => {
    console.log("[Workflow Event]", event);

    setExecutionState((prev) => {
      const newState = { ...prev };

      switch (event.type) {
        case "workflow:start":
          newState.status = "running";
          newState.startTime = new Date();
          break;

        case "workflow:complete":
          newState.status = "success";
          newState.endTime = new Date();
          break;

        case "workflow:error":
          newState.status = "error";
          newState.endTime = new Date();
          break;

        case "node:start":
          newState.nodeStates = {
            ...newState.nodeStates,
            [event.nodeId]: {
              nodeId: event.nodeId,
              status: "running",
              startTime: new Date(),
            },
          };
          newState.currentNodeId = event.nodeId;
          break;

        case "node:complete":
          newState.nodeStates = {
            ...newState.nodeStates,
            [event.nodeId]: {
              nodeId: event.nodeId,
              status: "success",
              startTime: newState.nodeStates[event.nodeId]?.startTime || new Date(),
              endTime: new Date(),
              duration: event.duration,
              output: event.output,
            },
          };
          break;

        case "node:error":
          newState.nodeStates = {
            ...newState.nodeStates,
            [event.nodeId]: {
              nodeId: event.nodeId,
              status: "error",
              startTime: newState.nodeStates[event.nodeId]?.startTime || new Date(),
              endTime: new Date(),
              error: event.error,
            },
          };
          break;

        case "node:skip":
          newState.nodeStates = {
            ...newState.nodeStates,
            [event.nodeId]: {
              nodeId: event.nodeId,
              status: "skipped",
              endTime: new Date(),
            },
          };
          break;
      }

      return newState;
    });
  }, []);

  // Execute workflow
  const executeWorkflow = useCallback(
    async (options: ExecutionOptions = {}) => {
      if (isRunning) return;

      setIsRunning(true);
      workflowExecutor.setEventListener(handleEvent);

      try {
        const result = await workflowExecutor.execute(nodes, edges, options);
        setExecutionState(result);
        return result;
      } finally {
        setIsRunning(false);
      }
    },
    [nodes, edges, isRunning, handleEvent]
  );

  // Execute from specific node
  const executeFromNode = useCallback(
    async (nodeId: string) => {
      return executeWorkflow({ startNodeId: nodeId });
    },
    [executeWorkflow]
  );

  // Stop execution (for future implementation)
  const stopExecution = useCallback(() => {
    // TODO: Implement cancellation
    console.log("Stop execution requested");
  }, []);

  // Reset execution state
  const resetExecution = useCallback(() => {
    setExecutionState({
      status: "idle",
      nodeStates: {},
    });
    workflowExecutor.reset();
  }, []);

  // Get node execution status
  const getNodeStatus = useCallback(
    (nodeId: string): ExecutionStatus => {
      return executionState.nodeStates[nodeId]?.status || "idle";
    },
    [executionState]
  );

  // Get execution graph (for visualization)
  const getExecutionGraph = useCallback(() => {
    return buildExecutionGraph(nodes, edges);
  }, [nodes, edges]);

  return {
    executionState,
    isRunning,
    executeWorkflow,
    executeFromNode,
    stopExecution,
    resetExecution,
    getNodeStatus,
    getExecutionGraph,
  };
}

"use client";

import { useState, useCallback, useRef, type FC } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  BackgroundVariant,
  type OnConnect,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import WorkflowToolbar from "@/components/workflow/workflow-toolbar";
import type { NodeDefinition } from "@/types/workflow";
import { NODE_CATEGORIES } from "@/data/workflow-nodes";

// Initial empty state
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

/**
 * Workflow Page Content - Main workflow editor
 */
const WorkflowPageContent: FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeIdCounter, setNodeIdCounter] = useState(1);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const onConnect: OnConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Handle node drag from sidebar
  const onNodeDragStart = (nodeDefinition: NodeDefinition) => {
    if (reactFlowWrapper.current) {
      reactFlowWrapper.current.dataset.draggedNode = JSON.stringify(nodeDefinition);
    }
  };

  // Handle drop on canvas
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const nodeDataStr = reactFlowWrapper.current.dataset.draggedNode;
      if (!nodeDataStr) return;

      const nodeDefinition: NodeDefinition = JSON.parse(nodeDataStr);
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node = {
        id: `${nodeDefinition.id}-${nodeIdCounter}`,
        type: 'default',
        position,
        data: { 
          label: `${nodeDefinition.icon || ''} ${nodeDefinition.label}`.trim(),
          nodeType: nodeDefinition.id,
        },
      };

      setNodes((nds) => [...nds, newNode]);
      setNodeIdCounter((id) => id + 1);
      
      delete reactFlowWrapper.current.dataset.draggedNode;
    },
    [reactFlowInstance, nodeIdCounter, setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleRun = () => {
    console.log("Running workflow with nodes:", nodes);
    console.log("Edges:", edges);
    alert("Workflow execution started! Check console for details.");
  };

  const handleClear = () => {
    setNodes([]);
    setEdges([]);
    setNodeIdCounter(1);
  };

  const handleSave = () => {
    const workflowData = {
      nodes,
      edges,
      timestamp: new Date().toISOString(),
    };
    console.log("Saving workflow:", workflowData);
    // You can implement localStorage or backend save here
    localStorage.setItem("workflow", JSON.stringify(workflowData));
    localStorage.setItem("workflow", JSON.stringify(workflowData));
    alert("Workflow saved!");
  };

  // Node item drag handler
  const handleNodeItemDragStart = (nodeDefinition: NodeDefinition) => (e: React.DragEvent) => {
    e.currentTarget.classList.add('opacity-50');
    onNodeDragStart(nodeDefinition);
  };

  const handleNodeItemDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50');
  };

  return (
    <SidebarProvider defaultOpen>
      <div className="flex w-full flex-1 bg-zinc-950">
        {/* Sidebar */}
        <Sidebar className="border-zinc-700 bg-zinc-900" collapsible="icon">
          {/* Sidebar Header */}
          <div className="border-b border-zinc-800 p-4">
            <h2 className="text-sm font-semibold text-zinc-100">Node Library</h2>
            <p className="text-xs text-zinc-400">Drag to canvas</p>
          </div>

          <SidebarContent className="bg-zinc-900">
            {NODE_CATEGORIES.map((category, index) => (
              <div key={category.name}>
                <SidebarGroup>
                  <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    <div className="flex items-center gap-2">
                      {category.icon && <span className="text-base">{category.icon}</span>}
                      <span>{category.name}</span>
                    </div>
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu className="gap-1 px-2">
                      {category.nodes.map((node) => (
                        <SidebarMenuItem key={node.id}>
                          <div
                            draggable
                            onDragStart={handleNodeItemDragStart(node)}
                            onDragEnd={handleNodeItemDragEnd}
                            className="group flex cursor-move items-center gap-2.5 rounded-md px-3 py-2.5 text-sm text-zinc-300 transition-all hover:bg-zinc-800 hover:text-zinc-100 hover:shadow-sm active:opacity-50"
                            title={node.description}
                          >
                            {node.icon && <span className="text-base">{node.icon}</span>}
                            <span className="flex-1 truncate">{node.label}</span>
                            {node.badge && (
                              <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-none ${
                                node.badge === 'WIP' ? 'bg-amber-500/20 text-amber-400' :
                                node.badge === 'New' ? 'bg-emerald-500/20 text-emerald-400' :
                                node.badge === 'Beta' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-purple-500/20 text-purple-400'
                              }`}>
                                {node.badge}
                              </span>
                            )}
                          </div>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
                {index < NODE_CATEGORIES.length - 1 && (
                  <Separator className="my-2 bg-zinc-800" />
                )}
              </div>
            ))}
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center border-b border-zinc-700 bg-zinc-900">
            <SidebarTrigger className="ml-2 text-zinc-400 hover:text-zinc-100" />
            <div className="flex-1">
              <WorkflowToolbar
                onRun={handleRun}
                onSave={handleSave}
                onClear={handleClear}
                nodeCount={nodes.length}
                edgeCount={edges.length}
              />
            </div>
          </div>

          {/* Canvas */}
          <div 
            ref={reactFlowWrapper}
            className="flex-1"
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              fitView
              className="bg-zinc-950"
            >
              <Controls className="border-zinc-700 bg-zinc-800" />
              <MiniMap
                className="border-zinc-700 bg-zinc-800"
                nodeStrokeWidth={3}
                zoomable
                pannable
              />
              <Background 
                variant={BackgroundVariant.Dots} 
                gap={16} 
                size={1}
                color="#374151"
              />
            </ReactFlow>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

/**
 * Workflow Page - Visual workflow editor with IFCflow-style interface
 * Architecture designed for easy refactoring:
 * - Node definitions in /data/workflow-nodes.ts
 * - Types in /types/workflow.ts
 * - Components in /components/workflow/
 */
const WorkflowPage: FC = () => {
  return (
    <div className="flex h-full w-full">
      <ReactFlowProvider>
        <WorkflowPageContent />
      </ReactFlowProvider>
    </div>
  );
};

export default WorkflowPage;

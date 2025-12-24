"use client";

import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Plus, Save, Upload } from 'lucide-react';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Camera Input' },
    position: { x: 250, y: 25 },
  },
  {
    id: '2',
    data: { label: 'Process Stream' },
    position: { x: 100, y: 125 },
  },
  {
    id: '3',
    data: { label: 'Analysis Engine' },
    position: { x: 400, y: 125 },
  },
  {
    id: '4',
    type: 'output',
    data: { label: 'Output Display' },
    position: { x: 250, y: 250 },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e1-3', source: '1', target: '3', animated: true },
  { id: 'e2-4', source: '2', target: '4' },
  { id: 'e3-4', source: '3', target: '4' },
];

interface WorkflowTabProps {
  cameraId: string;
  cameraName: string;
}

export const WorkflowTab: React.FC<WorkflowTabProps> = ({ cameraId, cameraName }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeName, setNodeName] = useState('');

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = useCallback(() => {
    const newNode: Node = {
      id: `${nodes.length + 1}`,
      data: { label: nodeName || `Node ${nodes.length + 1}` },
      position: {
        x: Math.random() * 400,
        y: Math.random() * 300,
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setNodeName('');
  }, [nodes.length, nodeName, setNodes]);

  const handleSave = () => {
    const workflow = {
      cameraId,
      cameraName,
      nodes,
      edges,
      timestamp: new Date().toISOString(),
    };
    const json = JSON.stringify(workflow, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-${cameraId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workflow = JSON.parse(e.target?.result as string);
          setNodes(workflow.nodes || []);
          setEdges(workflow.edges || []);
        } catch (error) {
          console.error('Failed to load workflow:', error);
          alert('Invalid workflow file');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b bg-muted/30">
        <div className="flex items-center gap-2 flex-1">
          <input
            type="text"
            value={nodeName}
            onChange={(e) => setNodeName(e.target.value)}
            placeholder="Node name..."
            className="px-2 py-1 text-xs border rounded w-32 bg-background"
          />
          <Button 
            size="sm" 
            variant="outline" 
            onClick={addNode}
            className="h-7"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Node
          </Button>
        </div>
        
        <div className="flex items-center gap-1">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleSave}
            className="h-7"
          >
            <Save className="h-3 w-3 mr-1" />
            Save
          </Button>
          
          <label>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7"
              asChild
            >
              <span>
                <Upload className="h-3 w-3 mr-1" />
                Load
              </span>
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={handleLoad}
              className="hidden"
            />
          </label>
          
          <Button 
            size="sm" 
            variant="outline" 
            className="h-7"
            onClick={() => {
              setNodes([]);
              setEdges([]);
            }}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* ReactFlow Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          attributionPosition="bottom-left"
        >
          <Controls />
          <MiniMap 
            nodeColor={(node) => {
              switch (node.type) {
                case 'input':
                  return '#3b82f6';
                case 'output':
                  return '#10b981';
                default:
                  return '#6366f1';
              }
            }}
            className="bg-background border"
          />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          
          <Panel position="top-left" className="bg-background/95 backdrop-blur-sm p-2 rounded border text-xs">
            <div className="font-semibold">{cameraName}</div>
            <div className="text-muted-foreground">
              Nodes: {nodes.length} | Edges: {edges.length}
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
};

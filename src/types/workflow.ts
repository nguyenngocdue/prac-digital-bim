/**
 * Workflow Types - Type definitions for the workflow system
 */

export type NodeBadge = "WIP" | "New" | "Beta" | "Pro";

export type NodeCategory = 
  | "Input"
  | "Geometry"
  | "Data"
  | "Analysis"
  | "Output"
  | "Custom";

export type NodeDefinition = {
  id: string;
  label: string;
  category: NodeCategory;
  icon?: string;
  badge?: NodeBadge;
  description?: string;
  color?: string;
};

export type WorkflowNodeData = {
  label: string;
  description?: string;
  nodeType?: string;
  inputs?: string[];
  outputs?: string[];
};

export type CategoryGroup = {
  name: NodeCategory;
  icon?: string;
  nodes: NodeDefinition[];
};

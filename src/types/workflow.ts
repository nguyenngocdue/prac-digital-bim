/**
 * Workflow Types - Type definitions for the workflow system
 */

import type { LucideIcon } from "lucide-react";

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
  icon?: LucideIcon;
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
  icon?: LucideIcon;
  nodes: NodeDefinition[];
};

/**
 * Workflow Node Definitions - Centralized configuration for all workflow nodes
 * Easy to extend: Just add new nodes to the appropriate category array
 */

import type { CategoryGroup, NodeDefinition } from "@/types/workflow";

// Input Nodes
const INPUT_NODES: NodeDefinition[] = [
  {
    id: "parameter",
    label: "Parameter",
    category: "Input",
    icon: "⚙️",
    description: "Define input parameters",
  },
];

// Geometry Nodes
const GEOMETRY_NODES: NodeDefinition[] = [
  {
    id: "extract-geometry",
    label: "Extract Geometry",
    category: "Geometry",
    icon: "🔷",
    description: "Extract geometric data",
  },
  {
    id: "transform",
    label: "Transform",
    category: "Geometry",
    icon: "↻",
    badge: "WIP",
    description: "Transform geometry",
  },
  {
    id: "cluster-elements",
    label: "Cluster Elements",
    category: "Geometry",
    icon: "⬡",
    badge: "New",
    description: "Group similar elements",
  },
  {
    id: "spatial-query",
    label: "Spatial Query",
    category: "Geometry",
    icon: "🔍",
    badge: "WIP",
    description: "Query spatial relationships",
  },
];

// Data Nodes
const DATA_NODES: NodeDefinition[] = [
  {
    id: "filter-elements",
    label: "Filter Elements",
    category: "Data",
    icon: "▼",
    description: "Filter elements by criteria",
  },
  {
    id: "property-editor",
    label: "Property Editor",
    category: "Data",
    icon: "✏️",
    description: "Edit element properties",
  },
  {
    id: "quantity-takeoff",
    label: "Quantity Takeoff",
    category: "Data",
    icon: "📊",
    description: "Calculate quantities",
  },
  {
    id: "classification",
    label: "Classification",
    category: "Data",
    icon: "📋",
    description: "Classify elements",
  },
  {
    id: "python",
    label: "Python",
    category: "Data",
    icon: "🐍",
    badge: "New",
    description: "Execute Python scripts",
  },
  {
    id: "relationships",
    label: "Relationships",
    category: "Data",
    icon: "🔗",
    badge: "WIP",
    description: "Define element relationships",
  },
];

// Analysis Nodes
const ANALYSIS_NODES: NodeDefinition[] = [
  {
    id: "analysis",
    label: "Analysis",
    category: "Analysis",
    icon: "📈",
    badge: "New",
    description: "Analyze data",
  },
  {
    id: "data-transform",
    label: "Data Transform",
    category: "Analysis",
    icon: "🔄",
    badge: "New",
    description: "Transform data structures",
  },
  {
    id: "ai-chat",
    label: "AI Chat",
    category: "Analysis",
    icon: "🤖",
    badge: "New",
    description: "AI-powered assistance",
  },
];

// Output Nodes
const OUTPUT_NODES: NodeDefinition[] = [
  {
    id: "materials",
    label: "Materials",
    category: "Output",
    icon: "🎨",
    badge: "New",
    description: "Material definitions",
  },
  {
    id: "export-data",
    label: "Export Data",
    category: "Output",
    icon: "💾",
    description: "Export results",
  },
];

/**
 * All node categories with their nodes
 * To add a new category: Add it here and create corresponding nodes array above
 */
export const NODE_CATEGORIES: CategoryGroup[] = [
  {
    name: "Input",
    icon: "📥",
    nodes: INPUT_NODES,
  },
  {
    name: "Geometry",
    icon: "🔷",
    nodes: GEOMETRY_NODES,
  },
  {
    name: "Data",
    icon: "💾",
    nodes: DATA_NODES,
  },
  {
    name: "Analysis",
    icon: "📊",
    nodes: ANALYSIS_NODES,
  },
  {
    name: "Output",
    icon: "📤",
    nodes: OUTPUT_NODES,
  },
];

/**
 * Get all nodes flattened
 */
export const getAllNodes = (): NodeDefinition[] => {
  return NODE_CATEGORIES.flatMap((category) => category.nodes);
};

/**
 * Get nodes by category
 */
export const getNodesByCategory = (category: string): NodeDefinition[] => {
  const categoryGroup = NODE_CATEGORIES.find((c) => c.name === category);
  return categoryGroup?.nodes || [];
};

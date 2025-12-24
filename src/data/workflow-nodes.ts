/**
 * Workflow Node Definitions - Centralized configuration for all workflow nodes
 * Easy to extend: Just add new nodes to the appropriate category array
 */

import type { CategoryGroup, NodeDefinition } from "@/types/workflow";

// Input Nodes
const INPUT_NODES: NodeDefinition[] = [
  {
    id: "ifc-file",
    label: "IFC File",
    category: "Input",
    icon: "📄",
    description: "Load IFC file",
  },
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
  {
    id: "analysis",
    label: "Analysis",
    category: "Data",
    icon: "📊",
    badge: "New",
    description: "Analyze data",
  },
  {
    id: "data-transform",
    label: "Data Transform",
    category: "Data",
    icon: "🔄",
    badge: "New",
    description: "Transform data structures",
  },
  {
    id: "ai-chat",
    label: "AI Chat",
    category: "Data",
    icon: "🤖",
    badge: "New",
    description: "AI-powered assistance",
  },
  {
    id: "materials",
    label: "Materials",
    category: "Data",
    icon: "🎨",
    badge: "New",
    description: "Material definitions",
  },
];

// Output Nodes
const OUTPUT_NODES: NodeDefinition[] = [
  {
    id: "3d-viewer",
    label: "3D Viewer",
    category: "Output",
    icon: "👁️",
    description: "Visualize in 3D",
  },
  {
    id: "export-data",
    label: "Export Data",
    category: "Output",
    icon: "💾",
    badge: "New",
    description: "Export results",
  },
  {
    id: "watch-values",
    label: "Watch Values",
    category: "Output",
    icon: "⏱️",
    description: "Monitor values",
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

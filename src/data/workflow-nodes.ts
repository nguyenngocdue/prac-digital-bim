/**
 * Workflow Node Definitions - Centralized configuration for all workflow nodes
 * Easy to extend: Just add new nodes to the appropriate category array
 */

import {
  FileText,
  Settings,
  Hexagon,
  RotateCw,
  Boxes,
  Search,
  Filter,
  PenLine,
  Calculator,
  Tags,
  Code2,
  Link2,
  BarChart3,
  Shuffle,
  Bot,
  Palette,
  Eye,
  Download,
  Activity,
  FolderInput,
  Database,
  FolderOutput,
  Globe,
  Webhook,
  Upload,
} from "lucide-react";
import type { CategoryGroup, NodeDefinition } from "@/types/workflow";

// Input Nodes
const INPUT_NODES: NodeDefinition[] = [
  {
    id: "ifc-file",
    label: "IFC File",
    category: "Input",
    icon: FileText,
    description: "Load IFC file",
  },
  {
    id: "file-upload",
    label: "File Upload",
    category: "Input",
    icon: Upload,
    badge: "New",
    description: "Upload GLTF, Revit, IFC files",
  },
  {
    id: "parameter",
    label: "Parameter",
    category: "Input",
    icon: Settings,
    description: "Define input parameters",
  },
  {
    id: "http",
    label: "HTTP",
    category: "Input",
    icon: Globe,
    badge: "New",
    description: "Make HTTP requests",
  },
  {
    id: "webhook",
    label: "Webhook",
    category: "Input",
    icon: Webhook,
    badge: "New",
    description: "Receive HTTP webhooks",
  },
];

// Geometry Nodes
const GEOMETRY_NODES: NodeDefinition[] = [
  {
    id: "extract-geometry",
    label: "Extract Geometry",
    category: "Geometry",
    icon: Hexagon,
    description: "Extract geometric data",
  },
  {
    id: "transform",
    label: "Transform",
    category: "Geometry",
    icon: RotateCw,
    badge: "WIP",
    description: "Transform geometry",
  },
  {
    id: "cluster-elements",
    label: "Cluster Elements",
    category: "Geometry",
    icon: Boxes,
    badge: "New",
    description: "Group similar elements",
  },
  {
    id: "spatial-query",
    label: "Spatial Query",
    category: "Geometry",
    icon: Search,
    badge: "WIP",
    description: "Query spatial relationships",
  },
];

// Data Nodes
const DATA_NODES: NodeDefinition[] = [
  {
    id: "get-parameter",
    label: "Get Parameter",
    category: "Data",
    icon: Settings,
    badge: "New",
    description: "Extract parameter values from BIM elements",
  },
  {
    id: "set-parameter",
    label: "Set Parameter",
    category: "Data",
    icon: PenLine,
    badge: "New",
    description: "Set parameter values for BIM elements",
  },
  {
    id: "filter-elements",
    label: "Filter Elements",
    category: "Data",
    icon: Filter,
    description: "Filter elements by criteria",
  },
  {
    id: "property-editor",
    label: "Property Editor",
    category: "Data",
    icon: PenLine,
    description: "Edit element properties",
  },
  {
    id: "quantity-takeoff",
    label: "Quantity Takeoff",
    category: "Data",
    icon: Calculator,
    description: "Calculate quantities",
  },
  {
    id: "classification",
    label: "Classification",
    category: "Data",
    icon: Tags,
    description: "Classify elements",
  },
  {
    id: "python",
    label: "Python",
    category: "Data",
    icon: Code2,
    badge: "New",
    description: "Execute Python scripts",
  },
  {
    id: "relationships",
    label: "Relationships",
    category: "Data",
    icon: Link2,
    badge: "WIP",
    description: "Define element relationships",
  },
  {
    id: "analysis",
    label: "Analysis",
    category: "Data",
    icon: BarChart3,
    badge: "New",
    description: "Analyze data",
  },
  {
    id: "data-transform",
    label: "Data Transform",
    category: "Data",
    icon: Shuffle,
    badge: "New",
    description: "Transform data structures",
  },
  {
    id: "ai-chat",
    label: "AI Chat",
    category: "Data",
    icon: Bot,
    badge: "New",
    description: "AI-powered assistance",
  },
  {
    id: "materials",
    label: "Materials",
    category: "Data",
    icon: Palette,
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
    icon: Eye,
    description: "Visualize in 3D",
  },
  {
    id: "export-data",
    label: "Export Data",
    category: "Output",
    icon: Download,
    badge: "New",
    description: "Export results",
  },
  {
    id: "watch-values",
    label: "Watch Values",
    category: "Output",
    icon: Activity,
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
    icon: FolderInput,
    nodes: INPUT_NODES,
  },
  {
    name: "Geometry",
    icon: Hexagon,
    nodes: GEOMETRY_NODES,
  },
  {
    name: "Data",
    icon: Database,
    nodes: DATA_NODES,
  },
  {
    name: "Output",
    icon: FolderOutput,
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

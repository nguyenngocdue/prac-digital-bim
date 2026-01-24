/**
 * Editable Box Handles Module
 * 
 * This module provides reusable utilities, types, and functions
 * for the EditablePolygonHandles component.
 */

// Re-export types
export type {
  EditablePolygonHandlesProps,
  DragMode,
  PendingTranslate,
  DragRefs,
} from "./types";

// Re-export constants
export {
  HANDLE_SIZE,
  HANDLE_HIT_SIZE,
  EDGE_SIZE,
  EDGE_HIT_SIZE,
  HEIGHT_SIZE,
  HANDLE_SEGMENTS,
  EDGE_SEGMENTS,
  HIT_SEGMENTS,
  DEFAULT_POLYGON_COLOR,
  HANDLE_COLOR,
  HANDLE_HOVER_COLOR,
  EDGE_COLOR,
  HANDLE_EMISSIVE_INTENSITY,
  EDGE_EMISSIVE_INTENSITY,
  MIN_HEIGHT,
  DRAG_THRESHOLD,
} from "./constants";

// Re-export geometry functions
export { createGeometries, disposeGeometries } from "./geometries";

// Re-export material functions
export { createMaterials, disposeMaterials } from "./materials";

// Re-export calculation functions
export {
  getDistance,
  calculateArea,
  calculateCentroid,
  calculateAverageY,
  createShapeFromVertices,
  calculateCenter,
} from "./calculations";

// Re-export mesh updater functions
export {
  updateVertexHandles,
  updateEdgeHandles,
  updateHeightHandle,
  updateHandleHover,
  updateAllHandles,
} from "./mesh-updaters";

// Re-export utility functions
export {
  shouldBlockTranslate,
  updateTranslateHover,
  updateLineLoop,
  markAsHandle,
} from "./utils";

// Re-export drag handler helpers
export { createDragHandlers } from "./drag-handlers";

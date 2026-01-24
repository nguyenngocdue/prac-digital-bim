import * as THREE from "three";

export interface EditablePolygonHandlesProps {
  vertices: [number, number, number][];
  onVerticesChange: (vertices: [number, number, number][]) => void;
  topVertices?: [number, number, number][];
  onTopVerticesChange?: (vertices: [number, number, number][]) => void;
  linkTopToBottom?: boolean;
  height?: number;
  onHeightChange?: (nextHeight: number, nextCenterY: number) => void;
  centerY?: number;
  onTranslate?: (nextCenterY: number) => void;
  centerX?: number;
  centerZ?: number;
  onTranslateXZ?: (nextCenterX: number, nextCenterZ: number) => void;
  onTranslateXYZ?: (nextCenterX: number, nextCenterY: number, nextCenterZ: number) => void;
  color?: string;
  showFill?: boolean;
  showEdgeHandles?: boolean;
  liveUpdate?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export type DragMode =
  | "vertex-bottom"
  | "vertex-top"
  | "edge-bottom"
  | "edge-top"
  | "height"
  | "height-bottom"
  | "translate"
  | "translate-xz"
  | "translate-free"
  | null;

export interface PendingTranslate {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  center: [number, number, number];
}

export interface DragRefs {
  dragPlane: React.MutableRefObject<THREE.Plane>;
  intersection: React.MutableRefObject<THREE.Vector3>;
  raycaster: React.MutableRefObject<THREE.Raycaster>;
  verticesRef: React.MutableRefObject<THREE.Vector3[]>;
  topVerticesRef: React.MutableRefObject<THREE.Vector3[] | null>;
  lineRef: React.MutableRefObject<THREE.LineLoop | null>;
  fillRef: React.MutableRefObject<THREE.Mesh | null>;
  handlesRef: React.MutableRefObject<THREE.InstancedMesh | null>;
  hitRef: React.MutableRefObject<THREE.InstancedMesh | null>;
  edgeHandlesRef: React.MutableRefObject<THREE.InstancedMesh | null>;
  edgeHitRef: React.MutableRefObject<THREE.InstancedMesh | null>;
  topHandlesRef: React.MutableRefObject<THREE.InstancedMesh | null>;
  topHitRef: React.MutableRefObject<THREE.InstancedMesh | null>;
  topEdgeHandlesRef: React.MutableRefObject<THREE.InstancedMesh | null>;
  topEdgeHitRef: React.MutableRefObject<THREE.InstancedMesh | null>;
  heightHandleRef: React.MutableRefObject<THREE.Mesh | null>;
  heightHitRef: React.MutableRefObject<THREE.Mesh | null>;
  bottomHeightHandleRef: React.MutableRefObject<THREE.Mesh | null>;
  bottomHeightHitRef: React.MutableRefObject<THREE.Mesh | null>;
  dragIndexRef: React.MutableRefObject<number | null>;
  dragEdgeRef: React.MutableRefObject<number | null>;
  dragStartRef: React.MutableRefObject<THREE.Vector3 | null>;
  dragStartVerticesRef: React.MutableRefObject<THREE.Vector3[] | null>;
  dragStartTopVerticesRef: React.MutableRefObject<THREE.Vector3[] | null>;
  dragModeRef: React.MutableRefObject<DragMode>;
  rafRef: React.MutableRefObject<number | null>;
  heightBaseRef: React.MutableRefObject<number | null>;
  heightStartRef: React.MutableRefObject<number | null>;
  heightTopRef: React.MutableRefObject<number | null>;
  translateStartYRef: React.MutableRefObject<number | null>;
  translateLastYRef: React.MutableRefObject<number | null>;
  translateStartPointRef: React.MutableRefObject<THREE.Vector3 | null>;
  translateStartXZRef: React.MutableRefObject<[number, number] | null>;
  translateLastXZRef: React.MutableRefObject<[number, number] | null>;
  translateStartXYZRef: React.MutableRefObject<[number, number, number] | null>;
  translateLastXYZRef: React.MutableRefObject<[number, number, number] | null>;
  dragDisposersRef: React.MutableRefObject<(() => void)[]>;
  hoverHandleRef: React.MutableRefObject<number | null>;
  hoverTopHandleRef: React.MutableRefObject<number | null>;
  translateHoverRef: React.MutableRefObject<boolean>;
  pendingTranslateRef: React.MutableRefObject<PendingTranslate | null>;
}

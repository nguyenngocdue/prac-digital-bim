import * as THREE from "three";
import { HANDLE_COLOR, HANDLE_HOVER_COLOR } from "./constants";

/**
 * Update instance matrices for vertex handles
 */
export const updateVertexHandles = (
  handlesRef: THREE.InstancedMesh | null,
  hitRef: THREE.InstancedMesh | null,
  vertices: THREE.Vector3[]
) => {
  if (!handlesRef || !hitRef) return;

  const temp = new THREE.Matrix4();
  const baseColor = new THREE.Color(HANDLE_COLOR);

  vertices.forEach((point, index) => {
    temp.makeTranslation(point.x, point.y, point.z);
    handlesRef.setMatrixAt(index, temp);
    hitRef.setMatrixAt(index, temp);
    handlesRef.setColorAt(index, baseColor);
  });

  handlesRef.instanceMatrix.needsUpdate = true;
  if (handlesRef.instanceColor) {
    handlesRef.instanceColor.needsUpdate = true;
  }
  hitRef.instanceMatrix.needsUpdate = true;
};

/**
 * Update instance matrices for edge handles
 */
export const updateEdgeHandles = (
  edgeHandlesRef: THREE.InstancedMesh | null,
  edgeHitRef: THREE.InstancedMesh | null,
  vertices: THREE.Vector3[]
) => {
  if (!edgeHandlesRef || !edgeHitRef) return;

  const temp = new THREE.Matrix4();
  const count = vertices.length;

  for (let i = 0; i < count; i += 1) {
    const nextIndex = (i + 1) % count;
    const mid = new THREE.Vector3()
      .addVectors(vertices[i]!, vertices[nextIndex]!)
      .multiplyScalar(0.5);
    temp.makeTranslation(mid.x, mid.y, mid.z);
    edgeHandlesRef.setMatrixAt(i, temp);
    edgeHitRef.setMatrixAt(i, temp);
  }

  edgeHandlesRef.instanceMatrix.needsUpdate = true;
  edgeHitRef.instanceMatrix.needsUpdate = true;
};

/**
 * Update height handle position
 */
export const updateHeightHandle = (
  heightHandleRef: THREE.Mesh | null,
  heightHitRef: THREE.Mesh | null,
  vertices: THREE.Vector3[]
) => {
  if (!heightHandleRef || !heightHitRef || vertices.length === 0) return;

  const center = vertices.reduce(
    (acc, point) => acc.add(point),
    new THREE.Vector3()
  );
  center.multiplyScalar(1 / vertices.length);

  heightHandleRef.position.copy(center);
  heightHitRef.position.copy(center);
};

/**
 * Update handle hover state
 */
export const updateHandleHover = (
  mesh: THREE.InstancedMesh | null,
  hoverRef: React.MutableRefObject<number | null>,
  nextIndex: number | null
) => {
  if (!mesh || !mesh.instanceColor) return;

  const normal = new THREE.Color(HANDLE_COLOR);
  const hover = new THREE.Color(HANDLE_HOVER_COLOR);
  const prev = hoverRef.current;

  if (prev !== null) {
    mesh.setColorAt(prev, normal);
  }
  if (nextIndex !== null) {
    mesh.setColorAt(nextIndex, hover);
  }

  hoverRef.current = nextIndex;
  mesh.instanceColor.needsUpdate = true;
};

/**
 * Update all handles after vertex change
 */
export const updateAllHandles = (
  handlesRef: THREE.InstancedMesh | null,
  hitRef: THREE.InstancedMesh | null,
  edgeHandlesRef: THREE.InstancedMesh | null,
  edgeHitRef: THREE.InstancedMesh | null,
  vertices: THREE.Vector3[]
) => {
  updateVertexHandles(handlesRef, hitRef, vertices);
  updateEdgeHandles(edgeHandlesRef, edgeHitRef, vertices);
};

import * as THREE from "three";
import { HANDLE_COLOR, HANDLE_HOVER_COLOR, HANDLE_ACTIVE_COLOR } from "./constants";

const HIT_SCALE_MULTIPLIER = 2.5; // Hit mesh is larger for easier clicking

/**
 * Update instance matrices for vertex handles
 */
export const updateVertexHandles = (
  handlesRef: THREE.InstancedMesh | null,
  hitRef: THREE.InstancedMesh | null,
  vertices: THREE.Vector3[],
  scale = 1
) => {
  if (!handlesRef || !hitRef) return;

  if (!handlesRef.instanceColor || handlesRef.instanceColor.count !== vertices.length) {
    handlesRef.instanceColor = new THREE.InstancedBufferAttribute(
      new Float32Array(vertices.length * 3),
      3
    );
  }

  const temp = new THREE.Matrix4();
  const hitTemp = new THREE.Matrix4();
  const baseColor = new THREE.Color(HANDLE_COLOR);
  const activeColor = new THREE.Color(HANDLE_ACTIVE_COLOR);
  const activeIndex =
    typeof handlesRef.userData.activeIndex === "number"
      ? handlesRef.userData.activeIndex
      : null;

  const scaleVec = new THREE.Vector3(scale, scale, scale);
  const hitScaleVec = new THREE.Vector3(scale * HIT_SCALE_MULTIPLIER, scale * HIT_SCALE_MULTIPLIER, scale * HIT_SCALE_MULTIPLIER);
  const quat = new THREE.Quaternion();

  vertices.forEach((point, index) => {
    temp.compose(point, quat, scaleVec);
    hitTemp.compose(point, quat, hitScaleVec);
    handlesRef.setMatrixAt(index, temp);
    hitRef.setMatrixAt(index, hitTemp);
    handlesRef.setColorAt(index, baseColor);
  });
  if (activeIndex !== null) {
    handlesRef.setColorAt(activeIndex, activeColor);
  }

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
  vertices: THREE.Vector3[],
  scale = 1
) => {
  if (!edgeHandlesRef || !edgeHitRef) return;

  if (!edgeHandlesRef.instanceColor || edgeHandlesRef.instanceColor.count !== vertices.length) {
    edgeHandlesRef.instanceColor = new THREE.InstancedBufferAttribute(
      new Float32Array(vertices.length * 3),
      3
    );
  }

  const temp = new THREE.Matrix4();
  const count = vertices.length;
  const baseColor = new THREE.Color(HANDLE_COLOR);
  const scaleVec = new THREE.Vector3(scale, scale, scale);
  const quat = new THREE.Quaternion();

  for (let i = 0; i < count; i += 1) {
    const nextIndex = (i + 1) % count;
    const mid = new THREE.Vector3()
      .addVectors(vertices[i]!, vertices[nextIndex]!)
      .multiplyScalar(0.5);
    temp.compose(mid, quat, scaleVec);
    edgeHandlesRef.setMatrixAt(i, temp);
    edgeHitRef.setMatrixAt(i, temp);
    edgeHandlesRef.setColorAt(i, baseColor);
  }

  edgeHandlesRef.instanceMatrix.needsUpdate = true;
  if (edgeHandlesRef.instanceColor) {
    edgeHandlesRef.instanceColor.needsUpdate = true;
  }
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
  if (!mesh) return;

  if (!mesh.instanceColor || mesh.instanceColor.count !== mesh.count) {
    mesh.instanceColor = new THREE.InstancedBufferAttribute(
      new Float32Array(mesh.count * 3),
      3
    );
  }
  const normal = new THREE.Color(HANDLE_COLOR);
  const hover = new THREE.Color(HANDLE_HOVER_COLOR);
  const active = new THREE.Color(HANDLE_ACTIVE_COLOR);

  const activeIndex =
    typeof mesh.userData.activeIndex === "number"
      ? mesh.userData.activeIndex
      : null;
  const prev = hoverRef.current;
  
  // Reset previous hover to normal or active color
  if (prev !== null) {
    mesh.setColorAt(prev, prev === activeIndex ? active : normal);
  }
  // Set new hover color (always use hover color when hovering)
  if (nextIndex !== null) {
    mesh.setColorAt(nextIndex, hover);
  }
  
  hoverRef.current = nextIndex;
  mesh.instanceColor.needsUpdate = true;
};

/**
 * Update handle active (selected) state
 */
export const updateHandleActive = (
  mesh: THREE.InstancedMesh | null,
  activeRef: React.MutableRefObject<number | null>,
  nextIndex: number | null
) => {
  if (!mesh || !mesh.instanceColor) return;

  const normal = new THREE.Color(HANDLE_COLOR);
  const active = new THREE.Color(HANDLE_ACTIVE_COLOR);
  const prev = activeRef.current;

  mesh.userData.activeIndex = nextIndex;

  if (prev !== null) {
    mesh.setColorAt(prev, normal);
  }
  if (nextIndex !== null) {
    mesh.setColorAt(nextIndex, active);
  }

  activeRef.current = nextIndex;
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
  vertices: THREE.Vector3[],
  scale = 1
) => {
  updateVertexHandles(handlesRef, hitRef, vertices, scale);
  updateEdgeHandles(edgeHandlesRef, edgeHitRef, vertices, scale);
};

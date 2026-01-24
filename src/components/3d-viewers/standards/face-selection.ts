import * as THREE from "three";
import { getWorldFaceNormal, getWorldFacePoint } from "./face-normal-arrow";

export type FaceSelection = {
  mesh: THREE.Mesh;
  indices: number[];
};

export const getFaceIndices = (
  geometry: THREE.BufferGeometry,
  faceIndex: number
): number[] => {
  const index = geometry.getIndex();
  if (index) {
    const base = faceIndex * 3;
    return [index.getX(base), index.getX(base + 1), index.getX(base + 2)];
  }
  const base = faceIndex * 3;
  return [base, base + 1, base + 2];
};

export const ensureVertexColors = (geometry: THREE.BufferGeometry) => {
  let colors = geometry.getAttribute("color") as THREE.BufferAttribute | null;
  if (!colors) {
    const position = geometry.getAttribute("position") as THREE.BufferAttribute | null;
    if (!position) {
      return null;
    }
    const colorArray = new Float32Array(position.count * 3);
    for (let i = 0; i < colorArray.length; i += 3) {
      colorArray[i] = 1;
      colorArray[i + 1] = 1;
      colorArray[i + 2] = 1;
    }
    colors = new THREE.BufferAttribute(colorArray, 3);
    geometry.setAttribute("color", colors);
  }
  return colors;
};

export const applyVertexColors = (
  mesh: THREE.Mesh,
  vertexIndices: number[],
  colorHex: string
) => {
  const geometry = mesh.geometry as THREE.BufferGeometry;
  if (!geometry?.attributes?.position) return;
  const colors = ensureVertexColors(geometry);
  if (!colors) return;
  const color = new THREE.Color(colorHex);
  vertexIndices.forEach((idx) => {
    colors.setXYZ(idx, color.r, color.g, color.b);
  });
  colors.needsUpdate = true;
  if (Array.isArray(mesh.material)) {
    mesh.material.forEach((mat) => {
      mat.vertexColors = true;
      mat.needsUpdate = true;
    });
  } else if (mesh.material) {
    mesh.material.vertexColors = true;
    mesh.material.needsUpdate = true;
  }
  return vertexIndices;
};

export const resetVertexColors = (mesh: THREE.Mesh, indices: number[]) => {
  const geometry = mesh.geometry as THREE.BufferGeometry;
  const colors = geometry.getAttribute("color") as THREE.BufferAttribute | null;
  if (!colors) return;
  indices.forEach((idx) => {
    colors.setXYZ(idx, 1, 1, 1);
  });
  colors.needsUpdate = true;
};

export const collectCoplanarFaceVertices = (
  mesh: THREE.Mesh,
  hit: THREE.Intersection<THREE.Object3D>,
  normalEps = 0.01,
  planeEps = 0.01
) => {
  const geometry = mesh.geometry as THREE.BufferGeometry;
  const position = geometry.getAttribute("position") as THREE.BufferAttribute | null;
  if (!position) return [];
  const index = geometry.getIndex();
  const faceCount = index ? index.count / 3 : position.count / 3;
  const targetNormal = getWorldFaceNormal(hit);
  if (!targetNormal) return [];
  const targetPoint = getWorldFacePoint(hit);
  const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(targetNormal, targetPoint);
  const verts = new Set<number>();
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const ab = new THREE.Vector3();
  const cb = new THREE.Vector3();
  const faceNormal = new THREE.Vector3();
  const centroid = new THREE.Vector3();

  for (let i = 0; i < faceCount; i += 1) {
    const [ia, ib, ic] = getFaceIndices(geometry, i);
    if (ia === undefined || ib === undefined || ic === undefined) continue;
    a.fromBufferAttribute(position, ia).applyMatrix4(mesh.matrixWorld);
    b.fromBufferAttribute(position, ib).applyMatrix4(mesh.matrixWorld);
    c.fromBufferAttribute(position, ic).applyMatrix4(mesh.matrixWorld);
    ab.subVectors(a, b);
    cb.subVectors(c, b);
    faceNormal.copy(cb).cross(ab).normalize();
    if (faceNormal.dot(targetNormal) < 1 - normalEps) continue;
    centroid.copy(a).add(b).add(c).multiplyScalar(1 / 3);
    if (Math.abs(plane.distanceToPoint(centroid)) > planeEps) continue;
    verts.add(ia);
    verts.add(ib);
    verts.add(ic);
  }

  return Array.from(verts);
};

export const selectCoplanarFace = (
  mesh: THREE.Mesh,
  hit: THREE.Intersection<THREE.Object3D>,
  colorHex: string,
  normalEps = 0.01,
  planeEps = 0.01
): FaceSelection | null => {
  if (hit.faceIndex === undefined || hit.faceIndex === null) return null;
  const indices = collectCoplanarFaceVertices(mesh, hit, normalEps, planeEps);
  if (indices.length === 0) {
    const fallback = getFaceIndices(mesh.geometry as THREE.BufferGeometry, hit.faceIndex);
    applyVertexColors(mesh, fallback, colorHex);
    return { mesh, indices: fallback };
  }
  applyVertexColors(mesh, indices, colorHex);
  return { mesh, indices };
};

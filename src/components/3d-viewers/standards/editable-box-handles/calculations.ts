import * as THREE from "three";

/**
 * Calculate distance between two 3D vertices
 */
export const getDistance = (
  v1: [number, number, number],
  v2: [number, number, number]
): number => {
  const dx = v2[0] - v1[0];
  const dy = v2[1] - v1[1];
  const dz = v2[2] - v1[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

/**
 * Calculate polygon area (2D projection on XZ plane)
 */
export const calculateArea = (vertices: [number, number, number][]): number => {
  if (vertices.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < vertices.length; i++) {
    const j = (i + 1) % vertices.length;
    area += vertices[i]![0] * vertices[j]![2];
    area -= vertices[j]![0] * vertices[i]![2];
  }
  return Math.abs(area / 2);
};

/**
 * Calculate centroid of a polygon
 */
export const calculateCentroid = (
  vertices: [number, number, number][],
  centerY: number
): THREE.Vector3 => {
  if (vertices.length < 3) {
    return new THREE.Vector3(0, centerY, 0);
  }

  let centroidX = 0;
  let centroidZ = 0;
  let signedArea = 0;

  for (let i = 0; i < vertices.length; i += 1) {
    const j = (i + 1) % vertices.length;
    const x0 = vertices[i]![0];
    const z0 = vertices[i]![2];
    const x1 = vertices[j]![0];
    const z1 = vertices[j]![2];
    const cross = x0 * z1 - x1 * z0;
    signedArea += cross;
    centroidX += (x0 + x1) * cross;
    centroidZ += (z0 + z1) * cross;
  }

  signedArea *= 0.5;

  if (Math.abs(signedArea) > 1e-6) {
    centroidX /= 6 * signedArea;
    centroidZ /= 6 * signedArea;
  } else {
    centroidX = vertices.reduce((sum, v) => sum + v[0], 0) / vertices.length;
    centroidZ = vertices.reduce((sum, v) => sum + v[2], 0) / vertices.length;
  }

  return new THREE.Vector3(centroidX, centerY, centroidZ);
};

/**
 * Calculate average Y position
 */
export const calculateAverageY = (vertices: [number, number, number][]): number => {
  if (vertices.length === 0) return 0;
  return vertices.reduce((sum, v) => sum + v[1], 0) / vertices.length;
};

/**
 * Create a shape from vertices
 */
export const createShapeFromVertices = (
  vertices: [number, number, number][]
): THREE.Shape | null => {
  if (vertices.length < 3) return null;

  const shape = new THREE.Shape();
  shape.moveTo(vertices[0]![0], vertices[0]![2]);
  for (let i = 1; i < vertices.length; i += 1) {
    shape.lineTo(vertices[i]![0], vertices[i]![2]);
  }
  shape.closePath();

  return shape;
};

/**
 * Calculate center point of vertices
 */
export const calculateCenter = (
  vertices: THREE.Vector3[]
): THREE.Vector3 => {
  const center = vertices.reduce(
    (acc, point) => acc.add(point),
    new THREE.Vector3()
  );
  return center.multiplyScalar(1 / vertices.length);
};

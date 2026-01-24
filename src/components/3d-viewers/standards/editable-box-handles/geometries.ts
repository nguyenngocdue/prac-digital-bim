import * as THREE from "three";
import {
  HANDLE_SIZE,
  HANDLE_HIT_SIZE,
  EDGE_SIZE,
  EDGE_HIT_SIZE,
  HEIGHT_SIZE,
  HANDLE_SEGMENTS,
  EDGE_SEGMENTS,
  HIT_SEGMENTS,
} from "./constants";

export const createGeometries = () => {
  return {
    handleGeometry: new THREE.SphereGeometry(HANDLE_SIZE, HANDLE_SEGMENTS, HANDLE_SEGMENTS),
    hitGeometry: new THREE.SphereGeometry(HANDLE_HIT_SIZE, HIT_SEGMENTS, HIT_SEGMENTS),
    edgeGeometry: new THREE.SphereGeometry(EDGE_SIZE, EDGE_SEGMENTS, EDGE_SEGMENTS),
    edgeHitGeometry: new THREE.SphereGeometry(EDGE_HIT_SIZE, HIT_SEGMENTS, HIT_SEGMENTS),
    heightGeometry: new THREE.SphereGeometry(HEIGHT_SIZE, EDGE_SEGMENTS, EDGE_SEGMENTS),
  };
};

export const disposeGeometries = (
  handleGeometry: THREE.SphereGeometry,
  hitGeometry: THREE.SphereGeometry,
  edgeGeometry: THREE.SphereGeometry,
  edgeHitGeometry: THREE.SphereGeometry,
  heightGeometry: THREE.SphereGeometry
) => {
  handleGeometry.dispose();
  hitGeometry.dispose();
  edgeGeometry.dispose();
  edgeHitGeometry.dispose();
  heightGeometry.dispose();
};

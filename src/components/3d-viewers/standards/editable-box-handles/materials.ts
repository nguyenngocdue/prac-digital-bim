import * as THREE from "three";
import {
  HANDLE_COLOR,
  EDGE_COLOR,
} from "./constants";

export const createMaterials = () => {
  return {
    handleMaterial: new THREE.MeshBasicMaterial({
      color: HANDLE_COLOR,
      vertexColors: true,
    }),
    edgeMaterial: new THREE.MeshBasicMaterial({
      color: EDGE_COLOR,
    }),
    hitMaterial: new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
  };
};

export const disposeMaterials = (
  handleMaterial: THREE.MeshStandardMaterial,
  edgeMaterial: THREE.MeshStandardMaterial,
  hitMaterial: THREE.MeshBasicMaterial
) => {
  handleMaterial.dispose();
  edgeMaterial.dispose();
  hitMaterial.dispose();
};

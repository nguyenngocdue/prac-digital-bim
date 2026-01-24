import * as THREE from "three";
import {
  HANDLE_COLOR,
  EDGE_COLOR,
  HANDLE_EMISSIVE_INTENSITY,
  EDGE_EMISSIVE_INTENSITY,
} from "./constants";

export const createMaterials = () => {
  return {
    handleMaterial: new THREE.MeshStandardMaterial({
      color: HANDLE_COLOR,
      emissive: HANDLE_COLOR,
      emissiveIntensity: HANDLE_EMISSIVE_INTENSITY,
      vertexColors: true,
    }),
    edgeMaterial: new THREE.MeshStandardMaterial({
      color: EDGE_COLOR,
      emissive: EDGE_COLOR,
      emissiveIntensity: EDGE_EMISSIVE_INTENSITY,
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

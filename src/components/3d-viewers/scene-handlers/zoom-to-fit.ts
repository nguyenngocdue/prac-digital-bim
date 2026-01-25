"use client";
import { Box3, Vector3, PerspectiveCamera, type Camera, type Object3D } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { emitEvent } from "@/stores/event-manager";

type ZoomToFitParams = {
  controls: OrbitControlsImpl | null;
  boxesGroup: Object3D | null;
  camera: Camera;
};

export const zoomToFit = ({ controls, boxesGroup, camera }: ZoomToFitParams) => {
  if (!controls || !boxesGroup) return;
  const box = new Box3().setFromObject(boxesGroup);
  if (box.isEmpty()) return;
  const center = box.getCenter(new Vector3());
  const size = box.getSize(new Vector3());
  const maxSize = Math.max(size.x, size.y, size.z);
  const fitOffset = 1.3;
  const perspective = camera as PerspectiveCamera;
  const fov = perspective.isPerspectiveCamera ? perspective.fov : 50;
  const aspect = perspective.isPerspectiveCamera ? perspective.aspect : 1;
  const fitHeightDistance = maxSize / (2 * Math.tan((fov * Math.PI) / 360));
  const fitWidthDistance = fitHeightDistance / aspect;
  const distance = fitOffset * Math.max(fitHeightDistance, fitWidthDistance);
  const direction = camera.position.clone().sub(controls.target).normalize();
  camera.position.copy(direction.multiplyScalar(distance).add(center));
  controls.target.copy(center);
  controls.update();
  const projectable = camera as PerspectiveCamera;
  if (typeof projectable.updateProjectionMatrix === "function") {
    projectable.updateProjectionMatrix();
  }
  emitEvent({
    type: "viewer.zoomToFit",
    source: "scene-handlers/zoom-to-fit",
    payload: {
      center: [center.x, center.y, center.z],
      size: [size.x, size.y, size.z],
      distance,
    },
  });
};

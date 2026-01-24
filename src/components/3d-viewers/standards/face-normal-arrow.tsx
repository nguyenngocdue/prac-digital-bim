import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import type { ColorRepresentation, Intersection, Object3D, Vector3 } from "three";
import * as THREE from "three";

export type FaceArrowState = {
  origin: Vector3;
  direction: Vector3;
};

export const getWorldFaceNormal = (
  intersection: Intersection<Object3D>
): Vector3 | null => {
  if (!intersection.face) return null;
  const normalMatrix = new THREE.Matrix3().getNormalMatrix(intersection.object.matrixWorld);
  return intersection.face.normal.clone().applyMatrix3(normalMatrix).normalize();
};

export const getWorldFacePoint = (intersection: Intersection<Object3D>): Vector3 => {
  return intersection.point.clone();
};

export const getFaceArrowFromEvent = (
  event: ThreeEvent<PointerEvent>,
  offset = 0.01
): FaceArrowState | null => {
  const face = event.face;
  if (!face) return null;
  const origin = event.point.clone();
  const direction = face.normal.clone().transformDirection(event.object.matrixWorld).normalize();
  origin.addScaledVector(direction, offset);
  return { origin, direction };
};

interface FaceNormalArrowProps {
  children: ReactNode;
  length?: number;
  color?: ColorRepresentation;
  headLength?: number;
  headWidth?: number;
  offset?: number;
  stopPropagation?: boolean;
}

export const FaceNormalArrow = ({
  children,
  length = 1,
  color = "#7c3aed",
  headLength = 0.25,
  headWidth = 0.15,
  offset = 0.01,
  stopPropagation = false,
}: FaceNormalArrowProps) => {
  const [arrow, setArrow] = useState<FaceArrowState | null>(null);
  const arrowHelper = useMemo(
    () =>
      new THREE.ArrowHelper(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 0, 0),
        length,
        new THREE.Color(color)
      ),
    [color, length]
  );

  const handlePointerDown = useCallback((event: ThreeEvent<PointerEvent>) => {
    if (stopPropagation) {
      event.stopPropagation();
    }
    const next = getFaceArrowFromEvent(event, offset);
    if (!next) return;
    setArrow(next);
  }, [offset, stopPropagation]);

  useEffect(() => {
    if (!arrow) return;
    arrowHelper.position.copy(arrow.origin);
    arrowHelper.setDirection(arrow.direction);
    arrowHelper.setLength(length, headLength, headWidth);
    arrowHelper.setColor(new THREE.Color(color));
  }, [arrow, arrowHelper, color, headLength, headWidth, length]);

  return (
    <group onPointerDown={handlePointerDown} frustumCulled={false}>
      {children}
      {arrow && <primitive object={arrowHelper} />}
    </group>
  );
};

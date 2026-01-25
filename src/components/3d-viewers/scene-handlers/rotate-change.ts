"use client";
import type { Dispatch, SetStateAction } from "react";
import type { Object3D } from "three";
import { scheduleRotationUpdate } from "../transform-modes/rotate";
import { emitEvent } from "@/stores/event-manager";

type RotateChangeParams = {
  selectedId: string;
  activeTransformObject: Object3D;
  setBoxes: Dispatch<
    SetStateAction<import("@/app/contexts/box-context").Box[]>
  >;
  rafRef: React.MutableRefObject<number | null>;
};

export const handleRotateChange = ({
  selectedId,
  activeTransformObject,
  setBoxes,
  rafRef,
}: RotateChangeParams) => {
  scheduleRotationUpdate({
    selectedId,
    rotationY: activeTransformObject.rotation.y,
    setBoxes,
    rafRef,
  });
  emitEvent({
    type: "transform.rotate.change",
    source: "scene-handlers/rotate-change",
    payload: {
      id: selectedId,
      rotationY: activeTransformObject.rotation.y,
    },
  });
};

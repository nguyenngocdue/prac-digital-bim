"use client";
import type { Dispatch, SetStateAction } from "react";
import type { Box } from "@/app/contexts/box-context";
import type { Vector3 } from "three";
import type { GetBoxBounds } from "../transform-modes/types";
import { computeGoOnTop } from "../transform-modes/top";
import { emitEvent } from "@/stores/event-manager";

type GoOnTopParams = {
  selectedId: string;
  selectedBox: Box;
  currentPosition: Vector3;
  rotationY: number;
  boxes: Box[];
  getBoxBounds: GetBoxBounds;
  getBoxHeight: (box: Box) => number;
  activeTransformObject: { position: { y: number } } | null;
  setBoxes: Dispatch<SetStateAction<Box[]>>;
};

export const handleGoOnTop = ({
  selectedId,
  selectedBox,
  currentPosition,
  rotationY,
  boxes,
  getBoxBounds,
  getBoxHeight,
  activeTransformObject,
  setBoxes,
}: GoOnTopParams) => {
  const { nextY } = computeGoOnTop({
    selectedId,
    selectedBox,
    currentPosition,
    rotationY,
    boxes,
    getBoxBounds,
    getBoxHeight,
  });
  if (activeTransformObject) {
    activeTransformObject.position.y = nextY;
  }
  emitEvent({
    type: "transform.goOnTop",
    source: "scene-handlers/go-on-top",
    payload: {
      id: selectedId,
      nextY,
    },
  });
  setBoxes((prev) =>
    prev.map((box) =>
      box.id === selectedId
        ? { ...box, position: [currentPosition.x, nextY, currentPosition.z] }
        : box
    )
  );
};

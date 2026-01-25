"use client";
import { Html } from "@react-three/drei";
import type { Box } from "@/app/contexts/box-context";

type RotationAngleLabelProps = {
  transformMode: "translate" | "rotate" | "scale";
  selectedBox: Box | undefined;
  rotationY: number;
  height: number;
};

export const RotationAngleLabel = ({
  transformMode,
  selectedBox,
  rotationY,
  height,
}: RotationAngleLabelProps) => {
  if (transformMode !== "rotate" || !selectedBox) return null;

  return (
    <Html
      position={[
        selectedBox.position[0],
        selectedBox.position[1] + height / 2 + 0.2,
        selectedBox.position[2],
      ]}
      occlude={false}
      zIndexRange={[1000, 0]}
      distanceFactor={8}
      center
    >
      <div className="pointer-events-none rounded-full bg-black/80 px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg">
        {Math.round((rotationY * 180) / Math.PI)}°
      </div>
    </Html>
  );
};

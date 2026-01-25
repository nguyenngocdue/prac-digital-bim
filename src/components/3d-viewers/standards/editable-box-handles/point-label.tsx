"use client";
import { Html } from "@react-three/drei";
import type * as THREE from "three";

type PointLabelProps = {
  show: boolean;
  point: THREE.Vector3 | null | undefined;
  typeLabel: "vertex" | "top";
};

export const PointLabel = ({ show, point, typeLabel }: PointLabelProps) => {
  if (!show || !point) return null;

  return (
    <Html
      position={[point.x, point.y, point.z]}
      distanceFactor={10}
      zIndexRange={[1200, 0]}
      occlude={false}
      style={{ transform: "translate(12px, -50%)" }}
    >
      <div className="pointer-events-none rounded bg-black/80 px-3 py-2 text-sm text-white whitespace-nowrap">
        {typeLabel} · X {point.x.toFixed(2)} · Y {point.y.toFixed(2)} · Z {point.z.toFixed(2)}
      </div>
    </Html>
  );
};

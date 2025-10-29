"use client";
import * as THREE from "three";
import { memo } from "react";
import { Text } from "@react-three/drei";

/**
 * Draw axesHelper with X/Y/Z labels.
 */
type Props = {
  /** Axis length (same as axesHelper args) */
  size?: number;
  /** Font size for labels */
  fontSize?: number;
  /** Offset distance for label placement at axis end */
  labelOffset?: number;
  /** Make labels always face the camera */
  billboard?: boolean;
  /** Axis colors for X/Y/Z (default: Three.js colors: X red, Y green, Z blue) */
  colors?: { x?: THREE.ColorRepresentation; y?: THREE.ColorRepresentation; z?: THREE.ColorRepresentation };
};

function AxesWithLabelsBase({
  size = 5,
  fontSize = 0.3,
  labelOffset = size + 1,
  billboard = false,
  colors = { x: "red", y: "green", z: "blue" },
}: Props) {
  return (
    <>
      <axesHelper args={[size]} />

      {/* Labels */}
      <Text
        position={[labelOffset, 0, 0]}
        fontSize={fontSize}
        color={colors.x ?? "red"}
        anchorX="center"
        anchorY="middle"
        {...(billboard ? { billboard: true } : {})}
      >
        X
      </Text>

      <Text
        position={[0, labelOffset, 0]}
        fontSize={fontSize}
        color={colors.y ?? "green"}
        anchorX="center"
        anchorY="middle"
        {...(billboard ? { billboard: true } : {})}
      >
        Y
      </Text>

      <Text
        position={[0, 0, labelOffset]}
        fontSize={fontSize}
        color={colors.z ?? "blue"}
        anchorX="center"
        anchorY="middle"
        {...(billboard ? { billboard: true } : {})}
      >
        Z
      </Text>
    </>
  );
}

export const AxesWithLabels = memo(AxesWithLabelsBase);

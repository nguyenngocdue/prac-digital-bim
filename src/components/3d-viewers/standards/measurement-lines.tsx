"use client";
import { Html } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

interface MeasurementLinesProps {
  width: number;
  height: number;
  depth: number;
  position?: [number, number, number];
  color?: string;
}

export const MeasurementLines = ({
  width,
  height,
  depth,
  position = [0, 0, 0],
  color = "#3B82F6",
}: MeasurementLinesProps) => {
  const [x, y, z] = position;

  // Calculate measurement positions
  const measurements = useMemo(() => {
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const halfDepth = depth / 2;

    return [
      // Width measurement (front bottom edge)
      {
        start: [x - halfWidth, y - halfHeight, z + halfDepth],
        end: [x + halfWidth, y - halfHeight, z + halfDepth],
        label: `${width.toFixed(2)}m`,
        labelPosition: [x, y - halfHeight - 0.3, z + halfDepth + 0.5] as [
          number,
          number,
          number
        ],
      },
      // Depth measurement (right bottom edge)
      {
        start: [x + halfWidth, y - halfHeight, z - halfDepth],
        end: [x + halfWidth, y - halfHeight, z + halfDepth],
        label: `${depth.toFixed(2)}m`,
        labelPosition: [x + halfWidth + 0.5, y - halfHeight - 0.3, z] as [
          number,
          number,
          number
        ],
      },
      // Height measurement (front right edge)
      {
        start: [x + halfWidth, y - halfHeight, z + halfDepth],
        end: [x + halfWidth, y + halfHeight, z + halfDepth],
        label: `${height.toFixed(2)}m`,
        labelPosition: [x + halfWidth + 0.5, y, z + halfDepth + 0.5] as [
          number,
          number,
          number
        ],
      },
    ];
  }, [width, height, depth, x, y, z]);

  return (
    <group>
      {measurements.map((measurement, index) => {
        const points = [
          new THREE.Vector3(...measurement.start),
          new THREE.Vector3(...measurement.end),
        ];
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

        return (
          <group key={index}>
            {/* Measurement line */}
            <primitive object={new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color: color, linewidth: 2 }))} />

            {/* Start and end points */}
            <mesh position={measurement.start as [number, number, number]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial color={color} />
            </mesh>
            <mesh position={measurement.end as [number, number, number]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial color={color} />
            </mesh>

            {/* Measurement label */}
            <Html
              position={measurement.labelPosition}
              center
              distanceFactor={10}
              style={{
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              <div className="rounded-md bg-blue-500 px-2 py-1 text-xs font-semibold text-white shadow-lg">
                {measurement.label}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};

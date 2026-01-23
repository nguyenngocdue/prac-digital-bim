"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { BuildingShape, getFootprintPoints } from "./building-shapes";

type BuildingMeshProps = {
  color: string;
  height: number;
  footprint?: [number, number][];
  width?: number;
  depth?: number;
  thicknessRatio?: number;
  shape?: BuildingShape;
};

export function BuildingMesh({
  color,
  height,
  footprint,
  width = 10,
  depth = 10,
  thicknessRatio = 0.3,
  shape = "rect",
}: BuildingMeshProps) {
  const geometry = useMemo(() => {
    const points = footprint?.length
      ? footprint
      : getFootprintPoints(shape, width, depth, thicknessRatio);
    if (!points.length) {
      return new THREE.BufferGeometry();
    }
    const shapePath = new THREE.Shape();
    shapePath.moveTo(points[0]![0], points[0]![1]);
    for (let i = 1; i < points.length; i += 1) {
      shapePath.lineTo(points[i]![0], points[i]![1]);
    }
    shapePath.closePath();

    const geom = new THREE.ExtrudeGeometry(shapePath, {
      depth: Math.max(height, 0.1),
      bevelEnabled: false,
      steps: 1,
    });
    geom.rotateX(Math.PI / 2);
    geom.translate(0, height / 2, 0);
    return geom;
  }, [depth, footprint, height, shape, thicknessRatio, width]);

  return (
    <group>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={color}
          metalness={0.05}
          roughness={0.12}
          clearcoat={0.6}
          clearcoatRoughness={0.1}
          transparent
          opacity={0.14}
          transmission={0.35}
          thickness={0.35}
          ior={1.42}
        />
      </mesh>
      <lineSegments geometry={new THREE.EdgesGeometry(geometry, 25)}>
        <lineBasicMaterial color="#7dd3fc" transparent opacity={0.95} />
      </lineSegments>
      <lineSegments geometry={new THREE.EdgesGeometry(geometry, 55)}>
        <lineBasicMaterial color="#38bdf8" transparent opacity={0.55} />
      </lineSegments>
    </group>
  );
}

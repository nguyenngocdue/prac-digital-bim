"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { BuildingShape, getFootprintPoints } from "./building-shapes";
import {
  BUILDING_HIGHLIGHT_EDGE_PRIMARY,
  BUILDING_HIGHLIGHT_EDGE_SECONDARY,
  BUILDING_HIGHLIGHT_EMISSIVE,
  BUILDING_HIGHLIGHT_EMISSIVE_INTENSITY,
  BUILDING_HIGHLIGHT_FILL,
  BUILDING_SELECTED_EDGE_PRIMARY,
  BUILDING_SELECTED_EDGE_SECONDARY,
  BUILDING_SELECTED_EMISSIVE,
  BUILDING_SELECTED_EMISSIVE_INTENSITY,
  BUILDING_SELECTED_FILL,
} from "./colors";

type BuildingMeshProps = {
  color: string;
  height: number;
  footprint?: [number, number][];
  topFootprint?: [number, number][];
  width?: number;
  depth?: number;
  thicknessRatio?: number;
  shape?: BuildingShape;
  enableRaycast?: boolean;
  highlighted?: boolean;
  selected?: boolean;
};

export function BuildingMesh({
  color,
  height,
  footprint,
  topFootprint,
  width = 10,
  depth = 10,
  thicknessRatio = 0.3,
  shape = "rect",
  enableRaycast = true,
  highlighted = false,
  selected = false,
}: BuildingMeshProps) {
  const highlightColors = useMemo(() => {
    const fill = selected
      ? BUILDING_SELECTED_FILL
      : highlighted
        ? BUILDING_HIGHLIGHT_FILL
        : color;
    const edgePrimary = selected
      ? BUILDING_SELECTED_EDGE_PRIMARY
      : highlighted
        ? BUILDING_HIGHLIGHT_EDGE_PRIMARY
        : "#7dd3fc";
    const edgeSecondary = selected
      ? BUILDING_SELECTED_EDGE_SECONDARY
      : highlighted
        ? BUILDING_HIGHLIGHT_EDGE_SECONDARY
        : "#38bdf8";
    const emissiveColor = selected
      ? new THREE.Color(BUILDING_SELECTED_EMISSIVE)
      : highlighted
        ? new THREE.Color(BUILDING_HIGHLIGHT_EMISSIVE)
        : new THREE.Color(0x000000);
    const emissiveIntensity = selected
      ? BUILDING_SELECTED_EMISSIVE_INTENSITY
      : highlighted
        ? BUILDING_HIGHLIGHT_EMISSIVE_INTENSITY
        : 0;
    return { fill, edgePrimary, edgeSecondary, emissiveColor, emissiveIntensity };
  }, [color, highlighted, selected]);

  const geometry = useMemo(() => {
    const points = footprint?.length
      ? footprint
      : getFootprintPoints(shape, width, depth, thicknessRatio);
    if (!points.length) {
      return new THREE.BufferGeometry();
    }
    const heightValue = Math.max(height, 0.1);
    const halfHeight = heightValue / 2;
    const topPoints =
      topFootprint && topFootprint.length === points.length ? topFootprint : points;

    if (!topFootprint || topFootprint.length !== points.length) {
      const shapePath = new THREE.Shape();
      shapePath.moveTo(points[0]![0], points[0]![1]);
      for (let i = 1; i < points.length; i += 1) {
        shapePath.lineTo(points[i]![0], points[i]![1]);
      }
      shapePath.closePath();

      const geom = new THREE.ExtrudeGeometry(shapePath, {
        depth: heightValue,
        bevelEnabled: false,
        steps: 1,
      });
      geom.rotateX(Math.PI / 2);
      geom.translate(0, halfHeight, 0);
      return geom;
    }

    const bottomVertices = points.map(([x, z]) => new THREE.Vector3(x, -halfHeight, z));
    const topVertices = topPoints.map(([x, z]) => new THREE.Vector3(x, halfHeight, z));
    const positions: number[] = [];
    bottomVertices.forEach((v) => positions.push(v.x, v.y, v.z));
    topVertices.forEach((v) => positions.push(v.x, v.y, v.z));

    const shapePoints2d = points.map(([x, z]) => new THREE.Vector2(x, z));
    const triangles = THREE.ShapeUtils.triangulateShape(shapePoints2d, []);
    const indices: number[] = [];
    const count = points.length;
    triangles.forEach((triangle) => {
      const [a, b, c] = triangle;
      if (a === undefined || b === undefined || c === undefined) return;
      indices.push(a, c, b);
    });
    triangles.forEach((triangle) => {
      const [a, b, c] = triangle;
      if (a === undefined || b === undefined || c === undefined) return;
      indices.push(a + count, b + count, c + count);
    });
    for (let i = 0; i < count; i += 1) {
      const next = (i + 1) % count;
      const bottomA = i;
      const bottomB = next;
      const topA = i + count;
      const topB = next + count;
      indices.push(bottomA, bottomB, topB);
      indices.push(bottomA, topB, topA);
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }, [depth, footprint, height, shape, thicknessRatio, topFootprint, width]);

  const raycast = enableRaycast ? undefined : () => null;

  return (
    <group>
      <mesh geometry={geometry} castShadow receiveShadow raycast={raycast}>
        <meshPhysicalMaterial
          color={highlightColors.fill}
          metalness={0.05}
          roughness={0.12}
          clearcoat={0.6}
          clearcoatRoughness={0.1}
          transparent
          opacity={highlighted ? 0.32 : 0.14}
          transmission={0.35}
          thickness={0.35}
          ior={1.42}
          emissive={highlightColors.emissiveColor}
          emissiveIntensity={highlightColors.emissiveIntensity}
        />
      </mesh>
      <lineSegments geometry={new THREE.EdgesGeometry(geometry, 25)} raycast={raycast}>
        <lineBasicMaterial
          color={highlightColors.edgePrimary}
          transparent
          opacity={highlighted ? 0.98 : 0.95}
        />
      </lineSegments>
      <lineSegments geometry={new THREE.EdgesGeometry(geometry, 55)} raycast={raycast}>
        <lineBasicMaterial
          color={highlightColors.edgeSecondary}
          transparent
          opacity={highlighted ? 0.85 : 0.55}
        />
      </lineSegments>
    </group>
  );
}

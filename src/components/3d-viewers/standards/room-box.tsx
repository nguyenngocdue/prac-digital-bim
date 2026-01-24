"use client";
import { useRef } from "react";
import { useSelect } from "@react-three/drei";
import { MeasurementLines } from "./measurement-lines";
import { BuildingMesh } from "./building-mesh";
import { EditableBoxHandles } from "./editable-box-handles";
import * as THREE from "three";

interface RoomBoxProps {
  width?: number;
  height?: number;
  depth?: number;
  position?: [number, number, number];
  color?: string;
  showMeasurements?: boolean;
  showHandles?: boolean;
  onPointerDown?: (event: any) => void;
  vertices?: [number, number, number][];
  onVerticesChange?: (vertices: [number, number, number][]) => void;
  onHandleDragChange?: (isDragging: boolean) => void;
}

export const RoomBox = ({
  width = 3.66,
  height = 3,
  depth = 3.66,
  position = [0, 0, 0],
  color = "#D4A574",
  showMeasurements = true,
  showHandles = true,
  onPointerDown,
  vertices,
  onVerticesChange,
  onHandleDragChange,
}: RoomBoxProps) => {
  const selected = !!useSelect();
  const groupRef = useRef<THREE.Group>(null);
  
  // Calculate vertices from box dimensions if not provided
  const boxVertices = vertices || [
    [-width / 2, 0, depth / 2], // front-left
    [width / 2, 0, depth / 2], // front-right
    [width / 2, 0, -depth / 2], // back-right
    [-width / 2, 0, -depth / 2], // back-left
  ] as [number, number, number][];
  const hasCustomFootprint = Boolean(vertices && vertices.length >= 3);
  const footprint = hasCustomFootprint
    ? vertices!.map(([x, , z]) => [x, z]) as [number, number][]
    : undefined;
  const getBounds = (points: [number, number, number][]) => {
    let minX = points[0]![0];
    let maxX = points[0]![0];
    let minZ = points[0]![2];
    let maxZ = points[0]![2];
    points.forEach(([x, , z]) => {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    });
    return { width: Math.max(0.1, maxX - minX), depth: Math.max(0.1, maxZ - minZ) };
  };
  const bounds = hasCustomFootprint ? getBounds(vertices!) : { width, depth };

  // Wall thickness
  const wallThickness = 0.2;

  return (
    <group ref={groupRef} position={position} onPointerDown={onPointerDown}>
      {hasCustomFootprint ? (
        <BuildingMesh color={color} height={height} footprint={footprint} />
      ) : (
        <>
          {/* Floor */}
          <mesh position={[0, -height / 2, 0]} receiveShadow>
            <boxGeometry args={[width, 0.1, depth]} />
            <meshStandardMaterial color="#F5DEB3" />
          </mesh>

          {/* Walls */}
          {/* Front wall (with door opening) */}
          <group>
            {/* Left part of front wall */}
            <mesh
              position={[-width / 2 + 0.5, 0, depth / 2 - wallThickness / 2]}
              castShadow
            >
              <boxGeometry args={[1, height, wallThickness]} />
              <meshStandardMaterial color={color} transparent opacity={0.7} />
            </mesh>
            {/* Right part of front wall */}
            <mesh
              position={[width / 2 - 1.3, 0, depth / 2 - wallThickness / 2]}
              castShadow
            >
              <boxGeometry args={[2.6, height, wallThickness]} />
              <meshStandardMaterial color={color} transparent opacity={0.7} />
            </mesh>
            {/* Top of door opening */}
            <mesh
              position={[-width / 2 + 1.4, height / 2 - 0.3, depth / 2 - wallThickness / 2]}
              castShadow
            >
              <boxGeometry args={[0.8, 0.6, wallThickness]} />
              <meshStandardMaterial color={color} transparent opacity={0.7} />
            </mesh>
          </group>

          {/* Back wall */}
          <mesh
            position={[0, 0, -depth / 2 + wallThickness / 2]}
            castShadow
          >
            <boxGeometry args={[width, height, wallThickness]} />
            <meshStandardMaterial color={color} transparent opacity={0.7} />
          </mesh>

          {/* Left wall */}
          <mesh
            position={[-width / 2 + wallThickness / 2, 0, 0]}
            castShadow
          >
            <boxGeometry args={[wallThickness, height, depth]} />
            <meshStandardMaterial color={color} transparent opacity={0.7} />
          </mesh>

          {/* Right wall (with opening for bathroom) */}
          <group>
            <mesh
              position={[width / 2 - wallThickness / 2, 0, -depth / 2 + 0.8]}
              castShadow
            >
              <boxGeometry args={[wallThickness, height, 1.6]} />
              <meshStandardMaterial color={color} transparent opacity={0.7} />
            </mesh>
            <mesh
              position={[width / 2 - wallThickness / 2, 0, depth / 2 - 0.5]}
              castShadow
            >
              <boxGeometry args={[wallThickness, height, 1]} />
              <meshStandardMaterial color={color} transparent opacity={0.7} />
            </mesh>
          </group>

          {/* Ceiling - partially transparent */}
          <mesh position={[0, height / 2, 0]} castShadow>
            <boxGeometry args={[width, 0.1, depth]} />
            <meshStandardMaterial color={color} transparent opacity={0.3} />
          </mesh>

          {/* Door frame */}
          <mesh
            position={[-width / 2 + 1, -height / 2 + 1, depth / 2]}
            castShadow
          >
            <boxGeometry args={[0.8, 2, 0.05]} />
            <meshStandardMaterial color="#4A4A4A" />
          </mesh>

          {/* Simple bathroom fixtures */}
          <group position={[width / 2 - 1, -height / 2 + 0.4, 0]}>
            {/* Toilet */}
            <mesh position={[-0.5, 0, -0.5]} castShadow>
              <boxGeometry args={[0.5, 0.8, 0.6]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>

            {/* Sink counter */}
            <mesh position={[0.3, 0, 0.3]} castShadow>
              <boxGeometry args={[1, 0.8, 0.6]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
          </group>
        </>
      )}

      {/* Selection outline */}
      {selected && !hasCustomFootprint && (
        <mesh>
          <boxGeometry args={[width + 0.1, height + 0.1, depth + 0.1]} />
          <meshBasicMaterial color="#3B82F6" wireframe />
        </mesh>
      )}

      {/* Measurements */}
      {showMeasurements && (
        <MeasurementLines
          width={bounds.width}
          height={height}
          depth={bounds.depth}
          position={[0, 0, 0]}
          color="#3B82F6"
        />
      )}
      
      {/* Editable handles when selected */}
      {showHandles && selected && onVerticesChange && (
        <EditableBoxHandles
          vertices={boxVertices.map(v => [
            v[0] + position[0],
            v[1] + position[1],
            v[2] + position[2]
          ] as [number, number, number])}
          onVerticesChange={(newVertices) => {
            // Convert back to relative coordinates
            const relativeVertices = newVertices.map(v => [
              v[0] - position[0],
              v[1] - position[1],
              v[2] - position[2]
            ] as [number, number, number]);
            onVerticesChange(relativeVertices);
          }}
          color="#3B82F6"
          onDragStart={() => onHandleDragChange?.(true)}
          onDragEnd={() => onHandleDragChange?.(false)}
        />
      )}
    </group>
  );
};

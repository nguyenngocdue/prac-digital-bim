"use client";
import { useRef } from "react";
import { useSelect } from "@react-three/drei";
import { MeasurementLines } from "./measurement-lines";
import * as THREE from "three";

interface RoomBoxProps {
  width?: number;
  height?: number;
  depth?: number;
  position?: [number, number, number];
  color?: string;
  showMeasurements?: boolean;
  onPointerDown?: (event: any) => void;
}

export const RoomBox = ({
  width = 3.66,
  height = 3,
  depth = 3.66,
  position = [0, 0, 0],
  color = "#D4A574",
  showMeasurements = true,
  onPointerDown,
}: RoomBoxProps) => {
  const selected = !!useSelect();
  const groupRef = useRef<THREE.Group>(null);

  // Wall thickness
  const wallThickness = 0.2;

  return (
    <group ref={groupRef} position={position} onPointerDown={onPointerDown}>
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

      {/* Selection outline */}
      {selected && (
        <mesh>
          <boxGeometry args={[width + 0.1, height + 0.1, depth + 0.1]} />
          <meshBasicMaterial color="#3B82F6" wireframe />
        </mesh>
      )}

      {/* Measurements */}
      {showMeasurements && (
        <MeasurementLines
          width={width}
          height={height}
          depth={depth}
          position={[0, 0, 0]}
          color="#3B82F6"
        />
      )}
    </group>
  );
};

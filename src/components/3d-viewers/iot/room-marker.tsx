"use client";

import * as THREE from 'three';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoomData, getCO2Status } from '@/types/room';

interface RoomMarkerProps {
  room: RoomData;
  radius?: number;
  height?: number;
  animated?: boolean;
}

export const RoomMarker = ({ 
  room, 
  radius = 0.3, 
  height = 0.1,
  animated = true 
}: RoomMarkerProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef(0);
  
  const co2Status = room.co2 ? getCO2Status(room.co2) : 'normal';
  
  const statusColors = {
    normal: '#22c55e',
    warning: '#f97316',
    danger: '#ef4444'
  };
  
  const color = statusColors[co2Status];
  
  // Position on ground
  const position: [number, number, number] = [
    room.position[0],
    height / 2, // Half height để nằm trên ground
    room.position[2]
  ];

  // Animated pulse effect
  useFrame((_, delta) => {
    if (animated && meshRef.current) {
      pulseRef.current += delta * 2;
      const scale = 1 + Math.sin(pulseRef.current) * 0.15;
      meshRef.current.scale.set(scale, 1, scale);
    }
  });

  return (
    <group position={position}>
      {/* Main marker */}
      <mesh ref={meshRef}>
        <cylinderGeometry args={[radius, radius, height, 32]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={0.4}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Outer ring for danger status */}
      {co2Status === 'danger' && (
        <mesh position={[0, height / 2 + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius * 1.2, radius * 1.5, 32]} />
          <meshBasicMaterial 
            color={color}
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
};

"use client";

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CameraData } from '@/types/camera';
import * as THREE from 'three';

interface CameraMarkerProps {
  camera: CameraData;
  onClick?: () => void;
  selected?: boolean;
}

export const CameraMarker = ({ camera, onClick, selected = false }: CameraMarkerProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const coneRef = useRef<THREE.Mesh>(null);
  
  const statusColors = {
    online: '#22c55e',
    offline: '#6b7280',
    error: '#ef4444'
  };
  
  const color = statusColors[camera.status];

  // Gentle rotation animation
  useFrame((_, delta) => {
    if (groupRef.current && camera.status === 'online') {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group
      position={camera.position}
      rotation={camera.rotation || [0, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <group ref={groupRef}>
        {/* Camera body (box) */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.2, 0.15, 0.3]} />
          <meshStandardMaterial 
            color={selected ? '#3b82f6' : '#374151'}
            emissive={selected ? '#3b82f6' : color}
            emissiveIntensity={0.3}
          />
        </mesh>
        
        {/* Camera lens */}
        <mesh position={[0, 0, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.1, 16]} />
          <meshStandardMaterial 
            color={color}
            emissive={color}
            emissiveIntensity={0.5}
          />
        </mesh>
        
        {/* Vision cone for online cameras */}
        {camera.status === 'online' && (
          <mesh 
            ref={coneRef}
            position={[0, 0, 0.4]} 
            rotation={[Math.PI / 2, 0, 0]}
          >
            <coneGeometry args={[0.4, 0.8, 8, 1, true]} />
            <meshBasicMaterial 
              color={color}
              transparent
              opacity={0.15}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
        
        {/* Selection ring */}
        {selected && (
          <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.25, 0.3, 32]} />
            <meshBasicMaterial 
              color="#3b82f6"
              transparent
              opacity={0.8}
            />
          </mesh>
        )}
      </group>
      
      {/* Status indicator light */}
      <pointLight 
        color={color} 
        intensity={camera.status === 'online' ? 1 : 0.3} 
        distance={2} 
      />
    </group>
  );
};

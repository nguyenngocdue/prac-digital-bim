"use client";

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';

interface GltfModelProps {
  scene: any;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  autoRotate?: boolean;
}

export const GltfModel = ({ 
  scene, 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  autoRotate = false
}: GltfModelProps) => {
  const groupRef = useRef<Group>(null);

  useEffect(() => {
    if (scene && groupRef.current) {
      // Center the model
      const box = new (require('three')).Box3().setFromObject(scene);
      const center = box.getCenter(new (require('three')).Vector3());
      scene.position.sub(center);
    }
  }, [scene]);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  if (!scene) return null;

  return (
    <group 
      ref={groupRef}
      position={position} 
      rotation={rotation}
      scale={scale}
    >
      <primitive object={scene} />
    </group>
  );
};

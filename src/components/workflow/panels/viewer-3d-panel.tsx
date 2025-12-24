"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";

function BuildingModel() {
  return (
    <group>
      {/* Base */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 1, 2.5]} />
        <meshStandardMaterial color="#9ca3af" />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[4.2, 0.2, 2.7]} />
        <meshStandardMaterial color="#d1d5db" />
      </mesh>

      {/* Glass panels */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[-1.7 + i * 0.5, 0.5, -1.26]} castShadow>
          <boxGeometry args={[0.4, 0.8, 0.02]} />
          <meshStandardMaterial color="#06b6d4" opacity={0.6} transparent />
        </mesh>
      ))}
    </group>
  );
}

export function Viewer3DPanel() {
  return (
    <div className="h-[280px] w-full bg-zinc-950">
      <Suspense fallback={
        <div className="flex h-full items-center justify-center text-xs text-zinc-500">
          Loading 3D...
        </div>
      }>
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[6, 4, 6]} />
          <OrbitControls enablePan={false} enableZoom={true} />
          
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          
          <BuildingModel />
          
          {/* Ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="#18181b" />
          </mesh>
        </Canvas>
      </Suspense>
    </div>
  );
}

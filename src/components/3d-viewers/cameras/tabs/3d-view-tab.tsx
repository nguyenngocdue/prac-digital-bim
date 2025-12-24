"use client";

import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Box, Sphere, PerspectiveCamera } from '@react-three/drei';
import { CameraData } from '@/types/camera';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface ThreeDViewTabProps {
  camera: CameraData;
}

const CameraModel = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      {/* Camera body */}
      <Box args={[0.3, 0.2, 0.4]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#2563eb" />
      </Box>
      {/* Camera lens */}
      <Sphere args={[0.08, 16, 16]} position={[0, 0, 0.2]}>
        <meshStandardMaterial color="#1e40af" metalness={0.8} roughness={0.2} />
      </Sphere>
      {/* Indicator light */}
      <Sphere args={[0.03, 8, 8]} position={[0.1, 0.1, 0.15]}>
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
      </Sphere>
    </group>
  );
};

const Scene = ({ cameraData }: { cameraData: CameraData }) => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[5, 5, 5]} />
      <OrbitControls 
        enableDamping
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={20}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />
      
      {/* Grid */}
      <Grid 
        args={[20, 20]} 
        cellSize={1} 
        cellThickness={0.5} 
        cellColor="#6b7280" 
        sectionSize={5} 
        sectionThickness={1} 
        sectionColor="#3b82f6"
        fadeDistance={25}
        fadeStrength={1}
        followCamera={false}
      />
      
      {/* Camera Model at its position */}
      <CameraModel position={cameraData.position as [number, number, number]} />
      
      {/* Reference objects */}
      <Box args={[1, 1, 1]} position={[3, 0.5, 0]}>
        <meshStandardMaterial color="#10b981" />
      </Box>
      
      <Sphere args={[0.5, 32, 32]} position={[-3, 0.5, 0]}>
        <meshStandardMaterial color="#f59e0b" />
      </Sphere>
      
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
    </>
  );
};

export const ThreeDViewTab: React.FC<ThreeDViewTabProps> = ({ camera }) => {
  const controlsRef = useRef<any>(null);

  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-950">
      {/* Controls Toolbar */}
      <div className="flex items-center justify-between p-2 bg-muted/30 border-b">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">3D View: {camera.name}</span>
        </div>
        <div className="flex gap-1">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleReset}
            className="h-7"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 relative">
        <Canvas shadows>
          <Scene cameraData={camera} />
        </Canvas>
        
        {/* Info Overlay */}
        <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm text-white text-xs p-2 rounded space-y-1">
          <div>Position: [{camera.position[0].toFixed(2)}, {camera.position[1].toFixed(2)}, {camera.position[2].toFixed(2)}]</div>
          <div>Type: {camera.type}</div>
          <div className="text-muted-foreground">Use mouse to orbit, zoom, pan</div>
        </div>
      </div>
    </div>
  );
};

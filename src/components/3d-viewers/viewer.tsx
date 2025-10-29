"use client";
import { Canvas } from "@react-three/fiber";
import { GizmoHelper, GizmoViewcube, GizmoViewport, Grid, OrbitControls, Stats } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { AxesWithLabels } from "./standards/axes-with-labels";
import * as THREE from "three";

const PlaceholderBox = ({ color }: { color: string }) => {
  return (
    <mesh>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

const Viewer = () => {
  const [accent, setAccent] = useState<string>("#06b6d4");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const cs = getComputedStyle(document.documentElement);
    const val = cs.getPropertyValue("--accent").trim();
    if (val) setAccent(val);
  }, []);

  return (
    <div className="w-full h-full bg-background/50">
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <PlaceholderBox color={accent || "#06b6d4"} />
        <OrbitControls />
        <AxesWithLabels size={4} fontSize={0.3} labelOffset={4.2} billboard />
        <Grid
          infiniteGrid
          sectionColor="#444"
          cellColor="#666"
          fadeDistance={60}
          fadeStrength={1}
          sectionThickness={0.5}
          cellThickness={0.3}
        />
        <Stats />
        <GizmoHelper
          alignment="top-right" // widget alignment within scene
          margin={[90, 90]} // widget margins (X, Y)
          onUpdate={() => {
            // to force re-render when needed
          }}
          onTarget={() => {
            // Return a default target vector, e.g., the origin
            return new THREE.Vector3(0, 0, 0);
          }}
          renderPriority={1} // make sure the gizmo is rendered on top of other elements
        >
          <GizmoViewcube
            color="#cfd8dc"
            strokeColor="#1a1a1a"
            textColor="#141523"
            hoverColor="#90a4ae"
          />
        </GizmoHelper>
      </Canvas>
    </div>
  );
}

export default Viewer;

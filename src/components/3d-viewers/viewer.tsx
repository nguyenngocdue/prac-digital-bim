"use client";
import { Canvas } from "@react-three/fiber";
import { GizmoHelper, GizmoViewcube, GizmoViewport, Grid, OrbitControls, PivotControls, Stats } from "@react-three/drei";
import { useEffect, useState } from "react";
import { useBoxContext } from "../../app/contexts/box-context";
import { AxesWithLabels } from "./standards/axes-with-labels";
import * as THREE from "three";
import { RaycastCatcher } from "@/lib/raycast-catcher";

const PlaceholderBox = ({ color, position }: { color: string, position?: [number, number, number] }) => {
  return (
    <mesh position={position}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

const Viewer = () => {
  const [accent, setAccent] = useState<string>("#06b6d4");
  const { boxes, setBoxes, creationMode, setCreationMode } = useBoxContext();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const cs = getComputedStyle(document.documentElement);
    const val = cs.getPropertyValue("--accent").trim();
    if (val) setAccent(val);

    // Listen for Escape key to exit creation mode
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && creationMode) {
        setCreationMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [creationMode, setCreationMode]);




  // ...existing code...

  // Import RaycastCatcher from its new file
  return (
    <div className="w-full h-full bg-background/50">
    <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <RaycastCatcher accent={accent} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <PivotControls>
          <PlaceholderBox color={accent || "#06b6d4"} />
        </PivotControls>
        {/* Render all placed boxes */}
        {boxes.map((box, i) => (
          <PlaceholderBox key={i} color={box.color || accent} position={box.position} />
        ))}

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

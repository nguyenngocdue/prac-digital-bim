"use client";
import { Canvas } from "@react-three/fiber";
import { GizmoHelper, GizmoViewcube, Grid, OrbitControls, Select, Stats, useSelect } from "@react-three/drei";
import { useEffect, useState, useRef } from "react";
import { useBoxContext } from "../../app/contexts/box-context";
import { AxesWithLabels } from "./standards/axes-with-labels";
import { RaycastCatcher } from "@/lib/raycast-catcher";
import * as THREE from "three";

const PlaceholderBox = ({ color, position, onSelectEffect }: { color: string, position?: [number, number, number], onSelectEffect?: (selected: boolean) => void }) => {
  const selected = !!useSelect();
  const wasSelected = useRef(false);
  useEffect(() => {
    if (selected && !wasSelected.current) {
      onSelectEffect?.(true);
    } else if (!selected && wasSelected.current) {
      onSelectEffect?.(false);
    }
    wasSelected.current = selected;
  }, [selected, onSelectEffect]);
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {selected && (
        <mesh>
          <boxGeometry args={[1.6, 1.6, 1.6]} />
          <meshBasicMaterial color="#ff9800" wireframe />
        </mesh>
      )}
    </group>
  );
}

const Viewer = () => {
  const [accent, setAccent] = useState<string>("#06b6d4");
  const { boxes, creationMode, setCreationMode } = useBoxContext();

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


  return (
    <div className="w-full h-full bg-background/50">
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <RaycastCatcher accent={accent} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <PlaceholderBox color={accent || "#06b6d4"} />
        <Select box multiple>
          {boxes.map((box, i) => (
            <PlaceholderBox
              key={i}
              color={box.color || accent}
              position={box.position}
              onSelectEffect={(selected) => {
                if (selected) {
                  // Effect only when this box is selected
                  // You can put any effect here, e.g. show info, update UI
                  console.log("Box selected at", box.position);
                }
              }}
            />
          ))}
        </Select>

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

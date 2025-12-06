"use client";
import { memo } from "react";

type Box = { position: [number, number, number], color?: string };

interface SceneProps {
  boxes: Box[];
  accent: string;
  onToggleCesium?: (show: boolean) => void;
}

const Scene = memo(({ boxes, accent }: SceneProps) => {

  // Import Three.js components
  const { GizmoHelper, GizmoViewcube, Grid, OrbitControls, Select, Stats } = require("@react-three/drei");
  const { AxesWithLabels } = require("./standards/axes-with-labels");
  const { RaycastCatcher } = require("@/lib/raycast-catcher");
  const THREE = require("three");
  const { PlaceholderBox } = require("./standards/placeholder-box");

  // Three.js scene
  const threeJsScene = (
    <>
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
            onSelectEffect={(selected: boolean) => {
              if (selected) {
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
        alignment="top-right"
        margin={[90, 90]}
        onUpdate={() => {}}
        onTarget={() => new THREE.Vector3(0, 0, 0)}
        renderPriority={1}
      >
        <GizmoViewcube
          color="#9eacb8"
          strokeColor="#1a1a1a"
          textColor="#141523"
          hoverColor="#90a4ae"
        />
      </GizmoHelper>
    </>
  );

  return threeJsScene;
});

Scene.displayName = "Scene";

export default Scene;

"use client";
import { memo, Suspense, useEffect, useRef } from "react";
import { useGltfModel } from "./gltf/use-gltf-model";
import { GltfModel } from "./gltf/gltf-model";
import { RoomLabelsLayer } from "./iot/room-labels-layer";
import { RoomConnections } from "./iot/room-connections";
import { RoomMarkersLayer } from "./iot/room-markers-layer";
import { CameraMarkersLayer } from "./cameras/camera-markers-layer";
import { mockRooms } from "@/data/mock-rooms";
import { CameraData } from "@/types/camera";
import { GooglePhotorealisticTiles } from "./gis/google-photorealistic-tiles";
import { useThree } from "@react-three/fiber";

type Box = { position: [number, number, number], color?: string };

interface SceneProps {
  boxes: Box[];
  accent: string;
  onToggleCesium?: (show: boolean) => void;
  gltfUrl?: string | null;
  resourceMap?: Map<string, string>;
  showRoomLabels?: boolean;
  cameras?: CameraData[];
  showCameras?: boolean;
  onCameraClick?: (camera: CameraData) => void;
  selectedCameraId?: string | null;
  showGoogleTiles?: boolean;
}

const Scene = memo(({ boxes, accent, gltfUrl, resourceMap, showRoomLabels = false, cameras = [], showCameras = false, onCameraClick, selectedCameraId, showGoogleTiles = false }: SceneProps) => {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  // Import Three.js components
  const { GizmoHelper, GizmoViewcube, Grid, OrbitControls, Select, Stats } = require("@react-three/drei");
  const { AxesWithLabels } = require("./standards/axes-with-labels");
  const { RaycastCatcher } = require("@/lib/raycast-catcher");
  const THREE = require("three");
  const { PlaceholderBox } = require("./standards/placeholder-box");
  
  // Load GLTF model if URL is provided
  const { scene: gltfScene } = useGltfModel({ url: gltfUrl || null, resourceMap });

  useEffect(() => {
    if (!controlsRef.current) return;
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
    camera.updateProjectionMatrix();
  }, [camera]);

  // Three.js scene
  const threeJsScene = (
    <>
      {showGoogleTiles && (
        <GooglePhotorealisticTiles
          lat={1.353285}
          lon={103.691559}
          altitude={0}
          heading={0}
        />
      )}
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

      {/* GLTF Model */}
      {gltfScene && (
        <Suspense fallback={null}>
          <GltfModel 
            scene={gltfScene} 
            position={[0, 0, 0]}
            autoRotate={false}
          />
        </Suspense>
      )}

      {/* IoT Room Labels */}
      <RoomLabelsLayer rooms={mockRooms} visible={showRoomLabels} />
      
      {/* IoT Connection Lines */}
      <RoomConnections rooms={mockRooms} visible={showRoomLabels} />
      
      {/* IoT Room Markers on Floor */}
      <RoomMarkersLayer rooms={mockRooms} visible={showRoomLabels} />

      {/* Camera Markers */}
      <CameraMarkersLayer 
        cameras={cameras} 
        visible={showCameras}
        onCameraClick={onCameraClick}
        selectedCameraId={selectedCameraId}
      />

      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={showGoogleTiles ? 0.08 : 0.12}
        enablePan={showGoogleTiles}
        enableRotate
        enableZoom
        panSpeed={showGoogleTiles ? 0.6 : 1}
        rotateSpeed={showGoogleTiles ? 0.4 : 0.8}
        zoomSpeed={showGoogleTiles ? 1.8 : 1.1}
        minDistance={showGoogleTiles ? 2 : 2}
        maxDistance={showGoogleTiles ? 1_000_000 : 2000}
      />
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
        margin={[350, 90]}
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

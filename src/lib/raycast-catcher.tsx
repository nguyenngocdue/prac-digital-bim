"use client";
import * as THREE from "three";
import { useBoxContext } from "../app/contexts/box-context";
import { useThree } from "@react-three/fiber";

export function RaycastCatcher({ accent }: { accent: string }) {
  const { setBoxes, creationMode } = useBoxContext();
  const { camera, scene, gl } = useThree();
  return (
    <mesh
      position={[0, 0, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      visible={false}
      onPointerDown={(e: any) => {
        if (!creationMode) return;
        // Get mouse position in normalized device coordinates
        const rect = gl.domElement.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        const mouse = new THREE.Vector2(x, y);
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        // Intersect with all meshes in the scene
        const intersects = raycaster.intersectObjects(scene.children, true);
        if (intersects.length > 0 && intersects[0]?.point) {
          const point = intersects[0].point;
          setBoxes((prev) => [...prev, { position: [point.x, point.y + 0.75, point.z], color: accent }]);
        }
      }}
    >
      <planeGeometry args={[1000, 1000]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}
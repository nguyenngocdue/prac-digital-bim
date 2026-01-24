import { useMemo } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";

interface RotationHandlesProps {
  boundingBox: { box: THREE.Box3; center: THREE.Vector3 } | null;
  show: boolean;
  isDragging: boolean;
  rotationAngle: number;
  onPointerDown: (event: any) => void;
  onPointerUp: (event: any) => void;
  setCursor: (cursor: string) => void;
}

/**
 * Calculate rotation handle positions
 */
export const useRotationHandlePositions = (
  boundingBox: { box: THREE.Box3; center: THREE.Vector3 } | null
) => {
  return useMemo(() => {
    if (!boundingBox) return [];
    const { min, max } = boundingBox.box;
    const heightOffset = 0.35;
    return [
      [min.x, min.y + heightOffset, min.z],
      [max.x, min.y + heightOffset, min.z],
      [max.x, min.y + heightOffset, max.z],
      [min.x, min.y + heightOffset, max.z],
    ] as [number, number, number][];
  }, [boundingBox]);
};

/**
 * RotationHandles Component - Hiển thị rotation handles
 */
export const RotationHandles = ({
  boundingBox,
  show,
  isDragging,
  rotationAngle,
  onPointerDown,
  onPointerUp,
  setCursor,
}: RotationHandlesProps) => {
  const handlePositions = useRotationHandlePositions(boundingBox);

  if (!show || isDragging || handlePositions.length === 0) return null;

  return (
    <>
      {handlePositions.map((position, index) => (
        <RotationHandle
          key={`rotate-handle-${index}`}
          position={position}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          setCursor={setCursor}
        />
      ))}
      
      {handlePositions[0] && (
        <RotationLabel position={handlePositions[0]} rotationAngle={rotationAngle} />
      )}
    </>
  );
};

/**
 * Single Rotation Handle
 */
interface RotationHandleProps {
  position: [number, number, number];
  onPointerDown: (event: any) => void;
  onPointerUp: (event: any) => void;
  setCursor: (cursor: string) => void;
}

const RotationHandle = ({
  position,
  onPointerDown,
  onPointerUp,
  setCursor,
}: RotationHandleProps) => {
  return (
    <group position={position} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Visual torus - Bự hơn */}
      <mesh>
        <torusGeometry args={[0.4, 0.08, 16, 32]} />
        <meshBasicMaterial color="#38bdf8" depthTest={false} depthWrite={false} />
      </mesh>

      {/* Hit area */}
      <mesh
        userData={{ isHandle: true }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerOver={(event) => {
          event.stopPropagation();
          setCursor("grab");
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          setCursor("auto");
        }}
      >
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthTest={false} depthWrite={false} />
      </mesh>
    </group>
  );
};

/**
 * Rotation Label
 */
interface RotationLabelProps {
  position: [number, number, number];
  rotationAngle: number;
}

const RotationLabel = ({ position, rotationAngle }: RotationLabelProps) => {
  return (
    <Html
      position={[position[0], position[1] + 0.18, position[2]]}
      center
    >
      <div className="pointer-events-none rounded-full bg-black/70 px-2 py-1 text-[10px] uppercase tracking-wide text-white">
        rotate {rotationAngle !== 0 && `${rotationAngle.toFixed(1)}°`}
      </div>
    </Html>
  );
};

import { useMemo } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";

interface RotationHandlesProps {
  boundingBox: { box: THREE.Box3; center: THREE.Vector3 } | null;
  labelPosition?: [number, number, number];
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
  labelPosition,
  show,
  isDragging,
  rotationAngle,
  onPointerDown,
  onPointerUp,
  setCursor,
}: RotationHandlesProps) => {
  const handlePositions = useRotationHandlePositions(boundingBox);
  const label = labelPosition ?? (boundingBox ? [boundingBox.center.x, boundingBox.center.y, boundingBox.center.z] : null);

  if (!show || handlePositions.length === 0) return null;

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
      {label && <RotationLabel position={label} rotationAngle={rotationAngle} />}
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
  const displayAngle = Number.isFinite(rotationAngle) ? Math.round(rotationAngle) : 0;
  return (
    <Html position={position} center>
      <div
        className="pointer-events-none select-none rounded-full bg-black/80 px-3 py-1.5 text-[12px] font-semibold text-white shadow-lg"
        style={{ cursor: "default" }}
      >
        {displayAngle}°
      </div>
    </Html>
  );
};

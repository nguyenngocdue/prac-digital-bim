import { useMemo } from "react";
import * as THREE from "three";
import { Html, Line } from "@react-three/drei";

interface RotationHandlesProps {
  boundingBox: { box: THREE.Box3; center: THREE.Vector3 } | null;
  labelPosition?: [number, number, number];
  show: boolean;
  rotationAngle: number;
  isRotating?: boolean;
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
 * Generate arc points at a corner position
 * Vẽ cung tròn nhỏ tại mỗi góc bounding box để thể hiện hướng xoay
 * Cung hướng ra ngoài góc, tượng trưng cho hướng xoay
 */
const generateCornerArc = (
  cornerX: number,
  cornerY: number,
  cornerZ: number,
  centerX: number,
  centerZ: number,
  arcRadius: number,
  segments = 20
): [number, number, number][] => {
  // Tính góc từ tâm đến corner (hướng ra ngoài)
  const angleFromCenter = Math.atan2(cornerZ - centerZ, cornerX - centerX);
  // Cung tròn 120 độ (2π/3) hướng ra ngoài góc
  const arcSpan = (Math.PI * 2) / 3;
  // Xoay để cung hướng ra ngoài (vuông góc với đường từ tâm đến góc)
  const startAngle = angleFromCenter - arcSpan / 2;
  const endAngle = angleFromCenter + arcSpan / 2;
  
  const points: [number, number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const angle = startAngle + (i / segments) * (endAngle - startAngle);
    points.push([
      cornerX + Math.cos(angle) * arcRadius,
      cornerY,
      cornerZ + Math.sin(angle) * arcRadius,
    ]);
  }
  return points;
};

/**
 * RotationHandles Component - Hiển thị rotation handles
 */
export const RotationHandles = ({
  boundingBox,
  labelPosition,
  show,
  rotationAngle,
  isRotating = false,
  onPointerDown,
  onPointerUp,
  setCursor,
}: RotationHandlesProps) => {
  const handlePositions = useRotationHandlePositions(boundingBox);
  const label = labelPosition ?? (boundingBox ? [boundingBox.center.x, boundingBox.center.y, boundingBox.center.z] : null);

  // Calculate corner arcs for each handle position
  const cornerArcs = useMemo(() => {
    if (!boundingBox || handlePositions.length === 0) return [];
    const { center, box } = boundingBox;
    // Tính arcRadius dựa trên kích thước bounding box để phù hợp
    const boxWidth = box.max.x - box.min.x;
    const boxDepth = box.max.z - box.min.z;
    const arcRadius = Math.min(boxWidth, boxDepth) * 0.15; // 15% kích thước nhỏ nhất
    
    return handlePositions.map((pos) => {
      return generateCornerArc(
        pos[0], pos[1], pos[2],
        center.x, center.z,
        arcRadius
      );
    });
  }, [boundingBox, handlePositions]);

  // Vertical axis line
  const axisLine = useMemo(() => {
    if (!boundingBox) return null;
    const { center, box } = boundingBox;
    return [
      [center.x, box.min.y - 0.3, center.z],
      [center.x, box.max.y + 0.3, center.z],
    ] as [number, number, number][];
  }, [boundingBox]);

  if (!show || handlePositions.length === 0) return null;

  return (
    <>
      {/* Corner arcs - Cung tròn tại 4 góc bounding box */}
      {cornerArcs.map((arcPoints, index) => (
        <Line
          key={`corner-arc-${index}`}
          points={arcPoints}
          color="#38bdf8"
          lineWidth={3}
          transparent
          opacity={isRotating ? 1 : 0.7}
          depthTest={false}
        />
      ))}
      
      {/* Vertical axis line - Đường thẳng đứng tâm trục */}
      {axisLine && (
        <Line
          points={axisLine}
          color="#f59e0b"
          lineWidth={2}
          dashed
          dashSize={0.1}
          gapSize={0.08}
          transparent
          opacity={isRotating ? 1 : 0.7}
          depthTest={false}
        />
      )}
      
      {/* Center point indicator - Điểm tâm xoay tại mặt đất */}
      {boundingBox && (
        <mesh position={[boundingBox.center.x, boundingBox.box.min.y, boundingBox.center.z]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#f59e0b" depthTest={false} depthWrite={false} />
        </mesh>
      )}

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

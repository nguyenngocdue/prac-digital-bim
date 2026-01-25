import { useMemo } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { calculateArea, calculateCentroid, calculateAverageY } from "./calculations";
import { HOVER_EDGE_COLOR, HOVER_FILL_COLOR } from "../colors";

interface PolygonDisplayProps {
  vertices: [number, number, number][];
  color: string;
  showFill: boolean;
  isDragging: boolean;
  hovered?: boolean;
}

/**
 * PolygonDisplay Component - Hiển thị polygon với edges và fill
 */
export const PolygonDisplay = ({
  vertices,
  color,
  showFill,
  isDragging,
  hovered,
}: PolygonDisplayProps) => {
  if (vertices.length < 2) return null;

  const highlightColor = hovered ? HOVER_FILL_COLOR : color;
  const edgeColor = hovered ? HOVER_EDGE_COLOR : color;

  return (
    <>
      {/* Fill */}
      {!isDragging && showFill && vertices.length >= 3 && (
        <PolygonFill vertices={vertices} color={highlightColor} />
      )}

      {/* Edges */}
      <PolygonEdges vertices={vertices} color={edgeColor} />

      {/* Area label */}
      {vertices.length >= 3 && !isDragging && (
        <AreaLabel vertices={vertices} />
      )}
    </>
  );
};

/**
 * Polygon Fill
 */
interface PolygonFillProps {
  vertices: [number, number, number][];
  color: string;
}

const PolygonFill = ({ vertices, color }: PolygonFillProps) => {
  const shape = useMemo(
    () => new THREE.Shape(vertices.map((v) => new THREE.Vector2(v[0], v[2]))),
    [vertices]
  );

  return (
    <mesh>
      <shapeGeometry args={[shape]} />
      <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
    </mesh>
  );
};

/**
 * Polygon Edges
 */
interface PolygonEdgesProps {
  vertices: [number, number, number][];
  color: string;
}

const PolygonEdges = ({ vertices, color }: PolygonEdgesProps) => {
  return (
    <lineLoop>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array(vertices.flat()), 3]}
          count={vertices.length}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color={color} />
    </lineLoop>
  );
};

/**
 * Area Label
 */
interface AreaLabelProps {
  vertices: [number, number, number][];
}

export const AreaLabel = ({ vertices }: AreaLabelProps) => {
  const area = useMemo(() => calculateArea(vertices), [vertices]);
  const bottomFaceY = useMemo(() => calculateAverageY(vertices), [vertices]);
  const centroid = useMemo(
    () => calculateCentroid(vertices, bottomFaceY),
    [vertices, bottomFaceY]
  );

  return (
    <Html position={[centroid.x, centroid.y, centroid.z]} center distanceFactor={10}>
      <div className="pointer-events-none rounded bg-blue-500 px-3 py-2 text-sm font-bold text-white shadow-lg">
        {area.toFixed(1)} m²
      </div>
    </Html>
  );
};

import { useMemo } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";

interface BoundingBoxProps {
  vertices: [number, number, number][];
  topVertices?: [number, number, number][];
  height?: number;
  show: boolean;
  rotationAngle?: number;
}

/**
 * Calculate bounding box from vertices
 */
export const useBoundingBox = (
  vertices: [number, number, number][],
  topVertices?: [number, number, number][],
  height?: number
) => {
  return useMemo(() => {
    if (!vertices.length) return null;

    const points: THREE.Vector3[] = vertices.map(([x, y, z]) => new THREE.Vector3(x, y, z));

    if (topVertices && topVertices.length === vertices.length) {
      topVertices.forEach(([x, y, z]) => points.push(new THREE.Vector3(x, y, z)));
    } else if (typeof height === "number" && vertices.length) {
      const minY = Math.min(...vertices.map(([, y]) => y));
      const topY = minY + height;
      vertices.forEach(([x, , z]) => points.push(new THREE.Vector3(x, topY, z)));
    }

    const box = new THREE.Box3().setFromPoints(points);

    if (!isFinite(box.min.x) || !isFinite(box.max.x)) return null;

    const minY = box.min.y;
    const maxY = box.max.y;
    if (Math.abs(maxY - minY) < 0.001) {
      box.max.y = minY + 1;
    }

    box.expandByScalar(0.12);

    return {
      box,
      center: box.getCenter(new THREE.Vector3()),
      size: box.getSize(new THREE.Vector3()),
    };
  }, [height, topVertices, vertices]);
};

/**
 * Create bounding box line segments
 */
export const useBoundingBoxLines = (
  boundingBox: { box: THREE.Box3; center: THREE.Vector3 } | null
) => {
  return useMemo(() => {
    if (!boundingBox) return null;

    const { min, max } = boundingBox.box;

    const makeLines = (boxMin: THREE.Vector3, boxMax: THREE.Vector3) => {
      const corners = [
        new THREE.Vector3(boxMin.x, boxMin.y, boxMin.z),
        new THREE.Vector3(boxMax.x, boxMin.y, boxMin.z),
        new THREE.Vector3(boxMax.x, boxMin.y, boxMax.z),
        new THREE.Vector3(boxMin.x, boxMin.y, boxMax.z),
        new THREE.Vector3(boxMin.x, boxMax.y, boxMin.z),
        new THREE.Vector3(boxMax.x, boxMax.y, boxMin.z),
        new THREE.Vector3(boxMax.x, boxMax.y, boxMax.z),
        new THREE.Vector3(boxMin.x, boxMax.y, boxMax.z),
      ];

      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0], // Bottom
        [4, 5], [5, 6], [6, 7], [7, 4], // Top
        [0, 4], [1, 5], [2, 6], [3, 7], // Vertical
      ];

      const positions: number[] = [];
      edges.forEach(([a, b]) => {
        if (a === undefined || b === undefined) return;
        const start = corners[a];
        const end = corners[b];
        if (!start || !end) return;
        positions.push(start.x, start.y, start.z, end.x, end.y, end.z);
      });
      return new Float32Array(positions);
    };

    const inner = makeLines(min, max);
    const margin = 0.08;
    const outerMin = min.clone().addScalar(-margin);
    const outerMax = max.clone().addScalar(margin);
    const outer = makeLines(outerMin, outerMax);

    return { inner, outer };
  }, [boundingBox]);
};

/**
 * BoundingBox Component - Hiển thị bounding box với lines và info
 */
export const BoundingBox = ({
  vertices,
  topVertices,
  height,
  show,
  rotationAngle = 0,
}: BoundingBoxProps) => {
  const boundingBox = useBoundingBox(vertices, topVertices, height);
  const boundingLines = useBoundingBoxLines(boundingBox);

  if (!show || !boundingBox || !boundingLines) return null;

  return (
    <>
      {/* Outer lines - Đậm và rõ ràng */}
      <lineSegments frustumCulled={false} renderOrder={10}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[boundingLines.outer, 3]}
            count={boundingLines.outer.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.9}
          depthTest={false}
          depthWrite={false}
          linewidth={2}
        />
      </lineSegments>

      {/* Inner lines - Đậm hơn */}
      <lineSegments frustumCulled={false} renderOrder={10}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[boundingLines.inner, 3]}
            count={boundingLines.inner.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#60a5fa"
          transparent
          opacity={0.75}
          depthTest={false}
          depthWrite={false}
          linewidth={1.5}
        />
      </lineSegments>

      {/* Wireframe box - Ẩn hoàn toàn */}
      <mesh
        position={[boundingBox.center.x, boundingBox.center.y, boundingBox.center.z]}
        renderOrder={9}
        visible={false}
      >
        <boxGeometry args={[boundingBox.size.x, boundingBox.size.y, boundingBox.size.z]} />
        <meshBasicMaterial
          color="#3b82f6"
          wireframe
          transparent
          opacity={0}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>

      {/* Info Panel */}
      <BoundingBoxInfo
        center={boundingBox.center}
        size={boundingBox.size}
        maxY={boundingBox.box.max.y}
        rotationAngle={rotationAngle}
      />
    </>
  );
};

/**
 * BoundingBox Info Panel Component
 */
interface BoundingBoxInfoProps {
  center: THREE.Vector3;
  size: THREE.Vector3;
  maxY: number;
  rotationAngle: number;
}

export const BoundingBoxInfo = ({
  center,
  size,
  maxY,
  rotationAngle,
}: BoundingBoxInfoProps) => {
  return (
    <Html position={[center.x, maxY + 0.3, center.z]} center>
      <div className="pointer-events-none space-y-1">
        <div className="rounded bg-blue-600/90 px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
          <div className="flex items-center gap-2">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
            <span>Bounding Box</span>
          </div>
        </div>
        <div className="rounded bg-black/80 px-3 py-2 text-[11px] text-white/90 shadow-lg">
          <div className="space-y-0.5 font-mono">
            <div className="flex justify-between gap-3">
              <span className="text-blue-300">W:</span>
              <span className="font-semibold">{size.x.toFixed(2)} m</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-green-300">H:</span>
              <span className="font-semibold">{size.y.toFixed(2)} m</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-yellow-300">D:</span>
              <span className="font-semibold">{size.z.toFixed(2)} m</span>
            </div>
            {rotationAngle !== 0 && (
              <div className="mt-1 border-t border-white/20 pt-1">
                <div className="flex justify-between gap-3">
                  <span className="text-purple-300">Rot:</span>
                  <span className="font-semibold">{rotationAngle.toFixed(1)}°</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Html>
  );
};

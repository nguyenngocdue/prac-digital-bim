import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

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

    return makeLines(min, max);
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
  const lineRef = useRef<THREE.LineSegments | null>(null);

  useEffect(() => {
    if (!lineRef.current) return;
    lineRef.current.computeLineDistances();
  }, [boundingLines]);

  if (!show || !boundingBox || !boundingLines) return null;
 
  return (
    <>
      {/* Bounding lines */}
      <lineSegments
        ref={lineRef}
        frustumCulled={false}
        renderOrder={10}
      >
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[boundingLines, 3]}
            count={boundingLines.length / 3}
            itemSize={3}
          />
        </bufferGeometry>

        <lineDashedMaterial
          color="#7e00fc"
          dashSize={0.25}
          gapSize={0.15}
          transparent
          opacity={0.9}
          depthTest={false}
          depthWrite={false}
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
          color="#7e00fc"
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
  size,
  rotationAngle,
}: BoundingBoxInfoProps) => {
  const { size: viewportSize } = useThree();
  const position = useMemo(
    () => [viewportSize.width / 2, viewportSize.height / 2] as [number, number],
    [viewportSize.height, viewportSize.width]
  );

  return (
    <Html
      fullscreen
      transform={false}
      calculatePosition={() => position}
    >
      <div
        className="pointer-events-none select-none"
        style={{
          position: "absolute",
          right: "16px",
          bottom: "16px",
        }}
      >
        <div className="min-w-[172px] rounded-lg border border-cyan-300/40 bg-slate-950/90 px-3 py-2 text-[11px] text-slate-100 shadow-[0_0_0_1px_rgba(15,23,42,0.6),0_8px_24px_rgba(15,23,42,0.6),0_0_24px_rgba(34,211,238,0.25)] backdrop-blur">
          <div className="flex items-center justify-between gap-3 border-b border-cyan-300/20 pb-1.5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-sm bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
                Bounds
              </span>
            </div>
            {rotationAngle !== 0 && (
              <span className="text-[9px] font-semibold text-cyan-200">
                {rotationAngle.toFixed(1)}&deg;
              </span>
            )}
          </div>
          <div className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1 font-mono tabular-nums">
            <span className="text-[9px] uppercase tracking-[0.16em] text-cyan-200/70">W</span>
            <span className="text-right text-[12px] font-semibold text-slate-100">{size.x.toFixed(2)} m</span>
            <span className="text-[9px] uppercase tracking-[0.16em] text-cyan-200/70">H</span>
            <span className="text-right text-[12px] font-semibold text-slate-100">{size.y.toFixed(2)} m</span>
            <span className="text-[9px] uppercase tracking-[0.16em] text-cyan-200/70">D</span>
            <span className="text-right text-[12px] font-semibold text-slate-100">{size.z.toFixed(2)} m</span>
          </div>
        </div>
      </div>
    </Html>
  );
};

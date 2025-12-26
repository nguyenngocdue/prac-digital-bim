"use client";

import { Handle, Position } from "@xyflow/react";
import { Box, RefreshCw } from "lucide-react";
import { memo, useState, useRef, Suspense, useMemo, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, PerspectiveCamera, Environment, ContactShadows } from "@react-three/drei";
import { NodeCloseButton } from "./node-close-button";
import { NodeExecutionBadge } from "./node-execution-badge";
import { useWorkflow } from "../workflow-provider";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

/**
 * GLTF Viewer Node - Render 3D models from file-upload node using Three Fiber
 */

type GltfViewerNodeProps = {
  id: string;
  data: {
    label?: string;
    fileUrl?: string;
    fileName?: string;
  };
  selected?: boolean;
};

function GLTFModel({
  url,
  controlsRef,
}: {
  url: string;
  controlsRef: React.RefObject<OrbitControlsImpl>;
}) {
  const modelRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(url);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);
  const { camera } = useThree();
  const perspectiveCamera = camera as THREE.PerspectiveCamera;

  useEffect(() => {
    if (!modelRef.current) return;
    const box = new THREE.Box3().setFromObject(modelRef.current);
    if (box.isEmpty()) return;

    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const targetSize = 6; // keep models nicely framed
    const maxDim = Math.max(size.x, size.y, size.z);
    const newScale = maxDim > 0 ? targetSize / maxDim : 1;

    modelRef.current.scale.setScalar(newScale);
    modelRef.current.position.copy(center.multiplyScalar(-newScale));

    // Recalculate bounds after scaling/centering
    const scaledBox = new THREE.Box3().setFromObject(modelRef.current);
    const scaledCenter = new THREE.Vector3();
    const scaledSize = new THREE.Vector3();
    scaledBox.getCenter(scaledCenter);
    scaledBox.getSize(scaledSize);

    const scaledMaxDim = Math.max(scaledSize.x, scaledSize.y, scaledSize.z);
    const fov = THREE.MathUtils.degToRad(perspectiveCamera.fov);
    const distance = (scaledMaxDim * 1.5) / (2 * Math.tan(fov / 2));

    const direction = new THREE.Vector3(1, 1, 1).normalize();
    const newPos = scaledCenter.clone().add(direction.multiplyScalar(distance));

    perspectiveCamera.position.copy(newPos);
    /* eslint-disable react-hooks/immutability -- camera props must be mutated to fit model */
    perspectiveCamera.near = Math.max(0.1, distance / 100);
    perspectiveCamera.far = distance * 100;
    /* eslint-enable react-hooks/immutability */
    perspectiveCamera.lookAt(scaledCenter);
    perspectiveCamera.updateProjectionMatrix();

    if (controlsRef.current) {
      controlsRef.current.target.copy(scaledCenter);
      controlsRef.current.update();
    }
  }, [controlsRef, clonedScene, perspectiveCamera]);

  return (
    <>
      <group ref={modelRef} dispose={null}>
        <primitive object={clonedScene} />
      </group>
    </>
  );
}

function LoadingSpinner() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#6366f1" wireframe />
    </mesh>
  );
}

export const GltfViewerNode = memo(({ id, data, selected }: GltfViewerNodeProps) => {
  const { getNodeStatus, executionState, updateNodeData } = useWorkflow();
  const executionStatus = getNodeStatus(id);
  const nodeState = executionState.nodeStates[id];
  const controlsRef = useRef<OrbitControlsImpl>(null!);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 420, height: 360 });
  const statusColors = {
    idle: "border-purple-500/50 from-purple-950/40 to-purple-950/20",
    pending: "border-yellow-500/50 from-yellow-950/40 to-yellow-950/20",
    running: "border-purple-500/50 from-purple-950/40 to-purple-950/20 animate-pulse",
    success: "border-green-500/50 from-green-950/40 to-green-950/20",
    error: "border-red-500/50 from-red-950/40 to-red-950/20",
    skipped: "border-zinc-500/50 from-zinc-950/40 to-zinc-950/20",
  };

  const handleReset = () => {
    updateNodeData(id, { fileUrl: undefined, fileName: undefined });
  };

  const [cameraResetFlag, setCameraResetFlag] = useState(0);
  const refocusCamera = () => setCameraResetFlag((flag) => flag + 1);
  const stopPointerPropagation = (e: React.PointerEvent) => {
    e.stopPropagation();
  };

  const stopWheelPropagation = (e: React.WheelEvent) => {
    e.stopPropagation();
  };

  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

  const handleResizeStart = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;

    const onMove = (ev: PointerEvent) => {
      ev.stopPropagation();
      const deltaX = ev.clientX - startX;
      const deltaY = ev.clientY - startY;
      setSize({
        width: clamp(startWidth + deltaX, 320, 720),
        height: clamp(startHeight + deltaY, 280, 720),
      });
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp, { passive: true });
  };

  const handleResizeMouseDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    handleResizeStart(e);
  };

  const handleResizeTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const touch = e.touches[0];
    if (!touch) return;
    const syntheticEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY,
      pointerId: 0,
      stopPropagation: () => {},
      preventDefault: () => {},
      target: e.target,
    } as unknown as React.PointerEvent;
    handleResizeStart(syntheticEvent);
  };

  const contentHeight = Math.max(220, size.height - 80);
  const gridSize = Math.max(20, Math.round(size.width / 8));
  const gridDivisions = Math.max(10, Math.round(gridSize));

  return (
    <>
      <div
        ref={containerRef}
        style={{
          width: size.width,
          height: size.height,
          minWidth: 320,
          maxWidth: 720,
          minHeight: 280,
          maxHeight: 720,
          overflow: "visible",
        }}
        className={`group relative min-w-[320px] rounded-lg border bg-gradient-to-b shadow-lg backdrop-blur-sm transition-all flex flex-col ${
          selected
            ? "border-purple-400 shadow-purple-500/50 ring-2 ring-purple-400/30"
            : statusColors[executionStatus]
        }`}
      >
        <NodeCloseButton nodeId={id} variant="purple" />
        <NodeExecutionBadge 
          status={executionStatus} 
          duration={nodeState?.duration} 
        />

        {/* Input Handle */}
        <Handle
          type="target"
          position={Position.Left}
          id="file"
          className="h-3! w-3! border-2! border-purple-500! bg-purple-400! hover:scale-125! transition-transform"
          style={{ left: -6 }}
        />

        {/* Output Handle */}
        <Handle
          type="source"
          position={Position.Right}
          id="model"
          className="h-3! w-3! border-2! border-purple-500! bg-purple-400! hover:scale-125! transition-transform"
          style={{ right: -6 }}
        />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-500/30 bg-purple-500/10 px-2.5 py-1.5">
          <div className="flex items-center gap-2">
            <Box className="h-4 w-4 text-purple-400" />
            <span className="text-xs font-semibold text-purple-400">
              {data.label || "GLTF Viewer"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={refocusCamera}
              className="rounded p-1 transition-colors hover:bg-purple-500/20"
              title="Refocus model"
            >
              <RefreshCw className="h-3 w-3 text-purple-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className="bg-zinc-950/50 relative nodrag nowheel"
          style={{ height: contentHeight }}
          onPointerDown={stopPointerPropagation}
          onPointerMove={stopPointerPropagation}
          onPointerUp={stopPointerPropagation}
          onWheel={stopWheelPropagation}
        >
          {data.fileUrl ? (
            <>
              <Canvas
                className="w-full h-full"
                gl={{ 
                  antialias: true,
                  alpha: true,
                  preserveDrawingBuffer: true 
                }}
              >
                <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={50} />
                
                {/* Lighting */}
                <ambientLight intensity={0.6} />
                <directionalLight position={[8, 10, 5]} intensity={1.1} castShadow />
                <pointLight position={[-6, -4, -4]} intensity={0.4} />
                
                {/* Environment */}
                <Environment preset="city" />
                
                {/* 3D Model */}
                <Suspense fallback={<LoadingSpinner />}>
                  <GLTFModel
                    url={data.fileUrl}
                    controlsRef={controlsRef}
                    key={`${data.fileUrl}-${cameraResetFlag}-${size.width}-${size.height}`}
                  />
                </Suspense>
                
                {/* Controls */}
                <OrbitControls 
                  makeDefault
                  enableDamping
                  dampingFactor={0.05}
                  enablePan
                  ref={controlsRef}
                />
                
                {/* Ground */}
                <gridHelper args={[gridSize, gridDivisions, '#444', '#222']} />
                <ContactShadows
                  position={[0, -0.01, 0]}
                  opacity={0.35}
                  blur={1.5}
                  far={25}
                  resolution={256}
                  color="#1e1b4b"
                />
              </Canvas>

              {/* File Info Overlay */}
              {data.fileName && (
                <div className="absolute top-2 left-2 px-2 py-1 rounded bg-zinc-900/90 backdrop-blur-sm border border-purple-500/30">
                  <p className="text-[10px] text-purple-300">
                    {data.fileName}
                  </p>
                </div>
              )}

              {/* Controls Info */}
              <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-zinc-900/90 backdrop-blur-sm border border-purple-500/30">
                <p className="text-[10px] text-zinc-500">
                  Left: Rotate • Right: Pan • Scroll: Zoom
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <Box className="h-12 w-12 text-purple-500/30 mb-3" />
              <p className="text-sm text-purple-300 mb-1">No Model Loaded</p>
              <p className="text-xs text-zinc-500">
                Connect a file-upload node with a GLTF/GLB file
              </p>
            </div>
          )}
        </div>

        {/* Footer with Actions */}
        {data.fileUrl && (
          <div className="border-t border-purple-500/30 bg-purple-500/5 px-2.5 py-1.5 flex items-center justify-between">
            <div className="text-[10px] text-zinc-500">
              Manual orbit, pan, and zoom enabled
            </div>
            <button
              onClick={handleReset}
              className="px-2 py-1 text-[10px] rounded border border-purple-700/30 bg-zinc-900/50 text-purple-300 hover:bg-purple-500/10 hover:border-purple-500/50 transition-all"
            >
              Clear Model
            </button>
          </div>
        )}

        {/* Resize handle */}
        <div
          className="absolute right-1 bottom-1 h-3 w-3 cursor-se-resize rounded-sm bg-purple-500/70 nodrag nowheel"
          onPointerDown={handleResizeMouseDown}
          onTouchStart={handleResizeTouchStart}
          role="presentation"
        />
      </div>
    </>
  );
});

GltfViewerNode.displayName = "GltfViewerNode";

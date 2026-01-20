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
    modelRef.current.position.copy(center.clone().multiplyScalar(-1));

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
      <meshStandardMaterial color="#0f766e" wireframe />
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
    idle: "",
    pending: "ring-2 ring-amber-400/40",
    running: "ring-2 ring-sky-400/40 animate-pulse",
    success: "ring-2 ring-emerald-400/40",
    error: "ring-2 ring-rose-400/40",
    skipped: "opacity-70",
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
        className={`group relative min-w-[320px] rounded-2xl border border-[var(--workflow-border)] bg-[var(--workflow-panel)] shadow-[0_12px_30px_var(--workflow-shadow)] transition-all flex flex-col ${
          selected
            ? "border-teal-300 ring-2 ring-teal-200/70"
            : "hover:border-teal-200"
        } ${statusColors[executionStatus]}`}
      >
        <NodeCloseButton nodeId={id} variant="cyan" />
        <NodeExecutionBadge 
          status={executionStatus} 
          duration={nodeState?.duration} 
        />

        {/* Input Handle */}
        <Handle
          type="target"
          position={Position.Left}
          id="file"
          className="h-3! w-3! border-2! border-teal-200! bg-teal-500! hover:scale-125! transition-transform"
          style={{ left: -6 }}
        />

        {/* Output Handle */}
        <Handle
          type="source"
          position={Position.Right}
          id="model"
          className="h-3! w-3! border-2! border-teal-200! bg-teal-500! hover:scale-125! transition-transform"
          style={{ right: -6 }}
        />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-2.5 py-2 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Box className="h-4 w-4 text-teal-700" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-800">
              {data.label || "GLTF Viewer"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={refocusCamera}
              className="rounded-full p-1 transition-colors hover:bg-teal-500/10"
              title="Refocus model"
            >
              <RefreshCw className="h-3 w-3 text-teal-700" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className="bg-slate-100/80 relative nodrag nowheel"
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
        camera={{ fov: 50, position: [5, 5, 5], near: 0.1, far: 2000 }}
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
                <gridHelper args={[gridSize, gridDivisions, "#94a3b8", "#e2e8f0"]} />
                <ContactShadows
                  position={[0, -0.01, 0]}
                  opacity={0.35}
                  blur={1.5}
                  far={25}
                  resolution={256}
                  color="#1f2937"
                />
              </Canvas>

              {/* File Info Overlay */}
              {data.fileName && (
                <div className="absolute top-2 left-2 rounded-full bg-white/90 px-2 py-1 backdrop-blur-sm border border-teal-200">
                  <p className="text-[10px] text-teal-700 font-semibold uppercase tracking-[0.14em]">
                    {data.fileName}
                  </p>
                </div>
              )}

              {/* Controls Info */}
              <div className="absolute bottom-2 right-2 rounded-full bg-white/90 px-2 py-1 backdrop-blur-sm border border-[var(--workflow-border)]">
                <p className="text-[10px] text-[var(--workflow-muted)]">
                  Left: Rotate • Right: Pan • Scroll: Zoom
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <Box className="h-12 w-12 text-teal-400/40 mb-3" />
              <p className="text-sm font-semibold text-teal-700 mb-1">No Model Loaded</p>
              <p className="text-xs text-[var(--workflow-muted)]">
                Connect a file-upload node with a GLTF/GLB file
              </p>
            </div>
          )}
        </div>

        {/* Footer with Actions */}
        {data.fileUrl && (
          <div className="border-t border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-2.5 py-1.5 flex items-center justify-between rounded-b-2xl">
            <div className="text-[10px] text-[var(--workflow-muted)]">
              Manual orbit, pan, and zoom enabled
            </div>
            <button
              onClick={handleReset}
              className="rounded-full border border-teal-200 bg-white/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-teal-700 transition-all hover:border-teal-300"
            >
              Clear Model
            </button>
          </div>
        )}

        {/* Resize handle */}
        <div
          className="absolute right-1 bottom-1 h-3 w-3 cursor-se-resize rounded-sm bg-teal-500/70 nodrag nowheel"
          onPointerDown={handleResizeMouseDown}
          onTouchStart={handleResizeTouchStart}
          role="presentation"
        />
      </div>
    </>
  );
});

GltfViewerNode.displayName = "GltfViewerNode";

"use client";

import { Handle, Position, NodeResizer } from "@xyflow/react";
import { memo, useEffect, useRef, useState } from "react";
import { Box, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import * as THREE from "three";
import {
  Components,
  FragmentsManager,
  SimpleCamera,
  SimpleGrid,
  SimpleRenderer,
  SimpleScene,
  Worlds,
  RendererMode,
} from "@thatopen/components";

import { cn } from "@/lib/utils";
import { NodeCloseButton } from "./node-close-button";
import { NodeExecutionBadge } from "./node-execution-badge";
import { useWorkflow } from "../workflow-provider";

type ViewerStatus = "waiting" | "loading" | "ready" | "error";

type Viewer3DNodeData = {
  label?: string;
  status?: ViewerStatus;
  fileUrl?: string;
  fileName?: string;
  modelId?: string;
  file?: File;
  bytes?: Uint8Array;
  arrayBuffer?: ArrayBuffer;
  fragmentsBuffer?: ArrayBuffer | Uint8Array;
  meta?: Record<string, unknown>;
  boundingBox?: { min: number[]; max: number[] };
};

type ViewerResources = {
  components: Components;
  fragments: FragmentsManager;
  worlds: Worlds;
  scene: SimpleScene;
  camera: SimpleCamera;
  renderer: SimpleRenderer;
  grid: SimpleGrid;
  world: any;
  model?: any;
  animationId?: number;
  fragmentsUpdating?: boolean;
};

async function toBytes(data: Viewer3DNodeData): Promise<Uint8Array> {
  if (data.bytes) return data.bytes;
  if (data.arrayBuffer) return new Uint8Array(data.arrayBuffer);
  if (data.file) {
    const buf = await data.file.arrayBuffer();
    return new Uint8Array(buf);
  }
  if (data.fileUrl) {
    const res = await fetch(data.fileUrl);
    if (!res.ok) {
      throw new Error(`Failed to fetch file: ${res.status} ${res.statusText}`);
    }
    const buf = await res.arrayBuffer();
    return new Uint8Array(buf);
  }
  throw new Error("No IFC data available");
}

function toFragmentsBuffer(data: Viewer3DNodeData): ArrayBuffer | Uint8Array | null {
  if (data.fragmentsBuffer instanceof ArrayBuffer) return data.fragmentsBuffer;
  if (data.fragmentsBuffer instanceof Uint8Array) return data.fragmentsBuffer;
  return null;
}

async function ensureWebIfcWasmPaths(): Promise<void> {
  if (typeof window === "undefined") return;
  const baseUrl = new URL("/wasm/", window.location.origin).toString();
  const WEBIFC = await import("web-ifc");
  const IfcAPI: any = WEBIFC.IfcAPI;
  if (IfcAPI.__patchedLocateFile) return;

  const originalInit = IfcAPI.prototype.Init;
  IfcAPI.prototype.Init = function patchedInit(
    customLocateFileHandler?: (path: string, prefix: string) => string,
    forceSingleThread?: boolean
  ) {
    const handler = (path: string, prefix: string) => {
      if (path.endsWith(".wasm") || path.endsWith(".worker.js")) {
        return baseUrl + path;
      }
      return customLocateFileHandler ? customLocateFileHandler(path, prefix) : prefix + path;
    };
    return originalInit.call(this, handler, forceSingleThread ?? true);
  };

  IfcAPI.__patchedLocateFile = true;
}

async function focusCamera(camera: SimpleCamera, box: THREE.Box3) {
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);

  const maxDim = Math.max(size.x, size.y, size.z);
  const distance = maxDim * 2.0;

  const direction = new THREE.Vector3(1, 1, 1).normalize();
  const newPos = center.clone().add(direction.multiplyScalar(distance));

  const threeCam = camera.three;
  if (threeCam instanceof THREE.PerspectiveCamera) {
    threeCam.near = Math.max(0.05, distance / 1000);
    threeCam.far = Math.max(1000, distance * 10);
  }
  threeCam.position.copy(newPos);
  threeCam.lookAt(center);
  threeCam.updateProjectionMatrix();

  camera.controls.setLookAt(newPos.x, newPos.y, newPos.z, center.x, center.y, center.z, false);
}

export const Viewer3DNode = memo(({ id, data, selected }: { id: string; data: Viewer3DNodeData; selected: boolean }) => {
  const { getNodeStatus, executionState } = useWorkflow();
  const executionStatus = getNodeStatus(id);
  const nodeState = executionState.nodeStates[id];

  const containerRef = useRef<HTMLDivElement>(null);
  const resourcesRef = useRef<ViewerResources | null>(null);
  const [viewerStatus, setViewerStatus] = useState<ViewerStatus>(data.status || "waiting");
  const [error, setError] = useState<string | undefined>(undefined);

  const stopPointerPropagation = (e: React.PointerEvent) => {
    e.stopPropagation();
  };

  const stopWheelPropagation = (e: React.WheelEvent) => {
    e.stopPropagation();
  };

  const statusClasses: Record<ViewerStatus, string> = {
    waiting: "ring-1 ring-teal-200/70",
    loading: "ring-2 ring-sky-200/70 animate-pulse",
    ready: "ring-2 ring-emerald-200/70",
    error: "ring-2 ring-rose-200/70",
  };

  useEffect(() => {
    return () => {
      const res = resourcesRef.current;
      resourcesRef.current = null;
      if (res) {
        try {
          if (res.animationId !== undefined) {
            cancelAnimationFrame(res.animationId);
          }
          if (res.model?.object) {
            res.scene.three.remove(res.model.object);
          }
          res.worlds.delete(res.world);
          res.components.dispose();
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, []);

  const ensureResources = () => {
    if (resourcesRef.current) return resourcesRef.current;
    if (!containerRef.current) throw new Error("Viewer container not ready");

    const components = new Components();
    const worlds = components.get(Worlds);
    const world = worlds.create<SimpleScene, SimpleCamera, SimpleRenderer>();

    const scene = new SimpleScene(components);
    scene.setup({
      backgroundColor: new THREE.Color("#e9eef2"),
    });

    const renderer = new SimpleRenderer(components, containerRef.current, {
      antialias: true,
      alpha: true,
    });
    renderer.mode = RendererMode.AUTO;
    world.scene = scene;
    world.renderer = renderer;

    // Important: assign renderer before camera so camera controls can attach to a renderer
    const camera = new SimpleCamera(components);
    world.camera = camera;
    world.defaultCamera = camera;
    camera.updateAspect();

    const grid = new SimpleGrid(components, world);
    grid.setup({ visible: true });

    const fragments = components.get(FragmentsManager);
    const workerUrl =
      typeof window !== "undefined"
        ? new URL("/fragments/worker.mjs", window.location.origin).toString()
        : "/fragments/worker.mjs";
    fragments.init(workerUrl);

    components.init();
    const res: ViewerResources = {
      components,
      fragments,
      worlds,
      scene,
      camera,
      renderer,
      grid,
      world,
    };

    const tick = () => {
      if (!resourcesRef.current) return;
      if (!res.fragmentsUpdating && res.fragments.initialized) {
        res.fragmentsUpdating = true;
        try {
          void res.fragments.core
            .update()
            .catch(() => undefined)
            .finally(() => {
              res.fragmentsUpdating = false;
            });
        } catch {
          res.fragmentsUpdating = false;
        }
      }
      res.animationId = requestAnimationFrame(tick);
    };
    res.animationId = requestAnimationFrame(tick);

    resourcesRef.current = res;

    return resourcesRef.current;
  };

  useEffect(() => {
    const hasSource = data.file || data.fileUrl || data.bytes || data.arrayBuffer;
    const hasFragments = !!toFragmentsBuffer(data);
    if (!hasSource && !hasFragments) {
      setViewerStatus("waiting");
      setError(undefined);
      return;
    }

    let cancelled = false;

    async function loadModel() {
      try {
        setViewerStatus("loading");
        setError(undefined);
        const resources = ensureResources();

        if (resources.model?.object) {
          resources.scene.three.remove(resources.model.object);
          void resources.model.dispose?.();
          resources.model = undefined;
        }

        const modelId = data.modelId || data.fileName || "ifc-model";

        // If we have a bounding box from upstream (e.g. IfcLoader node),
        // move the camera first so Fragments streaming requests geometry in view.
        if (data.boundingBox?.min?.length === 3 && data.boundingBox?.max?.length === 3) {
          const box = new THREE.Box3(
            new THREE.Vector3(data.boundingBox.min[0], data.boundingBox.min[1], data.boundingBox.min[2]),
            new THREE.Vector3(data.boundingBox.max[0], data.boundingBox.max[1], data.boundingBox.max[2])
          );
          if (!box.isEmpty()) {
            await focusCamera(resources.camera, box);
          }
        }

        let model: any;
        const fragmentsBuffer = toFragmentsBuffer(data);
        if (fragmentsBuffer) {
          model = await resources.fragments.core.load(fragmentsBuffer, {
            modelId,
            camera: resources.camera.three,
          });
        } else {
          await ensureWebIfcWasmPaths();
          const bytes = await toBytes(data);
          const { IfcImporter } = await import("@thatopen/fragments");
          const importer = new IfcImporter();
          importer.wasm.path =
            typeof window !== "undefined"
              ? new URL("/wasm/", window.location.origin).toString()
              : "/wasm/";
          importer.wasm.absolute = true;

          const fragmentsBytes = await importer.process({ bytes });
          model = await resources.fragments.core.load(fragmentsBytes, {
            modelId,
            camera: resources.camera.three,
          });
        }

        resources.model = model;
        resources.scene.three.add(model.object);
        // Track meshes for raycasting without assuming model.object is a Mesh.
        model.object.traverse((obj: THREE.Object3D) => {
          const asMesh = obj as THREE.Mesh;
          if ((asMesh as any).isMesh) resources.world.meshes.add(asMesh);
        });

        // Keep updating until at least some geometry is present in the scene graph.
        for (let i = 0; i < 20; i++) {
          await resources.fragments.core.update(true);
          const objectBox = new THREE.Box3().setFromObject(model.object);
          if (!objectBox.isEmpty()) {
            await focusCamera(resources.camera, objectBox);
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 50));
        }

        // Final camera focus if model.box is available
        if (model.box && !model.box.isEmpty?.()) {
          await focusCamera(resources.camera, model.box);
        }

        if (!cancelled) {
          setViewerStatus("ready");
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : String(err);
          setViewerStatus("error");
          setError(message);
          console.error("[3D Viewer] load error", err);
        }
      }
    }

    loadModel();

    return () => {
      cancelled = true;
    };
  }, [data.file, data.fileUrl, data.bytes, data.arrayBuffer, data.fragmentsBuffer, data.fileName, data.modelId, data.boundingBox]);

  const resolvedFileName =
    data.fileName ||
    (nodeState?.output as any)?.fileName ||
    (data.fileUrl ? data.fileUrl.split("/").pop() : undefined);

  return (
    <div
      className={cn(
        "group relative h-full w-full min-w-[420px] min-h-[360px] rounded-2xl border border-[var(--workflow-border)] bg-[var(--workflow-panel)] shadow-[0_12px_30px_var(--workflow-shadow)] transition-all flex flex-col",
        selected
          ? "border-teal-300 ring-2 ring-teal-200/70"
          : "hover:border-teal-200",
        statusClasses[viewerStatus]
      )}
    >
      <NodeResizer
        minWidth={420}
        minHeight={360}
        isVisible={selected}
        lineClassName="!border-teal-300"
        handleClassName="!w-2.5 !h-2.5 !bg-teal-500 !border-teal-200 !rounded-full"
      />

      <NodeCloseButton nodeId={id} variant="cyan" />
      <NodeExecutionBadge status={executionStatus} duration={nodeState?.duration} />

      <Handle
        type="target"
        position={Position.Left}
        id="file"
        className="!w-3.5 !h-3.5 !bg-teal-500 !border-[3px] !border-teal-200 hover:!scale-110 transition-transform !rounded-full"
        style={{ left: -8, top: "50%" }}
      />

      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!w-3.5 !h-3.5 !bg-emerald-500 !border-[3px] !border-emerald-200 hover:!scale-110 transition-transform !rounded-full"
        style={{ right: -8, top: "50%" }}
      />

      <header className="px-4 py-3 flex items-center gap-2.5 bg-[var(--workflow-panel-strong)] border-b border-[var(--workflow-border)]">
        <div className="p-1.5 bg-teal-500/10 rounded-2xl border border-teal-200">
          <Box className="w-4 h-4 text-teal-700" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-[var(--workflow-ink)]">{data.label || "3D Viewer"}</span>
          <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--workflow-muted)]">
            IFC · Fragments
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2 rounded-full border border-[var(--workflow-border)] bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--workflow-ink)]">
          <Loader2
            className={cn(
              "h-3.5 w-3.5",
              viewerStatus === "loading" ? "animate-spin" : "opacity-60"
            )}
          />
          <span>
            {viewerStatus === "waiting" && "Waiting"}
            {viewerStatus === "loading" && "Loading"}
            {viewerStatus === "ready" && "Ready"}
            {viewerStatus === "error" && "Error"}
          </span>
        </div>
      </header>

      <div className="flex-1 flex flex-col">
        <div className="px-4 py-3 border-b border-[var(--workflow-border)] flex items-center justify-between text-sm text-[var(--workflow-ink)]">
          <div className="flex items-center gap-2">
            <Box className="h-4 w-4 text-teal-700" />
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--workflow-muted)]">File</span>
              <span className="font-semibold text-[var(--workflow-ink)]">
                {resolvedFileName || "No file selected"}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              const res = resourcesRef.current;
              if (res?.model?.object) {
                res.scene.three.remove(res.model.object);
                res.model.dispose?.();
                res.model = undefined;
              }
              setViewerStatus("waiting");
              setError(undefined);
            }}
            className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.16em] text-teal-700 hover:text-teal-600 transition"
          >
            <RefreshCw className="h-3 w-3" />
            Reset
          </button>
        </div>

        <div className="relative flex-1">
          <div
            ref={containerRef}
            className="absolute inset-0 rounded-b-2xl overflow-hidden bg-slate-100 nodrag nowheel"
            onPointerDown={stopPointerPropagation}
            onPointerMove={stopPointerPropagation}
            onPointerUp={stopPointerPropagation}
            onWheel={stopWheelPropagation}
          />

          {viewerStatus === "waiting" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--workflow-muted)] gap-2 pointer-events-none">
              <Box className="h-8 w-8 text-teal-500" />
              <p className="text-sm font-medium text-[var(--workflow-ink)]">Connect an IFC source to view the model</p>
            </div>
          )}

          {viewerStatus === "loading" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-teal-700 gap-2 bg-white/60 backdrop-blur-sm pointer-events-none">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-sm">Loading IFC fragments…</p>
            </div>
          )}

          {viewerStatus === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-rose-700 gap-2 bg-white/70 backdrop-blur-sm px-6 text-center pointer-events-none">
              <AlertCircle className="h-6 w-6" />
              <p className="text-sm font-semibold">Failed to load IFC</p>
              {error && <p className="text-xs text-rose-600/80">{error}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

Viewer3DNode.displayName = "Viewer3DNode";

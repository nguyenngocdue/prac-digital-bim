"use client";

import { Handle, Position, NodeResizer } from "@xyflow/react";
import { memo, useEffect, useRef, useState } from "react";
import { Box, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import * as THREE from "three";
import {
  Components,
  FragmentsManager,
  IfcLoader,
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
  file?: File;
  bytes?: Uint8Array;
  arrayBuffer?: ArrayBuffer;
  meta?: Record<string, unknown>;
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
  animation?: number;
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
  threeCam.position.copy(newPos);
  threeCam.lookAt(center);
  threeCam.updateProjectionMatrix();

  camera.controls.setLookAt(newPos.x, newPos.y, newPos.z, center.x, center.y, center.z, true);
}

export const Viewer3DNode = memo(({ id, data, selected }: { id: string; data: Viewer3DNodeData; selected: boolean }) => {
  const { getNodeStatus, executionState } = useWorkflow();
  const executionStatus = getNodeStatus(id);
  const nodeState = executionState.nodeStates[id];

  const containerRef = useRef<HTMLDivElement>(null);
  const resourcesRef = useRef<ViewerResources | null>(null);
  const [viewerStatus, setViewerStatus] = useState<ViewerStatus>(data.status || "waiting");
  const [error, setError] = useState<string | undefined>(undefined);

  const statusClasses: Record<ViewerStatus, string> = {
    waiting: "border-cyan-500/50 from-slate-950/60 to-slate-900/30",
    loading: "border-blue-500/60 from-blue-950/50 to-slate-900/40 animate-pulse",
    ready: "border-emerald-500/60 from-emerald-950/40 to-slate-900/30",
    error: "border-rose-500/70 from-rose-950/50 to-slate-900/40",
  };

  useEffect(() => {
    return () => {
      const res = resourcesRef.current;
      resourcesRef.current = null;
      if (res) {
        try {
          if (res.animation !== undefined) {
            cancelAnimationFrame(res.animation);
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
      backgroundColor: new THREE.Color("#0b1220"),
    });

    const camera = new SimpleCamera(components);
    const renderer = new SimpleRenderer(components, containerRef.current, {
      antialias: true,
      alpha: true,
    });
    renderer.mode = RendererMode.AUTO;
    renderer.resize();
    camera.updateAspect();

    // Important: assign renderer before camera so camera controls attach to a renderer
    world.scene = scene;
    world.renderer = renderer;
    renderer.currentWorld = world;
    world.camera = camera;
    camera.currentWorld = world;
    world.defaultCamera = camera;

    const grid = new SimpleGrid(components, world);
    grid.setup({ visible: true });

    const fragments = components.get(FragmentsManager);
    const workerUrl =
      typeof window !== "undefined"
        ? new URL("/fragments/worker.mjs", window.location.origin).toString()
        : "/fragments/worker.mjs";
    fragments.init(workerUrl);

    components.init();

    let res: ViewerResources;
    const tickFragments = async () => {
      if (!res || res.fragmentsUpdating) return;
      res.fragmentsUpdating = true;
      try {
        await res.fragments.core.update();
      } finally {
        res.fragmentsUpdating = false;
      }
    };
    const animate = () => {
      if (!res) return;
      res.renderer.needsUpdate = true;
      res.worlds.update();
      void tickFragments();
      res.animation = requestAnimationFrame(animate);
    };
    res = {
      components,
      fragments,
      worlds,
      scene,
      camera,
      renderer,
      grid,
      world,
    };
    res.animation = requestAnimationFrame(animate);

    resourcesRef.current = res;

    return resourcesRef.current;
  };

  useEffect(() => {
    const hasSource = data.file || data.fileUrl || data.bytes || data.arrayBuffer;
    if (!hasSource) {
      setViewerStatus("waiting");
      setError(undefined);
      return;
    }

    let cancelled = false;

    async function loadModel() {
      try {
        setViewerStatus("loading");
        setError(undefined);
        await ensureWebIfcWasmPaths();
        const resources = ensureResources();

        if (resources.model?.object) {
          resources.scene.three.remove(resources.model.object);
          resources.model.dispose?.();
          resources.model = undefined;
        }

        const bytes = await toBytes(data);
        const ifcLoader = resources.components.get(IfcLoader);
        await ifcLoader.setup({
          autoSetWasm: false,
          wasm: {
            path:
              typeof window !== "undefined"
                ? new URL("/wasm/", window.location.origin).toString()
                : "/wasm/",
            absolute: true,
          },
        });

        const modelName = data.fileName || "ifc-model";
        const model = await ifcLoader.load(bytes, true, modelName);

        resources.model = model;
        resources.scene.three.add(model.object);
        resources.world.meshes.add(model.object as THREE.Mesh);

        try {
          await resources.fragments.core.update(true);
        } catch {
          // ignore
        }

        if (model.box) {
          await focusCamera(resources.camera, model.box);
        }

        resources.renderer.needsUpdate = true;
        resources.worlds.update();

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
  }, [data.file, data.fileUrl, data.bytes, data.arrayBuffer, data.fileName]);

  const resolvedFileName =
    data.fileName ||
    (nodeState?.output as any)?.fileName ||
    (data.fileUrl ? data.fileUrl.split("/").pop() : undefined);

  return (
    <div
      className={cn(
        "group relative h-full w-full min-w-[420px] min-h-[360px] rounded-xl border-2 bg-gradient-to-br shadow-lg transition-all flex flex-col",
        selected
          ? "border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.3)]"
          : "border-cyan-500/50 hover:border-cyan-400/70",
        statusClasses[viewerStatus]
      )}
    >
      <NodeResizer
        minWidth={420}
        minHeight={360}
        isVisible={selected}
        lineClassName="!border-cyan-400"
        handleClassName="!w-2.5 !h-2.5 !bg-cyan-400 !border-cyan-600 !rounded-full"
      />

      <NodeCloseButton nodeId={id} variant="cyan" />
      <NodeExecutionBadge status={executionStatus} duration={nodeState?.duration} />

      <Handle
        type="target"
        position={Position.Left}
        id="file"
        className="!w-3.5 !h-3.5 !bg-cyan-400 !border-[3px] !border-cyan-700 hover:!scale-110 transition-transform !rounded-full"
        style={{ left: -8, top: "50%" }}
      />

      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!w-3.5 !h-3.5 !bg-emerald-400 !border-[3px] !border-emerald-700 hover:!scale-110 transition-transform !rounded-full"
        style={{ right: -8, top: "50%" }}
      />

      <header className="px-4 py-3 flex items-center gap-2.5 bg-gradient-to-r from-cyan-600/20 to-cyan-500/10 border-b border-cyan-500/30">
        <div className="p-1.5 bg-cyan-500/20 rounded-lg">
          <Box className="w-4 h-4 text-cyan-300" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-cyan-100">{data.label || "3D Viewer"}</span>
          <span className="text-[11px] uppercase tracking-[0.08em] text-cyan-400/80">
            IFC · Fragments
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-white/80 border border-white/10">
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
        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between text-sm text-white/80">
          <div className="flex items-center gap-2">
            <Box className="h-4 w-4 text-cyan-300" />
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-[0.08em] text-cyan-200">File</span>
              <span className="font-semibold text-white">
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
            className="flex items-center gap-1 text-xs text-cyan-300 hover:text-cyan-100 transition"
          >
            <RefreshCw className="h-3 w-3" />
            Reset
          </button>
        </div>

        <div className="relative flex-1">
          <div ref={containerRef} className="absolute inset-0 rounded-b-xl overflow-hidden bg-[#0b1220]" />

          {viewerStatus === "waiting" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 gap-2 pointer-events-none">
              <Box className="h-8 w-8 text-cyan-400" />
              <p className="text-sm">Connect an IFC source to view the model</p>
            </div>
          )}

          {viewerStatus === "loading" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-cyan-200 gap-2 bg-black/30 backdrop-blur-sm">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-sm">Loading IFC fragments…</p>
            </div>
          )}

          {viewerStatus === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-rose-200 gap-2 bg-black/50 backdrop-blur-sm px-6 text-center">
              <AlertCircle className="h-6 w-6" />
              <p className="text-sm font-semibold">Failed to load IFC</p>
              {error && <p className="text-xs text-rose-100/80">{error}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

Viewer3DNode.displayName = "Viewer3DNode";

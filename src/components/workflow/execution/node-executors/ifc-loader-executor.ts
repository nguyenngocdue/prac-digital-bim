import type { NodeExecutor, NodeExecutionContext } from "../types";

type NormalizedIfcInput = {
  fileName?: string;
  fileUrl?: string;
  file?: File;
  arrayBuffer?: ArrayBuffer;
  bytes?: Uint8Array;
};

function normalizeIfcInput(
  inputs: Record<string, unknown>,
  nodeData: Record<string, unknown> | null
): NormalizedIfcInput | null {
  const candidates = [
    inputs?.file,
    inputs?.input,
    inputs?.ifc,
    inputs?.output,
    inputs?.model,
    nodeData,
  ].filter(Boolean);

  if (candidates.length === 0) return null;

  const raw = (candidates[0] as Record<string, any>) || {};
  const base = (raw?.output as Record<string, any>) ?? (raw?.data as Record<string, any>) ?? raw;
  const file = (base?.file as any) ?? (base?.payload as any) ?? base;
  const blob = (base?.blob as any) ?? file;

  return {
    fileName: base?.fileName ?? blob?.name ?? file?.name ?? base?.label,
    fileUrl: base?.fileUrl ?? blob?.url ?? file?.url ?? file?.href,
    file: blob instanceof File ? blob : file instanceof File ? file : undefined,
    arrayBuffer: blob instanceof ArrayBuffer ? blob : file instanceof ArrayBuffer ? file : undefined,
    bytes: blob instanceof Uint8Array ? blob : file instanceof Uint8Array ? file : undefined,
  };
}

async function toIfcBytes(source: NormalizedIfcInput): Promise<Uint8Array> {
  if (source.bytes) return source.bytes;
  if (source.arrayBuffer) return new Uint8Array(source.arrayBuffer);

  if (source.file instanceof File) {
    const buffer = await source.file.arrayBuffer();
    return new Uint8Array(buffer);
  }

  if (source.fileUrl) {
    const response = await fetch(source.fileUrl);
    if (!response.ok) {
      throw new Error(`Unable to fetch IFC file: ${response.status} ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  }

  throw new Error("No IFC data found for IfcLoader");
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

export const ifcLoaderExecutor: NodeExecutor = async (
  context: NodeExecutionContext
) => {
  const { node, inputs, updateNodeData } = context;
  const normalizedInput = normalizeIfcInput(inputs as Record<string, unknown>, node.data || null);

  if (!normalizedInput) {
    updateNodeData?.(node.id, { status: "error", error: "No IFC file to load" });
    return {
      success: false,
      error: "No IFC file to load",
    };
  }

  updateNodeData?.(node.id, {
    status: "loading",
    error: undefined,
  });

  let components: any | undefined;

  try {
    await ensureWebIfcWasmPaths();
    const [{ Components, IfcLoader, FragmentsManager }] = await Promise.all([
      import("@thatopen/components"),
    ]);

    components = new Components();
    components.init();
    const fragments = components.get(FragmentsManager);
    if (!fragments.initialized) {
      fragments.init("/fragments/worker.mjs");
    }
    const ifcLoader = components.get(IfcLoader);

    // Use local WASM assets to avoid network dependency.
    const wasmPath =
      typeof window !== "undefined"
        ? new URL("/wasm/", window.location.origin).toString()
        : "/wasm/";

    await ifcLoader.setup({
      autoSetWasm: false,
      wasm: {
        path: wasmPath,
        absolute: true,
      },
    });

    const fileBytes = await toIfcBytes(normalizedInput);
    const modelName =
      normalizedInput.fileName ||
      (node.data as Record<string, any> | undefined)?.label ||
      `ifc-${node.id}`;

    const model = await ifcLoader.load(fileBytes, true, modelName);

    // Export a fragments buffer so downstream nodes (e.g. 3D Viewer) can render
    // without re-running IFC -> Fragments conversion and without web-ifc WASM.
    const fragmentsBuffer = await model.getBuffer(false);

    let itemsWithGeometry: number | undefined;
    try {
      const ids = await model.getItemsIdsWithGeometry();
      itemsWithGeometry = Array.isArray(ids) ? ids.length : undefined;
    } catch {
      itemsWithGeometry = undefined;
    }

    const boundingBox = model.box
      ? {
        min: model.box.min.toArray(),
        max: model.box.max.toArray(),
      }
      : undefined;

    const fragmentsCount =
      typeof (model as any)?.tiles?.size === "number"
        ? (model as any).tiles.size
        : Array.isArray((model as any)?.tiles)
          ? (model as any).tiles.length
          : undefined;

    const output = {
      success: true,
      fileName: modelName,
      modelId: model.modelId,
      fragmentsBuffer,
      fragmentsCount,
      itemsWithGeometry,
      boundingBox,
      loadedAt: new Date().toISOString(),
      fileUrl: normalizedInput.fileUrl,
      file: normalizedInput.file,
      bytes: fileBytes,
    };

    updateNodeData?.(node.id, {
      status: "ready",
      fileName: modelName,
      modelId: model.modelId,
      fragmentsBuffer,
      fragmentsCount,
      itemsWithGeometry,
      boundingBox,
      lastLoadedAt: output.loadedAt,
      fileUrl: normalizedInput.fileUrl,
      file: normalizedInput.file,
      bytes: fileBytes,
    });

    return output;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    updateNodeData?.(node.id, { status: "error", error: message });
    throw error;
  } finally {
    components?.dispose?.();
  }
};

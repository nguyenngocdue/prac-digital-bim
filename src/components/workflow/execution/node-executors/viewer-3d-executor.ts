import type { NodeExecutor, NodeExecutionContext } from "../types";

type NormalizedFile = {
  fileName?: string;
  modelId?: string;
  fileUrl?: string;
  file?: File;
  arrayBuffer?: ArrayBuffer;
  bytes?: Uint8Array;
  fragmentsBuffer?: ArrayBuffer | Uint8Array;
  meta?: Record<string, unknown>;
  boundingBox?: { min: number[]; max: number[] };
};

function normalizeFile(raw: unknown): NormalizedFile {
  const data = (raw as Record<string, any>) || {};
  const candidate =
    (data?.output as Record<string, any>) ??
    (data?.data as Record<string, any>) ??
    data;

  const file =
    (candidate?.file as Record<string, any>) ??
    (candidate?.payload as Record<string, any>) ??
    candidate;
  const blob = (candidate?.blob as any) ?? file ?? candidate;
  const bytes =
    (candidate?.bytes as any) ??
    (candidate?.data?.bytes as any) ??
    (candidate?.output?.bytes as any);
  const arrayBuffer =
    (candidate?.arrayBuffer as any) ??
    (candidate?.data?.arrayBuffer as any) ??
    (candidate?.output?.arrayBuffer as any);
  const fragmentsBuffer =
    (candidate?.fragmentsBuffer as any) ??
    (candidate?.fragments as any) ??
    (candidate?.data?.fragmentsBuffer as any) ??
    (candidate?.output?.fragmentsBuffer as any);
  const boundingBox =
    (candidate?.boundingBox as any) ??
    (candidate?.output?.boundingBox as any) ??
    (candidate?.data?.boundingBox as any);

  return {
    fileName: candidate?.fileName ?? blob?.name ?? file?.name ?? candidate?.label,
    modelId: candidate?.modelId,
    fileUrl: candidate?.fileUrl ?? blob?.url ?? file?.url ?? file?.href,
    file: blob instanceof File ? blob : file instanceof File ? file : undefined,
    arrayBuffer:
      arrayBuffer instanceof ArrayBuffer
        ? arrayBuffer
        : blob instanceof ArrayBuffer
          ? blob
          : file instanceof ArrayBuffer
            ? file
            : undefined,
    bytes:
      bytes instanceof Uint8Array
        ? bytes
        : blob instanceof Uint8Array
          ? blob
          : file instanceof Uint8Array
            ? file
            : undefined,
    fragmentsBuffer:
      fragmentsBuffer instanceof ArrayBuffer || fragmentsBuffer instanceof Uint8Array
        ? fragmentsBuffer
        : undefined,
    meta: candidate?.metadata ?? candidate?.meta,
    boundingBox:
      boundingBox &&
      Array.isArray(boundingBox.min) &&
      Array.isArray(boundingBox.max)
        ? { min: boundingBox.min, max: boundingBox.max }
        : undefined,
  };
}

export const viewer3DExecutor: NodeExecutor = async (
  context: NodeExecutionContext
) => {
  const { node, inputs, updateNodeData } = context;

  const typedInputs = inputs as Record<string, any>;
  const fileInput =
    typedInputs?.file ??
    typedInputs?.model ??
    typedInputs?.output ??
    typedInputs?.input;

  const fileData = normalizeFile(fileInput);

  if (
    fileData.fragmentsBuffer ||
    fileData.fileUrl ||
    fileData.file ||
    fileData.bytes ||
    fileData.arrayBuffer
  ) {
    updateNodeData?.(node.id, {
      fileName: fileData.fileName,
      modelId: fileData.modelId,
      fileUrl: fileData.fileUrl,
      file: fileData.file,
      bytes: fileData.bytes,
      arrayBuffer: fileData.arrayBuffer,
      fragmentsBuffer: fileData.fragmentsBuffer,
      meta: fileData.meta,
      boundingBox: fileData.boundingBox,
    });

    return {
      success: true,
      ...fileData,
    };
  }

  updateNodeData?.(node.id, { fileUrl: undefined });

  return {
    success: false,
    error: "No IFC file provided to 3D Viewer",
    ...fileData,
  };
};

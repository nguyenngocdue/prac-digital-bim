import type { NodeExecutor, NodeExecutionContext } from "../types";

type NormalizedFile = {
  fileName?: string;
  fileUrl?: string;
  file?: File;
  arrayBuffer?: ArrayBuffer;
  bytes?: Uint8Array;
  meta?: Record<string, unknown>;
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

  return {
    fileName: candidate?.fileName ?? blob?.name ?? file?.name ?? candidate?.label,
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
    meta: candidate?.metadata ?? candidate?.meta,
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

  if (fileData.fileUrl || fileData.file || fileData.bytes || fileData.arrayBuffer) {
    updateNodeData?.(node.id, {
      fileName: fileData.fileName,
      fileUrl: fileData.fileUrl,
      file: fileData.file,
      bytes: fileData.bytes,
      arrayBuffer: fileData.arrayBuffer,
      meta: fileData.meta,
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

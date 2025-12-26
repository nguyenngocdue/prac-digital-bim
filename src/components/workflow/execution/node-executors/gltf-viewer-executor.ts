import type { NodeExecutor, NodeExecutionContext } from "../types";

type NormalizedFileData = {
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  fileUrl?: string;
};

function normalizeFileData(raw: unknown): NormalizedFileData {
  const data = (raw as Record<string, any>) || {};
  const candidate =
    (data?.output as Record<string, any>) ??
    (data?.data as Record<string, any>) ??
    data;

  const file =
    (candidate?.file as Record<string, any>) ??
    (candidate?.payload as Record<string, any>) ??
    candidate;

  return {
    fileName: candidate?.fileName ?? file?.name,
    fileSize: candidate?.fileSize ?? file?.size,
    fileType: candidate?.fileType ?? file?.type,
    fileUrl: candidate?.fileUrl ?? file?.url,
  };
}

export const gltfViewerExecutor: NodeExecutor = async (
  context: NodeExecutionContext
) => {
  const { node, inputs, updateNodeData } = context;
  const typedInputs = inputs as Record<string, any>;
  const fileInput =
    typedInputs?.file ??
    typedInputs?.input ??
    typedInputs?.output ??
    typedInputs?.model;
  const fileData = normalizeFileData(fileInput);

  console.log("[gltf-viewer executor] inputs:", typedInputs);
  console.log("[gltf-viewer executor] normalized file data:", fileData);

  if (fileData.fileUrl) {
    updateNodeData?.(node.id, {
      fileUrl: fileData.fileUrl,
      fileName: fileData.fileName,
      fileType: fileData.fileType,
      fileSize: fileData.fileSize,
    });

    return {
      success: true,
      ...fileData,
    };
  }

  updateNodeData?.(node.id, {
    fileUrl: undefined,
  });

  return {
    success: false,
    error: "No GLTF/GLB file provided to viewer (missing fileUrl)",
    ...fileData,
  };
};

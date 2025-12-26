import type { NodeExecutor, NodeExecutionContext } from "../types";

export const fileUploadExecutor: NodeExecutor = async (
  context: NodeExecutionContext
) => {
  const { node, updateNodeData } = context;
  const { fileName, fileSize, fileType, fileUrl } = (node.data || {}) as {
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    fileUrl?: string;
  };

  if (!fileName) {
    return {
      success: false,
      error: "No file uploaded",
    };
  }

  const result = {
    success: true,
    output: {
      fileName,
      fileSize: fileSize ?? null,
      fileType: fileType ?? "unknown",
      fileUrl: fileUrl ?? null,
      file: {
        name: fileName,
        size: fileSize,
        type: fileType,
        url: fileUrl,
      },
    },
  };

  // Keep node data in sync for viewer nodes
  updateNodeData?.(node.id, { fileName, fileSize, fileType, fileUrl });

  return result;
};

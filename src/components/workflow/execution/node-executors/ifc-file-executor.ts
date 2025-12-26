import type { NodeExecutor, NodeExecutionContext } from "../types";

// ============================================================================
// IFC File Node Executor
// ============================================================================

export const ifcFileExecutor: NodeExecutor = async (
  context: NodeExecutionContext
) => {
  const { node } = context;
  const files = (node.data?.files as unknown[]) || [];
  const fileName = (node.data?.fileName as string) || "";

  console.log(`[IFCFileNode ${node.id}] Executing...`);
  console.log(`[IFCFileNode ${node.id}] Files:`, files);

  // Simulate file loading
  await new Promise((resolve) => setTimeout(resolve, 500));

  // TODO: Thực sự parse IFC file
  // const response = await fetch("/api/parse/ifc", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ files }),
  // });
  // return response.json();

  // Mock output
  return {
    success: true,
    fileName,
    fileCount: files.length,
    metadata: {
      type: "IFC",
      parsed: true,
    },
    timestamp: new Date().toISOString(),
  };
};

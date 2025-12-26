import type { NodeExecutor, NodeExecutionContext } from "../types";

// ============================================================================
// Python Node Executor
// ============================================================================

export const pythonExecutor: NodeExecutor = async (
  context: NodeExecutionContext
) => {
  const { node, inputs } = context;
  const code = node.data?.code || "";

  console.log(`[PythonNode ${node.id}] Executing...`);
  console.log(`[PythonNode ${node.id}] Inputs:`, inputs);
  console.log(`[PythonNode ${node.id}] Code:`, code);

  // Simulate execution delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // TODO: Gọi API thực thi Python code
  // const response = await fetch("/api/execute/python", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ code, inputs }),
  // });
  // return response.json();

  // Mock output
  return {
    success: true,
    result: `Executed Python code with ${Object.keys(inputs).length} inputs`,
    code,
    timestamp: new Date().toISOString(),
  };
};

import type { NodeExecutor, NodeExecutionContext } from "../types";

// ============================================================================
// AI Chat Node Executor
// ============================================================================

export const aiChatExecutor: NodeExecutor = async (
  context: NodeExecutionContext
) => {
  const { node, inputs } = context;
  const messages = node.data?.messages || [];
  const model = node.data?.model || "gpt-4o-mini";

  console.log(`[AIChatNode ${node.id}] Executing...`);
  console.log(`[AIChatNode ${node.id}] Inputs:`, inputs);
  console.log(`[AIChatNode ${node.id}] Model:`, model);

  // Tạo prompt từ inputs
  const inputSummary = Object.entries(inputs)
    .map(([key, value]) => `Input from ${key}: ${JSON.stringify(value)}`)
    .join("\n");

  // Nếu có inputs từ node trước, tự động tạo message
  if (Object.keys(inputs).length > 0) {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Process this data:\n${inputSummary}`,
          history: messages,
          model,
        }),
      });

      const data = await response.json();

      return {
        success: true,
        response: data.response,
        model,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get AI response",
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Không có inputs -> return existing messages
  return {
    success: true,
    messages,
    model,
    timestamp: new Date().toISOString(),
  };
};

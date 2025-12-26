import type { NodeExecutor, NodeExecutionContext } from "../types";

export const getParameterExecutor: NodeExecutor = async (
  context: NodeExecutionContext
) => {
  const { node } = context;
  const { elementId, parameterName } = (node.data ||
    {}) as Record<string, unknown>;

  // In a real implementation, this would fetch from BIM model
  // For now, simulate parameter extraction
  const mockValue = `Value of ${String(parameterName)} for element ${String(elementId)}`;

  return {
    success: true,
    output: {
      elementId,
      parameterName,
      value: mockValue,
      dataType: "string",
    },
  };
};

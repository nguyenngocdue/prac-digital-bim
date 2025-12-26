import type { NodeExecutor, NodeExecutionContext } from "../types";

export const setParameterExecutor: NodeExecutor = async (
  context: NodeExecutionContext
) => {
  const { node, inputs } = context;
  const { elementId, parameterName, parameterValue } = (node.data ||
    {}) as Record<string, unknown>;

  const castInputs = inputs as Record<string, any>;
  const actualValue = castInputs?.value?.value ?? parameterValue;

  // In a real implementation, this would update the BIM model
  // For now, simulate parameter update
  console.log(`Setting ${parameterName} = ${actualValue} for element ${elementId}`);

  return {
    success: true,
    output: {
      elementId,
      parameterName,
      previousValue: null,
      newValue: actualValue,
      modified: true,
    },
  };
};

import type { NodeExecutor, NodeExecutionContext } from "../types";

export const numberInputExecutor: NodeExecutor = async (
  context: NodeExecutionContext
) => {
  const { node } = context;
  const value = (node.data as { value?: number }).value;

  return {
    success: true,
    output: {
      value: value !== undefined ? value : null,
      type: typeof value,
    },
  };
};

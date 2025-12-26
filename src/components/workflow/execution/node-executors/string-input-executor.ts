import type { NodeExecutor, NodeExecutionContext } from "../types";

export const stringInputExecutor: NodeExecutor = async (
  context: NodeExecutionContext
) => {
  const { node } = context;
  const value = ((node.data || {}) as { value?: string }).value || "";

  return {
    success: true,
    output: {
      value,
      length: value.length,
      wordCount: value.trim().split(/\s+/).filter(Boolean).length,
    },
  };
};

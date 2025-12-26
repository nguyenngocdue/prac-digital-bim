import type { NodeExecutor, NodeExecutionContext } from "../types";

type ConditionOperator =
  | "=="
  | "!="
  | ">"
  | "<"
  | ">="
  | "<="
  | "contains"
  | "startsWith"
  | "endsWith"
  | "isEmpty"
  | "exists";

function evaluateCondition(
  operator: ConditionOperator | undefined,
  actualInput: unknown,
  compareValue: unknown
): boolean {
  switch (operator) {
    case "==":
      return actualInput == compareValue;
    case "!=":
      return actualInput != compareValue;
    case ">":
      return Number(actualInput) > Number(compareValue);
    case "<":
      return Number(actualInput) < Number(compareValue);
    case ">=":
      return Number(actualInput) >= Number(compareValue);
    case "<=":
      return Number(actualInput) <= Number(compareValue);
    case "contains":
      return String(actualInput).includes(String(compareValue));
    case "startsWith":
      return String(actualInput).startsWith(String(compareValue));
    case "endsWith":
      return String(actualInput).endsWith(String(compareValue));
    case "isEmpty":
      return !actualInput || String(actualInput).trim() === "";
    case "exists":
      return actualInput !== undefined && actualInput !== null;
    default:
      return false;
  }
}

export const ifElseExecutor: NodeExecutor = async (
  context: NodeExecutionContext
) => {
  const { node, inputs } = context;
  const { operator, compareValue, inputValue } = (node.data ||
    {}) as Record<string, unknown> & { operator?: ConditionOperator };

  const typedInputs = inputs as Record<string, any>;
  const actualInput = typedInputs?.input?.value ?? inputValue;

  let result = false;

  try {
    result = evaluateCondition(operator, actualInput, compareValue);
  } catch {
    result = false;
  }

  return {
    success: true,
    output: {
      result,
      trueOutput: result ? actualInput : undefined,
      falseOutput: !result ? actualInput : undefined,
    },
    activeHandles: result ? ["true"] : ["false"],
  };
};

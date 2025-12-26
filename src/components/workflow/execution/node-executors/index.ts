import { workflowExecutor } from "../workflow-executor";
import { pythonExecutor } from "./python-executor";
import { aiChatExecutor } from "./ai-chat-executor";
import { ifcFileExecutor } from "./ifc-file-executor";
import { httpExecutor } from "./http-executor";

// ============================================================================
// Register All Executors
// ============================================================================

export function registerAllExecutors(): void {
  workflowExecutor.registerExecutor("python", pythonExecutor);
  workflowExecutor.registerExecutor("ai-chat", aiChatExecutor);
  workflowExecutor.registerExecutor("ifc-file", ifcFileExecutor);
  workflowExecutor.registerExecutor("http", httpExecutor);
}

// Export individual executors
export { pythonExecutor } from "./python-executor";
export { aiChatExecutor } from "./ai-chat-executor";
export { ifcFileExecutor } from "./ifc-file-executor";
export { httpExecutor } from "./http-executor";

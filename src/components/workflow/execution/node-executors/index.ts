import { workflowExecutor } from "../workflow-executor";
import { pythonExecutor } from "./python-executor";
import { aiChatExecutor } from "./ai-chat-executor";
import { ifcFileExecutor } from "./ifc-file-executor";
import { httpExecutor } from "./http-executor";
import { stringInputExecutor } from "./string-input-executor";
import { numberInputExecutor } from "./number-input-executor";
import { ifElseExecutor } from "./if-else-executor";
import { fileUploadExecutor } from "./file-upload-executor";
import { gltfViewerExecutor } from "./gltf-viewer-executor";
import { getParameterExecutor } from "./get-parameter-executor";
import { setParameterExecutor } from "./set-parameter-executor";
import { ifcLoaderExecutor } from "./ifc-loader-executor";
import { viewer3DExecutor } from "./viewer-3d-executor";

// ============================================================================
// Register All Executors
// ============================================================================

export function registerAllExecutors(): void {
  workflowExecutor.registerExecutor("python", pythonExecutor);
  workflowExecutor.registerExecutor("ai-chat", aiChatExecutor);
  workflowExecutor.registerExecutor("ifc-file", ifcFileExecutor);
  workflowExecutor.registerExecutor("http", httpExecutor);
  workflowExecutor.registerExecutor("string-input", stringInputExecutor);
  workflowExecutor.registerExecutor("number-input", numberInputExecutor);
  workflowExecutor.registerExecutor("if-else", ifElseExecutor);
  workflowExecutor.registerExecutor("file-upload", fileUploadExecutor);
  workflowExecutor.registerExecutor("gltf-viewer", gltfViewerExecutor);
  workflowExecutor.registerExecutor("get-parameter", getParameterExecutor);
  workflowExecutor.registerExecutor("set-parameter", setParameterExecutor);
  workflowExecutor.registerExecutor("ifc-loader", ifcLoaderExecutor);
  workflowExecutor.registerExecutor("3d-viewer", viewer3DExecutor);
}

// Export individual executors
export { pythonExecutor } from "./python-executor";
export { aiChatExecutor } from "./ai-chat-executor";
export { ifcFileExecutor } from "./ifc-file-executor";
export { httpExecutor } from "./http-executor";
export { stringInputExecutor } from "./string-input-executor";
export { numberInputExecutor } from "./number-input-executor";
export { ifElseExecutor } from "./if-else-executor";
export { fileUploadExecutor } from "./file-upload-executor";
export { gltfViewerExecutor } from "./gltf-viewer-executor";
export { getParameterExecutor } from "./get-parameter-executor";
export { setParameterExecutor } from "./set-parameter-executor";
export { ifcLoaderExecutor } from "./ifc-loader-executor";
export { viewer3DExecutor } from "./viewer-3d-executor";

"use client";

import { useWorkflow } from "./workflow-provider";
import { HttpPanel } from "./panels/http-panel";

/**
 * Node Settings Panel - Hiển thị panel cấu hình khi click vào node
 * Hiện tại chỉ hỗ trợ HTTP node
 */
export function NodeSettingsPanel() {
  const { selectedNode, setSelectedNode } = useWorkflow();

  // Chỉ hiển thị panel cho HTTP node
  if (!selectedNode || selectedNode.type !== "http") return null;

  const handleClose = () => {
    setSelectedNode(null);
  };

  return <HttpPanel nodeId={selectedNode.id} onClose={handleClose} />;
}

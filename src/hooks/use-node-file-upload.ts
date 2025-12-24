import { useState, useCallback } from "react";
import { useWorkflow } from "@/components/workflow/workflow-provider";

/**
 * Custom hook to handle file upload logic for workflow nodes
 */
export function useNodeFileUpload() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedNodeForUpload, setSelectedNodeForUpload] = useState<string | null>(null);
  const { updateNodeData } = useWorkflow();

  // Xử lý double click vào node
  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: any) => {
      // Chỉ xử lý cho IFC File node
      if (node.type === "ifc-file") {
        setSelectedNodeForUpload(node.id);
        setUploadDialogOpen(true);
      }
    },
    []
  );

  // Xử lý upload file
  const handleFileUpload = useCallback(
    (file: File) => {
      if (!selectedNodeForUpload) return;

      // Update node data với thông tin file
      updateNodeData(selectedNodeForUpload, {
        label: file.name,
        filePath: file.name,
        schema: "IFC2X3", // Có thể parse từ file thực tế
        elements: Math.floor(Math.random() * 500) + 100, // Random cho demo
      });

      setUploadDialogOpen(false);
      setSelectedNodeForUpload(null);
    },
    [selectedNodeForUpload, updateNodeData]
  );

  // Đóng dialog
  const closeUploadDialog = useCallback(() => {
    setUploadDialogOpen(false);
    setSelectedNodeForUpload(null);
  }, []);

  return {
    uploadDialogOpen,
    onNodeDoubleClick,
    handleFileUpload,
    closeUploadDialog,
  };
}

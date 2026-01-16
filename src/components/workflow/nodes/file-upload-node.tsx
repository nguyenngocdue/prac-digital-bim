"use client";

import { Handle, Position } from "@xyflow/react";
import { Upload, Check, X } from "lucide-react";
import { memo, useState } from "react";
import { NodeCloseButton } from "./node-close-button";
import { useWorkflow } from "../workflow-provider";

/**
 * File Upload Node - Node để upload nhiều loại file (GLTF, Revit, IFC)
 */

type FileType = "gltf" | "glb" | "rvt" | "rfa" | "ifc";

type FileUploadNodeProps = {
  id: string;
  data: {
    label?: string;
    fileName?: string;
    fileSize?: number;
    fileType?: FileType;
    fileUrl?: string;
    allowedTypes?: FileType[];
    file?: File;
  };
  selected?: boolean;
};

export const FileUploadNode = memo(({ id, data, selected }: FileUploadNodeProps) => {
  const { getNodeStatus, executionState, updateNodeData } = useWorkflow();
  const statusColors = {
    idle: "",
    pending: "ring-2 ring-amber-400/40",
    running: "ring-2 ring-sky-400/40 animate-pulse",
    success: "ring-2 ring-emerald-400/40",
    error: "ring-2 ring-rose-400/40",
    skipped: "opacity-70",
  };

  const fileTypeColors: Record<FileType, string> = {
    gltf: "text-emerald-700",
    glb: "text-emerald-700",
    rvt: "text-blue-700",
    rfa: "text-blue-700",
    ifc: "text-teal-700",
  };

  // Cast to known shapes to avoid "unknown" types from workflow state
  const executionStatus = getNodeStatus(id) as keyof typeof statusColors;
  const nodeState = executionState.nodeStates[id] as any;
  const [isDragging, setIsDragging] = useState(false);

  const allowedTypes = data.allowedTypes || ["gltf", "glb", "rvt", "rfa", "ifc"];
  const acceptString = allowedTypes.map(type => {
    switch(type) {
      case "gltf": return ".gltf";
      case "glb": return ".glb";
      case "rvt": return ".rvt";
      case "rfa": return ".rfa";
      case "ifc": return ".ifc";
      default: return "";
    }
  }).join(",");


  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const cleanupObjectUrl = () => {
    if (data.fileUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(data.fileUrl);
    }
  };

  const handleFileSelected = (file: File) => {
    const fileExt = file.name.split(".").pop()?.toLowerCase() as FileType | undefined;
    if (!fileExt || !allowedTypes.includes(fileExt)) {
      return;
    }

    cleanupObjectUrl();

    const fileUrl = URL.createObjectURL(file);
    updateNodeData(id, {
      fileName: file.name,
      fileSize: file.size,
      fileType: fileExt,
      fileUrl,
      file,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
  };

  const handleRemoveFile = () => {
    cleanupObjectUrl();
    updateNodeData(id, {
      fileName: undefined,
      fileSize: undefined,
      fileType: undefined,
      fileUrl: undefined,
      file: undefined,
    });
  };

  return (
    <div
      className={`group relative min-w-[280px] rounded-2xl border border-[var(--workflow-border)] bg-[var(--workflow-panel)] shadow-[0_12px_30px_var(--workflow-shadow)] transition-all ${
        selected
          ? "border-blue-400 ring-2 ring-blue-400/20"
          : "hover:border-blue-300"
      } ${statusColors[executionStatus]}`}
    >
      <NodeCloseButton nodeId={id} variant="cyan" />
      {/* <NodeExecutionBadge 
        status={executionStatus} 
        duration={nodeState?.duration} 
      /> */}

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="h-3! w-3! border-2! border-blue-200! bg-blue-500! hover:scale-125! transition-transform"
        style={{ right: -6 }}
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-blue-200 bg-blue-500/10 px-3 py-2">
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4 text-blue-600" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            {data.label || "File Upload"}
          </span>
        </div>
        {data.fileType && (
          <span className="text-lg" title={data.fileType.toUpperCase()}>
            {{
              gltf: "🎨",
              glb: "📦",
              rvt: "🏗️",
              rfa: "🔧",
              ifc: "🏢",
            }[data.fileType] || "📄"}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {!data.fileName ? (
          /* Upload Area */
          <div
            className={`relative rounded-2xl border-2 border-dashed transition-all ${
              isDragging
                ? "border-blue-400 bg-blue-500/10"
                : "border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] hover:border-blue-300"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id={`file-input-${id}`}
              accept={acceptString}
              onChange={handleFileChange}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            <label
              htmlFor={`file-input-${id}`}
              className="flex flex-col items-center justify-center py-8 cursor-pointer"
            >
              <Upload className={`h-8 w-8 mb-2 ${isDragging ? "text-blue-600" : "text-[var(--workflow-muted)]"}`} />
              <p className="text-xs text-[var(--workflow-ink)] text-center mb-1">
                Drag & drop or click to upload
              </p>
              <p className="text-[10px] text-[var(--workflow-muted)] text-center">
                Supported: {allowedTypes.map(t => t.toUpperCase()).join(", ")}
              </p>
            </label>
          </div>
        ) : (
          /* File Info */
          <div className="space-y-2">
            <div className="rounded-xl border border-[var(--workflow-border)] bg-white/80 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-medium mb-1 truncate ${
                    data.fileType ? fileTypeColors[data.fileType] : "text-blue-400"
                  }`}>
                    {data.fileName}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-[var(--workflow-muted)]">
                    <span>Size: {formatFileSize(data.fileSize)}</span>
                    {data.fileType && (
                      <span className="uppercase font-medium">
                        {data.fileType}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="rounded-full p-1 text-[var(--workflow-muted)] transition-colors hover:bg-rose-500/10 hover:text-rose-600"
                  title="Remove file"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* File Status */}
            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1 text-emerald-700 font-semibold uppercase tracking-[0.16em]">
                <Check className="h-3 w-3" />
                <span>File loaded</span>
              </div>
              <label
                htmlFor={`file-input-${id}`}
                className="text-blue-700 hover:text-blue-600 cursor-pointer transition-colors font-semibold uppercase tracking-[0.16em]"
              >
                Change file
              </label>
              <input
                type="file"
                id={`file-input-${id}`}
                accept={acceptString}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* Allowed Types Display */}
      <div className="mt-3 flex flex-wrap gap-1">
        {allowedTypes.map((type) => (
          <span
            key={type}
            className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] ${
              data.fileType === type
                ? "bg-blue-500 text-white"
                : "border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] text-[var(--workflow-muted)]"
            }`}
          >
            {type.toUpperCase()}
          </span>
        ))}
      </div>
      </div>

      {/* Footer */}
      {nodeState?.output && (
        <div className="border-t border-blue-200 bg-blue-500/5 px-3 py-1.5">
          <div className="text-[9px] text-[var(--workflow-muted)]">
            Output: <span className="text-blue-700 font-semibold uppercase tracking-[0.16em]">Ready</span>
          </div>
        </div>
      )}
    </div>
  );
});

FileUploadNode.displayName = "FileUploadNode";

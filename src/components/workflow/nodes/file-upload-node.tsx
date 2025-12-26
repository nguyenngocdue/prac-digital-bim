"use client";

import { Handle, Position } from "@xyflow/react";
import { Upload, Check, X } from "lucide-react";
import { memo, useState } from "react";
import { NodeCloseButton } from "./node-close-button";
import { NodeExecutionBadge } from "./node-execution-badge";
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
    allowedTypes?: FileType[];
  };
  selected?: boolean;
};

export const FileUploadNode = memo(({ id, data, selected }: FileUploadNodeProps) => {
  const { getNodeStatus, executionState, updateNodeData } = useWorkflow();
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

  const statusColors = {
    idle: "border-blue-500/50 from-blue-950/40 to-blue-950/20",
    pending: "border-yellow-500/50 from-yellow-950/40 to-yellow-950/20",
    running: "border-blue-500/50 from-blue-950/40 to-blue-950/20 animate-pulse",
    success: "border-green-500/50 from-green-950/40 to-green-950/20",
    error: "border-red-500/50 from-red-950/40 to-red-950/20",
    skipped: "border-zinc-500/50 from-zinc-950/40 to-zinc-950/20",
  };

  const fileTypeColors: Record<FileType, string> = {
    gltf: "text-green-400",
    glb: "text-green-500",
    rvt: "text-blue-400",
    rfa: "text-blue-500",
    ifc: "text-cyan-400",
  };


  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileExt = file.name.split('.').pop()?.toLowerCase() as FileType;
      updateNodeData(id, {
        fileName: file.name,
        fileSize: file.size,
        fileType: fileExt,
      });
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
      const fileExt = file.name.split('.').pop()?.toLowerCase() as FileType;
      if (allowedTypes.includes(fileExt)) {
        updateNodeData(id, {
          fileName: file.name,
          fileSize: file.size,
          fileType: fileExt,
        });
      }
    }
  };

  const handleRemoveFile = () => {
    updateNodeData(id, {
      fileName: undefined,
      fileSize: undefined,
      fileType: undefined,
    });
  };

  return (
    <div
      className={`group relative min-w-[280px] rounded-lg border bg-linear-to-b shadow-lg backdrop-blur-sm transition-all ${
        selected
          ? "border-blue-400 shadow-blue-500/50 ring-2 ring-blue-400/30"
          : statusColors[executionStatus]
      }`}
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
        className="h-3! w-3! border-2! border-blue-500! bg-blue-400! hover:scale-125! transition-transform"
        style={{ right: -6 }}
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-blue-500/30 bg-blue-500/10 px-3 py-2">
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-semibold text-blue-400">
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
            className={`relative rounded-lg border-2 border-dashed transition-all ${
              isDragging
                ? "border-blue-500 bg-blue-500/20"
                : "border-blue-700/30 bg-zinc-900/30 hover:border-blue-600/50 hover:bg-blue-900/10"
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
              <Upload className={`h-8 w-8 mb-2 ${isDragging ? "text-blue-400" : "text-zinc-500"}`} />
              <p className="text-xs text-zinc-400 text-center mb-1">
                Drag & drop or click to upload
              </p>
              <p className="text-[10px] text-zinc-600 text-center">
                Supported: {allowedTypes.map(t => t.toUpperCase()).join(", ")}
              </p>
            </label>
          </div>
        ) : (
          /* File Info */
          <div className="space-y-2">
            <div className="rounded-lg border border-blue-700/30 bg-zinc-900/80 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-medium mb-1 truncate ${
                    data.fileType ? fileTypeColors[data.fileType] : "text-blue-400"
                  }`}>
                    {data.fileName}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-zinc-500">
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
                  className="p-1 rounded hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-colors"
                  title="Remove file"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* File Status */}
            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1 text-emerald-400">
                <Check className="h-3 w-3" />
                <span>File loaded</span>
              </div>
              <label
                htmlFor={`file-input-${id}`}
                className="text-blue-400 hover:text-blue-300 cursor-pointer transition-colors"
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
              className={`px-2 py-0.5 text-[9px] font-medium rounded ${
                data.fileType === type
                  ? "bg-blue-500 text-white"
                  : "bg-zinc-800 text-zinc-500"
              }`}
            >
              {type.toUpperCase()}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      {nodeState?.output && (
        <div className="border-t border-blue-500/30 bg-blue-500/5 px-3 py-1.5">
          <div className="text-[9px] text-zinc-500">
            Output: <span className="text-blue-400 font-medium">Ready</span>
          </div>
        </div>
      )}
    </div>
  );
});

FileUploadNode.displayName = "FileUploadNode";

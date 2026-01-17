"use client";

import { Handle, Position } from "@xyflow/react";
import { AlertTriangle, Check, FileSpreadsheet, Upload, X } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { NodeCloseButton } from "./node-close-button";
import { useWorkflow } from "../workflow-provider";

type ExcelFileNodeProps = {
  id: string;
  data: {
    label?: string;
    fileName?: string;
    fileSize?: number;
    fileUrl?: string;
    file?: File;
  };
  selected?: boolean;
};

const ACCEPTED_EXTENSIONS = ["xlsx", "xls"] as const;
const ACCEPT_STRING = ACCEPTED_EXTENSIONS.map((extension) => `.${extension}`).join(",");

export const ExcelFileNode = memo(({ id, data, selected }: ExcelFileNodeProps) => {
  const { getNodeStatus, updateNodeData } = useWorkflow();
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const executionStatus = getNodeStatus(id) as keyof typeof statusColors;

  const cleanupObjectUrl = (url?: string) => {
    if (url?.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  };

  useEffect(() => {
    return () => {
      cleanupObjectUrl(data.fileUrl);
    };
  }, [data.fileUrl]);

  const fileExtension = data.fileName?.split(".").pop()?.toLowerCase();
  const isValidExtension =
    fileExtension &&
    ACCEPTED_EXTENSIONS.includes(fileExtension as (typeof ACCEPTED_EXTENSIONS)[number]);
  const displayExtension = isValidExtension ? fileExtension?.toUpperCase() : undefined;

  const handleFileSelected = (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !ACCEPTED_EXTENSIONS.includes(extension as (typeof ACCEPTED_EXTENSIONS)[number])) {
      setErrorMessage("Only .xlsx and .xls files are supported.");
      return;
    }

    setErrorMessage(null);
    cleanupObjectUrl(data.fileUrl);
    const fileUrl = URL.createObjectURL(file);
    updateNodeData(id, {
      fileName: file.name,
      fileSize: file.size,
      fileUrl,
      file,
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
    event.target.value = "";
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "copy";
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
  };

  const handleRemoveFile = () => {
    cleanupObjectUrl(data.fileUrl);
    setErrorMessage(null);
    updateNodeData(id, {
      fileName: undefined,
      fileSize: undefined,
      fileUrl: undefined,
      file: undefined,
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div
      className={`group relative min-w-[260px] rounded-2xl border border-[var(--workflow-border)] bg-[var(--workflow-panel)] shadow-[0_12px_30px_var(--workflow-shadow)] transition-all ${
        selected
          ? "border-emerald-400 ring-2 ring-emerald-400/20"
          : "hover:border-emerald-300"
      } ${statusColors[executionStatus]}`}
    >
      <NodeCloseButton nodeId={id} variant="emerald" />

      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="h-3! w-3! border-2! border-emerald-200! bg-emerald-500! hover:scale-125! transition-transform"
        style={{ right: -6 }}
      />

      <div className="flex items-center justify-between border-b border-emerald-200 bg-emerald-500/10 px-3 py-2">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-emerald-700" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            {data.label || "Excel File"}
          </span>
        </div>
        <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
          XLSX
        </span>
      </div>

      <div className="space-y-3 p-3">
        {!data.fileName ? (
          <div
            className={`relative rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-all ${
              isDragging
                ? "border-emerald-400 bg-emerald-500/10"
                : "border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] hover:border-emerald-300"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id={`excel-input-${id}`}
              accept={ACCEPT_STRING}
              onChange={handleFileChange}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            <label htmlFor={`excel-input-${id}`} className="cursor-pointer">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 bg-emerald-500/10">
                <Upload
                  className={`h-5 w-5 ${
                    isDragging ? "text-emerald-600" : "text-[var(--workflow-muted)]"
                  }`}
                />
              </div>
              <p className="text-xs font-semibold text-[var(--workflow-ink)]">
                Drop Excel file or click to upload
              </p>
              <p className="mt-1 text-[10px] text-[var(--workflow-muted)]">
                Supported: .xlsx, .xls
              </p>
              <div className="mt-3 flex items-center justify-center gap-2">
                {ACCEPTED_EXTENSIONS.map((extension) => (
                  <span
                    key={extension}
                    className="rounded-full border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--workflow-muted)]"
                  >
                    {extension.toUpperCase()}
                  </span>
                ))}
              </div>
            </label>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="rounded-xl border border-emerald-200 bg-white/80 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="rounded-lg border border-emerald-200 bg-emerald-500/10 p-2">
                    <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-xs font-semibold text-emerald-700">
                      {data.fileName}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-[var(--workflow-muted)]">
                      <span>Size: {formatFileSize(data.fileSize)}</span>
                      {displayExtension && (
                        <span className="rounded-full border border-emerald-200 bg-emerald-500/10 px-2 py-0.5 font-semibold uppercase tracking-[0.14em] text-emerald-700">
                          {displayExtension}
                        </span>
                      )}
                    </div>
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
            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1 font-semibold uppercase tracking-[0.16em] text-emerald-700">
                <Check className="h-3 w-3" />
                <span>File loaded</span>
              </div>
              <label
                htmlFor={`excel-input-${id}`}
                className="cursor-pointer font-semibold uppercase tracking-[0.16em] text-emerald-700 transition-colors hover:text-emerald-600"
              >
                Change file
              </label>
              <input
                type="file"
                id={`excel-input-${id}`}
                accept={ACCEPT_STRING}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        )}
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-500/10 px-2.5 py-2 text-[10px] font-medium text-rose-700">
            <AlertTriangle className="h-3 w-3" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
});

const statusColors = {
  idle: "",
  pending: "ring-2 ring-amber-400/40",
  running: "ring-2 ring-sky-400/40 animate-pulse",
  success: "ring-2 ring-emerald-400/40",
  error: "ring-2 ring-rose-400/40",
  skipped: "opacity-70",
};

ExcelFileNode.displayName = "ExcelFileNode";

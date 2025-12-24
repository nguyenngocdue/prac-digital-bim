"use client";

import { X } from "lucide-react";

type IFCUploadDialogProps = {
  open: boolean;
  onClose: () => void;
  onFileSelect: (file: File) => void;
};

export function IFCUploadDialog({ open, onClose, onFileSelect }: IFCUploadDialogProps) {
  if (!open) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-lg border border-blue-500/50 bg-zinc-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-200">Upload IFC File</h3>
          <button
            onClick={onClose}
            className="text-zinc-400 transition-colors hover:text-zinc-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Upload Area */}
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-blue-500/30 bg-blue-950/20 p-8 transition-colors hover:border-blue-500/50 hover:bg-blue-950/30">
            <input
              type="file"
              id="ifc-file-input"
              accept=".ifc"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="ifc-file-input"
              className="flex cursor-pointer flex-col items-center gap-3"
            >
              <div className="rounded-full bg-blue-500/20 p-4">
                <svg
                  className="h-8 w-8 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-zinc-200">
                  Click to upload or drag and drop
                </p>
                <p className="mt-1 text-xs text-zinc-500">IFC files only</p>
              </div>
            </label>
          </div>

          <button
            onClick={onClose}
            className="w-full rounded bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface GltfImportButtonProps {
  onFileSelect: (file: File) => void;
  onFolderSelect?: (files: FileList) => void;
  disabled?: boolean;
}

export const GltfImportButton = ({ onFileSelect, onFolderSelect, disabled = false }: GltfImportButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    // Prefer folder selection if callback exists
    if (onFolderSelect) {
      folderInputRef.current?.click();
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validExtensions = ['.gltf', '.glb'];
      const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
      
      if (validExtensions.includes(fileExtension)) {
        onFileSelect(file);
      } else {
        alert('Please select a valid GLTF/GLB file');
      }
    }
    // Reset input to allow selecting the same file again
    event.target.value = '';
  };

  const handleFolderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0 && onFolderSelect) {
      onFolderSelect(files);
    }
    event.target.value = '';
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".gltf,.glb"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <input
        ref={folderInputRef}
        type="file"
        // @ts-ignore - webkitdirectory is not in standard types
        webkitdirectory=""
        directory=""
        onChange={handleFolderChange}
        style={{ display: 'none' }}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={handleButtonClick}
        disabled={disabled}
        className="flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        <span>Import GLTF</span>
      </Button>
    </>
  );
};

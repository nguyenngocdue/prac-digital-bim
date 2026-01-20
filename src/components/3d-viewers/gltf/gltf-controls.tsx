"use client";

import { useState, useCallback } from "react";
import { GltfImportButton } from "./gltf-import-button";
import { createObjectUrl, revokeObjectUrl, createResourceMap } from "./use-gltf-model";

interface GltfControlsProps {
  onModelLoad: (url: string, resourceMap?: Map<string, string>) => void;
  className?: string;
}

export const GltfControls = ({ onModelLoad, className = "" }: GltfControlsProps) => {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [resourceMap, setResourceMap] = useState<Map<string, string>>();

  const handleFileSelect = useCallback((file: File) => {
    // Revoke previous URL to free memory
    if (currentUrl) {
      revokeObjectUrl(currentUrl);
    }

    // Create new object URL
    const url = createObjectUrl(file);
    setCurrentUrl(url);
    onModelLoad(url);

    console.log(`GLTF model loaded: ${file.name}`);
  }, [currentUrl, onModelLoad]);

  const handleFolderSelect = useCallback((files: FileList) => {
    // Revoke previous URLs
    if (currentUrl) {
      revokeObjectUrl(currentUrl);
    }
    resourceMap?.forEach(url => revokeObjectUrl(url));

    // Find GLTF file
    const gltfFile = Array.from(files).find(f => 
      f.name.toLowerCase().endsWith('.gltf') || 
      f.name.toLowerCase().endsWith('.glb')
    );

    if (!gltfFile) {
      alert('No GLTF/GLB file found in selected folder');
      return;
    }

    // Create resource map for all files
    const map = createResourceMap(files);
    setResourceMap(map);

    // Create URL for main GLTF file
    const url = createObjectUrl(gltfFile);
    setCurrentUrl(url);
    onModelLoad(url, map);

    console.log(`GLTF model loaded: ${gltfFile.name} with ${files.length} resources`);
  }, [currentUrl, resourceMap, onModelLoad]);

  return (
    <div className={`absolute top-6 left-6 z-50 ${className}`}>
      <div className="viewer-panel flex flex-col gap-2 rounded-xl p-3 shadow-lg">
        <GltfImportButton 
          onFileSelect={handleFileSelect}
          onFolderSelect={handleFolderSelect}
        />
        {currentUrl && (
          <div className="text-xs text-muted-foreground">
            Model loaded ✓
            {resourceMap && ` (${resourceMap.size} files)`}
          </div>
        )}
      </div>
    </div>
  );
};

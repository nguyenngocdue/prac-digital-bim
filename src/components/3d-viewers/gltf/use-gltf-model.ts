import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useEffect, useState } from 'react';
import * as THREE from 'three';

interface UseGltfModelProps {
  url: string | null;
  resourceMap?: Map<string, string>;
}

export const useGltfModel = ({ url, resourceMap }: UseGltfModelProps) => {
  const [modelUrl, setModelUrl] = useState<string | null>(url);
  const [error, setError] = useState<string | null>(null);
  
  // Load GLTF model with custom loader config
  const gltf = modelUrl ? useLoader(
    GLTFLoader, 
    modelUrl,
    (loader) => {
      // Setup custom loading manager to handle texture paths
      if (resourceMap && resourceMap.size > 0) {
        const manager = new THREE.LoadingManager();
        
        manager.setURLModifier((url) => {
          // Try to find matching resource in map
          console.log('Loading resource:', url);
          
          // Extract filename from URL
          const filename = url.split('/').pop() || url;
          const pathWithoutPrefix = url.replace(/^.*?textures\//, 'textures/');
          
          // Try multiple lookup strategies
          const mappedUrl = 
            resourceMap.get(url) ||           // Full path
            resourceMap.get(pathWithoutPrefix) || // Path without blob prefix
            resourceMap.get(filename) ||      // Just filename
            url;                              // Fallback to original
          
          if (mappedUrl !== url) {
            console.log(`✓ Resolved: ${filename} -> ${mappedUrl}`);
          } else {
            console.warn(`✗ Not found in map: ${url}`);
          }
          
          return mappedUrl;
        });
        
        // @ts-ignore
        loader.manager = manager;
      }
    }
  ) : null;

  useEffect(() => {
    setModelUrl(url);
    setError(null);
  }, [url]);

  return {
    scene: gltf?.scene,
    animations: gltf?.animations || [],
    error,
    isLoaded: !!gltf
  };
};

export const createObjectUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

export const revokeObjectUrl = (url: string) => {
  URL.revokeObjectURL(url);
};

export const createResourceMap = (files: FileList): Map<string, string> => {
  const map = new Map<string, string>();
  
  Array.from(files).forEach(file => {
    // Create blob URL for each file
    const url = URL.createObjectURL(file);
    
    // Store with relative path as key (remove leading path)
    const pathParts = file.webkitRelativePath.split('/');
    const relativePath = pathParts.slice(1).join('/'); // Remove first folder name
    
    map.set(relativePath, url);
    map.set(file.name, url); // Also store by filename only
    
    console.log(`Mapped: ${relativePath} -> ${url}`);
  });
  
  return map;
};

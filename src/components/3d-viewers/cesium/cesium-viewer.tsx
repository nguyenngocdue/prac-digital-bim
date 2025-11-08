"use client";

import { useEffect, useRef } from "react";
import * as Cesium from "cesium";

// Configure Cesium to use local assets
// Using Cesium's default token - you can replace this with your own from https://ion.cesium.com/
// Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjMWQ5NTE3Yi0zMGQ5LTRiMzYtOTA1Mi03MDdmN2UzOTE2NGIiLCJpZCI6MTkyNDEwLCJpYXQiOjE3MDY0MzA1NTB9.2_XZXj5j0Jq2_ZRdL9xs_1cO0mSwRNxgN6BQY5yca4g';
Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN || '';

// Set Cesium base URL for assets
if (typeof window !== "undefined") {
  (window as any).CESIUM_BASE_URL = "/cesium";
  
  // Configure buildModuleUrl to properly locate Cesium resources
  (Cesium as any).buildModuleUrl.setBaseUrl = (relativeUrl: string) => {
    return `/cesium/${relativeUrl}`;
  };
}

interface CesiumViewerProps {
  className?: string;
}

export const CesiumViewer = ({ className = "" }: CesiumViewerProps) => {
  const cesiumContainer = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);

  useEffect(() => {
    if (!cesiumContainer.current) return;

    // Initialize Cesium Viewer với các controls hữu ích
    const viewer = new Cesium.Viewer(cesiumContainer.current, {
      // Bật các chức năng hữu ích
      homeButton: true,              // Nút về vị trí ban đầu
      fullscreenButton: true,        // Nút fullscreen
      baseLayerPicker: true,         // Chọn loại bản đồ (Satellite, Streets, etc)
      sceneModePicker: true,         // Chuyển đổi 2D/3D/Columbus
      navigationHelpButton: true,    // Hướng dẫn điều khiển
      
      // Tắt các controls không cần thiết
      animation: false,
      timeline: false,
      geocoder: false,
      infoBox: false,
      selectionIndicator: false,
      
      // Hide Cesium logo and credits
      creditContainer: document.createElement('div'),
    });

    // Hide the credit display completely
    const creditContainer = viewer.cesiumWidget.creditContainer as HTMLElement;
    if (creditContainer) {
      creditContainer.style.display = 'none';
    }

    // Load terrain asynchronously
    Cesium.createWorldTerrainAsync().then((terrainProvider) => {
      viewer.terrainProvider = terrainProvider;
    });

    viewerRef.current = viewer;

    // Enable lighting
    viewer.scene.globe.enableLighting = true;

    // Set initial camera position (looking at Earth)
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(105.8342, 21.0278, 15000000), // Vietnam coordinates with high altitude
    });

    // Cleanup on unmount
    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={cesiumContainer}
      className={`w-full h-full ${className}`}
      style={{ position: "relative" }}
    />
  );
};

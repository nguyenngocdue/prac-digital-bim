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

    let viewer: Cesium.Viewer | null = null;

    // Async function to initialize viewer with 3D buildings
    const initializeViewer = async () => {
      if (!cesiumContainer.current) return;

      // Initialize Cesium Viewer
      viewer = new Cesium.Viewer(cesiumContainer.current, {
        homeButton: true,
        fullscreenButton: true,
        baseLayerPicker: true,
        sceneModePicker: true,
        navigationHelpButton: true,
        animation: false,
        timeline: false,
        geocoder: false,
        infoBox: false,
        selectionIndicator: false,
        creditContainer: document.createElement('div'),
      });

      // Hide the credit display
      const creditContainer = viewer.cesiumWidget.creditContainer as HTMLElement;
      if (creditContainer) {
        creditContainer.style.display = 'none';
      }

      viewerRef.current = viewer;

      // Load terrain asynchronously
      try {
        const terrainProvider = await Cesium.createWorldTerrainAsync();
        if (viewer && !viewer.isDestroyed()) {
          viewer.terrainProvider = terrainProvider;
        }
      } catch (error) {
        console.error('Error loading terrain:', error);
      }

      // Enable lighting
      if (viewer && !viewer.isDestroyed()) {
        viewer.scene.globe.enableLighting = true;
      }

      // ===== RENDER 3D THEO GOOGLE MAPS =====
      // Load 3D buildings
      try {
        console.log('Loading Google Photorealistic 3D Tiles...');
        
        const googleTileset = await Cesium.createGooglePhotorealistic3DTileset();
        if (viewer && !viewer.isDestroyed()) {
          viewer.scene.primitives.add(googleTileset);
          console.log('Google 3D Tiles added to scene');
        }
        
      } catch (error) {
        console.warn('Could not load Google 3D tiles, falling back to OSM Buildings');
        
        try {
          const osmBuildingsTileset = await Cesium.createOsmBuildingsAsync();
          if (viewer && !viewer.isDestroyed()) {
            viewer.scene.primitives.add(osmBuildingsTileset);
            
            osmBuildingsTileset.style = new Cesium.Cesium3DTileStyle({
              color: "color('white', 0.9)",
              show: true,
            });
            console.log('OSM Buildings loaded successfully');
          }
        } catch (osmError) {
          console.error('Error loading OSM Buildings:', osmError);
        }
      }

      // Set initial camera position - zoom vào TP HCM để thấy 3D buildings
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(106.6297, 10.8231, 500), // TP HCM, độ cao 500m (gần hơn để thấy rõ)
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-30), // Nhìn xuống 30 độ
          roll: 0.0,
        },
      });

      // Thêm khối box định vị tại TP Hồ Chí Minh
      // Tọa độ: 10.8231° N, 106.6297° E
      const hcmcPosition = Cesium.Cartesian3.fromDegrees(50, 10.8231, 50); // 50m độ cao
      
      // Tạo entity box
      viewer.entities.add({
        name: 'TP Hồ Chí Minh',
        position: hcmcPosition,
        // Khối box 3D
        box: {
          dimensions: new Cesium.Cartesian3(100.0, 100.0, 100.0), // Kích thước 100m x 100m x 100m
          material: Cesium.Color.RED.withAlpha(0.7),
          outline: true,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2.0,
        },
        // Label cho box
        label: {
          text: 'TP Hồ Chí Minh',
          font: '18px sans-serif',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -80), // Hiển thị label phía trên box
          disableDepthTestDistance: Number.POSITIVE_INFINITY, // Luôn hiển thị
        },
      });
    };

    // Call the async initialization
    initializeViewer();

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

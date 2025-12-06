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

    // Async function to initialize viewer with 3D buildings
    const initializeViewer = async () => {
      // Initialize Cesium Viewer với các controls hữu ích
      const viewer = new Cesium.Viewer(cesiumContainer.current!, {
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

      // ===== RENDER 3D THEO GOOGLE MAPS =====
      // Sử dụng Google Photorealistic 3D Tiles - đẹp hơn OSM Buildings
      try {
        console.log('🔄 Loading Google Photorealistic 3D Tiles...');
        
        // Sử dụng helper function của Cesium để load Google 3D
        const googleTileset = await Cesium.createGooglePhotorealistic3DTileset();
        viewer.scene.primitives.add(googleTileset);
        
        console.log('✅ Google 3D Tiles added to scene');
        console.log('📍 Tileset loaded. Zoom vào thành phố lớn để thấy 3D!');
        
      } catch (error: any) {
        console.error('❌ Error loading Google 3D tiles:', error?.message || error);
        console.log('🔄 Falling back to OSM Buildings...');
        
        try {
          // Fallback về OSM Buildings
          const osmBuildingsTileset = await Cesium.createOsmBuildingsAsync();
          viewer.scene.primitives.add(osmBuildingsTileset);
          
          osmBuildingsTileset.style = new Cesium.Cesium3DTileStyle({
            color: "color('white', 0.9)",
            show: true,
          });
          console.log('✅ OSM Buildings loaded and ready!');
        } catch (osmError: any) {
          console.error('❌ Error loading OSM Buildings:', osmError?.message || osmError);
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

      // Thêm mũi tên định vị tại TP Hồ Chí Minh
      // Tọa độ: 10.8231° N, 106.6297° E
      const hcmcPosition = Cesium.Cartesian3.fromDegrees(106.6297, 10.8231, 100); // 100m độ cao
      
      // Tạo entity mũi tên
      viewer.entities.add({
        name: 'TP Hồ Chí Minh',
        position: hcmcPosition,
        // Mũi tên 3D hướng lên trên
        model: {
          uri: '/cesium/Assets/Models/arrow.glb', // Nếu có model
          minimumPixelSize: 64,
          maximumScale: 20000,
        },
        // Hoặc dùng cylinder để tạo mũi tên đơn giản
        cylinder: {
          length: 200.0,
          topRadius: 0.0,
          bottomRadius: 30.0,
          material: Cesium.Color.RED.withAlpha(0.8),
          outline: true,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2.0,
        },
        // Label cho mũi tên
        label: {
          text: 'TP Hồ Chí Minh',
          font: '18px sans-serif',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -250), // Hiển thị label phía trên mũi tên
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

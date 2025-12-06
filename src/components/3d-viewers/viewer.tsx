"use client";
import { Canvas } from "@react-three/fiber";
import { useEffect, useState, useRef } from "react";
import { useBoxContext } from "../../app/contexts/box-context";
import Scene from "./scene";
import { CesiumViewer } from "./cesium/cesium-viewer";
import { CesiumControls } from "./cesium/cesium-controls";

interface ViewerProps {
  useCesium?: boolean;
}

const Viewer = ({  }: ViewerProps) => {
  const [accent, setAccent] = useState<string>("#06b6d4");
  const [mounted, setMounted] = useState(false);
  const [showCesium, setShowCesium] = useState(false);
  const { boxes, creationMode, setCreationMode, projectId } = useBoxContext();
  const canvasKey = useRef(`canvas-${projectId || 'default'}`).current;

  // Debug: Track component lifecycle
  useEffect(() => {
    console.log("🟢 Viewer MOUNTED");
    return () => {
      console.log("🔴 Viewer UNMOUNTED - This causes Context Lost!");
    };
  }, []);

  // Ensure client-side only rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Debug: log boxes when they change
  useEffect(() => {
    console.log("Viewer - boxes updated:", boxes.length, boxes);
  }, [boxes]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const cs = getComputedStyle(document.documentElement);
    const val = cs.getPropertyValue("--accent").trim();
    if (val) setAccent(val);

    // Listen for Escape key to exit creation mode
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && creationMode) {
        setCreationMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [creationMode, setCreationMode]);

  // Don't render canvas on server or before mounting
  if (!mounted) {
    return (
      <div className="w-full h-full bg-background/50 flex items-center justify-center">
        <div className="text-muted-foreground">Loading 3D viewer...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-background/50 relative">
      <Canvas 
        key={canvasKey}
        camera={{ position: [5, 5, 5], fov: 50 }}
        gl={{ 
          preserveDrawingBuffer: true,
          antialias: true,
          powerPreference: "high-performance"
        }}
      >
        <Scene boxes={boxes} accent={accent} />
      </Canvas>
      {showCesium && (
        <div className="absolute inset-0 z-10">
          <CesiumViewer className="w-full h-full" />
        </div>
      )}
      <CesiumControls 
        showCesium={showCesium}
        onToggle={() => setShowCesium(!showCesium)}
      />
    </div>
  );
}

export default Viewer;

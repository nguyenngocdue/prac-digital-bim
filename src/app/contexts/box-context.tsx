"use client";
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import type { BuildingShape } from "@/components/3d-viewers/standards/building-shapes";

export type Box = {
  id: string;
  position: [number, number, number];
  color?: string;
  size?: [number, number, number];
  type?: "box" | "building" | "room";
  rotationY?: number;
  footprint?: [number, number][];
  height?: number;
  thicknessRatio?: number;
  width?: number;
  depth?: number;
  showMeasurements?: boolean;
  vertices?: [number, number, number][];
  topFootprint?: [number, number][];
};

export type CreationTool = "box" | "building" | "room";
export type TransformMode = "translate" | "rotate" | "scale";

export type BuildingOptions = {
  shape: BuildingShape;
  width: number;
  depth: number;
  height: number;
  thicknessRatio: number;
  snapToGrid: boolean;
  gridSize: number;
  snapToObjects: boolean;
  snapDistance: number;
  allowVertical: boolean;
  drawingMode: boolean;
};

interface BoxContextType {
  boxes: Box[];
  setBoxes: React.Dispatch<React.SetStateAction<Box[]>>;
  creationMode: boolean;
  setCreationMode: (v: boolean) => void;
  creationTool: CreationTool;
  setCreationTool: (tool: CreationTool) => void;
  buildingOptions: BuildingOptions;
  setBuildingOptions: React.Dispatch<React.SetStateAction<BuildingOptions>>;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  transformMode: TransformMode;
  setTransformMode: (mode: TransformMode) => void;
  drawingPoints: [number, number, number][];
  setDrawingPoints: React.Dispatch<React.SetStateAction<[number, number, number][]>>;
  projectId?: string;
  createRoom: () => void;
  updateBoxVertices: (id: string, vertices: [number, number, number][]) => void;
}

const BoxContext = createContext<BoxContextType | undefined>(undefined);

export function useBoxContext() {
  const ctx = useContext(BoxContext);
  if (!ctx) throw new Error("useBoxContext must be used within BoxProvider");
  return ctx;
}

const getStorageKey = (projectId?: string) => projectId ? `boxes_${projectId}` : "boxes_default";

export const BoxProvider: React.FC<{ children: React.ReactNode; projectId?: string }> = ({ children, projectId }) => {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [creationMode, setCreationMode] = useState(false);
  const [creationTool, setCreationTool] = useState<CreationTool>("box");
  const [buildingOptions, setBuildingOptions] = useState<BuildingOptions>({
    shape: "rect",
    width: 6,
    depth: 4,
    height: 3,
    thicknessRatio: 0.3,
    snapToGrid: true,
    gridSize: 1,
    snapToObjects: true,
    snapDistance: 0.75,
    allowVertical: true,
    drawingMode: false,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [transformMode, setTransformMode] = useState<TransformMode>("translate");
  const [drawingPoints, setDrawingPoints] = useState<[number, number, number][]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const ensureDefaults = useCallback((items: Box[]): Box[] => {
    return items.map((box) => {
      if (box.id) return box;
      const id =
        typeof crypto !== "undefined" && (crypto as any).randomUUID
          ? (crypto as any).randomUUID()
          : Math.random().toString(36).slice(2, 10);
      return {
        ...box,
        id,
        type: box.type || "box",
      };
    });
  }, []);

  // Load boxes from localStorage on mount or when projectId changes
  useEffect(() => {
    console.log("BoxProvider - Loading boxes for projectId:", projectId);
    setIsLoading(true);
    
    // Use requestAnimationFrame to defer loading to avoid blocking render
    const frameId = requestAnimationFrame(() => {
      try {
        const storageKey = getStorageKey(projectId);
        const saved = localStorage.getItem(storageKey);
        console.log("BoxProvider - Storage key:", storageKey, "Saved data:", saved);
        if (saved) {
          const parsed = JSON.parse(saved) as Box[];
          const normalized = ensureDefaults(parsed);
          console.log("BoxProvider - Parsed boxes:", normalized);
          setBoxes(normalized);
        } else {
          console.log("BoxProvider - No saved boxes, setting empty array");
          setBoxes([]);
        }
      } catch (e) {
        console.error("Failed to load boxes:", e);
        setBoxes([]);
      } finally {
        setIsLoading(false);
      }
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [projectId]);

  // Save boxes to localStorage whenever they change
  useEffect(() => {
    if (isLoading) return; // Don't save during initial load
    if (boxes.length === 0 && !projectId) return; // Skip initial empty state
    
    // Debounce saves to avoid excessive writes
    const timeoutId = setTimeout(() => {
      try {
        const storageKey = getStorageKey(projectId);
        localStorage.setItem(storageKey, JSON.stringify(boxes));
        console.log("BoxProvider - Saved boxes:", boxes.length);
      } catch (e) {
        console.error("Failed to save boxes:", e);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [boxes, projectId, isLoading]);

  // Create room helper function
  const createRoom = useCallback(() => {
    setCreationMode(true);
    setCreationTool("room");
  }, [setCreationMode, setCreationTool]);

  // Update vertices for a box (used for polygon editing)
  const updateBoxVertices = useCallback((id: string, vertices: [number, number, number][]) => {
    setBoxes((prev) => {
      const updated = prev.map((box) => (box.id === id ? { ...box, vertices } : box));
      const storageKey = getStorageKey(projectId);
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  }, [projectId]);

  // Memoize setCreationMode to prevent unnecessary re-renders
  const handleSetCreationMode = useCallback((v: boolean) => {
    setCreationMode(v);
  }, []);

  const handleSetSelectedId = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  // Memoize context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(() => ({
    boxes,
    setBoxes,
    creationMode,
    setCreationMode: handleSetCreationMode,
    creationTool,
    setCreationTool,
    buildingOptions,
    setBuildingOptions,
    selectedId,
    setSelectedId: handleSetSelectedId,
    transformMode,
    setTransformMode,
    drawingPoints,
    setDrawingPoints,
    projectId,
    createRoom,
    updateBoxVertices
  }), [
    boxes,
    creationMode,
    creationTool,
    buildingOptions,
    selectedId,
    transformMode,
    drawingPoints,
    handleSetCreationMode,
    handleSetSelectedId,
    projectId,
    createRoom,
    updateBoxVertices
  ]);

  return (
    <BoxContext.Provider value={contextValue}>
      {children}
    </BoxContext.Provider>
  );
};

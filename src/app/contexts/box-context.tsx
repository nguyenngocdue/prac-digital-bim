"use client";
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";

export type Box = { position: [number, number, number], color?: string };

interface BoxContextType {
  boxes: Box[];
  setBoxes: React.Dispatch<React.SetStateAction<Box[]>>;
  creationMode: boolean;
  setCreationMode: (v: boolean) => void;
  projectId?: string;
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
  const [isLoading, setIsLoading] = useState(true);

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
          const parsed = JSON.parse(saved);
          console.log("BoxProvider - Parsed boxes:", parsed);
          setBoxes(parsed);
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

  // Memoize setCreationMode to prevent unnecessary re-renders
  const handleSetCreationMode = useCallback((v: boolean) => {
    setCreationMode(v);
  }, []);

  // Memoize context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(() => ({
    boxes,
    setBoxes,
    creationMode,
    setCreationMode: handleSetCreationMode,
    projectId
  }), [boxes, creationMode, handleSetCreationMode, projectId]);

  return (
    <BoxContext.Provider value={contextValue}>
      {children}
    </BoxContext.Provider>
  );
};

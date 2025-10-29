"use client";
import React, { createContext, useContext, useState } from "react";

export type Box = { position: [number, number, number], color?: string };

interface BoxContextType {
  boxes: Box[];
  setBoxes: React.Dispatch<React.SetStateAction<Box[]>>;
  creationMode: boolean;
  setCreationMode: (v: boolean) => void;
}

const BoxContext = createContext<BoxContextType | undefined>(undefined);

export function useBoxContext() {
  const ctx = useContext(BoxContext);
  if (!ctx) throw new Error("useBoxContext must be used within BoxProvider");
  return ctx;
}

export const BoxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [creationMode, setCreationMode] = useState(false);
  return (
    <BoxContext.Provider value={{ boxes, setBoxes, creationMode, setCreationMode }}>
      {children}
    </BoxContext.Provider>
  );
};

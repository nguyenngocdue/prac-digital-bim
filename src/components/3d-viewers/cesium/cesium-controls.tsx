"use client";

import { Button } from "@/components/ui/button";
import { Globe, Box } from "lucide-react";

interface CesiumControlsProps {
  showCesium: boolean;
  onToggle: () => void;
}

export const CesiumControls = ({ showCesium, onToggle }: CesiumControlsProps) => {
  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 bg-background/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border">
        <Button
          variant={showCesium ? "default" : "outline"}
          size="sm"
          onClick={onToggle}
          className="flex items-center gap-2"
        >
          {showCesium ? (
            <>
              <Globe className="h-4 w-4" />
              <span>Cesium View</span>
            </>
          ) : (
            <>
              <Box className="h-4 w-4" />
              <span>Three.js View</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

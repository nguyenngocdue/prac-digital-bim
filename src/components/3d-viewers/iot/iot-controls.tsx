"use client";

import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Activity } from "lucide-react";

interface IotControlsProps {
  showLabels: boolean;
  onToggleLabels: () => void;
  className?: string;
}

export const IotControls = ({ 
  showLabels, 
  onToggleLabels,
  className = "" 
}: IotControlsProps) => {
  return (
    <div className={`absolute bottom-6 right-6 z-40 ${className}`}>
      <div className="flex flex-col gap-2 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <Activity className="h-3 w-3" />
          <span>IoT Sensors</span>
        </div>
        <Button
          variant={showLabels ? "default" : "outline"}
          size="sm"
          onClick={onToggleLabels}
          className="flex items-center gap-2 w-full"
        >
          {showLabels ? (
            <>
              <Eye className="h-4 w-4" />
              <span>Hide Labels</span>
            </>
          ) : (
            <>
              <EyeOff className="h-4 w-4" />
              <span>Show Labels</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

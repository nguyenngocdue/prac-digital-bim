"use client";

import { Button } from "@/components/ui/button";
import { Camera, Eye, EyeOff } from "lucide-react";
import { CameraData } from "@/types/camera";

interface CameraListPanelProps {
  cameras: CameraData[];
  selectedCameraId: string | null;
  onCameraSelect: (camera: CameraData) => void;
  showCameras: boolean;
  onToggleCameras: () => void;
  className?: string;
}

export const CameraListPanel = ({ 
  cameras,
  selectedCameraId,
  onCameraSelect,
  showCameras,
  onToggleCameras,
  className = "" 
}: CameraListPanelProps) => {
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-500',
    error: 'bg-red-500'
  };

  const onlineCount = cameras.filter(c => c.status === 'online').length;
  const offlineCount = cameras.filter(c => c.status === 'offline').length;

  return (
    <div className={`absolute top-6 left-6 z-50 ${className}`}>
      <div className="viewer-panel rounded-xl shadow-lg min-w-[280px]">
        {/* Header */}
        <div className="p-3 border-b">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Cameras</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onToggleCameras}
            >
              {showCameras ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>{onlineCount} Online</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-500" />
              <span>{offlineCount} Offline</span>
            </div>
          </div>
        </div>

        {/* Camera List */}
        {showCameras && (
          <div className="p-2 max-h-[400px] overflow-y-auto">
            {cameras.map((camera) => (
              <button
                key={camera.id}
                onClick={() => onCameraSelect(camera)}
                className={`w-full flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors ${
                  selectedCameraId === camera.id ? 'bg-accent' : ''
                }`}
              >
                {/* Status indicator */}
                <div className={`w-2 h-2 rounded-full ${statusColors[camera.status]} shrink-0`} />
                
                {/* Camera info */}
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium truncate">{camera.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {camera.id}
                    {camera.roomId && ` • Room ${camera.roomId.replace('r', '')}`}
                  </p>
                </div>
                
                {/* Type badge */}
                {camera.type && (
                  <div className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary capitalize shrink-0">
                    {camera.type}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="p-2 border-t">
          <p className="text-[10px] text-muted-foreground text-center">
            Click camera to view feed
          </p>
        </div>
      </div>
    </div>
  );
};

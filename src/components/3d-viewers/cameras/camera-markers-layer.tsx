"use client";

import { CameraMarker } from './camera-marker';
import { CameraData } from '@/types/camera';

interface CameraMarkersLayerProps {
  cameras: CameraData[];
  visible?: boolean;
  onCameraClick?: (camera: CameraData) => void;
  selectedCameraId?: string | null;
}

export const CameraMarkersLayer = ({ 
  cameras, 
  visible = true,
  onCameraClick,
  selectedCameraId
}: CameraMarkersLayerProps) => {
  if (!visible) return null;
  
  return (
    <group name="camera-markers">
      {cameras.map((camera) => (
        <CameraMarker
          key={camera.id}
          camera={camera}
          onClick={() => onCameraClick?.(camera)}
          selected={selectedCameraId === camera.id}
        />
      ))}
    </group>
  );
};

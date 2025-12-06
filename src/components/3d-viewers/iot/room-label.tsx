"use client";

import { Html } from '@react-three/drei';
import { RoomData, getCO2Status } from '@/types/room';
import { Cloud } from 'lucide-react';

interface RoomLabelProps {
  room: RoomData;
  scale?: number;
}

export const RoomLabel = ({ room, scale = 1 }: RoomLabelProps) => {
  const co2Status = room.co2 ? getCO2Status(room.co2) : 'normal';
  
  const statusColors = {
    normal: '#22c55e', // green
    warning: '#f97316', // orange
    danger: '#ef4444'   // red
  };
  
  const bgColor = statusColors[co2Status];
  
  return (
    <Html
      position={room.position}
      center
      distanceFactor={10}
      style={{
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <div 
        className="flex items-center gap-2 px-3 py-1.5 rounded-md shadow-lg backdrop-blur-sm border border-white/20"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          transform: `scale(${scale})`,
          minWidth: '120px',
        }}
      >
        {/* Cloud Icon */}
        <Cloud 
          className="w-5 h-5 flex-shrink-0" 
          style={{ color: 'white' }}
        />
        
        {/* Room Number */}
        <span className="text-white font-medium text-lg">
          {room.name}
        </span>
        
        {/* Sensor Data */}
        <div className="flex items-center gap-1">
          {room.co2 && (
            <span 
              className="font-bold text-sm"
              style={{ color: bgColor }}
            >
              CO₂ {room.co2}
            </span>
          )}
          {room.temperature && (
            <span className="text-white/70 text-xs ml-1">
              {room.temperature}°C
            </span>
          )}
        </div>
      </div>
    </Html>
  );
};

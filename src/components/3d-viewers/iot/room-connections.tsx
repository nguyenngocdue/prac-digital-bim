"use client";

import { ConnectionLine } from './connection-line';
import { RoomData, getCO2Status } from '@/types/room';

interface RoomConnectionsProps {
  rooms: RoomData[];
  visible?: boolean;
}

export const RoomConnections = ({ 
  rooms, 
  visible = true
}: RoomConnectionsProps) => {
  if (!visible) return null;

  const statusColors = {
    normal: '#22c55e',
    warning: '#f97316',
    danger: '#ef4444'
  };

  return (
    <group name="room-connections">
      {rooms.map((room) => {
        const co2Status = room.co2 ? getCO2Status(room.co2) : 'normal';
        const lineColor = statusColors[co2Status];
        
        // Line từ label position xuống floor/element position
        const labelPos = room.position;
        const floorPos: [number, number, number] = [
          labelPos[0], 
          0, // Ground level
          labelPos[2]
        ];

        return (
          <ConnectionLine
            key={`line-${room.id}`}
            start={labelPos}
            end={floorPos}
            color={lineColor}
            lineWidth={2}
            dashed={true}
          />
        );
      })}
    </group>
  );
};

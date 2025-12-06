"use client";

import { RoomMarker } from './room-marker';
import { RoomData } from '@/types/room';

interface RoomMarkersLayerProps {
  rooms: RoomData[];
  visible?: boolean;
}

export const RoomMarkersLayer = ({ rooms, visible = true }: RoomMarkersLayerProps) => {
  if (!visible) return null;
  
  return (
    <group name="room-markers">
      {rooms.map((room) => (
        <RoomMarker key={`marker-${room.id}`} room={room} />
      ))}
    </group>
  );
};

"use client";

import { RoomLabel } from './room-label';
import { RoomData } from '@/types/room';

interface RoomLabelsLayerProps {
  rooms: RoomData[];
  visible?: boolean;
}

export const RoomLabelsLayer = ({ rooms, visible = true }: RoomLabelsLayerProps) => {
  if (!visible) return null;
  
  return (
    <group name="room-labels">
      {rooms.map((room) => (
        <RoomLabel key={room.id} room={room} />
      ))}
    </group>
  );
};

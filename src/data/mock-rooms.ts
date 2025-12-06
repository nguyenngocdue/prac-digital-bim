import { RoomData } from '@/types/room';

// Mock data giống như trong hình
export const mockRooms: RoomData[] = [
  // Row 1 - Top
  { id: 'r29', name: '29', position: [0, 3, 8], temperature: 29, co2: 230, status: 'normal' },
  { id: 'r28', name: '28', position: [-3, 3, 8], temperature: 28, co2: 220, status: 'normal' },
  { id: 'r30', name: '30', position: [3, 3, 8], temperature: 30, co2: 200, status: 'normal' },
  
  // Row 2
  { id: 'r24', name: '24', position: [-6, 3, 5], temperature: 24, co2: 270, status: 'normal' },
  { id: 'r27', name: '27', position: [-2, 3, 5], temperature: 27, co2: 1100, status: 'danger' },
  { id: 'r32', name: '32', position: [4, 3, 5], temperature: 32, co2: 830, status: 'danger' },
  
  // Row 3 - Middle
  { id: 'r23', name: '23', position: [-5, 3, 2], temperature: 23, co2: 270, status: 'normal' },
  { id: 'r31', name: '31', position: [0, 3, 2], temperature: 31, co2: 900, status: 'warning' },
  { id: 'r33', name: '33', position: [5, 3, 2], temperature: 33, co2: 850, status: 'warning' },
  
  // Row 4
  { id: 'r22', name: '22', position: [-4, 3, -1], temperature: 22, co2: 270, status: 'normal' },
  { id: 'r20', name: '20', position: [0, 3, -1], temperature: 20, co2: 250, status: 'normal' },
  { id: 'r17', name: '17', position: [6, 3, -1], temperature: 17, co2: 260, status: 'normal' },
  
  // Row 5 - Bottom
  { id: 'r19', name: '19', position: [2, 3, -4], temperature: 19, co2: 270, status: 'normal' },
  { id: 'r18', name: '18', position: [6, 3, -4], temperature: 18, co2: 260, status: 'normal' },
];

// Function to generate random sensor updates (for real-time simulation)
export const generateRandomUpdate = (room: RoomData): RoomData => {
  return {
    ...room,
    temperature: Math.round((room.temperature || 20) + (Math.random() - 0.5) * 2),
    co2: Math.round((room.co2 || 400) + (Math.random() - 0.5) * 100),
  };
};

export interface RoomData {
  id: string;
  name: string;
  position: [number, number, number]; // 3D position for label
  temperature?: number; // °C
  co2?: number; // ppm
  humidity?: number; // %
  status?: 'normal' | 'warning' | 'danger';
}

export interface SensorData {
  temperature: number;
  co2: number;
  humidity: number;
  timestamp: Date;
}

export type RoomStatus = 'normal' | 'warning' | 'danger';

export const getCO2Status = (co2: number): RoomStatus => {
  if (co2 > 800) return 'danger';
  if (co2 > 600) return 'warning';
  return 'normal';
};

export const getTemperatureStatus = (temp: number): RoomStatus => {
  if (temp > 30 || temp < 18) return 'danger';
  if (temp > 28 || temp < 20) return 'warning';
  return 'normal';
};

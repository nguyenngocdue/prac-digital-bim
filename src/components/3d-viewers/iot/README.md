# IoT Room Monitoring System 🏠📊

Hệ thống hiển thị dữ liệu cảm biến IoT cho các phòng trong mô hình 3D BIM với connection lines và markers.

## 📁 Cấu trúc

```
iot/
├── room-label.tsx           # Component hiển thị label cho từng phòng
├── room-labels-layer.tsx    # Layer quản lý tất cả labels
├── connection-line.tsx      # Line kết nối từ label xuống element
├── room-connections.tsx     # Layer quản lý tất cả connection lines
├── room-marker.tsx          # Floor marker với pulse animation
├── room-markers-layer.tsx   # Layer quản lý tất cả markers
├── iot-controls.tsx         # Button bật/tắt hiển thị labels
├── iot-legend.tsx           # Bảng chú thích màu sắc
└── index.ts                 # Export barrel file

types/
└── room.ts                  # Type definitions & status helpers

data/
└── mock-rooms.ts            # Mock data cho demo (15 phòng)
```

## ✨ Features

### 1. Room Labels (Floating Text)
- Hiển thị **số phòng**, **CO₂**, và **nhiệt độ**
- Màu sắc theo status: 
  - 🟢 Green (Normal): CO₂ < 600 ppm
  - 🟠 Orange (Warning): CO₂ 600-800 ppm  
  - 🔴 Red (Danger): CO₂ > 800 ppm
- Icon cloud cho sensor indicator
- Billboard effect (luôn quay về camera)

### 2. Connection Lines ✨ NEW
- **Dashed lines** kết nối từ label xuống floor
- Màu theo status (green/orange/red)
- Transparent với opacity 0.6
- Tự động match với room status

### 3. Floor Markers ✨ NEW
- **Cylinder markers** trên ground tại vị trí phòng
- **Pulse animation** (breathing effect)
- Màu emissive theo status
- **Danger ring**: Outer ring cho phòng danger

### 4. Controls
- Button **Show/Hide Labels** ở góc phải dưới
- Bật/tắt đồng thời: labels + lines + markers
- Icon Eye/EyeOff với status indicator

### 5. Legend Panel
- Bảng chú thích ở góc phải trên
- Color coding cho CO₂ levels
- Temperature guidelines
- Room count statistics

## 🎨 Thiết kế

Hệ thống 3 layers:

```
     ┌─────────────────┐
     │ 🌥️ 29  CO₂ 230 │  ← Label (Billboard, floating)
     └────────┬────────┘
              │           ← Connection Line (dashed, colored)
              ▼
         ╭────────╮       ← Floor Marker (pulsing cylinder)
         │  Room  │
         ╰────────╯
```

**Normal (Green)**
```
Label: Green text
Line: Green dashed
Marker: Green cylinder with pulse
```

**Warning (Orange)**
```
Label: Orange text  
Line: Orange dashed
Marker: Orange cylinder with pulse
```

**Danger (Red)**
```
Label: Red text
Line: Red dashed  
Marker: Red cylinder + outer ring with pulse
```

## 📊 Data Structure

### RoomData Interface
```typescript
interface RoomData {
  id: string;              // Unique room ID
  name: string;            // Display name (số phòng)
  position: [x, y, z];     // 3D position
  temperature?: number;    // °C
  co2?: number;           // ppm
  humidity?: number;      // %
  status?: RoomStatus;    // 'normal' | 'warning' | 'danger'
}
```

### Mock Data
File `mock-rooms.ts` chứa 15 phòng mẫu:
- Positions được spread như layout trong hình
- CO₂ range: 200-1100 ppm
- Temp range: 17-33°C
- Mix of normal/warning/danger status

## 🔧 Cách sử dụng

### 1. Trong Scene (Complete System)
```tsx
import { RoomLabelsLayer } from './iot/room-labels-layer';
import { RoomConnections } from './iot/room-connections';
import { RoomMarkersLayer } from './iot/room-markers-layer';
import { mockRooms } from '@/data/mock-rooms';

// Labels floating ở trên
<RoomLabelsLayer 
  rooms={mockRooms} 
  visible={showRoomLabels} 
/>

// Connection lines từ labels xuống floor
<RoomConnections 
  rooms={mockRooms} 
  visible={showRoomLabels} 
/>

// Markers trên floor
<RoomMarkersLayer 
  rooms={mockRooms} 
  visible={showRoomLabels} 
/>
```

### 2. Controls trong Viewer
```tsx
import { IotControls, IotLegend } from './iot';

const [showRoomLabels, setShowRoomLabels] = useState(true);

<IotControls
  showLabels={showRoomLabels}
  onToggleLabels={() => setShowRoomLabels(!showRoomLabels)}
/>

{showRoomLabels && <IotLegend />}
```

### 3. Custom Room Data
```typescript
const myRooms: RoomData[] = [
  {
    id: 'room-101',
    name: '101',
    position: [0, 2, 0],
    temperature: 23,
    co2: 450,
    status: 'normal'
  },
  // ... more rooms
];

<RoomLabelsLayer rooms={myRooms} visible />
```

## 🌐 Real-time Updates

Để kết nối với IoT backend thực:

```typescript
// Hook để fetch/subscribe sensor data
const useRealtimeRoomData = () => {
  const [rooms, setRooms] = useState<RoomData[]>(mockRooms);
  
  useEffect(() => {
    // WebSocket connection
    const ws = new WebSocket('ws://your-iot-server');
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setRooms(prev => prev.map(room => 
        room.id === update.roomId 
          ? { ...room, ...update.data }
          : room
      ));
    };
    
    return () => ws.close();
  }, []);
  
  return rooms;
};
```

## 🎨 Customization

### Thay đổi màu status
```typescript
// room-label.tsx
const statusColors = {
  normal: '#22c55e',   // Tailwind green-500
  warning: '#f97316',  // orange-500
  danger: '#ef4444'    // red-500
};
```

### Thay đổi thresholds
```typescript
// types/room.ts
export const getCO2Status = (co2: number): RoomStatus => {
  if (co2 > 1000) return 'danger';    // Custom threshold
  if (co2 > 700) return 'warning';
  return 'normal';
};
```

### Custom label style
```typescript
<div style={{
  backgroundColor: 'rgba(0, 0, 0, 0.85)', // Darker bg
  fontSize: '14px',                       // Larger text
  padding: '8px 12px',                   // More padding
}}>
```

## 📱 Responsive

Labels tự động scale với khoảng cách camera:
- `distanceFactor={10}` trong Html component
- Labels closer = larger, further = smaller
- Billboard rotation để luôn nhìn thấy

## 🐛 Debug

Enable console logs:
```typescript
// room-labels-layer.tsx
useEffect(() => {
  console.log('Rendering', rooms.length, 'room labels');
  rooms.forEach(r => console.log(r.name, r.co2, r.status));
}, [rooms]);
```

## 💡 Best Practices

1. **Position accuracy**: Đảm bảo positions match với model geometry
2. **Performance**: Dùng `memo` để avoid re-renders
3. **Status logic**: Tách ra `types/room.ts` để dễ maintain
4. **Mock data**: Giữ trong `data/` folder riêng
5. **Type safety**: Always define interfaces trước

## 🚀 Next Steps

- [ ] Integrate với real IoT API/WebSocket
- [ ] Add humidity sensor data
- [ ] Historical data charts on click
- [ ] Alert notifications cho danger status
- [ ] Export report functionality
- [ ] Mobile responsive legend panel
- [ ] Animated transitions cho status changes

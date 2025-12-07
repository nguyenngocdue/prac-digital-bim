# Camera Monitoring System 📹

Hệ thống quản lý và xem camera feeds trong mô hình 3D BIM.

## 📁 Cấu trúc

```
cameras/
├── camera-marker.tsx           # 3D camera object với vision cone
├── camera-markers-layer.tsx    # Layer quản lý tất cả cameras
├── camera-list-panel.tsx       # Panel danh sách cameras (legend)
├── camera-viewer-panel.tsx     # Panel xem camera feed
└── index.ts                    # Export barrel file

types/
└── camera.ts                   # CameraData, CameraFeed types

data/
└── mock-cameras.ts             # Mock camera data (6 cameras)
```

## ✨ Features

### 1. 3D Camera Markers
- **Camera body**: Box + cylindrical lens
- **Vision cone**: Transparent cone showing FOV
- **Status lights**: 
  - 🟢 Green = Online
  - ⚪ Gray = Offline
  - 🔴 Red = Error
- **Selection ring**: Blue ring khi camera được chọn
- **Rotation animation**: Smooth rotation cho online cameras
- **Clickable**: Click để xem feed

### 2. Camera List Panel (Legend)
- Vị trí: **Top-left corner**
- **Camera list** với:
  - Status indicator (colored dot)
  - Camera name + ID
  - Room association
  - Type badge (security/thermal/ptz)
- **Statistics**: Online/Offline count
- **Toggle button**: Show/Hide cameras
- **Click to view**: Click camera để mở viewer

### 3. Camera Viewer Panel
- Vị trí: **Bottom-left corner**
- **Live feed display**:
  - Video stream preview (placeholder image)
  - LIVE indicator với pulse animation
  - Timestamp overlay
  - Camera info
- **Status handling**:
  - Online: Show feed
  - Offline: Show offline message
  - Error: Show error message
- **Controls**:
  - Full Screen button
  - Snapshot button
  - Camera type info
- **Close button**: X để đóng panel

## 🎮 User Flow

```
1. Click camera marker in 3D scene
   ↓
2. Camera Viewer Panel opens
   ↓
3. View live feed + controls
   ↓
4. Click X to close
   OR
   Click another camera
```

Hoặc:

```
1. Open Camera List Panel (top-left)
   ↓
2. Browse camera list
   ↓
3. Click camera name
   ↓
4. Viewer Panel opens với feed
```

## 🎨 Visual Design

### Camera Marker States:

**Online (Green)**
```
    ┌─────┐
    │  📷  │  ← Gray body + Green lens
    └──┬──┘
       │      
      ╱│╲     ← Transparent green cone
     ╱ │ ╲
    ╱  │  ╲
```

**Selected**
```
    ┌─────┐
    │  📷  │  ← Blue emissive
    └──┬──┘
      ╱│╲     ← Selection ring
     ═════
```

**Offline**
```
    ┌─────┐
    │  📷  │  ← Gray, no cone
    └─────┘
```

## 📊 Data Structure

### CameraData
```typescript
interface CameraData {
  id: string;                      // 'cam-01'
  name: string;                    // 'Entrance Camera'
  position: [x, y, z];            // 3D position
  rotation?: [x, y, z];           // Camera orientation
  streamUrl?: string;              // Stream endpoint
  status: 'online' | 'offline' | 'error';
  type?: 'security' | 'thermal' | 'ptz';
  roomId?: string;                 // Associated room
}
```

### Mock Data
- 6 cameras spread across building
- Mix of online/offline/error status
- Different types: security, thermal, PTZ
- Associated with specific rooms

## 🔧 Usage

### 1. Trong Scene
```tsx
import { CameraMarkersLayer } from './cameras/camera-markers-layer';
import { mockCameras } from '@/data/mock-cameras';

<CameraMarkersLayer 
  cameras={mockCameras}
  visible={showCameras}
  onCameraClick={(camera) => setSelectedCamera(camera)}
  selectedCameraId={selectedCamera?.id}
/>
```

### 2. UI Panels trong Viewer
```tsx
import { CameraListPanel, CameraViewerPanel } from './cameras';

const [selectedCamera, setSelectedCamera] = useState<CameraData | null>(null);
const [showCameras, setShowCameras] = useState(true);

<CameraListPanel
  cameras={mockCameras}
  selectedCameraId={selectedCamera?.id || null}
  onCameraSelect={setSelectedCamera}
  showCameras={showCameras}
  onToggleCameras={() => setShowCameras(!showCameras)}
/>

<CameraViewerPanel
  camera={selectedCamera}
  onClose={() => setSelectedCamera(null)}
/>
```

## 🌐 Real Integration

### Connect to RTSP/WebRTC
```typescript
// camera-viewer-panel.tsx
{camera.status === 'online' && (
  <video
    autoPlay
    muted
    src={camera.streamUrl}
    className="w-full h-full object-cover"
  />
)}
```

### WebSocket Updates
```typescript
useEffect(() => {
  const ws = new WebSocket('ws://camera-server');
  
  ws.onmessage = (event) => {
    const update = JSON.parse(event.data);
    // Update camera status
    setCameras(prev => prev.map(cam =>
      cam.id === update.cameraId
        ? { ...cam, status: update.status }
        : cam
    ));
  };
  
  return () => ws.close();
}, []);
```

### Fetch Snapshots
```typescript
export const getCameraFeed = async (cameraId: string) => {
  const response = await fetch(`/api/cameras/${cameraId}/snapshot`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
```

## 🎨 Customization

### Camera Model
```typescript
// camera-marker.tsx
<boxGeometry args={[0.3, 0.2, 0.4]} />  // Larger camera
<coneGeometry args={[0.6, 1.2, 8]} />   // Wider FOV cone
```

### Vision Cone
```typescript
opacity={0.25}        // More visible
color="#00ff00"       // Custom color
```

### Panel Position
```typescript
// camera-list-panel.tsx
className="absolute top-6 right-6"  // Move to top-right

// camera-viewer-panel.tsx  
className="absolute top-24 left-6"  // Move higher
w-[500px]                           // Wider panel
```

## 💡 Advanced Features

### PTZ Controls
```tsx
<div className="flex gap-2 p-2">
  <Button onClick={() => panCamera('left')}>←</Button>
  <Button onClick={() => panCamera('right')}>→</Button>
  <Button onClick={() => tiltCamera('up')}>↑</Button>
  <Button onClick={() => tiltCamera('down')}>↓</Button>
  <Button onClick={() => zoomCamera('in')}>+</Button>
  <Button onClick={() => zoomCamera('out')}>-</Button>
</div>
```

### Recording
```tsx
const [recording, setRecording] = useState(false);

<Button onClick={() => startRecording(camera.id)}>
  {recording ? '⏹️ Stop' : '⏺️ Record'}
</Button>
```

### Multiple Cameras View
```tsx
<div className="grid grid-cols-2 gap-2">
  {selectedCameras.map(camera => (
    <CameraFeed key={camera.id} camera={camera} />
  ))}
</div>
```

## 🚀 Next Steps

- [ ] Real RTSP/WebRTC stream integration
- [ ] Video recording functionality
- [ ] PTZ camera controls
- [ ] Motion detection alerts
- [ ] Camera health monitoring
- [ ] Playback timeline
- [ ] Multi-camera grid view
- [ ] Export video clips
- [ ] AI analytics overlay (person detection, etc.)

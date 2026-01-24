# Editable Box Handles - Refactored Structure

## 📁 Cấu trúc thư mục

```
editable-box-handles/
├── types.ts              # Type definitions & interfaces
├── constants.ts          # Các hằng số (sizes, colors, thresholds)
├── geometries.ts         # Quản lý THREE.js geometries
├── materials.ts          # Quản lý THREE.js materials
├── calculations.ts       # Các hàm tính toán (area, centroid, distances)
├── mesh-updaters.ts      # Các hàm cập nhật mesh và handles
├── drag-handlers.ts      # Logic xử lý drag operations
├── utils.ts              # Utility functions (cursor, hover, line updates)
├── bounding-box.tsx      # Bounding box component & hooks
├── rotation-handles.tsx  # Rotation handles component & hooks
└── polygon-display.tsx   # Polygon display component (fill, edges, area)
```

## ✨ Tính năng mới

### 1. **Bounding Box Display**
Khi click vào geometry, sẽ hiển thị:
- **Bounding box** bao quanh toàn bộ geometry với **transparency cao** (0.08 - 0.35 opacity)
- **Dimensions** (Width, Height, Depth) của bounding box
- **Visual indicators** với wireframe mờ và lines nhẹ

### 2. **Rotation Handles & Info**
- **4 rotation handles** tại các góc của bounding box
- Hiển thị **góc quay real-time** khi đang rotate
- Góc quay được tính bằng **độ (degrees)**
- Reset về 0° khi kết thúc rotation

### 3. **Interactive Selection**
Click vào bất kỳ:
- Vertex handles
- Edge handles  
- Top/Bottom faces
- Height handles

→ Tự động kích hoạt bounding box và rotation handles

## 🎯 Cách sử dụng

### Basic Usage

```typescript
import { EditablePolygonHandles } from './editable-box-handles';

<EditablePolygonHandles
  vertices={vertices}
  onVerticesChange={handleChange}
  topVertices={topVertices}
  onTopVerticesChange={handleTopChange}
  height={3}
  onHeightChange={handleHeightChange}
  showBoundingBox={true}  // Mặc định sẽ show khi click
  showRotateHandles={true} // Mặc định sẽ show khi click
/>
```

## 📦 Chi tiết các modules

### 1. `types.ts`
**Mục đích**: Định nghĩa các TypeScript types và interfaces

```typescript
- EditablePolygonHandlesProps  // Props của component
- DragMode                      // Các chế độ drag
- PendingTranslate             // State cho translate pending
- DragRefs                     // Tất cả refs cần thiết
```

### 2. `constants.ts`
**Mục đích**: Tập trung tất cả các hằng số

```typescript
- Handle sizes (HANDLE_SIZE, EDGE_SIZE, etc.)
- Colors (HANDLE_COLOR, EDGE_COLOR, etc.)
- Geometry segments
- Thresholds (MIN_HEIGHT, DRAG_THRESHOLD)
```

### 3. **Component Modules** (NEW!)

#### `bounding-box.tsx`
**Mục đích**: Hiển thị bounding box với độ trong suốt cao

**Exports**:
- `useBoundingBox(vertices, topVertices?, height?)` - Hook tính bounding box
- `useBoundingBoxLines(boundingBox)` - Hook tạo line segments
- `BoundingBox` - Component render bounding box với opacity thấp
- `BoundingBoxInfo` - Component hiển thị thông tin W/H/D

**Features**:
- Opacity giảm: outer 0.25, inner 0.35, wireframe 0.08
- Tự động tính toán từ vertices
- Hiển thị kích thước real-time

#### `rotation-handles.tsx`
**Mục đích**: Hiển thị rotation handles và angle label

**Exports**:
- `useRotationHandlePositions(boundingBox)` - Hook tính vị trí handles
- `RotationHandles` - Component render 4 handles
- `RotationHandle` - Single handle component
- `RotationLabel` - Label hiển thị góc quay

#### `polygon-display.tsx`
**Mục đích**: Hiển thị polygon fill, edges và area label

**Exports**:
- `PolygonDisplay` - Component wrapper
- `PolygonFill` - Mesh fill component
- `PolygonEdges` - Line edges component
- `AreaLabel` - Label hiển thị diện tích


**Lợi ích**: 
- Dễ điều chỉnh giá trị một chỗ
- Tránh magic numbers
- Dễ maintain

### 3. `geometries.ts`
**Mục đích**: Quản lý THREE.js geometries

**Functions**:
```typescript
createGeometries()  // Tạo tất cả geometries cần thiết
disposeGeometries() // Cleanup geometries khi unmount
```

**Lợi ích**: 
- Tập trung logic tạo geometry
- Đảm bảo cleanup đúng cách

### 4. `materials.ts`
**Mục đích**: Quản lý THREE.js materials

**Functions**:
```typescript
createMaterials()   // Tạo tất cả materials
disposeMaterials()  // Cleanup materials
```

**Lợi ích**: 
- Tập trung logic tạo material
- Tránh memory leaks

### 5. `calculations.ts`
**Mục đích**: Các hàm tính toán hình học

**Functions**:
```typescript
getDistance()              // Tính khoảng cách giữa 2 điểm
calculateArea()            // Tính diện tích polygon
calculateCentroid()        // Tính tâm polygon
calculateAverageY()        // Tính Y trung bình
createShapeFromVertices()  // Tạo THREE.Shape từ vertices
calculateCenter()          // Tính điểm trung tâm
```

**Lợi ích**: 
- Có thể tái sử dụng ở nhiều nơi
- Dễ test riêng lẻ
- Logic rõ ràng

### 6. `mesh-updaters.ts`
**Mục đích**: Cập nhật mesh và handles positions

**Functions**:
```typescript
updateVertexHandles()  // Cập nhật vertex handles
updateEdgeHandles()    // Cập nhật edge handles
updateHeightHandle()   // Cập nhật height handles
updateHandleHover()    // Cập nhật hover state
updateAllHandles()     // Cập nhật tất cả handles
```

**Lợi ích**: 
- Tránh code lặp lại
- Dễ dàng cập nhật logic

### 7. `drag-handlers.ts`
**Mục đích**: Xử lý tất cả drag operations

**Functions**:
```typescript
handlePointerDown()           // Drag vertex
handleEdgePointerDown()       // Drag edge
handleHeightPointerDown()     // Adjust height
handleRotatePointerDown()     // Rotate geometry
startTranslateFree()          // Translate in 3D
```

**Features**:
- ✅ Real-time rotation angle tracking
- ✅ Multi-mode drag support
- ✅ Live update during drag
- ✅ Proper cleanup on drag end

### 8. `utils.ts`
**Mục đích**: Utility functions chung

**Functions**:
```typescript
shouldBlockTranslate()  // Kiểm tra có nên block translate
updateTranslateHover()  // Cập nhật translate hover state
updateLineLoop()        // Cập nhật line geometry
markAsHandle()          // Đánh dấu mesh là handle
```

**Lợi ích**: 
- Helper functions tiện dụng
- Có thể dùng ở nhiều components khác

## 🎨 Visual Features

### Bounding Box Display
```typescript
- Outer box (blue): Expanded bounding box
- Inner box (lighter blue): Exact bounding box
- Wireframe: Semi-transparent box visualization
- Info panel: Shows W/H/D dimensions
```

### Rotation Handles
```typescript
- 4 torus handles at bottom corners
- Cyan color (#38bdf8)
- Draggable with visual feedback
- Shows rotation angle during drag
```

### Info Panels
```typescript
// Bounding Box Info
┌─────────────────┐
│ 🔲 Bounding Box │
├─────────────────┤
│ W: 5.20 m       │
│ H: 3.00 m       │
│ D: 4.50 m       │
│ Rot: 45.3°      │ // Only when rotated
└─────────────────┘

// Area Label (always shown)
┌─────────┐
│ 23.4 m² │
└─────────┘
```

## 🔄 Interaction Flow

1. **Click on geometry** → Shows bounding box & rotation handles
2. **Drag rotation handle** → Real-time angle display
3. **Release mouse** → Angle resets to 0°, changes saved
4. **Drag vertices/edges** → Bounding box updates automatically

## 🧪 Testing

Với cấu trúc mới, có thể test riêng lẻ từng module:

```typescript
// Test calculations
import { calculateArea } from './calculations';

test('calculateArea should return correct area', () => {
  const vertices = [[0,0,0], [1,0,0], [1,0,1], [0,0,1]];
  expect(calculateArea(vertices)).toBe(1);
});
```

## 📈 Hiệu năng

- **Không ảnh hưởng hiệu năng**: Code được tối ưu như cũ
- **useMemo và useRef**: Vẫn được sử dụng đúng cách
- **Cleanup**: Được quản lý tốt hơn
- **Bounding box**: Chỉ tính toán khi cần thiết

## 🔧 Customization

### Tùy chỉnh màu sắc bounding box

```typescript
// Trong component, có thể customize:
<lineBasicMaterial
  color="#your-color"  // Đổi màu
  opacity={0.5}        // Đổi độ trong suốt
/>
```

### Tùy chỉnh rotation handles

```typescript
// Position offset
const heightOffset = 0.35; // Điều chỉnh độ cao handles

// Handle size
<torusGeometry args={[0.26, 0.05, 12, 24]} />
//                    ^^^^  ^^^^  radius & tube
```

## ⚡ Best Practices

1. **Single Responsibility**: Mỗi file chỉ làm một việc
2. **DRY (Don't Repeat Yourself)**: Tránh lặp code
3. **Type Safety**: Sử dụng TypeScript đầy đủ
4. **Documentation**: Comment rõ ràng cho functions
5. **Cleanup**: Dispose resources đúng cách

## 🚀 Tương lai

Có thể mở rộng thêm:

- ✅ `drag-handlers.ts` - Đã tách logic drag ra riêng
- 🔄 `hooks.ts` - Custom hooks riêng (planned)
- 🔄 `validation.ts` - Validate vertices, constraints (planned)
- 🔄 Scale handles - Thêm handles để scale (planned)

## 📝 Migration Notes

**Không cần thay đổi code sử dụng component này**. API và props giữ nguyên 100%.

Chỉ cần pull code mới và tiếp tục sử dụng như cũ!

## 🐛 Troubleshooting

### Bounding box không hiện
- Đảm bảo đã click vào geometry
- Kiểm tra vertices có hợp lệ không

### Rotation angle không update
- Kiểm tra đã pass `setRotationAngle` vào drag handlers
- Verify drag mode = "rotate"

### Performance issues
- Giảm số lượng vertices nếu có thể
- Tắt `liveUpdate` nếu không cần thiết

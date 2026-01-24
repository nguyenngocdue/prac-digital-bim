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
└── utils.ts              # Utility functions (cursor, hover, line updates)
```

## 🎯 Mục đích refactor

### Trước khi refactor
- **1 file duy nhất** với 1216 dòng code
- Logic lẫn lộn khó maintain
- Khó tái sử dụng code
- Khó test riêng lẻ các phần

### Sau khi refactor
- **Tách thành 7 modules** chuyên biệt
- Mỗi module có trách nhiệm rõ ràng
- Dễ dàng tái sử dụng
- Dễ test và maintain

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

### 7. `utils.ts`
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

## 🔄 Cách sử dụng

### Import trong component chính

```typescript
import { EditablePolygonHandles } from './editable-box-handles';

// Sử dụng như trước, không thay đổi interface
<EditablePolygonHandles
  vertices={vertices}
  onVerticesChange={handleChange}
  // ... other props
/>
```

### Tái sử dụng utilities

```typescript
// Sử dụng calculations ở nơi khác
import { calculateArea, calculateCentroid } from './editable-box-handles/calculations';

const area = calculateArea(vertices);
const centroid = calculateCentroid(vertices, centerY);
```

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

## 🔧 Maintain

### Thêm feature mới

1. Xác định feature thuộc module nào
2. Thêm vào module tương ứng
3. Export và import ở component chính

### Fix bug

1. Tìm module chứa logic bị lỗi
2. Fix trong module đó
3. Test riêng lẻ module

### Optimize

1. Identify bottleneck
2. Optimize trong module tương ứng
3. Không ảnh hưởng modules khác

## ⚡ Best Practices

1. **Single Responsibility**: Mỗi file chỉ làm một việc
2. **DRY (Don't Repeat Yourself)**: Tránh lặp code
3. **Type Safety**: Sử dụng TypeScript đầy đủ
4. **Documentation**: Comment rõ ràng cho functions
5. **Cleanup**: Dispose resources đúng cách

## 🚀 Tương lai

Có thể mở rộng thêm:

- `hooks.ts` - Custom hooks riêng
- `drag-handlers.ts` - Tách logic drag ra riêng
- `event-handlers.ts` - Centralize event handling
- `validation.ts` - Validate vertices, constraints

## 📝 Migration Notes

**Không cần thay đổi code sử dụng component này**. API và props giữ nguyên 100%.

Chỉ cần pull code mới và tiếp tục sử dụng như cũ!

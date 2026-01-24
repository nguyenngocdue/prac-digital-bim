# Changelog - Editable Box Handles

## [3.0.0] - 2026-01-24 (Latest)

### 🎨 Visual Improvements

#### Bounding Box Transparency
- 🔧 **Giảm opacity** của bounding box lines xuống **0.08 - 0.35**
  - Outer box: 0.95 → 0.25 opacity
  - Inner box: 0.85 → 0.35 opacity  
  - Wireframe: 0.2 → 0.08 opacity
- ✨ Bounding box giờ **mờ hơn, ít distracting hơn**
- 📐 Vẫn đủ visible để hiện thông tin dimensions

### ♻️ Massive Refactoring - Component Extraction

#### New Component Modules
- ✅ **bounding-box.tsx** - Dedicated bounding box component
  - `useBoundingBox` hook - Tính toán bounding box
  - `useBoundingBoxLines` hook - Tạo line geometry
  - `BoundingBox` component - Render với low opacity
  - `BoundingBoxInfo` component - Display W/H/D panel
  
- ✅ **rotation-handles.tsx** - Rotation handles component
  - `useRotationHandlePositions` hook - Tính vị trí handles
  - `RotationHandles` component - Render 4 handles
  - `RotationHandle` component - Single handle với interaction
  - `RotationLabel` component - Display rotation angle
  
- ✅ **polygon-display.tsx** - Polygon rendering component
  - `PolygonDisplay` component - Wrapper
  - `PolygonFill` component - Mesh fill
  - `PolygonEdges` component - Line edges
  - `AreaLabel` component - Display area with auto centroid

#### Main Component Reduction
- 📉 **Giảm từ 1216 lines → 646 lines** (reduction: **570 lines / 47%**)
- ✂️ Extracted ~200 lines vào component modules
- 🧩 Tách rendering logic thành reusable components
- 🎯 Main component giờ chỉ orchestrate, không render trực tiếp

#### Benefits
- 📦 **Better reusability** - Components có thể dùng độc lập
- 🧪 **Easier testing** - Test từng component riêng
- 📖 **More readable** - Logic phân tách rõ ràng
- 🛠️ **Easier maintenance** - Sửa 1 component không ảnh hưởng toàn bộ
- 🎨 **Visual tweaks easier** - Thay đổi opacity chỉ ở 1 file

### 📁 File Structure Update
```
editable-box-handles/
├── types.ts              
├── constants.ts          
├── geometries.ts         
├── materials.ts          
├── calculations.ts       
├── mesh-updaters.ts      
├── drag-handlers.ts      
├── utils.ts              
├── bounding-box.tsx      ← NEW
├── rotation-handles.tsx  ← NEW
└── polygon-display.tsx   ← NEW
```

---

## [2.0.0] - 2026-01-24

### ✨ Added - Tính năng mới

#### Bounding Box Display
- ✅ Hiển thị bounding box tự động khi click vào geometry
- ✅ Dual-layer visualization (outer + inner box)
- ✅ Real-time dimensions display (Width, Height, Depth)
- ✅ Wireframe overlay với semi-transparent material
- ✅ Info panel hiển thị kích thước chính xác

#### Rotation System  
- ✅ 4 rotation handles tại các góc bottom của bounding box
- ✅ Real-time rotation angle tracking
- ✅ Display góc quay bằng độ (degrees)
- ✅ Auto-reset về 0° khi kết thúc rotation
- ✅ Smooth rotation với visual feedback

#### Interactive Selection
- ✅ Click bất kỳ element nào sẽ activate bounding box
- ✅ Unified selection system
- ✅ Consistent behavior across all handles

### 🔧 Changed - Thay đổi

#### Code Organization
- ♻️ Refactored từ 1 file (1216 lines) → 8 modules
- ♻️ Tách `drag-handlers.ts` thành module riêng
- ♻️ Improved type safety với TypeScript
- ♻️ Better separation of concerns

#### Performance
- ⚡ Optimized bounding box calculations với useMemo
- ⚡ Reduced re-renders
- ⚡ Better memory management

### 📝 Documentation
- 📚 Cập nhật README với visual features
- 📚 Thêm examples và troubleshooting guide
- 📚 Document tất cả public APIs

---

## [1.0.0] - Initial Refactor

### ✨ Added - Module Structure

#### Core Modules
- ✅ `types.ts` - Type definitions
- ✅ `constants.ts` - Configuration constants
- ✅ `geometries.ts` - THREE.js geometry management
- ✅ `materials.ts` - Material creation & disposal
- ✅ `calculations.ts` - Geometric calculations
- ✅ `mesh-updaters.ts` - Mesh update utilities
- ✅ `utils.ts` - General utilities

#### Features
- ✅ Vertex dragging (bottom & top)
- ✅ Edge dragging
- ✅ Height adjustment
- ✅ Free translation (XYZ)
- ✅ Area calculation & display
- ✅ Hover states
- ✅ Live updates

### 🔧 Changed

#### Improvements
- ♻️ Modular architecture
- ♻️ Reusable functions
- ♻️ Improved maintainability
- ♻️ Better TypeScript types

### 🐛 Fixed
- 🔧 Memory leaks với proper cleanup
- 🔧 Edge case handling
- 🔧 TypeScript strict mode compliance

---

## Migration Guide

### From 1.0.0 to 2.0.0

**No breaking changes!** All existing code continues to work.

#### New Optional Features

```typescript
// Bounding box và rotation tự động show khi click
// Không cần config gì thêm!

<EditablePolygonHandles
  vertices={vertices}
  onVerticesChange={handleChange}
  // ... existing props work as before
/>
```

#### Access New State (Optional)

```typescript
// Nếu muốn control bounding box externally:
const [showBBox, setShowBBox] = useState(false);

<EditablePolygonHandles
  showBoundingBox={showBBox}
  showRotateHandles={showBBox}
  // ... other props
/>
```

---

## Roadmap

### Planned Features

#### v2.1.0
- [ ] Scale handles
- [ ] Snap to grid
- [ ] Undo/redo system
- [ ] Keyboard shortcuts

#### v2.2.0
- [ ] Multi-selection
- [ ] Copy/paste
- [ ] Templates/presets

#### v3.0.0
- [ ] Animation system
- [ ] Advanced constraints
- [ ] Custom handle types

---

## Technical Details

### Bounding Box Calculation
```typescript
// Auto-expands với margin
box.expandByScalar(0.12);

// Handles thin objects
if (Math.abs(maxY - minY) < 0.001) {
  box.max.y = minY + 1;
}
```

### Rotation Tracking
```typescript
// Real-time angle calculation
const angle = Math.atan2(current.y, current.x);
const delta = angle - rotateStartAngleRef.current;
const angleDegrees = (delta * 180) / Math.PI;

// Update display
setRotationAngle(angleDegrees);
```

### Performance Optimization
```typescript
// Memoized calculations
const boundingBox = useMemo(() => {
  // ... calculation
}, [height, topVertices, vertices]);

// Efficient updates
requestAnimationFrame(() => {
  // Batch updates
});
```

---

## Contributors

- Initial refactor: Architecture improvements
- v2.0.0: Bounding box & rotation features

## License

Same as parent project

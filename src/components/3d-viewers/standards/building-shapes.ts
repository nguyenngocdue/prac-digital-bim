export type BuildingShape =
  | "rect"
  | "l"
  | "u"
  | "c"
  | "h"
  | "v"
  | "m"
  // new (high-rise friendly)
  | "t"
  | "plus"
  | "diamond"
  | "trapezoid"
  | "hex"
  | "step"
  | "custom"
  | "sine";

type Point2D = [number, number];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function getFootprintPoints(
  shape: BuildingShape,
  width: number,
  depth: number,
  thicknessRatio: number
): Point2D[] {
  const w = Math.max(width, 0.1);
  const d = Math.max(depth, 0.1);
  const t = clamp(Math.min(w, d) * thicknessRatio, 0.2, Math.min(w, d) * 0.9);
  const hw = w / 2;
  const hd = d / 2;

  // ===== NEW SHAPES =====

  // T-shape tower
  if (shape === "t") {
    const stemHalf = Math.min(t / 2, hw * 0.9);
    const barDepth = Math.min(t, d * 0.6);
    return [
      [-hw, hd],
      [hw, hd],
      [hw, hd - barDepth],
      [stemHalf, hd - barDepth],
      [stemHalf, -hd],
      [-stemHalf, -hd],
      [-stemHalf, hd - barDepth],
      [-hw, hd - barDepth],
    ];
  }

  // Plus / cross tower (common core + wings)
  if (shape === "plus") {
    const halfA = Math.min(t / 2, Math.min(hw, hd) * 0.95);
    return [
      [-halfA, hd],
      [halfA, hd],
      [halfA, halfA],
      [hw, halfA],
      [hw, -halfA],
      [halfA, -halfA],
      [halfA, -hd],
      [-halfA, -hd],
      [-halfA, -halfA],
      [-hw, -halfA],
      [-hw, halfA],
      [-halfA, halfA],
    ];
  }

  // Diamond (rotated rectangle) – nhìn “tower landmark” khá ổn
  if (shape === "diamond") {
    return [
      [0, hd],
      [hw, 0],
      [0, -hd],
      [-hw, 0],
    ];
  }

  // Trapezoid – mặt bằng “vát” (hay dùng cho podium/tower)
  if (shape === "trapezoid") {
    const topInset = clamp(t, 0, hw * 0.85);
    return [
      [-hw + topInset, hd],
      [hw - topInset, hd],
      [hw, -hd],
      [-hw, -hd],
    ];
  }

  // Hex – footprint “gần tròn”, lên khối nhìn mềm và đều
  if (shape === "hex") {
    const ix = clamp(t, 0.1, hw * 0.9);
    return [
      [-hw + ix, hd],
      [hw - ix, hd],
      [hw, 0],
      [hw - ix, -hd],
      [-hw + ix, -hd],
      [-hw, 0],
    ];
  }

  // Step / setback – kiểu “bậc thang” (tạo cảm giác khối chia tầng)
  if (shape === "step") {
    // 2-level terrace cut at top-right corner (rõ “bậc” trên plan)
    const sx1 = clamp(t * 1.2, 0.1, w * 0.6);
    const sy1 = clamp(t * 1.2, 0.1, d * 0.6);
    const sx2 = clamp(t * 0.7, 0.1, sx1 * 0.9);
    const sy2 = clamp(t * 0.7, 0.1, sy1 * 0.9);


    return [
      [-hw, -hd],
      [hw, -hd],
      [hw, hd - sy1],
      [hw - sx1, hd - sy1],
      [hw - sx1, hd - sy2],
      [hw - sx2, hd - sy2],
      [hw - sx2, hd],
      [-hw, hd],
    ];
  }

  if (shape === "sine") {
    const segments = 40; // càng cao càng mượt
    const amp = clamp(t * 0.45, 0, hd * 0.65); // biên độ sóng
    const waves = 3; // số nhịp sóng chạy theo chiều rộng

    const pts: Point2D[] = [];

    // cạnh dưới: đi từ trái -> phải
    for (let i = 0; i <= segments; i++) {
      const u = i / segments;               // 0..1
      const x = -hw + u * w;                // -hw..hw
      const y = -hd + amp * Math.sin(u * Math.PI * 2 * waves);
      pts.push([x, y]);
    }

    // cạnh trên: đi từ phải -> trái (để đóng polygon)
    for (let i = segments; i >= 0; i--) {
      const u = i / segments;
      const x = -hw + u * w;
      const y = hd - amp * Math.sin(u * Math.PI * 2 * waves);
      pts.push([x, y]);
    }

    return pts;
  }

  // ===== YOUR EXISTING SHAPES =====

  if (shape === "l") {
    return [
      [-hw, -hd],
      [hw, -hd],
      [hw, -hd + t],
      [-hw + t, -hd + t],
      [-hw + t, hd],
      [-hw, hd],
    ];
  }

  if (shape === "c") {
    return [
      [-hw, -hd],
      [hw, -hd],
      [hw, hd],
      [hw - t, hd],
      [hw - t, -hd + t],
      [-hw + t, -hd + t],
      [-hw + t, hd],
      [-hw, hd],
    ];
  }

  if (shape === "u") {
    return [
      [-hw, -hd],
      [hw, -hd],
      [hw, -hd + t],
      [-hw + t, -hd + t],
      [-hw + t, hd - t],
      [hw, hd - t],
      [hw, hd],
      [-hw, hd],
    ];
  }

  if (shape === "h") {
    const tH = Math.min(t, d / 3);
    const halfT = tH / 2;
    return [
      [-hw, hd],
      [-hw + tH, hd],
      [-hw + tH, halfT],
      [hw - tH, halfT],
      [hw - tH, hd],
      [hw, hd],
      [hw, -hd],
      [hw - tH, -hd],
      [hw - tH, -halfT],
      [-hw + tH, -halfT],
      [-hw + tH, -hd],
      [-hw, -hd],
    ];
  }

  if (shape === "v") {
    return [
      [-hw, hd],
      [0, -hd],
      [hw, hd],
    ];
  }

  if (shape === "m") {
    const midY = 0;
    return [
      [-hw, -hd],
      [-hw, hd],
      [-hw + t, hd],
      [-t, midY],
      [0, hd],
      [t, midY],
      [hw - t, hd],
      [hw, hd],
      [hw, -hd],
    ];
  }

  // rect fallback
  return [
    [-hw, -hd],
    [hw, -hd],
    [hw, hd],
    [-hw, hd],
  ];
}
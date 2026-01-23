export type BuildingShape = "rect" | "l" | "u" | "c" | "custom";

type Point2D = [number, number];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

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

  if (shape === "u") {
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

  if (shape === "c") {
    return [
      [-hw, -hd],
      [hw, -hd],
      [hw, hd],
      [hw - t, hd],
      [hw - t, -hd + t],
      [-hw, -hd + t],
    ];
  }

  return [
    [-hw, -hd],
    [hw, -hd],
    [hw, hd],
    [-hw, hd],
  ];
}

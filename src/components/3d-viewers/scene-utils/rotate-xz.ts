"use client";

export const rotateXZ = (x: number, z: number, angle: number) => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [x * cos - z * sin, x * sin + z * cos] as [number, number];
};

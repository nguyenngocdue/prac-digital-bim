"use client";
import { useSelect } from "@react-three/drei";
import { useEffect, useRef } from "react";

interface PlaceholderBoxProps {
  color: string;
  position?: [number, number, number];
  size?: [number, number, number];
  rotationY?: number;
  onSelectEffect?: (selected: boolean) => void;
  onPointerDown?: () => void;
}

export const PlaceholderBox = ({
  color,
  position,
  size = [1.5, 1.5, 1.5],
  rotationY,
  onSelectEffect,
  onPointerDown,
}: PlaceholderBoxProps) => {
  const selected = !!useSelect();
  const wasSelected = useRef(false);
  
  useEffect(() => {
    if (selected && !wasSelected.current) {
      onSelectEffect?.(true);
    } else if (!selected && wasSelected.current) {
      onSelectEffect?.(false);
    }
    wasSelected.current = selected;
  }, [selected, onSelectEffect]);
  
  return (
    <group position={position} rotation={[0, rotationY || 0, 0]} onPointerDown={onPointerDown}>
      <mesh>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} />
      </mesh>
      {selected && (
        <mesh>
          <boxGeometry args={[size[0] + 0.1, size[1] + 0.1, size[2] + 0.1]} />
          <meshBasicMaterial color="#ff9800" wireframe />
        </mesh>
      )}
    </group>
  );
};

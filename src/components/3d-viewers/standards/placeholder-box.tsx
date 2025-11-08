"use client";
import { useSelect } from "@react-three/drei";
import { useEffect, useRef } from "react";

interface PlaceholderBoxProps {
  color: string;
  position?: [number, number, number];
  onSelectEffect?: (selected: boolean) => void;
}

export const PlaceholderBox = ({ color, position, onSelectEffect }: PlaceholderBoxProps) => {
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
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {selected && (
        <mesh>
          <boxGeometry args={[1.6, 1.6, 1.6]} />
          <meshBasicMaterial color="#ff9800" wireframe />
        </mesh>
      )}
    </group>
  );
};

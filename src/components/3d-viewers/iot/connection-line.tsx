"use client";

import { Line } from '@react-three/drei';

interface ConnectionLineProps {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
  lineWidth?: number;
  dashed?: boolean;
}

export const ConnectionLine = ({ 
  start, 
  end, 
  color = '#ffffff', 
  lineWidth = 1,
  dashed = false 
}: ConnectionLineProps) => {
  return (
    <Line
      points={[start, end]}
      color={color}
      lineWidth={lineWidth}
      dashed={dashed}
      dashScale={50}
      dashSize={0.1}
      gapSize={0.05}
      transparent
      opacity={0.6}
    />
  );
};

"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useState } from "react";

const PlaceholderBox = ({ color }: { color: string }) => {
  return (
    <mesh>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

const Viewer = () => {
  const [accent, setAccent] = useState<string>("#06b6d4");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const cs = getComputedStyle(document.documentElement);
    const val = cs.getPropertyValue("--accent").trim();
    if (val) setAccent(val);
  }, []);

  return (
    <div className="w-full h-full bg-background/50">
      <Canvas camera={{ position: [3, 2, 3], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <PlaceholderBox color={accent || "#06b6d4"} />
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default Viewer;

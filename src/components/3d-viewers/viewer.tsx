"use client";
import { Canvas } from "@react-three/fiber";
import { Grid, OrbitControls, Stats } from "@react-three/drei";
import { useEffect, useState } from "react";
import { AxesWithLabels } from "./standards/axes-with-labels";

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
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <PlaceholderBox color={accent || "#06b6d4"} />
        <OrbitControls />
        {/* <axesHelper args={[5]} /> */}
        <AxesWithLabels size={4} fontSize={0.3} labelOffset={4.2} billboard />
        <Grid
          infiniteGrid
          sectionColor="#444"
          cellColor="#666"
          fadeDistance={60}
          fadeStrength={1}
          sectionThickness={0.5}
          cellThickness={0.3}
        />
        <Stats />
      </Canvas>
    </div>
  );
}

export default Viewer;

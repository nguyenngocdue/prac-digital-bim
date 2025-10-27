
"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function Box() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#4f46e5" />
    </mesh>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
        <h1 className="mb-8 text-3xl font-bold text-center text-black dark:text-zinc-50">Web3D Demo with Next.js, Three Fiber, Tailwind, shadcn/ui</h1>
        <div className="w-full h-[400px] rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 mb-8">
          <Canvas camera={{ position: [2, 2, 2], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <Box />
            <OrbitControls />
          </Canvas>
        </div>
        <a href="/shadcn-demo" className="underline text-blue-600 dark:text-blue-400">View shadcn/ui Button Demo</a>
      </main>
    </div>
  );
}

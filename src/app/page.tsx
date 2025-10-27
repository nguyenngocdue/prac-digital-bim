
"use client";
import PanelsLayout from "@/components/panels-layout";

const Home = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background font-sans">
      <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-foreground">
        <h1 className="mb-8 text-3xl font-bold text-center">Web3D Demo with Next.js, Three Fiber, Tailwind, shadcn/ui</h1>
        <PanelsLayout />
      </main>
    </div>
  );
}

export default Home;

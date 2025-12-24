"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { FC } from "react";

/**
 * Home page - Landing page with navigation to main features
 */
const Home: FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background font-sans">
      <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-foreground">
        <h1 className="mb-8 text-center text-3xl font-bold">
          Web3D Demo with Next.js, Three Fiber, Tailwind, shadcn/ui
        </h1>
        
        <div className="flex gap-4">
          <Link href="/project">
            <Button size="lg" variant="default">
              Go to Projects
            </Button>
          </Link>
          
          <Link href="/project/viewer">
            <Button size="lg" variant="outline">
              3D Viewer
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Home;

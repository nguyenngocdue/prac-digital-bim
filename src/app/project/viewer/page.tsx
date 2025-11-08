"use client";
import { Suspense } from 'react';
import ProjectDetail from '@/tanstack/project/project-detail';

export default function AppProjectPage() {
  return (
    <Suspense fallback={<div className="w-full h-full flex items-center justify-center">Loading...</div>}>
      <ProjectDetail />
    </Suspense>
  );
}

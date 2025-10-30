"use client";
import ProjectDetail from '@/tanstack/project/project-detail';
import { Suspense } from 'react';

export default function AppProjectPage() {
  return (
    <Suspense fallback={<div>Loading project...</div>}>
      <ProjectDetail />
    </Suspense>
  );
}

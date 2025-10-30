"use client";
import ProjectIndex from '@/tanstack/project/project-index';
import { Suspense } from 'react';

export default function ProjectPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProjectIndex />
    </Suspense>
  );
}

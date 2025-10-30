"use client";
import { useState } from "react";
import { createBrowserHistory } from "@tanstack/history";
import { createRouter, createRootRoute, createRoute, RouterProvider } from "@tanstack/react-router";
import ProjectIndex from "./project-index";
import ProjectDetail from "./project-detail";

const rootRoute = createRootRoute({ component: () => null });

const projectDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/project/:id",
  component: ProjectDetail,
});

const projectIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/project",
  component: ProjectIndex,
});

const ProjectRouter = () => {
  const [router] = useState<any>(() =>
    createRouter({
      history: createBrowserHistory(),
      routeTree: rootRoute.addChildren([projectIndexRoute, projectDetailRoute]),
    } as any)
  );

  const RP: any = RouterProvider;
  if (!router) return null;
  return <RP router={router as any} />;
};

export default ProjectRouter;

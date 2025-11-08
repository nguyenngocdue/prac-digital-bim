"use client";
import React from "react";
import { createBrowserHistory } from "@tanstack/history";
import {
  createRouter,
  RouterProvider,
  createRootRoute,
  createRoute,
  Outlet,
} from "@tanstack/react-router";
import ProjectIndex from "./project/project-index";
import View3dPanelsLayout from "@/components/3d-viewers/layouts";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <View3dPanelsLayout />,
});

const projectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/project",
  // Render the project index (list + create) at /project
  component: ProjectIndex,
});

const AppRouter = () => {
  // create the router only on the client to avoid SSR errors (history uses window)
  const [router] = React.useState<any>(() =>
    createRouter({
      history: createBrowserHistory(),
      // create a routeTree from the root and its children
      routeTree: rootRoute.addChildren([homeRoute, projectRoute]),
    } as any)
  );

  // RouterProvider renders Matches internally; pass router as any to avoid strict types here
  const RP: any = RouterProvider;
  if (!router) return null;
  return <RP router={router as any} />;
};

export default AppRouter;

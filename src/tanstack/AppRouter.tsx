"use client";
import React, { useEffect } from "react";
import { createBrowserHistory } from "@tanstack/history";
import {
  createRouter,
  RouterProvider,
  createRootRoute,
  createRoute,
  Outlet,
} from "@tanstack/react-router";
import PanelsLayout from "@/components/panels-layout";
import ProjectIndex from "./project/project-index";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <PanelsLayout />,
});

const projectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/project",
  // Render the project index (list + create) at /project
  component: ProjectIndex,
});

const AppRouter = () => {
  // create the router only on the client to avoid SSR errors (history uses window)
  const [router, setRouter] = React.useState<any>(null);

  useEffect(() => {
    const r = createRouter({
      history: createBrowserHistory(),
      // create a routeTree from the root and its children
      routeTree: rootRoute.addChildren([homeRoute, projectRoute]),
    } as any);
    // NOTE: we need to reference projectRoute variable; avoid shadowing
    // but TS/ES imports here are fine — recreate router and set it
    setRouter(r);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // RouterProvider renders Matches internally; pass router as any to avoid strict types here
  const RP: any = RouterProvider;
  if (!router) return null;
  return <RP router={router as any} />;
};

export default AppRouter;

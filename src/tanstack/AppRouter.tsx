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
import PanelsLayout from "@/components/panels-layout";
import ProjectClientPage from "./ProjectClientPage";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const homeRoute = createRoute({
  getParent: () => rootRoute,
  path: "/",
  component: () => <PanelsLayout />,
});

const projectRoute = createRoute({
  getParent: () => rootRoute,
  path: "/project/:id",
  component: ProjectClientPage,
});

const router = createRouter({
  history: createBrowserHistory(),
  routes: [rootRoute, homeRoute, projectRoute],
});

const AppRouter = () => {
  return (
    <RouterProvider router={router}>
      {/* Router renders the matched route's component via the root Outlet */}
      <Outlet />
    </RouterProvider>
  );
};

export default AppRouter;

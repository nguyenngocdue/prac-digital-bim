"use client";
import React, { useEffect, useMemo, useState } from "react";
import { AppProvider } from "@/stores/context";
import { AppStore } from "@/stores/app-store";
import { effect } from "@preact/signals-react";
import SuspensePage from "@/components/suspense/suspense-page";

type Props = {
  children: React.ReactNode;
};

/**
 * Client-side wrapper that creates a single AppStore instance and
 * provides it via AppProvider. The store is disposed on unmount.
 */
export default function ClientProviders({ children }: Props) {
  const appStore = useMemo(() => new AppStore(), []);
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    // dispose on unmount
    return () => {
      try {
        appStore.dispose();
      } catch (e) {
        // swallow - dispose should be safe to call
      }
    };
  }, [appStore]);

  useEffect(() => {
    // call app initialization (may set appReady.value = true when done)
    // fire-and-forget
    void appStore.init();
  }, [appStore]);

  useEffect(() => {
    // subscribe to the appReady signal using preact effect
    const un = effect(() => {
      setReady(Boolean(appStore.appReady?.value));
    });
    return () => {
      try {
        un();
      } catch (e) {
        // ignore
      }
    };
  }, [appStore]);

  // while not ready, show a lightweight fallback
  if (!ready) {
    return (
      <AppProvider appStore={appStore}>
        <SuspensePage />
      </AppProvider>
    );
  }

  return (
    <AppProvider appStore={appStore}>
      <React.Suspense fallback={<SuspensePage />}>
      {children}
      </React.Suspense>
    </AppProvider>
  );
}

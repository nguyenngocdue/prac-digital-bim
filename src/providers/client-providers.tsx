"use client";
import React, { useEffect, useMemo, useState } from "react";
import { AppProvider } from "@/stores/context";
import { AppStore } from "@/stores/app-store";
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
    // Initialize app and wait for it to be ready
    const initAndWait = async () => {
      await appStore.init();
      // After init completes, appReady.value should be true
      setReady(appStore.appReady.value);
    };
    
    void initAndWait();
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

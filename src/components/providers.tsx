"use client";

import React, { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./theme-provider";
import { AnalyticsProvider } from "./analytics-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ("serviceWorker" in navigator && typeof window !== "undefined" && window.location.hostname !== "localhost") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("PWA Service Worker registered:", reg.scope))
        .catch((err) => console.error("PWA Service Worker registration failed:", err));
    }
  }, []);

  return (
    <SessionProvider>
      <ThemeProvider defaultTheme="dark">
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
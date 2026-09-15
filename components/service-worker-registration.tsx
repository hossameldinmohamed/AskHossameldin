"use client";

import { useEffect } from "react";

/** Registers the no-op service worker needed for PWA installability. */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Installability is a nice-to-have, not critical - fail silently.
      });
    }
  }, []);

  return null;
}

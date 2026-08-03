"use client";

import { useSyncExternalStore } from "react";

function subscribe(query: string) {
  return (callback: () => void) => {
    const mql = window.matchMedia(query);
    mql.addEventListener("change", callback);
    return () => mql.removeEventListener("change", callback);
  };
}

function snapshot(query: string) {
  return () => window.matchMedia(query).matches;
}

const subscribeReducedMotion = subscribe("(prefers-reduced-motion: reduce)");
const snapshotReducedMotion = snapshot("(prefers-reduced-motion: reduce)");

const subscribeFinePointer = subscribe("(hover: hover) and (pointer: fine)");
const snapshotFinePointer = snapshot("(hover: hover) and (pointer: fine)");

/** True when the user has requested reduced motion. Defaults to true on the server/before hydration. */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeReducedMotion, snapshotReducedMotion, () => true);
}

/** True only on devices with a precise pointer (mouse/trackpad) that supports hover. */
export function useHasFinePointer() {
  return useSyncExternalStore(subscribeFinePointer, snapshotFinePointer, () => false);
}

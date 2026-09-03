"use client";

import { useSyncExternalStore } from "react";
import { getServerSnapshot, getSnapshot, subscribe, trackerActions } from "./store";

export type { NewLeadInput, TrackerActions } from "./store";

/**
 * Subscribes the component tree to the tracker document. The action set is a
 * stable module singleton, so it never needs memoising.
 */
export function useTracker() {
  const { state, hydrated, storageBlocked } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { state, hydrated, storageBlocked, actions: trackerActions };
}

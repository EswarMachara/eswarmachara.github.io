"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  describeCloudError,
  isCloudConfigured,
  pullState,
  pushState,
  signIn,
  signOutOfCloud,
  watchUser,
} from "./cloud";
import type { CloudUser } from "./cloud";
import { getSnapshot, subscribe as subscribeStore, trackerActions } from "./store";
import { isEmptyState, syncPayload } from "./syncPayload";
import type { TrackerState } from "./types";

export type SyncStatus =
  | "unconfigured"
  | "signed-out"
  | "reconciling"
  | "synced"
  | "pushing"
  | "conflict"
  | "local-only"
  | "error";

/** Where the last-synced snapshot is persisted, so divergence survives a reload. */
const BASE_KEY = "phd-bench:sync-base";
const PUSH_DEBOUNCE_MS = 2500;

/**
 * The sync base lives in a module variable, with localStorage only as
 * persistence across reloads.
 *
 * Reading it back from storage on every comparison made a storage failure
 * catastrophic: a refused write meant every later read returned the old value,
 * the pusher decided nothing had changed, and the panel went on reporting "up
 * to date" while silently never saving again. In memory the same failure
 * degrades to "reconcile again on next load", which is recoverable.
 */
let baseMemory: string | null = null;
let basePersisted = true;

function readBase(): string | null {
  if (baseMemory !== null) return baseMemory;
  try {
    baseMemory = window.localStorage.getItem(BASE_KEY);
  } catch {
    baseMemory = null;
  }
  return baseMemory;
}

function writeBase(payload: string | null): void {
  baseMemory = payload;
  try {
    if (payload === null) window.localStorage.removeItem(BASE_KEY);
    else window.localStorage.setItem(BASE_KEY, payload);
    basePersisted = true;
  } catch {
    basePersisted = false;
  }
}

export interface ConflictInfo {
  localState: TrackerState;
  cloudState: TrackerState;
  cloudUpdatedAt: string;
}

/**
 * Drives optional cloud sync.
 *
 * On sign-in it compares three things: the local copy, the cloud copy, and the
 * snapshot recorded at the last successful sync. That is what distinguishes
 * "the other device edited this" from "I edited this", and it refuses to guess
 * when both are true.
 */
export function useCloudSync(state: TrackerState, hydrated: boolean) {
  const configured = isCloudConfigured();
  const [user, setUser] = useState<CloudUser | null>(null);
  const [status, setStatus] = useState<SyncStatus>(configured ? "signed-out" : "unconfigured");
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState<ConflictInfo | null>(null);

  const reconciledRef = useRef(false);
  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** The payload of the last push that failed, so a failure is not retried in a loop. */
  const failedPayloadRef = useRef<string | null>(null);

  useEffect(() => {
    if (!configured) return undefined;
    return watchUser((next) => {
      setUser(next);
      if (!next) {
        reconciledRef.current = false;
        failedPayloadRef.current = null;
        setStatus("signed-out");
        setConflict(null);
        // The base is deliberately kept: edits made while signed out are still
        // measured against the last agreed snapshot on the next sign-in.
      }
    });
  }, [configured]);

  // Another tab writing the same localStorage key means this tab's copy, and
  // therefore its base, is stale. Re-reconcile rather than pushing over it.
  useEffect(() => {
    if (!configured || typeof window === "undefined") return undefined;
    const onStorage = (event: StorageEvent) => {
      if (event.key !== BASE_KEY && event.key !== "phd-bench:v1") return;
      baseMemory = null;
      reconciledRef.current = false;
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [configured]);

  const doPush = useCallback(async (uid: string, snapshot?: TrackerState) => {
    const current = snapshot ?? getSnapshot().state;
    const payload = syncPayload(current);
    setStatus("pushing");
    try {
      const at = await pushState(uid, current);
      writeBase(payload);
      failedPayloadRef.current = null;
      trackerActions.markSynced(at);
      // A base we could not persist means the next reload has to reconcile from
      // scratch. Say so rather than claiming a clean sync.
      setStatus(basePersisted ? "synced" : "local-only");
      setError(
        basePersisted
          ? null
          : "Saved to the cloud, but this browser refused to record the sync point. It will re-check on the next load.",
      );
    } catch (caught) {
      failedPayloadRef.current = payload;
      setStatus("error");
      setError(describeCloudError(caught).message);
    }
  }, []);

  /** Applies a cloud copy locally, refusing if the local copy moved mid-flight. */
  const applyCloud = useCallback((cloudState: TrackerState, cloudUpdatedAt: string, expectedLocal: string) => {
    const nowLocal = syncPayload(getSnapshot().state);
    if (nowLocal !== expectedLocal) {
      // The user typed while the fetch was in flight. Overwriting would discard
      // those edits without ever telling them.
      setConflict({ localState: getSnapshot().state, cloudState, cloudUpdatedAt });
      setStatus("conflict");
      return;
    }
    trackerActions.replaceState({ ...cloudState, lastSyncAt: cloudUpdatedAt });
    writeBase(syncPayload(cloudState));
    failedPayloadRef.current = null;
    setStatus(basePersisted ? "synced" : "local-only");
    setError(null);
  }, []);

  // Reconcile once per sign-in, after local state has been read from storage.
  useEffect(() => {
    if (!configured || !user || !hydrated || reconciledRef.current) return;
    reconciledRef.current = true;

    (async () => {
      setStatus("reconciling");
      setError(null);
      try {
        const local = getSnapshot().state;
        const localPayload = syncPayload(local);
        const snapshot = await pullState(user.uid);

        if (!snapshot) {
          // Nothing in the cloud yet. Seed it from whatever is here.
          await doPush(user.uid, local);
          return;
        }

        const cloudPayload = syncPayload(snapshot.state);
        if (cloudPayload === localPayload) {
          writeBase(localPayload);
          trackerActions.markSynced(snapshot.updatedAt);
          setStatus(basePersisted ? "synced" : "local-only");
          return;
        }

        const base = readBase();
        if (base === null) {
          // First sync on this device, so there is no shared ancestor to
          // attribute the difference to. An empty side is safe to overwrite;
          // otherwise the choice belongs to the user.
          if (isEmptyState(local)) {
            applyCloud(snapshot.state, snapshot.updatedAt, localPayload);
          } else if (isEmptyState(snapshot.state)) {
            await doPush(user.uid, local);
          } else {
            setConflict({ localState: local, cloudState: snapshot.state, cloudUpdatedAt: snapshot.updatedAt });
            setStatus("conflict");
          }
          return;
        }

        const localChanged = localPayload !== base;
        const cloudChanged = cloudPayload !== base;

        if (localChanged && cloudChanged) {
          setConflict({ localState: local, cloudState: snapshot.state, cloudUpdatedAt: snapshot.updatedAt });
          setStatus("conflict");
        } else if (cloudChanged) {
          applyCloud(snapshot.state, snapshot.updatedAt, localPayload);
        } else {
          await doPush(user.uid, local);
        }
      } catch (caught) {
        setStatus("error");
        setError(describeCloudError(caught).message);
      }
    })();
  }, [configured, user, hydrated, doPush, applyCloud]);

  // Auto-push edits once reconciled, debounced so a burst of typing is one write.
  useEffect(() => {
    if (!configured || !user) return undefined;
    // Never auto-push out of a state the user has to resolve, out of a
    // reconcile in flight, or straight back into a failure that just happened.
    if (status === "conflict" || status === "reconciling" || status === "pushing" || status === "error") {
      return undefined;
    }
    const base = readBase();
    if (base === null) return undefined;
    const payload = syncPayload(state);
    if (payload === base) return undefined;
    if (payload === failedPayloadRef.current) return undefined;

    if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    pushTimerRef.current = setTimeout(() => {
      void doPush(user.uid, state);
    }, PUSH_DEBOUNCE_MS);

    return () => {
      if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    };
  }, [state, configured, user, status, doPush]);

  const beginSignIn = useCallback(async () => {
    setError(null);
    try {
      await signIn();
    } catch (caught) {
      setStatus("error");
      setError(describeCloudError(caught).message);
    }
  }, []);

  const endSession = useCallback(async () => {
    try {
      await signOutOfCloud();
    } catch (caught) {
      setError(describeCloudError(caught).message);
    }
  }, []);

  const resolveConflict = useCallback(
    async (keep: "local" | "cloud") => {
      if (!user || !conflict) return;
      const chosen = conflict;
      setConflict(null);
      failedPayloadRef.current = null;
      if (keep === "local") {
        await doPush(user.uid, getSnapshot().state);
      } else {
        trackerActions.replaceState({ ...chosen.cloudState, lastSyncAt: chosen.cloudUpdatedAt });
        writeBase(syncPayload(chosen.cloudState));
        setStatus(basePersisted ? "synced" : "local-only");
        setError(null);
      }
    },
    [user, conflict, doPush],
  );

  const pushNow = useCallback(async () => {
    if (!user) return;
    // An unresolved conflict must be answered explicitly. Letting this button
    // push would silently decide it in favour of whichever copy is local.
    if (conflict) return;
    failedPayloadRef.current = null;
    await doPush(user.uid, getSnapshot().state);
  }, [user, conflict, doPush]);

  /** Re-runs reconciliation, used by the retry affordance after an error. */
  const retry = useCallback(() => {
    baseMemory = null;
    reconciledRef.current = false;
    failedPayloadRef.current = null;
    setError(null);
    setStatus("reconciling");
    // Nudge the store so the reconcile effect's guard re-evaluates.
    const unsubscribe = subscribeStore(() => {});
    unsubscribe();
    setUser((current) => (current ? { ...current } : current));
  }, []);

  return {
    configured,
    user,
    status,
    error,
    conflict,
    signIn: beginSignIn,
    signOut: endSession,
    resolveConflict,
    pushNow,
    retry,
  };
}

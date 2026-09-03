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
import { getSnapshot, trackerActions } from "./store";
import type { TrackerState } from "./types";

export type SyncStatus = "unconfigured" | "signed-out" | "reconciling" | "synced" | "pushing" | "conflict" | "error";

/** Where the last-synced snapshot is kept, so divergence can be attributed. */
const BASE_KEY = "phd-bench:sync-base";
const PUSH_DEBOUNCE_MS = 2500;

/**
 * The bytes that define "has this changed".
 *
 * The synced fields are listed explicitly rather than destructured out of the
 * whole object, so `updatedAt`, `lastSyncAt` and `lastBackupAt` cannot make
 * recording a sync look like a fresh edit and start a push loop. Listing them
 * also means a bookkeeping field added later is excluded by default, which is
 * the safe direction to fail in.
 */
function syncPayload(state: TrackerState): string {
  return JSON.stringify({
    version: state.version,
    leads: state.leads,
    documents: state.documents,
    recommenders: state.recommenders,
    tests: state.tests,
    settings: state.settings,
  });
}

function isEmptyState(state: TrackerState): boolean {
  return (
    state.leads.length === 0 &&
    state.recommenders.length === 0 &&
    state.tests.length === 0 &&
    state.documents.length === 0
  );
}

function readBase(): string | null {
  try {
    return window.localStorage.getItem(BASE_KEY);
  } catch {
    return null;
  }
}

function writeBase(payload: string | null): void {
  try {
    if (payload === null) window.localStorage.removeItem(BASE_KEY);
    else window.localStorage.setItem(BASE_KEY, payload);
  } catch {
    // Storage refused the write. Sync still works this session; the next
    // reconcile just has no base to compare against and will ask.
  }
}

export interface ConflictInfo {
  localPayload: string;
  cloudState: TrackerState;
  cloudUpdatedAt: string;
}

/**
 * Drives optional cloud sync.
 *
 * On sign-in it does a three-way comparison between the local copy, the cloud
 * copy, and the snapshot recorded at the last successful sync. That is what
 * lets it tell "the other device edited this" apart from "I edited this", and
 * refuse to guess when both are true.
 */
export function useCloudSync(state: TrackerState, hydrated: boolean) {
  const configured = isCloudConfigured();
  const [user, setUser] = useState<CloudUser | null>(null);
  const [status, setStatus] = useState<SyncStatus>(configured ? "signed-out" : "unconfigured");
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState<ConflictInfo | null>(null);

  const reconciledRef = useRef(false);
  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!configured) return undefined;
    return watchUser((next) => {
      setUser(next);
      if (!next) {
        reconciledRef.current = false;
        setStatus("signed-out");
        setConflict(null);
      }
    });
  }, [configured]);

  const doPush = useCallback(async (uid: string, snapshot?: TrackerState) => {
    // Read through the store rather than a captured value, so a push triggered
    // from a stale closure still sends what is actually on screen.
    const current = snapshot ?? getSnapshot().state;
    setStatus("pushing");
    try {
      const at = await pushState(uid, current);
      writeBase(syncPayload(current));
      trackerActions.markSynced(at);
      setStatus("synced");
      setError(null);
    } catch (caught) {
      setStatus("error");
      setError(describeCloudError(caught).message);
    }
  }, []);

  const doPull = useCallback(async (uid: string) => {
    try {
      const snapshot = await pullState(uid);
      if (!snapshot) return;
      trackerActions.replaceState({ ...snapshot.state, lastSyncAt: snapshot.updatedAt });
      writeBase(syncPayload(snapshot.state));
      setStatus("synced");
      setError(null);
    } catch (caught) {
      setStatus("error");
      setError(describeCloudError(caught).message);
    }
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
          await doPush(user.uid);
          return;
        }

        const cloudPayload = syncPayload(snapshot.state);
        if (cloudPayload === localPayload) {
          writeBase(localPayload);
          trackerActions.markSynced(snapshot.updatedAt);
          setStatus("synced");
          return;
        }

        const base = readBase();
        if (base === null) {
          // First sync on this device, so there is no shared ancestor to
          // attribute the difference to. An empty side is safe to overwrite;
          // otherwise the choice belongs to the user.
          if (isEmptyState(local)) {
            await doPull(user.uid);
          } else if (isEmptyState(snapshot.state)) {
            await doPush(user.uid);
          } else {
            setConflict({ localPayload, cloudState: snapshot.state, cloudUpdatedAt: snapshot.updatedAt });
            setStatus("conflict");
          }
          return;
        }

        const localChanged = localPayload !== base;
        const cloudChanged = cloudPayload !== base;

        if (localChanged && cloudChanged) {
          setConflict({ localPayload, cloudState: snapshot.state, cloudUpdatedAt: snapshot.updatedAt });
          setStatus("conflict");
        } else if (cloudChanged) {
          await doPull(user.uid);
        } else {
          await doPush(user.uid);
        }
      } catch (caught) {
        setStatus("error");
        setError(describeCloudError(caught).message);
      }
    })();
  }, [configured, user, hydrated, doPush, doPull]);

  // Auto-push edits once reconciled, debounced so a burst of typing is one write.
  useEffect(() => {
    if (!configured || !user || status === "conflict" || status === "reconciling") return undefined;
    const base = readBase();
    if (base === null || syncPayload(state) === base) return undefined;

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
      // Drop the base so the next sign-in reconciles from scratch rather than
      // trusting a snapshot that may predate edits made while signed out.
      writeBase(null);
    } catch (caught) {
      setError(describeCloudError(caught).message);
    }
  }, []);

  const resolveConflict = useCallback(
    async (keep: "local" | "cloud") => {
      if (!user || !conflict) return;
      setConflict(null);
      if (keep === "local") {
        writeBase(null);
        await doPush(user.uid);
      } else {
        trackerActions.replaceState({ ...conflict.cloudState, lastSyncAt: conflict.cloudUpdatedAt });
        writeBase(syncPayload(conflict.cloudState));
        setStatus("synced");
      }
    },
    [user, conflict, doPush],
  );

  const pushNow = useCallback(async () => {
    if (!user) return;
    await doPush(user.uid);
  }, [user, doPush]);

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
  };
}

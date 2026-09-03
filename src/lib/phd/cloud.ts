import { normalizeState } from "./storage";
import type { TrackerState } from "./types";

/**
 * Optional cloud sync for the tracker.
 *
 * Everything here is inert unless the four NEXT_PUBLIC_FIREBASE_* variables are
 * present at build time. With no configuration the tracker stays exactly what
 * it was: a browser-local app. With configuration it gains Google sign-in and a
 * single Firestore document per user, so the same bench opens on a phone and a
 * laptop.
 *
 * The whole tracker travels as one JSON string in one document rather than as a
 * collection per entity. That keeps every write atomic, sidesteps Firestore's
 * nested-array rules, and means a half-finished sync can never leave the bench
 * internally inconsistent. The cost is that the data is not queryable
 * server-side, which nothing here needs.
 */

export interface CloudConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
}

export interface CloudUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface CloudSnapshot {
  state: TrackerState;
  /** Server-side write time of the document, as an ISO string. */
  updatedAt: string;
}

/** Firestore rejects documents over 1 MiB; stop well short with a clear message. */
const MAX_PAYLOAD_BYTES = 900_000;

const CONFIG: CloudConfig | null = (() => {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
  if (!apiKey || !authDomain || !projectId || !appId) return null;
  return { apiKey, authDomain, projectId, appId };
})();

export function isCloudConfigured(): boolean {
  return CONFIG !== null;
}

export function cloudProjectId(): string | null {
  return CONFIG?.projectId ?? null;
}

/**
 * Lazily created Firebase handles. The SDK is imported on first use rather than
 * at module scope so a visitor who never signs in never downloads it.
 */
interface Handles {
  auth: import("firebase/auth").Auth;
  db: import("firebase/firestore").Firestore;
  provider: import("firebase/auth").GoogleAuthProvider;
}

let handlesPromise: Promise<Handles> | null = null;

function loadHandles(): Promise<Handles> {
  if (!CONFIG) return Promise.reject(new Error("Cloud sync is not configured for this build."));
  if (handlesPromise) return handlesPromise;

  handlesPromise = (async () => {
    const [{ initializeApp, getApps, getApp }, authModule, firestoreModule] = await Promise.all([
      import("firebase/app"),
      import("firebase/auth"),
      import("firebase/firestore"),
    ]);
    // getApps() guards against re-initialising across a fast refresh.
    const app = getApps().length > 0 ? getApp() : initializeApp(CONFIG);
    return {
      auth: authModule.getAuth(app),
      db: firestoreModule.getFirestore(app),
      provider: new authModule.GoogleAuthProvider(),
    };
  })();

  return handlesPromise;
}

/**
 * Subscribes to sign-in state. Returns an unsubscribe function immediately;
 * if the SDK fails to load, the callback is invoked with null so the UI settles
 * on "signed out" rather than hanging on a spinner.
 */
export function watchUser(callback: (user: CloudUser | null) => void): () => void {
  if (!CONFIG) {
    callback(null);
    return () => {};
  }

  let cancelled = false;
  let inner: (() => void) | null = null;

  loadHandles()
    .then(async ({ auth }) => {
      if (cancelled) return;
      const { onAuthStateChanged } = await import("firebase/auth");
      if (cancelled) return;
      inner = onAuthStateChanged(auth, (user) => {
        callback(
          user ? { uid: user.uid, email: user.email, displayName: user.displayName } : null,
        );
      });
    })
    .catch(() => {
      if (!cancelled) callback(null);
    });

  return () => {
    cancelled = true;
    if (inner) inner();
  };
}

export async function signIn(): Promise<CloudUser> {
  const { auth, provider } = await loadHandles();
  const { signInWithPopup } = await import("firebase/auth");
  const result = await signInWithPopup(auth, provider);
  return {
    uid: result.user.uid,
    email: result.user.email,
    displayName: result.user.displayName,
  };
}

export async function signOutOfCloud(): Promise<void> {
  const { auth } = await loadHandles();
  const { signOut } = await import("firebase/auth");
  await signOut(auth);
}

async function stateDocRef(uid: string) {
  const { db } = await loadHandles();
  const { doc } = await import("firebase/firestore");
  // One document, one owner. The security rules scope writes to users/{uid}.
  return doc(db, "users", uid, "tracker", "state");
}

/** Reads the cloud copy. Returns null when the user has never pushed. */
export async function pullState(uid: string): Promise<CloudSnapshot | null> {
  const ref = await stateDocRef(uid);
  const { getDoc } = await import("firebase/firestore");
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const data = snap.data();
  const payload = typeof data.payload === "string" ? data.payload : null;
  if (!payload) throw new Error("The cloud copy is missing its payload field.");

  let parsed: unknown;
  try {
    parsed = JSON.parse(payload);
  } catch {
    throw new Error("The cloud copy could not be parsed as JSON.");
  }

  // Run the same validator local data goes through, so a corrupted or
  // hand-edited cloud document cannot introduce shapes the app cannot render.
  const state = normalizeState(parsed);
  const updatedAt =
    typeof data.updatedAtIso === "string" ? data.updatedAtIso : new Date().toISOString();
  return { state, updatedAt };
}

/** Writes the whole tracker to the cloud and returns the write time. */
export async function pushState(uid: string, state: TrackerState): Promise<string> {
  const payload = JSON.stringify(state);
  const bytes = new TextEncoder().encode(payload).length;
  if (bytes > MAX_PAYLOAD_BYTES) {
    throw new Error(
      `This bench is ${Math.round(bytes / 1024)} KB, over the ${Math.round(MAX_PAYLOAD_BYTES / 1024)} KB per-document ceiling. Export a backup and trim closed-out leads.`,
    );
  }

  const ref = await stateDocRef(uid);
  const { setDoc, serverTimestamp } = await import("firebase/firestore");
  const updatedAtIso = new Date().toISOString();
  await setDoc(ref, {
    payload,
    version: state.version,
    leadCount: state.leads.length,
    updatedAtIso,
    // serverTimestamp is the authoritative record; updatedAtIso is what the UI
    // reads back, since a server timestamp is null in the local echo of a write.
    updatedAt: serverTimestamp(),
  });
  return updatedAtIso;
}

export interface CloudErrorInfo {
  message: string;
  /** True for the causes the user can actually fix themselves. */
  actionable: boolean;
}

/** Turns a Firebase error into something worth showing a person. */
export function describeCloudError(error: unknown): CloudErrorInfo {
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
  const raw = error instanceof Error ? error.message : "Unknown error";

  switch (code) {
    case "auth/popup-blocked":
      return { message: "The sign-in popup was blocked. Allow popups for this site and try again.", actionable: true };
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return { message: "Sign-in was cancelled.", actionable: true };
    case "auth/unauthorized-domain":
      return {
        message:
          "This domain is not in the Firebase project's authorised list. Add it under Authentication, Settings, Authorised domains.",
        actionable: true,
      };
    case "auth/network-request-failed":
      return { message: "The network request failed. Check your connection and try again.", actionable: true };
    case "permission-denied":
      return {
        message: "Firestore refused the write. Check the security rules scope reads and writes to users/{uid}.",
        actionable: true,
      };
    case "unavailable":
      return { message: "Firestore is unreachable right now. Your local copy is untouched.", actionable: false };
    default:
      return { message: raw, actionable: false };
  }
}

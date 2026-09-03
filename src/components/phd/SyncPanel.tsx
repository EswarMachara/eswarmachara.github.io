"use client";

import { FaCircleCheck, FaCloudArrowUp, FaGoogle, FaRotate, FaTriangleExclamation } from "react-icons/fa6";
import { cloudProjectId } from "@/lib/phd/cloud";
import type { SyncStatus } from "@/lib/phd/useCloudSync";
import type { useCloudSync } from "@/lib/phd/useCloudSync";
import { EmptyNote, GhostButton, SectionLabel, SolidButton } from "./ui";

type Sync = ReturnType<typeof useCloudSync>;

const STATUS_COPY: Record<SyncStatus, string> = {
  unconfigured: "Not configured for this build",
  "signed-out": "Signed out, working locally",
  reconciling: "Checking the cloud copy…",
  synced: "Up to date",
  pushing: "Saving…",
  conflict: "Both copies changed",
  error: "Sync problem",
};

const RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }
  }
}`;

export default function SyncPanel({ sync, lastSyncAt }: { sync: Sync; lastSyncAt?: string }) {
  if (!sync.configured) {
    return (
      <div className="space-y-5">
        <SectionLabel>Cloud sync</SectionLabel>
        <EmptyNote>
          Cloud sync is off for this build, so the tracker is browser-local. That is a safe default, not a
          failure: nothing leaves this device.
        </EmptyNote>
        <div className="rounded-lg border border-stone-200 bg-paper-raised/40 px-5 py-4">
          <h4 className="font-heading text-base font-medium text-ink">Turning it on</h4>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Sync needs a Firebase project of your own. Once these four variables exist at build time, a Google
            sign-in button appears here and the same bench opens on any device.
          </p>
          <ol className="mt-3 space-y-2 text-sm leading-relaxed text-ink-soft">
            <li className="flex gap-2">
              <span className="shrink-0 font-semibold text-ink">1.</span>
              Create a Firebase project, enable Google sign-in under Authentication, and create a Firestore
              database.
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 font-semibold text-ink">2.</span>
              Under Authentication, Settings, Authorised domains, add the domain this page is served from.
              Sign-in fails without it.
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 font-semibold text-ink">3.</span>
              Publish these Firestore rules so only you can read your own data:
            </li>
          </ol>
          <pre className="mt-3 overflow-x-auto rounded-md border border-stone-200 bg-paper p-3 text-[0.7rem] leading-relaxed text-ink-soft">
            {RULES}
          </pre>
          <ol className="mt-3 space-y-2 text-sm leading-relaxed text-ink-soft" start={4}>
            <li className="flex gap-2">
              <span className="shrink-0 font-semibold text-ink">4.</span>
              Add the web app config as repository secrets and expose them to the build as{" "}
              <code className="rounded bg-stone-100 px-1 text-[0.75rem]">NEXT_PUBLIC_FIREBASE_API_KEY</code>,{" "}
              <code className="rounded bg-stone-100 px-1 text-[0.75rem]">NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</code>,{" "}
              <code className="rounded bg-stone-100 px-1 text-[0.75rem]">NEXT_PUBLIC_FIREBASE_PROJECT_ID</code> and{" "}
              <code className="rounded bg-stone-100 px-1 text-[0.75rem]">NEXT_PUBLIC_FIREBASE_APP_ID</code>.
            </li>
          </ol>
          <p className="mt-3 text-xs leading-relaxed text-ink-soft/80">
            A Firebase web config is an identifier rather than a secret, so it ends up readable in the built page
            either way. What actually protects the data is the rule above, which is why it is worth pasting exactly.
          </p>
        </div>
      </div>
    );
  }

  const tone =
    sync.status === "error" || sync.status === "conflict"
      ? "border-track-rejected/35 bg-track-rejected/5"
      : sync.status === "synced"
        ? "border-track-offer/30 bg-track-offer/5"
        : "border-stone-200 bg-paper-raised/40";

  return (
    <div className="space-y-5">
      <SectionLabel action={<span className="text-xs text-ink-soft">{cloudProjectId()}</span>}>
        Cloud sync
      </SectionLabel>

      <div className={`rounded-lg border px-5 py-4 ${tone}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {sync.status === "synced" ? (
              <FaCircleCheck size={14} className="text-track-offer" />
            ) : sync.status === "error" || sync.status === "conflict" ? (
              <FaTriangleExclamation size={14} className="text-track-rejected" />
            ) : (
              <FaRotate size={14} className="text-ink-soft" />
            )}
            <div>
              <p className="text-sm font-medium text-ink">{STATUS_COPY[sync.status]}</p>
              {sync.user && (
                <p className="text-xs text-ink-soft">
                  {sync.user.email ?? sync.user.displayName ?? sync.user.uid}
                  {lastSyncAt && ` · last synced ${new Date(lastSyncAt).toLocaleString()}`}
                </p>
              )}
            </div>
          </div>

          {sync.user ? (
            <div className="flex items-center gap-2">
              <GhostButton onClick={() => void sync.pushNow()}>
                <FaCloudArrowUp size={11} /> Save now
              </GhostButton>
              <GhostButton onClick={() => void sync.signOut()}>Sign out</GhostButton>
            </div>
          ) : (
            <SolidButton onClick={() => void sync.signIn()}>
              <FaGoogle size={13} /> Sign in with Google
            </SolidButton>
          )}
        </div>

        {sync.error && <p className="mt-3 text-sm leading-relaxed text-track-rejected">{sync.error}</p>}
      </div>

      {sync.conflict && (
        <div className="rounded-lg border border-track-rejected/35 bg-track-rejected/5 px-5 py-4">
          <h4 className="font-heading text-base font-medium text-ink">Both copies changed</h4>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            This browser and the cloud copy have both been edited since they last agreed, so there is no safe
            automatic answer. Pick one to keep. Nothing is merged, and the copy you do not pick is overwritten, so
            take a backup first if you are unsure.
          </p>
          <ul className="mt-3 space-y-1 text-sm text-ink-soft">
            <li>
              This browser: <span className="font-medium text-ink">{sync.conflict.localPayload.length > 0 ? "local edits present" : "empty"}</span>
            </li>
            <li>
              Cloud copy: <span className="font-medium text-ink">{sync.conflict.cloudState.leads.length} leads</span>, saved{" "}
              {new Date(sync.conflict.cloudUpdatedAt).toLocaleString()}
            </li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-3">
            <GhostButton onClick={() => void sync.resolveConflict("local")}>Keep this browser</GhostButton>
            <GhostButton onClick={() => void sync.resolveConflict("cloud")}>Keep the cloud copy</GhostButton>
          </div>
        </div>
      )}

      <p className="text-xs leading-relaxed text-ink-soft">
        Edits save to the cloud a couple of seconds after you stop typing. The local copy stays authoritative
        while you work, so losing connectivity mid-session costs nothing.
      </p>
    </div>
  );
}

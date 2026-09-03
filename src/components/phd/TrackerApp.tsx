"use client";

import { useMemo, useRef, useState } from "react";
import {
  FaCalendarPlus,
  FaCircleExclamation,
  FaDownload,
  FaCloud,
  FaLayerGroup,
  FaLock,
  FaPlus,
  FaTrashCan,
  FaUpload,
} from "react-icons/fa6";
import { allDates, buildAlerts, buildStats } from "@/lib/phd/derive";
import { buildCalendar } from "@/lib/phd/ics";
import { downloadFile, exportFilename } from "@/lib/phd/storage";
import { useCloudSync } from "@/lib/phd/useCloudSync";
import { useTracker } from "@/lib/phd/useTracker";
import AddLeadDialog from "./AddLeadDialog";
import BulkAddDialog from "./BulkAddDialog";
import DashboardView from "./DashboardView";
import DeadlinesView from "./DeadlinesView";
import InsightsView from "./InsightsView";
import LeadDrawer from "./LeadDrawer";
import LeadTable from "./LeadTable";
import InterviewsView from "./InterviewsView";
import MaterialsView from "./MaterialsView";
import OffersView from "./OffersView";
import PipelineView from "./PipelineView";
import RecommendersView from "./RecommendersView";
import SyncPanel from "./SyncPanel";
import { GhostButton } from "./ui";

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "dates", label: "Dates" },
  { id: "pipeline", label: "Pipeline" },
  { id: "list", label: "All leads" },
  { id: "letters", label: "Letters" },
  { id: "interviews", label: "Interviews" },
  { id: "offers", label: "Decide" },
  { id: "insights", label: "Insights" },
  { id: "materials", label: "Materials" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function TrackerApp() {
  const { state, hydrated, storageBlocked, actions } = useTracker();
  const sync = useCloudSync(state, hydrated);
  const [tab, setTab] = useState<TabId>("dashboard");
  const [openLeadId, setOpenLeadId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [bulkAdding, setBulkAdding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Alerts and stats are pure functions of state, so they recompute on any edit.
  const alerts = useMemo(() => (hydrated ? buildAlerts(state) : []), [state, hydrated]);
  const stats = useMemo(() => buildStats(state.leads), [state.leads]);
  const openLead = openLeadId ? state.leads.find((lead) => lead.id === openLeadId) ?? null : null;
  const pendingInterviews = useMemo(
    () => state.leads.reduce((count, lead) => count + lead.interviews.filter((entry) => !entry.done).length, 0),
    [state.leads],
  );
  const offerCount = useMemo(
    () => state.leads.filter((lead) => lead.status === "offer" || lead.status === "waitlisted").length,
    [state.leads],
  );
  const urgentDates = useMemo(
    () => allDates(state.leads).filter((item) => item.tone === "pressure" && item.days >= 0 && item.days <= 14).length,
    [state.leads],
  );

  const flash = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice((current) => (current === message ? null : current)), 4000);
  };

  const handleExport = () => {
    downloadFile(exportFilename("phd-bench", "json"), JSON.stringify(state, null, 2), "application/json");
    actions.markBackedUp();
    flash("Backup downloaded. Keep it somewhere you will find it again.");
  };

  const handleCalendar = () => {
    const calendar = buildCalendar(state);
    const events = calendar.split("BEGIN:VEVENT").length - 1;
    if (events === 0) {
      flash("Nothing to export yet. Add a dated deadline to an open application first.");
      return;
    }
    downloadFile(exportFilename("phd-deadlines", "ics"), calendar, "text/calendar");
    flash(`${events} dates exported. Open the file to add them to your calendar.`);
  };

  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const raw = String(reader.result ?? "");
      // Restoring overwrites everything, so say what is about to be lost and
      // what arrives in its place before doing it.
      const summary = `Replace this bench (${state.leads.length} lead${state.leads.length === 1 ? "" : "s"}, ${state.recommenders.length} referee${state.recommenders.length === 1 ? "" : "s"}) with the contents of ${file.name}?\n\nThis cannot be undone. Take a backup first if you are unsure.`;
      if (state.leads.length > 0 && !window.confirm(summary)) {
        flash("Restore cancelled. Nothing was changed.");
        return;
      }
      const ok = actions.importState(raw);
      flash(ok ? "Backup restored." : "That file could not be read as a tracker backup.");
    };
    reader.onerror = () => flash("The file could not be opened.");
    reader.readAsText(file);
  };

  // Until the effect in useTracker has read localStorage there is nothing real to
  // show, and rendering placeholder counts would only flash wrong numbers.
  if (!hydrated) {
    return (
      <div className="mt-10 flex items-center justify-center rounded-xl border border-stone-200 bg-paper-raised/40 py-20 text-sm text-ink-soft">
        Loading your bench…
      </div>
    );
  }

  return (
    <div className="mt-10">
      {storageBlocked && (
        <p className="mb-6 flex items-start gap-2.5 rounded-lg border border-track-rejected/30 bg-track-rejected/5 px-4 py-3 text-sm text-ink">
          <FaCircleExclamation size={14} className="mt-0.5 shrink-0 text-track-rejected" />
          <span>
            This browser is refusing to save data, so nothing you type here will survive a reload. Private windows
            and blocked site data both cause this. Export a backup before you close the tab.
          </span>
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3">
        <nav aria-label="Tracker sections" className="flex flex-wrap gap-1">
          {TABS.map((entry) => {
            const active = tab === entry.id;
            const urgent =
              entry.id === "dashboard"
                ? alerts.filter((a) => a.level === "critical").length
                : entry.id === "dates"
                  ? urgentDates
                  : entry.id === "interviews"
                    ? pendingInterviews
                    : entry.id === "offers"
                      ? offerCount
                      : 0;
            return (
              <button
                key={entry.id}
                aria-current={active ? "page" : undefined}
                // Where focus lands when an overlay closes and the element that
                // opened it is gone. See useOverlay.
                data-overlay-return={active ? "" : undefined}
                type="button"
                onClick={() => setTab(entry.id)}
                className={`relative rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  active ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-raised hover:text-ink"
                }`}
              >
                {entry.label}
                {urgent > 0 && !active && (
                  <span className="ml-1.5 inline-block rounded-full bg-track-rejected px-1.5 text-[0.65rem] font-bold text-paper">
                    {urgent}
                    {/* Without this the button's accessible name reads as
                        "Dates 5", which says nothing about what the 5 counts. */}
                    <span className="sr-only"> needing attention</span>
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          {sync.configured && (
            <button
              type="button"
              onClick={() => setTab("materials")}
              title={sync.user ? `Cloud sync: ${sync.status}` : "Cloud sync available, not signed in"}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                sync.status === "error" || sync.status === "conflict"
                  ? "border-track-rejected/40 text-track-rejected"
                  : sync.status === "synced"
                    ? "border-track-offer/40 text-track-offer"
                    : "border-ink/25 text-ink-soft hover:border-ink hover:text-ink"
              }`}
            >
              <FaCloud size={11} />
              {sync.user ? (sync.status === "synced" ? "Synced" : sync.status === "pushing" ? "Saving" : "Sync") : "Sign in"}
            </button>
          )}
          <GhostButton onClick={handleCalendar}>
            <FaCalendarPlus size={11} /> Calendar
          </GhostButton>
          <GhostButton onClick={handleExport}>
            <FaDownload size={11} /> Backup
          </GhostButton>
          <GhostButton onClick={() => fileRef.current?.click()}>
            <FaUpload size={11} /> Restore
          </GhostButton>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) handleImportFile(file);
              // Clear so picking the same file twice still fires a change event.
              event.target.value = "";
            }}
          />
          <GhostButton onClick={() => setBulkAdding(true)}>
            <FaLayerGroup size={11} /> Paste list
          </GhostButton>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-1.5 text-sm font-semibold text-paper transition-colors hover:bg-ink/85"
          >
            <FaPlus size={11} /> Add lead
          </button>
        </div>
      </div>

      {/* Rendered unconditionally so insertions into it are announced. A plain
          conditional <p> is added to the DOM after the announcement window and
          screen readers stay silent. */}
      <div role="status" aria-live="polite" aria-atomic="true" className={notice ? "mt-4" : "sr-only"}>
        {notice && (
          <p className="rounded-lg border border-gold/40 bg-gold/8 px-4 py-2.5 text-sm text-ink">{notice}</p>
        )}
      </div>

      <div className="mt-8">
        {tab === "dashboard" && (
          <DashboardView
            state={state}
            alerts={alerts}
            onOpenLead={setOpenLeadId}
            onAddLead={() => setAdding(true)}
          />
        )}
        {tab === "pipeline" && (
          <PipelineView
            leads={state.leads}
            onOpenLead={setOpenLeadId}
            onMove={(id, status) => actions.setStatus(id, status)}
          />
        )}
        {tab === "dates" && <DeadlinesView state={state} onOpenLead={setOpenLeadId} />}
        {tab === "list" && <LeadTable state={state} onOpenLead={setOpenLeadId} />}
        {tab === "insights" && <InsightsView state={state} />}
        {tab === "interviews" && <InterviewsView state={state} actions={actions} onOpenLead={setOpenLeadId} />}
        {tab === "offers" && <OffersView state={state} actions={actions} onOpenLead={setOpenLeadId} />}
        {tab === "letters" && <RecommendersView state={state} actions={actions} onOpenLead={setOpenLeadId} />}
        {tab === "materials" && (
          <div className="space-y-14">
            <SyncPanel sync={sync} lastSyncAt={state.lastSyncAt} />
            <MaterialsView state={state} actions={actions} />
          </div>
        )}
      </div>

      <footer className="mt-16 border-t border-stone-200 pt-6">
        <p className="flex items-start gap-2.5 text-xs leading-relaxed text-ink-soft">
          <FaLock size={11} className="mt-0.5 shrink-0 text-gold" />
          <span>
            {sync.user ? (
              <>
                Everything on this page is stored in this browser and also saved to your own Firebase project,
                where the security rules make it readable only by your Google account. Nobody else who opens this
                link can see it. Clearing site data erases the local copy, not the cloud one.
              </>
            ) : sync.configured ? (
              <>
                Everything on this page is stored in this browser only, and nothing is uploaded while you are
                signed out. Sign in on the Materials tab to sync it to your own Firebase project. Clearing site
                data for this domain erases it.
              </>
            ) : (
              <>
                Everything on this page is stored in this browser only. It is never uploaded, never sent anywhere,
                and is not visible to anyone else who opens this link. That also means it does not follow you to
                another device, so take a backup now and then. Clearing site data for this domain erases it.
              </>
            )}
          </span>
        </p>
        {state.leads.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {confirmReset ? (
              <>
                <span className="text-xs text-ink-soft">
                  Erase all {state.leads.length} leads, {state.recommenders.length} referees and {state.tests.length} test records?
                </span>
                <GhostButton
                  danger
                  onClick={() => {
                    actions.resetAll();
                    setConfirmReset(false);
                    setOpenLeadId(null);
                    flash("Tracker cleared.");
                  }}
                >
                  Yes, erase everything
                </GhostButton>
                <GhostButton onClick={() => setConfirmReset(false)}>Cancel</GhostButton>
              </>
            ) : (
              <GhostButton danger onClick={() => setConfirmReset(true)}>
                <FaTrashCan size={10} /> Clear all data
              </GhostButton>
            )}
            <span className="text-xs text-ink-soft/70">
              {stats.total} tracked · saved {new Date(state.updatedAt).toLocaleString()}
            </span>
          </div>
        )}
      </footer>

      {adding && (
        <AddLeadDialog
          defaultIntake={state.settings.targetIntake}
          onCancel={() => setAdding(false)}
          onCreate={(input) => {
            const id = actions.addLead(input);
            setAdding(false);
            setOpenLeadId(id);
          }}
        />
      )}

      {bulkAdding && (
        <BulkAddDialog
          onCancel={() => setBulkAdding(false)}
          onCreate={(rows, presetId) => {
            const count = actions.addLeadsBulk(rows, presetId);
            setBulkAdding(false);
            flash(`${count} programme${count === 1 ? "" : "s"} added. Fill in deadlines from each department page.`);
          }}
        />
      )}

      {openLead && (
        <LeadDrawer
          // Remount per lead: the drawer holds unsaved draft text (a new
          // requirement, an advisor name, a timeline entry) that must not
          // survive a switch and land on a different application.
          key={openLead.id}
          lead={openLead}
          state={state}
          actions={actions}
          onClose={() => setOpenLeadId(null)}
          onOpenLead={setOpenLeadId}
        />
      )}
    </div>
  );
}

"use client";

import * as React from "react";
import type { AdmissionStatus } from "./constants";
import type { AdmissionFormValues } from "./schema";
import { buildSeedApplications } from "./mock-data";
import type { Application, TimelineEvent } from "./types";

/**
 * Local-state admission store, persisted to localStorage.
 *
 * The action signatures (create / update / setStatus / remove) are intentionally
 * async-friendly so they can later be swapped for real API calls
 * without touching any component.
 */

const STORAGE_KEY = "ems.admission.v1";

type LoadState = "loading" | "ready" | "error";

interface AdmissionStore {
  applications: Application[];
  state: LoadState;
  error: string | null;
  retry: () => void;
  getById: (id: string) => Application | undefined;
  create: (values: AdmissionFormValues) => Application;
  update: (id: string, values: AdmissionFormValues) => void;
  setStatus: (id: string, status: AdmissionStatus, remark?: string) => void;
  remove: (id: string) => void;
  restore: (app: Application) => void;
  resetDemoData: () => void;
}

const AdmissionContext = React.createContext<AdmissionStore | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);

function event(kind: TimelineEvent["kind"], title: string, description?: string, by = "Admissions Office"): TimelineEvent {
  return { id: uid(), kind, title, description, at: new Date().toISOString(), by };
}

function nextId(apps: Application[]) {
  const max = apps.reduce((m, a) => {
    const n = Number(a.id.split("-").pop());
    return Number.isFinite(n) && n > m ? n : m;
  }, 1000);
  return `APP-${new Date().getFullYear()}-${String(max + 1).padStart(4, "0")}`;
}

export function AdmissionProvider({ children }: { children: React.ReactNode }) {
  const [applications, setApplications] = React.useState<Application[]>([]);
  const [state, setState] = React.useState<LoadState>("loading");
  const [error, setError] = React.useState<string | null>(null);
  const [attempt, setAttempt] = React.useState(0);
  const appsRef = React.useRef<Application[]>([]);

  const commit = React.useCallback((next: Application[]) => {
    appsRef.current = next;
    setApplications(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage full or unavailable: keep working in memory.
    }
  }, []);

  // Initial load (simulated latency so loading states are visible and real in the UI)
  React.useEffect(() => {
    setState("loading");
    setError(null);
    const timer = window.setTimeout(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (!Array.isArray(parsed)) throw new Error("Stored admission data has an unexpected format.");
          appsRef.current = parsed as Application[];
          setApplications(parsed as Application[]);
        } else {
          const seed = buildSeedApplications();
          appsRef.current = seed;
          setApplications(seed);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
        }
        setState("ready");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to load admission data.");
        setState("error");
      }
    }, 450);
    return () => window.clearTimeout(timer);
  }, [attempt]);

  const value = React.useMemo<AdmissionStore>(
    () => ({
      applications,
      state,
      error,
      retry: () => setAttempt((n) => n + 1),
      getById: (id) => applications.find((a) => a.id === id),
      create: (values) => {
        const app: Application = {
          ...values,
          declaration: true,
          id: nextId(appsRef.current),
          applicationDate: new Date().toISOString(),
          status: "pending",
          timeline: [event("submitted", "Application submitted", "Application received via the admissions desk.", "Admissions Office")],
        };
        commit([app, ...appsRef.current]);
        return app;
      },
      update: (id, values) => {
        commit(
          appsRef.current.map((a) =>
            a.id === id
              ? { ...a, ...values, declaration: true, timeline: [...a.timeline, event("updated", "Application details updated")] }
              : a,
          ),
        );
      },
      setStatus: (id, status, remark) => {
        commit(
          appsRef.current.map((a) => {
            if (a.id !== id) return a;
            const decided = status === "approved" || status === "rejected";
            const ev =
              status === "approved"
                ? event("approved", "Admission approved", remark || "Application approved by the admissions office.", "Admission Committee")
                : status === "rejected"
                  ? event("rejected", "Application rejected", remark || "Application rejected by the admissions office.", "Admission Committee")
                  : status === "under_review"
                    ? event("review", "Moved to review", "Forwarded to the department for evaluation.")
                    : event("updated", "Status reset to pending");
            return {
              ...a,
              status,
              remarks: decided ? remark || a.remarks : undefined,
              decidedAt: decided ? new Date().toISOString() : undefined,
              timeline: [...a.timeline, ev],
            };
          }),
        );
      },
      remove: (id) => commit(appsRef.current.filter((a) => a.id !== id)),
      restore: (app) =>
        commit([...appsRef.current.filter((a) => a.id !== app.id), app].sort((a, b) => b.applicationDate.localeCompare(a.applicationDate))),
      resetDemoData: () => commit(buildSeedApplications()),
    }),
    [applications, state, error, commit],
  );

  return <AdmissionContext.Provider value={value}>{children}</AdmissionContext.Provider>;
}

export function useAdmissions() {
  const ctx = React.useContext(AdmissionContext);
  if (!ctx) throw new Error("useAdmissions must be used inside <AdmissionProvider>");
  return ctx;
}

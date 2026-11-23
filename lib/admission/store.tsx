"use client";

import * as React from "react";
import type { AdmissionStatus } from "./constants";
import type { AdmissionFormValues } from "./schema";
import { admissionApi, ApiError } from "./api";
import { pendingFiles } from "./pending-files";
import type { Application } from "./types";

type LoadState = "loading" | "ready" | "error";
export interface SaveResult {
  application: Application;
  failedUploads: string[];
}

interface AdmissionStore {
  applications: Application[];
  state: LoadState;
  error: string | null;
  retry: () => void;
  getById: (id: string) => Application | undefined;
  create: (values: AdmissionFormValues) => Promise<SaveResult>;
  update: (id: string, values: AdmissionFormValues) => Promise<SaveResult>;
  setStatus: (id: string, status: AdmissionStatus, remark?: string) => Promise<Application>;
  remove: (id: string) => Promise<void>;
  restore: (app: Application) => Promise<void>;
}

const AdmissionContext = React.createContext<AdmissionStore | null>(null);

const byDateDesc = (a: Application, b: Application) => b.applicationDate.localeCompare(a.applicationDate);

export function AdmissionProvider({ children }: { children: React.ReactNode }) {
  const [applications, setApplications] = React.useState<Application[]>([]);
  const [state, setState] = React.useState<LoadState>("loading");
  const [error, setError] = React.useState<string | null>(null);
  const [attempt, setAttempt] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    setState("loading");
    setError(null);
    admissionApi
      .listAll()
      .then((rows) => {
        if (cancelled) return;
        setApplications(rows);
        setState("ready");
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Unable to load admission data.");
        setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const upsert = React.useCallback((app: Application) => {
    setApplications((prev) => [app, ...prev.filter((a) => a.id !== app.id)].sort(byDateDesc));
  }, []);
  const uploadPending = React.useCallback(async (app: Application): Promise<SaveResult> => {
    let latest = app;
    const failedUploads: string[] = [];
    for (const [key, file] of pendingFiles.entries()) {
      try {
        latest = await admissionApi.uploadDocument(app.id, key, file);
      } catch (e) {
        failedUploads.push(`${file.name}${e instanceof ApiError ? ` (${e.message})` : ""}`);
      }
    }
    pendingFiles.clear();
    upsert(latest);
    return { application: latest, failedUploads };
  }, [upsert]);

  const value = React.useMemo<AdmissionStore>(
    () => ({
      applications,
      state,
      error,
      retry: () => setAttempt((n) => n + 1),
      getById: (id) => applications.find((a) => a.id === id),
      create: async (values) => uploadPending(await admissionApi.create(values)),
      update: async (id, values) => {
        const prev = applications.find((a) => a.id === id) as Record<string, unknown> | undefined;
        const body = { ...values } as Record<string, unknown>;
        for (const [key] of pendingFiles.entries()) if (prev?.[key]) body[key] = prev[key];
        return uploadPending(await admissionApi.update(id, body as unknown as AdmissionFormValues));
      },
      setStatus: async (id, status, remark) => {
        const app = await admissionApi.setStatus(id, status, remark);
        upsert(app);
        return app;
      },
      remove: async (id) => {
        await admissionApi.remove(id);
        setApplications((prev) => prev.filter((a) => a.id !== id));
      },
      restore: async (app) => upsert(await admissionApi.restore(app.id)),
    }),
    [applications, state, error, upsert, uploadPending],
  );

  return <AdmissionContext.Provider value={value}>{children}</AdmissionContext.Provider>;
}

export function useAdmissions() {
  const ctx = React.useContext(AdmissionContext);
  if (!ctx) throw new Error("useAdmissions must be used inside <AdmissionProvider>");
  return ctx;
}
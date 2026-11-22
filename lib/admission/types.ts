import type { AdmissionStatus } from "./constants";
import type { AdmissionFormValues } from "./schema";

export type TimelineKind = "submitted" | "updated" | "review" | "approved" | "rejected" | "documents";

export interface TimelineEvent {
  id: string;
  kind: TimelineKind;
  title: string;
  description?: string;
  at: string; // ISO date-time
  by: string;
}

export interface Application extends AdmissionFormValues {
  id: string; // e.g. APP-2026-0042
  applicationDate: string; // ISO date-time
  status: AdmissionStatus;
  remarks?: string;
  decidedAt?: string;
  timeline: TimelineEvent[];
}

/**
 * Types for the Events & Calendar module.
 */

export type EventCategory =
  | "academic"
  | "holiday"
  | "parent-meeting"
  | "teacher-meeting"
  | "examination";

export interface EventReminder {
  enabled: boolean;
  /** Minutes before the event start time to fire the reminder. */
  minutesBefore: number;
}

export interface SchoolEvent {
  id: string;
  title: string;
  description?: string;
  category: EventCategory;
  /** ISO date string, e.g. "2026-09-14" */
  date: string;
  /** 24hr time, e.g. "09:00" */
  startTime?: string;
  endTime?: string;
  location?: string;
  /** Who this event is relevant to, e.g. ["Class 10", "Class 11"] */
  audience?: string[];
  reminder: EventReminder;
  /** Whether push/email notifications go out for this event. */
  notify: boolean;
}

export type EventFilter = "all" | EventCategory;

export type DateRangeFilter = "upcoming" | "this-month" | "past" | "all";

export interface NewEventInput extends Omit<SchoolEvent, "id"> {
  id?: string;
}

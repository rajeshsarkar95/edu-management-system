export type EventCategory =
  | "academic"
  | "holiday"
  | "parent-meeting"
  | "teacher-meeting"
  | "examination";
export interface EventReminder {
  enabled: boolean;
  minutesBefore: number;
}
export interface SchoolEvent {
  id: string;
  title: string;
  description?: string;
  category: EventCategory;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  audience?: string[];
  reminder: EventReminder;
  notify: boolean;
}

export type EventFilter = "all" | EventCategory;
export type DateRangeFilter = "upcoming" | "this-month" | "past" | "all";
export interface NewEventInput extends Omit<SchoolEvent, "id"> {
  id?: string;
}
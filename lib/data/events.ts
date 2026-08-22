import type { SchoolEvent } from "@/lib/types/event";

/**
 * Seed data for local development / first-run demo state.
 * Replace with a fetch from your API or database in production
 * (see app/events/page.tsx for where this is consumed).
 */
export const SEED_EVENTS: SchoolEvent[] = [
  {
    id: "evt-001",
    title: "New Academic Session Begins",
    description: "Classes I to XII resume after the summer break.",
    category: "academic",
    date: "2026-09-01",
    startTime: "08:00",
    location: "All Campuses",
    audience: ["All Classes"],
    reminder: { enabled: true, minutesBefore: 1440 },
    notify: true,
  },
  {
    id: "evt-002",
    title: "Unit Test I — Mathematics",
    category: "examination",
    date: "2026-09-08",
    startTime: "09:30",
    endTime: "11:00",
    location: "Examination Hall",
    audience: ["Class 9", "Class 10"],
    reminder: { enabled: true, minutesBefore: 720 },
    notify: true,
  },
  {
    id: "evt-003",
    title: "Parent–Teacher Meeting",
    description: "Progress review for the first term.",
    category: "parent-meeting",
    date: "2026-09-12",
    startTime: "10:00",
    endTime: "13:00",
    location: "Main Auditorium",
    audience: ["Class 6", "Class 7", "Class 8"],
    reminder: { enabled: true, minutesBefore: 2880 },
    notify: true,
  },
  {
    id: "evt-004",
    title: "Staff Meeting — Curriculum Review",
    category: "teacher-meeting",
    date: "2026-09-15",
    startTime: "15:30",
    endTime: "16:30",
    location: "Staff Room",
    audience: ["Teaching Staff"],
    reminder: { enabled: false, minutesBefore: 60 },
    notify: false,
  },
  {
    id: "evt-005",
    title: "Ganesh Chaturthi",
    description: "School closed for the festival.",
    category: "holiday",
    date: "2026-09-14",
    reminder: { enabled: false, minutesBefore: 1440 },
    notify: true,
  },
  {
    id: "evt-006",
    title: "Mid-Term Examinations Begin",
    category: "examination",
    date: "2026-09-22",
    startTime: "09:00",
    location: "Examination Hall",
    audience: ["Class 9", "Class 10", "Class 11", "Class 12"],
    reminder: { enabled: true, minutesBefore: 4320 },
    notify: true,
  },
  {
    id: "evt-007",
    title: "Annual Sports Meet Planning",
    category: "teacher-meeting",
    date: "2026-09-25",
    startTime: "14:00",
    endTime: "15:00",
    location: "Sports Office",
    audience: ["PE Department"],
    reminder: { enabled: true, minutesBefore: 60 },
    notify: false,
  },
  {
    id: "evt-008",
    title: "Gandhi Jayanti",
    category: "holiday",
    date: "2026-10-02",
    reminder: { enabled: false, minutesBefore: 1440 },
    notify: true,
  },
];

/** Returns a stable "YYYY-MM-DD" for a given Date, in local time. */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatEventDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTimeRange(start?: string, end?: string): string | null {
  if (!start) return null;
  const to12h = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
  };
  return end ? `${to12h(start)} – ${to12h(end)}` : to12h(start);
}

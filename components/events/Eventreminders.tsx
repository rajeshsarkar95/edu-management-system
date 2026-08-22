"use client";

import { useMemo } from "react";
import { Bell, BellRing } from "lucide-react";
import { CATEGORY_META } from "@/lib/config/eventCategories";
import { toISODate } from "@/lib/data/events";
import type { SchoolEvent } from "@/lib/types/event";

interface EventRemindersProps {
  events: SchoolEvent[];
  onToggleNotify?: (eventId: string) => void;
}

function daysUntil(iso: string): number {
  const today = new Date(toISODate(new Date()) + "T00:00:00");
  const target = new Date(iso + "T00:00:00");
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

function countdownLabel(days: number): string {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

export default function EventReminders({ events, onToggleNotify }: EventRemindersProps) {
  const upcoming = useMemo(() => {
    const todayISO = toISODate(new Date());
    return events
      .filter((e) => e.reminder.enabled && e.date >= todayISO)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [events]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <BellRing className="h-4 w-4 text-amber-500" />
        <h3 className="text-sm font-semibold text-slate-800">Upcoming Reminders</h3>
      </div>

      {upcoming.length === 0 ? (
        <p className="py-6 text-center text-xs text-slate-400">
          No reminders set. Toggle the bell on any event to get notified.
        </p>
      ) : (
        <ul className="space-y-3">
          {upcoming.map((evt) => {
            const meta = CATEGORY_META[evt.category];
            const days = daysUntil(evt.date);
            return (
              <li key={evt.id} className="flex items-start gap-2.5">
                <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${meta.dot}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{evt.title}</p>
                  <p className="text-xs text-slate-400">{countdownLabel(days)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleNotify?.(evt.id)}
                  title={evt.notify ? "Notifications on" : "Notifications off"}
                  className={`shrink-0 rounded-md p-1 ${
                    evt.notify ? "text-indigo-500 hover:bg-indigo-50" : "text-slate-300 hover:bg-slate-100"
                  }`}
                >
                  <Bell className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
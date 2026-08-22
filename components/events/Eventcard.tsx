"use client";
import { Bell, BellOff, MapPin, Users } from "lucide-react";
import { CATEGORY_META } from "@/lib/config/eventCategories";
import { formatTimeRange } from "@/lib/data/events";
import type { SchoolEvent } from "@/lib/types/event";

interface EventCardProps {
  event: SchoolEvent;
  onToggleReminder?: (eventId: string) => void;
  onClick?: (event: SchoolEvent) => void;
}
export default function EventCard({ event, onToggleReminder, onClick }: EventCardProps) {
  const meta = CATEGORY_META[event.category];
  const day = new Date(`${event.date}T00:00:00`).getDate();
  const month = new Date(`${event.date}T00:00:00`).toLocaleDateString("en-IN", {
    month: "short",
  });
  const timeRange = formatTimeRange(event.startTime, event.endTime);
  return (
    <div
      onClick={() => onClick?.(event)}
      className="group flex gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm cursor-pointer"
    >
      <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-slate-50 py-2">
        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          {month}
        </span>
        <span className="text-xl font-semibold text-slate-800">{day}</span>
      </div>
      <div className={`w-1 shrink-0 rounded-full ${meta.accent}`} aria-hidden />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-slate-900">{event.title}</h3>
            {event.description && (
              <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">{event.description}</p>
            )}
          </div>
          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
            {meta.label ?? event.category}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          {timeRange && <span>{timeRange}</span>}
          {event.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {event.location}
            </span>
          )}
          {event.audience && event.audience.length > 0 && (
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" />
              {event.audience.join(", ")}
            </span>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleReminder?.(event.id);
        }}
        title={event.reminder.enabled ? "Reminder on" : "Reminder off"}
        className={`h-fit shrink-0 rounded-md p-1.5 transition ${
          event.reminder.enabled
            ? "text-amber-500 hover:bg-amber-50"
            : "text-slate-300 hover:bg-slate-100 hover:text-slate-400"
        }`}
      >
        {event.reminder.enabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
      </button>
    </div>
  );
}
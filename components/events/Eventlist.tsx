"use client";
import { useMemo } from "react";
import { CalendarX } from "lucide-react";
import { formatEventDate } from "@/lib/data/events";
import type { SchoolEvent } from "@/lib/types/event";
import EventCard from "./Eventcard";

interface EventListProps {
  events: SchoolEvent[];
  onToggleReminder?: (eventId: string) => void;
  onEventClick?: (event: SchoolEvent) => void;
}

export default function EventList({ events, onToggleReminder, onEventClick }: EventListProps) {
  const grouped = useMemo(() => {
    const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
    const map = new Map<string, SchoolEvent[]>();
    for (const evt of sorted) {
      const list = map.get(evt.date) ?? [];
      list.push(evt);
      map.set(evt.date, list);
    }
    return Array.from(map.entries());
  }, [events]);

  if (grouped.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-16 text-center">
        <CalendarX className="h-8 w-8 text-slate-300" />
        <p className="mt-3 text-sm font-medium text-slate-600">No events match your filters</p>
        <p className="mt-1 text-xs text-slate-400">Try a different category or date range.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {grouped.map(([date, dayEvents]) => (
        <div key={date}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {formatEventDate(date)}
          </p>
          <div className="space-y-2.5">
            {dayEvents.map((evt) => (
              <EventCard
                key={evt.id}
                event={evt}
                onToggleReminder={onToggleReminder}
                onClick={onEventClick}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
"use client";

import { Plus } from "lucide-react";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/config/eventCategories";
import type { SchoolEvent } from "@/lib/types/event";

interface EventsHeaderProps {
  events: SchoolEvent[];
  onAddEvent: () => void;
}

export default function EventsHeader({ events, onAddEvent }: EventsHeaderProps) {
  const counts = CATEGORY_ORDER.map((cat) => ({
    cat,
    count: events.filter((e) => e.category === cat).length,
  }));

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Events & Calendar</h1>
        <p className="mt-1 text-sm text-slate-500">
          Academic calendar, holidays, meetings and exam dates in one place.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          {counts.map(({ cat, count }) => {
            const meta = CATEGORY_META[cat];
            return (
              <span key={cat} className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                {count} {meta.shortLabel}
              </span>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={onAddEvent}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
      >
        <Plus className="h-4 w-4" />
        Add Event
      </button>
    </div>
  );
}
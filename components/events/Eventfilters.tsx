"use client";

import { Search, X } from "lucide-react";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/config/eventCategories";
import type { DateRangeFilter, EventFilter } from "@/lib/types/event";

interface EventFiltersProps {
  activeCategory: EventFilter;
  onCategoryChange: (c: EventFilter) => void;
  dateRange: DateRangeFilter;
  onDateRangeChange: (r: DateRangeFilter) => void;
  search: string;
  onSearchChange: (v: string) => void;
}

const RANGE_OPTIONS: { value: DateRangeFilter; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "this-month", label: "This Month" },
  { value: "past", label: "Past" },
  { value: "all", label: "All" },
];

export default function EventFilters({
  activeCategory,
  onCategoryChange,
  dateRange,
  onDateRangeChange,
  search,
  onSearchChange,
}: EventFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search */}
      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search events..."
          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-8 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => onCategoryChange("all")}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            activeCategory === "all"
              ? "bg-slate-800 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          All
        </button>
        {CATEGORY_ORDER.map((cat) => {
          const meta = CATEGORY_META[cat];
          const active = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
                active ? `text-white ${meta.accent}` : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-white" : meta.dot}`} />
              {meta.shortLabel}
            </button>
          );
        })}
      </div>

      {/* Date range select */}
      <div className="flex shrink-0 rounded-lg bg-slate-100 p-0.5">
        {RANGE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onDateRangeChange(opt.value)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
              dateRange === opt.value
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
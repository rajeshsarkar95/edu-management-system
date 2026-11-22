"use client";

import { CalendarRange, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ACADEMIC_SESSIONS, COURSES, STATUSES, STATUS_META } from "@/lib/admission/constants";

export interface Filters {
  q: string;
  status: string;
  course: string;
  session: string;
  from: string;
  to: string;
}

export const DEFAULT_FILTERS: Filters = { q: "", status: "all", course: "all", session: "all", from: "", to: "" };

export function activeFilterCount(f: Filters) {
  return (["status", "course", "session"] as const).filter((k) => f[k] !== "all").length + (f.from || f.to ? 1 : 0) + (f.q ? 1 : 0);
}

export function FilterBar({ filters, onChange, onClear }: { filters: Filters; onChange: (patch: Partial<Filters>) => void; onClear: () => void }) {
  const badRange = Boolean(filters.from && filters.to && filters.from > filters.to);
  const count = activeFilterCount(filters);

  return (
    <div className="space-y-3 border-b p-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(240px,1.4fr)_repeat(3,minmax(0,1fr))]">
        <div className="relative md:col-span-2 xl:col-span-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.q}
            onChange={(e) => onChange({ q: e.target.value })}
            placeholder="Search by student name or application ID"
            className="pl-9"
            aria-label="Search applications"
          />
          {filters.q && (
            <button
              type="button"
              onClick={() => onChange({ q: "" })}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <Select value={filters.status} onValueChange={(v) => onChange({ status: v })}>
          <SelectTrigger aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_META[s].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.course} onValueChange={(v) => onChange({ course: v })}>
          <SelectTrigger aria-label="Filter by course">
            <SelectValue placeholder="Course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All courses</SelectItem>
            {COURSES.map((c) => (
              <SelectItem key={c.code} value={c.name}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.session} onValueChange={(v) => onChange({ session: v })}>
          <SelectTrigger aria-label="Filter by academic session">
            <SelectValue placeholder="Session" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sessions</SelectItem>
            {ACADEMIC_SESSIONS.map((s) => (
              <SelectItem key={s} value={s}>
                Session {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <CalendarRange className="size-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Applied</span>
          <Input
            type="date"
            value={filters.from}
            max={filters.to || undefined}
            onChange={(e) => onChange({ from: e.target.value })}
            className="h-8 w-[150px] text-[13px]"
            aria-label="Applied from date"
          />
          <span className="text-sm text-muted-foreground">to</span>
          <Input
            type="date"
            value={filters.to}
            min={filters.from || undefined}
            onChange={(e) => onChange({ to: e.target.value })}
            className="h-8 w-[150px] text-[13px]"
            aria-label="Applied to date"
            aria-invalid={badRange}
          />
        </div>
        {badRange && <span className="text-xs text-destructive">Start date must be on or before the end date.</span>}
        {count > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear} className="ml-auto text-muted-foreground">
            <X /> Clear {count} filter{count > 1 ? "s" : ""}
          </Button>
        )}
      </div>
    </div>
  );
}

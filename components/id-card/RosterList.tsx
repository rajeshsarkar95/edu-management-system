"use client";

import clsx from "clsx";
import { Student } from "@/lib/types";

interface Props {
  students: Student[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}

export function RosterList({ students, selectedId, onSelect, onAdd, onRemove }: Props) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-1 pb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
          Roster · {students.length}
        </p>
        <button
          onClick={onAdd}
          className="rounded-md bg-accent-soft px-2 py-1 text-xs font-medium text-accent hover:bg-accent hover:text-white"
        >
          + Add
        </button>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto pr-1">
        {students.map((s) => (
          <div
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={clsx(
              "group flex cursor-pointer items-center justify-between rounded-md px-2.5 py-2 text-sm transition",
              selectedId === s.id ? "bg-ink-900 text-white" : "hover:bg-ink-50 text-ink-700"
            )}
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{s.name || "Untitled student"}</p>
              <p
                className={clsx(
                  "truncate text-xs",
                  selectedId === s.id ? "text-white/60" : "text-ink-400"
                )}
              >
                {s.className || "—"} {s.section && `· ${s.section}`} {s.rollNumber && `· Roll ${s.rollNumber}`}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(s.id);
              }}
              className={clsx(
                "ml-2 shrink-0 rounded px-1.5 py-0.5 text-xs opacity-0 group-hover:opacity-100",
                selectedId === s.id ? "text-white/70 hover:bg-white/10" : "text-ink-400 hover:bg-ink-100"
              )}
            >
              ✕
            </button>
          </div>
        ))}
        {students.length === 0 && (
          <p className="px-2 py-6 text-center text-xs text-ink-400">
            No students yet — add one or import a CSV.
          </p>
        )}
      </div>
    </div>
  );
}

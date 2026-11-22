"use client";

import { Check } from "lucide-react";
import { FORM_STEPS } from "@/lib/admission/schema";
import { cn } from "@/lib/utils";

export function Stepper({
  current,
  furthest,
  onSelect,
}: {
  current: number;
  furthest: number;
  onSelect: (i: number) => void;
}) {
  return (
    <>
      {/* Mobile: compact progress */}
      <div className="md:hidden">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold">
            Step {current + 1} of {FORM_STEPS.length}
          </span>
          <span className="text-muted-foreground">{FORM_STEPS[current].title}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((current + 1) / FORM_STEPS.length) * 100}%` }} />
        </div>
      </div>

      {/* Desktop */}
      <ol className="hidden items-start md:flex" aria-label="Admission form progress">
        {FORM_STEPS.map((s, i) => {
          const done = i < current || (i < furthest && i !== current);
          const active = i === current;
          const reachable = i <= furthest;
          return (
            <li key={s.id} className="relative flex flex-1 flex-col items-center">
              {i > 0 && (
                <span
                  aria-hidden
                  className={cn("absolute top-[18px] right-1/2 h-0.5 w-full -translate-y-1/2 transition-colors", i <= current || i <= furthest ? "bg-primary" : "bg-border")}
                />
              )}
              <button
                type="button"
                disabled={!reachable}
                onClick={() => onSelect(i)}
                aria-current={active ? "step" : undefined}
                className="group relative z-10 flex flex-col items-center gap-2 outline-none disabled:cursor-not-allowed"
              >
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full border-2 bg-card text-sm font-semibold transition-all group-focus-visible:ring-[3px] group-focus-visible:ring-ring/40",
                    active && "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/30",
                    !active && done && "border-primary bg-primary/10 text-primary",
                    !active && !done && "border-border text-muted-foreground",
                  )}
                >
                  {done && !active ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                </span>
                <span className="text-center">
                  <span className={cn("block text-[13px] font-medium", active ? "text-foreground" : "text-muted-foreground")}>{s.title}</span>
                  <span className="hidden text-[11px] text-muted-foreground/80 lg:block">{s.description}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </>
  );
}

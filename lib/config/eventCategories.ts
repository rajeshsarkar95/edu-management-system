import {
  CalendarRange,
  PartyPopper,
  Users,
  UserRound,
  FileEdit,
  type LucideIcon,
} from "lucide-react";
import type { EventCategory } from "@/lib/types/event";

export interface CategoryMeta {
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  /** Small solid dot used on the calendar grid */
  dot: string;
  /** Badge pill styling */
  badge: string;
  /** Left accent bar on list cards */
  accent: string;
  /** Ring color used for the selected/focused state */
  ring: string;
}

export const CATEGORY_ORDER: EventCategory[] = [
  "academic",
  "examination",
  "parent-meeting",
  "teacher-meeting",
  "holiday",
];

export const CATEGORY_META: Record<EventCategory, CategoryMeta> = {
  academic: {
    label: "Academic Calendar",
    shortLabel: "Academic",
    icon: CalendarRange,
    dot: "bg-indigo-500",
    badge: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    accent: "bg-indigo-500",
    ring: "ring-indigo-500",
  },
  examination: {
    label: "Examination",
    shortLabel: "Exam",
    icon: FileEdit,
    dot: "bg-rose-500",
    badge: "bg-rose-50 text-rose-700 border border-rose-200",
    accent: "bg-rose-500",
    ring: "ring-rose-500",
  },
  "parent-meeting": {
    label: "Parent Meeting",
    shortLabel: "Parent Mtg",
    icon: Users,
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
    accent: "bg-amber-500",
    ring: "ring-amber-500",
  },
  "teacher-meeting": {
    label: "Teacher Meeting",
    shortLabel: "Staff Mtg",
    icon: UserRound,
    dot: "bg-sky-500",
    badge: "bg-sky-50 text-sky-700 border border-sky-200",
    accent: "bg-sky-500",
    ring: "ring-sky-500",
  },
  holiday: {
    label: "Holiday",
    shortLabel: "Holiday",
    icon: PartyPopper,
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    accent: "bg-emerald-500",
    ring: "ring-emerald-500",
  },
};

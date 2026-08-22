import { CATEGORY_META } from "@/lib/config/eventCategories";
import type { EventCategory } from "@/lib/types/event";

interface EventBadgeProps {
  category: EventCategory;
  size?: "sm" | "md";
}

export default function EventBadge({ category, size = "sm" }: EventBadgeProps) {
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${meta.badge} ${
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {meta.shortLabel}
    </span>
  );
}
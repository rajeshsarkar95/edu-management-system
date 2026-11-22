import * as React from "react";
import { cn } from "@/lib/utils";

export function Avatar({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("relative flex size-10 shrink-0 overflow-hidden rounded-full", className)} {...props} />;
}
export function AvatarImage({ className, ...props }: React.ComponentProps<"img">) {
  return <img className={cn("aspect-square size-full", className)} {...props} />;
}
export function AvatarFallback({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("flex size-full items-center justify-center rounded-full bg-slate-100", className)} {...props} />;
}

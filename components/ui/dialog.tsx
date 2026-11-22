"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.PropsWithChildren<{ open?: boolean; onOpenChange?: (open: boolean) => void }>;
export function Dialog({ open, onOpenChange, children }: Props) {
  if (!open) return null;
  return <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4" onMouseDown={() => onOpenChange?.(false)}>{children}</div>;
}
export function DialogContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div role="dialog" aria-modal="true" className={cn("w-full max-w-lg rounded-xl bg-white p-6 shadow-xl", className)} onMouseDown={(event) => event.stopPropagation()} {...props} />;
}
export function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mb-4 flex flex-col gap-2", className)} {...props} />;
}
export function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mt-6 flex justify-end gap-2", className)} {...props} />;
}
export function DialogTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 className={cn("text-lg font-semibold", className)} {...props} />;
}
export function DialogDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("text-sm text-slate-600", className)} {...props} />;
}

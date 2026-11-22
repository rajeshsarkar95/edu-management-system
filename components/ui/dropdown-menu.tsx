"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export function DropdownMenu({ children }: React.PropsWithChildren) {
  return <div className="relative">{children}</div>;
}
export function DropdownMenuTrigger({ children, asChild: _asChild }: React.PropsWithChildren<{ asChild?: boolean }>) {
  return <>{children}</>;
}
export function DropdownMenuContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("absolute right-0 z-50 mt-1 min-w-40 rounded-md border border-slate-200 bg-white p-1 shadow-lg", className)} {...props} />;
}
export function DropdownMenuItem({ className, ...props }: React.ComponentProps<"button">) {
  return <button type="button" className={cn("w-full rounded px-2 py-1.5 text-left text-sm hover:bg-slate-100", className)} {...props} />;
}
export function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("my-1 h-px bg-slate-200", className)} {...props} />;
}

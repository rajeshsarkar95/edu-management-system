"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type DialogProps = React.PropsWithChildren<{ open?: boolean; onOpenChange?: (open: boolean) => void }>;
const DialogContext = React.createContext<DialogProps>({});

export function AlertDialog({ open, onOpenChange, children }: DialogProps) {
  return <DialogContext.Provider value={{ open, onOpenChange }}>{open ? <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">{children}</div> : null}</DialogContext.Provider>;
}
export function AlertDialogContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div role="alertdialog" aria-modal="true" className={cn("w-full max-w-md rounded-xl bg-white p-6 shadow-xl", className)} {...props} />;
}
export function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-2", className)} {...props} />;
}
export function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mt-6 flex justify-end gap-2", className)} {...props} />;
}
export function AlertDialogTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 className={cn("text-lg font-semibold", className)} {...props} />;
}
export function AlertDialogDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("text-sm text-slate-600", className)} {...props} />;
}
export function AlertDialogCancel({ className, ...props }: React.ComponentProps<"button">) {
  const dialog = React.useContext(DialogContext);
  return <button type="button" className={cn("h-10 rounded-md border border-slate-300 px-4 text-sm", className)} onClick={() => dialog.onOpenChange?.(false)} {...props} />;
}
export function AlertDialogAction({ className, ...props }: React.ComponentProps<"button">) {
  const dialog = React.useContext(DialogContext);
  return <button type="button" className={cn("h-10 rounded-md bg-slate-900 px-4 text-sm text-white", className)} onClick={(event) => { props.onClick?.(event); dialog.onOpenChange?.(false); }} {...props} />;
}

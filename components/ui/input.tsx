
import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.ComponentProps<"input"> {}

export const Input = React.forwardRef<
  HTMLInputElement,
  InputProps
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";

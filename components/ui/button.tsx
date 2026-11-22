import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
};

export function Button({ className, variant = "default", size = "default", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        variant === "default" && "bg-primary text-white hover:opacity-90",
        variant === "destructive" && "bg-red-600 text-white hover:bg-red-700",
        variant === "outline" && "border border-slate-300 bg-white hover:bg-slate-50",
        variant === "secondary" && "bg-slate-100 text-slate-900 hover:bg-slate-200",
        variant === "ghost" && "hover:bg-slate-100",
        variant === "link" && "text-primary underline-offset-4 hover:underline",
        size === "sm" && "h-8 px-3",
        size === "lg" && "h-11 px-6",
        size === "icon" && "size-9 p-0",
        size === "default" && "h-10 px-4",
        className,
      )}
      {...props}
    />
  );
}

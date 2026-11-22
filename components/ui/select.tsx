"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export function Select(props: React.ComponentProps<"select"> & { onValueChange?: (value: string) => void }) {
  const { onValueChange, onChange, children, value, ...rest } = props;
  const options: React.ReactNode[] = [];
  const findItems = (node: React.ReactNode) => {
    React.Children.forEach(node, (child) => {
      if (!React.isValidElement(child)) return;
      const element = child as React.ReactElement<{ value?: string; children?: React.ReactNode }>;
      if (element.type === SelectItem) {
        options.push(<option key={element.props.value} value={element.props.value}>{element.props.children}</option>);
      } else if (element.props.children) {
        findItems(element.props.children);
      }
    });
  };
  findItems(children);

  const trigger = React.Children.toArray(children).find((child) => React.isValidElement(child) && child.type === SelectTrigger) as React.ReactElement | undefined;
  const triggerProps = trigger?.props as React.ComponentProps<"div"> | undefined;

  return (
    <select
      value={value}
      className={cn("h-10 rounded-md border border-slate-300 bg-white px-3 text-sm", triggerProps?.className)}
      aria-label={triggerProps?.["aria-label"]}
      onChange={(event) => { onChange?.(event); onValueChange?.(event.target.value); }}
      {...rest}
    >
      {options}
    </select>
  );
}
export function SelectTrigger({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("h-10 rounded-md border border-slate-300", className)} {...props} />;
}
export function SelectValue({ placeholder }: { placeholder?: string }) {
  return <>{placeholder}</>;
}
export function SelectContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn(className)} {...props} />;
}
export function SelectItem({ className, ...props }: React.ComponentProps<"option">) {
  return <option className={cn(className)} {...props} />;
}

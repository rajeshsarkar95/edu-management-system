import { ReactNode } from "react";
import clsx from "clsx";

interface CardShellProps {
  children: ReactNode;
  className?: string;
  forwardedRef?: React.Ref<HTMLDivElement>;
}

/** Fixed CR80 card proportions (3.375in x 2.125in) at a 96px/in preview scale. */
export function CardShell({ children, className, forwardedRef }: CardShellProps) {
  return (
    <div
      ref={forwardedRef}
      className={clsx(
        "card-avoid-break relative h-card-h-px w-card-w-px overflow-hidden rounded-xl shadow-card",
        className
      )}
    >
      {children}
    </div>
  );
}

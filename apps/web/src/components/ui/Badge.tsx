import type { ReactNode } from "react";
import { cn } from "@/lib/format";

type BadgeVariant = "primary" | "dark" | "outline" | "muted";

export function Badge({
  children,
  variant = "primary",
  className
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        variant === "primary" && "bg-primary-tint text-primary-dark",
        variant === "dark" && "bg-primary text-white",
        variant === "outline" && "border border-primary/20 bg-white/90 text-primary-dark",
        variant === "muted" && "bg-slate-100 text-slate-600",
        className
      )}
    >
      {children}
    </span>
  );
}

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
        variant === "primary" && "bg-primary-tint/90 text-primary-dark",
        variant === "dark" &&
          "bg-gradient-to-r from-primary to-[#57c78a] text-white shadow-sm",
        variant === "outline" &&
          "border border-primary/20 bg-white/85 text-primary-dark backdrop-blur",
        variant === "muted" && "bg-[#eef6f1] text-muted",
        className
      )}
    >
      {children}
    </span>
  );
}

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/format";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

export function buttonClasses(
  variant: Variant = "primary",
  size: Size = "md",
  fullWidth = false
): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60",
    variant === "primary" &&
      "btn-gradient hover:brightness-105 focus-visible:ring-primary/40",
    variant === "secondary" &&
      "bg-gradient-to-r from-secondary/20 to-accent/30 text-ink hover:from-secondary/30 hover:to-accent/40",
    variant === "outline" &&
      "border border-primary/20 bg-white/85 text-ink shadow-sm backdrop-blur hover:border-primary/40 hover:bg-white",
    variant === "ghost" && "text-muted hover:bg-primary-tint/70 hover:text-primary-dark",
    size === "sm" && "px-3.5 py-2 text-xs",
    size === "md" && "px-5 py-2.5 text-sm",
    size === "lg" && "px-6 py-3 text-base",
    fullWidth && "w-full"
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonClasses(variant, size, fullWidth), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

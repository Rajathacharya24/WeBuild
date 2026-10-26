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
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
    variant === "primary" && "bg-primary text-white shadow-sm hover:bg-primary-dark",
    variant === "secondary" &&
      "bg-primary-tint text-primary-dark hover:bg-green-100",
    variant === "outline" &&
      "border border-line bg-white text-ink hover:border-primary/40 hover:text-primary-dark",
    variant === "ghost" && "text-muted hover:bg-primary-tint hover:text-primary-dark",
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

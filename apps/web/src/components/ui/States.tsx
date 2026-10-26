import type { ReactNode } from "react";
import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import { Button } from "./Button";

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted">
      <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-3xl border border-red-100 bg-red-50/60 px-6 py-10 text-center"
    >
      <AlertTriangle className="h-8 w-8 text-red-500" aria-hidden="true" />
      <p className="max-w-md text-sm text-red-700">{message}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={() => onRetry()}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  message,
  icon,
  action
}: {
  title: string;
  message: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-primary/20 bg-primary-tint/50 px-6 py-12 text-center">
      <span className="text-primary" aria-hidden="true">
        {icon ?? <Inbox className="h-8 w-8" />}
      </span>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="max-w-md text-sm leading-relaxed text-muted">{message}</p>
      {action}
    </div>
  );
}

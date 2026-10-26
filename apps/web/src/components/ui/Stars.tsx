import { Star } from "lucide-react";
import { cn } from "@/lib/format";

interface StarsProps {
  value: number;
  size?: "sm" | "md";
  showValue?: boolean;
  count?: number;
}

export function Stars({ value, size = "sm", showValue = false, count }: StarsProps) {
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  const rounded = Math.round(value);

  return (
    <span className="inline-flex items-center gap-1">
      <span
        className="inline-flex items-center gap-0.5"
        role="img"
        aria-label={`${value.toFixed(1)} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              iconSize,
              star <= rounded
                ? "fill-primary text-primary"
                : "fill-transparent text-slate-300"
            )}
            aria-hidden="true"
          />
        ))}
      </span>
      {showValue ? (
        <span className="text-xs font-semibold text-ink">
          {value > 0 ? value.toFixed(1) : "New"}
          {count !== undefined ? (
            <span className="ml-1 font-normal text-muted">({count})</span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}

interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function RatingInput({ value, onChange, disabled = false }: RatingInputProps) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Choose a star rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
          aria-pressed={star <= value}
          className="rounded-full p-1 transition-transform hover:scale-110 disabled:opacity-50"
        >
          <Star
            className={cn(
              "h-8 w-8",
              star <= value
                ? "fill-primary text-primary"
                : "fill-transparent text-slate-300"
            )}
            aria-hidden="true"
          />
        </button>
      ))}
      <span className="ml-2 text-sm font-semibold text-primary-dark">
        {value > 0 ? `${value}/5` : "Pick a rating"}
      </span>
    </div>
  );
}

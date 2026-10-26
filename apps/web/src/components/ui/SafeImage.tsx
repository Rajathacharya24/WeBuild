import { useEffect, useState } from "react";
import { cn } from "@/lib/format";

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}

export function SafeImage({ src, alt, className, loading = "lazy" }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <img
      src={failed ? "/placeholder.svg" : src}
      alt={alt}
      className={cn("object-cover", className)}
      loading={loading}
      onError={() => setFailed(true)}
    />
  );
}

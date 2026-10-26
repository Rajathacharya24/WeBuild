import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "@/lib/errors";

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  setData: (value: T | null) => void;
}

export function useAsync<T>(
  loader: () => Promise<T>,
  deps: unknown[],
  enabled = true
): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const loaderRef = useRef(loader);
  const requestId = useRef(0);

  loaderRef.current = loader;

  const reload = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const currentRequest = requestId.current + 1;
    requestId.current = currentRequest;
    setLoading(true);
    setError(null);

    try {
      const result = await loaderRef.current();
      if (currentRequest === requestId.current) {
        setData(result);
      }
    } catch (caught) {
      if (currentRequest === requestId.current) {
        setError(getErrorMessage(caught));
      }
    } finally {
      if (currentRequest === requestId.current) {
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    void reload();
  }, [reload, enabled]);

  return { data, loading, error, reload, setData };
}

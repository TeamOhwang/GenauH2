// src/hooks/useHydrogenAgg.ts
import { useEffect, useMemo, useRef, useState } from "react";
import { fetchHydrogenAgg } from "@/api/hydrogenApi";
import type { HydrogenAggRequestDTO } from "@/domain/graph/hydrogenDTO";
import type { HydrogenAggResult } from "@/domain/graph/hydrogen";

type State = {
  data?: HydrogenAggResult;
  isLoading: boolean;
  error?: unknown;
  refetch: () => void;
};

const toKey = (p: HydrogenAggRequestDTO) => JSON.stringify(p);

export function useHydrogenAgg(params: HydrogenAggRequestDTO): State {
  const [data, setData] = useState<HydrogenAggResult>();
  const [error, setError] = useState<unknown>();
  const [isLoading, setLoading] = useState(false);

  const key = useMemo(() => toKey(params), [params]);
  const inFlight = useRef<AbortController | null>(null);

  async function load(signal?: AbortSignal) {
    setLoading(true);
    setError(undefined);
    try {
      const res = await fetchHydrogenAgg(params);
      if (!signal?.aborted) setData(res);
    } catch (e) {
      if (!signal?.aborted) setError(e);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }

  useEffect(() => {
    inFlight.current?.abort();
    const ctrl = new AbortController();
    inFlight.current = ctrl;
    load(ctrl.signal);
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const refetch = () => {
    inFlight.current?.abort();
    const ctrl = new AbortController();
    inFlight.current = ctrl;
    load(ctrl.signal);
  };

  return { data, isLoading, error, refetch };
}

import { useCallback, useEffect, useRef, useState } from "react";
import { v11Api } from "../lib/api";
import { loadPageCollection } from "../lib/pageCollection";

export function usePageCollection(search, page) {
  const [state, setState] = useState({ pages: [], summary: null, total: 0, page: 1, limit: 20, loading: true, error: "" });
  const sequence = useRef(0);
  const refresh = useCallback(async () => {
    const request = ++sequence.current;
    setState(current => ({ ...current, loading: true, error: "" }));
    try {
      const result = await loadPageCollection(v11Api, { search, page });
      if (!result?.summary || !Array.isArray(result.pages)) throw new Error("Page collection unavailable");
      if (sequence.current === request) setState({ ...result, loading: false, error: "" });
    } catch {
      if (sequence.current === request) setState(current => ({ ...current, loading: false, error: "Couldn’t load your landing pages. Please try again." }));
    }
  }, [search, page]);
  useEffect(() => {
    refresh();
    return () => { sequence.current += 1; };
  }, [refresh]);
  return { ...state, refresh };
}

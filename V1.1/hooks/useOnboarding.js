import { useCallback, useEffect, useState } from "react";
import { v11Api } from "../lib/api";

export function useOnboarding(enabled) {
  const [state, setState] = useState({ loading: Boolean(enabled), error: null, required: false, data: null });
  const refresh = useCallback(async () => {
    if (!enabled) { setState({ loading: false, error: null, required: false, data: null }); return null; }
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const result = await v11Api.onboarding();
      setState({ loading: false, error: null, required: Boolean(result.required), data: result.data || {} });
      return result;
    } catch (error) { setState({ loading: false, error, required: false, data: null }); return null; }
  }, [enabled]);
  useEffect(() => { refresh(); }, [refresh]);
  return { ...state, refresh };
}

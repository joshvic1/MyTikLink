import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ApiError, getToken, v11Api } from "./api";

export function useV11Session({ required = true } = {}) {
  const router = useRouter();
  const [state, setState] = useState({ user: null, loading: true, error: null });

  const refresh = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setState({ user: null, loading: false, error: null });
      if (required) router.replace("/?auth=login");
      return null;
    }
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const [session, plan] = await Promise.all([v11Api.session(), v11Api.plan()]);
      const user = { ...(session?.user || session || {}), ...(plan || {}) };
      setState({ user, loading: false, error: null });
      return user;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.localStorage.removeItem("token");
        if (required) router.replace("/?auth=login");
      }
      setState({ user: null, loading: false, error });
      return null;
    }
  }, [required, router]);

  useEffect(() => { refresh(); }, [refresh]);

  const logout = useCallback(() => {
    window.localStorage.removeItem("token");
    router.push("/?auth=login");
  }, [router]);

  return { ...state, refresh, logout, authenticated: Boolean(state.user) };
}

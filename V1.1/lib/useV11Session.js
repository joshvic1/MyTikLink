import { useCallback, useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { ApiError, getToken, v11Api } from "./api";

export function useV11Session({ required = true, enabled = true } = {}) {
  const router = useRouter();
  const routerRef=useRef(router);routerRef.current=router;
  const [state, setState] = useState({ user: null, loading: true, error: null });

  const refresh = useCallback(async () => {
    if (!enabled) return null;
    const token = getToken();
    if (!token) {
      setState({ user: null, loading: false, error: null });
      if (required) routerRef.current.replace(`/v1-1/login?next=${encodeURIComponent(routerRef.current.asPath)}`);
      return null;
    }
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const [session, plan] = await Promise.all([v11Api.session(), v11Api.plan()]);
      const user = { ...(session?.user || session || {}), ...(plan || {}) };
      setState({ user, loading: false, error: null });
      return user;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401 && getToken() === token) {
        window.localStorage.removeItem("token");
        if (required) routerRef.current.replace(`/v1-1/login?next=${encodeURIComponent(routerRef.current.asPath)}`);
      }
      setState({ user: null, loading: false, error });
      return null;
    }
  }, [required, enabled]);

  useEffect(() => { refresh(); }, [refresh]);

  const logout = useCallback(() => {
    window.localStorage.removeItem("token");
    routerRef.current.push("/v1-1/login");
  }, []);

  return { ...state, refresh, logout, authenticated: Boolean(state.user) };
}

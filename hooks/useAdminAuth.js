"use client";

import { useState, useEffect } from "react";

export default function useAdminAuth() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // 🔥 NEW

  useEffect(() => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("admin_token");
      setToken(t);
      setLoading(false); // 🔥 LOCALSTORAGE DONE
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("admin_token");
    setToken(null);
  };

  return { token, loading, logout };
}

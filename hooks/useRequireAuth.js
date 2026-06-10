// hooks/useRequireAuth.js

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function useRequireAuth() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");

    if (!savedToken) {
      router.push("/?auth=login");
      return;
    }

    setToken(savedToken);
    setCheckingAuth(false);
  }, [router]);

  return {
    token,
    checkingAuth,
  };
}

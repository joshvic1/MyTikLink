import { useState, useEffect } from "react";

let globalListeners = [];
let globalLoggedIn = false;

export default function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(globalLoggedIn);
  const [user, setUser] = useState(null);

  // Function to fetch user from API
  const fetchMe = async (token) => {
    if (!token) return null;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return data.user;
      } else {
        logout();
        return null;
      }
    } catch {
      logout();
      return null;
    }
  };

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    if (token) {
      fetchMe(token);
      globalLoggedIn = true;
      setIsLoggedIn(true);
    } else {
      globalLoggedIn = false;
      setIsLoggedIn(false);
    }
  }, []);

  const notifyAll = (value) => {
    globalLoggedIn = value;
    globalListeners.forEach((fn) => fn(value));
  };

  const login = (token) => {
    localStorage.setItem("token", token);
    notifyAll(true);
    fetchMe(token); // fetch user immediately after login
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    notifyAll(false);
  };

  const subscribe = (fn) => {
    globalListeners.push(fn);
    fn(globalLoggedIn);
    return () => {
      globalListeners = globalListeners.filter((l) => l !== fn);
    };
  };

  return { isLoggedIn, user, login, logout, subscribe, fetchMe };
}

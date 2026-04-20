import Header from "./Header";

import styles from "@/styles/Layout.module.css";
import Navbar from "./Navbar/Navbar";
import Footer from "./Footer/Footer";
import { useState, useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import { useSearchParams } from "next/navigation";

export default function Layout({ children }) {
  const { login, subscribe } = useAuth();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState(null);
  const [toast, setToast] = useState(null);

  const searchParams = useSearchParams();
  /* ===== HANDLE URL AUTH (?auth=login) ===== */
  useEffect(() => {
    const auth = searchParams.get("auth");

    if (auth === "login") {
      setAuthMode("login");
    } else if (auth === "register") {
      setAuthMode("register");
    }
  }, [searchParams]);

  /* ===== LISTEN TO AUTH STATE ===== */
  useEffect(() => {
    const unsub = subscribe(setIsLoggedIn);
    return unsub;
  }, [subscribe]);

  /* ===== HELPERS ===== */
  const openAuth = (mode) => setAuthMode(mode);
  const closeAuth = () => setAuthMode(null);
  const showToast = (message, type = "success") => setToast({ message, type });

  return (
    <div className={styles.container}>
      <Navbar openAuth={openAuth} isLoggedIn={isLoggedIn} />
      <main className={styles.main}>{children}</main>
      <Footer />
    </div>
  );
}

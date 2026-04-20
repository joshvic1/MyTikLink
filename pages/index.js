"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import useAuth from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal";
import Toast from "@/components/Toast";

/* ===== NEW UI COMPONENTS ===== */
import Navbar from "@/components/Navbar/Navbar";
import Hero from "@/components/Hero/Hero";
import Features from "@/components/Features/Features";
import Pricing from "@/components/Pricing/Pricing";
import Testimonials from "@/components/Testimonials/Testimonials";
import FinalCTA from "@/components/FinalCta/FinalCta";
import FAQ from "@/components/FAQS/FAQS";
import Footer from "@/components/Footer/Footer";

export default function Home() {
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
    <main style={{ background: "#f9f9f9" }}>
      {/* ===== NAVBAR ===== */}
      <Navbar openAuth={openAuth} isLoggedIn={isLoggedIn} />

      {/* ===== HERO ===== */}
      <Hero openAuth={openAuth} />

      {/* ===== FEATURES ===== */}
      <Features />

      {/* ===== PRICING ===== */}
      <Pricing openAuth={openAuth} />

      {/* ===== TESTIMONIALS ===== */}
      <Testimonials />

      {/* ===== FINAL CTA ===== */}
      <FinalCTA openAuth={openAuth} />

      {/* ===== FAQ ===== */}
      <FAQ />

      {/* ===== FOOTER ===== */}
      <Footer />

      {/* ===== AUTH MODAL ===== */}
      {authMode && (
        <AuthModal
          isOpen={!!authMode}
          mode={authMode}
          onClose={closeAuth}
          switchMode={setAuthMode}
          onAuthSuccess={(msg, token) => {
            login(token);
            showToast(msg, "success");
            closeAuth();
          }}
        />
      )}

      {/* ===== TOAST ===== */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </main>
  );
}

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
import FloatingAI from "@/components/MyTikLinkAI/FloatingAI";
import AIChat from "@/components/MyTikLinkAI/AIChat";

export default function Home() {
  const { login, subscribe } = useAuth();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState(null);
  const [toast, setToast] = useState(null);
  const [openAI, setOpenAI] = useState(false);
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

  useEffect(() => {
    if (openAI || authMode) return;

    let inactivityTimer;

    const THREE_HOURS = 3 * 60 * 60 * 1000;
    const INACTIVITY_TIME = 30 * 1000;

    const recentlyClosed = () => {
      const lastClosed = localStorage.getItem("ai_last_closed");

      if (!lastClosed) return false;

      return Date.now() - Number(lastClosed) < THREE_HOURS;
    };

    const isUserTyping = () => {
      const activeElement = document.activeElement;

      if (!activeElement) return false;

      const tag = activeElement.tagName?.toLowerCase();

      return (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        activeElement.isContentEditable
      );
    };

    const startInactivityTimer = () => {
      clearTimeout(inactivityTimer);

      if (recentlyClosed()) return;

      inactivityTimer = setTimeout(() => {
        if (document.visibilityState !== "visible") return;

        if (isUserTyping()) {
          startInactivityTimer();
          return;
        }

        setOpenAI(true);
      }, INACTIVITY_TIME);
    };

    const resetInactivityTimer = () => {
      startInactivityTimer();
    };

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "wheel",
      "touchstart",
      "touchmove",
      "input",
      "focusin",
    ];

    events.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer, { passive: true });
    });

    startInactivityTimer();

    return () => {
      clearTimeout(inactivityTimer);

      events.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, [openAI, authMode]);

  const handleCloseAI = () => {
    localStorage.setItem("ai_last_closed", Date.now());
    setOpenAI(false);
  };
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
      <FinalCTA openAuth={openAuth} onOpenAI={() => setOpenAI(true)} />

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

      <FloatingAI onOpen={() => setOpenAI(true)} />
      {openAI && <AIChat onClose={handleCloseAI} />}

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

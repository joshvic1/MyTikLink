"use client";
import { useEffect, useState } from "react";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

import useAuth from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal";
import Toast from "@/components/Toast";
import {
  ArrowRight,
  Check,
  X,
  Activity,
  Sparkles,
  Users,
  BarChart3,
  Link as LinkIcon,
  Smartphone,
  Shield,
} from "lucide-react";
import s from "@/styles/HomeV3.module.css";
import styles from "@/styles/Home.module.css";
import HeroMinimal from "@/components/HeroMinimal";
import ProblemSolution from "@/components/ProblemSolution";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import Stats from "@/components/Stats";
import Pricing from "@/components/Pricing";
import Showcase from "@/components/Showcase";
import FinalCTA from "@/components/FinalCTA";

export default function HomeV3() {
  const router = useRouter();
  const { login, subscribe } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState(null);
  const [toast, setToast] = useState(null);
  const [billing, setBilling] = useState("monthly");

  const searchParams = useSearchParams();

  useEffect(() => {
    const auth = searchParams.get("auth");
    if (auth === "login") {
      setAuthMode("login");
    } else if (auth === "register") {
      setAuthMode("register");
    }
  }, [searchParams]);

  useEffect(() => {
    const unsub = subscribe(setIsLoggedIn);
    return unsub;
  }, [subscribe]);

  const openAuth = (mode) => setAuthMode(mode);
  const closeAuth = () => setAuthMode(null);
  const showToast = (message, type = "success") => setToast({ message, type });

  // Reveal on scroll
  useEffect(() => {
    const els = document.querySelectorAll(`.${styles.reveal}`);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add(styles.inView);
        });
      },
      { threshold: 0.18 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <main className={styles.page}>
      {/* ===== HERO ===== */}
      <HeroMinimal />
      {/* ===== PROBLEM / SOLUTION ===== */}
      <ProblemSolution />

      {/* ===== HOW IT WORKS (3 steps) ===== */}
      <HowItWorks />

      {/* ===== FEATURES (4 minimal cards) ===== */}
      <Features />

      {/* ===== WHY CREATORS LOVE TIKLINK (stats/testimonials) ===== */}
      <Stats />

      {/* ===== PRICING ===== */}
      <Pricing />

      {/* ===== SHOWCASE (looping animation slot) ===== */}
      <Showcase />

      {/* ===== FINAL CTA ===== */}
      <FinalCTA />

      {/* AUTH + TOAST */}
      {authMode && (
        <AuthModal
          isOpen={!!authMode}
          mode={authMode}
          onClose={closeAuth}
          switchMode={setAuthMode} // 👈 ADD THIS
          onAuthSuccess={(msg, token) => {
            login(token);
            showToast(msg, "success");
            closeAuth();
          }}
        />
      )}

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

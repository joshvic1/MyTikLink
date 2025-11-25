"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { ArrowRight } from "lucide-react";
import styles from "@/styles/HomeV3.module.css";
import AuthModal from "./AuthModal";
import ForgotPasswordModal from "./ForgotPasswordModal";

export default function HeroMinimal() {
  const router = useRouter();
  const { subscribe } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState(null);
  const switchMode = (mode) => {
    setAuthMode(mode);
  };

  useEffect(() => {
    const unsub = subscribe(setIsLoggedIn);
    return unsub;
  }, [subscribe]);

  const handlePrimary = () =>
    isLoggedIn ? router.push("/dashboard") : router.push("/register");

  const handleSecondary = () =>
    isLoggedIn ? router.push("/dashboard") : router.push("/login");

  return (
    <section className={styles.heroAurora}>
      <div className={styles.bgGlow}></div>

      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>
            Connect <span className={styles.gradientText}>TikTok</span> to{" "}
            <span className={styles.gradientTextAlt}>WhatsApp</span> seamlessly.
          </h1>

          <p className={styles.sub}>
            Generate optimized TikTok links that redirect users straight into
            your WhatsApp DM or Group. Fast, reliable, and block-free.
          </p>

          <div className={styles.actions}>
            <div className={styles.actions}>
              {/* Show these ONLY when logged out */}
              {!isLoggedIn && (
                <>
                  <button
                    className={styles.btnPrimary}
                    onClick={() => switchMode("register")}
                  >
                    Get Started <ArrowRight size={16} />
                  </button>

                  <button
                    className={styles.btnOutline}
                    onClick={() => switchMode("login")}
                  >
                    Login
                  </button>
                </>
              )}

              {/* Show this ONLY when logged in */}
              {isLoggedIn && (
                <button
                  className={styles.btnPrimary}
                  onClick={() => router.push("/dashboard")}
                >
                  Dashboard <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>

          {/* <ul className={styles.features}>
            <li>⚡ Optimized for TikTok’s in-app browser</li>
            <li>🔒 100% safe and fast link redirects</li>
          </ul> */}
        </div>

        <div className={styles.preview}>
          <div className={styles.phoneFrame}>
            <img
              src="/images/ert.png"
              alt="TikLink App Preview"
              className={styles.phoneImage}
            />
          </div>
        </div>
      </div>
      {/* Main auth modal (login, register, verify) */}
      {authMode && authMode !== "forgot" && (
        <AuthModal
          isOpen={true}
          mode={authMode}
          switchMode={switchMode}
          onClose={() => switchMode(null)}
          onAuthSuccess={(token) => {
            login(token);
            switchMode(null);
            router.push("/dashboard");
          }}
        />
      )}
      {authMode === "forgot" && (
        <ForgotPasswordModal isOpen={true} onClose={() => switchMode(null)} />
      )}
    </section>
  );
}

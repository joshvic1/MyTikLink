"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LogIn,
  UserPlus,
  LogOut,
  Grid,
  Menu,
  X,
  User,
  Sun,
  Moon,
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import AuthModal from "./AuthModal";
import ForgotPasswordModal from "./ForgotPasswordModal";
import s from "@/styles/Header.module.css";

export default function HeaderFloating() {
  const { login, logout, subscribe } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  /**
   * authMode can be:
   * "login" | "register" | "verify" | "forgot" | null
   */
  const [authMode, setAuthMode] = useState(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userQuickOpen, setUserQuickOpen] = useState(false);
  const closeMenu = () => setMobileMenuOpen(false);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsub = subscribe(setIsLoggedIn);
    return unsub;
  }, [subscribe]);

  // close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserQuickOpen(false);
  }, [pathname]);

  /**
   * Switch auth modal mode safely
   */
  const switchMode = (mode) => {
    setAuthMode(mode);
  };

  const NavLink = ({ href, children }) => {
    const active = pathname === href;
    return (
      <Link href={href} className={`${s.navItem} ${active ? s.active : ""}`}>
        <span className={s.navText}>{children}</span>
        <span className={s.underline} />
      </Link>
    );
  };
  const [theme, setTheme] = useState("dark");

  // Load saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "dark";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <>
      {/* ---------------- HEADER ---------------- */}
      <header className={s.wrap}>
        <div className={s.navbar}>
          {/* Logo */}
          <Link href="/" className={s.logo}>
            <span className={s.accent}>Tik</span>Link
          </Link>

          {/* Desktop nav */}
          <nav className={s.nav}>
            <button className={s.userQuick} onClick={toggleTheme}>
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <NavLink href="/#features">Features</NavLink>
            <NavLink href="/#pricing">Pricing</NavLink>
            <NavLink href="/#about">About</NavLink>
            <NavLink href="#contact">Contact</NavLink>
          </nav>

          {/* Desktop actions */}
          <div className={s.actions}>
            {isLoggedIn ? (
              <>
                <button
                  className={s.btnText}
                  onClick={() => router.push("/dashboard")}
                >
                  Dashboard <Grid size={16} />
                </button>

                <button className={s.btnOutline} onClick={logout}>
                  Logout <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <button
                  className={s.btnText}
                  onClick={() => switchMode("login")}
                >
                  Login <LogIn size={16} />
                </button>
                <button
                  className={s.btnPrimary}
                  onClick={() => switchMode("register")}
                >
                  Sign Up <UserPlus size={16} />
                </button>
              </>
            )}
          </div>

          {/* Mobile controls */}
          <div className={s.mobileControls}>
            <button className={s.userQuick} onClick={toggleTheme}>
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              className={s.userQuick}
              onClick={() => setUserQuickOpen((v) => !v)}
            >
              <User size={18} />
            </button>
            <button
              className={s.mobileToggle}
              onClick={() => setMobileMenuOpen((v) => !v)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {userQuickOpen && (
              <div className={s.userDropdown}>
                {isLoggedIn ? (
                  <>
                    <button
                      className={s.dropItem}
                      onClick={() => router.push("/dashboard")}
                    >
                      <Grid size={14} /> Dashboard
                    </button>
                    <button className={s.dropItem} onClick={logout}>
                      <LogOut size={14} /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className={s.dropItem}
                      onClick={() => switchMode("login")}
                    >
                      <LogIn size={14} /> Login
                    </button>
                    <button
                      className={s.dropItem}
                      onClick={() => switchMode("register")}
                    >
                      <UserPlus size={14} /> Sign Up
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`${s.mobileMenu} ${mobileMenuOpen ? s.open : ""}`}>
          <div className={s.mobileInner}>
            <Link
              href="/#features"
              className={s.mobileLink}
              onClick={closeMenu}
            >
              Features
            </Link>
            <Link href="/#pricing" className={s.mobileLink} onClick={closeMenu}>
              Pricing
            </Link>
            <Link href="/#about" className={s.mobileLink} onClick={closeMenu}>
              About
            </Link>
            <Link href="#contact" className={s.mobileLink} onClick={closeMenu}>
              Contact
            </Link>

            <div className={s.mobileActions}>
              {isLoggedIn ? (
                <>
                  <button
                    className={s.mobileBtn}
                    onClick={() => router.push("/dashboard")}
                  >
                    <Grid size={14} /> Dashboard
                  </button>
                  <button className={s.mobileBtnOutline} onClick={logout}>
                    <LogOut size={14} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={s.mobileBtn}
                    onClick={() => switchMode("login")}
                  >
                    <LogIn size={14} /> Login
                  </button>
                  <button
                    className={s.mobileBtnOutline}
                    onClick={() => switchMode("register")}
                  >
                    <UserPlus size={14} /> Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ---------------- AUTH MODALS ---------------- */}

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

      {/* Forgot password modal */}
      {authMode === "forgot" && (
        <ForgotPasswordModal isOpen={true} onClose={() => switchMode(null)} />
      )}
    </>
  );
}

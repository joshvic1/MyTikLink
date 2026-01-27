"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Link2,
  BarChart3,
  Settings,
  Plus,
  LogOut,
  Menu,
  X,
  ArrowUpCircle,
  HomeIcon,
  Moon,
  Sun,
  LayoutTemplate,
  FileText,
} from "lucide-react";
import s from "@/styles/DashboardLayout.module.css";
import AuthModal from "@/components/AuthModal";
import useAuth from "@/hooks/useAuth";
import TelegramChatButton from "./TelegramChatButton";

export default function DashboardLayout({
  user = { name: "User", plan: "free" },
  onCreate,
  onUpgrade,
  onLogout,
  children,
}) {
  const [theme, setTheme] = useState("dark");

  const pathname = usePathname();
  const router = useRouter();
  const [expanded, setExpanded] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isPro = user?.plan?.toLowerCase().includes("pro");

  const { login } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const nav = useMemo(
    () => [
      { href: "/", label: "Home", icon: HomeIcon },
      { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
      { href: "/dashboard/links", label: "My Links", icon: Link2 },
      { href: "/dashboard/page", label: "My Pages", icon: FileText },
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
      {
        href: "/dashboard/tiktok-pixel",
        label: "TikTok Pixel",
        icon: ArrowUpCircle,
      },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
      {
        href: "/get-a-landing-page",
        label: "Get a Landing Page",
        icon: LayoutTemplate,
      },
    ],
    [],
  );
  useEffect(() => {
    // Read saved theme or system preference
    const saved =
      typeof window !== "undefined" ? localStorage.getItem("theme") : null;

    const initial =
      saved ||
      (window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark");

    document.documentElement.setAttribute("data-theme", initial);
    setTheme(initial);
  }, []);
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  const handleLogout = () => {
    if (confirm("Log out?")) {
      onLogout?.();
      setShowAuthModal(true);
    }
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setShowAuthModal(true);
    }
  }, []);
  return (
    <div
      className={`${s.layout} ${
        expanded ? s.sidebarExpanded : s.sidebarCollapsed
      }`}
    >
      {/* ===== Top Bar ===== */}
      <header className={s.topbar}>
        <Link href="/" className={s.brand}>
          <span className={s.gradient}>Tik</span>Link
        </Link>

        <div className={s.topActions}>
          {/* Create button */}
          <button className={s.primaryBtn} onClick={onCreate}>
            <Plus size={18} className={s.createIcon} />
            <span className={s.createText}>Create Link</span>
          </button>
          {/* Theme toggle */}
          <button
            className={s.themeToggle}
            aria-label="Toggle theme"
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {/* Mobile menu toggle */}
          <button
            className={s.menuToggle}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* User info (hidden on mobile) */}
          <div className={s.userBox}>
            <div className={s.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
            <div className={s.userInfo}>
              <span className={s.userName}>{user.name}</span>
              <span className={s.userPlan}>{user.plan} plan</span>
            </div>
          </div>
        </div>

        {/* ===== Mobile dropdown menu ===== */}
        {mobileMenuOpen && (
          <div className={s.mobileMenu}>
            <nav>
              {nav.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  pathname?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${s.mobileItem} ${active ? s.active : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className={s.mobileBottom}>
              <button
                onClick={!isPro ? onUpgrade : undefined}
                disabled={isPro}
                className={`${s.mobileUpgrade} ${isPro ? s.disabledBtn : ""}`}
              >
                <ArrowUpCircle size={18} />
                <span>{isPro ? "PRO ACTIVE" : "Upgrade"}</span>
              </button>

              <button onClick={handleLogout} className={s.mobileLogout}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ===== Sidebar (desktop only) ===== */}
      <aside
        className={`${s.sidebar} ${expanded ? s.expanded : s.collapsed}`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <nav className={s.nav}>
          {nav.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${s.navItem} ${active ? s.active : ""}`}
              >
                <Icon size={18} className={s.icon} />
                {expanded && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className={s.bottom}>
          <button
            onClick={!isPro ? onUpgrade : undefined}
            disabled={isPro}
            className={`${s.upgradeBtn} ${expanded ? "" : s.iconOnly} ${
              isPro ? s.disabledBtn : ""
            }`}
          >
            <ArrowUpCircle size={18} />
            {expanded && <span>{isPro ? "PRO ACTIVE" : "Upgrade"}</span>}
          </button>

          <button onClick={handleLogout} className={s.mobileLogout}>
            <LogOut size={16} />
            {expanded && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ===== Main ===== */}
      <main className={s.main}>
        <div className={s.content}>{children}</div>
      </main>

      {showAuthModal && (
        <AuthModal
          isOpen={true}
          mode="login"
          onClose={() => setShowAuthModal(false)}
          switchMode={() => {}}
          onAuthSuccess={(token) => {
            login(token);
            setShowAuthModal(false);
            window.location.reload(); // reload entire dashboard with user data
          }}
        />
      )}
      <TelegramChatButton username="mytiklink" />
    </div>
  );
}

"use client";

import { useState, useEffect, use } from "react";
import { useRouter, usePathname } from "next/navigation";
import styles from "./Navbar.module.css";
import { Menu, X } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { motion } from "framer-motion";

export default function Navbar({ openAuth }) {
  const router = useRouter();
  const pathname = usePathname();

  const { logout, subscribe } = useAuth();

  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  /* ===== LISTEN TO AUTH ===== */
  useEffect(() => {
    const unsub = subscribe(setIsLoggedIn);
    return unsub;
  }, [subscribe]);

  /* ===== CLOSE MENU ON ROUTE CHANGE ===== */
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close menu on nav Link click
  const handleNavLinkClick = () => {
    setOpen(false);
  };

  return (
    <>
      <motion.header
        className={styles.navbar}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className={styles.container}>
          {/* LOGO */}
          <motion.div
            className={styles.logo}
            onClick={() => router.push("/")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img src="/logo21.jpg" alt="TikLink" />
          </motion.div>

          {/* DESKTOP LINKS */}
          <motion.nav
            className={styles.navLinks}
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: {
                transition: { staggerChildren: 0.08 },
              },
            }}
          >
            <motion.a
              href="/blog"
              variants={{
                hidden: { y: 10, opacity: 0 },
                show: { y: 0, opacity: 1 },
              }}
              whileHover={{
                scale: 1.08,
                color: "#2f8cff",
              }}
            >
              Blog
            </motion.a>
            <motion.a
              href="#features"
              variants={{
                hidden: { y: 10, opacity: 0 },
                show: { y: 0, opacity: 1 },
              }}
              whileHover={{
                scale: 1.08,
                color: "#2f8cff",
              }}
            >
              How It Works
            </motion.a>
            <motion.a
              href="#pricing"
              variants={{
                hidden: { y: 10, opacity: 0 },
                show: { y: 0, opacity: 1 },
              }}
              whileHover={{
                scale: 1.08,
                color: "#2f8cff",
              }}
            >
              Pricing
            </motion.a>
          </motion.nav>

          {/* DESKTOP ACTIONS */}
          <div className={styles.actions}>
            <motion.a
              href="#faqs"
              className={styles.link}
              variants={{
                hidden: { y: 10, opacity: 0 },
                show: { y: 0, opacity: 1 },
              }}
              whileHover={{
                scale: 1.08,
                color: "#2f8cff",
              }}
            >
              FAQS
            </motion.a>

            <motion.a
              className={styles.link2}
              variants={{
                hidden: { y: 10, opacity: 0 },
                show: { y: 0, opacity: 1 },
              }}
              whileHover={{
                scale: 1.08,
                color: "#2f8cff",
              }}
              onClick={() =>
                isLoggedIn ? router.push("/dashboard") : openAuth("login")
              }
            >
              Login
            </motion.a>

            {isLoggedIn ? (
              <>
                <button
                  className={styles.cta}
                  onClick={() => router.push("/dashboard")}
                >
                  Dashboard
                </button>
              </>
            ) : (
              <>
                <motion.button
                  className={styles.cta}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openAuth("register")}
                >
                  Create an Account
                </motion.button>
              </>
            )}
          </div>

          {/* MOBILE ICON */}
          <div className={styles.menuBtn} onClick={() => setOpen(!open)}>
            {open ? <X size={26} /> : <Menu size={26} />}
          </div>
        </div>
      </motion.header>

      {/* OVERLAY */}
      <div
        className={`${styles.overlay} ${open ? styles.show : ""}`}
        onClick={() => setOpen(false)}
      />

      {/* MOBILE MENU */}
      <div className={`${styles.mobileMenu} ${open ? styles.open : ""}`}>
        <div className={styles.mobileTop}>
          <img src="/logo21.jpg" alt="logo" />
          <X size={24} onClick={() => setOpen(false)} />
        </div>

        <motion.div
          className={styles.mobileLinks}
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: { staggerChildren: 0.07 },
            },
          }}
        >
          <motion.div
            className={styles.mobileItem}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
            onClick={handleNavLinkClick}
          >
            <a href="/blog">Blog</a>
          </motion.div>
          <div className={styles.mobileItem} onClick={handleNavLinkClick}>
            <a href="#features">How It Works</a>
          </div>
          <div className={styles.mobileItem} onClick={handleNavLinkClick}>
            <a href="#pricing">Pricing</a>
          </div>
          <div className={styles.mobileItem} onClick={handleNavLinkClick}>
            <a href="#faqs">FAQs</a>
          </div>

          {/* MOBILE CTA */}
          <div className={styles.CTA}>
            {isLoggedIn ? (
              <>
                <button
                  className={styles.mobileCTA2}
                  onClick={() => router.push("/dashboard")}
                >
                  Dashboard
                </button>

                <button className={styles.mobileCTA} onClick={logout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <motion.button
                  className={styles.mobileCTA2}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => openAuth("login")}
                >
                  Login
                </motion.button>

                <motion.button
                  className={styles.mobileCTA}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  onClick={() => openAuth("register")}
                >
                  Get Started
                </motion.button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}

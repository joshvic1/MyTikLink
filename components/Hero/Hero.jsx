"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import styles from "./Hero.module.css";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function Hero({ openAuth }) {
  const router = useRouter();
  const { subscribe } = useAuth();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsub = subscribe(setIsLoggedIn);
    return unsub;
  }, [subscribe]);

  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        {/* LEFT */}
        <motion.div
          className={styles.left}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* HEADING */}
          <motion.h1
            className={styles.heading}
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.08 } },
            }}
          >
            {["Turn your ads clicks into", "Sales & Traffic"].map((text, i) => (
              <motion.span
                key={i}
                style={{ display: "block" }}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  show: { opacity: 1, y: 0 },
                }}
              >
                {text}
              </motion.span>
            ))}
          </motion.h1>

          {/* SUBTEXT */}
          <motion.p
            className={styles.sub}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Create high-converting pages in minutes, capture people, make sales
            or send traffic to WhatsApp, Telegram or anywhere you want.
          </motion.p>

          {/* CTA */}
          <motion.div
            className={styles.cta}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              className={styles.primaryBtn}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                isLoggedIn ? router.push("/dashboard") : openAuth("register")
              }
            >
              Get Started Free
            </motion.button>

            <motion.button
              className={styles.primaryBtn2}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openAuth("login")}
            >
              Login
            </motion.button>
          </motion.div>

          {/* TAGS */}
          <motion.div
            className={styles.cards}
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: {
                transition: { staggerChildren: 0.05, delayChildren: 0.8 },
              },
            }}
          >
            {[
              "Landing Page",
              "Lead Capture",
              "Link in bio",
              "Analytics",
              "Integrations",
            ].map((tag, i) => (
              <motion.span
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0 },
                }}
                whileHover={{ scale: 1.08 }}
              >
                {tag}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>

        {/* RIGHT */}
        <motion.div
          className={styles.right}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className={styles.mock}
            whileHover={{ scale: 1.03, rotate: 0.5 }}
            transition={{ type: "spring", stiffness: 120 }}
          >
            <img src="/hero2.png" alt="Hero Mockup" />

            {/* VIDEO */}
            <motion.div
              className={styles.videoOverlay}
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                className={styles.playButton}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                ▶
              </motion.div>

              <div className={styles.videoText}>
                <span className={styles.playSmall}>Play this video</span>
                <span className={styles.playBig}>
                  Watch how MyTikLink works
                </span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

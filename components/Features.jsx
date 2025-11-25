"use client";

import { Shield, Sparkles, BarChart3, Users } from "lucide-react";
import { motion } from "framer-motion";
import styles from "@/styles/Features.module.css";

export default function Features() {
  return (
    <section className={styles.section} id="features">
      <div className={styles.container}>
        {/* Header — soft fade/slide up */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          whileInView={{
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
          }}
          transition={{
            duration: 1.1,
            ease: [0.16, 1, 0.3, 1],
          }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <h2 className={styles.title}>
            Powerful features, <span>simple to use</span>
          </h2>
          <p className={styles.sub}>
            Everything you need to turn TikTok traffic into real WhatsApp
            conversations.
          </p>
        </motion.div>

        {/* Grid wrapper — just for stagger */}
        <motion.div
          className={styles.grid}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ staggerChildren: 0.2, delayChildren: 0.2 }}
        >
          {/* Card 1 — from LEFT */}
          <motion.div
            className={styles.card}
            variants={{
              hidden: { opacity: 0, x: -40, filter: "blur(4px)" },
              show: {
                opacity: 1,
                x: 0,
                filter: "blur(0px)",
                transition: {
                  duration: 1.1,
                  ease: [0.16, 1, 0.3, 1],
                },
              },
            }}
          >
            <div className={styles.icon}>
              <Shield size={20} />
            </div>
            <h3>Create Multiple Links</h3>
            <p>
              Built specifically for TikTok’s in-app browser to prevent link
              failures or blocks. You can customize your links easily.
            </p>
          </motion.div>

          {/* Card 2 — from RIGHT */}
          <motion.div
            className={styles.card}
            variants={{
              hidden: { opacity: 0, x: 40, filter: "blur(4px)" },
              show: {
                opacity: 1,
                x: 0,
                filter: "blur(0px)",
                transition: {
                  duration: 1.1,
                  ease: [0.16, 1, 0.3, 1],
                },
              },
            }}
          >
            <div className={styles.icon}>
              <Sparkles size={20} />
            </div>
            <h3>Smart templates</h3>
            <p>Create branded and stunning WhatsApp templates.</p>
          </motion.div>

          {/* Card 3 — soft scale/“reveal” */}
          <motion.div
            className={styles.card}
            variants={{
              hidden: { opacity: 0, scale: 0.9, y: 20, filter: "blur(4px)" },
              show: {
                opacity: 1,
                scale: 1,
                y: 0,
                filter: "blur(0px)",
                transition: {
                  duration: 1.15,
                  ease: [0.16, 1, 0.3, 1],
                },
              },
            }}
          >
            <div className={styles.icon}>
              <BarChart3 size={20} />
            </div>
            <h3>Real-time analytics</h3>
            <p>
              Track clicks, devices, sources and conversions — all in one
              dashboard.
            </p>
          </motion.div>

          {/* Card 4 — from RIGHT (mirroring 1 & 2 for balance) */}
          <motion.div
            className={styles.card}
            variants={{
              hidden: { opacity: 0, x: 40, filter: "blur(4px)" },
              show: {
                opacity: 1,
                x: 0,
                filter: "blur(0px)",
                transition: {
                  duration: 1.2,
                  ease: [0.16, 1, 0.3, 1],
                },
              },
            }}
          >
            <div className={styles.icon}>
              <Users size={20} />
            </div>
            <h3>Team collaboration</h3>
            <p>
              Share links, manage profiles and invite team members securely.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

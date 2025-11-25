"use client";
import { motion } from "framer-motion";
import styles from "@/styles/Stats.module.css";

const headerVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const gridVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.2,
    },
  },
};

const fromLeft = {
  hidden: { opacity: 0, x: -30, filter: "blur(4px)" },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const fromRight = {
  hidden: { opacity: 0, x: 30, filter: "blur(4px)" },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const reveal = {
  hidden: { opacity: 0, scale: 0.9, y: 15, filter: "blur(4px)" },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function Stats() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          variants={headerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <h2 className={styles.title}>Creators love TikLink</h2>
          <p className={styles.sub}>
            Trusted by hundreds of creators across the globe to connect with
            their audience.
          </p>
        </motion.div>

        <motion.div
          className={styles.grid}
          variants={gridVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* 1 — from left */}
          <motion.div className={styles.stat} variants={fromLeft}>
            <h3 className={styles.number}>+38%</h3>
            <p className={styles.label}>More chats started from TikTok bio</p>
          </motion.div>

          {/* 2 — from right */}
          <motion.div className={styles.stat} variants={fromRight}>
            <h3 className={styles.number}>99.9%</h3>
            <p className={styles.label}>Successful open rate</p>
          </motion.div>

          {/* 3 — reveal (scale + fade) */}
          <motion.div className={styles.stat} variants={reveal}>
            <h3 className={styles.number}>&lt;300ms</h3>
            <p className={styles.label}>Average redirect speed</p>
          </motion.div>

          {/* 4 — from right again for balance */}
          <motion.div className={styles.stat} variants={fromRight}>
            <h3 className={styles.number}>1 link</h3>
            <p className={styles.label}>To rule every bio click</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

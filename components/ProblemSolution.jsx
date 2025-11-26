"use client";
import { X, Check } from "lucide-react";
import { motion } from "framer-motion";
import styles from "@/styles/ProblemSolution.module.css";

const sectionVariants = {
  hidden: { opacity: 0, x: -40, filter: "blur(4px)" },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const gridVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.25,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, x: -30, filter: "blur(4px)" },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 1.3,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function ProblemSolution() {
  return (
    <section className={styles.section} id="about">
      <div className={styles.container}>
        {/* Section Heading */}
        <motion.div
          className={styles.header}
          variants={sectionVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }} // only when in view
        >
          <h2 className={styles.title}>
            The problem with TikTok & Whatsapp <span>links</span>
          </h2>
          {/* <p className={styles.sub}>
            TikTok blocks or breaks WhatsApp links inside its in-app browser.
            TikLink solves this silently in the background.
          </p> */}
        </motion.div>

        <motion.div
          className={styles.grid}
          variants={gridVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Problem */}
          <motion.div
            className={`${styles.card} ${styles.problem}`}
            variants={cardVariants}
          >
            <div className={styles.iconWrap}>
              <X size={20} />
            </div>
            <h3 className={styles.cardTitle}>Why WhatsApp links fail</h3>
            <p className={styles.text}>
              TikTok’s in-app browser doesn’t allow normal WhatsApp links to
              open correctly. Whenever a user clicks your link, it blocks them.
              This can be so frustrating for creators or business owners trying
              to connect with their audience.
            </p>
            <div className={styles.media}>
              <img
                src="/images/problem-tiktok-broken.png"
                alt="Broken TikTok link"
              />
            </div>
          </motion.div>

          {/* Solution */}
          <motion.div
            className={`${styles.card} ${styles.solution}`}
            variants={cardVariants}
          >
            <div className={styles.iconWrapSuccess}>
              <Check size={20} />
            </div>
            <h3 className={styles.cardTitle}>How TikLink fixes it</h3>
            <p className={styles.text}>
              TikLink has solved this problem. We will generate a link for you
              making it safe and possible for people to contact you straight
              from TikTok without your link getting broken.
            </p>
            <div className={styles.media}>
              <img src="/images/problem-fixed.png" alt="Working TikLink" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

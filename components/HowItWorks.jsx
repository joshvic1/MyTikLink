"use client";

import { motion } from "framer-motion";
import styles from "@/styles/HowItWorks.module.css";

const headerVariants = {
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

const cardsContainerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.25,
      delayChildren: 0.3,
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

export default function HowItWorks() {
  return (
    <section className={styles.section} id="how-it-works">
      <div className={styles.container}>
        {/* Header */}
        <motion.div
          className={styles.header}
          variants={headerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }} // only when scrolled into view
        >
          <h2 className={styles.title}>How TikLink works</h2>
          <p className={styles.sub}>
            Turn blocked TikTok → WhatsApp links into smooth, working funnels in
            a few simple steps.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          className={styles.cards}
          variants={cardsContainerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* STEP 1 */}
          <motion.div className={styles.card} variants={cardVariants}>
            <span className={styles.stepNumber}>01</span>
            <div className={styles.iconWrap}>1</div>
            <h4>Create your TikLink</h4>
            <p>
              Sign up and generate a custom TikLink that’s built to bypass
              TikTok’s in-app browser issues.
            </p>
            <img
              className={styles.media}
              src="/images/register.png"
              alt="Create your TikLink"
            />
          </motion.div>

          {/* STEP 2 */}
          <motion.div className={styles.card} variants={cardVariants}>
            <span className={styles.stepNumber}>02</span>
            <div className={styles.iconWrap}>2</div>
            <h4>Add it to your TikTok bio</h4>
            <p>
              Replace your old WhatsApp link with your new TikLink so clicks
              stop breaking inside TikTok.
            </p>
            <img
              className={styles.media}
              src="/images/profile1.png"
              alt="Add to TikTok bio"
            />
          </motion.div>

          {/* STEP 3 */}
          <motion.div className={styles.card} variants={cardVariants}>
            <span className={styles.stepNumber}>03</span>
            <div className={styles.iconWrap}>3</div>
            <h4>Watch chats come in</h4>
            <p>
              When people click, WhatsApp opens correctly and they can message
              you without friction. No more "Action can't be completed" errors!
            </p>
            <img
              className={styles.media}
              src="/images/leads.png"
              alt="Leads coming in"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

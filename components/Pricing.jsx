"use client";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";
import styles from "@/styles/Pricing.module.css";
import { useRouter } from "next/navigation";

const headerVariants = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
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
      staggerChildren: 0.22,
      delayChildren: 0.2,
    },
  },
};

const fromLeft = {
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
};

const fromCenter = {
  hidden: { opacity: 0, scale: 0.9, y: 24, filter: "blur(4px)" },
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
};

const fromRight = {
  hidden: { opacity: 0, x: 40, filter: "blur(4px)" },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 1.15,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function Pricing() {
  const router = useRouter();
  const [billing, setBilling] = useState("monthly");

  return (
    <section className={styles.section} id="pricing">
      <div className={styles.container}>
        {/* Header */}
        <motion.div
          className={styles.header}
          variants={headerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <h2 className={styles.title}>Simple, transparent pricing</h2>
          <p className={styles.sub}>
            Get the most out of TikLink with our affordable plans designed for
            creators of all sizes.
          </p>
        </motion.div>

        {/* Toggle */}
        <motion.div
          className={styles.toggle}
          initial={{ opacity: 0, y: 10, filter: "blur(3px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <span className={billing === "monthly" ? styles.active : ""}>
            Monthly
          </span>
          <button
            className={styles.switch}
            onClick={() =>
              setBilling(billing === "monthly" ? "yearly" : "monthly")
            }
            aria-label="Toggle billing"
          >
            <span
              className={`${styles.knob} ${
                billing === "yearly" ? styles.knobRight : ""
              }`}
            />
          </button>
          <span className={billing === "yearly" ? styles.active : ""}>
            Yearly
          </span>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          className={styles.grid}
          variants={gridVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Free – from left */}
          <motion.div className={styles.card} variants={fromLeft}>
            <h3>Free</h3>
            <p className={styles.price}>
              ₦0<span></span>
            </p>
            <ul className={styles.features}>
              <li>
                <Check size={16} /> 1 link creation
              </li>
              <li>
                <Check size={16} /> 250 max click on Link
              </li>
              <li>
                <Check size={16} /> 1 template available
              </li>
              <li>
                <Check size={16} /> TikLink Tag on redirect page
              </li>
              <li>
                <X size={16} /> Analytics
              </li>
              <li>
                <X size={16} />
                No customization of Link
              </li>
              <li>
                <X size={16} /> Fast redirect speed
              </li>
              <li>
                <X size={16} /> Priority support
              </li>
            </ul>
            <button
              className={styles.btn}
              onClick={() => router.push("/dashboard")}
            >
              Get Started
            </button>
          </motion.div>

          {/* Standard – soft reveal from center (popular) */}
          <motion.div
            className={`${styles.card} ${styles.popular}`}
            variants={fromCenter}
          >
            <span className={styles.badge}>Popular</span>
            <h3>Standard</h3>
            <p className={styles.price}>
              {billing === "monthly" ? "₦2,000" : "₦18,000"}
              <span>{billing === "monthly" ? "/mo" : "/yr"}</span>
            </p>
            <ul className={styles.features}>
              <li>
                <Check size={16} /> Create up to 3 Links
              </li>
              <li>
                <Check size={16} /> 5000 max click on each Link
              </li>
              <li>
                <Check size={16} /> Basic templates available
              </li>
              <li>
                <Check size={16} /> TikLink Tag on redirect page
              </li>
              <li>
                <X size={16} /> Analytics
              </li>
              <li>
                <X size={16} />
                No customization of Link
              </li>
              <li>
                <X size={16} /> Fast redirect speed
              </li>
              <li>
                <Check size={16} /> Priority support
              </li>
            </ul>
            <button
              className={styles.btn}
              onClick={() => router.push("/dashboard")}
            >
              Choose Starter
            </button>
          </motion.div>

          {/* Pro – from right */}
          <motion.div className={styles.card} variants={fromRight}>
            <h3>Pro</h3>
            <p className={styles.price}>
              {billing === "monthly" ? "₦5,000" : "₦40,000"}
              <span>{billing === "monthly" ? "/mo" : "/yr"}</span>
            </p>
            <ul className={styles.features}>
              <li>
                <Check size={16} /> Create unlimited Links
              </li>
              <li>
                <Check size={16} /> Unlimited Link clicks
              </li>
              <li>
                <Check size={16} /> Premium templates available
              </li>
              <li>
                <Check size={16} /> No TikLink Tag on redirect page
              </li>
              <li>
                <Check size={16} /> Detailed Analytics
              </li>
              <li>
                <Check size={16} />
                Can customize Link
              </li>
              <li>
                <Check size={16} /> Very Fast redirect speed
              </li>
              <li>
                <Check size={16} /> Priority support
              </li>
            </ul>
            <button
              className={styles.btn}
              onClick={() => router.push("/dashboard")}
            >
              Go Pro
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

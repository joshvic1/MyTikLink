"use client";

import styles from "./Pricing.module.css";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { motion } from "framer-motion";

export default function Pricing({ openAuth }) {
  const [billing, setBilling] = useState("yearly"); // default yearly
  const router = useRouter();

  const { isLoggedIn } = useAuth();

  const handleCTA = () => {
    if (isLoggedIn) {
      router.push("/dashboard");
    } else {
      openAuth("login");
    }
  };

  /* 🔥 STAGGER ANIMATION */
  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const card = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className={styles.section} id="pricing">
      <div className={styles.container}>
        {/* HEADER */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.toggleWrap}>
            <div className={styles.toggle}>
              <button
                className={billing === "monthly" ? styles.active : ""}
                onClick={() => setBilling("monthly")}
              >
                Monthly
              </button>

              <button
                className={billing === "yearly" ? styles.active : ""}
                onClick={() => setBilling("yearly")}
              >
                Yearly
                <span className={styles.badge}>-20%</span>
              </button>

              <div
                className={`${styles.slider} ${
                  billing === "yearly" ? styles.right : ""
                }`}
              />
            </div>
          </div>
          <h2>Choose your plan</h2>
          <p>Start free, upgrade when you're ready. No pressure</p>
        </motion.div>

        {/* PRICING */}
        <motion.div
          className={styles.pricingWrap}
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {/* FREE */}
          <motion.div
            variants={card}
            whileHover={{ y: -8, scale: 1.02 }}
            className={styles.card}
          >
            <div className={styles.cardContent}>
              <h3>Free</h3>
              <p className={styles.sub}>For getting started</p>
              <div className={styles.price}>₦0</div>

              <ul className={styles.features}>
                <li>
                  <X size={16} /> No Landing Page
                </li>
                <li>
                  <Check size={16} /> 1 link in bio creation
                </li>
                <li>
                  <Check size={16} /> 250 max clicks
                </li>
                <li>
                  <Check size={16} /> 1 template
                </li>
                <li>
                  <X size={16} /> No Pixel integration
                </li>
                <li>
                  <Check size={16} /> TikLink branding
                </li>
                <li>
                  <Check size={16} /> Basic analytics
                </li>
              </ul>
            </div>

            <button className={styles.btnOutline} onClick={handleCTA}>
              Get Started
            </button>
          </motion.div>

          {/* STANDARD */}
          <motion.div
            variants={card}
            whileHover={{ y: -10, scale: 1.03 }}
            className={styles.card}
          >
            <div className={styles.cardContent}>
              <h3>Standard</h3>
              <p className={styles.sub}>For growing businesses</p>

              <div className={styles.price}>
                {billing === "monthly" ? "₦2,000" : "₦18,000"}
                <span>/{billing === "monthly" ? "mo" : "yr"}</span>
              </div>

              <ul className={styles.features}>
                <li>
                  <X size={16} /> No Landing Page
                </li>
                <li>
                  <Check size={16} /> Up to 3 links
                </li>
                <li>
                  <Check size={16} /> 5000 clicks
                </li>
                <li>
                  <Check size={16} /> Unlimited Templates
                </li>
                <li>
                  <X size={16} /> No Pixel
                </li>
                <li>
                  <Check size={16} /> Analytics
                </li>
                <li>
                  <Check size={16} /> Fast redirect
                </li>
              </ul>
            </div>

            <button className={styles.btnOutline} onClick={handleCTA}>
              Choose Plan
            </button>
          </motion.div>

          {/* PRO */}
          <motion.div
            variants={card}
            whileHover={{ y: -12, scale: 1.05 }}
            className={`${styles.card} ${styles.highlight}`}
          >
            <div className={styles.cardContent}>
              <div className={styles.popular}>Most Popular</div>

              <h3>Pro</h3>
              <p className={styles.sub}>For serious sellers</p>

              <div className={styles.price}>
                {billing === "monthly" ? "₦5,000" : "₦40,000"}
                <span>/{billing === "monthly" ? "mo" : "yr"}</span>
              </div>

              <ul className={styles.features}>
                <li>
                  <Check size={16} /> Unlimited Landing Pages
                </li>
                <li>
                  <Check size={16} /> Unlimited links
                </li>
                <li>
                  <Check size={16} /> Unlimited clicks
                </li>
                <li>
                  <Check size={16} /> Premium templates
                </li>
                <li>
                  <Check size={16} /> Pixel integration
                </li>
                <li>
                  <Check size={16} /> No branding
                </li>
                <li>
                  <Check size={16} /> Full customization
                </li>
              </ul>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              className={styles.btnPrimary}
              onClick={handleCTA}
            >
              Go Pro
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

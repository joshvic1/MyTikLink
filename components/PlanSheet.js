"use client";
import { useState } from "react";
import { ChevronDown, ChevronRight, Crown } from "lucide-react";
import styles from "@/styles/UpgradeModal.module.css";

export default function PlanSheet({
  plan,
  billingCycle,
  active,
  setActive, // tells parent which is open
  onUpgrade,
  isMobile,
}) {
  const price = billingCycle === "monthly" ? plan.monthly : plan.yearly;
  const isOpen = active === plan.name;

  return (
    <div
      className={`${styles.accordionCard} ${
        plan.name === "Pro" ? styles.proCard : ""
      }`}
    >
      {/* HEADER */}
      <button
        className={styles.accordionHeader}
        onClick={() => setActive(isOpen ? null : plan.name)}
      >
        <div className={styles.headerLeft}>
          {plan.name === "Pro" && (
            <Crown size={16} className={styles.proCrown} />
          )}
          <span className={styles.planName}>{plan.name}</span>
        </div>

        {isOpen ? (
          <ChevronDown size={18} className={styles.icon} />
        ) : (
          <ChevronRight size={18} className={styles.icon} />
        )}
      </button>

      {/* COLLAPSIBLE CONTENT */}
      <div
        className={`${styles.accordionContent} ${
          isOpen ? styles.open : styles.closed
        }`}
      >
        <div className={styles.priceBlock}>
          ₦{price}
          <span className={styles.cycle}>
            /{billingCycle === "monthly" ? "mo" : "yr"}
          </span>
        </div>

        <ul className={styles.featureList}>
          {plan.features.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>

        <button
          className={styles.upgradeBtn}
          onClick={() =>
            onUpgrade({
              name: plan.name,
              price,
              cycle: billingCycle,
            })
          }
        >
          Upgrade to {plan.name}
        </button>
      </div>
    </div>
  );
}

"use client";

import { Store, CreditCard, Palette, Check } from "lucide-react";

import styles from "../styles/storeStepIndicator.module.css";

const steps = [
  {
    id: 1,
    label: "Business Details",
    icon: Store,
  },

  {
    id: 2,
    label: "Payment Details",
    icon: CreditCard,
  },

  {
    id: 3,
    label: "Store Design",
    icon: Palette,
  },
];

export default function StoreStepIndicator({ step }) {
  return (
    <div className={styles.wrapper}>
      {steps.map((item, index) => {
        const Icon = item.icon;

        const active = step === item.id;

        const completed = step > item.id;

        return (
          <div key={item.id} className={styles.stepWrap}>
            <div className={styles.step}>
              <div
                className={`
                  ${styles.circle}
                  ${active ? styles.active : ""}
                  ${completed ? styles.completed : ""}
                `}
              >
                {completed ? <Check size={14} /> : <Icon size={14} />}
              </div>

              <span
                className={`
                  ${styles.label}
                  ${active ? styles.activeText : ""}
                `}
              >
                {item.label}
              </span>
            </div>

            {index !== steps.length - 1 && (
              <div
                className={`
                  ${styles.line}
                  ${step > item.id ? styles.lineActive : ""}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

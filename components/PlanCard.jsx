"use client";
import styles from "@/styles/PlanCard.module.css";
import { Crown } from "lucide-react";
import { planConfig } from "@/config/planConfig";

export default function PlanCard({
  userPlan,
  redirectsUsed,
  redirectLimit,
  onUpgrade,
}) {
  const paidProPlans = ["pro_monthly", "pro_yearly"];
  const isPro = paidProPlans.includes(userPlan);

  const percentage =
    redirectLimit === Infinity
      ? 100
      : Math.min(100, (redirectsUsed / redirectLimit) * 100);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {userPlan.replace("_", " ").toUpperCase()} Plan
        </h2>
        {isPro && <Crown className={styles.crown} size={18} />}
      </div>

      <div className={styles.usageText}>
        <span className={styles.used}>{redirectsUsed}</span>
        <span className={styles.slash}> / </span>
        <span className={styles.limit}>
          {redirectLimit === Infinity ? "∞" : redirectLimit}
        </span>
        <span className={styles.subLabel}> links created</span>
      </div>

      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      {isPro ? (
        <div className={styles.activeBadge}>Pro Plan Active ✅</div>
      ) : (
        <button className={styles.upgradeBtn} onClick={onUpgrade}>
          Upgrade Plan
        </button>
      )}
    </div>
  );
}

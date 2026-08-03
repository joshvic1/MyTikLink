"use client";

import styles from "@/styles/pageNameSheet.module.css";
import axios from "axios";

export default function PlanChangeSheet({ currentPlan, onClose }) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const plans = getAvailablePlans(currentPlan);

  const handleUpgrade = async (plan) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/initiate`,
        { plan },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      window.location.href = res.data.authorizationUrl;
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.handle} />

        <h2 className={styles.title}>Change Plan</h2>

        {plans.length === 0 ? (
          <p style={{ textAlign: "center", color: "#aaa" }}>
            You are already on the highest plan. You can change plan after your
            current plan expires.
          </p>
        ) : (
          plans.map((p) => (
            <div
              key={p.plan}
              style={{
                border: "1px solid #333",
                borderRadius: "12px",
                padding: "14px",
                marginBottom: "12px",
              }}
            >
              <h4>
                {p.name} - ₦{p.price.toLocaleString()}
              </h4>

              {p.discount && (
                <p style={{ color: "#22c55e", fontSize: "12px" }}>
                  Discount applied
                </p>
              )}

              {p.note && (
                <p style={{ color: "#94a3b8", fontSize: "12px" }}>{p.note}</p>
              )}

              <button
                className={styles.button}
                onClick={() => handleUpgrade(p.plan)}
              >
                Upgrade
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function getAvailablePlans(currentPlan) {
  switch (currentPlan) {
    case "standard_monthly":
      return [
        {
          name: "Pro Monthly",
          plan: "pro_monthly",
          price: 3000,
          discount: true,
          note: "Your current expiry date stays the same.",
        },
      ];

    case "standard_yearly":
      return [
        {
          name: "Pro Yearly",
          plan: "pro_yearly",
          price: 22000,
          discount: true,
          note: "Your expiry keeps the same day and month, then moves one year ahead.",
        },
      ];

    case "pro_monthly":
      return [
        {
          name: "Pro Yearly",
          plan: "pro_yearly",
          price: 35000,
          discount: true,
          note: "Your expiry keeps the same day and month, then moves one year ahead.",
        },
      ];

    case "pro_yearly":
      return [];

    default:
      return [];
  }
}

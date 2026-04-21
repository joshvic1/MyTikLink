"use client";

import styles from "@/styles/pageNameSheet.module.css";
import axios from "axios";

export default function PlanChangeSheet({ currentPlan, onClose, onSuccess }) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const plans = getAvailablePlans(currentPlan);

  const handleUpgrade = async (plan, cycle, price, keepExpiry) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/initiate`,
        {
          plan: p.plan, // ✅ already full string
          overrideAmount: p.price,
          keepExpiry: p.keepExpiry || false,
        },
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
            You are on the highest plan. Wait for expiry and renew.
          </p>
        ) : (
          plans.map((p, i) => (
            <div
              key={i}
              style={{
                border: "1px solid #333",
                borderRadius: "12px",
                padding: "14px",
                marginBottom: "12px",
              }}
            >
              <h4>
                {p.name} — ₦{p.price.toLocaleString()}
              </h4>

              {p.discount && (
                <p style={{ color: "#22c55e", fontSize: "12px" }}>
                  Discount applied
                </p>
              )}

              <button
                className={styles.button}
                onClick={() =>
                  handleUpgrade(p.plan, p.cycle, p.price, p.keepExpiry)
                }
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
          name: "Standard Yearly",
          plan: "standard_yearly",
          price: 18000,
        },
        {
          name: "Pro Monthly",
          plan: "pro_monthly",
          price: 3000, // discount
          discount: true,
          keepExpiry: true,
        },
        {
          name: "Pro Yearly",
          plan: "pro_yearly",
          price: 40000,
        },
      ];

    case "standard_yearly":
      return [
        {
          name: "Pro Yearly",
          plan: "pro_yearly",
          price: 22000, // discount
          discount: true,
          keepExpiry: true,
        },
      ];

    case "pro_monthly":
      return [
        {
          name: "Pro Yearly",
          plan: "pro_yearly",
          price: 40000,
        },
      ];

    case "pro_yearly":
      return [];

    default:
      return [];
  }
}

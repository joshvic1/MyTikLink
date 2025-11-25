"use client";

import { X, Crown, Info, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import styles from "@/styles/UpgradeModal.module.css";

export default function UpgradeModal({ currentPlan, setShowModal, onUpgrade }) {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [expandedCard, setExpandedCard] = useState("null");

  const sheetRef = useRef(null);
  const dragZoneRef = useRef(null);

  // Drag variables
  const startY = useRef(0);
  const currentY = useRef(0);
  const dragging = useRef(false);

  // Plans
  const plans = useMemo(
    () => [
      {
        id: "standard",
        name: "Standard",
        monthly: 2000,
        yearly: 18000,
        limit: "Create up to 3 links",
        features: [
          { id: "f1", title: "Create up to 3 links", desc: "Monthly" },
          {
            id: "f2",
            title: "Templates",
            desc: "Get access to more stunning templates",
          },
          {
            id: "f3",
            title: "5000 Link click Limit",
            desc: "Each link you create can only be clicked 5000 times in a month",
          },
          {
            id: "f4",
            title: "Priority Support",
            desc: "Get fast support from the TikLink team",
          },
        ],
      },
      {
        id: "pro",
        name: "Pro",
        monthly: 5000,
        yearly: 40000,
        limit: "Create Unlimited Links",
        features: [
          { id: "f1", title: "Create unlimited Links", desc: "Monthly" },
          {
            id: "f2",
            title: "Templates",
            desc: "Get access to unlimited stunning templates",
          },
          {
            id: "f3",
            title: "Unlimited click Limit",
            desc: "Your links can be clicked unlimited times",
          },
          {
            id: "f3",
            title: "Priority Support",
            desc: "Get extra fast support from the TikLink team",
          },
        ],
      },
    ],
    []
  );

  const currency = (amount) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);

  // DRAG ENABLED ONLY on HANDLE
  useEffect(() => {
    const zone = dragZoneRef.current;
    const sheet = sheetRef.current;
    if (!zone || !sheet) return;

    const onStart = (e) => {
      dragging.current = true;
      startY.current = e.touches[0].clientY;
    };

    const onMove = (e) => {
      if (!dragging.current) return;
      currentY.current = e.touches[0].clientY - startY.current;

      if (currentY.current > 0) {
        sheet.style.transform = `translateY(${currentY.current}px)`;
      }
    };

    const onEnd = () => {
      dragging.current = false;
      if (currentY.current > 100) {
        sheet.style.transform = "translateY(100%)";
        setTimeout(() => setShowModal(false), 200);
      } else {
        sheet.style.transform = "translateY(0)";
      }
      currentY.current = 0;
    };

    zone.addEventListener("touchstart", onStart);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onEnd);

    return () => {
      zone.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [setShowModal]);

  // PAYMENT (unchanged)
  const handleUpgrade = async ({ id, name, price, cycle }) => {
    try {
      setLoadingPlan(id);

      const token = localStorage.getItem("token");
      if (!token) return toast.error("Please login");

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/initiate`,
        { plan: name, amount: price, cycle },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { email, paymentId } = res.data;

      if (!window.PaystackPop) {
        await new Promise((resolve) => {
          const s = document.createElement("script");
          s.src = "https://js.paystack.co/v1/inline.js";
          s.onload = resolve;
          document.body.appendChild(s);
        });
      }

      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_KEY,
        email,
        amount: price * 100,
        ref: paymentId,
        callback: (response) => verifyPayment(response.reference),
        onClose: () => setLoadingPlan(null),
      });

      handler.openIframe();
    } catch (e) {
      toast.error("Payment failed");
      setLoadingPlan(null);
    }
  };

  const verifyPayment = async (reference) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/verify/${reference}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success("Upgrade successful!");
        // Save new token so dashboard loads updated plan
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
        }

        onUpgrade(res.data.plan);
        setShowModal(false);
      } else toast.error("Verification failed");
    } catch {
      toast.error("Verification error");
    } finally {
      setLoadingPlan(null);
    }
  };
  useEffect(() => {
    setTimeout(() => {
      sheetRef.current?.classList.add(styles.bounce);
    }, 300);
  }, []);

  return (
    <div className={styles.backdrop} onClick={() => setShowModal(false)}>
      <div
        className={styles.container}
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile swipe zone */}
        <div className={styles.dragZone} ref={dragZoneRef}>
          <div className={styles.handle} />
        </div>

        <div className={styles.headerRow}>
          <div className={styles.headerLeft}>
            <h3 className={styles.title}>Upgrade Plan</h3>
            <p className={styles.subtitle}>
              Current: <strong>{currentPlan}</strong>
            </p>
          </div>

          <div className={styles.headerRight}>
            <button
              className={styles.closeBtn}
              onClick={() => setShowModal(false)}
            >
              <X size={20} className={styles.closeIcon} />
            </button>
          </div>
        </div>

        {/* Billing Toggle */}
        <div className={styles.billingToggle}>
          <button
            className={`${billingCycle === "monthly" && styles.activeToggle}`}
            onClick={() => setBillingCycle("monthly")}
          >
            Monthly
          </button>
          <button
            className={`${billingCycle === "yearly" && styles.activeToggle}`}
            onClick={() => setBillingCycle("yearly")}
          >
            Yearly <span className={styles.save}>(Save 20%)</span>
          </button>
        </div>

        <div className={styles.plansList}>
          {plans.map((plan) => {
            const price =
              billingCycle === "monthly" ? plan.monthly : plan.yearly;
            const open = expandedCard === plan.id;
            // CUSTOM PLAN LOGIC
            const isStandardMonthly = currentPlan === "standard_monthly";
            const isStandardYearly = currentPlan === "standard_yearly";

            let buttonLabel = `Upgrade to ${plan.name}`;
            let disabled = false;

            // If the plan is STANDARD
            if (plan.id === "standard") {
              if (billingCycle === "monthly" && isStandardMonthly) {
                buttonLabel = "You're already on this plan";
                disabled = true;
              }
              if (billingCycle === "yearly" && isStandardYearly) {
                buttonLabel = "You're already on this plan";
                disabled = true;
              }

              if (billingCycle === "yearly" && isStandardMonthly) {
                buttonLabel = "Switch to Standard Yearly";
              }
            }

            // Pro logic — no changes needed
            if (plan.id === "pro" && currentPlan.startsWith("pro")) {
              buttonLabel = "You're already on Pro";
              disabled = true;
            }

            return (
              <div
                key={plan.id}
                className={`${styles.planCard} ${open && styles.open}`}
                onClick={() => setExpandedCard(open ? null : plan.id)}
              >
                <div className={styles.cardHeader}>
                  <div>
                    <div className={styles.price}>{currency(price)}</div>
                    <div className={styles.planName}>{plan.name}</div>
                    <div className={styles.limit}>{plan.limit}</div>
                  </div>

                  <div className={styles.rightIcons}>
                    {plan.id === "pro" && (
                      <span className={styles.crown}>
                        <Crown size={14} />
                      </span>
                    )}
                    <span
                      className={`${styles.arrow} ${open && styles.rotate}`}
                    >
                      {open ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </span>
                  </div>
                </div>

                {/* BODY */}
                {open && (
                  <div className={styles.body}>
                    {plan.features.map((f) => (
                      <div className={styles.feature} key={f.id}>
                        <div>
                          <div className={styles.featureTitle}>{f.title}</div>
                          <small className={styles.featureDesc}>{f.desc}</small>
                        </div>
                        <Info size={14} />
                      </div>
                    ))}

                    <button
                      className={styles.upgradeBtn}
                      disabled={disabled || loadingPlan === plan.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (disabled) return;
                        handleUpgrade({
                          id: plan.id,
                          name: plan.name,
                          price,
                          cycle: billingCycle,
                        });
                      }}
                    >
                      {loadingPlan === plan.id ? (
                        <>
                          <Loader2 className={styles.spin} /> Processing...
                        </>
                      ) : (
                        <>{buttonLabel}</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import {
  X,
  Crown,
  Info,
  Loader2,
  ChevronDown,
  ChevronUp,
  Banknote,
  CreditCard,
  Copy,
  Check,
  ArrowLeft,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import styles from "@/styles/UpgradeModal.module.css";
import { planConfig } from "@/config/planConfig";

export default function UpgradeModal({ currentPlan, setShowModal, onUpgrade }) {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [expandedCard, setExpandedCard] = useState("null");
  const [paystackReady, setPaystackReady] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [transferDetails, setTransferDetails] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const sheetRef = useRef(null);
  const dragZoneRef = useRef(null);

  // Drag variables
  const startY = useRef(0);
  const currentY = useRef(0);
  const dragging = useRef(false);

  // Plans
  const plans = useMemo(() => {
    return [
      {
        id: "standard",
        name: "Standard",
        monthly: planConfig.standard_monthly.price,
        yearly: planConfig.standard_yearly.price,
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
            desc: "Each link is capped per month",
          },
          {
            id: "f4",
            title: "Priority Support",
            desc: "Get fast support from TikLink",
          },
        ],
      },
      {
        id: "pro",
        name: "Pro",
        monthly: planConfig.pro_monthly.price,
        yearly: planConfig.pro_yearly.price,
        limit: "Create Unlimited Links",
        features: [
          { id: "f1", title: "Create unlimited Links", desc: "Monthly" },
          {
            id: "f2",
            title: "Templates",
            desc: "Unlimited stunning templates",
          },
          {
            id: "f3",
            title: "Unlimited click Limit",
            desc: "Unlimited clicks always",
          },
          { id: "f4", title: "Priority Support", desc: "Extra fast support" },
        ],
      },
    ];
  }, []);

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
  useEffect(() => {
    if (window.PaystackPop) {
      setPaystackReady(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://js.paystack.co/v1/inline.js"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => setPaystackReady(true));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => setPaystackReady(true);
    script.onerror = () => toast.error("Payment script failed to load");

    document.body.appendChild(script);
  }, []);
  const copyValue = async (label, value) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(String(value));
      setCopiedField(label);

      setTimeout(() => {
        setCopiedField(null);
      }, 1500);
    } catch {
      toast.error("Could not copy");
    }
  };

  const resetPaymentChoice = () => {
    setSelectedPlan(null);
    setTransferDetails(null);
    setCopiedField(null);
    setLoadingPlan(null);
  };

  const handleCardPayment = async ({ id, name, price, cycle }) => {
    try {
      setLoadingPlan(`${id}-card`);

      const token = localStorage.getItem("token");
      if (!token) return toast.error("Please login");

      // 🚀 call backend
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/initiate`,
        { plan: name, cycle }, // ← use the cycle parameter
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const { email, paymentId } = res.data;

      // Load Paystack script if missing
      if (!window.PaystackPop) {
        toast.error("Payment is still loading. Please try again in a second.");
        setLoadingPlan(null);
        return;
      }

      // 🚨 DO NOT add amount for subscription plans
      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_KEY,
        email,
        plan: planConfig[`${name}_${cycle}`].paystackPlan, // ⭐ add plan
        ref: paymentId,
        callback: (response) => verifyPayment(response.reference),
        onClose: () => setLoadingPlan(null),
      });

      handler.openIframe();
    } catch (error) {
      console.error(error);
      toast.error("Payment failed");
      setLoadingPlan(null);
    }
  };

  const handleTransferPayment = async ({ id, name, cycle }) => {
    try {
      setLoadingPlan(`${id}-transfer`);
      setTransferDetails(null);

      const token = localStorage.getItem("token");
      if (!token) return toast.error("Please login");

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/initiate-transfer`,
        { plan: name, cycle },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setTransferDetails(res.data);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Could not create transfer account");
    } finally {
      setLoadingPlan(null);
    }
  };

  const verifyPayment = async (reference) => {
    try {
      setLoadingPlan("verify-transfer");

      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/verify/${reference}`,
        { headers: { Authorization: `Bearer ${token}` } },
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
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Payment not confirmed yet. Please wait a moment and try again.",
      );
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
            if (plan.id === "pro" && currentPlan?.startsWith("pro")) {
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
                      disabled={
                        disabled ||
                        loadingPlan === `${plan.id}-card` ||
                        loadingPlan === `${plan.id}-transfer`
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        if (disabled) return;
                        setSelectedPlan({
                          id: plan.id,
                          name: plan.id, // <— send "standard" or "pro"
                          price,
                          cycle: billingCycle,
                        });
                        setTransferDetails(null);
                      }}
                    >
                      <>{buttonLabel}</>
                    </button>

                    {selectedPlan?.id === plan.id &&
                      selectedPlan?.cycle === billingCycle && (
                        <div
                          className={styles.paymentPanel}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className={styles.paymentPanelTop}>
                            <button
                              type="button"
                              className={styles.backChoice}
                              onClick={resetPaymentChoice}
                            >
                              <ArrowLeft size={14} />
                            </button>

                            <div>
                              <strong>Choose payment method</strong>
                              <span>
                                {currency(selectedPlan.price)} for{" "}
                                {plan.name} {billingCycle}
                              </span>
                            </div>
                          </div>

                          {!transferDetails && (
                            <div className={styles.paymentOptions}>
                              <button
                                type="button"
                                className={styles.transferBtn}
                                disabled={loadingPlan === `${plan.id}-transfer`}
                                onClick={() =>
                                  handleTransferPayment(selectedPlan)
                                }
                              >
                                {loadingPlan === `${plan.id}-transfer` ? (
                                  <Loader2 className={styles.spin} />
                                ) : (
                                  <Banknote size={17} />
                                )}
                                Pay with transfer
                              </button>

                              <button
                                type="button"
                                className={styles.cardBtn}
                                disabled={
                                  loadingPlan === `${plan.id}-card` ||
                                  !paystackReady
                                }
                                onClick={() => handleCardPayment(selectedPlan)}
                              >
                                {loadingPlan === `${plan.id}-card` ? (
                                  <Loader2 className={styles.spin} />
                                ) : (
                                  <CreditCard size={17} />
                                )}
                                {!paystackReady
                                  ? "Preparing card payment..."
                                  : "Pay with card"}
                              </button>
                            </div>
                          )}

                          {transferDetails && (
                            <div className={styles.transferBox}>
                              <div className={styles.transferNotice}>
                                Transfer exactly{" "}
                                <strong>{currency(transferDetails.amount)}</strong>{" "}
                                to the account below.
                              </div>

                              <div className={styles.accountRows}>
                                <div className={styles.accountRow}>
                                  <span>Bank</span>
                                  <strong>{transferDetails.bankName}</strong>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      copyValue("bank", transferDetails.bankName)
                                    }
                                  >
                                    {copiedField === "bank" ? (
                                      <Check size={14} />
                                    ) : (
                                      <Copy size={14} />
                                    )}
                                  </button>
                                </div>

                                <div className={styles.accountRow}>
                                  <span>Account number</span>
                                  <strong>
                                    {transferDetails.accountNumber}
                                  </strong>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      copyValue(
                                        "account",
                                        transferDetails.accountNumber,
                                      )
                                    }
                                  >
                                    {copiedField === "account" ? (
                                      <Check size={14} />
                                    ) : (
                                      <Copy size={14} />
                                    )}
                                  </button>
                                </div>

                                <div className={styles.accountRow}>
                                  <span>Account name</span>
                                  <strong>
                                    {transferDetails.accountName}
                                  </strong>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      copyValue(
                                        "name",
                                        transferDetails.accountName,
                                      )
                                    }
                                  >
                                    {copiedField === "name" ? (
                                      <Check size={14} />
                                    ) : (
                                      <Copy size={14} />
                                    )}
                                  </button>
                                </div>
                              </div>

                              {transferDetails.expiresAt && (
                                <p className={styles.expiresText}>
                                  This account expires at{" "}
                                  {new Date(
                                    transferDetails.expiresAt,
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                  .
                                </p>
                              )}

                              <button
                                type="button"
                                className={styles.paidBtn}
                                disabled={loadingPlan === "verify-transfer"}
                                onClick={() =>
                                  verifyPayment(transferDetails.reference)
                                }
                              >
                                {loadingPlan === "verify-transfer" ? (
                                  <>
                                    <Loader2 className={styles.spin} />
                                    Confirming payment...
                                  </>
                                ) : (
                                  "I have paid"
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
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

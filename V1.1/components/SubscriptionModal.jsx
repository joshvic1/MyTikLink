import { createContext, useContext, useMemo, useState } from "react";
import { BadgeCheck, Check, LoaderCircle } from "lucide-react";
import { subscriptionPlans } from "../config/plans";
import { v11Api } from "../lib/api";
import { Button, Modal } from "./UI";
import styles from "../styles/v11.module.css";

const SubscriptionContext = createContext(null);
export const useSubscription = () => useContext(SubscriptionContext);

const getType = (value) => String(value || "free").toLowerCase().includes("pro") ? "pro" : String(value || "").toLowerCase().includes("standard") ? "standard" : "free";
const getCycle = (value) => String(value || "").toLowerCase().includes("yearly") ? "yearly" : "monthly";

function SubscriptionModal({ state, user, refreshSession, close, update }) {
  const current = getType(user?.plan);
  const [selected, setSelected] = useState(state.preselected || (current === "free" ? "standard" : current));
  const [cycle, setCycle] = useState(getCycle(state.plan || user?.plan));
  const [status, setStatus] = useState({ loading: false, error: "" });
  const plan = subscriptionPlans.find((item) => item.id === selected);
  const samePlan = current === selected;
  const downgrade = current === "pro" && selected === "standard";
  const mode = state.mode || "upgrade";
  const title = mode === "renew" ? `Renew your ${plan?.name || "plan"}` : mode === "change" ? "Change your plan" : "Choose the plan that fits you";
  const cta = mode === "renew" && samePlan ? `Renew ${plan.name}` : downgrade ? "Switch to Standard" : current === "free" ? `Upgrade to ${plan.name}` : samePlan ? "Current plan" : `Upgrade to ${plan.name}`;
  const loadPaystack = async () => { if (window.PaystackPop) return; await new Promise((resolve, reject) => { const existing = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]'); if (existing) { existing.addEventListener("load", resolve, { once: true }); existing.addEventListener("error", reject, { once: true }); return; } const script = document.createElement("script"); script.src = "https://js.paystack.co/v1/inline.js"; script.onload = resolve; script.onerror = reject; document.body.appendChild(script); }); };
  const submit = async () => {
    if (mode === "change" && samePlan) return;
    setStatus({ loading: true, error: "" });
    try {
      const initiated = await v11Api.initiatePayment(selected, cycle, mode === "renew");
      await loadPaystack();
      const config = plan.cycles[cycle];
      const handler = window.PaystackPop.setup({ key: process.env.NEXT_PUBLIC_PAYSTACK_KEY, email: initiated.email, plan: config.paystackPlan, ref: initiated.paymentId, callback: async (response) => { try { const verified = await v11Api.verifyPayment(response.reference); if (!verified?.success) throw new Error("Payment verification failed."); if (verified.token) localStorage.setItem("token", verified.token); await refreshSession(); close(); } catch (error) { setStatus({ loading: false, error: error.message }); } }, onClose: () => setStatus({ loading: false, error: "" }) });
      handler.openIframe();
    } catch (error) { setStatus({ loading: false, error: error.message || "Unable to start payment." }); }
  };
  return <Modal wide title={title} description={mode === "change" ? `You’re currently on ${current === "free" ? "Free" : current === "pro" ? "Pro" : "Standard"}.` : mode === "renew" ? "Restore or extend your plan without changing your setup." : "Upgrade when you need more from MyTikLink."} onClose={close} footer={<><Button variant="secondary" onClick={close}>Cancel</Button><Button disabled={status.loading || (mode === "change" && samePlan)} onClick={submit}>{status.loading ? <><LoaderCircle className={styles.spinIcon}/> Preparing…</> : cta}</Button></>}><div className={styles.billingToggle} aria-label="Billing cycle">{["monthly", "yearly"].map((item) => <button key={item} className={cycle === item ? styles.billingActive : ""} onClick={() => setCycle(item)}>{item === "monthly" ? "Monthly" : "Yearly"}</button>)}</div><div className={styles.subscriptionPlans}>{subscriptionPlans.map((item) => { const selectedCard = selected === item.id; const isCurrent = current === item.id; const config = item.cycles[cycle]; return <button key={item.id} className={`${styles.subscriptionPlan} ${styles[`subscription_${item.tone}`]} ${selectedCard ? styles.subscriptionSelected : ""}`} onClick={() => setSelected(item.id)} aria-pressed={selectedCard}><header><span>{item.name.toUpperCase()} <BadgeCheck/></span>{isCurrent ? <small>Current plan</small> : item.recommendation && <small>{item.recommendation}</small>}</header><strong>₦{Number(config.price).toLocaleString()}<small>/{cycle === "monthly" ? "month" : "year"}</small></strong><p>{item.description}</p><ul>{item.benefits.map((benefit) => <li key={benefit}><Check/>{benefit}</li>)}</ul>{selectedCard && <span className={styles.selectionMark}><Check/></span>}</button>; })}</div>{downgrade && <aside className={styles.planConsequence}><b>Switching to Standard</b><p>You’ll move from unlimited smart links and clicks to the limits shown on the Standard plan.</p></aside>}{mode === "renew" && <button className={styles.chooseAnother} onClick={() => update({ ...state, mode: "change" })}>Choose another plan</button>}{status.error && <p className={styles.inlineError}>{status.error}</p>}</Modal>;
}

export function SubscriptionProvider({ user, refreshSession, children }) {
  const [state, setState] = useState(null);
  const value = useMemo(() => ({ openSubscription: (options = {}) => setState({ mode: "upgrade", ...options }), closeSubscription: () => setState(null) }), []);
  return <SubscriptionContext.Provider value={value}>{children}{state && <SubscriptionModal state={state} user={user} refreshSession={refreshSession} close={() => setState(null)} update={setState}/>}</SubscriptionContext.Provider>;
}

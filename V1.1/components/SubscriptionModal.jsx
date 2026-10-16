import { notify } from "./Notifications";
import { createContext, useContext, useMemo, useState } from "react";
import { LockKeyhole, ArrowRight, Check, ChevronDown, LoaderCircle } from "lucide-react";
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
  const mode = state.mode || "upgrade";
  const [selected, setSelected] = useState(state.preselected || (mode === "upgrade" ? "pro" : current === "free" ? "pro" : current));
  const [expanded, setExpanded] = useState(null);
  const [cycle, setCycle] = useState(getCycle(state.plan || user?.plan));
  const [status, setStatus] = useState({ loading: false, error: "" });
  const plan = subscriptionPlans.find((item) => item.id === selected);
  const savings = Math.max(0, Math.round((1 - plan.cycles.yearly.price / (plan.cycles.monthly.price * 12)) * 100));
  const samePlan = current === selected;
  const downgrade = current === "pro" && selected === "standard";
  const title = mode === "renew" ? `Renew your ${plan?.name || "plan"}` : mode === "change" ? "Change your plan" : "Upgrade your account";
  const cta = mode === "renew" && samePlan ? `Renew ${plan.name}` : downgrade ? "Switch to Standard" : current === "free" ? `Upgrade to ${plan.name}` : samePlan ? "Current plan" : `Upgrade to ${plan.name}`;
  const loadPaystack = async () => { if (window.PaystackPop) return; await new Promise((resolve, reject) => { const existing = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]'); if (existing) { existing.addEventListener("load", resolve, { once: true }); existing.addEventListener("error", reject, { once: true }); return; } const script = document.createElement("script"); script.src = "https://js.paystack.co/v1/inline.js"; script.onload = resolve; script.onerror = reject; document.body.appendChild(script); }); };
  const submit = async () => {
    if (mode === "change" && samePlan) return;
    setStatus({ loading: true, error: "" });
    try {
      const initiated = await v11Api.initiatePayment(selected, cycle, mode === "renew");
      await loadPaystack();
      const config = plan.cycles[cycle];
      const handler = window.PaystackPop.setup({ key: process.env.NEXT_PUBLIC_PAYSTACK_KEY, email: initiated.email, plan: config.paystackPlan, ref: initiated.paymentId, callback: async (response) => { try { const verified = await v11Api.verifyPayment(response.reference); if (!verified?.success) throw new Error("Payment verification failed."); if (verified.token) localStorage.setItem("token", verified.token); await refreshSession(); notify.success("Your plan is active"); close(); } catch (error) { setStatus({ loading: false, error: error.message }); notify.error(error.message); } }, onClose: () => setStatus({ loading: false, error: "" }) });
      handler.openIframe();
    } catch (error) { setStatus({ loading: false, error: error.message || "Unable to start payment." }); notify.error(error.message || "Unable to start payment."); }
  };
  return <Modal wide className={`${styles.upgradeSheet} ${expanded ? styles.upgradeExpanded : styles.upgradeCollapsed}`} title={title} description={mode === "change" ? `You’re currently on ${current === "free" ? "Free" : current === "pro" ? "Pro" : "Standard"}.` : mode === "renew" ? "Restore or extend your plan without changing your setup." : "Choose any of the plans below. Tap a plan to see everything included."} onClose={close} footer={<><Button variant="secondary" disabled={status.loading} onClick={close}>Not now</Button><Button disabled={status.loading || (mode === "change" && samePlan)} onClick={submit}>{status.loading ? <><LoaderCircle className={styles.spinIcon}/> Preparing…</> : <>{cta}<ArrowRight size={15}/></>}</Button></>}><div className={styles.upgradeBillingRow}><div className={styles.billingToggle} role="group" aria-label="Billing cycle">{["monthly", "yearly"].map((item) => <button key={item} type="button" aria-pressed={cycle === item} className={cycle === item ? styles.billingActive : ""} onClick={() => setCycle(item)}>{item === "monthly" ? "Monthly" : "Yearly"}{item === "yearly" && savings > 0 && <small>Save {savings}%</small>}</button>)}</div></div><div className={styles.subscriptionPlans}>{subscriptionPlans.map((item) => { const selectedCard = selected === item.id; const isCurrent = current === item.id; const isExpanded = expanded === item.id; const config = item.cycles[cycle]; return <article key={item.id} className={`${styles.subscriptionPlan} ${styles[`subscription_${item.tone}`]} ${selectedCard ? styles.subscriptionSelected : ""}`}><button className={styles.planSummaryButton} onClick={() => { setSelected(item.id); setExpanded(isExpanded ? null : item.id); }} type="button" aria-expanded={isExpanded} aria-controls={`plan-details-${item.id}`}><span className={styles.planSelectMark}>{selectedCard && <Check/>}</span><span className={styles.planIdentity}><span><b>{item.name}</b>{isCurrent && <small>Current</small>}{item.recommendation && <small className={styles.recommendedBadge}>{item.recommendation}</small>}</span><em>{item.description}</em></span><span className={styles.planPrice}>₦{Number(config.price).toLocaleString()}<small>{cycle === "monthly" ? "per month" : "per year"}</small></span><ChevronDown className={isExpanded ? styles.chevronOpen : ""}/></button>{isExpanded && <div id={`plan-details-${item.id}`} className={styles.planDetails}><p>Everything included</p><ul>{item.benefits.map((benefit) => <li key={benefit}><span><Check/></span>{benefit}</li>)}</ul></div>}</article>; })}</div><p className={styles.planSelectionHint}><LockKeyhole/> Checkout with Paystack</p>{downgrade && <aside className={styles.planConsequence}><b>Switching to Standard</b><p>You’ll move from unlimited redirect links and clicks to the Standard limits shown above.</p></aside>}{mode === "renew" && <button className={styles.chooseAnother} onClick={() => update({ ...state, mode: "change" })}>Choose another plan</button>}{status.error && <p className={styles.inlineError}>{status.error}</p>}</Modal>;
}

export function SubscriptionProvider({ user, refreshSession, children }) {
  const [state, setState] = useState(null);
  const value = useMemo(() => ({ openSubscription: (options = {}) => setState({ mode: "upgrade", ...options }), closeSubscription: () => setState(null) }), []);
  return <SubscriptionContext.Provider value={value}>{children}{state && <SubscriptionModal state={state} user={user} refreshSession={refreshSession} close={() => setState(null)} update={setState}/>}</SubscriptionContext.Provider>;
}

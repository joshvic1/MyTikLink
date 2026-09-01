import { AlertCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/router";
import { Button } from "./UI";
import styles from "../styles/v11.module.css";
import { useSubscription } from "./SubscriptionModal";

const DAY = 86400000;
export function SubscriptionAlert({ user, payments = [] }) {
  const router = useRouter();
  const { openSubscription } = useSubscription();
  const plan = String(user?.plan || "free").toLowerCase();
  const paidPayments = payments.filter((payment) => String(payment.status || "").toLowerCase() === "successful" && !String(payment.plan || "").toLowerCase().startsWith("free")).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const previous = paidPayments[0];
  const expiry = user?.planExpiry ? new Date(user.planExpiry) : previous?.expiresOn ? new Date(previous.expiresOn) : null;
  const validExpiry = expiry && !Number.isNaN(expiry.getTime());
  const days = validExpiry ? Math.ceil((expiry.getTime() - Date.now()) / DAY) : null;
  const expiredPaid = plan.startsWith("free") && Boolean(previous);
  const expiring = !plan.startsWith("free") && days !== null && days >= 0 && days <= 7;
  if (!expiredPaid && !expiring) return null;
  const label = expiring ? days === 0 ? "Your plan expires today" : days === 1 ? "Your plan expires tomorrow" : `Your plan expires in ${days} days` : "Your plan has expired";
  const previousName = String(previous?.plan || "").toLowerCase().includes("pro") ? "Pro" : "Standard";
  const detail = validExpiry ? `${expiredPaid ? `Your ${previousName} plan expired` : "Expires"}: ${expiry.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}` : expiredPaid ? `Your previous ${previousName} subscription is no longer active.` : "Renew now to avoid interruption.";
  return <aside className={`${styles.expiryCard} ${expiredPaid ? styles.expiredCard : ""}`}><div><span>{expiredPaid ? <AlertCircle/> : <RefreshCw/>}</span><div><b>{label}</b><p>{detail}</p></div></div><div><Button variant="secondary" onClick={() => openSubscription({ mode: "change", preselected: previousName.toLowerCase() })}>Change Plan</Button><Button onClick={() => openSubscription({ mode: "renew", preselected: previousName.toLowerCase(), plan: previous?.plan || user?.plan })}>Renew {expiredPaid ? previousName : "Plan"}</Button></div></aside>;
}

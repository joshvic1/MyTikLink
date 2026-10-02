import { AlertTriangle, Clock3, Info } from "lucide-react";
import styles from "../styles/v11.module.css";
import { useSubscription } from "./SubscriptionModal";

const DAY = 86400000;
export function SubscriptionAlert({ user, payments = [] }) {
  const { openSubscription } = useSubscription();
  const plan = String(user?.plan || "free").toLowerCase();
  const paidPayments = payments.filter((payment) => String(payment.status || "").toLowerCase() === "successful" && !String(payment.plan || "").toLowerCase().startsWith("free")).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const previous = paidPayments[0];
  const expiry = user?.planExpiry ? new Date(user.planExpiry) : previous?.expiresOn ? new Date(previous.expiresOn) : null;
  const validExpiry = expiry && !Number.isNaN(expiry.getTime());
  const days = validExpiry ? Math.ceil((expiry.getTime() - Date.now()) / DAY) : null;
  const isFree = plan.startsWith("free");
  const expiredPaid = (isFree && Boolean(previous)) || (!isFree && days !== null && days < 0);
  const expiring = !isFree && days !== null && days >= 0 && days <= 7;
  const freeOnly = isFree && !previous;
  if (!expiredPaid && !expiring && !freeOnly) return null;
  const label = freeOnly ? "You’re on the Free plan" : expiring ? days === 0 ? "Your plan expires today" : days === 1 ? "Your plan expires tomorrow" : `Your plan expires in ${days} days` : "Your plan has expired";
  const previousName = String(previous?.plan || "").toLowerCase().includes("pro") ? "Pro" : "Standard";
  const activeName = plan.includes("pro") ? "Pro" : plan.includes("standard") ? "Standard" : previousName;
  const detail = freeOnly ? "Upgrade when you need more pages, links, clicks, and business tools." : validExpiry ? `${activeName} plan · ${expiredPaid ? "Expired" : "Expires"} ${expiry.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}` : `Your previous ${previousName} subscription is no longer active.`;
  const tone = expiredPaid ? "danger" : expiring ? "warning" : "info";
  const Icon = expiredPaid ? AlertTriangle : expiring ? Clock3 : Info;
  const act = () => freeOnly ? openSubscription({ mode: "upgrade" }) : openSubscription({ mode: "renew", preselected: activeName.toLowerCase(), plan: previous?.plan || user?.plan });
  return <aside className={`${styles.planNotice} ${styles[`planNotice_${tone}`]}`}><span className={styles.planNoticeIcon}><Icon/></span><div><b>{label}</b><p>{detail}</p></div><button onClick={act}>{freeOnly ? "Upgrade" : "Renew"}</button></aside>;
}

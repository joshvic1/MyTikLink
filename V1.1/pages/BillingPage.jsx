import { useEffect, useState } from "react";
import { CalendarDays, CreditCard } from "lucide-react";
import { Badge, Button, EmptyState, PageHeader } from "../components/UI";
import { PlanBadge } from "../components/PlanBadge";
import { useSubscription } from "../components/SubscriptionModal";
import { v11Api } from "../lib/api";
import styles from "../styles/v11.module.css";

export function BillingPage({ user }) {
  const [payments, setPayments] = useState([]), [error, setError] = useState("");
  const { openSubscription } = useSubscription();
  const plan = String(user?.plan || "free").toLowerCase();
  const isFree = plan.startsWith("free");
  useEffect(() => { v11Api.paymentHistory().then((data) => setPayments(Array.isArray(data) ? data : data?.payments || [])).catch((e) => setError(e.message)); }, []);
  return <div className={styles.page}><PageHeader eyebrow="SETTINGS / BILLING" title="Billing and plan" description="Manage your subscription and review completed payments."/><section className={styles.billingOverview}><div><span className={styles.settingsIcon}><CreditCard/></span><div><PlanBadge plan={plan}/><h2>{isFree ? "Free plan" : `${plan.includes("pro") ? "Pro" : "Standard"} plan`}</h2><p>{user.planExpiry ? `Renews or expires ${new Date(user.planExpiry).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}` : isFree ? "Upgrade whenever you need higher limits." : "No renewal date is available."}</p></div></div><div>{isFree ? <Button onClick={() => openSubscription({ mode: "upgrade" })}>Upgrade Plan</Button> : <><Button variant="secondary" onClick={() => openSubscription({ mode: "change" })}>Change Plan</Button><Button onClick={() => openSubscription({ mode: "renew", preselected: plan.includes("pro") ? "pro" : "standard", plan })}>Renew Plan</Button></>}</div></section><section className={styles.section}><div className={styles.sectionTitle}><div><span className={styles.eyebrow}>PAYMENTS</span><h2>Payment history</h2></div></div>{error ? <p className={styles.inlineError}>{error}</p> : payments.length ? <div className={styles.tableWrap}><table><thead><tr><th>Date</th><th>Plan</th><th>Amount</th><th>Status</th><th>Reference</th></tr></thead><tbody>{payments.map((payment) => <tr key={payment._id}><td>{new Date(payment.createdAt).toLocaleDateString()}</td><td>{payment.plan}</td><td>₦{Number(payment.amount || 0).toLocaleString()}</td><td><Badge tone={payment.status === "successful" ? "success" : payment.status === "failed" ? "warning" : "neutral"}>{payment.status}</Badge></td><td>{payment.paymentId}</td></tr>)}</tbody></table></div> : <EmptyState icon={<CalendarDays/>} title="No payments yet" description="Completed plan payments will appear here."/>}</section></div>;
}

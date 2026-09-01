import { useState } from "react";
import { useRouter } from "next/router";
import { AtSign, Phone, UserRound } from "lucide-react";
import { Button, Field, PageHeader } from "../components/UI";
import { PlanBadge } from "../components/PlanBadge";
import { v11Api } from "../lib/api";
import { v11Routes } from "../config/routes";
import styles from "../styles/v11.module.css";

export function AccountPage({ user, refreshSession }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: user.name || "", phone: user.whatsappNumber || user.phone || "" });
  const [status, setStatus] = useState("");
  const save = async () => { if (!form.name.trim()) return; setStatus("Saving…"); try { const jobs = [v11Api.updateName(form.name.trim())]; if (form.phone.trim() && form.phone !== (user.whatsappNumber || user.phone || "")) jobs.push(v11Api.updatePhone(form.phone)); await Promise.all(jobs); await refreshSession(); setStatus("Account details saved"); } catch (e) { setStatus(e.message); } };
  return <div className={styles.page}><PageHeader eyebrow="SETTINGS" title="Settings" description="Manage your account, workspace and subscription."/><div className={styles.accountLayout}><nav><button className={styles.localActive}>Account</button><button onClick={() => router.push(v11Routes.tracking)}>Tracking</button><button onClick={() => router.push(v11Routes.billing)}>Billing</button><button onClick={() => router.push("/v1-1/settings/security")}>Security</button></nav><section className={styles.settingsCard}><header className={styles.settingsSectionHeader}><span><UserRound/></span><div><h2>Account</h2><p>Your identity and customer contact details.</p></div><PlanBadge plan={user.plan}/></header><div className={styles.settingsFields}><Field label="Full name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}/></Field><Field label="Email address" hint="Email changes require verification in Security."><div className={styles.inputWithIcon}><AtSign/><input value={user.email || ""} readOnly/></div></Field><Field label="Phone / WhatsApp number" hint="Used for customer contact and onboarding completion."><div className={styles.inputWithIcon}><Phone/><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+234 803 000 0000"/></div></Field></div><div className={styles.settingsActions}><Button onClick={save}>Save changes</Button>{status && <span>{status}</span>}</div></section></div></div>;
}

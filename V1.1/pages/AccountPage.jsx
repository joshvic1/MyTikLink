import { notify } from "../components/Notifications";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { AtSign, Building2, Phone, UserRound } from "lucide-react";
import { Button, Field, PageHeader } from "../components/UI";
import { PlanBadge } from "../components/PlanBadge";
import { v11Api } from "../lib/api";
import { v11Routes } from "../config/routes";
import styles from "../styles/v11.module.css";

const compactPhone = (value) => String(value || "").replace(/[\s()-]/g, "");
const workspaceType = (value) => value === "business" ? "Business / organization" : value === "creator" ? "Creator" : "Not selected";

export function AccountPage({ user, refreshSession }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: user.name || "",
    phone: user.whatsappNumber || user.phone || "",
  });
  const [workspace, setWorkspace] = useState(null);
  const [workspaceDraft, setWorkspaceDraft] = useState({ publicName: "", description: "" });
  const [workspaceLoading, setWorkspaceLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    v11Api.onboarding()
      .then((result) => {
        if (!active) return;
        const data = result?.data || null;
        setWorkspace(data);
        setWorkspaceDraft({
          publicName: data?.publicName || "",
          description: data?.brand?.description || "",
        });
        if (data?.whatsappNumber) setForm((current) => current.phone ? current : ({ ...current, phone: data.whatsappNumber }));
      })
      .catch(() => active && setWorkspace(null))
      .finally(() => active && setWorkspaceLoading(false));
    return () => { active = false; };
  }, []);

  const save = async () => {
    const name = form.name.trim();
    const phone = compactPhone(form.phone);
    const savedPhone = compactPhone(workspace?.whatsappNumber || user.whatsappNumber || user.phone);
    const publicName = workspaceDraft.publicName.trim();
    const savedPublicName = String(workspace?.publicName || "").trim();
    const savedDescription = workspace?.brand?.description || "";

    if (!name) {
      notify.warning("Enter your full name first.");
      return;
    }
    if (workspace && !phone) {
      notify.warning("Enter your WhatsApp number with its country code.");
      return;
    }
    if (workspace && publicName !== savedPublicName && publicName.length < 2) {
      notify.warning("Enter a brand or business name with at least 2 characters.");
      return;
    }
    if (workspace && publicName !== savedPublicName && (!workspace.accountType || !workspace.category?.id)) {
      notify.warning("Complete your workspace type and category before changing the brand name.");
      return;
    }

    setSaving(true);
    setStatus("Saving changes…");
    try {
      if (name !== String(user.name || "").trim()) await v11Api.updateName(name);
      if (workspace && phone !== savedPhone) await v11Api.saveOnboardingStage("whatsapp", { whatsappNumber: phone });
      if (workspace && publicName !== savedPublicName) {
        await v11Api.saveOnboardingStage("identity", {
          accountType: workspace.accountType,
          publicName,
          categoryId: workspace.category.id,
          customCategory: workspace.category.customLabel || "",
        });
      }
      if (workspace && workspaceDraft.description !== savedDescription) {
        await v11Api.saveOnboardingStage("brand", {
          imageUrl: workspace.brand?.imageUrl || "",
          description: workspaceDraft.description,
          preferredColor: workspace.brand?.preferredColor || "",
        });
      }

      const refreshed = await v11Api.onboarding().catch(() => null);
      if (refreshed?.data) {
        setWorkspace(refreshed.data);
        setWorkspaceDraft({
          publicName: refreshed.data.publicName || "",
          description: refreshed.data.brand?.description || "",
        });
        setForm((current) => ({ ...current, phone: refreshed.data.whatsappNumber || current.phone }));
      }
      await refreshSession();
      setStatus("Changes saved");
      notify.success("Account and workspace details saved");
    } catch (error) {
      const message = error?.message || "We could not save your changes yet.";
      setStatus(message);
      notify.error(message);
    } finally {
      setSaving(false);
    }
  };

  return <div className={styles.page}>
    <PageHeader eyebrow="SETTINGS" title="Settings" description="Manage your account, workspace and subscription."/>
    <div className={styles.accountLayout}>
      <nav>
        <button className={styles.localActive}>Account</button>
        <button onClick={() => router.push(v11Routes.tracking)}>Tracking</button>
        <button onClick={() => router.push(v11Routes.billing)}>Billing</button>
        <button onClick={() => router.push("/v1-1/settings/security")}>Security</button>
      </nav>
      <section className={styles.settingsCard}>
        <header className={styles.settingsSectionHeader}>
          <span><UserRound/></span>
          <div><h2>Account</h2><p>Your identity, contact details and workspace profile.</p></div>
          <PlanBadge plan={user.plan}/>
        </header>
        <div className={styles.settingsFields}>
          <Field label="Full name"><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })}/></Field>
          <Field label="Email address" hint="Email changes require verification in Security."><div className={styles.inputWithIcon}><AtSign/><input value={user.email || ""} readOnly/></div></Field>
          <Field label="Phone / WhatsApp number" hint="Use international format, for example +234 803 000 0000."><div className={styles.inputWithIcon}><Phone/><input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+234 803 000 0000" inputMode="tel"/></div></Field>
          {workspaceLoading && <Field label="Workspace details"><input value="Loading workspace details…" readOnly/></Field>}
          {!workspaceLoading && workspace && <>
            <Field label="Brand / business name" hint="This is the name people see on your pages and store."><input value={workspaceDraft.publicName} onChange={(event) => setWorkspaceDraft({ ...workspaceDraft, publicName: event.target.value })} placeholder="Enter your brand or business name"/></Field>
            <Field label="Workspace type"><div className={styles.inputWithIcon}><Building2/><input value={workspaceType(workspace.accountType)} readOnly/></div></Field>
            <Field label="Category" hint="Your current workspace category."><input value={workspace.category?.customLabel || workspace.category?.label || "Not selected"} readOnly/></Field>
            <Field label="Brand description" hint="A short description people can see on your public workspace."><textarea value={workspaceDraft.description} onChange={(event) => setWorkspaceDraft({ ...workspaceDraft, description: event.target.value })} maxLength="400" placeholder="Describe what your brand does"/></Field>
          </>}
        </div>
        <div className={styles.settingsActions}>
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
          {status && <span role="status">{status}</span>}
        </div>
      </section>
    </div>
  </div>;
}

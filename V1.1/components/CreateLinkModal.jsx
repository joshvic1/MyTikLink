import { useEffect, useMemo, useState } from "react";
import { Button, Field, Modal } from "./UI";
import { v11Api } from "../lib/api";
import styles from "../styles/v11.module.css";
import { Sparkles } from "lucide-react";

function parseWhatsApp(value, preferredType) {
  let type = preferredType || "dm";
  let code = String(value || "").trim();
  const base = code.split("?")[0];
  if (base.includes("whatsapp.com/channel/")) { code = base.split("whatsapp.com/channel/")[1]?.replace(/^\/+|\/+$/g, "") || ""; type = "channel"; }
  else if (base.includes("chat.whatsapp.com")) { code = base.split("/").pop(); type = "group"; }
  else if (base.includes("wa.me/")) { code = base.split("/").pop(); type = "dm"; }
  else if (code.includes("send?phone=")) { code = code.match(/phone=(\d+)/)?.[1] || ""; type = "dm"; }
  else if (/^\+?\d+$/.test(code)) { code = code.replace(/\D/g, ""); type = "dm"; }
  else code = code.replace(/^\/+|\/+$/g, "");
  return { code, type };
}

export function CreateLinkModal({ link, onClose, onSaved }) {
  const editing = Boolean(link);
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState({ title: link?.title || "", linkType: link?.linkType || "dm", whatsappCode: link?.whatsappCode || "", prefill: link?.prefill || "", templateId: link?.templateId?._id || link?.templateId || "" });
  const [state, setState] = useState({ loading: true, saving: false, error: "" });
  useEffect(() => { v11Api.linkTemplates().then((data) => setTemplates(Array.isArray(data) ? data : [])).catch((error) => setState((s) => ({ ...s, error: error.message }))).finally(() => setState((s) => ({ ...s, loading: false }))); }, []);
  const parsed = useMemo(() => parseWhatsApp(form.whatsappCode, form.linkType), [form.whatsappCode, form.linkType]);
  const submit = async () => {
    if (!form.title.trim() || !parsed.code || !form.templateId) { setState((s) => ({ ...s, error: "Add a link name, valid WhatsApp destination, and transition design." })); return; }
    setState((s) => ({ ...s, saving: true, error: "" }));
    try {
      const payload = { title: form.title.trim(), linkType: parsed.type, whatsappCode: parsed.code, templateId: form.templateId, ...(parsed.type === "dm" && form.prefill.trim() ? { prefill: form.prefill.trim() } : {}) };
      if (editing) await v11Api.updateLink(link._id, payload); else await v11Api.createLink(payload);
      await onSaved(); onClose();
    } catch (error) { setState((s) => ({ ...s, saving: false, error: error.message })); }
  };
  return <Modal title={editing ? "Edit smart link" : "Create a smart link"} description="Send people to a WhatsApp chat, group, or channel with a trackable link." onClose={onClose} wide footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button disabled={state.saving} onClick={submit}>{state.saving ? "Saving…" : editing ? "Save changes" : "Create smart link"}</Button></>}>
    <div className={styles.formGrid}><Field label="Link name"><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. WhatsApp orders"/></Field><Field label="Destination type"><select value={form.linkType} onChange={(e) => setForm({ ...form, linkType: e.target.value })}><option value="dm">Direct chat</option><option value="group">WhatsApp group</option><option value="channel">WhatsApp channel</option></select></Field><Field label={form.linkType === "dm" ? "WhatsApp number" : "WhatsApp invite link"} hint="You can paste a complete WhatsApp URL."><input value={form.whatsappCode} onChange={(e) => setForm({ ...form, whatsappCode: e.target.value })} placeholder={form.linkType === "dm" ? "+234 803 000 0000" : "Paste your WhatsApp link"}/></Field>{form.linkType === "dm" && <Field label="Ready message" hint="Optional"><textarea value={form.prefill} onChange={(e) => setForm({ ...form, prefill: e.target.value })} placeholder="Hello, I would like to know more…"/></Field>}</div>
    <div className={styles.templateSection}><span className={styles.fieldLabel}>Transition design</span>{state.loading ? <p>Loading designs…</p> : <div className={styles.templateGrid}>{templates.map((template) => <button key={template._id} className={form.templateId === template._id ? styles.templateSelected : ""} onClick={() => setForm({ ...form, templateId: template._id })}>{template.thumbnailUrl ? <img src={template.thumbnailUrl} alt=""/> : <span><Sparkles/></span>}<b>{template.name}</b></button>)}</div>}</div>
    {state.error && <p className={styles.inlineError}>{state.error}</p>}
  </Modal>;
}

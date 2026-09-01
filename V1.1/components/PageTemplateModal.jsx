import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button, Modal } from "./UI";
import { v11Api } from "../lib/api";
import styles from "../styles/v11.module.css";
import { Plus, Sparkles } from "lucide-react";

export function PageTemplateModal({ onClose }) {
  const router = useRouter();
  const [templates, setTemplates] = useState([]), [selected, setSelected] = useState(""), [error, setError] = useState("");
  useEffect(() => { v11Api.pageTemplates().then((data) => setTemplates(Array.isArray(data) ? data : [])).catch((e) => setError(e.message)); }, []);
  return <Modal wide title="Choose a starting point" description="Pick a design for your offer or campaign. You can change its content, colors, and visitor action next." onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button disabled={!selected} onClick={() => router.push(`/v1-1/pages/editor?templateId=${selected}`)}>Use this template</Button></>}>
    <div className={styles.pageTemplateGrid}><button className={styles.blankTemplate} onClick={() => router.push("/v1-1/pages/builder")}><span><Plus/></span><b>Design from scratch</b><small>Build a custom layout</small></button>{templates.map((template) => <button key={template._id} className={selected === template._id ? styles.templateSelected : ""} onClick={() => setSelected(template._id)}>{template.thumbnailUrl ? <img src={template.thumbnailUrl} alt=""/> : <span><Sparkles/></span>}<b>{template.name}</b><small>Preview and customize</small></button>)}</div>{error && <p className={styles.inlineError}>{error}</p>}
  </Modal>;
}

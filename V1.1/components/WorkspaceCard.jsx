import { Check, Copy, ExternalLink, Trash2 } from "lucide-react";
import { Badge, Button, IconButton } from "./UI";
import styles from "../styles/v11.module.css";

export function WorkspaceCard({ thumbnail, fallback, eyebrow, title, status = "Active", statusTone = "success", url, href, copied = false, onCopy, onLeads, metrics = [], primaryLabel = "Open", onPrimary, onDelete }) {
  return <article className={styles.workspaceCard}>
    <div className={styles.workspaceCardTop}>
      <span className={`${styles.workspaceThumb} ${!thumbnail ? styles.workspaceThumbFallback : ""}`}>{thumbnail ? <img src={thumbnail} alt=""/> : <b>{fallback}</b>}</span>
      <div className={styles.workspaceCardIdentity}>{eyebrow && <small>{eyebrow}</small>}<h3>{title || "Untitled"}</h3>{url && <div className={styles.workspaceUrlInline}><a href={href} target="_blank" rel="noreferrer">{url}<ExternalLink/></a></div>}</div>
      <Badge tone={statusTone}>{status}</Badge>
    </div>
    <div className={styles.workspaceCardFooter}>
      <div className={styles.workspaceMetricsInline}>{metrics.map(({ label, value, onClick, title: metricTitle }) => onClick ? <button key={label} type="button" onClick={onClick} title={metricTitle}><b>{value}</b><small>{label}</small></button> : <span key={label} title={metricTitle}><b>{value}</b><small>{label}</small></span>)}</div>
      <div className={styles.workspaceCardActions}>{onCopy && <Button variant="ghost" className={styles.cardTextAction} onClick={onCopy}>{copied ? <Check/> : <Copy/>}{copied ? "Copied" : "Copy link"}</Button>}{onLeads && <Button variant="ghost" className={styles.cardTextAction} onClick={onLeads}>View leads</Button>}<Button variant="secondary" onClick={onPrimary}>{primaryLabel}</Button>{onDelete && <IconButton className={styles.deleteIconButton} label={`Delete ${title}`} onClick={onDelete}><Trash2/></IconButton>}</div>
    </div>
  </article>;
}

import { ArrowRight, X } from "lucide-react";
import { Button } from "./UI";
import styles from "../styles/v11.module.css";

export function UpNext({ action, onAction, onDismiss }) {
  return <section className={`${styles.upNextCard} ${styles[`upNext_${action.tone}`]}`} aria-labelledby="up-next-title">
    <div className={styles.upNextVisual} aria-hidden="true"><img src={action.image} width="640" height="427" alt="" decoding="async"/></div>
    <div className={styles.upNextContent}><button className={styles.upNextDismiss} type="button" aria-label="Dismiss this suggestion" onPointerDown={(event) => { event.stopPropagation(); onDismiss(); }} onClick={onDismiss}><X/></button><span className={styles.eyebrow}>UP NEXT</span><h2 id="up-next-title">{action.title}</h2><p>{action.description}</p><Button onClick={onAction}>{action.ctaLabel || action.action}<ArrowRight/></Button></div>
  </section>;
}

import { PageHeader } from "../components/UI";
import { Notice } from "../components/Notifications";
import styles from "../styles/v11.module.css";
export function InProgressPage({ title }) {
  return <div className={styles.page}><PageHeader eyebrow="WORKSPACE" title={title} description={title === "Affiliate" ? "Your affiliate workspace." : "Connect your favourite tools."}/><Notice tone="warning"><b>This feature is in progress</b><p>We’re working on {title.toLowerCase()}. Check back here for updates.</p></Notice></div>;
}

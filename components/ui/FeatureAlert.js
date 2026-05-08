import styles from "./featureAlert.module.css";

import { Sparkles } from "lucide-react";

export default function FeatureAlert({ title, text, badge = "NEW" }) {
  return (
    <div className={styles.alert}>
      {/* GLOW */}
      <div className={styles.glow} />

      {/* TOP */}
      <div className={styles.top}>
        <div className={styles.iconWrap}>
          <Sparkles size={18} />
        </div>

        <span className={styles.badge}>{badge}</span>
      </div>

      {/* CONTENT */}
      <div className={styles.content}>
        <h3>{title}</h3>

        <p>{text}</p>
      </div>
    </div>
  );
}

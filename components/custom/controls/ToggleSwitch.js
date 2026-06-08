// controls/ToggleSwitch.js
import styles from "./toggle.module.css";

export default function ToggleSwitch({ value, onChange }) {
  return (
    <div
      className={`${styles.toggle} ${value ? styles.active : ""}`}
      onClick={() => onChange(!value)}
    >
      <div className={styles.knob} />
    </div>
  );
}

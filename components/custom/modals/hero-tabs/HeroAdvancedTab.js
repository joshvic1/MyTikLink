import styles from "../editHero.module.css";

import ToggleSwitch from "../../controls/ToggleSwitch";

export default function HeroAdvancedTab({ element, update }) {
  return (
    <>
      <div className={styles.group}>
        <div className={styles.switchRow}>
          <span className={styles.groupTitle}>Shadow</span>

          <ToggleSwitch
            value={element.shadow}
            onChange={(v) =>
              update({
                shadow: v,
              })
            }
          />
        </div>
      </div>
    </>
  );
}

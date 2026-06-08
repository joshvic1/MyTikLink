import ToggleSwitch from "../../controls/ToggleSwitch";

import styles from "../editMenu.module.css";

export default function MenuAdvancedTab({ element, update }) {
  return (
    <div className={styles.stack}>
      <div className={styles.group}>
        <div className={styles.row}>
          <span>Sticky Menu</span>

          <ToggleSwitch
            value={element.sticky}
            onChange={(v) =>
              update({
                sticky: v,
              })
            }
          />
        </div>

        <div className={styles.row}>
          <span>Hide on Scroll</span>

          <ToggleSwitch
            value={element.hideOnScroll}
            onChange={(v) =>
              update({
                hideOnScroll: v,
              })
            }
          />
        </div>

        <div className={styles.row}>
          <span>Close On Click</span>

          <ToggleSwitch
            value={element.closeOnClick}
            onChange={(v) =>
              update({
                closeOnClick: v,
              })
            }
          />
        </div>
      </div>
    </div>
  );
}

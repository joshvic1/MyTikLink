import { Menu, Bell, ChevronDown } from "lucide-react";

import styles from "../styles/store/storeNavbar.module.css";

export default function StoreNavbar({ onMenu }) {
  return (
    <header className={styles.navbar}>
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={onMenu}>
          <Menu size={22} />
        </button>

        <div className={styles.logo}>FlexiStore</div>
      </div>

      <div className={styles.right}>
        <button className={styles.iconBtn}>
          <Bell size={20} />
        </button>

        <div className={styles.profile}>
          <img src="https://i.pravatar.cc/100" alt="" />

          <ChevronDown size={16} />
        </div>
      </div>
    </header>
  );
}

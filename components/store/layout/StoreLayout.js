import StoreNavbar from "../navigation/StoreNavbar";
import StoreMobileNav from "../navigation/StoreMobileNav";
import StoreMenuDrawer from "../navigation/StoreMenuDrawer";

import { useState } from "react";

import styles from "../styles/store/storeLayout.module.css";

export default function StoreLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={styles.wrapper}>
      <StoreNavbar onMenu={() => setMenuOpen(true)} />

      <StoreMenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      <main className={styles.content}>{children}</main>

      <StoreMobileNav />
    </div>
  );
}

import { Home, ShoppingBag, Users, MoreHorizontal } from "lucide-react";

import styles from "../styles/store/storeMobileNav.module.css";

export default function StoreMobileNav() {
  return (
    <nav className={styles.nav}>
      <a href="/store">
        <Home size={20} />
        <span>Home</span>
      </a>

      <a href="/store/orders">
        <ShoppingBag size={20} />
        <span>Orders</span>
      </a>

      <a href="/store/storefront" className={styles.active}>
        <ShoppingBag size={20} />
        <span>Store</span>
      </a>

      <a href="/store/customers">
        <Users size={20} />
        <span>Customers</span>
      </a>

      <a href="#">
        <MoreHorizontal size={20} />
        <span>More</span>
      </a>
    </nav>
  );
}

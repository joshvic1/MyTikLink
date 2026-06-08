import { Settings, CreditCard, Truck, Store, ChevronRight } from "lucide-react";

import styles from "../styles/dashboardSettings.module.css";

export default function DashboardSettings() {
  const items = [
    {
      title: "Store Settings",
      desc: "Manage your store information.",
      icon: Settings,
    },

    {
      title: "Payment Methods",
      desc: "Manage bank and payment settings.",
      icon: CreditCard,
    },

    {
      title: "Delivery Settings",
      desc: "Setup delivery and shipping.",
      icon: Truck,
    },

    {
      title: "Store Front",
      desc: "Customize storefront appearance.",
      icon: Store,
    },
  ];

  return (
    <div className={styles.grid}>
      {items.map((item, index) => {
        const Icon = item.icon;

        return (
          <button key={index} className={styles.card}>
            <div className={styles.left}>
              <div className={styles.icon}>
                <Icon size={22} />
              </div>

              <div>
                <h3>{item.title}</h3>

                <p>{item.desc}</p>
              </div>
            </div>

            <ChevronRight size={18} />
          </button>
        );
      })}
    </div>
  );
}

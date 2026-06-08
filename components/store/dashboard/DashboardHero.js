"use client";

import { Sparkles, ArrowUpRight } from "lucide-react";

import styles from "../styles/dashboardHero.module.css";

export default function DashboardHero({ store, user, range, setRange }) {
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <section className={styles.hero}>
      <div className={styles.row}>
        <div className={styles.texts}>
          <h1>
            Hi, {firstName} <Sparkles size={18} className={styles.sparkle} />
          </h1>

          <p>Track orders, sales, and customer activity in one place.</p>
        </div>
        <div className={styles.right}>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className={styles.filter}
          >
            <option value="today">Today</option>

            <option value="yesterday">Yesterday</option>

            <option value="7d">Last 7 Days</option>

            <option value="30d">Last 30 Days</option>

            <option value="all">All Time</option>
          </select>
        </div>
      </div>
    </section>
  );
}

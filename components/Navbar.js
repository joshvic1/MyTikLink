"use client";
import { useState, useEffect } from "react";
import styles from "@/styles/Navbar.module.css";

export default function Navbar({ userPlan, userName }) {
  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <h1 className={styles.welcome}>Welcome, {userName || "User"}! 👋</h1>
      </div>

      <div className={styles.right}>
        {userPlan && (
          <span className={`${styles.planBadge} ${styles[userPlan]}`}>
            {userPlan.charAt(0).toUpperCase() + userPlan.slice(1)}
          </span>
        )}
        <button
          className={styles.logoutBtn}
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("name");
            localStorage.removeItem("plan");
            window.location.href = "/login";
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

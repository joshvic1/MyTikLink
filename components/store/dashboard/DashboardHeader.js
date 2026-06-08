"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
  Menu,
  Bell,
  ChevronDown,
  User,
  Settings,
  LayoutDashboard,
  LogOut,
  Plus,
  Store,
} from "lucide-react";

import styles from "../styles/dashboardHeader.module.css";

export default function DashboardHeader({
  store,
  stores = [],
  user,
  onMenu,
  onSwitchStore,
  onCreateStore,
}) {
  const router = useRouter();
  const [storeOpen, setStoreOpen] = useState(false);

  const [profileOpen, setProfileOpen] = useState(false);

  const storeRef = useRef(null);

  const profileRef = useRef(null);

  // CLOSE ON OUTSIDE CLICK
  useEffect(() => {
    const handleClick = (e) => {
      if (storeRef.current && !storeRef.current.contains(e.target)) {
        setStoreOpen(false);
      }

      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);

    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const firstLetter = user?.name?.charAt(0)?.toUpperCase() || "U";

  const handleLogout = () => {
    localStorage.removeItem("token");

    window.location.href = "/?auth=login";
  };

  return (
    <header className={styles.header}>
      {/* LEFT */}
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={onMenu}>
          <Menu size={20} />
        </button>

        {/* STORE SWITCHER */}
        <div className={styles.storeSwitcher} ref={storeRef}>
          <button
            className={styles.storeInfo}
            onClick={() => setStoreOpen((prev) => !prev)}
          >
            <div className={styles.logoWrap}>
              <div className={styles.logoInner} />
            </div>

            <div>
              <h2>{store?.name || "My Store"}</h2>
            </div>

            <ChevronDown size={16} />
          </button>

          {storeOpen && (
            <div className={styles.dropdown}>
              {/* CURRENT STORE */}
              <div className={styles.currentStore}>
                <div className={styles.storeMiniLogo} />

                <div className={styles.storeTexts}>
                  <span className={styles.storeLabel}>Current Store</span>

                  <h4>{store?.name}</h4>
                </div>
              </div>

              {/* DIVIDER */}
              <div className={styles.dropdownDivider} />

              {/* CREATE STORE */}
              <button className={styles.simpleCreate} disabled>
                + Create New Store
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div className={styles.right}>
        {/* NOTIFICATION */}
        <button className={styles.iconBtn}>
          <Bell size={18} />
          <span className={styles.dot}></span>
        </button>

        {/* PROFILE */}
        <div className={styles.profileWrap} ref={profileRef}>
          <button
            className={styles.avatarBtn}
            onClick={() => setProfileOpen((prev) => !prev)}
          >
            {firstLetter}
          </button>

          {profileOpen && (
            <div className={styles.profileDropdown}>
              <button
                className={styles.profileItem}
                onClick={() => router.push("/dashboard")}
              >
                <LayoutDashboard size={15} />
                Back to Dashboard
              </button>

              <button
                className={styles.profileItem}
                onClick={() => router.push("#")}
              >
                <User size={15} />
                My Profile
              </button>

              <button
                className={styles.profileItem}
                onClick={() => router.push("/store/settings")}
              >
                <Settings size={15} />
                Settings
              </button>

              <div className={styles.dropdownDivider} />

              <button
                className={`${styles.profileItem} ${styles.logoutItem}`}
                onClick={handleLogout}
              >
                <LogOut size={15} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

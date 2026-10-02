import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { activeRoute, navigation, v11Routes } from "../config/routes";
import { Button, IconButton } from "./UI";
import { BarChart3, Home, LayoutTemplate, LogOut, Menu, Plus, Route, Settings, Store, Target, X } from "lucide-react";
import { PlanBadge } from "./PlanBadge";
import styles from "../styles/v11.module.css";

const glyphs = { home: Home, pages: LayoutTemplate, store: Store, links: Route, insights: BarChart3, tracking: Target, settings: Settings };

function NavItems({ current, close, bottom = false }) {
  return <>{navigation.filter((item) => !bottom || item.showInBottom !== false).map((item) => { const Icon = glyphs[item.icon]; const active = current === item.key; return <Link key={item.key} href={item.href} onClick={close} aria-current={active ? "page" : undefined} className={active ? styles.navActive : ""}><span><Icon aria-hidden="true"/></span>{item.label}</Link>; })}</>;
}

export function Shell({ user, onLogout, children, onCreate }) {
  const router = useRouter();
  const current = activeRoute(router.asPath);
  const [menuOpen, setMenuOpen] = useState(false), [menuClosing, setMenuClosing] = useState(false);
  const menuTriggerRef = useRef(null), drawerRef = useRef(null), closeTimer = useRef(null);
  const initials = (user?.name || "User").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const closeMenu = () => { if (!menuOpen || menuClosing) return; setMenuClosing(true); closeTimer.current = window.setTimeout(() => { setMenuOpen(false); setMenuClosing(false); }, 190); };
  useEffect(() => { if (!menuOpen) return; const overflow = document.body.style.overflow; document.body.style.overflow = "hidden"; const drawer = drawerRef.current; const focusable = () => [...(drawer?.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])') || [])]; focusable()[0]?.focus(); const keydown = (event) => { if (event.key === "Escape") closeMenu(); if (event.key === "Tab") { const nodes = focusable(); if (!nodes.length) return; const first = nodes[0], last = nodes[nodes.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } } }; document.addEventListener("keydown", keydown); return () => { document.body.style.overflow = overflow; document.removeEventListener("keydown", keydown); clearTimeout(closeTimer.current); menuTriggerRef.current?.focus(); }; }, [menuOpen]);

  return <div className={styles.shell}>
    <aside className={styles.sidebar}>
      <Link href={v11Routes.home} className={styles.sidebarLogo} aria-label="MyTikLink home"><img className={styles.sidebarWordmark} src="/images/mytiklink-logo-white.png" width="110" height="28" alt="MyTikLink"/><img className={styles.sidebarMark} src="/images/mytiklink-mark-black.png" width="34" height="34" alt=""/></Link>
      <nav><NavItems current={current}/></nav>
      <div className={styles.sidebarBottom}>
        <button className={styles.accountButton} onClick={() => router.push(v11Routes.profile)}><span className={styles.avatar}>{initials}</span><span><b>{user?.name || "MyTikLink user"}</b><PlanBadge plan={user?.plan}/></span></button>
        <div className={styles.sidebarAccountActions}><Link href={v11Routes.profile} className={current === "settings" ? styles.navActive : ""}><Settings aria-hidden="true"/>Settings</Link><button onClick={onLogout}><LogOut aria-hidden="true"/>Sign out</button></div>
      </div>
    </aside>
    <main className={styles.main}>
      <header className={styles.topbar}><div className={styles.topbarIdentity}><IconButton label="Open menu" className={styles.menuButton} ref={menuTriggerRef} onClick={() => setMenuOpen(true)}><Menu/></IconButton><Link href={v11Routes.home} className={styles.topbarLogo} aria-label="MyTikLink home"><img src="/images/mytiklink-mark-black.png" alt="" width="40" height="40"/></Link></div><div/><div className={styles.topbarActions}><Button className={styles.topbarCreate} onClick={onCreate}><Plus/> Create</Button></div></header>
      {children}
    </main>
    <nav className={styles.mobileNav}><NavItems current={current} bottom/></nav>
    {menuOpen && <div className={`${styles.drawerBackdrop} ${menuClosing ? styles.drawerBackdropClosing : ""}`} onMouseDown={(event) => event.target === event.currentTarget && closeMenu()}><aside ref={drawerRef} className={`${styles.drawer} ${menuClosing ? styles.drawerClosing : ""}`} aria-label="Mobile navigation"><header><Link href={v11Routes.home} className={styles.drawerLogo} onClick={closeMenu}><img src="/images/mytiklink-logo-white.png" width="132" height="33" alt="MyTikLink" onError={(event) => { event.currentTarget.style.display = "none"; event.currentTarget.nextElementSibling.style.display = "flex"; }}/><span className={styles.drawerLogoFallback}><span>m</span><b>mytiklink</b></span></Link><IconButton label="Close menu" onClick={closeMenu}><X/></IconButton></header><nav><NavItems current={current} close={closeMenu}/></nav><div className={styles.drawerAccount}><div><span className={styles.avatar}>{initials}</span><span><b>{user?.name || "MyTikLink user"}</b><PlanBadge plan={user?.plan}/></span></div><Link href={v11Routes.profile} onClick={closeMenu} aria-current={current === "settings" ? "page" : undefined} className={current === "settings" ? styles.navActive : ""}><Settings/> Settings</Link><button onClick={onLogout}><LogOut/> Sign out</button></div></aside></div>}
  </div>;
}

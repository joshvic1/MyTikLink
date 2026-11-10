import {v11Api,getToken} from '../lib/api';
function warmNavigation(href){if(typeof window==='undefined'||!getToken()||navigator.connection?.saveData)return;const load=href==='/v1-1/pages'?()=>v11Api.pageCollection():href==='/v1-1/dashboard'||href==='/v1-1/store'?()=>v11Api.dashboardV11():href==='/v1-1/links'?()=>v11Api.links():null;if(load)load().catch(()=>{});}
import IdleHelp from './IdleHelp';
import {requestAssistant} from '../../support/assistantBridge';
import VersionBadge from './VersionBadge';
import {DesktopDashboardHelp} from "./DesktopDashboard";
import {helpChannels} from "../config/helpChannels";
import {subscriptionAction} from '../lib/subscriptionAction.mjs';
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { activeRoute, navigation, v11Routes } from "../config/routes";
import { Button, IconButton, Modal } from "./UI";
import {
  UsersRound,
  Sparkles,
  Plug,
  BarChart3,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Headphones,
  Home,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  MessagesSquare,
  Package,
  PackagePlus,
  Palette,
  Plus,
  Route,
  Send,
  Settings,
  ShoppingBag,
  Store,
  Target,
  X,
} from "lucide-react";
import { useSubscription } from "./SubscriptionModal";
import { PlanBadge } from "./PlanBadge";
import { FaWhatsapp } from "react-icons/fa";
import styles from "../styles/v11.module.css";
const glyphs = {
  affiliate: UsersRound,
  integrations: Plug,
  home: Home,
  pages: LayoutTemplate,
  store: Store,
  links: Route,
  insights: BarChart3,
  tracking: Target,
  settings: Settings,
  products: Package,
  orders: ShoppingBag,
};
function NavItems({
  current,
  close,
  bottom = false,
  compact = false,
  items = navigation,
  storeExpanded,
  onToggleStore,
  hasStore = false,
}) {
  return (
    <>
      {items
        .filter((item) => !bottom || item.showInBottom !== false)
        .map((item) => {
          const Icon = glyphs[item.icon];
          const active = current === item.key;
          if (item.key === "store" && !compact)
            return (
              <div
                key={item.key}
                className={`${styles.storeNavGroup} ${storeExpanded ? styles.storeNavGroupOpen : ""}`}
              >
                <div className={styles.storeNavParent}>
                  <Link
                    href={item.href}
              onMouseEnter={()=>warmNavigation(item.href)}
              onFocus={()=>warmNavigation(item.href)}
                    onClick={close}
                    aria-current={active ? "page" : undefined}
                    className={active ? styles.navActive : ""}
                  >
                    <span>
                      <Icon aria-hidden="true" />
                    </span>
                    {item.label}
                  </Link>
                  <button
                    type="button"
                    className={styles.storeNavToggle}
                    aria-label={`${storeExpanded ? "Collapse" : "Expand"} Storefront navigation`}
                    aria-expanded={storeExpanded}
                    onClick={onToggleStore}
                  >
                    <ChevronDown />
                  </button>
                </div>
                {storeExpanded && (
                  <div className={styles.storeNavChildren}>
                    <Link
                      href={v11Routes.store}
                      onClick={close}
                      className={
                        current === "store" ? styles.storeNavChildActive : ""
                      }
                    >
                      <Store />
                      Overview
                    </Link>
                    <Link
                      href={v11Routes.products}
                      onClick={close}
                      className={
                        current === "products" ? styles.storeNavChildActive : ""
                      }
                    >
                      <Package />
                      Products
                    </Link>
                    <Link
                      href={v11Routes.orders}
                      onClick={close}
                      className={
                        current === "orders" ? styles.storeNavChildActive : ""
                      }
                    >
                      <ShoppingBag />
                      Orders
                    </Link>
                    {hasStore && (<Link
                      href={v11Routes.storeDesign}
                      onClick={close}
                      className={
                        current === "design" ? styles.storeNavChildActive : ""
                      }
                    >
                      <Palette />
                      Store design
                    </Link>)}
                    <Link
                      href={v11Routes.storeSettings}
                      onClick={close}
                      aria-current={
                        current === "storeSettings" ? "page" : undefined
                      }
                      className={
                        current === "storeSettings"
                          ? styles.storeNavChildActive
                          : ""
                      }
                    >
                      <Settings />
                      Store settings
                    </Link>
                  </div>
                )}
              </div>
            );
          return (
            <Link
              key={item.key}
              href={item.href}
              onMouseEnter={()=>warmNavigation(item.href)}
              onFocus={()=>warmNavigation(item.href)}
              onClick={close}
              aria-current={active ? "page" : undefined}
              className={active ? styles.navActive : ""}
            >
              <span>
                <Icon aria-hidden="true" />
              </span>
              {compact ? item.mobileLabel || item.label : item.label}
            </Link>
          );
        })}
    </>
  );
}
const mobileItems = navigation
  .filter((item) => ["home", "pages", "store", "links"].includes(item.key))
  .map((item) => ({
    ...item,
    mobileLabel:
      { pages: "Pages", store: "Store", links: "Links" }[item.key] ||
      item.label,
  }));
const storeMobileItems = [
  {
    key: "home",
    label: "Home",
    mobileLabel: "Home",
    href: v11Routes.home,
    icon: "home",
  },
  {
    key: "store",
    label: "Storefront",
    mobileLabel: "Storefront",
    href: v11Routes.store,
    icon: "store",
  },
  {
    key: "products",
    label: "Products",
    mobileLabel: "Products",
    href: v11Routes.products,
    icon: "products",
  },
  {
    key: "orders",
    label: "Orders",
    mobileLabel: "Orders",
    href: v11Routes.orders,
    icon: "orders",
  },
];
export function Shell({ user, onLogout, children, onCreate, onAddProduct, hasStore = false, payments = [] }) {
  const router = useRouter();
  const [workspaceHelpOpen,setWorkspaceHelpOpen]=useState(true);
  const { openSubscription } = useSubscription();
  const {show:showUpgrade,renew:expiredPlan,previous:previousPayment}=subscriptionAction(user,payments);
  const current = activeRoute(router.asPath);
  const activePath = router.asPath.split("?")[0].replace(/\/+$/, "");
  const isStoreManagement =
    activePath === v11Routes.store ||
    activePath.startsWith(`${v11Routes.store}/`);
  useEffect(() => {
    if (isStoreManagement) setStoreExpanded(true);
  }, [isStoreManagement]);
  const dockItems = isStoreManagement ? storeMobileItems : mobileItems;
  const [menuOpen, setMenuOpen] = useState(false),
    [menuClosing, setMenuClosing] = useState(false),
    [helpOpen, setHelpOpen] = useState(false),
    [storeExpanded, setStoreExpanded] = useState(() => isStoreManagement);
  const helpButtonRef=useRef(null);
  const menuTriggerRef = useRef(null),
    drawerRef = useRef(null),
    closeTimer = useRef(null);
  const initials = (user?.name || "User")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const closeMenu = () => {
    if (!menuOpen || menuClosing) return;
    setMenuClosing(true);
    closeTimer.current = window.setTimeout(() => {
      setMenuOpen(false);
      setMenuClosing(false);
    }, 190);
  };
  const openAssistant = () => {
    setHelpOpen(false);
    requestAnimationFrame(()=>requestAssistant());
  };
  useEffect(() => {
    if (!menuOpen) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const drawer = drawerRef.current;
    const focusable = () => [
      ...(drawer?.querySelectorAll(
        'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])',
      ) || []),
    ];
    focusable()[0]?.focus();
    const keydown = (event) => {
      if (event.key === "Escape") closeMenu();
      if (event.key === "Tab") {
        const nodes = focusable();
        if (!nodes.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", keydown);
      clearTimeout(closeTimer.current);
      menuTriggerRef.current?.focus();
    };
  }, [menuOpen]);
  return (
    <div className={`${styles.shell} ${styles.desktopDashboardShell} ${activePath !== v11Routes.home ? styles.desktopManagementShell : ""}`}>
      <aside className={styles.sidebar}>
        <Link
          href={v11Routes.home}
          className={styles.sidebarLogo}
          aria-label="MyTikLink home"
        >
          <img
            className={styles.sidebarWordmark}
            src="/images/mytiklink-logo-white.png"
            width="110"
            height="28"
            alt="MyTikLink"
          />
          <img
            className={styles.sidebarMark}
            src="/images/mytiklink-mark-black.png"
            width="34"
            height="34"
            alt=""
          />
          <VersionBadge/>
        </Link>
        <nav>
          <NavItems hasStore={hasStore}
            current={current}
            storeExpanded={
              storeExpanded ||
              ["store", "products", "orders", "design"].includes(current)
            }
            onToggleStore={() => setStoreExpanded((value) => !value)}
          />
        </nav>
        <div className={styles.sidebarBottom}>
          <button
            className={styles.accountButton}
            onClick={() => router.push(v11Routes.profile)}
          >
            <span className={styles.avatar}>{initials}</span>
            <span>
              <b>{user?.name || "MyTikLink user"}</b>
              <PlanBadge plan={user?.plan} />
            </span>
          </button>
          <div className={styles.sidebarAccountActions}>
            <Link
              href={v11Routes.profile}
              className={current === "settings" ? styles.navActive : ""}
            >
              <Settings aria-hidden="true" />
              Settings
            </Link>
            <button onClick={onLogout}>
              <LogOut aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      </aside>
      <main className={styles.main}>
        {activePath !== '/v1-1/store/design' && <header className={styles.topbar}>
          <div className={styles.topbarIdentity}>
            <IconButton
              label="Open menu"
              className={styles.menuButton}
              ref={menuTriggerRef}
              onClick={() => setMenuOpen(true)}
            >
              <Menu />
            </IconButton>
            <Link
              href={v11Routes.home}
              className={styles.topbarLogo}
              aria-label="MyTikLink home"
            >
              <img
                src="/images/mytiklink-mark-black.png"
                alt=""
                width="40"
                height="40"
              />
            </Link>
          </div>
          <div className={styles.desktopGreeting}>{activePath !== v11Routes.home && <span className={styles.desktopSectionLabel}>{({pages:"Landing pages",links:"Redirect links",store:"Storefront",products:"Products",orders:"Orders",storeSettings:"Store settings",design:"Store design",insights:"Analytics & Insights",tracking:"Pixels & Integrations",settings:"Account settings",affiliate:"Affiliate",integrations:"Integrations"})[current] || "MyTikLink workspace"}</span>}{activePath === v11Routes.home && <><h1>Welcome back{user?.name ? `, ${user.name.trim().split(" ")[0]}` : ""} <span aria-hidden="true">👋</span></h1><p>Here’s what’s happening with your MyTikLink account today.</p></>}</div>
          <div className={styles.topbarActions}>
            {onAddProduct && (activePath === v11Routes.store || activePath === v11Routes.products || activePath.startsWith(`${v11Routes.products}/`)) && (
              <Button
                variant="secondary"
                className={`${styles.topbarCreate} ${showUpgrade ? styles.topbarProductCompact : ""}`}
                aria-label="Add product"
                title="Add product"
                onClick={onAddProduct}
              >
                <PackagePlus /><span>Add product</span>
              </Button>
            )}
            {showUpgrade && <Button className={`${styles.topbarUpgrade} ${expiredPlan ? styles.topbarUpgradeExpired : ""}`} onClick={() => openSubscription({ mode: expiredPlan ? "renew" : "upgrade", preselected: expiredPlan ? String(previousPayment?.plan||user?.plan||"pro").split("_")[0].replace("free","pro") : "pro", plan: previousPayment?.plan||user?.plan })}><Sparkles aria-hidden="true" />{expiredPlan ? "Renew" : "Upgrade"}</Button>}
            <Button className={styles.topbarCreate} onClick={onCreate}>
              <Plus /> Create
            </Button>
          </div>
        </header>}
        {activePath === v11Routes.home ? children : <div className={`${styles.managementWorkspace} ${!workspaceHelpOpen ? styles.managementHelpClosed : ""}`}><div className={styles.managementContent}>{children}</div><DesktopDashboardHelp open={workspaceHelpOpen} onToggle={()=>setWorkspaceHelpOpen(value=>!value)}/></div>}
      </main>
      {activePath !== '/v1-1/store/design' && <div
        className={`${styles.floatingNavAssembly} ${isStoreManagement ? styles.floatingNavStoreMode : ""}`}
      >
        <nav
          className={styles.mobileNav}
          aria-label={
            isStoreManagement ? "Storefront navigation" : "MyTikLink navigation"
          }
        >
          <NavItems hasStore={hasStore} compact current={current} items={dockItems.slice(0, 2)} />
          <span className={styles.mobileNavCenter} aria-hidden="true" />
          <NavItems hasStore={hasStore} compact current={current} items={dockItems.slice(2)} />
        </nav>
        <button
          type="button"
          ref={helpButtonRef}
          className={styles.mobileHelpButton}
          aria-label="Open help channels"
          onClick={() => setHelpOpen(true)}
        >
          <Headphones />
          <span>Help</span>
        </button>
        <IdleHelp buttonRef={helpButtonRef} blocked={helpOpen||menuOpen} path={activePath}/>
      </div>}
      {menuOpen && (
        <div
          className={`${styles.drawerBackdrop} ${menuClosing ? styles.drawerBackdropClosing : ""}`}
          onMouseDown={(event) =>
            event.target === event.currentTarget && closeMenu()
          }
        >
          <aside
            ref={drawerRef}
            className={`${styles.drawer} ${menuClosing ? styles.drawerClosing : ""}`}
            aria-label="Mobile navigation"
          >
            <header className={styles.drawerHeader}>
              <Link
                href={v11Routes.home}
                className={styles.drawerLogo}
                onClick={closeMenu}
              >
                <img
                  src="/images/mytiklink-logo-white.png"
                  width="132"
                  height="33"
                  alt="MyTikLink"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                    event.currentTarget.nextElementSibling.style.display =
                      "flex";
                  }}
                />
                <span className={styles.drawerLogoFallback}>
                  <span>m</span>
                  <b>mytiklink</b>
                </span>
                <VersionBadge/>
              </Link>
              <IconButton label="Close menu" onClick={closeMenu}>
                <X />
              </IconButton>
            </header>
            <nav className={styles.drawerNavigation}>
              <NavItems hasStore={hasStore}
                current={current}
                close={closeMenu}
                storeExpanded={
                  storeExpanded ||
                  ["store", "products", "orders", "design"].includes(current)
                }
                onToggleStore={() => setStoreExpanded((value) => !value)}
              />
            </nav>
            <div className={`${styles.drawerAccount} ${styles.drawerFooter}`}>
              <div>
                <span className={styles.avatar}>{initials}</span>
                <span>
                  <b>{user?.name || "MyTikLink user"}</b>
                  <PlanBadge plan={user?.plan} />
                </span>
              </div>
              <Link
                href={v11Routes.profile}
                onClick={closeMenu}
                aria-current={current === "settings" ? "page" : undefined}
                className={current === "settings" ? styles.navActive : ""}
              >
                <Settings /> Settings
              </Link>
              <button onClick={onLogout}>
                <LogOut /> Sign out
              </button>
            </div>
          </aside>
        </div>
      )}
      {helpOpen && (
        <Modal
          tone="teal"
          className={styles.helpSheet}
          title="How can we help?"
          description="Choose a help channel below to get the support you need."
          headerIcon={<Headphones />}
          onClose={() => setHelpOpen(false)}
        >
          <div className={styles.helpChannelGrid}>
            {helpChannels.map(
              ({ title, detail, Icon, href, soon, tone, badge, action }) =>
                soon ? (
                  <button
                    key={title}
                    type="button"
                    className={`${styles.helpChannelCard} ${styles[`helpChannel_${tone}`]}`}
                    disabled
                  >
                    <span className={styles.helpChannelIcon}>
                      <Icon />
                    </span>
                    <span className={styles.helpChannelCopy}>
                      <b>{title}</b>
                      <small>{detail}</small>
                      <em>{badge}</em>
                    </span>
                  </button>
                ) : action === "ai" ? (
                  <button
                    key={title}
                    type="button"
                    className={`${styles.helpChannelCard} ${styles[`helpChannel_${tone}`]}`}
                    onClick={openAssistant}
                  >
                    <span className={styles.helpChannelIcon}>
                      <Icon />
                    </span>
                    <span className={styles.helpChannelCopy}>
                      <b>{title}</b>
                      <small>{detail}</small>
                      <em>{badge}</em>
                    </span>
                    <ChevronRight className={styles.helpChannelArrow} />
                  </button>
                ) : (
                  <a
                    key={title}
                    className={`${styles.helpChannelCard} ${styles[`helpChannel_${tone}`]}`}
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noreferrer" : undefined}
                  >
                    <span className={styles.helpChannelIcon}>
                      <Icon />
                    </span>
                    <span className={styles.helpChannelCopy}>
                      <b>{title}</b>
                      <small>{detail}</small>
                      <em>{badge}</em>
                    </span>
                    <ChevronRight className={styles.helpChannelArrow} />
                  </a>
                ),
            )}
          </div>
          <p className={styles.helpSheetFooter}>
            We’re here to help you succeed.
          </p>
        </Modal>
      )}
    </div>
  );
}

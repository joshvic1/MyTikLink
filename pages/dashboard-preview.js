import { useState } from "react";
import Link from "next/link";
import {
  Activity, ArrowRight, BarChart3, Bell, Check, ChevronDown,
  ChevronRight, CircleHelp, FileText, Home, Link2, Menu, Package,
  Plus, Search, Settings, ShoppingBag, Sparkles, Store, Target,
  TrendingUp, Users, WalletCards, X, Zap
} from "lucide-react";
import styles from "@/styles/dashboardPreview.module.css";

const nav = [
  { label: "Overview", icon: Home, active: true },
  { label: "Links", icon: Link2, badge: "6" },
  { label: "Pages", icon: FileText, badge: "3" },
  { label: "Store", icon: Store },
  { label: "Orders", icon: ShoppingBag, badge: "4" },
  { label: "Leads", icon: Users, badge: "12" },
  { label: "Analytics", icon: BarChart3 },
];

const performance = [
  { label: "Visits", value: "2,481", delta: "+18.2%", icon: Activity },
  { label: "Link clicks", value: "1,204", delta: "+11.4%", icon: Link2 },
  { label: "Leads", value: "86", delta: "+24.1%", icon: Users },
  { label: "Orders", value: "24", delta: "+8.7%", icon: ShoppingBag },
];

const activity = [
  { icon: ShoppingBag, tone: "orange", title: "New order #MTL-2048", detail: "₦42,500 · 3 products", time: "12 min" },
  { icon: Users, tone: "blue", title: "New lead from Summer Sale", detail: "Ada N. · WhatsApp form", time: "34 min" },
  { icon: Link2, tone: "violet", title: "Campaign link reached 500 clicks", detail: "TikTok Summer Campaign", time: "2 hr" },
];

export default function DashboardPreview() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [range, setRange] = useState("7 days");
  const [setupHidden, setSetupHidden] = useState(false);

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${menuOpen ? styles.open : ""}`}>
        <div className={styles.brand}><span className={styles.brandMark}>M</span><span>MyTikLink</span></div>
        <button className={styles.mobileClose} onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={20}/></button>
        <nav className={styles.nav}>
          <p className={styles.navLabel}>Workspace</p>
          {nav.map(({ label, icon: Icon, active, badge }) => (
            <button key={label} className={`${styles.navItem} ${active ? styles.active : ""}`}>
              <Icon size={18}/><span>{label}</span>{badge && <span className={styles.badge}>{badge}</span>}
            </button>
          ))}
          <p className={styles.navLabel}>Grow</p>
          <button className={styles.navItem}><Target size={18}/><span>Tracking</span></button>
        </nav>
        <div className={styles.sidebarBottom}>
          <div className={styles.planMini}><div><span>Pro plan</span><strong>18 days left</strong></div><button>Manage</button></div>
          <button className={styles.navItem}><CircleHelp size={18}/><span>Help & support</span></button>
          <button className={styles.navItem}><Settings size={18}/><span>Settings</span></button>
          <div className={styles.profile}><span className={styles.avatar}>DA</span><div><strong>David A.</strong><span>david@mytiklink.com</span></div><ChevronDown size={16}/></div>
        </div>
      </aside>

      {menuOpen && <button className={styles.scrim} onClick={() => setMenuOpen(false)} aria-label="Close menu"/>}

      <main className={styles.main}>
        <header className={styles.topbar}>
          <button className={styles.menuButton} onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu size={20}/></button>
          <div className={styles.search}><Search size={17}/><span>Search your workspace</span><kbd>⌘ K</kbd></div>
          <div className={styles.topActions}><button className={styles.iconButton} aria-label="Notifications"><Bell size={19}/><i/></button><button className={styles.createButton}><Plus size={17}/> Create <ChevronDown size={15}/></button></div>
        </header>

        <div className={styles.content}>
          <section className={styles.welcome}>
            <div><p className={styles.eyebrow}>FRIDAY, 21 AUGUST</p><h1>Good morning, David</h1><p>Here’s what’s happening across your MyTikLink workspace.</p></div>
            <div className={styles.status}><span/><div><strong>Everything looks good</strong><small>All pages and tracking are active</small></div></div>
          </section>

          {!setupHidden && <section className={styles.setupCard}>
            <div className={styles.setupIcon}><Sparkles size={20}/></div>
            <div className={styles.setupCopy}><div className={styles.setupTitle}><div><h2>Finish setting up your workspace</h2><p>Two quick steps will help you get more from MyTikLink.</p></div><button onClick={() => setSetupHidden(true)} aria-label="Dismiss setup"><X size={18}/></button></div>
              <div className={styles.progressRow}><div className={styles.progress}><span/></div><strong>3 of 5 complete</strong></div>
              <div className={styles.steps}>
                <div className={styles.done}><span><Check size={14}/></span><div><strong>Create your first link</strong><small>Completed</small></div></div>
                <button><span>4</span><div><strong>Connect your tracking pixel</strong><small>Measure results from your ads</small></div><ChevronRight size={17}/></button>
                <button><span>5</span><div><strong>Publish your store</strong><small>Start accepting customer orders</small></div><ChevronRight size={17}/></button>
              </div>
            </div>
          </section>}

          <section className={styles.section}>
            <div className={styles.sectionHeading}><div><h2>Performance</h2><p>Your workspace activity at a glance</p></div><select value={range} onChange={(e) => setRange(e.target.value)}><option>7 days</option><option>30 days</option><option>90 days</option></select></div>
            <div className={styles.metrics}>{performance.map(({label,value,delta,icon:Icon}) => <article key={label} className={styles.metric}><div className={styles.metricTop}><span>{label}</span><span className={styles.metricIcon}><Icon size={17}/></span></div><strong>{value}</strong><small><TrendingUp size={13}/>{delta} <em>vs previous period</em></small></article>)}</div>
          </section>

          <div className={styles.twoColumn}>
            <section className={`${styles.panel} ${styles.chartPanel}`}>
              <div className={styles.panelHeading}><div><h2>Reach & engagement</h2><p>Visits compared with meaningful actions</p></div><button>View analytics <ArrowRight size={15}/></button></div>
              <div className={styles.legend}><span><i className={styles.visits}/>Visits</span><span><i className={styles.actions}/>Actions</span></div>
              <div className={styles.chart}><div className={styles.yLabels}><span>800</span><span>600</span><span>400</span><span>200</span><span>0</span></div><div className={styles.plot}><svg viewBox="0 0 720 210" preserveAspectRatio="none" aria-label="Performance chart"><defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6759db" stopOpacity=".22"/><stop offset="1" stopColor="#6759db" stopOpacity="0"/></linearGradient></defs><path className={styles.area} d="M0,165 C75,150 92,120 150,132 S245,75 310,98 S405,120 455,58 S550,92 610,43 S680,66 720,26 L720,210 L0,210Z"/><path className={styles.lineA} d="M0,165 C75,150 92,120 150,132 S245,75 310,98 S405,120 455,58 S550,92 610,43 S680,66 720,26"/><path className={styles.lineB} d="M0,188 C70,178 100,163 150,172 S250,134 310,151 S405,149 455,119 S545,135 610,103 S678,112 720,87"/></svg><div className={styles.xLabels}><span>15 Aug</span><span>16 Aug</span><span>17 Aug</span><span>18 Aug</span><span>19 Aug</span><span>20 Aug</span><span>21 Aug</span></div></div></div>
            </section>

            <section className={`${styles.panel} ${styles.attention}`}>
              <div className={styles.panelHeading}><div><h2>Needs attention</h2><p>Actions that could improve results</p></div><span className={styles.count}>3</span></div>
              <div className={styles.attentionList}>
                <button><span className={styles.warn}><Target size={17}/></span><div><strong>Meta Pixel isn’t connected</strong><small>Track conversions from your Meta ads</small></div><ArrowRight size={16}/></button>
                <button><span className={styles.warn}><Package size={17}/></span><div><strong>2 products are low in stock</strong><small>Update inventory to avoid missed orders</small></div><ArrowRight size={16}/></button>
                <button><span className={styles.info}><WalletCards size={17}/></span><div><strong>Your plan renews in 18 days</strong><small>Review your billing details</small></div><ArrowRight size={16}/></button>
              </div>
            </section>
          </div>

          <div className={styles.twoColumnBottom}>
            <section className={styles.panel}><div className={styles.panelHeading}><div><h2>Recent activity</h2><p>The latest from your workspace</p></div><button>View all</button></div><div className={styles.activityList}>{activity.map(({icon:Icon,tone,title,detail,time})=><div className={styles.activityItem} key={title}><span className={`${styles.activityIcon} ${styles[tone]}`}><Icon size={17}/></span><div><strong>{title}</strong><small>{detail}</small></div><time>{time}</time></div>)}</div></section>
            <section className={styles.panel}><div className={styles.panelHeading}><div><h2>Your top content</h2><p>Best performing this week</p></div><button>Manage content</button></div><div className={styles.contentList}><div><span className={styles.contentIcon}><Zap size={17}/></span><div><strong>TikTok Summer Campaign</strong><small>Smart link · 684 clicks</small></div><b>+22%</b></div><div><span className={styles.contentIcon}><FileText size={17}/></span><div><strong>Summer Sale</strong><small>Landing page · 492 visits</small></div><b>+16%</b></div><div><span className={styles.contentIcon}><Store size={17}/></span><div><strong>David’s Store</strong><small>Store · 24 orders</small></div><b>+9%</b></div></div></section>
          </div>
          <p className={styles.previewNote}>Dashboard preview · Uses sample data and does not affect your account</p>
        </div>
      </main>
    </div>
  );
}


import Link from "next/link";
import { useRouter } from "next/router";
import styles from "../styles/v11.module.css";

const labels = {
  pages: "Landing pages", links: "Redirect Links", store: "Storefront",
  analytics: "Insights", insights: "Insights", settings: "Settings",
  profile: "Account", tracking: "Tracking", billing: "Billing", security: "Security",
  plan: "Plan", products: "Products", orders: "Orders", design: "Design",
  setup: "Setup", editor: "Editor", builder: "Builder", create: "Create",
  affiliate: "Affiliate", integrations: "Integrations", help: "Help & support"
};

export function Breadcrumbs() {
  const { asPath } = useRouter();
  const parts = asPath.split(/[?#]/)[0].split("/").filter(Boolean).slice(1);
  const home = !parts.length || parts[0] === "dashboard";
  const items = [{ label: "Home", href: "/v1-1/dashboard" }];
  if (!home) parts.forEach((part,index) => {
    const href = part === "settings" && index === 0 ? "/v1-1/settings/profile" : `/v1-1/${parts.slice(0,index+1).join("/")}`;
    items.push({ label: labels[part] || part.replace(/-/g," "), href });
  });
  return <nav className={styles.breadcrumbs} aria-label="Breadcrumb"><ol>{items.map((item,index) => <li key={`${item.href}-${index}`}>{index > 0 && <span className={styles.breadcrumbSeparator} aria-hidden="true">/</span>}{index === items.length - 1 ? <span aria-current="page">{item.label}</span> : <Link href={item.href}>{item.label}</Link>}</li>)}</ol></nav>;
}

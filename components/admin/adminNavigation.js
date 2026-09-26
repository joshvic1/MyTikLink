import { LayoutGrid, Users, Link2, PanelsTopLeft, CreditCard, ChartNoAxesCombined, Mail, Newspaper, UserRoundCog } from "lucide-react";

export const adminNavigation = [
  { name: "Overview", href: "/admin", icon: LayoutGrid, description: "Your business at a glance." },
  { name: "Payments", href: "/admin/payment", icon: CreditCard, description: "Every subscription. Every payment. One clear view." },
  { name: "Analytics", href: "/admin/analytics", icon: ChartNoAxesCombined, description: "Understand revenue, growth and subscription performance." },
  { name: "Users", href: "/admin/users", icon: Users, description: "Manage the people building their business with MyTikLink." },
  { name: "Links", href: "/admin/links", icon: Link2, description: "Explore and manage links across your platform." },
  { name: "Pages", href: "/admin/pages", icon: PanelsTopLeft, description: "Your customers’ pages, organised in one place." },
  { name: "Email segments", href: "/admin/email/segment", icon: Mail, description: "Reach the right audience with the right message." },
  { name: "Agents", href: "/admin/agents", icon: UserRoundCog, description: "Manage your team, leads and agent performance." },
  { name: "Blog", href: "/admin/blog", icon: Newspaper, description: "Create, organise and publish your stories." },
];

export function adminPageFor(pathname = "/admin") {
  if (pathname.startsWith("/admin/email")) return { ...adminNavigation[6], number: "07" };
  const index = adminNavigation.findIndex((item) => item.href === "/admin" ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`));
  return { ...(adminNavigation[index] || adminNavigation[0]), number: String(Math.max(index, 0) + 1).padStart(2, "0") };
}

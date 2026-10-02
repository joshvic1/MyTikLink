import { planConfig } from "@/config/planConfig";

export const subscriptionPlans = [
  { id: "standard", name: "Standard", tone: "standard", description: "Everything you need to publish, sell and collect customer details.", benefits: ["Up to 3 redirect links each month", "Up to 5,000 tracked clicks per cycle", "Landing pages and lead collection", "Storefront, products and order management", "Page and link analytics", "TikTok and Meta Pixel tracking", "Access to premium templates", "Priority customer support"], cycles: { monthly: planConfig.standard_monthly, yearly: planConfig.standard_yearly } },
  { id: "pro", name: "Pro", tone: "pro", description: "More freedom for active campaigns, growing traffic and multiple offers.", recommendation: "Recommended", benefits: ["Unlimited redirect links", "Unlimited tracked clicks", "Landing pages and lead collection", "Storefront, products and order management", "Page and link analytics", "TikTok and Meta Pixel tracking", "Full premium template access", "Fastest priority customer support"], cycles: { monthly: planConfig.pro_monthly, yearly: planConfig.pro_yearly } },
];

export const planGuidance = [
  { id: "free", title: "Free", description: "For exploring MyTikLink and creating your first setup.", limits: `Up to ${planConfig.free.maxLinks} smart link and ${planConfig.free.maxClicks.toLocaleString()} clicks.` },
  ...subscriptionPlans.map((plan) => ({ id: plan.id, title: plan.name, description: plan.description, limits: plan.benefits.slice(0, 2).join(" · ") })),
];

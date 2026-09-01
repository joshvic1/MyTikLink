import { planConfig } from "@/config/planConfig";

export const subscriptionPlans = [
  { id: "standard", name: "Standard", tone: "standard", description: "For creators and small businesses using MyTikLink consistently.", benefits: ["More smart links", "Up to 5,000 clicks per cycle", "Campaign and storefront tools"], cycles: { monthly: planConfig.standard_monthly, yearly: planConfig.standard_yearly } },
  { id: "pro", name: "Pro", tone: "pro", description: "For active campaigns, higher traffic, and maximum flexibility.", recommendation: "Best for growth", benefits: ["Unlimited smart links", "Unlimited clicks", "Best fit for active campaigns"], cycles: { monthly: planConfig.pro_monthly, yearly: planConfig.pro_yearly } },
];

export const planGuidance = [
  { id: "free", title: "Free", description: "For exploring MyTikLink and creating your first setup.", limits: `Up to ${planConfig.free.maxLinks} smart link and ${planConfig.free.maxClicks.toLocaleString()} clicks.` },
  ...subscriptionPlans.map((plan) => ({ id: plan.id, title: plan.name, description: plan.description, limits: plan.benefits.slice(0, 2).join(" · ") })),
];

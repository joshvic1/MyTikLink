export const planType = value => String(value || "free").toLowerCase().includes("pro") ? "pro" : String(value || "").toLowerCase().includes("standard") ? "standard" : "free";
export const planCycle = value => String(value || "").toLowerCase().includes("yearly") ? "yearly" : "monthly";
export const isCurrentSubscription = (current, selected, cycle) => planType(current) === selected && planCycle(current) === cycle;
export function checkoutPricing(initiated, config) {
  const amount = Number(initiated.amount);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Checkout amount is unavailable. Please try again.");
  return {amount: Math.round(amount * 100), ...(amount === config.price ? {plan: config.paystackPlan} : {})};
}

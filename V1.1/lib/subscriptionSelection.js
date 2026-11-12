export const planType = value => String(value || "free").toLowerCase().includes("pro") ? "pro" : String(value || "").toLowerCase().includes("standard") ? "standard" : "free";
export const planCycle = value => String(value || "").toLowerCase().includes("yearly") ? "yearly" : "monthly";
export const isCurrentSubscription = (current, selected, cycle) => planType(current) === selected && planCycle(current) === cycle;
export function checkoutPricing(initiated, config) {
  const amount = Number(initiated.amount);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Checkout amount is unavailable. Please try again.");
  return {amount: Math.round(amount * 100), ...(amount === config.price ? {plan: config.paystackPlan} : {})};
}

// Display the same active-plan adjustments enforced by the payment API.
export function selectionAmount(user,selected,cycle,price){
 if(!user?.planExpiry||new Date(user.planExpiry).getTime()<=Date.now())return price;
 const target=selected+'_'+cycle;
 const adjustments={standard_monthly:{pro_monthly:3000},pro_monthly:{pro_yearly:35000},standard_yearly:{pro_yearly:22000}};
 return adjustments[user.plan]?.[target]??price;
}

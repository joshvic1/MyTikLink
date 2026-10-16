export function canUseLandingPages(user, now = Date.now()) {
  if (!["standard_monthly", "standard_yearly", "pro_monthly", "pro_yearly"].includes(String(user?.plan || "").toLowerCase())) return false;
  return !user.planExpiry || new Date(user.planExpiry).getTime() > now;
}

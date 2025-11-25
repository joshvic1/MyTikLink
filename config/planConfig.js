export const planConfig = {
  free: { maxLinks: 1, maxClicks: 250, expiresInDays: 0 },

  standard_monthly: { maxLinks: 3, maxClicks: 5000, expiresInDays: 30 },
  pro_monthly: { maxLinks: Infinity, maxClicks: Infinity, expiresInDays: 30 },

  standard_yearly: { maxLinks: 36, maxClicks: 5000, expiresInDays: 365 },
  pro_yearly: { maxLinks: Infinity, maxClicks: Infinity, expiresInDays: 365 },
};

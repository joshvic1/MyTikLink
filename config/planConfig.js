export const planConfig = {
  free: { maxLinks: 1, maxClicks: 250, expiresInDays: 0 },

  standard_monthly: {
    maxLinks: 3,
    maxClicks: 5000,
    expiresInDays: 30,
    paystackPlan: "PLN_a2jdz5ift3kldgk",
    price: 2000,
  },
  pro_monthly: {
    maxLinks: Infinity,
    maxClicks: Infinity,
    expiresInDays: 30,
    paystackPlan: "PLN_408h1q8duesn3ge",
    price: 5000,
  },

  standard_yearly: {
    maxLinks: 36,
    maxClicks: 5000,
    expiresInDays: 365,
    paystackPlan: "PLN_dqb6boapykxso4c",
    price: 18000,
  },
  pro_yearly: {
    maxLinks: Infinity,
    maxClicks: Infinity,
    expiresInDays: 365,
    paystackPlan: "PLN_hbr7x0wmfx8xgsg",
    price: 40000,
  },
};

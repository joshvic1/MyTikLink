import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL;

export const sendCode = async (email, slug) => {
  const res = await axios.post(`${API}/customer-auth/send-code`, {
    email,
    slug,
  });

  return res.data;
};

export const verifyCode = async (email, slug, code) => {
  const res = await axios.post(`${API}/customer-auth/verify-code`, {
    email,
    slug,
    code,
  });

  return res.data;
};

export const getCustomerOrders = async (token) => {
  const res = await axios.get(`${API}/customer-auth/orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL;

export const createOrder = async (data) => {
  const res = await axios.post(`${API}/orders`, data);

  return res.data;
};

export const getMyOrders = async (token, page = 1) => {
  const res = await axios.get(`${API}/orders/me?page=${page}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};
export const getRecentOrders = async (token) => {
  const res = await axios.get(`${API}/orders/recent`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};
export const updateOrderStatus = async (orderId, status, token) => {
  const res = await axios.put(
    `${API}/orders/${orderId}/status`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return res.data;
};

import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL;

export const createStore = async (data, token) => {
  const res = await axios.post(`${API}/store`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const getMyStore = async (token) => {
  const res = await axios.get(`${API}/store/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const updateStore = async (storeId, data, token) => {
  const res = await axios.put(`${API}/store/${storeId}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};
export const getStoreStats = async (token, range) => {
  const res = await axios.get(`${API}/store/stats?range=${range}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL;

export const createProduct = async (data, token) => {
  const res = await axios.post(`${API}/products`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const getMyProducts = async (token, page = 1) => {
  const res = await axios.get(`${API}/products/me?page=${page}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};
export const getRecentProducts = async (token) => {
  const res = await axios.get(`${API}/products/recent`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const deleteProduct = async (id, token) => {
  const res = await axios.delete(`${API}/products/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};
export const getLowStockProducts = async (token) => {
  const res = await axios.get(`${API}/products/low-stock`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};
export const updateProductStock = async (id, amount, token) => {
  const res = await axios.put(
    `${API}/products/${id}/stock`,
    { amount },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return res.data;
};
export const updateProduct = async (id, data, token) => {
  const res = await axios.put(`${API}/products/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

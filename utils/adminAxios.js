import axios from "axios";

const adminAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Attach token automatically on every request
adminAxios.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default adminAxios;

import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL;

export const uploadImage = async (file, token) => {
  const formData = new FormData();

  formData.append("image", file);

  const res = await axios.post(`${API}/upload`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,

      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

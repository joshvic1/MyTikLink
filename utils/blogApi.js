import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, options);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export function getBlogPosts({
  page = 1,
  limit = 10,
  q = "",
  category = "",
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (q) params.set("q", q);
  if (category && category !== "All") params.set("category", category);

  return request(`/blog?${params.toString()}`);
}

export function getBlogCategories() {
  return request("/blog/categories");
}

export function searchBlogPosts(q) {
  const params = new URLSearchParams({ q });
  return request(`/blog/search?${params.toString()}`);
}

export function getBlogPost(slug) {
  return request(`/blog/${encodeURIComponent(slug)}`);
}

export function getAdminBlogPosts(token) {
  return request("/admin/blog", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function saveBlogPost(token, payload, id) {
  return request(id ? `/admin/blog/${id}` : "/admin/blog", {
    method: id ? "PATCH" : "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function deleteBlogPost(token, id) {
  return request(`/admin/blog/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function uploadBlogImage(token, file) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await axios.post(`${API_URL}/upload/admin`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
}

"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import styles from "@/styles/admin/Login.module.css";

export default function AdminLogin() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/auth/login`,
        form
      );

      localStorage.setItem("admin_token", res.data.token);

      router.push("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h2 className={styles.title}>Admin Login</h2>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleLogin} className={styles.form}>
          <input
            name="email"
            type="email"
            placeholder="Admin Email"
            value={form.email}
            onChange={handleChange}
            className={styles.input}
          />

          <input
            name="password"
            type="password"
            placeholder="Admin Password"
            value={form.password}
            onChange={handleChange}
            className={styles.input}
          />

          <button className={styles.button} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import styles from "@/styles/Auth.module.css";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";

// IMPORT FORGOT PASSWORD MODAL
import ForgotPasswordModal from "@/components/ForgotPasswordModal";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false); // modal state

  const router = useRouter();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password)
      return toast.error("Email and password are required!");

    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        form
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("name", res.data.name);

      toast.success(`Welcome back, ${res.data.name}!`);
      router.push("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid login details");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (router.query.googleToken) {
      localStorage.setItem("token", router.query.googleToken);
      toast.success("Logged in with Google 🚀");
      router.push("/dashboard");
    }

    if (router.query.googleError === "user_not_found") {
      toast.error("No account found. Please register.");
      router.push("/register");
    }
  }, [router.query]);

  return (
    <>
      {/* FULL PAGE WRAPPER */}
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to continue</p>
          <button
            type="button"
            className={styles.googleBtn}
            onClick={() =>
              (window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google?intent=login
`)
            }
          >
            <img src="/google.svg" className={styles.googleIcon} />
            Continue with Google
          </button>
          <div className={styles.divider}>or</div>

          {/* LOGIN FORM */}
          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={form.email}
              className={styles.input}
              onChange={handleChange}
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              className={styles.input}
              onChange={handleChange}
            />

            {/* Forgot Password Link */}
            <button
              type="button"
              className={styles.forgotBtn}
              onClick={() => setShowForgot(true)}
            >
              Forgot Password?
            </button>

            <button className={styles.button} disabled={loading}>
              {loading ? "Checking..." : "Login"}
            </button>
          </form>

          <p className={styles.text}>
            Don’t have an account?{" "}
            <Link href="/register" className={styles.link}>
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgot}
        onClose={() => setShowForgot(false)}
      />
    </>
  );
}

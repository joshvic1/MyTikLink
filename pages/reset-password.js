import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import styles from "@/styles/ResetPassword.module.css";

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState(true);
  const [checking, setChecking] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const getStrength = (pwd) => {
    if (pwd.length < 6) return "weak";
    if (pwd.match(/[A-Z]/) && pwd.match(/[0-9]/)) return "strong";
    return "medium";
  };

  useEffect(() => {
    if (!router.isReady) return;

    if (!token) {
      setValid(false);
      setChecking(false);
      return;
    }

    const verifyToken = async () => {
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-reset-token`,
          { token },
        );
        setValid(true);
      } catch {
        setValid(false);
      } finally {
        setChecking(false);
      }
    };

    verifyToken();
  }, [router.isReady, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirm) {
      return toast.error("All fields are required.");
    }

    if (password !== confirm) {
      return toast.error("Passwords do not match.");
    }

    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters.");
    }

    setLoading(true);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`,
        { token, password },
      );

      toast.success("Password updated!");
      setTimeout(() => router.push("/login"), 1200);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ================= VERIFYING ================= */
  if (checking) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <p style={{ textAlign: "center" }}>Verifying reset link...</p>
        </div>
      </div>
    );
  }

  /* ================= INVALID LINK ================= */
  if (!valid) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h2 className={styles.title}>Invalid or Expired Link</h2>
          <p className={styles.subtitle}>
            Please request a new password reset link.
          </p>

          <button
            className={styles.button}
            onClick={() => router.push("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  /* ================= RESET FORM ================= */
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h2 className={styles.title}>Reset Your Password</h2>

        <form onSubmit={handleSubmit}>
          {/* New Password */}
          <div className={styles.inputWrap}>
            <input
              className={styles.input}
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <span
              className={styles.eye}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          {password && (
            <div
              className={`${styles.strength} ${styles[getStrength(password)]}`}
            >
              {getStrength(password).toUpperCase()}
            </div>
          )}

          {/* Confirm Password */}
          <div className={styles.inputWrap}>
            <input
              className={styles.input}
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm New Password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />

            <span
              className={styles.eye}
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? "🙈" : "👁️"}
            </span>
          </div>

          <button className={styles.button} disabled={loading} type="submit">
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>

        <p className={styles.back} onClick={() => router.push("/login")}>
          Back to Login
        </p>
      </div>
    </div>
  );
}

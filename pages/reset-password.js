import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const getStrength = (pwd) => {
    if (pwd.length < 6) return "weak";
    if (pwd.match(/[A-Z]/) && pwd.match(/[0-9]/)) return "strong";
    return "medium";
  };

  useEffect(() => {
    if (!token) return;

    axios
      .post(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-reset-token`, {
        token,
      })
      .then(() => setValid(true))
      .catch(() => setValid(false));
  }, [token]);

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
        { token, password }
      );

      toast.success("Password updated!");

      setTimeout(() => router.push("/login"), 1200);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={styles.page}>
        <p style={styles.error}>Invalid reset link.</p>
      </div>
    );
  }

  if (!valid) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2 style={styles.title}>Invalid or Expired Link</h2>
          <p style={styles.subtitle}>
            Please request a new password reset link.
          </p>

          <button style={styles.button} onClick={() => router.push("/login")}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Reset Your Password</h2>

        <form onSubmit={handleSubmit}>
          {/* Password */}
          <div style={styles.inputWrap}>
            <input
              style={styles.input}
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <span
              style={styles.eye}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          {password && (
            <div
              style={{
                ...styles.strength,
                ...(styles[getStrength(password)] || {}),
              }}
            >
              {getStrength(password).toUpperCase()}
            </div>
          )}

          {/* Confirm Password */}
          <div style={styles.inputWrap}>
            <input
              style={styles.input}
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm New Password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />

            <span
              style={styles.eye}
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? "🙈" : "👁️"}
            </span>
          </div>

          <button style={styles.button} disabled={loading} type="submit">
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>

        <p style={styles.back} onClick={() => router.push("/login")}>
          Back to Login
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "var(--bg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
  },

  card: {
    width: "100%",
    maxWidth: "420px",
    background: "var(--surface-deep)",
    padding: "2.4rem",
    borderRadius: "var(--r)",
    border: "1px solid var(--stroke-strong)",
    boxShadow: "0 10px 30px var(--shadow-strong)",
  },

  title: {
    textAlign: "center",
    color: "var(--text)",
    fontSize: "22px",
    marginBottom: "0.5rem",
  },

  subtitle: {
    textAlign: "center",
    color: "var(--muted)",
    fontSize: "14px",
    marginBottom: "1.5rem",
  },

  inputWrap: {
    position: "relative",
    marginBottom: "1.2rem",
  },

  input: {
    width: "100%",
    padding: "12px 14px",
    background: "var(--surface)",
    border: "1px solid var(--stroke)",
    borderRadius: "10px",
    color: "var(--text)",
    outline: "none",
  },

  eye: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    color: "var(--muted)",
  },

  strength: {
    padding: "8px",
    borderRadius: "10px",
    textAlign: "center",
    fontWeight: "600",
    marginBottom: "1rem",
  },

  weak: {
    background: "rgba(var(--danger-rgb), 0.15)",
    color: "var(--danger)",
  },

  medium: {
    background: "rgba(234,179,8,0.15)",
    color: "#eab308",
  },

  strong: {
    background: "rgba(var(--success-rgb), 0.15)",
    color: "var(--success)",
  },

  button: {
    width: "100%",
    marginTop: "0.5rem",
    padding: "12px",
    borderRadius: "10px",
    background: "var(--primary)",
    color: "var(--onPrimary)",
    fontWeight: "bold",
    cursor: "pointer",
    border: "none",
  },

  back: {
    textAlign: "center",
    marginTop: "1rem",
    color: "var(--muted)",
    cursor: "pointer",
  },

  error: {
    color: "var(--danger)",
    fontSize: "18px",
    textAlign: "center",
  },
};

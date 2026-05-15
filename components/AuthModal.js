"use client";
import { useEffect, useState } from "react";
import Modal from "./Modal";
import axios from "axios";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import VerifyEmailModal from "./VerifyEmailModal";
import styles from "@/styles/modal.module.css";
import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";
export default function AuthModal({
  isOpen,
  onClose,
  mode,
  switchMode = () => {},
}) {
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    whatsappNumber: "",
    countryCode: "234",
  });

  const [loading, setLoading] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [country, setCountry] = useState("ng");
  const handleClose = () => {
    switchMode(null); // hide modal for components that use authMode
    onClose?.(); // call parent onClose if it was passed
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /**
   * LOGIN
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          email: form.email,
          password: form.password,
        },
      );

      login(res.data.token);
      toast.success("Logged in!");
      handleClose();
      router.push("/dashboard");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Incorrect Login Details or Account Not Found",
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * REGISTER → SEND CODE
   */
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!acceptedTerms) {
      setTermsError("You must accept our Terms & Conditions to continue");
      return;
    }

    setTermsError("");
    setLoading(true);

    try {
      console.log("SEND CODE PHONE:", form.whatsappNumber);
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/send-code`, {
        name: form.name,
        email: form.email,
        password: form.password,
        whatsappNumber: form.whatsappNumber,
      });

      toast.success("Verification code sent!");
      setShowVerify(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  /**
   * AFTER VERIFYING CODE → CREATE ACCOUNT
   */
  const completeRegistration = async (verifiedData) => {
    try {
      console.log("FINAL WHATSAPP:", form.whatsappNumber);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          ...form,
          whatsappNumber: verifiedData.whatsappNumber
            ?.replace(/\D/g, "")
            ?.replace(/^0/, "234"),
        },
      );

      login(res.data.token);
      toast.success("Account created!");
      handleClose();
      router.push("/dashboard");
    } catch (err) {
      toast.error("Registration failed after verification");
    }
  };

  /**
   * FORGOT PASSWORD
   */
  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
        { email: form.email },
      );

      toast.success("Password reset link sent!");
      switchMode("login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };
  useEffect(() => {
    const detectCountry = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");

        const data = await res.json();

        if (data?.country_code) {
          setCountry(data.country_code.toLowerCase());
        }
      } catch (err) {
        console.error("Country detection failed", err);

        // fallback remains NG
        setCountry("ng");
      }
    };

    detectCountry();
  }, []);
  return (
    <>
      {/* MAIN AUTH MODAL */}
      <Modal isOpen={isOpen} onClose={handleClose}>
        <div className={styles.hero}>
          <div className={styles.logo}>M</div>

          <div className={styles.heroText}>
            <h2>
              {mode === "login"
                ? "Welcome back"
                : mode === "register"
                  ? "Create your account"
                  : "Reset password"}
            </h2>

            <p>
              {mode === "login"
                ? "Login to continue using MyTikLink"
                : mode === "register"
                  ? "Start building pages that convert"
                  : "We’ll send you a reset link"}
            </p>
          </div>
        </div>
        <div className={styles.container}>
          {/* GOOGLE LOGIN – ONLY FOR LOGIN SCREEN */}
          {mode === "login" && (
            <>
              <div className={styles.googleBtn} onClick={handleGoogleLogin}>
                <FcGoogle size={22} />
                <span>Login with Google</span>
              </div>

              <div className={styles.divider}>
                <span>or</span>
              </div>
            </>
          )}

          {/* GOOGLE LOGIN – ONLY FOR REGISTRATION SCREEN */}
          {mode === "register" && (
            <>
              <div className={styles.googleBtn} onClick={handleGoogleLogin}>
                <FcGoogle size={22} />
                <span>Register with Google</span>
              </div>

              <div className={styles.divider}>
                <span>or</span>
              </div>
            </>
          )}

          {/* REGISTER */}
          {mode === "register" && (
            <form className={styles.form} onSubmit={handleRegister}>
              <input
                className={styles.input}
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
              />

              <input
                className={styles.input}
                name="email"
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
              />
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  width: "100%",
                }}
              >
                <PhoneInput
                  country={country}
                  value={form.whatsappNumber}
                  onChange={(phone) =>
                    setForm((prev) => ({
                      ...prev,
                      whatsappNumber: phone,
                    }))
                  }
                  inputClass={styles.phoneInput}
                  containerClass={styles.phoneContainer}
                  buttonClass={styles.phoneButton}
                  enableSearch
                  enableAreaCodes
                  disableCountryCode={false}
                  countryCodeEditable={true}
                  placeholder="Enter WhatsApp Number"
                />
              </div>
              <div className={styles.passwordWrap}>
                <input
                  className={styles.input}
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                />

                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className={styles.termsWrap}>
                <label className={styles.termsLabel}>
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => {
                      setAcceptedTerms(e.target.checked);
                      if (e.target.checked) setTermsError("");
                    }}
                  />
                  <span>
                    By registering, you agree to our{" "}
                    <a
                      href="/terms"
                      className={styles.termsLink}
                      target="_blank"
                    >
                      Terms & Conditions
                    </a>{" "}
                    and{" "}
                    <a
                      href="/privacy"
                      className={styles.termsLink}
                      target="_blank"
                    >
                      Privacy Policy
                    </a>
                    .
                  </span>
                </label>

                {termsError && (
                  <p className={styles.termsError}>{termsError}</p>
                )}
              </div>

              <button className={styles.submitBtn} disabled={loading}>
                {loading ? "Signing up..." : "Sign Up"}
              </button>

              <div className={styles.switchAuth}>
                <p>
                  Already have an account?{" "}
                  <span
                    onClick={() => switchMode("login")}
                    className={styles.link}
                  >
                    Login
                  </span>
                </p>
              </div>
            </form>
          )}

          {/* LOGIN */}
          {mode === "login" && (
            <form className={styles.form} onSubmit={handleLogin}>
              <input
                className={styles.input}
                name="email"
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
              />

              <div className={styles.passwordWrap}>
                <input
                  className={styles.input}
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                />

                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <p className={styles.forgot} onClick={() => switchMode("forgot")}>
                Forgot password?
              </p>

              <button className={styles.submitBtn} disabled={loading}>
                {loading ? "Loading..." : "Login"}
              </button>

              <div className={styles.switchAuth}>
                <p>
                  Don’t have an account?{" "}
                  <span
                    onClick={() => switchMode("register")}
                    className={styles.link}
                  >
                    Sign up
                  </span>
                </p>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD */}
          {mode === "forgot" && (
            <form className={styles.form} onSubmit={handleForgot}>
              <input
                className={styles.input}
                name="email"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
              />

              <button className={styles.submitBtn} disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

              <div className={styles.switchAuth}>
                <p>
                  Remember your password?{" "}
                  <span
                    onClick={() => switchMode("login")}
                    className={styles.link}
                  >
                    Login
                  </span>
                </p>
              </div>
            </form>
          )}
        </div>
      </Modal>

      {/* VERIFY EMAIL MODAL */}
      {showVerify && (
        <VerifyEmailModal
          isOpen={showVerify}
          onClose={() => setShowVerify(false)}
          email={form.email}
          name={form.name}
          whatsappNumber={form.whatsappNumber}
          password={form.password}
          onVerified={completeRegistration}
        />
      )}
    </>
  );
}

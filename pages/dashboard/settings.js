"use client";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import SettingBottomSheet from "@/components/SettingBottomSheet";
import styles from "@/styles/Settings.module.css";
import UpgradeModal from "@/components/UpgradeModal";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Toast from "@/components/Toast";
import PlanChangeSheet from "@/components/PlanChangeSheet";

export default function Settings() {
  const router = useRouter();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const [autoRenew, setAutoRenew] = useState(true);
  const [user, setUser] = useState({
    name: "",
    email: "",
    plan: "",
  });
  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);

  const [nameValue, setNameValue] = useState("");
  const [emailValue, setEmailValue] = useState("");

  const [savingName, setSavingName] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);

  const [showEmailSheet, setShowEmailSheet] = useState(false);

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [sendingCode, setSendingCode] = useState(false);
  const [timer, setTimer] = useState(0);
  const [updating, setUpdating] = useState(false);

  const [toast, setToast] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [renewing, setRenewing] = useState(false);
  const [showPlanSheet, setShowPlanSheet] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // Helper function to get plan type from plan name
  const getPlanType = (plan) => {
    if (!plan) return "free";

    if (plan.includes("pro")) return "pro";
    if (plan.includes("standard")) return "standard";

    return "free";
  };

  // Get plan type for badge display
  const planType = getPlanType(user.plan);

  // Helper function to get billing cycle from plan name
  const getBillingCycle = (plan) => {
    if (!plan) return "";

    if (plan.includes("monthly")) return "Monthly";
    if (plan.includes("yearly")) return "Yearly";

    return "";
  };

  // Get billing cycle for display
  const billingCycle = getBillingCycle(user.plan);
  // Use effects
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/?auth=login");
          return;
        }

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/users/plan`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        setUser({
          name: res.data.name || "User",
          email: res.data.email || "No email",
          plan: res.data.plan || "free",
        });
      } catch (err) {
        console.error(err);
        router.push("/?auth=login");
      }
    };

    fetchUser();
  }, []);

  // Sync name/email values with user data when user is loaded or updated
  useEffect(() => {
    setNameValue(user.name || "");
    setEmailValue(user.email || "");
  }, [user]);

  // Timer for resend code
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);
  // ================= PASSWORD CHANGE HANDLERS =================
  const handleSendCode = async () => {
    if (timer > 0) return;

    try {
      setSendingCode(true);

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/send-password-code`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // ✅ Toast
      showToast("Code sent to your email", "success");

      // ✅ Start timer
      setTimer(120);
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to send code";

      showToast(message, "error");
    } finally {
      setSendingCode(false);
    }
  };

  // ================= EMAIL CHANGE HANDLERS =================
  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    try {
      setUpdating(true);

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/update-password-with-code`,
        {
          code,
          password: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      // Toast message and a the time it will be displayed for
      showToast("Password updated successfully", "success");
      setTimer(4);
      setCode("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.log("ERROR:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update password";

      showToast(message, "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleRenew = async () => {
    try {
      setRenewing(true);

      const token = localStorage.getItem("token");

      if (!user.plan || user.plan === "free") {
        showToast("Upgrade to a paid plan first", "error");
        return;
      }

      const cycle = user.plan.includes("yearly") ? "yearly" : "monthly";
      const plan = user.plan.includes("pro") ? "pro" : "standard";

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/initiate`,
        { plan, cycle },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // 🔥 redirect to Paystack
      window.location.href = res.data.authorizationUrl;
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to start payment";

      showToast(message, "error");
    } finally {
      setRenewing(false);
    }
  };
  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <div
            className={styles.backBtn}
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft size={18} />
          </div>

          <h1 className={styles.title}>Settings</h1>
        </div>

        <div className={styles.grid}>
          {/* ================= LEFT COLUMN ================= */}
          <div className={styles.left}>
            {/* ACCOUNT CARD */}
            <div className={styles.card}>
              <div className={styles.planTop}>
                <h3>Account</h3>

                {planType === "free" ? (
                  <span className={`${styles.planBadge} ${styles.freePlan}`}>
                    Free Plan
                  </span>
                ) : (
                  <span className={`${styles.planBadge} ${styles.activePlan}`}>
                    <CheckCircle size={14} />
                    Active: {planType === "pro" ? "Pro" : "Standard"} (
                    {billingCycle})
                  </span>
                )}
              </div>
              <div className={styles.userRow}>
                <img src="/user1.jpg" alt="" />
                <div>
                  <h4>{user.name}</h4>
                  <span>{user.email}</span>
                </div>
              </div>

              {/* PROFILE */}
              <div className={styles.field}>
                <label>Name</label>

                <div className={styles.inputRow}>
                  <input
                    ref={nameRef}
                    value={nameValue}
                    readOnly={!editingName}
                    onChange={(e) => setNameValue(e.target.value)}
                    className={editingName ? styles.activeInput : ""}
                  />

                  <button
                    disabled={savingName || (!editingName && false)}
                    onClick={async () => {
                      if (!editingName) {
                        setEditingName(true);

                        setTimeout(() => {
                          nameRef.current?.focus();
                        }, 50);
                        return;
                      }

                      // ONLY SAVE IF CHANGED
                      if (nameValue === user.name) return;

                      try {
                        setSavingName(true);

                        const token = localStorage.getItem("token");

                        await axios.put(
                          `${process.env.NEXT_PUBLIC_API_URL}/users/update-name`,
                          { name: nameValue },
                          {
                            headers: { Authorization: `Bearer ${token}` },
                          },
                        );

                        setUser((prev) => ({ ...prev, name: nameValue }));

                        setToast({ message: "Name changed", type: "success" });

                        setEditingName(false);
                      } catch (err) {
                        setToast({
                          message: "Failed to update name",
                          type: "error",
                        });
                      } finally {
                        setSavingName(false);
                      }
                    }}
                  >
                    {savingName
                      ? "..."
                      : editingName
                        ? nameValue !== user.name
                          ? "Save"
                          : "Saved"
                        : "Edit"}
                  </button>
                </div>
              </div>
              {/* EMAIL */}
              <div className={styles.field}>
                <label>Email</label>

                <div className={styles.inputRow}>
                  <input
                    ref={emailRef}
                    value={emailValue}
                    readOnly={!editingEmail}
                    onChange={(e) => setEmailValue(e.target.value)}
                    className={editingEmail ? styles.activeInput : ""}
                  />

                  <button
                    onClick={() => {
                      if (!editingEmail) {
                        setEditingEmail(true);

                        setTimeout(() => {
                          emailRef.current?.focus();
                        }, 50);
                        return;
                      }

                      if (emailValue === user.email) return;

                      // 🔥 OPEN BOTTOM SHEET INSTEAD OF SAVING
                      setShowEmailSheet(true);
                    }}
                  >
                    {editingEmail
                      ? emailValue !== user.email
                        ? "Save"
                        : "Saved"
                      : "Edit"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* BILLING */}
          <div className={styles.right}>
            <div className={styles.card}>
              <h3>Billing</h3>

              <div className={styles.planBox}>
                <div className={styles.planInfo2}>
                  <h4>{user.plan}</h4>
                  <p>You are currently on this plan</p>
                  <span className={styles.expire}>
                    Expires {formatDate(user.planExpiry)}
                  </span>
                </div>

                <div className={styles.checkIcon}>✓</div>
              </div>

              <div className={styles.actions}>
                <button
                  className={styles.outlineBtn}
                  onClick={() => {
                    if (user.plan === "free") {
                      setShowUpgrade(true); // 👈 open UpgradeModal
                    } else {
                      setShowPlanSheet(true);
                    }
                  }}
                >
                  Change plan
                </button>

                <button
                  className={`${styles.primaryBtn} ${
                    renewing ? styles.disabledBtn : ""
                  }`}
                  onClick={handleRenew}
                  disabled={renewing}
                >
                  {renewing ? "Processing..." : "Renew"}
                </button>
              </div>
            </div>
          </div>
          {/* ================= RIGHT COLUMN ================= */}
          <div className={styles.right}>
            {/* PASSWORD BIG */}
            <div className={styles.card}>
              <h3>Password</h3>
              <p className={styles.sub}>
                To change your password, verify your email first.
              </p>

              <div className={styles.inputRow}>
                <input
                  value={user.email}
                  readOnly
                  className={styles.readonlyInput}
                />

                <button
                  onClick={handleSendCode}
                  disabled={timer > 0 || sendingCode}
                >
                  {timer > 0 ? `(${timer}s)` : "Send Code"}
                </button>
              </div>

              <div className={styles.inputRow}>
                <input
                  placeholder="Enter code"
                  value={code}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val.length <= 4) setCode(val);
                  }}
                />
              </div>
              <div className={styles.inputRow}>
                <input
                  className={styles.fullInput}
                  placeholder="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className={styles.inputRow}>
                <input
                  className={styles.fullInput}
                  placeholder="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <button
                className={`${styles.primaryBtn} ${
                  !code || !newPassword || !confirmPassword || updating
                    ? styles.disabledBtn
                    : ""
                }`}
                disabled={!code || !newPassword || !confirmPassword || updating}
                onClick={handleUpdatePassword}
              >
                {updating ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
          {/* AUTO RENEW */}
          <div className={styles.right}>
            <div className={styles.card}>
              <div className={styles.switchRow}>
                <div>
                  <h3>Auto-Renewal (Coming Soon)</h3>
                  <p>
                    Automatically renew your plan monthly by adding a payment
                    method below.
                  </p>
                </div>

                <div
                  className={`${styles.switch} ${
                    autoRenew ? styles.active : ""
                  }`}
                  onClick={() => setAutoRenew(!autoRenew)}
                >
                  <div className={styles.circle}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showEmailSheet && (
        <SettingBottomSheet
          email={emailValue}
          onClose={() => setShowEmailSheet(false)}
          onSuccess={(newEmail) => {
            setUser((prev) => ({ ...prev, email: newEmail }));

            setToast({
              message: "Email change successful",
              type: "success",
            });

            setShowEmailSheet(false);
            setEditingEmail(false);
          }}
        />
      )}
      {showUpgrade && (
        <UpgradeModal
          currentPlan={user.plan}
          setShowModal={setShowUpgrade}
          onUpgrade={(newPlan) => {
            setUser((prev) => ({ ...prev, plan: newPlan }));
            showToast("Plan updated successfully", "success");
          }}
        />
      )}
      {showPlanSheet && (
        <PlanChangeSheet
          currentPlan={user.plan}
          onClose={() => setShowPlanSheet(false)}
          onSuccess={(newPlan) => {
            setUser((prev) => ({ ...prev, plan: newPlan }));
            showToast("Plan updated", "success");
          }}
        />
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

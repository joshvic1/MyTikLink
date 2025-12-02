"use client";

import { useState, useEffect } from "react";
import { X, ChevronRight } from "lucide-react";

import Modal from "@/components/admin/ui/Modal";
import styles from "@/styles/admin/userDetailsDrawer.module.css";

export default function UserDetailsDrawer({ user, onClose }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [links, setLinks] = useState([]);
  const [payments, setPayments] = useState([]);

  // MODAL STATES
  const [openEdit, setOpenEdit] = useState(false);
  const [openPlan, setOpenPlan] = useState(false);
  const [openBan, setOpenBan] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  async function fetchData() {
    const token = localStorage.getItem("admin_token");

    // Fetch links
    const linkRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/user-links/${user._id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const linkData = await linkRes.json();
    setLinks(linkData.links || []);

    // Fetch payments
    const payRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/payments/${user._id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const payData = await payRes.json();
    setPayments(payData.payments || []);
  }

  if (!user) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.drawer}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={22} />
        </button>

        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.avatar}>
            {(user.name || user.email).charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 className={styles.name}>{user.name || "Unnamed User"}</h2>
            <p className={styles.email}>{user.email}</p>
            <span className={`${styles.planBadge} ${styles[user.plan]}`}>
              {user.plan}
            </span>
          </div>
        </div>

        {/* TABS */}
        <div className={styles.tabs}>
          {["overview", "links", "payments", "actions"].map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${
                activeTab === tab ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* ================= TAB CONTENT ================= */}

        <div className={styles.content}>
          {/* Overview */}
          {activeTab === "overview" && (
            <div className={styles.card}>
              <h3>Account Overview</h3>
              <p>
                <b>Joined:</b> {new Date(user.createdAt).toLocaleString()}
              </p>
              <p>
                <b>Total Redirects Allowed:</b> {user.totalRedirectsAllowed}
              </p>
              <p>
                <b>Total Links:</b> {links.length}
              </p>
            </div>
          )}

          {/* Links */}
          {activeTab === "links" && (
            <div className={styles.card}>
              <h3>User Links</h3>

              {links.length === 0 ? (
                <p className={styles.empty}>No links found</p>
              ) : (
                links.map((l) => (
                  <div key={l._id} className={styles.row}>
                    <div>
                      <span className={styles.rowTitle}>{l.title}</span>
                      <p className={styles.rowSub}>
                        {new Date(l.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className={styles.rightInfo}>
                      <span className={styles.views}>{l.clicks} views</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Payments */}
          {activeTab === "payments" && (
            <div className={styles.card}>
              <h3>Payment History</h3>

              {payments.length === 0 ? (
                <p className={styles.empty}>No payments</p>
              ) : (
                payments.map((p) => (
                  <div key={p._id} className={styles.row}>
                    <div>
                      <span className={styles.rowTitle}>
                        ₦{p.amount.toLocaleString()}
                      </span>
                      <p className={styles.rowSub}>
                        {new Date(p.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <span className={`${styles.status} ${styles[p.status]}`}>
                      {p.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Admin Actions */}
          {activeTab === "actions" && (
            <div className={styles.card}>
              <h3>Admin Actions</h3>

              <button
                className={styles.actionBtn}
                onClick={() => setOpenEdit(true)}
              >
                Edit User
              </button>

              <button
                className={styles.actionBtn}
                onClick={() => setOpenPlan(true)}
              >
                Change Plan
              </button>

              <button
                className={styles.actionBtn}
                onClick={() => setOpenBan(true)}
              >
                Ban User
              </button>

              <button
                className={styles.deleteBtn}
                onClick={() => setOpenDelete(true)}
              >
                Delete User
              </button>
            </div>
          )}
        </div>

        {/* ================= MODALS ================= */}

        {/* Edit User */}
        <Modal
          open={openEdit}
          onClose={() => setOpenEdit(false)}
          title="Edit User"
        >
          <EditUserForm user={user} onClose={() => setOpenEdit(false)} />
        </Modal>

        {/* Change Plan */}
        <Modal
          open={openPlan}
          onClose={() => setOpenPlan(false)}
          title="Change Plan"
        >
          <ChangePlanForm user={user} onClose={() => setOpenPlan(false)} />
        </Modal>

        {/* Ban User */}
        <Modal
          open={openBan}
          onClose={() => setOpenBan(false)}
          title="Ban User"
        >
          <BanUserForm user={user} onClose={() => setOpenBan(false)} />
        </Modal>

        {/* Delete User */}
        <Modal
          open={openDelete}
          onClose={() => setOpenDelete(false)}
          title="Delete User"
        >
          <DeleteUserForm user={user} onClose={() => setOpenDelete(false)} />
        </Modal>
      </div>
    </div>
  );
}

/* ========================================================= */
/* =============   INLINE FORM COMPONENTS   ================= */
/* ========================================================= */

function EditUserForm({ user, onClose }) {
  const [form, setForm] = useState({
    name: user.name || "",
    email: user.email || "",
    totalRedirectsAllowed: user.totalRedirectsAllowed || 0,
  });

  const token = localStorage.getItem("admin_token");

  const save = async () => {
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/update-user/${user._id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      }
    );

    onClose();
    window.location.reload();
  };

  return (
    <div>
      <label>Name</label>
      <input
        className={styles.input}
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <label>Email</label>
      <input
        className={styles.input}
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <label>Total Redirects Allowed</label>
      <input
        type="number"
        className={styles.input}
        value={form.totalRedirectsAllowed}
        onChange={(e) =>
          setForm({ ...form, totalRedirectsAllowed: Number(e.target.value) })
        }
      />

      <button className={styles.saveBtn} onClick={save}>
        Save Changes
      </button>
    </div>
  );
}

function ChangePlanForm({ user, onClose }) {
  const plans = [
    "free",
    "standard_monthly",
    "pro_monthly",
    "standard_yearly",
    "pro_yearly",
  ];

  const [plan, setPlan] = useState(user.plan);
  const [expiry, setExpiry] = useState(
    user.planExpiry ? user.planExpiry.split("T")[0] : ""
  );

  const token = localStorage.getItem("admin_token");

  const applyPlan = async () => {
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/change-plan/${user._id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan,
          planExpiry: expiry || null,
        }),
      }
    );

    onClose();
    window.location.reload();
  };

  return (
    <div>
      <label>Plan</label>
      <select
        className={styles.input}
        value={plan}
        onChange={(e) => setPlan(e.target.value)}
      >
        {plans.map((p) => (
          <option key={p}>{p}</option>
        ))}
      </select>

      <label>Expiry Date (optional)</label>
      <input
        className={styles.input}
        type="date"
        value={expiry}
        onChange={(e) => setExpiry(e.target.value)}
      />

      <button className={styles.saveBtn} onClick={applyPlan}>
        Apply Plan
      </button>
    </div>
  );
}

function BanUserForm({ user, onClose }) {
  const [reason, setReason] = useState("");
  const token = localStorage.getItem("admin_token");

  const ban = async () => {
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/ban-user/${user._id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      }
    );

    onClose();
    window.location.reload();
  };

  return (
    <div>
      <label>Reason</label>
      <textarea
        className={styles.input}
        rows={3}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />

      <button className={styles.saveBtn} onClick={ban}>
        Ban User
      </button>
    </div>
  );
}

function DeleteUserForm({ user, onClose }) {
  const token = localStorage.getItem("admin_token");

  const removeUser = async () => {
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/delete-user/${user._id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    onClose();
    window.location.reload();
  };

  return (
    <div>
      <p>
        Are you sure you want to <strong>delete</strong> this user? This action
        is permanent and cannot be undone.
      </p>

      <button className={styles.deleteBtn} onClick={removeUser}>
        Yes, Delete Permanently
      </button>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import AdminDashboardLayout from "@/components/admin/AdminLayout";
import UserTable from "@/components/admin/UserTable";
import styles from "@/styles/admin/users.module.css";
import UserDetailsDrawer from "@/components/admin/UserDetailsDrawer";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);

  const openDrawer = (user) => {
    setSelectedUser(user);
    setShowDrawer(true);
  };

  const closeDrawer = () => setShowDrawer(false);

  useEffect(() => {
    fetchUsers();
  }, [page, search, planFilter, sort, dateFrom, dateTo]);

  async function fetchUsers() {
    try {
      setLoading(true);

      const token = localStorage.getItem("admin_token");

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users`,
        {
          params: {
            page,
            limit: 20,
            search,
            plan: planFilter,
            sort,
            dateFrom,
            dateTo,
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUsers(res.data.users || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminDashboardLayout>
      <div className={styles.pageWrap}>
        <h2 className={styles.pageTitle}>Users</h2>

        {/* Filters */}
        <div className={styles.filters}>
          <input
            type="text"
            placeholder="Search name/email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.input}
          />

          <select
            className={styles.input}
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
          >
            <option value="all">All Plans</option>
            <option value="free">Free</option>
            <option value="standard_monthly">Standard Monthly</option>
            <option value="pro_monthly">Pro Monthly</option>
            <option value="standard_yearly">Standard Yearly</option>
            <option value="pro_yearly">Pro Yearly</option>
          </select>

          <select
            className={styles.input}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
          </select>

          <input
            type="date"
            className={styles.input}
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />

          <input
            type="date"
            className={styles.input}
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        {/* Users Table */}
        {loading ? (
          <p className={styles.loading}>Loading users...</p>
        ) : (
          <>
            <UserTable users={users} onOpen={openDrawer} />

            <div className={styles.paginationWrap}>
              <button
                className={styles.navBtn}
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                ← Prev
              </button>

              <span className={styles.pageIndicator}>
                Page {page} of {totalPages}
              </span>

              <button
                className={styles.navBtn}
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>
      {showDrawer && selectedUser && (
        <UserDetailsDrawer user={selectedUser} onClose={closeDrawer} />
      )}
    </AdminDashboardLayout>
  );
}

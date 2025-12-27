"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import AdminDashboardLayout from "@/components/admin/AdminLayout";
import styles from "@/styles/admin/links.module.css";
import AdminLinkTable from "@/components/admin/AdminLinkTable";
import LinkDetailsDrawer from "@/components/admin/LinkDetailsDrawer";
import UserEmailModal from "@/components/admin/UserEmailModal";

export default function AdminLinksPage() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("newest");

  const [selectedLink, setSelectedLink] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);

  // 🔹 NEW (EMAIL MODAL)
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const [totalLinks, setTotalLinks] = useState(0);

  const openDrawer = (link) => {
    setSelectedLink(link);
    setShowDrawer(true);
  };

  const closeDrawer = () => setShowDrawer(false);

  // 🔹 NEW
  const openEmailModal = (user) => {
    setSelectedUser(user);
    setShowEmailModal(true);
  };

  const closeEmailModal = () => {
    setSelectedUser(null);
    setShowEmailModal(false);
  };

  useEffect(() => {
    fetchLinks();
  }, [page, search, type, sort]);

  async function fetchLinks() {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/links`,
        {
          params: { page, limit: 20, search, type, sort },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setLinks(res.data.links || []);
      setTotalLinks(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Fetch links error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminDashboardLayout>
      <div className={styles.pageWrap}>
        <h2 className={styles.pageTitle}>
          Links <span className={styles.count}>({totalLinks})</span>
        </h2>

        {/* Filters */}
        <div className={styles.filters}>
          <input
            type="text"
            placeholder="Search title / linkId..."
            className={styles.input}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className={styles.input}
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="group">Group</option>
            <option value="dm">DM</option>
          </select>

          <select
            className={styles.input}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="most_clicks">Most Clicks</option>
            <option value="least_clicks">Least Clicks</option>
          </select>
        </div>

        {loading ? (
          <p className={styles.loading}>Loading links...</p>
        ) : (
          <>
            <AdminLinkTable
              links={links}
              onOpen={openDrawer}
              onEmail={openEmailModal} // 🔹 NEW
            />

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

        {showDrawer && selectedLink && (
          <LinkDetailsDrawer link={selectedLink} onClose={closeDrawer} />
        )}

        {/* 🔹 EMAIL MODAL */}
        {showEmailModal && selectedUser && (
          <UserEmailModal user={selectedUser} onClose={closeEmailModal} />
        )}
      </div>
    </AdminDashboardLayout>
  );
}

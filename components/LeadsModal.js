"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { X, MessageCircle } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import styles from "@/styles/leadsModal.module.css";

const PER_PAGE = 10;

export default function LeadsModal({ page, onClose }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);

  useEffect(() => {
    if (!page?._id) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Session expired");
      setLoading(false);
      return;
    }

    const fetchLeads = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/pages/${page._id}/leads`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setLeads(res.data);
      } catch (err) {
        console.error("Fetch leads error:", err);
        toast.error("Failed to load leads");
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [page?._id]);

  const totalPages = Math.ceil(leads.length / PER_PAGE);
  const start = (pageIndex - 1) * PER_PAGE;
  const visibleLeads = leads.slice(start, start + PER_PAGE);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className={styles.header}>
          <h3 className={styles.title}>
            {page.title} - Leads ({leads.length})
          </h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <X />
          </button>
        </div>

        {/* BODY */}
        <div className={styles.body}>
          {loading ? (
            <p className={styles.stateText}>Loading leads...</p>
          ) : visibleLeads.length === 0 ? (
            <p className={styles.stateText}>No leads yet.</p>
          ) : (
            <div className={styles.scrollArea}>
              <ul className={styles.list}>
                {visibleLeads.map((lead) => (
                  <li key={lead._id} className={styles.item}>
                    <div className={styles.leadInfo}>
                      <strong>{lead.name}</strong>
                      <span>{lead.whatsapp}</span>
                    </div>

                    <div className={styles.leadActions}>
                      <a
                        href={`https://wa.me/${lead.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.whatsappBtn}
                        title="Chat on WhatsApp"
                      >
                        <FaWhatsapp />
                      </a>

                      <small>{new Date(lead.createdAt).toLocaleString()}</small>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* FOOTER */}
        {totalPages > 1 && (
          <div className={styles.footer}>
            <button
              disabled={pageIndex === 1}
              onClick={() => setPageIndex((p) => p - 1)}
            >
              Prev
            </button>

            <span>
              Page {pageIndex} of {totalPages}
            </span>

            <button
              disabled={pageIndex === totalPages}
              onClick={() => setPageIndex((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

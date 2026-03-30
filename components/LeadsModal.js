"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { X, MessageCircle, Download } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import styles from "@/styles/leadsModal.module.css";
import { parsePhoneNumberFromString } from "libphonenumber-js";

const PER_PAGE = 10;

export default function LeadsModal({ page, onClose }) {
  const [leads, setLeads] = useState([]);
  const [mode, setMode] = useState("all"); // "all" | "custom"
  const [dateError, setDateError] = useState("");

  const downloadCSV = (data) => {
    if (!data.length) {
      toast.error("No leads to download");
      return;
    }

    const headers = ["Name", "WhatsApp", "Date"];

    const rows = data.map((lead) => [
      lead.name,
      lead.whatsapp,
      new Date(lead.createdAt).toLocaleString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);

    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leads_${page.title}.csv`);
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
  };

  const handleDownload = () => {
    setDateError("");

    if (mode === "all") {
      downloadCSV(leads);
      setShowDownloadModal(false);
      return;
    }

    // CUSTOM MODE
    if (!startDate || !endDate) {
      setDateError("Please select both start and end date");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const filtered = leads.filter((lead) => {
      const d = new Date(lead.createdAt);
      return d >= start && d <= end;
    });

    if (!filtered.length) {
      toast.error("No leads found in selected range");
      return;
    }

    downloadCSV(filtered);
    setShowDownloadModal(false);
  };
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

  function formatWhatsAppNumber(number) {
    try {
      const phone = parsePhoneNumberFromString(number, "NG");

      if (phone && phone.isValid()) {
        return phone.number.replace("+", ""); // remove +
      }

      return number.replace(/\D/g, "");
    } catch {
      return number.replace(/\D/g, "");
    }
  }
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.titleWrap}>
            <h3 className={styles.title}>{page.title} - Leads</h3>
            <span className={styles.count}>{leads.length} collected</span>
          </div>

          <div className={styles.headerActions}>
            <button
              className={styles.downloadBtn}
              onClick={() => setShowDownloadModal(true)}
            >
              <Download size={14} />
            </button>

            <button className={styles.closeBtn} onClick={onClose}>
              <X />
            </button>
          </div>
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
                {visibleLeads.map((lead) => {
                  const number = formatWhatsAppNumber(lead.whatsapp);

                  return (
                    <li key={lead._id} className={styles.item}>
                      <div className={styles.leadInfo}>
                        <strong>{lead.name}</strong>
                        <span>{lead.whatsapp}</span>
                      </div>

                      <div className={styles.leadActions}>
                        <a
                          href={`https://api.whatsapp.com/send?phone=${number}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.whatsappBtn}
                        >
                          <FaWhatsapp />
                        </a>

                        <small>
                          {new Date(lead.createdAt).toLocaleString()}
                        </small>
                      </div>
                    </li>
                  );
                })}
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
        {showDownloadModal && (
          <div className={styles.backdrop}>
            <div className={styles.modal} style={{ maxWidth: "420px" }}>
              <div className={styles.exportWrap}>
                <h3 className={styles.exportTitle}>Export Leads</h3>

                {/* OPTIONS */}
                <div className={styles.radioGroup}>
                  {/* ALL */}
                  <label className={styles.radioItem}>
                    <input
                      type="radio"
                      name="export"
                      value="all"
                      checked={mode === "all"}
                      onChange={() => setMode("all")}
                    />
                    <span>
                      Download all leads
                      <small>{leads.length} entries</small>
                    </span>
                  </label>

                  {/* CUSTOM */}
                  <label className={styles.radioItem}>
                    <input
                      type="radio"
                      name="export"
                      value="custom"
                      checked={mode === "custom"}
                      onChange={() => setMode("custom")}
                    />
                    <span>Custom range</span>
                  </label>

                  {/* CONDITIONAL DATE */}
                  {mode === "custom" && (
                    <div className={styles.dateSection}>
                      <p className={styles.helperText}>
                        Select the period you want to export
                      </p>

                      <div className={styles.dateColumn}>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => {
                            setStartDate(e.target.value);
                            setDateError("");
                          }}
                        />

                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => {
                            setEndDate(e.target.value);
                            setDateError("");
                          }}
                        />
                      </div>

                      {dateError && (
                        <span className={styles.errorText}>{dateError}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* ACTIONS */}
                <div className={styles.actionsRow}>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => setShowDownloadModal(false)}
                  >
                    Cancel
                  </button>

                  <button
                    className={styles.downloadBtn}
                    onClick={handleDownload}
                  >
                    Download Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

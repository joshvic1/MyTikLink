"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import styles from "@/styles/RedirectList.module.css";

export default function RedirectList({ redirects, onUpdate }) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this link?")) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/redirects/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to delete redirect");

      toast.success("Redirect deleted successfully!");
      onUpdate(); // refresh redirects list
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className={styles.listContainer}>
      {redirects.length === 0 ? (
        <p className={styles.empty}>No redirects created yet.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Link</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {redirects.map((r) => (
              <tr key={r._id}>
                <td>{r.name}</td>
                <td>
                  <a href={r.url} target="_blank" rel="noopener noreferrer">
                    {r.url}
                  </a>
                </td>
                <td>
                  <button
                    className={styles.copyBtn}
                    onClick={() => handleCopy(r.url, r._id)}
                  >
                    {copiedId === r._id ? "Copied" : "Copy"}
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(r._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import styles from "@/styles/publicPage.module.css";

export default function PublicPage() {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const pageId =
    typeof window !== "undefined"
      ? window.location.pathname.split("/").pop()
      : null;

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/pages/public/${pageId}`
        );
        setPage(res.data);
      } catch (err) {
        setPage(null);
      } finally {
        setLoading(false);
      }
    };

    if (pageId) fetchPage();
  }, []);

  if (loading) return null;
  if (!page) return <h2 style={{ textAlign: "center" }}>Page not found</h2>;

  return (
    <PageRenderer
      page={page}
      submitted={submitted}
      onSubmitted={() => setSubmitted(true)}
    />
  );
}

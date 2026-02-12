"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import styles from "@/styles/publicPage.module.css";
import { useRouter } from "next/navigation";

export default function PublicPage() {
  const router = useRouter();
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
          `${process.env.NEXT_PUBLIC_API_URL}/pages/public/${pageId}`,
        );

        if (res.data?.expired) {
          setPage({ expired: true });
          return;
        }

        setPage(res.data);
      } catch (err) {
        console.error("Public page error:", err);
        setPage(null);
      } finally {
        setLoading(false);
      }
    };

    if (pageId) fetchPage();
  }, [pageId]);

  if (loading) return null;
  if (!page) return <h2 style={{ textAlign: "center" }}>Page not found</h2>;

  if (page.expired) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          textAlign: "center",
        }}
      >
        <h2>⚠️ This Page Is No Longer Available</h2>
        <p>The owner's subscription has expired.</p>
      </div>
    );
  }

  return (
    <PageRenderer
      page={page}
      submitted={submitted}
      onSubmitted={() => setSubmitted(true)}
    />
  );
}

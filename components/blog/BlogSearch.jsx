"use client";

import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { searchBlogPosts } from "@/utils/blogApi";
import styles from "./Blog.module.css";

export default function BlogSearch({ embedded = false }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    const close = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) {
        setActive(false);
        setResults([]);
      }
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    const q = query.trim();

    if (q.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await searchBlogPosts(q);
        setResults(data.posts || []);
      } catch (err) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div
      className={`${styles.searchBox} ${embedded ? styles.embeddedSearch : ""}`}
      ref={boxRef}
    >
      <div className={styles.searchInputWrap}>
        <Search size={15} />
        <input
          value={query}
          placeholder="Search for an article..."
          onFocus={() => setActive(true)}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {active && (query.trim().length >= 2 || loading) && (
        <div className={styles.searchPanel}>
          <div className={styles.searchResults}>
            {loading && <p>Searching...</p>}

            {!loading && query.trim().length >= 2 && !results.length && (
              <p>No matching posts</p>
            )}

            {results.map((post) => (
              <Link
                key={post._id || post.slug}
                href={`/blog/${post.slug}`}
                onClick={() => {
                  setActive(false);
                  setResults([]);
                }}
              >
                <strong>{post.title}</strong>
                <span>{post.excerpt}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

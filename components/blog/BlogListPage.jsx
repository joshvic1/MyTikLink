"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  CreditCard,
  DollarSign,
  Lightbulb,
  Link as LinkIcon,
  LayoutDashboard,
  Newspaper,
  ShoppingBag,
  Sparkles,
  Zap,
} from "lucide-react";
import { useRouter } from "next/router";
import BlogCard from "./BlogCard";
import BlogLayout from "./BlogLayout";
import BlogSearch from "./BlogSearch";
import { getBlogPosts } from "@/utils/blogApi";
import styles from "./Blog.module.css";
import Footer from "../Footer/Footer";

const categories = [
  { label: "All", icon: Sparkles },
  { label: "Link in bio", icon: LinkIcon },
  { label: "Payment", icon: CreditCard },
  { label: "Landing page", icon: LayoutDashboard },
  { label: "Online store", icon: ShoppingBag },
  { label: "Creator tool", icon: Zap },
  { label: "Business ideas", icon: Lightbulb },
  { label: "Make money", icon: DollarSign },
];

export default function BlogListPage({
  initialPosts = [],
  initialHasMore = false,
}) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(!initialPosts.length);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    if (initialPosts.length) return;

    loadPosts(1, false, activeCategory);
  }, []);

  const loadPosts = async (
    pageNumber,
    append = false,
    category = activeCategory,
  ) => {
    try {
      const data = await getBlogPosts({
        page: pageNumber,
        limit: 10,
        category,
      });
      setPosts((current) =>
        append ? [...current, ...(data.posts || [])] : data.posts || [],
      );
      setHasMore(Boolean(data.hasMore));
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    await loadPosts(nextPage, true, activeCategory);
    setPage(nextPage);
  };

  const selectCategory = async (category) => {
    setActiveCategory(category);
    setPage(1);
    setLoading(true);
    await loadPosts(1, false, category);
  };

  const featuredPost = posts[0];
  const latestPosts = posts.slice(1);

  return (
    <>
      <BlogLayout
        crumb={[{ label: "Blog" }]}
        showBreadcrumb={false}
        showSearch={false}
        showNav={false}
      >
        <section className={styles.blogHero}>
          <div className={styles.heroTop}>
            <button
              type="button"
              className={styles.backButton}
              aria-label="Go back"
              onClick={() => router.back()}
            >
              <ArrowLeft size={16} />
            </button>
            <span className={styles.eyebrow}>OUR BLOG</span>
          </div>
          <h1>Documentation & Helpful guides for using Mytiklink.</h1>
          <p>
            Practical lessons on pages, payments, stores, creator tools, and the
            small workflows that help your links do more.
          </p>
        </section>
        <div className={styles.searchRow}>
          <BlogSearch embedded />
        </div>
        <section className={styles.articleToolbar}>
          <div className={styles.sectionTitle}>
            <h2>Browse Category</h2>
            <button type="button">See All</button>
          </div>

          <div className={styles.topicChips} aria-label="Blog topics">
            {categories.map((category) => {
              const Icon = category.icon;

              return (
                <button
                  type="button"
                  key={category.label}
                  className={
                    activeCategory === category.label ? styles.activeChip : ""
                  }
                  onClick={() => selectCategory(category.label)}
                >
                  <Icon size={13} />
                  {category.label}
                </button>
              );
            })}
          </div>
        </section>

        {loading && <div className={styles.state}>Loading blog posts...</div>}

        {!loading && !posts.length && (
          <section className={styles.emptyState}>
            <Newspaper size={32} />
            <h2>No posts yet</h2>
            <p>Published blog posts will appear here.</p>
          </section>
        )}

        {!loading && featuredPost && (
          <section className={styles.featuredSection}>
            <div className={styles.sectionTitle}>
              <h2>Featured Article</h2>
            </div>
            <BlogCard post={featuredPost} featured />
          </section>
        )}

        {!loading && latestPosts.length > 0 && (
          <section className={styles.latestSection}>
            <div className={styles.articleHeading}>
              <h2>Latest News</h2>
              <button type="button">
                Latest First
                <ChevronDown size={15} />
              </button>
            </div>

            <div className={styles.postsGrid}>
              {latestPosts.map((post) => (
                <BlogCard key={post._id || post.slug} post={post} />
              ))}
            </div>
          </section>
        )}

        {hasMore && (
          <button
            type="button"
            className={styles.loadMore}
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        )}
      </BlogLayout>
      <Footer />
    </>
  );
}

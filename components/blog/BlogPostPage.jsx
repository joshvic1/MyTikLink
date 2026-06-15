import { ArrowLeft, CalendarDays } from "lucide-react";
import { useRouter } from "next/router";
import BlogLayout from "./BlogLayout";
import styles from "./Blog.module.css";
import Footer from "../Footer/Footer";
import BlogCard from "./BlogCard";
function formatDate(date) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function extractYoutubeId(url = "") {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
  );

  return match?.[1] || url;
}

function renderBlock(block, index) {
  if (block.type === "heading") {
    return <h2 key={index}>{block.value}</h2>;
  }

  if (block.type === "image") {
    return (
      <figure key={index}>
        <img src={block.url} alt={block.caption || ""} />
        {block.caption && <figcaption>{block.caption}</figcaption>}
      </figure>
    );
  }

  if (block.type === "youtube") {
    const embed = block.url.includes("embed")
      ? block.url
      : `https://www.youtube.com/embed/${extractYoutubeId(block.url)}`;

    return (
      <div className={styles.videoFrame} key={index}>
        <iframe
          src={embed}
          title={block.title || "YouTube video"}
          allowFullScreen
        />
      </div>
    );
  }

  return <p key={index}>{block.value}</p>;
}

export default function BlogPostPage({ post, relatedPosts = [] }) {
  const router = useRouter();

  if (!post) {
    return (
      <BlogLayout showNav={false} showSearch={false}>
        <section className={styles.emptyState}>
          <h1>Post not found</h1>
        </section>
      </BlogLayout>
    );
  }

  return (
    <>
      <BlogLayout showNav={false} showSearch={false}>
        <article className={styles.articlePage}>
          <section className={styles.articleHero}>
            <button className={styles.backButton} onClick={() => router.back()}>
              <ArrowLeft size={18} />
            </button>

            {post.category && (
              <span className={styles.articleCategory}>{post.category}</span>
            )}

            <h1>{post.title}</h1>

            {/* <div className={styles.articleMeta}>
            <CalendarDays size={14} />
            {formatDate(post.publishedAt || post.createdAt)}
          </div> */}
          </section>

          <img
            className={styles.articleCover}
            src={post.coverImage?.url || post.image || "/placeholder.png"}
            alt=""
          />

          <section className={styles.articleContent}>
            {(post.blocks || []).map(renderBlock)}
          </section>
          {relatedPosts.length > 0 && (
            <section className={styles.relatedPosts}>
              <h2>Related Posts</h2>
              <div className={styles.relatedGrid}>
                {relatedPosts.map((item) => (
                  <BlogCard key={item._id || item.slug} post={item} />
                ))}
              </div>
            </section>
          )}
          {post.keywords?.length > 0 && (
            <div className={styles.tinyKeywordList}>
              {post.keywords.map((keyword) => (
                <span key={keyword}>{keyword}</span>
              ))}
            </div>
          )}
        </article>
      </BlogLayout>
      <Footer />
    </>
  );
}

import Link from "next/link";
import { ArrowRight, CalendarDays, UserRound } from "lucide-react";
import styles from "./Blog.module.css";

const fallbackImage = "/placeholder.png";

function formatDate(date) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogCard({ post, featured = false }) {
  return (
    <article
      className={`${styles.postCard} ${featured ? styles.featuredCard : ""}`}
    >
      <Link href={`/blog/${post.slug}`} className={styles.postImage}>
        <img src={post.coverImage?.url || post.image || fallbackImage} alt="" />
      </Link>

      <div className={styles.postBody}>
        {/* <div className={styles.postMeta}>
          {post.category && <span>{post.category}</span>}
          <span>
            <CalendarDays size={14} />
            {formatDate(post.publishedAt || post.createdAt)}
          </span>
          <span>
            <UserRound size={14} />
            {post.authorName || "MyTikLink Team"}
          </span>
        </div> */}

        <Link href={`/blog/${post.slug}`} className={styles.postTitle}>
          {post.title}
        </Link>

        <p>{post.excerpt}</p>

        <Link href={`/blog/${post.slug}`} className={styles.readMore}>
          Read more
          <ArrowRight size={15} />
        </Link>
      </div>
    </article>
  );
}

import BlogBreadcrumb from "./BlogBreadcrumb";
import BlogNav from "./BlogNav";
import BlogSearch from "./BlogSearch";
import styles from "./Blog.module.css";

export default function BlogLayout({
  children,
  crumb,
  current = "Blog",
  showBreadcrumb = true,
  showSearch = true,
  showNav = true,
}) {
  return (
    <main className={styles.blogShell}>
      {showNav && <BlogNav current={current} />}

      {(showBreadcrumb || showSearch) && (
        <div className={styles.topTools}>
          {showBreadcrumb && <BlogBreadcrumb items={crumb} />}
          {showSearch && <BlogSearch />}
        </div>
      )}

      {children}
    </main>
  );
}

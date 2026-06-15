import Head from "next/head";
import BlogPostPage from "@/components/Blog/BlogPostPage";
import { getBlogPost, getBlogPosts } from "@/utils/blogApi";

export default function BlogSlugPage({ post, relatedPosts = [] }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mytiklink.com";
  const url = `${siteUrl}/blog/${post.slug}`;
  const title = `${post.title} | MyTikLink Blog`;
  const image = post.coverImage?.url || `${siteUrl}/placeholder.png`;
  const published = post.publishedAt || post.createdAt;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={post.excerpt} />
        <meta
          name="keywords"
          content={[post.category, ...(post.keywords || [])]
            .filter(Boolean)
            .join(", ")}
        />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={image} />
        <meta property="article:published_time" content={published} />
        <meta property="article:author" content={post.authorName} />
        {post.category && (
          <meta property="article:section" content={post.category} />
        )}
        {(post.keywords || []).map((keyword) => (
          <meta key={keyword} property="article:tag" content={keyword} />
        ))}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        <meta name="twitter:image" content={image} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: post.title,
              description: post.excerpt,
              image,
              datePublished: published,
              dateModified: post.updatedAt || published,
              author: {
                "@type": "Person",
                name: post.authorName || "MyTikLink Team",
              },
              publisher: {
                "@type": "Organization",
                name: "MyTikLink",
              },
              keywords: [post.category, ...(post.keywords || [])]
                .filter(Boolean)
                .join(", "),
              mainEntityOfPage: url,
            }),
          }}
        />
      </Head>
      <BlogPostPage post={post} relatedPosts={relatedPosts} />
    </>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const data = await getBlogPost(params.slug);
    const post = data.post || null;

    if (!post) {
      return {
        notFound: true,
      };
    }

    const keywordQuery = post?.keywords?.[0] || "";
    const relatedData = post
      ? await getBlogPosts({
          page: 1,
          limit: 6,
          category: post.category,
          q: keywordQuery,
        }).catch(() => ({ posts: [] }))
      : { posts: [] };

    const relatedPosts = (relatedData.posts || [])
      .filter((item) => item.slug !== params.slug)
      .slice(0, 3);
    return {
      props: {
        post: data.post || null,
        post,
        relatedPosts,
      },
    };
  } catch (err) {
    return {
      notFound: true,
    };
  }
}

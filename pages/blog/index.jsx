import Head from "next/head";
import BlogListPage from "@/components/Blog/BlogListPage";
import { getBlogPosts } from "@/utils/blogApi";

export default function BlogIndexPage(props) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mytiklink.com";
  const title =
    "MyTikLink Blog - Link in Bio, Payments, Stores and Creator Tools";
  const description =
    "Read MyTikLink guides on link in bio pages, payments, landing pages, online stores, creator tools, business ideas, and ways to make money online.";

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta
          name="keywords"
          content="link in bio, payment, landing page, online store, creator tool, business ideas, make money, MyTikLink"
        />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href={`${siteUrl}/blog`} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`${siteUrl}/blog`} />
        <meta name="twitter:card" content="summary_large_image" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Blog",
              name: "MyTikLink Blog",
              description,
              url: `${siteUrl}/blog`,
            }),
          }}
        />
      </Head>
      <BlogListPage {...props} />
    </>
  );
}

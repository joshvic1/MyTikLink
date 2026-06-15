const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mytiklink.com";

export default function Robots() {
  return null;
}

export async function getServerSideProps({ res }) {
  res.setHeader("Content-Type", "text/plain");
  res.write(`User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`);
  res.end();

  return { props: {} };
}

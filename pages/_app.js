import "@/styles/globals.css";
import { Toaster } from "react-hot-toast";
import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import { Plus_Jakarta_Sans } from "next/font/google";

// Load the app font once at module level.
// Next.js font loaders must stay outside the component.
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function App({ Component, pageProps }) {
  const router = useRouter();

  // These are Mytiklink-owned domains.
  // Any other hostname is treated as a customer's custom storefront domain.
  const platformDomains = [
    "mytiklink.com",
    "www.mytiklink.com",
    "mytik.link",
    "www.mytik.link",
    "localhost",
    "127.0.0.1",
  ];

  // window is only available in the browser, so guard it for Next.js rendering.
  const currentHost =
    typeof window !== "undefined" ? window.location.hostname.toLowerCase() : "";

  // Custom domains load through the homepage route,
  // but they should behave like public storefront pages.
  const isCustomDomain =
    currentHost &&
    !platformDomains.includes(currentHost) &&
    !currentHost.endsWith(".vercel.app");

  // Route groups that should not use the main app Layout.
  // These pages either have their own design or are public/customer-facing pages.
  const isRedirectPage = router.pathname.startsWith("/r/");
  const isPageRoute = router.pathname.startsWith("/p/");
  const isPublicStoreRoute = router.pathname.startsWith("/s/");
  const isCourseRoute = router.pathname.startsWith("/course");
  const isDashboardPage = router.pathname.startsWith("/dashboard");
  const isTermsPage = router.pathname === "/terms";
  const isPrivacyPage = router.pathname === "/privacy";
  const isAdminRoute = router.pathname.startsWith("/admin");
  const isHomePage = router.pathname === "/home";
  const isStorePage = router.pathname.startsWith("/store");
  const isBlogPage = router.pathname.startsWith("/blog");

  // Public pages, dashboards, admin pages, stores, and custom domains
  // should render without the global marketing Layout/menu.
  if (
    isRedirectPage ||
    isPageRoute ||
    isPublicStoreRoute ||
    isCourseRoute ||
    isCustomDomain ||
    isDashboardPage ||
    isTermsPage ||
    isPrivacyPage ||
    isAdminRoute ||
    isHomePage ||
    isStorePage ||
    isBlogPage
  ) {
    return (
      <main className={plusJakarta.className}>
        <Component {...pageProps} />

        <Toaster position="top-center" />
      </main>
    );
  }

  // Default site pages use the shared Layout.
  return (
    <main className={plusJakarta.className}>
      <Layout>
        <Component {...pageProps} />

        <Toaster position="top-center" />
      </Layout>
    </main>
  );
}

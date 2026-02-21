import "@/styles/globals.css";
import { Toaster } from "react-hot-toast";
import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import TelegramChatButton from "@/components/TelegramChatButton";
import { Plus_Jakarta_Sans } from "next/font/google";

// ✅ MUST be at module level (outside component)
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function App({ Component, pageProps }) {
  const router = useRouter();

  const isRedirectPage = router.pathname.startsWith("/r/");
  const isPageRoute = router.pathname.startsWith("/p/");
  const isCourseRoute = router.pathname.startsWith("/course");
  const isDashboardPage = router.pathname.startsWith("/dashboard");
  const isTermsPage = router.pathname === "/terms";
  const isPrivacyPage = router.pathname === "/privacy";
  const isAdminRoute = router.pathname.startsWith("/admin");

  // ✅ Pages without layout
  if (
    isRedirectPage ||
    isPageRoute ||
    isCourseRoute ||
    isDashboardPage ||
    isTermsPage ||
    isPrivacyPage ||
    isAdminRoute
  ) {
    return (
      <main className={plusJakarta.className}>
        <Component {...pageProps} />
        <Toaster position="top-center" />
      </main>
    );
  }

  // ✅ Normal pages with layout
  return (
    <main className={plusJakarta.className}>
      <Layout>
        <Component {...pageProps} />
        <TelegramChatButton username="mytiklink" />
        <Toaster position="top-center" />
      </Layout>
    </main>
  );
}

import "@/styles/globals.css";
import { Toaster } from "react-hot-toast";
import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import TelegramChatButton from "@/components/TelegramChatButton";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  // ⛔ Skip layout for redirect pages & dashboard
  const isRedirectPage = router.pathname.startsWith("/r/");
  const isPageRoute = router.pathname.startsWith("/p/");
  const isCourseRoute = router.pathname.startsWith("/course");
  const isDashboardPage = router.pathname.startsWith("/dashboard");
  const isTermsPage = router.pathname === "/terms";
  const isPrivacyPage = router.pathname === "/privacy";
  const isAdminRoute = router.pathname.startsWith("/admin");

  if (
    isRedirectPage ||
    isPageRoute ||
    isCourseRoute ||
    isDashboardPage ||
    isTermsPage ||
    isPrivacyPage ||
    isAdminRoute
  ) {
    // ✅ Return without layout (no header/footer)
    return (
      <>
        <Component {...pageProps} />
        <Toaster position="top-center" />
      </>
    );
  }

  // ✅ Normal pages still use layout
  return (
    <Layout>
      <Component {...pageProps} />
      <TelegramChatButton username="mytiklink" />
      <Toaster position="top-center" />
    </Layout>
  );
}

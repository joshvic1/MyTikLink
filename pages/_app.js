import "@/styles/globals.css";
import { Toaster } from "react-hot-toast";
import Layout from "@/components/Layout";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  // ⛔ Skip layout for redirect pages & dashboard
  const isRedirectPage = router.pathname.startsWith("/r/");
  const isDashboardPage = router.pathname.startsWith("/dashboard");
  const isTermsPage = router.pathname === "/terms";
  const isPrivacyPage = router.pathname === "/privacy";

  if (isRedirectPage || isDashboardPage || isTermsPage || isPrivacyPage) {
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
      <Toaster position="top-center" />
    </Layout>
  );
}

"use client";

import {useRouter} from 'next/router';
import {safeAuthReturn} from '@/V1.1/lib/authReturn';

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

import useAuth from "@/hooks/useAuth";
import Toast from "@/components/Toast";
import PublicStorefront from "@/components/store/public/PublicStorefront";
import Navbar from "@/components/Navbar/Navbar";
import Hero from "@/components/Hero/Hero";
import { CartProvider } from "@/components/store/context/CartContext";
const APP_DOMAINS = [
  "mytiklink.com",
  "www.mytiklink.com",
  "mytik.link",
  "www.mytik.link",
  "localhost",
  "127.0.0.1",
];

const normalizeHost = (host = "") => {
  return host.split(":")[0].toLowerCase();
};

const isPlatformDomain = (hostname) => {
  const host = normalizeHost(hostname);

  return APP_DOMAINS.includes(host) || host.endsWith(".vercel.app");
};

/* Lazy loaded heavy components */
const Features = dynamic(() => import("@/components/Features/Features"), {
  loading: () => <SectionSkeleton />,
});

const Pricing = dynamic(() => import("@/components/Pricing/Pricing"), {
  loading: () => <SectionSkeleton dark />,
});

const Testimonials = dynamic(
  () => import("@/components/Testimonials/Testimonials"),
  {
    loading: () => <SectionSkeleton />,
  },
);

const FinalCTA = dynamic(() => import("@/components/FinalCta/FinalCta"), {
  loading: () => <SectionSkeleton dark />,
});

const FAQ = dynamic(() => import("@/components/FAQS/FAQS"), {
  loading: () => <SectionSkeleton />,
});

const Footer = dynamic(() => import("@/components/Footer/Footer"), {
  loading: () => <FooterSkeleton />,
});

const AuthModal = dynamic(() => import("@/components/AuthModal"), {
  ssr: false,
});

const FloatingAI = dynamic(
  () => import("@/components/MyTikLinkAI/FloatingAI"),
  {
    ssr: false,
  },
);

const AIChat = dynamic(() => import("@/components/MyTikLinkAI/AIChat"), {
  ssr: false,
});

export default function Home() {
  const { login, subscribe } = useAuth();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router=useRouter();
  const [authMode, setAuthMode] = useState(null);
  const [toast, setToast] = useState(null);
  const [openAI, setOpenAI] = useState(false);
  const [loadRest, setLoadRest] = useState(false);
  const [customDomain, setCustomDomain] = useState(null);
  const searchParams = useSearchParams();
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hostname = normalizeHost(window.location.hostname);

    if (!isPlatformDomain(hostname)) {
      setCustomDomain(hostname.replace(/^www\./, ""));
    }
  }, []);
  useEffect(() => {
    const auth = searchParams.get("auth");

    if (auth === "login") {
      router.replace('/v1-1/login'+(searchParams.get('next')?'?next='+encodeURIComponent(safeAuthReturn(searchParams.get('next'))):''));
    } else if (auth === "register") {
      router.replace('/v1-1/register'+(searchParams.get('next')?'?next='+encodeURIComponent(safeAuthReturn(searchParams.get('next'))):''));
    }
  }, [searchParams]);

  useEffect(() => {
    const unsub = subscribe(setIsLoggedIn);
    return unsub;
  }, [subscribe]);

  /* Load below-the-fold sections after first paint */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const load = () => setLoadRest(true);

    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(load, { timeout: 1200 });
      return () => window.cancelIdleCallback(id);
    }

    const timer = setTimeout(load, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleCloseAI = () => {
    localStorage.setItem("ai_last_closed", Date.now());
    setOpenAI(false);
  };

  const openAuth = mode => router.push(mode==='register'?'/v1-1/register':'/v1-1/login');
  const closeAuth = () => setAuthMode(null);
  const showToast = (message, type = "success") => setToast({ message, type });
  if (customDomain) {
    return (
      <CartProvider>
        <PublicStorefront customDomain={customDomain} />
      </CartProvider>
    );
  }
  return (
    <main style={{ background: "#f9f9f9" }}>
      <Navbar openAuth={openAuth} isLoggedIn={isLoggedIn} />

      <Hero openAuth={openAuth} isLoggedIn={isLoggedIn} />

      {loadRest ? (
        <>
          <Features />
          <Pricing openAuth={openAuth} />
          <Testimonials />
          <FinalCTA openAuth={openAuth} onOpenAI={() => setOpenAI(true)} />
          <FAQ />
          <Footer />
        </>
      ) : (
        <>
          <SectionSkeleton />
          <SectionSkeleton dark />
          <SectionSkeleton />
        </>
      )}

      {authMode && (
        <AuthModal
          isOpen={!!authMode}
          mode={authMode}
          onClose={closeAuth}
          switchMode={setAuthMode}
          onAuthSuccess={(msg, token) => {
            login(token);
            showToast(msg, "success");
            closeAuth();
          }}
        />
      )}

      <FloatingAI onOpen={() => setOpenAI(true)} />

      {openAI && <AIChat onClose={handleCloseAI} />}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </main>
  );
}

function SectionSkeleton({ dark = false }) {
  return (
    <section
      style={{
        padding: "70px 20px",
        background: dark ? "#050505" : "#f8fafc",
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          display: "grid",
          gap: 16,
        }}
      >
        <div
          style={{
            width: "42%",
            height: 26,
            borderRadius: 999,
            background: dark ? "#111827" : "#e2e8f0",
          }}
        />

        <div
          style={{
            width: "70%",
            height: 14,
            borderRadius: 999,
            background: dark ? "#1f2937" : "#e5e7eb",
          }}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 14,
            marginTop: 20,
          }}
        >
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              style={{
                height: 150,
                borderRadius: 18,
                background: dark ? "#111827" : "#ffffff",
                border: `1px solid ${dark ? "#1f2937" : "#e2e8f0"}`,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FooterSkeleton() {
  return (
    <footer
      style={{
        height: 220,
        background: "#050505",
      }}
    />
  );
}

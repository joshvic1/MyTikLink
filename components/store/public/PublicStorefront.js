"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

import CustomPageRenderer from "../../custom/renderer/CustomPageRenderer";

import FloatingCart from "./FloatingCart";
import StorePixel from "./StorePixel";
import CartDrawer from "./CartDrawer";
import StoreTopBar from "./StoreTopBar";
import CustomerLoginModal from "./customer/CustomerLoginModal";
import styles from "../styles/publicStorefront.module.css";

export default function PublicStorefront({ customDomain }) {
  const router = useRouter();

  const { slug } = router.query;

  const [store, setStore] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  useEffect(() => {
    if (!customDomain && !slug) return;

    const fetchStore = async () => {
      try {
        console.log("CUSTOM DOMAIN:", customDomain);
        console.log("SLUG:", slug);
        const storeUrl = customDomain
          ? `${process.env.NEXT_PUBLIC_API_URL}/store/domain/${customDomain}`
          : `${process.env.NEXT_PUBLIC_API_URL}/store/public/${slug}`;

        const storeRes = await axios.get(storeUrl);

        const storeSlug = storeRes.data.slug;

        const productRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/products/public/${storeSlug}`,
        );

        setStore(storeRes.data);

        setProducts(productRes.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [slug, customDomain]);

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loader}>
          <div className={styles.dots}>
            <span />
            <span />
            <span />
          </div>

          <p>Loading store</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loader}>
          <p>Store not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <StoreTopBar
        onLogin={() => setLoginOpen(true)}
        whatsappNumber={store?.phone}
        email={store?.user?.email || store?.email}
        isLoggedIn={Boolean(localStorage.getItem("customerToken"))}
        accountUrl={`/s/${store?.slug || slug}/account`}
      />

      <CustomerLoginModal
        slug={store?.slug || slug}
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
      />
      <CustomPageRenderer
        sections={store.storefrontPage?.customContent || []}
        page={{
          ...store.storefrontPage,
          products,
          builder: false,
        }}
      />
      <FloatingCart onOpen={() => setCartOpen(true)} />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <>
        <StorePixel
          tiktokPixelId={store?.user?.tiktokPixelId}
          metaPixelId={store?.user?.metaPixelId}
        />
      </>
    </div>
  );
}

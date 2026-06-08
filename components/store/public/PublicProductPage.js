"use client";

import { useRouter } from "next/router";

import { useEffect, useState } from "react";

import axios from "axios";

import styles from "../styles/publicProductPage.module.css";
import { useCart } from "../context/CartContext";
import FloatingCart from "./FloatingCart";
import { trackBoth } from "@/utils/storeTracking";
import CartDrawer from "./CartDrawer";
import Link from "next/link";
import Toast from "../ui/Toast";
import { ArrowLeft, MessageCircle, ShoppingBag } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import StorePixel from "./StorePixel";
export default function PublicProductPage() {
  const router = useRouter();

  const { slug, product } = router.query;

  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const {
    addToCart,
    updateQty,
    removeFromCart,
    getItemQty,
    subtotal,
    hydrated,
  } = useCart();
  const [qty, setQty] = useState(1);

  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    text: "",
    type: "success",
  });

  const cartQty = data ? getItemQty(data._id) : 0;
  const showToast = (text, type = "success") => {
    setToast({
      show: true,
      text,
      type,
    });

    setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        show: false,
      }));
    }, 2200);
  };
  const handleAdd = () => {
    const isPhysicalProduct = data.productType === "physical";

    if (isPhysicalProduct && cartQty >= Number(data.stock || 0)) {
      showToast("No more stock available", "error");
      return;
    }

    trackBoth(
      "AddToCart",
      {
        content_name: data.name,
        value: data.price,
        currency: "NGN",
      },
      {
        content_name: data.name,
        value: data.price,
        currency: "NGN",
      },
    );

    addToCart(data, 1);

    showToast(`${data.name} added to cart`);
  };
  const handleIncrease = () => {
    const isPhysicalProduct = data.productType === "physical";

    if (isPhysicalProduct && cartQty >= Number(data.stock || 0)) {
      showToast("No more stock available", "error");
      return;
    }

    updateQty(data._id, cartQty + 1);

    showToast(`${data.name} added to cart`);
  };
  const handleDecrease = () => {
    if (cartQty <= 1) {
      removeFromCart(data._id);

      showToast(`${data.name} removed from cart`, "error");

      return;
    }

    updateQty(data._id, cartQty - 1);

    showToast(`${data.name} removed from cart`, "error");
  };
  useEffect(() => {
    if (!slug || !product) return;

    const fetchData = async () => {
      try {
        // SINGLE PRODUCT
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/products/public/${slug}/${product}`,
        );

        setData(res.data);
        // meta and tiktok
        trackBoth(
          "ViewContent",
          {
            content_name: res.data.name,
            value: res.data.price,
            currency: "NGN",
          },
          {
            content_name: res.data.name,
            value: res.data.price,
            currency: "NGN",
          },
        );
        // RELATED PRODUCTS
        const relatedRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/products/public/${slug}`,
        );

        setRelatedProducts(
          relatedRes.data.filter((p) => p.slug !== product).slice(0, 4),
        );
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, product]);

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loader}>
          <div className={styles.dots}>
            <span />
            <span />
            <span />
          </div>

          <p>Loading product</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loader}>
          <p>Product not found</p>
        </div>
      </div>
    );
  }

  const whatsappText = `Hi, I want to order:

${data.name}

Quantity: ${qty}

Price: ₦${data.price}
`;
  if (!hydrated) return null;

  const isPhysicalProduct = data.productType === "physical";
  const isOutOfStock = isPhysicalProduct && Number(data.stock || 0) <= 0;
  return (
    <div className={styles.page}>
      <>
        {/* TOPBAR */}
        <div className={styles.topbar}>
          <button onClick={() => router.back()} className={styles.backBtn}>
            <ArrowLeft size={18} />
          </button>

          <div className={styles.breadcrumb}>
            <Link href={`/s/${slug}`}>{slug}</Link>

            <span>/</span>

            <p>{data.name}</p>
          </div>
        </div>

        {/* IMAGE */}
        <div className={styles.imageWrap}>
          <img src={data.images?.[0]} alt="" />
        </div>

        {/* CONTENT */}
        <div className={styles.content}>
          <div className={styles.category}>{data.category}</div>

          <h1>{data.name}</h1>

          <div className={styles.priceWrap}>
            <div className={styles.price}>₦{data.price?.toLocaleString()}</div>

            {data.comparePrice && (
              <div className={styles.compare}>
                ₦{data.comparePrice?.toLocaleString()}
              </div>
            )}
          </div>

          {/* DESCRIPTION */}
          <div className={styles.descriptionBox}>
            <h3>Description</h3>

            <p>{data.description}</p>
          </div>
        </div>

        {/* RELATED */}
        {data.store?.showRelatedProducts && relatedProducts.length > 0 && (
          <section className={styles.related}>
            <div className={styles.relatedTop}>
              <h2>You May Also Like</h2>
            </div>

            <div className={styles.relatedGrid}>
              {relatedProducts.map((item) => (
                <Link
                  href={`/s/${slug}/${item.slug}`}
                  key={item._id}
                  className={styles.relatedCard}
                >
                  <img src={item.images?.[0]} />

                  <h3>{item.name}</h3>

                  <p>₦{item.price?.toLocaleString()}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
        {/* STICKY PURCHASE BAR */}

        <div className={styles.purchaseBar}>
          {/* WHATSAPP */}

          {data.store?.showWhatsappButton && (
            <button
              className={styles.whatsappMini}
              onClick={() => {
                trackBoth("Contact");

                window.open(
                  `https://wa.me/${data.store?.whatsappNumber}?text=${encodeURIComponent(whatsappText)}`,
                  "_blank",
                );
              }}
            >
              <FaWhatsapp size={20} />
            </button>
          )}

          {/* EMPTY CART */}

          {cartQty < 1 ? (
            <button
              className={styles.addCartLarge}
              disabled={isOutOfStock}
              onClick={handleAdd}
            >
              {isOutOfStock ? "Out Of Stock" : "Add To Cart"}
            </button>
          ) : (
            <>
              {/* QTY */}

              <div className={styles.qtyBar}>
                <button onClick={handleDecrease}>−</button>

                <span>{cartQty}</span>

                <button onClick={handleIncrease}>+</button>
              </div>

              {/* CHECKOUT */}

              <button
                className={styles.checkoutBtn}
                onClick={() => setCartOpen(true)}
              >
                Pay Now ₦{subtotal.toLocaleString()}
              </button>
            </>
          )}
        </div>
        <Toast show={toast.show} text={toast.text} type={toast.type} />
        {/* FLOATING CART */}
        <FloatingCart onOpen={() => setCartOpen(true)} />

        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        <StorePixel
          tiktokPixelId={data?.store?.user?.tiktokPixelId}
          metaPixelId={data?.store?.user?.metaPixelId}
        />
      </>
    </div>
  );
}

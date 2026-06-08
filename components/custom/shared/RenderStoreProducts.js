import styles from "./renderStoreProducts.module.css";
import Link from "next/link";
import demoProducts from "@/constants/demoProducts";
import { trackBoth } from "@/utils/storeTracking";
export default function RenderStoreProducts({
  element,
  products = [],
  builder = false,
}) {
  const displayProducts = builder
    ? products.length > 0
      ? products.slice(0, 4)
      : demoProducts
    : products;

  // REAL STOREFRONT EMPTY STATE
  if (!builder && products.length === 0) {
    return (
      <section className={styles.empty}>
        <h3>No products available</h3>
      </section>
    );
  }
  return (
    <section
      className={styles.section}
      id="shop"
      style={{
        background: element.backgroundColor,

        paddingTop: element.paddingTop,
        paddingBottom: element.paddingBottom,

        paddingLeft: element.paddingLeft,
        paddingRight: element.paddingRight,

        marginTop: element.marginTop,
        marginBottom: element.marginBottom,
      }}
    >
      {/* TOP */}

      <div className={styles.top}>
        <div className={styles.topText}>
          {/* BADGE */}

          {(element.badgeText || element.badgeIcon) && (
            <div
              className={styles.badge}
              style={{
                background: `${element.badgeColor}20`,
                color: element.badgeTextColor || element.badgeColor,
              }}
            >
              {element.badgeIcon && (
                <img
                  src={element.badgeIcon}
                  alt=""
                  className={styles.badgeIcon}
                />
              )}

              <span>{element.badgeText}</span>
            </div>
          )}

          {/* TITLE */}
          {/* <h2
            className={styles.title}
            style={{
              color: element.titleColor,

              fontSize: `${element.titleSize || 34}px`,
            }}
          >
            {element.title}
          </h2> */}
        </div>
      </div>

      {/* GRID */}

      <div
        className={styles.grid}
        style={{
          gridTemplateColumns: `repeat(${element.columns}, 1fr)`,
        }}
      >
        {displayProducts.map((product, i) => (
          <Link
            href={builder ? "#" : `/s/${product.storeSlug}/${product.slug}`}
            key={product._id || i}
            className={`${styles.card} ${builder ? styles.builderCard : ""}`}
            onClick={(e) => {
              if (builder) {
                e.preventDefault();
                return;
              }

              trackBoth(
                "ClickButton",
                {
                  button_name: "See More Details",
                  product_name: product.name,
                },
                {
                  button_name: "See More Details",
                  product_name: product.name,
                },
              );
            }}
            style={{
              background: element.cardBackground,
              borderRadius: element.radius,
            }}
          >
            {/* IMAGE */}

            <div className={styles.imageWrap}>
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className={styles.image}
                />
              ) : (
                <div className={styles.skeletonImage} />
              )}
            </div>

            {/* CONTENT */}

            <div className={styles.content}>
              <h3
                style={{
                  color: element.titleColor,
                }}
              >
                {product.name || "Product Name"}
              </h3>

              <p
                style={{
                  color: element.priceColor,
                }}
              >
                ₦{Number(product.price || 0).toLocaleString()}
              </p>

              <button className={styles.cardBtn}>See More Details</button>
            </div>
          </Link>
        ))}
      </div>

      {/* EMPTY */}

      {!builder && products.length === 0 && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🛍️</div>

          <h3>No products yet</h3>

          <p>Products added to your store will appear here.</p>
        </div>
      )}
    </section>
  );
}

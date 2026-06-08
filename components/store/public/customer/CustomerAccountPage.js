"use client";

import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ChevronDown,
  Download,
  ExternalLink,
  FileCheck2,
  Home,
  LogOut,
  Package,
  PackageCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";

import { getCustomerOrders } from "@/services/customerAuthService";
import styles from "./customerAccount.module.css";

const money = (value) => `₦${Number(value || 0).toLocaleString()}`;

const getPaymentStatus = (order) =>
  order.paymentStatus ||
  (["paid", "shipped", "delivered"].includes(order.status)
    ? "paid"
    : "pending");

const getFulfillmentStatus = (order) =>
  order.fulfillmentStatus ||
  (order.status === "shipped"
    ? "shipped"
    : order.status === "delivered"
      ? "delivered"
      : "unfulfilled");

const getOrderStatus = (order) =>
  order.orderStatus || (order.status === "cancelled" ? "cancelled" : "active");

export default function CustomerAccountPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [store, setStore] = useState(null);
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    loadPage();
  }, [slug]);

  const loadPage = async () => {
    try {
      const token = localStorage.getItem("customerToken");

      if (!token) {
        router.push(`/s/${slug}`);
        return;
      }

      const [storeRes, orderData] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/store/public/${slug}`),
        getCustomerOrders(token),
      ]);

      setStore(storeRes.data);
      setOrders(orderData);
    } catch (err) {
      console.log(err);
      localStorage.removeItem("customerToken");
      router.push(`/s/${slug}`);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("customerToken");
    router.push(`/s/${slug}`);
  };

  const goToStore = () => {
    router.push(`/s/${slug}`);
  };

  const summary = useMemo(
    () => ({
      total: orders.length,
      paid: orders.filter((order) => getPaymentStatus(order) === "paid").length,
      active: orders.filter((order) => getOrderStatus(order) !== "cancelled")
        .length,
    }),
    [orders],
  );

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loader} />
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <main className={styles.wrapper}>
      <nav className={styles.nav}>
        <button type="button" onClick={goToStore}>
          <Home size={15} />
          Store
        </button>

        <strong>{store?.name || slug}</strong>

        <button type="button" onClick={logout}>
          <LogOut size={15} />
          Logout
        </button>
      </nav>

      <header className={styles.header}>
        <span>{store?.name || "Store"} / Orders</span>
        <h1>My Orders</h1>
        <p>
          View payment status, delivery updates, and digital product access.
        </p>
      </header>

      <section className={styles.summary}>
        <div>
          <strong>{summary.total}</strong>
          <span>Total</span>
        </div>

        <div>
          <strong>{summary.paid}</strong>
          <span>Paid</span>
        </div>

        <div>
          <strong>{summary.active}</strong>
          <span>Active</span>
        </div>
      </section>

      {!orders.length && (
        <section className={styles.empty}>
          <Package size={34} />
          <h3>No orders yet</h3>
          <p>Your purchases from this store will appear here.</p>
          <button type="button" onClick={goToStore}>
            Continue shopping
          </button>
        </section>
      )}

      <section className={styles.list}>
        {orders.map((order) => {
          const isOpen = expanded === order._id;
          const paymentStatus = getPaymentStatus(order);
          const fulfillmentStatus = getFulfillmentStatus(order);
          const orderStatus = getOrderStatus(order);
          const hasPhysical = order.items?.some(
            (item) => item.productType === "physical",
          );
          const hasDigital = order.items?.some(
            (item) => item.productType === "digital",
          );

          return (
            <article key={order._id} className={styles.card}>
              <button
                type="button"
                className={styles.cardTop}
                onClick={() => setExpanded(isOpen ? null : order._id)}
              >
                <div className={styles.icon}>
                  {hasPhysical ? <Truck size={17} /> : <Download size={17} />}
                </div>

                <div className={styles.main}>
                  <h3>{order.orderNumber || `#${order._id.slice(-6)}`}</h3>
                  <p>{order.items?.length || 0} item(s)</p>
                </div>

                <div className={styles.meta}>
                  <strong>{money(order.subtotal)}</strong>
                  <span
                    className={`${styles.badge} ${
                      orderStatus === "cancelled"
                        ? styles.cancelled
                        : styles[paymentStatus]
                    }`}
                  >
                    {orderStatus === "cancelled" ? "cancelled" : paymentStatus}
                  </span>
                </div>

                <ChevronDown
                  size={17}
                  className={isOpen ? styles.rotate : ""}
                />
              </button>

              {isOpen && (
                <div className={styles.details}>
                  <div className={styles.note}>
                    {hasDigital && paymentStatus === "paid" ? (
                      <>
                        <Download size={16} />
                        <p>Your digital product is ready.</p>
                      </>
                    ) : hasDigital ? (
                      <>
                        <FileCheck2 size={16} />
                        <p>
                          Digital access will appear after payment confirmation.
                        </p>
                      </>
                    ) : (
                      <>
                        <Truck size={16} />
                        <p>Your order is being processed for delivery.</p>
                      </>
                    )}
                  </div>

                  <div className={styles.products}>
                    {order.items?.map((item, index) => (
                      <div key={index} className={styles.product}>
                        <img src={item.image || "/placeholder.png"} alt="" />

                        <div>
                          <h4>{item.name}</h4>
                          <p>
                            Qty {item.quantity} · {money(item.price)}
                          </p>

                          {item.productType === "digital" &&
                            paymentStatus === "paid" && (
                              <div className={styles.links}>
                                {item.externalUrl && (
                                  <a href={item.externalUrl} target="_blank">
                                    <ExternalLink size={13} />
                                    Access
                                  </a>
                                )}

                                {item.downloadFile && (
                                  <a href={item.downloadFile} target="_blank">
                                    <Download size={13} />
                                    Download
                                  </a>
                                )}
                              </div>
                            )}
                        </div>

                        <strong>{money(item.price * item.quantity)}</strong>
                      </div>
                    ))}
                  </div>

                  <div className={styles.timeline}>
                    <div className={`${styles.step} ${styles.done}`}>
                      <span />
                      Order received
                    </div>

                    <div
                      className={`${styles.step} ${
                        paymentStatus === "paid" ? styles.done : ""
                      }`}
                    >
                      <span />
                      Payment confirmed
                    </div>

                    {hasPhysical && (
                      <>
                        <div
                          className={`${styles.step} ${
                            ["shipped", "delivered"].includes(fulfillmentStatus)
                              ? styles.done
                              : ""
                          }`}
                        >
                          <span />
                          Shipped
                        </div>

                        <div
                          className={`${styles.step} ${
                            fulfillmentStatus === "delivered" ? styles.done : ""
                          }`}
                        >
                          <span />
                          Delivered
                        </div>
                      </>
                    )}

                    {hasDigital && (
                      <div
                        className={`${styles.step} ${
                          paymentStatus === "paid" ? styles.done : ""
                        }`}
                      >
                        <span />
                        Digital access
                      </div>
                    )}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}

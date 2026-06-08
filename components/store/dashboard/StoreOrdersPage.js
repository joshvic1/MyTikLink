"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Clock3,
  PackageCheck,
  PackageSearch,
  Search,
  Truck,
  XCircle,
} from "lucide-react";

import StoreMenu from "./StoreMenu";
import DashboardHeader from "./DashboardHeader";
import Loader from "../Loader";
import { getMyOrders, updateOrderStatus } from "@/services/orderService";

import styles from "../styles/storeOrdersPage.module.css";

const formatMoney = (amount) => `₦${Number(amount || 0).toLocaleString()}`;
const orderCode = (id = "") => `#${id.slice(-6).toUpperCase()}`;

export default function StoreOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [store, setStore] = useState(null);
  const [user, setUser] = useState(null);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  useEffect(() => {
    loadOrders(1);
    fetchData();
  }, []);

  useEffect(() => {
    const q = search.trim().toLowerCase();

    const results = orders.filter((item) => {
      const matchesSearch =
        !q ||
        item.customerName?.toLowerCase().includes(q) ||
        item.customerPhone?.toLowerCase().includes(q) ||
        item.orderNumber?.toLowerCase().includes(q) ||
        item._id?.toLowerCase().includes(q);

      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "pending" && getPaymentStatus(item) === "pending") ||
        (activeFilter === "paid" && getPaymentStatus(item) === "paid") ||
        (activeFilter === "shipped" &&
          getFulfillmentStatus(item) === "shipped") ||
        (activeFilter === "delivered" &&
          getFulfillmentStatus(item) === "delivered") ||
        (activeFilter === "cancelled" && getOrderStatus(item) === "cancelled");

      return matchesSearch && matchesFilter;
    });

    setFiltered(results);
  }, [search, orders, activeFilter]);
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
    order.orderStatus ||
    (order.status === "cancelled" ? "cancelled" : "active");
  const filters = useMemo(
    () => [
      { key: "all", label: "All", count: orders.length },
      {
        key: "pending",
        label: "Pending",
        count: orders.filter((order) => getPaymentStatus(order) === "pending")
          .length,
      },
      {
        key: "paid",
        label: "Paid",
        count: orders.filter((order) => getPaymentStatus(order) === "paid")
          .length,
      },
      {
        key: "shipped",
        label: "Shipped",
        count: orders.filter(
          (order) => getFulfillmentStatus(order) === "shipped",
        ).length,
      },
      {
        key: "delivered",
        label: "Delivered",
        count: orders.filter(
          (order) => getFulfillmentStatus(order) === "delivered",
        ).length,
      },
      {
        key: "cancelled",
        label: "Cancelled",
        count: orders.filter((order) => getOrderStatus(order) === "cancelled")
          .length,
      },
    ],
    [orders],
  );

  const loadOrders = async (pageNumber = 1, append = false) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const data = await getMyOrders(token, pageNumber);

      if (append) {
        setOrders((prev) => [...prev, ...data.orders]);
        setFiltered((prev) => [...prev, ...data.orders]);
      } else {
        setOrders(data.orders);
        setFiltered(data.orders);
      }

      setHasMore(data.hasMore);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const [storeRes, userRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/store/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/plan`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setStore(storeRes.data);
      setUser(userRes.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      setUpdatingOrder(id);
      setActionType(status);

      const token = localStorage.getItem("token");
      if (!token) return;

      const savedOrder = await updateOrderStatus(id, status, token);

      const updateOrder = (order) => (order._id === id ? savedOrder : order);

      setOrders((prev) => prev.map(updateOrder));
      setFiltered((prev) => prev.map(updateOrder));
    } catch (err) {
      console.log(err);
    } finally {
      setUpdatingOrder(null);
      setActionType(null);
    }
  };

  const handleLoadMore = async () => {
    try {
      setLoadingMore(true);

      const nextPage = page + 1;

      await loadOrders(nextPage, true);
      setPage(nextPage);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loader />
      </div>
    );
  }

  return (
    <>
      <StoreMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        store={store}
      />

      <main className={styles.page}>
        <div className={styles.headerShell}>
          <DashboardHeader
            store={store}
            user={user}
            onMenu={() => setMenuOpen(true)}
          />
        </div>

        <section className={styles.top}>
          <div>
            <h1>Orders</h1>
            <p>Manage payments, fulfillment, and customer orders.</p>
          </div>

          <div className={styles.filterRow}>
            {filters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                className={`${styles.filterPill} ${
                  activeFilter === filter.key ? styles.activeFilter : ""
                }`}
                onClick={() => setActiveFilter(filter.key)}
              >
                <span>{filter.label}</span>
                <strong>{filter.count}</strong>
              </button>
            ))}
          </div>
        </section>

        <div className={styles.searchWrap}>
          <Search size={17} />
          <input
            placeholder="Search by customer, phone, or order ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {!filtered.length && (
          <div className={styles.empty}>
            <PackageSearch size={34} />
            <h3>No orders found</h3>
            <p>Orders from customers will appear here.</p>
          </div>
        )}

        <div className={styles.list}>
          {filtered.map((item) => {
            const expanded = expandedOrder === item._id;
            const isUpdating = updatingOrder === item._id;
            const isDigitalOrder = item.items?.every(
              (product) => product.productType === "digital",
            );

            return (
              <article
                key={item._id}
                className={`${styles.card} ${expanded ? styles.expanded : ""}`}
              >
                <button
                  type="button"
                  className={styles.cardTop}
                  onClick={() => setExpandedOrder(expanded ? null : item._id)}
                >
                  <div className={styles.imageStack}>
                    <img
                      src={item.items?.[0]?.image || "/placeholder.png"}
                      alt=""
                    />

                    {item.items?.length > 1 && (
                      <span>+{item.items.length - 1}</span>
                    )}
                  </div>

                  <div className={styles.orderInfo}>
                    <div className={styles.orderLine}>
                      <h3>{item.orderNumber || orderCode(item._id)}</h3>

                      <span
                        className={`${styles.status} ${styles[item.status]}`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <p>{item.customerName || "Unnamed customer"}</p>

                    <small>{item.customerPhone || "No phone number"}</small>
                  </div>

                  <div className={styles.amount}>
                    <strong>{formatMoney(item.subtotal)}</strong>
                    <small>{item.items?.length || 0} item(s)</small>
                  </div>

                  <ChevronDown
                    size={18}
                    className={expanded ? styles.rotate : ""}
                  />
                </button>

                {expanded && (
                  <div className={styles.expand}>
                    <div className={styles.detailsGrid}>
                      <section className={styles.block}>
                        <h4>Customer</h4>

                        <div className={styles.infoRows}>
                          <p>
                            <span>Name</span>
                            <strong>{item.customerName || "N/A"}</strong>
                          </p>

                          <p>
                            <span>Email</span>
                            <strong>{item.customerEmail || "N/A"}</strong>
                          </p>

                          <p>
                            <span>Phone</span>
                            <strong>{item.customerPhone || "N/A"}</strong>
                          </p>

                          {item.customerAddress && (
                            <p>
                              <span>Address</span>
                              <strong>{item.customerAddress}</strong>
                            </p>
                          )}
                        </div>
                      </section>

                      <section className={styles.block}>
                        <h4>Fulfillment</h4>

                        <div className={styles.fulfillment}>
                          {isDigitalOrder ? (
                            <>
                              <Clock3 size={18} />
                              <div>
                                <strong>Digital order</strong>
                                <p>No shipping required.</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <Truck size={18} />
                              <div>
                                <strong>Physical order</strong>
                                <p>Ship after payment confirmation.</p>
                              </div>
                            </>
                          )}
                        </div>
                      </section>
                    </div>

                    <section className={styles.block}>
                      <h4>Order items</h4>

                      <div className={styles.orderItems}>
                        {item.items?.map((product, index) => (
                          <div key={index} className={styles.orderItem}>
                            <img
                              src={product.image || "/placeholder.png"}
                              alt=""
                            />

                            <div>
                              <h5>{product.name}</h5>
                              <p>Qty: {product.quantity}</p>
                            </div>

                            <strong>
                              {formatMoney(product.price * product.quantity)}
                            </strong>
                          </div>
                        ))}
                      </div>
                    </section>

                    {item.paymentProof && (
                      <section className={styles.block}>
                        <h4>Payment proof</h4>

                        <a
                          href={item.paymentProof}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.paymentProofLink}
                        >
                          View uploaded proof
                        </a>
                      </section>
                    )}

                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.confirmPaymentBtn}
                        disabled={isUpdating}
                        onClick={() => {
                          if (item.status === "paid") {
                            const undo = window.confirm(
                              "Do you want to undo payment confirmation?",
                            );

                            if (undo) handleStatusUpdate(item._id, "pending");
                            return;
                          }

                          handleStatusUpdate(item._id, "paid");
                        }}
                      >
                        <CheckCircle2 size={18} />
                        {isUpdating && actionType === "paid"
                          ? "Confirming..."
                          : item.status === "paid"
                            ? "Payment Confirmed"
                            : "Confirm Payment"}
                      </button>

                      {!isDigitalOrder && (
                        <>
                          <button
                            type="button"
                            className={styles.shipBtn}
                            disabled={item.status !== "paid" || isUpdating}
                            onClick={() => {
                              if (item.status === "shipped") {
                                const undo = window.confirm(
                                  "Do you want to undo shipped status?",
                                );

                                if (undo) handleStatusUpdate(item._id, "paid");
                                return;
                              }

                              handleStatusUpdate(item._id, "shipped");
                            }}
                          >
                            <Truck size={18} />
                            {isUpdating && actionType === "shipped"
                              ? "Marking..."
                              : item.status === "shipped"
                                ? "Shipped"
                                : "Mark Shipped"}
                          </button>

                          <button
                            type="button"
                            className={styles.deliverBtn}
                            disabled={
                              !["shipped", "delivered"].includes(item.status) ||
                              isUpdating
                            }
                            onClick={() => {
                              if (item.status === "delivered") {
                                const undo = window.confirm(
                                  "Do you want to undo delivered status?",
                                );

                                if (undo)
                                  handleStatusUpdate(item._id, "shipped");
                                return;
                              }

                              handleStatusUpdate(item._id, "delivered");
                            }}
                          >
                            <PackageCheck size={18} />
                            {isUpdating && actionType === "delivered"
                              ? "Marking..."
                              : item.status === "delivered"
                                ? "Delivered"
                                : "Mark Delivered"}
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        className={styles.cancelBtn}
                        disabled={isUpdating}
                        onClick={() => {
                          if (item.status === "cancelled") {
                            const undo = window.confirm(
                              "Do you want to restore this order?",
                            );

                            if (undo) handleStatusUpdate(item._id, "pending");
                            return;
                          }

                          const confirmCancel = window.confirm(
                            "Are you sure you want to cancel this order?",
                          );

                          if (confirmCancel) {
                            handleStatusUpdate(item._id, "cancelled");
                          }
                        }}
                      >
                        <XCircle size={18} />
                        {isUpdating && actionType === "cancelled"
                          ? "Cancelling..."
                          : item.status === "cancelled"
                            ? "Cancelled"
                            : "Cancel Order"}
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}

          {hasMore && (
            <button
              type="button"
              className={styles.loadMore}
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? "Loading..." : "Load More Orders"}
            </button>
          )}
        </div>
      </main>
    </>
  );
}

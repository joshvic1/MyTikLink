"use client";

import { useCart } from "../context/CartContext";

import { useState } from "react";

import { useRouter } from "next/router";

import { createOrder } from "@/services/orderService";

import styles from "../styles/checkoutPage.module.css";

export default function CheckoutPage() {
  const router = useRouter();

  const { cart, subtotal, clearCart } = useCart();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",

    phone: "",

    address: "",
  });

  const update = (data) => {
    setForm((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);

      const slug = cart?.[0]?.storeSlug;

      await createOrder({
        slug,

        customerName: form.name,

        customerPhone: form.phone,

        customerAddress: form.address,

        subtotal,

        items: cart.map((item) => ({
          productId: item._id,

          name: item.name,

          image: item.images?.[0],

          quantity: item.quantity,

          price: item.price,
        })),
      });

      clearCart();

      alert("Order placed successfully");

      router.push(`/s/${slug}`);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* LEFT */}
        <div className={styles.form}>
          <h1>Checkout</h1>

          <input
            placeholder="Full Name"
            value={form.name}
            onChange={(e) =>
              update({
                name: e.target.value,
              })
            }
          />

          <input
            placeholder="Phone Number"
            value={form.phone}
            onChange={(e) =>
              update({
                phone: e.target.value,
              })
            }
          />

          <textarea
            placeholder="Delivery Address"
            value={form.address}
            onChange={(e) =>
              update({
                address: e.target.value,
              })
            }
          />

          <button onClick={handleCheckout} disabled={loading}>
            {loading ? "Processing..." : "Place Order"}
          </button>
        </div>

        {/* RIGHT */}
        <div className={styles.summary}>
          <h2>Order Summary</h2>

          {cart.map((item) => (
            <div key={item._id} className={styles.item}>
              <img src={item.images?.[0]} />

              <div>
                <h4>{item.name}</h4>

                <p>
                  Qty:
                  {item.quantity}
                </p>
              </div>

              <strong>₦{item.price * item.quantity}</strong>
            </div>
          ))}

          <div className={styles.total}>
            <span>Total</span>

            <strong>₦{subtotal}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

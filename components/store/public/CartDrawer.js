"use client";

import { useState } from "react";

import {
  X,
  Minus,
  Plus,
  Trash2,
  ChevronLeft,
  UploadCloud,
  CheckCircle2,
  Copy,
} from "lucide-react";

import { useCart } from "../context/CartContext";

import { uploadImage } from "@/services/uploadService";
import { trackBoth } from "@/utils/storeTracking";
import { createOrder } from "@/services/orderService";
import Toast from "../ui/Toast";
import styles from "../styles/cartDrawer.module.css";

export default function CartDrawer({ open, onClose }) {
  const [step, setStep] = useState("cart");

  const [proof, setProof] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [toast, setToast] = useState({
    show: false,
    text: "",
    type: "success",
  });
  const [errors, setErrors] = useState({});
  const { cart, subtotal, removeFromCart, updateQty, clearCart } = useCart();

  const hasPhysicalProduct = cart.some(
    (item) => item.productType === "physical",
  );
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
  const validateCustomer = () => {
    let newErrors = {};

    // NAME
    if (!customer.name.trim()) {
      newErrors.name = "Full name is required";
    }

    // EMAIL
    if (!customer.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      newErrors.email = "Enter a valid email";
    }

    // PHONE
    if (!customer.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    // ADDRESS
    if (hasPhysicalProduct && !customer.address.trim()) {
      newErrors.address = "Delivery address is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };
  const submitOrder = async () => {
    if (!proof) {
      setErrors((prev) => ({
        ...prev,
        proof: "Please upload your payment screenshot before submitting.",
      }));

      showToast("Upload payment screenshot", "error");
      return;
    }

    try {
      setSubmitting(true);

      let paymentProof = "";

      if (proof) {
        const token = localStorage.getItem("token");

        const uploadRes = await uploadImage(proof, token);

        paymentProof = uploadRes.url;
      }

      await createOrder({
        slug: cart[0]?.storeSlug,

        customerName: customer.name,

        customerEmail: customer.email,

        customerPhone: customer.phone,

        customerAddress: customer.address,

        paymentProof,

        subtotal,

        items: cart.map((item) => ({
          productId: item._id,

          name: item.name,

          image: item.images?.[0],

          quantity: item.productType === "digital" ? 1 : item.quantity,

          price: item.price,

          productType: item.productType,
          selectedVariants: item.selectedVariants || {},
        })),
      });
      trackBoth("AddPaymentInfo", {
        value: Number(subtotal || 0),
        currency: "NGN",
        num_items: cart.length,
        content_ids: cart.map((item) => item._id),
        content_type: "product",
      });
      clearCart();

      setStep("success");
      trackBoth(
        "CompletePayment",
        {
          value: subtotal,
          currency: "NGN",
        },
        {
          value: subtotal,
          currency: "NGN",
        },
      );
      showToast("Order submitted successfully");
    } catch (err) {
      console.log(err);

      alert("Failed to submit order");
    } finally {
      setSubmitting(false);
    }
  };
  const getAvailableStock = (item) => {
    if (item.productType !== "physical") {
      return Infinity;
    }

    const hasSelectedVariants =
      item.selectedVariants && Object.keys(item.selectedVariants).length > 0;

    if (
      hasSelectedVariants &&
      Array.isArray(item.inventory) &&
      item.inventory.length > 0
    ) {
      const inventoryRow = item.inventory.find((row) =>
        Object.entries(item.selectedVariants).every(
          ([key, value]) => row.values?.[key] === value,
        ),
      );

      return Number(inventoryRow?.stock || 0);
    }

    return Number(item.stock || 0);
  };
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className={styles.header}>
          <div>
            <h2>
              {step === "cart" && "Make Payment"}

              {step === "customer" && "Checkout"}

              {step === "bank" && "Bank Transfer"}

              {step === "proof" && "Payment Proof"}

              {step === "success" && "Order Submitted"}
            </h2>

            <p>{cart.length} item(s)</p>
          </div>

          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className={styles.body}>
          {/* CART */}
          {step === "cart" && (
            <div className={styles.items}>
              {cart.map((item) => {
                const isDigitalProduct = item.productType === "digital";
                const displayQuantity = isDigitalProduct ? 1 : item.quantity;
                const itemTotal =
                  Number(item.price || 0) * Number(displayQuantity || 1);
                return (
                  <div
                    key={`${item._id}-${JSON.stringify(item.selectedVariants || {})}`}
                    className={styles.item}
                  >
                    <div className={styles.itemImage}>
                      <img
                        src={item.images?.[0] || "/placeholder.png"}
                        alt=""
                      />
                    </div>

                    <div className={styles.info}>
                      <div className={styles.itemTop}>
                        <div>
                          <h4>{item.name}</h4>
                          <span>
                            {item.productType === "digital"
                              ? "Digital product"
                              : "Physical product"}
                          </span>

                          {Object.keys(item.selectedVariants || {}).length >
                            0 && (
                            <div className={styles.variantSummary}>
                              {Object.entries(item.selectedVariants).map(
                                ([name, value]) => (
                                  <span key={name}>
                                    {name}: {value}
                                  </span>
                                ),
                              )}
                            </div>
                          )}
                        </div>

                        <button
                          className={styles.remove}
                          onClick={() => {
                            removeFromCart(
                              item._id,
                              item.selectedVariants || {},
                            );
                            showToast(
                              `${item.name} removed from cart`,
                              "error",
                            );
                          }}
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className={styles.priceRow}>
                        <div>
                          <small>Item total</small>
                          <p>₦{itemTotal.toLocaleString()}</p>
                        </div>

                        {!isDigitalProduct && (
                          <div className={styles.qty}>
                            <button
                              onClick={() => {
                                const variants = item.selectedVariants || {};

                                updateQty(
                                  item._id,
                                  Math.max(1, item.quantity - 1),
                                  variants,
                                );
                              }}
                              type="button"
                            >
                              <Minus size={14} />
                            </button>

                            <span>{item.quantity}</span>

                            <button
                              onClick={() => {
                                const availableStock = getAvailableStock(item);
                                const variants = item.selectedVariants || {};

                                if (item.quantity >= availableStock) {
                                  showToast("No more stock available", "error");
                                  return;
                                }

                                updateQty(
                                  item._id,
                                  item.quantity + 1,
                                  variants,
                                );
                              }}
                              type="button"
                              disabled={
                                item.quantity >= getAvailableStock(item)
                              }
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className={styles.unitPrice}>
                        ₦{Number(item.price || 0).toLocaleString()} each
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* CUSTOMER */}
          {step === "customer" && (
            <div className={styles.form}>
              {/* NAME */}
              <div className={styles.field}>
                <input
                  placeholder="Full Name"
                  value={customer.name}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      name: e.target.value,
                    })
                  }
                  className={errors.name ? styles.inputError : ""}
                />

                {errors.name && (
                  <small className={styles.error}>{errors.name}</small>
                )}
              </div>

              {/* EMAIL */}
              <div className={styles.field}>
                <input
                  placeholder="Email Address"
                  value={customer.email}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      email: e.target.value,
                    })
                  }
                  className={errors.email ? styles.inputError : ""}
                />

                {errors.email && (
                  <small className={styles.error}>{errors.email}</small>
                )}
              </div>

              {/* PHONE */}
              <div className={styles.field}>
                <input
                  placeholder="WhatsApp Number"
                  value={customer.phone}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      phone: e.target.value,
                    })
                  }
                  className={errors.phone ? styles.inputError : ""}
                />

                {errors.phone && (
                  <small className={styles.error}>{errors.phone}</small>
                )}
              </div>

              {/* ADDRESS */}
              {hasPhysicalProduct && (
                <div className={styles.field}>
                  <textarea
                    placeholder="Delivery Address"
                    value={customer.address}
                    onChange={(e) =>
                      setCustomer({
                        ...customer,
                        address: e.target.value,
                      })
                    }
                    className={errors.address ? styles.inputError : ""}
                  />

                  {errors.address && (
                    <small className={styles.error}>{errors.address}</small>
                  )}
                </div>
              )}
            </div>
          )}

          {/* BANK */}
          {step === "bank" && (
            <div className={styles.bank}>
              <p>
                Make Payment to the account below and click on I HAVE PAID
                immediately after
              </p>
              <div className={styles.bankCard}>
                <span>Total Amount</span>

                <strong>₦{Number(subtotal).toLocaleString()}</strong>
              </div>

              {[
                {
                  label: "Account Number",

                  value: cart[0]?.storeAccountNumber,
                },

                {
                  label: "Bank Name",

                  value: cart[0]?.storeBankName,
                },

                {
                  label: "Account Name",

                  value: cart[0]?.storeAccountName,
                },
              ].map((item, i) => (
                <div key={i} className={styles.bankCard}>
                  <span>{item.label}</span>

                  <div className={styles.copyRow}>
                    <strong>{item.value}</strong>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(item.value || "");

                        showToast(`${item.label} copied`);
                      }}
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PROOF */}
          {step === "proof" && (
            <div className={styles.proof}>
              <label className={styles.uploadBox}>
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (!file) return;

                    setProof(file);

                    setErrors((prev) => ({
                      ...prev,
                      proof: "",
                    }));
                  }}
                />

                <UploadCloud size={36} />

                {proof ? (
                  <>
                    <h4>{proof.name}</h4>

                    <p>Ready to submit</p>
                  </>
                ) : (
                  <>
                    <h4>Upload Payment Proof</h4>

                    <p>JPG, PNG or receipt screenshot</p>
                  </>
                )}
              </label>
              {errors.proof && (
                <small className={styles.error}>{errors.proof}</small>
              )}
            </div>
          )}

          {/* SUCCESS */}
          {step === "success" && (
            <div className={styles.success}>
              <CheckCircle2 size={60} />

              <h2>Order Submitted</h2>

              <p>
                Your payment is being confirmed. Check your email for more
                details on this order
              </p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className={styles.footer}>
          <div className={styles.total}>
            <span>Subtotal</span>

            <strong>₦{Number(subtotal).toLocaleString()}</strong>
          </div>

          {step === "cart" && (
            <button
              className={styles.action}
              onClick={() => {
                trackBoth(
                  "InitiateCheckout",
                  {
                    value: subtotal,
                    currency: "NGN",
                  },
                  {
                    value: subtotal,
                    currency: "NGN",
                  },
                );

                setStep("customer");
              }}
            >
              Pay With Bank Transfer
            </button>
          )}

          {step === "customer" && (
            <div className={styles.footerActions}>
              <button
                className={styles.secondary}
                onClick={() => setStep("cart")}
              >
                <ChevronLeft size={16} />
                Back
              </button>

              <button
                className={styles.action}
                onClick={() => {
                  const valid = validateCustomer();

                  if (!valid) {
                    showToast("Please fill all required fields", "error");
                    return;
                  }

                  trackBoth("Lead");

                  setStep("bank");
                }}
              >
                Continue
              </button>
            </div>
          )}

          {step === "bank" && (
            <div className={styles.footerActions}>
              <button
                className={styles.secondary}
                onClick={() => setStep("customer")}
              >
                <ChevronLeft size={16} />
                Back
              </button>
              <button
                className={styles.action}
                onClick={() => {
                  setStep("proof");
                }}
              >
                I Have Paid
              </button>
            </div>
          )}

          {step === "proof" && (
            <div className={styles.footerActions}>
              <button
                className={styles.secondary}
                onClick={() => setStep("bank")}
              >
                Back
              </button>

              <button
                className={styles.action}
                onClick={submitOrder}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Proof"}
              </button>
            </div>
          )}

          {step === "success" && (
            <button className={styles.action} onClick={onClose}>
              Close
            </button>
          )}
        </div>
      </div>
      <Toast show={toast.show} text={toast.text} type={toast.type} />
    </div>
  );
}

"use client";

import Image from "next/image";

import { Landmark, ChevronRight, ArrowLeft } from "lucide-react";

import styles from "../../styles/paymentStep.module.css";

export default function PaymentStep({ form, update, next, back, errors }) {
  return (
    <div className={styles.wrapper}>
      {/* HEADER */}
      <div className={styles.header}>
        <h2>Payment Details</h2>

        <p>
          Tell us how you want to receive payments from customers. Enter your
          payment details bellow. Don't Worry, you can edit it later on your
          Store Settings Page
        </p>
      </div>

      {/* LABEL */}
      <p className={styles.label}>Choose payment method</p>

      {/* METHODS */}
      <div className={styles.methods}>
        {/* BANK */}
        <button
          type="button"
          className={`${styles.method} ${
            form.paymentMethod === "bank" ? styles.active : ""
          }`}
          onClick={() =>
            update({
              paymentMethod: "bank",
            })
          }
        >
          <div className={styles.iconPurple}>
            <Landmark size={15} />
          </div>

          <div className={styles.methodText}>
            <h3>Bank Transfer</h3>

            <p>Receive payments into your bank account</p>
          </div>
        </button>

        {/* PAYSTACK */}
        <button type="button" className={styles.methodDisabled} disabled>
          <div className={styles.paystackBadge}>
            <img
              src="/paystack.png"
              alt="Paystack"
              className={styles.paystackWide}
            />
          </div>

          <div className={styles.methodText}>
            <div className={styles.methodTop}>
              <h3>Paystack</h3>

              <span className={styles.comingSoon}>Soon</span>
            </div>

            <p>Online payments coming soon</p>
          </div>
        </button>
      </div>

      {/* INPUTS */}
      <div className={styles.inputs}>
        <div>
          <input
            className={`${styles.input} ${
              errors.bankName ? styles.inputError : ""
            }`}
            placeholder="Bank Name"
            value={form.bankName}
            onChange={(e) =>
              update({
                bankName: e.target.value,
              })
            }
          />
          {errors.bankName && (
            <p className={styles.errorText}>{errors.bankName}</p>
          )}
        </div>
        <div>
          <input
            className={`${styles.input} ${
              errors.accountNumber ? styles.inputError : ""
            }`}
            placeholder="Account Number"
            value={form.accountNumber}
            onChange={(e) =>
              update({
                accountNumber: e.target.value,
              })
            }
          />

          {errors.accountNumber && (
            <p className={styles.errorText}>{errors.accountNumber}</p>
          )}
        </div>
        <div>
          <input
            className={`${styles.input} ${
              errors.accountName ? styles.inputError : ""
            }`}
            placeholder="Account Name"
            value={form.accountName}
            onChange={(e) =>
              update({
                accountName: e.target.value,
              })
            }
          />

          {errors.accountName && (
            <p className={styles.errorText}>{errors.accountName}</p>
          )}
        </div>
      </div>

      {/* ACTIONS */}
      <div className={styles.actions}>
        <button className={styles.backBtn} onClick={back}>
          <ArrowLeft size={15} />
          Back
        </button>

        <button className={styles.continueBtn} onClick={next}>
          Continue
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

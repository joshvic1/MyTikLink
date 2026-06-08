"use client";

import { Package, BriefcaseBusiness, ChevronDown } from "lucide-react";
import { STORE_CATEGORIES } from "@/constants/storeCategories";

import styles from "../../styles/businessStep.module.css";

export default function BusinessStep({ form, update, next, errors }) {
  return (
    <div className={styles.wrapper}>
      {/* HEADER */}
      <div className={styles.header}>
        <h2>Set up your business</h2>

        <p>Tell us about your business so we can get you started.</p>
      </div>

      {/* LABEL */}
      <p className={styles.label}>What type of business do you run?</p>

      {/* TYPES */}
      <div className={styles.types}>
        {/* PRODUCTS */}
        <button
          type="button"
          className={`${styles.typeCard} ${
            form.businessType === "physical" ? styles.active : ""
          }`}
          onClick={() =>
            update({
              businessType: "physical",
            })
          }
        >
          <div className={styles.iconPurple}>
            <Package size={15} />
          </div>

          <div className={styles.typeText}>
            <h3>Physical</h3>

            <p>Physical products/services</p>
          </div>
        </button>

        {/* SERVICES */}
        <button
          type="button"
          className={`${styles.typeCard} ${
            form.businessType === "digital" ? styles.active : ""
          }`}
          onClick={() =>
            update({
              businessType: "digital",
            })
          }
        >
          <div className={styles.iconBlue}>
            <BriefcaseBusiness size={15} />
          </div>

          <div className={styles.typeText}>
            <h3>Digital</h3>

            <p>Digital products/services</p>
          </div>
        </button>
      </div>

      {/* INPUTS */}
      <div className={styles.inputs}>
        <div>
          <input
            className={`${styles.input} ${
              errors.name ? styles.inputError : ""
            }`}
            placeholder="Store Name"
            value={form.name}
            onChange={(e) =>
              update({
                name: e.target.value,
              })
            }
          />

          {errors.name && <p className={styles.errorText}>{errors.name}</p>}
        </div>

        <div>
          <input
            className={`${styles.input} ${
              errors.phone ? styles.inputError : ""
            }`}
            placeholder="Business Phone Number"
            value={form.phone}
            onChange={(e) =>
              update({
                phone: e.target.value,
              })
            }
          />

          {errors.phone && <p className={styles.errorText}>{errors.phone}</p>}
        </div>

        <div>
          <div className={styles.selectWrap}>
            <select
              className={`${styles.select} ${
                errors.category ? styles.inputError : ""
              }`}
              value={form.category || ""}
              onChange={(e) =>
                update({
                  category: e.target.value,
                })
              }
            >
              <option value="">Select a category</option>

              {STORE_CATEGORIES[form.businessType]?.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <ChevronDown size={15} className={styles.chevron} />
          </div>

          {errors.category && (
            <p className={styles.errorText}>{errors.category}</p>
          )}
        </div>
      </div>

      {/* BUTTON */}
      <button className={styles.continueBtn} onClick={next}>
        Continue →
      </button>
    </div>
  );
}

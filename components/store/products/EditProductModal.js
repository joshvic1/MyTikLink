"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Boxes,
  CheckCircle2,
  FileText,
  ImagePlus,
  Loader2,
  Package2,
  Tag,
  Trash2,
  X,
} from "lucide-react";

import styles from "./editProductModal.module.css";

export default function EditProductModal({ open, onClose, product, onSave }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [hasVariants, setHasVariants] = useState(false);
  const [variantRows, setVariantRows] = useState([]);
  useEffect(() => {
    if (product) {
      setForm({
        productType: "physical",
        deliveryMethod: "",
        externalUrl: "",
        downloadFile: "",
        status: "draft",
        featured: false,
        images: [],
        variantGroups: [],
        inventory: [],
        ...product,
      });

      const productHasVariants =
        product.productType === "physical" &&
        Array.isArray(product.inventory) &&
        product.inventory.length > 0;

      setHasVariants(productHasVariants);

      if (productHasVariants) {
        setVariantRows(
          product.inventory.map((item, index) => {
            const values = item.values || {};
            const firstEntry = Object.entries(values)[0] || ["", ""];

            return {
              id: item._id || `${Date.now()}-${index}`,
              name: firstEntry[0],
              value: firstEntry[1],
              stock: item.stock ?? "",
              sku: item.sku || "",
            };
          }),
        );
      } else {
        setVariantRows([]);
      }
    }
  }, [product]);

  if (!open || !product) return null;

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProductTypeChange = (value) => {
    if (value === "digital") {
      setHasVariants(false);
      setVariantRows([]);
    }

    setForm((prev) => ({
      ...prev,
      productType: value,
      stock: value === "digital" ? 0 : prev.stock,
      deliveryMethod: value === "physical" ? "" : prev.deliveryMethod,
      externalUrl: value === "physical" ? "" : prev.externalUrl,
      downloadFile: value === "physical" ? "" : prev.downloadFile,
    }));
  };

  const handleDeliveryMethodChange = (value) => {
    setForm((prev) => ({
      ...prev,
      deliveryMethod: value,
      externalUrl: value === "download" ? "" : prev.externalUrl,
      downloadFile: value === "external" ? "" : prev.downloadFile,
    }));
  };

  const handleRemoveImage = (indexToRemove) => {
    setForm((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setUploadingImage(true);

      const formData = new FormData();
      formData.append("image", file);

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setForm((prev) => ({
        ...prev,
        images: [...(prev.images || []), res.data.url],
      }));

      e.target.value = "";
    } catch (err) {
      console.log(err?.response?.data || err);
      alert(err?.response?.data?.message || "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setUploadingFile(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/upload/file`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      handleChange("downloadFile", res.data.url);
    } catch (err) {
      console.log(err);
    } finally {
      setUploadingFile(false);
    }
  };
  const variantStockTotal = variantRows.reduce(
    (sum, row) => sum + Number(row.stock || 0),
    0,
  );

  const updateVariantRow = (id, data) => {
    setVariantRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...data } : row)),
    );
  };

  const addVariantRow = () => {
    setVariantRows((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: "",
        value: "",
        stock: "",
        sku: "",
      },
    ]);
  };

  const removeVariantRow = (id) => {
    setVariantRows((prev) => prev.filter((row) => row.id !== id));
  };

  const buildVariantGroups = () => {
    const groups = {};

    variantRows.forEach((row) => {
      const name = row.name.trim();
      const value = row.value.trim();

      if (!name || !value) return;

      if (!groups[name]) groups[name] = [];

      if (!groups[name].includes(value)) {
        groups[name].push(value);
      }
    });

    return Object.entries(groups).map(([name, options]) => ({
      name,
      options,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;
    if (form.productType === "physical" && hasVariants) {
      const invalidVariants =
        variantRows.length === 0 ||
        variantRows.some(
          (row) =>
            !row.name.trim() ||
            !row.value.trim() ||
            row.stock === "" ||
            Number(row.stock) < 0,
        );

      if (invalidVariants) {
        alert("Please fill all variant name, value, and stock fields.");
        return;
      }
    }
    try {
      setSaving(true);

      const payload = {
        _id: form._id,
        name: form.name,
        description: form.description || "",
        category: form.category || "General",
        price: Number(form.price || 0),
        comparePrice: form.comparePrice ? Number(form.comparePrice) : null,
        stock:
          form.productType === "digital"
            ? 0
            : hasVariants
              ? variantStockTotal
              : Number(form.stock || 0),
        sku: form.sku || "",
        productType: form.productType || "physical",
        status: form.status || "published",
        featured: Boolean(form.featured),
        images: Array.isArray(form.images) ? form.images : [],
        variantGroups:
          form.productType === "physical" && hasVariants
            ? buildVariantGroups()
            : [],

        inventory:
          form.productType === "physical" && hasVariants
            ? variantRows.map((row) => ({
                values: {
                  [row.name.trim()]: row.value.trim(),
                },
                stock: Number(row.stock || 0),
                sku: row.sku || "",
              }))
            : [],
      };

      if (payload.productType === "digital") {
        payload.deliveryMethod = form.deliveryMethod || null;

        if (form.deliveryMethod === "external") {
          payload.externalUrl = form.externalUrl || "";
        }

        if (form.deliveryMethod === "download") {
          payload.downloadFile = form.downloadFile || "";
        }
      }

      await onSave(payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.wrapper} role="dialog" aria-modal="true">
      <button
        type="button"
        className={styles.backdrop}
        onClick={saving ? undefined : onClose}
        aria-label="Close modal"
      />

      <form className={styles.modal} onSubmit={handleSubmit}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Product details</p>
            <h2>Edit Product</h2>
          </div>

          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            disabled={saving}
          >
            <X size={18} />
          </button>
        </header>

        <div className={styles.body}>
          <div className={styles.imageSection}>
            <label>Product Images</label>

            {!!form.images?.length && (
              <div className={styles.images}>
                {form.images.map((img, index) => (
                  <div key={`${img}-${index}`} className={styles.imageBox}>
                    <img src={img} alt="Product preview" />

                    <button
                      type="button"
                      className={styles.removeImageBtn}
                      onClick={() => handleRemoveImage(index)}
                      disabled={saving}
                      aria-label="Remove image"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className={styles.uploadBox}>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageUpload}
                disabled={saving || uploadingImage}
              />

              <span>
                {uploadingImage ? (
                  <Loader2 size={22} className={styles.spin} />
                ) : (
                  <ImagePlus size={22} />
                )}
              </span>

              <strong>
                {uploadingImage ? "Uploading..." : "Upload Product Image"}
              </strong>
              <small>PNG, JPG or WEBP</small>
            </label>
          </div>

          <section className={styles.card}>
            <div className={styles.sectionTitle}>
              <h3>Basic Information</h3>
              <p>Edit the product name, category, price, and type.</p>
            </div>

            <div className={styles.field}>
              <label htmlFor="name">Product Name</label>
              <div className={styles.inputWrap}>
                <Package2 size={16} />
                <input
                  id="name"
                  value={form.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter product name"
                />
              </div>
            </div>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label htmlFor="price">Price</label>
                <div className={styles.inputWrap}>
                  <Tag size={16} />
                  <input
                    id="price"
                    type="number"
                    min="0"
                    value={form.price || ""}
                    onChange={(e) => handleChange("price", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="category">Category</label>
                <div className={styles.inputWrap}>
                  <Tag size={16} />
                  <input
                    id="category"
                    value={form.category || ""}
                    onChange={(e) => handleChange("category", e.target.value)}
                    placeholder="Category"
                  />
                </div>
              </div>
            </div>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label htmlFor="productType">Product Type</label>

                <div className={styles.inputWrap}>
                  <Package2 size={16} />

                  <select
                    id="productType"
                    value={form.productType || "physical"}
                    onChange={(e) => handleProductTypeChange(e.target.value)}
                  >
                    <option value="physical">Physical Product</option>
                    <option value="digital">Digital Product</option>
                  </select>
                </div>
              </div>

              {form.productType === "physical" && (
                <div className={styles.field}>
                  <label htmlFor="stock">Stock</label>

                  <div className={styles.inputWrap}>
                    <Boxes size={16} />

                    <input
                      id="stock"
                      type="number"
                      min="0"
                      value={
                        hasVariants ? variantStockTotal : (form.stock ?? 0)
                      }
                      disabled={hasVariants}
                      onChange={(e) => handleChange("stock", e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {form.productType === "physical" && (
              <section className={styles.card}>
                <div className={styles.sectionTitle}>
                  <h3>Variants</h3>
                  <p>Edit options like size, color, type, and their stock.</p>
                </div>

                <label className={styles.toggleRow}>
                  <input
                    type="checkbox"
                    checked={hasVariants}
                    onChange={(e) => {
                      const checked = e.target.checked;

                      setHasVariants(checked);

                      if (checked && variantRows.length === 0) {
                        setVariantRows([
                          {
                            id: Date.now().toString(),
                            name: "Size",
                            value: "",
                            stock: "",
                            sku: "",
                          },
                        ]);
                      }

                      if (!checked) {
                        setVariantRows([]);
                      }
                    }}
                  />

                  <span>This product has variants</span>
                </label>

                {hasVariants && (
                  <>
                    <div className={styles.variantList}>
                      {variantRows.map((row) => (
                        <div key={row.id} className={styles.variantRow}>
                          <input
                            placeholder="Variant name e.g. Size"
                            value={row.name}
                            onChange={(e) =>
                              updateVariantRow(row.id, {
                                name: e.target.value,
                              })
                            }
                          />

                          <input
                            placeholder="Value e.g. Large"
                            value={row.value}
                            onChange={(e) =>
                              updateVariantRow(row.id, {
                                value: e.target.value,
                              })
                            }
                          />

                          <input
                            type="number"
                            min="0"
                            placeholder="Stock"
                            value={row.stock}
                            onChange={(e) =>
                              updateVariantRow(row.id, {
                                stock: e.target.value,
                              })
                            }
                          />

                          <button
                            type="button"
                            className={styles.removeVariantBtn}
                            onClick={() => removeVariantRow(row.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      className={styles.addVariantBtn}
                      onClick={addVariantRow}
                    >
                      Add variant
                    </button>

                    <p className={styles.helpText}>
                      Total stock: <strong>{variantStockTotal}</strong>
                    </p>
                  </>
                )}
              </section>
            )}
          </section>

          {form.productType === "digital" && (
            <section className={styles.card}>
              <div className={styles.sectionTitle}>
                <h3>Digital Delivery</h3>
                <p>Choose how customers will access this product.</p>
              </div>

              <div className={styles.field}>
                <label htmlFor="deliveryMethod">Delivery Method</label>
                <div className={styles.inputWrap}>
                  <FileText size={16} />
                  <select
                    id="deliveryMethod"
                    value={form.deliveryMethod || ""}
                    onChange={(e) => handleDeliveryMethodChange(e.target.value)}
                  >
                    <option value="">Select method</option>
                    <option value="external">External Link</option>
                    <option value="download">Downloadable File</option>
                  </select>
                </div>
              </div>

              {form.deliveryMethod === "external" && (
                <div className={styles.field}>
                  <label htmlFor="externalUrl">External Product Link</label>
                  <div className={styles.inputWrap}>
                    <FileText size={16} />
                    <input
                      id="externalUrl"
                      value={form.externalUrl || ""}
                      onChange={(e) =>
                        handleChange("externalUrl", e.target.value)
                      }
                      placeholder="https://..."
                    />
                  </div>
                </div>
              )}

              {form.deliveryMethod === "download" && (
                <div className={styles.field}>
                  <label>Downloadable Product File</label>

                  <label className={styles.fileUpload}>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      disabled={saving || uploadingFile}
                    />

                    {uploadingFile ? (
                      <>
                        <Loader2 size={18} className={styles.spin} />
                        Uploading file...
                      </>
                    ) : form.downloadFile ? (
                      <>
                        <CheckCircle2 size={18} />
                        File uploaded
                      </>
                    ) : (
                      <>
                        <ImagePlus size={18} />
                        Upload file
                      </>
                    )}
                  </label>

                  {form.downloadFile && (
                    <a
                      href={form.downloadFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.fileLink}
                    >
                      View current file
                    </a>
                  )}
                </div>
              )}
            </section>
          )}

          <section className={styles.card}>
            <div className={styles.sectionTitle}>
              <h3>Visibility</h3>
              <p>Control whether this product appears in your store.</p>
            </div>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label htmlFor="status">Status</label>
                <div className={styles.inputWrap}>
                  <select
                    id="status"
                    value={form.status || "draft"}
                    onChange={(e) => handleChange("status", e.target.value)}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="featured">Featured</label>
                <div className={styles.inputWrap}>
                  <select
                    id="featured"
                    value={String(Boolean(form.featured))}
                    onChange={(e) =>
                      handleChange("featured", e.target.value === "true")
                    }
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.sectionTitle}>
              <h3>Description</h3>
              <p>Keep the product description clear and useful.</p>
            </div>

            <div className={`${styles.inputWrap} ${styles.textareaWrap}`}>
              <FileText size={16} />
              <textarea
                id="description"
                rows={4}
                value={form.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Write a short product description"
              />
            </div>
          </section>
        </div>

        <footer className={styles.footer}>
          <button
            type="button"
            className={styles.cancel}
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className={styles.save}
            disabled={saving || uploadingImage || uploadingFile}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </footer>
      </form>
    </div>
  );
}

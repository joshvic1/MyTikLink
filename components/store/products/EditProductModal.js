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
        ...product,
      });
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

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    setForm((prev) => ({
      ...prev,
      images: [...(prev.images || []), previewUrl],
    }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    try {
      setSaving(true);

      const payload = {
        _id: form._id,
        name: form.name,
        description: form.description || "",
        category: form.category || "General",
        price: Number(form.price || 0),
        comparePrice: form.comparePrice ? Number(form.comparePrice) : null,
        stock: form.productType === "digital" ? 0 : Number(form.stock || 0),
        sku: form.sku || "",
        productType: form.productType || "physical",
        status: form.status || "published",
        featured: Boolean(form.featured),
        images: Array.isArray(form.images) ? form.images : [],
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

            {!!form.images?.length ? (
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
            ) : (
              <label className={styles.uploadBox}>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageUpload}
                  disabled={saving}
                />

                <span>
                  <ImagePlus size={22} />
                </span>

                <strong>Upload Product Image</strong>
                <small>PNG, JPG or WEBP</small>
              </label>
            )}
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
                      value={form.stock ?? 0}
                      onChange={(e) => handleChange("stock", e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
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

          <button type="submit" className={styles.save} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </footer>
      </form>
    </div>
  );
}

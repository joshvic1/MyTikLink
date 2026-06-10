"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Boxes,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Loader2,
  Package2,
  Plus,
  Tag,
  Trash2,
  X,
} from "lucide-react";

import { createProduct } from "@/services/productService";
import styles from "../styles/addProductModal.module.css";

const initialForm = {
  name: "",
  price: "",
  productType: "",
  deliveryMethod: "",
  externalUrl: "",
  downloadFile: "",
  category: "",
  stock: "",
  description: "",
  image: "",
};

const PRESET_VARIANTS = [
  "Size",
  "Color",
  "Weight",
  "Material",
  "Style",
  "Capacity",
  "Length",
  "Custom",
];

export default function AddProductModal({ open, onClose }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [hasVariants, setHasVariants] = useState(false);
  const [variantGroups, setVariantGroups] = useState([]);
  const [variantRows, setVariantRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  if (!open) return null;

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const update = (data) => {
    setForm((prev) => ({
      ...prev,
      ...data,
    }));

    setErrors((prev) => {
      const next = { ...prev };

      Object.keys(data).forEach((key) => {
        delete next[key];
      });

      return next;
    });
  };

  const resetAndClose = () => {
    if (loading || uploadingImage || uploadingFile) return;

    setForm(initialForm);
    setErrors({});
    setHasVariants(false);
    setVariantGroups([]);
    setVariantRows([]);
    onClose();
  };

  const validate = () => {
    const newErrors = {};

    if (!form.image) newErrors.image = "Product image is required";
    if (!form.name.trim()) newErrors.name = "Product name is required";
    if (!form.price) newErrors.price = "Price is required";
    if (!form.productType) newErrors.productType = "Select a product type";
    if (!form.category.trim()) newErrors.category = "Category is required";

    if (form.productType === "physical" && !hasVariants && !form.stock) {
      newErrors.stock = "Stock is required";
    }

    if (form.productType === "physical" && hasVariants) {
      if (variantRows.length === 0) {
        newErrors.variants = "Add at least one variant";
      }

      const hasInvalidVariant = variantRows.some(
        (row) =>
          !row.name.trim() ||
          !row.value.trim() ||
          row.stock === "" ||
          Number(row.stock) < 0,
      );

      if (hasInvalidVariant) {
        newErrors.variants = "Fill variant name, value, and stock for each row";
      }

      if (variantStockTotal <= 0) {
        newErrors.variants = "Total variant stock must be greater than 0";
      }
    }

    if (form.productType === "digital" && !form.deliveryMethod) {
      newErrors.deliveryMethod = "Select delivery method";
    }

    if (
      form.productType === "digital" &&
      form.deliveryMethod === "external" &&
      !form.externalUrl.trim()
    ) {
      newErrors.externalUrl = "External link is required";
    }

    if (
      form.productType === "digital" &&
      form.deliveryMethod === "download" &&
      !form.downloadFile
    ) {
      newErrors.downloadFile = "Upload product file";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const uploadImage = async (file) => {
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

      update({ image: res.data.url });
    } catch (err) {
      console.log(err);
    } finally {
      setUploadingImage(false);
    }
  };

  const uploadFile = async (file) => {
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

      update({ downloadFile: res.data.url });
    } catch (err) {
      console.log(err);
    } finally {
      setUploadingFile(false);
    }
  };

  const addVariantGroup = (name) => {
    const nextName = name === "Custom" ? prompt("Enter variant name") : name;

    if (!nextName) return;

    const exists = variantGroups.some(
      (group) => group.name.toLowerCase() === nextName.toLowerCase(),
    );

    if (exists) return;

    setVariantGroups((prev) => [
      ...prev,
      {
        name: nextName,
        options: [],
        input: "",
      },
    ]);
  };

  const updateVariantInput = (index, value) => {
    setVariantGroups((prev) =>
      prev.map((group, groupIndex) =>
        groupIndex === index ? { ...group, input: value } : group,
      ),
    );
  };

  const addVariantOption = (index) => {
    setVariantGroups((prev) =>
      prev.map((group, groupIndex) => {
        if (groupIndex !== index) return group;

        const value = group.input.trim();

        if (!value || group.options.includes(value)) return group;

        return {
          ...group,
          input: "",
          options: [...group.options, value],
        };
      }),
    );
  };

  const removeVariantOption = (groupIndex, optionIndex) => {
    setVariantGroups((prev) =>
      prev.map((group, index) =>
        index === groupIndex
          ? {
              ...group,
              options: group.options.filter((_, i) => i !== optionIndex),
            }
          : group,
      ),
    );
  };

  const removeVariantGroup = (groupName) => {
    setVariantGroups((prev) =>
      prev.filter((group) => group.name !== groupName),
    );
  };
  const variantStockTotal = variantRows.reduce(
    (sum, row) => sum + Number(row.stock || 0),
    0,
  );

  const addVariantRow = (name = "") => {
    setVariantRows((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name,
        value: "",
        stock: "",
      },
    ]);
  };

  const updateVariantRow = (id, data) => {
    setVariantRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...data } : row)),
    );
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

      if (!groups[name]) {
        groups[name] = [];
      }

      if (!groups[name].includes(value)) {
        groups[name].push(value);
      }
    });

    return Object.entries(groups).map(([name, options]) => ({
      name,
      options,
    }));
  };
  const variantsReady =
    !hasVariants ||
    (variantRows.length > 0 &&
      variantRows.every(
        (row) =>
          row.name.trim() &&
          row.value.trim() &&
          row.stock !== "" &&
          Number(row.stock) >= 0,
      ) &&
      variantStockTotal > 0);

  const canCreate =
    form.image &&
    form.name.trim() &&
    form.price &&
    form.productType &&
    form.category.trim() &&
    (form.productType !== "physical" || hasVariants || form.stock) &&
    (form.productType !== "physical" || variantsReady);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate() || loading) return;

    if (!token) {
      console.log("No token found");
      return;
    }

    try {
      setLoading(true);

      const productPayload = {
        name: form.name,
        description: form.description,
        images: [form.image],
        productType: form.productType,
        category: form.category,
        price: Number(form.price),
        stock:
          form.productType === "physical"
            ? hasVariants
              ? variantStockTotal
              : Number(form.stock || 0)
            : 0,

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
                sku: "",
              }))
            : [],
      };

      if (form.productType === "digital") {
        productPayload.deliveryMethod = form.deliveryMethod;

        if (form.deliveryMethod === "external") {
          productPayload.externalUrl = form.externalUrl;
        }

        if (form.deliveryMethod === "download") {
          productPayload.downloadFile = form.downloadFile;
        }
      }

      await createProduct(productPayload, token);
      toast.success("Product created successfully");
      setForm(initialForm);
      setErrors({});
      setHasVariants(false);
      setVariantGroups([]);
      setVariantRows([]);
      onClose();
    } catch (err) {
      console.log(err?.response?.data || err);
      toast.error(err?.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <button
        type="button"
        className={styles.backdrop}
        onClick={resetAndClose}
        aria-label="Close add product modal"
      />

      <form className={styles.sheet} onSubmit={handleSubmit}>
        <div className={styles.handle} />

        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>New product</p>
            <h2>Add New Product</h2>
          </div>

          <button
            type="button"
            className={styles.closeBtn}
            onClick={resetAndClose}
            disabled={loading}
          >
            <X size={18} />
          </button>
        </header>

        <div className={styles.content}>
          <section className={styles.section}>
            <div className={styles.sectionTitle}>
              <h3>Product Image</h3>
              <p>Upload a clear image customers can recognize quickly.</p>
            </div>

            <label className={styles.uploadBox}>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => uploadImage(e.target.files?.[0])}
                disabled={uploadingImage || loading}
              />

              {form.image ? (
                <div className={styles.previewWrap}>
                  <img src={form.image} alt="Product preview" />

                  <button
                    type="button"
                    className={styles.deleteImage}
                    onClick={(e) => {
                      e.preventDefault();
                      update({ image: "" });
                    }}
                    disabled={loading}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ) : (
                <div className={styles.uploadContent}>
                  <span>
                    {uploadingImage ? (
                      <Loader2 size={22} className={styles.spin} />
                    ) : (
                      <ImageIcon size={22} />
                    )}
                  </span>

                  <strong>
                    {uploadingImage
                      ? "Uploading image..."
                      : "Upload Product Image"}
                  </strong>
                  <small>PNG, JPG or WEBP</small>
                </div>
              )}
            </label>

            {errors.image && <p className={styles.error}>{errors.image}</p>}
          </section>

          <section className={styles.card}>
            <div className={styles.sectionTitle}>
              <h3>Basic Information</h3>
              <p>Name, price, category, and product type.</p>
            </div>

            <div className={styles.field}>
              <label>Product Name</label>
              <div className={styles.inputWrap}>
                <Package2 size={16} />
                <input
                  placeholder="e.g. Premium Cotton Hoodie"
                  value={form.name}
                  onChange={(e) => update({ name: e.target.value })}
                />
              </div>
              {errors.name && <p className={styles.error}>{errors.name}</p>}
            </div>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label>Price</label>
                <div className={styles.inputWrap}>
                  <Tag size={16} />
                  <input
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={form.price}
                    onChange={(e) => update({ price: e.target.value })}
                  />
                </div>
                {errors.price && <p className={styles.error}>{errors.price}</p>}
              </div>

              <div className={styles.field}>
                <label>Category</label>
                <div className={styles.inputWrap}>
                  <Tag size={16} />
                  <input
                    placeholder="Fashion, Electronics..."
                    value={form.category}
                    onChange={(e) => update({ category: e.target.value })}
                  />
                </div>
                {errors.category && (
                  <p className={styles.error}>{errors.category}</p>
                )}
              </div>
            </div>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label>Product Type</label>
                <div className={styles.inputWrap}>
                  <Package2 size={16} />
                  <select
                    value={form.productType}
                    onChange={(e) => {
                      const productType = e.target.value;

                      update({
                        productType,
                        deliveryMethod: "",
                        externalUrl: "",
                        downloadFile: "",
                        stock: productType === "digital" ? "" : form.stock,
                      });

                      if (productType === "digital") {
                        setHasVariants(false);
                        setVariantGroups([]);
                        setVariantRows([]);
                      }
                    }}
                  >
                    <option value="">Select type</option>
                    <option value="physical">Physical Product</option>
                    <option value="digital">Digital Product</option>
                  </select>
                </div>
                {errors.productType && (
                  <p className={styles.error}>{errors.productType}</p>
                )}
              </div>

              {form.productType === "physical" && (
                <div className={styles.field}>
                  <label>Stock Quantity</label>
                  <div className={styles.inputWrap}>
                    <Boxes size={16} />
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={hasVariants ? variantStockTotal : form.stock}
                      disabled={hasVariants}
                      onChange={(e) => update({ stock: e.target.value })}
                    />
                    {hasVariants && (
                      <p className={styles.helpText}>
                        Stock is calculated from your variant stock.
                      </p>
                    )}
                  </div>
                  {errors.stock && (
                    <p className={styles.error}>{errors.stock}</p>
                  )}
                </div>
              )}
            </div>
          </section>

          {form.productType === "digital" && (
            <section className={styles.card}>
              <div className={styles.sectionTitle}>
                <h3>Digital Delivery</h3>
                <p>Choose how customers receive this digital product.</p>
              </div>

              <div className={styles.field}>
                <label>Delivery Method</label>
                <div className={styles.inputWrap}>
                  <FileText size={16} />
                  <select
                    value={form.deliveryMethod}
                    onChange={(e) =>
                      update({
                        deliveryMethod: e.target.value,
                        externalUrl: "",
                        downloadFile: "",
                      })
                    }
                  >
                    <option value="">Select method</option>
                    <option value="download">Downloadable File</option>
                    <option value="external">External Link</option>
                  </select>
                </div>
                {errors.deliveryMethod && (
                  <p className={styles.error}>{errors.deliveryMethod}</p>
                )}
              </div>

              {form.deliveryMethod === "external" && (
                <div className={styles.field}>
                  <label>External Product Link</label>
                  <div className={styles.inputWrap}>
                    <FileText size={16} />
                    <input
                      placeholder="https://..."
                      value={form.externalUrl}
                      onChange={(e) => update({ externalUrl: e.target.value })}
                    />
                  </div>
                  {errors.externalUrl && (
                    <p className={styles.error}>{errors.externalUrl}</p>
                  )}
                </div>
              )}

              {form.deliveryMethod === "download" && (
                <div className={styles.field}>
                  <label>Upload Product File</label>

                  <label className={styles.fileUpload}>
                    <input
                      type="file"
                      onChange={(e) => uploadFile(e.target.files?.[0])}
                      disabled={uploadingFile || loading}
                    />

                    {uploadingFile ? (
                      <>
                        <Loader2 size={18} className={styles.spin} />
                        Uploading file...
                      </>
                    ) : form.downloadFile ? (
                      <>
                        <CheckCircle2 size={18} />
                        File uploaded successfully
                      </>
                    ) : (
                      <>
                        <Plus size={18} />
                        Choose file
                      </>
                    )}
                  </label>

                  {errors.downloadFile && (
                    <p className={styles.error}>{errors.downloadFile}</p>
                  )}
                </div>
              )}
            </section>
          )}

          {form.productType === "physical" && (
            <section className={styles.card}>
              <div className={styles.sectionTitle}>
                <h3>Variants</h3>
                <p>
                  Add options like size, color, material, or custom choices.
                </p>
              </div>

              <label className={styles.toggleRow}>
                <input
                  type="checkbox"
                  checked={hasVariants}
                  onChange={(e) => {
                    const checked = e.target.checked;

                    setHasVariants(checked);

                    if (!checked) {
                      setVariantRows([]);
                    }

                    if (checked) {
                      update({ stock: "" });
                    }
                  }}
                />
                <span>This product has variants</span>
              </label>

              {hasVariants && (
                <div className={styles.variantArea}>
                  <div className={styles.presetGrid}>
                    {PRESET_VARIANTS.map((name) => (
                      <button
                        key={name}
                        type="button"
                        className={styles.presetBtn}
                        onClick={() => {
                          if (name === "Custom") {
                            addVariantRow("");
                            return;
                          }

                          addVariantRow(name);
                        }}
                      >
                        <Plus size={13} />
                        {name}
                      </button>
                    ))}
                  </div>

                  <div className={styles.variantRows}>
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
                          className={styles.removeVariant}
                          onClick={() => removeVariantRow(row.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className={styles.variantTotal}>
                    <span>Total variant stock</span>
                    <strong>{variantStockTotal}</strong>
                  </div>

                  {errors.variants && (
                    <p className={styles.error}>{errors.variants}</p>
                  )}
                </div>
              )}
            </section>
          )}

          <section className={styles.card}>
            <div className={styles.sectionTitle}>
              <h3>Description</h3>
              <p>Keep it short, useful, and clear.</p>
            </div>

            <div className={`${styles.inputWrap} ${styles.textareaWrap}`}>
              <FileText size={16} />
              <textarea
                placeholder="Describe your product..."
                value={form.description}
                onChange={(e) => update({ description: e.target.value })}
              />
            </div>
          </section>
        </div>

        <footer className={styles.footer}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={resetAndClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className={styles.saveBtn}
            disabled={loading || !canCreate}
          >
            {loading ? (
              <>
                <Loader2 size={18} className={styles.spin} />
                Creating...
              </>
            ) : (
              "Create Product"
            )}
          </button>
        </footer>
      </form>
    </div>
  );
}

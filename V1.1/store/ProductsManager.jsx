import ProductActions from "./ProductActions";
import ui from "./ProductsManager.module.css";
import {X,FileText,TriangleAlert,SlidersHorizontal,LayoutGrid,List,MoreHorizontal,Share2,BarChart3} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  ChevronDown,
  Copy,
  ExternalLink,
  ImagePlus,
  Loader2,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import {
  Badge,
  Button,
  EmptyState,
  Field,
  IconButton,
  Modal,
  PageHeader,
} from "../components/UI";
import { notify } from "../components/Notifications";
import { apiRequest, v11Api } from "../lib/api";
import ProductEditor from "./ProductEditor";
import styles from "../styles/v11.module.css";

const ProductForm = ProductEditor;

const money = (value) => `₦${Number(value || 0).toLocaleString()}`;
const emptyForm = {
  name: "",
  description: "",
  category: "General",
  price: "",
  comparePrice: "",
  stock: "",
  sku: "",
  productType: "physical",
  status: "published",
  featured: false,
  images: [],
  deliveryMethod: "",
  externalUrl: "",
  downloadFile: "",
};

function LegacyProductForm({ product, onClose, onSaved }) {
  const [form, setForm] = useState(() =>
    product
      ? {
          ...emptyForm,
          ...product,
          price: String(product.price ?? ""),
          comparePrice: product.comparePrice ?? "",
          stock: String(product.stock ?? ""),
          images: product.images || [],
        }
      : emptyForm,
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false),
    [uploading, setUploading] = useState(false);
  const changed = useRef(false);
  const update = (key, value) => {
    changed.current = true;
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };
  const close = () => {
    if (saving) return;
    if (
      !changed.current ||
      window.confirm("Discard your unsaved product changes?")
    )
      onClose();
  };
  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) {
      setErrors((current) => ({
        ...current,
        images: "Use a PNG, JPG, or WEBP image.",
      }));
      return;
    }
    try {
      setUploading(true);
      const body = new FormData();
      body.append("image", file);
      const result = await apiRequest("/upload", { method: "POST", body });
      update("images", [...form.images, result.url]);
    } catch (error) {
      setErrors((current) => ({
        ...current,
        images: error.message || "Image upload failed.",
      }));
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };
  const uploadDownload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const body = new FormData();
      body.append("file", file);
      const result = await apiRequest("/upload/file", { method: "POST", body });
      update("downloadFile", result.url);
    } catch (error) {
      setErrors((current) => ({
        ...current,
        downloadFile: error.message || "File upload failed.",
      }));
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };
  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Enter a product name.";
    if (!(Number(form.price) > 0)) nextErrors.price = "Enter a valid price.";
    if (!form.images.length)
      nextErrors.images = "Add at least one product image.";
    if (
      form.productType === "physical" &&
      (form.stock === "" || Number(form.stock) < 0)
    )
      nextErrors.stock = "Enter available stock.";
    if (form.productType === "digital" && !form.deliveryMethod)
      nextErrors.deliveryMethod = "Choose how customers receive it.";
    if (
      form.productType === "digital" &&
      form.deliveryMethod === "external" &&
      !form.externalUrl.trim()
    )
      nextErrors.externalUrl = "Enter the delivery link.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const payload = {
      ...form,
      name: form.name.trim(),
      category: form.category.trim() || "General",
      description: form.description.trim(),
      price: Number(form.price),
      comparePrice: form.comparePrice === "" ? null : Number(form.comparePrice),
      stock: form.productType === "physical" ? Number(form.stock) : 0,
      featured: Boolean(form.featured),
      deliveryMethod:
        form.productType === "digital" ? form.deliveryMethod : null,
      externalUrl:
        form.productType === "digital" ? form.externalUrl.trim() : "",
      downloadFile: form.productType === "digital" ? form.downloadFile : "",
    };
    try {
      setSaving(true);
      const saved = product?._id
        ? await v11Api.updateProduct(product._id, payload)
        : await v11Api.createProduct(payload);
      notify.success(product ? "Product updated" : "Product added");
      onSaved(saved);
    } catch (error) {
      notify.error(error.message || "Couldn’t save this product.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <Modal
      tone="peach"
      wide
      className={styles.productModal}
      title={product ? "Edit product" : "Add product"}
      description="Keep the essentials clear for your customers."
      onClose={close}
      footer={
        <>
          <Button
            variant="secondary"
            type="button"
            onClick={close}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="v11-product-form"
            disabled={saving || uploading}
          >
            {saving ? "Saving…" : product ? "Save changes" : "Add product"}
          </Button>
        </>
      }
    >
      <form
        id="v11-product-form"
        className={styles.productForm}
        onSubmit={submit}
      >
        <section className={styles.productFormSection}>
          <div className={styles.productSectionHeading}>
            <b>Product media</b>
            <small>One clear image is required.</small>
          </div>
          <div className={styles.productMediaRow}>
            {form.images.map((image, index) => (
              <div
                className={styles.productImagePreview}
                key={`${image}-${index}`}
              >
                <img src={image} alt="Product" />
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={() =>
                    update(
                      "images",
                      form.images.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                >
                  ×
                </button>
              </div>
            ))}
            <label className={styles.productUpload}>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={upload}
                disabled={uploading}
              />
              {uploading ? <Loader2 className={styles.spin} /> : <ImagePlus />}
              <span>{uploading ? "Uploading" : "Add image"}</span>
            </label>
          </div>
          {errors.images && (
            <p className={styles.fieldError}>{errors.images}</p>
          )}
        </section>
        <section className={styles.productFormSection}>
          <div className={styles.productSectionHeading}>
            <b>Basic information</b>
          </div>
          <Field label="Product name" error={errors.name}>
            <input
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
              placeholder="e.g. Everyday tote bag"
            />
          </Field>
          <div className={styles.productFormGrid}>
            <Field label="Category">
              <input
                value={form.category}
                onChange={(event) => update("category", event.target.value)}
                placeholder="e.g. Accessories"
              />
            </Field>
            <Field label="Product type">
              <select
                value={form.productType}
                onChange={(event) => update("productType", event.target.value)}
              >
                <option value="physical">Physical product</option>
                <option value="digital">Digital product</option>
              </select>
            </Field>
          </div>
          <Field label="Description">
            <textarea
              rows="3"
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              placeholder="A short, useful description"
            />
          </Field>
        </section>
        <section className={styles.productFormSection}>
          <div className={styles.productSectionHeading}>
            <b>Price & inventory</b>
          </div>
          <div className={styles.productFormGrid}>
            <Field label="Selling price (₦)" error={errors.price}>
              <input
                inputMode="decimal"
                value={form.price}
                onChange={(event) => update("price", event.target.value)}
                placeholder="0"
              />
            </Field>
            <Field label="Compare-at price (optional)">
              <input
                inputMode="decimal"
                value={form.comparePrice}
                onChange={(event) => update("comparePrice", event.target.value)}
                placeholder="0"
              />
            </Field>
            {form.productType === "physical" && (
              <Field label="Available stock" error={errors.stock}>
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(event) => update("stock", event.target.value)}
                  placeholder="0"
                />
              </Field>
            )}
            <Field label="SKU (optional)">
              <input
                value={form.sku}
                onChange={(event) => update("sku", event.target.value)}
                placeholder="Store reference"
              />
            </Field>
          </div>
        </section>
        {form.productType === "digital" && (
          <section className={styles.productFormSection}>
            <div className={styles.productSectionHeading}>
              <b>Digital delivery</b>
            </div>
            <Field label="Delivery method" error={errors.deliveryMethod}>
              <select
                value={form.deliveryMethod}
                onChange={(event) =>
                  update("deliveryMethod", event.target.value)
                }
              >
                <option value="">Choose a method</option>
                <option value="external">External link</option>
                <option value="download">Downloadable file</option>
              </select>
            </Field>
            {form.deliveryMethod === "external" && (
              <Field label="Delivery link" error={errors.externalUrl}>
                <input
                  type="url"
                  value={form.externalUrl}
                  onChange={(event) =>
                    update("externalUrl", event.target.value)
                  }
                  placeholder="https://…"
                />
              </Field>
            )}
          </section>
        )}
        <section className={styles.productVisibility}>
          <label>
            <input
              type="checkbox"
              checked={form.status === "published"}
              onChange={(event) =>
                update("status", event.target.checked ? "published" : "draft")
              }
            />
            <span>
              <b>Publish to storefront</b>
              <small>Customers can see and buy this product.</small>
            </span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={Boolean(form.featured)}
              onChange={(event) => update("featured", event.target.checked)}
            />
            <span>
              <b>Feature this product</b>
              <small>Show it in your selected store areas.</small>
            </span>
          </label>
        </section>
      </form>
    </Modal>
  );
}

export default function ProductsManager({
  onDataChange,
  openRequested = false,
  onOpenHandled,
}) {
  const [selected, setSelected] = useState([]),
    [bulk, setBulk] = useState(""),
    [bulkBusy, setBulkBusy] = useState(false);
  const [products, setProducts] = useState([]),
    [total, setTotal] = useState(0),
    [hasMore, setHasMore] = useState(false),
    [page, setPage] = useState(1),
    [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [search, setSearch] = useState(""),
    [status, setStatus] = useState("all"),
    [stock, setStock] = useState("all"),
    [sort, setSort] = useState("newest"),
    [editing, setEditing] = useState(null),
    [confirming, setConfirming] = useState(null),
    [deleting, setDeleting] = useState(false);
  const [summary,setSummary]=useState({total:0,active:0,drafts:0,out:0});
  const [filters,setFilters]=useState(false);
  const load = async (nextPage = 1, append = false) => {
    try {
      setLoading(!append);
      setError("");
      const result = await v11Api.products({
        page: nextPage,
        search,
        status,
        stock,
        sort,
      });
      const rows = result.products || [];
      if (!append) setSelected([]);
      setProducts((current) => (append ? [...current, ...rows] : rows));
      setTotal(result.total ?? rows.length);
      if(result.summary)setSummary(result.summary);
      setHasMore(Boolean(result.hasMore));
      setPage(nextPage);
    } catch (requestError) {
      setError(requestError.message || "Couldn’t load products.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const timer = setTimeout(() => load(), search ? 220 : 0);
    return () => clearTimeout(timer);
  }, [search, status, stock, sort]);
  useEffect(() => {
    v11Api
      .store()
      .then(setStore)
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (openRequested) {
      setEditing({});
      onOpenHandled?.();
    }
  }, [openRequested, onOpenHandled]);
  const metrics = summary;
  const saved = () => {
    setEditing(null);
    load();
    onDataChange?.();
  };
  const productUrl = (product) =>
    `${window.location.origin}/v1-1/s/${store?.slug || ""}/products/${encodeURIComponent(product.slug)}`;
  const copy = async (product) => {
    if (!store?.slug)
      return notify.error("Your storefront link is not ready yet.");
    try {
      await navigator.clipboard.writeText(productUrl(product));
      notify.success("Product link copied");
    } catch {
      notify.error("Couldn’t copy the product link.");
    }
  };
  const remove = async () => {
    try {
      setDeleting(true);
      await apiRequest(
        `/v1-1/store-studio/commerce/products/${confirming._id}`,
        { method: "DELETE" },
      );
      notify.success("Product deleted");
      setConfirming(null);
      load();
      onDataChange?.();
    } catch (requestError) {
      notify.error(requestError.message || "Couldn’t delete this product.");
    } finally {
      setDeleting(false);
    }
  };
  return (
    <div className={`${styles.managementPage} ${ui.page}`}>
      <PageHeader title="Products"/>
      <div className={ui.toolbar}><label className={ui.search}><Search size={18}/><input aria-label="Search products" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products…"/></label><button aria-label="Filter products" aria-expanded={filters} className={filters?ui.chosen:''} onClick={()=>setFilters(!filters)}><SlidersHorizontal size={18}/></button></div>
      {filters&&<div className={ui.filters}><label>Stock<select value={stock} onChange={e=>setStock(e.target.value)}><option value="all">All stock</option><option value="in">In stock</option><option value="out">Out of stock</option></select></label><label>Sort by<select value={sort} onChange={e=>setSort(e.target.value)}><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="priceHigh">Highest price</option><option value="priceLow">Lowest price</option><option value="name">Name</option></select></label></div>}
      <div className={ui.tabs} aria-label="Product status">{[['All',summary.total,'all','all'],['Active',metrics.active,'published','all'],['Draft',metrics.drafts,'draft','all'],['Out of stock',metrics.out,'all','out']].map(([label,count,state,inventory])=><button key={label} aria-pressed={status===state&&stock===inventory} className={status===state&&stock===inventory?ui.tabActive:''} onClick={()=>{setStatus(state);setStock(inventory);}}>{label} ({count})</button>)}</div>
      {error ? (
        <div className={styles.managementError}>
          {error}
          <Button variant="secondary" onClick={() => load()}>
            Try again
          </Button>
        </div>
      ) : loading ? (
        <div className={styles.managementLoading}>
          <Loader2 className={styles.spin} /> Loading products…
        </div>
      ) : !products.length ? (
        <EmptyState
          icon={<Package />}
          title={
            search || status !== "all" || stock !== "all"
              ? "No matching products"
              : "Add your first product"
          }
          description={
            search || status !== "all" || stock !== "all"
              ? "Try a different search or filter."
              : "Create a product to start selling from your storefront."
          }
          action={
            !search && status === "all" && stock === "all" ? (
              <Button onClick={() => setEditing({})}>
                <Plus /> Add product
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className={ui.products}>
            {products.map(product=><article className={`${ui.card} ${selected.includes(product._id)?ui.selected:''}`} key={product._id}>
              <div className={ui.image}><img src={product.images?.[0]||'/placeholder.png'} alt=""/><input type="checkbox" aria-label={`Select ${product.name}`} checked={selected.includes(product._id)} onChange={e=>setSelected(ids=>e.target.checked?(ids.length<50?[...ids,product._id]:ids):ids.filter(id=>id!==product._id))}/></div>
              <div className={ui.info}><button className={ui.title} title={product.name} onClick={()=>setEditing(product)}>{product.name}</button><div className={ui.price}>{money(product.price)}{Number(product.comparePrice)>Number(product.price)&&<del>{money(product.comparePrice)}</del>}</div><div className={ui.meta}><span className={product.status==='published'?ui.active:ui.draft}><i/>{product.status==='published'?'Active':'Draft'}</span><small>{product.productType==='digital'?'Digital':product.trackStock===false?'Stock not tracked':Number(product.stock)>0?`In stock: ${product.stock}`:'Out of stock'}</small></div></div>
              <ProductActions name={product.name} items={[
 {label:'Edit product',Icon:Pencil,run:()=>setEditing(product)},
 {label:'Duplicate product',Icon:Copy,run:()=>{const {_id,slug,__v,createdAt,updatedAt,...draft}=product;setEditing({...draft,name:product.name+' (copy)',status:'draft',sku:''});}},
 {label:'Copy link',Icon:Share2,run:()=>copy(product)},
 {label:'View product',Icon:ExternalLink,run:()=>store?.slug?window.open(productUrl(product),'_blank','noopener,noreferrer'):notify.error('Your storefront link is not ready yet.')},
 {label:'Delete product',Icon:Trash2,danger:true,run:()=>setConfirming(product)}
 ]}/><div className={ui.actions}><button aria-label={`Edit ${product.name}`} onClick={()=>setEditing(product)}><Pencil size={14}/></button><button aria-label={`View ${product.name}`} onClick={()=>store?.slug?window.open(productUrl(product),"_blank","noopener,noreferrer"):notify.error("Your storefront link is not ready yet.")}><ExternalLink size={14}/></button><button aria-label={`Copy link for ${product.name}`} onClick={()=>copy(product)}><Share2 size={14}/></button></div>
            </article>)}
          </div>
          {hasMore && (
            <Button
              variant="secondary"
              className={styles.loadMoreButton}
              onClick={() => load(page + 1, true)}
            >
              Load more <ChevronDown />
            </Button>
          )}
        </>
      )}
      {selected.length>0&&<div className={ui.bulk} role="region" aria-label="Selected product actions"><label><input type="checkbox" aria-label="Select visible products" checked={products.length>0&&products.slice(0,50).every(p=>selected.includes(p._id))} onChange={e=>setSelected(e.target.checked?products.slice(0,50).map(p=>p._id):[])}/><span>{selected.length} selected</span></label><button className={ui.clearSelection} aria-label="Clear selection" onClick={()=>setSelected([])}><X size={14}/></button><button disabled={!selected.length} onClick={()=>setBulk('published')}><Archive size={13}/>Publish</button><button disabled={!selected.length} onClick={()=>setBulk('draft')}><FileText size={13}/>Unpublish</button><button disabled={!selected.length} onClick={()=>setBulk('duplicate')}><Copy size={13}/>Duplicate</button><button disabled={!selected.length} onClick={()=>setBulk('delete')}><Trash2 size={13}/>Delete</button></div>}
      {bulk && (
        <Modal
          tone="teal"
          title={
            bulk === "delete" ? "Delete selected products?" : bulk === "duplicate" ? "Duplicate selected products?" : bulk === "draft"
              ? "Move selected products to draft?"
              : "Publish selected products?"
          }
          description={bulk === "delete" ? `${selected.length} products will be deleted. Existing orders stay intact. This cannot be undone.` : bulk === "duplicate" ? `${selected.length} products will be copied as drafts.` : `${selected.length} selected products will be updated. Prices and stock stay unchanged.`}
          onClose={() => !bulkBusy && setBulk("")}
          footer={
            <>
              <Button
                variant="secondary"
                disabled={bulkBusy}
                onClick={() => setBulk("")}
              >
                Cancel
              </Button>
              <Button
                disabled={bulkBusy}
                onClick={async () => {
                  setBulkBusy(true);
                  try {
                    if (bulk==='delete'||bulk==='duplicate') {
                      let completed=0;
                      try {for(const product of products.filter(p=>selected.includes(p._id))){
                        if(bulk==='delete') await apiRequest(`/v1-1/store-studio/commerce/products/${product._id}`,{method:'DELETE'});
                        else {const {_id,slug,__v,store,createdAt,updatedAt,...fields}=product;await v11Api.createProduct({...fields,name:product.name+' (copy)',status:'draft',sku:''});}
                        completed++;
                      }} catch(e){throw new Error(`${completed} completed. ${e.message}`);} finally {setBulk('');load();onDataChange?.();}
                    } else await apiRequest(
                      "/v1-1/store-studio/commerce/products/bulk",
                      {
                        method: "POST",
                        body: JSON.stringify({
                          status: bulk,
                          items: products
                            .filter((p) => selected.includes(p._id))
                            .map((p) => ({ id: p._id, version: p.__v || 0 })),
                        }),
                      },
                    );
                    setBulk("");
                    notify.success("Products updated");
                    load();
                    onDataChange?.();
                  } catch (e) {
                    notify.error(e.message);
                  } finally {
                    setBulkBusy(false);
                  }
                }}
              >
                {bulkBusy ? "Updating…" : "Confirm"}
              </Button>
            </>
          }
        />
      )}{" "}
      {editing && (
        <ProductForm
          product={editing.name ? editing : null}
          onClose={() => setEditing(null)}
          onSaved={saved}
        />
      )}{" "}
      {confirming && (
        <Modal
          tone="peach"
          title="Delete product?"
          description={`“${confirming.name}” will no longer appear in your storefront. Existing order records stay intact.`}
          onClose={() => setConfirming(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setConfirming(null)}>
                Keep product
              </Button>
              <Button
                className={styles.dangerButton}
                onClick={remove}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete product"}
              </Button>
            </>
          }
        >
          <p className={styles.confirmCopy}>This action cannot be undone.</p>
        </Modal>
      )}
    </div>
  );
}

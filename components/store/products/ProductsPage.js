"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown, Copy, ExternalLink, Pencil, Trash2 } from "lucide-react";

import {
  getMyProducts,
  deleteProduct,
  updateProduct,
} from "@/services/productService";
import StoreMenu from "../dashboard/StoreMenu";
import EditProductModal from "./EditProductModal";
import styles from "./productsPage.module.css";
import { toast } from "react-hot-toast";
import FirstProductPrompt from "../dashboard/FirstProductPrompt";
import DashboardHeader from "../dashboard/DashboardHeader";
import AddProductModal from "./AddProductModal";
import { Plus } from "lucide-react";
export default function ProductsPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [store, setStore] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);

  const [page, setPage] = useState(1);

  const [hasMore, setHasMore] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const [expanded, setExpanded] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const loadProducts = async (pageNumber = 1, append = false) => {
    try {
      if (!append) {
        setLoadingProducts(true);
      }

      const token = localStorage.getItem("token");

      const data = await getMyProducts(token, pageNumber);

      if (append) {
        setProducts((prev) => [...prev, ...data.products]);
      } else {
        setProducts(data.products);
      }

      setHasMore(data.hasMore);
    } catch (err) {
      console.log(err);
    } finally {
      if (!append) {
        setLoadingProducts(false);
      }
    }
  };

  useEffect(() => {
    loadProducts(1);
  }, []);
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const storeRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/store/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const userRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/users/plan`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setStore(storeRes.data);
      setUser(userRes.data);
    } catch (err) {
      console.log(err);
    }
  };
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this product?");

    if (!confirmDelete) return;

    try {
      setDeletingProduct(id);

      const token = localStorage.getItem("token");

      await deleteProduct(id, token);

      setProducts((prev) => prev.filter((product) => product._id !== id));
    } catch (err) {
      console.log(err);
    } finally {
      setDeletingProduct(null);
    }
  };
  const handleLoadMore = async () => {
    try {
      setLoadingMore(true);

      const nextPage = page + 1;

      await loadProducts(nextPage, true);

      setPage(nextPage);
    } finally {
      setLoadingMore(false);
    }
  };
  const handleEdit = (product) => {
    setSelectedProduct(product);

    setEditOpen(true);
  };
  const handleSaveProduct = async (updatedProduct) => {
    try {
      const token = localStorage.getItem("token");

      const saved = await updateProduct(
        updatedProduct._id,
        updatedProduct,
        token,
      );

      setProducts((prev) => prev.map((p) => (p._id === saved._id ? saved : p)));

      setEditOpen(false);

      setSelectedProduct(null);
      toast.success("Product updated successfully");
    } catch (err) {
      console.log(err);
    }
  };

  const getProductLink = (product) => {
    if (!store?.slug || !product?.slug) return "";

    return `${window.location.origin}/s/${store.slug}/${product.slug}`;
  };

  const copyProductLink = async (product) => {
    const link = getProductLink(product);

    if (!link) {
      toast.error("Product link is not ready yet");
      return;
    }

    try {
      await navigator.clipboard.writeText(link);
      toast.success("Product link copied");
    } catch (err) {
      console.log(err);
      toast.error("Failed to copy link");
    }
  };

  const visitProductPage = (product) => {
    const link = getProductLink(product);

    if (!link) {
      toast.error("Product link is not ready yet");
      return;
    }

    window.open(link, "_blank");
  };
  return (
    <>
      <StoreMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        store={store}
      />

      <div className={styles.wrapper}>
        <DashboardHeader
          store={store}
          user={user}
          onMenu={() => setMenuOpen(true)}
        />

        <div className={styles.content}>
          <div className={styles.pageTop}>
            <h1>Products</h1>

            <button className={styles.addBtn} onClick={() => setAddOpen(true)}>
              <Plus size={16} />
              Add Product
            </button>
          </div>
          <div className={styles.summary}>
            <div className={styles.summaryCard}>
              <span>Total Products</span>
              <strong>{products.length}</strong>
            </div>

            <div className={styles.summaryCard}>
              <span>Total Stock</span>
              <strong>
                {products.reduce((a, b) => a + (b.stock || 0), 0)}
              </strong>
            </div>
          </div>
          {!loadingProducts && (
            <FirstProductPrompt
              productCount={products.length}
              onCreate={() => setAddOpen(true)}
            />
          )}
          {loadingProducts ? (
            <div className={styles.loader}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : (
            products.map((product) => (
              <div key={product._id} className={styles.card}>
                <div
                  className={styles.header}
                  onClick={() =>
                    setExpanded(expanded === product._id ? null : product._id)
                  }
                >
                  <div className={styles.left}>
                    <img
                      src={product.images?.[0] || "/placeholder.png"}
                      alt=""
                    />

                    <div>
                      <h3>{product.name}</h3>

                      <p>{product.category}</p>

                      <strong>₦{Number(product.price).toLocaleString()}</strong>
                    </div>
                  </div>

                  <ChevronDown />
                </div>

                {expanded === product._id && (
                  <div className={styles.details}>
                    <div className={styles.stats}>
                      <div>
                        Stock:
                        {product.stock}
                      </div>

                      <div>
                        Views:
                        {product.views}
                      </div>

                      <div>
                        Sales:
                        {product.sales}
                      </div>
                    </div>

                    <div className={styles.actions}>
                      <button onClick={() => handleEdit(product)}>
                        <Pencil size={16} />
                        Edit
                      </button>

                      <button
                        className={`${styles.delete} ${
                          deletingProduct === product._id ? styles.deleting : ""
                        }`}
                        onClick={() => handleDelete(product._id)}
                        disabled={deletingProduct === product._id}
                      >
                        {deletingProduct === product._id ? (
                          <>
                            <span className={styles.spinner}></span>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 size={16} />
                            Delete
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        className={styles.copyBtn}
                        onClick={() => copyProductLink(product)}
                      >
                        <Copy size={16} />
                        Copy Link
                      </button>

                      <button
                        type="button"
                        className={styles.visitBtn}
                        onClick={() => visitProductPage(product)}
                      >
                        <ExternalLink size={16} />
                        Visit Page
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          {hasMore && (
            <button
              className={styles.loadMore}
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? "Loading..." : "Load More"}
            </button>
          )}
        </div>
        <EditProductModal
          open={editOpen}
          product={selectedProduct}
          onClose={() => {
            setEditOpen(false);
            setSelectedProduct(null);
          }}
          onSave={handleSaveProduct}
        />
        <AddProductModal open={addOpen} onClose={() => setAddOpen(false)} />
      </div>
    </>
  );
}

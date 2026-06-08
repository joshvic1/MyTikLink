"use client";

import { useState } from "react";
import { X, AlertTriangle, Pencil, Plus } from "lucide-react";

import styles from "../styles/lowStockModal.module.css";

export default function LowStockModal({
  open,
  onClose,
  products = [],
  onEdit,
}) {
  const [editingId, setEditingId] = useState(null);
  const [amount, setAmount] = useState("");

  if (!open) return null;

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />

      <div className={styles.modal}>
        <div className={styles.header}>
          <div>
            <h2>Low Stock Products</h2>
            <p>Quickly top up products running low on inventory.</p>
          </div>

          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.list}>
          {products.length === 0 ? (
            <div className={styles.empty}>
              <AlertTriangle size={32} />
              <h3>No low stock products</h3>
              <p>Your inventory is looking healthy.</p>
            </div>
          ) : (
            products.map((product) => (
              <div key={product._id} className={styles.rowWrap}>
                <div className={styles.item}>
                  <div className={styles.left}>
                    <img
                      src={product.images?.[0] || "/placeholder.png"}
                      alt=""
                    />

                    <div>
                      <h4>{product.name}</h4>
                      <span>{product.stock} left in stock</span>
                    </div>
                  </div>

                  <button
                    className={styles.editBtn}
                    onClick={() => {
                      setEditingId(
                        editingId === product._id ? null : product._id,
                      );
                      setAmount("");
                    }}
                  >
                    <Pencil size={14} />
                    Add Stock
                  </button>
                </div>

                {editingId === product._id && (
                  <div className={styles.stockEditor}>
                    <p>
                      Current Stock: <strong>{product.stock}</strong>
                    </p>

                    <input
                      type="number"
                      min="1"
                      placeholder="Amount to add"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />

                    <div className={styles.stockActions}>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setAmount("");
                        }}
                      >
                        Cancel
                      </button>

                      <button
                        disabled={!amount || Number(amount) <= 0}
                        onClick={() => {
                          onEdit(product, amount);
                          setEditingId(null);
                          setAmount("");
                        }}
                      >
                        <Plus size={14} />
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

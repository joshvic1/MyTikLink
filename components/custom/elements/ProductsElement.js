// elements/StoreProductsElement.js

"use client";

import { useState } from "react";

import { Pencil } from "lucide-react";

import styles from "./products.module.css";

import RenderStoreProducts from "../shared/RenderStoreProducts";

import EditStoreProductsModal from "../modals/EditStoreProductsModal";

export default function StoreProductsElement({
  element,
  sectionId,
  onUpdateElement,
  onDeleteElement,
  products = [],
}) {
  const [showEdit, setShowEdit] = useState(false);

  return (
    <div className={styles.wrapper}>
      {/* PRODUCT RENDER */}
      <RenderStoreProducts
        element={element}
        products={products}
        builder={true}
      />

      {/* ACTIONS */}
      <div className={styles.actions}>
        <button className={styles.edit} onClick={() => setShowEdit(true)}>
          <Pencil size={14} />
        </button>

        <button
          className={styles.delete}
          onClick={() => onDeleteElement(sectionId, element.id)}
        >
          ✕
        </button>
      </div>

      {/* EDIT MODAL */}
      <EditStoreProductsModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        element={element}
        onSave={(data) => onUpdateElement(sectionId, element.id, data)}
      />
    </div>
  );
}

"use client";

import SegmentControl from "../../controls/SegmentControl";

import styles from "../editMenu.module.css";

import {
  Upload,
  Trash2,
  Link2,
  AlignLeft,
  LayoutGrid,
  AlignRight,
  MoreHorizontal,
  MoreVertical,
  Menu,
  Equal,
} from "lucide-react";

const iconMap = {
  menu: Menu,

  equal: Equal,

  AlignJustify: AlignLeft,

  AlignRight: AlignRight,

  LayoutGrid: LayoutGrid,

  MoreHorizontal: MoreHorizontal,

  MoreVertical: MoreVertical,
};

export default function MenuContentTab({ element, update }) {
  const addItem = () => {
    update({
      items: [
        ...element.items,

        {
          id: crypto.randomUUID(),

          label: "New Item",

          url: "",
        },
      ],
    });
  };

  const updateItem = (id, key, value) => {
    update({
      items: element.items.map((item) =>
        item.id === id
          ? {
              ...item,
              [key]: value,
            }
          : item,
      ),
    });
  };

  const deleteItem = (id) => {
    update({
      items: element.items.filter((item) => item.id !== id),
    });
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      update({
        logoImage: reader.result,
      });
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className={styles.stack}>
      {/* LOGO */}
      <div className={styles.group}>
        <div className={styles.groupTitle}>Branding</div>

        <label>Logo Type</label>

        <SegmentControl
          value={element.logoType}
          onChange={(v) =>
            update({
              logoType: v,
            })
          }
          options={[
            {
              label: "Text",
              value: "text",
            },

            {
              label: "Image",
              value: "image",
            },
          ]}
        />

        {element.logoType === "text" ? (
          <>
            <label>Logo Text</label>

            <input
              className={styles.input}
              value={element.logoText}
              onChange={(e) =>
                update({
                  logoText: e.target.value,
                })
              }
              placeholder="GlowMart"
            />
          </>
        ) : (
          <>
            <label>Upload Logo</label>

            <div className={styles.uploadBox}>
              {element.logoImage ? (
                <img src={element.logoImage} className={styles.logoPreview} />
              ) : (
                <>
                  <Upload size={28} />

                  <span>Tap to upload logo</span>
                </>
              )}

              <input type="file" accept="image/*" onChange={handleLogoUpload} />
            </div>
          </>
        )}
      </div>
      <div className={styles.group}>
        <div className={styles.groupTitle}>Menu Icon</div>

        <div className={styles.iconGrid}>
          {Object.entries(iconMap).map(([key, Icon]) => (
            <button
              key={key}
              className={
                element.menuIcon === key ? styles.activeIcon : styles.iconBtn
              }
              onClick={() =>
                update({
                  menuIcon: key,
                })
              }
            >
              <Icon size={24} />
            </button>
          ))}
        </div>
      </div>
      {/* MENU ITEMS */}
      <div className={styles.group}>
        <div className={styles.groupHeader}>
          <div className={styles.groupTitle}>Menu Items</div>
        </div>

        <div className={styles.items}>
          {element.items.map((item) => (
            <div key={item.id} className={styles.itemCard}>
              <div className={styles.itemTop}>
                <input
                  className={styles.input}
                  value={item.label}
                  onChange={(e) => updateItem(item.id, "label", e.target.value)}
                  placeholder="Home"
                />

                <button
                  className={styles.iconDelete}
                  onClick={() => deleteItem(item.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className={styles.urlInputWrap}>
                <Link2 size={14} />

                <input
                  className={styles.urlInput}
                  value={item.url}
                  onChange={(e) => updateItem(item.id, "url", e.target.value)}
                  placeholder="https://....."
                />
              </div>
            </div>
          ))}
          <button className={styles.addMiniBtn} onClick={addItem}>
            + Add another item
          </button>
        </div>
      </div>
    </div>
  );
}

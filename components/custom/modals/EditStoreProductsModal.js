"use client";

import BottomSheet from "../ui/BottomSheet";

import {
  LayoutGrid,
  Palette,
  SlidersHorizontal,
  ExternalLink,
} from "lucide-react";

import ColorPicker from ".././controls/ColorPicker";
import RangeSlider from ".././controls/RangeSlider";
import SegmentControl from ".././controls/SegmentControl";

import styles from "./editStoreProducts.module.css";

export default function EditStoreProductsModal({
  isOpen,
  onClose,
  element,
  onSave,
}) {
  const update = (data) => {
    onSave({
      ...element,
      ...data,
    });
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className={styles.sheet}>
        {/* HEADER */}

        <div className={styles.header}>
          <div>
            <p>Store Section</p>

            <h2>Edit Products</h2>
          </div>

          <button className={styles.doneBtn} onClick={onClose}>
            Done
          </button>
        </div>

        {/* CONTENT */}

        <div className={styles.content}>
          {/* INFO */}
          <a
            href="/store/products"
            target="_blank"
            rel="noreferrer"
            className={styles.infoCard}
          >
            <div className={styles.infoIcon}>
              <LayoutGrid size={18} />
            </div>

            <div>
              <h3>Edit Products</h3>

              <p>
                The products shown here are just demo products.Click here to see
                your actual products and manage them.
              </p>
            </div>
            <a
              href="/store/products"
              target="_blank"
              rel="noreferrer"
              className={styles.manageBtn}
            >
              <ExternalLink size={14} />
            </a>
          </a>

          {/* GENERAL */}

          <div className={styles.section}>
            <div className={styles.sectionTop}>
              <Palette size={16} />

              <span>General</span>
            </div>

            {/* <div className={styles.group}>
              <label>Section Title</label>

              <input
                className={styles.input}
                value={element.title || ""}
                onChange={(e) =>
                  update({
                    title: e.target.value,
                  })
                }
                placeholder="Featured Products"
              />
            </div> */}

            <div className={styles.group}>
              <label>Title Text</label>

              <input
                className={styles.input}
                value={element.badgeText || ""}
                onChange={(e) =>
                  update({
                    badgeText: e.target.value,
                  })
                }
              />
            </div>

            <div className={styles.group}>
              <label>Products Per Row</label>

              <SegmentControl
                value={element.columns}
                onChange={(v) =>
                  update({
                    columns: Number(v),
                  })
                }
                options={[
                  {
                    label: "1",
                    value: 1,
                  },

                  {
                    label: "2",
                    value: 2,
                  },
                ]}
              />
            </div>
          </div>

          {/* COLORS */}

          <div className={styles.section}>
            <div className={styles.sectionTop}>
              <Palette size={16} />

              <span>Colors</span>
            </div>

            {/* <div className={styles.group}>
              <label>Title Color</label>

              <ColorPicker
                value={element.titleColor}
                onChange={(v) =>
                  update({
                    titleColor: v,
                  })
                }
              />
            </div> */}
            <div className={styles.group}>
              <label>Title Background</label>

              <ColorPicker
                value={element.badgeColor}
                onChange={(v) =>
                  update({
                    badgeColor: v,
                  })
                }
              />
            </div>

            <div className={styles.group}>
              <label>Title Color</label>

              <ColorPicker
                value={element.badgeTextColor}
                onChange={(v) =>
                  update({
                    badgeTextColor: v,
                  })
                }
              />
            </div>
            <div className={styles.group}>
              <label>Price Color</label>

              <ColorPicker
                value={element.priceColor}
                onChange={(v) =>
                  update({
                    priceColor: v,
                  })
                }
              />
            </div>

            <div className={styles.group}>
              <label>Card Background</label>

              <ColorPicker
                value={element.cardBackground}
                onChange={(v) =>
                  update({
                    cardBackground: v,
                  })
                }
              />
            </div>

            <div className={styles.group}>
              <label>Section Background</label>

              <ColorPicker
                value={element.backgroundColor}
                onChange={(v) =>
                  update({
                    backgroundColor: v,
                  })
                }
              />
            </div>
          </div>

          {/* SPACING */}

          <div className={styles.section}>
            <div className={styles.sectionTop}>
              <SlidersHorizontal size={16} />

              <span>Spacing</span>
            </div>

            <div className={styles.group}>
              <label>Title Font Size</label>

              <RangeSlider
                min={18}
                max={60}
                step={1}
                value={element.titleSize || 30}
                onChange={(v) =>
                  update({
                    titleSize: v,
                  })
                }
              />
            </div>

            <div className={styles.group}>
              <label>Card Radius</label>

              <RangeSlider
                min={0}
                max={40}
                step={1}
                value={element.radius}
                onChange={(v) =>
                  update({
                    radius: v,
                  })
                }
              />
            </div>

            <div className={styles.group}>
              <label>Top Padding</label>

              <RangeSlider
                min={0}
                max={80}
                step={1}
                value={element.paddingTop}
                onChange={(v) =>
                  update({
                    paddingTop: v,
                  })
                }
              />
            </div>

            <div className={styles.group}>
              <label>Bottom Padding</label>

              <RangeSlider
                min={0}
                max={80}
                step={1}
                value={element.paddingBottom}
                onChange={(v) =>
                  update({
                    paddingBottom: v,
                  })
                }
              />
            </div>

            <div className={styles.group}>
              <label>Top Margin</label>

              <RangeSlider
                min={0}
                max={80}
                step={1}
                value={element.marginTop || 0}
                onChange={(v) =>
                  update({
                    marginTop: v,
                  })
                }
              />
            </div>

            <div className={styles.group}>
              <label>Bottom Margin</label>

              <RangeSlider
                min={0}
                max={80}
                step={1}
                value={element.marginBottom || 0}
                onChange={(v) =>
                  update({
                    marginBottom: v,
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}

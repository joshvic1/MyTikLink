"use client";

import { useState } from "react";
import BottomSheet from "../ui/BottomSheet";
import styles from "./editImage.module.css";

import SegmentControl from "../controls/SegmentControl";
import AlignmentControl from "../controls/AlignmentControl";
import ToggleSwitch from "../controls/ToggleSwitch";
import RangeSlider from "../controls/RangeSlider";
import ColorPicker from "../controls/ColorPicker";
import SpacingControl from "../controls/SpacingControl";

import {
  Upload,
  Link2,
  Image as ImageIcon,
  Expand,
  Shrink,
  Trash2,
  Copy,
  Ban,
} from "lucide-react";

export default function EditImageModal({ isOpen, onClose, element, onSave }) {
  const [sourceType, setSourceType] = useState("upload");

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        {/* HEADER */}
        <div className={styles.header}>
          <span>Edit Image</span>

          <button onClick={onClose}>Done</button>
        </div>

        <div className={styles.body}>
          {/* IMAGE SOURCE */}
          <div className={styles.group}>
            <label>Image Source</label>

            <div className={styles.twoGrid}>
              <button
                className={`${styles.sourceBtn} ${
                  sourceType === "upload" ? styles.active : ""
                }`}
                onClick={() => setSourceType("upload")}
              >
                <Upload size={18} />
                Upload Image
              </button>

              <button
                className={`${styles.sourceBtn} ${
                  sourceType === "url" ? styles.active : ""
                }`}
                onClick={() => setSourceType("url")}
              >
                <Link2 size={18} />
                Paste URL
              </button>
            </div>

            {sourceType === "upload" ? (
              <label className={styles.uploadBox}>
                <Upload size={30} />

                <span>Tap to upload image</span>

                <small>PNG, JPG, WEBP up to 10MB</small>

                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];

                    if (!file) return;

                    try {
                      const token = localStorage.getItem("token");

                      const formData = new FormData();

                      formData.append("image", file);

                      const res = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/upload`,
                        {
                          method: "POST",

                          headers: {
                            Authorization: `Bearer ${token}`,
                          },

                          body: formData,
                        },
                      );

                      const data = await res.json();

                      onSave({
                        src: data.url,

                        key: data.key || null,

                        publicId: data.publicId || null,
                      });
                    } catch (err) {
                      console.error(err);

                      alert("Upload failed");
                    }
                  }}
                />
              </label>
            ) : (
              <input
                className={styles.input}
                placeholder="https://..."
                value={element.src || ""}
                onChange={(e) =>
                  onSave({
                    src: e.target.value,
                  })
                }
              />
            )}
          </div>

          {/* IMAGE FIT */}
          {/* <div className={styles.group}>
            <label>Image Fit</label>

            <SegmentControl
              value={element.fit || "cover"}
              onChange={(val) => onSave({ fit: val })}
              options={[
                {
                  label: "Cover",
                  value: "cover",
                  icon: Expand,
                },
                {
                  label: "Contain",
                  value: "contain",
                  icon: Shrink,
                },
              ]}
            />
          </div> */}

          {/* ALIGNMENT */}
          <div className={styles.group}>
            <label>Alignment</label>

            <AlignmentControl
              value={element.align || "center"}
              onChange={(val) =>
                onSave({
                  align: val,
                })
              }
            />
          </div>
          {/* SPACING */}
          <div className={styles.group}>
            <label>Padding</label>

            <SpacingControl
              value={element.padding || 0}
              onChange={(val) =>
                onSave({
                  padding: val,
                })
              }
            />
          </div>

          <div className={styles.group}>
            <label>Margin</label>

            <SpacingControl
              value={element.margin || 0}
              onChange={(val) =>
                onSave({
                  margin: val,
                })
              }
            />
          </div>
          {/* BORDER + RADIUS */}
          <div className={styles.doubleGroup}>
            {/* RADIUS */}
            <div className={styles.group}>
              <label>Border Radius</label>

              <RangeSlider
                value={element.radius || 0}
                onChange={(val) =>
                  onSave({
                    radius: val,
                  })
                }
                max={50}
                unit="px"
              />
            </div>

            {/* BORDER */}
            <div className={styles.group}>
              <div className={styles.row}>
                <label>Border</label>

                <ToggleSwitch
                  value={element.borderEnabled}
                  onChange={(val) =>
                    onSave({
                      borderEnabled: val,
                    })
                  }
                />
              </div>

              {element.borderEnabled && (
                <>
                  <label>Width</label>

                  <RangeSlider
                    value={element.borderWidth || 1}
                    onChange={(val) =>
                      onSave({
                        borderWidth: val,
                      })
                    }
                    max={10}
                    unit="px"
                  />

                  <label>Color</label>

                  <ColorPicker
                    value={element.borderColor || "#111827"}
                    onChange={(val) =>
                      onSave({
                        borderColor: val,
                      })
                    }
                  />
                </>
              )}
            </div>
          </div>

          {/* SHADOW */}
          <div className={styles.group}>
            <label>Image Shadow</label>

            <div className={styles.shadowGrid}>
              {[
                {
                  label: "None",
                  value: "none",
                  icon: Ban,
                },
                {
                  label: "Light",
                  value: "light",
                },
                {
                  label: "Medium",
                  value: "medium",
                },
                {
                  label: "Large",
                  value: "large",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.value}
                    className={`${styles.shadowCard} ${
                      element.shadow === item.value ? styles.active : ""
                    }`}
                    onClick={() =>
                      onSave({
                        shadow: item.value,
                      })
                    }
                  >
                    <div
                      className={`${styles.shadowPreview} ${styles[item.value]}`}
                    >
                      {Icon && <Icon size={22} />}
                    </div>

                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* LINK */}
          <div className={styles.group}>
            <div className={styles.row}>
              <label>Link</label>

              <ToggleSwitch
                value={element.linkEnabled}
                onChange={(val) =>
                  onSave({
                    linkEnabled: val,
                  })
                }
              />
            </div>

            {element.linkEnabled && (
              <>
                <input
                  className={styles.input}
                  placeholder="Add URL"
                  value={element.url || ""}
                  onChange={(e) =>
                    onSave({
                      url: e.target.value,
                    })
                  }
                />

                <div className={styles.row}>
                  <span>Open link in new tab</span>

                  <ToggleSwitch
                    value={element.newTab}
                    onChange={(val) =>
                      onSave({
                        newTab: val,
                      })
                    }
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}

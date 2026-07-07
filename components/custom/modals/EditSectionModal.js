// EditSectionModal.js
"use client";
import { useState } from "react";
import BottomSheet from "../ui/BottomSheet";

import SegmentControl from "../controls/SegmentControl";
import ToggleSwitch from "../controls/ToggleSwitch";
import RangeSlider from "../controls/RangeSlider";
import ColorPicker from "../controls/ColorPicker";
import SpacingControl from "../controls/SpacingControl";

import {
  Paintbrush,
  Image as ImageIcon,
  Expand,
  Square,
  Trash2,
} from "lucide-react";

import styles from "./editSection.module.css";

export default function EditSectionModal({ isOpen, onClose, section, onSave }) {
  const [backgroundTab, setBackgroundTab] = useState(
    section.backgroundType || "color",
  );
  const update = (key, value) => {
    onSave({
      ...section,
      [key]: value,
    });
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        {/* HEADER */}
        <div className={styles.header}>
          <h2>Edit Section</h2>

          <button onClick={onClose}>Done</button>
        </div>

        {/* BACKGROUND */}
        <div className={styles.card}>
          <h3>Background</h3>

          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tab} ${
                backgroundTab === "color" ? styles.activeTab : ""
              }`}
              onClick={() => {
                setBackgroundTab("color");
                update("backgroundType", "color");
              }}
            >
              <Paintbrush size={16} />
              Color
            </button>

            <button
              type="button"
              className={`${styles.tab} ${
                backgroundTab === "image" ? styles.activeTab : ""
              }`}
              onClick={() => {
                setBackgroundTab("image");
                update("backgroundType", "image");
              }}
            >
              <ImageIcon size={16} />
              Image
            </button>
          </div>

          {backgroundTab === "color" && (
            <ColorPicker value={section.bg} onChange={(v) => update("bg", v)} />
          )}

          {backgroundTab === "image" && (
            <div className={styles.imageBgBox}>
              <label>Image URL</label>

              <input
                value={section.backgroundImage || ""}
                placeholder="Paste image URL"
                onChange={(e) => update("backgroundImage", e.target.value)}
              />

              {section.backgroundImage && (
                <div
                  className={styles.imagePreview}
                  style={{
                    backgroundImage: `url(${section.backgroundImage})`,
                  }}
                />
              )}

              <label>Image Size</label>

              <SegmentControl
                options={[
                  { label: "Cover", value: "cover" },
                  { label: "Contain", value: "contain" },
                  { label: "Auto", value: "auto" },
                ]}
                value={section.backgroundSize || "cover"}
                onChange={(v) => update("backgroundSize", v)}
              />

              <label>Position</label>

              <SegmentControl
                options={[
                  { label: "Center", value: "center" },
                  { label: "Top", value: "top" },
                  { label: "Bottom", value: "bottom" },
                ]}
                value={section.backgroundPosition || "center"}
                onChange={(v) => update("backgroundPosition", v)}
              />

              <label>Repeat</label>

              <SegmentControl
                options={[
                  { label: "No", value: "no-repeat" },
                  { label: "Repeat", value: "repeat" },
                ]}
                value={section.backgroundRepeat || "no-repeat"}
                onChange={(v) => update("backgroundRepeat", v)}
              />

              <button
                type="button"
                className={styles.removeImageBtn}
                onClick={() => {
                  update("backgroundImage", "");
                  update("backgroundType", "color");
                  setBackgroundTab("color");
                }}
              >
                Remove image
              </button>
            </div>
          )}
        </div>

        {/* SPACING */}
        <div className={styles.card}>
          <h3>Spacing</h3>

          <div className={styles.twoCols}>
            <div>
              <label>Padding (inside)</label>

              <SpacingControl
                value={section.padding}
                onChange={(v) => update("padding", v)}
              />
            </div>

            <div>
              <label>Margin (outside)</label>

              <SpacingControl
                value={section.margin}
                onChange={(v) => update("margin", v)}
              />
            </div>
          </div>
        </div>

        {/* BORDER */}
        <div className={styles.card}>
          <div className={styles.titleRow}>
            <h3>Border</h3>

            <ToggleSwitch
              value={!!section.borderEnabled}
              onChange={(v) => update("borderEnabled", v)}
            />
          </div>

          {section.borderEnabled && (
            <>
              <label>Border Style</label>

              <SegmentControl
                options={[
                  {
                    label: "━",
                    value: "solid",
                  },

                  {
                    label: "╌╌",
                    value: "dashed",
                  },

                  {
                    label: "┈┈",
                    value: "dotted",
                  },
                ]}
                value={section.borderStyle || "solid"}
                onChange={(v) => update("borderStyle", v)}
              />

              <div className={styles.space16} />

              <div className={styles.borderGrid}>
                <div>
                  <label>Border Width</label>

                  <RangeSlider
                    min={1}
                    max={10}
                    value={section.borderWidth || 1}
                    onChange={(v) => update("borderWidth", v)}
                  />
                </div>

                <div>
                  <label>Border Color</label>

                  <ColorPicker
                    value={section.borderColor}
                    onChange={(v) => update("borderColor", v)}
                  />
                </div>
              </div>

              <div className={styles.space16} />

              <div className={styles.sliderRow}>
                <label>Border Radius</label>

                <span>{section.radius || 0}px</span>
              </div>

              <RangeSlider
                min={0}
                max={50}
                value={section.radius || 0}
                onChange={(v) => update("radius", v)}
              />
            </>
          )}
        </div>

        {/* WIDTH */}
        <div className={styles.card}>
          <h3>Section Width</h3>

          <div className={styles.widthGrid}>
            <button
              className={`${styles.widthCard} ${
                section.layout !== "boxed" ? styles.activeWidth : ""
              }`}
              onClick={() => update("layout", "full")}
            >
              <Expand size={22} />

              <span>Full Width</span>
            </button>

            <button
              className={`${styles.widthCard} ${
                section.layout === "boxed" ? styles.activeWidth : ""
              }`}
              onClick={() => update("layout", "boxed")}
            >
              <Square size={22} />

              <span>Boxed Layout</span>
            </button>
          </div>
        </div>

        {/* SHADOW */}
        <div className={styles.card}>
          <div className={styles.titleRow}>
            <h3>Section Shadow</h3>

            <ToggleSwitch
              value={section.shadow && section.shadow !== "none"}
              onChange={(v) => update("shadow", v ? "light" : "none")}
            />
          </div>

          {section.shadow !== "none" && (
            <div className={styles.shadowGrid}>
              {["light", "medium", "large"].map((shadow) => (
                <button
                  key={shadow}
                  onClick={() => update("shadow", shadow)}
                  className={`${styles.shadowCard} ${
                    section.shadow === shadow ? styles.activeShadow : ""
                  }`}
                >
                  <div
                    className={styles.shadowPreview}
                    style={{
                      boxShadow:
                        shadow === "light"
                          ? "0 4px 10px rgba(0,0,0,0.08)"
                          : shadow === "medium"
                            ? "0 8px 20px rgba(0,0,0,0.12)"
                            : "0 12px 30px rgba(0,0,0,0.18)",
                    }}
                  />

                  <span>
                    {shadow.charAt(0).toUpperCase() + shadow.slice(1)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DELETE */}
        {/* <button className={styles.deleteBtn}>
          <Trash2 size={18} />
          Delete Section
        </button> */}
      </div>
    </BottomSheet>
  );
}

"use client";

import BottomSheet from "../ui/BottomSheet";

import RangeSlider from "../controls/RangeSlider";
import ColorPicker from "../controls/ColorPicker";
import SegmentControl from "../controls/SegmentControl";

import styles from "./editDivider.module.css";

export default function EditDividerModal({ isOpen, onClose, element, onSave }) {
  const update = (key, value) => {
    onSave({
      ...element,
      [key]: value,
    });
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        {/* HEADER */}
        <div className={styles.header}>
          <h2>Edit Divider</h2>

          <button onClick={onClose}>Done</button>
        </div>

        {/* THICKNESS */}
        <div className={styles.card}>
          <div className={styles.row}>
            <h3>Thickness</h3>

            <span>{element.thickness || 1}px</span>
          </div>

          <RangeSlider
            min={1}
            max={5}
            step={1}
            value={element.thickness || 1}
            onChange={(v) => update("thickness", v)}
          />
        </div>

        {/* COLOR */}
        <div className={styles.card}>
          <h3>Color</h3>

          <ColorPicker
            value={element.color}
            onChange={(v) => update("color", v)}
          />
        </div>

        {/* STYLE */}
        <div className={styles.card}>
          <h3>Style</h3>

          <SegmentControl
            options={[
              { label: "Solid", value: "solid" },
              { label: "Dashed", value: "dashed" },
            ]}
            value={element.style || "solid"}
            onChange={(v) => update("style", v)}
          />
        </div>

        {/* SPACING */}
        <div className={styles.card}>
          <div className={styles.row}>
            <h3>Top</h3>

            <span>{element.marginTop || 16}px</span>
          </div>

          <RangeSlider
            min={0}
            max={100}
            value={element.marginTop || 16}
            onChange={(v) => update("marginTop", v)}
          />

          <div className={styles.space} />

          <div className={styles.row}>
            <h3>Bottom</h3>

            <span>{element.marginBottom || 16}px</span>
          </div>

          <RangeSlider
            min={0}
            max={100}
            value={element.marginBottom || 16}
            onChange={(v) => update("marginBottom", v)}
          />
        </div>

        {/* WIDTH */}
        <div className={styles.card}>
          <h3>Width</h3>

          <SegmentControl
            options={[
              {
                label: "Full Width",
                value: "full",
              },

              {
                label: "Content Width",
                value: "content",
              },
            ]}
            value={element.width || "full"}
            onChange={(v) => update("width", v)}
          />

          {element.width === "content" && (
            <>
              <div className={styles.space} />

              <RangeSlider
                min={30}
                max={100}
                value={element.contentWidth || 80}
                onChange={(v) => update("contentWidth", v)}
              />
            </>
          )}
        </div>

        {/* PREVIEW */}
        <div className={styles.card}>
          <h3>Preview</h3>

          <div className={styles.previewWrap}>
            <div
              className={styles.preview}
              style={{
                borderTop: `${element.thickness || 1}px ${
                  element.style || "solid"
                } ${element.color || "#9ca3af"}`,

                width:
                  element.width === "content"
                    ? `${element.contentWidth || 80}%`
                    : "100%",
              }}
            />
          </div>
        </div>

        {/* DELETE */}
        {/* <button className={styles.deleteBtn}>Delete Divider</button> */}

        {/* DUPLICATE */}
        {/* <button className={styles.duplicateBtn}>Duplicate Divider</button> */}
      </div>
    </BottomSheet>
  );
}

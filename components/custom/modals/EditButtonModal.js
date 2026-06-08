// editButtonModal.js
"use client";

import BottomSheet from "../ui/BottomSheet";

import SegmentControl from "../controls/SegmentControl";
import ColorPicker from "../controls/ColorPicker";
import ToggleSwitch from "../controls/ToggleSwitch";
import AlignmentControl from "../controls/AlignmentControl";
import RangeSlider from "../controls/RangeSlider";

import styles from "./editButton.module.css";

export default function EditButtonModal({ isOpen, onClose, element, onSave }) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        {/* HEADER */}
        <div className={styles.header}>
          <h2>Edit Button</h2>

          <button onClick={onClose}>Done</button>
        </div>

        {/* BODY */}
        <div className={styles.body}>
          {/* BUTTON TEXT */}
          <div className={styles.group}>
            <h3>Button Text</h3>

            <input
              className={styles.input}
              value={element.text}
              maxLength={50}
              onChange={(e) => onSave({ text: e.target.value })}
            />

            <span className={styles.counter}>
              {element.text?.length || 0}/50
            </span>
          </div>
          {/* LINK */}
          <div className={styles.group}>
            <div className={styles.inlineBetween}>
              <h3>Link</h3>

              <ToggleSwitch
                value={element.linkEnabled}
                onChange={(val) => onSave({ linkEnabled: val })}
              />
            </div>

            {element.linkEnabled && (
              <>
                <input
                  className={styles.input}
                  placeholder="https://example.com"
                  value={element.url || ""}
                  onChange={(e) => onSave({ url: e.target.value })}
                />

                <div className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={element.newTab || false}
                    onChange={(e) => onSave({ newTab: e.target.checked })}
                  />

                  <span>Open in new tab</span>
                </div>
              </>
            )}
          </div>
          {/* STYLE */}
          <div className={styles.group}>
            <h3>Style</h3>

            <label>Background Color</label>
            <div className={styles.row2}>
              <ColorPicker
                label="Background Color"
                value={element.bg}
                onChange={(value) => onSave({ bg: value })}
              />

              <label>Text Color</label>
              <ColorPicker
                label="Text Color"
                value={element.color}
                onChange={(value) => onSave({ color: value })}
              />
            </div>

            <label>Font Weight</label>
            <SegmentControl
              label="Font Weight"
              value={element.fontWeight}
              options={[
                { label: "Regular", value: 400 },
                { label: "Medium", value: 500 },
                { label: "Bold", value: 700 },
              ]}
              onChange={(value) => onSave({ fontWeight: value })}
            />
          </div>

          {/* SHAPE */}
          <div className={styles.group}>
            <h3>Shape</h3>

            <SegmentControl
              value={element.shape}
              options={[
                { label: "Rectangle", value: "rectangle" },
                { label: "Rounded", value: "rounded" },
                { label: "Pill", value: "pill" },
              ]}
              onChange={(value) => onSave({ shape: value })}
            />
          </div>

          {/* SIZE */}
          <div className={styles.group}>
            <h3>Size</h3>

            <SegmentControl
              value={element.size}
              options={[
                { label: "Small", value: "small" },
                { label: "Medium", value: "medium" },
                { label: "Large", value: "large" },
              ]}
              onChange={(value) => onSave({ size: value })}
            />
          </div>

          {/* LAYOUT */}
          <div className={styles.group}>
            <h3>Layout</h3>
            <label>Alignment</label>
            <AlignmentControl
              value={element.align}
              onChange={(value) => onSave({ align: value })}
            />

            <label>Width</label>
            <div style={{ marginTop: 14 }}>
              <SegmentControl
                label="Width"
                value={element.fullWidth}
                options={[
                  { label: "Fit Content", value: false },
                  { label: "Full Width", value: true },
                ]}
                onChange={(value) => onSave({ fullWidth: value })}
              />
            </div>
          </div>

          {/* EFFECTS */}
          <div className={styles.group}>
            <h3>Effects</h3>

            <SegmentControl
              label="Shadow"
              value={element.shadow}
              options={[
                { label: "None", value: "none" },
                { label: "Light", value: "light" },
                { label: "Medium", value: "medium" },
                { label: "Large", value: "large" },
              ]}
              onChange={(value) => onSave({ shadow: value })}
            />
          </div>

          {/* SPACING */}
          <div className={styles.group}>
            <h3>Spacing</h3>
            <label>Padding</label>
            <div className={styles.row2}>
              <RangeSlider
                label="Padding"
                min={0}
                max={80}
                value={element.padding || 0}
                onChange={(value) => onSave({ padding: value })}
              />
              <label>Margin</label>
              <RangeSlider
                label="Margin"
                min={0}
                max={80}
                value={element.margin || 0}
                onChange={(value) => onSave({ margin: value })}
              />
            </div>
          </div>

          {/* BORDER */}
          <div className={styles.group}>
            <div className={styles.inlineBetween}>
              <label>Border</label>

              <ToggleSwitch
                value={element.borderEnabled}
                onChange={(val) => onSave({ borderEnabled: val })}
              />
            </div>

            {element.borderEnabled && (
              <>
                <label>Border Size</label>
                <RangeSlider
                  label="Border Width"
                  min={1}
                  max={10}
                  value={element.borderWidth || 1}
                  onChange={(value) => onSave({ borderWidth: value })}
                />
                <label>Border Color</label>
                <div style={{ marginTop: 16 }}>
                  <ColorPicker
                    label="Border Color"
                    value={element.borderColor}
                    onChange={(value) => onSave({ borderColor: value })}
                  />
                </div>
              </>
            )}
          </div>

          {/* DELETE */}
          {/* <button className={styles.deleteBtn}>Delete Button</button> */}

          {/* DUPLICATE */}
          {/* <button className={styles.duplicateBtn}>Duplicate Button</button> */}
        </div>
      </div>
    </BottomSheet>
  );
}

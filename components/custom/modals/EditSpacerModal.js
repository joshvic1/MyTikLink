"use client";

import BottomSheet from "../ui/BottomSheet";

import styles from "./editSpacer.module.css";

import SegmentControl from "../controls/SegmentControl";
import ColorPicker from "../controls/ColorPicker";
// import ShadowControl from "../controls/ShadowControl";

export default function EditSpacerModal({ isOpen, onClose, element, onSave }) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        {/* HEADER */}
        <div className={styles.header}>
          <h3>Edit Spacer</h3>

          <button onClick={onClose}>Done</button>
        </div>

        <div className={styles.body}>
          {/* INFO */}
          <div className={styles.info}>
            Spacer is used to create space between elements.
          </div>
          {/* HEIGHT */}
          <div className={styles.group}>
            <label>Height</label>

            <input
              type="range"
              min="20"
              max="300"
              value={element.height || 80}
              onChange={(e) =>
                onSave({
                  height: Number(e.target.value),
                })
              }
            />

            <span className={styles.value}>{element.height || 80}px</span>
          </div>

          {/* MARGIN */}
          {/* <div className={styles.group}>
            <label>Margin</label>

            <SegmentControl
              value={element.margin}
              onChange={(value) => onSave({ margin: value })}
              options={[
                {
                  label: "None",
                  value: "none",
                },
                {
                  label: "Small",
                  value: "small",
                },
                {
                  label: "Medium",
                  value: "medium",
                },
                {
                  label: "Large",
                  value: "large",
                },
              ]}
            />
          </div> */}

          {/* BACKGROUND */}
          <div className={styles.group}>
            <label>Background Color</label>

            <ColorPicker
              value={element.bg}
              onChange={(value) => onSave({ bg: value })}
            />
          </div>

          {/* RADIUS */}
          <div className={styles.group}>
            <label>Border Radius</label>

            <SegmentControl
              value={element.radius}
              onChange={(value) => onSave({ radius: value })}
              options={[
                {
                  label: "None",
                  value: "none",
                },
                {
                  label: "Small",
                  value: "small",
                },
                {
                  label: "Medium",
                  value: "medium",
                },
                // {
                //   label: "Large",
                //   value: "large",
                // },
                {
                  label: "Full",
                  value: "full",
                },
              ]}
            />
          </div>

          {/* BORDER */}
          <div className={styles.group}>
            <label>Border Style</label>

            <SegmentControl
              value={element.borderStyle}
              onChange={(value) =>
                onSave({
                  borderStyle: value,
                })
              }
              options={[
                {
                  label: "None",
                  value: "none",
                },
                {
                  label: "Solid",
                  value: "solid",
                },
                {
                  label: "Dashed",
                  value: "dashed",
                },
                {
                  label: "Dotted",
                  value: "dotted",
                },
              ]}
            />
          </div>

          {/* BORDER COLOR */}
          {element.borderStyle !== "none" && (
            <div className={styles.group}>
              <label>Border Color</label>

              <ColorPicker
                value={element.borderColor}
                onChange={(value) =>
                  onSave({
                    borderColor: value,
                  })
                }
              />
            </div>
          )}

          {/* SHADOW */}
          {/* <div className={styles.group}>
            <label>Shadow</label>

            <ShadowControl
              value={element.shadow}
              onChange={(value) => onSave({ shadow: value })}
            />
          </div> */}
        </div>
      </div>
    </BottomSheet>
  );
}

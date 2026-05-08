import BottomSheet from "../ui/BottomSheet";
import styles from "./editText.module.css";

import SegmentControl from "../controls/SegmentControl";
import Stepper from "../controls/Stepper";
import ColorPicker from "../controls/ColorPicker";
import AlignmentControl from "../controls/AlignmentControl";
import ToggleSwitch from "../controls/ToggleSwitch";
import RangeSlider from "../controls/RangeSlider";
import SpacingControl from "../controls/SpacingControl";
import TextStyleControl from "../controls/TextStyleControl";

export default function EditTextModal({ isOpen, onClose, element, onSave }) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        {/* HEADER */}
        <div className={styles.header}>
          <span>Edit Text</span>
          <button onClick={onClose}>Done</button>
        </div>

        <div className={styles.body}>
          {/* TEXT */}
          <div className={styles.group}>
            <label>Text</label>
            <textarea
              className={styles.input}
              value={element.content}
              onChange={(e) => onSave({ content: e.target.value })}
            />
          </div>

          {/* TYPE */}
          {/* <div className={styles.group}>
            <label>Text Type</label>
            <SegmentControl
              value={element.type}
              onChange={(val) => onSave({ type: val })}
              options={[
                { label: "P", value: "p" },
                { label: "H1", value: "h1" },
                { label: "H2", value: "h2" },
                { label: "H3", value: "h3" },
              ]}
            />
          </div> */}

          {/* STYLE */}
          <div className={styles.group}>
            <label>Text Style</label>
            <TextStyleControl
              element={element}
              onChange={(data) => onSave(data)}
            />
          </div>

          {/* FONT SIZE */}
          <div className={styles.group}>
            <label>Font Size</label>
            <Stepper
              value={element.fontSize}
              onChange={(val) => onSave({ fontSize: val })}
            />
          </div>

          {/* ALIGN */}
          <div className={styles.group}>
            <label>Alignment</label>
            <AlignmentControl
              value={element.align}
              onChange={(val) => onSave({ align: val })}
            />
          </div>

          {/* COLORS */}
          <div className={styles.group}>
            <label>Text Color</label>
            <ColorPicker
              value={element.color}
              onChange={(val) => onSave({ color: val })}
            />
          </div>

          <div className={styles.group}>
            <label>Background</label>
            <ColorPicker
              value={element.bg}
              onChange={(val) => onSave({ bg: val })}
            />
          </div>

          {/* LINK */}
          <div className={styles.group}>
            <label>Link</label>

            <ToggleSwitch
              value={element.linkEnabled}
              onChange={(val) => onSave({ linkEnabled: val })}
            />

            {element.linkEnabled && (
              <>
                <input
                  className={styles.input}
                  placeholder="https://..."
                  value={element.url || ""}
                  onChange={(e) => onSave({ url: e.target.value })}
                />

                <div className={styles.row}>
                  <span>Open in new tab</span>
                  <ToggleSwitch
                    value={element.newTab}
                    onChange={(val) => onSave({ newTab: val })}
                  />
                </div>
              </>
            )}
          </div>

          {/* SPACING */}
          <div className={styles.group}>
            <label>Padding</label>
            <SpacingControl
              value={element.padding}
              onChange={(val) => onSave({ padding: val })}
            />
          </div>

          <div className={styles.group}>
            <label>Margin</label>
            <SpacingControl
              value={element.margin}
              onChange={(val) => onSave({ margin: val })}
            />
          </div>

          {/* BORDER */}
          <div className={styles.group}>
            <label>Border</label>

            <ToggleSwitch
              value={element.borderEnabled}
              onChange={(val) => onSave({ borderEnabled: val })}
            />

            {element.borderEnabled && (
              <>
                <label>Border Thickness</label>
                <RangeSlider
                  value={element.borderWidth}
                  onChange={(val) => onSave({ borderWidth: val })}
                  max={10}
                />
                <label>Border color</label>
                <ColorPicker
                  value={element.borderColor}
                  onChange={(val) => onSave({ borderColor: val })}
                />
                <label>Border style</label>
                <SegmentControl
                  value={element.borderStyle}
                  onChange={(val) => onSave({ borderStyle: val })}
                  options={[
                    { label: "Solid", value: "solid" },
                    { label: "Dashed", value: "dashed" },
                    { label: "Dotted", value: "dotted" },
                  ]}
                />
                <label>Border Radius</label>
                <RangeSlider
                  value={element.radius}
                  onChange={(val) => onSave({ radius: val })}
                  max={50}
                  unit="px"
                />
              </>
            )}
          </div>

          <button className={styles.done} onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}

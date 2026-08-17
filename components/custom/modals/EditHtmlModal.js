import BottomSheet from "../ui/BottomSheet";
import ColorPicker from "../controls/ColorPicker";
import RangeSlider from "../controls/RangeSlider";
import SegmentControl from "../controls/SegmentControl";
import SpacingControl from "../controls/SpacingControl";
import ToggleSwitch from "../controls/ToggleSwitch";
import { normalizeHtml } from "../utils/htmlSanitizer";

import styles from "./editHtml.module.css";

export default function EditHtmlModal({ isOpen, onClose, element, onSave }) {
  const saveHtml = (html) => {
    onSave({ html: normalizeHtml(html) });
  };

  const handlePaste = (event) => {
    event.preventDefault();

    const pasted = event.clipboardData.getData("text");
    saveHtml(pasted);
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span>Edit HTML</span>
          <button onClick={onClose}>Done</button>
        </div>

        <div className={styles.body}>
          <div className={styles.group}>
            <label>HTML Code</label>
            <textarea
              className={styles.codeInput}
              value={element.html || ""}
              spellCheck={false}
              placeholder="<div>Your custom HTML here</div>"
              onPaste={handlePaste}
              onChange={(e) => saveHtml(e.target.value)}
            />

            <p className={styles.hint}>
              CSS styles are kept. Script tags, iframe/embed/object tags,
              inline events like onclick, and javascript URLs are removed
              automatically before saving.
            </p>
          </div>

          <div className={styles.group}>
            <label>Background</label>
            <ColorPicker
              value={element.bg || "transparent"}
              onChange={(val) => onSave({ bg: val })}
            />
          </div>

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

                <label>Border Color</label>
                <ColorPicker
                  value={element.borderColor}
                  onChange={(val) => onSave({ borderColor: val })}
                />

                <label>Border Style</label>
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

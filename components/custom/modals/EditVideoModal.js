"use client";

import BottomSheet from "../ui/BottomSheet";

import SegmentControl from "../controls/SegmentControl";
import ToggleSwitch from "../controls/ToggleSwitch";
import RangeSlider from "../controls/RangeSlider";
import ColorPicker from "../controls/ColorPicker";

import styles from "./editVideo.module.css";

export default function EditVideoModal({ isOpen, onClose, element, onSave }) {
  const getPreview = (url) => {
    if (!url) return "";

    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);

    if (!match) return "";

    return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        {/* HEADER */}
        <div className={styles.header}>
          <h2>Edit Video</h2>

          <button onClick={onClose}>Done</button>
        </div>

        {/* BODY */}
        <div className={styles.body}>
          {/* VIDEO SOURCE */}
          <div className={styles.group}>
            <h3>YouTube URL</h3>

            <input
              className={styles.input}
              placeholder="https://youtube.com/watch?v=..."
              value={element.url || ""}
              onChange={(e) => onSave({ url: e.target.value })}
            />

            <p className={styles.helper}>
              Paste a YouTube video link to embed it.
            </p>
          </div>

          {/* VIDEO RATIO */}
          <div className={styles.group}>
            <h3>Layout</h3>
            <label>Video height</label>
            <SegmentControl
              label="Video Ratio"
              value={element.ratio}
              options={[
                { label: "16:9", value: "16/9" },
                { label: "4:3", value: "4/3" },
                { label: "1:1", value: "1/1" },
              ]}
              onChange={(value) => onSave({ ratio: value })}
            />
            {/* <label>Fit</label>
            <div style={{ marginTop: 16 }}>
              <SegmentControl
                label="Fit"
                value={element.fit}
                options={[
                  { label: "Contain", value: "contain" },
                  { label: "Cover", value: "cover" },
                ]}
                onChange={(value) => onSave({ fit: value })}
              />
            </div> */}
          </div>

          {/* APPEARANCE */}
          <div className={styles.group}>
            <h3>Appearance</h3>

            <label>Border</label>
            <div style={{ marginTop: 20 }}>
              <SegmentControl
                label="Border"
                value={element.border}
                options={[
                  { label: "None", value: "none" },
                  { label: "Thin", value: "thin" },
                  { label: "Medium", value: "medium" },
                  { label: "Thick", value: "thick" },
                ]}
                onChange={(value) =>
                  onSave({
                    border: value,

                    borderWidth:
                      value === "thin"
                        ? 1
                        : value === "medium"
                          ? 2
                          : value === "thick"
                            ? 4
                            : 0,
                  })
                }
              />
            </div>

            <label>Border Radius</label>
            <RangeSlider
              label="Corner Radius"
              min={0}
              max={40}
              value={element.radius || 0}
              onChange={(value) => onSave({ radius: value })}
            />
            <label>Border Color</label>
            {element.border !== "none" && (
              <div style={{ marginTop: 18 }}>
                <ColorPicker
                  label="Border Color"
                  value={element.borderColor}
                  onChange={(value) => onSave({ borderColor: value })}
                />
              </div>
            )}
          </div>

          {/* SHADOW */}
          <div className={styles.group}>
            <h3>Shadow</h3>
            <SegmentControl
              label="Shadow"
              value={element.shadow}
              options={[
                { label: "None", value: "none" },
                { label: "Small", value: "light" },
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

          {/* RESPONSIVE */}
          <div className={styles.group}>
            <h3>Width</h3>

            <SegmentControl
              label="Max Width"
              value={element.fullWidth}
              options={[
                { label: "Full Width", value: true },
                { label: "Custom", value: false },
              ]}
              onChange={(value) => onSave({ fullWidth: value })}
            />

            {!element.fullWidth && (
              <div style={{ marginTop: 20 }}>
                <RangeSlider
                  label="Custom Width"
                  min={20}
                  max={100}
                  value={element.maxWidth || 100}
                  onChange={(value) => onSave({ maxWidth: value })}
                />
              </div>
            )}
          </div>

          {/* ADVANCED */}
          <div className={styles.group}>
            <h3>Advanced</h3>

            <label>Start Video At (secs)</label>

            <input
              className={styles.input}
              placeholder="e.g 30"
              value={element.start || ""}
              onChange={(e) => onSave({ start: e.target.value })}
            />

            <div className={styles.toggleRow}>
              <div className={styles.toggleContent}>
                <h4>Enable Controls</h4>

                <p>Show play, progress bar and controls</p>
              </div>

              <ToggleSwitch
                value={element.controls}
                onChange={(value) => onSave({ controls: value })}
              />
            </div>

            <div className={styles.toggleRow}>
              <div>
                <h4>Enable Autoplay</h4>

                <p>Video will start automatically</p>
              </div>

              <ToggleSwitch
                value={element.autoplay}
                onChange={(value) => onSave({ autoplay: value })}
              />
            </div>

            <div className={styles.note}>
              Note: Autoplay may not work on some mobile browsers.
            </div>
          </div>

          {/* DELETE */}
          {/* <button className={styles.deleteBtn}>Delete Video</button> */}
        </div>
      </div>
    </BottomSheet>
  );
}

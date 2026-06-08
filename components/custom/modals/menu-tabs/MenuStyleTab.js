import ColorPicker from "../../controls/ColorPicker";

import RangeSlider from "../../controls/RangeSlider";

import SegmentControl from "../../controls/SegmentControl";

import ToggleSwitch from "../../controls/ToggleSwitch";

import styles from "../editMenu.module.css";

export default function MenuStyleTab({ element, update }) {
  return (
    <div className={styles.stack}>
      <div className={styles.group}>
        <label>Container Layout</label>

        <SegmentControl
          value={element.containerLayout}
          onChange={(v) =>
            update({
              containerLayout: v,
            })
          }
          options={[
            {
              label: "Boxed",
              value: "boxed",
            },

            {
              label: "Full Width",
              value: "full",
            },
          ]}
        />
      </div>
      {/* LAYOUT */}
      <div className={styles.group}>
        <label>Menu Layout</label>

        <SegmentControl
          value={element.layout}
          onChange={(v) =>
            update({
              layout: v,
            })
          }
          options={[
            {
              label: "Fullscreen",
              value: "fullscreen",
            },

            {
              label: "Drawer",
              value: "drawer",
            },

            // {
            //   label: "Inline",
            //   value: "inline",
            // },
          ]}
        />
      </div>

      {/* BACKGROUND */}
      <div className={styles.group}>
        <label> Menu Background</label>

        <ColorPicker
          value={element.overlayBg}
          onChange={(v) =>
            update({
              overlayBg: v,
            })
          }
        />

        <label>Menu Text Color</label>

        <ColorPicker
          value={element.textColor}
          onChange={(v) =>
            update({
              textColor: v,
            })
          }
        />
      </div>
      <div className={styles.group}>
        <label>Overlay Text Color</label>

        <ColorPicker
          value={element.overlayTextColor}
          onChange={(v) =>
            update({
              overlayTextColor: v,
            })
          }
        />
        {/* <label>Overlay Opacity</label>

        <RangeSlider
          min={0}
          max={100}
          value={element.overlayOpacity}
          onChange={(v) =>
            update({
              overlayOpacity: v,
            })
          }
        /> */}
      </div>
      {/* TYPOGRAPHY */}
      <div className={styles.group}>
        <label>Menu Items ( Font Size )</label>

        <RangeSlider
          min={12}
          max={40}
          value={element.fontSize}
          onChange={(v) =>
            update({
              fontSize: v,
            })
          }
        />

        <label> Menu Items ( Letter Spacing )</label>

        <RangeSlider
          min={0}
          max={10}
          value={element.letterSpacing}
          onChange={(v) =>
            update({
              letterSpacing: v,
            })
          }
        />
      </div>

      {/* BORDER */}
      <div className={styles.group}>
        <div className={styles.row}>
          <span>Enable Border</span>

          <ToggleSwitch
            value={element.borderEnabled}
            onChange={(v) =>
              update({
                borderEnabled: v,
              })
            }
          />
        </div>

        {element.borderEnabled && (
          <>
            <label>Border Color</label>

            <ColorPicker
              value={element.borderColor}
              onChange={(v) =>
                update({
                  borderColor: v,
                })
              }
            />

            <label>Border Width</label>

            <RangeSlider
              min={1}
              max={10}
              value={element.borderWidth}
              onChange={(v) =>
                update({
                  borderWidth: v,
                })
              }
            />
            <label>Border Radius</label>

            <RangeSlider
              min={0}
              max={40}
              value={element.radius}
              onChange={(v) =>
                update({
                  radius: v,
                })
              }
            />
          </>
        )}
      </div>

      {/* SPACING */}
      <div className={styles.group}>
        <label>Padding</label>

        <RangeSlider
          min={0}
          max={60}
          value={element.paddingTop}
          onChange={(v) =>
            update({
              paddingTop: v,
              paddingBottom: v,
              paddingLeft: v,
              paddingRight: v,
            })
          }
        />
        <label>Margin</label>

        <RangeSlider
          min={0}
          max={80}
          value={element.marginTop}
          onChange={(v) =>
            update({
              marginTop: v,
              marginBottom: v,
              marginLeft: v,
              marginRight: v,
            })
          }
        />
      </div>
    </div>
  );
}

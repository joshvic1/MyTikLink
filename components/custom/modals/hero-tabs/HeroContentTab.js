import styles from "../editHero.module.css";

import ToggleSwitch from "../../controls/ToggleSwitch";
import ColorPicker from "../../controls/ColorPicker";

export default function HeroContentTab({ element, update }) {
  return (
    <>
      {/* EYEBROW */}
      <div className={styles.group}>
        <div className={styles.switchRow}>
          <span className={styles.groupTitle}>First Text </span>

          <ToggleSwitch
            value={element.showEyebrow ?? true}
            onChange={(v) =>
              update({
                showEyebrow: v,
              })
            }
          />
        </div>

        <input
          className={styles.input}
          value={element.eyebrow}
          onChange={(e) =>
            update({
              eyebrow: e.target.value,
            })
          }
        />
        <label>Color</label>
        <ColorPicker
          value={element.eyebrowColor}
          onChange={(v) =>
            update({
              eyebrowColor: v,
            })
          }
        />
        <label>Font Size</label>
        <input
          type="range"
          min="10"
          max="40"
          value={element.eyebrowSize}
          onChange={(e) =>
            update({
              eyebrowSize: Number(e.target.value),
            })
          }
        />
      </div>

      {/* HEADING */}
      <div className={styles.group}>
        <div className={styles.switchRow}>
          <span className={styles.groupTitle}>Heading</span>

          <ToggleSwitch
            value={element.showHeading ?? true}
            onChange={(v) =>
              update({
                showHeading: v,
              })
            }
          />
        </div>

        <textarea
          className={styles.textarea}
          value={element.heading}
          onChange={(e) =>
            update({
              heading: e.target.value,
            })
          }
        />
        <label>Color</label>
        <ColorPicker
          value={element.headingColor}
          onChange={(v) =>
            update({
              headingColor: v,
            })
          }
        />
        <label>Font Size</label>
        <input
          type="range"
          min="20"
          max="100"
          value={element.headingSize}
          onChange={(e) =>
            update({
              headingSize: Number(e.target.value),
            })
          }
        />
      </div>

      {/* DESCRIPTION */}
      <div className={styles.group}>
        <div className={styles.switchRow}>
          <span className={styles.groupTitle}>Description</span>

          <ToggleSwitch
            value={element.showDescription ?? true}
            onChange={(v) =>
              update({
                showDescription: v,
              })
            }
          />
        </div>

        <textarea
          className={styles.textarea}
          value={element.description}
          onChange={(e) =>
            update({
              description: e.target.value,
            })
          }
        />
        <label>Color</label>
        <ColorPicker
          value={element.descriptionColor}
          onChange={(v) =>
            update({
              descriptionColor: v,
            })
          }
        />
        <label>Font Size</label>
        <input
          type="range"
          min="12"
          max="40"
          value={element.descriptionSize}
          onChange={(e) =>
            update({
              descriptionSize: Number(e.target.value),
            })
          }
        />
      </div>

      {/* BUTTONS */}
      <div className={styles.group}>
        <div className={styles.switchRow}>
          <span className={styles.groupTitle}>Primary Button</span>

          <ToggleSwitch
            value={element.showPrimaryButton}
            onChange={(v) =>
              update({
                showPrimaryButton: v,
              })
            }
          />
        </div>

        <input
          className={styles.input}
          placeholder="Button Text"
          value={element.primaryButtonText}
          onChange={(e) =>
            update({
              primaryButtonText: e.target.value,
            })
          }
        />
        <label>Link</label>
        <input
          className={styles.input}
          placeholder="Button URL"
          value={element.primaryButtonUrl}
          onChange={(e) =>
            update({
              primaryButtonUrl: e.target.value,
            })
          }
        />
        <label>Button Color</label>

        <ColorPicker
          value={element.buttonBg}
          onChange={(v) =>
            update({
              buttonBg: v,
            })
          }
        />
        <label>Button Text Color</label>

        <ColorPicker
          value={element.buttonColor}
          onChange={(v) =>
            update({
              buttonColor: v,
            })
          }
        />
        <div className={styles.row}>
          <span>Button Border</span>

          <ToggleSwitch
            value={element.buttonBorderEnabled}
            onChange={(v) =>
              update({
                buttonBorderEnabled: v,
              })
            }
          />
        </div>

        {element.buttonBorderEnabled && (
          <>
            <label>Border Color</label>
            <ColorPicker
              value={element.buttonBorderColor}
              onChange={(v) =>
                update({
                  buttonBorderColor: v,
                })
              }
            />
            <label>Border size</label>
            <input
              type="range"
              min="1"
              max="10"
              value={element.buttonBorderWidth}
              onChange={(e) =>
                update({
                  buttonBorderWidth: Number(e.target.value),
                })
              }
            />
          </>
        )}
      </div>
    </>
  );
}

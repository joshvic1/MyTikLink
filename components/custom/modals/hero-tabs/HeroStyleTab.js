import styles from "../editHero.module.css";
import { Upload } from "lucide-react";
import ColorPicker from "../../controls/ColorPicker";

import RangeSlider from "../../controls/RangeSlider";
import SegmentControl from "../../controls/SegmentControl";

export default function HeroStyleTab({ element, update }) {
  return (
    <>
      {/* BACKGROUND */}
      <div className={styles.group}>
        <span className={styles.groupTitle}>Background Type</span>

        <SegmentControl
          value={element.backgroundType}
          onChange={(v) =>
            update({
              backgroundType: v,
            })
          }
          options={[
            {
              label: "Image",
              value: "image",
            },

            {
              label: "Color",
              value: "color",
            },
          ]}
        />
      </div>
      <div className={styles.group}>
        <span className={styles.groupTitle}>Background</span>

        {element.backgroundType === "image" ? (
          <>
            {/* SOURCE TYPE */}
            <SegmentControl
              value={element.backgroundImageSource || "upload"}
              onChange={(v) =>
                update({
                  backgroundImageSource: v,
                })
              }
              options={[
                {
                  label: "Upload",
                  value: "upload",
                },

                {
                  label: "URL",
                  value: "url",
                },
              ]}
            />

            {/* UPLOAD */}
            {element.backgroundImageSource === "upload" && (
              <label className={styles.uploadBox}>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={async (e) => {
                    try {
                      const file = e.target.files?.[0];

                      if (!file) return;

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

                      update({
                        backgroundImage: data.url,
                      });
                    } catch (err) {
                      console.log(err);
                    }
                  }}
                />

                <Upload size={28} />

                <span>Tap to upload image</span>

                <small>PNG, JPG, WEBP</small>
              </label>
            )}
            {/* URL */}
            {element.backgroundImageSource === "url" && (
              <input
                className={styles.input}
                placeholder="Paste image URL"
                value={element.backgroundImage || ""}
                onChange={(e) =>
                  update({
                    backgroundImage: e.target.value,
                  })
                }
              />
            )}

            {/* PREVIEW */}
            {element.backgroundImage && (
              <img
                src={element.backgroundImage}
                className={styles.previewImage}
              />
            )}
          </>
        ) : (
          <ColorPicker
            value={element.backgroundColor}
            onChange={(v) =>
              update({
                backgroundColor: v,
              })
            }
          />
        )}
      </div>

      {/* OVERLAY */}
      <div className={styles.group}>
        <span className={styles.groupTitle}>Overlay</span>

        <ColorPicker
          value={element.overlayColor}
          onChange={(v) =>
            update({
              overlayColor: v,
            })
          }
        />

        <RangeSlider
          min={0}
          max={1}
          step={0.05}
          value={element.overlayOpacity}
          onChange={(v) =>
            update({
              overlayOpacity: v,
            })
          }
        />
      </div>
    </>
  );
}

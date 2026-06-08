import styles from "../editHero.module.css";

import SegmentControl from "../../controls/SegmentControl";

import RangeSlider from "../../controls/RangeSlider";

export default function HeroLayoutTab({ element, update }) {
  return (
    <>
      <div className={styles.group}>
        <span className={styles.groupTitle}>Content Alignment</span>

        <SegmentControl
          value={element.contentAlign}
          onChange={(v) =>
            update({
              contentAlign: v,
            })
          }
          options={[
            {
              label: "Left",
              value: "left",
            },

            {
              label: "Center",
              value: "center",
            },

            {
              label: "Right",
              value: "right",
            },
          ]}
        />
      </div>

      <div className={styles.group}>
        <span className={styles.groupTitle}>Hero Height</span>

        <RangeSlider
          min={100}
          max={1000}
          value={element.height}
          onChange={(v) =>
            update({
              height: v,
            })
          }
        />
      </div>

      <div className={styles.group}>
        <span className={styles.groupTitle}>Layout Width</span>

        <SegmentControl
          value={element.layoutWidth}
          onChange={(v) =>
            update({
              layoutWidth: v,
            })
          }
          options={[
            {
              label: "Full",
              value: "full",
            },

            {
              label: "Boxed",
              value: "boxed",
            },
          ]}
        />
      </div>

      <div className={styles.group}>
        <span className={styles.groupTitle}>Image Fit</span>

        <SegmentControl
          value={element.imageFit}
          onChange={(v) =>
            update({
              imageFit: v,
            })
          }
          options={[
            {
              label: "Cover",
              value: "cover",
            },

            {
              label: "Contain",
              value: "contain",
            },
          ]}
        />
      </div>

      <div className={styles.group}>
        <span className={styles.groupTitle}>Image Position</span>

        <SegmentControl
          value={element.imagePosition}
          onChange={(v) =>
            update({
              imagePosition: v,
            })
          }
          options={[
            {
              label: "Top",
              value: "top",
            },

            {
              label: "Center",
              value: "center",
            },

            {
              label: "Bottom",
              value: "bottom",
            },
          ]}
        />
      </div>
    </>
  );
}

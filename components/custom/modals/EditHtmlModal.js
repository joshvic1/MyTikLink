"use client";

import { useMemo, useState } from "react";
import BottomSheet from "../ui/BottomSheet";
import ColorPicker from "../controls/ColorPicker";
import RangeSlider from "../controls/RangeSlider";
import SegmentControl from "../controls/SegmentControl";
import SpacingControl from "../controls/SpacingControl";
import ToggleSwitch from "../controls/ToggleSwitch";
import { normalizeHtml } from "../utils/htmlSanitizer";
import { Image as ImageIcon, Type, Upload } from "lucide-react";

import styles from "./editHtml.module.css";

const skippedTextTags = new Set([
  "STYLE",
  "SCRIPT",
  "NOSCRIPT",
  "SVG",
  "PATH",
  "META",
  "LINK",
]);

const createTemplate = (html = "") => {
  if (typeof document === "undefined") return null;

  const template = document.createElement("template");
  template.innerHTML = normalizeHtml(html);

  return template;
};

const getTextNodes = (template) => {
  if (!template) return [];

  const walker = document.createTreeWalker(
    template.content,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const parent = node.parentElement;
        const text = node.nodeValue?.trim();

        if (!parent || !text || text.length < 2) {
          return NodeFilter.FILTER_REJECT;
        }

        if (skippedTextTags.has(parent.tagName)) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      },
    },
  );

  const nodes = [];
  let node = walker.nextNode();

  while (node) {
    nodes.push(node);
    node = walker.nextNode();
  }

  return nodes;
};

const getFriendlyLabel = (element, fallback) => {
  if (!element) return fallback;

  const tag = element.tagName?.toLowerCase();
  const className = String(element.getAttribute("class") || "")
    .split(/\s+/)
    .filter(Boolean)[0];

  if (tag === "h1") return "Main headline";
  if (tag === "h2") return "Section heading";
  if (tag === "h3") return "Small heading";
  if (tag === "p") return "Paragraph";
  if (tag === "li") return "List item";
  if (tag === "button") return "Button text";
  if (tag === "a") return "Link text";
  if (tag === "label") return "Form label";
  if (className) return `${tag || "text"} .${className}`;

  return fallback;
};

export default function EditHtmlModal({ isOpen, onClose, element, onSave }) {
  const [uploadingImage, setUploadingImage] = useState(null);

  const saveHtml = (html) => {
    onSave({ html: normalizeHtml(html) });
  };

  const editableFields = useMemo(() => {
    const template = createTemplate(element.html || "");
    const textNodes = getTextNodes(template);
    const images = template
      ? Array.from(template.content.querySelectorAll("img")).map((img, index) => ({
          index,
          src: img.getAttribute("src") || "",
          alt: img.getAttribute("alt") || "",
        }))
      : [];

    return {
      texts: textNodes.map((node, index) => ({
        index,
        label: getFriendlyLabel(node.parentElement, `Text ${index + 1}`),
        value: node.nodeValue || "",
      })),
      images,
    };
  }, [element.html]);

  const updateTextAtIndex = (index, value) => {
    const template = createTemplate(element.html || "");
    const textNodes = getTextNodes(template);
    const node = textNodes[index];

    if (!template || !node) return;

    node.nodeValue = value;

    saveHtml(template.innerHTML);
  };

  const updateImageAtIndex = (index, src) => {
    const template = createTemplate(element.html || "");
    const images = template
      ? Array.from(template.content.querySelectorAll("img"))
      : [];
    const image = images[index];

    if (!template || !image) return;

    image.setAttribute("src", src);
    saveHtml(template.innerHTML);
  };

  const uploadImageAtIndex = async (index, file) => {
    if (!file) return;

    try {
      setUploadingImage(index);

      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("image", file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data?.url) {
        throw new Error(data?.message || "Upload failed");
      }

      updateImageAtIndex(index, data.url);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploadingImage(null);
    }
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
          {(editableFields.texts.length > 0 ||
            editableFields.images.length > 0) && (
            <div className={styles.group}>
              <div className={styles.groupTitle}>
                <Type size={15} />
                <div>
                  <label>Editable content</label>
                  <p>
                    Quick edit the obvious text and image parts without touching
                    the HTML code.
                  </p>
                </div>
              </div>

              {editableFields.texts.length > 0 && (
                <div className={styles.editList}>
                  {editableFields.texts.map((item) => (
                    <div className={styles.editCard} key={`text-${item.index}`}>
                      <span>{item.label}</span>
                      <textarea
                        value={item.value}
                        onChange={(e) =>
                          updateTextAtIndex(item.index, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
              )}

              {editableFields.images.length > 0 && (
                <div className={styles.imageList}>
                  {editableFields.images.map((image) => (
                    <div
                      className={styles.imageCard}
                      key={`image-${image.index}`}
                    >
                      <div className={styles.imagePreview}>
                        {image.src ? (
                          <img src={image.src} alt={image.alt || ""} />
                        ) : (
                          <ImageIcon size={22} />
                        )}
                      </div>

                      <div className={styles.imageControls}>
                        <span>Image {image.index + 1}</span>
                        <input
                          value={image.src}
                          placeholder="Image URL"
                          onChange={(e) =>
                            updateImageAtIndex(image.index, e.target.value)
                          }
                        />

                        <label className={styles.uploadBtn}>
                          <Upload size={14} />
                          {uploadingImage === image.index
                            ? "Uploading..."
                            : "Upload image"}
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            disabled={uploadingImage === image.index}
                            onChange={(e) =>
                              uploadImageAtIndex(
                                image.index,
                                e.target.files?.[0],
                              )
                            }
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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

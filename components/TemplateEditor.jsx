"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import styles from "@/styles/templateEditor.module.css";

export default function TemplateEditor({ template, config, onChange }) {
  const containerRef = useRef(null);
  const [editables, setEditables] = useState([]);
  const [activeField, setActiveField] = useState(null);
  const [value, setValue] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const recalc = () => {
      const containerRect = containerRef.current.getBoundingClientRect();

      const items = template.editableSchema.fields
        .map((field) => {
          const el = containerRef.current.querySelector(field.selector);
          if (!el) return null;

          const rect = el.getBoundingClientRect();
          const BUTTON_SIZE = 32;

          return {
            field,
            top: rect.top - containerRect.top - 6,
            left: rect.right - containerRect.left - BUTTON_SIZE / 2,
          };
        })
        .filter(Boolean);

      setEditables(items);
    };

    requestAnimationFrame(() => recalc());

    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, [template, config]);

  const openEditor = (field) => {
    setActiveField(field);

    const currentVal = config[field.key];

    if (field.type === "image") {
      setValue(currentVal?.url || field.defaultValue || "");
    } else {
      setValue(currentVal || field.defaultValue || "");
    }
  };

  const saveEdit = () => {
    onChange((prev) => ({
      ...prev,
      [activeField.key]: value,
    }));
    setActiveField(null);
  };

  const renderedHTML = template.html.replace(/{{(.*?)}}/g, (_, key) => {
    const val = config[key.trim()];
    if (!val) return "";

    if (typeof val === "object" && val.url) {
      return val.url;
    }

    return val;
  });

  const uploadImage = (file) => {
    return new Promise((resolve, reject) => {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("image", file);

      const xhr = new XMLHttpRequest();

      xhr.open("POST", `${process.env.NEXT_PUBLIC_API_URL}/upload`);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setProgress(percent);
        }
      };

      xhr.onload = () => {
        const res = JSON.parse(xhr.responseText);
        resolve(res);
      };

      xhr.onerror = reject;

      xhr.send(formData);
    });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: template.css }} />

      <div ref={containerRef} className={styles.editor}>
        <div
          className={styles.preview}
          onClick={(e) => {
            const t = e.target;
            if (t.closest("a")) e.preventDefault();
            if (t.closest("button")) e.preventDefault();
            if (t.closest("form")) e.preventDefault();
          }}
          dangerouslySetInnerHTML={{ __html: renderedHTML }}
        />

        {editables.map(({ field, top, left }) => (
          <button
            key={field.key}
            className={styles.editBtn}
            style={{ top, left }}
            onClick={() => openEditor(field)}
          >
            <Pencil className={styles.icon} />
          </button>
        ))}
      </div>

      {activeField && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>Edit {activeField.key}</h3>

            {activeField.type === "image" ? (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    setUploading(true);
                    setProgress(0);

                    try {
                      const result = await uploadImage(file);

                      // delete previous image (optional but good)
                      if (config[activeField.key]?.publicId) {
                        await fetch(
                          `${process.env.NEXT_PUBLIC_API_URL}/upload/delete`,
                          {
                            method: "DELETE",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${localStorage.getItem("token")}`,
                            },
                            body: JSON.stringify({
                              publicId: config[activeField.key].publicId,
                            }),
                          },
                        );
                      }

                      setValue({
                        url: result.url,
                        publicId: result.publicId,
                      });
                    } catch (err) {
                      alert("Image upload failed");
                      console.error(err);
                    } finally {
                      setUploading(false);
                    }
                  }}
                />

                {uploading && (
                  <div className={styles.progressWrap}>
                    <div
                      className={styles.progressBar}
                      style={{ width: `${progress}%` }}
                    />
                    <span>{progress}%</span>
                  </div>
                )}

                {value?.url && (
                  <img
                    src={value.url}
                    style={{
                      width: "100%",
                      borderRadius: "12px",
                      marginTop: "12px",
                    }}
                  />
                )}
              </>
            ) : (
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                autoFocus
                rows={3}
              />
            )}

            <div className={styles.actions}>
              <button onClick={() => setActiveField(null)}>Cancel</button>
              <button
                className={styles.save}
                onClick={saveEdit}
                disabled={uploading}
                style={{
                  opacity: uploading ? 0.6 : 1,
                  cursor: uploading ? "not-allowed" : "pointer",
                }}
              >
                {uploading ? "Uploading..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

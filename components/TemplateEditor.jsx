// frontend/components/TemplateEditor.jsx
"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { Pencil } from "lucide-react";
import styles from "@/styles/templateEditor.module.css";

export default function TemplateEditor({ template, config, onChange }) {
  const containerRef = useRef(null);
  const [editables, setEditables] = useState([]);
  const [activeField, setActiveField] = useState(null);
  const [value, setValue] = useState("");

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const timeout = setTimeout(() => {
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
    }, 0);

    return () => clearTimeout(timeout);
  }, [template, config]);

  const openEditor = (field) => {
    setActiveField(field);
    setValue(config[field.key] ?? field.defaultValue ?? "");
  };

  const saveEdit = () => {
    onChange((prev) => ({
      ...prev,
      [activeField.key]: value,
    }));
    setActiveField(null);
  };

  const renderedHTML = template.html.replace(
    /{{(.*?)}}/g,
    (_, key) => config[key.trim()] || "",
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: template.css }} />

      <div ref={containerRef} className={styles.editor}>
        <div
          className={styles.preview}
          onClick={(e) => {
            const target = e.target;

            // block links
            if (target.closest("a")) {
              e.preventDefault();
            }

            // block buttons
            if (target.closest("button")) {
              e.preventDefault();
            }

            // block form submit
            if (target.closest("form")) {
              e.preventDefault();
            }
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
            <h3>Edit text</h3>

            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
              rows={3}
            />

            <div className={styles.actions}>
              <button onClick={() => setActiveField(null)}>Cancel</button>
              <button className={styles.save} onClick={saveEdit}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

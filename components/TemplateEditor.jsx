"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import styles from "@/styles/templateEditor.module.css";

export default function TemplateEditor({ template, config, onChange }) {
  const containerRef = useRef(null);
  const [editables, setEditables] = useState([]);
  const [activeField, setActiveField] = useState(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!containerRef.current) return;

    const items = template.editableSchema.fields
      .map((field) => {
        const el = containerRef.current.querySelector(field.selector);
        if (!el) return null;

        return {
          field,
          top: el.offsetTop,
          left: el.offsetLeft + el.offsetWidth,
        };
      })
      .filter(Boolean);

    setEditables(items);
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
        <div dangerouslySetInnerHTML={{ __html: renderedHTML }} />

        {editables.map(({ field, top, left }) => (
          <button
            key={field.key}
            className={styles.editBtn}
            style={{ top, left }}
            onClick={() => openEditor(field)}
          >
            <Pencil size={14} />
          </button>
        ))}
      </div>

      {activeField && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>Edit text</h3>

            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
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

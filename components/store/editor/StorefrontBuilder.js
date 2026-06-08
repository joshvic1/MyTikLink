"use client";

import Section from "@/components/custom/builder/Section";
import { Plus } from "lucide-react";

import styles from "@/components/custom/styles/builder.module.css";

export default function StorefrontBuilder({
  sections = [],
  setSections,
  openAddElement,
}) {
  const safeSections = Array.isArray(sections) ? sections : [];

  const deleteElement = (sectionId, elementId) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              elements: section.elements.filter(
                (element) => element.id !== elementId,
              ),
            }
          : section,
      ),
    );
  };

  const deleteSection = (sectionId) => {
    setSections((prev) => prev.filter((section) => section.id !== sectionId));
  };

  const updateElement = (sectionId, elementId, newData) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              elements: section.elements.map((element) =>
                element.id === elementId
                  ? {
                      ...element,
                      ...newData,
                    }
                  : element,
              ),
            }
          : section,
      ),
    );
  };

  const updateSection = (sectionId, data) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              ...data,
            }
          : section,
      ),
    );
  };

  if (safeSections.length === 0) {
    return (
      <div
        className={styles.emptyBox}
        onClick={() => openAddElement("outside")}
      >
        <Plus size={40} className={styles.plus} />
        <p className={styles.title}>Tap here to add</p>
        <span className={styles.subtitle}>your first storefront element</span>
      </div>
    );
  }

  return (
    <>
      {safeSections.map((section) => (
        <Section
          key={section.id}
          section={section}
          openAddElement={openAddElement}
          onDeleteElement={deleteElement}
          onDeleteSection={deleteSection}
          onUpdateElement={updateElement}
          onUpdateSection={updateSection}
        />
      ))}

      <div
        className={styles.addOutside}
        onClick={() => openAddElement("outside")}
      >
        + Add element
      </div>
    </>
  );
}

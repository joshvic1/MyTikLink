import styles from "../styles/builder.module.css";
import { useState } from "react";
import AddElementModal from "../modals/AddElementModal";
import { createElement } from "../utils/elementFactory";
import Section from "./Section";
import { Plus } from "lucide-react";

export default function CustomBuilder() {
  const [sections, setSections] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [addTarget, setAddTarget] = useState(null);
  const addElementToSection = (sectionId, type) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.id === sectionId
          ? {
              ...sec,
              elements: [...sec.elements, createElement(type)],
            }
          : sec,
      ),
    );
  };

  const deleteElement = (sectionId, elementId) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.id === sectionId
          ? {
              ...sec,
              elements: sec.elements.filter((el) => el.id !== elementId),
            }
          : sec,
      ),
    );
  };

  const deleteSection = (sectionId) => {
    setSections((prev) => prev.filter((sec) => sec.id !== sectionId));
  };
  const updateElement = (sectionId, elementId, newData) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.id === sectionId
          ? {
              ...sec,
              elements: sec.elements.map((el) =>
                el.id === elementId ? { ...el, ...newData } : el,
              ),
            }
          : sec,
      ),
    );
  };
  const updateSection = (sectionId, data) => {
    setSections((prev) =>
      prev.map((sec) => (sec.id === sectionId ? { ...sec, ...data } : sec)),
    );
  };
  const handlePublish = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/page/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: sections }),
      });

      const data = await res.json();

      alert(`Published! Link: /p/${data.slug}`);
    } catch (err) {
      console.error(err);
    }
  };
  const openAddElement = (type, sectionId = null) => {
    setAddTarget({ type, sectionId });
    setShowModal(true);
  };
  const handleAddElement = (elementType) => {
    const newElement = createElement(elementType);

    // 👉 ADD INSIDE SECTION
    if (addTarget.type === "inside") {
      setSections((prev) =>
        prev.map((sec) =>
          sec.id === addTarget.sectionId
            ? { ...sec, elements: [...sec.elements, newElement] }
            : sec,
        ),
      );
    }

    // 👉 ADD NEW SECTION
    if (addTarget.type === "outside") {
      const newSection = {
        id: Date.now().toString(),
        elements: [newElement],
      };

      setSections((prev) => [...prev, newSection]);
    }

    setShowModal(false);
  };
  return (
    <div className={styles.container}>
      {/* MAIN CANVAS */}
      <div className={styles.canvas}>
        {sections.length === 0 ? (
          <div
            className={styles.emptyBox}
            onClick={() => openAddElement("outside")}
          >
            <Plus size={40} className={styles.plus} />
            <p className={styles.title}>Tap here to add</p>
            <span className={styles.subtitle}>your first element</span>
          </div>
        ) : (
          sections.map((section) => (
            <Section
              key={section.id}
              section={section}
              openAddElement={openAddElement}
              onDeleteElement={deleteElement}
              onDeleteSection={deleteSection}
              onUpdateElement={updateElement}
              onUpdateSection={updateSection}
            />
          ))
        )}
        <div
          className={styles.addOutside}
          onClick={() => openAddElement("outside")}
        >
          + Add element
        </div>
      </div>

      {/* FOOTER */}
      <div className={styles.footer}>
        <button className={styles.back}>← Back</button>
        <button className={styles.publish} onClick={handlePublish}>
          Publish
        </button>
      </div>
      <AddElementModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSelect={handleAddElement}
      />
    </div>
  );
}

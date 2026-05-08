import styles from "../styles/builder.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AddElementModal from "../modals/AddElementModal";
import { createElement } from "../utils/elementFactory";
import Section from "./Section";
import { Plus, ArrowLeft, Check, Rocket, Loader2, Save } from "lucide-react";
import DraftsModal from "../modals/DraftsModal";
import axios from "axios";
import toast from "react-hot-toast";

import PublishSheet from "../modals/PublishSheet";

import UpgradeModal from "@/components/UpgradeModal";
import {
  getDrafts,
  saveDraft,
  deleteDraft,
  clearDrafts,
  saveAutosave,
} from "../utils/draftStorage";

export default function CustomBuilder() {
  const router = useRouter();
  const [sections, setSections] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [addTarget, setAddTarget] = useState(null);
  const [showDrafts, setShowDrafts] = useState(false);

  const [drafts, setDrafts] = useState([]);

  const [currentDraftId, setCurrentDraftId] = useState(null);

  const [isSaving, setIsSaving] = useState(false);

  const [isSaved, setIsSaved] = useState(false);

  const [hasChanges, setHasChanges] = useState(false);
  const [showPublishSheet, setShowPublishSheet] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("token");

    if (stored) {
      setToken(stored);
    }
  }, []);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedToken = localStorage.getItem("token");

        if (!storedToken) return;

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/users/plan`,
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          },
        );

        setUser(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, []);

  const isPro = user?.plan?.toLowerCase().includes("pro");
  useEffect(() => {
    const savedDrafts = getDrafts();

    if (savedDrafts.length > 0) {
      setDrafts(savedDrafts);

      setShowDrafts(true);
    }
  }, []);
  useEffect(() => {
    if (sections.length === 0) return;

    const timeout = setTimeout(() => {
      const drafts = getDrafts();

      // CREATE NEW DRAFT AUTOMATICALLY
      if (!currentDraftId) {
        const newDraft = {
          id: Date.now().toString(),

          title: `Untitled • ${new Date().toLocaleString()}`,

          updatedAt: Date.now(),

          content: sections,
        };

        localStorage.setItem(
          "builder-drafts",
          JSON.stringify([newDraft, ...drafts]),
        );

        setCurrentDraftId(newDraft.id);

        return;
      }

      // UPDATE EXISTING DRAFT
      const updatedDrafts = drafts.map((draft) =>
        draft.id === currentDraftId
          ? {
              ...draft,

              updatedAt: Date.now(),

              title: `Untitled • ${new Date().toLocaleString()}`,

              content: sections,
            }
          : draft,
      );

      localStorage.setItem("builder-drafts", JSON.stringify(updatedDrafts));
    }, 1000);

    return () => clearTimeout(timeout);
  }, [sections]);
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
  const handlePublish = () => {
    setShowPublishSheet(true);
  };
  const openAddElement = (type, sectionId = null) => {
    setAddTarget({ type, sectionId });
    setShowModal(true);
  };
  const handleAddElement = (elementType) => {
    const newElement = createElement(elementType);

    // 👉 ADD INSIDE EXISTING SECTION
    if (addTarget.type === "inside") {
      setSections((prev) =>
        prev.map((sec) =>
          sec.id === addTarget.sectionId
            ? {
                ...sec,
                elements: [...sec.elements, newElement],
              }
            : sec,
        ),
      );

      setShowModal(false);
      return;
    }

    // 👉 ADD NEW SECTION
    if (addTarget.type === "outside") {
      const newSection = {
        id: Date.now().toString(),

        bg: "#ffffff",

        padding: 16,
        margin: 0,

        radius: 0,

        borderEnabled: false,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "#e5e7eb",

        layout: "full",

        shadow: "none",

        opacity: 100,

        elements: [newElement],
      };

      setSections((prev) => [...prev, newSection]);

      setShowModal(false);
      return;
    }
  };
  const handleSelectDraft = (draft) => {
    setSections(draft.content);

    setCurrentDraftId(draft.id);

    setShowDrafts(false);
  };
  const handleDeleteDraft = (id) => {
    deleteDraft(id);

    const updated = getDrafts();

    setDrafts(updated);
  };
  const handleClearDrafts = () => {
    clearDrafts();

    setDrafts([]);
  };
  const handleSaveDraft = async () => {
    setIsSaving(true);

    setTimeout(() => {
      const draftId = saveDraft(sections, currentDraftId);

      setCurrentDraftId(draftId);

      const updatedDrafts = getDrafts();

      setDrafts(updatedDrafts);

      setIsSaving(false);

      setIsSaved(true);

      setHasChanges(false);
    }, 700);
  };
  const publishCustomPage = async ({ title }) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/pages`,
        {
          builderType: "custom",

          title,

          customContent: sections,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (currentDraftId) {
        deleteDraft(currentDraftId);
      }
      toast.success("Page created");

      setTimeout(() => {
        router.push("/dashboard/page");
      }, 1200);
    } catch (err) {
      console.error(err);

      toast.error("Failed to publish page");
    }
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
        {sections.length > 0 && (
          <div
            className={styles.addOutside}
            onClick={() => openAddElement("outside")}
          >
            + Add element
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className={styles.footer}>
        {/* BACK */}
        <button className={styles.iconBtn} onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </button>

        {/* SAVE DRAFT */}
        <button className={styles.saveDraft} onClick={handleSaveDraft}>
          {isSaving ? (
            <>
              <Loader2 size={18} className={styles.spin} />
              Saving...
            </>
          ) : isSaved && !hasChanges ? (
            <>
              <Check size={18} />
              Saved
            </>
          ) : (
            <>
              <Save size={18} />
              Save Draft
            </>
          )}
        </button>

        {/* PUBLISH */}
        <button className={styles.publish} onClick={handlePublish}>
          <Rocket size={18} />
          Publish
        </button>
      </div>
      <AddElementModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSelect={handleAddElement}
      />
      <DraftsModal
        isOpen={showDrafts}
        onClose={() => setShowDrafts(false)}
        drafts={drafts}
        onSelectDraft={handleSelectDraft}
        onDeleteDraft={handleDeleteDraft}
        onClearAll={handleClearDrafts}
      />
      <PublishSheet
        isOpen={showPublishSheet}
        hasContent={sections.some(
          (section) => section.elements && section.elements.length > 0,
        )}
        onClose={() => setShowPublishSheet(false)}
        onPublish={publishCustomPage}
        isPro={isPro}
        onUpgrade={() => setShowUpgradeModal(true)}
      />
      {showUpgradeModal && (
        <UpgradeModal
          currentPlan={user?.plan || "free"}
          o
          setShowModal={setShowUpgradeModal}
        />
      )}
    </div>
  );
}

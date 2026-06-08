"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import toast from "react-hot-toast";
import { ArrowLeft, Check, Loader2, Plus, Save } from "lucide-react";

import StorefrontBuilder from "@/components/store/editor/StorefrontBuilder";
import AddElementModal from "@/components/custom/modals/AddElementModal";
import DraftsModal from "@/components/custom/modals/DraftsModal";
import { createElement } from "@/components/custom/utils/elementFactory";

import styles from "@/components/custom/styles/builder.module.css";

const DRAFT_KEY = "storefront-builder-drafts";

function getStorefrontDrafts() {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY)) || [];
  } catch {
    return [];
  }
}

function saveStorefrontDraft(sections, currentDraftId = null) {
  const drafts = getStorefrontDrafts();

  if (currentDraftId) {
    const updated = drafts.map((draft) =>
      draft.id === currentDraftId
        ? {
            ...draft,
            content: sections,
            updatedAt: Date.now(),
          }
        : draft,
    );

    localStorage.setItem(DRAFT_KEY, JSON.stringify(updated));

    return currentDraftId;
  }

  const newDraft = {
    id: Date.now().toString(),
    title: `Storefront draft • ${new Date().toLocaleString()}`,
    content: sections,
    updatedAt: Date.now(),
  };

  localStorage.setItem(DRAFT_KEY, JSON.stringify([newDraft, ...drafts]));

  return newDraft.id;
}

function deleteStorefrontDraft(id) {
  const drafts = getStorefrontDrafts().filter((draft) => draft.id !== id);
  localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
}

function clearStorefrontDrafts() {
  localStorage.removeItem(DRAFT_KEY);
}

export default function StorefrontEditor() {
  const router = useRouter();

  const [sections, setSections] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [addTarget, setAddTarget] = useState(null);

  const [showDrafts, setShowDrafts] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [currentDraftId, setCurrentDraftId] = useState(null);

  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSavingDesign, setIsSavingDesign] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadStorefront();

    const savedDrafts = getStorefrontDrafts();

    if (savedDrafts.length > 0) {
      setDrafts(savedDrafts);
      setShowDrafts(true);
    }
  }, []);

  const loadStorefront = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/store/storefront`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setSections(
        Array.isArray(res.data?.customContent) ? res.data.customContent : [],
      );
    } catch (err) {
      console.log(err);
      toast.error("Failed to load storefront");
    } finally {
      setLoadingPage(false);
    }
  };

  const updateSections = (updater) => {
    setSections((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;

      return Array.isArray(next) ? next : [];
    });

    setHasChanges(true);
    setIsSaved(false);
  };

  const openAddElement = (type, sectionId = null) => {
    setAddTarget({ type, sectionId });
    setShowModal(true);
  };

  const handleAddElement = (elementType) => {
    const newElement = createElement(elementType);

    if (addTarget?.type === "inside") {
      updateSections((prev) =>
        prev.map((section) =>
          section.id === addTarget.sectionId
            ? {
                ...section,
                elements: [...(section.elements || []), newElement],
              }
            : section,
        ),
      );

      setShowModal(false);
      return;
    }

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

    updateSections((prev) => [...prev, newSection]);

    setShowModal(false);
  };

  const handleSaveDraft = () => {
    setIsSavingDraft(true);

    setTimeout(() => {
      const draftId = saveStorefrontDraft(sections, currentDraftId);

      setCurrentDraftId(draftId);
      setDrafts(getStorefrontDrafts());
      setIsSavingDraft(false);
      setIsSaved(true);
      setHasChanges(false);

      toast.success("Draft saved");
    }, 600);
  };

  const handleSelectDraft = (draft) => {
    setSections(Array.isArray(draft.content) ? draft.content : []);
    setCurrentDraftId(draft.id);
    setShowDrafts(false);
    setHasChanges(true);
    setIsSaved(false);
  };

  const handleDeleteDraft = (id) => {
    deleteStorefrontDraft(id);
    setDrafts(getStorefrontDrafts());
  };

  const handleClearDrafts = () => {
    clearStorefrontDrafts();
    setDrafts([]);
    setShowDrafts(false);
  };

  const handleSaveDesign = async () => {
    try {
      setIsSavingDesign(true);

      const token = localStorage.getItem("token");

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/store/storefront`,
        {
          customContent: sections,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Storefront design saved");

      setTimeout(() => {
        router.push("/store");
      }, 900);
    } catch (err) {
      console.log(err);
      toast.error("Failed to save design");
    } finally {
      setIsSavingDesign(false);
    }
  };

  if (loadingPage) {
    return <div className={styles.loading}>Loading storefront...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.canvas}>
        <StorefrontBuilder
          sections={sections}
          setSections={updateSections}
          openAddElement={openAddElement}
        />
      </div>

      <div className={styles.footer}>
        <button className={styles.iconBtn} onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </button>

        <button className={styles.saveDraft} onClick={handleSaveDraft}>
          {isSavingDraft ? (
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

        <button
          className={styles.publish}
          onClick={handleSaveDesign}
          disabled={isSavingDesign}
        >
          {isSavingDesign ? (
            <>
              <Loader2 size={18} className={styles.spin} />
              Saving...
            </>
          ) : (
            <>
              <Check size={18} />
              Save Design
            </>
          )}
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
    </div>
  );
}

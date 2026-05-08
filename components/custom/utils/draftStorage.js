const DRAFTS_KEY = "builder-drafts";
const AUTOSAVE_KEY = "builder-autosave";

// FORMAT DATE
const formatDraftTitle = () => {
  const now = new Date();

  return `Untitled • ${now.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  })} • ${now.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })}`;
};

// GET ALL DRAFTS
export const getDrafts = () => {
  if (typeof window === "undefined") return [];

  const drafts = localStorage.getItem(DRAFTS_KEY);

  return drafts ? JSON.parse(drafts) : [];
};

// SAVE ALL DRAFTS
const saveAllDrafts = (drafts) => {
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
};

// CREATE NEW DRAFT
export const saveDraft = (sections, existingId = null) => {
  const drafts = getDrafts();

  // UPDATE EXISTING DRAFT
  if (existingId) {
    const updatedDrafts = drafts.map((draft) =>
      draft.id === existingId
        ? {
            ...draft,
            content: sections,
            updatedAt: Date.now(),
            title: formatDraftTitle(),
          }
        : draft,
    );

    saveAllDrafts(updatedDrafts);

    return existingId;
  }

  // CREATE NEW DRAFT
  const newDraft = {
    id: `draft_${Date.now()}`,
    title: formatDraftTitle(),
    updatedAt: Date.now(),
    content: sections,
  };

  saveAllDrafts([newDraft, ...drafts]);

  return newDraft.id;
};

// DELETE ONE DRAFT
export const deleteDraft = (draftId) => {
  const drafts = getDrafts();

  const filtered = drafts.filter((draft) => draft.id !== draftId);

  saveAllDrafts(filtered);
};

// DELETE ALL DRAFTS
export const clearDrafts = () => {
  localStorage.removeItem(DRAFTS_KEY);
};

// AUTOSAVE
export const saveAutosave = (sections) => {
  localStorage.setItem(
    AUTOSAVE_KEY,
    JSON.stringify({
      content: sections,
      updatedAt: Date.now(),
    }),
  );
};

// GET AUTOSAVE
export const getAutosave = () => {
  const data = localStorage.getItem(AUTOSAVE_KEY);

  return data ? JSON.parse(data) : null;
};

// CLEAR AUTOSAVE
export const clearAutosave = () => {
  localStorage.removeItem(AUTOSAVE_KEY);
};

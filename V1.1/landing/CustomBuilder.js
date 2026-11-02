
import CustomPageRenderer from "@/components/custom/renderer/CustomPageRenderer";
import ThemeEditor from "./ThemeEditor";
import { createThemeInstance, getThemeBlock } from "./themeModel";
import { allThemes } from "./themeLibrary";
import { v11Api } from "../lib/api";
import { v11ApiBase } from "../lib/apiBase";
// builder/customBuilder.js
import { canUseLandingPages } from "@/V1.1/lib/pageAccess.js";
import styles from "./MobileBuilder.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AddElementModal from "@/components/custom/modals/AddElementModal";
import { createElement } from "@/components/custom/utils/elementFactory";
import Section from "@/components/custom/builder/Section";
import { Plus, ArrowLeft, Check, Rocket, Loader2, Save, Eye, Pencil } from "lucide-react";
import DraftsModal from "@/components/custom/modals/DraftsModal";
import axios from "axios";
import toast from "react-hot-toast";

import PublishSheet from "@/V1.1/landing/PublishSheet.jsx";

import UpgradeModal from "./UpgradeModal";
import {
  getDrafts,
  saveDraft,
  deleteDraft,
  clearDrafts,
  saveAutosave,
} from "@/components/custom/utils/draftStorage";

export default function CustomBuilder() {
  const router = useRouter();
  const returnPath = router.asPath.startsWith("/v1-1") ? "/v1-1/pages" : "/dashboard/page";

  const { pageId, themeId } = router.query;
  const [editorMode,setEditorMode]=useState("edit");
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
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
  useEffect(() => {
    const loadPage = async () => {
      if (!pageId || !token) {
        setLoadingPage(false);
        return;
      }

      try {
        setIsEditMode(true);

        const res = await axios.get(
          `${v11ApiBase()}/v1-1/pages/${pageId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        // ✅ load existing sections
        setSections(res.data.customContent || []);
        setPageTitle(res.data.title || "");
        // optional
        setCurrentDraftId(null);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load page");
        router.push(returnPath);
      } finally {
        setLoadingPage(false);
      }
    };

    loadPage();
  }, [pageId, token]);
  const isPro = canUseLandingPages(user);
  useEffect(() => {
    if (!router.isReady || pageId || !themeId) return;
    const theme = allThemes.find(item => item.id === themeId);
    if (!theme) { toast.error("Theme not found"); return; }
    let active = true;
    setLoadingPage(true);
    Promise.all([v11Api.onboarding().then(result => result.data || {}).catch(() => ({})), v11Api.onboardingCategories().then(result => result.categories || []).catch(() => [])]).then(([profile, registry]) => {
      if (!active) return;
      const instance = createThemeInstance(theme, profile, registry);
      if (/^#[\da-f]{6}$/i.test(String(router.query.brandColor || ""))) instance.colorOverride = router.query.brandColor;
      const restored = router.query.themeDraft ? getDrafts().find(draft => draft.id === router.query.themeDraft && getThemeBlock(draft.content)?.themeId === themeId) : null;
      const content = restored?.content || [instance];
      const draftId = restored?.id || saveDraft(content);
      setCurrentDraftId(draftId); setSections(content); setShowDrafts(false); setLoadingPage(false);
      if (!restored) router.replace({pathname:router.pathname,query:{...router.query,themeDraft:draftId}},undefined,{shallow:true});
    });
    return () => { active = false; };
  }, [router.isReady, pageId, themeId]);
  useEffect(() => {
    // 🚫 don't show drafts during edit
    if (pageId || themeId) return;

    const savedDrafts = getDrafts();

    if (savedDrafts.length > 0 || router.query.drafts === "1") {
      setDrafts(savedDrafts);
      setShowDrafts(true);
    }
  }, [pageId, themeId, router.query.drafts]);

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

        backgroundType: "color",
        backgroundImage: "",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundOverlay: "linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0))",

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
      // =========================
      // EDIT EXISTING PAGE
      // =========================
      if (isEditMode && pageId) {
        await axios.put(
          `${v11ApiBase()}/v1-1/pages/${pageId}`,
          {
            title,
            customContent: sections,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        toast.success("Page updated");

        setTimeout(() => {
          router.push(returnPath);
        }, 1200);

        return;
      }

      // =========================
      // CREATE NEW PAGE
      // =========================
      await axios.post(
        `${v11ApiBase()}/v1-1/pages`,
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
        router.push(returnPath);
      }, 1200);
    } catch (err) {
      console.error(err);

      toast.error(
        isEditMode ? "Failed to update page" : "Failed to publish page",
      );
    }
  };
  const themeInstance = getThemeBlock(sections);
  if (themeInstance && !loadingPage) return <>
    <ThemeEditor instance={themeInstance} onChange={instance => {setSections([instance]);setHasChanges(true);}} onBack={() => router.push(returnPath)} onSaveDraft={handleSaveDraft} saving={isSaving} onPublish={() => setShowPublishSheet(true)}/>
    <PublishSheet isOpen={showPublishSheet} onClose={() => setShowPublishSheet(false)} hasContent isPro={isPro} onUpgrade={() => setShowUpgradeModal(true)} onPublish={publishCustomPage} initialTitle={pageTitle || themeInstance.personalization?.displayName || themeInstance.name}/>
    {showUpgradeModal && <UpgradeModal onUserUpdated={setUser} currentPlan={user?.plan || "free"} setShowModal={setShowUpgradeModal}/>}
  </>;
  if (loadingPage) {
    return <div className={styles.loading}>Loading page...</div>;
  }
  return (
    <div className={styles.container}>

      {editorMode==="preview"&&<div className={styles.preview}><div className={styles.previewLabel}>Mobile preview</div><div inert="" className={styles.previewPage}>{sections.length?<CustomPageRenderer sections={sections}/>:<p>Add your first element to see a preview.</p>}</div></div>}
      {/* MAIN CANVAS */}
      <div className={styles.canvas} hidden={editorMode!=="edit"}>
        {sections.length === 0 ? (
          <div
            className={styles.emptyBox}
            role="button" tabIndex={0} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openAddElement("outside");}}}
            onClick={() => openAddElement("outside")}
          >
            <Plus size={40} className={styles.plus} />
            <p className={styles.title}>Tap here to add</p>
            <span className={styles.subtitle}>your first element</span>
          </div>
        ) : (
          sections.map((section,index) => (
            <div key={section.id} className={styles.blockCard}><div className={styles.blockHeading}><strong>Section {index+1}</strong><div><button aria-label={`Move section ${index+1} up`} disabled={index===0} onClick={()=>{const next=[...sections];[next[index-1],next[index]]=[next[index],next[index-1]];setSections(next);setHasChanges(true);}}>↑</button><button aria-label={`Move section ${index+1} down`} disabled={index===sections.length-1} onClick={()=>{const next=[...sections];[next[index+1],next[index]]=[next[index],next[index+1]];setSections(next);setHasChanges(true);}}>↓</button></div></div><Section
              key={section.id}
              section={section}
              openAddElement={openAddElement}
              onDeleteElement={deleteElement}
              onDeleteSection={deleteSection}
              onUpdateElement={updateElement}
              onUpdateSection={updateSection}
            /></div>
          ))
        )}
        {sections.length > 0 && (
          <div
            className={styles.addOutside}
            role="button" tabIndex={0} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openAddElement("outside");}}}
            onClick={() => openAddElement("outside")}
          >
            + Add element
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className={styles.footer}>
        {/* BACK */}
        <button className={styles.iconBtn} aria-label="Back to pages" onClick={() => router.push(returnPath)}>
          <ArrowLeft size={20} />
        </button>

        <button className={styles.saveDraft} aria-pressed={editorMode==="preview"} onClick={()=>setEditorMode(editorMode==="preview"?"edit":"preview")}>{editorMode==="preview"?<><Pencil size={18}/>Back to canvas</>:<><Eye size={18}/>Preview</>}</button>

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
        initialTitle={pageTitle}
      />
      {showUpgradeModal && (
        <UpgradeModal onUserUpdated={setUser}
          currentPlan={user?.plan || "free"}
          o
          setShowModal={setShowUpgradeModal}
        />
      )}
    </div>
  );
}

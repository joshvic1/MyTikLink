import {Modal,Button} from '../components/UI';
import ScratchGuide from './ScratchGuide';
import {historyState,historyReducer} from './historyState';

import CustomPageRenderer from "@/components/custom/renderer/CustomPageRenderer";
import ThemeEditor from "./ThemeEditor";
import { createThemeInstance, getThemeBlock } from "./themeModel";
import { allThemes } from "./themeLibrary";
import { v11Api } from "../lib/api";
import { v11ApiBase } from "../lib/apiBase";
// builder/customBuilder.js
import { canUseLandingPages } from "@/V1.1/lib/pageAccess.js";
import styles from "./MobileBuilder.module.css";
import { useState, useEffect, useReducer } from "react";
import { useRouter } from "next/router";
import AddElementModal from "@/components/custom/modals/AddElementModal";
import { createElement } from "@/components/custom/utils/elementFactory";
import Section from "@/components/custom/builder/Section";
import { Plus, ArrowLeft, Check, Rocket, Loader2, Save, Eye, Pencil, Undo2, Redo2, ChevronUp, ChevronDown, Trash2, CircleHelp } from "lucide-react";
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
  const [selectedSection,setSelectedSection]=useState(null);
  const [history,dispatchHistory]=useReducer(historyReducer,[],historyState);
  const sections=history.present;
  const setSections=value=>dispatchHistory({type:'set',value});
  const resetSections=value=>dispatchHistory({type:'reset',value});
  const selectedIndex=sections.findIndex(section=>section.id===selectedSection);
  const moveSelected=direction=>{if(selectedIndex<0||selectedIndex+direction<0||selectedIndex+direction>=sections.length)return;setSections(current=>{const next=[...current];[next[selectedIndex],next[selectedIndex+direction]]=[next[selectedIndex+direction],next[selectedIndex]];return next;});setHasChanges(true);};
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
        resetSections(res.data.customContent || []);
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
      setCurrentDraftId(draftId); resetSections(content); setShowDrafts(false); setLoadingPage(false);
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
    if (sections.length === 0 && !currentDraftId) return;

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

  const [deleteTarget,setDeleteTarget]=useState(null);
  const deleteSection = setDeleteTarget;
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
    resetSections(draft.content);

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
    <div className={styles.container}><ScratchGuide userId={user?._id||user?.id} onEdit={()=>setEditorMode("edit")}/>

      {editorMode==="preview"&&<div className={styles.preview}><div className={styles.previewLabel}>Mobile preview</div><div inert="" className={styles.previewPage}>{sections.length?<CustomPageRenderer sections={sections}/>:<p>Add your first element to see a preview.</p>}</div></div>}
      {/* MAIN CANVAS */}
      <div className={styles.canvas} hidden={editorMode!=="edit"}>
        {sections.length === 0 ? (
          <div
            data-scratch-add="" className={styles.emptyBox}
            role="button" tabIndex={0} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openAddElement("outside");}}}
            onClick={() => openAddElement("outside")}
          >
            <Plus size={40} className={styles.plus} />
            <p className={styles.title}>Tap here to add</p>
            <span className={styles.subtitle}>your first element</span>
          </div>
        ) : (
          sections.map((section,index) => (
            <div key={section.id} onPointerDownCapture={()=>setSelectedSection(section.id)} className={styles.blockCard}><Section
              renderHeader={edit=>(<div className={styles.blockHeading}><strong>Section {index+1}</strong><div data-scratch-move=""><button type="button" aria-label={`Edit section ${index+1}`} onClick={edit}><Pencil size={15}/></button><button type="button" aria-label={`Delete section ${index+1}`} onClick={()=>deleteSection(section.id)}><Trash2 size={15}/></button><button aria-label={`Move section ${index+1} up`} disabled={index===0} onClick={()=>{const next=[...sections];[next[index-1],next[index]]=[next[index],next[index-1]];setSections(next);setHasChanges(true);}}>↑</button><button aria-label={`Move section ${index+1} down`} disabled={index===sections.length-1} onClick={()=>{const next=[...sections];[next[index+1],next[index]]=[next[index],next[index+1]];setSections(next);setHasChanges(true);}}>↓</button></div></div>)}
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
            data-scratch-add="" className={styles.addOutside}
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

        <button aria-label={editorMode==="preview"?"Edit page":"Preview page"} data-scratch-preview="" className={styles.saveDraft} aria-pressed={editorMode==="preview"} onClick={()=>setEditorMode(editorMode==="preview"?"edit":"preview")}>{editorMode==="preview"?<><Pencil size={18}/><span>Edit</span></>:<><Eye size={18}/><span>Preview</span></>}</button>

        <button className={styles.iconBtn} aria-label="Undo" disabled={!history.past.length} onClick={()=>{dispatchHistory({type:'undo'});setHasChanges(true);}}><Undo2 size={17}/></button>
        <button className={styles.iconBtn} aria-label="Redo" disabled={!history.future.length} onClick={()=>{dispatchHistory({type:'redo'});setHasChanges(true);}}><Redo2 size={17}/></button>
        <button type="button" className={styles.iconBtn} aria-label="Show canvas guide" onClick={()=>window.dispatchEvent(new Event("scratch:help"))}><CircleHelp size={17}/></button>
        {/* PUBLISH */}
        <button data-scratch-publish="" className={styles.publish} onClick={handlePublish}>
          <Rocket size={18} />
          Publish
        </button>
      </div>
      {deleteTarget&&<Modal title="Remove section?" onClose={()=>setDeleteTarget(null)} footer={<><Button onClick={()=>setDeleteTarget(null)} variant="secondary">Cancel</Button><Button onClick={()=>{setSections(prev=>prev.filter(sec=>sec.id!==deleteTarget));setHasChanges(true);setDeleteTarget(null);}}>Confirm</Button></>}><p>This removes the section and its items. You can undo this change.</p></Modal>}
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

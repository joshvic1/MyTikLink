import PaletteInput from "../components/PaletteInput";
import { useEffect, useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  Copy,
  Plus,
  Trash2,
  GripVertical,
} from "lucide-react";
import { Field, Button } from "../components/UI";
import { apiRequest } from "../lib/api";
import { sectionTypes, required, newSection } from "./design";
import ImagePicker from "./ImagePicker";
import styles from "./store.module.css";
export default function SectionEditor({ design, onChange, products = [] }) {
  const [addType, setAddType] = useState("hero"),
    [dragged, setDragged] = useState(null),
    [collections, setCollections] = useState([]);
  useEffect(() => {
    apiRequest("/v1-1/store-studio/commerce/collections")
      .then((d) => setCollections(d.items))
      .catch(() => {});
  }, []);
  const update = (id, patch) =>
    onChange({
      ...design,
      sections: design.sections.map((s) =>
        s.id === id ? { ...s, ...patch } : s,
      ),
    });
  const reorder = (from, to) => {
    if (from === to || to < 0 || to >= design.sections.length) return;
    const items = [...design.sections],
      item = items.splice(from, 1)[0];
    items.splice(to, 0, item);
    if (
      items.at(-1).type !== "footer" ||
      items.findIndex((s) => s.type === "header") >
        items.findIndex((s) => s.type === "catalogue")
    )
      return;
    onChange({ ...design, sections: items });
  };
  const insert = (type, source) => {
    if (design.sections.length >= 40) return;
    const section = source
      ? { ...structuredClone(source), id: `${type}-${crypto.randomUUID()}` }
      : { ...newSection(type, `${type}-${crypto.randomUUID()}`) };
    const items = [...design.sections];
    items.splice(items.length - 1, 0, section);
    onChange({ ...design, sections: items });
  };
  return (
    <>
      <h2>Your sections</h2>
      <div className={styles.row}>
        <select
          aria-label="Section to add"
          value={addType}
          onChange={(e) => setAddType(e.target.value)}
        >
          {sectionTypes
            .filter((t) => !required.includes(t))
            .map((t) => (
              <option key={t}>{t}</option>
            ))}
        </select>
        <Button
          disabled={design.sections.length >= 40}
          onClick={() => insert(addType)}
        >
          <Plus size={14} /> Add
        </Button>
      </div>
      <p>
        Drag sections or use the arrows to reorder. Changes stay in your draft
        until published.
      </p>
      {design.sections.map((s, i) => {
        const settings = s.settings || {},
          set = (key, value) =>
            update(s.id, { settings: { ...settings, [key]: value } });
        return (
          <details
            id={`studio-section-${s.id}`}
            key={s.id}
            className={styles.sectionControl}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (dragged !== null) reorder(dragged, i);
              setDragged(null);
            }}
          >
            <summary>
              <span
                draggable={!required.includes(s.type)}
                onDragStart={() => setDragged(i)}
                onDragEnd={() => setDragged(null)}
                aria-label="Drag section"
              >
                <GripVertical size={14} />
              </span>{" "}
              {s.type.replaceAll("-", " ")} · {s.visible ? "Visible" : "Hidden"}
            </summary>
            {!required.includes(s.type) && (
              <label>
                <input
                  type="checkbox"
                  checked={s.visible}
                  onChange={(e) => update(s.id, { visible: e.target.checked })}
                />{" "}
                Show section
              </label>
            )}
            <div className={styles.row}>
              <button
                aria-label={`Move ${s.type} up`}
                onClick={() => reorder(i, i - 1)}
                disabled={i === 0 || s.type === "footer"}
              >
                <ArrowUp size={15} />
              </button>
              <button
                aria-label={`Move ${s.type} down`}
                onClick={() => reorder(i, i + 1)}
                disabled={i >= design.sections.length - 2}
              >
                <ArrowDown size={15} />
              </button>
              {!required.includes(s.type) && (
                <>
                  <button
                    aria-label={`Duplicate ${s.type}`}
                    onClick={() => insert(s.type, s)}
                  >
                    <Copy size={15} />
                  </button>
                  <button
                    aria-label={`Remove ${s.type}`}
                    onClick={() =>
                      onChange({
                        ...design,
                        sections: design.sections.filter((x) => x.id !== s.id),
                      })
                    }
                  >
                    <Trash2 size={15} />
                  </button>
                </>
              )}
            </div>
            {!["header", "categories"].includes(s.type) && (
              <>
                <Field label="Heading">
                  <input
                    value={s.title}
                    maxLength={120}
                    onChange={(e) => update(s.id, { title: e.target.value })}
                  />
                </Field>
                <Field label="Description">
                  <textarea
                    value={s.text}
                    maxLength={3000}
                    rows={3}
                    onChange={(e) => update(s.id, { text: e.target.value })}
                  />
                </Field>
              </>
            )}
            {s.type==="footer"&&<><p>Brand text, shop links, contact details and policies appear in your footer. Contact details come from store settings.</p>{["showCategories","showContact"].map(k=><label key={k}><input type="checkbox" checked={settings[k]!==false} onChange={e=>set(k,e.target.checked)}/>{k==="showCategories"?"Show category links":"Show contact details"}</label>)}{s.items.map((item,i)=><div key={i}><Field label="Link label"><input value={item.title||""} onChange={e=>update(s.id,{items:s.items.map((x,n)=>n===i?{...x,title:e.target.value}:x)})}/></Field><Field label="Link URL (HTTPS)"><input value={item.url||""} onChange={e=>update(s.id,{items:s.items.map((x,n)=>n===i?{...x,url:e.target.value}:x)})}/></Field><button onClick={()=>update(s.id,{items:s.items.filter((_,n)=>n!==i)})}>Remove link</button></div>)}<button disabled={s.items.length>=10} onClick={()=>update(s.id,{items:[...s.items,{title:"",url:""}]})}>Add footer link</button></>}
            {["hero", "about", "promotion"].includes(s.type) && (
              <>
                <ImagePicker
                  label="Desktop image"
                  value={s.image}
                  onChange={(image) => update(s.id, { image })}
                />
                <ImagePicker
                  label="Mobile image (optional)"
                  value={settings.mobileImage || ""}
                  onChange={(v) => set("mobileImage", v)}
                />
                <Field label="Image description">
                  <input
                    value={settings.alt || ""}
                    onChange={(e) => set("alt", e.target.value)}
                  />
                </Field>
              </>
            )}
            {s.type === "hero" && (
              <>
                <Field label="Video URL (optional, HTTPS)">
                  <input
                    type="url"
                    value={settings.video || ""}
                    onChange={(e) => set("video", e.target.value)}
                  />
                </Field>
                <Field label="Height">
                  <select
                    value={settings.height || "medium"}
                    onChange={(e) => set("height", e.target.value)}
                  >
                    {["compact", "medium", "tall"].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Overlay strength">
                  <input
                    type="range"
                    min={0}
                    max={80}
                    value={settings.overlay ?? 25}
                    onChange={(e) => set("overlay", Number(e.target.value))}
                  />
                </Field>
                {["focalX", "focalY"].map((k) => (
                  <Field
                    key={k}
                    label={
                      k === "focalX"
                        ? "Horizontal image focus"
                        : "Vertical image focus"
                    }
                  >
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={settings[k] ?? 50}
                      onChange={(e) => set(k, Number(e.target.value))}
                    />
                  </Field>
                ))}
                <Field label="Hero text colour">
                  <PaletteInput
                    type="color"
                    value={settings.textColour || "#ffffff"}
                    onChange={(e) => set("textColour", e.target.value)}
                  />
                </Field>
              </>
            )}
            {["hero", "promotion", "about", "contact"].includes(s.type) && (
              <>
                {s.type === "hero" && <><Field label="Hero text position"><select value={settings.verticalPosition||"bottom"} onChange={e=>set("verticalPosition",e.target.value)}><option value="bottom">Bottom</option><option value="center">Center</option><option value="top">Top</option></select></Field><Field label="Hero button style"><select value={settings.buttonStyle||"light"} onChange={e=>set("buttonStyle",e.target.value)}><option value="light">White with brand text</option><option value="brand">Brand colour</option></select></Field></>}
                <Field label="Text alignment">
                  <select
                    value={settings.alignment || "center"}
                    onChange={(e) => set("alignment", e.target.value)}
                  >
                    {["left", "center", "right"].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Button label">
                  <input
                    maxLength={50}
                    value={settings.ctaLabel || ""}
                    onChange={(e) => set("ctaLabel", e.target.value)}
                  />
                </Field>
                <Field label="Button destination">
                  <select
                    value={settings.ctaType || "catalogue"}
                    onChange={(e) => set("ctaType", e.target.value)}
                  >
                    <option value="catalogue">Product catalogue</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="collection">Collection</option>
                    <option value="link">Website link</option>
                  </select>
                </Field>
                {settings.ctaType === "link" && (
                  <Field label="Website URL">
                    <input
                      type="url"
                      value={settings.ctaUrl || ""}
                      onChange={(e) => set("ctaUrl", e.target.value)}
                    />
                  </Field>
                )}
                {settings.ctaType === "collection" && (
                  <Field label="Collection">
                    <select
                      value={settings.ctaUrl || ""}
                      onChange={(e) => set("ctaUrl", e.target.value)}
                    >
                      <option value="">Choose</option>
                      {collections.map((c) => (
                        <option value={c.slug} key={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}
              </>
            )}
            {["featured", "new-arrivals", "best-sellers"].includes(s.type) && (
              <>
                <Field label="Maximum products">
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={settings.limit || 8}
                    onChange={(e) => set("limit", Number(e.target.value))}
                  />
                </Field>
                {s.type === "featured" && (
                  <fieldset>
                    <legend>Pick products</legend>
                    {products.map((p) => (
                      <label key={p._id}>
                        <input
                          type="checkbox"
                          checked={s.productIds.includes(p._id)}
                          onChange={(e) =>
                            update(s.id, {
                              productIds: e.target.checked
                                ? [...s.productIds, p._id]
                                : s.productIds.filter((id) => id !== p._id),
                            })
                          }
                        />
                        {p.name}
                      </label>
                    ))}
                  </fieldset>
                )}
              </>
            )}
            {s.type === "announcement" && <><p>The main text is the first announcement. Add more below; visitors can swipe, use arrows or pause automatic rotation.</p>{s.items.map((item,n)=><div key={n}><Field label={`Announcement ${n+2}`}><input maxLength={600} value={item.text||""} onChange={e=>update(s.id,{items:s.items.map((v,j)=>j===n?{...v,text:e.target.value}:v)})}/></Field><Button variant="secondary" onClick={()=>update(s.id,{items:s.items.filter((_,j)=>j!==n)})}>Remove announcement</Button></div>)}<Button variant="secondary" disabled={s.items.length>=10} onClick={()=>update(s.id,{items:[...s.items,{text:""}]})}>Add announcement</Button></>}
            {["faq", "benefits", "gallery"].includes(s.type) && (
              <>
                {s.items.map((item, n) => (
                  <div
                    key={n}
                    style={{ padding: "12px 0", borderTop: "1px solid #ddd" }}
                  >
                    {s.type === "faq" ? (
                      <>
                        <Field label="Question">
                          <input
                            value={item.question || ""}
                            onChange={(e) =>
                              update(s.id, {
                                items: s.items.map((v, j) =>
                                  j === n
                                    ? { ...v, question: e.target.value }
                                    : v,
                                ),
                              })
                            }
                          />
                        </Field>
                        <Field label="Answer">
                          <textarea
                            value={item.answer || ""}
                            onChange={(e) =>
                              update(s.id, {
                                items: s.items.map((v, j) =>
                                  j === n
                                    ? { ...v, answer: e.target.value }
                                    : v,
                                ),
                              })
                            }
                          />
                        </Field>
                      </>
                    ) : (
                      <>
                        <Field label="Title">
                          <input
                            value={item.title || ""}
                            onChange={(e) =>
                              update(s.id, {
                                items: s.items.map((v, j) =>
                                  j === n ? { ...v, title: e.target.value } : v,
                                ),
                              })
                            }
                          />
                        </Field>
                        <Field label="Text">
                          <input
                            value={item.text || ""}
                            onChange={(e) =>
                              update(s.id, {
                                items: s.items.map((v, j) =>
                                  j === n ? { ...v, text: e.target.value } : v,
                                ),
                              })
                            }
                          />
                        </Field>
                        {s.type === "gallery" ? (
                          <ImagePicker
                            label="Image"
                            value={item.image || ""}
                            onChange={(image) =>
                              update(s.id, {
                                items: s.items.map((v, j) =>
                                  j === n ? { ...v, image } : v,
                                ),
                              })
                            }
                          />
                        ) : (
                          <Field label="Icon">
                            <select
                              value={item.icon || "check"}
                              onChange={(e) =>
                                update(s.id, {
                                  items: s.items.map((v, j) =>
                                    j === n
                                      ? { ...v, icon: e.target.value }
                                      : v,
                                  ),
                                })
                              }
                            >
                              {[
                                "truck",
                                "shield",
                                "heart",
                                "check",
                                "leaf",
                                "star",
                              ].map((v) => (
                                <option key={v}>{v}</option>
                              ))}
                            </select>
                          </Field>
                        )}
                      </>
                    )}
                    <button
                      onClick={() =>
                        update(s.id, {
                          items: s.items.filter((_, j) => j !== n),
                        })
                      }
                    >
                      Remove item
                    </button>
                  </div>
                ))}
                <button
                  disabled={s.items.length >= 10}
                  onClick={() => update(s.id, { items: [...s.items, {}] })}
                >
                  Add item
                </button>
              </>
            )}
            {!required.includes(s.type) && (
              <>
                <label>
                  <input
                    type="checkbox"
                    checked={!!settings.hideMobile}
                    onChange={(e) => set("hideMobile", e.target.checked)}
                  />{" "}
                  Hide on phones
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={!!settings.hideDesktop}
                    onChange={(e) => set("hideDesktop", e.target.checked)}
                  />{" "}
                  Hide on larger screens
                </label>
              </>
            )}
          </details>
        );
      })}
    </>
  );
}

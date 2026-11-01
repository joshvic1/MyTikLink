import { useEffect, useRef, useState } from "react";
import { Plus, Search, X, Pencil, Archive, ChevronRight } from "lucide-react";
import { apiRequest, v11Api } from "../lib/api";
import { Button, Field, Modal } from "../components/UI";
import { notify } from "../components/Notifications";
import ImagePicker from "./ImagePicker";
import css from "./StoreSettings.module.css";
const endpoint = "/v1-1/store-studio/categories";
export function CategoryEditor({ category, onClose, onSaved, parents = [] }) {
  const [form, setForm] = useState(
    category || {
      name: "",
      slug: "",
      description: "",
      image: "",
      visible: true,
      sortOrder: 0,
      parent: "",
    },
  );
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [discard, setDiscard] = useState(false);
  const lock = useRef(false),
    dirty = useRef(false);
  const set = (key, value) => {
    dirty.current = true;
    setForm((f) => ({ ...f, [key]: value }));
  };
  const close = () => {
    if (lock.current) return;
    if (dirty.current) setDiscard(true);
    else onClose();
  };
  const submit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await apiRequest(
        endpoint + (category ? `/${category._id}` : ""),
        { method: category ? "PATCH" : "POST", body: JSON.stringify(form) },
      );
      notify.success(category ? "Category updated" : "Category created");
      onSaved(result.category);
    } catch (e) {
      setError(e.message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  return (
    <Modal
      tone="teal"
      title={category ? "Edit category" : "Add a category"}
      description="Organise the products in your store."
      onClose={close}
      footer={
        <>
          {discard ? (
            <>
              <Button variant="secondary" onClick={() => setDiscard(false)}>
                Keep editing
              </Button>
              <Button onClick={onClose}>Discard changes</Button>
            </>
          ) : (
            <>
              <Button variant="secondary" disabled={busy} onClick={close}>
                Cancel
              </Button>
              <Button
                form="store-category-editor"
                type="submit"
                disabled={busy}
              >
                {busy ? "Saving…" : "Save category"}
              </Button>
            </>
          )}
        </>
      }
    >
      {discard && <p role="alert">Discard your unsaved category changes?</p>}
      <form id="store-category-editor" onSubmit={submit} className={css.form}>
        <Field label="Category name">
          <input
            autoFocus
            required
            maxLength={80}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </Field>
        <Field label="Category URL">
          <input
            maxLength={80}
            placeholder="Created from the name"
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
          />
        </Field>
        <Field label="Parent category">
          <select
            value={form.parent || ""}
            onChange={(e) => set("parent", e.target.value)}
          >
            <option value="">None — top level</option>
            {parents
              .filter((p) => !p.parent && p._id !== category?._id)
              .map((p) => (
                <option value={p._id} key={p._id}>
                  {p.name}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Description">
          <textarea
            rows={3}
            maxLength={600}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>
        <Field label="Search title (optional)">
          <input
            maxLength={70}
            value={form.seoTitle || ""}
            onChange={(e) => set("seoTitle", e.target.value)}
          />
        </Field>
        <Field label="Search description (optional)">
          <textarea
            maxLength={170}
            value={form.seoDescription || ""}
            onChange={(e) => set("seoDescription", e.target.value)}
          />
        </Field>
        <ImagePicker
          label="Category image"
          value={form.image}
          onChange={(url) => set("image", url)}
        />
        <Field label="Display order">
          <input
            type="number"
            min={0}
            max={10000}
            value={form.sortOrder}
            onChange={(e) => set("sortOrder", Number(e.target.value))}
          />
        </Field>
        <label className={css.check}>
          <input
            type="checkbox"
            checked={form.visible}
            onChange={(e) => set("visible", e.target.checked)}
          />{" "}
          Show in store navigation
        </label>
        {error && (
          <p role="alert" className={css.error}>
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}
export function CategoryManager() {
  const [merging, setMerging] = useState(null),
    [rows, setRows] = useState([]),
    [query, setQuery] = useState(""),
    [page, setPage] = useState(1),
    [more, setMore] = useState(false),
    [busy, setBusy] = useState(true),
    [error, setError] = useState(""),
    [editing, setEditing] = useState(null),
    [reload, setReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setBusy(true);
    const timer = setTimeout(
      () =>
        apiRequest(
          `${endpoint}?page=${page}&search=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        )
          .then((d) => {
            setRows(d.categories);
            setMore(d.hasMore);
            setError("");
          })
          .catch((e) => {
            if (!controller.signal.aborted) setError(e.message);
          })
          .finally(() => {
            if (!controller.signal.aborted) setBusy(false);
          }),
      query ? 250 : 0,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, page, reload]);
  const archive = async (row) => {
    if (!window.confirm(`Archive ${row.name}? Products must be moved first.`))
      return;
    try {
      await apiRequest(`${endpoint}/${row._id}`, { method: "DELETE" });
      setReload((v) => v + 1);
      notify.success("Category archived");
    } catch (e) {
      notify.error(e.message);
    }
  };
  return (
    <>
      <div className={css.panelHeading}>
        <div>
          <h2>Product categories</h2>
          <p>Give every collection a clear place in your store.</p>
        </div>
        <Button onClick={() => setEditing({})}>
          <Plus size={16} /> Add category
        </Button>
      </div>
      <label className={css.search}>
        <Search size={18} />
        <input
          aria-label="Search categories"
          placeholder="Search categories"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
      </label>
      {error && (
        <p role="alert" className={css.error}>
          {error} <button onClick={() => setReload((v) => v + 1)}>Retry</button>
        </p>
      )}
      {busy ? (
        <p role="status">Loading categories…</p>
      ) : rows.length ? (
        <div className={css.categoryList}>
          {rows.map((row) => (
            <article key={row._id}>
              {row.image ? (
                <img src={row.image} alt="" />
              ) : (
                <span className={css.categoryInitial}>{row.name[0]}</span>
              )}
              <div>
                <strong>{row.name}</strong>
                <small>
                  /{row.slug} · {row.visible ? "Visible" : "Hidden"}
                </small>
              </div>
              <button
                aria-label={`Edit ${row.name}`}
                onClick={() => setEditing(row)}
              >
                <Pencil size={16} />
              </button>
              <button
                aria-label={`Merge ${row.name}`}
                onClick={() => setMerging(row)}
              >
                Merge
              </button>
              <button
                aria-label={`Archive ${row.name}`}
                onClick={() => archive(row)}
              >
                <Archive size={16} />
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className={css.empty}>
          <h3>
            {query ? "No matching categories" : "A place for every product"}
          </h3>
          <p>
            {query
              ? "Try another name."
              : "Create your first category, then select it when adding a product. Existing product category names are preserved."}
          </p>
        </div>
      )}
      <div className={css.pagination}>
        <Button
          variant="secondary"
          disabled={page === 1 || busy}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </Button>
        <span>Page {page}</span>
        <Button
          variant="secondary"
          disabled={!more || busy}
          onClick={() => setPage((p) => p + 1)}
        >
          Next <ChevronRight size={14} />
        </Button>
      </div>
      {merging && (
        <CategoryMerge
          category={merging}
          onClose={() => setMerging(null)}
          onSaved={() => {
            setMerging(null);
            setReload((v) => v + 1);
          }}
        />
      )}
      {editing && (
        <CategoryEditor
          category={editing._id ? editing : null}
          parents={rows}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            setReload((v) => v + 1);
          }}
        />
      )}
    </>
  );
}
export function CategoryPicker({ value, onChange }) {
  const [choices, setChoices] = useState([]),
    [legacy, setLegacy] = useState([]),
    [open, setOpen] = useState(false),
    [adding, setAdding] = useState(false),
    [search, setSearch] = useState(""),
    [error, setError] = useState("");
  const trigger = useRef(null);
  useEffect(() => {
    v11Api
      .productCategories()
      .then((d) => setLegacy(d.categories || []))
      .catch((e) => setError(e.message));
  }, []);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const timer = setTimeout(
      () =>
        apiRequest(`${endpoint}?search=${encodeURIComponent(search)}`, {
          signal: controller.signal,
        })
          .then((d) => {
            setChoices(d.categories);
            setError("");
          })
          .catch((e) => {
            if (!controller.signal.aborted) setError(e.message);
          }),
      200,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, open]);
  const toggle = (name) =>
    onChange(
      value.includes(name) ? value.filter((v) => v !== name) : [...value, name],
    );
  const names = [
    ...new Set([...choices.map((c) => c.name), ...legacy, ...value]),
  ]
    .filter((n) => n.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 60);
  return (
    <div className={css.picker}>
      <button
        type="button"
        ref={trigger}
        className={css.pickerTrigger}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {value.length ? value.join(", ") : "Select categories"}{" "}
        <ChevronRight size={16} />
      </button>
      {open && (
        <div className={css.pickerOptions}>
          <input
            aria-label="Search product categories"
            placeholder="Search categories"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="button" onClick={() => setAdding(true)}>
            <Plus size={16} /> Add new category
          </button>
          {error && <p role="alert">{error}</p>}
          {names.map((name) => (
            <button
              type="button"
              key={name}
              aria-pressed={value.includes(name)}
              onClick={() => toggle(name)}
            >
              {value.includes(name) ? "✓ " : ""}
              {name}
            </button>
          ))}
        </div>
      )}
      {adding && (
        <CategoryEditor
          parents={choices}
          onClose={() => {
            setAdding(false);
            setTimeout(
              () => trigger.current?.focus({ preventScroll: true }),
              0,
            );
          }}
          onSaved={(row) => {
            setChoices((c) => [row, ...c]);
            onChange([...new Set([...value, row.name])]);
            setAdding(false);
            setOpen(false);
            setTimeout(
              () => trigger.current?.focus({ preventScroll: true }),
              0,
            );
          }}
        />
      )}
    </div>
  );
}
function CategoryMerge({ category, onClose, onSaved }) {
  const [search, setSearch] = useState(""),
    [choices, setChoices] = useState([]),
    [target, setTarget] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    const c = new AbortController();
    const t = setTimeout(
      () =>
        apiRequest(`${endpoint}?search=${encodeURIComponent(search)}`, {
          signal: c.signal,
        })
          .then((d) =>
            setChoices(d.categories.filter((x) => x._id !== category._id)),
          )
          .catch((e) => {
            if (!c.signal.aborted) setError(e.message);
          }),
      200,
    );
    return () => {
      clearTimeout(t);
      c.abort();
    };
  }, [search]);
  return (
    <Modal
      tone="peach"
      title={`Merge ${category.name}`}
      description="Move its products and discount eligibility to another category, then archive the source. Existing orders are preserved. Move child categories first."
      onClose={() => !busy && onClose()}
      footer={
        <>
          <Button variant="secondary" disabled={busy} onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={busy || !target}
            onClick={async () => {
              setBusy(true);
              setError("");
              try {
                const d = await apiRequest(
                  `${endpoint}/${category._id}/merge`,
                  {
                    method: "POST",
                    body: JSON.stringify({
                      targetId: target,
                      updatedAt: category.updatedAt,
                    }),
                  },
                );
                notify.success(`${d.moved} products moved`);
                onSaved();
              } catch (e) {
                setError(e.message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Merging…" : "Merge categories"}
          </Button>
        </>
      }
    >
      <Field label="Find destination category">
        <input value={search} onChange={(e) => setSearch(e.target.value)} />
      </Field>
      <Field label="Destination">
        <select value={target} onChange={(e) => setTarget(e.target.value)}>
          <option value="">Choose category</option>
          {choices.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      {error && <p role="alert">{error}</p>}
    </Modal>
  );
}

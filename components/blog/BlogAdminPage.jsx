"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ImagePlus,
  LayoutList,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  Youtube,
} from "lucide-react";
import {
  deleteBlogPost,
  getAdminBlogPosts,
  saveBlogPost,
  uploadBlogImage,
} from "@/utils/blogApi";
import styles from "./BlogAdmin.module.css";
import AdminLayout from "../admin/AdminLayout";

const blankPost = {
  title: "",
  authorName: "",
  category: "Creator tool",
  keywords: [],
  excerpt: "",
  status: "draft",
  coverImage: null,
  blocks: [{ type: "paragraph", value: "" }],
};

const categoryOptions = [
  "Link in bio",
  "Payment",
  "Landing page",
  "Online store",
  "Creator tool",
  "Business ideas",
  "Make money",
];

function keywordString(keywords = []) {
  return Array.isArray(keywords) ? keywords.join(", ") : keywords;
}

function parseKeywords(value = "") {
  return value
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

export default function BlogAdminPage() {
  const [posts, setPosts] = useState([]);
  const [active, setActive] = useState(blankPost);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadPosts();
  }, []);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("admin_token") || localStorage.getItem("token")
      : "";

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;

    return posts.filter(
      (post) =>
        post.title?.toLowerCase().includes(q) ||
        post.category?.toLowerCase().includes(q) ||
        post.keywords?.some((keyword) => keyword.toLowerCase().includes(q)),
    );
  }, [posts, query]);

  const loadPosts = async () => {
    try {
      const data = await getAdminBlogPosts(token);
      setPosts(data.posts || []);
    } catch (err) {
      console.log(err);
    }
  };

  const updateBlock = (index, patch) => {
    setActive((post) => ({
      ...post,
      blocks: post.blocks.map((block, blockIndex) =>
        blockIndex === index ? { ...block, ...patch } : block,
      ),
    }));
  };

  const addBlock = (type) => {
    const next =
      type === "image"
        ? { type, url: "", caption: "" }
        : type === "youtube"
          ? { type, url: "", title: "" }
          : { type, value: "" };

    setActive((post) => ({ ...post, blocks: [...post.blocks, next] }));
  };

  const removeBlock = (index) => {
    setActive((post) => ({
      ...post,
      blocks: post.blocks.filter((_, blockIndex) => blockIndex !== index),
    }));
  };

  const uploadImage = async (file, blockIndex = null) => {
    if (!file) return;

    try {
      const data = await uploadBlogImage(token, file);

      if (blockIndex === null) {
        setActive((post) => ({
          ...post,
          coverImage: { url: data.url, key: data.key },
        }));
        return;
      }

      updateBlock(blockIndex, { url: data.url, key: data.key });
    } catch (err) {
      setMessage(err.message);
    }
  };

  const savePost = async () => {
    try {
      setSaving(true);
      const data = await saveBlogPost(token, active, active._id);
      setActive(data.post);
      setMessage("Post saved");
      await loadPosts();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const removePost = async (post) => {
    const ok = window.confirm(`Delete "${post.title}"?`);
    if (!ok) return;

    await deleteBlogPost(token, post._id);
    setActive(blankPost);
    await loadPosts();
  };

  return (
    <AdminLayout>
      <main className={styles.adminPage}>
        <aside className={styles.sidebar}>
          <div className={styles.sideHeader}>
            <div>
              <p>Content</p>
              <h1>Blog</h1>
            </div>

            <button type="button" onClick={() => setActive(blankPost)}>
              <Plus size={17} />
            </button>
          </div>

          <div className={styles.searchWrap}>
            <Search size={15} />
            <input
              value={query}
              placeholder="Search posts..."
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className={styles.postList}>
            {filteredPosts.map((post) => (
              <button
                type="button"
                key={post._id}
                className={`${styles.postRow} ${
                  active?._id === post._id ? styles.activeRow : ""
                }`}
                onClick={() => setActive(post)}
              >
                <LayoutList size={15} />
                <span>{post.title || "Untitled post"}</span>
                <small>{post.status}</small>
              </button>
            ))}
          </div>
        </aside>

        <section className={styles.editor}>
          <div className={styles.editorTop}>
            <div>
              <p>Blog editor</p>
              <h2>{active?._id ? "Edit post" : "New post"}</h2>
            </div>

            <div className={styles.editorActions}>
              {active?._id && (
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => removePost(active)}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              )}
              <button type="button" onClick={savePost} disabled={saving}>
                <Save size={16} />
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {message && <p className={styles.message}>{message}</p>}

          <div className={styles.formGrid}>
            <label>
              Title
              <input
                value={active.title}
                onChange={(event) =>
                  setActive({ ...active, title: event.target.value })
                }
              />
            </label>

            <label>
              Author
              <input
                value={active.authorName}
                onChange={(event) =>
                  setActive({ ...active, authorName: event.target.value })
                }
              />
            </label>

            <label>
              Category
              <select
                value={active.category || "Creator tool"}
                onChange={(event) =>
                  setActive({ ...active, category: event.target.value })
                }
              >
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Keywords
              <input
                value={keywordString(active.keywords)}
                placeholder="link in bio, payment, landing page"
                onChange={(event) =>
                  setActive({
                    ...active,
                    keywords: parseKeywords(event.target.value),
                  })
                }
              />
            </label>

            <label>
              Excerpt
              <textarea
                rows={3}
                value={active.excerpt}
                onChange={(event) =>
                  setActive({ ...active, excerpt: event.target.value })
                }
              />
            </label>

            <label>
              Status
              <select
                value={active.status}
                onChange={(event) =>
                  setActive({ ...active, status: event.target.value })
                }
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
          </div>

          <div className={styles.coverBox}>
            <div>
              <p>Cover image</p>
              <span>
                Upload the main image shown on the blog card and post.
              </span>
            </div>
            <label className={styles.uploadBtn}>
              <ImagePlus size={16} />
              Upload image
              <input
                type="file"
                accept="image/*"
                onChange={(event) => uploadImage(event.target.files?.[0])}
              />
            </label>
            {active.coverImage?.url && (
              <img src={active.coverImage.url} alt="" />
            )}
          </div>

          <div className={styles.blockTools}>
            <button type="button" onClick={() => addBlock("paragraph")}>
              <Pencil size={15} />
              Text
            </button>
            <button type="button" onClick={() => addBlock("heading")}>
              <LayoutList size={15} />
              Heading
            </button>
            <button type="button" onClick={() => addBlock("image")}>
              <ImagePlus size={15} />
              Image
            </button>
            <button type="button" onClick={() => addBlock("youtube")}>
              <Youtube size={15} />
              YouTube
            </button>
          </div>

          <div className={styles.blocks}>
            {active.blocks.map((block, index) => (
              <div className={styles.blockCard} key={`${block.type}-${index}`}>
                <div className={styles.blockHeader}>
                  <strong>{block.type}</strong>
                  <button type="button" onClick={() => removeBlock(index)}>
                    <Trash2 size={14} />
                  </button>
                </div>

                {["paragraph", "heading"].includes(block.type) && (
                  <textarea
                    rows={block.type === "heading" ? 2 : 6}
                    value={block.value}
                    onChange={(event) =>
                      updateBlock(index, { value: event.target.value })
                    }
                  />
                )}

                {block.type === "youtube" && (
                  <input
                    value={block.url}
                    placeholder="Paste YouTube link or embed URL"
                    onChange={(event) =>
                      updateBlock(index, { url: event.target.value })
                    }
                  />
                )}

                {block.type === "image" && (
                  <>
                    <label className={styles.inlineUpload}>
                      <ImagePlus size={15} />
                      Upload image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                          uploadImage(event.target.files?.[0], index)
                        }
                      />
                    </label>
                    <input
                      value={block.caption || ""}
                      placeholder="Caption"
                      onChange={(event) =>
                        updateBlock(index, { caption: event.target.value })
                      }
                    />
                    {block.url && <img src={block.url} alt="" />}
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </AdminLayout>
  );
}

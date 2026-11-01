import { uploadStoreImage } from "./storeMedia";
import { useState } from "react";
import { apiRequest } from "../lib/api";
export default function ImagePicker({ label, value, onChange }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [progress, setProgress] = useState(""),
    [recent, setRecent] = useState(null);
  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const result = await uploadStoreImage(file, { onProgress: setProgress });
      onChange(result.url);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };
  const browse = async () => {
    setError("");
    try {
      const data = await apiRequest("/v1-1/store-studio/commerce/media/jobs");
      setRecent(data.jobs.filter((j) => j.status === "ready"));
    } catch (e) {
      setError(e.message);
    }
  };
  return (
    <div>
      <label style={{ display: "grid", gap: 10, fontSize: 12 }}>
        {label}
        {value && (
          <img
            src={value}
            alt="Selected image"
            style={{ maxHeight: 90, maxWidth: "100%", objectFit: "contain" }}
          />
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={busy}
          onChange={upload}
        />
      </label>
      {busy && <small role="status">{progress}</small>}
      <button type="button" disabled={busy} onClick={browse}>
        Choose a recent image
      </button>
      {value && (
        <button type="button" disabled={busy} onClick={() => onChange("")}>
          Remove image
        </button>
      )}
      {recent && (
        <div
          aria-label="Recent store images"
          style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: 8 }}
        >
          {recent.length ? (
            recent.map((image, i) => (
              <button
                type="button"
                key={image._id}
                aria-label={`Use recent image ${i + 1}`}
                onClick={() => {
                  onChange(image.url);
                  setRecent(null);
                }}
              >
                <img
                  src={image.url}
                  alt=""
                  width={64}
                  height={48}
                  loading="lazy"
                  style={{ objectFit: "cover" }}
                />
              </button>
            ))
          ) : (
            <small>
              No completed images yet. Check Advanced for processing status.
            </small>
          )}
          <button type="button" onClick={() => setRecent(null)}>
            Close images
          </button>
        </div>
      )}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}

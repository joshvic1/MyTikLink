import {ImageIcon} from "lucide-react";
import css from "./CatalogEditor.module.css";
import {SmallLoading} from "./CatalogControls";
import { uploadStoreImage } from "./storeMedia";
import { useState } from "react";
import { apiRequest } from "../lib/api";
export default function ImagePicker({ label, value, onChange }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [progress, setProgress] = useState(""),
    [recent, setRecent] = useState(null);
  const [page,setPage]=useState(0),[more,setMore]=useState(false),[loading,setLoading]=useState(false);
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
  const browse=async(next=1)=>{if(loading)return;setLoading(true);setError('');try{const data=await apiRequest(`/v1-1/store-studio/commerce/recent-images?page=${next}`);setRecent(old=>next===1?data.items:[...(old||[]),...data.items]);setPage(next);setMore(data.hasMore);}catch(e){setError(e.message);}finally{setLoading(false);}};
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
      <button className={css.recent} type="button" disabled={busy||loading} onClick={()=>browse(1)}><ImageIcon size={16}/>
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
          className={css.images}
        >
          {recent.length ? (
            recent.map((image, i) => (
              <button
                type="button"
                key={`${image._id}-${image.imageIndex}`}
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
              No product images yet. Upload an image above.
            </small>
          )}
          <button type="button" onClick={() => setRecent(null)}>
            Close images
          </button>
        </div>
      )}
      {loading&&<SmallLoading label="Finding images…"/>}
      {recent&&more&&<button className={css.recent} type="button" disabled={loading} onClick={()=>browse(page+1)}>Load more images</button>}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}

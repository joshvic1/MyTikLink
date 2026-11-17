import {Plus} from 'lucide-react';
import styles from '../styles/v11.module.css';
import {buildVariants} from './variantDraft.mjs';
import NumericInput from "../components/NumericInput";
import { useRef, useState } from "react";
import { Button, Field } from "../components/UI";
export default function VariantEditor({ form, set }) {
  const [draft, setDraft] = useState(() => form.variantGroups || []),
    [error, setError] = useState("");
  const cache=useRef(new Map());
  const changeDraft=next=>{
    for(const row of form.inventory||[])cache.current.set(JSON.stringify(row.values),row);
    setDraft(next);
    const result=buildVariants(next,[...cache.current.values()]);
    setError(result.error||'');set('variantError',result.error||'');
    if(result.error)return;
    set('variantGroups',result.groups);set('inventory',result.inventory);
    if(result.inventory.length)set('stock',result.inventory.reduce((sum,row)=>sum+Number(row.stock||0),0));
  };
  return (
    <section className={styles.variantEditor}>
      <h3>Product options</h3>
      <p>Available stock excludes units held by unpaid orders.</p>
      <label className={styles.productCheckbox}>
        <input
          type="checkbox"
          checked={form.trackStock !== false}
          onChange={(e) => set("trackStock", e.target.checked)}
        />{" "}
        <span>Track available stock</span>
      </label>
      {draft.map((g, i) => (
        <div key={i}>
          <Field label={`Option ${i + 1} name`}>
            <input
              value={g.name}
              placeholder="Size"
              onChange={(e) =>
                changeDraft(
                  draft.map((v, n) =>
                    n === i ? { ...v, name: e.target.value } : v,
                  ),
                )
              }
            />
          </Field>
          <Field label="Values, separated by commas">
            <input
              value={g.optionsText ?? g.options.join(", ")}
              placeholder="Small, Medium, Large"
              onChange={(e) =>
                changeDraft(
                  draft.map((v, n) =>
                    n === i ? { ...v, optionsText: e.target.value } : v,
                  ),
                )
              }
            />
          </Field>
          <Button
            type="button"
            variant="secondary"
            onClick={() => changeDraft(draft.filter((_, n) => n !== i))}
          >
            Remove option
          </Button>
        </div>
      ))}
      <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
        <Button
          type="button"
          variant="secondary"
          className={styles.addProductOption}
          disabled={draft.length >= 4}
          onClick={() => changeDraft([...draft, { name: "", options: [] }])}
        >
          <Plus size={16}/> Add option
        </Button>
      </div>
      {error && <p role="alert">{error}</p>}
      {form.inventory?.map((row, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 90px 1fr",
            gap: 10,
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <strong>{Object.values(row.values).join(" / ")}</strong>
          <Field label="Stock">
            <NumericInput
              type="number"
              min={0}
              value={row.stock}
              onChange={(e) => {
                const rows = form.inventory.map((v, n) =>
                  n === i ? { ...v, stock: Number(e.target.value) } : v,
                );
                set("inventory", rows);
                set(
                  "stock",
                  rows.reduce((n, v) => n + Number(v.stock), 0),
                );
              }}
            />
          </Field>
          <Field label="SKU">
            <input
              value={row.sku || ""}
              onChange={(e) =>
                set(
                  "inventory",
                  form.inventory.map((v, n) =>
                    n === i ? { ...v, sku: e.target.value } : v,
                  ),
                )
              }
            />
          </Field>
        </div>
      ))}
    </section>
  );
}

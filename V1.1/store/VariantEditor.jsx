import NumericInput from "../components/NumericInput";
import { useState } from "react";
import { Button, Field } from "../components/UI";
export default function VariantEditor({ form, set }) {
  const [draft, setDraft] = useState(() => form.variantGroups || []),
    [error, setError] = useState("");
  const generate = () => {
    const names = new Set();
    let rows = [{}];
    for (const g of draft) {
      const name = g.name.trim(),
        options = [
          ...new Set(
            (g.optionsText ?? g.options.join(","))
              .split(",")
              .map((v) => v.trim())
              .filter(Boolean),
          ),
        ];
      if (!name || names.has(name) || !options.length) {
        setError("Give every option a unique name and at least one value.");
        return;
      }
      names.add(name);
      rows = rows.flatMap((r) => options.map((v) => ({ ...r, [name]: v })));
      if (rows.length > 100) {
        setError("Use no more than 100 combinations.");
        return;
      }
    }
    const groups = draft.map((g) => ({
      name: g.name.trim(),
      options: [
        ...new Set(
          (g.optionsText ?? g.options.join(","))
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean),
        ),
      ],
    }));
    const inventory = groups.length
      ? rows.map(
          (values) =>
            form.inventory?.find(
              (r) => JSON.stringify(r.values) === JSON.stringify(values),
            ) || { values, stock: 0, sku: "" },
        )
      : [];
    set("variantGroups", groups);
    set("inventory", inventory);
    if (inventory.length)
      set(
        "stock",
        inventory.reduce((n, r) => n + Number(r.stock), 0),
      );
    setError("");
  };
  return (
    <section>
      <h3>Product options</h3>
      <p>Available stock excludes units held by unpaid orders.</p>
      <label>
        <input
          type="checkbox"
          checked={form.trackStock !== false}
          onChange={(e) => set("trackStock", e.target.checked)}
        />{" "}
        Track available stock
      </label>
      {draft.map((g, i) => (
        <div key={i}>
          <Field label={`Option ${i + 1} name`}>
            <input
              value={g.name}
              placeholder="Size"
              onChange={(e) =>
                setDraft((d) =>
                  d.map((v, n) =>
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
                setDraft((d) =>
                  d.map((v, n) =>
                    n === i ? { ...v, optionsText: e.target.value } : v,
                  ),
                )
              }
            />
          </Field>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setDraft((d) => d.filter((_, n) => n !== i))}
          >
            Remove option
          </Button>
        </div>
      ))}
      <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
        <Button
          type="button"
          variant="secondary"
          disabled={draft.length >= 4}
          onClick={() => setDraft((d) => [...d, { name: "", options: [] }])}
        >
          Add option
        </Button>
        <Button type="button" variant="secondary" onClick={generate}>
          Apply options
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

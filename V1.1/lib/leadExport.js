export function leadsCsv(leads) {
  const cell = value => {
    let text = String(value ?? "");
    // Quoting alone does not prevent spreadsheet formulas in visitor input.
    if (/^[\s\u0000-\u001f]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  };
  return [["Name", "WhatsApp", "Date"], ...leads.map(lead => [lead.name, lead.whatsapp, lead.createdAt ? new Date(lead.createdAt).toISOString() : ""])]
    .map(row => row.map(cell).join(",")).join("\r\n");
}
export function downloadLeads(leads, title) {
  const url = URL.createObjectURL(new Blob(["\uFEFF", leadsCsv(leads)], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `MyTikLink-Leads-${String(title || "Page").replace(/[^a-z0-9_-]/gi, "_").slice(0, 80)}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

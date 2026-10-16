import { parsePhoneNumberFromString } from "libphonenumber-js";

export function normalizeLeadPhone(value) {
  const raw = String(value || "").trim();
  if (!/^[+\d\s().-]+$/.test(raw)) return null;
  let international = raw.replace(/^00/, "+");
  // A local number cannot be interpreted safely without its country.
  if (!international.startsWith("+")) {
    if (international.startsWith("0")) return null;
    international = `+${international}`;
  }
  const phone = parsePhoneNumberFromString(international);
  return phone?.isValid() ? phone.number : null;
}
export function validateLeadPhoneInput(input) {
  if (!input) return null;
  const normalized = normalizeLeadPhone(input.value);
  input.setCustomValidity(normalized ? "" : "Include your country code, for example +2348012345678 or +447911123456.");
  if (!normalized) {
    input.reportValidity();
    input.addEventListener("input", () => input.setCustomValidity(""), { once: true });
  }
  return normalized;
}

export function prepareLeadPhoneInput(input) {
  if (!input || input.dataset.countryHint) return;
  input.dataset.countryHint = "true";
  input.setAttribute("type", "tel");
  input.removeAttribute("pattern");
  input.setAttribute("maxlength", "30");
  input.setAttribute("inputmode", "tel");
  input.setAttribute("autocomplete", "tel");
  input.placeholder = "+2348012345678 or +447911123456";
  const hint = document.createElement("small");
  hint.id = `phone-country-${Math.random().toString(36).slice(2)}`;
  hint.textContent = "Include your country code, for example +234 for Nigeria or +44 for the UK.";
  hint.style.cssText = "display:block;font-size:12px;line-height:1.4;margin:4px 0 10px;color:inherit";
  input.setAttribute("aria-describedby", [input.getAttribute("aria-describedby"), hint.id].filter(Boolean).join(" "));
  input.insertAdjacentElement("afterend", hint);
}

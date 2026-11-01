export function cartQuantityLimit(product, variants = product.selectedVariants || {}) {
  if (product.productType === "digital") return 1;
  if (product.trackStock === false) return 100;
  const groups = product.variantGroups || [];
  const stock = groups.length ? product.inventory?.find(row => groups.every(g => row.values?.[g.name] === variants[g.name]))?.stock : product.stock;
  // Legacy products without stock metadata retain their existing quantity ceiling.
  if (stock == null && !groups.length) return 100;
  return Math.max(0, Math.min(100, Math.floor(Number(stock) || 0)));
}
export function clampCartQuantity(product, quantity, variants) {
  return Math.max(0, Math.min(cartQuantityLimit(product, variants), Math.floor(Number(quantity) || 0)));
}

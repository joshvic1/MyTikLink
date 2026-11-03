// New templates declare matching in their registry entry; unclassified designs are not recommended.
export const businessFocusLabels={physical_products:"Physical products",physical_services:"Physical services",digital_products:"Digital products",digital_services:"Digital services"};
export function recommendedStoreThemes(themes,{businessFocus,categoryId}={}){
 if(!businessFocusLabels[businessFocus])return [];
 return Object.entries(themes).filter(([,theme])=>theme.businessFocus?.includes(businessFocus)&&(!theme.categoryIds?.length||theme.categoryIds.includes(categoryId))).sort(([,a],[,b])=>Number(Boolean(b.categoryIds?.includes(categoryId)))-Number(Boolean(a.categoryIds?.includes(categoryId))));
}

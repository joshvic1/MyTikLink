import catalog from "./categoryActions.generated.json";
export function getCategoryActions(category={}) {
 const id=typeof category === "string" ? category : category.id;
 const saved=typeof category === "object" ? category.defaultActions : null;
 if(Array.isArray(saved)&&saved.length)return saved.map(action=>({...action}));
 const keys=catalog.byCategory[id] || catalog.byCategory[String(id||"").split("/")[0]] || catalog.byCategory["other-emerging"];
 return keys.map((key,index)=>({...catalog.definitions[key],rank:index+1,hot:index<2}));
}

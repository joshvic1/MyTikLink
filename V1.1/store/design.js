export const themes={essential:{name:"Market",description:"Product-first shopping with soft colour and compact cards.",accent:"#dc542f",cards:"compact",spacing:"compact"},boutique:{name:"Studio",description:"A short editorial welcome, followed by your collection.",accent:"#353e36",cards:"large",spacing:"comfortable"},digital:{name:"Edit",description:"A focused catalogue for digital products and services.",accent:"#315a83",cards:"list",spacing:"comfortable"}};
export const sectionTypes=["announcement","header","hero","categories","catalogue","featured","about","faq","footer"];
export const required=["header","catalogue","footer"];
export function defaultDesign(theme="essential"){
 const preset=themes[theme]||themes.essential;
 return {schemaVersion:1,themeVersion:1,theme:themes[theme]?theme:"essential",brand:{accent:preset.accent,background:"light",font:"modern",radius:"soft",logo:""},layout:{header:"classic",cards:preset.cards,spacing:preset.spacing,image:"square"},sections:sectionTypes.map(type=>({id:type,type,visible:required.includes(type)||(type==="categories"||(type==="hero"&&theme!=="essential")),title:type==="hero"?"{{store.name}}":type==="catalogue"?"Shop our products":type==="featured"?"Featured products":type==="about"?"Our story":type==="faq"?"Your questions, answered":"",text:type==="hero"?"{{store.description}}":"",image:"",productIds:[],items:[]}))};
}
const text=(value,max=500)=>typeof value==="string"?value.slice(0,max):"";
const pick=(value,choices,fallback)=>choices.includes(value)?value:fallback;
function image(value){if(!value)return "";try{const url=new URL(value);if(url.protocol!=="https:"||url.username||url.password)throw Error();return url.href;}catch{throw new Error("Images must use a valid HTTPS address.");}}
export function validateDesign(input){
 if(!input||input.schemaVersion!==1||input.themeVersion!==1||!themes[input.theme])throw Error("Unsupported store design version or preset.");
 const defaults=defaultDesign(input.theme),brand=input.brand||{},layout=input.layout||{};
 if(!/^#[0-9a-f]{6}$/i.test(brand.accent||""))throw Error("Choose a valid brand colour.");
 if(!Array.isArray(input.sections)||input.sections.length!==sectionTypes.length)throw Error("Store sections are incomplete.");
 const seen=new Set();
 const sections=input.sections.map(s=>{
  if(!sectionTypes.includes(s.type)||seen.has(s.type))throw Error("Unknown or repeated store section.");seen.add(s.type);
  if(required.includes(s.type)&&s.visible!==true)throw Error("Header, product catalogue and footer must remain visible.");
  return {id:s.type,type:s.type,visible:Boolean(s.visible),title:text(s.title,120),text:text(s.text,3000),image:image(s.image),productIds:Array.isArray(s.productIds)?[...new Set(s.productIds.filter(id=>/^[a-f0-9]{24}$/i.test(id)))].slice(0,24):[],items:Array.isArray(s.items)?s.items.slice(0,10).map(item=>({question:text(item.question,160),answer:text(item.answer,1000)})):[]};
 });
 if(sections.findIndex(s=>s.type==="header")>sections.findIndex(s=>s.type==="catalogue")||sections.at(-1).type!=="footer")throw Error("Keep the header above products and the footer last.");
 return {...defaults,brand:{accent:brand.accent,logo:image(brand.logo),background:pick(brand.background,["light","warm","dark"],"light"),font:pick(brand.font,["modern","classic","friendly"],"modern"),radius:pick(brand.radius,["square","soft","rounded"],"soft")},layout:{header:pick(layout.header,["classic","centered"],"classic"),cards:pick(layout.cards,["compact","large","list"],"compact"),spacing:pick(layout.spacing,["compact","comfortable","spacious"],"comfortable"),image:pick(layout.image,["square","portrait","landscape"],"square")},sections};
}
export function validateSetup(input){
 const data={};for(const key of ["name","phone","category","bankName","accountName","accountNumber"]){data[key]=text(input?.[key],160).trim();if(!data[key])throw Error(`Complete your ${key}.`);}
 if(!/^\d{10,34}$/.test(data.accountNumber))throw Error("Enter a bank account number containing 10–34 digits.");
 if(!["physical","digital"].includes(input.businessType))throw Error("Choose what you sell.");return {...data,businessType:input.businessType};
}
export function changeTheme(design,theme){const preset=defaultDesign(theme);return {...design,theme:preset.theme,themeVersion:1,brand:{...design.brand,accent:preset.brand.accent,background:preset.brand.background,font:preset.brand.font,radius:preset.brand.radius},layout:preset.layout,sections:design.sections.map(s=>s.type==="hero"?{...s,visible:theme!=="essential",title:["Discover something you’ll love","Discover something you'll love"].includes(s.title)?"{{store.name}}":s.title}:s)};}

export function resolveStoreText(value,store={}){return String(value||"").replace(/\{\{store\.(name|description|category|phone|email|address)\}\}/g,(_,key)=>String(store[key]||""));}
export function validatePreferences(input={}){return {address:text(input.address,300).trim(),description:text(input.description,600).trim(),showFeatured:input.showFeatured===true};}

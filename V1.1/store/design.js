export const themes={atelier:{name:"Atelier",description:"Refined serif typography, generous product photography and your brand colours.",accent:"#194d46",cards:"compact",spacing:"comfortable"},essential:{name:"Market",description:"Product-first shopping with soft colour and compact cards.",accent:"#dc542f",cards:"compact",spacing:"compact"},boutique:{name:"Studio",description:"A short editorial welcome, followed by your collection.",accent:"#353e36",cards:"large",spacing:"comfortable"},digital:{name:"Edit",description:"A focused catalogue for digital products and services.",accent:"#315a83",cards:"list",spacing:"comfortable"}};
export const sectionTypes=["announcement","header","hero","categories","category-grid","catalogue","featured","about","faq","footer","new-arrivals","best-sellers","collections","promotion","gallery","benefits","reviews","newsletter","contact"];
const initialSections=["announcement","header","hero","categories","catalogue","featured","about","faq","footer"];
export const fontPairings={quattrocento:{name:"Atelier · Quattrocento",heading:"Quattrocento, Georgia, serif",body:"Quattrocento Sans, Arial, sans-serif",url:"https://fonts.googleapis.com/css2?family=Quattrocento:wght@400;700&family=Quattrocento+Sans:wght@400;700&display=swap"},modern:{name:"Modern · System sans",heading:"system-ui, sans-serif",body:"system-ui, sans-serif"},classic:{name:"Classic · Georgia",heading:"Georgia, serif",body:"Arial, sans-serif"},friendly:{name:"Friendly · Trebuchet",heading:"Trebuchet MS, sans-serif",body:"Trebuchet MS, sans-serif"}};
export function newSection(type,id=type){return {id,type,visible:true,title:type.replaceAll("-"," "),text:"",image:"",productIds:[],items:[],settings:{}};}
export const required=["header","catalogue","footer"];
export function defaultDesign(theme="essential"){
 const preset=themes[theme]||themes.essential;
 return {schemaVersion:2,themeVersion:1,theme:themes[theme]?theme:"essential",brand:{accent:preset.accent,background:"light",font:theme==="atelier"?"quattrocento":"modern",radius:theme==="atelier"?"square":"soft",logo:""},layout:{header:"classic",cards:preset.cards,spacing:preset.spacing,image:theme==="atelier"?"portrait":"square"},sections:(theme==="atelier"?["announcement","header","categories","hero","category-grid","catalogue","featured","about","faq","footer"]:initialSections).map(type=>({id:type,type,visible:required.includes(type)||((type==="featured"&&theme==="atelier")||type==="categories"||type==="category-grid"||(type==="hero"&&theme!=="essential")),title:type==="category-grid"?"Shop by category":type==="hero"?"{{store.name}}":type==="catalogue"?(theme==="atelier"?"The collection":"Shop our products"):type==="featured"?"Featured products":type==="about"?"Our story":type==="faq"?"Your questions, answered":"",text:type==="hero"?"{{store.description}}":"",image:"",productIds:[],items:[],settings:type==="hero"?{ctaLabel:"Shop now",ctaType:"catalogue",verticalPosition:"bottom",buttonStyle:"light",height:"medium",overlay:35}:{}}))};
}
const text=(value,max=500)=>typeof value==="string"?value.slice(0,max):"";
const pick=(value,choices,fallback)=>choices.includes(value)?value:fallback;
function image(value){if(!value)return "";try{const url=new URL(value);if(url.protocol!=="https:"||url.username||url.password)throw Error();return url.href;}catch{throw new Error("Images must use a valid HTTPS address.");}}
export function validateDesign(input){
 if(!input||![1,2].includes(input.schemaVersion)||input.themeVersion!==1||!themes[input.theme])throw Error("Unsupported store design version or preset.");
 const defaults=defaultDesign(input.theme),brand=input.brand||{},layout=input.layout||{};
 if(!/^#[0-9a-f]{6}$/i.test(brand.accent||""))throw Error("Choose a valid brand colour.");
 if(!Array.isArray(input.sections)||input.sections.length<3||input.sections.length>40)throw Error("Store sections are incomplete.");
 const seen=new Set();
 const sections=input.sections.map(s=>{
  if(!sectionTypes.includes(s.type)||!/^[-a-zA-Z0-9_]{1,80}$/.test(s.id||s.type)||seen.has(s.id||s.type))throw Error("Unknown or repeated store section.");seen.add(s.id||s.type);
  if(required.includes(s.type)&&s.visible!==true)throw Error("Header, product catalogue and footer must remain visible.");
  return {id:s.id||s.type,type:s.type,visible:Boolean(s.visible),title:text(s.title,120),text:text(s.text,3000),image:image(s.image),productIds:Array.isArray(s.productIds)?[...new Set(s.productIds.filter(id=>/^[a-f0-9]{24}$/i.test(id)))].slice(0,24):[],items:Array.isArray(s.items)?s.items.slice(0,10).map(item=>({question:text(item.question,160),answer:text(item.answer,1000),title:text(item.title,100),url:image(item.url),text:text(item.text,600),image:image(item.image),alt:text(item.alt,160),icon:pick(item.icon,["truck","shield","heart","check","leaf","star"],"check")})):[],settings:validateSectionSettings(s.settings)};
 });
 for(const type of required)if(sections.filter(s=>s.type===type&&s.visible).length!==1)throw Error("Keep exactly one header, catalogue and footer.");
 if(sections.findIndex(s=>s.type==="header")>sections.findIndex(s=>s.type==="catalogue")||sections.at(-1).type!=="footer")throw Error("Keep the header above products and the footer last.");
 return {...defaults,brand:{accent:brand.accent,logo:image(brand.logo),background:pick(brand.background,["light","warm","dark"],"light"),font:pick(brand.font,["modern","classic","friendly","quattrocento"],"modern"),radius:pick(brand.radius,["square","soft","rounded"],"soft"),secondary:colour(brand.secondary,"#f3f5f1"),text:colour(brand.text,brand.background==="dark"?"#f7faf8":"#202420"),surface:colour(brand.surface,brand.background==="dark"?"#171b19":brand.background==="warm"?"#faf7f0":"#ffffff"),border:colour(brand.border,"#e3e5e2"),headingFont:pick(brand.headingFont,Object.keys(fontPairings),brand.font||"modern"),bodyFont:pick(brand.bodyFont,Object.keys(fontPairings),brand.font||"modern"),headingWeight:pick(Number(brand.headingWeight),[400,700],400),bodyWeight:pick(Number(brand.bodyWeight),[400,700],400),favicon:image(brand.favicon)},layout:{header:pick(layout.header,["classic","centered"],"classic"),cards:pick(layout.cards,["compact","large","list"],"compact"),spacing:pick(layout.spacing,["compact","comfortable","spacious"],"comfortable"),image:pick(layout.image,["square","portrait","landscape"],"square")},sections};
}
export function validateSetup(input){
 const data={};for(const key of ["name","phone","category","bankName","accountName","accountNumber"]){data[key]=text(input?.[key],160).trim();if(!data[key])throw Error(`Complete your ${key}.`);}
 if(!/^\d{10,34}$/.test(data.accountNumber))throw Error("Enter a bank account number containing 10–34 digits.");
 if(!["physical","digital"].includes(input.businessType))throw Error("Choose what you sell.");return {...data,businessType:input.businessType};
}
export function changeTheme(design,theme){const preset=defaultDesign(theme);const next={...design,theme:preset.theme,themeVersion:1,brand:{...design.brand,accent:design.brand.accent,background:preset.brand.background,font:preset.brand.font,headingFont:preset.brand.font,bodyFont:preset.brand.font,headingWeight:400,bodyWeight:400,radius:preset.brand.radius},layout:preset.layout,sections:design.sections.map(s=>s.type==="hero"?{...s,visible:theme!=="essential",title:["Discover something you’ll love","Discover something you'll love"].includes(s.title)?"{{store.name}}":s.title}:s)};return theme==="atelier"?applyAtelierHero(next):next;}

export function resolveStoreText(value,store={}){return String(value||"").replace(/\{\{store\.(name|description|category|phone|email|address)\}\}/g,(_,key)=>String(store[key]||""));}
export function validatePreferences(input={}){return {address:text(input.address,300).trim(),description:text(input.description,600).trim(),showFeatured:input.showFeatured===true};}

const colour=(value,fallback)=>/^#[0-9a-f]{6}$/i.test(value||"")?value:fallback;
const number=(value,min,max,fallback)=>Number.isFinite(Number(value))?Math.max(min,Math.min(max,Number(value))):fallback;
export function validateSectionSettings(value={}){
 return {showCategories:value.showCategories!==false,showContact:value.showContact!==false,mobileImage:image(value.mobileImage),video:image(value.video),alt:text(value.alt,160),alignment:pick(value.alignment,["left","center","right"],"center"),verticalPosition:pick(value.verticalPosition,["top","center","bottom"],"bottom"),buttonStyle:pick(value.buttonStyle,["light","brand"],"light"),height:pick(value.height,["compact","medium","tall"],"medium"),overlay:number(value.overlay,0,80,25),focalX:number(value.focalX,0,100,50),focalY:number(value.focalY,0,100,50),textColour:colour(value.textColour,"#ffffff"),ctaLabel:text(value.ctaLabel,50),ctaType:pick(value.ctaType,["catalogue","collection","whatsapp","link"],"catalogue"),ctaUrl:value.ctaType==="link"?image(value.ctaUrl):text(value.ctaUrl,100),limit:Math.round(number(value.limit,1,24,8)),collectionId:/^[a-f0-9]{24}$/i.test(value.collectionId||"")?value.collectionId:"",hideMobile:value.hideMobile===true,hideDesktop:value.hideDesktop===true};
}

export function applyAtelierHero(design,store={},products=[]){
 const sections=design.sections.map(s=>({...s}));let hero=sections.find(s=>s.type==='hero');
 if(!hero){hero={...newSection('hero'),title:'{{store.name}}',text:'Discover your next favourite. Made for your everyday style.'};sections.splice(sections.length-1,0,hero);}
 hero.visible=true;hero.image=hero.image||store.cover||store.coverImage||products[0]?.images?.[0]||'';
 hero.settings={...hero.settings,ctaLabel:hero.settings?.ctaLabel||'Shop now',ctaType:hero.settings?.ctaType||'catalogue',verticalPosition:'bottom',buttonStyle:'light',height:'medium',overlay:35};
 if(!hero.text||hero.text==='{{store.description}}')hero.text=store.description||'Discover your next favourite. Made for your everyday style.';
 let categories=sections.find(s=>s.type==='categories');if(!categories)categories=newSection('categories');categories.visible=true;
 const rest=sections.filter(s=>s!==hero&&s!==categories),header=rest.findIndex(s=>s.type==='header');rest.splice(header+1,0,categories,hero);
 return {...design,sections:rest};
}

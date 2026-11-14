export const universalProfileTemplate = {
  id:"universal-profile",title:"Signature Profile",name:"Signature Profile",version:1,
  type:"profile",renderer:"universal-profile",batch:"universal",variant:"action",family:"universal-profile",
  categoryIds:[],tags:["universal","business","creator","profile"],copy:"Your brand, beautifully connected. Personalized for every category.",
  hasForm:false,compatibilityVersion:1,defaultTokens:{accent:"#7134a1"},
  supportedFields:["displayName","description","coverImageUrl","profileImageUrl","brandColor","whatsappNumber","socialLinks","actions"],
  defaultLayout:{coverAspectRatio:2,maxWidth:560,avatarOverlap:true},defaultActions:["category-action","whatsapp","instagram"],
  editableProperties:["displayName","description","coverImageUrl","profileImageUrl","brandColor","actions","visibility","imagePosition"],
  personalizationBindings:{displayName:"publicName",description:"brand.description",brandColor:"brand.preferredColor",profileImageUrl:"brand.imageUrl",categoryId:"category.id",whatsappNumber:"whatsappNumber",socialLinks:"socialLinks"},
  preview:{cardLayout:"profile",renderer:"ThemeRenderer",label:"Signature Profile template preview",image:"https://pub-e0ff826b0e9843069a4df3548bc6fa39.r2.dev/template-covers/universal-profile/fbb225321e0c.webp",width:480,height:606},sectionRecipe:[]
};

export const spotlightProfileTemplate = {
 ...universalProfileTemplate,
 id:"spotlight-profile",title:"Spotlight Profile",name:"Spotlight Profile",family:"spotlight-profile",
 copy:"A bold cover, compact links and a little more about your brand.",
 defaultTokens:{accent:"#d91c1c"},
 defaultLayout:{coverAspectRatio:2,maxWidth:440,avatarOverlap:true},
 supportedFields:[...universalProfileTemplate.supportedFields,"highlights"],
 editableProperties:[...universalProfileTemplate.editableProperties,"highlights"],
 preview:{cardLayout:"spotlight",renderer:"ThemeRenderer",label:"Spotlight Profile personalized preview",image:""}
};

export const serviceProfileTemplate = {
 ...universalProfileTemplate,
 id:"service-profile",title:"Service Profile",name:"Service Profile",family:"service-profile",
 copy:"A focused introduction with a category portrait and simple, rounded actions.",
 defaultTokens:{accent:"#08783e"},defaultLayout:{maxWidth:440,avatarOverlap:false,cover:false,avatarSource:"category"},
 editableProperties:universalProfileTemplate.editableProperties.filter(field=>!["coverImageUrl","profileImageUrl","imagePosition"].includes(field)),
 preview:{cardLayout:"service",renderer:"ThemeRenderer",label:"Service Profile personalized preview",image:""}
};

export const campaignProfileTemplate = {
 ...universalProfileTemplate,
 defaultActions:["whatsapp"],
 id:"campaign-profile",title:"Campaign Profile",name:"Campaign Profile",family:"campaign-profile",
 copy:"A bold headline and immersive category photography with a clear next step.",
 defaultTokens:{accent:"#ac391d"},defaultLayout:{maxWidth:560,coverAspectRatio:2,avatarSource:"category",composition:"poster"},
 supportedFields:[...universalProfileTemplate.supportedFields,"headline"],
 editableProperties:[...universalProfileTemplate.editableProperties,"headline"],
 preview:{cardLayout:"campaign",renderer:"ThemeRenderer",label:"Campaign Profile personalized preview",image:""}
};

export const rhythmGridTemplate = {
 ...campaignProfileTemplate,
 id:"rhythm-grid",title:"Rhythm Grid",name:"Rhythm Grid",family:"rhythm-grid",
 copy:"Bold type, a three-image mosaic and one clear next step.",
 defaultTokens:{accent:"#c1ff38"},defaultLayout:{maxWidth:640,composition:"mosaic",mediaSlots:3},
 supportedFields:[...campaignProfileTemplate.supportedFields,"media"],
 editableProperties:[...campaignProfileTemplate.editableProperties,"media"],
 preview:{cardLayout:"rhythm",renderer:"ThemeRenderer",label:"Rhythm Grid personalized preview",image:""}
};

export const studioPassTemplate = {
 ...campaignProfileTemplate,
 id:"studio-pass",title:"Studio Pass",name:"Studio Pass",family:"studio-pass",
 copy:"Immersive category photography with a floating white contact panel.",
 defaultTokens:{accent:"#075357"},defaultLayout:{maxWidth:640,composition:"floating-contact",avatar:false},
 preview:{cardLayout:"studio",renderer:"ThemeRenderer",label:"Studio Pass personalized preview",image:""}
};

export const personalIntroTemplate = {
 ...universalProfileTemplate,
 id:"personal-intro",title:"Personal Intro",name:"Personal Intro",family:"personal-intro",
 variant:"lead",hasForm:true,defaultActions:[],defaultTokens:{accent:"#204a35"},
 copy:"An editorial introduction and a simple name and WhatsApp enquiry form.",
 defaultLayout:{maxWidth:560,composition:"editorial-form"},
 supportedFields:["displayName","description","coverImageUrl","profileImageUrl","brandColor","headline","form"],
 editableProperties:["displayName","description","coverImageUrl","profileImageUrl","brandColor","headline","form","visibility","imagePosition"],
 defaultForm:{formTitle:"Fill the form below",submitLabel:"Send enquiry",showConsent:false,successMessage:"Thank you. Your enquiry has been received."},
 preview:{cardLayout:"personal-intro",renderer:"ThemeRenderer",label:"Personal Intro personalized preview",image:""}
};
export const enquiryDeskTemplate = {
 ...personalIntroTemplate,
 id:"enquiry-desk",title:"Enquiry Desk",name:"Enquiry Desk",family:"enquiry-desk",
 copy:"A bold introduction with a welcoming enquiry panel.",defaultTokens:{accent:"#477b25"},
 defaultLayout:{maxWidth:560,composition:"enquiry-panel"},
 defaultForm:{...personalIntroTemplate.defaultForm,submitLabel:"Send my details"},
 preview:{cardLayout:"enquiry-desk",renderer:"ThemeRenderer",label:"Enquiry Desk personalized preview",image:""}
};

export const contactSheetTemplate = {
 ...personalIntroTemplate,id:"contact-sheet",title:"Contact Sheet",name:"Contact Sheet",family:"contact-sheet",
 copy:"A quiet photo header, your identity and a direct callback form.",defaultTokens:{accent:"#192939"},
 defaultHeadline:"Request a callback",defaultVisibility:{description:false},
 defaultForm:{...personalIntroTemplate.defaultForm,formTitle:"Request a callback",submitLabel:"Send my details"},
 preview:{cardLayout:"contact-sheet",renderer:"ThemeRenderer",label:"Contact Sheet personalized preview",image:""}
};
export const sideNoteTemplate = {
 ...personalIntroTemplate,id:"side-note",title:"Side Note",name:"Side Note",family:"side-note",
 copy:"A split photo introduction and a calm, understated callback form.",defaultTokens:{accent:"#292826"},
 defaultHeadline:"A quick call.\nA fresh start.",defaultVisibility:{description:false},
 defaultForm:{...personalIntroTemplate.defaultForm,submitLabel:"Request a call"},
 preview:{cardLayout:"side-note",renderer:"ThemeRenderer",label:"Side Note personalized preview",image:""}
};

export const productSpotlightTemplate={...universalProfileTemplate,id:"product-spotlight",title:"Product Spotlight",name:"Product Spotlight",family:"product-spotlight",productLayout:true,defaultTokens:{accent:"#292826"},copy:"One featured product with a clear enquiry action.",preview:{cardLayout:"product-spotlight",image:""},editableProperties:[...universalProfileTemplate.editableProperties,"products","enquiryUrl"],supportedFields:[...universalProfileTemplate.supportedFields,"products","enquiryUrl"]};
export const curatedShelfTemplate={...productSpotlightTemplate,id:"curated-shelf",title:"Curated Shelf",name:"Curated Shelf",family:"curated-shelf",defaultTokens:{accent:"#234b36"},copy:"A compact product collection with a selection basket and one enquiry action.",preview:{cardLayout:"curated-shelf",image:""}};

export const musicArtistTemplate = {
 ...universalProfileTemplate,
 id:"music-artist",title:"Soundstage · Music Artist",name:"Soundstage",family:"music-artist",
 fallbackName:"Your artist name",categoryIds:["media-entertainment/music-artists"],
 tags:["music","artist","musician","singer","album","spotify","apple music","streaming","youtube"],
 copy:"Your music, everywhere. Album artwork and editable links to your favourite streaming platforms.",
 defaultTokens:{accent:"#b5ef63"},defaultVisibility:{avatar:false},
 supportedFields:[...universalProfileTemplate.supportedFields,"headline"],
 editableProperties:[...universalProfileTemplate.editableProperties,"headline"],
 preview:{cardLayout:"music",renderer:"ThemeRenderer",label:"Soundstage music artist preview",image:""}
};

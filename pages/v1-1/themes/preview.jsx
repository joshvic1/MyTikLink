import { useRouter } from 'next/router';
import { allThemes } from '../../../V1.1/landing/themeLibrary';
import { createThemeInstance } from '../../../V1.1/landing/themeModel';
import ThemeRenderer from '../../../V1.1/landing/ThemeRenderer';
export default function ThemeDemo(){
 const {query}=useRouter();const theme=allThemes.find(t=>t.id===query.theme);
 if(!theme)return <main style={{padding:24}}><a href="/v1-1/themes">Choose a theme</a></main>;
 const sample=theme.renderer === "universal-profile" ? {publicName:"Signature Profile",category:{id:"hair-grooming/wigs",label:"Wigs"},brand:{preferredColor:"#7134a1"},socialLinks:{website:"https://example.com/collection",instagram:"https://www.instagram.com/example"}} : {};
 if(theme.renderer === "universal-profile" && query.example === "agriculture") Object.assign(sample,{publicName:"Greenfield Farms",category:{id:"agriculture-farming",label:"Agriculture & Farming"},brand:{preferredColor:"#287444"},socialLinks:{website:"https://example.com/farm",instagram:"https://www.instagram.com/example"}});
 if(theme.id === "spotlight-profile" && query.example !== "agriculture") Object.assign(sample,{publicName:"Spotlight Profile",category:{id:"food-beverages/restaurants",label:"Food & Beverages"},brand:{preferredColor:"#d91c1c"},socialLinks:{website:"https://example.com/menu",instagram:"https://www.instagram.com/example"}});
 if(theme.id === "service-profile" && query.example !== "agriculture") Object.assign(sample,{publicName:"Service Profile",category:{id:"coaching-personal-development",label:"Coach / Consultant"},brand:{preferredColor:"#08783e"},socialLinks:{}});
 if(theme.id === "campaign-profile" && query.example !== "agriculture") Object.assign(sample,{publicName:"Campaign Profile",category:{id:"fitness-wellness/wellness-coaching",label:"Wellness Coaching"},brand:{preferredColor:"#ac391d"},socialLinks:{instagram:"https://www.instagram.com/example"}});
 if(theme.id === "campaign-profile" && query.example === "music") Object.assign(sample,{publicName:"Rhythm Music Studio",accountType:"business",category:{id:"education-training/music-schools",label:"Music Schools"},brand:{preferredColor:"#342366"},socialLinks:{}});
 if(theme.id === "rhythm-grid" && query.example !== "agriculture") Object.assign(sample,{publicName:"Rhythm Grid",category:{id:"education-training/music-schools",label:"Music Schools"},brand:{preferredColor:"#c1ff38"},socialLinks:{}});
 if(theme.id === "studio-pass" && query.example !== "agriculture") Object.assign(sample,{publicName:"Studio Pass",category:{id:"education-training/music-schools",label:"Music Schools"},brand:{preferredColor:"#075357"},socialLinks:{}});
 if(theme.id === "studio-pass" && query.example === "advertising") Object.assign(sample,{publicName:"BrightReach Advertising",category:{id:"marketing-advertising",label:"Marketing & Advertising"},brand:{preferredColor:"#244bc0"},socialLinks:{}});
 if(theme.hasForm && !query.example) Object.assign(sample,{publicName:"Greenfield Farms",category:{id:"agriculture-farming",label:"Agriculture & Farming"},brand:{preferredColor:theme.defaultTokens.accent},socialLinks:{}});
 if(theme.productLayout && !query.example) Object.assign(sample,{publicName:"Luxe Crown Hair",category:{id:"hair-grooming",label:"Hair & Grooming"},brand:{preferredColor:theme.defaultTokens.accent}});
 const instance=createThemeInstance(theme,sample);
 if(theme.id === "studio-pass" && !["agriculture","advertising"].includes(query.example)) instance.personalization.headline="Make room for your music.";
 if(theme.id === "rhythm-grid" && query.example !== "agriculture") instance.personalization.headline="Your next note starts here.";
 if(instance.personalization){const suggested=instance.personalization.actions.find(action=>action.id === "category-action");if(suggested)suggested.url="https://example.com/demo-action";}
 if(theme.id === "spotlight-profile") instance.personalization.highlights=[{icon:"menu",label:"Explore"},{icon:"booking",label:"Plan ahead"},{icon:"link",label:"Connect"}];if(/^#[0-9a-f]{6}$/i.test(query.color||''))instance.colorOverride=query.color;
 return <><nav style={{padding:'10px 20px',font:'12px Arial',background:'#181c19',color:'#fff',display:'flex',justifyContent:'space-between',gap:16}}><a style={{color:'inherit'}} href="/v1-1/themes">← Gallery</a><span>Demo preview · {theme.title}{query.example === "agriculture" ? " · Sample agriculture brand" : query.example === "music" ? " · Sample music school" : query.example === "advertising" ? " · Sample advertising brand" : ""}</span><a style={{color:'inherit'}} href={`/v1-1/pages/builder?themeId=${theme.id}`}>Use theme</a></nav><ThemeRenderer instance={instance} preview/></>;
}

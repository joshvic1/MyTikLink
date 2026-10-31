import { useRouter } from 'next/router';
import { shortThemes } from '../../../V1.1/landing/shortThemeLibrary';
export default function ActionDemo(){
 const {query}=useRouter();const theme=shortThemes.find(t=>t.id===query.theme);
 if(!theme)return <main style={{padding:32}}>Choose an action theme from <a href="/v1-1/themes">the gallery</a>.</main>;
 const hero=theme.sectionRecipe[0];
 return <main style={{maxWidth:560,margin:'60px auto',padding:28,fontFamily:'Arial,sans-serif',lineHeight:1.7}}><a href="/v1-1/themes">← Theme gallery</a><p>INTERACTIVE THEME DEMO</p><h1>{hero.primary}</h1><p>This is the destination preview for <strong>{theme.title}</strong>. No order, ticket or payment has been placed.</p><p>When you use this theme, connect this button to your WhatsApp number or your own shop, ticketing or product link in the editor.</p><dl>{hero.facts.map((fact,i)=><div key={i}><dt><strong>{fact.label}</strong></dt><dd style={{margin:0}}>{fact.value}</dd></div>)}</dl><a href={`/v1-1/pages/builder?themeId=${theme.id}`}>Use this theme →</a></main>;
}

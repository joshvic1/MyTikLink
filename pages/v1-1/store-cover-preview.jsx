import {useRouter} from 'next/router';
import {defaultDesign,themes} from '../../V1.1/store/design';
import StoreRenderer from '../../V1.1/store/StoreRenderer';
import {getCategoryCover,coverSources} from '../../V1.1/media/categoryImages';
export default function Cover(){const {query}=useRouter();const theme=themes[query.theme]?query.theme:'atelier';const design=defaultDesign(theme);const image=coverSources(getCategoryCover('hair-grooming/wigs',{allowParent:true}))?.src||'/favicon.ico';design.sections=design.sections.map(s=>s.type==='hero'?{...s,image,title:s.title.includes('{{')?'The new collection':s.title}:s);return <div style={{width:390,margin:'auto'}}><style>{`nextjs-portal{display:none!important}`}</style><StoreRenderer design={design} store={{name:themes[theme].name,slug:'demo',description:'Discover something made for you.',currency:'NGN',productCategories:[]}} products={[{_id:'demo-one',slug:'signature',name:'The signature collection',price:15000,images:[image]},{_id:'demo-two',slug:'favourites',name:'Everyday favourites',price:12000,images:[image]}]} config={{identity:{showFloatingWhatsapp:false}}} preview/></div>}


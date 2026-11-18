import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ArrowLeftRight} from 'lucide-react';
import {serviceApi,servicesEnabled} from './shared';
import css from './services.module.css';
export default function CatalogueSwitch({current}){
 const [summary,setSummary]=useState(null);
 useEffect(()=>{let active=true;if(servicesEnabled)serviceApi('/summary').then(d=>{if(active)setSummary(d);}).catch(()=>{});return()=>{active=false;};},[]);
 const opposite=current==='services'?'products':'services';
 if(!summary||(opposite==='products'?!summary.hasProducts:!summary.services))return null;
 return <Link className={css.switchLink} href={'/v1-1/store/'+opposite} title={'View your '+opposite} aria-label={'Switch to '+opposite}><ArrowLeftRight size={16}/></Link>;
}

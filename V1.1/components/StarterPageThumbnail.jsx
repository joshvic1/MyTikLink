import {useEffect,useState} from 'react';
import {v11Api} from '../lib/api';
import {getThemeBlock} from '../landing/themeModel';
import {pageThumbnail} from '../lib/pagePresentation';
import PersonalizedPreview from '../landing/PersonalizedPreview';
import s from './StarterPageThumbnail.module.css';
export default function StarterPageThumbnail({page}){
 const [detail,setDetail]=useState(page);
 useEffect(()=>{let active=true;setDetail(page);if(!getThemeBlock(page.customContent))v11Api.pageDetail(page._id).then(result=>{if(active)setDetail(result);}).catch(()=>{});return()=>{active=false;};},[page._id]);
 const instance=getThemeBlock(detail.customContent);
 const data=instance?.personalization;
 return <div className={s.frame}><div className={s.browser}><i/><i/><i/></div><div className={s.viewport}><div className={s.page}>{data?<PersonalizedPreview data={data} color={instance.colorOverride}/>:<><img src={pageThumbnail(detail)} alt=""/><strong>{detail.title}</strong><div className={s.lines}/><div className={s.button}/><div className={s.button}/></>}</div></div></div>;
}

import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ArrowLeftRight} from 'lucide-react';
import {serviceApi,servicesEnabled} from './shared';
import css from './services.module.css';
export default function CatalogueSwitch({current}){
 const [summary,setSummary]=useState(null);
 useEffect(()=>{let active=true;if(servicesEnabled)serviceApi('/summary').then(d=>{if(active)setSummary(d);}).catch(()=>{});return()=>{active=false;};},[]);
 const opposite={services:'products',products:'services',orders:'bookings',bookings:'orders'}[current];
 const available=summary&&({products:summary.hasProducts||!summary.serviceBusiness,services:summary.services>0||summary.serviceBusiness,orders:summary.hasOrders||!summary.serviceBusiness,bookings:summary.hasBookings||summary.serviceBusiness})[opposite];
 if(!available)return null;
 return <Link className={css.switchLink} href={'/v1-1/store/'+opposite} title={'View your '+opposite} aria-label={'Switch to '+opposite}><ArrowLeftRight size={13}/></Link>;
}

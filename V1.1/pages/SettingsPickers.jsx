import {useEffect,useState} from 'react';
import {getCountries,getCountryCallingCode,parsePhoneNumberFromString} from 'libphonenumber-js';
import {ChevronDown,Check,Search} from 'lucide-react';
import {Modal} from '../components/UI';
import {v11Api} from '../lib/api';
import s from './AccountSettings.module.css';
const names=new Intl.DisplayNames(['en'],{type:'region'});
const countries=getCountries().map(iso=>({iso,name:names.of(iso),code:'+'+getCountryCallingCode(iso)})).sort((a,b)=>a.name.localeCompare(b.name));
export function WhatsAppField({value,onChange,disabled}){
 const [iso,setIso]=useState(()=>parsePhoneNumberFromString(value||'')?.country||'NG'),[open,setOpen]=useState(false),[query,setQuery]=useState('');
 useEffect(()=>{const c=parsePhoneNumberFromString(value||'')?.country;if(c)setIso(c);},[value]);
 const country=countries.find(c=>c.iso===iso),code=country.code;
 const flag=c=><img width="24" height="17" src={'https://flagcdn.com/w40/'+c.iso.toLowerCase()+'.png'} alt={c.name+' flag'}/>;
 return <div className={s.field}><span>WhatsApp number</span><div className={s.whatsappField}><button disabled={disabled} aria-label="Choose WhatsApp country" onClick={()=>setOpen(true)}>{flag(country)}<ChevronDown size={14}/></button><label><span>WhatsApp number</span><input aria-label="WhatsApp number" inputMode="tel" autoComplete="tel" disabled={disabled} value={value||code} onChange={e=>{const raw=e.target.value;onChange(raw.startsWith('+')?raw:code+raw.replace(/^0+/,''));}}/></label></div>{open&&<Modal tone="teal" title="Choose country" onClose={()=>setOpen(false)}><input className={s.pickerSearch} autoFocus aria-label="Search countries" placeholder="Search country or dialing code" value={query} onChange={e=>setQuery(e.target.value)}/><div className={s.pickerList}>{countries.filter(c=>(c.name+' '+c.code+' '+c.iso).toLowerCase().includes(query.toLowerCase())).map(c=><button key={c.iso} onClick={()=>{const national=(value||'').startsWith(code)?value.slice(code.length):value;setIso(c.iso);onChange(c.code+(national||'').replace(/[^0-9]/g,'').replace(/^0+/,''));setOpen(false);setQuery('');}}>{flag(c)}<span>{c.name}<small>{c.code}</small></span>{iso===c.iso&&<Check size={16}/>}</button>)}</div></Modal>}</div>;
}
export function CategoryPicker({selected,onSelect,onClose}){
 const [items,setItems]=useState([]),[query,setQuery]=useState(''),[expanded,setExpanded]=useState(new Set()),[error,setError]=useState(''),[loading,setLoading]=useState(true);
 useEffect(()=>{let active=true;v11Api.onboardingCategories().then(result=>{if(active)setItems(result.categories||[]);}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false};},[]);
 const visible=items.filter(c=>query.trim()?(c.label+' '+(c.parentLabel||'')).toLowerCase().includes(query.trim().toLowerCase()):!c.parentId||expanded.has(c.parentId));
 return <Modal tone="peach" title="Select a category" description="Choose a category or expand it to find your specialty." onClose={onClose}><input className={s.pickerSearch} autoFocus aria-label="Search categories" placeholder="Search categories" value={query} onChange={e=>setQuery(e.target.value)}/><div className={s.pickerList}>{loading?<p>Loading categories…</p>:error?<p role="alert">{error}</p>:visible.length?visible.map(c=><div className={s.categoryRow} key={c.id}><button onClick={()=>{onSelect(c);onClose();}}><span>{c.label}{c.parentLabel&&<small>{c.parentLabel}</small>}</span>{selected===c.id&&<Check size={16}/>}</button>{!query&&!c.parentId&&items.some(x=>x.parentId===c.id)&&<button aria-label={'Show specialties for '+c.label} aria-expanded={expanded.has(c.id)} onClick={()=>setExpanded(current=>{const next=new Set(current);next.has(c.id)?next.delete(c.id):next.add(c.id);return next;})}><ChevronDown size={17}/></button>}</div>):<p>No categories found.</p>}</div></Modal>;
}

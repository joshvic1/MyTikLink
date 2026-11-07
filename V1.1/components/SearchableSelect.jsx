import FlagIcon from './FlagIcon';
import {useState} from 'react';
import {Check,ChevronDown} from 'lucide-react';
import {Field,Modal} from './UI';
import css from './SearchableSelect.module.css';
export default function SearchableSelect({label,items=[],value,onChange,disabled=false,required=false,style}){
 const [open,setOpen]=useState(false),[search,setSearch]=useState('');
 const selected=items.find(i=>String(i.id||i.code)===value),id=i=>String(i.id||i.code);
 const filtered=items.filter(i=>`${i.name} ${i.code||''} ${(i.aliases||[]).join(' ')}`.toLowerCase().includes(search.trim().toLowerCase()));
 return <><Field label={label}><button type="button" className={css.trigger} disabled={disabled} aria-haspopup="dialog" aria-expanded={open} onClick={()=>{setSearch('');setOpen(true);}}><span className={css.optionLabel}>{selected&&Object.hasOwn(selected,'flagCode')&&<FlagIcon code={selected.flagCode}/>}<span>{selected?.name||`Select ${label.toLowerCase()}`}</span></span><ChevronDown size={15}/></button>{required&&<input className={css.validation} tabIndex={-1} aria-hidden="true" value={selected?value:''} required onChange={()=>{}} onInvalid={e=>{e.preventDefault();setOpen(true);}}/>}</Field>{open&&<Modal title={`Select ${label.toLowerCase()}`} style={style} onClose={()=>setOpen(false)}><div className={css.selector}><input type="search" autoFocus aria-label={`Search ${label.toLowerCase()}`} placeholder="Search by name or code" value={search} onChange={e=>setSearch(e.target.value)}/><div className={css.results} role="listbox" aria-label={label}>{filtered.map(item=><button key={id(item)} type="button" role="option" aria-selected={id(item)===value} onClick={()=>{onChange(item);setOpen(false);}}><span className={css.optionLabel}>{Object.hasOwn(item,'flagCode')&&<FlagIcon code={item.flagCode}/>}<span>{item.name}</span></span>{id(item)===value&&<Check size={16}/>}</button>)}{!filtered.length&&<p>No matching options.</p>}</div></div></Modal>}</>;
}

import {useRef,useState} from 'react';
import {Button,Field,Modal} from '../components/UI';
import NumericInput from '../components/NumericInput';
import {apiRequest} from '../lib/api';
import {notify} from '../components/Notifications';
import {CatalogUrl,slugFromName,ProductSelection} from './CatalogControls';
import ImagePicker from './ImagePicker';
import css from './StoreSettings.module.css';
import ui from './CatalogEditor.module.css';
export default function CollectionEditor({value,onClose,onSaved}){
 const initial={name:'',slug:'',description:'',image:'',mode:'manual',productIds:[],sortOrder:0,visible:true,...value};
 const [form,setForm]=useState(initial),[manual,setManual]=useState(!!value?._id),[busy,setBusy]=useState(false),[error,setError]=useState(''),[discard,setDiscard]=useState(false);const lock=useRef(false);
 const set=(k,v)=>setForm(f=>({...f,[k]:v,...(k==='name'&&!manual?{slug:slugFromName(v)}:{})}));
 const close=()=>{if(busy)return;if(JSON.stringify(initial)!==JSON.stringify(form))setDiscard(true);else onClose();};
 const save=async e=>{e.preventDefault();e.stopPropagation();if(lock.current)return;lock.current=true;setBusy(true);setError('');try{await apiRequest(`/v1-1/store-studio/commerce/collections${form._id?'/'+form._id:''}`,{method:form._id?'PATCH':'POST',body:JSON.stringify(form)});notify.success('Collection saved');onSaved();}catch(e){setError(e.message);}finally{lock.current=false;setBusy(false);}};
 return <><Modal title={form._id?'Edit collection':'Add collection'} onClose={close} footer={<><Button variant="secondary" disabled={busy} onClick={close}>Cancel</Button><Button form="collection-editor" type="submit" disabled={busy}>{busy?'Saving…':'Save collection'}</Button></>}><form id="collection-editor" className={css.form} onSubmit={save}>
 <Field label="Collection name"><input required maxLength={80} value={form.name} onChange={e=>set('name',e.target.value)}/></Field><CatalogUrl kind="collections" slug={form.slug} onChange={v=>{setManual(true);set('slug',v);}}/>
 <Field label="Description"><textarea rows={3} maxLength={600} value={form.description} onChange={e=>set('description',e.target.value)}/></Field>
 <ImagePicker label="Collection cover photo" value={form.image} onChange={v=>set('image',v)}/>
 <section className={ui.products}><h3>Products to include in your collection</h3><Field label="Product selection mode"><select value={form.mode} onChange={e=>set('mode',e.target.value)}><option value="manual">Selected products</option><option value="new">Added in the last 30 days</option><option value="sale">Products on sale</option><option value="price">Products below a price</option></select></Field>{form.mode==='price'&&<Field label="Price ceiling"><NumericInput step="0.01" value={Number(form.priceUnderMinor||0)/100} onChange={e=>set('priceUnderMinor',Math.round(Number(e.target.value)*100))}/></Field>}{form.mode==='manual'&&<ProductSelection value={form.productIds} onChange={v=>set('productIds',v)}/>}</section>
 <Field label="Display order"><NumericInput max={10000} value={form.sortOrder} onChange={e=>set('sortOrder',e.target.value)}/></Field><label className={css.check}><input type="checkbox" checked={form.visible!==false} onChange={e=>set('visible',e.target.checked)}/>Show collection</label>{error&&<p role="alert" className={css.error}>{error}</p>}</form></Modal>
 {discard&&<Modal title="Discard collection changes?" onClose={()=>setDiscard(false)} footer={<><Button variant="secondary" onClick={()=>setDiscard(false)}>Keep editing</Button><Button onClick={onClose}>Discard changes</Button></>}><p>Your unsaved changes will be lost if you leave.</p></Modal>}</>;
}

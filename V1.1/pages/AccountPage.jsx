import DeleteAccount from '../components/DeleteAccount';
import RenewalSettings from "../components/RenewalSettings";
import {businessFocusLabels} from '../store/themeRecommendations';
import EmailPreferences from "../components/EmailPreferences";
import {ColorPicker} from "../landing/EditorInputs";
import {PasswordDialog} from "./SecurityPage";
import {WhatsAppField,CategoryPicker} from "./SettingsPickers";
import {isValidPhoneNumber,parsePhoneNumberFromString} from "libphonenumber-js";
import {useSubscription} from "../components/SubscriptionModal";
import {BillingPage} from "./BillingPage";
import { notify } from "../components/Notifications";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { UserRound, ShieldCheck, ImagePlus, Palette, Store, Crown, Link2, ChevronRight, ArrowLeft, Upload, Trash2, Camera, Check, Plus, LockKeyhole, Phone, Sparkles, LoaderCircle } from "lucide-react";
import { Button, Modal, PageHeader } from "../components/UI";
import { PlanBadge } from "../components/PlanBadge";
import { v11Api } from "../lib/api";
import { v11Routes } from "../config/routes";
import skin from "./AccountSettings.module.css";
import styles from "../styles/v11.module.css";

const compactPhone = (value) => String(value || "").replace(/[\s()-]/g, "");
const workspaceType = (value) => value === "business" ? "Business / organization" : value === "creator" ? "Creator" : "Not selected";

export function AccountPage({ user, refreshSession }) {
  const router = useRouter();
  const {openSubscription}=useSubscription();
  const [categoryOpen,setCategoryOpen]=useState(false),[generating,setGenerating]=useState(false);
  const [form, setForm] = useState({
    name: user.name || "",
    phone: user.whatsappNumber || user.phone || "",
  });
  const [workspace, setWorkspace] = useState(null);
  const [workspaceDraft, setWorkspaceDraft] = useState({ publicName: "", description: "" });
  const [workspaceLoading, setWorkspaceLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [dialog,setDialog]=useState(null);
  const [activeSection,setActiveSection]=useState("profile");
  const [uploading,setUploading]=useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    v11Api.onboarding()
      .then((result) => {
        if (!active) return;
        const data = result?.data || null;
        setWorkspace(data);
        setWorkspaceDraft({
          publicName: data?.publicName || "",
          categoryId:data?.category?.id||"",categoryLabel:data?.category?.label||"",customCategory:data?.category?.customLabel||"",accountType:data?.accountType||"business",
          businessFocus:businessFocusLabels[data?.businessFocus]?data.businessFocus:"",businessMode:data?.businessMode||"",
          description: data?.brand?.description || "",
          imageUrl:data?.brand?.imageUrl||"", preferredColor:data?.brand?.preferredColor||"#6336ff",
        });
        if (data?.whatsappNumber) setForm((current) => current.phone ? current : ({ ...current, phone: data.whatsappNumber }));
      })
      .catch(() => active && setWorkspace(null))
      .finally(() => active && setWorkspaceLoading(false));
    return () => { active = false; };
  }, []);

  const save = async (scope) => {
    if(saving||generating||workspaceLoading||!workspace)return;
    const phone=parsePhoneNumberFromString(form.phone||'', 'NG')?.number||compactPhone(form.phone);
    if(scope==='profile'&&(!form.name.trim()||!isValidPhoneNumber(phone))){notify.warning('Enter your full name and a valid WhatsApp number.');return;}
    if(scope==='business'&&(workspaceDraft.publicName.trim().length<2||!workspaceDraft.categoryId)){notify.warning('Enter your business name and choose a category.');return;}
    if(scope==='business'&&['other','other-emerging/other'].includes(workspaceDraft.categoryId)&&workspaceDraft.customCategory.trim().length<2){notify.warning('Describe your business category.');return;}
    if(scope==='business'&&!businessFocusLabels[workspaceDraft.businessFocus]){notify.warning('Choose what your business sells.');return;}
    setSaving(true);setStatus('Saving changes…');
    try{
      if(scope==='profile'){
        if(form.name.trim()!==user.name)await v11Api.updateName(form.name.trim());
        if(phone!==workspace.whatsappNumber)await v11Api.saveOnboardingStage('whatsapp',{whatsappNumber:phone});
        setForm(current=>({...current,phone}));setWorkspace(current=>({...current,whatsappNumber:phone}));
      }
      if(scope==='business'&&(workspaceDraft.publicName.trim()!==workspace.publicName||workspaceDraft.categoryId!==workspace.category?.id||(workspaceDraft.customCategory||'')!==(workspace.category?.customLabel||'')||(workspaceDraft.accountType||'business')!==workspace.accountType||workspaceDraft.businessFocus!==workspace.businessFocus)){
        await v11Api.saveOnboardingStage('identity',{accountType:workspaceDraft.accountType||'business',publicName:workspaceDraft.publicName.trim(),categoryId:workspaceDraft.categoryId,customCategory:workspaceDraft.customCategory||'',businessFocus:workspaceDraft.businessFocus,businessMode:workspaceDraft.accountType==='creator'?'digital':workspaceDraft.businessFocus.startsWith('digital_')?'digital':'physical'});
        setWorkspace(current=>({...current,publicName:workspaceDraft.publicName.trim(),accountType:workspaceDraft.accountType||'business',businessFocus:workspaceDraft.businessFocus,category:{id:workspaceDraft.categoryId,label:workspaceDraft.categoryLabel,customLabel:workspaceDraft.customCategory||''}}));
      }
      if(scope==='business'||scope==='branding'){
        const brand={imageUrl:workspace.brand?.imageUrl||'',description:scope==='business'?workspaceDraft.description:workspace.brand?.description||'',preferredColor:scope==='branding'?workspaceDraft.preferredColor:workspace.brand?.preferredColor||''};
        await v11Api.saveOnboardingStage('brand',brand);setWorkspace(current=>({...current,brand}));
      }
      await refreshSession();setStatus('Changes saved');notify.success('Changes saved');
    }catch(error){setStatus(error.message);notify.error(error.message);}finally{setSaving(false);}
  };
  const canGenerate=Boolean(workspace?.category?.id&&workspace?.publicName&&workspaceDraft.categoryId===workspace.category.id&&workspaceDraft.publicName.trim()===workspace.publicName);
  const generate=async()=>{if(!canGenerate||generating)return;setGenerating(true);try{const result=await v11Api.generateBrandDescription();setWorkspaceDraft(current=>({...current,description:result.description||''}));}catch(error){notify.error(error.message);}finally{setGenerating(false);}};
  const plan=String(user.plan||'free').toLowerCase(),isFree=plan.startsWith('free');
  const expiry=user.planExpiry&&Number.isFinite(new Date(user.planExpiry).getTime())?new Date(user.planExpiry).toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'}):null;

  const jump = (id) => {
    setActiveSection(id);
    document.getElementById(`settings-${id}`)?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  };
  useEffect(()=>{const section=router.query.section;if(!router.isReady||typeof section!=="string"||!['profile','plan','business','security','branding','integrations','email'].includes(section))return;const frame=requestAnimationFrame(()=>jump(section));return()=>cancelAnimationFrame(frame);},[router.isReady,router.query.section]);
  const saveButton=(scope)=><Button className={skin.primary} disabled={saving||generating||workspaceLoading||!workspace} onClick={()=>save(scope)}>{saving?'Saving…':'Save changes'}</Button>;
  const heading=(Icon,title,copy,tone='purple')=><header className={skin.cardHeading} data-tone={tone}><span className={skin.cardIcon} data-tone={tone}><Icon size={23}/></span><div><h2>{title}</h2><p>{copy}</p></div></header>;
  return <div className={`${styles.page} ${skin.settings}`}>
    <PageHeader eyebrow="YOUR ACCOUNT" title="Account settings"/>
    <nav className={skin.tabs} aria-label="Account settings sections">{[['Profile','profile'],['Billing and Payments','plan'],['Business','business'],['Passwords','security'],['Branding','branding'],['Integrations','integrations'],['Email','email']].map(([label,id])=><button key={id} aria-current={activeSection===id?'location':undefined} onClick={()=>jump(id)}><span>{label}</span></button>)}</nav>
    <div className={skin.columns}>
      <div className={skin.column}>
        <section id="settings-profile" className={skin.card}>
          {heading(UserRound,'Profile Information','Your personal details and account information.')}
          <label className={skin.field}>Full name<input autoComplete="name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
          <label className={skin.field}>Email address<input type="email" className={skin.verifiedEmail} value={user.email||''} readOnly aria-readonly="true"/><small>This is your verified account email. It cannot be changed.</small></label>
          <WhatsAppField value={form.phone} disabled={saving} onChange={phone=>setForm(current=>({...current,phone}))}/>
          {saveButton('profile')}
        </section>
        <section id="settings-plan" className={skin.card}>
          {heading(Crown,'Billing and Payments','Your current subscription and billing.','gold')}
          <div className={skin.plan}><span className={skin.planIcon}><Crown size={30}/></span><div><h3>{isFree?"Free":(plan.includes("pro")?"Pro":"Standard")+" "+(plan.includes("year")?"yearly":"monthly")+" plan"}</h3>{!isFree&&<p className={skin.expiry}>{expiry?`Expires ${expiry}`:"Expiry date unavailable"}</p>}<PlanBadge plan={user.plan}/></div></div>
          <div className={skin.planActions}><Button variant="secondary" onClick={()=>openSubscription({mode:isFree?'upgrade':'change'})}>Change plan</Button><Button disabled={isFree} onClick={()=>openSubscription({mode:'renew',preselected:plan.includes('pro')?'pro':'standard',plan})}>Renew plan</Button></div><RenewalSettings user={user}/><button className={skin.historyLink} onClick={()=>setDialog('billing')}>Payment history <ChevronRight size={13}/></button>
        </section>
        <section id="settings-business" className={skin.card}>
          {heading(Store,'Business Information','Used for your stores, pages and public profile.','teal')}
          {workspaceLoading?<p className={skin.hint} role="status">Loading your business details…</p>:workspace?<>
          <label className={skin.field}>Business name<input value={workspaceDraft.publicName} onChange={e=>setWorkspaceDraft({...workspaceDraft,publicName:e.target.value})}/></label>
          <div className={skin.field}><span>Business category</span><button className={skin.categorySelect} disabled={saving} onClick={()=>setCategoryOpen(true)}>{workspaceDraft.customCategory||workspaceDraft.categoryLabel||'Select a category'}<ChevronRight size={16}/></button></div>
          {['other','other-emerging/other'].includes(workspaceDraft.categoryId)&&<label className={skin.field}>Your category<input value={workspaceDraft.customCategory||''} onChange={e=>setWorkspaceDraft({...workspaceDraft,customCategory:e.target.value})}/></label>}
          <label className={skin.field}>Account type<select value={workspaceDraft.accountType||'business'} onChange={e=>setWorkspaceDraft({...workspaceDraft,accountType:e.target.value,businessFocus:e.target.value==='creator'&&workspaceDraft.businessFocus?.startsWith('physical_')?'':workspaceDraft.businessFocus})}><option value="business">Business / organization</option><option value="creator">Creator</option></select></label><label className={skin.field}>What your business sells<select value={workspaceDraft.businessFocus||''} onChange={e=>setWorkspaceDraft({...workspaceDraft,businessFocus:e.target.value})}><option value="">Select products or services</option>{Object.entries(businessFocusLabels).filter(([value])=>workspaceDraft.accountType!=='creator'||value.startsWith('digital_')).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
          <div className={skin.descriptionHeading}><label htmlFor="settings-description">Business description</label><button disabled={!canGenerate||generating||saving} onClick={generate}>{generating?<LoaderCircle className={skin.spin} size={14}/>:<Sparkles size={14}/>} {generating?"Generating…":"Generate with AI"}</button></div>{!canGenerate&&<p className={skin.hint}>Save your business name and category to enable AI writing.</p>}<label className={skin.field}><textarea id="settings-description" rows={3} maxLength={400} value={workspaceDraft.description} onChange={e=>setWorkspaceDraft({...workspaceDraft,description:e.target.value})}/></label>
          {saveButton('business')}</>:<p className={skin.hint}>Your business details could not be loaded. Refresh to try again.</p>}
        </section>
        <section id="settings-branding" className={skin.card}>
          {heading(Palette,'Appearance & Branding','Customize your brand color.','pink')}
          <ColorPicker label="Brand color" value={workspaceDraft.preferredColor||'#6336ff'} disabled={!workspace||saving} onChange={color=>setWorkspaceDraft({...workspaceDraft,preferredColor:color})}/>
          <div className={skin.colorValue}><span style={{background:workspaceDraft.preferredColor||'#6336ff'}}/>{workspaceDraft.preferredColor||'#6336ff'}</div>{saveButton('branding')}
        </section>
      </div>
      <div className={skin.column}>
        <section id="settings-security" className={skin.card}>
          {heading(LockKeyhole,'Password & Security','Keep your account secure.','peach')}
          <button className={skin.actionRow} onClick={()=>setDialog('security')}><span className={skin.rowIcon}><ShieldCheck size={20}/></span><span><b>Password</b><small>Change your password securely.</small></span><ChevronRight size={18}/></button>

        </section>

        <section id="settings-integrations" className={skin.card}>
          {heading(Link2,'Integrations','Connect your account with other services.','teal')}
          <button className={skin.actionRow} onClick={()=>setDialog("integrations")}><span className={skin.rowIcon}><Link2 size={20}/></span><span><b>Connected services</b><small>Manage your account integrations.</small></span><ChevronRight size={18}/></button>
        </section>
        <section id="settings-email" className={skin.card}>{heading(Sparkles,'Message preferences','Email and WhatsApp guidance for your business.','teal')}<EmailPreferences/></section>
        <DeleteAccount user={user}/>
      </div>
    </div>
    {categoryOpen&&<CategoryPicker selected={workspaceDraft.categoryId} onClose={()=>setCategoryOpen(false)} onSelect={c=>setWorkspaceDraft(current=>({...current,categoryId:c.id,categoryLabel:c.label,customCategory:""}))}/>}
    {dialog==='security'&&<PasswordDialog user={user} onClose={()=>setDialog(null)}/>}
    {dialog&&dialog!=='security'&&<Modal title={dialog==='security'?'Password & security':dialog==='billing'?'Payment History':'Integrations'} tone={dialog==='security'?'peach':dialog==='billing'?'pink':'teal'} onClose={()=>setDialog(null)} wide={dialog==='billing'} className={skin.settingsDialog} footer={<Button variant="secondary" onClick={()=>setDialog(null)}>Done</Button>}>
      {dialog==='billing'?<BillingPage user={user} embedded historyOnly/>:<div className={skin.integrationNotice}><Link2 size={25}/><h3>Connections are on the way</h3><p>Integration settings aren’t available yet. Your existing account is unchanged.</p></div>}
    </Modal>}
    {status&&<p className={skin.saveStatus} role="status">{status}</p>}
  </div>;
}

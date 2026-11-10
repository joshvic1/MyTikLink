import Adoption from './Adoption';
import dynamic from 'next/dynamic';
import Shell from './Shell';
import {Loading} from './Shared';
const Overview=dynamic(()=>import('./Overview'),{loading:Loading});
const Records=dynamic(()=>import('./Records'),{loading:Loading});
const Staff=dynamic(()=>import('./Staff'),{loading:Loading});
const Special=dynamic(()=>import('./Special'),{loading:Loading});
export default function ControlApp({module='overview'}){return <Shell module={module}>{module==='adoption'?<Adoption/>:['overview','analytics','revenue'].includes(module)?<Overview key={module} module={module}/>:module==='staff'?<Staff/>:['plans','health','inbox','automations','roles','settings','themes'].includes(module)?<Special key={module} module={module}/>:<Records key={module} module={module}/>}</Shell>;}

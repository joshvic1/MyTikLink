import {useRouter} from 'next/router';
import ControlApp from '@/components/control/ControlApp';
import {entries} from '@/components/control/config';
export default function AdminModule(){const {query,isReady}=useRouter();if(!isReady)return null;const module=entries.some(e=>e[0]===query.module)?query.module:'unknown';return <ControlApp module={module}/>;}

import {LoaderCircle,ShoppingBag} from 'lucide-react';
import css from './CustomerExperience.module.css';
export default function CustomerLoading({label='Loading your account'}){return <div className={css.loading} role="status" aria-label={label}><div className={css.loadingMark}><LoaderCircle aria-hidden="true"/><ShoppingBag aria-hidden="true"/></div><span>{label}</span></div>}

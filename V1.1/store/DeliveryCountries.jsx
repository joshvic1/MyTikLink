import NumericInput from "../components/NumericInput";
import { useEffect, useState } from 'react';
import { Plus, Pencil, MoreHorizontal, Truck } from 'lucide-react';
import { Button, Field, Modal } from '../components/UI';
import { notify } from '../components/Notifications';
import { countryFlag, deliveryLocations } from './deliveryLocations';
import css from './DeliveryCountries.module.css';

const presets = [
  ['Same day', 0, 0, false], ['Next day', 1, 1, false],
  ['1–2 business days', 1, 2, true], ['2–4 business days', 2, 4, true], ['3–7 business days', 3, 7, true],
];
const money = (amount, currency) => new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount / 100);
const major = value => value == null ? '' : String(value / 100);
const minor = value => {
  if (!/^\d{1,8}(\.\d{1,2})?$/.test(String(value))) throw Error('Enter an amount of 0 or more, with up to two decimal places.');
  return Math.round(Number(value) * 100);
};

export function DeliveryLocationPicker({ label, items, value, onChange, disabled = false, country = false }) {
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  useEffect(() => { const timer = setTimeout(() => setSearch(query.trim().toLowerCase()), 150); return () => clearTimeout(timer); }, [query]);
  const id = item => item.id || item.code;
  const visible = items.filter(item => id(item) === value || `${item.name} ${item.code || ''} ${(item.aliases || []).join(' ')}`.toLowerCase().includes(search));
  return <Field label={label}><div className={css.picker}>
    <input type="search" aria-label={`Search ${label.toLowerCase()}`} placeholder={`Search ${label.toLowerCase()}`} value={query} disabled={disabled} onChange={e => setQuery(e.target.value)} />
    <select required aria-label={label} value={value} disabled={disabled} onChange={e => { onChange(items.find(item => id(item) === e.target.value)); setQuery(''); }}>
      <option value="">Select {label.toLowerCase()}</option>
      {visible.map(item => <option key={id(item)} value={id(item)}>{country ? `${countryFlag(item.code)} ` : ''}{item.name}</option>)}
    </select>
    {!visible.length && <small>No matching locations.</small>}
  </div></Field>;
}

export function FeeEditor({ entry, countries, currency, onSave, onClose }) {
  const stateMode = entry.kind === 'state';
  const initial = entry.value || {};
  const [value, setValue] = useState({ ...initial, countryCode: entry.country?.countryCode || initial.countryCode || '', regionId: initial.regionId || '', fee: major(initial.feeMinor), threshold: major(initial.freeAboveMinor), allStates: initial.allStates !== false });
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(stateMode);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  const [preset, setPreset] = useState(() => {
    const match = presets.findIndex(([text, min, max, businessDays]) => initial.estimateRange?.unit === 'day' && initial.estimateRange.min === min && initial.estimateRange.max === max && initial.estimateRange.businessDays === businessDays || initial.estimate === text);
    return match >= 0 ? String(match) : initial.estimateRange || initial.estimate ? 'custom' : '3';
  });
  const [range, setRange] = useState(initial.estimateRange || { min: 2, max: 4, unit: 'day', businessDays: true });
  useEffect(() => {
    if (!stateMode) return;
    let active = true;
    setLoading(true);
    deliveryLocations('regions', { country: entry.country.countryCode }).then(items => { if (active) setRegions(items); }).catch(e => { if (active) setError(e.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [stateMode, entry.country?.countryCode, retry]);
  const set = (key, next) => setValue(current => ({ ...current, [key]: next }));
  const submit = async event => {
    event.preventDefault(); if (busy) return;
    setError('');
    try {
      if (!value.countryCode || stateMode && !value.regionId) throw Error('Select a location first.');
      let estimateRange = range;
      if (preset !== 'custom') { const [, min, max, businessDays] = presets[Number(preset)]; estimateRange = { min, max, unit: 'day', businessDays }; }
      if (!Number.isInteger(estimateRange.min) || !Number.isInteger(estimateRange.max) || estimateRange.min < 0 || estimateRange.max < estimateRange.min || estimateRange.max > 366) throw Error('Check the start and end of your delivery range.');
      const row = { ...initial, feeMinor: minor(value.fee), estimateRange, enabled: initial.enabled !== false };
      if (stateMode) { row.regionId = value.regionId; row.name = regions.find(r => r.id === value.regionId)?.name || initial.name; }
      else Object.assign(row, { countryCode: value.countryCode, name: countries.find(c => c.code === value.countryCode)?.name || initial.name, allStates: value.allStates, states: initial.states || [], freeAboveMinor: value.threshold === '' ? null : minor(value.threshold) });
      setBusy(true); await onSave(row); onClose();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  const regionItems = regions.filter(r => r.id === initial.regionId || !entry.country.states.some(s => s.regionId === r.id));
  return <Modal title={stateMode ? initial.regionId ? 'Edit state fee' : 'Add custom state fee' : initial.countryCode ? 'Edit country' : 'Add country'} description={stateMode ? entry.country.name : 'One general fee, with optional state fees.'} className={css.sheet} backdropClassName={css.backdrop} onClose={() => !busy && onClose()} footer={<><Button variant="secondary" disabled={busy} onClick={onClose}>Cancel</Button><Button type="submit" form="delivery-fee-editor" disabled={busy || loading}>{busy ? 'Saving…' : stateMode ? 'Save state fee' : 'Save country'}</Button></>}>
    <form id="delivery-fee-editor" onSubmit={submit} className={css.form}>
      {stateMode ? <DeliveryLocationPicker label="State / Region" items={regionItems} value={value.regionId} disabled={loading || Boolean(initial.regionId)} onChange={item => set('regionId', item?.id || '')} /> : <DeliveryLocationPicker label="Country" country items={countries} value={value.countryCode} disabled={Boolean(initial.countryCode)} onChange={item => set('countryCode', item?.code || '')} />}
      {loading && <small role="status">Loading states…</small>}
      {stateMode && !loading && !regions.length && <Button variant="secondary" onClick={() => setRetry(v => v + 1)}>Retry location list</Button>}
      <Field label={`${stateMode ? 'Delivery fee' : 'General delivery fee'} (${currency})`} hint={!stateMode ? 'This fee applies to all states unless you set a different price.' : 'Enter 0 for free delivery.'}><NumericInput required inputMode="decimal" type="number" min="0" step="0.01" value={value.fee} onChange={e => set('fee', e.target.value)} /></Field>
      <Field label="Estimated delivery time"><select value={preset} onChange={e => setPreset(e.target.value)}>{presets.map(([text], index) => <option key={text} value={index}>{text}</option>)}<option value="custom">Custom range</option></select></Field>
      {preset === 'custom' && <div className={css.range}>
        <Field label="From"><NumericInput type="number" required min="0" max="366" value={range.min} onChange={e => setRange(r => ({ ...r, min: e.target.value === '' ? '' : Number(e.target.value) }))} /></Field>
        <Field label="To"><NumericInput type="number" required min={range.min} max="366" value={range.max} onChange={e => setRange(r => ({ ...r, max: e.target.value === '' ? '' : Number(e.target.value) }))} /></Field>
        <Field label="Time unit"><select value={range.unit === 'hour' ? 'hour' : range.businessDays ? 'business' : 'day'} onChange={e => setRange(r => ({ ...r, unit: e.target.value === 'hour' ? 'hour' : 'day', businessDays: e.target.value === 'business' }))}><option value="business">Business days</option><option value="day">Days</option><option value="hour">Hours</option></select></Field>
      </div>}
      {!stateMode && <><Field label={`Free delivery above (${currency}, optional)`}><NumericInput inputMode="decimal" type="number" min="0" step="0.01" value={value.threshold} placeholder="No minimum set" onChange={e => set('threshold', e.target.value)} /></Field><details className={css.advanced}><summary>Delivery coverage</summary><label><input type="checkbox" checked={value.allStates} onChange={e => set('allStates', e.target.checked)} />Deliver to all states in this country</label><p>When off, delivery is available only in states with an enabled custom fee.</p></details></>}
      {stateMode && Object.hasOwn(initial, 'freeAboveMinor') && <small>Existing free delivery minimum: {initial.freeAboveMinor == null ? 'none' : money(initial.freeAboveMinor, currency)}. This is preserved when you save.</small>}
      {error && <p className={css.error} role="alert">{error}</p>}
    </form>
  </Modal>;
}

function RowMenu({ label, enabled, onToggle, onDelete, disabled }) {
  return <details className={css.menu}><summary aria-label={`More actions for ${label}`}><MoreHorizontal size={17} /></summary><div><button type="button" disabled={disabled} onClick={e => { e.currentTarget.closest('details').open = false; onToggle(); }}>{enabled ? 'Disable' : 'Enable'}</button><button type="button" disabled={disabled} onClick={e => { e.currentTarget.closest('details').open = false; onDelete(); }}>Remove</button></div></details>;
}

export default function DeliveryCountries({ delivery, currency, onSave, busy, digital = false }) {
  const [help,setHelp]=useState(false);
  const configured = delivery.countries || [];
  const legacy = (delivery.zones || []).filter(z => !z.countryProfile);
  const [countries, setCountries] = useState([]);
  const [entry, setEntry] = useState(null), [remove, setRemove] = useState(null), [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => { let active = true; deliveryLocations('countries').then(items => { if (active) { setCountries(items); setError(''); } }).catch(e => { if (active) setError(e.message); }); return () => { active = false; }; }, [retry]);
  const persist = async (next, message) => { await onSave(next); notify.success(message); };
  const safe = async (next, message) => { try { setError(''); await persist(next, message); } catch (e) { setError(e.message); } };
  const replace = country => ({ ...delivery, countries: configured.map(c => c.countryCode === country.countryCode ? country : c) });
  const available = [...countries.filter(c => !configured.some(row => row.countryCode === c.code) || entry?.value?.countryCode === c.code)];
  if (entry?.value?.countryCode && !available.some(c => c.code === entry.value.countryCode)) available.push({ code: entry.value.countryCode, name: entry.value.name });
  return <div className={css.root}>
    <header className={css.hero}><span><Truck size={19}/></span><div><h3>Delivery <button type="button" aria-label="About delivery" onClick={()=>setHelp(true)}>?</button></h3><p>Choose where you deliver and what customers pay.</p></div><button type="button" className={css.offerToggle} role="switch" aria-label="Offer Delivery" aria-checked={!digital&&delivery.enabled===true} aria-disabled={digital||busy} disabled={busy} onClick={()=>digital?setHelp(true):safe({...delivery,enabled:!delivery.enabled},'Delivery setting saved')}>Offer Delivery <i aria-hidden="true"><span/></i></button></header>
    {help&&<Modal title="Delivery" onClose={()=>setHelp(false)}><p>{digital?'This option is only available for physical stores.':'Set a general fee for each country and optional fees for individual states.'}</p></Modal>}
    <div className={css.heading}><h3>Delivery locations</h3><Button variant="secondary" disabled={digital || busy || !countries.length} onClick={() => setEntry({ kind: 'country' })}><Plus size={14} /> Add Delivery Location</Button></div>
    {!configured.length && <div className={css.empty}>Add a country and set one general delivery fee.</div>}
    {configured.map(country => <section className={css.country} key={country.countryCode}>
      <div className={css.countryHeading}><h4><span aria-hidden="true">{countryFlag(country.countryCode)}</span> {country.name}{!country.enabled && <small>Disabled</small>}</h4><div className={css.actions}><button type="button" disabled={busy} onClick={() => setEntry({ kind: 'country', value: country })}><Pencil size={13} /> Edit</button><RowMenu label={country.name} enabled={country.enabled} disabled={busy} onToggle={() => safe(replace({ ...country, enabled: !country.enabled }), 'Country updated')} onDelete={() => setRemove({ country })} /></div></div>
      <div className={css.general}><p>General delivery fee <strong>{money(country.feeMinor, currency)}</strong></p><p>Estimated delivery <strong>{country.estimate || 'Not set'}</strong></p><small>{country.allStates ? 'Applies to all states without a custom fee.' : 'Delivery is limited to enabled states below.'}</small>{country.freeAboveMinor != null && <small>Free delivery from {money(country.freeAboveMinor, currency)}.</small>}</div>
      <div className={css.stateHeading}><div><h5>Custom state fees</h5><p>Set different delivery fees for selected states.</p></div><button type="button" disabled={busy} onClick={() => setEntry({ kind: 'state', country })}><Plus size={13} /> Add state</button></div>
      <ul className={css.rows}>{country.states.map(state => <li key={state.regionId}><div><strong>{state.name}{!state.enabled && <small>Disabled</small>}</strong><span>{money(state.feeMinor, currency)} <i>·</i> {state.estimate || 'Not set'}</span></div><div className={css.actions}><button type="button" disabled={busy} aria-label={`Edit ${state.name} fee`} onClick={() => setEntry({ kind: 'state', country, value: state })}><Pencil size={13} /> Edit</button><RowMenu label={state.name} enabled={state.enabled} disabled={busy} onToggle={() => safe(replace({ ...country, states: country.states.map(s => s.regionId === state.regionId ? { ...s, enabled: !s.enabled } : s) }), 'State fee updated')} onDelete={() => setRemove({ country, state })} /></div></li>)}</ul>
      {!country.states.length && <p className={css.noStates}>{country.allStates ? 'All states use the general fee.' : 'Add a state to make delivery available.'}</p>}
    </section>)}
    {legacy.length > 0 && <section className={css.legacy}><h4>Existing locations to review</h4><p>These locations include older coverage or city-specific fees. They still apply and have been preserved. Review them before replacing their country’s delivery settings.</p>{legacy.map(zone => <div key={zone.id}><span><strong>{zone.name || 'Existing delivery location'}</strong><small>{[...(zone.countries || []), ...(zone.states || []), ...(zone.cities || []), ...(zone.postcodes || [])].join(', ') || 'Existing coverage'} · {money(zone.feeMinor, currency)}{zone.enabled === false ? ' · Disabled' : ''}{zone.excluded ? ' · Delivery unavailable' : ''}</small></span><RowMenu label={zone.name} enabled={zone.enabled !== false} disabled={busy} onToggle={() => safe({ ...delivery, zones: delivery.zones.map(z => z.id === zone.id ? { ...z, enabled: z.enabled === false } : z) }, 'Existing location updated')} onDelete={() => setRemove({ zone })} /></div>)}</section>}
    {error && <p role="alert" className={css.error}>{error} {!countries.length && <button type="button" onClick={() => setRetry(n => n + 1)}>Retry</button>}</p>}
    {entry && <FeeEditor entry={entry} countries={available} currency={currency} onClose={() => setEntry(null)} onSave={async row => {
      let next;
      if (entry.kind === 'country') next = { ...delivery, countries: entry.value ? configured.map(c => c.countryCode === row.countryCode ? row : c) : [...configured, row] };
      else next = replace({ ...entry.country, states: entry.value ? entry.country.states.map(s => s.regionId === row.regionId ? row : s) : [...entry.country.states, row] });
      await persist(next, entry.kind === 'country' ? 'Country saved' : 'State fee saved');
    }} />}
    {remove && <Modal title="Remove delivery location?" onClose={() => !busy && setRemove(null)} footer={<><Button variant="secondary" disabled={busy} onClick={() => setRemove(null)}>Keep location</Button><Button disabled={busy} onClick={async () => { try { const next = remove.zone ? { ...delivery, zones: delivery.zones.filter(z => z.id !== remove.zone.id) } : remove.state ? replace({ ...remove.country, states: remove.country.states.filter(s => s.regionId !== remove.state.regionId) }) : { ...delivery, countries: configured.filter(c => c.countryCode !== remove.country.countryCode) }; await persist(next, 'Delivery location removed'); setRemove(null); } catch (e) { setError(e.message); } }}>Remove location</Button></>}><p>{remove.state ? remove.country.allStates ? 'This state will use the general country fee.' : 'Delivery will no longer be available in this state.' : 'Delivery coverage and fees for this location will be removed. Existing orders keep their original details.'}</p></Modal>}
  </div>;
}

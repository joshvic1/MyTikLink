const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const swc = require(path.join(root, 'node_modules/next/dist/build/swc'));
const nodes = node => !node || typeof node !== 'object' ? [] : Array.isArray(node) ? node.flatMap(nodes) : [node, ...nodes(node.props?.children), ...nodes(node.props?.footer)];

async function fixture(exportName, props) {
  await swc.loadBindings();
  let cursor = 0; const state = [], effects = [], timers = [], messages = [];
  const react = {
    useState(initial) { const i = cursor++; if (!(i in state)) state[i] = typeof initial === 'function' ? initial() : initial; return [state[i], next => { state[i] = typeof next === 'function' ? next(state[i]) : next; }]; },
    useEffect(fn, deps) { const i = cursor++; if (!state[i] || deps.some((d, j) => d !== state[i][j])) { state[i] = deps; effects.push(fn); } },
  };
  const module = { exports: {} };
  const filename = path.join(root, 'V1.1/store/DeliveryCountries.jsx');
  const code = swc.transformSync(fs.readFileSync(filename, 'utf8'), { filename, jsc: { parser: { syntax: 'ecmascript', jsx: true }, transform: { react: { runtime: 'automatic' } }, target: 'es2020' }, module: { type: 'commonjs' } }).code;
  vm.runInNewContext(code, { module, exports: module.exports, console, Intl, setTimeout: fn => timers.push(fn), clearTimeout() {}, require(spec) {
    if (spec === 'react') return react;
    if (spec.endsWith('/NumericInput')) return { default: 'input', __esModule: true };
    if (spec.endsWith('/UI')) return { Field: 'Field', Button: 'Button', Modal: 'Modal' };
    if (spec.endsWith('/Notifications')) return { notify: { success: text => messages.push(text) } };
    if (spec.endsWith('/deliveryLocations')) return { countryFlag: () => '', deliveryLocations: async kind => kind === 'countries' ? [{ code: 'NG', name: 'Nigeria' }, { code: 'GH', name: 'Ghana' }] : [{ id: 'ng-lagos', name: 'Lagos' }, { id: 'ng-ebonyi', name: 'Ebonyi' }] };
    if (spec.endsWith('.css')) return new Proxy({}, { get: (_, key) => String(key) });
    return require(require.resolve(spec, { paths: [root] }));
  } });
  const component = module.exports[exportName];
  return { messages, render() { cursor = 0; return component(props); }, async effects() { while (effects.length) effects.shift()(); await new Promise(resolve => setImmediate(resolve)); }, timers };
}

test('country save waits for persistence, sends store-currency minor units, and closes only after success', async () => {
  let resolve, saved, closed = false;
  const f = await fixture('FeeEditor', { entry: { kind: 'country' }, countries: [{ code: 'GH', name: 'Ghana' }], currency: 'NGN', onSave: row => { saved = row; return new Promise(r => resolve = r); }, onClose: () => { closed = true; } });
  let tree = f.render();
  nodes(tree).find(n => n.props?.label === 'Country').props.onChange({ code: 'GH' });
  nodes(tree).find(n => n.type === 'input' && n.props.step === '0.01').props.onChange({ target: { value: '123.45' } });
  tree = f.render();
  const pending = nodes(tree).find(n => n.type === 'form').props.onSubmit({ preventDefault() {} });
  assert.equal(saved.feeMinor, 12345); assert.equal(saved.countryCode, 'GH'); assert.equal(saved.allStates, true);
  assert.equal(saved.freeAboveMinor, null); assert.equal(closed, false);
  assert.ok(nodes(f.render()).find(n => n.props?.form === 'delivery-fee-editor').props.disabled);
  resolve(); await pending; assert.equal(closed, true);
});
test('failed country save retains the modal and entered values with a retryable error', async () => {
  let closed = false;
  const f = await fixture('FeeEditor', { entry: { kind: 'country', value: { countryCode: 'NG', feeMinor: 800000, states: [] } }, countries: [{ code: 'NG', name: 'Nigeria' }], currency: 'NGN', onSave: async () => { throw Error('Connection interrupted'); }, onClose: () => { closed = true; } });
  await nodes(f.render()).find(n => n.type === 'form').props.onSubmit({ preventDefault() {} });
  assert.equal(closed, false);
  const tree = f.render();
  assert.ok(nodes(tree).some(n => n.props?.role === 'alert' && n.props.children === 'Connection interrupted'));
  assert.equal(nodes(tree).find(n => n.type === 'input' && n.props.step === '0.01').props.value, '8000');
  assert.equal(nodes(tree).find(n => n.props?.form === 'delivery-fee-editor').props.disabled, false);
});
test('custom state picker excludes already-configured states, including disabled fees', async () => {
  const f = await fixture('FeeEditor', { entry: { kind: 'state', country: { countryCode: 'NG', name: 'Nigeria', states: [{ regionId: 'ng-lagos', enabled: false }] } }, countries: [], currency: 'NGN', onSave: async () => {}, onClose() {} });
  f.render(); await f.effects();
  const picker = nodes(f.render()).find(n => n.props?.label === 'State / Region');
  assert.deepEqual(Array.from(picker.props.items, r => r.id), ['ng-ebonyi']);
});
test('country cards show compact state rows, coverage fallback and preserved city locations', async () => {
  const f = await fixture('default', { delivery: { enabled: true, countries: [{ countryCode: 'NG', name: 'Nigeria', enabled: true, allStates: true, feeMinor: 800000, estimate: '2–4 business days', states: [{ regionId: 'ng-lagos', name: 'Lagos', enabled: true, feeMinor: 500000, estimate: 'Same day' }] }], zones: [{ id: 'old', name: 'Ikeja', countries: ['NG'], cities: ['Ikeja'], feeMinor: 12300 }] }, currency: 'NGN', onSave: async () => {}, busy: false });
  const tree = f.render(); const text = JSON.stringify(tree);
  assert.match(text, /Applies to all states without a custom fee/);
  assert.match(text, /Existing locations to review/);
  assert.match(text, /Ikeja/);
  assert.equal(nodes(tree).filter(n => n.type === 'li').length, 1);
  assert.doesNotMatch(text, /Countrywide fallback|priority|Specific cities or areas/);
});

const part = (node, name) => node?.part === name ? node : (node?.children ?? []).map(child => part(child, name)).find(Boolean);

/** Reserve a stable number of characters from the constraints, never the live draft. */
export function rangeNumberCharacters({min = 0, max = 100, step = 1} = {}) {
  const decimals = value => { const [whole, exponent = 0] = String(value).toLowerCase().split('e'); return Math.max(0, (whole.split('.')[1]?.length ?? 0) - Number(exponent)); };
  const precision = Math.min(20, Math.max(...[min, max, step === 'any' ? 0 : step].map(decimals)));
  const length = value => Number.isFinite(Number(value)) ? Number(value).toFixed(precision).length : 0;
  return Math.min(12, Math.max(3, step === 'any' ? 6 : 0, length(min), length(max)));
}

/** Keep the shared slider anatomy; only with-input exposes a second native control. */
export function normalizeRangeFieldPreview(source, options, withInput) {
  const preview = structuredClone(source), row = part(preview, 'row');
  if (!row) return preview;
  if (withInput) {
    part(preview, 'label').children = [];
    delete part(row, 'number').attrs.hidden;
  } else row.children = row.children.filter(node => node.part !== 'number');
  return preview;
}

const attr = (node, name, value) => value == null ? node.removeAttribute(name) : node.setAttribute(name, String(value));
const hidden = (node, value) => { node.hidden = value; attr(node, 'hidden', value ? '' : null); };
const flag = (node, name) => Boolean(node?.[name]) || node?.getAttribute(name.toLowerCase()) != null;
const bindings = new WeakMap();

/** Native range/number synchronization. Product callbacks own further validation and storage. */
export function mountRangeField(root, { onInput = () => {}, onCommit = () => {} } = {}) {
  const range = root?.querySelector?.('.ds-range-field__control'), number = root?.querySelector?.('.ds-range-field__number');
  const errorNode = root?.querySelector?.('.ds-range-field__error'), output = root?.querySelector?.('.ds-range-field__value');
  if (!range || range.getAttribute('type') !== 'range' || !errorNode || (number && number.getAttribute('type') !== 'number')) throw new Error('mountRangeField requires the shared native range-field anatomy.');
  if (bindings.has(root)) throw new Error('Range field is already mounted.');
  const min = Number(range.getAttribute('min') ?? 0), max = Number(range.getAttribute('max') ?? 100), stepText = range.getAttribute('step') ?? '1', step = stepText === 'any' ? null : Number(stepText);
  if (!Number.isFinite(min) || !Number.isFinite(max) || min > max || (step !== null && (!Number.isFinite(step) || step <= 0))) throw new Error('Range field requires finite ordered bounds and a positive step or any.');
  number?.style?.setProperty?.('--ds-range-number-chars', rangeNumberCharacters({min, max, step: stepText}));
  let accepted = Number(range.value || range.getAttribute('value') || min), draft = String(number?.value ?? accepted);
  let externalError = errorNode.getAttribute('hidden') === null ? errorNode.textContent : '', localError = '', destroyed = false;
  let disabled = number ? flag(number, 'disabled') : flag(range, 'disabled'), readOnly = flag(number, 'readOnly') || root.getAttribute('data-readonly') === 'true';
  let committed = accepted;
  const removals = [], controls = [range, ...(number ? [number] : [])];
  const listen = (node, type, callback) => { node.addEventListener(type, callback); removals.push(() => node.removeEventListener(type, callback)); };
  const parse = raw => {
    if (!String(raw).trim() || !Number.isFinite(Number(raw))) return { error: 'Angiv et gyldigt tal.' };
    const value = Number(raw);
    if (value < min || value > max) return { error: 'Vælg en værdi mellem ' + min + ' og ' + max + '.' };
    if (step !== null) { const count = (value - min) / step; if (Math.abs(count - Math.round(count)) > 1e-7) return { error: 'Brug trin på ' + step + ' fra ' + min + '.' }; }
    return { value, error: '' };
  };
  const state = () => ({ value: accepted, draft, valid: !localError && !externalError, error: localError || externalError });
  const setState = (name, enabled) => { const states = new Set((root.getAttribute('data-state') ?? '').split(/\s+/).filter(Boolean)); if (enabled) states.add(name); else states.delete(name); attr(root, 'data-state', states.size ? [...states].join(' ') : null); };
  function paint() {
    const error = localError || externalError;
    for (const control of controls) {
      control.disabled = disabled || (control === range && readOnly); attr(control, 'disabled', control.disabled ? '' : null);
      const described = new Set((control.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean));
      if (error) described.add(errorNode.id); else described.delete(errorNode.id);
      attr(control, 'aria-describedby', described.size ? [...described].join(' ') : null); attr(control, 'aria-invalid', error ? 'true' : null);
    }
    if (number) { number.readOnly = readOnly; attr(number, 'readonly', readOnly ? '' : null); }
    attr(root, 'aria-disabled', disabled ? 'true' : null); attr(root, 'data-readonly', readOnly ? 'true' : null);
    setState('disabled', disabled); setState('readOnly', readOnly); setState('invalid', Boolean(error));
    errorNode.textContent = error; hidden(errorNode, !error);
    if (output) output.textContent = String(accepted);
  }
  function read(source) {
    if (destroyed || disabled || readOnly) return false;
    externalError = ''; draft = String(source === 'range' ? range.value : number.value);
    const result = parse(draft); localError = source === 'number' && number.validity?.badInput ? 'Angiv et gyldigt tal.' : result.error;
    if (!localError) { accepted = result.value; if (source === 'range' && number && number.value !== draft) number.value = draft; if (source === 'number') range.value = String(accepted); }
    paint(); return true;
  }
  for (const control of controls) {
    const source = control === range ? 'range' : 'number';
    listen(control, 'input', () => { if (read(source)) onInput({ ...state(), source }); });
    const commit = () => { if (destroyed || disabled || readOnly) return; const current = state(); if (current.valid && accepted !== committed) { committed = accepted; onCommit({ ...current, source }); } };
    listen(control, 'change', commit); listen(control, 'blur', commit);
  }
  const api = {
    getState: state,
    update(patch = {}) {
      if (destroyed) return false;
      if (patch.value !== undefined) { const result = parse(String(patch.value)); if (result.error) throw new Error(result.error); accepted = result.value; range.value = String(accepted); draft = String(accepted); committed = accepted; }
      if (patch.draft !== undefined) draft = String(patch.draft);
      if (patch.value !== undefined || patch.draft !== undefined) { const result = parse(draft); localError = result.error; if (!localError) { accepted = result.value; range.value = String(accepted); } if (number && number.value !== draft) number.value = draft; externalError = ''; }
      if (patch.error !== undefined) externalError = String(patch.error ?? '');
      if (patch.disabled !== undefined) disabled = Boolean(patch.disabled);
      if (patch.readOnly !== undefined) readOnly = Boolean(patch.readOnly);
      paint(); return true;
    },
    destroy() { if (destroyed) return; destroyed = true; for (const remove of removals) remove(); bindings.delete(root); },
  };
  localError = parse(draft).error; paint(); bindings.set(root, api); return api;
}

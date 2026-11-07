export const DEFAULT_FILE_LIMIT = 5 * 1024 * 1024;

function checked(value, validate) {
  if (validate) {
    const result = validate(value);
    if (!result.valid) throw new Error(['Filen indeholder ugyldige data.', ...(result.errors || [])].join('\n'));
  }
  return value;
}

export async function readJSONFile(file, { validate, maxBytes = DEFAULT_FILE_LIMIT } = {}) {
  if (file.size > maxBytes) throw new Error('Filen er for stor. Grænsen er ' + maxBytes + ' bytes.');
  let value;
  try { value = JSON.parse((await file.text()).replace(/^\uFEFF/, '')); }
  catch (error) {
    if (error instanceof SyntaxError) throw new Error('Filen indeholder ikke gyldig JSON.');
    throw error;
  }
  return checked(value, validate);
}

/** Call from a user action. Cancellation resolves to null and never changes state. */
export function openJSONFile({ document = globalThis.document, ...options } = {}) {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json,application/json'; input.hidden = true;
    const finish = () => input.remove();
    input.addEventListener('cancel', () => { finish(); resolve(null); }, { once: true });
    input.addEventListener('change', async () => {
      const file = input.files[0]; finish();
      if (!file) { resolve(null); return; }
      try { resolve({ name: file.name, data: await readJSONFile(file, options) }); }
      catch (error) { reject(error); }
    }, { once: true });
    document.body.append(input);
    try { input.click(); } catch (error) { finish(); reject(error); }
  });
}

/** Starts a download; the browser owns its destination and overwrite decisions. */
export function downloadFile(name, body, type, { document = globalThis.document, url = globalThis.URL } = {}) {
  const filename = String(name).replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-').trim();
  if (!filename || filename === '.' || filename === '..') throw new Error('Angiv et filnavn.');
  const href = url.createObjectURL(new Blob([body], { type }));
  const link = document.createElement('a'); link.href = href; link.download = filename;
  try { document.body.append(link); link.click(); }
  finally { link.remove(); setTimeout(() => url.revokeObjectURL(href), 1000); }
}

export function downloadJSON(name, value, { validate, ...options } = {}) {
  checked(value, validate);
  downloadFile(name, JSON.stringify(value, null, 2) + '\n', 'application/json', options);
}

/** A product owns its format id, version and data validator. Never silently migrate. */
export function createProjectFile({ format, version = 1, validate }) {
  if (!format || !Number.isInteger(version) || version < 1 || typeof validate !== 'function') throw new Error('Projektformatet kræver format, positiv version og validering.');
  const validateDocument = value => {
    if (!value || value.format !== format) return { valid: false, errors: ['Filen tilhører et andet projektformat.'] };
    if (value.version !== version) return { valid: false, errors: ['Filversionen understøttes ikke: ' + String(value.version) + '. Forventet version: ' + version + '.'] };
    return validate(value.data);
  };
  return {
    async read(file, options) { return (await readJSONFile(file, { ...options, validate: validateDocument })).data; },
    async open(options) {
      const result = await openJSONFile({ ...options, validate: validateDocument });
      return result ? { name: result.name, data: result.data.data } : null;
    },
    save(name, data, options) { downloadJSON(name, { format, version, data }, { ...options, validate: validateDocument }); },
  };
}

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { validatePackage, generateCSS, LIBRARY_VERSION } from '../runtime/engine.mjs';
import { projectPath, inputFingerprint, offlineIssues } from './offline-checks.mjs';

export const PROJECT_RUNTIME = [
  ...['graphic-tokens.mjs','graphics.mjs','graphics/catalog.mjs',
    ...['anatomy','lightroom','passage','fieldlines'].map(id=>'graphics/families/'+id+'.mjs'),
    ...['anatomy','lightroom','passage','fieldlines'].map(id=>'graphics/families/'+id+'-catalog.mjs'),
    ...['anatomy','lightroom','passage','fieldlines','primitives','player'].map(id=>'graphics/motion/'+id+'.mjs')
  ].map(name=>['core/'+name,'runtime/'+name]),
  ...['contract.mjs', 'library.mjs', 'quality.mjs', 'geometry.mjs', 'token-usage.mjs', 'engine.mjs', 'components.mjs', 'signature-assets.mjs', 'files.mjs', 'layout.mjs', 'panels.mjs', 'motion.mjs', 'menus.mjs','icons.mjs','scales.mjs','preferences.mjs','theme-modes.mjs','navigation.mjs','overlays.mjs','input-choices.mjs','range-field.mjs','feedback.mjs','uploads.mjs','data-table.mjs','data-grid.mjs'].map(name => ['core/' + name, 'runtime/' + name]),
  ['tools/doctor.mjs', 'tools/doctor.mjs'],
  ['tools/offline-checks.mjs', 'tools/offline-checks.mjs'],
];

export const runtimeContent = (source, content) => source === 'tools/doctor.mjs'
  ? content.replace("'../core/engine.mjs'", "'../runtime/engine.mjs'") : content;

/** Read-only diagnostics. Does not execute project scripts or repair files. */
export async function doctor(projectArgument, { studioRoot } = {}) {
  const root = await fs.realpath(projectArgument);
  const checks = [];
  const add = (status, message) => checks.push({ status, message });
  const check = async (label, action) => {
    try { await action(); add('ok', label); }
    catch (error) { add('error', label + ': ' + error.message); }
  };
  const read = async relative => {
    const file = projectPath(root, relative);
    const resolved = await fs.realpath(file);
    const distance = path.relative(root, resolved);
    if (distance === '..' || distance.startsWith('..' + path.sep) || path.isAbsolute(distance)) throw new Error('Filen peger uden for projektet: ' + relative);
    return fs.readFile(file, 'utf8');
  };
  let config;
  await check('Projektkonfiguration', async () => { config = JSON.parse(await read('design-studio.project.json')); });
  if (!config) return { valid: false, checks };
  let theme;
  await check('Tema', async () => {
    theme = JSON.parse((await read(config.package)).replace(/^\uFEFF/, ''));
    const result = validatePackage(theme);
    if (!result.valid) { theme = null; throw new Error(result.errors.join('\n')); }
  });
  if (theme) await check('Genereret CSS', async () => {
    if (await read(config.css) !== generateCSS(theme, { scope: config.scope || '.ds-scope' })) throw new Error('CSS er forældet. Kør sync og derefter npm run build.');
  });
  await check('Biblioteksversion', async () => {
    if (config.libraryVersion !== LIBRARY_VERSION) throw new Error('Registreret udgave: ' + config.libraryVersion + '; tilgængelig udgave: ' + LIBRARY_VERSION + '. Kør sync.');
  });
  const baseline = studioRoot || config.studioRoot;
  let baselineAvailable = false;
  if (baseline) {
    try { baselineAvailable = (await fs.stat(path.join(baseline, 'core/engine.mjs'))).isFile(); } catch {}
  }
  if (!baselineAvailable) add('warning', 'Design Studios mappe er ikke tilgængelig. Kan ikke sammenligne runtime med den centrale kilde.');
  for (const [source, relative] of PROJECT_RUNTIME) await check('Fælles fil: design/' + relative, async () => {
    const content = await read('design/' + relative);
    if (baselineAvailable && content !== runtimeContent(source, await fs.readFile(path.join(baseline, source), 'utf8'))) throw new Error('Filen afviger fra Design Studio. Kør sync.');
  });
  await check('Biblioteksindgang', async () => { await read(config.library); });
  if (!config.components || typeof config.components !== 'object' || Array.isArray(config.components)) add('error', 'components skal være et objekt med fil og export for hver adapter.');
  else for (const [id, adapter] of Object.entries(config.components)) await check('Komponentadapter: ' + id, async () => {
    if (!adapter || typeof adapter.export !== 'string' || !adapter.export) throw new Error('Angiv file og export.');
    const source = await read(adapter.file);
    // Compile for its export table, without running or resolving product imports.
    const { build } = await import('esbuild');
    const extension = path.extname(adapter.file).slice(1);
    const result = await build({ stdin: { contents: source, loader: ['ts', 'tsx', 'jsx'].includes(extension) ? extension : 'js' }, bundle: false, write: false, format: 'esm', metafile: true, tsconfigRaw: {}, logLevel: 'silent' });
    if (!Object.values(result.metafile.outputs).some(output => output.exports.includes(adapter.export))) throw new Error('Eksporten ' + adapter.export + ' findes ikke i ' + adapter.file + '.');
  });
  let metadata;
  await check('Produktets package.json', async () => {
    metadata = JSON.parse(await read('package.json'));
    if (!metadata.scripts?.build) throw new Error('npm run build mangler.');
    for (const name of ['express', 'fastify', 'koa', 'next', 'electron', 'electron-builder']) {
      if (metadata.dependencies?.[name] || metadata.devDependencies?.[name]) add('warning', 'Afhængigheden ' + name + ' kan kræve en anden driftsmodel. Kontrollér behovet i offlineprojektet.');
    }
  });
  await check('Offlinefil', async () => {
    const html = await read('index.html');
    for (const issue of offlineIssues(html)) add(issue.startsWith('Der er tegn') ? 'warning' : 'error', issue);
    const inputs = html.match(/<meta name="design-studio-inputs" content="([^"]+)">/)?.[1];
    const fingerprint = html.match(/<meta name="design-studio-build" content="([a-f0-9]{64})">/)?.[1];
    if (!inputs || !fingerprint) {
      if (config.offline) throw new Error('Byggestempel mangler. Kør npm run build.');
      add('warning', 'Byggestempel mangler; offlinefilens aktualitet kan ikke kontrolleres.'); return;
    }
    const files = JSON.parse(Buffer.from(inputs, 'base64').toString('utf8'));
    if (!Array.isArray(files) || !files.length || files.some(file => typeof file !== 'string')) throw new Error('Ugyldigt byggestempel.');
    for (const file of files) await read(file);
    if (await inputFingerprint(root, files) !== fingerprint) throw new Error('index.html er forældet. Kør npm run build.');
  });
  return { valid: !checks.some(check => check.status === 'error'), checks };
}

export function formatDoctor(report) {
  return report.checks.map(check => ({ ok: 'OK', warning: 'ADVARSEL', error: 'FEJL' })[check.status] + ' · ' + check.message).join('\n')
    + '\n' + (report.valid ? 'Ingen fejl fundet.' : 'Projektet har fejl, som skal rettes.');
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  doctor(process.argv[2] || root).then(report => {
    console.log(formatDoctor(report)); process.exitCode = report.valid ? 0 : 1;
  }).catch(error => { console.error(error.message); process.exitCode = 1; });
}

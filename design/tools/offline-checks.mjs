import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

export function projectPath(root, relative) {
  if (typeof relative !== 'string' || !relative || path.isAbsolute(relative)) throw new Error('Projektets filstier skal være relative.');
  const file = path.resolve(root, relative);
  const distance = path.relative(root, file);
  if (distance === '..' || distance.startsWith('..' + path.sep) || path.isAbsolute(distance)) throw new Error('Filstien skal blive inden for projektmappen: ' + relative);
  return file;
}

export async function inputFingerprint(root, inputs) {
  const hash = createHash('sha256');
  for (const input of [...new Set(inputs)].sort()) {
    hash.update(input); hash.update('\0');
    hash.update(await readFile(projectPath(root, input))); hash.update('\0');
  }
  return hash.digest('hex');
}

export async function buildStamp(root, inputs) {
  const files = [...new Set(inputs.map(file => file.replaceAll('\\', '/')))].sort();
  return '<meta name="design-studio-inputs" content="' + Buffer.from(JSON.stringify(files)).toString('base64') + '">\n'
    + '<meta name="design-studio-build" content="' + await inputFingerprint(root, files) + '">';
}

export function offlineIssues(html) {
  const issues = [];
  const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, match => match.slice(0, match.indexOf('>') + 1) + '</script>')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
  if (/<script\b[^>]*\bsrc\s*=/i.test(markup) || /<link\b[^>]*\brel=["']stylesheet["']/i.test(markup)) issues.push('index.html indlæser kode eller CSS fra andre filer. Pak dem ind med npm run build.');
  for (const match of markup.matchAll(/<(?:img|iframe|source|video|audio)\b[^>]*\bsrc=["']([^"']+)/gi)) {
    if (!/^(?:data:|blob:|#)/i.test(match[1])) issues.push('Ressource er ikke indbygget i offlinefilen: ' + match[1]);
  }
  // Static signals, not a proof of every possible runtime request.
  if (/\bfetch\s*\(|\b(?:WebSocket|XMLHttpRequest)\s*\(|\bimport\s*\(\s*["']https?:/i.test(html)) issues.push('Der er tegn på netværks- eller fetch-kald. Gennemgå dem for afhængighed af en server eller lokale filkald.');
  for (const style of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    if (/@import\b/i.test(style[1]) || /url\(\s*["']?(?!data:|blob:|#)[^\s"')]/i.test(style[1])) issues.push('CSS indlæser ressourcer uden for offlinefilen.');
  }
  return [...new Set(issues)];
}

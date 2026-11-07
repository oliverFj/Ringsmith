import { resolveTokens } from './engine.mjs';
import { cssVariableName } from './contract.mjs';
import { DEFAULT_GRAPHIC_FAMILY, GRAPHIC_FAMILY_IDS, GRAPHIC_TOKEN_BINDINGS, GRAPHIC_TOKEN_DEFAULTS } from './graphic-tokens.mjs';
import * as anatomy from './graphics/families/anatomy.mjs';
import * as lightroom from './graphics/families/lightroom.mjs';
import * as passage from './graphics/families/passage.mjs';
import * as fieldlines from './graphics/families/fieldlines.mjs';
import {GRAPHIC_CATALOG_MOTIFS} from './graphics/catalog.mjs';
import { graphicDuration } from './graphics/motion/player.mjs';
export { mountGraphicMotion, GRAPHIC_MOTION } from './graphics/motion/player.mjs';

const families = Object.freeze({ anatomy, lightroom, passage, fieldlines });
export const GRAPHIC_FAMILIES = Object.freeze(GRAPHIC_FAMILY_IDS.map(id => {
  const { name, description, qualities } = families[id].meta;
  return Object.freeze({ id, name, description, qualities: Object.freeze([...qualities]) });
}));
export const GRAPHIC_MOTIFS = Object.freeze([
  { id: 'poster', name: 'Principplakat', meaning: 'En større komposition om hensigt og form.' },
  { id: 'focus', name: 'Fokus', meaning: 'Ét tydeligt tyngdepunkt får plads.' },
  { id: 'relation', name: 'Relation', meaning: 'Selvstændige dele har en synlig forbindelse.' },
  { id: 'rhythm', name: 'Rytme', meaning: 'Gentagelse med en begrundet variation.' },
  { id: 'accordion', name: 'Accordion', meaning: 'Skjult og åbent indhold kan skelnes.' },
  { id: 'avatar-group', name: 'Avatargruppe', meaning: 'Personer hører sammen uden at miste deres identitet.' },
  { id: 'progress', name: 'Fremdrift', meaning: 'Passeret, aktuelt og ventende er forskellige tilstande.' },
  { id: 'image', name: 'Billede', meaning: 'En afgrænset åbning til et motiv.' },
  { id: 'caption', name: 'Billedtekst', meaning: 'Tekst er knyttet til et bestemt billede.' },
  { id: 'checkbox', name: 'Afkrydsning', meaning: 'Samme kontrolform viser valgt og ikke valgt.' },
  ...GRAPHIC_CATALOG_MOTIFS.filter(({id})=>!['accordion','avatar-group','progress','image','caption','checkbox'].includes(id))
].map(Object.freeze));

const SVG_NS = 'http://www.w3.org/2000/svg';
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const decode = value => value.replace(/&(amp|lt|gt|quot|apos|#39);/g, (_, name) => ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'" }[name]));
const variable = key => '--g-' + key.replace(/[A-Z]/g, letter => '-' + letter.toLowerCase());
let sequence = 0;

/** Missing optional metadata uses the shared default; unknown families are rejected. */
export function getGraphicFamily(pack) {
  const id = pack?.graphics?.family ?? DEFAULT_GRAPHIC_FAMILY;
  if (!GRAPHIC_FAMILY_IDS.includes(id)) throw new Error('Unknown shared graphic family: ' + String(id));
  return id;
}

/** Semantic drawing parts are available without mounting or animating an SVG. */
export function getGraphicParts(pack, motif, { family = getGraphicFamily(pack) } = {}) {
  if (!Object.hasOwn(families, family)) throw new Error('Unknown shared graphic family: ' + String(family));
  if (!GRAPHIC_MOTIFS.some(item => item.id === motif)) throw new Error('Unknown shared graphic motif: ' + String(motif));
  return families[family].draw(motif, { prefix: 'ds-graphic-inspection' }).parts.map(({ key, name, purpose }) => ({ key, name, purpose }));
}

function model(snapshot, motif, { family = snapshot.family, idPrefix, resolved = false, decorative = false } = {}) {
  if (!Object.hasOwn(families, family)) throw new Error('Unknown shared graphic family: ' + String(family));
  if (!GRAPHIC_MOTIFS.some(item => item.id === motif)) throw new Error('Unknown shared graphic motif: ' + String(motif));
  const { values, duration } = snapshot;
  const prefix = String(idPrefix ?? 'ds-graphic-' + (++sequence)).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 100) || 'ds-graphic-' + (++sequence);
  const scene = families[family].draw(motif, { prefix });
  const style = resolved ? snapshot.resolvedStyle : snapshot.liveStyle;
  let body = scene.body;
  if (resolved) body = body.replace(/var\((--g-[\w-]+)\)/g, (_, key) => {
    if (!Object.hasOwn(values, key)) throw new Error('Unknown shared graphic variable: ' + key);
    return escape(values[key]);
  });
  return {
    attrs: { xmlns: SVG_NS, class: 'ds-graphic', width: '600', height: '420', viewBox: scene.viewBox, focusable: 'false',
      'data-family': family, 'data-motif': motif, 'data-motion-duration': String(duration), style,
      ...(decorative ? { 'aria-hidden': 'true' } : { role: 'img', 'aria-labelledby': prefix + '-title' }) },
    title: decorative ? null : { id: prefix + '-title', text: scene.label },
    background: resolved ? values['--g-ground'] : 'var(--g-ground)',
    body
  };
}

const attributes = attrs => Object.entries(attrs).map(([key, value]) => ` ${key}="${escape(value)}"`).join('');

/** Live SVG inherits semantic theme variables. Resolved SVG is self-contained. */
function renderModel(graphic) {
  return `<svg${attributes(graphic.attrs)}>` +
    (graphic.title ? `<title id="${graphic.title.id}">${escape(graphic.title.text)}</title>` : '') +
    `<rect width="600" height="420" fill="${escape(graphic.background)}"/>` +
    `<g fill="none" stroke-linejoin="round" stroke-linecap="round" font-family="Arial,sans-serif">${graphic.body}</g></svg>`;
}

// Parse only the trusted family registry's SVG subset; user strings are text or
// validated token values. Native construction needs neither innerHTML nor a DOMParser.
const svgTags = new Set(['g', 'path', 'rect', 'circle', 'line', 'polyline', 'polygon', 'ellipse', 'defs', 'clipPath', 'linearGradient', 'radialGradient', 'stop', 'text']);
function appendTrustedSVG(parent, source, document) {
  const stack = [parent];
  for (const token of source.match(/<[^>]+>|[^<]+/g) ?? []) {
    if (token.startsWith('</')) { stack.pop(); continue; }
    if (!token.startsWith('<')) {
      if (token.trim()) stack.at(-1).appendChild(document.createTextNode(decode(token)));
      continue;
    }
    const tag = /^<([\w-]+)/.exec(token)?.[1];
    if (!svgTags.has(tag)) throw new Error('Unsupported shared graphic SVG tag: ' + String(tag));
    const node = document.createElementNS(SVG_NS, tag);
    for (const [, key, value] of token.matchAll(/([\w:-]+)="([^"]*)"/g)) node.setAttribute(key, decode(value));
    stack.at(-1).appendChild(node);
    if (!token.endsWith('/>')) stack.push(node);
  }
}

/** Construct the same trusted scene as native SVG elements. */
function createModel(graphic, document) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  for (const [key, value] of Object.entries(graphic.attrs)) svg.setAttribute(key, value);
  if (graphic.title) {
    const title = document.createElementNS(SVG_NS, 'title'); title.setAttribute('id', graphic.title.id); title.textContent = graphic.title.text; svg.appendChild(title);
  }
  const background = document.createElementNS(SVG_NS, 'rect');
  for (const [key, value] of Object.entries({ width: '600', height: '420', fill: graphic.background })) background.setAttribute(key, value);
  svg.appendChild(background);
  const content = document.createElementNS(SVG_NS, 'g');
  for (const [key, value] of Object.entries({ fill: 'none', 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'font-family': 'Arial,sans-serif' })) content.setAttribute(key, value);
  appendTrustedSVG(content, graphic.body, document); svg.appendChild(content);
  return svg;
}

/** A fresh validated snapshot for rendering several motifs from the same theme.
 * No global theme cache: create another renderer after editing the source pack. */
export function createGraphicRenderer(pack) {
  const tokens = resolveTokens(pack);
  const values = Object.fromEntries(Object.entries(GRAPHIC_TOKEN_BINDINGS).map(([key, token]) => [variable(key), String(tokens[token] ?? GRAPHIC_TOKEN_DEFAULTS[token].$value)]));
  const snapshot = {
    family: getGraphicFamily(pack), values,
    duration: graphicDuration(tokens['duration.illustration']) ?? graphicDuration(GRAPHIC_TOKEN_DEFAULTS['duration.illustration'].$value),
    resolvedStyle: Object.entries(values).map(([key, value]) => key + ':' + value).join(';'),
    liveStyle: Object.entries(GRAPHIC_TOKEN_BINDINGS).map(([key, token]) => `${variable(key)}:var(${cssVariableName(token)},${values[variable(key)]})`).join(';')
  };
  return Object.freeze({
    render(motif, options = {}) { return renderModel(model(snapshot, motif, options)); },
    create(motif, options = {}, { document = options.document ?? globalThis.document } = {}) {
      if (!document?.createElementNS || !document?.createTextNode) throw new Error('createGraphic requires a DOM document with SVG support.');
      return createModel(model(snapshot, motif, options), document);
    }
  });
}

export function renderGraphic(pack, motif, options = {}) { return createGraphicRenderer(pack).render(motif, options); }
export function createGraphic(pack, motif, options = {}, context = {}) { return createGraphicRenderer(pack).create(motif, options, context); }

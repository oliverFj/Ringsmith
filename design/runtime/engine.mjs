import {canonicalizeTokenSet,canonicalTokenReferences,canonicalTokenId} from './scales.mjs';
import { PACKAGE_SCHEMA_VERSION, TOKEN_TYPES, REQUIRED_TOKENS, COMPONENT_CONTRACTS, TOKEN_REFERENCE_PATTERN, cssVariableName } from './contract.mjs';
import {COMPONENT_LIBRARY, DEFAULT_TOKENS, APPEARANCE_PROPERTIES, POSITIVE_SPACING_TOKENS, LIBRARY_VERSION, COMPONENT_ALIASES, VARIANT_ALIASES, STATE_ALIASES, PART_ALIASES, TOKEN_ALIASES, LEGACY_SELECTORS, canonicalComponentId, canonicalVariantId, canonicalStateId, canonicalPartId} from './library.mjs';
export {LIBRARY_VERSION, canonicalComponentId, canonicalVariantId, canonicalPartId, canonicalStateId} from './library.mjs';
import {validateThemeQuality, contrastRatio, parseGradient} from './quality.mjs';
import { generateLayoutCSS, generateScrollbarCSS } from './layout.mjs';
import { BUTTON_COMPATIBILITY_VARIANTS, BUTTON_SIZES, BUTTON_DANGER_VARIANTS } from './library.mjs';
import { generateIconCSS, ICON_NAMES } from './icons.mjs';
import { generatePreferenceCSS } from './preferences.mjs';
import {SIGNATURE_FONT_CSS} from './signature-assets.mjs';
import {GRAPHIC_FAMILY_IDS,DEFAULT_GRAPHIC_FAMILY} from './graphic-tokens.mjs';

const own = (object, key) => Object.hasOwn(object, key);
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value)
  && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
const idPattern = /^[a-z][a-zA-Z0-9-]*(?:\.[a-zA-Z0-9-]+)*$/;
const localIdPattern = /^[a-z][a-zA-Z0-9-]*$/;
const selectorPattern = /^\.ds-[a-z0-9_-]+$/;
const reservedKeys = new Set(['__proto__', 'prototype', 'constructor']);
const reference = value => typeof value === 'string'
  ? [...value.matchAll(new RegExp(TOKEN_REFERENCE_PATTERN.source, 'g'))].map(match => match[1]) : [];
const exactReference = value => typeof value === 'string'
  ? /^\{([a-z][a-zA-Z0-9-]*(?:\.[a-zA-Z0-9-]+)*)\}$/.exec(value)?.[1] : undefined;
const propertyGroups = {
  color: ['--ds-interaction-hover-surface', '--ds-interaction-hover-text', '--ds-interaction-active-surface', '--ds-interaction-active-text', 'color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'outlineColor', 'accentColor', 'fill', 'stroke'],
  length: ['fontSize', 'letterSpacing', 'width', 'minWidth', 'maxWidth', 'height', 'minHeight', 'maxHeight', 'borderWidth', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'outlineWidth', 'outlineOffset', 'textIndent', 'flexBasis', 'top', 'right', 'bottom', 'left', 'strokeWidth'],
  lengths: ['padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'paddingInline', 'paddingBlock', 'paddingInlineStart', 'paddingInlineEnd', 'paddingBlockStart', 'paddingBlockEnd', 'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'marginInline', 'marginBlock', 'marginInlineStart', 'marginInlineEnd', 'marginBlockStart', 'marginBlockEnd', 'gap', 'rowGap', 'columnGap', 'borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius', 'inset'],
  number: ['opacity', 'flexGrow', 'flexShrink', 'order', 'zIndex'],
  generic: ['fontFamily', 'fontWeight', 'lineHeight', 'boxShadow', 'border', 'borderTop', 'borderRight', 'borderBottom', 'borderLeft', 'outline', 'transition', 'transitionDuration', 'transitionDelay', 'transitionTimingFunction', 'transform', 'flex', 'gridTemplateColumns', 'gridTemplateRows', 'gridColumn', 'gridRow', 'aspectRatio', 'objectPosition', 'textDecoration', 'background', 'scrollbarColor'],
};
const enumProperties = {
  display: ['none', 'block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid', 'inline-grid', 'contents'],
  boxSizing: ['border-box', 'content-box'], fontStyle: ['normal', 'italic', 'oblique'],
  textAlign: ['left', 'right', 'center', 'start', 'end', 'justify'],
  textOverflow: ['clip', 'ellipsis'],
  textTransform: ['none', 'uppercase', 'lowercase', 'capitalize'],
  whiteSpace: ['normal', 'nowrap', 'pre', 'pre-wrap', 'pre-line', 'break-spaces'],
  wordBreak: ['normal', 'break-all', 'keep-all', 'break-word'], overflowWrap: ['normal', 'break-word', 'anywhere'],
  borderStyle: ['none', 'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'],
  borderCollapse: ['collapse','separate'],
  outlineStyle: ['none', 'solid', 'dashed', 'dotted', 'double'],
  flexDirection: ['row', 'column', 'row-reverse', 'column-reverse'], flexWrap: ['nowrap', 'wrap', 'wrap-reverse'],
  justifyContent: ['normal', 'start', 'end', 'flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly', 'stretch'],
  alignItems: ['normal', 'start', 'end', 'flex-start', 'flex-end', 'center', 'stretch', 'baseline'],
  alignSelf: ['auto', 'normal', 'start', 'end', 'flex-start', 'flex-end', 'center', 'stretch', 'baseline'],
  cursor: ['auto', 'default', 'pointer', 'text', 'not-allowed', 'wait', 'progress', 'grab', 'grabbing', 'help', 'crosshair', 'move', 'cell'],
  overflow: ['visible', 'hidden', 'clip', 'scroll', 'auto'], overflowX: ['visible', 'hidden', 'clip', 'scroll', 'auto'], overflowY: ['visible', 'hidden', 'clip', 'scroll', 'auto'],
  overscrollBehavior: ['auto', 'contain', 'none'], scrollbarWidth: ['auto', 'thin', 'none'], scrollbarGutter: ['auto', 'stable', 'stable both-edges'],
  position: ['static', 'relative', 'absolute', 'fixed', 'sticky'], userSelect: ['auto', 'none', 'text', 'all'],
  pointerEvents: ['auto', 'none'], appearance: ['none', 'auto', 'textfield'], fontVariantNumeric: ['normal', 'tabular-nums'],
  verticalAlign: ['baseline', 'top', 'middle', 'bottom', 'text-top', 'text-bottom', 'sub', 'super'],
  objectFit: ['fill', 'contain', 'cover', 'none', 'scale-down'], resize: ['none', 'both', 'horizontal', 'vertical'],
  listStyleType: ['none', 'disc', 'circle', 'square', 'decimal'],
};
const cssProperties = new Map();
for (const [group, properties] of Object.entries(propertyGroups)) for (const property of properties) cssProperties.set(property, group);
for (const property of Object.keys(enumProperties)) cssProperties.set(property, 'enum');
const globalCSSValues = new Set(['inherit', 'initial', 'unset', 'revert', 'revert-layer']);
const lengthPattern = /^-?(?:\d*\.)?\d+(?:px|rem|em|ch|ex|vw|vh|vmin|vmax|svh|dvh|lvh|svw|dvw|lvw|%|pt|pc|in|cm|mm)$/;
const lengthValue = value => value === '0' || lengthPattern.test(value);
const numberPattern = /^-?(?:\d*\.)?\d+$/;
const namedColors = new Set('aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgrey darkgreen darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray grey green greenyellow honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgrey lightgreen lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen transparent currentcolor'.split(' '));
const colorValue = value => namedColors.has(value.toLowerCase()) || /^(?:#[\da-f]{3}|#[\da-f]{4}|#[\da-f]{6}|#[\da-f]{8}|transparent|currentColor|black|white)$/i.test(value)
  || /^(?:rgb|rgba|hsl|hsla|oklch|oklab|lab|lch|color)\([\da-z.,%+\- /]+\)$/i.test(value);

function safeCSS(value) {
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value !== 'string' || !value.trim() || value.length > 2000) return false;
  if (/[;{}@<>\\\u0000-\u001f\u007f]/.test(value) || /\/\*|\*\/|(?:url|image-set|-webkit-image-set|image|src|paint)\s*\(|expression\s*\(|(?:java|vb)script\s*:/i.test(value)) return false;
  let quote = null;
  let depth = 0;
  for (const character of value) {
    if (quote) { if (character === quote) quote = null; continue; }
    if (character === '"' || character === "'") { quote = character; continue; }
    if (character === '(') depth++;
    if (character === ')' && --depth < 0) return false;
  }
  return quote === null && depth === 0;
}
function tokenValueValid(type, value) {
  if (!safeCSS(value)) return false;
  const string = String(value).trim();
  switch (type) {
    case 'color': return typeof value === 'string' && colorValue(string);
    case 'dimension': return (typeof value === 'number' && value === 0) || (typeof value === 'string' && lengthValue(string));
    case 'fontFamily': return typeof value === 'string' && /^[a-zA-Z0-9\s,'"-]+$/.test(string);
    case 'fontWeight': return (typeof value === 'number' && value >= 1 && value <= 1000) || /^(?:normal|bold|bolder|lighter|[1-9]\d{0,2}|1000)$/.test(string);
    case 'number': return typeof value === 'number' && Number.isFinite(value);
    case 'duration': return typeof value === 'string' && /^(?:\d*\.)?\d+(?:ms|s)$/.test(string);
    case 'shadow': return typeof value === 'string' && (string === 'none' || /(?:^|\s)-?(?:\d*\.)?\d+(?:px|rem|em|\b)/.test(string));
    case 'gradient': return typeof value === 'string' && parseGradient(string)!==null;
    default: return false;
  }
}
function cssValueValid(property, value) {
  if (!safeCSS(value)) return false;
  const string = String(value).trim();
  if (globalCSSValues.has(string)) return true;
  if (/^(?:calc|min|max|clamp|var)\(/.test(string)) return true;
  const group = cssProperties.get(property);
  if (group === 'color') return colorValue(string) || string === 'none';
  if (group === 'number') return numberPattern.test(string) && (property !== 'opacity' || (Number(string) >= 0 && Number(string) <= 1));
  if (group === 'length') return lengthValue(string) || ['auto', 'none', 'min-content', 'max-content', 'fit-content', 'thin', 'medium', 'thick', 'normal'].includes(string);
  if (group === 'lengths') return string.split(/\s+/).length <= 4 && string.split(/\s+/).every(part => lengthValue(part) || ['auto', 'normal'].includes(part));
  if (group === 'enum') return enumProperties[property].includes(string);
  if (property === 'fontFamily') return tokenValueValid('fontFamily', value);
  if (property === 'fontWeight') return tokenValueValid('fontWeight', value);
  if (property === 'lineHeight') return (numberPattern.test(string) && Number(string) >= 0) || lengthValue(string) || string === 'normal';
  if (property === 'boxShadow') return tokenValueValid('shadow', value);
  if (property === 'transitionDuration' || property === 'transitionDelay') return string.split(',').every(part => tokenValueValid('duration', part.trim()));
  return group === 'generic';
}
function preflight(value, errors, path = 'package', ancestors = new Set(), depth = 0) {
  if (depth > 40) { errors.push(`${path}: exceeds maximum nesting depth.`); return; }
  if (['function', 'symbol', 'bigint'].includes(typeof value)) { errors.push(path + ': unsupported non-JSON value.'); return; }
  if (value === null || typeof value !== 'object') return;
  if (ancestors.has(value)) { errors.push(`${path}: contains a circular object.`); return; }
  if (!Array.isArray(value) && !record(value)) { errors.push(`${path}: must be a plain object.`); return; }
  ancestors.add(value);
  for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(value))) {
    if (Array.isArray(value) && key === 'length') continue;
    if (reservedKeys.has(key)) errors.push(`${path}.${key}: reserved key is not allowed.`);
    if (!own(descriptor, 'value')) errors.push(`${path}.${key}: accessors are not allowed.`);
    else preflight(descriptor.value, errors, `${path}.${key}`, ancestors, depth + 1);
  }
  ancestors.delete(value);
}
function allowedKeys(value, keys, path, errors) {
  for (const key of Object.keys(value)) if (!keys.includes(key)) errors.push(`${path}.${key}: unknown property.`);
}
function textField(value, path, errors, required = true) {
  if (value === undefined && !required) return;
  if (typeof value !== 'string' || !value.trim() || value.length > 10000) errors.push(`${path}: must be a non-empty string.`);
}
function resolveUnchecked(tokens, errors) {
  const resolved = Object.create(null);
  const visiting = new Set();
  function resolve(id) {
    if (own(resolved, id)) return resolved[id];
    if (!own(tokens, id)) { errors.push(`tokens.${id}: reference does not exist.`); return undefined; }
    if (visiting.has(id)) { errors.push(`tokens.${id}: circular token alias (${[...visiting, id].join(' -> ')}).`); return undefined; }
    if (visiting.size >= 100) { errors.push('tokens.' + id + ': alias chain exceeds maximum depth 100.'); return undefined; }
    const token = tokens[id];
    if (!record(token)) return undefined;
    visiting.add(id);
    const alias = exactReference(token.$value);
    let value = token.$value;
    if (alias) {
      if (own(tokens, alias) && record(tokens[alias]) && token.$type !== tokens[alias].$type) errors.push(`tokens.${id}: alias ${alias} has type ${tokens[alias].$type}, expected ${token.$type}.`);
      value = resolve(alias);
    } else if(token.$type==='gradient'&&typeof value==='string') {
      value=value.replace(new RegExp(TOKEN_REFERENCE_PATTERN.source,'g'),(_,dependency)=>{
        if(tokens[dependency]?.$type!=='color')errors.push(`tokens.${id}: gradient stop ${dependency} must reference a color token.`);
        return String(resolve(dependency)??'');
      });
      value=parseGradient(value)?.css??value;
    }
    visiting.delete(id);
    resolved[id] = value;
    return value;
  }
  for (const id of Object.keys(tokens)) resolve(id);
  return resolved;
}
function validateStyles(styles, path, tokens, resolved, errors) {
  if (!record(styles)) { errors.push(`${path}: must be an object of CSS properties.`); return; }
  for (const [property, value] of Object.entries(styles)) {
    if (!cssProperties.has(property)) { errors.push(`${path}.${property}: unsupported CSS property (use camelCase).`); continue; }
    const refs = reference(value);
    let actual = value;
    if (typeof value === 'string') actual = value.replace(new RegExp(TOKEN_REFERENCE_PATTERN.source, 'g'), (_, id) => {
      if (!own(tokens, id)) errors.push(`${path}.${property}: token ${id} does not exist.`);
      return own(resolved, id) && resolved[id] !== undefined ? String(resolved[id]) : '';
    });
    if (typeof value === 'string' && /[{}]/.test(value.replace(new RegExp(TOKEN_REFERENCE_PATTERN.source, 'g'), ''))) errors.push(`${path}.${property}: malformed token reference or unsafe CSS.`);
    if (!refs.some(id => !own(tokens, id)) && !cssValueValid(property, actual)) errors.push(`${path}.${property}: invalid or unsafe CSS value.`);
  }
}
function validateTreatment(treatment, path, parts, tokens, resolved, errors, requireDescription = true) {
  if (!record(treatment)) { errors.push(`${path}: must be an object.`); return; }
  allowedKeys(treatment, ['description', 'styles', 'parts'], path, errors);
  textField(treatment.description, `${path}.description`, errors, requireDescription);
  if (!own(treatment, 'styles') && !own(treatment, 'parts')) errors.push(`${path}: needs styles or part styles.`);
  if (own(treatment, 'styles')) validateStyles(treatment.styles, `${path}.styles`, tokens, resolved, errors);
  if (own(treatment, 'parts')) {
    if (!record(treatment.parts)) errors.push(`${path}.parts: must be an object.`);
    else for (const [partId, part] of Object.entries(treatment.parts)) {
      if (!own(parts, partId)) errors.push(`${path}.parts.${partId}: component part does not exist.`);
      if (!record(part)) { errors.push(`${path}.parts.${partId}: must be an object.`); continue; }
      allowedKeys(part, ['styles'], `${path}.parts.${partId}`, errors);
      validateStyles(part.styles, `${path}.parts.${partId}.styles`, tokens, resolved, errors);
    }
  }
}
const previewTags = new Set(['a', 'nav', 'figure', 'figcaption', 'img', 'div', 'span', 'p', 'strong', 'label', 'button', 'input', 'select', 'optgroup', 'option', 'textarea', 'h2', 'h3', 'hr', 'section', 'article', 'header', 'footer', 'dl', 'dt', 'dd', 'ul', 'ol', 'li', 'fieldset', 'legend', 'output', 'details', 'summary', 'table', 'caption', 'thead', 'tbody', 'tr', 'th', 'td', 'progress']);
const previewInputTypes = new Set(['button', 'submit', 'reset', 'text', 'email', 'number', 'password', 'checkbox', 'radio', 'search', 'tel', 'url', 'range', 'color', 'date', 'time', 'file']);
function validatePreview(tree, component, path, errors, catalog) {
  let count = 0;
  function visit(node, nodePath, depth) {
    if (++count > 200) { if (count === 201) errors.push(nodePath + ': preview exceeds 200 nodes.'); return; }
    if (depth > 12) { errors.push(nodePath + ': preview exceeds maximum depth 12.'); return; }
    if (!record(node)) { errors.push(nodePath + ': must be a preview node.'); return; }
    if (own(node,'component')) {
      allowedKeys(node,['component'],nodePath,errors);
      if (depth===0) errors.push(nodePath+': preview root must use its own root part.');
      if (typeof node.component!=='string'||!own(catalog,node.component)) errors.push(nodePath+'.component: shared component does not exist.');
      else if (!component.composes?.includes(node.component)) errors.push(nodePath+'.component: must be declared in composes.');
      return;
    }
    allowedKeys(node, ['tag', 'part', 'text', 'children', 'attrs', 'variant','iconName'], nodePath, errors);
    if(own(node,'iconName')&&(node.tag!=='span'||!ICON_NAMES.includes(node.iconName)||own(node,'text')||own(node,'children')))errors.push(nodePath+'.iconName: expected a trusted icon name on an empty span.');
    if (!previewTags.has(node.tag)) errors.push(nodePath + '.tag: unsupported preview tag.');
    if (depth === 0 && node.part !== 'root') errors.push(nodePath + '.part: preview root must use root part.');
    if (own(node, 'part') && (typeof node.part !== 'string' || !own(component.parts, node.part))) errors.push(nodePath + '.part: component part does not exist.');
    if (own(node, 'variant') && (typeof node.variant !== 'string' || !record(component.variants) || !own(component.variants, node.variant))) errors.push(nodePath + '.variant: component variant does not exist.');
    if (own(node, 'text') && (typeof node.text !== 'string' || node.text.length > 2000)) errors.push(nodePath + '.text: expected a string of at most 2000 characters.');
    if (own(node, 'attrs')) {
      if (!record(node.attrs)) errors.push(nodePath + '.attrs: must be an object.');
      else for (const [attribute, value] of Object.entries(node.attrs)) {
        if (['disabled', 'checked', 'open', 'hidden', 'required', 'readonly', 'multiple'].includes(attribute)) {
          if (typeof value !== 'boolean') errors.push(nodePath + '.attrs.' + attribute + ': must be boolean.');
        } else if (attribute === 'tabindex') {
          if (!['0','-1'].includes(value)) errors.push(nodePath + '.attrs.tabindex: must be 0 or -1.');
        } else if (['href', 'src', 'alt', 'id', 'for', 'name', 'label', 'type', 'value', 'placeholder', 'role', 'min', 'max', 'step', 'rows', 'cols', 'inputmode', 'minlength', 'maxlength', 'autocomplete', 'accept', 'scope', 'colspan', 'rowspan'].includes(attribute)||/^aria-[a-z-]+$/.test(attribute)||/^data-[a-z-]+$/.test(attribute)) {
          if (typeof value !== 'string' || value.length > 1000) errors.push(nodePath + '.attrs.' + attribute + ': expected a string of at most 1000 characters.');
          else if (attribute === 'type' && !previewInputTypes.has(value)) errors.push(nodePath + '.attrs.type: unsupported input type.');
        } else errors.push(nodePath + '.attrs.' + attribute + ': unsupported preview attribute.');
      }
    }
    if (['input', 'hr', 'img'].includes(node.tag) && (own(node, 'children') || own(node, 'text'))) errors.push(nodePath + ': void preview tag cannot have text or children.');
    if (own(node, 'children')) {
      if (!Array.isArray(node.children)) errors.push(nodePath + '.children: must be an array.');
      else node.children.forEach((child, index) => visit(child, nodePath + '.children.' + index, depth + 1));
    }
  }
  visit(tree, path, 0);
}


const brandMimeTypes = Object.freeze({
  'image/svg+xml': {extensions:['svg']}, 'image/png': {extensions:['png']},
  'image/jpeg': {extensions:['jpg','jpeg']}, 'image/webp': {extensions:['webp']},
  'font/ttf': {extensions:['ttf'],format:'truetype'}, 'font/woff': {extensions:['woff'],format:'woff'},
  'font/woff2': {extensions:['woff2'],format:'woff2'}, 'text/plain': {extensions:['txt']}
});
const maxAssetBytes = 256 * 1024;
const maxBrandBytes = 512 * 1024;
const svgTags = new Set(['svg','g','defs','clipPath','path','rect','circle','ellipse','line','polyline','polygon','use','title','desc','linearGradient','radialGradient','stop','mask']);
const svgAttributes = new Set(['xmlns','xmlns:xlink','xml:space','id','version','width','height','viewBox','preserveAspectRatio','x','y','x1','x2','y1','y2','cx','cy','r','rx','ry','d','points','transform','fill','fill-opacity','fill-rule','stroke','stroke-width','stroke-opacity','stroke-linecap','stroke-linejoin','stroke-miterlimit','stroke-dasharray','stroke-dashoffset','opacity','clip-path','clip-rule','clipPathUnits','mask','maskUnits','maskContentUnits','style','href','xlink:href','offset','stop-color','stop-opacity','gradientUnits','gradientTransform','spreadMethod','fx','fy','fr']);
const svgStyleProperties = new Set(['fill','fill-opacity','fill-rule','stroke','stroke-width','stroke-opacity','stroke-linecap','stroke-linejoin','stroke-miterlimit','stroke-dasharray','stroke-dashoffset','opacity','clip-path','clip-rule','mask','stop-color','stop-opacity']);
function decodeAssetData(data) {
  if (typeof data !== 'string' || !data.length || data.length > Math.ceil(maxAssetBytes / 3) * 4
    || data.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(data)) return null;
  try {
    const binary = atob(data);
    if (btoa(binary) !== data || binary.length > maxAssetBytes) return null;
    return Uint8Array.from(binary, character => character.charCodeAt(0));
  } catch { return null; }
}
function utf8Text(bytes) {
  try { return new TextDecoder('utf-8', {fatal:true}).decode(bytes); } catch { return null; }
}
function safeSVGValue(value) {
  if (/[&<>\\\u0000-\u001f\u007f]/.test(value) || /@|(?:java|vb)script\s*:|expression\s*\(/i.test(value)) return false;
  // Only a local fragment may occur in a resource-valued presentation attribute.
  const withoutLocalURLs = value.replace(/url\(\s*(['"]?)#[A-Za-z_][A-Za-z0-9_.:-]*\1\s*\)/gi, '');
  return !/url\s*\(|(?:https?|file|data)\s*:|\/\*|\*\//i.test(withoutLocalURLs);
}
function passiveSVG(text) {
  if (typeof text !== 'string') return false;
  text=text.replace(/^\s*<\?xml\s+version=(["'])1\.[01]\1(?:\s+encoding=(["'])UTF-8\2)?(?:\s+standalone=(["'])(?:yes|no)\3)?\s*\?>/i, '')
    .replace(/<!--(?:[^-]|-(?!-))*-->/g, '');
  if (!text.trim() || /<!|<\?/.test(text) || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text)) return false;
  const stack = [];
  let position = 0, rootSeen = false, rootClosed = false;
  const tags = /<([^<>]*)>/g;
  for (const match of text.matchAll(tags)) {
    const between = text.slice(position, match.index);
    if (/[<>&]/.test(between) || (!stack.length && between.trim())) return false;
    position = match.index + match[0].length;
    const content = match[1];
    const closing = /^\/([A-Za-z][A-Za-z0-9]*)\s*$/.exec(content);
    if (closing) {
      if (stack.pop() !== closing[1]) return false;
      if (!stack.length) rootClosed = true;
      continue;
    }
    const opening = /^([A-Za-z][A-Za-z0-9]*)(\s[\s\S]*?)?\s*(\/)?$/.exec(content);
    if (!opening || !svgTags.has(opening[1]) || rootClosed) return false;
    const tag = opening[1];
    if (!rootSeen) { if (tag !== 'svg') return false; rootSeen = true; }
    else if (!stack.length || tag === 'svg') return false;
    let attributes = opening[2] || '';
    const seen = new Set();
    while (attributes.trim()) {
      const attribute = /^\s+([A-Za-z_][A-Za-z0-9_:.-]*)\s*=\s*(?:"([^"<>]*)"|'([^'<>]*)')/.exec(attributes);
      if (!attribute) return false;
      const name = attribute[1], value = attribute[2] ?? attribute[3];
      if (!svgAttributes.has(name) || seen.has(name) || (!['xmlns','xmlns:xlink'].includes(name) && !safeSVGValue(value))) return false;
      seen.add(name);
      if (name === 'xmlns' && value !== 'http://www.w3.org/2000/svg') return false;
      if (name === 'xmlns:xlink' && value !== 'http://www.w3.org/1999/xlink') return false;
      if (['href','xlink:href'].includes(name) && !/^#[A-Za-z_][A-Za-z0-9_.:-]*$/.test(value)) return false;
      if (name === 'style') {
        for (const declaration of value.split(';').filter(part => part.trim())) {
          const style = /^\s*([a-z-]+)\s*:\s*(.+?)\s*$/.exec(declaration);
          if (!style || !svgStyleProperties.has(style[1]) || !safeSVGValue(style[2])) return false;
        }
      }
      attributes = attributes.slice(attribute[0].length);
    }
    if (!opening[3]) stack.push(tag);
    else if (!stack.length) rootClosed = true;
    if (stack.length > 100) return false;
  }
  return rootSeen && rootClosed && stack.length === 0 && !text.slice(position).trim();
}
function assetContentValid(mimeType, bytes) {
  const prefix = (...values) => values.every((value,index) => bytes[index] === value);
  switch (mimeType) {
    case 'image/svg+xml': return passiveSVG(utf8Text(bytes));
    case 'image/png': return bytes.length >= 8 && prefix(137,80,78,71,13,10,26,10);
    case 'image/jpeg': return bytes.length >= 4 && prefix(255,216,255) && bytes.at(-2) === 255 && bytes.at(-1) === 217;
    case 'image/webp': return bytes.length >= 12 && prefix(82,73,70,70) && [87,69,66,80].every((value,index) => bytes[index+8] === value);
    case 'font/ttf': return bytes.length >= 12 && (prefix(0,1,0,0) || prefix(116,114,117,101));
    case 'font/woff': return bytes.length >= 44 && prefix(119,79,70,70);
    case 'font/woff2': return bytes.length >= 48 && prefix(119,79,70,50);
    case 'text/plain': { const text=utf8Text(bytes); return text !== null && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text); }
    default: return false;
  }
}
function fontWeightValid(value) {
  if (typeof value === 'number') return Number.isInteger(value) && value >= 100 && value <= 900;
  if (typeof value !== 'string' || !/^(?:[1-8]\d{2}|900)(?: (?:[1-8]\d{2}|900))?$/.test(value)) return false;
  const weights = value.split(' ').map(Number);
  return weights.length === 1 || weights[0] < weights[1];
}
function validateBrand(brand, pack, errors) {
  if (!record(brand)) { errors.push('brand: must be an object.'); return; }
  allowedKeys(brand, ['name','summary','principles','sections','logos','assets','sources'], 'brand', errors);
  textField(brand.name,'brand.name',errors);
  textField(brand.summary,'brand.summary',errors);
  const limits = {principles:30,sections:60,logos:30,assets:30,sources:20};
  for (const [key, maximum] of Object.entries(limits)) {
    if (!Array.isArray(brand[key])) errors.push('brand.' + key + ': must be an array.');
    else if (brand[key].length > maximum) errors.push('brand.' + key + ': maximum of ' + maximum + ' entries exceeded.');
  }
  const identified = (entries,key,keys,visit) => {
    if (!Array.isArray(entries)) return;
    const ids = new Set();
    entries.forEach((entry,index) => {
      const path='brand.' + key + '.' + index;
      if (!record(entry)) { errors.push(path + ': must be an object.'); return; }
      allowedKeys(entry,keys,path,errors);
      if (typeof entry.id !== 'string' || !localIdPattern.test(entry.id)) errors.push(path + '.id: invalid local ID.');
      else if (ids.has(entry.id)) errors.push(path + '.id: duplicate ID.');
      ids.add(entry.id);
      visit(entry,path);
    });
  };
  const strings = (values,path,referenced) => {
    if (!Array.isArray(values)) { errors.push(path + ': must be an array.'); return; }
    values.forEach((value,index) => {
      textField(value,path + '.' + index,errors);
      if (referenced && (typeof value !== 'string' || !own(referenced,value))) errors.push(path + '.' + index + ': reference does not exist.');
    });
  };
  identified(brand.principles,'principles',['id','title','description'],(entry,path) => {
    textField(entry.title,path + '.title',errors); textField(entry.description,path + '.description',errors);
  });
  identified(brand.sections,'sections',['id','title','description','tokens','components','dos','donts'],(entry,path) => {
    textField(entry.title,path + '.title',errors); textField(entry.description,path + '.description',errors);
    strings(entry.tokens,path + '.tokens',pack.tokens); strings(entry.components,path + '.components',pack.components);
    strings(entry.dos,path + '.dos'); strings(entry.donts,path + '.donts');
  });
  const assets = new Map();
  const assetFileNames = new Set();
  let assetBytes=0;
  identified(brand.assets,'assets',['id','name','fileName','mimeType','data','description','font'],(entry,path) => {
    textField(entry.name,path + '.name',errors); textField(entry.description,path + '.description',errors);
    if (typeof entry.id === 'string') assets.set(entry.id,entry);
    const mime = typeof entry.mimeType === 'string' && own(brandMimeTypes,entry.mimeType) ? brandMimeTypes[entry.mimeType] : undefined;
    if (!mime) errors.push(path + '.mimeType: unsupported asset type.');
    if (typeof entry.fileName !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,119}$/.test(entry.fileName)
      || !mime?.extensions.includes(entry.fileName.split('.').at(-1).toLowerCase())) errors.push(path + '.fileName: expected a basename with a matching extension.');
    if (typeof entry.fileName === 'string') {
      const fileName=entry.fileName.toLowerCase();
      if (assetFileNames.has(fileName)) errors.push(path + '.fileName: duplicate filename (case insensitive).');
      assetFileNames.add(fileName);
    }
    const bytes=decodeAssetData(entry.data);
    if (!bytes) errors.push(path + '.data: expected canonical base64 containing 1–262144 bytes.');
    else {
      assetBytes += bytes.length;
      if (mime && !assetContentValid(entry.mimeType,bytes)) errors.push(path + '.data: invalid or unsafe asset content.');
    }
    if (mime?.format && !own(entry,'font')) errors.push(path + '.font: required for font assets.');
    if (own(entry,'font')) {
      if (!mime?.format) errors.push(path + '.font: only font assets may have font metadata.');
      if (!record(entry.font)) errors.push(path + '.font: must be an object.');
      else {
        allowedKeys(entry.font,['family','style','weight'],path + '.font',errors);
        if (typeof entry.font.family !== 'string' || !/^[A-Za-z][A-Za-z0-9 -]{0,79}$/.test(entry.font.family) || entry.font.family.trim() !== entry.font.family) errors.push(path + '.font.family: expected a safe font family name.');
        if (!['normal','italic'].includes(entry.font.style)) errors.push(path + '.font.style: expected normal or italic.');
        if (!fontWeightValid(entry.font.weight)) errors.push(path + '.font.weight: expected 100–900 or an increasing weight interval.');
      }
    }
  });
  if (assetBytes > maxBrandBytes) errors.push('brand.assets: maximum combined size of 524288 bytes exceeded.');
  identified(brand.logos,'logos',['id','name','asset','usage','background','foreground'],(entry,path) => {
    textField(entry.name,path + '.name',errors); textField(entry.usage,path + '.usage',errors);
    const asset=assets.get(entry.asset);
    if (!asset || typeof asset.mimeType !== 'string' || !asset.mimeType.startsWith('image/')) errors.push(path + '.asset: must reference an existing image asset.');
    for (const key of ['background','foreground']) if (own(entry,key)) {
      if (typeof entry[key] !== 'string' || !own(pack.tokens,entry[key]) || pack.tokens[entry[key]]?.$type !== 'color') errors.push(path + '.' + key + ': must reference an existing color token.');
    }
  });
  if (Array.isArray(brand.sources)) brand.sources.forEach((entry,index) => {
    const path='brand.sources.' + index;
    if (!record(entry)) { errors.push(path + ': must be an object.'); return; }
    allowedKeys(entry,['title','location'],path,errors); textField(entry.title,path + '.title',errors); textField(entry.location,path + '.location',errors);
  });
}
/** Build a data URL for a validated embedded asset; use SVG URLs in img elements, never inline markup. */
export function brandAssetDataURL(asset) {
  if (!record(asset) || typeof asset.mimeType !== 'string' || !own(brandMimeTypes,asset.mimeType)) throw new Error('Invalid brand asset.');
  const bytes=decodeAssetData(asset.data);
  if (!bytes || !assetContentValid(asset.mimeType,bytes)) throw new Error('Invalid or unsafe brand asset data.');
  return 'data:' + asset.mimeType + ';base64,' + asset.data;
}

/** Validate a complete package, including references, composition, and CSS safety. */
function validateLegacyPackage(pack) {
  const errors = [];
  preflight(pack, errors);
  if (errors.length) return {valid: false, errors};
  if (!record(pack)) return {valid: false, errors: ['package: must be an object.']};
  allowedKeys(pack, ['schemaVersion', 'id', 'name', 'description', 'tokens', 'components', 'history', 'brand', 'graphics'], 'package', errors);
  if (own(pack,'graphics')) validateGraphics(pack.graphics,errors);
  if (pack.schemaVersion !== 1) errors.push('schemaVersion: expected 1.');
  if (typeof pack.id !== 'string' || !/^[a-z][a-z0-9-]*$/.test(pack.id)) errors.push('id: must be a lowercase slug.');
  textField(pack.name, 'name', errors);
  textField(pack.description, 'description', errors);
  if (!record(pack.tokens)) errors.push('tokens: must be an object.');
  if (!record(pack.components)) errors.push('components: must be an object.');
  if (!record(pack.tokens) || !record(pack.components)) return {valid: false, errors};
  if (Object.keys(pack.tokens).length > 10000) errors.push('tokens: maximum of 10000 tokens exceeded.');
  if (Object.keys(pack.components).length > 1000) errors.push('components: maximum of 1000 components exceeded.');
  const variableIds = new Map();
  for (const [id, token] of Object.entries(pack.tokens)) {
    const path = `tokens.${id}`;
    if (!idPattern.test(id)) errors.push(`${path}: invalid token name.`);
    const variable = cssVariableName(id);
    if (variableIds.has(variable)) errors.push(`${path}: CSS variable collides with ${variableIds.get(variable)}.`);
    variableIds.set(variable, id);
    if (!record(token)) { errors.push(`${path}: must be an object.`); continue; }
    allowedKeys(token, ['$type', '$value', 'description'], path, errors);
    if (!TOKEN_TYPES.includes(token.$type)) errors.push(`${path}.$type: unsupported type.`);
    textField(token.description, `${path}.description`, errors);
    if (!own(token, '$value')) errors.push(`${path}.$value: is required.`);
    else if (token.$type!=='gradient' && !exactReference(token.$value) && !tokenValueValid(token.$type, token.$value)) errors.push(`${path}.$value: invalid ${token.$type} value; token aliases must be a single {token.id}.`);
  }
  for (const [id, type] of Object.entries(REQUIRED_TOKENS)) {
    if (!own(pack.tokens, id)) errors.push(`tokens.${id}: required foundation token is missing.`);
    else if (pack.tokens[id]?.$type !== type) errors.push(`tokens.${id}: foundation token must have type ${type}.`);
  }
  const resolved = resolveUnchecked(pack.tokens, errors);
  for(const [id,token]of Object.entries(pack.tokens))if(token?.$type==='gradient'&&!tokenValueValid('gradient',resolved[id]))errors.push(`tokens.${id}.$value: expected a linear/radial gradient with 2–8 opaque color stops, ordered from 0% to 100%.`);
  for (const [id, component] of Object.entries(pack.components)) {
    const path = `components.${id}`;
    if (!localIdPattern.test(id)) errors.push(`${path}: invalid component name.`);
    if (!record(component)) { errors.push(`${path}: must be an object.`); continue; }
    allowedKeys(component, ['name', 'description', 'usage', 'composes', 'parts', 'variants', 'states', 'preview'], path, errors);
    for (const key of ['name', 'description', 'usage']) textField(component[key], `${path}.${key}`, errors);
    if (!Array.isArray(component.composes)) errors.push(`${path}.composes: must be an array of component IDs.`);
    else for (const composed of component.composes) {
      if (typeof composed !== 'string' || !own(pack.components, composed)) errors.push(`${path}.composes: component ${String(composed)} does not exist.`);
    }
    if (Array.isArray(component.composes) && new Set(component.composes).size !== component.composes.length) errors.push(path + '.composes: duplicate component IDs are not allowed.');
    if (!record(component.parts)) { errors.push(`${path}.parts: must be an object.`); continue; }
    if (!own(component.parts, 'root')) errors.push(`${path}.parts.root: is required.`);
    const selectors = new Set();
    for (const [partId, part] of Object.entries(component.parts)) {
      const partPath = `${path}.parts.${partId}`;
      if (!localIdPattern.test(partId)) errors.push(`${partPath}: invalid part name.`);
      if (!record(part)) { errors.push(`${partPath}: must be an object.`); continue; }
      allowedKeys(part, ['selector', 'styles'], partPath, errors);
      if (typeof part.selector !== 'string' || !selectorPattern.test(part.selector)) errors.push(`${partPath}.selector: expected one .ds-* class selector.`);
      if (selectors.has(part.selector)) errors.push(`${partPath}.selector: part selector is duplicated.`);
      selectors.add(part.selector);
      validateStyles(part.styles, `${partPath}.styles`, pack.tokens, resolved, errors);
    }
    if (own(component, 'preview')) validatePreview(component.preview, component, path + '.preview', errors, pack.components);
    const contract = COMPONENT_CONTRACTS[id];
    if (contract) for (const [partId, selector] of Object.entries(contract.parts)) {
      if (!own(component.parts, partId)) errors.push(`${path}.parts.${partId}: required component part is missing.`);
      else if (component.parts[partId]?.selector !== selector) errors.push(`${path}.parts.${partId}.selector: expected ${selector}.`);
    }
    for (const section of ['variants', 'states']) {
      if (!record(component[section])) { errors.push(`${path}.${section}: must be an object.`); continue; }
      for (const [treatmentId, treatment] of Object.entries(component[section])) {
        if (!localIdPattern.test(treatmentId)) errors.push(`${path}.${section}.${treatmentId}: invalid name.`);
        validateTreatment(treatment, `${path}.${section}.${treatmentId}`, component.parts, pack.tokens, resolved, errors, section === 'variants');
      }
      for (const required of contract?.[section] ?? []) if (!own(component[section], required)) errors.push(`${path}.${section}.${required}: required foundation ${section === 'variants' ? 'variant' : 'state'} is missing.`);
    }
  }
  for (const id of Object.keys(COMPONENT_CONTRACTS)) if (!own(pack.components, id)) errors.push(`components.${id}: required foundation component is missing.`);
  const visited = new Set();
  const visiting = new Set();
  function visit(id) {
    if (visiting.has(id)) { errors.push(`components.${id}: circular composition (${[...visiting, id].join(' -> ')}).`); return; }
    if (visited.has(id) || !own(pack.components, id)) return;
    if (visiting.size >= 100) { errors.push('components.' + id + ': composition exceeds maximum depth 100.'); return; }
    visiting.add(id);
    const composed = pack.components[id]?.composes;
    if (Array.isArray(composed)) for (const child of composed) if (typeof child === 'string') visit(child);
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of Object.keys(pack.components)) visit(id);
  if (!Array.isArray(pack.history)) errors.push('history: must be an array.');
  else for (const [index, entry] of pack.history.entries()) {
    if (!record(entry)) { errors.push(`history.${index}: must be an object.`); continue; }
    allowedKeys(entry, ['date', 'note'], `history.${index}`, errors);
    if (typeof entry.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date) || Number.isNaN(Date.parse(entry.date)) || new Date(entry.date).toISOString().slice(0, 10) !== entry.date) errors.push(`history.${index}.date: expected a valid YYYY-MM-DD date.`);
    textField(entry.note, `history.${index}.note`, errors);
  }
  if (own(pack, 'brand')) validateBrand(pack.brand, pack, errors);
  return {valid: errors.length === 0, errors: [...new Set(errors)]};
}
function assertValid(pack) {
  const result = validatePackage(pack);
  if (!result.valid) throw new Error(`Invalid design package:\n${result.errors.join('\n')}`);
}
/** Resolve aliases to literal token values. Input must be a complete valid package. */
export function resolveTokens(pack) {
  assertValid(pack);
  return {...resolveUnchecked(effectivePackage(pack).tokens, [])};
}
const cssProperty = property => property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
const cssValue = value => String(value).replace(new RegExp(TOKEN_REFERENCE_PATTERN.source, 'g'), (_, id) => `var(${cssVariableName(id)})`);
const nestedControl = component => component.parts.control?.selector !== undefined
  && component.parts.control.selector !== component.parts.root.selector;
const stateSelector = (id, component) => ({
  hover: ':hover', focus: component.parts.viewport ? ':has(> '+component.parts.viewport.selector+':focus-visible)' : nestedControl(component) ? ':focus-within' : ':focus-visible',
  active: ':active', disabled: ':is(:disabled, [aria-disabled="true"], [data-state="disabled"])',
  checked: nestedControl(component)
    ? `:is([aria-checked="true"], :has(${component.parts.control.selector}:checked))`
    : ':is(:checked, [aria-checked="true"])', readOnly: nestedControl(component)?':has('+component.parts.control.selector+'[readonly])':'[readonly]',
  invalid: ':is(:user-invalid, [aria-invalid="true"])', selected: '[aria-selected="true"]',
  current: ':is([aria-current]:not([aria-current="false"]))', expanded: '[aria-expanded="true"]', loading: '[aria-busy="true"]',
}[id] ?? `[data-state="${id}"]`);
function fontFaceRules(pack) {
  return (pack.brand?.assets ?? []).filter(asset => asset.font).map(asset => [
    '@font-face {',
    '  font-family: "' + asset.font.family + '";',
    '  font-style: ' + asset.font.style + ';',
    '  font-weight: ' + asset.font.weight + ';',
    '  font-display: swap;',
    '  src: url("' + brandAssetDataURL(asset) + '") format("' + brandMimeTypes[asset.mimeType].format + '");',
    '}'
  ].join('\n'));
}

/** Generate local font faces without adopting a theme’s component styles. */
export function generateFontCSS(pack) {
  assertValid(pack);
  return [...fontFaceRules(pack),...(pack.schemaVersion===2?[SIGNATURE_FONT_CSS]:[])].join("\n\n");
}

/** Generate scoped component CSS. Recipes cannot inject selectors or external resources. */
export function generateCSS(pack, {scope = '.ds-scope'} = {}) {
  assertValid(pack);
  if (typeof scope !== 'string' || !/^[.#][a-zA-Z_][a-zA-Z0-9_-]*$/.test(scope)) throw new Error('CSS scope must be a single class or ID selector.');
  const sourceVersion=pack.schemaVersion;
  const graphicFamily=pack.graphics?.family??DEFAULT_GRAPHIC_FAMILY;
  pack=effectivePackage(pack);
  const resolved = resolveUnchecked(pack.tokens, []);
  const fontRules = [...fontFaceRules(pack),...(sourceVersion===2?[SIGNATURE_FONT_CSS]:[])];
  const rules = [`/* Design Studio: ${pack.id}, schema ${sourceVersion}${sourceVersion===2?' / library '+LIBRARY_VERSION:''} */`, ...fontRules, `${scope} {`,
    ...Object.entries(resolved).map(([id, value]) => `  ${cssVariableName(id)}: ${value};`), ...(sourceVersion===2 ? ['  --ds-illustration-family: '+graphicFamily+';', '  color-scheme: '+(contrastRatio('#ffffff', resolved['color.background.canvas']) > contrastRatio('#000000', resolved['color.background.canvas']) ? 'dark' : 'light')+';'] : []), '}'];
  function emit(selector, styles) {
    if (!styles || Object.keys(styles).length === 0) return;
    const selectors=sourceVersion===2?expandLegacySelectors(selector):[selector];
    rules.push('', `${selectors.map(selector=>scope+' '+selector).join(', ')} {`, ...Object.entries(styles).map(([property, value]) => `  ${cssProperty(property)}: ${cssValue(value)};`), '}');
  }
  if(sourceVersion===2){rules.push('', generateLayoutCSS(scope), generateScrollbarCSS(scope), generateIconCSS(scope), `${scope} [hidden] { display: none !important; }`);emit('dialog.ds-dialog:not([open])',{display:'none'});emit('dialog.ds-dialog-host:not([open])',{display:'none'});}
  else if(pack.components.tree)rules.push('', `${scope} .ds-tree [hidden] { display: none !important; }`);
  if(sourceVersion===2){emit('.ds-dialog-host',{border:'0',padding:'0',backgroundColor:'transparent',color:'inherit',width:'calc(100% - 2rem)',maxWidth:'{size.dialog.maxWidth}',zIndex:'{layer.dialog}'});emit('.ds-menu',{zIndex:'{layer.popover}'});emit('.ds-tooltip',{zIndex:'{layer.tooltip}'});}
  if(sourceVersion===2){
    emit('.ds-dialog-host',{maxHeight:'calc(100dvh - 2rem)',overflowY:'auto',overscrollBehavior:'contain'});
    emit('.ds-dialog-host::backdrop',{backgroundColor:'rgba(0, 0, 0, .45)'});
    emit('.ds-drawer-host',{position:'fixed',insetInlineStart:'auto',insetInlineEnd:'0',insetBlock:'0',margin:'0',width:'min(28rem, calc(100vw - 1rem))',maxWidth:'none',height:'100dvh',maxHeight:'100dvh'});
    emit('.ds-drawer-host[data-side="start"]',{insetInlineStart:'0',insetInlineEnd:'auto'});
    emit('.ds-avatar-group__item:focus-within',{zIndex:'1'});
    for(const id of ['combobox','multiselect']){
      emit('.ds-'+id+'__option[aria-selected="true"]',{backgroundColor:'{color.action.selected.rest.surface}',color:'{color.action.selected.rest.text}'});
      emit('.ds-'+id+'__option[data-active="true"]',{outline:'2px solid {color.focus}',outlineOffset:'-3px'});
      emit('.ds-'+id+'__option[aria-disabled="true"]',{color:'{color.disabled.text}',cursor:'not-allowed'});
    }
    emit('.ds-file-upload[data-drag-state="over"]',{outline:'max(3px, var(--ds-border-width-focus)) solid {color.focus}',outlineOffset:'2px'});
    emit('.ds-range-field__number::-webkit-inner-spin-button, '+scope+' .ds-range-field__number::-webkit-outer-spin-button',{'-webkit-appearance':'none',margin:'0'});
    emit('.ds-spinner__indicator',{animation:'ds-feedback-spin .8s linear infinite'});
    emit('.ds-skeleton',{animation:'ds-skeleton-pulse 1.6s ease-in-out infinite'});
    rules.push('@keyframes ds-feedback-spin { to { transform: rotate(360deg); } }','@keyframes ds-skeleton-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .45; } }');
    const placeholderParts=new Set();
    for(const component of Object.values(pack.components)){
      const visit=node=>{if(node?.part&&(node.tag==='textarea'||node.tag==='input'&&!['button','submit','reset','checkbox','radio','range','color'].includes(node.attrs?.type)))placeholderParts.add(component.parts[node.part].selector);for(const child of node?.children??[])visit(child);};
      visit(component.preview);
    }
    for(const selector of placeholderParts)emit(selector+'::placeholder',{color:'{color.text.muted}',opacity:'1'});
  }
  for (const [componentId, component] of Object.entries(pack.components)) {
    const root = component.parts.root.selector;
    // Direct anatomy belongs to this component; it must not repaint a nested component.
    function anatomyPaths(node, partId, path=[]) {
      const result=[];
      for (const child of node?.children??[]) {
        if (!child?.part) continue;
        const childPath=[...path,component.parts[child.part].selector];
        if (child.part===partId) result.push(childPath);
        result.push(...anatomyPaths(child,partId,childPath));
      }
      return result;
    }
    const treeComponent=componentId==='tree';
    const partSelector=(parent,partId)=>{if(partId==='root')return parent;if(treeComponent)return parent+' '+component.parts[partId].selector;const paths=sourceVersion===2?anatomyPaths(component.preview,partId):[];const selectors=[...new Set(paths.map(path=>parent+' > '+path.join(' > ')))];return selectors.length>1?':is('+selectors.join(', ')+')':selectors[0]??parent+' '+component.parts[partId].selector;};
    for (const [partId, part] of Object.entries(component.parts)) emit(partSelector(root,partId), part.styles);
    // Density belongs to the native control and remains independent of field errors.
    if(sourceVersion===2&&['field','choice-field'].includes(componentId)){
      const native=pack.components[componentId==='choice-field'?'select':'input'];
      emit(partSelector(root,'control')+'[data-variant="desktop"]',native.variants.desktop.styles);
    }
    for (const [variantId, variant] of Object.entries(component.variants)) {
      const variantRoot = `${root}[data-variant="${variantId}"]`;
      emit(variantRoot, variant.styles);
      if(sourceVersion===2)for(const [alias,key]of Object.entries(VARIANT_ALIASES[componentId]??{}))if(key===variantId){emit(`${root}[data-variant="${alias}"]`,variant.styles);for(const [partId,part]of Object.entries(variant.parts??{}))emit(partSelector(`${root}[data-variant="${alias}"]`,partId),part.styles);}
      for (const [partId, part] of Object.entries(variant.parts ?? {})) emit(partSelector(variantRoot,partId), part.styles);
    }
    if(sourceVersion===2&&['button','action-button'].includes(componentId)){
      for(const [size,styles]of Object.entries(BUTTON_SIZES))emit(root+'[data-size="'+size+'"]',styles);
      const variantAttribute=componentId==='button'?'data-variant':'data-emphasis';
      if(componentId==='action-button')for(const [variant,treatment]of Object.entries(pack.components.button.variants))if(!Object.hasOwn(BUTTON_COMPATIBILITY_VARIANTS,variant))emit(root+'['+variantAttribute+'="'+variant+'"]',treatment.styles);
      for(const [variant,styles]of Object.entries(BUTTON_DANGER_VARIANTS))emit(root+'[data-intent="danger"]:where(['+variantAttribute+'="'+variant+'"])',styles);
      if(componentId==='button'){
        emit(root+'[data-has-icon="true"]',{justifyContent:'space-between',textAlign:'left'});
        emit(root+'[data-has-icon="true"] > .ds-button__icon',{display:'inline-flex',alignItems:'center',justifyContent:'center'});
        emit(root+'[data-icon-only="true"]',{width:'44px',minWidth:'44px',padding:'0',justifyContent:'center'});
        for(const [size,styles]of Object.entries(BUTTON_SIZES))emit(root+'[data-icon-only="true"][data-size="'+size+'"]',{width:styles.minHeight,minWidth:styles.minWidth});
        emit(root+'[aria-busy="true"] > .ds-button__progress',{display:'inline-block'});
      }
      if(componentId==='action-button')emit(root+'[aria-busy="true"] > .ds-action-button__progress',{display:'inline-block'});
    }
    const transientState=id=>['hover','active'].includes(id);
    const interactivePart=partId=>{let found=false;const visit=node=>{if(node?.part===partId&&['button','input','select','textarea'].includes(node.tag))found=true;for(const child of node?.children??[])visit(child);};visit(component.preview);return found;};
    const disabledGuard=':not(:is(:disabled, [aria-disabled="true"], [data-state~="disabled"]))';
    for (const [stateId, state] of Object.entries(component.states).sort(([a],[b])=>Number(transientState(a))-Number(transientState(b)))) {
      if(sourceVersion===2&&componentId==='range-field'&&stateId==='focus'){
        const stateRoot=root+':is(:focus-within, [data-state~="focus"])';
        emit(stateRoot,state.styles);
        for(const [partId,part]of Object.entries(state.parts??{})){
          if(['control','number'].includes(partId)){
            emit(partSelector(root,partId)+':focus-visible',part.styles);
            emit(partSelector(root+'[data-state~="focus"]',partId),part.styles);
          }else emit(partSelector(stateRoot,partId),part.styles);
        }
        continue;
      }
      if(sourceVersion===2&&['tabs','accordion','breadcrumb','pagination','data-table','data-grid'].includes(componentId)){
        for(const [partId,part]of Object.entries(state.parts??{})){
          const native=stateId==='focus'?':focus-visible':componentId==='data-table'&&stateId==='selected'?'[data-state~="selected"]':stateSelector(stateId,{parts:{root:component.parts[partId]}});
          emit(partSelector(root,partId)+':is('+native+', [data-state~="'+stateId+'"])'+(transientState(stateId)?disabledGuard:''),part.styles);
        }
        continue;
      }
      if(treeComponent){
        // Recursive items have independent state. A selected ancestor must not
        // select its descendants, and hovering a child must not paint its parent.
        const item=root+' '+component.parts.item.selector,row=component.parts.row.selector;
        if(transientState(stateId)){
          emit(item+disabledGuard+' > '+row+stateSelector(stateId,component),{...state.styles,...state.parts?.row?.styles});
          for(const partId of ['toggle','action'])emit(root+' '+component.parts[partId].selector+stateSelector(stateId,component)+disabledGuard,{backgroundColor:state.parts?.row?.styles?.backgroundColor,color:state.parts?.row?.styles?.color});
        }else{
          const native=stateId==='focus'?':is(:focus-visible, :has(> '+row+' :focus-visible))':stateSelector(stateId,component),target=item+':is('+native+', [data-state~="'+stateId+'"])';
          emit(target,state.styles);
          for(const [partId,part]of Object.entries(state.parts??{}))emit(target+(partId==='item'?'':partId==='row'?' > '+row:' > '+row+' '+component.parts[partId].selector),part.styles);
        }
        continue;
      }
      const stateRoot = sourceVersion===2?`${root}:is(${stateId==='pressed'?'[aria-pressed="true"]':stateSelector(stateId, component)}, [data-state~="${stateId}"])${transientState(stateId)?disabledGuard:''}`:`${root}${stateSelector(stateId, component)}`;
      emit(stateRoot, state.styles);
      if(sourceVersion===2)for(const [alias,key]of Object.entries(STATE_ALIASES[componentId]??{}))if(key===stateId){const aliasRoot=`${root}:is(${stateSelector(alias,component)}, [data-state~="${alias}"])`;emit(aliasRoot,state.styles);for(const [partId,part]of Object.entries(state.parts??{}))emit(partSelector(aliasRoot,partId),part.styles);}
      for (const [partId, part] of Object.entries(state.parts ?? {})) {
        const target=partSelector(stateRoot,partId)+(sourceVersion===2&&transientState(stateId)&&interactivePart(partId)?stateSelector(stateId,component)+disabledGuard:'');
        emit(target, part.styles);
        // Native disabled controls also work when only the control has disabled.
        if (stateId === 'disabled' && partId === 'control' && nestedControl(component)) emit(partSelector(root,partId)+':disabled', part.styles);
      }
    }
    if(sourceVersion===2&&componentId==='button'){
      for(const [variant,treatment]of Object.entries(component.variants)){
        const styles={...component.parts.root.styles,...treatment.styles};
        emit(root+'[data-variant="'+variant+'"][aria-busy="true"]',{backgroundColor:styles.backgroundColor,color:styles.color,borderColor:styles.borderColor,opacity:'1',cursor:'progress'});
      }
      for(const [variant,styles]of Object.entries(BUTTON_DANGER_VARIANTS))emit(root+'[data-variant="'+variant+'"][data-intent="danger"][aria-busy="true"]',{backgroundColor:styles.backgroundColor,color:styles.color,borderColor:styles.borderColor});
      rules.push(`${scope} :is(.ds-button[aria-busy="true"] > .ds-button__progress, .ds-action-button[aria-busy="true"] > .ds-action-button__progress) { animation: ds-button-spin .8s linear infinite; }`, '@keyframes ds-button-spin { to { transform: rotate(360deg); } }', `@media (prefers-reduced-motion: reduce) { ${scope} :is(.ds-button > .ds-button__progress, .ds-action-button > .ds-action-button__progress) { animation: none !important; } }`);
    }
  }
  if(sourceVersion===2){
    const selectors=interactiveSelectors(pack.components).flatMap(expandLegacySelectors).map(selector=>`${scope} ${selector}:focus-visible`);
    if(selectors.length)rules.push('',selectors.join(', ')+' {','  outline: max(3px, var(--ds-border-width-focus)) solid var(--ds-color-focus) !important;','  outline-offset: max(2px, var(--ds-border-offset-focus)) !important;','  opacity: 1 !important;','}');
    rules.push(generatePreferenceCSS(scope));
  }
  return `${rules.join('\n')}\n`;
}
/** Replacement packages may extend vocabulary, but must retain the product's contract. */
export function validateCompatibility(base, candidate) {
  const errors = [];
  for (const [label, pack] of [['base', base], ['candidate', candidate]]) {
    const result = validatePackage(pack);
    if (!result.valid) errors.push(...result.errors.map(error => `${label}: ${error}`));
  }
  if (errors.length) return {compatible: false, errors};
  base=effectivePackage(base); candidate=effectivePackage(candidate);
  for (const [id, token] of Object.entries(base.tokens)) {
    if (!own(candidate.tokens, id)) errors.push(`tokens.${id}: replacement is missing a token used by the base package.`);
    else if (candidate.tokens[id].$type !== token.$type) errors.push(`tokens.${id}: replacement changes token type from ${token.$type} to ${candidate.tokens[id].$type}.`);
  }
  for (const [id, component] of Object.entries(base.components)) {
    const replacement = candidate.components[id];
    if (!replacement) { errors.push(`components.${id}: replacement is missing a component.`); continue; }
    for (const [partId, part] of Object.entries(component.parts)) {
      if (!own(replacement.parts, partId)) errors.push(`components.${id}.parts.${partId}: replacement is missing a part.`);
      else if (replacement.parts[partId].selector !== part.selector) errors.push(`components.${id}.parts.${partId}: replacement changes the selector.`);
    }
    for (const section of ['variants', 'states']) for (const treatmentId of Object.keys(component[section])) if (!own(replacement[section], treatmentId)) errors.push(`components.${id}.${section}.${treatmentId}: replacement is missing this ${section === 'variants' ? 'variant' : 'state'}.`);
    for (const child of component.composes) if (!replacement.composes.includes(child)) errors.push(`components.${id}.composes: replacement omits composed component ${child}.`);
  }
  return {compatible: errors.length === 0, errors};
}


const appearanceAllowed = new Set(APPEARANCE_PROPERTIES);
function validateGraphics(graphics,errors){
  if(!record(graphics)){errors.push('graphics: must be an object.');return;}
  allowedKeys(graphics,['family'],'graphics',errors);
  if(!GRAPHIC_FAMILY_IDS.includes(graphics.family))errors.push('graphics.family: expected one of '+GRAPHIC_FAMILY_IDS.join(', ')+'.');
}
function applyAppearance(components, appearance) {
  for (const [id, override] of Object.entries(appearance ?? {})) {
    const component=components[id];
    if (!component) continue;
    for (const [partId, part] of Object.entries(override.parts ?? {})) Object.assign(component.parts[partId].styles, part.styles);
    for (const section of ['variants','states']) for (const [treatmentId,treatment] of Object.entries(override[section] ?? {})) {
      const target=component[section][treatmentId];
      if (treatment.styles) Object.assign(target.styles ??= {},treatment.styles);
      for (const [partId,part] of Object.entries(treatment.parts ?? {})) Object.assign((target.parts ??= {})[partId] ??= {styles:{}}, {styles:{...target.parts?.[partId]?.styles,...part.styles}});
    }
  }
  return components;
}
function effectivePackage(pack) {
  if (pack.schemaVersion===1) return pack;
  const {appearance,modes,defaultMode,...theme}=normalizeThemeUnchecked(pack);
  const library=structuredClone(COMPONENT_LIBRARY);
  Object.assign(library.button.variants,structuredClone(BUTTON_COMPATIBILITY_VARIANTS));
  return {...theme,schemaVersion:1,tokens:{...structuredClone(DEFAULT_TOKENS),...structuredClone(theme.tokens)},components:applyAppearance(library,appearance)};
}
function validateAppearance(appearance, errors) {
  if (!record(appearance)) {errors.push('appearance: must be an object.');return;}
  function styles(value,path) {
    if(!record(value)){errors.push(path+': must be an object of appearance properties.');return;}
    for(const property of Object.keys(value))if(!appearanceAllowed.has(property))errors.push(path+'.'+property+': layout is owned by the shared library; only appearance properties are allowed.');
  }
  function parts(value,component,path) {
    if(!record(value)){errors.push(path+': must be an object.');return;}
    for(const [id,part]of Object.entries(value)){
      if(!own(component.parts,id))errors.push(path+'.'+id+': shared component part does not exist.');
      if(!record(part)){errors.push(path+'.'+id+': must be an object.');continue;}
      allowedKeys(part,['styles'],path+'.'+id,errors);styles(part.styles,path+'.'+id+'.styles');
    }
  }
  for(const [id,override]of Object.entries(appearance)){
    const path='appearance.'+id,original=COMPONENT_LIBRARY[id],component=id==='button'?{...original,variants:{...original.variants,...BUTTON_COMPATIBILITY_VARIANTS}}:original;
    if(!component){errors.push(path+': shared component does not exist; add new roles to core/library.mjs.');continue;}
    if(!record(override)){errors.push(path+': must be an object.');continue;}
    allowedKeys(override,['parts','variants','states'],path,errors);
    if(own(override,'parts'))parts(override.parts,component,path+'.parts');
    for(const section of ['variants','states'])if(own(override,section)){
      if(!record(override[section])){errors.push(path+'.'+section+': must be an object.');continue;}
      for(const [key,treatment]of Object.entries(override[section])){
        const treatmentPath=path+'.'+section+'.'+key;
        if(!own(component[section],key))errors.push(treatmentPath+': shared treatment does not exist.');
        if(!record(treatment)){errors.push(treatmentPath+': must be an object.');continue;}
        allowedKeys(treatment,['description','styles','parts'],treatmentPath,errors);
        if(own(treatment,'description'))textField(treatment.description,treatmentPath+'.description',errors);
        if(own(treatment,'styles'))styles(treatment.styles,treatmentPath+'.styles');
        if(own(treatment,'parts'))parts(treatment.parts,component,treatmentPath+'.parts');
      }
    }
  }
}
/** v1 remains readable and keeps its CSS. v2 themes use one immutable component library. */
export function validatePackage(pack) {
  const errors=[];preflight(pack,errors);
  if(errors.length)return {valid:false,errors};
  if(!record(pack))return {valid:false,errors:['package: must be an object.']};
  if(pack.schemaVersion===1)return validateLegacyPackage(pack);
  if(pack.schemaVersion!==2)return {valid:false,errors:['schemaVersion: expected 1 or 2.']};
  allowedKeys(pack,['schemaVersion','id','name','description','tokens','appearance','history','brand','modes','defaultMode','graphics'],'package',errors);
  if(!record(pack.tokens))errors.push('tokens: must be an object.');
  if(own(pack,'appearance'))validateAppearance(normalizeAppearance(pack.appearance),errors);
  if(errors.length)return {valid:false,errors};
  for(const [id,token]of Object.entries(pack.tokens))if(own(DEFAULT_TOKENS,id)&&token?.$type!==DEFAULT_TOKENS[id].$type)errors.push('tokens.'+id+': shared token must have type '+DEFAULT_TOKENS[id].$type+'.');
  const model=effectivePackage(pack), result=validateLegacyPackage(model);
  errors.push(...result.errors);
  const resolved=resolveUnchecked(model.tokens,[]);
  const lineWidth=resolved['illustration.material.lineWidth'],depthOpacity=resolved['illustration.material.depthOpacity'],illustrationDuration=resolved['duration.illustration'];
  if(typeof lineWidth!=='number'||!Number.isFinite(lineWidth)||lineWidth<=0)errors.push('tokens.illustration.material.lineWidth: must resolve to a positive number of SVG units.');
  if(typeof depthOpacity!=='number'||!Number.isFinite(depthOpacity)||depthOpacity<0||depthOpacity>1)errors.push('tokens.illustration.material.depthOpacity: must resolve to a number from 0 to 1.');
  if(!tokenValueValid('duration',illustrationDuration)||parseFloat(illustrationDuration)<=0)errors.push('tokens.duration.illustration: must resolve to a positive duration.');
  for(const id of POSITIVE_SPACING_TOKENS){
    const value=resolved[id];
    if(typeof value!=='string'||!lengthPattern.test(value)||parseFloat(value)<=0||value.endsWith('%'))errors.push('tokens.'+id+': shared component spacing must resolve to a positive absolute or font-relative dimension.');
  }
  if(!errors.length)errors.push(...validateThemeQuality(model,resolved));
  const baseValid=errors.length===0;
  if(own(pack,'modes')){
    if(!record(pack.modes))errors.push('modes: must be an object with color mode token overrides.');
    else {
      const ids=Object.keys(pack.modes);
      const named=ids.some(id=>!['light','dark'].includes(id)||own(pack.modes[id]??{},'name')||own(pack.modes[id]??{},'colorScheme'));
      if(!ids.length)errors.push('modes: must contain at least one color mode.');
      if(named){
        for(const id of ids)if(!/^[a-z][a-z0-9-]*$/.test(id)||id==='system')errors.push('modes.'+id+': invalid or reserved color mode ID.');
        if(!ids.includes(pack.defaultMode))errors.push('defaultMode: must reference a declared color mode.');
      }else if(!['light','dark'].includes(pack.defaultMode))errors.push('defaultMode: expected light or dark for a paired theme.');
      for(const mode of named?ids:['light','dark']){
        const override=pack.modes[mode];
        if(!record(override)||!record(override.tokens)){errors.push('modes.'+mode+': expected an object with tokens.');continue;}
        allowedKeys(override,named?['name','colorScheme','tokens']:['tokens'],'modes.'+mode,errors);
        if(named){
          if(typeof override.name!=='string'||!override.name.trim())errors.push('modes.'+mode+'.name: must be a non-empty string.');
          if(!['light','dark'].includes(override.colorScheme))errors.push('modes.'+mode+'.colorScheme: expected light or dark for native controls.');
        }
        // The authored default mode often repeats the already validated base.
        if(baseValid&&Object.entries(override.tokens).every(([id,token])=>own(pack.tokens,id)&&JSON.stringify(token)===JSON.stringify(pack.tokens[id])))continue;
        const candidate={...pack,tokens:{...canonicalizeTokenSet(pack.tokens),...canonicalizeTokenSet(override.tokens)}};delete candidate.modes;delete candidate.defaultMode;
        errors.push(...validatePackage(candidate).errors.map(error=>'modes.'+mode+'.'+error));
      }
    }
  }else if(own(pack,'defaultMode'))errors.push('defaultMode requires a modes definition.');
  return {valid:errors.length===0,errors:[...new Set(errors)]};
}
/** Get the effective catalog without mutating the source theme. */
export function getComponents(pack) {assertValid(pack);return structuredClone(effectivePackage(pack).components);}
/** Effective read model for legacy consumers; save the original theme, not this derived model. */
export function materializePackage(pack) {assertValid(pack);return structuredClone(effectivePackage(pack));}
function appearanceFromLegacy(pack) {
  const appearance={};
  const filter=styles=>Object.fromEntries(Object.entries(styles??{}).filter(([property])=>appearanceAllowed.has(property)));
  for(const [sourceId,component]of Object.entries(pack.components)){
    const id=canonicalComponentId(sourceId);
    if(!own(COMPONENT_LIBRARY,id))throw new Error('Cannot migrate component '+id+': register its shared definition and documented token defaults in core/library.mjs first.');
    const override={parts:{},variants:{},states:{}};
    for(const [sourcePart,part]of Object.entries(component.parts)){
      const partId=canonicalPartId(id,sourcePart);
      if(!own(COMPONENT_LIBRARY[id].parts,partId))throw new Error('Cannot migrate component part '+id+'.'+partId+': register it in the shared library first.');
      const styles=filter(part.styles);if(Object.keys(styles).length)override.parts[partId]={styles};
    }
    for(const section of ['variants','states'])for(const [sourceKey,treatment]of Object.entries(component[section])){
      const key=section==='variants'?canonicalVariantId(id,sourceKey):canonicalStateId(id,sourceKey);
      if(!own(COMPONENT_LIBRARY[id][section],key)&&!(id==='button'&&section==='variants'&&own(BUTTON_COMPATIBILITY_VARIANTS,key)))throw new Error('Cannot migrate component treatment '+id+'.'+section+'.'+key+': register it in the shared library first.');
      const entry={...(treatment.description?{description:treatment.description}:{}),styles:filter(treatment.styles)};
      if(treatment.parts)entry.parts=Object.fromEntries(Object.entries(treatment.parts).map(([partId,part])=>[canonicalPartId(id,partId),{styles:filter(part.styles)}]));
      override[section][key]=entry;
    }
    appearance[id]=override;
  }
  return appearance;
}
/** Explicit, non-mutating migration. Structural recipes are replaced by the shared library. */
export function migratePackage(pack) {
  assertValid(pack);if(pack.schemaVersion===2)return normalizeThemeUnchecked(pack);
  const {components,...metadata}=structuredClone(pack);
  const theme=normalizeThemeUnchecked({...metadata,schemaVersion:2,appearance:appearanceFromLegacy(pack),history:[...pack.history,{date: migrationDate(),note:'Migrated explicitly to theme format 2. Shared library now owns structure, padding, gaps, native markup and previews; visual appearance and brand are preserved.'}]});
  assertValid(theme);return theme;
}
export function createTheme(pack) {return migratePackage(pack);}

function migrationDate(){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Copenhagen',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const part=type=>parts.find(part=>part.type===type).value;return part('year')+'-'+part('month')+'-'+part('day');}

function mergeThemeOverride(target,source){
 for(const section of ['parts','variants','states']){
  if(own(source,section)&&!record(source[section])){target[section]=structuredClone(source[section]);continue;}
  if(!record(source[section]))continue;
  target[section]??={};
  for(const [id,value]of Object.entries(source[section])){
   if(!record(value)){target[section][id]=structuredClone(value);continue;}
   const previous=target[section][id];
   target[section][id]={...previous,...structuredClone(value)};
   if(previous?.styles||value?.styles)target[section][id].styles={...previous?.styles,...value?.styles};
   if(previous?.parts||value?.parts)target[section][id].parts={...previous?.parts,...value?.parts};
  }
 }
 return target;
}
function normalizeAppearance(appearance){
 if(!record(appearance))return appearance;
 const result={};
 for(const [sourceId,source]of Object.entries(appearance).sort(([a],[b])=>Number(a===canonicalComponentId(a))-Number(b===canonicalComponentId(b)))){
  const id=canonicalComponentId(sourceId);
  if(!record(source)){result[id]=source;continue;}
  const override=structuredClone(source);
  if(record(override.parts))override.parts=Object.fromEntries(Object.entries(override.parts).map(([key,value])=>[canonicalPartId(id,key),value]));
  for(const section of ['variants','states'])if(record(override[section])){
   const mapped={};
   for(const [key,treatment]of Object.entries(override[section]).sort(([a],[b])=>Number(a===(section==='variants'?canonicalVariantId(id,a):canonicalStateId(id,a)))-Number(b===(section==='variants'?canonicalVariantId(id,b):canonicalStateId(id,b))))){
    const canonical=section==='variants'?canonicalVariantId(id,key):canonicalStateId(id,key),value=structuredClone(treatment);
    if(!record(value)){mapped[canonical]=value;continue;}
    if(record(value?.parts))value.parts=Object.fromEntries(Object.entries(value.parts).map(([partId,part])=>[canonicalPartId(id,partId),part]));
    mapped[canonical]={...mapped[canonical],...value,...(value?.styles?{styles:{...mapped[canonical]?.styles,...value.styles}}:{})};
   }
   override[section]=mapped;
  }
  result[id]=mergeThemeOverride(result[id]??{},override);
  for(const key of Object.keys(override))if(!['parts','variants','states'].includes(key))result[id][key]=override[key];
 }
 return result;
}
function normalizeThemeUnchecked(pack){
 if(pack.schemaVersion===1)return structuredClone(pack);
 const theme=structuredClone(pack);
 theme.tokens=canonicalizeTokenSet(theme.tokens);
 if(theme.modes)for(const mode of Object.values(theme.modes))if(record(mode)&&record(mode.tokens))mode.tokens=canonicalizeTokenSet(mode.tokens);
 if(record(theme.tokens))for(const [oldId,id]of Object.entries(TOKEN_ALIASES))if(own(theme.tokens,oldId)&&!own(theme.tokens,id))theme.tokens[id]=structuredClone(theme.tokens[oldId]);
 if(own(theme,'appearance')){theme.appearance=normalizeAppearance(theme.appearance);const visit=node=>{for(const [key,value]of Object.entries(node??{}))if(typeof value==='string')node[key]=canonicalTokenReferences(value);else if(value&&typeof value==='object')visit(value);};visit(theme.appearance);}
 for(const section of theme.brand?.sections??[])if(Array.isArray(section.tokens))section.tokens=section.tokens.map(canonicalTokenId);
 for(const section of theme.brand?.sections??[])if(Array.isArray(section.components))section.components=[...new Set(section.components.map(canonicalComponentId))];
 return theme;
}
/** Canonicalize v2 compatibility references explicitly without mutating input; v1 is unchanged. */
export function normalizeThemeReferences(pack){assertValid(pack);return normalizeThemeUnchecked(pack);}
function expandLegacySelectors(selector){
 let results=[selector];
 for(const [canonical,aliases]of Object.entries(LEGACY_SELECTORS).sort(([a],[b])=>b.length-a.length)){
  const pattern=new RegExp(canonical.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?![a-zA-Z0-9_-])','g');
  if(results.some(value=>pattern.test(value))){pattern.lastIndex=0;results=[...results,...results.flatMap(value=>aliases.map(alias=>value.replace(pattern,alias)))];}
 }
 return [...new Set(results)];
}
function interactiveSelectors(components){
 const selectors=new Set();
 for(const component of Object.values(components)){
  function visit(node){if(!node)return;if(['a','button','input','select','textarea'].includes(node.tag)&&node.part&&component.parts[node.part])selectors.add(component.parts[node.part].selector);for(const child of node.children??[])visit(child);}
  visit(component.preview);
 }
 return [...selectors];
}

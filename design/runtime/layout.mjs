import { BREAKPOINTS } from './scales.mjs';

/** Optional outer-layout primitives. Products own columns, placement and overrides. */
export const LAYOUT_PROFILES = Object.freeze({
  prose: Object.freeze({ name: 'Læsetekst', maxWidth: '70ch', usage: 'Forklaringer, vejledning og længere tekst.' }),
  form: Object.freeze({ name: 'Formular', maxWidth: '44rem', usage: 'Formularer og indstillinger med én primær læseretning.' }),
  panel: Object.freeze({ name: 'Panel', maxWidth: '23rem', usage: 'Egenskaber, filtre og værktøjer ved siden af indhold.' }),
  split: Object.freeze({ name: 'Liste og detaljer', maxWidth: '72rem', usage: 'Samlinger med en liste og tilhørende detaljevisning.' }),
  workspace: Object.freeze({ name: 'Arbejdsområde', maxWidth: '84rem', usage: 'Sammensatte editorer med arbejdsflade og paneler.' }),
  fluid: Object.freeze({ name: 'Fuld bredde', maxWidth: 'none', usage: 'Canvas, kort, tidslinjer og data, som faktisk udnytter hele bredden.' }),
});

/** Native scrolling with theme colors; older WebKit gets an isolated visual fallback. */
export function generateScrollbarCSS(scope = '.ds-scope') {
  if (typeof scope !== 'string' || !/^[.#][a-zA-Z_][a-zA-Z0-9_-]*$/.test(scope)) throw new Error('CSS scope must be a single class or ID selector.');
  const all = `:where(${scope}), :where(${scope}) *`;
  const within = selector => `:where(${scope})${selector}, :where(${scope}) ${selector}`;
  const pseudo = suffix => `:where(${scope})${suffix}, :where(${scope}) *${suffix}`;
  return [
    `:where(${scope}) { --ds-scrollbar-thumb: var(--ds-color-text-secondary, #667085); --ds-scrollbar-track: var(--ds-color-background-canvas, #f4f5f8); --ds-scrollbar-hover: var(--ds-color-text-primary, #232638); }`,
    `${within(':is(.ds-card, .ds-panel-side, .ds-scroll-area__viewport, .ds-form-fields, [data-scrollbar-surface="surface"])')} { --ds-scrollbar-thumb: var(--ds-color-text-secondary, #667085); --ds-scrollbar-track: var(--ds-color-background-surface, #fff); --ds-scrollbar-hover: var(--ds-color-text-primary, #232638); }`,
    `${within(':is(input, textarea, [data-scrollbar-surface="control"])')} { --ds-scrollbar-thumb: var(--ds-color-text-secondary, #667085); --ds-scrollbar-track: var(--ds-color-background-control, #fff); --ds-scrollbar-hover: var(--ds-color-text-primary, #232638); }`,
    `${within('[data-scrollbar-surface="inverse"]')} { --ds-scrollbar-thumb: var(--ds-color-text-inverse, #fff); --ds-scrollbar-track: var(--ds-color-background-inverse, #1b2434); --ds-scrollbar-hover: var(--ds-color-text-inverse, #fff); }`,
    `${all} { scrollbar-color: var(--ds-scrollbar-thumb) var(--ds-scrollbar-track); scrollbar-width: auto; }`,
    `@media (pointer: fine) { ${all} { scrollbar-width: thin; } }`,
    '@supports not ((scrollbar-color: red blue) and (scrollbar-width: thin)) {',
    `  ${all} { scrollbar-color: auto; scrollbar-width: auto; }`,
    '  @media (forced-colors: none) {',
    `    ${pseudo('::-webkit-scrollbar')} { width: 16px; height: 16px; }`,
    `    @media (pointer: fine) { ${pseudo('::-webkit-scrollbar')} { width: 12px; height: 12px; } }`,
    `    ${pseudo('::-webkit-scrollbar-track')}, ${pseudo('::-webkit-scrollbar-corner')} { background: var(--ds-scrollbar-track); }`,
    `    ${pseudo('::-webkit-scrollbar-thumb')} { background: var(--ds-scrollbar-thumb); border: 2px solid var(--ds-scrollbar-track); border-radius: var(--ds-radius-control, 6px); }`,
    `    ${pseudo('::-webkit-scrollbar-thumb:hover')} { background: var(--ds-scrollbar-hover); }`,
    '  }',
    '}',
    `@media (forced-colors: active) { ${all} { scrollbar-color: auto !important; scrollbar-width: auto !important; } }`,
  ].join('\n');
}

/** Opt-in viewport frame. Header/navigation stay outside the desktop content scroller. */
export function generateAppShellCSS(scope = '.ds-scope') {
  if (typeof scope !== 'string' || !/^[.#][a-zA-Z_][a-zA-Z0-9_-]*$/.test(scope)) throw new Error('CSS scope must be a single class or ID selector.');
  const shell = suffix => `:where(${scope}) .ds-app-shell${suffix}, :where(${scope}).ds-app-shell${suffix}`;
  const navigation = shell(' > .ds-app-navigation');
  const workspace = shell(' > .ds-app-workspace');
  const header = shell(' > .ds-app-workspace > .ds-app-header');
  const content = shell(' > .ds-app-workspace > .ds-app-content');
  const footer = shell(' > .ds-app-workspace > .ds-app-footer');
  const layout = (name, suffix = '') => `:where(${scope}) .ds-${name}${suffix}, :where(${scope}).ds-${name}${suffix}`;
  const panels = suffix => layout('panel-layout', suffix);
  const panelContent = panels(' > .ds-panel-content'), panelSide = panels(' > .ds-panel-side'), resize = panels(' > .ds-panel-resize');
  const forms = suffix => layout('form-layout', suffix);
  const fields = forms(' > .ds-form-fields'), actions = forms(' > .ds-form-actions');
  const compact = suffix => panels('[data-panel-compact="true"]' + suffix);
  return [
    `${shell('')} { box-sizing: border-box; min-inline-size: 0; min-block-size: 0; }`,
    `${navigation}, ${workspace}, ${header}, ${content}, ${footer} { min-inline-size: 0; min-block-size: 0; }`,
    `${shell(' > .ds-app-navigation:focus-visible')}, ${shell(' > .ds-app-workspace > .ds-app-content:focus-visible')} { outline: max(3px, var(--ds-border-width-focus, 3px)) solid var(--ds-color-focus, currentColor); outline-offset: calc(-1 * max(3px, var(--ds-border-width-focus, 3px))); }`,
    `${panels('')}, ${panelContent}, ${panelSide}, ${forms('')}, ${fields}, ${actions} { box-sizing: border-box; min-inline-size: 0; min-block-size: 0; }`,
    `${panels('[data-panel-open="false"] > .ds-panel-side')}, ${panels('[data-panel-open="false"] > .ds-panel-resize')} { display: none; }`,
    `${resize} { min-inline-size: 0; min-block-size: 0; padding: 0; border: 0; border-radius: 0; display: grid; place-items: center; color: var(--ds-color-border-field, currentColor); background: var(--ds-color-background-canvas, transparent); cursor: ew-resize; touch-action: none; user-select: none; }`,
    `${panels(' > .ds-panel-resize::before')} { content: ''; display: block; inline-size: 2px; block-size: 2.5rem; border-radius: 1px; background: currentColor; }`,
    `${panels(' > .ds-panel-resize:hover')} { color: var(--ds-color-action-neutral-hover-text, currentColor); background: var(--ds-color-action-neutral-hover-surface, transparent); }`,
    `${panels(' > .ds-panel-content:focus-visible')}, ${panels(' > .ds-panel-side:focus-visible')}, ${panels(' > .ds-panel-resize:focus-visible')}, ${forms(' > .ds-form-fields:focus-visible')} { outline: max(3px, var(--ds-border-width-focus, 3px)) solid var(--ds-color-focus, currentColor); outline-offset: calc(-1 * max(3px, var(--ds-border-width-focus, 3px))); }`,
    `${actions} { display: flex; flex-wrap: wrap; gap: var(--ds-space-component-gap, 6px); padding: var(--ds-space-component-padding, 12px); border-block-start: var(--ds-border-width-default, 1px) solid var(--ds-color-border-default, currentColor); background: var(--ds-color-background-surface, transparent); }`,
    `@media (min-width: ${BREAKPOINTS.workspace + 1}px) and (min-height: ${BREAKPOINTS.short + 1}px) {`,
    `  ${shell('')} { display: grid; grid-template-columns: var(--ds-app-navigation-width, 14rem) minmax(0, 1fr); grid-template-rows: minmax(0, 1fr); block-size: var(--ds-app-height, var(--ds-app-viewport-height, 100vh)); overflow: hidden; }`,
    `  ${navigation} { overflow: auto; overscroll-behavior: contain; }`,
    `  ${workspace} { display: grid; grid-template-rows: auto minmax(0, 1fr) auto; overflow: hidden; }`,
    `  ${header} { grid-row: 1; }`,
    `  ${content} { grid-row: 2; overflow: auto; scrollbar-gutter: stable; overscroll-behavior: contain; scroll-padding: var(--ds-space-component-padding, 12px); }`,
    `  ${footer} { grid-row: 3; }`,
    `  ${panels('')} { display: grid; grid-template-columns: minmax(0, 1fr) 8px var(--ds-panel-width, 20rem); gap: 0; overflow: hidden; }`,
    `  ${panels('[data-panel-open="false"]')} { grid-template-columns: minmax(0, 1fr); }`,
    `  ${panelContent}, ${panelSide} { overflow: auto; scrollbar-gutter: stable; overscroll-behavior: contain; scroll-padding: var(--ds-space-component-padding, 12px); }`,
    `  ${forms('')} { display: grid; grid-template-rows: minmax(0, 1fr) auto; overflow: hidden; }`,
    `  ${fields} { overflow: auto; scrollbar-gutter: stable; overscroll-behavior: contain; scroll-padding: var(--ds-space-component-padding, 12px); padding: max(var(--ds-space-component-paddingCompact, 6px), calc(max(3px, var(--ds-border-width-focus, 3px)) + max(2px, var(--ds-border-offset-focus, 3px)))); }`,
    `  ${compact('')} { display: block; overflow: auto; scrollbar-gutter: stable; }`,
    `  ${compact(' > .ds-panel-resize')} { display: none; }`,
    `  ${compact(' > .ds-panel-content')}, ${compact(' > .ds-panel-side')}, ${compact(' > .ds-panel-side .ds-form-fields')} { block-size: auto; overflow: visible; overscroll-behavior: auto; }`,
    `  ${compact(' > .ds-panel-side .ds-form-layout')} { display: block; block-size: auto; overflow: visible; }`,
    '}',
    '@supports (block-size: 100dvh) {',
    `  ${shell('')} { --ds-app-viewport-height: 100dvh; }`,
    '}',
    '@supports not (scrollbar-gutter: stable) {',
    `  @media (min-width: ${BREAKPOINTS.workspace + 1}px) and (min-height: ${BREAKPOINTS.short + 1}px) {`,
    `    ${content} { overflow-y: scroll; }`,
    `    ${panelContent}, ${panelSide}, ${fields}, ${compact('')} { overflow-y: scroll; }`,
    `    ${compact(' > .ds-panel-content')}, ${compact(' > .ds-panel-side')}, ${compact(' > .ds-panel-side .ds-form-fields')} { overflow-y: visible; }`,
    '  }',
    '}',
    `@media (max-width: ${BREAKPOINTS.workspace}px), (max-height: ${BREAKPOINTS.short}px) {`,
    `  ${shell('')} { display: block; block-size: auto; overflow: visible; }`,
    `  ${workspace} { display: block; overflow: visible; }`,
    `  ${navigation}, ${content} { overflow: visible; overscroll-behavior: auto; }`,
    `  ${panels('')}, ${forms('')} { display: block; block-size: auto; overflow: visible; }`,
    `  ${panelContent}, ${panelSide}, ${fields} { block-size: auto; overflow: visible; overscroll-behavior: auto; }`,
    `  ${resize} { display: none; }`,
    '}',
  ].join('\n');
}

export function generateLayoutCSS(scope = '.ds-scope') {
  if (typeof scope !== 'string' || !/^[.#][a-zA-Z_][a-zA-Z0-9_-]*$/.test(scope)) throw new Error('CSS scope must be a single class or ID selector.');
  const selector = suffix => `:where(${scope}) .ds-layout${suffix}, :where(${scope}).ds-layout${suffix}`;
  return [
    `${selector('')} { --ds-layout-max-width: initial; box-sizing: border-box; inline-size: 100%; min-inline-size: 0; margin-inline: auto; }`,
    ...Object.entries(LAYOUT_PROFILES).map(([id, profile]) => `${selector('[data-layout="' + id + '"]')} { max-inline-size: var(--ds-layout-max-width, ${profile.maxWidth}); }`),
    generateAppShellCSS(scope),
  ].join('\n');
}

export function createLayout(profile = 'form', { document = globalThis.document } = {}) {
  if (!Object.hasOwn(LAYOUT_PROFILES, profile)) throw new Error('Ukendt breddeprofil: ' + profile);
  const element = document.createElement('div');
  element.className = 'ds-layout'; element.setAttribute('data-layout', profile);
  return element;
}

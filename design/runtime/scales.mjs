/** Shared values. Breakpoints are numbers for generated CSS, not custom-property
 * references in media queries, where var() cannot select a breakpoint.
 */
export const BREAKPOINTS = Object.freeze({ compact: 600, panel: 700, workspace: 800, short: 480 });

const token = ($type, $value, description) => Object.freeze({ $type, $value, description });
export const DEFAULT_SCALE_TOKENS = Object.freeze({
  'space.scale.0': token('dimension', '0', 'Ingen afstand; semantiske komponentafstande skal fortsat være positive.'),
  'space.scale.1': token('dimension', '0.25rem', 'Primitiv afstand: 4 px ved 16 px rodtekst.'),
  'space.scale.2': token('dimension', '0.5rem', 'Primitiv afstand: 8 px ved 16 px rodtekst.'),
  'space.scale.3': token('dimension', '0.75rem', 'Primitiv afstand: 12 px ved 16 px rodtekst.'),
  'space.scale.4': token('dimension', '1rem', 'Primitiv afstand: 16 px ved 16 px rodtekst.'),
  'space.scale.6': token('dimension', '1.5rem', 'Primitiv afstand: 24 px ved 16 px rodtekst.'),
  'space.scale.8': token('dimension', '2rem', 'Primitiv afstand: 32 px ved 16 px rodtekst.'),
  'elevation.level0': token('shadow', 'none', 'Ingen hævning over den omgivende flade.'),
  'elevation.level1': token('shadow', '0 1px 3px rgba(20, 28, 44, 0.12)', 'Let hævning af et valgt eller løftet element.'),
  'elevation.level2': token('shadow', '0 1px 3px rgba(20, 28, 44, 0.04), 0 8px 24px rgba(20, 28, 44, 0.03)', 'Hævet indholdsflade.'),
  'elevation.level3': token('shadow', '0 12px 40px rgba(20, 28, 44, 0.14)', 'Flydende flade over andet indhold.'),
  'layer.base': token('number', 0, 'Almindeligt dokumentindhold.'),
  'layer.sticky': token('number', 10, 'Fastgjort navigation og værktøjer i dokumentet.'),
  'layer.popover': token('number', 100, 'Flydende menuer og popovers i dokumentet.'),
  'layer.dialog': token('number', 1000, 'Dokumentlag til dialogadaptere; native modaler bruger browserens top layer.'),
  'layer.tooltip': token('number', 1100, 'Supplerende værktøjstip i dokumentet.'),
  'size.icon.small': token('dimension', '16px', 'Kompakte supplerende ikoner.'),
  'size.icon.medium': token('dimension', '20px', 'Almindelige handlings- og navigationsikoner.'),
  'size.icon.large': token('dimension', '24px', 'Større handlingsikoner.'),
});

/** Canonical v2 vocabulary; old IDs remain readable compatibility aliases. */
export const TOKEN_NAME_ALIASES = Object.freeze({
  "space.1": "space.scale.1",
  "space.2": "space.scale.2",
  "space.3": "space.scale.3",
  "space.4": "space.scale.4",
  "space.6": "space.scale.6",
  "space.8": "space.scale.8",
  "space.px4": "space.control.inset",
  "color.action.primary": "color.action.primary.rest.surface",
  "color.action.primaryText": "color.action.primary.rest.text",
  "color.action.subtle": "color.action.selected.rest.surface",
  "color.action.subtleText": "color.action.selected.rest.text",
  "color.action.neutralHover": "color.action.neutral.hover.surface",
  "color.action.neutralHoverText": "color.action.neutral.hover.text",
  "color.action.neutralActive": "color.action.neutral.active.surface",
  "color.action.neutralActiveText": "color.action.neutral.active.text",
  "color.action.primaryHover": "color.action.primary.hover.surface",
  "color.action.primaryHoverText": "color.action.primary.hover.text",
  "color.action.primaryActive": "color.action.primary.active.surface",
  "color.action.primaryActiveText": "color.action.primary.active.text",
  "color.action.secondaryHover": "color.action.secondary.hover.surface",
  "color.action.secondaryHoverText": "color.action.secondary.hover.text",
  "color.action.secondaryActive": "color.action.secondary.active.surface",
  "color.action.secondaryActiveText": "color.action.secondary.active.text",
  "color.action.selectedHover": "color.action.selected.hover.surface",
  "color.action.selectedHoverText": "color.action.selected.hover.text",
  "color.action.selectedActive": "color.action.selected.active.surface",
  "color.action.selectedActiveText": "color.action.selected.active.text",
  "color.action.dangerHover": "color.action.danger.hover.surface",
  "color.action.dangerHoverText": "color.action.danger.hover.text",
  "color.action.dangerActive": "color.action.danger.active.surface",
  "color.action.dangerActiveText": "color.action.danger.active.text",
  "color.action.accentHover": "color.action.accent.hover.surface",
  "color.action.accentHoverText": "color.action.accent.hover.text",
  "color.action.accentActive": "color.action.accent.active.surface",
  "color.action.accentActiveText": "color.action.accent.active.text"
});
export const canonicalTokenId = id => Object.hasOwn(TOKEN_NAME_ALIASES,id) ? TOKEN_NAME_ALIASES[id] : id;
export const canonicalTokenReferences = value => typeof value === "string" ? value.replace(/\{([^{}]+)\}/g, (match,id) => "{"+canonicalTokenId(id)+"}") : value;

/** Normalize authored overrides before merging with defaults or another mode. */
export function canonicalizeTokenSet(tokens){
 if(!tokens||typeof tokens!=='object'||Array.isArray(tokens))return tokens;
 const result=structuredClone(tokens);
 for(const [oldId,id]of Object.entries(TOKEN_NAME_ALIASES)){
  if(Object.hasOwn(result,oldId)&&!Object.hasOwn(result,id)&&result[oldId]?.$value!=='{'+id+'}')result[id]=structuredClone(result[oldId]);
  delete result[oldId];
 }
 for(const value of Object.values(result))if(value&&typeof value==='object')value.$value=canonicalTokenReferences(value.$value);
 return result;
}

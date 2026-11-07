/** Project-agnostic component anatomy and semantic defaults. Visual themes own appearance. */
import {DEFAULT_SCALE_TOKENS,TOKEN_NAME_ALIASES} from './scales.mjs';
import {GRAPHIC_TOKEN_DEFAULTS} from './graphic-tokens.mjs';
export const LIBRARY_VERSION='3.9.1';
export { LAYOUT_PROFILES } from './layout.mjs';
function freeze(value){if(value&&typeof value==='object'){for(const child of Object.values(value))freeze(child);Object.freeze(value);}return value;}
// Keep one-line desktop controls at 32px without clipping larger type or wrapped labels.
const DESKTOP_CONTROL_STYLES=freeze({
  minHeight: '32px',
  padding: 'max(0px, calc((32px - 1em * {typography.lineHeight.control}) / 2 - {border.width.default})) {space.component.padding}',
  lineHeight: '{typography.lineHeight.control}',
});
const DESKTOP_INPUT_HEIGHT='max(32px, calc(1em * {typography.lineHeight.control} + 2 * {border.width.default}))';
export const APPEARANCE_PROPERTIES=freeze([
  "color",
  "backgroundColor",
  "background",
  "border",
  "borderTop",
  "borderRight",
  "borderBottom",
  "borderLeft",
  "borderColor",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
  "borderWidth",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderStyle",
  "borderRadius",
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomLeftRadius",
  "borderBottomRightRadius",
  "outline",
  "outlineColor",
  "outlineWidth",
  "outlineStyle",
  "outlineOffset",
  "boxShadow",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "fontStyle",
  "lineHeight",
  "letterSpacing",
  "textAlign",
  "textTransform",
  "textDecoration",
  "accentColor",
  "fill",
  "stroke",
  "strokeWidth",
  "opacity",
  "transition",
  "transitionDuration",
  "transitionDelay",
  "transitionTimingFunction"
]);
export const POSITIVE_SPACING_TOKENS=freeze([
  "space.component.padding",
  "space.component.paddingLarge",
  "space.component.paddingCompact",
  "space.component.gap",
  "space.component.gapLarge"
]);
export const COMPONENT_ALIASES=freeze({
  "tool-button": "action-button",
  "simulation-caption": "caption",
  "brandSelect": "choice-field",
  "stat-row": "metric-row"
});
export const VARIANT_ALIASES=freeze({
  "button": {
    "library": "list-item",
    "tour": "rounded",
    "close": "dismiss",
    "close-panel": "dismiss-small",
    "close-room": "dismiss-compact",
    "list-action": "danger-subtle"
  },
  "select": {
    "room": "compact"
  },
  "segmented-option": {
    "room": "dense",
    "season": "compact"
  },
  "heading": {
    "narrative": "expressive",
    "narrative-large": "expressive-large"
  },
  "card": {
    "hairline": "subtle-border",
    "sunk": "subtle",
    "lifted": "floating"
  },
  "metric-row": {
    "preset": "compact"
  },
  "tooltip": {
    "limit": "warning"
  },
  "action-button": {
    "icon": "horizontal"
  },
  "choice-field": {
    "open": "default"
  }
});
export const STATE_ALIASES=freeze({
  "button": {
    "selected": "pressed"
  },
  "action-button": {
    "selected": "pressed"
  },
  "segmented-option": {
    "selected": "pressed"
  }
});
export const PART_ALIASES=freeze({
  "caption": {
    "clock": "label"
  }
});
export const TOKEN_ALIASES=freeze({
  ...TOKEN_NAME_ALIASES,
  "typography.font.narrative": "typography.font.expressive",
  "typography.weight.narrative": "typography.weight.expressive",
  "typography.size.narrative": "typography.size.captionText",
  "typography.lineHeight.narrative": "typography.lineHeight.captionText",
  "typography.size.libraryHeading": "typography.size.expressive",
  "typography.size.libraryDetail": "typography.size.expressiveLarge",
  "typography.tracking.clock": "typography.tracking.captionLabel",
  "color.narrative.text": "color.caption.text",
  "color.narrative.clock": "color.caption.labelSurface",
  "color.narrative.surface": "color.caption.surface",
  "size.tool.width": "size.actionButton.width",
  "size.icon.tool": "size.icon.action",
  "size.icon.panel": "size.icon.compact",
  "radius.tool": "radius.actionButton"
});
export const LEGACY_SELECTORS=freeze({
  ".ds-choice-field": [
    ".ds-brand-select"
  ],
  ".ds-choice-field__list": [
    ".ds-brand-select__list"
  ],
  ".ds-choice-field__option": [
    ".ds-brand-select__option"
  ],
  ".ds-choice-field__control": [
    ".ds-brand-select__trigger"
  ],
  ".ds-action-button": [
    ".ds-tool-button"
  ],
  ".ds-action-button__icon": [
    ".ds-tool-button__icon"
  ],
  ".ds-action-button__shortcut": [
    ".ds-tool-button__shortcut"
  ],
  ".ds-metric-row": [
    ".ds-stat-row"
  ],
  ".ds-metric-row__label": [
    ".ds-stat-row__label"
  ],
  ".ds-metric-row__value": [
    ".ds-stat-row__value"
  ],
  ".ds-caption": [
    ".ds-simulation-caption"
  ],
  ".ds-caption__label": [
    ".ds-simulation-caption__clock"
  ],
  ".ds-caption__text": [
    ".ds-simulation-caption__text"
  ]
});
const SCALE_ALIASES={'shadow.selected':'elevation.level1','shadow.card':'elevation.level2','shadow.floating':'elevation.level3'};
function scaleDefaults(tokens){for(const [id,target]of Object.entries(SCALE_ALIASES))tokens[id].$value='{'+target+'}';for(const [oldId,id]of Object.entries(TOKEN_NAME_ALIASES))tokens[oldId]={$type:tokens[id].$type,$value:'{'+id+'}',description:'Compatibility alias for '+id+'. Use the canonical token in new integrations.'};return tokens;}
export const DEFAULT_TOKENS=freeze(scaleDefaults({
  ...GRAPHIC_TOKEN_DEFAULTS,
  'gradient.material': {$type:'gradient',$value:'linear-gradient(135deg, {color.background.surface} 0%, {color.background.surface} 100%)',description:'Opak materialeflade på kortets material-variant. Tekstkontrast måles over hele gradienten.'},
  'radius.feature': {$type:'dimension',$value:'2rem',description:'Det fremhævede hjørne på asymmetriske kort; øvrige hjørner følger radius.card.'},
  'shadow.embossed': {$type:'shadow',$value:'inset 0 2px 0 #00000018, inset 0 -2px 0 #ffffff44',description:'Indvendigt relief uden ændret geometri, tekstgennemsigtighed eller fokus.'},
  'duration.expressive': {$type:'duration',$value:'240ms',description:'Varighed for valgfri temabevægelse gennem animateThemed; standardanimationen ændres ikke.'},
  'motion.curve.x1': {$type:'number',$value:0.2,description:'Første kontrolpunkts x i temaets valgfrie cubic-bezier-kurve, mellem 0 og 1.'},
  'motion.curve.y1': {$type:'number',$value:0.7,description:'Første kontrolpunkts y i temaets valgfrie bevægelseskurve.'},
  'motion.curve.x2': {$type:'number',$value:0.2,description:'Andet kontrolpunkts x i temaets valgfrie cubic-bezier-kurve, mellem 0 og 1.'},
  'motion.curve.y2': {$type:'number',$value:1,description:'Andet kontrolpunkts y; let oversving bruges kun i produktets dekorative bevægelse.'},
  ...DEFAULT_SCALE_TOKENS,
  "color.action.secondary.hover.surface": {"$type":"color","$value":"#3d4253","description":"Central neutral secondary hover surface; themes may override the complete surface/text pair."},
  "color.action.secondary.hover.text": {"$type":"color","$value":"#ffffff","description":"Readable text on the neutral secondary hover surface."},
  "color.action.secondary.active.surface": {"$type":"color","$value":"#171b29","description":"Central neutral secondary active surface; themes may override the complete surface/text pair."},
  "color.action.secondary.active.text": {"$type":"color","$value":"#ffffff","description":"Readable text on the neutral secondary active surface."},
  "color.background.canvas": {
    "$type": "color",
    "$value": "#f5f6f8",
    "description": "Central default: Produktets grundbaggrund."
  },
  "color.background.surface": {
    "$type": "color",
    "$value": "#ffffff",
    "description": "Central default: Baggrund for kort, dialoger og indtastningsfelter."
  },
  "color.background.subtle": {
    "$type": "color",
    "$value": "#eef0f4",
    "description": "Central default: Svagt fremhævede områder og neutrale badges."
  },
  "color.text.primary": {
    "$type": "color",
    "$value": "#202632",
    "description": "Central default: Primær tekst og overskrifter."
  },
  "color.text.secondary": {
    "$type": "color",
    "$value": "#596273",
    "description": "Central default: Supplerende tekst og vejledning."
  },
  "color.border.default": {
    "$type": "color",
    "$value": "#d9dde5",
    "description": "Central default: Standardkant på kontroller og overflader."
  },
  "color.action.primary.rest.surface": {
    "$type": "color",
    "$value": "#4355c5",
    "description": "Central default: Primære handlinger og valgte kontroller."
  },
  "color.action.primary.rest.text": {
    "$type": "color",
    "$value": "#ffffff",
    "description": "Central default: Tekst oven på den primære handlingsfarve."
  },
  "color.action.selected.rest.surface": {
    "$type": "color",
    "$value": "#edf0ff",
    "description": "Central default: Svag baggrund for sekundære handlinger og accentbadges."
  },
  "color.action.selected.rest.text": {
    "$type": "color",
    "$value": "#3646a5",
    "description": "Central default: Tekst på den svage handlingsbaggrund."
  },
  "color.focus": {
    "$type": "color",
    "$value": "{color.action.primary.rest.surface}",
    "description": "Central default: Synlig markering af tastaturfokus."
  },
  "color.status.danger": {
    "$type": "color",
    "$value": "#b92338",
    "description": "Central default: Fejlkant og destruktive handlinger."
  },
  "color.status.dangerSurface": {
    "$type": "color",
    "$value": "#fff0f2",
    "description": "Central default: Baggrund for fejlbeskeder."
  },
  "color.status.dangerText": {
    "$type": "color",
    "$value": "#971b2d",
    "description": "Central default: Tekst på fejlbaggrunden og selvstændig fejltekst."
  },
  "color.status.dangerContrast": {
    "$type": "color",
    "$value": "#ffffff",
    "description": "Central default: Tekst på en destruktiv handlingsknap."
  },
  "color.disabled.surface": {
    "$type": "color",
    "$value": "#e8edf4",
    "description": "Central default: Baggrund for deaktiverede inputkontroller."
  },
  "color.disabled.text": {
    "$type": "color",
    "$value": "#6d7890",
    "description": "Central default: Tekst i deaktiverede inputkontroller."
  },
  "typography.font.body": {
    "$type": "fontFamily",
    "$value": "'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif",
    "description": "Central default: Brødtekst og kontroller; ingen ekstern skrifttjeneste er nødvendig."
  },
  "typography.font.heading": {
    "$type": "fontFamily",
    "$value": "'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif",
    "description": "Central default: Overskrifter og titler."
  },
  "typography.size.body": {
    "$type": "dimension",
    "$value": "1rem",
    "description": "Central default: Normal læsetekst."
  },
  "typography.size.heading": {
    "$type": "dimension",
    "$value": "2rem",
    "description": "Central default: Primær overskrift i designeksemplerne."
  },
  "typography.size.label": {
    "$type": "dimension",
    "$value": "0.875rem",
    "description": "Central default: Labels og betjeningskontroller."
  },
  "typography.size.small": {
    "$type": "dimension",
    "$value": "0.8125rem",
    "description": "Central default: Hjælpetekst og kompakte badges."
  },
  "typography.size.title": {
    "$type": "dimension",
    "$value": "1.25rem",
    "description": "Central default: Titler i kort og dialoger."
  },
  "typography.weight.body": {
    "$type": "fontWeight",
    "$value": 400,
    "description": "Central default: Normal tekstvægt."
  },
  "typography.weight.heading": {
    "$type": "fontWeight",
    "$value": 650,
    "description": "Central default: Overskrifternes tekstvægt."
  },
  "typography.weight.label": {
    "$type": "fontWeight",
    "$value": 600,
    "description": "Central default: Labels og handlingsknappers tekstvægt."
  },
  "typography.lineHeight.body": {
    "$type": "number",
    "$value": 1.55,
    "description": "Central default: Linjehøjde uden enhed for brødtekst."
  },
  "typography.lineHeight.heading": {
    "$type": "number",
    "$value": 1.2,
    "description": "Central default: Linjehøjde uden enhed for overskrifter."
  },
  "typography.lineHeight.control": {
    "$type": "number",
    "$value": 1.3,
    "description": "Central default: Linjehøjde uden enhed for knapper og badges."
  },
  "size.control.height": {
    "$type": "dimension",
    "$value": "2.75rem",
    "description": "Central default: Minimumshøjde for knapper, input og select."
  },
  "size.checkbox": {
    "$type": "dimension",
    "$value": "1.125rem",
    "description": "Central default: Checkboxens visuelle størrelse."
  },
  "size.dialog.maxWidth": {
    "$type": "dimension",
    "$value": "36rem",
    "description": "Central default: Dialogfladens maksimale bredde."
  },
  "border.width.default": {
    "$type": "dimension",
    "$value": "1px",
    "description": "Central default: Standardbredde på kanter."
  },
  "border.width.focus": {
    "$type": "dimension",
    "$value": "3px",
    "description": "Central default: Bredde på den synlige fokusmarkering."
  },
  "border.offset.focus": {
    "$type": "dimension",
    "$value": "3px",
    "description": "Central default: Afstand fra kontrol til fokusmarkering."
  },
  "radius.control": {
    "$type": "dimension",
    "$value": "0.5rem",
    "description": "Central default: Hjørner på knapper og input."
  },
  "radius.card": {
    "$type": "dimension",
    "$value": "1rem",
    "description": "Central default: Hjørner på kort, beskeder og dialoger."
  },
  "radius.badge": {
    "$type": "dimension",
    "$value": "999px",
    "description": "Central default: Afrunding på badges."
  },
  "opacity.hover": {
    "$type": "number",
    "$value": 0.94,
    "description": "Central default: Knapopacitet ved hover."
  },
  "opacity.active": {
    "$type": "number",
    "$value": 0.9,
    "description": "Central default: Knapopacitet under aktivering."
  },
  "opacity.disabled": {
    "$type": "number",
    "$value": 0.45,
    "description": "Central default: Opacitet for deaktiverede knapper og checkboxes."
  },
  "shadow.card": {
    "$type": "shadow",
    "$value": "0 1px 3px rgba(20, 28, 44, 0.04), 0 8px 24px rgba(20, 28, 44, 0.03)",
    "description": "Central default: Skygge på hævede overflader."
  },
  "duration.fast": {
    "$type": "duration",
    "$value": "140ms",
    "description": "Central default: Varighed af små visuelle tilstandsskift."
  },
  "color.background.inverse": {
    "$type": "color",
    "$value": "{color.text.primary}",
    "description": "Central semantic default: inherits color.text.primary so components follow the selected theme. A theme may provide its own documented value."
  },
  "color.text.muted": {
    "$type": "color",
    "$value": "{color.text.secondary}",
    "description": "Central semantic default: inherits color.text.secondary so components follow the selected theme. A theme may provide its own documented value."
  },
  "color.text.label": {
    "$type": "color",
    "$value": "{color.text.secondary}",
    "description": "Central semantic default: inherits color.text.secondary so components follow the selected theme. A theme may provide its own documented value."
  },
  "color.text.inverse": {
    "$type": "color",
    "$value": "{color.background.surface}",
    "description": "Central semantic default: inherits color.background.surface so components follow the selected theme. A theme may provide its own documented value."
  },
  "color.border.strong": {
    "$type": "color",
    "$value": "{color.text.secondary}",
    "description": "Central semantic default: inherits color.text.secondary so components follow the selected theme. A theme may provide its own documented value."
  },
  "color.brand.accent": {
    "$type": "color",
    "$value": "{color.action.primary.rest.surface}",
    "description": "Central semantic default: inherits color.action.primary so components follow the selected theme. A theme may provide its own documented value."
  },
  "typography.size.caption": {
    "$type": "dimension",
    "$value": "{typography.size.small}",
    "description": "Central semantic default: inherits typography.size.small so components follow the selected theme. A theme may provide its own documented value."
  },
  "typography.size.toolLabel": {
    "$type": "dimension",
    "$value": "13px",
    "description": "Compact tool labels beneath an icon; the shared tool variant keeps a 52 px minimum target."
  },
  "typography.size.control": {
    "$type": "dimension",
    "$value": "{typography.size.label}",
    "description": "Central semantic default: inherits typography.size.label so components follow the selected theme. A theme may provide its own documented value."
  },
  "typography.size.display": {
    "$type": "dimension",
    "$value": "3.5rem",
    "description": "Central default: Stor overskrift; skaleres responsivt i display-varianten."
  },
  "typography.size.tag": {
    "$type": "dimension",
    "$value": "{typography.size.label}",
    "description": "Central semantic default: inherits typography.size.label so components follow the selected theme. A theme may provide its own documented value."
  },
  "typography.weight.display": {
    "$type": "fontWeight",
    "$value": "{typography.weight.heading}",
    "description": "Central semantic default: inherits typography.weight.heading so components follow the selected theme. A theme may provide its own documented value."
  },
  "typography.lineHeight.subtitle": {
    "$type": "number",
    "$value": "{typography.lineHeight.heading}",
    "description": "Central semantic default: inherits typography.lineHeight.heading so components follow the selected theme. A theme may provide its own documented value."
  },
  "typography.lineHeight.display": {
    "$type": "number",
    "$value": "{typography.lineHeight.heading}",
    "description": "Central semantic default: inherits typography.lineHeight.heading so components follow the selected theme. A theme may provide its own documented value."
  },
  "typography.lineHeight.label": {
    "$type": "number",
    "$value": "{typography.lineHeight.body}",
    "description": "Central semantic default: inherits typography.lineHeight.body so components follow the selected theme. A theme may provide its own documented value."
  },
  "typography.tracking.label": {
    "$type": "dimension",
    "$value": "0.08em",
    "description": "Central default: Diskret bogstavafstand i korte kategorietiketter."
  },
  "typography.tracking.display": {
    "$type": "dimension",
    "$value": "-0.02em",
    "description": "Central default: Bogstavafstand for rollen display; negativ tracking er til større seriftekst."
  },
  "typography.measure.body": {
    "$type": "dimension",
    "$value": "62ch",
    "description": "Central default: Anbefalet maksimal målebredde til læsetekst; projektet vælger layout."
  },
  "size.checkbox.indicator": {
    "$type": "dimension",
    "$value": "8px",
    "description": "Central default: Fælles mål for checkbox.indicator fra Fjordsides kontrolgeometri."
  },
  "size.switch.width": {
    "$type": "dimension",
    "$value": "44px",
    "description": "Central default: Kontaktens visuelle bredde; label bevarer den store klikflade."
  },
  "size.switch.height": {
    "$type": "dimension",
    "$value": "24px",
    "description": "Central default: Kontaktens visuelle højde."
  },
  "size.switch.thumb": {
    "$type": "dimension",
    "$value": "18px",
    "description": "Central default: Kontaktens runde markør."
  },
  "size.switch.inset": {
    "$type": "dimension",
    "$value": "2px",
    "description": "Central default: Fælles mål for switch.inset fra Fjordsides kontrolgeometri."
  },
  "size.switch.checkedOffset": {
    "$type": "dimension",
    "$value": "22px",
    "description": "Central default: Ældre adapteres offset; biblioteket beregner position fra bredde, markør og inset."
  },
  "size.notice.marker": {
    "$type": "dimension",
    "$value": "10px",
    "description": "Central default: Fælles mål for notice.marker fra Fjordsides kontrolgeometri."
  },
  "radius.radio": {
    "$type": "dimension",
    "$value": "50%",
    "description": "Central default: Den funktionelle cirkel i et radiovalg."
  },
  "shadow.floating": {
    "$type": "shadow",
    "$value": "0 12px 40px rgba(20, 28, 44, 0.14)",
    "description": "Central default: Dybde til dialoger og flader over indholdet."
  },
  "duration.base": {
    "$type": "duration",
    "$value": "180ms",
    "description": "Central default: Rolige farve- og kantændringer."
  },
  "color.background.control": {
    "$type": "color",
    "$value": "{color.background.surface}",
    "description": "Central semantic default: inherits color.background.surface so components follow the selected theme. A theme may provide its own documented value."
  },
  "color.narrative.text": {
    "$type": "color",
    "$value": "{color.caption.text}",
    "description": "Compatibility alias for color.caption.text. Use the canonical token in new integrations."
  },
  "color.narrative.clock": {
    "$type": "color",
    "$value": "{color.caption.labelSurface}",
    "description": "Compatibility alias for color.caption.labelSurface. Use the canonical token in new integrations."
  },
  "typography.font.narrative": {
    "$type": "fontFamily",
    "$value": "{typography.font.expressive}",
    "description": "Compatibility alias for typography.font.expressive. Use the canonical token in new integrations."
  },
  "typography.size.tiny": {
    "$type": "dimension",
    "$value": "{typography.size.small}",
    "description": "Central semantic default: inherits typography.size.small so components follow the selected theme. A theme may provide its own documented value."
  },
  "typography.size.shortcut": {
    "$type": "dimension",
    "$value": "{typography.size.small}",
    "description": "Central semantic default: inherits typography.size.small so components follow the selected theme. A theme may provide its own documented value."
  },
  "typography.size.close": {
    "$type": "dimension",
    "$value": "{typography.size.title}",
    "description": "Central semantic default: inherits typography.size.title so components follow the selected theme. A theme may provide its own documented value."
  },
  "typography.size.libraryHeading": {
    "$type": "dimension",
    "$value": "{typography.size.expressive}",
    "description": "Compatibility alias for typography.size.expressive. Use the canonical token in new integrations."
  },
  "typography.size.libraryDetail": {
    "$type": "dimension",
    "$value": "{typography.size.expressiveLarge}",
    "description": "Compatibility alias for typography.size.expressiveLarge. Use the canonical token in new integrations."
  },
  "typography.size.narrative": {
    "$type": "dimension",
    "$value": "{typography.size.captionText}",
    "description": "Compatibility alias for typography.size.captionText. Use the canonical token in new integrations."
  },
  "typography.weight.strong": {
    "$type": "fontWeight",
    "$value": "{typography.weight.heading}",
    "description": "Central semantic default: inherits typography.weight.heading so components follow the selected theme. A theme may provide its own documented value."
  },
  "typography.weight.narrative": {
    "$type": "fontWeight",
    "$value": "{typography.weight.expressive}",
    "description": "Compatibility alias for typography.weight.expressive. Use the canonical token in new integrations."
  },
  "typography.lineHeight.note": {
    "$type": "number",
    "$value": "{typography.lineHeight.body}",
    "description": "Central semantic default: inherits typography.lineHeight.body so components follow the selected theme. A theme may provide its own documented value."
  },
  "typography.lineHeight.tiny": {
    "$type": "number",
    "$value": "{typography.lineHeight.body}",
    "description": "Central semantic default: inherits typography.lineHeight.body so components follow the selected theme. A theme may provide its own documented value."
  },
  "typography.lineHeight.narrative": {
    "$type": "number",
    "$value": "{typography.lineHeight.captionText}",
    "description": "Compatibility alias for typography.lineHeight.captionText. Use the canonical token in new integrations."
  },
  "typography.tracking.section": {
    "$type": "dimension",
    "$value": "0.8px",
    "description": "Central default: Eksisterende bogstavafstand for section."
  },
  "typography.tracking.brand": {
    "$type": "dimension",
    "$value": "0.3px",
    "description": "Central default: Eksisterende bogstavafstand for brand."
  },
  "typography.tracking.clock": {
    "$type": "dimension",
    "$value": "{typography.tracking.captionLabel}",
    "description": "Compatibility alias for typography.tracking.captionLabel. Use the canonical token in new integrations."
  },
  "radius.segment": {
    "$type": "dimension",
    "$value": "{radius.control}",
    "description": "Central semantic default: inherits radius.control so components follow the selected theme. A theme may provide its own documented value."
  },
  "radius.tool": {
    "$type": "dimension",
    "$value": "{radius.actionButton}",
    "description": "Compatibility alias for radius.actionButton. Use the canonical token in new integrations."
  },
  "radius.note": {
    "$type": "dimension",
    "$value": "{radius.control}",
    "description": "Central semantic default: inherits radius.control so components follow the selected theme. A theme may provide its own documented value."
  },
  "radius.pill": {
    "$type": "dimension",
    "$value": "{radius.badge}",
    "description": "Central semantic default: inherits radius.badge so components follow the selected theme. A theme may provide its own documented value."
  },
  "space.control.inset": {
    "$type": "dimension",
    "$value": "4px",
    "description": "Central default: Bevaret kompakt editorafstand."
  },
  "shadow.selected": {
    "$type": "shadow",
    "$value": "0 1px 3px rgba(20, 28, 44, 0.12)",
    "description": "Central default: Lille skygge under det valgte segment."
  },
  "opacity.shortcut": {
    "$type": "number",
    "$value": 1,
    "description": "Central default: Eksisterende visuel tilstand shortcut."
  },
  "size.icon.brand": {
    "$type": "dimension",
    "$value": "22px",
    "description": "Central default: Eksisterende reference for icon.brand; produktet ejer layout."
  },
  "size.icon.action": {
    "$type": "dimension",
    "$value": "22px",
    "description": "Central default: Ikon i en handlingsknap."
  },
  "size.icon.panel": {
    "$type": "dimension",
    "$value": "{size.icon.compact}",
    "description": "Compatibility alias for size.icon.compact. Use the canonical token in new integrations."
  },
  "size.icon.tool": {
    "$type": "dimension",
    "$value": "{size.icon.action}",
    "description": "Compatibility alias for size.icon.action. Use the canonical token in new integrations."
  },
  "size.tool.width": {
    "$type": "dimension",
    "$value": "{size.actionButton.width}",
    "description": "Compatibility alias for size.actionButton.width. Use the canonical token in new integrations."
  },
  "color.background.detail": {
    "$type": "color",
    "$value": "{color.background.surface}",
    "description": "Central semantic default: inherits color.background.surface so components follow the selected theme. A theme may provide its own documented value."
  },
  "color.narrative.surface": {
    "$type": "color",
    "$value": "{color.caption.surface}",
    "description": "Compatibility alias for color.caption.surface. Use the canonical token in new integrations."
  },
  "typography.size.clock": {
    "$type": "dimension",
    "$value": "{typography.size.label}",
    "description": "Central semantic default: inherits typography.size.label so components follow the selected theme. A theme may provide its own documented value."
  },
  "typography.size.panel": {
    "$type": "dimension",
    "$value": "{typography.size.title}",
    "description": "Central semantic default: inherits typography.size.title so components follow the selected theme. A theme may provide its own documented value."
  },
  "space.component.padding": {
    "$type": "dimension",
    "$value": "{space.scale.4}",
    "description": "Required positive inset for shared surfaces."
  },
  "space.component.paddingLarge": {
    "$type": "dimension",
    "$value": "{space.scale.6}",
    "description": "Required positive inset for cards and dialogs."
  },
  "space.component.paddingCompact": {
    "$type": "dimension",
    "$value": "{space.scale.2}",
    "description": "Required positive inset for compact controls."
  },
  "space.component.gap": {
    "$type": "dimension",
    "$value": "{space.scale.2}",
    "description": "Required positive separation within shared components."
  },
  "space.component.gapLarge": {
    "$type": "dimension",
    "$value": "{space.scale.4}",
    "description": "Required positive separation within shared surfaces."
  },
  "size.brand.logo": {
    "$type": "dimension",
    "$value": "12rem",
    "description": "Central default: maximum size of an approved original logo; proportions are preserved."
  },
  "typography.font.expressive": {
    "$type": "fontFamily",
    "$value": "{typography.font.heading}",
    "description": "Central semantic default for typography.font.expressive. Themes may provide their own documented value."
  },
  "typography.weight.expressive": {
    "$type": "fontWeight",
    "$value": "{typography.weight.heading}",
    "description": "Central semantic default for typography.weight.expressive. Themes may provide their own documented value."
  },
  "typography.size.captionText": {
    "$type": "dimension",
    "$value": "0.875rem",
    "description": "Central default: Læselig billedtekst under en illustration eller indholdsvisning."
  },
  "typography.lineHeight.captionText": {
    "$type": "number",
    "$value": 1.5,
    "description": "Central default: Luft mellem billedtekstens linjer."
  },
  "typography.size.expressive": {
    "$type": "dimension",
    "$value": "2.5rem",
    "description": "Central default: Særskilt overskriftsrolle med plads til temaets typografi."
  },
  "typography.size.expressiveLarge": {
    "$type": "dimension",
    "$value": "3.5rem",
    "description": "Central default: Stor særskilt overskriftsrolle."
  },
  "typography.tracking.captionLabel": {
    "$type": "dimension",
    "$value": "1.5px",
    "description": "Central semantic default for typography.tracking.captionLabel. Themes may provide their own documented value."
  },
  "color.caption.text": {
    "$type": "color",
    "$value": "{color.text.primary}",
    "description": "Central semantic default for color.caption.text. Themes may provide their own documented value."
  },
  "color.caption.labelSurface": {
    "$type": "color",
    "$value": "{color.text.secondary}",
    "description": "Central semantic default for color.caption.labelSurface. Themes may provide their own documented value."
  },
  "color.caption.surface": {
    "$type": "color",
    "$value": "{color.background.surface}",
    "description": "Central semantic default for color.caption.surface. Themes may provide their own documented value."
  },
  "size.actionButton.width": {
    "$type": "dimension",
    "$value": "64px",
    "description": "Central semantic default for size.actionButton.width. Themes may provide their own documented value."
  },
  "size.icon.compact": {
    "$type": "dimension",
    "$value": "18px",
    "description": "Central default: Ikon i en vandret kompakt handling."
  },
  "radius.actionButton": {
    "$type": "dimension",
    "$value": "{radius.control}",
    "description": "Central semantic default for radius.actionButton. Themes may provide their own documented value."
  },
  "color.caption.labelText": {
    "$type": "color",
    "$value": "{color.action.primary.rest.text}",
    "description": "Text on the caption label surface. Preserve readable contrast."
  },
  "color.border.field": {
    "$type": "color",
    "$value": "{color.text.secondary}",
    "description": "Central default: Fælles kant på indtastning og indrammede handlinger. Overfladekanter bruger color.border.default."
  },
  "color.action.neutral.hover.surface": {
    "$type": "color",
    "$value": "#e1e5ee",
    "description": "Central default: neutral Hover interaction role; themes specify a matching, contrasting colour pair."
  },
  "color.action.neutral.hover.text": {
    "$type": "color",
    "$value": "#202632",
    "description": "Central default: neutral HoverText interaction role; themes specify a matching, contrasting colour pair."
  },
  "color.action.neutral.active.surface": {
    "$type": "color",
    "$value": "#ccd5e3",
    "description": "Central default: neutral Active interaction role; themes specify a matching, contrasting colour pair."
  },
  "color.action.neutral.active.text": {
    "$type": "color",
    "$value": "#202632",
    "description": "Central default: neutral ActiveText interaction role; themes specify a matching, contrasting colour pair."
  },
  "color.action.primary.hover.surface": {
    "$type": "color",
    "$value": "#3646a5",
    "description": "Central default: primary Hover interaction role; themes specify a matching, contrasting colour pair."
  },
  "color.action.primary.hover.text": {
    "$type": "color",
    "$value": "#ffffff",
    "description": "Central default: primary HoverText interaction role; themes specify a matching, contrasting colour pair."
  },
  "color.action.primary.active.surface": {
    "$type": "color",
    "$value": "#293987",
    "description": "Central default: primary Active interaction role; themes specify a matching, contrasting colour pair."
  },
  "color.action.primary.active.text": {
    "$type": "color",
    "$value": "#ffffff",
    "description": "Central default: primary ActiveText interaction role; themes specify a matching, contrasting colour pair."
  },
  "color.action.selected.hover.surface": {
    "$type": "color",
    "$value": "#dbe3f5",
    "description": "Central default: selected Hover interaction role; themes specify a matching, contrasting colour pair."
  },
  "color.action.selected.hover.text": {
    "$type": "color",
    "$value": "#202632",
    "description": "Central default: selected HoverText interaction role; themes specify a matching, contrasting colour pair."
  },
  "color.action.selected.active.surface": {
    "$type": "color",
    "$value": "#c7d4ef",
    "description": "Central default: selected Active interaction role; themes specify a matching, contrasting colour pair."
  },
  "color.action.selected.active.text": {
    "$type": "color",
    "$value": "#202632",
    "description": "Central default: selected ActiveText interaction role; themes specify a matching, contrasting colour pair."
  },
  "color.action.danger.hover.surface": {
    "$type": "color",
    "$value": "#9f1c2e",
    "description": "Central default: danger Hover interaction role; themes specify a matching, contrasting colour pair."
  },
  "color.action.danger.hover.text": {
    "$type": "color",
    "$value": "#ffffff",
    "description": "Central default: danger HoverText interaction role; themes specify a matching, contrasting colour pair."
  },
  "color.action.danger.active.surface": {
    "$type": "color",
    "$value": "#841326",
    "description": "Central default: danger Active interaction role; themes specify a matching, contrasting colour pair."
  },
  "color.action.danger.active.text": {
    "$type": "color",
    "$value": "#ffffff",
    "description": "Central default: danger ActiveText interaction role; themes specify a matching, contrasting colour pair."
  },
  "color.action.accent.hover.surface": {
    "$type": "color",
    "$value": "{color.action.primary.hover.surface}",
    "description": "Central default: Accent interaction follows primary unless the theme defines its own accent family."
  },
  "color.action.accent.hover.text": {
    "$type": "color",
    "$value": "{color.action.primary.hover.text}",
    "description": "Central default: Accent interaction follows primary unless the theme defines its own accent family."
  },
  "color.action.accent.active.surface": {
    "$type": "color",
    "$value": "{color.action.primary.active.surface}",
    "description": "Central default: Accent interaction follows primary unless the theme defines its own accent family."
  },
  "color.action.accent.active.text": {
    "$type": "color",
    "$value": "{color.action.primary.active.text}",
    "description": "Central default: Accent interaction follows primary unless the theme defines its own accent family."
  }
}));
// Historical recipes remain available to generated CSS and existing integrations.
export const BUTTON_COMPATIBILITY_VARIANTS=freeze({
  "desktop": {
    "description": "Kompakt desktopbetjening med 32 px klikflader. Brug standardvarianten ved touch eller behov for større mål.",
    "styles": {
      "minHeight": "32px",
      "padding": "max(0px, calc((32px - 1em * {typography.lineHeight.control}) / 2 - {border.width.default})) {space.component.padding}",
      "lineHeight": "{typography.lineHeight.control}",
      "minWidth": "32px",
      "backgroundColor": "{color.background.control}",
      "color": "{color.text.primary}",
      "borderColor": "{color.border.field}",
      "--ds-interaction-hover-surface": "{color.action.neutral.hover.surface}",
      "--ds-interaction-hover-text": "{color.action.neutral.hover.text}",
      "--ds-interaction-active-surface": "{color.action.neutral.active.surface}",
      "--ds-interaction-active-text": "{color.action.neutral.active.text}"
    }
  },
  "danger": {
    "description": "Destruktiv handling eller fejlstatus.",
    "styles": {
      "backgroundColor": "{color.status.danger}",
      "color": "{color.status.dangerContrast}",
      "padding": "{space.component.paddingCompact} {space.component.padding}",
      "--ds-interaction-hover-surface": "{color.action.danger.hover.surface}",
      "--ds-interaction-hover-text": "{color.action.danger.hover.text}",
      "--ds-interaction-active-surface": "{color.action.danger.active.surface}",
      "--ds-interaction-active-text": "{color.action.danger.active.text}"
    }
  },
  "accent": {
    "description": "Særskilt fremhævning.",
    "styles": {
      "backgroundColor": "{color.brand.accent}",
      "color": "{color.background.canvas}",
      "borderColor": "{color.brand.accent}",
      "padding": "{space.component.paddingCompact} {space.component.padding}",
      "--ds-interaction-hover-surface": "{color.action.accent.hover.surface}",
      "--ds-interaction-hover-text": "{color.action.accent.hover.text}",
      "--ds-interaction-active-surface": "{color.action.accent.active.surface}",
      "--ds-interaction-active-text": "{color.action.accent.active.text}"
    }
  },
  "toolbar": {
    "description": "Kompakt handling i en gruppe.",
    "styles": {
      "border": "0",
      "backgroundColor": "transparent",
      "padding": "{space.component.paddingCompact}",
      "color": "{color.text.primary}",
      "--ds-interaction-hover-surface": "{color.action.neutral.hover.surface}",
      "--ds-interaction-hover-text": "{color.action.neutral.hover.text}",
      "--ds-interaction-active-surface": "{color.action.neutral.active.surface}",
      "--ds-interaction-active-text": "{color.action.neutral.active.text}"
    }
  },
  "icon": {
    "description": "Handling med ikon.",
    "styles": {
      "border": "0",
      "backgroundColor": "transparent",
      "padding": "{space.component.paddingCompact}",
      "display": "flex",
      "alignItems": "center",
      "color": "{color.text.primary}",
      "--ds-interaction-hover-surface": "{color.action.neutral.hover.surface}",
      "--ds-interaction-hover-text": "{color.action.neutral.hover.text}",
      "--ds-interaction-active-surface": "{color.action.neutral.active.surface}",
      "--ds-interaction-active-text": "{color.action.neutral.active.text}"
    }
  },
  "menu": {
    "description": "Handling i en menuliste.",
    "styles": {
      "display": "block",
      "width": "100%",
      "textAlign": "left",
      "border": "0",
      "backgroundColor": "transparent",
      "padding": "{space.component.paddingCompact}",
      "color": "{color.text.primary}",
      "--ds-interaction-hover-surface": "{color.action.neutral.hover.surface}",
      "--ds-interaction-hover-text": "{color.action.neutral.hover.text}",
      "--ds-interaction-active-surface": "{color.action.neutral.active.surface}",
      "--ds-interaction-active-text": "{color.action.neutral.active.text}"
    },
    "parts": {
      "description": {
        "styles": {
          "display": "block"
        }
      }
    }
  },
  "dismiss": {
    "description": "Lukke- eller afvisningshandling.",
    "styles": {
      "border": "0",
      "backgroundColor": "transparent",
      "padding": "{space.component.paddingCompact}",
      "fontSize": "{typography.size.close}",
      "lineHeight": 1,
      "color": "{color.text.secondary}",
      "--ds-interaction-hover-surface": "{color.action.neutral.hover.surface}",
      "--ds-interaction-hover-text": "{color.action.neutral.hover.text}",
      "--ds-interaction-active-surface": "{color.action.neutral.active.surface}",
      "--ds-interaction-active-text": "{color.action.neutral.active.text}"
    }
  },
  "list-item": {
    "description": "Handling knyttet til en listepost.",
    "styles": {
      "display": "block",
      "width": "100%",
      "textAlign": "left",
      "border": "0",
      "borderBottom": "{border.width.default} solid {color.border.default}",
      "backgroundColor": "transparent",
      "padding": "{space.component.paddingCompact}",
      "color": "{color.text.primary}",
      "--ds-interaction-hover-surface": "{color.action.neutral.hover.surface}",
      "--ds-interaction-hover-text": "{color.action.neutral.hover.text}",
      "--ds-interaction-active-surface": "{color.action.neutral.active.surface}",
      "--ds-interaction-active-text": "{color.action.neutral.active.text}"
    },
    "parts": {
      "description": {
        "styles": {
          "display": "block"
        }
      }
    }
  },
  "link": {
    "description": "Typografisk fremhævet handling.",
    "styles": {
      "border": "0",
      "backgroundColor": "transparent",
      "padding": "{space.component.paddingCompact}",
      "fontWeight": "{typography.weight.strong}",
      "color": "{color.action.selected.rest.text}",
      "--ds-interaction-hover-surface": "{color.action.neutral.hover.surface}",
      "--ds-interaction-hover-text": "{color.action.neutral.hover.text}",
      "--ds-interaction-active-surface": "{color.action.neutral.active.surface}",
      "--ds-interaction-active-text": "{color.action.neutral.active.text}"
    }
  },
  "danger-subtle": {
    "description": "Destruktiv handling med lav fremhævning.",
    "styles": {
      "border": "0",
      "backgroundColor": "transparent",
      "color": "{color.status.danger}",
      "fontWeight": "{typography.weight.strong}",
      "padding": "{space.component.paddingCompact}",
      "--ds-interaction-hover-surface": "{color.action.danger.hover.surface}",
      "--ds-interaction-hover-text": "{color.action.danger.hover.text}",
      "--ds-interaction-active-surface": "{color.action.danger.active.surface}",
      "--ds-interaction-active-text": "{color.action.danger.active.text}"
    }
  },
  "rounded": {
    "description": "Afrundet handling.",
    "styles": {
      "border": "{border.width.default} solid {color.border.field}",
      "backgroundColor": "{color.caption.surface}",
      "borderRadius": "{radius.pill}",
      "padding": "{space.component.paddingCompact} {space.component.padding}",
      "color": "{color.text.primary}",
      "--ds-interaction-hover-surface": "{color.action.neutral.hover.surface}",
      "--ds-interaction-hover-text": "{color.action.neutral.hover.text}",
      "--ds-interaction-active-surface": "{color.action.neutral.active.surface}",
      "--ds-interaction-active-text": "{color.action.neutral.active.text}"
    }
  },
  "dismiss-small": {
    "description": "Lille lukkehandling.",
    "styles": {
      "border": "0",
      "backgroundColor": "transparent",
      "padding": "{space.component.paddingCompact}",
      "fontSize": "{typography.size.clock}",
      "lineHeight": 1,
      "color": "{color.text.secondary}",
      "--ds-interaction-hover-surface": "{color.action.neutral.hover.surface}",
      "--ds-interaction-hover-text": "{color.action.neutral.hover.text}",
      "--ds-interaction-active-surface": "{color.action.neutral.active.surface}",
      "--ds-interaction-active-text": "{color.action.neutral.active.text}"
    }
  },
  "compact": {
    "description": "Kompakt opbygning.",
    "styles": {
      "fontSize": "{typography.size.small}",
      "padding": "{space.component.paddingCompact} {space.component.padding}",
      "border": "{border.width.default} solid {color.border.field}",
      "backgroundColor": "{color.background.control}",
      "color": "{color.text.primary}",
      "--ds-interaction-hover-surface": "{color.action.neutral.hover.surface}",
      "--ds-interaction-hover-text": "{color.action.neutral.hover.text}",
      "--ds-interaction-active-surface": "{color.action.neutral.active.surface}",
      "--ds-interaction-active-text": "{color.action.neutral.active.text}"
    }
  },
  "dismiss-compact": {
    "description": "Lukkehandling i en tæt opbygning.",
    "styles": {
      "border": "0",
      "backgroundColor": "transparent",
      "fontSize": "{typography.size.panel}",
      "padding": "{space.component.paddingCompact}",
      "lineHeight": 1,
      "color": "{color.text.secondary}",
      "--ds-interaction-hover-surface": "{color.action.neutral.hover.surface}",
      "--ds-interaction-hover-text": "{color.action.neutral.hover.text}",
      "--ds-interaction-active-surface": "{color.action.neutral.active.surface}",
      "--ds-interaction-active-text": "{color.action.neutral.active.text}"
    }
  }
});
export const BUTTON_SIZES=freeze({
  "small": {
    "minHeight": "32px",
    "minWidth": "32px",
    "fontSize": "{typography.size.control}",
    "padding": "max(0px, calc((32px - 1em * {typography.lineHeight.control}) / 2 - {border.width.default})) {space.component.padding}"
  },
  "medium": {
    "minHeight": "44px",
    "minWidth": "44px",
    "fontSize": "{typography.size.label}",
    "padding": "max(0px, calc((44px - 1em * {typography.lineHeight.control}) / 2 - {border.width.default})) {space.component.padding}"
  },
  "large": {
    "minHeight": "48px",
    "minWidth": "48px",
    "fontSize": "{typography.size.body}",
    "padding": "max(0px, calc((48px - 1em * {typography.lineHeight.control}) / 2 - {border.width.default})) {space.component.padding}"
  }
});
export const BUTTON_DANGER_VARIANTS=freeze({
  "primary": {
    "backgroundColor": "{color.status.danger}",
    "color": "{color.status.dangerContrast}",
    "borderColor": "transparent",
    "--ds-interaction-hover-surface": "{color.action.danger.hover.surface}",
    "--ds-interaction-hover-text": "{color.action.danger.hover.text}",
    "--ds-interaction-active-surface": "{color.action.danger.active.surface}",
    "--ds-interaction-active-text": "{color.action.danger.active.text}"
  },
  "tertiary": {
    "backgroundColor": "transparent",
    "color": "{color.status.danger}",
    "borderColor": "{color.status.danger}",
    "--ds-interaction-hover-surface": "{color.action.danger.hover.surface}",
    "--ds-interaction-hover-text": "{color.action.danger.hover.text}",
    "--ds-interaction-active-surface": "{color.action.danger.active.surface}",
    "--ds-interaction-active-text": "{color.action.danger.active.text}"
  },
  "ghost": {
    "backgroundColor": "transparent",
    "color": "{color.status.danger}",
    "borderColor": "transparent",
    "--ds-interaction-hover-surface": "{color.action.danger.hover.surface}",
    "--ds-interaction-hover-text": "{color.action.danger.hover.text}",
    "--ds-interaction-active-surface": "{color.action.danger.active.surface}",
    "--ds-interaction-active-text": "{color.action.danger.active.text}"
  }
});
export const buttonVariantIds=component=>Object.keys(component.variants).filter(id=>!Object.hasOwn(BUTTON_COMPATIBILITY_VARIANTS,id));
const FORM_LAYOUT={display:'flex',flexDirection:'column',gap:'{space.component.gap}',minWidth:'0',maxWidth:'100%',boxSizing:'border-box',fontFamily:'{typography.font.body}'};
const FORM_LABEL={fontSize:'{typography.size.label}',fontWeight:'{typography.weight.label}',lineHeight:'{typography.lineHeight.label}',color:'{color.text.primary}',overflowWrap:'anywhere',minWidth:'0'};
const FORM_HINT={margin:'0',fontSize:'{typography.size.small}',lineHeight:'{typography.lineHeight.body}',color:'{color.text.secondary}',overflowWrap:'anywhere'};
const FORM_CONTROL={boxSizing:'border-box',width:'100%',minWidth:'0',maxWidth:'100%',minHeight:'max(44px, {size.control.height})',padding:'{space.component.paddingCompact} {space.component.padding}',border:'{border.width.default} solid {color.border.field}',borderRadius:'{radius.control}',backgroundColor:'{color.background.control}',color:'{color.text.primary}',fontFamily:'{typography.font.body}',fontSize:'{typography.size.control}',lineHeight:'{typography.lineHeight.body}'};
const CHOICE_INVALID={description:'En fejlbesked knyttet til valget.',styles:{},parts:{error:{styles:{display:'block'}}}};
const choiceDescriptions=id=>({body:{selector:'.ds-'+id+'__body',styles:{display:'flex',flexDirection:'column',gap:'{space.scale.1}',minWidth:'0',overflowWrap:'anywhere'}},hint:{selector:'.ds-'+id+'__hint',styles:FORM_HINT},error:{selector:'.ds-'+id+'__error',styles:{...FORM_HINT,color:'{color.status.dangerText}',display:'none'}}});
function nativeField(id,name,description,tag,attrs){
 return {name,description,usage:'Angiv label, value og eventuel hint/error. Bevar den native kontrol; produktet ejer data og validering. readOnly bevarer fokus og kopiering, disabled udelader kontrollen fra formularens indsendelse.',composes:[],
  parts:{root:{selector:'.ds-'+id,styles:FORM_LAYOUT},label:{selector:'.ds-'+id+'__label',styles:FORM_LABEL},control:{selector:'.ds-'+id+'__control',styles:{...FORM_CONTROL,...(tag==='textarea'?{minHeight:'7rem',resize:'vertical'}:{})}},hint:{selector:'.ds-'+id+'__hint',styles:FORM_HINT},error:{selector:'.ds-'+id+'__error',styles:{...FORM_HINT,color:'{color.status.dangerText}',display:'none'}}},
  variants:{default:{description:'Label, native kontrol og valgfri hjælp.',styles:{}},invalid:{description:'Synlig valideringsfejl knyttet til kontrollen.',styles:{},parts:{control:{styles:{borderColor:'{color.status.danger}'}},error:{styles:{display:'block'}}}}},
  states:{focus:{description:'Synligt tastaturfokus på kontrollen.',styles:{},parts:{control:{styles:{outline:'{border.width.focus} solid {color.focus}',outlineOffset:'{border.offset.focus}'}}}},disabled:{description:'Native deaktiveret kontrol.',styles:{},parts:{control:{styles:{backgroundColor:'{color.disabled.surface}',color:'{color.disabled.text}',cursor:'not-allowed'}}}},readOnly:{description:'Kan læses og kopieres, men ikke redigeres.',styles:{},parts:{control:{styles:{backgroundColor:'{color.background.subtle}'}}}}},
  preview:{tag:'div',part:'root',children:[{tag:'label',part:'label',text:name},{tag,part:'control',attrs},{tag:'p',part:'hint',text:''},{tag:'p',part:'error',text:'Kontrollér værdien.'}]}
 };
}
function inputChoice(id,name,multiple=false){
 const action={display:'inline-flex',alignItems:'center',justifyContent:'center',boxSizing:'border-box',minWidth:'44px',minHeight:'44px',padding:'{space.component.paddingCompact}',border:'{border.width.default} solid {color.border.field}',borderRadius:'{radius.control}',backgroundColor:'{color.background.control}',color:'{color.text.primary}',fontFamily:'{typography.font.body}',cursor:'pointer',flexShrink:'0'};
 return {name,description:multiple?'Filtrerede muligheder med flere valgte værdier.':'Tekstfelt med filtrerede valgmuligheder og ét valgt element.',usage:'Brug items med stabile id/label og montér den fælles controller. Input beholder fokus, mens piletaster navigerer listbox. Produktet ejer data, forespørgsler, loading/error og vedvarende valg. Brug native select til korte, kendte lister.',composes:[],
  parts:{root:{selector:'.ds-'+id,styles:{...FORM_LAYOUT,position:'relative'}},label:{selector:'.ds-'+id+'__label',styles:FORM_LABEL},wrapper:{selector:'.ds-'+id+'__wrapper',styles:{display:'flex',alignItems:'center',gap:'{space.scale.1}',minWidth:'0'}},control:{selector:'.ds-'+id+'__control',styles:{...FORM_CONTROL,flex:'1 1 auto'}},clear:{selector:'.ds-'+id+'__clear',styles:action},toggle:{selector:'.ds-'+id+'__toggle',styles:action},listbox:{selector:'.ds-'+id+'__listbox',styles:{boxSizing:'border-box',position:'fixed',zIndex:'{layer.popover}',margin:'0',padding:'{space.component.paddingCompact}',width:'min(28rem, calc(100vw - 1rem))',maxWidth:'var(--ds-overlay-available-width, 100vw)',maxHeight:'min(18rem, var(--ds-overlay-available-height, 70vh))',overflowY:'auto',overscrollBehavior:'contain',border:'{border.width.default} solid {color.border.field}',borderRadius:'{radius.control}',backgroundColor:'{color.background.surface}',color:'{color.text.primary}',boxShadow:'{elevation.level3}',fontFamily:'{typography.font.body}',fontSize:'{typography.size.control}'}},option:{selector:'.ds-'+id+'__option',styles:{boxSizing:'border-box',display:'flex',alignItems:'center',minHeight:'44px',padding:'{space.component.paddingCompact} {space.component.padding}',border:'{border.width.default} solid transparent',borderRadius:'{radius.control}',overflowWrap:'anywhere',cursor:'pointer'}},hint:{selector:'.ds-'+id+'__hint',styles:FORM_HINT},error:{selector:'.ds-'+id+'__error',styles:{...FORM_HINT,display:'none',color:'{color.status.dangerText}'}},status:{selector:'.ds-'+id+'__status',styles:FORM_HINT},...(multiple?{selected:{selector:'.ds-'+id+'__selected',styles:{display:'flex',flexWrap:'wrap',gap:'{space.component.gap}',minWidth:'0'}},chip:{selector:'.ds-'+id+'__chip',styles:{display:'inline-flex',alignItems:'center',gap:'{space.scale.1}',maxWidth:'100%',padding:'0 {space.component.paddingCompact}',backgroundColor:'{color.action.selected.rest.surface}',color:'{color.action.selected.rest.text}',border:'{border.width.default} solid {color.border.field}',borderRadius:'{radius.control}',minHeight:'44px'}},'chip-label':{selector:'.ds-'+id+'__chip-label',styles:{minWidth:'0',overflowWrap:'anywhere'}},remove:{selector:'.ds-'+id+'__remove',styles:{...action,borderColor:'transparent',backgroundColor:'transparent',color:'inherit'}}}: {})},
  variants:{default:{description:'Native input med controllerbetjent listbox.',styles:{}},invalid:{description:'Valideringsfejl knyttet til input.',styles:{},parts:{control:{styles:{borderColor:'{color.status.danger}'}},error:{styles:{display:'block'}}}}},
  states:{focus:{description:'Input beholder tastaturfokus under navigation.',styles:{},parts:{control:{styles:{outline:'{border.width.focus} solid {color.focus}',outlineOffset:'{border.offset.focus}'}}}},disabled:{description:'Input og valg kan ikke betjenes.',styles:{},parts:{control:{styles:{backgroundColor:'{color.disabled.surface}',color:'{color.disabled.text}',cursor:'not-allowed'}}}},readOnly:{description:'Valget kan læses og kopieres, men ikke ændres.',styles:{},parts:{control:{styles:{backgroundColor:'{color.background.subtle}'}}}}},
  preview:{tag:'div',part:'root',children:[{tag:'label',part:'label',text:name},...(multiple?[{tag:'div',part:'selected',children:[{tag:'span',part:'chip',children:[{tag:'span',part:'chip-label',text:'Anna Larsen'},{tag:'button',part:'remove',attrs:{type:'button','aria-label':'Fjern Anna Larsen'},children:[{tag:'span',iconName:'x',attrs:{'aria-hidden':'true'}}]}]}]}]:[]),{tag:'div',part:'wrapper',children:[{tag:'input',part:'control',attrs:{type:'text',role:'combobox','aria-autocomplete':'list','aria-expanded':'false'}},{tag:'button',part:'clear',attrs:{type:'button','aria-label':'Ryd valg'},children:[{tag:'span',iconName:'x',attrs:{'aria-hidden':'true'}}]},{tag:'button',part:'toggle',attrs:{type:'button','aria-label':'Vis muligheder'},children:[{tag:'span',iconName:'chevron-down',attrs:{'aria-hidden':'true'}}]}]},{tag:'div',part:'listbox',attrs:{role:'listbox',hidden:true},children:[{tag:'div',part:'option',attrs:{role:'option','aria-selected':'false'},text:'Anna Larsen'}]},{tag:'p',part:'hint',text:''},{tag:'p',part:'error',text:'Kontrollér valget.'},{tag:'p',part:'status',attrs:{role:'status'},text:''}]}
 };
}
export const COMPONENT_LIBRARY=freeze({
  // Shared input-choice family definitions.
  combobox:inputChoice('combobox','Kombinationsfelt'),
  multiselect:inputChoice('multiselect','Flervalg',true),
  'date-picker':nativeField('date-picker','Dato','Native datofelt med label, hjælp og fejl.','input',{type:'date'}),
  'time-picker':nativeField('time-picker','Tidspunkt','Native tidsfelt med label, hjælp og fejl.','input',{type:'time'}),
  // Shared feedback and file-choice family definitions.
  spinner:{
    name:'Aktivitetsindikator',description:'En navngivet aktivitet uden kendt slutværdi.',usage:'Angiv label for arbejdet. Brug announce:false når en omgivende status allerede annoncerer aktiviteten. Brug progress til målelig fremdrift. Bevægelse er supplerende og slås fra ved reduceret bevægelse.',composes:[],
    parts:{root:{selector:'.ds-spinner',styles:{display:'inline-flex',alignItems:'center',gap:'{space.component.gap}',minWidth:'0',maxWidth:'100%',fontFamily:'{typography.font.body}',fontSize:'{typography.size.body}',lineHeight:'{typography.lineHeight.body}',color:'{color.text.primary}'}},indicator:{selector:'.ds-spinner__indicator',styles:{display:'inline-block',boxSizing:'border-box',width:'20px',height:'20px',flexShrink:'0',border:'2px solid currentColor',borderRightColor:'transparent',borderRadius:'50%'}},label:{selector:'.ds-spinner__label',styles:{minWidth:'0',overflowWrap:'anywhere'}}},
    variants:{default:{description:'Aktivitet med navn og 20 px indikator.',styles:{}},small:{description:'16 px indikator til en kompakt status.',styles:{},parts:{indicator:{styles:{width:'16px',height:'16px'}}}},large:{description:'32 px indikator til en større ventetilstand.',styles:{},parts:{indicator:{styles:{width:'32px',height:'32px'}}}}},states:{},
    preview:{tag:'span',part:'root',attrs:{role:'status','aria-live':'polite','aria-atomic':'true'},children:[{tag:'span',part:'indicator',attrs:{'aria-hidden':'true'}},{tag:'span',part:'label',text:'Indlæser indhold…'}]}
  },
  progress:{
    name:'Fremdrift',description:'Navngivet native fremdrift med kendt eller ukendt slutværdi.',usage:'Angiv label og eventuelt value og max. Uden value er fremdriften ubestemt. Progress er ikke en live-region; annoncér meningsfulde milepæle i produktets status frem for hvert procenttrin.',composes:[],
    parts:{root:{selector:'.ds-progress',styles:{display:'flex',flexDirection:'column',gap:'{space.component.gap}',minWidth:'0',maxWidth:'100%',fontFamily:'{typography.font.body}',fontSize:'{typography.size.label}',lineHeight:'{typography.lineHeight.body}',color:'{color.text.primary}'}},label:{selector:'.ds-progress__label',styles:{overflowWrap:'anywhere'}},control:{selector:'.ds-progress__control',styles:{display:'block',width:'100%',minWidth:'0',height:'1rem',accentColor:'{color.action.primary.rest.surface}'}},value:{selector:'.ds-progress__value',styles:{fontSize:'{typography.size.small}',color:'{color.text.secondary}'}}},
    variants:{default:{description:'Label, native fremdrift og synlig værdi.',styles:{}},compact:{description:'Kompakt fremdrift uden ekstra værdilinje.',styles:{},parts:{value:{styles:{display:'none'}}}}},states:{},
    preview:{tag:'div',part:'root',children:[{tag:'label',part:'label',text:'Forbereder indhold'},{tag:'progress',part:'control',attrs:{max:'100',value:'45'},text:'45 %'},{tag:'span',part:'value',attrs:{'aria-hidden':'true'},text:'45 %'}]}
  },
  skeleton:{
    name:'Indlæsningspladsholder',description:'Dekorativ pladsreservation, mens indhold er på vej.',usage:'Skeleton er altid skjult for hjælpemidler. Giv den omgivende sektion én navngivet loading-status og eventuelt aria-busy; gentag ikke en status for hver pladsholder.',composes:[],
    parts:{root:{selector:'.ds-skeleton',styles:{display:'block',width:'100%',maxWidth:'100%',minWidth:'0',height:'1rem',borderRadius:'{radius.control}',backgroundColor:'{color.border.default}',boxSizing:'border-box'}}},
    variants:{default:{description:'En tekstlinje.',styles:{}},block:{description:'En større indholdsflade.',styles:{height:'7rem'}},circle:{description:'En rund plads til avatar eller symbol.',styles:{width:'44px',height:'44px',borderRadius:'50%'}}},states:{},
    preview:{tag:'span',part:'root',attrs:{'aria-hidden':'true'}}
  },
  toast:{
    name:'Kort meddelelse',description:'En kort meddelelse med lukning og valgfrie handlinger.',usage:'Forbind mountToast efter montering. En separat polite live-region annoncerer beskeden én gang uden knaptekster. Tidsbegrænsning pauser ved hover, fokus og skjult dokument; meddelelser med handlinger forsvinder kun ved eksplicit lukning. Produktet ejer placering og eventuel kø.',composes:['button'],
    parts:{root:{selector:'.ds-toast',styles:{display:'flex',flexDirection:'column',gap:'{space.component.gap}',minWidth:'0',maxWidth:'100%',boxSizing:'border-box',padding:'{space.component.padding}',border:'{border.width.default} solid {color.border.default}',borderRadius:'{radius.card}',backgroundColor:'{color.background.surface}',color:'{color.text.primary}',fontFamily:'{typography.font.body}',fontSize:'{typography.size.body}',lineHeight:'{typography.lineHeight.body}',boxShadow:'{elevation.level2}',overflowWrap:'anywhere'}},header:{selector:'.ds-toast__header',styles:{display:'flex',alignItems:'start',gap:'{space.component.gap}',minWidth:'0'}},title:{selector:'.ds-toast__title',styles:{margin:'0',flex:'1 1 auto',minWidth:'0',fontWeight:'{typography.weight.heading}',overflowWrap:'anywhere'}},body:{selector:'.ds-toast__body',styles:{margin:'0',color:'inherit',overflowWrap:'anywhere'}},actions:{selector:'.ds-toast__actions',styles:{display:'flex',flexWrap:'wrap',gap:'{space.component.gap}',minWidth:'0'}},close:{selector:'.ds-toast__close',styles:{display:'inline-flex',alignItems:'center',justifyContent:'center',minWidth:'44px',minHeight:'44px',flexShrink:'0',padding:'{space.component.paddingCompact}',border:'0',borderRadius:'{radius.control}',backgroundColor:'transparent',color:'inherit',cursor:'pointer'}},announcer:{selector:'.ds-toast__announcer',styles:{position:'absolute',left:'-10000px',width:'1px',height:'1px',overflow:'hidden'}}},
    variants:{default:{description:'En supplerende meddelelse.',styles:{}},danger:{description:'En fejl med forståelig forklaring.',styles:{backgroundColor:'{color.status.dangerSurface}',color:'{color.status.dangerText}',borderColor:'{color.status.danger}'}}},states:{},
    preview:{tag:'div',part:'root',attrs:{role:'group'},children:[{tag:'div',part:'header',children:[{tag:'strong',part:'title',text:'Ændringerne er gemt'},{tag:'button',part:'close',attrs:{type:'button','aria-label':'Luk meddelelsen','data-toast-close':''},children:[{tag:'span',iconName:'x',attrs:{'aria-hidden':'true'}}]}]},{tag:'p',part:'body',text:'Du kan fortsætte arbejdet.'},{tag:'div',part:'actions'},{tag:'span',part:'announcer',attrs:{role:'status','aria-live':'polite','aria-atomic':'true'}}]}
  },
  'empty-state':{
    name:'Tom tilstand',description:'En forklaring, når et område endnu ikke har indhold eller søgeresultater.',usage:'Angiv title, body og relevante handlinger i slots.actions. Tom tilstand er almindeligt indhold uden automatisk live-announcement. Produktet afgør, om en søgning eller dataopdatering skal annonceres separat.',composes:['button'],
    parts:{root:{selector:'.ds-empty-state',styles:{display:'flex',flexDirection:'column',alignItems:'start',gap:'{space.component.gap}',minWidth:'0',maxWidth:'100%',boxSizing:'border-box',padding:'{space.component.paddingLarge}',color:'{color.text.primary}',fontFamily:'{typography.font.body}',lineHeight:'{typography.lineHeight.body}',overflowWrap:'anywhere'}},icon:{selector:'.ds-empty-state__icon',styles:{display:'inline-flex',color:'{color.text.secondary}'}},title:{selector:'.ds-empty-state__title',styles:{margin:'0',fontFamily:'{typography.font.heading}',fontSize:'{typography.size.title}',fontWeight:'{typography.weight.heading}',lineHeight:'{typography.lineHeight.heading}',overflowWrap:'anywhere'}},body:{selector:'.ds-empty-state__body',styles:{margin:'0',fontSize:'{typography.size.body}',color:'{color.text.secondary}',overflowWrap:'anywhere'}},actions:{selector:'.ds-empty-state__actions',styles:{display:'flex',flexWrap:'wrap',gap:'{space.component.gap}',minWidth:'0'}}},
    variants:{default:{description:'Forklaring og næste mulige skridt.',styles:{}},compact:{description:'Mindre indre afstand i en indlejret flade.',styles:{padding:'{space.component.padding}'}}},states:{},
    preview:{tag:'section',part:'root',children:[{tag:'span',part:'icon',iconName:'folder',attrs:{'aria-hidden':'true'}},{tag:'h3',part:'title',text:'Her er endnu intet indhold'},{tag:'p',part:'body',text:'Tilføj det første element for at komme i gang.'},{tag:'div',part:'actions'}]}
  },
  'file-upload':{
    name:'Filvalg',description:'Et lokalt native filvalg med filnavne, begrænsninger og valideringsfejl.',usage:'Forbind mountFileUpload til lokalt filvalg. accept er både en native vejledning og et valideret filtypefilter; maxSize er bytes og maxFiles er antal. Ugyldigt valg og annullering bevarer tidligere filer. Drop er valgfrit og bruger samme validator. Komponenten sender ingen filer til en server.',composes:[],
    parts:{root:{selector:'.ds-file-upload',styles:{...FORM_LAYOUT}},label:{selector:'.ds-file-upload__label',styles:FORM_LABEL},control:{selector:'.ds-file-upload__control',styles:{...FORM_CONTROL,cursor:'pointer'}},hint:{selector:'.ds-file-upload__hint',styles:FORM_HINT},error:{selector:'.ds-file-upload__error',styles:{...FORM_HINT,color:'{color.status.dangerText}'}},list:{selector:'.ds-file-upload__list',styles:{display:'flex',flexDirection:'column',gap:'{space.component.gap}',listStyleType:'none',padding:'0',margin:'0',minWidth:'0'}},item:{selector:'.ds-file-upload__item',styles:{display:'flex',flexWrap:'wrap',alignItems:'center',gap:'{space.component.gap}',minWidth:'0',padding:'{space.component.paddingCompact}',border:'{border.width.default} solid {color.border.default}',borderRadius:'{radius.control}',color:'{color.text.primary}'}},name:{selector:'.ds-file-upload__name',styles:{flex:'1 1 10rem',minWidth:'0',overflowWrap:'anywhere'}},remove:{selector:'.ds-file-upload__remove',styles:{minHeight:'44px',minWidth:'44px',padding:'{space.component.paddingCompact}',border:'{border.width.default} solid {color.border.field}',borderRadius:'{radius.control}',backgroundColor:'{color.background.control}',color:'{color.text.primary}',fontFamily:'{typography.font.body}',cursor:'pointer'}},status:{selector:'.ds-file-upload__status',styles:FORM_HINT}},
    variants:{default:{description:'Native filvalg med navngivne valgte filer.',styles:{}},drop:{description:'Filvalg med en synlig flade til valgfrit drop.',styles:{padding:'{space.component.padding}',border:'{border.width.default} dashed {color.border.field}',borderRadius:'{radius.control}',backgroundColor:'{color.background.subtle}'}}},states:{focus:{description:'Synligt fokus på det native filvalg.',styles:{},parts:{control:{styles:{outline:'{border.width.focus} solid {color.focus}',outlineOffset:'{border.offset.focus}'}}}},disabled:{description:'Filvalget er ikke tilgængeligt.',styles:{},parts:{control:{styles:{color:'{color.disabled.text}',cursor:'not-allowed'}}}},invalid:{description:'Et afvist valg med fejlbesked.',styles:{},parts:{control:{styles:{borderColor:'{color.status.danger}'}}}}},
    preview:{tag:'div',part:'root',children:[{tag:'label',part:'label',text:'Vælg filer'},{tag:'input',part:'control',attrs:{type:'file'}},{tag:'p',part:'hint',text:'Filerne vælges lokalt på din enhed.'},{tag:'p',part:'error',attrs:{role:'alert'},text:''},{tag:'ul',part:'list',attrs:{'aria-label':'Valgte filer'}},{tag:'p',part:'status',attrs:{role:'status','aria-live':'polite','aria-atomic':'true'},text:''}]}
  },
  // Shared data-table definitions.
  'data-table':{
    name:'Datatabel',description:'En semantisk native tabel med sorteringsanmodninger, rækkevalg, handlinger og udvidede oplysninger.',
    usage:'Angiv columns og rows med stabile id, cells og valgfri actions/detail. Forbind mountDataTable med den stabile host. Produktet ejer data, faktisk sortering, pagination og hentning. Tabellen bruger native Tab og kontroller; den er ikke et redigerbart ARIA-grid.',
    composes:['button','pagination','spinner','empty-state','alert'],
    parts:{
      root:{selector:'.ds-data-table',styles:{display:'flex',flexDirection:'column',gap:'{space.component.gap}',minWidth:'0',maxWidth:'100%',fontFamily:'{typography.font.body}',color:'{color.text.primary}'}},
      viewport:{selector:'.ds-data-table__viewport',styles:{minWidth:'0',maxWidth:'100%',overflowX:'auto',overscrollBehavior:'contain',padding:'{space.component.paddingCompact}',border:'{border.width.default} solid {color.border.default}',borderRadius:'{radius.control}',backgroundColor:'{color.background.surface}'}},
      table:{selector:'.ds-data-table__table',styles:{width:'100%',minWidth:'36rem',borderCollapse:'collapse',fontSize:'{typography.size.body}',lineHeight:'{typography.lineHeight.body}',textAlign:'start'}},
      caption:{selector:'.ds-data-table__caption',styles:{padding:'{space.component.padding}',fontSize:'{typography.size.label}',fontWeight:'{typography.weight.heading}',textAlign:'start',backgroundColor:'{color.background.surface}',color:'{color.text.primary}',overflowWrap:'anywhere'}},
      head:{selector:'.ds-data-table__head',styles:{}},
      'header-row':{selector:'.ds-data-table__header-row',styles:{}},
      body:{selector:'.ds-data-table__body',styles:{}},
      row:{selector:'.ds-data-table__row',styles:{backgroundColor:'{color.background.surface}',color:'{color.text.primary}'}},
      header:{selector:'.ds-data-table__header',styles:{padding:'{space.component.paddingCompact} {space.component.padding}',textAlign:'start',fontWeight:'{typography.weight.heading}',backgroundColor:'{color.background.subtle}',color:'{color.text.primary}',borderBottom:'{border.width.default} solid {color.border.default}',overflowWrap:'anywhere'}},
      cell:{selector:'.ds-data-table__cell',styles:{padding:'{space.component.paddingCompact} {space.component.padding}',textAlign:'start',fontWeight:'{typography.weight.body}',verticalAlign:'middle',borderBottom:'{border.width.default} solid {color.border.default}',overflowWrap:'anywhere'}},
      tools:{selector:'.ds-data-table__tools',styles:{display:'inline-flex',alignItems:'center',flexWrap:'wrap',gap:'{space.component.gap}',minHeight:'44px',minWidth:'44px',margin:'0'}},
      selection:{selector:'.ds-data-table__selection',styles:{width:'20px',height:'20px',margin:'0',accentColor:'{color.action.primary.rest.surface}',cursor:'pointer'}},
      'detail-row':{selector:'.ds-data-table__detail-row',styles:{}},
      detail:{selector:'.ds-data-table__detail',styles:{padding:'{space.component.padding}',backgroundColor:'{color.background.subtle}',color:'{color.text.primary}',borderBottom:'{border.width.default} solid {color.border.default}',overflowWrap:'anywhere'}},
      status:{selector:'.ds-data-table__status',styles:{minWidth:'0'}},
      'selection-summary':{selector:'.ds-data-table__selection-summary',styles:{margin:'0',fontSize:'{typography.size.small}',lineHeight:'{typography.lineHeight.body}',color:'{color.text.secondary}'}},
      pagination:{selector:'.ds-data-table__pagination',styles:{minWidth:'0'}},
    },
    variants:{default:{description:'Native tabel i en afgrænset vandret scrollramme.',styles:{}}},
    states:{
      focus:{description:'Synligt tastaturfokus på den vandrette scrollramme.',parts:{viewport:{styles:{outline:'{border.width.focus} solid {color.focus}',outlineOffset:'{border.offset.focus}'}}}},
      selected:{description:'Valg vises af den native kontrol samt en diskret rækkemarkering.',parts:{row:{styles:{backgroundColor:'{color.background.subtle}',boxShadow:'inset 3px 0 0 {color.action.primary.rest.surface}'}}}},
      loading:{description:'Fælles spinner viser hentning; tidligere rækker bevares læsbare med utilgængelige handlinger.',styles:{}},
      error:{description:'Fælles fejlbesked med produktets forklaring; hentning og genforsøg ejes af produktet.',styles:{}},
      empty:{description:'Fælles tomtilstand, når der ikke er rækker.',styles:{}},
    },
    preview:{tag:'div',part:'root',children:[
      {tag:'div',part:'viewport',attrs:{role:'region','aria-label':'Datatabel',tabindex:'0'},children:[{tag:'table',part:'table',children:[
        {tag:'caption',part:'caption',text:'Datatabel'},
        {tag:'thead',part:'head',children:[{tag:'tr',part:'header-row',children:[
          {tag:'th',part:'header',attrs:{scope:'col'},children:[{tag:'label',part:'tools',children:[{tag:'input',part:'selection',attrs:{type:'checkbox','aria-label':'Vælg alle synlige rækker'}}]}]},
          {tag:'th',part:'header',attrs:{scope:'col'},children:[{component:'button'}]},
        ]}]},
        {tag:'tbody',part:'body',children:[
          {tag:'tr',part:'row',children:[
            {tag:'td',part:'cell',children:[{tag:'label',part:'tools',children:[{tag:'input',part:'selection',attrs:{type:'checkbox','aria-label':'Vælg Samling'}}]}]},
            {tag:'th',part:'cell',attrs:{scope:'row'},text:'Samling'},
            {tag:'td',part:'cell',children:[{tag:'div',part:'tools',children:[{component:'button'}]}]},
          ]},
          {tag:'tr',part:'detail-row',attrs:{hidden:true},children:[{tag:'td',part:'detail',attrs:{colspan:'3'},text:'Supplerende oplysninger.'}]},
        ]},
      ]}]},
      {tag:'p',part:'selection-summary',attrs:{role:'status'},text:'0 valgt'},
      {tag:'div',part:'status'},
      {tag:'div',part:'pagination',children:[{component:'pagination'}]},
    ]},
  },
  // Shared data-grid definitions.
  'data-grid':{
    name:'Redigerbart datagrid',description:'En tabel med aktiv celle, uafhængig markering og valideret redigering.',
    usage:'Forbind mountDataGrid med columns og rows med stabile id og cells. Pile flytter fokus; Shift+pile markerer. Enter/F2 redigerer, Escape annullerer, og Tab bekræfter og går videre. Kopiering og indsætning bruger almindelig tekst/TSV; en afvist indsætning ændrer ingen celler. Produktet ejer data og lagring gennem onCommit. Brug data-table til læsning med rækkehandlinger.',
    composes:[],parts:{
      root:{selector:'.ds-data-grid',styles:{display:'flex',flexDirection:'column',gap:'{space.component.gap}',minWidth:'0',maxWidth:'100%',fontFamily:'{typography.font.body}',color:'{color.text.primary}'}},
      viewport:{selector:'.ds-data-grid__viewport',styles:{minWidth:'0',maxWidth:'100%',overflowX:'auto',padding:'{space.component.paddingCompact}',border:'{border.width.default} solid {color.border.default}',borderRadius:'{radius.control}',backgroundColor:'{color.background.surface}'}},
      table:{selector:'.ds-data-grid__table',styles:{borderCollapse:'collapse',width:'100%',minWidth:'36rem',fontSize:'{typography.size.body}',lineHeight:'{typography.lineHeight.body}',textAlign:'start'}},
      caption:{selector:'.ds-data-grid__caption',styles:{padding:'{space.component.padding}',textAlign:'start',fontWeight:'{typography.weight.heading}',color:'{color.text.primary}'}},
      head:{selector:'.ds-data-grid__head',styles:{}},
      'header-row':{selector:'.ds-data-grid__header-row',styles:{}},body:{selector:'.ds-data-grid__body',styles:{}},
      row:{selector:'.ds-data-grid__row',styles:{}},
      header:{selector:'.ds-data-grid__header',styles:{padding:'{space.component.paddingCompact} {space.component.padding}',height:'44px',textAlign:'start',fontWeight:'{typography.weight.heading}',backgroundColor:'{color.background.subtle}',color:'{color.text.primary}',border:'{border.width.default} solid {color.border.default}',overflowWrap:'anywhere'}},
      cell:{selector:'.ds-data-grid__cell',styles:{boxSizing:'border-box',padding:'{space.component.paddingCompact} {space.component.padding}',height:'44px',minWidth:'8rem',verticalAlign:'top',border:'{border.width.default} solid {color.border.default}',backgroundColor:'{color.background.surface}',color:'{color.text.primary}',whiteSpace:'pre-wrap',overflowWrap:'anywhere',cursor:'cell'}},
      editor:{selector:'.ds-data-grid__editor',styles:{boxSizing:'border-box',width:'100%',minWidth:'0',minHeight:'44px',margin:'0',padding:'{space.component.paddingCompact}',border:'{border.width.default} solid {color.border.field}',borderRadius:'{radius.control}',backgroundColor:'{color.background.control}',color:'{color.text.primary}',fontFamily:'{typography.font.body}',fontSize:'{typography.size.body}',lineHeight:'{typography.lineHeight.control}'}},
      instructions:{selector:'.ds-data-grid__instructions',styles:{margin:'0',fontSize:'{typography.size.small}',lineHeight:'{typography.lineHeight.body}',color:'{color.text.secondary}'}},
      status:{selector:'.ds-data-grid__status',styles:{margin:'0',fontSize:'{typography.size.small}',lineHeight:'{typography.lineHeight.body}',color:'{color.text.secondary}'}},
      error:{selector:'.ds-data-grid__error',styles:{margin:'0',fontSize:'{typography.size.body}',lineHeight:'{typography.lineHeight.body}',color:'{color.status.dangerText}',backgroundColor:'{color.status.dangerSurface}',padding:'{space.component.paddingCompact}',border:'{border.width.default} solid {color.status.danger}',borderRadius:'{radius.control}'}},
      empty:{selector:'.ds-data-grid__empty',styles:{margin:'0',padding:'{space.component.padding}',color:'{color.text.secondary}'}}
    },variants:{default:{description:'Cellebaseret navigation og redigering i en afgrænset scrollramme.',styles:{}}},
    states:{focus:{description:'Fokus er uafhængigt af cellemarkeringen.',parts:{cell:{styles:{outline:'{border.width.focus} solid {color.focus}',outlineOffset:'calc(-1 * {border.width.focus})'}}}},selected:{description:'En vedvarende cellemarkering til kopiering eller samlet indsætning.',parts:{cell:{styles:{backgroundColor:'{color.background.subtle}',boxShadow:'inset 0 0 0 2px {color.action.primary.rest.surface}'}}}},readOnly:{description:'Celler kan læses og kopieres, men ikke redigeres.',styles:{}},invalid:{description:'En afvist kladde bevares med en navngivet fejl.',styles:{}}},
    preview:{tag:'section',part:'root',children:[
      {tag:'p',part:'instructions',text:'Pile flytter fokus. Enter redigerer, Escape annullerer.'},
      {tag:'div',part:'viewport',children:[{tag:'table',part:'table',attrs:{role:'grid','aria-label':'Redigerbare oplysninger'},children:[
        {tag:'caption',part:'caption',text:'Redigerbare oplysninger'},
        {tag:'thead',part:'head',children:[{tag:'tr',part:'header-row',attrs:{role:'row'},children:[{tag:'th',part:'header',attrs:{role:'columnheader',scope:'col'},text:'Projekt'},{tag:'th',part:'header',attrs:{role:'columnheader',scope:'col'},text:'Antal'}]}]},
        {tag:'tbody',part:'body',children:[{tag:'tr',part:'row',attrs:{role:'row'},children:[{tag:'td',part:'cell',attrs:{role:'gridcell',tabindex:'0'},children:[{tag:'span',text:'Projekt A'},{tag:'input',part:'editor',attrs:{type:'text',hidden:true,'aria-label':'Redigér Projekt A'}}]},{tag:'td',part:'cell',attrs:{role:'gridcell',tabindex:'-1'},text:'4'}]}]}
      ]}]},
      {tag:'p',part:'empty',attrs:{hidden:true},text:'Der er ingen rækker at vise.'},
      {tag:'p',part:'error',attrs:{role:'alert',hidden:true},text:'Kontrollér værdien.'},
      {tag:'p',part:'status',attrs:{role:'status'},text:'1 række · 2 kolonner'}
    ]}
  },
  // Shared content and action family definitions.
  avatar:{
    name:'Avatar',description:'En person eller enhed repræsenteret med billede og læsbare initialer som fallback.',
    usage:'Angiv name og eventuelt src eller initials. Avatar er statisk; læg den i produktets link eller knap ved navigation/handling. Native rendering binder billedfallback automatisk; HTML-rendering bruger mountAvatarFallbacks. Navnet bevares også ved manglende eller defekt billede.',composes:[],
    parts:{root:{selector:'.ds-avatar',styles:{display:'inline-flex',position:'relative',alignItems:'center',justifyContent:'center',width:'44px',height:'44px',flexShrink:'0',boxSizing:'border-box',border:'{border.width.default} solid {color.border.default}',borderRadius:'50%',backgroundColor:'{color.background.control}',color:'{color.text.primary}',fontFamily:'{typography.font.body}',fontWeight:'{typography.weight.label}',fontSize:'{typography.size.label}',lineHeight:1,verticalAlign:'middle'}},image:{selector:'.ds-avatar__image',styles:{position:'absolute',inset:'0',display:'block',width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}},initials:{selector:'.ds-avatar__initials',styles:{display:'block',maxWidth:'100%',padding:'{space.scale.1}',boxSizing:'border-box',textAlign:'center'}}},
    variants:{default:{description:'44 px avatar.',styles:{}},small:{description:'32 px avatar til tætte lister.',styles:{width:'32px',height:'32px',fontSize:'{typography.size.small}'}},large:{description:'64 px avatar til profil og præsentation.',styles:{width:'64px',height:'64px',fontSize:'{typography.size.title}'}}},states:{},
    preview:{tag:'span',part:'root',attrs:{role:'img','aria-label':'Anna Larsen'},children:[{tag:'span',part:'initials',attrs:{'aria-hidden':'true'},text:'AL'}]}
  },
  'avatar-group':{
    name:'Avatargruppe',description:'En navngivet, ombrydelig liste af personer eller enheder.',usage:'Angiv label og items med name, valgfri src og initials. Overlap er en kompakt variant; listen og dens elementer klipper ikke tastaturfokus. Produktet ejer eventuelle links eller knapper i slots.root.',composes:['avatar'],
    parts:{root:{selector:'.ds-avatar-group',styles:{display:'flex',flexWrap:'wrap',alignItems:'center',gap:'{space.component.gap}',listStyleType:'none',margin:'0',padding:'{space.component.paddingCompact}',minWidth:'0',maxWidth:'100%',boxSizing:'border-box',overflow:'visible'}},item:{selector:'.ds-avatar-group__item',styles:{display:'flex',position:'relative',minWidth:'0',flexShrink:'0',margin:'0',padding:'0',overflow:'visible'}}},
    variants:{default:{description:'Adskilte avatarer med plads til hvert element.',styles:{}},overlap:{description:'Let overlap med fri plads til fokus og ombrydning.',styles:{columnGap:'0',paddingInlineStart:'calc({space.component.paddingCompact} + {space.scale.2})'},parts:{item:{styles:{marginInlineStart:'calc(-1 * {space.scale.2})'}}}}},states:{},
    preview:{tag:'ul',part:'root',attrs:{'aria-label':'Deltagere'},children:[{tag:'li',part:'item',children:[{component:'avatar'}]},{tag:'li',part:'item',children:[{component:'avatar'}]},{tag:'li',part:'item',children:[{component:'avatar'}]}]}
  },
  // Shared form family definitions.
  textarea:nativeField('textarea','Flerlinjefelt','Native tekstområde med label, hjælp og fejl.','textarea',{rows:'4',placeholder:'Skriv en længere tekst'}),
  'number-input':nativeField('number-input','Talinput','Native talfelt med label, grænser og trin.','input',{type:'number',value:'1',step:'1'}),
  'field-group':{
    name:'Feltgruppe',description:'En navngivet gruppe af beslægtede formularfelter.',usage:'Brug label til gruppens legend og slots.body til fælles felter. Native fieldset giver sammenhæng og deaktiverer sine kontroller med disabled. Produktet ejer validering og data.',composes:['field','checkbox'],
    parts:{root:{selector:'.ds-field-group',styles:{...FORM_LAYOUT,margin:'0',padding:'{space.component.padding}',border:'{border.width.default} solid {color.border.default}',borderRadius:'{radius.control}',color:'{color.text.primary}'}},legend:{selector:'.ds-field-group__legend',styles:{...FORM_LABEL,maxWidth:'100%',padding:'0 {space.component.paddingCompact}'}},body:{selector:'.ds-field-group__body',styles:FORM_LAYOUT},hint:{selector:'.ds-field-group__hint',styles:FORM_HINT},error:{selector:'.ds-field-group__error',styles:{...FORM_HINT,color:'{color.status.dangerText}',display:'none'}}},
    variants:{default:{description:'Beslægtede felter med fælles legend.',styles:{}},invalid:{description:'Fælles fejl i gruppen.',styles:{borderColor:'{color.status.danger}'},parts:{error:{styles:{display:'block'}}}}},states:{disabled:{description:'Native fieldset deaktiverer sine underliggende kontroller.',styles:{},parts:{legend:{styles:{color:'{color.disabled.text}'}}}}},
    preview:{tag:'fieldset',part:'root',children:[{tag:'legend',part:'legend',text:'Indstillinger'},{tag:'p',part:'hint',text:'Beslægtede valg og oplysninger.'},{tag:'div',part:'body',children:[{component:'field'},{component:'checkbox'}]},{tag:'p',part:'error',text:'Kontrollér oplysningerne.'}]}
  },
  // Shared navigation family definitions.
  tabs: {
    name:'Faner',description:'Forbundne faner med ét synligt indholdspanel ad gangen.',
    usage:'Angiv items med stabile id, label og content samt selectedId. Forbind mountTabs med samme host; produktet gemmer valget via onChange. Automatic kræver indhold uden ventetid; manual aktiverer med Enter eller Mellemrum.',composes:[],
    parts:{
      root:{selector:'.ds-tabs',styles:{display:'flex',flexDirection:'column',gap:'{space.component.gapLarge}',minWidth:'0'}},
      list:{selector:'.ds-tabs__list',styles:{display:'flex',flexWrap:'wrap',gap:'{space.component.gap}',minWidth:'0',padding:'{space.component.paddingCompact}',backgroundColor:'{color.background.subtle}',borderRadius:'{radius.control}'}},
      tab:{selector:'.ds-tabs__tab',styles:{display:'inline-flex',alignItems:'center',justifyContent:'center',minHeight:'44px',minWidth:'44px',maxWidth:'100%',boxSizing:'border-box',padding:'{space.component.paddingCompact} {space.component.padding}',border:'{border.width.default} solid transparent',borderRadius:'{radius.control}',fontFamily:'{typography.font.body}',fontSize:'{typography.size.control}',fontWeight:'{typography.weight.label}',lineHeight:'{typography.lineHeight.control}',whiteSpace:'normal',wordBreak:'normal',overflowWrap:'anywhere',backgroundColor:'{color.background.subtle}',color:'{color.text.primary}',cursor:'pointer'}},
      panel:{selector:'.ds-tabs__panel',styles:{minWidth:'0',padding:'{space.component.padding}',border:'{border.width.default} solid {color.border.default}',borderRadius:'{radius.control}',backgroundColor:'{color.background.surface}',color:'{color.text.primary}',fontFamily:'{typography.font.body}',fontSize:'{typography.size.body}',lineHeight:'{typography.lineHeight.body}',overflowWrap:'anywhere'}},
    },
    variants:{default:{description:'Vandrette faner, der kan bryde til flere rækker.',styles:{}},vertical:{description:'Lodret faneliste ved siden af indholdet; produktet vælger tilstrækkelig plads.',styles:{flexDirection:'row',flexWrap:'wrap'},parts:{list:{styles:{flexDirection:'column',alignItems:'stretch',flex:'1 1 12rem'}},panel:{styles:{flex:'3 1 16rem'}}}}},
    states:{
      selected:{description:'Den aktive fane, som ejer det synlige panel.',parts:{tab:{styles:{backgroundColor:'{color.action.primary.rest.surface}',color:'{color.action.primary.rest.text}',borderColor:'{color.action.primary.rest.surface}',textDecoration:'underline'}}}},
      hover:{description:'En tilgængelig fane under pegemarkøren.',parts:{tab:{styles:{backgroundColor:'{color.action.neutral.hover.surface}',color:'{color.action.neutral.hover.text}'}}}},
      active:{description:'En fane under aktivering.',parts:{tab:{styles:{backgroundColor:'{color.action.neutral.active.surface}',color:'{color.action.neutral.active.text}'}}}},
      focus:{description:'Fokus på den enkelte fane.',parts:{tab:{styles:{outline:'{border.width.focus} solid {color.focus}',outlineOffset:'{border.offset.focus}'}}}},
      disabled:{description:'En utilgængelig fane springes over i tastaturnavigationen.',parts:{tab:{styles:{cursor:'not-allowed',opacity:'{opacity.disabled}'}}}},
    },
    preview:{tag:'div',part:'root',children:[{tag:'div',part:'list',attrs:{role:'tablist','aria-label':'Indholdsfaner'},children:[{tag:'button',part:'tab',attrs:{role:'tab'},text:'Overblik'}]},{tag:'section',part:'panel',attrs:{role:'tabpanel'},text:'Et samlet overblik over indholdet.'}]},
  },
  accordion:{
    name:'Accordion og disclosure',description:'Indholdssektioner, der kan åbnes og lukkes uafhængigt med native details og summary.',
    usage:'Angiv items med label, content og valgfri open. Browseren ejer åbning, lukning og tastaturbetjening. Produktet kan læse toggle eller details.open, når foldestatus skal gemmes. Native details har ingen disabled-tilstand.',composes:[],
    parts:{
      root:{selector:'.ds-accordion',styles:{display:'flex',flexDirection:'column',gap:'{space.component.gap}',minWidth:'0'}},
      item:{selector:'.ds-accordion__item',styles:{minWidth:'0',border:'{border.width.default} solid {color.border.default}',borderRadius:'{radius.control}',backgroundColor:'{color.background.surface}',color:'{color.text.primary}'}},
      summary:{selector:'.ds-accordion__summary',styles:{minHeight:'44px',boxSizing:'border-box',padding:'{space.component.padding}',fontFamily:'{typography.font.body}',fontSize:'{typography.size.control}',fontWeight:'{typography.weight.label}',lineHeight:'{typography.lineHeight.control}',borderRadius:'{radius.control}',cursor:'pointer',overflowWrap:'anywhere'}},
      body:{selector:'.ds-accordion__body',styles:{display:'flex',flexDirection:'column',gap:'{space.component.gap}',padding:'{space.component.padding}',fontFamily:'{typography.font.body}',fontSize:'{typography.size.body}',lineHeight:'{typography.lineHeight.body}',overflowWrap:'anywhere'}},
    },
    variants:{default:{description:'Separate native disclosure-sektioner.',styles:{}}},
    states:{hover:{description:'Feedback på den enkelte summary.',parts:{summary:{styles:{backgroundColor:'{color.action.neutral.hover.surface}',color:'{color.action.neutral.hover.text}'}}}},focus:{description:'Synligt fokus på den native summary.',parts:{summary:{styles:{outline:'{border.width.focus} solid {color.focus}',outlineOffset:'{border.offset.focus}'}}}}},
    preview:{tag:'div',part:'root',children:[{tag:'details',part:'item',attrs:{open:true},children:[{tag:'summary',part:'summary',text:'Flere oplysninger'},{tag:'div',part:'body',text:'Indholdet kan foldes ud med mus eller tastatur.'}]}]},
  },
  breadcrumb:{
    name:'Brødkrummer',description:'En navngivet, ordnet sti til den aktuelle side.',usage:'Angiv items fra øverste niveau til aktuel side. Brug href til reelle navigationsmål; sidste led markeres automatisk som aktuelt, medmindre et andet item har current. Produktet ejer destinationerne.',composes:[],
    parts:{
      root:{selector:'.ds-breadcrumb',styles:{minWidth:'0'}},
      list:{selector:'.ds-breadcrumb__list',styles:{display:'flex',flexWrap:'wrap',alignItems:'center',gap:'{space.component.gap}',listStyleType:'none',margin:'0',padding:'0'}},
      item:{selector:'.ds-breadcrumb__item',styles:{display:'inline-flex',alignItems:'center',gap:'{space.component.gap}',minWidth:'0',maxWidth:'100%'}},
      separator:{selector:'.ds-breadcrumb__separator',styles:{color:'{color.text.secondary}',flexShrink:'0'}},
      link:{selector:'.ds-breadcrumb__link',styles:{display:'inline-flex',alignItems:'center',minHeight:'44px',boxSizing:'border-box',fontFamily:'{typography.font.body}',fontSize:'{typography.size.body}',lineHeight:'{typography.lineHeight.body}',color:'{color.text.primary}',textDecoration:'underline',borderRadius:'{radius.control}',overflowWrap:'anywhere',minWidth:'0'}},
    },variants:{default:{description:'Ordnet sti med dekorative skilletegn.',styles:{}}},
    states:{current:{description:'Aktuel side i stien.',parts:{link:{styles:{fontWeight:'{typography.weight.heading}',textDecoration:'none'}}}},hover:{description:'Feedback på ét tilgængeligt link.',parts:{link:{styles:{backgroundColor:'{color.action.neutral.hover.surface}',color:'{color.action.neutral.hover.text}'}}}},focus:{description:'Tastaturfokus på ét navigationsmål.',parts:{link:{styles:{outline:'{border.width.focus} solid {color.focus}',outlineOffset:'{border.offset.focus}'}}}},disabled:{description:'Et utilgængeligt mål har ingen href eller tabstop.',parts:{link:{styles:{cursor:'not-allowed',textDecoration:'none'}}}}},
    preview:{tag:'nav',part:'root',attrs:{'aria-label':'Brødkrummer'},children:[{tag:'ol',part:'list',children:[{tag:'li',part:'item',children:[{tag:'a',part:'link',attrs:{href:'#forside'},text:'Forside'}]}]}]},
  },
  pagination:{
    name:'Paginering',description:'Native links mellem sider i en afgrænset resultatmængde.',usage:'Angiv items med label, href og current samt disabled ved manglende forrige/næste side. Produktet ejer sidetal, adresse, datalæsning og eventuelle udeladelser. Navngiv flere navigationer særskilt.',composes:[],
    parts:{
      root:{selector:'.ds-pagination',styles:{minWidth:'0'}},
      list:{selector:'.ds-pagination__list',styles:{display:'flex',flexWrap:'wrap',alignItems:'center',gap:'{space.component.gap}',listStyleType:'none',margin:'0',padding:'0'}},
      item:{selector:'.ds-pagination__item',styles:{minWidth:'0',maxWidth:'100%'}},
      link:{selector:'.ds-pagination__link',styles:{display:'inline-flex',alignItems:'center',justifyContent:'center',minHeight:'44px',minWidth:'44px',maxWidth:'100%',boxSizing:'border-box',padding:'{space.component.paddingCompact} {space.component.padding}',border:'{border.width.default} solid {color.border.default}',borderRadius:'{radius.control}',fontFamily:'{typography.font.body}',fontSize:'{typography.size.control}',fontWeight:'{typography.weight.label}',lineHeight:'{typography.lineHeight.control}',backgroundColor:'{color.background.control}',color:'{color.text.primary}',textDecoration:'none',overflowWrap:'anywhere'}},
    },variants:{default:{description:'Rækkebrydende navigation med forrige, sider og næste.',styles:{}}},
    states:{current:{description:'Aktuel side, markeret med aria-current.',parts:{link:{styles:{backgroundColor:'{color.action.primary.rest.surface}',color:'{color.action.primary.rest.text}',borderColor:'{color.action.primary.rest.surface}',textDecoration:'underline'}}}},hover:{description:'Feedback på ét tilgængeligt sidelink.',parts:{link:{styles:{backgroundColor:'{color.action.neutral.hover.surface}',color:'{color.action.neutral.hover.text}'}}}},focus:{description:'Tastaturfokus på ét sidelink.',parts:{link:{styles:{outline:'{border.width.focus} solid {color.focus}',outlineOffset:'{border.offset.focus}'}}}},disabled:{description:'Manglende destination vises uden href og uden tabstop.',parts:{link:{styles:{cursor:'not-allowed',opacity:'{opacity.disabled}'}}}}},
    preview:{tag:'nav',part:'root',attrs:{'aria-label':'Sidenavigation'},children:[{tag:'ol',part:'list',children:[{tag:'li',part:'item',children:[{tag:'a',part:'link',attrs:{href:'#side-1','aria-current':'page'},text:'1'}]}]}]},
  },
  // Shared overlay family definitions.
  popover:{
    name:'Popover',description:'En forankret, ikke-modal flade med supplerende indhold og handlinger.',
    usage:'Forbind en navngivet udløser og panel med mountPopover. Panelet åbner i browserens top layer, placeres ved udløseren og lukker med Escape, klik udenfor eller fokus udenfor. Produktet ejer indhold og handlinger.',
    composes:[],parts:{
      root:{selector:'.ds-popover',styles:{boxSizing:'border-box',display:'flex',flexDirection:'column',gap:'{space.component.gapLarge}',width:'24rem',maxWidth:'min(28rem, var(--ds-overlay-available-width, calc(100vw - 1rem)))',maxHeight:'var(--ds-overlay-available-height, calc(100dvh - 1rem))',overflowY:'auto',padding:'{space.component.paddingLarge}',border:'{border.width.default} solid {color.border.default}',borderRadius:'{radius.card}',backgroundColor:'{color.background.surface}',color:'{color.text.primary}',fontFamily:'{typography.font.body}',fontSize:'{typography.size.body}',lineHeight:'{typography.lineHeight.body}',boxShadow:'{shadow.floating}',zIndex:'{layer.popover}'}},
      title:{selector:'.ds-popover__title',styles:{margin:'0',fontFamily:'{typography.font.heading}',fontSize:'{typography.size.title}',fontWeight:'{typography.weight.heading}',lineHeight:'{typography.lineHeight.heading}',overflowWrap:'anywhere'}},
      body:{selector:'.ds-popover__body',styles:{margin:'0',minWidth:'0',overflowWrap:'anywhere'}},
      footer:{selector:'.ds-popover__footer',styles:{display:'flex',flexWrap:'wrap',gap:'{space.component.gap}',justifyContent:'flex-end'}}
    },variants:{default:{description:'Supplerende indhold ved en kontrol.',styles:{}}},states:{},
    preview:{tag:'section',part:'root',attrs:{role:'dialog',tabindex:'-1'},children:[{tag:'h2',part:'title',text:'Flere muligheder'},{tag:'div',part:'body',text:'Supplerende indhold og relaterede handlinger.'},{tag:'footer',part:'footer',text:'Vælg en handling'}]}
  },
  drawer:{
    name:'Sidepanel',description:'Et modal eller ikke-modalt panel fra en side af arbejdsfladen.',
    usage:'Renderer leverer en native dialog med sidepanelanatomi. mountDrawer bruger som standard showModal; modal:false giver en ikke-modal dialog uden fokusfælde. Escape og lukning returnerer fokus til udløseren. Produktet ejer formularer, kladder og placering af udløseren.',
    composes:[],parts:{
      root:{selector:'.ds-drawer',styles:{boxSizing:'border-box',display:'flex',flexDirection:'column',gap:'{space.component.gapLarge}',minHeight:'100%',minWidth:'0',padding:'{space.component.paddingLarge}',backgroundColor:'{color.background.surface}',color:'{color.text.primary}',border:'{border.width.default} solid {color.border.default}',fontFamily:'{typography.font.body}',fontSize:'{typography.size.body}',lineHeight:'{typography.lineHeight.body}',boxShadow:'{shadow.floating}'}},
      title:{selector:'.ds-drawer__title',styles:{margin:'0',fontFamily:'{typography.font.heading}',fontSize:'{typography.size.title}',fontWeight:'{typography.weight.heading}',lineHeight:'{typography.lineHeight.heading}',overflowWrap:'anywhere'}},
      body:{selector:'.ds-drawer__body',styles:{flex:'1 1 auto',minWidth:'0',overflowWrap:'anywhere'}},
      footer:{selector:'.ds-drawer__footer',styles:{display:'flex',flexWrap:'wrap',gap:'{space.component.gap}',justifyContent:'flex-end'}}
    },variants:{end:{description:'Panel fra slutningen af læseretningen.',styles:{}},start:{description:'Panel fra starten af læseretningen.',styles:{}}},states:{},
    preview:{tag:'section',part:'root',variant:'end',children:[{tag:'h2',part:'title',text:'Detaljer og indstillinger'},{tag:'div',part:'body',text:'Arbejd videre med den valgte posts oplysninger.'},{tag:'footer',part:'footer',text:'Vælg en handling'}]}
  },
  "link": {
    name: 'Link', description: 'Navigation til en side, fil eller sektion med native ankersemantik.',
    usage: 'Angiv href og meningsfuld tekst. Brug navigation til menulinks. Knaplignende navigationsmål bruger button med href og den ønskede fremhævelse. action understøttes kun til ældre integrationer. Markér aktuelt mål med aria-current.',
    composes: [],
    parts: { root: { selector: '.ds-link', styles: { fontFamily: '{typography.font.body}', fontSize: '{typography.size.body}', lineHeight: '{typography.lineHeight.body}', color: '{color.text.primary}', textDecoration: 'underline', borderRadius: '{radius.control}', overflowWrap: 'anywhere' } } },
    variants: {
      navigation: { description: 'Et navigationsmål med større klikflade.', styles: { display: 'inline-flex', alignItems: 'center', minHeight: '44px', boxSizing: 'border-box', padding: '{space.component.paddingCompact} {space.component.padding}', textDecoration: 'none' } },
      action: { description: 'Historisk kompatibilitet; nye knaplignende links bruger button med href.', styles: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: '44px', boxSizing: 'border-box', padding: '{space.component.paddingCompact} {space.component.padding}', backgroundColor: '{color.background.control}', border: '{border.width.default} solid {color.border.field}', textDecoration: 'none' } }
    },
    states: {
      hover: { description: 'Synlig feedback under pegemarkøren.', styles: { backgroundColor: '{color.action.neutral.hover.surface}', color: '{color.action.neutral.hover.text}', textDecoration: 'underline' } },
      active: { description: 'Linket aktiveres.', styles: { backgroundColor: '{color.action.neutral.active.surface}', color: '{color.action.neutral.active.text}' } },
      focus: { description: 'Synligt tastaturfokus.', styles: { outline: '{border.width.focus} solid {color.focus}', outlineOffset: '{border.offset.focus}' } },
      current: { description: 'Aktuelt navigationsmål med aria-current.', styles: { fontWeight: '{typography.weight.heading}', textDecoration: 'underline' } }
    },
    preview: { tag: 'a', part: 'root', attrs: { href: '#indhold' }, text: 'Læs mere' }
  },
  "signature": {
    name:'Signatur',description:'Et link med afsenderens logo og navn, tilpasset produktets tema.',
    usage:'Brug til afsenderkreditering i header, footer, sidepanel eller Om-visning. Angiv name, href og logoSrc. En dokumenteret afsenderidentitet kan vælges gennem identity. Produktet ejer placering. Bevar navn, logoproportioner og frizone; vælg ikke signaturen som produktets primære handling.',
    composes:[],
    parts:{
      root:{selector:'.ds-signature',styles:{display:'inline-flex',alignItems:'center',justifyContent:'center',gap:'max(12px, {space.component.gap})',boxSizing:'border-box',minHeight:'44px',minWidth:'0',maxWidth:'100%',padding:'max(12px, {space.component.paddingCompact}) max(12px, {space.component.padding})',border:'{border.width.default} solid {color.border.field}',borderRadius:'{radius.control}',backgroundColor:'{color.background.control}',color:'{color.text.primary}',textDecoration:'none',cursor:'pointer'}},
      logo:{selector:'.ds-signature__logo',styles:{display:'block',width:'24px',height:'24px',flex:'0 0 auto',objectFit:'contain'}},
      name:{selector:'.ds-signature__name',styles:{fontFamily:'"DS Signature Platypi", Platypi, Georgia, serif',fontSize:'16px',fontWeight:'400',letterSpacing:'-0.024em',lineHeight:'1.4',overflowWrap:'anywhere',minWidth:'0'}}
    },
    variants:{
      default:{description:'Indrammet signatur til header og selvstændige områder.',styles:{}},
      quiet:{description:'Diskret signatur uden ramme til footer eller sidepanel.',styles:{borderColor:'transparent',backgroundColor:'transparent'}},
      compact:{description:'Mindre typografi og logo til smalle paneler; klikfladen bevares.',styles:{gap:'max(10px, {space.component.gap})',padding:'max(10px, {space.component.paddingCompact})'},parts:{logo:{styles:{width:'20px',height:'20px'}},name:{styles:{fontSize:'14px'}}}},
      stacked:{description:'Logo over navn til en centreret Om-visning eller footer.',styles:{flexDirection:'column',gap:'max(14px, {space.component.gap})',padding:'max(14px, {space.component.padding})'},parts:{logo:{styles:{width:'28px',height:'28px'}},name:{styles:{textAlign:'center'}}}}
    },
    states:{
      hover:{description:'Synlig feedback på linket.',styles:{backgroundColor:'{color.action.neutral.hover.surface}',color:'{color.action.neutral.hover.text}'}},
      active:{description:'Linket aktiveres.',styles:{backgroundColor:'{color.action.neutral.active.surface}',color:'{color.action.neutral.active.text}'}},
      focus:{description:'Synligt tastaturfokus.',styles:{outline:'{border.width.focus} solid {color.focus}',outlineOffset:'{border.offset.focus}'}},
      disabled:{description:'En utilgængelig signatur har ingen destination eller tabstop.',styles:{cursor:'not-allowed',opacity:'{opacity.disabled}'}}
    },
    preview:{tag:'a',part:'root',variant:'default',attrs:{href:'#afsender'},children:[{tag:'span',part:'logo',attrs:{'aria-hidden':'true'},text:'◇'},{tag:'span',part:'name',text:'Afsendernavn'}]}
  },
  "navigation": {
    name: 'Navigation', description: 'Navngivet navigation med en liste af links.',
    usage: 'Brug nav og native links til websites. Giv flere navigationer forskellige navne. Produktet ejer links, aktuelt mål og mobilmenuens åbning. Brug ikke menu/menubar til almindelig websitenavigation.',
    composes: ['link'],
    parts: {
      root: { selector: '.ds-navigation', styles: { minWidth: '0' } },
      list: { selector: '.ds-navigation__list', styles: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '{space.component.gap}', listStyleType: 'none', margin: '0', padding: '0' } },
      item: { selector: '.ds-navigation__item', styles: { minWidth: '0' } }
    },
    variants: { vertical: { description: 'Lodret liste til en smal menu eller footer.', parts: { list: { styles: { flexDirection: 'column', alignItems: 'start' } } } } },
    states: {},
    preview: { tag: 'nav', part: 'root', attrs: { 'aria-label': 'Navigation' }, children: [{ tag: 'ul', part: 'list', children: [{ tag: 'li', part: 'item', children: [{ component: 'link' }] }] }] }
  },
  "image": {
    name: 'Billede', description: 'Responsivt billede med valgfri tilknyttet billedtekst.',
    usage: 'Angiv src, alt og eventuelt caption. Beskriv informative billeder; brug alt="" til dekoration. Standard bevarer hele originalen. landscape og square beskærer; brug dem kun når motivet tåler det. Produktet ejer billedrettigheder og ressourcer.',
    composes: [],
    parts: {
      root: { selector: '.ds-image', styles: { display: 'flex', flexDirection: 'column', gap: '{space.component.gap}', margin: '0', minWidth: '0' } },
      media: { selector: '.ds-image__media', styles: { display: 'block', width: '100%', maxWidth: '100%', height: 'auto', borderRadius: '{radius.control}', objectFit: 'contain' } },
      caption: { selector: '.ds-image__caption', styles: { fontFamily: '{typography.font.body}', fontSize: '{typography.size.small}', lineHeight: '{typography.lineHeight.body}', color: '{color.text.secondary}' } }
    },
    variants: {
      landscape: { description: 'Beskåret til et liggende 3:2-format.', parts: { media: { styles: { aspectRatio: '3 / 2', objectFit: 'cover' } } } },
      square: { description: 'Beskåret til et kvadrat.', parts: { media: { styles: { aspectRatio: '1', objectFit: 'cover' } } } }
    },
    states: {},
    preview: { tag: 'figure', part: 'root', children: [{ tag: 'img', part: 'media', attrs: { alt: 'En cirkel på en ensfarvet flade.' } }, { tag: 'figcaption', part: 'caption', text: 'En enkel form og dens omgivelser.' }] }
  },
  "text": {
    "name": "Tekst",
    "description": "Læsetekst og supplerende information.",
    "usage": "Brug p eller span efter indholdets semantik. Produktet ejer indhold og læserækkefølge.",
    "composes": [],
    "parts": {
      "root": {
        "selector": ".ds-text",
        "styles": {
          "margin": "0",
          "fontFamily": "{typography.font.body}",
          "fontSize": "{typography.size.body}",
          "fontWeight": "{typography.weight.body}",
          "lineHeight": "{typography.lineHeight.body}",
          "color": "{color.text.primary}",
          "overflowWrap": "anywhere"
        }
      }
    },
    "variants": {
      "secondary": {
        "description": "Supplerende handling.",
        "styles": {
          "color": "{color.text.secondary}"
        }
      },
      "small": {
        "description": "Kompakt hjælpetekst.",
        "styles": {
          "fontSize": "{typography.size.small}",
          "color": "{color.text.secondary}"
        }
      },
      "editorial": {
        "description": "Særskilt rolle til læsetekst.",
        "styles": {
          "fontFamily": "{typography.font.heading}",
          "maxWidth": "{typography.measure.body}"
        }
      },
      "caption": {
        "description": "Supplerende beskrivelse.",
        "styles": {
          "fontSize": "{typography.size.caption}",
          "color": "{color.text.muted}"
        }
      },
      "tiny": {
        "description": "Meget kompakt hjælpetekst.",
        "styles": {
          "fontSize": "{typography.size.tiny}",
          "lineHeight": "{typography.lineHeight.tiny}",
          "color": "{color.text.secondary}"
        }
      }
    },
    "states": {},
    "preview": {
      "tag": "p",
      "part": "root",
      "text": "En kort og tydelig beskrivelse."
    }
  },
  "button": {
    "name": "Knap",
    "description": "En fælles knapfamilie med fire fremhævelser, uafhængig størrelse og native handling eller navigation.",
    "usage": "Primary er næste hovedhandling. Secondary er en solid neutral ledsager til primary; tertiary kan stå alene; ghost er supplerende. Vælg size small (32 px), medium (44 px) eller large (48 px) uafhængigt af variant. intent danger bruges med primary, tertiary eller ghost. href giver et native link med samme fremtoning. Uden sideikon er teksten centreret med symmetrisk padding. iconOnly kræver et tilgængeligt navn. loading deaktiverer under arbejde. Historiske variantnavne understøttes kun som kompatibilitet.",
    "composes": [],
    "parts": {
      "root": {
        "selector": ".ds-button",
        "styles": {
          "display": "inline-flex",
          "alignItems": "center",
          "justifyContent": "center",
          "gap": "{space.component.gapLarge}",
          "minHeight": "max(44px, {size.control.height})",
          "padding": "max(0px, calc((44px - 1em * {typography.lineHeight.control}) / 2 - {border.width.default})) {space.component.padding}",
          "border": "{border.width.default} solid transparent",
          "borderRadius": "{radius.control}",
          "fontFamily": "{typography.font.body}",
          "fontSize": "{typography.size.label}",
          "fontWeight": "{typography.weight.label}",
          "lineHeight": "{typography.lineHeight.control}",
          "backgroundColor": "{color.action.primary.rest.surface}",
          "color": "{color.action.primary.rest.text}",
          "cursor": "pointer",
          "transition": "background-color {duration.fast}, color {duration.fast}, border-color {duration.fast}, opacity {duration.fast}, box-shadow {duration.fast}",
          "minWidth": "44px",
          "boxSizing": "border-box",
          "textDecoration": "none",
          "maxWidth": "100%",
          "whiteSpace": "normal",
          "overflowWrap": "normal",
          "--ds-interaction-hover-surface": "{color.action.primary.hover.surface}",
          "--ds-interaction-hover-text": "{color.action.primary.hover.text}",
          "--ds-interaction-active-surface": "{color.action.primary.active.surface}",
          "--ds-interaction-active-text": "{color.action.primary.active.text}",
          "wordBreak": "normal",
          "flexShrink": "0",
          "textAlign": "center",
          "borderColor": "transparent"
        }
      },
      "heading": {
        "selector": ".ds-button__heading",
        "styles": {
          "display": "block",
          "minWidth": "0",
          "fontWeight": "inherit",
          "color": "inherit",
          "whiteSpace": "normal",
          "overflowWrap": "normal",
          "wordBreak": "normal"
        }
      },
      "description": {
        "selector": ".ds-button__description",
        "styles": {
          "display": "none",
          "margin": "{space.scale.1} 0 0",
          "fontSize": "{typography.size.small}",
          "fontWeight": "{typography.weight.body}",
          "lineHeight": "{typography.lineHeight.body}",
          "color": "{color.text.secondary}",
          "whiteSpace": "normal",
          "overflowWrap": "normal",
          "wordBreak": "normal"
        }
      },
      "icon": {
        "selector": ".ds-button__icon",
        "styles": {
          "display": "none",
          "flexShrink": "0",
          "width": "1em",
          "height": "1em",
          "lineHeight": 1
        }
      },
      "progress": {
        "selector": ".ds-button__progress",
        "styles": {
          "display": "none",
          "flexShrink": "0",
          "width": "1em",
          "height": "1em",
          "border": "2px solid currentColor",
          "borderRightColor": "transparent",
          "borderRadius": "50%"
        }
      }
    },
    "variants": {
      "primary": {
        "description": "Den vigtigste næste handling i den aktuelle opgave.",
        "styles": {
          "backgroundColor": "{color.action.primary.rest.surface}",
          "color": "{color.action.primary.rest.text}",
          "borderColor": "transparent",
          "--ds-interaction-hover-surface": "{color.action.primary.hover.surface}",
          "--ds-interaction-hover-text": "{color.action.primary.hover.text}",
          "--ds-interaction-active-surface": "{color.action.primary.active.surface}",
          "--ds-interaction-active-text": "{color.action.primary.active.text}"
        }
      },
      "secondary": {
        "description": "Solid neutral ledsager til primary, eksempelvis Tilbage eller Annuller.",
        "styles": {
          "backgroundColor": "{color.background.inverse}",
          "color": "{color.text.inverse}",
          "borderColor": "transparent",
          "--ds-interaction-hover-surface": "{color.action.secondary.hover.surface}",
          "--ds-interaction-hover-text": "{color.action.secondary.hover.text}",
          "--ds-interaction-active-surface": "{color.action.secondary.active.surface}",
          "--ds-interaction-active-text": "{color.action.secondary.active.text}"
        }
      },
      "tertiary": {
        "description": "Konturknap til mindre eller selvstændige handlinger.",
        "styles": {
          "backgroundColor": "transparent",
          "color": "{color.action.primary.rest.surface}",
          "borderColor": "{color.action.primary.rest.surface}",
          "--ds-interaction-hover-surface": "{color.action.primary.hover.surface}",
          "--ds-interaction-hover-text": "{color.action.primary.hover.text}",
          "--ds-interaction-active-surface": "{color.action.primary.active.surface}",
          "--ds-interaction-active-text": "{color.action.primary.active.text}"
        }
      },
      "ghost": {
        "description": "Laveste fremhævelse til supplerende handlinger og værktøjer.",
        "styles": {
          "backgroundColor": "transparent",
          "color": "{color.action.primary.rest.surface}",
          "borderColor": "transparent",
          "--ds-interaction-hover-surface": "{color.action.neutral.hover.surface}",
          "--ds-interaction-hover-text": "{color.action.neutral.hover.text}",
          "--ds-interaction-active-surface": "{color.action.neutral.active.surface}",
          "--ds-interaction-active-text": "{color.action.neutral.active.text}"
        }
      }
    },
    "states": {
      "hover": {
        "styles": {
          "backgroundColor": "var(--ds-interaction-hover-surface)",
          "color": "var(--ds-interaction-hover-text)"
        },
        "description": "Kontrollen under pegemarkøren.",
        "parts": {
          "description": {
            "styles": {
              "color": "inherit"
            }
          }
        }
      },
      "focus": {
        "styles": {
          "outline": "{border.width.focus} solid {color.focus}",
          "outlineOffset": "{border.offset.focus}"
        },
        "description": "Synligt tastaturfokus."
      },
      "active": {
        "styles": {
          "backgroundColor": "var(--ds-interaction-active-surface)",
          "color": "var(--ds-interaction-active-text)"
        },
        "description": "Kontrollen under aktivering.",
        "parts": {
          "description": {
            "styles": {
              "color": "inherit"
            }
          }
        }
      },
      "disabled": {
        "description": "Native deaktiveret handling eller utilgængeligt navigationsmål.",
        "styles": {
          "backgroundColor": "{color.disabled.surface}",
          "color": "{color.disabled.text}",
          "borderColor": "transparent",
          "cursor": "not-allowed"
        }
      },
      "pressed": {
        "description": "Aktiv toggle med aria-pressed=true.",
        "styles": {
          "backgroundColor": "{color.action.primary.rest.surface}",
          "color": "{color.action.primary.rest.text}",
          "--ds-interaction-hover-surface": "{color.action.primary.hover.surface}",
          "--ds-interaction-hover-text": "{color.action.primary.hover.text}",
          "--ds-interaction-active-surface": "{color.action.primary.active.surface}",
          "--ds-interaction-active-text": "{color.action.primary.active.text}"
        },
        "parts": {
          "description": {
            "styles": {
              "color": "inherit"
            }
          }
        }
      },
      "current": {
        "description": "Aktuelt navigationsmål med aria-current; en valgt side er ikke en togglehandling.",
        "styles": {
          "backgroundColor": "{color.background.subtle}",
          "color": "{color.text.primary}",
          "--ds-interaction-hover-surface": "{color.action.selected.hover.surface}",
          "--ds-interaction-hover-text": "{color.action.selected.hover.text}",
          "--ds-interaction-active-surface": "{color.action.selected.active.surface}",
          "--ds-interaction-active-text": "{color.action.selected.active.text}"
        },
        "parts": {
          "description": {
            "styles": {
              "color": "inherit"
            }
          }
        }
      },
      "loading": {
        "description": "Arbejder med bevaret label og fremhævelse; native handling er deaktiveret.",
        "styles": {
          "cursor": "progress"
        }
      }
    },
    "preview": {
      "tag": "button",
      "part": "root",
      "attrs": {
        "type": "button"
      },
      "children": [
        {
          "tag": "span",
          "part": "heading",
          "text": "Gem ændringer"
        },
        {
          "tag": "span",
          "part": "description",
          "text": "En kort forklaring til handlingen."
        },
        {
          "tag": "span",
          "part": "icon",
          "attrs": {
            "aria-hidden": "true"
          }
        },
        {
          "tag": "span",
          "part": "progress",
          "attrs": {
            "aria-hidden": "true"
          }
        }
      ]
    }
  },
  "list-item": {
    name: 'Listepost',
    description: 'En sammenhængende klikbar række med titel, beskrivelse og valgfri grafik eller metadata.',
    usage: 'Brug i en native ul/ol til at åbne en posts detaljer. Uden href er rækken en native knap; href giver et native link. current markerer den aktuelle post med aria-current, adskilt fra tastaturfokus. Brug ikke aria-selected eller toggle-semantik til dette valg. Produktet ejer valg, filtrering og fokus. leading og trailing indeholder kun ikke-interaktivt indhold; selvstændige rækkehandlinger placeres uden for rækkens knap/link. compact er til tætte desktoplister.',
    composes: [],
    parts: {
      root: { selector: '.ds-list-item', styles: {
        display: 'flex', alignItems: 'center', gap: '{space.component.gapLarge}', width: '100%', minWidth: '0', maxWidth: '100%', minHeight: '44px', boxSizing: 'border-box',
        padding: '{space.component.padding}', border: '{border.width.default} solid transparent', borderLeftWidth: '3px', borderRadius: '{radius.control}',
        backgroundColor: '{color.background.surface}', color: '{color.text.primary}', fontFamily: '{typography.font.body}', fontSize: '{typography.size.control}', lineHeight: '{typography.lineHeight.control}', textAlign: 'start', textDecoration: 'none', cursor: 'pointer',
        transition: 'background-color {duration.fast}, color {duration.fast}, border-color {duration.fast}',
        '--ds-interaction-hover-surface': '{color.action.neutral.hover.surface}', '--ds-interaction-hover-text': '{color.action.neutral.hover.text}',
        '--ds-interaction-active-surface': '{color.action.neutral.active.surface}', '--ds-interaction-active-text': '{color.action.neutral.active.text}',
      } },
      leading: { selector: '.ds-list-item__leading', styles: { display: 'inline-flex', alignItems: 'center', flexShrink: '0', color: 'inherit' } },
      content: { selector: '.ds-list-item__content', styles: { display: 'flex', flexDirection: 'column', gap: '{space.scale.1}', flex: '1 1 auto', minWidth: '0', overflowWrap: 'anywhere' } },
      heading: { selector: '.ds-list-item__heading', styles: { display: 'block', fontWeight: '{typography.weight.strong}', color: 'inherit' } },
      description: { selector: '.ds-list-item__description', styles: { display: 'block', fontSize: '{typography.size.small}', fontWeight: '{typography.weight.body}', lineHeight: '{typography.lineHeight.body}', color: '{color.text.secondary}' } },
      trailing: { selector: '.ds-list-item__trailing', styles: { display: 'inline-flex', flexShrink: '0', alignItems: 'center', fontSize: '{typography.size.small}', color: 'inherit' } },
    },
    variants: {
      default: { description: 'Rummelig række til samlinger og detaljevisning.', styles: {} },
      compact: { description: 'Tæt desktoprække med mindst 32 px klikflade og plads til ombrudte titler.', styles: { minHeight: '32px', padding: '{space.component.paddingCompact} {space.component.padding}' } },
    },
    states: {
      current: { description: 'Den aktuelle post, vist med farvepar og en indre kant; fokus har sin egen outline.', styles: {
        backgroundColor: '{color.action.selected.rest.surface}', color: '{color.action.selected.rest.text}', borderLeftColor: 'currentColor',
        '--ds-interaction-hover-surface': '{color.action.selected.hover.surface}', '--ds-interaction-hover-text': '{color.action.selected.hover.text}',
        '--ds-interaction-active-surface': '{color.action.selected.active.surface}', '--ds-interaction-active-text': '{color.action.selected.active.text}',
      }, parts: { description: { styles: { color: 'inherit' } } } },
      hover: { description: 'Feedback under pegemarkøren, med bevaret markering af den aktuelle post.', styles: { backgroundColor: 'var(--ds-interaction-hover-surface)', color: 'var(--ds-interaction-hover-text)' }, parts: { description: { styles: { color: 'inherit' } } } },
      active: { description: 'Rækken under aktivering.', styles: { backgroundColor: 'var(--ds-interaction-active-surface)', color: 'var(--ds-interaction-active-text)' }, parts: { description: { styles: { color: 'inherit' } } } },
      focus: { description: 'Synligt tastaturfokus, uafhængigt af den aktuelle post.', styles: { outline: '{border.width.focus} solid {color.focus}', outlineOffset: '{border.offset.focus}' } },
      disabled: { description: 'En utilgængelig knap eller et link uden destination; produktet forklarer årsagen.', styles: { backgroundColor: '{color.disabled.surface}', color: '{color.disabled.text}', borderLeftColor: 'transparent', cursor: 'not-allowed' }, parts: { description: { styles: { color: 'inherit' } } } },
    },
    preview: { tag: 'button', part: 'root', attrs: { type: 'button' }, children: [
      { tag: 'span', part: 'leading', attrs: { 'aria-hidden': 'true' } },
      { tag: 'span', part: 'content', children: [ { tag: 'span', part: 'heading', text: 'En post i samlingen' }, { tag: 'span', part: 'description', text: 'Supplerende oplysninger om posten.' } ] },
      { tag: 'span', part: 'trailing' },
    ] },
  },
  "input": {
    "name": "Tekstinput",
    "description": "Native kontrol til kort, fri tekst.",
    "usage": "Forbind kontrollen med en label. Brug field til label, hjælp og fejl; produktet ejer data og validering.",
    "composes": [],
    "parts": {
      "root": {
        "selector": ".ds-input",
        "styles": {
          "boxSizing": "border-box",
          "minWidth": "0",
          "maxWidth": "100%",
          "width": "100%",
          "minHeight": "max(44px, {size.control.height})",
          "padding": "{space.component.paddingCompact} {space.component.padding}",
          "border": "{border.width.default} solid {color.border.field}",
          "borderRadius": "{radius.control}",
          "backgroundColor": "{color.background.control}",
          "color": "{color.text.primary}",
          "fontFamily": "{typography.font.body}",
          "fontSize": "{typography.size.control}",
          "lineHeight": "{typography.lineHeight.body}",
          "transition": "border-color {duration.fast}"
        }
      }
    },
    "variants": {
      "desktop": {
  "description": "Kompakt desktopbetjening med 32 px klikflader. Brug standardvarianten ved touch eller behov for større mål.",
  "styles": {
    ...DESKTOP_CONTROL_STYLES,
    "height": DESKTOP_INPUT_HEIGHT
  }
},
      "invalid": {
        "description": "Synlig valideringsfejl.",
        "styles": {
          "borderColor": "{color.status.danger}"
        }
      },
      "search": {
        "description": "Indtastning til søgning.",
        "styles": {
          "padding": "{space.component.paddingCompact} {space.component.padding}",
          "fontSize": "{typography.size.label}",
          "borderRadius": "{radius.note}",
          "width": "100%"
        }
      }
    },
    "states": {
      "readOnly": {"description":"Kan fokuseres og kopieres, men ikke redigeres.","styles":{"backgroundColor":"{color.background.subtle}"}},
      "focus": {
        "styles": {
          "outline": "{border.width.focus} solid {color.focus}",
          "outlineOffset": "{border.offset.focus}"
        },
        "description": "Synligt tastaturfokus."
      },
      "disabled": {
        "styles": {
          "backgroundColor": "{color.disabled.surface}",
          "color": "{color.disabled.text}",
          "cursor": "not-allowed"
        },
        "description": "Native deaktiveret kontrol."
      }
    },
    "preview": {
      "tag": "input",
      "part": "root",
      "attrs": {
        "type": "text",
        "placeholder": "Skriv en værdi",
        "aria-label": "Eksempelværdi"
      }
    }
  },
  "field": {
    "name": "Formularfelt",
    "description": "Label, native kontrol, hjælp og fejl i én opbygning.",
    "usage": "Renderer forbinder label, kontrol, hjælp og fejl via unikke id’er. Produktet leverer validering og data; disabled og required bruger native attributter.",
    "composes": [
      "input",
      "text"
    ],
    "parts": {
      "root": {
        "selector": ".ds-field",
        "styles": {
          "minWidth": "0",
          "maxWidth": "100%",
          "display": "flex",
          "flexDirection": "column",
          "gap": "{space.component.gap}",
          "fontFamily": "{typography.font.body}"
        }
      },
      "label": {
        "selector": ".ds-field__label",
        "styles": {
          "overflowWrap": "anywhere",
          "fontSize": "{typography.size.label}",
          "fontWeight": "{typography.weight.label}",
          "color": "{color.text.primary}",
          "lineHeight": "{typography.lineHeight.label}"
        }
      },
      "control": {
        "selector": ".ds-input",
        "styles": {
          "width": "100%",
          "border": "{border.width.default} solid {color.border.field}"
        }
      },
      "hint": {
        "selector": ".ds-field__hint",
        "styles": {
          "overflowWrap": "anywhere",
          "margin": "0",
          "fontSize": "{typography.size.small}",
          "lineHeight": "{typography.lineHeight.label}",
          "color": "{color.text.secondary}"
        }
      },
      "error": {
        "selector": ".ds-field__error",
        "styles": {
          "overflowWrap": "anywhere",
          "display": "none",
          "margin": "0",
          "fontSize": "{typography.size.small}",
          "lineHeight": "{typography.lineHeight.label}",
          "color": "{color.status.dangerText}"
        }
      }
    },
    "variants": {
      "default": {
        "description": "Almindelig opbygning.",
        "styles": {}
      },
      "invalid": {
        "description": "Synlig valideringsfejl.",
        "styles": {},
        "parts": {
          "control": {
            "styles": {
              "borderColor": "{color.status.danger}"
            }
          },
          "error": {
            "styles": {
              "display": "block"
            }
          }
        }
      }
    },
    "states": {
      "readOnly": {"description":"Native input/textarea bevarer fokus og kopiering.","styles":{},"parts":{"control":{"styles":{"backgroundColor":"{color.background.subtle}"}}}},
      "focus": {
        "styles": {},
        "parts": {
          "label": {
            "styles": {
              "color": "{color.action.selected.rest.text}"
            }
          }
        },
        "description": "Synligt tastaturfokus."
      },
      "disabled": {
        "styles": {},
        "parts": {
          "label": {
            "styles": {
              "color": "{color.disabled.text}"
            }
          },
          "control": {
            "styles": {
              "backgroundColor": "{color.disabled.surface}",
              "color": "{color.disabled.text}",
              "cursor": "not-allowed"
            }
          }
        },
        "description": "Native deaktiveret kontrol."
      }
    },
    "preview": {
      "tag": "div",
      "part": "root",
      "children": [
        {
          "tag": "label",
          "part": "label",
          "text": "Navn"
        },
        {
          "tag": "input",
          "part": "control",
          "attrs": {
            "type": "text",
            "placeholder": "Skriv dit navn"
          }
        },
        {
          "tag": "p",
          "part": "hint",
          "text": "Brug det navn, du vil vise."
        },
        {
          "tag": "p",
          "part": "error",
          "text": "Udfyld dit navn."
        }
      ]
    }
  },
  "select": {
    "name": "Valgliste",
    "description": "Native kontrol til ét valg fra en kendt liste.",
    "usage": "Forbind select med en label. Brug choice-field til label, hjælp og fejl. Browseren styrer åbning og tastatur.",
    "composes": [],
    "parts": {
      "root": {
        "selector": ".ds-select",
        "styles": {
          "boxSizing": "border-box",
          "minWidth": "0",
          "maxWidth": "100%",
          "width": "100%",
          "minHeight": "max(44px, {size.control.height})",
          "padding": "{space.component.paddingCompact} {space.component.padding}",
          "border": "{border.width.default} solid {color.border.field}",
          "borderRadius": "{radius.control}",
          "backgroundColor": "{color.background.control}",
          "color": "{color.text.primary}",
          "fontFamily": "{typography.font.body}",
          "fontSize": "{typography.size.control}",
          "lineHeight": "{typography.lineHeight.body}"
        }
      }
    },
    "variants": {
      "desktop": {
  "description": "Kompakt desktopbetjening med 32 px klikflader. Brug standardvarianten ved touch eller behov for større mål.",
  "styles": {
    ...DESKTOP_CONTROL_STYLES,
    "height": DESKTOP_INPUT_HEIGHT
  }
},
      "invalid": {
        "description": "Synlig valideringsfejl.",
        "styles": {
          "borderColor": "{color.status.danger}"
        }
      },
      "compact": {
        "description": "Kompakt opbygning.",
        "styles": {
          "padding": "{space.component.paddingCompact} {space.component.padding}"
        }
      }
    },
    "states": {
      "focus": {
        "styles": {
          "outline": "{border.width.focus} solid {color.focus}",
          "outlineOffset": "{border.offset.focus}"
        },
        "description": "Synligt tastaturfokus."
      },
      "disabled": {
        "styles": {
          "backgroundColor": "{color.disabled.surface}",
          "color": "{color.disabled.text}",
          "cursor": "not-allowed"
        },
        "description": "Native deaktiveret kontrol."
      }
    },
    "preview": {
      "tag": "select",
      "part": "root",
      "children": [
        {
          "tag": "option",
          "text": "Vælg en mulighed"
        },
        {
          "tag": "option",
          "text": "Mulighed A"
        },
        {
          "tag": "option",
          "text": "Mulighed B"
        }
      ],
      "attrs": {
        "aria-label": "Mulighed"
      }
    }
  },
  "checkbox": {
    "name": "Afkrydsning",
    "description": "Et selvstændigt til- eller fravalg med label.",
    "usage": "Bevar native checkbox og label. Produktet leverer checked, værdi og ændringshåndtering.",
    "composes": [],
    "parts": {
      ...choiceDescriptions('checkbox'),
      "root": {
        "selector": ".ds-checkbox",
        "styles": {
          "display": "inline-flex",
          "minWidth": "0",
          "maxWidth": "100%",
          "boxSizing": "border-box",
          "alignItems": "center",
          "gap": "{space.component.gap}",
          "fontFamily": "{typography.font.body}",
          "fontSize": "{typography.size.label}",
          "lineHeight": "{typography.lineHeight.body}",
          "color": "{color.text.primary}",
          "cursor": "pointer",
          "minHeight": "max(44px, {size.control.height})"
        }
      },
      "control": {
        "selector": ".ds-checkbox__control",
        "styles": {
          "width": "{size.checkbox}",
          "height": "{size.checkbox}",
          "margin": "0",
          "accentColor": "{color.action.primary.rest.surface}",
          "cursor": "pointer",
          "flexShrink": "0"
        }
      },
      "label": {
        "selector": ".ds-checkbox__label",
        "styles": {
          "overflowWrap": "anywhere",
          "color": "inherit"
        }
      },
      "indicator": {
        "selector": ".ds-checkbox__indicator",
        "styles": {
          "position": "absolute",
          "width": "{size.checkbox.indicator}",
          "height": "{size.checkbox.indicator}",
          "left": "calc(({size.checkbox} - {size.checkbox.indicator}) / 2)",
          "top": "calc(50% - {size.checkbox.indicator} / 2)",
          "transform": "rotate(45deg)",
          "backgroundColor": "{color.brand.accent}",
          "pointerEvents": "none",
          "display": "none"
        }
      }
    },
    "variants": {"invalid":CHOICE_INVALID},
    "states": {
      "focus": {
        "styles": {},
        "parts": {
          "control": {
            "styles": {
              "outline": "{border.width.focus} solid {color.focus}",
              "outlineOffset": "{border.offset.focus}"
            }
          }
        },
        "description": "Synligt tastaturfokus."
      },
      "disabled": {
        "styles": {},
        "parts": {
          "control": {
            "styles": {
              "opacity": "{opacity.disabled}",
              "cursor": "not-allowed"
            }
          },
          "label": {
            "styles": {
              "color": "{color.disabled.text}"
            }
          }
        },
        "description": "Native deaktiveret kontrol."
      },
      "checked": {
        "description": "Native markeret kontrol.",
        "styles": {},
        "parts": {
          "control": {
            "styles": {
              "backgroundColor": "{color.text.primary}"
            }
          },
          "indicator": {
            "styles": {
              "display": "block"
            }
          }
        }
      }
    },
    "preview": {
      "tag": "label",
      "part": "root",
      "children": [
        {
          "tag": "input",
          "part": "control",
          "attrs": {
            "type": "checkbox",
            "checked": true
          }
        },
        {
          "tag": "span",
          "part": "body",
          "children": [{"tag":"span","part":"label","text":"Aktivér indstillingen"},{"tag":"span","part":"hint","text":""},{"tag":"span","part":"error","text":"Kontrollér valget."}]
        }
      ]
    }
  },
  "card": {
    "name": "Kort",
    "description": "En indholdsflade med valgfri overskrift, indhold og handlinger.",
    "usage": "Sammensæt header, body og footer efter behov. Biblioteket ejer indre afstande og opbygning; temaet ejer udtrykket.",
    "composes": [
      "text",
      "button"
    ],
    "parts": {
      "root": {
        "selector": ".ds-card",
        "styles": {
          "display": "flex",
          "flexDirection": "column",
          "gap": "{space.component.gapLarge}",
          "padding": "{space.component.paddingLarge}",
          "border": "{border.width.default} solid {color.border.default}",
          "borderRadius": "{radius.card}",
          "backgroundColor": "{color.background.surface}",
          "color": "{color.text.primary}",
          "fontFamily": "{typography.font.body}",
          "boxShadow": "none",
          "boxSizing": "border-box",
          "minWidth": "0",
          "maxWidth": "100%",
          "overflowWrap": "anywhere"
        }
      },
      "header": {
        "selector": ".ds-card__header",
        "styles": {
          "margin": "0",
          "fontFamily": "{typography.font.heading}",
          "fontSize": "{typography.size.title}",
          "fontWeight": "{typography.weight.heading}",
          "lineHeight": "{typography.lineHeight.heading}",
          "minWidth":"0",
          "overflowWrap":"anywhere"
        }
      },
      "body": {
        "selector": ".ds-card__body",
        "styles": {
          "margin": "0",
          "fontSize": "{typography.size.body}",
          "lineHeight": "{typography.lineHeight.body}",
          "color": "{color.text.secondary}",
          "minWidth":"0",
          "overflowWrap":"anywhere"
        }
      },
      "footer": {
        "selector": ".ds-card__footer",
        "styles": {
          "display": "flex",
          "flexWrap": "wrap",
          "alignItems": "center",
          "gap": "{space.component.gapLarge}",
          "minWidth":"0",
          "maxWidth":"100%"
        }
      },
      "text": {
        "selector": ".ds-text",
        "styles": {
          "color": "inherit"
        }
      },
      "action": {
        "selector": ".ds-button",
        "styles": {}
      }
    },
    "variants": {
      "default": {
        "description": "Almindelig opbygning.",
        "styles": {}
      },
      "elevated": {
        "description": "Flade med dybde.",
        "styles": {
          "boxShadow": "{shadow.card}"
        }
      },
      "material": {
        "description": "Opak, kontrastmålt materialeflade. Temaets gradient giver eksempelvis papir eller satin; ingen billeder, gennemsigtighed eller ændret layout.",
        "styles": {"background":"{gradient.material}"}
      },
      "embossed": {
        "description": "Indvendigt relief til en taktil indholdsflade. Bevarer læsbar grundfarve, native indhold og synligt fokus.",
        "styles": {"boxShadow":"{shadow.embossed}"}
      },
      "asymmetric": {
        "description": "Et fremhævet øvre højre og nedre venstre hjørne. Til særprægede indholdskort; ændrer hverken placering, klikflader eller indre afstande.",
        "styles": {"borderTopRightRadius":"{radius.feature}","borderBottomLeftRadius":"{radius.feature}"}
      },
      "outlined": {
        "description": "Flade med synlig kant.",
        "styles": {
          "boxShadow": "none"
        }
      },
      "subtle-border": {
        "description": "Flade med diskret kant.",
        "styles": {
          "boxShadow": "none"
        }
      },
      "subtle": {
        "description": "Lavt fremhævet flade.",
        "styles": {
          "backgroundColor": "{color.background.subtle}",
          "borderColor": "transparent",
          "boxShadow": "none"
        }
      },
      "inverse": {
        "description": "Omvendt farvehierarki.",
        "styles": {
          "backgroundColor": "{color.background.inverse}",
          "color": "{color.text.inverse}",
          "borderColor": "{color.background.inverse}",
          "boxShadow": "none"
        },
        "parts": {
          "header": {
            "styles": {
              "color": "{color.text.inverse}"
            }
          },
          "body": {
            "styles": {
              "color": "{color.text.inverse}"
            }
          }
        }
      },
      "floating": {
        "description": "Flade over omgivelserne.",
        "styles": {
          "boxShadow": "{shadow.floating}"
        }
      }
    },
    "states": {},
    "preview": {
      "tag": "article",
      "part": "root",
      "children": [
        {
          "tag": "h3",
          "part": "header",
          "text": "Overskrift"
        },
        {
          "tag": "p",
          "part": "body",
          "text": "Indhold og relaterede oplysninger."
        },
        {
          "tag": "footer",
          "part": "footer",
          "text": "Supplerende information"
        }
      ]
    }
  },
  "badge": {
    "name": "Statusmærke",
    "description": "En kompakt tekstmarkering for status eller kategori.",
    "usage": "Skriv en forståelig tekst. Farve kan supplere betydningen, men må ikke være den eneste forklaring.",
    "composes": [],
    "parts": {
      "root": {
        "selector": ".ds-badge",
        "styles": {
          "display": "inline-flex",
          "alignItems": "center",
          "gap": "{space.component.gap}",
          "padding": "calc({space.component.paddingCompact} / 2) {space.component.paddingCompact}",
          "borderRadius": "{radius.badge}",
          "backgroundColor": "{color.background.subtle}",
          "color": "{color.text.secondary}",
          "fontFamily": "{typography.font.body}",
          "fontSize": "{typography.size.small}",
          "fontWeight": "{typography.weight.label}",
          "lineHeight": "{typography.lineHeight.control}",
          "border": "{border.width.default} solid transparent",
          "minWidth":"0",
          "maxWidth":"100%",
          "boxSizing":"border-box",
          "overflowWrap":"anywhere"
        }
      }
    },
    "variants": {
      "default": {
        "description": "Almindelig opbygning.",
        "styles": {}
      },
      "neutral": {
        "description": "Neutral status eller kategori.",
        "styles": {
          "backgroundColor": "{color.background.subtle}",
          "color": "{color.text.secondary}"
        }
      },
      "accent": {
        "description": "Særskilt fremhævning.",
        "styles": {
          "backgroundColor": "{color.action.selected.rest.surface}",
          "color": "{color.action.selected.rest.text}"
        }
      },
      "danger": {
        "description": "Destruktiv handling eller fejlstatus.",
        "styles": {
          "backgroundColor": "{color.status.dangerSurface}",
          "color": "{color.status.dangerText}"
        }
      },
      "inverse": {
        "description": "Omvendt farvehierarki.",
        "styles": {
          "backgroundColor": "{color.background.inverse}",
          "color": "{color.text.inverse}",
          "borderColor": "{color.background.inverse}"
        }
      },
      "data": {
        "description": "Markering af en oplysning.",
        "styles": {
          "color": "{color.text.primary}",
          "borderColor": "{color.action.primary.rest.surface}",
          "backgroundColor": "{color.background.surface}"
        }
      }
    },
    "states": {},
    "preview": {
      "tag": "span",
      "part": "root",
      "text": "Klar"
    }
  },
  "divider": {
    "name": "Skillelinje",
    "description": "En opdeling mellem beslægtede områder.",
    "usage": "Brug hr til semantisk opdeling. En stak ejer afstanden omkring standardlinjen; standalone giver ydre afstand uden en stak. Rent dekorative eller lodrette linjer må ikke ændre læserækkefølgen.",
    "composes": [],
    "parts": {
      "root": {
        "selector": ".ds-divider",
        "styles": {
          "width": "100%",
          "height": "0",
          "margin": "0",
          "border": "0",
          "borderTop": "{border.width.default} solid {color.border.default}"
        }
      }
    },
    "variants": {
      "standalone": {
        "description": "Selvstændig skillelinje med afstand omkring; brug standard i en stak.",
        "styles": { "margin": "{space.component.gapLarge} 0" }
      },
      "vertical": {
        "description": "Lodret opbygning.",
        "styles": {
          "width": "{border.width.default}",
          "height": "auto",
          "margin": "{space.control.inset}",
          "border": "0",
          "backgroundColor": "{color.border.default}",
          "alignSelf": "stretch",
          "flexShrink": "0"
        }
      }
    },
    "states": {},
    "preview": {
      "tag": "hr",
      "part": "root"
    }
  },
  "alert": {
    "name": "Besked",
    "description": "En orientering eller fejl med titel og forklaring.",
    "usage": "Produktet bestemmer timing og live-announcement. Biblioteket ejer indre afstande og læserækkefølge.",
    "composes": [
      "text"
    ],
    "parts": {
      "root": {
        "selector": ".ds-alert",
        "styles": {
          "display": "flex",
          "flexDirection": "column",
          "gap": "{space.component.gap}",
          "padding": "{space.component.padding}",
          "border": "{border.width.default} solid {color.border.default}",
          "borderRadius": "{radius.card}",
          "backgroundColor": "{color.background.subtle}",
          "color": "{color.text.primary}",
          "fontFamily": "{typography.font.body}",
          "boxSizing": "border-box",
          "lineHeight": "{typography.lineHeight.body}"
        }
      },
      "title": {
        "selector": ".ds-alert__title",
        "styles": {
          "margin": "0",
          "fontSize": "{typography.size.label}",
          "fontWeight": "{typography.weight.label}"
        }
      },
      "body": {
        "selector": ".ds-alert__body",
        "styles": {
          "margin": "0",
          "fontSize": "{typography.size.body}",
          "lineHeight": "{typography.lineHeight.body}"
        }
      },
      "marker": {
        "selector": ".ds-alert__marker",
        "styles": {
          "width": "{size.notice.marker}",
          "height": "{size.notice.marker}",
          "backgroundColor": "{color.text.primary}",
          "transform": "rotate(45deg)",
          "marginTop": "6px",
          "gridRow": "1 / span 2"
        }
      }
    },
    "variants": {
      "neutral": {
        "description": "Neutral status eller kategori.",
        "styles": {
          "backgroundColor": "{color.background.subtle}"
        }
      },
      "danger": {
        "description": "Destruktiv handling eller fejlstatus.",
        "styles": {
          "backgroundColor": "{color.status.dangerSurface}",
          "color": "{color.status.dangerText}",
          "borderColor": "{color.status.danger}"
        }
      },
      "accent": {
        "description": "Særskilt fremhævning.",
        "styles": {
          "backgroundColor": "{color.action.selected.rest.surface}",
          "color": "{color.action.selected.rest.text}",
          "borderColor": "{color.action.selected.rest.surface}"
        },
        "parts": {
          "marker": {
            "styles": {
              "backgroundColor": "{color.brand.accent}"
            }
          }
        }
      }
    },
    "states": {},
    "preview": {
      "tag": "section",
      "part": "root",
      "children": [
        {
          "tag": "strong",
          "part": "title",
          "text": "Ændringer gemt"
        },
        {
          "tag": "p",
          "part": "body",
          "text": "Dine ændringer er nu klar til brug."
        }
      ]
    }
  },
  "dialog": {
    "name": "Dialog",
    "description": "En afgrænset dialog med titel, indhold og handlinger.",
    "usage": "Renderer leverer native dialog med titel og valgfri forklaring. mountDialog forbinder udløser, showModal, lukning og fokusretur; produktet ejer handlinger og kladder. Browseren håndterer modal fokusadfærd. Brug describeBody:false ved sammensat indhold, som skal læses strukturelt.",
    "composes": [
      "text",
      "button"
    ],
    "parts": {
      "root": {
        "selector": ".ds-dialog",
        "styles": {
          "boxSizing": "border-box",
          "display": "flex",
          "flexDirection": "column",
          "gap": "{space.component.gapLarge}",
          "width": "100%",
          "maxWidth": "{size.dialog.maxWidth}",
          "minWidth": "0",
          "overflowWrap": "anywhere",
          "padding": "{space.component.paddingLarge}",
          "border": "{border.width.default} solid {color.border.default}",
          "borderRadius": "{radius.card}",
          "backgroundColor": "{color.background.surface}",
          "color": "{color.text.primary}",
          "fontFamily": "{typography.font.body}",
          "boxShadow": "{shadow.floating}"
        }
      },
      "title": {
        "selector": ".ds-dialog__title",
        "styles": {
          "margin": "0",
          "fontFamily": "{typography.font.heading}",
          "fontSize": "{typography.size.title}",
          "fontWeight": "{typography.weight.heading}",
          "lineHeight": "{typography.lineHeight.heading}"
        }
      },
      "body": {
        "selector": ".ds-dialog__body",
        "styles": {
          "margin": "0",
          "fontSize": "{typography.size.body}",
          "lineHeight": "{typography.lineHeight.body}",
          "color": "{color.text.secondary}"
        }
      },
      "footer": {
        "selector": ".ds-dialog__footer",
        "styles": {
          "display": "flex",
          "flexWrap": "wrap",
          "justifyContent": "flex-end",
          "gap": "{space.component.gapLarge}"
        }
      }
    },
    "variants": {},
    "states": {},
    "preview": {
      "tag": "div",
      "part": "root",
      "children": [
        {
          "tag": "h2",
          "part": "title",
          "text": "Bekræft handling"
        },
        {
          "tag": "p",
          "part": "body",
          "text": "Gennemgå oplysningerne, før du fortsætter."
        },
        {
          "tag": "footer",
          "part": "footer",
          "text": "Vælg en handling"
        }
      ]
    }
  },
  "heading": {
    "name": "Overskrift",
    "description": "Et tydeligt niveau i indholdets hierarki.",
    "usage": "Brug h1-h6 efter dokumentets struktur. Visuelle varianter erstatter ikke et korrekt heading-niveau.",
    "composes": [],
    "parts": {
      "root": {
        "selector": ".ds-heading",
        "styles": {
          "margin": "0",
          "fontFamily": "{typography.font.heading}",
          "fontSize": "{typography.size.heading}",
          "fontWeight": "{typography.weight.heading}",
          "lineHeight": "{typography.lineHeight.heading}",
          "color": "{color.text.primary}",
          "letterSpacing": "{typography.tracking.display}",
          "overflowWrap": "anywhere"
        }
      }
    },
    "variants": {
      "title": {
        "description": "Titel.",
        "styles": {
          "fontSize": "{typography.size.heading}"
        }
      },
      "subtitle": {
        "description": "Undertitel.",
        "styles": {
          "fontSize": "{typography.size.title}",
          "lineHeight": "{typography.lineHeight.subtitle}",
          "letterSpacing": "0"
        }
      },
      "display": {
        "description": "Fremhævet overskrift.",
        "styles": {
          "fontSize": "clamp(2rem, 5vw, {typography.size.display})",
          "fontWeight": "{typography.weight.display}",
          "lineHeight": "{typography.lineHeight.display}",
          "letterSpacing": "{typography.tracking.display}"
        }
      },
      "section": {
        "description": "Afsnitstitel.",
        "styles": {
          "fontSize": "{typography.size.tiny}",
          "fontWeight": "{typography.weight.strong}",
          "textTransform": "uppercase",
          "letterSpacing": "{typography.tracking.section}",
          "color": "{color.text.secondary}"
        }
      },
      "expressive": {
        "description": "Særskilt typografisk rolle.",
        "styles": {
          "fontFamily": "{typography.font.expressive}",
          "fontSize": "{typography.size.expressive}",
          "fontStyle": "normal",
          "fontWeight": "{typography.weight.expressive}"
        }
      },
      "expressive-large": {
        "description": "Stor, særskilt typografisk rolle.",
        "styles": {
          "fontFamily": "{typography.font.expressive}",
          "fontSize": "clamp(2rem, 5vw, {typography.size.expressiveLarge})",
          "fontStyle": "normal",
          "fontWeight": "{typography.weight.expressive}",
          "lineHeight": 1.15
        }
      },
      "panel": {
        "description": "Kompakt paneltitel.",
        "styles": {
          "fontFamily": "{typography.font.body}",
          "fontSize": "{typography.size.panel}",
          "fontWeight": "{typography.weight.strong}"
        }
      }
    },
    "states": {},
    "preview": {
      "tag": "h2",
      "part": "root",
      "text": "En tydelig overskrift"
    }
  },
  "label": {
    "name": "Etiket",
    "description": "En kort tekst, der navngiver en kategori eller et indholdsområde.",
    "usage": "Brug korte, tydelige ord. Formularkontroller skal have en native label via field eller choice-field.",
    "composes": [],
    "parts": {
      "root": {
        "selector": ".ds-label",
        "styles": {
          "fontFamily": "{typography.font.body}",
          "fontSize": "{typography.size.small}",
          "fontWeight": "{typography.weight.label}",
          "lineHeight": "{typography.lineHeight.label}",
          "letterSpacing": "{typography.tracking.label}",
          "textTransform": "uppercase",
          "color": "{color.text.label}",
          "overflowWrap":"anywhere"
        }
      }
    },
    "variants": {},
    "states": {},
    "preview": {
      "tag": "span",
      "part": "root",
      "text": "Kategori"
    }
  },
  "tag": {
    "name": "Mærkat",
    "description": "En kategori eller et valgbart tekstmærke.",
    "usage": "Statiske mærkater bruger span; handlinger bruger native button. Produktet ejer valg og separat fjernelse.",
    "composes": [],
    "parts": {
      icon:{selector:'.ds-tag__icon',styles:{display:'inline-flex',alignItems:'center',flexShrink:'0'}},
      label:{selector:'.ds-tag__label',styles:{minWidth:'0',overflowWrap:'anywhere'}},
      "root": {
        "selector": ".ds-tag",
        "styles": {
          "display": "inline-flex",
          "alignItems": "center",
          "justifyContent": "center",
          "gap": "{space.component.gap}",
          "minHeight": "max(44px, {size.control.height})",
          "padding": "{space.component.paddingCompact} {space.component.padding}",
          "border": "{border.width.default} solid {color.border.default}",
          "borderRadius": "{radius.control}",
          "backgroundColor": "transparent",
          "color": "{color.action.selected.rest.text}",
          "fontFamily": "{typography.font.body}",
          "fontSize": "{typography.size.tag}",
          "cursor": "pointer",
          "minWidth": "44px",
          "fontWeight": "{typography.weight.label}",
          "lineHeight": "{typography.lineHeight.control}",
          "boxSizing": "border-box",
          "transition": "background-color {duration.fast}, color {duration.fast}, border-color {duration.fast}",
          "maxWidth":"100%",
          "overflowWrap":"anywhere"
        }
      }
    },
    "variants": {
      "default": {
        "description": "Almindelig opbygning.",
        "styles": {}
      },
      "selected": {
        "description": "Valgt mærkat.",
        "styles": {
          "backgroundColor": "{color.action.primary.rest.surface}",
          "color": "{color.action.primary.rest.text}",
          "borderColor": "{color.action.primary.rest.surface}"
        }
      }
    },
    "states": {
      "hover": {
        "description": "Kontrollen under pegemarkøren.",
        "styles": {
          "backgroundColor": "{color.action.selected.rest.surface}",
          "color": "{color.text.primary}"
        }
      },
      "focus": {
        "description": "Synligt tastaturfokus.",
        "styles": {
          "outline": "{border.width.focus} solid {color.focus}",
          "outlineOffset": "{border.offset.focus}"
        }
      },
      "disabled": {
        "description": "Native deaktiveret kontrol.",
        "styles": {
          "opacity": "{opacity.disabled}",
          "cursor": "not-allowed"
        }
      }
    },
    "preview": {
      "tag": "button",
      "part": "root",
      "text": "Kategori",
      "attrs": {
        "type": "button"
      }
    }
  },
  "radio": {
    "name": "Radiovalg",
    "description": "Én mulighed i en gruppe, hvor højst én kan vælges.",
    "usage": "Bevar native radio, fælles name og label. Produktet navngiver gruppen og leverer den valgte værdi.",
    "composes": [],
    "parts": {
      ...choiceDescriptions('radio'),
      "root": {
        "selector": ".ds-radio",
        "styles": {
          "minWidth": "0",
          "maxWidth": "100%",
          "boxSizing": "border-box",
          "display": "inline-flex",
          "alignItems": "center",
          "gap": "{space.component.gap}",
          "minHeight": "max(44px, {size.control.height})",
          "fontFamily": "{typography.font.body}",
          "fontSize": "{typography.size.control}",
          "color": "{color.text.primary}",
          "cursor": "pointer",
          "lineHeight": "{typography.lineHeight.body}"
        }
      },
      "control": {
        "selector": ".ds-radio__control",
        "styles": {
          "width": "{size.checkbox}",
          "height": "{size.checkbox}",
          "margin": "0",
          "accentColor": "{color.action.primary.rest.surface}",
          "borderRadius": "{radius.radio}",
          "flexShrink": "0",
          "cursor": "pointer"
        }
      },
      "label": {
        "selector": ".ds-radio__label",
        "styles": {
          "overflowWrap": "anywhere",
          "color": "inherit"
        }
      }
    },
    "variants": {
      "invalid":CHOICE_INVALID,
      "default": {
        "description": "Almindelig opbygning.",
        "styles": {}
      }
    },
    "states": {
      "focus": {
        "description": "Synligt tastaturfokus.",
        "styles": {},
        "parts": {
          "control": {
            "styles": {
              "outline": "{border.width.focus} solid {color.focus}",
              "outlineOffset": "{border.offset.focus}"
            }
          }
        }
      },
      "disabled": {
        "description": "Native deaktiveret kontrol.",
        "styles": {
          "opacity": "{opacity.disabled}",
          "cursor": "not-allowed"
        },
        "parts": {
          "control": {
            "styles": {
              "cursor": "not-allowed"
            }
          }
        }
      }
    },
    "preview": {
      "tag": "label",
      "part": "root",
      "children": [
        {
          "tag": "input",
          "part": "control",
          "attrs": {
            "type": "radio",
            "checked": true
          }
        },
        {
          "tag": "span",
          "part": "body",
          "children": [{"tag":"span","part":"label","text":"Mulighed A"},{"tag":"span","part":"hint","text":""},{"tag":"span","part":"error","text":"Kontrollér valget."}]
        }
      ]
    }
  },
  "switch": {
    "name": "Kontakt",
    "description": "En navngivet indstilling med til- og fratilstand.",
    "usage": "Bevar native checkbox med role=switch og label. Checked angiver tilstanden; produktet ejer virkningen.",
    "composes": [],
    "parts": {
      ...choiceDescriptions('switch'),
      "root": {
        "selector": ".ds-switch",
        "styles": {
          "minWidth": "0",
          "maxWidth": "100%",
          "boxSizing": "border-box",
          "display": "inline-flex",
          "position": "relative",
          "alignItems": "center",
          "gap": "{space.component.gap}",
          "minHeight": "max(44px, {size.control.height})",
          "fontFamily": "{typography.font.body}",
          "fontSize": "{typography.size.control}",
          "color": "{color.text.primary}",
          "cursor": "pointer",
          "lineHeight": "{typography.lineHeight.body}"
        }
      },
      "control": {
        "selector": ".ds-switch__control",
        "styles": {
          "position": "absolute",
          "left": "0",
          "width": "{size.switch.width}",
          "height": "{size.switch.height}",
          "opacity": 0,
          "margin": "0",
          "cursor": "pointer"
        }
      },
      "track": {
        "selector": ".ds-switch__track",
        "styles": {
          "position": "relative",
          "boxSizing": "border-box",
          "display": "block",
          "width": "{size.switch.width}",
          "height": "{size.switch.height}",
          "border": "{border.width.default} solid {color.border.strong}",
          "borderRadius": "{radius.pill}",
          "backgroundColor": "{color.background.subtle}",
          "pointerEvents": "none",
          "flexShrink": "0",
          "transition": "background-color {duration.base}, border-color {duration.base}"
        }
      },
      "thumb": {
        "selector": ".ds-switch__thumb",
        "styles": {
          "position": "absolute",
          "top": "calc((100% - {size.switch.thumb}) / 2)",
          "left": "{size.switch.inset}",
          "width": "{size.switch.thumb}",
          "height": "{size.switch.thumb}",
          "backgroundColor": "{color.text.primary}",
          "transition": "left {duration.base} cubic-bezier(0.2,0,0.2,1), background-color {duration.base} cubic-bezier(0.2,0,0.2,1)",
          "borderRadius": "{radius.pill}"
        }
      },
      "label": {
        "selector": ".ds-switch__label",
        "styles": {
          "overflowWrap": "anywhere",
          "color": "inherit"
        }
      }
    },
    "variants": {
      "invalid":CHOICE_INVALID,
      "default": {
        "description": "Almindelig opbygning.",
        "styles": {}
      }
    },
    "states": {
      "checked": {
        "description": "Native markeret kontrol.",
        "styles": {},
        "parts": {
          "track": {
            "styles": {
              "backgroundColor": "{color.action.primary.rest.surface}",
              "borderColor": "{color.action.primary.rest.surface}"
            }
          },
          "thumb": {
            "styles": {
              "left": "calc({size.switch.width} - {size.switch.thumb} - {size.switch.inset} - 2 * {border.width.default})",
              "backgroundColor": "{color.action.primary.rest.text}"
            }
          }
        }
      },
      "focus": {
        "description": "Synligt tastaturfokus.",
        "styles": {},
        "parts": {
          "track": {
            "styles": {
              "outline": "{border.width.focus} solid {color.focus}",
              "outlineOffset": "{border.offset.focus}"
            }
          }
        }
      },
      "disabled": {
        "description": "Native deaktiveret kontrol.",
        "styles": {
          "opacity": "{opacity.disabled}",
          "cursor": "not-allowed"
        },
        "parts": {
          "control": {
            "styles": {
              "cursor": "not-allowed"
            }
          }
        }
      }
    },
    "preview": {
      "tag": "label",
      "part": "root",
      "children": [
        {
          "tag": "input",
          "part": "control",
          "attrs": {
            "type": "checkbox",
            "checked": true
          }
        },
        {
          "tag": "span",
          "part": "track",
          "children": [
            {
              "tag": "span",
              "part": "thumb"
            }
          ]
        },
        {
          "tag": "span",
          "part": "body",
          "children": [{"tag":"span","part":"label","text":"Aktivér indstillingen"},{"tag":"span","part":"hint","text":""},{"tag":"span","part":"error","text":"Kontrollér valget."}]
        }
      ]
    }
  },
  "choice-field": {
    "name": "Valgfelt",
    "description": "Label, native valgliste, hjælp og fejl i én opbygning.",
    "usage": "Native select styrer valg og tastatur. Renderer forbinder label, hjælp og fejl; produktet leverer muligheder og validering.",
    "composes": [],
    "parts": {
      "root": {
        "selector": ".ds-choice-field",
        "styles": {
          "minWidth": "0",
          "maxWidth": "100%",
          "display": "flex",
          "flexDirection": "column",
          "gap": "{space.component.gap}",
          "width": "100%",
          "fontFamily": "{typography.font.body}",
          "fontSize": "{typography.size.control}"
        }
      },
      "list": {
        "selector": ".ds-choice-field__list",
        "styles": {
          "display": "none",
          "border": "{border.width.default} solid {color.border.default}",
          "backgroundColor": "{color.background.canvas}"
        }
      },
      "option": {
        "selector": ".ds-choice-field__option",
        "styles": {
          "display": "flex",
          "alignItems": "center",
          "minHeight": "{size.control.height}",
          "padding": "{space.component.paddingCompact}",
          "border": "0",
          "borderBottom": "{border.width.default} solid {color.border.default}",
          "borderRadius": "{radius.control}",
          "backgroundColor": "{color.background.canvas}",
          "color": "{color.text.primary}",
          "textAlign": "left",
          "fontFamily": "{typography.font.body}",
          "fontSize": "{typography.size.control}",
          "cursor": "pointer"
        }
      },
      "control": {
        "selector": ".ds-choice-field__control",
        "styles": {
          "minWidth": "0",
          "maxWidth": "100%",
          "boxSizing": "border-box",
          "width": "100%",
          "minHeight": "max(44px, {size.control.height})",
          "padding": "{space.component.paddingCompact} {space.component.padding}",
          "border": "{border.width.default} solid {color.border.field}",
          "borderRadius": "{radius.control}",
          "backgroundColor": "{color.background.control}",
          "color": "{color.text.primary}",
          "fontFamily": "{typography.font.body}",
          "fontSize": "{typography.size.control}",
          "lineHeight": "{typography.lineHeight.body}"
        }
      },
      "label": {
        "selector": ".ds-choice-field__label",
        "styles": {
          "overflowWrap": "anywhere",
          "fontSize": "{typography.size.label}",
          "fontWeight": "{typography.weight.label}",
          "color": "{color.text.primary}",
          "lineHeight": "{typography.lineHeight.label}"
        }
      },
      "hint": {
        "selector": ".ds-choice-field__hint",
        "styles": {
          "overflowWrap": "anywhere",
          "margin": "0",
          "fontSize": "{typography.size.small}",
          "color": "{color.text.secondary}",
          "lineHeight": "{typography.lineHeight.label}"
        }
      },
      "error": {
        "selector": ".ds-choice-field__error",
        "styles": {
          "overflowWrap": "anywhere",
          "display": "none",
          "margin": "0",
          "fontSize": "{typography.size.small}",
          "color": "{color.status.dangerText}",
          "lineHeight": "{typography.lineHeight.label}"
        }
      }
    },
    "variants": {
      "default": {
        "description": "Almindelig opbygning.",
        "styles": {},
        "parts": {
          "list": {
            "styles": {
              "display": "flex",
              "flexDirection": "column"
            }
          }
        }
      },
      "invalid": {
        "description": "Synlig valideringsfejl.",
        "styles": {},
        "parts": {
          "control": {
            "styles": {
              "borderColor": "{color.status.danger}"
            }
          },
          "error": {
            "styles": {
              "display": "block"
            }
          }
        }
      }
    },
    "states": {
      "focus": {
        "description": "Synligt tastaturfokus.",
        "styles": {},
        "parts": {
          "control": {
            "styles": {
              "outline": "{border.width.focus} solid {color.focus}",
              "outlineOffset": "{border.offset.focus}"
            }
          }
        }
      },
      "disabled":{"description":"Native deaktiveret valgliste.","styles":{},"parts":{"control":{"styles":{"backgroundColor":"{color.disabled.surface}","color":"{color.disabled.text}","cursor":"not-allowed"}}}}
    },
    "preview": {
      "tag": "div",
      "part": "root",
      "children": [
        {
          "tag": "label",
          "part": "label",
          "text": "Mulighed"
        },
        {
          "tag": "select",
          "part": "control",
          "children": [
            {
              "tag": "option",
              "part": "option",
              "text": "Mulighed A",
              "attrs": {
                "value": "a"
              }
            },
            {
              "tag": "option",
              "part": "option",
              "text": "Mulighed B",
              "attrs": {
                "value": "b"
              }
            }
          ]
        },
        {
          "tag": "p",
          "part": "hint",
          "text": "Vælg én mulighed."
        },
        {
          "tag": "p",
          "part": "error",
          "text": "Vælg en mulighed."
        }
      ]
    }
  },
  "toolbar": {
    "name": "Handlingsgruppe",
    "description": "En samlet gruppe af beslægtede handlinger.",
    "usage": "Brug native knapper. Biblioteket ejer orientering og afstande; produktet ejer gruppens formål og handlinger.",
    "composes": [
      "card",
      "button",
      "action-button",
      "divider"
    ],
    "parts": {
      "root": {
        "selector": ".ds-toolbar",
        "styles": {
          "backgroundColor": "{color.background.surface}",
          "border": "{border.width.default} solid {color.border.default}",
          "borderRadius": "{radius.card}",
          "boxShadow": "none",
          "boxSizing": "border-box",
          "padding": "{space.component.paddingCompact}",
          "gap": "{space.component.gap}",
          "display": "flex",
          "flexWrap": "wrap",
          "alignItems": "center",
          "minWidth": "0"
        }
      },
      "action": {
        "selector": ".ds-toolbar__action",
        "styles": {
          "fontFamily": "{typography.font.body}",
          "fontWeight": "{typography.weight.label}",
          "fontSize": "{typography.size.control}",
          "lineHeight": "{typography.lineHeight.control}",
          "color": "{color.text.primary}",
          "border": "{border.width.default} solid {color.border.field}",
          "backgroundColor": "{color.background.control}",
          "borderRadius": "{radius.control}",
          "padding": "{space.component.paddingCompact} {space.component.padding}",
          "cursor": "pointer",
          "minHeight": "max(44px, {size.control.height})",
          "display": "inline-flex",
          "alignItems": "center",
          "justifyContent": "center",
          "gap": "{space.component.gap}",
          "minWidth": "min-content",
          "boxSizing": "border-box",
          "transition": "background-color {duration.fast}",
          "maxWidth": "100%",
          "whiteSpace": "normal",
          "overflowWrap": "normal",
          "--ds-interaction-hover-surface": "{color.action.neutral.hover.surface}",
          "--ds-interaction-hover-text": "{color.action.neutral.hover.text}",
          "--ds-interaction-active-surface": "{color.action.neutral.active.surface}",
          "--ds-interaction-active-text": "{color.action.neutral.active.text}",
          "wordBreak": "normal"
        }
      }
    },
    "variants": {
      "desktop": {
  "description": "Kompakt desktopbetjening med 32 px klikflader. Brug standardvarianten ved touch eller behov for større mål.",
  "styles": {
    "padding": "{space.component.paddingCompact}",
    "gap": "{space.component.gap}"
  },
  "parts": {
    "action": { "styles": { ...DESKTOP_CONTROL_STYLES } }
  }
},
      "horizontal": {
        "description": "Vandret opbygning.",
        "styles": {
          "display": "flex",
          "flexDirection": "row"
        }
      },
      "vertical": {
        "description": "Lodret opbygning.",
        "styles": {
          "display": "flex",
          "flexDirection": "column",
          "alignItems": "stretch",
          "flexWrap": "nowrap"
        }
      }
    },
    "states": {
      "hover": {
        "description": "En handling under pegemarkøren.",
        "styles": {},
        "parts": {
          "action": {
            "styles": {
              "backgroundColor": "var(--ds-interaction-hover-surface)",
              "color": "var(--ds-interaction-hover-text)"
            }
          }
        }
      },
      "active": {
        "description": "En handling under aktivering.",
        "styles": {},
        "parts": {
          "action": {
            "styles": {
              "backgroundColor": "var(--ds-interaction-active-surface)",
              "color": "var(--ds-interaction-active-text)"
            }
          }
        }
      }
    },
    "preview": {
      "tag": "div",
      "part": "root",
      "children": [
        {
          "tag": "button",
          "part": "action",
          "text": "Tilføj",
          "attrs": {
            "type": "button"
          }
        },
        {
          "tag": "button",
          "part": "action",
          "text": "Redigér",
          "attrs": {
            "type": "button"
          }
        },
        {
          "tag": "button",
          "part": "action",
          "text": "Fjern",
          "attrs": {
            "type": "button"
          }
        }
      ],
      "variant": "horizontal"
    }
  },
  "action-button": {
    "name": "Handlingsknap",
    "description": "En native knap med label og valgfrit ikon og genvej.",
    "usage": "Label navngiver handlingen. iconName vælger et fælles Tabler-ikon; genvej supplerer label. Ikonknapper kræver et tilgængeligt navn; pressed bruger aria-pressed. loading viser fremdrift og deaktiverer kontrollen uden at miste dens navn.",
    "composes": [],
    "parts": {
      progress:{selector:'.ds-action-button__progress',styles:{display:'none',flexShrink:'0',width:'1em',height:'1em',border:'2px solid currentColor',borderRightColor:'transparent',borderRadius:'50%'}},
      "root": {
        "selector": ".ds-action-button",
        "styles": {
          "fontFamily": "{typography.font.body}",
          "fontWeight": "{typography.weight.label}",
          "fontSize": "{typography.size.control}",
          "color": "{color.text.secondary}",
          "backgroundColor": "{color.background.control}",
          "border": "{border.width.default} solid {color.border.field}",
          "borderRadius": "{radius.actionButton}",
          "cursor": "pointer",
          "display": "inline-flex",
          "alignItems": "center",
          "justifyContent": "center",
          "gap": "{space.component.gap}",
          "padding": "{space.component.paddingCompact}",
          "minHeight": "max(44px, {size.control.height})",
          "minWidth": "44px",
          "lineHeight": "{typography.lineHeight.control}",
          "boxSizing": "border-box",
          "transition": "background-color {duration.fast}, color {duration.fast}",
          "maxWidth": "100%",
          "whiteSpace": "normal",
          "overflowWrap": "normal",
          "--ds-interaction-hover-surface": "{color.action.neutral.hover.surface}",
          "--ds-interaction-hover-text": "{color.action.neutral.hover.text}",
          "--ds-interaction-active-surface": "{color.action.neutral.active.surface}",
          "--ds-interaction-active-text": "{color.action.neutral.active.text}",
          "wordBreak": "normal"
        }
      },
      "icon": {
        "selector": ".ds-action-button__icon",
        "styles": {
          "width": "{size.icon.action}",
          "height": "{size.icon.action}",
          "display": "inline-flex",
          "alignItems": "center",
          "justifyContent": "center",
          "flexShrink": "0",
          "fontSize": "{typography.size.title}",
          "lineHeight": 1
        }
      },
      "shortcut": {
        "selector": ".ds-action-button__shortcut",
        "styles": {
          "fontFamily": "{typography.font.body}",
          "fontSize": "{typography.size.shortcut}",
          "opacity": "{opacity.shortcut}",
          "border": "{border.width.default} solid {color.border.default}",
          "borderRadius": "{radius.note}",
          "padding": "0 {space.scale.1}",
          "lineHeight": "{typography.lineHeight.body}"
        }
      },
      "label": {
        "selector": ".ds-action-button__label",
        "styles": {
          "color": "inherit",
          "minWidth": "0",
          "maxWidth": "100%",
          "whiteSpace": "normal",
          "overflowWrap": "normal",
          "wordBreak": "normal"
        }
      },
      "asset": {
        "selector": ".ds-action-button__asset",
        "styles": {
          "display": "block",
          "width": "100%",
          "height": "100%",
          "objectFit": "contain"
        }
      }
    },
    "variants": {
      "tool": {"description":"Kompakt, neutral værktøjsknap med symbol over en 13 px label. Brug korte handlingsnavne i en værktøjslinje; pressed markerer det aktive værktøj.","styles":{"display":"inline-flex","flexDirection":"column","alignItems":"center","justifyContent":"center","minWidth":"56px","minHeight":"52px","width":"auto","gap":"{space.component.gap}","padding":"{space.scale.1} {space.component.paddingCompact}","fontSize":"{typography.size.toolLabel}","lineHeight":1.3,"color":"{color.text.primary}","backgroundColor":"{color.background.control}","borderColor":"transparent","borderRadius":"{radius.control}"},"parts":{"icon":{"styles":{"width":"{size.icon.compact}","height":"{size.icon.compact}","fontSize":"{size.icon.compact}"}},"label":{"styles":{"fontSize":"{typography.size.toolLabel}","lineHeight":1.3}}}},
      "vertical": {
        "description": "Lodret opbygning.",
        "styles": {
          "display": "flex",
          "flexDirection": "column",
          "alignItems": "center",
          "width": "auto",
          "gap": "{space.component.gap}",
          "padding": "{space.component.paddingCompact}",
          "minWidth": "min(100%, {size.actionButton.width})",
          "maxWidth": "100%"
        }
      },
      "horizontal": {
        "description": "Vandret opbygning.",
        "styles": {
          "display": "flex",
          "alignItems": "center",
          "gap": "{space.component.gap}",
          "padding": "{space.component.paddingCompact}",
          "borderRadius": "{radius.control}",
          "color": "{color.text.primary}"
        },
        "parts": {
          "icon": {
            "styles": {
              "width": "{size.icon.compact}",
              "height": "{size.icon.compact}"
            }
          },
          "shortcut": {
            "styles": {
              "fontWeight": "{typography.weight.strong}",
              "color": "{color.text.secondary}",
              "opacity": 1
            }
          }
        }
      },
      "icon-only": {
        "description": "Kun ikon med et tilgængeligt navn.",
        "styles": {
          "display": "inline-flex",
          "alignItems": "center",
          "justifyContent": "center",
          "padding": "{space.component.paddingCompact}"
        },
        "parts": {
          "label": {
            "styles": {
              "display": "none"
            }
          },
          "shortcut": {
            "styles": {
              "display": "none"
            }
          }
        }
      }
    },
    "states": {
      loading:{description:'Handlingen arbejder og kan ikke aktiveres igen.',styles:{cursor:'progress'}},
      "hover": {
        "description": "Kontrollen under pegemarkøren.",
        "styles": {
          "backgroundColor": "var(--ds-interaction-hover-surface)",
          "color": "var(--ds-interaction-hover-text)"
        },
        "parts": {
          "shortcut": {
            "styles": {
              "color": "inherit"
            }
          }
        }
      },
      "focus": {
        "description": "Synligt tastaturfokus.",
        "styles": {
          "outline": "{border.width.focus} solid {color.focus}",
          "outlineOffset": "{border.offset.focus}"
        }
      },
      "disabled": {
        "description": "Native deaktiveret kontrol.",
        "styles": {
          "opacity": "{opacity.disabled}",
          "cursor": "default"
        }
      },
      "pressed": {
        "description": "Aktiv toggle med aria-pressed=true.",
        "styles": {
          "backgroundColor": "{color.action.primary.rest.surface}",
          "color": "{color.action.primary.rest.text}",
          "borderColor": "{color.action.primary.rest.surface}",
          "--ds-interaction-hover-surface": "{color.action.primary.hover.surface}",
          "--ds-interaction-hover-text": "{color.action.primary.hover.text}",
          "--ds-interaction-active-surface": "{color.action.primary.active.surface}",
          "--ds-interaction-active-text": "{color.action.primary.active.text}"
        },
        "parts": {
          "shortcut": {
            "styles": {
              "color": "{color.action.primary.rest.text}"
            }
          }
        }
      },
      "active": {
        "description": "Kontrollen under aktivering.",
        "styles": {
          "backgroundColor": "var(--ds-interaction-active-surface)",
          "color": "var(--ds-interaction-active-text)"
        },
        "parts": {
          "shortcut": {
            "styles": {
              "color": "inherit"
            }
          }
        }
      }
    },
    "preview": {
      "tag": "button",
      "part": "root",
      "children": [
        {tag:'span',part:'progress',attrs:{'aria-hidden':'true'}},
        {
          "tag": "span",
          "part": "icon",
          "iconName": "plus",
          "attrs": {
            "aria-hidden": "true"
          }
        },
        {
          "tag": "span",
          "part": "label",
          "text": "Tilføj"
        },
        {
          "tag": "span",
          "part": "shortcut",
          "text": "Alt+N",
          "attrs": {
            "aria-hidden": "true"
          }
        }
      ],
      "attrs": {
        "type": "button"
      },
      "variant": "horizontal"
    }
  },
  "segmented-option": {
    "name": "Segmentvalg",
    "description": "En navngivet mulighed i et kompakt sæt beslægtede valg.",
    "usage": "Brug native button med aria-pressed til indholdsvalg. Navigation bruger links; en selvstændig indstilling bruger switch.",
    "composes": [],
    "parts": {
      icon:{selector:'.ds-segmented-option__icon',styles:{display:'inline-flex',alignItems:'center',flexShrink:'0'}},
      label:{selector:'.ds-segmented-option__label',styles:{minWidth:'0',overflowWrap:'anywhere'}},
      "root": {
        "selector": ".ds-segmented-option",
        "styles": {
          "flex": 1,
          "display":"inline-flex",
          "alignItems":"center",
          "justifyContent":"center",
          "gap":"{space.component.gap}",
          "border": "0",
          "backgroundColor": "transparent",
          "borderRadius": "{radius.segment}",
          "padding": "{space.component.paddingCompact} {space.component.padding}",
          "fontFamily": "{typography.font.body}",
          "fontSize": "{typography.size.label}",
          "fontWeight": "{typography.weight.label}",
          "color": "{color.text.secondary}",
          "cursor": "pointer",
          "minHeight": "max(44px, {size.control.height})",
          "minWidth": "min-content",
          "lineHeight": "{typography.lineHeight.control}",
          "transition": "background-color {duration.fast}, color {duration.fast}, box-shadow {duration.fast}",
          "maxWidth": "100%",
          "boxSizing": "border-box",
          "whiteSpace": "normal",
          "overflowWrap": "normal",
          "--ds-interaction-hover-surface": "{color.action.neutral.hover.surface}",
          "--ds-interaction-hover-text": "{color.action.neutral.hover.text}",
          "--ds-interaction-active-surface": "{color.action.neutral.active.surface}",
          "--ds-interaction-active-text": "{color.action.neutral.active.text}",
          "wordBreak": "normal"
        }
      }
    },
    "variants": {
      "desktop": {
  "description": "Kompakt desktopbetjening med 32 px klikflader. Brug standardvarianten ved touch eller behov for større mål.",
  "styles": {
    ...DESKTOP_CONTROL_STYLES
  }
},
      "compact": {
        "description": "Kompakt opbygning.",
        "styles": {
          "fontSize": "{typography.size.small}",
          "padding": "{space.component.paddingCompact}"
        }
      },
      "dense": {
        "description": "Tæt opbygning.",
        "styles": {
          "padding": "{space.component.paddingCompact}",
          "fontSize": "{typography.size.tiny}"
        }
      }
    },
    "states": {
      "hover": {
        "description": "Kontrollen under pegemarkøren.",
        "styles": {
          "backgroundColor": "var(--ds-interaction-hover-surface)",
          "color": "var(--ds-interaction-hover-text)"
        }
      },
      "focus": {
        "description": "Synligt tastaturfokus.",
        "styles": {
          "outline": "{border.width.focus} solid {color.focus}",
          "outlineOffset": "{border.offset.focus}"
        }
      },
      "disabled": {
        "description": "Native deaktiveret kontrol.",
        "styles": {
          "opacity": "{opacity.disabled}",
          "cursor": "default"
        }
      },
      "pressed": {
        "description": "Aktiv toggle med aria-pressed=true.",
        "styles": {
          "backgroundColor": "{color.background.control}",
          "color": "{color.text.primary}",
          "boxShadow": "{shadow.selected}",
          "--ds-interaction-hover-surface": "{color.action.selected.hover.surface}",
          "--ds-interaction-hover-text": "{color.action.selected.hover.text}",
          "--ds-interaction-active-surface": "{color.action.selected.active.surface}",
          "--ds-interaction-active-text": "{color.action.selected.active.text}"
        }
      },
      "active": {
        "description": "Kontrollen under aktivering.",
        "styles": {
          "backgroundColor": "var(--ds-interaction-active-surface)",
          "color": "var(--ds-interaction-active-text)"
        }
      }
    },
    "preview": {
      "tag": "button",
      "part": "root",
      "text": "Mulighed A",
      "attrs": {
        "type": "button",
        "aria-pressed": "false"
      }
    }
  },
  "segmented-control": {
    "name": "Segmentgruppe",
    "description": "En kompakt gruppe af beslægtede indholdsvalg.",
    "usage": "Brug native segmentknapper og et tilgængeligt gruppenavn. Produktet håndterer valg; pressed beskriver hver knaps tilstand.",
    "composes": [
      "segmented-option"
    ],
    "parts": {
      "root": {
        "selector": ".ds-segmented-control",
        "styles": {
          "display": "flex",
          "backgroundColor": "{color.background.subtle}",
          "borderRadius": "{radius.control}",
          "padding": "{space.scale.1}",
          "gap": "{space.scale.1}",
          "minWidth": "0",
          "maxWidth": "100%",
          "boxSizing": "border-box",
          "flexWrap": "wrap"
        }
      },
      "option": {
        "selector": ".ds-segmented-option",
        "styles": {
          "minHeight": "max(44px, {size.control.height})",
          "flex": "1 1 0",
          "minWidth": "min-content",
          "maxWidth": "100%",
          "whiteSpace": "normal",
          "overflowWrap": "normal",
          "wordBreak": "normal"
        }
      },
      "preview-choice": {
        "selector": ".ds-segmented-control__preview-choice",
        "styles": {
          "flex": "1 1 0",
          "border": "0",
          "backgroundColor": "{color.background.control}",
          "borderRadius": "{radius.segment}",
          "padding": "{space.component.paddingCompact} {space.component.padding}",
          "fontFamily": "{typography.font.body}",
          "fontSize": "{typography.size.label}",
          "fontWeight": "{typography.weight.label}",
          "color": "{color.text.primary}",
          "cursor": "pointer",
          "boxShadow": "{shadow.selected}",
          "minHeight": "max(44px, {size.control.height})",
          "lineHeight": "{typography.lineHeight.control}",
          "minWidth": "min-content",
          "maxWidth": "100%",
          "boxSizing": "border-box",
          "whiteSpace": "normal",
          "overflowWrap": "normal",
          "--ds-interaction-hover-surface": "{color.action.selected.hover.surface}",
          "--ds-interaction-hover-text": "{color.action.selected.hover.text}",
          "--ds-interaction-active-surface": "{color.action.selected.active.surface}",
          "--ds-interaction-active-text": "{color.action.selected.active.text}",
          "wordBreak": "normal"
        }
      }
    },
    "variants": {
      "default": {
        "description": "Almindelig opbygning.",
        "styles": {}
      },
      "wrap": {
        "description": "Valg fordeles efter tekstens bredde og bryder til næste række ved pladsmangel.",
        "styles": {
          "flexWrap": "wrap",
          "gap": "{space.component.gap}"
        },
        "parts": {
          "option": {
            "styles": {
              "flex": "1 1 auto"
            }
          },
          "preview-choice": {
            "styles": {
              "flex": "1 1 auto"
            }
          }
        }
      }
    },
    "states": {
      "hover": {
        "description": "Valget under pegemarkøren.",
        "styles": {},
        "parts": {
          "preview-choice": {
            "styles": {
              "backgroundColor": "var(--ds-interaction-hover-surface)",
              "color": "var(--ds-interaction-hover-text)"
            }
          }
        }
      },
      "active": {
        "description": "Valget under aktivering.",
        "styles": {},
        "parts": {
          "preview-choice": {
            "styles": {
              "backgroundColor": "var(--ds-interaction-active-surface)",
              "color": "var(--ds-interaction-active-text)"
            }
          }
        }
      }
    },
    "preview": {
      "tag": "div",
      "part": "root",
      "children": [
        {
          "tag": "button",
          "part": "preview-choice",
          "text": "Mulighed A",
          "attrs": {
            "type": "button",
            "aria-pressed": "true"
          }
        },
        {
          "tag": "button",
          "part": "option",
          "text": "Mulighed B",
          "attrs": {
            "type": "button",
            "aria-pressed": "false"
          }
        },
        {
          "tag": "button",
          "part": "option",
          "text": "Mulighed C",
          "attrs": {
            "type": "button",
            "aria-pressed": "false"
          }
        }
      ],
      "attrs": {
        "role": "group",
        "aria-label": "Muligheder"
      }
    }
  },
  "range-field": {
    "name": "Skyderfelt",
    "description": "En native skyder med fælles label, hjælp og valgfri præcis talindtastning.",
    "usage": "with-input parrer skyder og talfelt via mountRangeField. Angiv value, min, max og step. Bredden følger grænser og trin; ugyldige kladder bevares. Produktet ejer validering og lagring.",
    "composes": [],
    "parts": {
      "root": {
        "selector": ".ds-range-field",
        "styles": {
          "minWidth": "0",
          "maxWidth": "100%",
          "fontFamily": "{typography.font.body}",
          "display": "flex",
          "flexDirection": "column",
          "gap": "{space.component.gap}",
          "color": "{color.text.primary}"
        }
      },
      "label": {
        "selector": ".ds-range-field__label",
        "styles": {
          "overflowWrap": "anywhere",
          "display": "flex",
          "justifyContent": "space-between",
          "fontWeight": "{typography.weight.label}",
          "fontSize": "{typography.size.label}",
          "alignItems": "center",
          "gap": "{space.component.gap}",
          "lineHeight": "{typography.lineHeight.label}"
        }
      },
      "row": {"selector":".ds-range-field__row","styles":{"display":"flex","alignItems":"center","gap":"{space.component.gap}","minWidth":"0"}},
      "number": {"selector":".ds-range-field__number","styles":{...FORM_CONTROL,"width":"max(3.5rem, calc((var(--ds-range-number-chars, 3) + .75) * 1ch + 2 * {space.component.paddingCompact} + 2 * {border.width.default}))","maxWidth":"100%","flexShrink":"0","minHeight":"32px","padding":"calc({space.component.paddingCompact} / 3) {space.component.paddingCompact}","textAlign":"center","fontVariantNumeric":"tabular-nums","appearance":"textfield","fontSize":"{typography.size.small}","lineHeight":"{typography.lineHeight.control}"}},
      "value": {
        "selector": ".ds-range-field__value",
        "styles": {
          "flexShrink": "0",
          "fontWeight": "{typography.weight.strong}",
          "backgroundColor": "{color.background.subtle}",
          "borderRadius": "{radius.note}",
          "padding": "0 {space.component.paddingCompact}",
          "fontSize": "{typography.size.small}"
        }
      },
      "control": {
        "selector": ".ds-range-field__control",
        "styles": {
          "minWidth": "0",
          "width": "100%",
          "accentColor": "{color.action.primary.rest.surface}",
          "margin": "0",
          "minHeight": "max(44px, {size.control.height})",
          "cursor": "pointer"
        }
      },
      "hint": {
        "selector": ".ds-range-field__hint",
        "styles": {
          "overflowWrap": "anywhere",
          "fontSize": "{typography.size.small}",
          "color": "{color.text.secondary}",
          "margin": "0",
          "lineHeight": "{typography.lineHeight.body}"
        }
      },
      "error":{"selector":".ds-range-field__error","styles":{...FORM_HINT,color:'{color.status.dangerText}',display:'none'}}
    },
    "variants": {"invalid":CHOICE_INVALID,"with-input":{"description":"Skyder og præcist talfelt på én række med fælles label og feedback.","styles":{},"parts":{"value":{"styles":{"display":"none"}}}}},
    "states": {
      "focus": {
        "description": "Synligt tastaturfokus.",
        "styles": {},
        "parts": {
          "control": {
            "styles": {
              "outline": "{border.width.focus} solid {color.focus}",
              "outlineOffset": "{border.offset.focus}"
            }
          },
          "number":{"styles":{"outline":"{border.width.focus} solid {color.focus}","outlineOffset":"{border.offset.focus}"}}
        }
      },
      "disabled": {
        "description": "Native deaktiveret kontrol.",
        "styles": {},
        "parts":{"control":{"styles":{"cursor":"not-allowed"}},"number":{"styles":{"backgroundColor":"{color.disabled.surface}","color":"{color.disabled.text}","cursor":"not-allowed"}},"label":{"styles":{"color":"{color.disabled.text}"}}}
      },
      "invalid":{"description":"Fælles fejl med bevaret skyder-/talfeltanatomi.","styles":{},"parts":{"error":{"styles":{"display":"block"}},"number":{"styles":{"borderColor":"{color.status.danger}"}}}},
      "readOnly":{"description":"Talfeltet kan fokuseres og kopieres; skyderen ændrer ikke værdien.","styles":{},"parts":{"number":{"styles":{"backgroundColor":"{color.background.subtle}"}}}}
    },
    "preview": {
      "tag": "div",
      "part": "root",
      "children": [
        {
          "tag": "label",
          "part": "label",
          "text": "Niveau",
          "children": [
            {
              "tag": "output",
              "part": "value",
              "text": "50",
              "attrs":{"aria-hidden":"true"}
            }
          ]
        },
        {"tag":"div","part":"row","children":[
          {"tag":"input","part":"control","attrs":{"type":"range","value":"50","min":"0","max":"100","step":"1"}},
          {"tag":"input","part":"number","attrs":{"type":"number","value":"50","min":"0","max":"100","step":"1","hidden":true}}
        ]},
        {
          "tag": "p",
          "part": "hint",
          "text": "Justér værdien med skyderen."
        },
        {"tag":"p","part":"error","text":"Kontrollér værdien."}
      ]
    }
  },
  "instruction-note": {
    "name": "Hjælpetekst",
    "description": "En kort vejledning tæt på det relevante indhold.",
    "usage": "Skriv kort og konkret. Brug alert til særskilt status eller fejlhåndtering.",
    "composes": [],
    "parts": {
      "root": {
        "selector": ".ds-instruction-note",
        "styles": {
          "fontSize": "{typography.size.small}",
          "color": "{color.text.secondary}",
          "backgroundColor": "{color.background.subtle}",
          "borderRadius": "{radius.note}",
          "padding": "{space.component.padding}",
          "lineHeight": "{typography.lineHeight.note}",
          "boxSizing": "border-box",
          "margin": "0",
          "fontFamily": "{typography.font.body}"
        }
      }
    },
    "variants": {
      "default": {
        "description": "Almindelig opbygning.",
        "styles": {}
      },
      "warning": {
        "description": "Et forhold kræver opmærksomhed.",
        "styles": {
          "backgroundColor": "{color.status.dangerSurface}",
          "color": "{color.status.dangerText}"
        }
      }
    },
    "states": {},
    "preview": {
      "tag": "p",
      "part": "root",
      "text": "Vælg en mulighed for at fortsætte."
    }
  },
  "metric-row": {
    "name": "Nøgletal",
    "description": "En navngivet værdi med tydelig sammenhæng mellem label og resultat.",
    "usage": "Brug native dl, dt og dd. Produktet vælger enheder og lokal talformatering.",
    "composes": [],
    "parts": {
      "root": {
        "selector": ".ds-metric-row",
        "styles": {
          "display": "flex",
          "justifyContent": "space-between",
          "padding": "{space.component.paddingCompact}",
          "borderBottom": "{border.width.default} solid {color.border.default}",
          "margin": "0",
          "gap": "{space.component.gap}",
          "fontFamily": "{typography.font.body}",
          "color": "{color.text.primary}",
          "alignItems": "baseline",
          "lineHeight": "{typography.lineHeight.body}",
          "flexWrap": "wrap"
        }
      },
      "label": {
        "selector": ".ds-metric-row__label",
        "styles": {
          "margin": "0",
          "color": "{color.text.secondary}",
          "fontSize": "{typography.size.control}",
          "minWidth":"0",
          "overflowWrap":"anywhere"
        }
      },
      "value": {
        "selector": ".ds-metric-row__value",
        "styles": {
          "fontWeight": "{typography.weight.heading}",
          "margin": "0",
          "fontSize": "{typography.size.title}",
          "whiteSpace": "normal",
          "minWidth":"0",
          "maxWidth":"100%",
          "overflowWrap":"anywhere"
        }
      }
    },
    "variants": {
      "compact": {
        "description": "Kompakt opbygning.",
        "styles": {
          "gap": "{space.component.gap}",
          "border": "{border.width.default} solid {color.border.default}",
          "borderRadius": "{radius.note}",
          "backgroundColor": "{color.background.detail}",
          "padding": "{space.component.paddingCompact}",
          "fontSize": "{typography.size.control}"
        },
        "parts": {
          "value": {
            "styles": {
              "fontWeight": "{typography.weight.label}",
              "fontSize": "{typography.size.control}"
            }
          }
        }
      }
    },
    "states": {},
    "preview": {
      "tag": "dl",
      "part": "root",
      "children": [
        {
          "tag": "dt",
          "part": "label",
          "text": "Antal"
        },
        {
          "tag": "dd",
          "part": "value",
          "text": "24"
        }
      ]
    }
  },
  "inspector": {
    "name": "Detaljepanel",
    "description": "Titel, forklaring og afsnit om en valgt post.",
    "usage": "Sammensæt felter, værdier og handlinger. Produktet ejer valg og redigering; biblioteket ejer panelopbygning og afstande.",
    "composes": [
      "card",
      "heading",
      "field",
      "range-field",
      "segmented-control",
      "metric-row",
      "instruction-note"
    ],
    "parts": {
      "root": {
        "selector": ".ds-inspector",
        "styles": {
          "backgroundColor": "{color.background.surface}",
          "border": "{border.width.default} solid {color.border.default}",
          "borderRadius": "{radius.card}",
          "boxShadow": "none",
          "boxSizing": "border-box",
          "padding": "{space.component.paddingLarge}",
          "display": "flex",
          "flexDirection": "column",
          "gap": "{space.component.gapLarge}",
          "color": "{color.text.primary}",
          "fontFamily": "{typography.font.body}",
          "lineHeight": "{typography.lineHeight.body}"
        }
      },
      "header": {
        "selector": ".ds-inspector__header",
        "styles": {
          "fontFamily": "{typography.font.heading}",
          "fontSize": "{typography.size.panel}",
          "fontWeight": "{typography.weight.heading}",
          "lineHeight": "{typography.lineHeight.heading}",
          "margin": "0"
        }
      },
      "description": {
        "selector": ".ds-inspector__description",
        "styles": {
          "color": "{color.text.secondary}",
          "fontSize": "{typography.size.control}",
          "margin": "0",
          "lineHeight": "{typography.lineHeight.label}"
        }
      },
      "section": {
        "selector": ".ds-inspector__section",
        "styles": {
          "fontSize": "{typography.size.tiny}",
          "fontWeight": "{typography.weight.strong}",
          "textTransform": "uppercase",
          "letterSpacing": "{typography.tracking.section}",
          "color": "{color.text.secondary}",
          "margin": "0"
        }
      }
    },
    "variants": {},
    "states": {},
    "preview": {
      "tag": "section",
      "part": "root",
      "children": [
        {
          "tag": "h3",
          "part": "header",
          "text": "Detaljer"
        },
        {
          "tag": "p",
          "part": "description",
          "text": "Oplysninger om den valgte post."
        },
        {
          "tag": "h3",
          "part": "section",
          "text": "Egenskaber"
        },
        {
          "tag": "p",
          "text": "Navn, status og øvrige oplysninger."
        }
      ]
    }
  },
  "tooltip": {
    "name": "Værktøjstip",
    "description": "En kort, supplerende forklaring til en kontrol.",
    "usage": "Brug mountTooltip til hover, fokus, Escape, vedvarende hover over hjælpen og placering ved viewportkanter. Eksisterende aria-describedby bevares. Tooltip må ikke indeholde interaktive kontroller og erstatter ikke kontrollens navn. Brug popover til interaktiv hjælp.",
    "composes": [],
    "parts": {
      "root": {
        "selector": ".ds-tooltip",
        "styles": {
          "backgroundColor": "{color.background.inverse}",
          "color": "{color.text.inverse}",
          "borderRadius": "{radius.note}",
          "padding": "{space.component.paddingCompact} {space.component.padding}",
          "fontSize": "{typography.size.small}",
          "fontWeight": "{typography.weight.body}",
          "whiteSpace": "normal",
          "fontFamily": "{typography.font.body}",
          "lineHeight": "{typography.lineHeight.body}",
          "maxWidth": "min(28ch, var(--ds-overlay-available-width, calc(100vw - 1rem)))",
          "maxHeight": "var(--ds-overlay-available-height, calc(100dvh - 1rem))",
          "overflowWrap": "anywhere",
          "boxSizing": "border-box",
          "border": "{border.width.default} solid transparent",
          "boxShadow": "{shadow.floating}"
        }
      }
    },
    "variants": {
      "default": {
        "description": "Almindelig opbygning.",
        "styles": {}
      },
      "warning": {
        "description": "Et forhold kræver opmærksomhed.",
        "styles": {
          "backgroundColor": "{color.status.danger}",
          "color": "{color.status.dangerContrast}"
        }
      }
    },
    "states": {},
    "preview": {
      "tag": "div",
      "part": "root",
      "text": "Supplerende information"
    }
  },
  "caption": {
    "name": "Billedtekst",
    "description": "En kort beskrivelse med valgfri etiket til illustration, video eller indholdsvisning.",
    "usage": "Produktet leverer beskrivelse og etiket. Temaet vælger typografi og farver; opbygningen virker på tværs af indholdstyper.",
    "composes": [],
    "parts": {
      "root": {
        "selector": ".ds-caption",
        "styles": {
          "textAlign": "start",
          "display": "flex",
          "flexDirection": "column",
          "alignItems": "start",
          "gap": "{space.component.gap}",
          "padding": "{space.component.padding}",
          "backgroundColor": "{color.caption.surface}",
          "color": "{color.caption.text}",
          "borderRadius": "{radius.card}",
          "fontFamily": "{typography.font.body}",
          "lineHeight": "{typography.lineHeight.body}"
        }
      },
      "label": {
        "selector": ".ds-caption__label",
        "styles": {
          "display": "inline-flex",
          "alignItems": "center",
          "justifyContent": "center",
          "boxSizing": "border-box",
          "maxWidth": "100%",
          "minWidth": "0",
          "flexShrink": "0",
          "fontFamily": "{typography.font.body}",
          "fontStyle": "normal",
          "fontSize": "{typography.size.small}",
          "fontWeight": "{typography.weight.strong}",
          "letterSpacing": "{typography.tracking.captionLabel}",
          "textTransform": "uppercase",
          "color": "{color.caption.labelText}",
          "backgroundColor": "{color.caption.labelSurface}",
          "borderRadius": "{radius.pill}",
          "padding": "max(calc({space.component.paddingCompact} / 2), 0.25em) max({space.component.paddingCompact}, 0.5em)",
          "lineHeight": "normal",
          "whiteSpace": "normal",
          "overflowWrap": "anywhere",
          "textAlign": "center"
        }
      },
      "text": {
        "selector": ".ds-caption__text",
        "styles": {
          "fontFamily": "{typography.font.body}",
          "fontStyle": "normal",
          "fontWeight": "{typography.weight.body}",
          "fontSize": "{typography.size.captionText}",
          "lineHeight": "{typography.lineHeight.captionText}",
          "color": "{color.caption.text}",
          "margin": "0"
        }
      }
    },
    "variants": {},
    "states": {},
    "preview": {
      "tag": "div",
      "part": "root",
      "children": [
        {
          "tag": "span",
          "part": "label",
          "text": "Information"
        },
        {
          "tag": "p",
          "part": "text",
          "text": "En kort beskrivelse af indholdet."
        }
      ]
    }
  },
  "brand-mark": {
    "name": "Brandmærke",
    "description": "En godkendt originalressource for produktets identitet.",
    "usage": "Brug originalen fra brand.logos og brand.assets. Renderer bevarer proportioner. Uden original vises en neutral pladsholder; genskab ikke et eksisterende logo.",
    "composes": [],
    "parts": {
      "root": {
        "selector": ".ds-brand-mark",
        "styles": {
          "display": "flex",
          "alignItems": "center",
          "gap": "{space.component.gap}",
          "fontFamily": "{typography.font.body}",
          "fontSize": "{typography.size.title}",
          "fontWeight": "{typography.weight.strong}",
          "letterSpacing": "{typography.tracking.brand}",
          "color": "{color.text.primary}",
          "lineHeight": "{typography.lineHeight.heading}"
        }
      },
      "symbol": {
        "selector": ".ds-brand-mark__symbol",
        "styles": {
          "width": "{size.icon.brand}",
          "height": "{size.icon.brand}"
        }
      },
      "name": {
        "selector": ".ds-brand-mark__name",
        "styles": {}
      },
      "asset": {
        "selector": ".ds-brand-mark__asset",
        "styles": {
          "display": "block",
          "maxWidth": "{size.brand.logo}",
          "width": "100%",
          "height": "auto",
          "objectFit": "contain"
        }
      }
    },
    "variants": {},
    "states": {},
    "preview": {
      "tag": "div",
      "part": "root",
      "children": [
        {
          "tag": "span",
          "part": "name",
          "text": "Dit brand"
        }
      ]
    }
  },
  "scroll-area": {
    "name": "Scrollområde",
    "description": "Et afgrænset scrollområde med plads til tastaturfokus og scrollbarer inden for afrundingen.",
    "usage": "Produktet begrænser den ydre højde. Bevar viewport og content. contained ejer én samlet ramme og omslutter et card, inspector eller toolbar, hvis native root får surface-part og beholder padding og direkte anatomi. body bruges til scrollbart indhold inde i et indrammet kort med fast header. Giv viewport et tilgængeligt navn og tabindex=0 til selvstændig tastaturrulning.",
    "composes": [],
    "parts": {
      "root": {
        "selector": ".ds-scroll-area",
        "styles": {
          "display": "flex",
          "flexDirection": "column",
          "minWidth": "0",
          "minHeight": "0",
          "maxWidth": "100%",
          "boxSizing": "border-box",
          "overflow": "hidden",
          "borderRadius": "{radius.card}"
        }
      },
      "viewport": {
        "selector": ".ds-scroll-area__viewport",
        "styles": {
          "flex": "1 1 auto",
          "minWidth": "0",
          "minHeight": "0",
          "maxWidth": "100%",
          "boxSizing": "border-box",
          "margin": "{space.scale.1}",
          "overflow": "auto",
          "overscrollBehavior": "contain",
          "scrollbarGutter": "auto",
          "borderRadius": "max(0px, calc({radius.card} - {space.scale.1}))"
        }
      },
      "content": {
        "selector": ".ds-scroll-area__content",
        "styles": {
          "minWidth": "0",
          "boxSizing": "border-box",
          "padding": "max({space.component.paddingCompact}, calc(max(3px, {border.width.focus}) + max(2px, {border.offset.focus})))"
        }
      },
      "surface": {
        "selector": ".ds-scroll-area__surface",
        "styles": {
          "border": "0",
          "borderRadius": "0",
          "backgroundColor": "transparent",
          "boxShadow": "none"
        }
      }
    },
    "variants": {
      "default": {
        "description": "Fokusplads omkring vilkårligt indhold.",
        "styles": {}
      },
      "contained": {
        "description": "Omslutter en fælles komponent med egen indvendig afstand uden dobbelt padding.",
        "styles": {
          "backgroundColor": "{color.background.surface}",
          "border": "{border.width.default} solid {color.border.default}"
        },
        "parts": {
          "content": {
            "styles": {
              "padding": "max(0px, calc(max(3px, {border.width.focus}) + max(2px, {border.offset.focus}) - min({space.component.paddingCompact}, {space.component.padding}, {space.component.paddingLarge})))"
            }
          }
        }
      },
      "body": {
        "description": "Scrollbart indhold under en fast header i en allerede indrammet komponent.",
        "styles": {
          "border": "0",
          "borderRadius": "0",
          "backgroundColor": "transparent"
        },
        "parts": {
          "viewport": {
            "styles": {
              "margin": "0",
              "borderRadius": "0"
            }
          }
        }
      }
    },
    "states": {
      "focus": {
        "description": "Viewport kan modtage tastaturfokus og scrolles selvstændigt.",
        "styles": {},
        "parts": {
          "viewport": {
            "styles": {
              "outline": "{border.width.focus} solid {color.focus}",
              "outlineOffset": "calc(-1 * {border.width.focus})"
            }
          }
        }
      }
    },
    "preview": {
      "tag": "div",
      "part": "root",
      "children": [
        {
          "tag": "div",
          "part": "viewport",
          "attrs": {
            "role": "region",
            "aria-label": "Flere oplysninger",
            "tabindex": "0"
          },
          "children": [
            {
              "tag": "div",
              "part": "content",
              "children": [
                {
                  "tag": "section",
                  "part": "surface",
                  "children": [
                    {
                      "tag": "p",
                      "text": "Relateret indhold kan scrolles i et afgrænset område."
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  },
  "tree": {
    "name": "Hierarkisk liste",
    "description": "En indlejret liste med foldning, valg og navngivne handlinger for elementer, filer eller lag.",
    "usage": "Brug mountTree til kontrollerede data og callbacks. Standard bruger 32 px rækker og tæt indrykning; roomy giver 44 px klikflader. Vis kun nødvendige metadata og få direkte rækkehandlinger. Andre operationer hører til i objektets menu eller inspektør. Piletaster flytter fokus og åbner eller lukker grene; Space vælger, Shift udvider valg, og Ctrl eller Meta skifter enkelte valg. Produktet ejer tilstand, kontekstmenu og flytning, og skal supplere træk med en klik- og tastaturbetjent Flyt-handling. Flere egentlige datakolonner kræver en særskilt treegrid.",
    "composes": ["button", "badge"],
    "parts": {
      "root": {"selector": ".ds-tree", "styles": {"display":"flex","flexDirection":"column","gap":"0","minWidth":"0","padding":"{space.component.paddingCompact}","margin":"0","listStyleType":"none","fontFamily":"{typography.font.body}","fontSize":"{typography.size.body}","lineHeight":"{typography.lineHeight.body}","color":"{color.text.primary}","backgroundColor":"{color.background.surface}","boxSizing":"border-box"}},
      "item": {"selector":".ds-tree__item","styles":{"display":"block","minWidth":"0","margin":"0","padding":"0","listStyleType":"none","borderRadius":"{radius.control}","--ds-interaction-hover-surface":"{color.action.neutral.hover.surface}","--ds-interaction-hover-text":"{color.action.neutral.hover.text}","--ds-interaction-active-surface":"{color.action.neutral.active.surface}","--ds-interaction-active-text":"{color.action.neutral.active.text}"}},
      "row": {"selector":".ds-tree__row","styles":{"display":"flex","alignItems":"center","gap":"{space.component.gap}","minHeight":"32px","minWidth":"0","borderRadius":"{radius.control}","border":"{border.width.default} solid transparent","padding":"0 {space.component.paddingCompact}","boxSizing":"border-box","color":"inherit","backgroundColor":"transparent"}},
      "group": {"selector":".ds-tree__group","styles":{"display":"flex","flexDirection":"column","gap":"0","minWidth":"0","padding":"0 0 0 {space.component.padding}","margin":"0","listStyleType":"none"}},
      "toggle": {"selector":".ds-tree__toggle","styles":{"display":"inline-flex","alignItems":"center","justifyContent":"center","minWidth":"24px","minHeight":"calc(32px - 2 * {border.width.default})","boxSizing":"border-box","flexShrink":"0","padding":"0","border":"0","borderRadius":"{radius.control}","fontFamily":"inherit","fontSize":"inherit","fontWeight":"inherit","lineHeight":"inherit","color":"inherit","backgroundColor":"transparent","cursor":"pointer","width":"24px"}},
      "spacer": {"selector":".ds-tree__spacer","styles":{"display":"block","width":"24px","minWidth":"24px","flexShrink":"0"}},
      "label": {"selector":".ds-tree__label","styles":{"display":"flex","alignItems":"center","gap":"{space.component.gap}","flex":"1 1 auto","minWidth":"0","minHeight":"calc(32px - 2 * {border.width.default})","boxSizing":"border-box","padding":"0","border":"0","borderRadius":"{radius.control}","fontFamily":"inherit","fontSize":"inherit","fontWeight":"inherit","lineHeight":"inherit","color":"inherit","backgroundColor":"transparent","textAlign":"left","whiteSpace":"normal","wordBreak":"normal","overflowWrap":"anywhere","cursor":"pointer"}},
      "icon": {"selector":".ds-tree__icon","styles":{"display":"inline-flex","alignItems":"center","justifyContent":"center","flexShrink":"0","fontSize":"{typography.size.control}"}},
      "name": {"selector":".ds-tree__name","styles":{"minWidth":"0","overflowWrap":"anywhere","overflow":"hidden","textOverflow":"ellipsis","whiteSpace":"nowrap"}},
      "meta": {"selector":".ds-tree__meta","styles":{"minWidth":"0","fontSize":"{typography.size.label}","color":"inherit","overflowWrap":"normal","whiteSpace":"nowrap","flexShrink":"0"}},
      "badge": {"selector":".ds-tree__badge","styles":{"display":"inline-flex","alignItems":"center","justifyContent":"center","padding":"calc({space.component.paddingCompact} / 2) {space.component.paddingCompact}","borderRadius":"{radius.pill}","fontSize":"{typography.size.label}","lineHeight":"{typography.lineHeight.control}","color":"{color.text.secondary}","backgroundColor":"{color.background.subtle}"}},
      "actions": {"selector":".ds-tree__actions","styles":{"display":"flex","alignItems":"center","flexWrap":"wrap","gap":"{space.component.gap}","flexShrink":"0"}},
      "action": {"selector":".ds-tree__action","styles":{"display":"inline-flex","alignItems":"center","justifyContent":"center","minWidth":"28px","minHeight":"28px","boxSizing":"border-box","padding":"0","border":"{border.width.default} solid transparent","borderRadius":"{radius.control}","fontFamily":"inherit","fontSize":"inherit","fontWeight":"inherit","lineHeight":"{typography.lineHeight.control}","color":"inherit","backgroundColor":"transparent","cursor":"pointer"}}
    },
    "variants": {
      "desktop": {
  "description": "Eksplicit alias til standardens kompakte 32 px betjening. Brug roomy ved touch eller behov for større mål.",
  "styles": {
    "gap": "0",
    "padding": "{space.component.paddingCompact}"
  },
  "parts": {
    "row": {
      "styles": {
        "minHeight": "32px",
        "gap": "{space.component.gap}"
      }
    },
    "group": {
      "styles": {
        "gap": "0",
        "padding": "0 0 0 {space.component.padding}"
      }
    },
    "toggle": {
      "styles": {
        "minWidth": "24px",
        "width": "24px",
        "minHeight": "calc(32px - 2 * {border.width.default})",
        "padding": "0"
      }
    },
    "spacer": {
      "styles": {
        "width": "24px",
        "minWidth": "24px"
      }
    },
    "label": {
      "styles": {
        "minHeight": "calc(32px - 2 * {border.width.default})",
        "padding": "0"
      }
    },
    "action": {
      "styles": {
        "minWidth": "28px",
        "minHeight": "28px",
        "padding": "0"
      }
    }
  }
},
      "default":{"description":"Kompakt hierarki med 32 px rækker, tæt indrykning og tydelige navne.","styles":{}},
      "roomy":{"description":"Større 44 px klikflader, mere luft og ombrudte navne til touch eller behov for større mål.","styles":{"gap":"{space.component.gap}"},"parts":{"row":{"styles":{"display":"flex","alignItems":"center","gap":"{space.component.gap}","minHeight":"max(44px, {size.control.height})","minWidth":"0","borderRadius":"{radius.control}","border":"{border.width.default} solid transparent","padding":"0 {space.component.paddingCompact}","boxSizing":"border-box","color":"inherit","backgroundColor":"transparent"}},"group":{"styles":{"display":"flex","flexDirection":"column","gap":"{space.component.gap}","minWidth":"0","padding":"{space.component.gap} 0 0 {space.component.paddingLarge}","margin":"0","listStyleType":"none"}},"toggle":{"styles":{"display":"inline-flex","alignItems":"center","justifyContent":"center","minWidth":"44px","minHeight":"max(44px, {size.control.height})","flexShrink":"0","padding":"{space.component.paddingCompact}","border":"0","borderRadius":"{radius.control}","fontFamily":"inherit","fontSize":"inherit","fontWeight":"inherit","lineHeight":"inherit","color":"inherit","backgroundColor":"transparent","cursor":"pointer","width":"44px"}},"spacer":{"styles":{"display":"block","width":"44px","minWidth":"44px","flexShrink":"0"}},"label":{"styles":{"display":"flex","alignItems":"center","gap":"{space.component.gap}","flex":"1 1 auto","minWidth":"0","minHeight":"max(44px, {size.control.height})","padding":"{space.component.paddingCompact}","border":"0","borderRadius":"{radius.control}","fontFamily":"inherit","fontSize":"inherit","fontWeight":"inherit","lineHeight":"inherit","color":"inherit","backgroundColor":"transparent","textAlign":"left","whiteSpace":"normal","wordBreak":"normal","overflowWrap":"anywhere","cursor":"pointer"}},"action":{"styles":{"display":"inline-flex","alignItems":"center","justifyContent":"center","minWidth":"44px","minHeight":"max(44px, {size.control.height})","padding":"{space.component.paddingCompact}","border":"{border.width.default} solid transparent","borderRadius":"{radius.control}","fontFamily":"inherit","fontSize":"inherit","fontWeight":"inherit","lineHeight":"inherit","color":"inherit","backgroundColor":"transparent","cursor":"pointer"}},"name":{"styles":{"overflow":"visible","textOverflow":"clip","whiteSpace":"normal"}},"meta":{"styles":{"whiteSpace":"normal","overflowWrap":"anywhere","flexShrink":"1"}}}},
      "compact":{"description":"Mindre indrykning mellem niveauer med samme tilgængelige klikflader.","styles":{"gap":"{space.component.gap}"},"parts":{"row":{"styles":{"gap":"{space.component.gap}"}},"group":{"styles":{"paddingInlineStart":"{space.component.padding}"}}}}
    },
    "states": {
      "selected":{"description":"Den enkelte række er valgt uafhængigt af tastaturfokus.","styles":{"--ds-interaction-hover-surface":"{color.action.selected.hover.surface}","--ds-interaction-hover-text":"{color.action.selected.hover.text}","--ds-interaction-active-surface":"{color.action.selected.active.surface}","--ds-interaction-active-text":"{color.action.selected.active.text}"},"parts":{"row":{"styles":{"color":"{color.action.primary.rest.text}","backgroundColor":"{color.action.primary.rest.surface}"}}}},
      "focus":{"description":"Den fokuserede rækkes egen klikflade markeres, også ved fokus på en rækkehandling.","styles":{},"parts":{"row":{"styles":{"outline":"max(3px, {border.width.focus}) solid {color.focus}","outlineOffset":"max(2px, {border.offset.focus})"}}}},
      "expanded":{"description":"Grenens børn er synlige. Produktet ejer den kontrollerede foldetilstand.","styles":{}},
      "disabled":{"description":"Rækken kan ikke vælges eller trækkes. Foldning og native rækkehandlinger beholder deres egen tilgængelighed, så eksempelvis en låst post kan låses op.","styles":{},"parts":{"row":{"styles":{"color":"{color.text.muted}","backgroundColor":"{color.background.subtle}","cursor":"default"}}}},
      "drop-target":{"description":"Rækken er et muligt mål for indsættelse før, efter eller inde i grenen.","styles":{},"parts":{"row":{"styles":{"outline":"max(3px, {border.width.focus}) dashed {color.focus}","outlineOffset":"max(2px, {border.offset.focus})"}}}},
      "hover":{"description":"Den enkelte række under markøren.","styles":{},"parts":{"row":{"styles":{"color":"var(--ds-interaction-hover-text)","backgroundColor":"var(--ds-interaction-hover-surface)"}}}},
      "active":{"description":"Den enkelte række under aktivering.","styles":{},"parts":{"row":{"styles":{"color":"var(--ds-interaction-active-text)","backgroundColor":"var(--ds-interaction-active-surface)"}}}}
    },
    "preview": {"tag":"ul","part":"root","attrs":{"role":"tree","aria-label":"Indhold","aria-multiselectable":"true"},"children":[{"tag":"li","part":"item","attrs":{"role":"treeitem","aria-label":"Samling","aria-expanded":"true","aria-level":"1","aria-posinset":"1","aria-setsize":"1","tabindex":"0"},"children":[{"tag":"div","part":"row","children":[{"tag":"button","part":"toggle","attrs":{"aria-label":"Luk Samling","aria-disabled":"false","tabindex":"-1"},"children":[{"tag":"span","iconName":"chevron-down","attrs":{"aria-hidden":"true"}}]},{"tag":"button","part":"label","attrs":{"tabindex":"-1"},"children":[{"tag":"span","part":"icon","attrs":{"aria-hidden":"true"},"iconName":"folder"},{"tag":"span","part":"name","text":"Samling"}]},{"tag":"span","part":"meta","text":"2 elementer"},{"tag":"span","part":"actions","children":[{"tag":"button","part":"action","attrs":{"aria-label":"Skjul Samling","aria-disabled":"false","aria-pressed":"true","tabindex":"0"},"children":[{"tag":"span","iconName":"eye","attrs":{"aria-hidden":"true"}}]}]}]},{"tag":"ul","part":"group","attrs":{"role":"group"},"children":[{"tag":"li","part":"item","attrs":{"role":"treeitem","aria-label":"Dokument","aria-selected":"true","aria-level":"2","aria-posinset":"1","aria-setsize":"2","tabindex":"-1"},"children":[{"tag":"div","part":"row","children":[{"tag":"span","part":"spacer","attrs":{"aria-hidden":"true"}},{"tag":"button","part":"label","attrs":{"tabindex":"-1"},"children":[{"tag":"span","part":"icon","attrs":{"aria-hidden":"true"},"iconName":"file-text"},{"tag":"span","part":"name","text":"Dokument"}]}]}]},{"tag":"li","part":"item","attrs":{"role":"treeitem","aria-label":"Arkiv","aria-disabled":"true","aria-level":"2","aria-posinset":"2","aria-setsize":"2","tabindex":"-1"},"children":[{"tag":"div","part":"row","children":[{"tag":"span","part":"spacer","attrs":{"aria-hidden":"true"}},{"tag":"button","part":"label","text":"Arkiv","attrs":{"disabled":true,"tabindex":"-1"}}]}]}]}]}]}
  },
  "stack": {
    "name": "Stak",
    "description": "Lodret sammensætning af relateret indhold med ens afstand mellem direkte børn.",
    "usage": "Standard samler felter, noter og handlinger med gapLarge; compact samler tæt relaterede kontroller med gap. Stakken ejer ydre afstand mellem komponenter, mens felter og valggrupper bevarer indvendig afstand. Native details-root beholder block-layout; en separat disclosure-body-stak efter summary giver luft kun i åben tilstand.",
    "composes": [
      "instruction-note",
      "field",
      "button"
    ],
    "parts": {
      "root": {
        "selector": ".ds-stack",
        "styles": {
          "display": "flex",
          "flexDirection": "column",
          "minWidth": "0",
          "gap": "{space.component.gapLarge}"
        }
      }
    },
    "variants": {
      "default": {
        "description": "Standardafstand mellem afsnit, felter, noter og handlinger.",
        "styles": {}
      },
      "compact": {
        "description": "Kompakt afstand mellem tæt relaterede kontroller.",
        "styles": {
          "gap": "{space.component.gap}"
        }
      },
      "disclosure-body": {
        "description": "Indhold efter en native summary med afstand, der kun optager plads, når details er åben.",
        "styles": {
          "gap": "{space.component.gap}",
          "paddingBlockStart": "{space.component.gapLarge}"
        }
      }
    },
    "states": {},
    "preview": {
      "tag": "div",
      "part": "root",
      "children": [
        {
          "component": "instruction-note"
        },
        {
          "component": "field"
        },
        {
          "component": "button"
        }
      ]
    }
  },
  "menubar": {
  "name": "Menulinje",
  "description": "En vedvarende, kompakt indgang til programmets kommandomenuer.",
  "usage": "Brug til globale kommandoer. mountMenuControls(root, options) forbinder udløsere og menuer gennem aria-controls og leverer åbning/lukning, pile, Home/End, typeahead, Escape med fokusretur og klik udenfor. Tab forlader hele menukæden. Produktet ejer markup, placering og kommandoer gennem options.onAction; genmontér efter udskiftning af markup og kald destroy ved afmontering. Topmenuer er ikke arbejdsområdefaner. Vis ingen genvej uden implementeret handling.",
  "composes": [],
  "parts": {
    "root": {
      "selector": ".ds-menubar",
      "styles": {
        "display": "flex",
        "alignItems": "center",
        "gap": "{space.component.gap}",
        "padding": "{space.component.paddingCompact}",
        "margin": "0",
        "backgroundColor": "{color.background.surface}",
        "color": "{color.text.primary}",
        "fontFamily": "{typography.font.body}"
      }
    },
    "item": {
      "selector": ".ds-menubar__item",
      "styles": {
        ...DESKTOP_CONTROL_STYLES,
        "display": "inline-flex",
        "alignItems": "center",
        "gap": "{space.component.gap}",
        "minWidth": "32px",
        "boxSizing": "border-box",
        "border": "{border.width.default} solid transparent",
        "borderRadius": "{radius.control}",
        "fontFamily": "{typography.font.body}",
        "fontSize": "{typography.size.control}",
        "fontWeight": "{typography.weight.body}",
        "color": "{color.text.primary}",
        "backgroundColor": "transparent",
        "cursor": "pointer"
      }
    }
  },
  "variants": {
    "default": {
      "description": "Vandret programmenu.",
      "styles": {}
    }
  },
  "states": {
    "focus": {
      "description": "Synligt tastaturfokus.",
      "styles": {
        "outline": "{border.width.focus} solid {color.focus}",
        "outlineOffset": "{border.offset.focus}"
      }
    },
    "expanded": {
      "description": "Den åbne topmenu bruger aria-expanded=true på udløseren.",
      "parts": {
        "item": {
          "styles": {}
        }
      },
      "styles": {}
    },
    "hover": {
      "description": "Kun det enkelte menupunkt fremhæves ved hover.",
      "styles": {},
      "parts": {
        "item": {
          "styles": {
            "backgroundColor": "{color.action.neutral.hover.surface}",
            "color": "{color.action.neutral.hover.text}"
          }
        }
      }
    },
    "active": {
      "description": "Det aktiverede menupunkt.",
      "styles": {},
      "parts": {
        "item": {
          "styles": {
            "backgroundColor": "{color.action.neutral.active.surface}",
            "color": "{color.action.neutral.active.text}"
          }
        }
      }
    }
  },
  "preview": {
    "tag": "div",
    "part": "root",
    "attrs": {
      "role": "menubar",
      "aria-label": "Programmenu"
    },
    "children": [
      {
        "tag": "button",
        "part": "item",
        "text": "Filer",
        "attrs": {
          "role": "menuitem",
          "aria-haspopup": "menu",
          "aria-expanded": "false",
          "tabindex": "0"
        }
      },
      {
        "tag": "button",
        "part": "item",
        "text": "Rediger",
        "attrs": {
          "role": "menuitem",
          "aria-haspopup": "menu",
          "aria-expanded": "false",
          "tabindex": "-1"
        }
      },
      {
        "tag": "button",
        "part": "item",
        "text": "Vis",
        "attrs": {
          "role": "menuitem",
          "aria-haspopup": "menu",
          "aria-expanded": "false",
          "tabindex": "-1"
        }
      }
    ]
  }
},
  "menu": {
  "name": "Kommandomenu",
  "description": "En afgrænset flade med kommandoer, valg og tydelige grupper.",
  "usage": "Brug samme rolle i menulinje, kontekstmenu og overflow. mountMenuControls leverer fokus, pile, Home/End, typeahead og Escape; open(trigger) kan åbne fra en produktstyret konteksthandling. Produktet placerer menuen inden for vinduet og udfører kommandoer gennem onAction(item, event). Produktet opdaterer aria-checked og synlige valgmarkører for radio/checkbox. Maksimalt ét underniveau; vis undermenu med højrepil og åbn med Højre/Enter. Farlige handlinger placeres sidst og adskilles. En menu må ikke indeholde almindelige formularfelter; brug en popover eller dialog. Disabled-punkter bruger aria-disabled og kan fokuseres med pile, men kan ikke udføres.",
  "composes": [
    "menu-item"
  ],
  "parts": {
    "root": {
      "selector": ".ds-menu",
      "styles": {
        "display": "flex",
        "flexDirection": "column",
        "gap": "{space.scale.1}",
        "padding": "{space.component.paddingCompact}",
        "minWidth": "220px",
        "maxWidth": "360px",
        "boxSizing": "border-box",
        "border": "{border.width.default} solid {color.border.default}",
        "borderRadius": "{radius.card}",
        "backgroundColor": "{color.background.surface}",
        "color": "{color.text.primary}",
        "boxShadow": "{shadow.floating}",
        "fontFamily": "{typography.font.body}"
      }
    },
    "groupLabel": {
      "selector": ".ds-menu__group-label",
      "styles": {
        "padding": "{space.component.paddingCompact}",
        "fontSize": "{typography.size.small}",
        "color": "{color.text.secondary}"
      }
    },
    "separator": {
      "selector": ".ds-menu__separator",
      "styles": {
        "height": "1px",
        "margin": "{space.component.gap} 0",
        "border": "0",
        "backgroundColor": "{color.border.default}"
      }
    }
  },
  "variants": {
    "default": {
      "description": "Fælles menuoverflade.",
      "styles": {}
    }
  },
  "states": {},
  "preview": {
    "tag": "div",
    "part": "root",
    "attrs": {
      "role": "menu",
      "aria-label": "Handlinger"
    },
    "children": [
      {
        "component": "menu-item"
      },
      {
        "tag": "hr",
        "part": "separator",
        "attrs": {
          "role": "separator"
        }
      },
      {
        "component": "menu-item"
      }
    ]
  }
},
  "menu-item": {
  "name": "Menupunkt",
  "description": "En navngivet kommando med valgfrit symbol, genvej eller valgmarkør.",
  "usage": "Labelen beskriver en handling. Brug slots til label, symbol, genvej og valgmarkør. Produktet sætter role=menuitemcheckbox/menuitemradio med aria-checked ved valg, aria-haspopup og aria-expanded ved undermenu og aria-disabled ved utilgængelig handling. Slå aktivering fra ved aria-disabled; attributten gør det ikke alene. Genvejen er supplerende og må kun vises, når produktet implementerer den.",
  "composes": [],
  "parts": {
    "root": {
      "selector": ".ds-menu-item",
      "styles": {
        ...DESKTOP_CONTROL_STYLES,
        "display": "inline-flex",
        "alignItems": "center",
        "gap": "{space.component.gap}",
        "minWidth": "32px",
        "boxSizing": "border-box",
        "border": "{border.width.default} solid transparent",
        "borderRadius": "{radius.control}",
        "fontFamily": "{typography.font.body}",
        "fontSize": "{typography.size.control}",
        "fontWeight": "{typography.weight.body}",
        "color": "{color.text.primary}",
        "backgroundColor": "transparent",
        "cursor": "pointer",
        "width": "100%",
        "textAlign": "left"
      }
    },
    "symbol": {
      "selector": ".ds-menu-item__symbol",
      "styles": {
        "display": "inline-flex",
        "width": "18px",
        "flexShrink": "0"
      }
    },
    "label": {
      "selector": ".ds-menu-item__label",
      "styles": {
        "flex": "1 1 auto",
        "minWidth": "0"
      }
    },
    "shortcut": {
      "selector": ".ds-menu-item__shortcut",
      "styles": {
        "fontSize": "{typography.size.small}",
        "color": "{color.text.secondary}",
        "whiteSpace": "nowrap"
      }
    },
    "indicator": {
      "selector": ".ds-menu-item__indicator",
      "styles": {
        "display": "inline-flex",
        "width": "18px",
        "flexShrink": "0"
      }
    }
  },
  "variants": {
    "default": {
      "description": "Almindelig kommando.",
      "styles": {}
    },
    "danger": {
      "description": "Destruktiv kommando adskilt fra øvrige handlinger.",
      "styles": {
        "color": "{color.status.dangerText}"
      }
    }
  },
  "states": {
    "hover": {
      "description": "Kontrollen under markøren.",
      "styles": {
        "backgroundColor": "{color.action.neutral.hover.surface}",
        "color": "{color.action.neutral.hover.text}"
      }
    },
    "focus": {
      "description": "Synligt tastaturfokus.",
      "styles": {
        "outline": "{border.width.focus} solid {color.focus}",
        "outlineOffset": "{border.offset.focus}"
      }
    },
    "active": {
      "description": "Kontrollen aktiveres.",
      "styles": {
        "backgroundColor": "{color.action.neutral.active.surface}",
        "color": "{color.action.neutral.active.text}"
      }
    },
    "disabled": {
      "description": "Utilgængelig handling; produktet forklarer årsagen.",
      "styles": {
        "opacity": "{opacity.disabled}",
        "cursor": "not-allowed"
      }
    }
  },
  "preview": {
    "tag": "button",
    "part": "root",
    "attrs": {
      "role": "menuitem",
      "tabindex": "-1"
    },
    "children": [
      {
        "tag": "span",
        "part": "symbol",
        "attrs": {
          "aria-hidden": "true"
        }
      },
      {
        "tag": "span",
        "part": "label",
        "text": "Åbn"
      },
      {
        "tag": "span",
        "part": "shortcut"
      },
      {
        "tag": "span",
        "part": "indicator",
        "attrs": {
          "aria-hidden": "true"
        }
      }
    ]
  }
}
});
export const canonicalComponentId=id=>Object.hasOwn(COMPONENT_ALIASES,id)?COMPONENT_ALIASES[id]:id;
export const canonicalVariantId=(id,key)=>VARIANT_ALIASES[canonicalComponentId(id)]?.[key]??key;
export const canonicalStateId=(id,key)=>STATE_ALIASES[canonicalComponentId(id)]?.[key]??key;
export const canonicalPartId=(id,key)=>PART_ALIASES[canonicalComponentId(id)]?.[key]??key;

/** Coverage is a delivery inventory, not an accessibility certification. It is
 * kept beside the canonical roles so planned work never becomes fake previews
 * or a separate component library. Update this contract with new runtime roles.
 */
const NATIVE_COMPONENTS=new Set(['signature','link','navigation','button','list-item','input','field','select','checkbox','dialog','tag','radio','switch','choice-field','toolbar','action-button','segmented-option','segmented-control','range-field','scroll-area','textarea','number-input','field-group','accordion','breadcrumb','pagination','date-picker','time-picker','progress']);
const COMPONENT_CONTROLLERS={tree:'mountTree',menubar:'mountMenuControls',menu:'mountMenuControls','menu-item':'mountMenuControls',tabs:'mountTabs',tooltip:'mountTooltip',popover:'mountPopover',drawer:'mountDrawer',dialog:'mountDialog',combobox:'mountCombobox',multiselect:'mountMultiselect','range-field':'mountRangeField',toast:'mountToast','file-upload':'mountFileUpload','data-table':'mountDataTable','data-grid':'mountDataGrid'};
const PLANNED_COMPONENTS={};
export const COMPONENT_COVERAGE=freeze({
  ...Object.fromEntries(Object.entries(COMPONENT_LIBRARY).map(([id,component])=>[id,{
    name:component.name,
    status:'available',
    behavior:id==='dialog'?'native':COMPONENT_CONTROLLERS[id]?'controller':NATIVE_COMPONENTS.has(id)?'native':'static',
    entryPoint:COMPONENT_CONTROLLERS[id]??'createComponent',
    note:id==='tooltip'?'Fælles hover, fokus, Escape, aria-describedby og placering ved viewportkanter; hjælpen indeholder ingen kontroller.'
      :id==='dialog'?'Browserens native dialog med valgfri fælles åbning, lukning og fokusretur. Produktet ejer handlinger og kladder.'
      :id==='toolbar'?'Gruppering af native knapper; produktet forbinder kommandoer. Ingen sammensat ARIA-toolbar-navigation.'
      :id==='segmented-control'?'Native valgknapper i en gruppe. Produktet opdaterer valget; rollen erstatter ikke tabs.'
      :id==='range-field'?'Native skyder med valgfrit præcist talfelt og fælles synkronisering, talkladde, feedback og afslutning af et greb. Produktet ejer øvrig validering og lagring.'
      :id==='toast'?'Fælles annoncering, lukning og tidsbegrænsning med pause ved hover og fokus. Produktet ejer kø, placering og meningsfuldt fokus efter lukning.'
      :id==='file-upload'?'Fælles lokalt filvalg, metadatavalidering, fjernelse og valgfrit drop. Produktet ejer filindhold, upload og lagring.'
      :id==='data-table'?'Native tabel med fælles valg, ekspansion og sorteringsanmodninger. Produktet ejer data, rækkefølge, pagination og lagring.'
      :id==='data-grid'?'Fælles cellefokus, native redigering, validering og kopier/indsæt. Produktet ejer data, kommandoer og vedvarende lagring.'
      :['combobox','multiselect'].includes(id)?'Native input bevarer fokus, mens den fælles controller forbinder filtrering, listbox og valg. Produktet ejer forespørgsler og gemte værdier.'
      :COMPONENT_CONTROLLERS[id]?'Fælles controller forbinder tilstande og brugerhandlinger; produktet ejer data og kommandoer.'
      :NATIVE_COMPONENTS.has(id)?'Native semantik og browseradfærd; produktet forbinder data og handlinger.'
      :'Indhold eller layout uden selvstændig interaktionscontroller.',
  }])),
  ...Object.fromEntries(Object.entries(PLANNED_COMPONENTS).filter(([id])=>!Object.hasOwn(COMPONENT_LIBRARY,id)).map(([id,[name,behavior]])=>[id,{
    name,status:'planned',behavior,entryPoint:null,
    note:'Aftalt rolle i udvidelsen af biblioteket; endnu ingen fælles komponentimplementering.',
  }])),
});

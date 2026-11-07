/** Stable visual vocabulary shared by Design Studio packages and products. */
export const PACKAGE_SCHEMA_VERSION = 2;
export const TOKEN_TYPES = Object.freeze(['color', 'dimension', 'fontFamily', 'fontWeight', 'number', 'duration', 'shadow', 'gradient']);
export const REQUIRED_TOKENS = Object.freeze({
  'color.background.canvas': 'color', 'color.background.surface': 'color',
  'color.text.primary': 'color', 'color.text.secondary': 'color',
  'color.border.default': 'color', 'color.action.primary': 'color',
  'color.action.primaryText': 'color', 'color.status.danger': 'color',
  'typography.font.body': 'fontFamily', 'typography.font.heading': 'fontFamily',
  'typography.size.body': 'dimension', 'typography.size.heading': 'dimension',
  'typography.size.label': 'dimension', 'typography.weight.body': 'fontWeight',
  'typography.weight.heading': 'fontWeight', 'typography.lineHeight.body': 'number',
  'typography.lineHeight.heading': 'number',
  'space.1': 'dimension', 'space.2': 'dimension', 'space.3': 'dimension',
  'space.4': 'dimension', 'space.6': 'dimension', 'space.8': 'dimension',
  'radius.control': 'dimension', 'radius.card': 'dimension',
  'shadow.card': 'shadow', 'duration.fast': 'duration',
});
export const COMPONENT_CONTRACTS = Object.freeze({
  button: Object.freeze({parts: Object.freeze({root: '.ds-button'}), variants: Object.freeze(['primary', 'secondary']), states: Object.freeze(['hover', 'focus', 'disabled'])}),
  field: Object.freeze({parts: Object.freeze({root: '.ds-field', label: '.ds-field__label', control: '.ds-input', hint: '.ds-field__hint', error: '.ds-field__error'}), variants: Object.freeze(['default']), states: Object.freeze(['focus', 'disabled'])}),
  card: Object.freeze({parts: Object.freeze({root: '.ds-card', header: '.ds-card__header', body: '.ds-card__body', footer: '.ds-card__footer'}), variants: Object.freeze(['default']), states: Object.freeze([])}),
  badge: Object.freeze({parts: Object.freeze({root: '.ds-badge'}), variants: Object.freeze(['default']), states: Object.freeze([])}),
});
/** Semantic token names become stable CSS variable names. */
export function cssVariableName(id) { return `--ds-${id.replace(/\./g, '-')}`; }
export const TOKEN_REFERENCE_PATTERN = /\{([a-z][a-zA-Z0-9-]*(?:\.[a-zA-Z0-9-]+)*)\}/g;

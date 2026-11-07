/** Shared illustration vocabulary. Geometry and motion live in the graphic families. */
export const GRAPHIC_FAMILY_IDS = Object.freeze(['anatomy', 'lightroom', 'passage', 'fieldlines']);
export const DEFAULT_GRAPHIC_FAMILY = 'anatomy';

/** Keys match the family SVG variables; values are public semantic token IDs. */
export const GRAPHIC_TOKEN_BINDINGS = Object.freeze({
  ground: 'color.illustration.ground',
  plane: 'color.illustration.plane',
  ink: 'color.illustration.ink',
  subject: 'color.illustration.subject',
  counter: 'color.illustration.counterpoint',
  context: 'color.illustration.context',
  edge: 'color.illustration.edge',
  light: 'color.illustration.light',
  depth: 'color.illustration.depth',
  lineWidth: 'illustration.material.lineWidth',
  depthOpacity: 'illustration.material.depthOpacity'
});

const token = ($type, $value, description) => Object.freeze({$type, $value, description});
export const GRAPHIC_TOKEN_DEFAULTS = Object.freeze({
  'color.illustration.ground': token('color', '#ececf6', 'Illustrationens eget billedfelt, afstemt uafhængigt af appens arbejdsflade.'),
  'color.illustration.plane': token('color', '#f5f4f5', 'Et selvstændigt materialeplan i illustrationen.'),
  'color.illustration.ink': token('color', '#2e314b', 'Illustrationens bærende kontur, symboler og grafiske tyngde.'),
  'color.illustration.subject': token('color', '#6862b8', 'Motivets første tyngdepunkt; en billedfarve uden handlings- eller statusbetydning.'),
  'color.illustration.counterpoint': token('color', '#72a09c', 'En selvstændig grafisk modstemme med afstemt farvevægt.'),
  'color.illustration.context': token('color', '#d0cfe9', 'Tilbagetrukne dele og sekundær masse i illustrationen.'),
  'color.illustration.edge': token('color', '#808195', 'Illustrative samlinger, konturer og hjælpelinjer; ikke en interaktiv feltgrænse.'),
  'color.illustration.light': token('color', '#fffdf4', 'Illustrationens lyskant eller lyskilde, afstemt til billedmaterialet.'),
  'color.illustration.depth': token('color', '#b7b8c6', 'Illustrative indsnit og afgrænset materialedybde; uafhængig af UI-elevation.'),
  'illustration.material.lineWidth': token('number', 1.8, 'Positiv stregvægt i illustrationens SVG-enheder.'),
  'illustration.material.depthOpacity': token('number', .12, 'Dybdefarvens styrke i illustrationen, fra 0 til 1.'),
  'duration.illustration': token('duration', '3200ms', 'Positiv varighed for illustrationens afgrænsede forløb; ændrer ikke UI-kontrollernes timing.')
});

import {COMPONENT_LIBRARY} from '../library.mjs';

/** Each shared component role has its own illustration in every family. */
export const GRAPHIC_CATALOG_MOTIFS=Object.freeze(Object.entries(COMPONENT_LIBRARY).map(([id,role])=>Object.freeze({id,name:role.name,meaning:role.description})));
export const GRAPHIC_CATALOG_IDS=Object.freeze(GRAPHIC_CATALOG_MOTIFS.map(motif=>motif.id));

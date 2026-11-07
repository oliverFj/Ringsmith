import { part, track, trace, parallax } from './primitives.mjs';
import { PASSAGE_CATALOG_IDS, catalogMotion } from '../families/passage-catalog.mjs';

export const meta = {
  title: 'Passage · Planer finder deres plads',
  description: 'Tunge, udskårne planer registreres præcist mod hinanden. Åbningerne afslører indholdet, før de små forbindelser bekræfter helheden. Bevægelsen lander roligt og bevarer motivernes solide karakter.',
  interactionHint: 'Bevæg markøren over motivet og undersøg materialedybden. Bagplanerne flytter sig ganske lidt, mens den bærende forgrund bliver stående.',
  duration: 3200
};

const SOLID = 'cubic-bezier(.22,.78,.2,1)';
const REGISTER = 'cubic-bezier(.4,0,.2,1)';
const matrix = (x, y, scale, cx, cy) => `matrix(${scale},0,0,${scale},${x + cx * (1 - scale)},${y + cy * (1 - scale)})`;

export function create(svg, motif) {
  const tracks = [];
  const layers = [];
  let destroyed = false;

  function arrive(key, start, end, { x = 0, y = 12, scale = 1, cx = 300, cy = 210, opacity = 0 } = {}) {
    const target = part(svg, key);
    if (!target) return;
    tracks.push(track(target, [
      { transformBox: 'view-box', transformOrigin: '0px 0px', transform: matrix(x, y, scale, cx, cy), opacity },
      { transformBox: 'view-box', transformOrigin: '0px 0px', transform: 'none', opacity: 1 }
    ], start, end, SOLID));
  }

  function reveal(key, start, end, from = 0) {
    const target = part(svg, key);
    if (target) tracks.push(track(target, [{ opacity: from }, { opacity: 1 }], start, end, REGISTER));
  }

  function drawLines(key, start, end, { reverse = false } = {}) {
    const target = part(svg, key);
    if (!target) return;
    for (const shape of target.querySelectorAll('[stroke]')) {
      const record = trace(shape, start, end, { reverse, easing: REGISTER });
      if (record) tracks.push(record);
    }
  }

  function depth(key, x = 4, y = 3) {
    const target = part(svg, key);
    if (target) layers.push(parallax(target, { x, y }));
  }

  const scenes = {
    spinner() {
      // Register the material, draw its edges, then complete the open foreground.
      // Every layer keeps the same centre throughout the construction.
      reveal('rear-plane', .02, .30);
      reveal('orbit', .23, .34);
      drawLines('orbit', .25, .56);
      reveal('activity', .42, .48);
      drawLines('activity', .44, .81);
      reveal('guides', .62, .75);
      drawLines('guides', .65, .87);
      reveal('accent', .82, .86);
      drawLines('accent', .84, .95);
    },
    poster() {
      // The floor is present from the beginning; the architecture settles onto it.
      reveal('floor', 0, .18, .35);
      arrive('rear-planes', .03, .35, { x: -15, y: 5, opacity: .15 });
      arrive('threshold', .12, .47, { y: 23 });
      reveal('inner-room', .34, .59);
      reveal('route', .52, .77);
      drawLines('route', .54, .83);
      reveal('guides', .67, .93);
      drawLines('guides', .67, .94);
      depth('rear-planes', 5, 3.5);
      depth('inner-room', 1.4, 1);
    },
    focus() {
      arrive('rear-plane', .02, .34, { x: -13, y: 5, opacity: .2 });
      arrive('frame', .12, .47, { y: 17 });
      reveal('inner-field', .32, .59);
      arrive('subject', .45, .74, { y: 0, scale: .84, cx: 286, cy: 215 });
      reveal('guides', .64, .92);
      drawLines('guides', .64, .94);
      depth('rear-plane', 5, 3);
      depth('inner-field', 1.5, 1);
      depth('subject', .65, .5);
    },
    relation() {
      reveal('rear-plane', .02, .31, .15);
      arrive('left-form', .08, .47, { x: -24, y: 0 });
      arrive('right-form', .17, .56, { x: 24, y: 0 });
      reveal('connection', .48, .75);
      drawLines('connection', .5, .8);
      reveal('guides', .68, .92);
      drawLines('guides', .68, .94);
      depth('rear-plane', 4.5, 2.5);
    },
    rhythm() {
      reveal('base', 0, .24, .3);
      // Repeated arches register in a measured four-beat sequence, without bounce.
      for (let index = 0; index < 4; index++) {
        arrive(`beat-${index + 1}`, .07 + index * .14, .39 + index * .14, { y: 19 });
      }
      reveal('intervals', .66, .93);
      drawLines('intervals', .66, .94);
      depth('base', 2, 1);
    },
    accordion() {
      arrive('rear-planes', .02, .35, { x: -14, y: 6, opacity: .12 });
      arrive('header', .08, .35, { y: -7 });
      arrive('opening', .21, .56, { y: -15 });
      reveal('content', .46, .73);
      drawLines('content', .48, .8);
      arrive('closed-rows', .32, .65, { y: -12 });
      reveal('guides', .72, .94);
      drawLines('guides', .72, .94);
      depth('rear-planes', 5, 3);
      depth('content', 1, .7);
    },
    'avatar-group'() {
      reveal('base', 0, .25, .25);
      arrive('person-1', .09, .43, { y: 18 });
      arrive('person-3', .22, .56, { y: 18 });
      arrive('person-2', .34, .69, { y: 22 });
      reveal('connection', .58, .88);
      drawLines('connection', .58, .92);
      depth('base', 2, 1);
    },
    progress() {
      reveal('base', 0, .22, .3);
      reveal('route', .02, .35);
      drawLines('route', .02, .52);
      for (let index = 0; index < 3; index++) {
        arrive(`stage-${index + 1}`, .17 + index * .17, .47 + index * .17, { y: 17 });
      }
      // The fourth stage remains an unfilled destination throughout the sequence.
      reveal('stage-4', .38, .7);
      drawLines('stage-4', .43, .81);
      depth('base', 2, 1);
    },
    image() {
      arrive('rear-plane', .02, .34, { x: -13, y: 5, opacity: .15 });
      arrive('frame', .12, .48, { y: 16 });
      reveal('landscape', .33, .69);
      reveal('guides', .67, .93);
      drawLines('guides', .67, .95);
      depth('rear-plane', 5, 3);
      depth('landscape', 1, .7);
    },
    caption() {
      arrive('rear-plane', .02, .32, { x: -13, y: 5, opacity: .15 });
      arrive('frame', .1, .43, { y: 14 });
      reveal('landscape', .28, .58);
      reveal('caption-link', .5, .76);
      drawLines('caption-link', .5, .79);
      reveal('caption', .65, .9);
      drawLines('caption', .65, .94);
      depth('rear-plane', 5, 3);
      depth('landscape', 1, .7);
    },
    checkbox() {
      arrive('rear-plane', .02, .31, { x: -8, y: 4, opacity: .12 });
      // Both states settle with the same movement, preserving their shared anatomy.
      arrive('selected-field', .12, .46, { y: 12 });
      arrive('unselected-field', .12, .46, { y: 12 });
      reveal('labels', .26, .57);
      drawLines('labels', .27, .65);
      reveal('check', .53, .75);
      drawLines('check', .53, .88);
      depth('rear-plane', 4, 2.5);
    }
  };

  if (Object.hasOwn(scenes, motif)) scenes[motif]();
  else if (PASSAGE_CATALOG_IDS.includes(motif)) {
    for (const { key, start, end, x, y, trace: draw, depth: pointerDepth } of catalogMotion(motif)) {
      arrive(key, start, end, { x, y });
      if (draw) drawLines(key, start + .035, Math.min(.98, end + .09));
      if (pointerDepth) depth(key, ...pointerDepth);
    }
  } else throw new RangeError(`Ukendt Passage-bevægelse: ${motif}`);

  return {
    duration: meta.duration,
    tracks,
    interact(pointer) {
      if (!destroyed) layers.forEach(layer => layer.update(pointer));
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      layers.forEach(layer => layer.destroy());
    }
  };
}

import { part, track, trace } from './primitives.mjs';
import {GRAPHIC_CATALOG_IDS} from '../catalog.mjs';

export const meta = {
  title: 'Feltlinjer · Et signal finder vej',
  description: 'Organiske kurver tegnes med matematisk kontinuitet. Forbindelsen kommer først; knuder og destinationer svarer, når forløbet når dem. Fremdriftsmarkøren følger den tegnede banes faktiske geometri.',
  interactionHint: 'Før markøren tæt på en kurve. En lille sonde finder det nærmeste punkt på selve forløbet, så du kan undersøge dets form og forbindelser.',
  duration: 3200
};

const FLOW = 'cubic-bezier(.35,0,.2,1)';
const SOFT = 'cubic-bezier(.2,.7,.2,1)';
const circleMatrix = (cx, cy, scale) => `matrix(${scale},0,0,${scale},${cx * (1 - scale)},${cy * (1 - scale)})`;
const stroked = target => target ? [...target.querySelectorAll('[stroke]')].filter(shape => shape.getTotalLength) : [];
const pathShapes = target => target ? [...target.querySelectorAll('path[stroke],line[stroke],polyline[stroke]')].filter(shape => shape.getTotalLength && shape.getPointAtLength) : [];

export function create(svg, motif) {
  const tracks = [];
  let destroyed = false;

  function reveal(key, start, end, from = 0) {
    const target = part(svg, key);
    if (target) tracks.push(track(target, [{ opacity: from }, { opacity: 1 }], start, end, SOFT));
  }

  function ink(key, start, end, { reverse = false, stagger = 0, easing = FLOW } = {}) {
    stroked(part(svg, key)).forEach((shape, index) => {
      const record = trace(shape, start + index * stagger, end + index * stagger, { reverse, easing });
      if (record) tracks.push(record);
    });
  }

  function node(target, start, end, cx, cy, scale = .8) {
    if (!target) return;
    tracks.push(track(target, [
      { transformBox: 'view-box', transformOrigin: '0px 0px', transform: circleMatrix(cx, cy, scale), opacity: 0 },
      { transformBox: 'view-box', transformOrigin: '0px 0px', transform: circleMatrix(cx, cy, 1.025), opacity: 1, offset: .72 },
      { transformBox: 'view-box', transformOrigin: '0px 0px', transform: 'none', opacity: 1 }
    ], start, end, SOFT));
  }

  function circleNodes(key, timings) {
    const target = part(svg, key);
    target?.querySelectorAll('circle').forEach((shape, index) => {
      const [start, end] = timings[Math.min(index, timings.length - 1)];
      node(shape, start, end, Number(shape.getAttribute('cx')), Number(shape.getAttribute('cy')), .65);
    });
  }

  function follow(target, shape, start, end, anchorX, anchorY) {
    if (!target || !shape?.getTotalLength || !shape.getPointAtLength) return;
    const length = shape.getTotalLength();
    const frames = Array.from({ length: 49 }, (_, index) => {
      const offset = index / 48;
      const point = shape.getPointAtLength(length * offset);
      return {
        offset,
        transform: index === 48 ? 'none' : `translate(${point.x - anchorX}px,${point.y - anchorY}px)`,
        opacity: index === 0 ? 0 : 1
      };
    });
    tracks.push(track(target, frames, start, end, FLOW));
  }

  const scenes = {
    poster() {
      reveal('field', 0, .25);
      ink('field', .01, .47, { stagger: .025 });
      reveal('route', .12, .25);
      ink('route', .14, .77);
      node(part(svg, 'decision'), .32, .62, 262, 230, .91);
      node(part(svg, 'destination'), .69, .9, 495, 176.9, .68);
      reveal('guides', .71, .94);
      ink('guides', .71, .96);
    },
    focus() {
      reveal('field', 0, .24);
      ink('field', .02, .48, { stagger: .025 });
      reveal('route', .08, .21);
      ink('route', .1, .73);
      reveal('focus-ring', .31, .62);
      ink('focus-ring', .34, .76);
      node(part(svg, 'subject'), .44, .78, 300, 210, .82);
      reveal('guides', .74, .95);
      ink('guides', .74, .96);
    },
    relation() {
      node(part(svg, 'source'), 0, .25, 112, 211, .82);
      reveal('outbound', .06, .18);
      ink('outbound', .08, .49);
      node(part(svg, 'destination'), .42, .65, 488, 211, .82);
      reveal('return', .44, .56);
      ink('return', .46, .85, { reverse: true });
      reveal('shared-space', .68, .93);
      ink('shared-space', .69, .96);
    },
    rhythm() {
      reveal('rhythm', 0, .16);
      ink('rhythm', .03, .74, { easing: 'linear' });
      reveal('echo-1', .07, .21);
      ink('echo-1', .1, .81, { easing: 'linear' });
      reveal('echo-2', .14, .28);
      ink('echo-2', .17, .88, { easing: 'linear' });
      circleNodes('beats', [[.14, .36], [.38, .6], [.62, .84]]);
      reveal('intervals', .73, .94);
      ink('intervals', .74, .97);
    },
    accordion() {
      reveal('header', 0, .23);
      ink('header', .02, .3);
      reveal('stem', .1, .22);
      ink('stem', .13, .58);
      for (let index = 0; index < 3; index++) {
        const key = `branch-${index + 1}`;
        const start = .25 + index * .14;
        reveal(key, start, start + .13);
        ink(key, start, start + .29, { stagger: .055 });
        circleNodes(key, [[start + .12, start + .32]]);
      }
      reveal('guides', .75, .95);
      ink('guides', .75, .97);
    },
    'avatar-group'() {
      node(part(svg, 'person-1'), 0, .29, 132, 163, .87);
      reveal('relation', .04, .18);
      ink('relation', .06, .78);
      node(part(svg, 'person-2'), .29, .58, 300, 224, .87);
      node(part(svg, 'person-3'), .6, .89, 468, 163, .87);
      circleNodes('nodes', [[.2, .43], [.53, .76]]);
    },
    progress() {
      // The entire waiting route is legible before the marked portion advances.
      reveal('remaining-route', 0, .2, .42);
      node(part(svg, 'destination'), 0, .27, 510, 126, .87);
      reveal('completed-route', .08, .2);
      ink('completed-route', .12, .8);
      circleNodes('milestones', [[.17, .35], [.41, .59]]);
      follow(part(svg, 'current-node'), pathShapes(part(svg, 'completed-route'))[0], .12, .8, 366, 126);
      reveal('guides', .76, .96);
      ink('guides', .77, .98);
    },
    image() {
      reveal('frame', 0, .23);
      ink('frame', .01, .35);
      reveal('landscape', .11, .27);
      ink('landscape', .13, .69, { stagger: .055 });
      node(part(svg, 'sun'), .43, .76, 389, 142, .85);
      reveal('guides', .77, .95);
      ink('guides', .77, .97);
    },
    caption() {
      reveal('frame', 0, .2);
      ink('frame', .01, .31);
      reveal('landscape', .07, .22);
      ink('landscape', .09, .55, { stagger: .04 });
      node(part(svg, 'sun'), .31, .62, 389, 125, .85);
      reveal('caption-link', .55, .69);
      ink('caption-link', .57, .82);
      reveal('caption', .72, .86);
      ink('caption', .73, .96);
    },
    checkbox() {
      reveal('selected-field', 0, .25);
      reveal('unselected-field', 0, .25);
      ink('selected-field', .01, .29);
      ink('unselected-field', .01, .29);
      reveal('labels', .14, .38);
      ink('labels', .16, .57);
      reveal('check-route', .29, .43);
      ink('check-route', .31, .77);
      circleNodes('check-route', [[.65, .87]]);
      reveal('guides', 0, .26);
      ink('guides', .01, .32);
    }
  };

  if (Object.hasOwn(scenes,motif)) scenes[motif]();
  else if(GRAPHIC_CATALOG_IDS.includes(motif)) {
    reveal('context',0,.24,.35);
    ink('context',.02,.34);
    reveal('routes',.08,.2);
    ink('routes',.1,.72);
    reveal('content',.27,.61);
    ink('content',.29,.77);
    reveal('markers',.55,.78);
    circleNodes('markers',[[.55,.8],[.65,.9],[.7,.95]]);
    reveal('guides',.68,.94,.15);
    ink('guides',.7,.96);
  } else throw new RangeError(`Ukendt Feltlinjer-bevægelse: ${motif}`);

  // A pointer-controlled geometric probe, not a timer-driven decorative particle.
  // Sampling is cached once; refinement keeps the probe precisely on its curve.
  const probeKeys = {
    poster: ['route'], focus: ['route'], relation: ['outbound', 'return'],
    rhythm: ['rhythm'], accordion: ['stem', 'branch-1', 'branch-2', 'branch-3'],
    'avatar-group': ['relation'], progress: ['completed-route', 'remaining-route'],
    image: ['landscape'], caption: ['landscape', 'caption-link'], checkbox: ['check-route']
  };
  const exclusions = {
    poster: [[262, 230, 63], [495, 176.9, 14]],
    focus: [[300, 210, 85]],
    relation: [[112, 211, 28], [488, 211, 28]],
    'avatar-group': [[132, 163, 50], [300, 224, 57], [468, 163, 50]]
  };
  const inVisibleArea = point => {
    if ((motif === 'image' || motif === 'caption') && point.x >= 112 && point.x <= 488) {
      const top = motif === 'image' ? 82 : 65;
      // Caption connectors are outside the image aperture and remain probeable.
      if (!(motif === 'caption' && point.y >= 291) && (point.y < top || point.y > top + 226)) return false;
    }
    if ((motif === 'image' || motif === 'caption') && (point.x < 112 || point.x > 488)) return false;
    return !(exclusions[motif] || []).some(([cx, cy, radius]) => (point.x - cx) ** 2 + (point.y - cy) ** 2 < radius ** 2);
  };

  const candidateShapes = [...new Set((probeKeys[motif]??['routes']).flatMap(key => pathShapes(part(svg, key))))];
  // Coincident outline/underlay paths are harmless; at most one is refined per move.
  const candidates = candidateShapes.map(shape => {
    const length = shape.getTotalLength();
    return {
      shape, length,
      samples: Array.from({ length: 41 }, (_, index) => {
        const at = length * index / 40;
        return { at, point: shape.getPointAtLength(at) };
      }).filter(sample => inVisibleArea(sample.point))
    };
  }).filter(candidate => Number.isFinite(candidate.length) && candidate.length > 0);

  const probe = svg.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'g');
  probe.setAttribute('data-motion-helper', 'field-probe');
  probe.setAttribute('pointer-events', 'none');
  probe.setAttribute('visibility', 'hidden');
  for (const [r, fill, stroke, width] of [
    [9, 'var(--g-ground)', 'var(--g-edge)', 1.2],
    [3, 'var(--g-ink)', 'none', 0]
  ]) {
    const marker = svg.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'circle');
    marker.setAttribute('r', String(r));
    marker.setAttribute('fill', fill);
    marker.setAttribute('stroke', stroke);
    marker.setAttribute('stroke-width', String(width));
    probe.append(marker);
  }
  svg.append(probe);

  function interact({ x = 0, y = 0, active = false } = {}) {
    if (destroyed) return;
    if (!active) {
      probe.setAttribute('visibility', 'hidden');
      return;
    }
    const px = 300 + x * 300;
    const py = 210 + y * 210;
    const distance = point => (point.x - px) ** 2 + (point.y - py) ** 2;
    let best = null;
    for (const candidate of candidates) {
      for (const sample of candidate.samples) {
        const score = distance(sample.point);
        if (!best || score < best.score) best = { candidate, at: sample.at, point: sample.point, score };
      }
    }
    if (!best || best.score > 85 ** 2) {
      probe.setAttribute('visibility', 'hidden');
      return;
    }
    let lower = Math.max(0, best.at - best.candidate.length / 40);
    let upper = Math.min(best.candidate.length, best.at + best.candidate.length / 40);
    for (let index = 0; index < 9; index++) {
      const first = lower + (upper - lower) / 3;
      const second = upper - (upper - lower) / 3;
      const p1 = best.candidate.shape.getPointAtLength(first);
      const p2 = best.candidate.shape.getPointAtLength(second);
      if (distance(p1) < distance(p2)) upper = second;
      else lower = first;
    }
    const point = best.candidate.shape.getPointAtLength((lower + upper) / 2);
    if (!inVisibleArea(point)) {
      probe.setAttribute('visibility', 'hidden');
      return;
    }
    probe.setAttribute('transform', `translate(${point.x} ${point.y})`);
    probe.setAttribute('opacity', String(Math.max(0, 1 - Math.sqrt(distance(point)) / 85)));
    probe.setAttribute('visibility', 'visible');
  }

  return {
    duration: meta.duration,
    tracks,
    interact,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      probe.remove();
    }
  };
}

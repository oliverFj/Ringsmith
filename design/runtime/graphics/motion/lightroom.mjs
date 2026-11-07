import { part, track, trace, parallax } from './primitives.mjs';

export const meta = {
  title: 'Dagslys i bevægelse',
  description: 'Lyset ankommer før detaljen. Rolige afsløringer, milde forskydninger og en diskret rumlig reaktion bevarer Lysrums inviterende karakter.',
  interactionHint: 'Flyt markøren over motivet: lyset følger dig diskret, mens rammen holder sin plads.',
  duration: 3200
};

const EASE = 'cubic-bezier(.22,.68,.28,1)';
const SETTLE = 'cubic-bezier(.18,.68,.24,1)';

function appear(opacity = .4, transform = 'none', origin = '300px 210px') {
  return [
    { opacity, transform, transformOrigin: origin, transformBox: 'view-box' },
    { opacity: 1, transform: 'none', transformOrigin: origin, transformBox: 'view-box' }
  ];
}

/** All playback belongs to the shared player. This module only describes a pose. */
export function create(svg, motif) {
  const tracks = [];
  const interactionLayers = [];
  const restoreAttributes = [];
  const get = key => part(svg, key);
  const add = (target, frames, start = 0, end = 1, easing = EASE) => {
    if (target) tracks.push(track(target, frames, start, end, easing));
  };
  const reveal = (key, start, end, opacity = .4, transform = 'none', origin) => {
    add(get(key), appear(opacity, transform, origin), start, end);
  };
  const drawLine = (shape, start, end) => {
    if (!shape) return;
    const drawing = trace(shape, start, end, { easing: EASE });
    if (drawing) tracks.push(drawing);
  };
  const float = (target, x, y) => {
    if (target) interactionLayers.push(parallax(target, { x, y }));
  };

  switch (motif) {
    case 'poster': {
      reveal('outer-frame', 0, .38, .72);
      reveal('inner-frame', .08, .53, .55);
      reveal('sill', .28, .72, .28);
      // Animate the lamp inside its existing clip, keeping the opening fixed.
      const lamp = get('light-field')?.querySelector('path');
      add(lamp, appear(.04, 'scale(.91)', '300px 291px'), .12, .84, SETTLE);
      float(lamp, 2.5, 1.5);
      break;
    }
    case 'focus': {
      reveal('recess', 0, .4, .7);
      reveal('depth', .1, .6, .35);
      reveal('light-field', .16, .82, .06, 'scale(.92)', '300px 209px');
      reveal('sill', .34, .76, .3);
      float(get('light-field'), 4, 3);
      break;
    }
    case 'relation': {
      reveal('first-plane', 0, .62, .68, 'translate(-9px, -2px)');
      reveal('second-plane', .09, .7, .6, 'translate(9px, 2px)');
      reveal('shared-field', .34, .85, .02);
      reveal('edges', .3, .78, .25);
      // Keep the exact intersection intact during pointer movement.
      for (const key of ['first-plane', 'second-plane', 'shared-field', 'edges']) {
        float(get(key), 2, 1.25);
      }
      break;
    }
    case 'rhythm': {
      const keys = ['first-window', 'second-window', 'third-window', 'fourth-window'];
      keys.forEach((key, index) => {
        reveal(key, .04 + index * .105, .54 + index * .105, .36, 'translate(0px, 7px)');
        // The illuminated interior moves within the generous solid surround.
        const lamp = get(key)?.querySelectorAll(':scope > path')[1];
        float(lamp, 1.5, 1);
      });
      break;
    }
    case 'accordion': {
      reveal('recess', 0, .48, .57);
      add(get('cover'), appear(1, 'rotate(1.1deg)', '117px 94px'), .04, .66, SETTLE);
      reveal('content', .25, .83, .03, 'translate(0px, 4px)');
      reveal('sill', .32, .8, .35);
      reveal('closed-rows', .04, .46, .72);
      float(get('cover'), .8, -.65);
      break;
    }
    case 'avatar-group': {
      reveal('shared-room', 0, .44, .62);
      ['first-person', 'second-person', 'third-person'].forEach((key, index) => {
        reveal(key, .13 + index * .1, .62 + index * .1, .28, 'translate(0px, 6px)');
        float(get(key), 2, 1.2);
      });
      reveal('shared-edge', .34, .88, .32);
      float(get('shared-room'), .7, .4);
      float(get('shared-edge'), .7, .4);
      break;
    }
    case 'progress': {
      reveal('route', 0, .44, .48);
      [126, 242, 358, 474].forEach((x, index) => {
        const key = `milestone-${index + 1}`;
        reveal(key, .09 + index * .145, .43 + index * .145, .45, 'scale(.96)', `${x}px 210px`);
        if (index < 3) {
          drawLine(get(key)?.querySelector(':scope > path'), .19 + index * .15, .44 + index * .15);
        }
        float(get(key), .5, 1);
      });
      drawLine(get('destination')?.querySelector('path'), .64, .93);
      break;
    }
    case 'image':
    case 'caption': {
      reveal('frame-depth', .05, .6, .25);
      reveal('frame', 0, .43, .72);
      reveal('sky', .1, .61, .32);
      reveal('light-edge', .3, .74, .2);
      // Each terrain plane settles inside the unaltered image clip.
      const terrain = get('landscape')?.querySelectorAll('g[clip-path] > path') ?? [];
      terrain.forEach((plane, index) => {
        add(plane, appear(.4, `translate(0px, ${5 + index * 2}px)`), .18 + index * .075, .72 + index * .08);
      });
      const sun = get('sky')?.querySelector('circle');
      float(sun, 4, 2.5);
      float(get('frame-depth'), 1.5, 1);
      if (motif === 'caption') {
        reveal('caption', .38, .83, .1, 'translate(0px, 4px)');
        drawLine(get('caption-connection')?.querySelector('path'), .62, .9);
      }
      break;
    }
    case 'checkbox': {
      reveal('checked-frame', 0, .46, .7);
      reveal('selected-field', .08, .59, .08, 'scale(.96)', '173.5px 144.5px');
      drawLine(get('checkmark')?.querySelector('path'), .3, .73);
      reveal('unchecked-field', .05, .49, .64);
      reveal('labels', .12, .58, .58);
      float(get('selected-field'), 1.25, .8);
      float(get('checkmark'), 1.25, .8);
      float(get('checked-frame'), .4, .25);
      break;
    }
    default: {
      const catalog=svg.querySelector('[data-lightroom-catalog]');
      if(!catalog||catalog.getAttribute('data-lightroom-catalog')!==motif)throw new Error(`Unknown Lysrum motion motif: ${motif}`);
      const groups=Array.from(catalog.querySelectorAll('[data-part]')).filter(group=>group.getAttribute('data-lightroom-motion'));
      groups.forEach((group,index)=>{
        const mode=group.getAttribute('data-lightroom-motion');
        const [ox,oy]=(group.getAttribute('data-lightroom-origin')||'300 210').split(' ').map(Number);
        const origin=`${ox}px ${oy}px`,start=.025+index*.065,end=Math.min(.9,.6+index*.075);
        const transform=mode==='rise'?'translate(0px, 7px)':mode==='slide'?'translate(6px, 0px)':mode==='turn'?'rotate(-18deg)':mode==='light'?'scale(.96)':'none';
        add(group,appear(mode==='light'?.12:mode==='draw'?.6:.5,transform,origin),start,end,SETTLE);
        if(mode==='draw'){
          const strokes=Array.from(group.querySelectorAll('path')).filter(shape=>shape.getAttribute('fill')==='none'&&shape.getAttribute('stroke'));
          strokes.forEach((shape,strokeIndex)=>drawLine(shape,.14+index*.06+Math.min(strokeIndex,4)*.018,Math.min(.95,end+.16)));
        }
      });
      const light=groups.find(group=>group.getAttribute('data-lightroom-motion')==='light');
      if(light)float(light,1.1,.7);
      else{
        const softEdge=groups.flatMap(group=>Array.from(group.querySelectorAll('path'))).find(shape=>shape.getAttribute('stroke')==='var(--g-light)');
        float(softEdge||groups.at(-1),1.5,.7);
      }
      break;
    }
  }

  // Moving the focal light changes the material, rather than recolouring the UI.
  const glow = svg.querySelector('radialGradient[id$="-glow"]');
  const wall = svg.querySelector('linearGradient[id$="-wall"]');
  for (const [element, attributes] of [[glow, ['cx', 'cy']], [wall, ['x1', 'y1', 'x2', 'y2']]]) {
    if (element) for (const name of attributes) restoreAttributes.push({ element, name, value: element.getAttribute(name) });
  }

  let destroyed = false;
  const restoreLight = () => {
    for (const { element, name, value } of restoreAttributes) {
      if (value === null) element.removeAttribute(name);
      else element.setAttribute(name, value);
    }
  };

  return {
    duration: meta.duration,
    tracks,
    interact({ x = 0, y = 0, active = false } = {}) {
      if (destroyed) return;
      const horizontal = active ? Math.max(-1, Math.min(1, Number(x) || 0)) : 0;
      const vertical = active ? Math.max(-1, Math.min(1, Number(y) || 0)) : 0;
      const pose = { x: horizontal, y: vertical, active };
      interactionLayers.forEach(layer => layer.update(pose));
      if (!active) {
        restoreLight();
        return;
      }
      if (glow) {
        glow.setAttribute('cx', String(.45 + horizontal * .045));
        glow.setAttribute('cy', String(.38 + vertical * .04));
      }
      if (wall) {
        wall.setAttribute('x1', String(horizontal * .035));
        wall.setAttribute('y1', String(vertical * .035));
        wall.setAttribute('x2', String(1 + horizontal * .035));
        wall.setAttribute('y2', String(1 + vertical * .035));
      }
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      restoreLight();
      for (const layer of interactionLayers.reverse()) layer.destroy();
    }
  };
}

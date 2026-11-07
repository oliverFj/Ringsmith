import {part, track, trace} from './primitives.mjs';
import {CATALOG_ANCHORS,CATALOG_MOTION} from '../families/anatomy-catalog.mjs';

export const meta = {
  title: 'En tegning bliver til',
  description: 'Referencer, konturer og mål falder på plads i en præcis byggeorden. Farven kommer, når dens betydning er etableret. Bevægelsen standser i den færdige tegning.',
  interactionHint: 'Bevæg markøren nær en form: en lille måleprobe finder det nærmeste anker og viser forbindelsen.',
  duration: 3200
};

const SVG_NS = 'http://www.w3.org/2000/svg';
const drawnShapes = 'path,line,rect,circle,ellipse,polyline,polygon';
const EASE = 'cubic-bezier(.2,.7,.2,1)';
const LINEAR = 'linear';

const anchors = {
  ...CATALOG_ANCHORS,
  poster: [[300,211],[128,102],[215,137],[80,211],[300,355]],
  focus: [[300,205],[200,105],[400,305],[300,352]],
  relation: [[227,180],[300,210],[372,240],[300,389]],
  rhythm: [[135,192],[245,192],[355,192],[465,192],[300,316]],
  accordion: [[154,114],[154,211],[154,335],[523,228],[115,228]],
  'avatar-group': [[172,170],[300,140],[428,170],[300,355]],
  progress: [[155,195],[255,195],[355,195],[455,195],[355,284]],
  image: [[216,136],[135,80],[370,141],[465,285]],
  caption: [[216,136],[300,285],[350,326],[430,347]],
  checkbox: [[175,130],[175,270],[240,121],[240,261]]
};

function measuringProbe(svg, motif) {
  const doc = svg.ownerDocument;
  const overlay = doc.createElementNS(SVG_NS,'g');
  overlay.setAttribute('data-motion-helper','anatomy-measurement');
  overlay.setAttribute('aria-hidden','true');
  overlay.setAttribute('pointer-events','none');
  overlay.setAttribute('opacity','0');
  const elbow = doc.createElementNS(SVG_NS,'path');
  elbow.setAttribute('fill','none');
  elbow.setAttribute('stroke','var(--g-edge)');
  elbow.setAttribute('stroke-width','1');
  elbow.setAttribute('stroke-dasharray','2 4');
  const cursor = doc.createElementNS(SVG_NS,'path');
  cursor.setAttribute('fill','none');
  cursor.setAttribute('stroke','var(--g-ink)');
  cursor.setAttribute('stroke-width','1');
  const anchor = doc.createElementNS(SVG_NS,'circle');
  anchor.setAttribute('r','5');
  anchor.setAttribute('fill','var(--g-ground)');
  anchor.setAttribute('stroke','var(--g-subject)');
  anchor.setAttribute('stroke-width','1.5');
  overlay.append(elbow,cursor,anchor);
  svg.append(overlay);
  return {
    update({x,y,active}) {
      if (!active || !Number.isFinite(x) || !Number.isFinite(y)) {
        overlay.setAttribute('opacity','0');
        return;
      }
      const px = 300 + Math.max(-1,Math.min(1,x))*300;
      const py = 210 + Math.max(-1,Math.min(1,y))*210;
      let nearest = anchors[motif][0], distance = Infinity;
      for (const point of anchors[motif]) {
        const candidate = Math.hypot(point[0]-px,point[1]-py);
        if (candidate<distance) {nearest=point;distance=candidate;}
      }
      const [ax,ay] = nearest;
      const opacity = Math.max(0,Math.min(.72,(160-distance)/130));
      elbow.setAttribute('d',`M${px.toFixed(2)} ${py.toFixed(2)}H${ax}V${ay}`);
      cursor.setAttribute('d',`M${(px-5).toFixed(2)} ${py.toFixed(2)}h10M${px.toFixed(2)} ${(py-5).toFixed(2)}v10`);
      anchor.setAttribute('cx',String(ax));
      anchor.setAttribute('cy',String(ay));
      overlay.setAttribute('opacity',opacity.toFixed(3));
    },
    destroy() {overlay.remove();}
  };
}

export function create(svg, motif) {
  if (!Object.hasOwn(anchors,motif)) throw new RangeError(`Ukendt motiv i Tegnets anatomi: ${motif}`);
  const tracks = [];
  const add = value => {if (value) tracks.push(value);};
  const get = key => {
    const target=part(svg,key);
    if (!target) throw new Error(`Tegnets anatomi mangler delen ${key} i ${motif}.`);
    return target;
  };
  const children = target => Array.from(target.querySelectorAll(drawnShapes));
  const strokes = target => children(target).filter(node=>{
    const stroke=node.getAttribute('stroke');
    return stroke && stroke!=='none';
  });
  const fills = target => children(target).filter(node=>{
    const fill=node.getAttribute('fill');
    return fill && fill!=='none';
  });
  const fade = (target,start,end) => {
    const opacity=Number(target.getAttribute('opacity')??1);
    add(track(target,[{opacity:0},{opacity}],start,end,EASE));
  };
  const fill = (target,start,end) => {
    const fillOpacity=Number(target.getAttribute('fill-opacity')??1);
    add(track(target,[{fillOpacity:0},{fillOpacity}],start,end,EASE));
  };
  const draw = (target,start,end,options={}) => add(trace(target,start,end,{easing:LINEAR,...options}));
  const build = (key,start,end,{stagger=.025,paint=true}={}) => {
    const target=get(key), outlines=strokes(target);
    fade(target,start,Math.min(end,start+.08));
    outlines.forEach((node,index)=>draw(node,start+index*stagger,Math.min(.995,end+index*stagger)));
    if (paint) fills(target).forEach((node,index)=>fill(node,start+.055+index*stagger,Math.min(.995,end+.035+index*stagger)));
    Array.from(target.querySelectorAll('text')).forEach((node,index)=>fade(node,end-.06+index*.025,Math.min(.995,end+.045+index*.025)));
    return target;
  };
  const registerRing = (start,end) => {
    const target=get('subject');
    fade(target,start,start+.08);
    // Keep the aperture opaque while its surrounding pigment is revealed.
    // Fading both discs would temporarily turn the ring into a solid spot.
    fill(target.querySelector('circle'),start+.04,end);
  };

  switch (motif) {
    case 'poster': {
      const grid=get('construction');
      fade(grid,0,.12);
      strokes(grid).forEach((node,index)=>draw(node,index*.006,.20+index*.006));
      const structure=build('structure',.12,.56,{stagger:.045});
      const surfaces=fills(structure);
      // The inner plane settles before the central aperture is registered.
      if (surfaces.length!==1) throw new Error('Plakatens indre plan kan ikke identificeres.');
      registerRing(.58,.78);
      build('annotations',.68,.91,{stagger:.01,paint:false});
      break;
    }
    case 'focus': {
      build('field',.025,.34,{stagger:.10});
      build('guides',.24,.65,{stagger:.025,paint:false});
      registerRing(.49,.77);
      break;
    }
    case 'relation': {
      build('first-field',.04,.28);
      build('second-field',.24,.48);
      build('intersection',.49,.69);
      const connection=build('connection',.68,.92,{stagger:0});
      const endpoint=connection.querySelector('circle');
      if (endpoint) fade(endpoint,.87,.98);
      break;
    }
    case 'rhythm': {
      const frames=get('repeated-frames');
      fade(frames,.015,.08);
      children(frames).forEach((node,index)=>{
        draw(node,.04+index*.13,.24+index*.13);
        fill(node,.07+index*.13,.19+index*.13);
      });
      const cadence=get('cadence');
      fade(cadence,.12,.19);
      children(cadence).sort((a,b)=>Number(a.getAttribute('x'))-Number(b.getAttribute('x'))).forEach((node,index)=>{
        if (node.getAttribute('stroke')!=='none') draw(node,.17+index*.13,.34+index*.13);
        if (node.getAttribute('fill')!=='none') fill(node,.18+index*.13,.35+index*.13);
      });
      build('intervals',.61,.84,{stagger:.011,paint:false});
      break;
    }
    case 'accordion': {
      build('collapsed-first',.015,.20,{stagger:.025,paint:false});
      build('collapsed-last',.08,.265,{stagger:.025,paint:false});
      const expanded=get('expanded');
      fade(expanded,.17,.23);
      const [boundary,chevron,...content]=children(expanded);
      draw(boundary,.18,.50);
      fill(boundary,.28,.52);
      draw(chevron,.20,.37);
      add(track(chevron,[
        {transform:'rotate(-90deg)',transformOrigin:'154px 211px',transformBox:'view-box'},
        {transform:'rotate(0deg)',transformOrigin:'154px 211px',transformBox:'view-box'}
      ],.19,.45,EASE));
      content.forEach((node,index)=>draw(node,.43+index*.055,.65+index*.055));
      const accent=get('active-edge');
      fade(accent,.25,.33);
      add(track(accent,[
        {transform:'scaleY(0)',transformOrigin:'111px 165px',transformBox:'view-box'},
        {transform:'scaleY(1)',transformOrigin:'111px 165px',transformBox:'view-box'}
      ],.28,.65,EASE));
      build('extent',.46,.82,{stagger:.035,paint:false});
      break;
    }
    case 'avatar-group': {
      ['person-left','person-center','person-right'].forEach((key,index)=>{
        const person=get(key), start=.025+index*.13;
        fade(person,start,start+.07);
        const [frame,head,shoulders]=children(person);
        draw(frame,start,start+.28);
        fill(frame,start+.05,start+.20);
        if (head.getAttribute('stroke')!=='none') draw(head,start+.15,start+.35);
        else fill(head,start+.15,start+.35);
        draw(shoulders,start+.24,start+.43);
      });
      const bracket=get('shared-bracket');
      fade(bracket,.56,.63);
      draw(bracket.querySelector('path'),.56,.88);
      fill(bracket.querySelector('circle'),.85,.98);
      break;
    }
    case 'progress': {
      const stages=get('stages');
      fade(stages,.01,.07);
      children(stages).forEach((node,index)=>{
        draw(node,.025+index*.10,.23+index*.10);
        fill(node,.06+index*.10,.19+index*.10);
      });
      build('guides',.09,.40,{stagger:.02,paint:false});
      const route=get('route');
      fade(route,.28,.34);
      const [passed,waiting]=children(route);
      draw(passed,.30,.68);
      draw(waiting,.67,.90);
      const completed=get('completed');
      fade(completed,.29,.35);
      const [first,second,firstMark,secondMark]=children(completed);
      fill(first,.31,.45);fill(second,.46,.60);
      fill(firstMark,.34,.44);fill(secondMark,.51,.61);
      build('current',.63,.78,{stagger:0});
      build('remaining',.86,.98,{stagger:0});
      break;
    }
    case 'image': {
      build('registration',0,.27,{stagger:0,paint:false});
      build('frame',.06,.36);
      const landscape=get('landscape');
      fade(landscape,.29,.36);
      const [plane,horizon]=children(landscape);
      draw(horizon,.31,.64);
      fill(plane,.42,.71);
      build('sun',.63,.84,{stagger:0});
      break;
    }
    case 'caption': {
      build('frame',.015,.29);
      const landscape=get('landscape');
      fade(landscape,.19,.25);
      const [plane,horizon,sun]=children(landscape);
      fill(plane,.23,.44);draw(horizon,.23,.46);fill(sun,.37,.54);
      const connector=get('connector');
      fade(connector,.48,.54);
      fill(connector.querySelector('circle'),.48,.59);
      draw(connector.querySelector('path'),.53,.77);
      build('caption-lines',.76,.94,{stagger:.04,paint:false});
      break;
    }
    case 'checkbox': {
      const checked=get('checked'), unchecked=get('unchecked');
      fade(checked,.015,.08);fade(unchecked,.09,.16);
      const [frame,pigment,tick]=children(checked);
      draw(frame,.03,.27);fill(frame,.04,.15);
      draw(unchecked.querySelector('rect'),.11,.35);
      fill(unchecked.querySelector('rect'),.13,.24);
      build('labels',.13,.39,{stagger:.025,paint:false});
      fill(pigment,.34,.53);
      draw(tick,.52,.78);
      break;
    }
    default: {
      // Each role supplies its own semantic construction order and measured anchors.
      // Contours precede the pigment of that role; the shared timeline remains finite.
      for(const {key,start,end} of CATALOG_MOTION[motif]){
        build(key,start,end,{stagger:.012});
      }
    }
  }

  const probe=measuringProbe(svg,motif);
  return {
    duration:meta.duration,
    tracks,
    interact: value => probe.update(value),
    destroy: () => probe.destroy()
  };
}

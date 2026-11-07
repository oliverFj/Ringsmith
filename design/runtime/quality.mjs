/** Theme foundation checks. No browser, I/O or third-party dependency. */
import {BUTTON_DANGER_VARIANTS} from './library.mjs';
const clamp = value => Math.max(0, Math.min(1, value));
const linear = value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
const encoded = value => value <= .0031308 ? 12.92 * value : 1.055 * Math.max(0, value) ** (1 / 2.4) - .055;
const names = {black:'#000000',white:'#ffffff',red:'#ff0000',green:'#008000',blue:'#0000ff',yellow:'#ffff00',gray:'#808080',grey:'#808080',silver:'#c0c0c0',navy:'#000080',teal:'#008080',olive:'#808000',maroon:'#800000',purple:'#800080',lime:'#00ff00',aqua:'#00ffff',cyan:'#00ffff',fuchsia:'#ff00ff',magenta:'#ff00ff',orange:'#ffa500',rebeccapurple:'#663399',transparent:'#00000000'};
const number = (value, scale = 1) => value.endsWith('%') ? parseFloat(value) / 100 * scale : parseFloat(value);
const angle = value => value.endsWith('turn') ? parseFloat(value) * 360 : value.endsWith('grad') ? parseFloat(value) * .9 : value.endsWith('rad') ? parseFloat(value) * 180 / Math.PI : parseFloat(value);
/** sRGB output with alpha; null means that a critical role cannot be checked statically. */
export function parseColor(input) {
  if (typeof input !== 'string') return null;
  let value = input.trim().toLowerCase();
  value = names[value] ?? value;
  if (/^#[a-f0-9]{3,4}$/.test(value)) value = '#' + [...value.slice(1)].map(c => c + c).join('');
  if (/^#[a-f0-9]{6}([a-f0-9]{2})?$/.test(value)) return [1,3,5].map(i => parseInt(value.slice(i,i+2),16)/255).concat(value.length === 9 ? parseInt(value.slice(7),16)/255 : 1);
  const match = /^(rgb|rgba|hsl|hsla|oklch|oklab|color)\((.+)\)$/.exec(value);
  if (!match) return null;
  const kind = match[1], groups = match[2].split('/'), channels = groups[0].trim().split(/[ ,]+/);
  let alpha = groups[1] ? number(groups[1].trim()) : channels.length === 4 && kind !== 'color' ? number(channels.pop()) : 1;
  let rgb;
  if (kind === 'rgb' || kind === 'rgba') rgb = channels.map(c => number(c,255)/255);
  else if (kind === 'color' && channels.shift() === 'srgb') rgb = channels.map(c => number(c));
  else if (kind === 'hsl' || kind === 'hsla') {
    const hue = ((angle(channels[0]) % 360) + 360) % 360 / 30, s = number(channels[1]), l = number(channels[2]);
    const a = s * Math.min(l,1-l);
    rgb = [0,8,4].map(n => { const k = (n+hue)%12; return l-a*Math.max(-1,Math.min(k-3,9-k,1)); });
  } else if (kind === 'oklab' || kind === 'oklch') {
    const L = number(channels[0]), second = number(channels[1],.4), third = kind === 'oklch' ? angle(channels[2])*Math.PI/180 : number(channels[2],.4);
    const a = kind === 'oklch' ? second*Math.cos(third) : second, b = kind === 'oklch' ? second*Math.sin(third) : third;
    const l = (L+.3963377774*a+.2158037573*b)**3, m = (L-.1055613458*a-.0638541728*b)**3, s = (L-.0894841775*a-1.2914855480*b)**3;
    rgb = [4.0767416621*l-3.3077115913*m+.2309699292*s,-1.2684380046*l+2.6097574011*m-.3413193965*s,-.0041960863*l-.7034186147*m+1.7076147010*s].map(encoded);
  }
  if (rgb?.length !== 3 || [...rgb,alpha].some(v => !Number.isFinite(v))) return null;
  return [...rgb.map(clamp),clamp(alpha)];
}
export function compositeColor(foreground, background) {
  const a = foreground[3] + background[3]*(1-foreground[3]);
  return [0,1,2].map(i => a ? (foreground[i]*foreground[3]+background[i]*background[3]*(1-foreground[3]))/a : 0).concat(a);
}
export function contrastRatio(foreground, background) {
  const bg = typeof background === 'string' ? parseColor(background) : background;
  const fg = typeof foreground === 'string' ? parseColor(foreground) : foreground;
  if (!fg || !bg || bg[3] !== 1) return null;
  const paint = compositeColor(fg,bg);
  const luminance = color => .2126*linear(color[0])+.7152*linear(color[1])+.0722*linear(color[2]);
  const a = luminance(paint), b = luminance(bg);
  return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
}

/** Bounded CSS gradients: explicit opaque sRGB stops from 0% to 100%. */
export function parseGradient(value) {
  if(typeof value!=='string')return null;
  const match=/^(linear|radial)-gradient\((.+)\)$/.exec(value.trim());
  if(!match)return null;
  const parts=[];let depth=0,start=0;
  for(let i=0;i<match[2].length;i++){
    const character=match[2][i];if(character==='(')depth++;if(character===')'&&--depth<0)return null;
    if(character===','&&depth===0){parts.push(match[2].slice(start,i).trim());start=i+1;}
  }
  if(depth!==0)return null;
  parts.push(match[2].slice(start).trim());
  const rawHeader=parts.shift(),header=rawHeader.replace(/ in srgb$/,'');
  if(match[1]==='linear'?!/^(?:-?(?:\d*\.)?\d+(?:deg|turn|rad)|to (?:(?:top|bottom)(?: (?:left|right))?|left|right))$/.test(header):!/^(?:circle|ellipse)(?: at (?:\d+(?:\.\d+)?%|center) (?:\d+(?:\.\d+)?%|center))?$/.test(header))return null;
  if(parts.length<2||parts.length>8)return null;
  const colors=[];let previous=-1;
  for(const part of parts){
    const stop=/^(.+)\s+(\d+(?:\.\d+)?)%$/.exec(part);
    if(!stop||/[;{}@<>\\]/.test(stop[1]))return null;
    const position=Number(stop[2]),color=parseColor(stop[1]);
    if(!color||color[3]!==1||position<previous||position>100)return null;
    if(/^(?:oklch|oklab|color)\(/i.test(stop[1]))return null;
    previous=position;colors.push(color);
  }
  if(!/\s0(?:\.0+)?%$/.test(parts[0])||previous!==100)return null;
  return {colors,css:match[1]+'-gradient('+header+' in srgb, '+parts.join(', ')+')'};
}

/** Conservative bounds cover the full gradient, including colors between stops.
 * A channel-wise bound can reject a safe gradient; it cannot certify only its endpoints. */
export function gradientContrastRatio(foreground, gradient) {
  const fg=typeof foreground==='string'?parseColor(foreground):foreground;
  const paint=typeof gradient==='string'?parseGradient(gradient):gradient;
  if(!fg||fg[3]!==1||!paint?.colors)return null;
  const luminance=color=>.2126*linear(color[0])+.7152*linear(color[1])+.0722*linear(color[2]);
  const lower=luminance([0,1,2].map(channel=>Math.min(...paint.colors.map(color=>color[channel]))));
  const upper=luminance([0,1,2].map(channel=>Math.max(...paint.colors.map(color=>color[channel]))));
  const text=luminance(fg);
  return text<lower?(lower+.05)/(text+.05):text>upper?(text+.05)/(upper+.05):1;
}
export const THEME_CONTRAST_PAIRS = Object.freeze([
  ['color.text.primary','color.background.canvas'], ['color.text.secondary','color.background.canvas'],
  ['color.text.primary','color.background.surface'], ['color.text.secondary','color.background.surface'],
  ['color.text.muted','color.background.surface'], ['color.text.label','color.background.surface'],
  ['color.text.primary','color.background.subtle'], ['color.text.secondary','color.background.subtle'],
  ['color.text.primary','color.background.control'], ['color.text.secondary','color.background.control'], ['color.text.muted','color.background.control'],
  ['color.text.primary','color.background.detail'], ['color.text.inverse','color.background.inverse'],
  ['color.action.primary.rest.text','color.action.primary.rest.surface'], ['color.action.selected.rest.text','color.action.selected.rest.surface'],
  ['color.status.dangerText','color.status.dangerSurface'], ['color.status.danger','color.background.control'],
  ['color.caption.text','color.caption.surface'], ['color.caption.labelText','color.caption.labelSurface'],
  ...['neutral','primary','secondary','selected','danger','accent'].flatMap(family=>['hover','active'].map(state=>['color.action.'+family+'.'+state+'.text','color.action.'+family+'.'+state+'.surface'])),
  ['color.focus','color.background.canvas',3], ['color.focus','color.background.surface',3], ['color.focus','color.background.control',3],
].map(pair => Object.freeze(pair)));
/** Test semantic foundations, not every possible product layout or appearance override. */
export function themeContrastReport(resolved) {
  const canvas = parseColor(resolved['color.background.canvas']);
  const surface = parseColor(resolved['color.background.surface']);
  return THEME_CONTRAST_PAIRS.filter(([fg,bg]) => fg in resolved && bg in resolved).map(([foreground,background,minimum=4.5]) => {
    let bg = parseColor(resolved[background]);
    if (bg && bg[3] < 1) {
      const under = background === 'color.background.surface' ? canvas : surface;
      bg = under ? compositeColor(bg,under) : null;
    }
    const ratio = contrastRatio(resolved[foreground],bg);
    return {foreground,background,minimum,ratio,passed:ratio !== null && ratio >= minimum};
  });
}
/** Required field boundaries. Decorative card/divider borders are not controls. */
export function controlBoundaryReport(resolved) {
  return ['color.background.control','color.background.surface','color.background.canvas'].map(background=>{
    const foreground='color.border.field',ratio=contrastRatio(resolved[foreground],resolved[background]),minimum=3;
    return {foreground,background,ratio,minimum,passed:ratio!==null&&ratio>=minimum,advisory:false,
      context:'Bindende minimum for bibliotekets synlige feltgrænser. Dekorative kanter er ikke omfattet.'};
  });
}

/** Effective native field recipes, including appearance variants. A strong token
 * alone must not let a local border/background override hide a field boundary.
 * Native checkbox/radio/range paint is controlled by the browser and is not
 * reported as if this static inspection could measure it.
 */
export function componentBoundaryReport(model,resolved) {
  const report=[],surface=parseColor(resolved['color.background.surface']),canvas=parseColor(resolved['color.background.canvas']);
  const resolve=value=>typeof value==='string'?value.replace(/\{([^}]+)\}/g,(_,id)=>String(resolved[id]??'')):value;
  // The combobox wrapper and the grid cells are containers; the native control
  // and the grid's temporary editor own their actual input boundaries.
  for(const [id,part]of [['input','root'],['select','root'],['field','control'],['choice-field','control'],['textarea','control'],['number-input','control'],['range-field','number'],['combobox','control'],['multiselect','control'],['date-picker','control'],['time-picker','control'],['file-upload','control'],['data-grid','editor']]){
    const component=model.components?.[id];if(!component?.parts?.[part])continue;
    const base={...(id==='field'?model.components.input?.parts.root?.styles:{}),...component.parts?.[part]?.styles};
    for(const [variant,treatment]of [['base',{}],...Object.entries(component.variants??{})]){
      for(const [state,condition]of [['idle',{}],...Object.entries(component.states??{}).filter(([state])=>state!=='disabled')]){
        const styles={...base,...(part==='root'?treatment.styles:treatment.parts?.[part]?.styles),...(part==='root'?condition.styles:condition.parts?.[part]?.styles)};
        const border=resolve(styles.border),width=resolve(styles.borderWidth)??String(border??'').split(/\s+/)[0];
        const style=resolve(styles.borderStyle)??String(border??'').split(/\s+/)[1];
        const color=resolve(styles.borderColor)??String(border??'').replace(/^\S+\s+\S+\s+/, '');
        const visible=style!=='none'&&style!=='hidden'&&Number.parseFloat(width)>0;
        let control=parseGradient(resolve(styles.background))??parseColor(resolve(styles.backgroundColor));
        if(control&&!control.colors&&control[3]<1)control=surface?compositeColor(control,surface):null;
        for(const [background,paint]of [['control',control],['surface',surface],['canvas',canvas]]){
          const ratio=visible?(paint?.colors?gradientContrastRatio(color,paint):contrastRatio(color,paint)):0,minimum=3;
          report.push({component:id,part,variant,state,foreground:'border',background,ratio,minimum,passed:ratio!==null&&ratio>=minimum});
        }
      }
    }
  }
  return report;
}
function pixels(value) {
  const match = /^(\d*\.?\d+)(px|rem|em)$/.exec(String(value));
  return match ? Number(match[1])*(match[2] === 'px' ? 1 : 16) : null;
}

/** Explicit foreground/background pairs in recipes, including variant/state combinations. */
export function componentContrastReport(model,resolved) {
  const report=[];
  const resolve=(value,styles,depth=0)=>{if(depth>8)return undefined;if(typeof value!=='string')return value;return value.replace(/\{([^}]+)\}/g,(_,id)=>String(resolved[id]??'')).replace(/var\((--ds-interaction-(?:hover|active)-(?:surface|text))\)/g,(_,id)=>String(resolve(styles[id],styles,depth+1)??''));};
  const canvas=parseColor(resolved['color.background.canvas']);
  for (const [id,component] of Object.entries(model.components??{})) {
    const textParts=new Set();
    const visit=node=>{if(node.part&&(node.text||['button','select','textarea','output'].includes(node.tag)||node.tag==='input'&&!['checkbox','radio','range','color'].includes(node.attrs?.type)))textParts.add(node.part);for(const child of node.children??[])visit(child);};
    if(component.preview)visit(component.preview);
    const variants=[['base',{}],...Object.entries(component.variants??{})];
    if(id==='button')for(const [variant,styles]of Object.entries(BUTTON_DANGER_VARIANTS))variants.push([variant+' / danger',{styles:{...component.variants?.[variant]?.styles,...styles}}]);
    const states=[['idle',{}],...Object.entries(component.states??{}).filter(([state])=>state!=='disabled')];
    for(const persistent of ['pressed','current'])if(component.states?.[persistent])for(const transient of ['hover','active'])if(component.states[transient]){
      const base=component.states[persistent], interaction=component.states[transient],parts={};
      for(const part of new Set([...Object.keys(base.parts??{}),...Object.keys(interaction.parts??{})]))parts[part]={styles:{...base.parts?.[part]?.styles,...interaction.parts?.[part]?.styles}};
      states.push([persistent+'+'+transient,{styles:{...base.styles,...interaction.styles},parts}]);
    }
    for(const [variant,treatment]of variants)for(const [state,stateTreatment]of states)for(const part of textParts){
      const root={...component.parts.root?.styles,...treatment.styles,...stateTreatment.styles};
      const styles=part==='root'?root:{...root,...component.parts[part]?.styles,...treatment.parts?.[part]?.styles,...stateTreatment.parts?.[part]?.styles};
      const gradient=parseGradient(resolve(styles.background,styles));
      if(styles.display==='none'||!styles.color||/^(inherit|transparent|initial|unset|revert|currentColor)$/.test(resolve(styles.color,styles))||(!gradient&&(!styles.backgroundColor||/^(inherit|transparent|initial|unset|revert)$/.test(resolve(styles.backgroundColor,styles)))))continue;
      const fg=parseColor(resolve(styles.color,styles));let bg=parseColor(resolve(styles.backgroundColor,styles));if(!gradient&&(!fg||!bg))continue;
      if(!gradient){if(bg[3]<1)bg=canvas?compositeColor(bg,canvas):null;if(bg?.[3]!==1)continue;}
      const font=String(resolve(styles.fontSize,styles)??''),weight=Number(resolve(styles.fontWeight,styles))||400,fontPx=pixels(font),minimum=fontPx!==null&&(fontPx>=24||(fontPx>=18.667&&weight>=700))?3:4.5;
      const ratio=gradient?gradientContrastRatio(fg,gradient):contrastRatio(fg,bg);report.push({component:id,part,variant,state,ratio,minimum,passed:ratio!==null&&ratio>=minimum});
    }
  }
  return report;
}

export function validateThemeQuality(model,resolved) {
  const errors=[];
  for (const id of ['color.background.canvas','color.background.surface','color.background.control','color.background.inverse']) {
    const color=parseColor(resolved[id]);
    if (!color || color[3] !== 1) errors.push('tokens.'+id+': foundational surface must be an opaque, measurable color (hex, rgb, hsl, oklab, oklch or color(srgb)).');
  }
  for (const check of themeContrastReport(resolved)) if (!check.passed) errors.push('tokens.'+check.foreground+' on '+check.background+': '+(check.ratio===null?'unmeasurable color':check.ratio.toFixed(2)+':1 contrast')+'; minimum '+check.minimum+':1.');
  for (const check of controlBoundaryReport(resolved)) if (!check.passed) errors.push('tokens.'+check.foreground+' on '+check.background+': '+(check.ratio===null?'unmeasurable field boundary':check.ratio.toFixed(2)+':1 field boundary contrast')+'; minimum '+check.minimum+':1.');
  for (const check of componentBoundaryReport(model,resolved)) if (!check.passed) errors.push('components.'+check.component+'.'+check.part+' ['+check.variant+'/'+check.state+'] on '+check.background+': '+(check.ratio===null?'unmeasurable field boundary':check.ratio.toFixed(2)+':1 field boundary contrast')+'; minimum '+check.minimum+':1.');
  for (const check of componentContrastReport(model,resolved)) if(!check.passed) errors.push('components.'+check.component+'.'+check.part+' ['+check.variant+'/'+check.state+']: '+(check.ratio===null?'unmeasurable contrast':check.ratio.toFixed(2)+':1 contrast')+'; minimum '+check.minimum+':1.');
  for (const [id,minimum] of [['size.control.height',24],['typography.size.body',14]]) {
    const size=pixels(resolved[id]);
    if (size===null || size < minimum) errors.push('tokens.'+id+': must be at least '+minimum+' CSS px; use px, rem or em (16px reference).');
  }
  if (typeof resolved['typography.lineHeight.body'] !== 'number' || resolved['typography.lineHeight.body'] < 1.4) errors.push('tokens.typography.lineHeight.body: reading text needs unitless line height of at least 1.4.');
  return errors;
}

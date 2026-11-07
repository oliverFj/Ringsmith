import {getComponents, brandAssetDataURL, resolveTokens} from './engine.mjs';
export { createLayout, generateAppShellCSS } from './layout.mjs';
export { mountPanelControls } from './panels.mjs';
export {resolveThemeMode,resolveThemeModeId,themeModeOptions,hasNamedThemeModes,createColorModePreference} from './theme-modes.mjs';
export { mountMenuControls } from './menus.mjs';
export {mountTooltip,mountPopover,mountDialog,mountDrawer} from './overlays.mjs';
import {normalizeNavigationPreview} from './navigation.mjs';
export {mountTabs} from './navigation.mjs';
import {normalizeDataGridPreview} from './data-grid.mjs';
export {mountDataGrid,parseGridTSV,serializeGridTSV} from './data-grid.mjs';
import {normalizeFeedbackPreview} from './feedback.mjs';
import {normalizeFileUploadPreview} from './uploads.mjs';
export {mountToast} from './feedback.mjs';
export {mountFileUpload,validateFileSelection} from './uploads.mjs';
import {normalizeDataTablePreview} from './data-table.mjs';
export {mountDataTable} from './data-table.mjs';
import {normalizeInputChoicePreview} from './input-choices.mjs';
import {normalizeRangeFieldPreview,rangeNumberCharacters} from './range-field.mjs';
export {mountRangeField} from './range-field.mjs';
export {mountCombobox,mountMultiselect} from './input-choices.mjs';
export { animateStandard, animateThemed, STANDARD_MOTION } from './motion.mjs';
import {COMPONENT_LIBRARY, canonicalComponentId, canonicalVariantId, canonicalStateId, canonicalPartId} from './library.mjs';
import { BUTTON_SIZES } from './library.mjs';
import {FJORDSIDE_SIGNATURE} from './signature-assets.mjs';
import {contrastRatio} from './quality.mjs';
import { iconModel, createIcon } from './icons.mjs';
export { createIcon, renderIcon, ICON_NAMES, TABLER_VERSION } from './icons.mjs';
import { renderGraphic, createGraphicRenderer } from './graphics.mjs';
export { GRAPHIC_FAMILIES, GRAPHIC_MOTIFS, GRAPHIC_MOTION, getGraphicFamily, getGraphicParts, renderGraphic, createGraphic, createGraphicRenderer, mountGraphicMotion } from './graphics.mjs';

const tags=new Set(['a','nav','figure','figcaption','div','span','p','strong','label','button','input','select','optgroup','option','h1','h2','h3','h4','h5','h6','hr','section','article','header','footer','dialog','textarea','ul','ol','li','img','dl','dt','dd','fieldset','legend','output','details','summary','table','caption','thead','tbody','tr','th','td','progress']);
const inputTypes=new Set(['button','submit','reset','text','email','number','password','checkbox','radio','search','tel','url','range','color','date','time','file']);
const booleans=new Set(['disabled','checked','selected','multiple','required','readOnly','readonly','hidden','open']);
const voidTags=new Set(['input','hr','img']);
const safeAttribute=name=>booleans.has(name)||['href','src','alt','id','for','name','label','type','value','placeholder','min','max','step','rows','cols','inputmode','minlength','maxlength','autocomplete','role','title','tabindex','draggable','accept','scope','colspan','rowspan'].includes(name)||/^aria-[a-z-]+$/.test(name)||/^data-[a-z-]+$/.test(name);
// URLs are checked before either HTML serialization or native DOM construction.
function safeURL(value, image=false){
 const url=String(value).trim();
 if(/[\u0000-\u0020\u007f\\]/.test(url.replace(/ /g,'')))throw new Error('Unsupported component URL.');
 const scheme=url.match(/^([a-z][a-z0-9+.-]*):/i)?.[1]?.toLowerCase();
 if(scheme&&!((image?['http','https','blob']:['http','https','mailto','tel']).includes(scheme)||(image&&/^data:image\/(png|jpeg|gif|webp|svg\+xml)[;,]/i.test(url))))throw new Error('Unsupported component URL.');
 return url;
}
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/** Offline sample illustrations using the selected theme's resolved palette. */
export function createImageExamples(pack){
 const graphics=createGraphicRenderer(pack);
 return [
  ['focus','Fokus','Ét tydeligt tyngdepunkt får plads.'],
  ['poster','Form og hensigt','En større komposition om hensigt og form.'],
  ['relation','Relation','Selvstændige dele har en synlig forbindelse.'],
  ['rhythm','Rytme','Gentagelse med en begrundet variation.']
 ].map(([motif,title,alt])=>({title,alt,src:'data:image/svg+xml,'+encodeURIComponent(graphics.render(motif,{resolved:true,idPrefix:'ds-image-example-'+motif}))}));
}
let sequence=0;
function attributes(attrs={}){
 const result={};
 for(const [key,value]of Object.entries(attrs)){
  if(!safeAttribute(key))throw new Error('Unsupported component attribute: '+key);
  if(key==='type'&&!inputTypes.has(value))throw new Error('Unsupported native input type: '+value);
  if(key==='href'||key==='src'){result[key]=safeURL(value,key==='src');continue;}
  if(key==='draggable'){if(![true,false,'true','false'].includes(value))throw new Error('Boolean draggable attribute required.');result[key]=String(value);}
  else if(booleans.has(key)){if(typeof value!=='boolean')throw new Error('Boolean component attribute required: '+key);if(value)result[key==='readOnly'?'readonly':key]=true;}
  else {if(!['string','number'].includes(typeof value))throw new Error('Text component attribute required: '+key);result[key]=String(value);}
 }
 return result;
}
function prefix(options){return String(options.idPrefix??'ds-component-'+(++sequence)).replace(/[^a-zA-Z0-9_-]/g,'-').slice(0,100)||'ds-component-'+(++sequence);}
function model(pack,id,options,components,depth=0){
 if(depth>12)throw new Error('Component composition exceeds maximum depth 12.');
 if(pack.schemaVersion===2)id=canonicalComponentId(id);
 const component=components[id];if(!component)throw new Error('Unknown shared component: '+id);
 if(id==='signature'&&options.name!==undefined&&!String(options.name).trim())throw new Error('Signature requires a non-empty name.');
 const standardContent=['avatar','avatar-group'].includes(id)&&(pack.schemaVersion===2||Object.entries(COMPONENT_LIBRARY[id].parts).every(([partId,part])=>component.parts[partId]?.selector===part.selector));
 const sharedFeedback=['spinner','progress','skeleton','toast','empty-state'].includes(id)&&(pack.schemaVersion===2||Object.entries(COMPONENT_LIBRARY[id].parts).every(([partId,part])=>component.parts[partId]?.selector===part.selector));
 const sharedFileChoice=id==='file-upload'&&(pack.schemaVersion===2||Object.entries(COMPONENT_LIBRARY[id].parts).every(([partId,part])=>component.parts[partId]?.selector===part.selector));
 const navigationComponent=['tabs','accordion','breadcrumb','pagination'].includes(id)&&(pack.schemaVersion===2||Object.entries(COMPONENT_LIBRARY[id].parts).every(([partId,part])=>component.parts[partId]?.selector===part.selector));
 const newFormComponent=['textarea','number-input','field-group'].includes(id)&&(pack.schemaVersion===2||Object.entries(COMPONENT_LIBRARY[id].parts).every(([partId,part])=>component.parts[partId]?.selector===part.selector));
 const inputChoiceComponent=['combobox','multiselect','date-picker','time-picker'].includes(id)&&(pack.schemaVersion===2||Object.entries(COMPONENT_LIBRARY[id].parts).every(([partId,part])=>component.parts[partId]?.selector===part.selector));
 const sharedOverlay=['drawer','popover'].includes(id)&&(pack.schemaVersion===2||Object.entries(COMPONENT_LIBRARY[id].parts).every(([partId,part])=>component.parts[partId]?.selector===part.selector));
 const sharedGrid=id==='data-grid'&&(pack.schemaVersion===2||Object.entries(COMPONENT_LIBRARY[id].parts).every(([partId,part])=>component.parts[partId]?.selector===part.selector));
 const dialogLike=id==='dialog'||sharedOverlay&&id==='drawer',overlayWithParts=dialogLike||sharedOverlay;
 if(options.controlVariant!==undefined&&(!['field','choice-field'].includes(id)||options.controlVariant!=='desktop'))throw new Error('Unsupported control variant: '+options.controlVariant);
 let iconAsset;
 if(options.iconName!==undefined){
  if(!['button','list-item','action-button','menu-item','tag','segmented-option'].includes(id))throw new Error('iconName is only supported by button, list-item, action-button, menu-item, tag and segmented-option.');
  iconModel(options.iconName);
  if(options.icon!==undefined||options.iconAssetId!==undefined)throw new Error('Choose one icon source: iconName, icon or iconAssetId.');
 }
 if(id==='action-button'&&options.iconAssetId!==undefined){iconAsset=pack.brand?.assets?.find(asset=>asset.id===options.iconAssetId);if(!iconAsset||!iconAsset.mimeType.startsWith('image/'))throw new Error('Unknown approved icon image asset: '+options.iconAssetId);}
 const identifier=prefix(options), slots=Object.fromEntries(Object.entries(options.slots??{}).map(([key,value])=>[pack.schemaVersion===2?canonicalPartId(id,key):key,value]));
 if(id==='list-item'){
  if(options.current!==undefined&&typeof options.current!=='boolean')throw new Error('List item current must be a boolean.');
  if(options.iconName!==undefined&&Object.hasOwn(slots,'leading'))throw new Error('Choose one list item leading source: iconName or slots.leading.');
  if(options.text!==undefined||options.label!==undefined)slots.heading??=String(options.text??options.label);
  if(options.description!==undefined)slots.description??=String(options.description);
  else if(Object.hasOwn(slots,'heading'))slots.description??='';
 }
 if(id==='action-button'){if(options.icon!==undefined)slots.icon=options.icon;if(options.shortcut!==undefined)slots.shortcut=String(options.shortcut);}
 if(id==='brand-mark'&&pack.brand?.logos?.length){
  const logo=options.logoId?pack.brand.logos.find(logo=>logo.id===options.logoId):pack.brand.logos[0];
  if(!logo)throw new Error('Unknown approved brand logo: '+options.logoId);
  const asset=pack.brand.assets.find(asset=>asset.id===logo.asset);
  return {tag:'div',attrs:{class:component.parts.root.selector.slice(1)},children:[{tag:'img',attrs:{class:'ds-brand-mark__asset',src:brandAssetDataURL(asset),alt:logo.name},children:[]}]};
 }
 let variant=options.variant??component.preview?.variant??['default','primary','neutral','horizontal'].find(key=>Object.hasOwn(component.variants,key));
 if(pack.schemaVersion===2&&variant)variant=canonicalVariantId(id,variant);
 if(variant&&!Object.hasOwn(component.variants,variant))throw new Error('Unknown component variant: '+id+'.'+variant);
 if(id==='tag'&&options.pressed!==undefined)variant=options.pressed?'selected':'default';
 if(id==='action-button'&&variant==='icon-only'&&(options.iconName!==undefined||options.icon!==undefined||options.iconAssetId!==undefined)&&!String(options.label??options.text??options.attrs?.['aria-label']??'').trim())throw new Error('Icon-only action-button requires an accessible name.');
 const buttonLike=['button','action-button'].includes(id);
 if(buttonLike&&options.size!==undefined&&!Object.hasOwn(BUTTON_SIZES,options.size))throw new Error('Unknown button size: '+options.size);
 if(buttonLike&&options.intent!==undefined&&!['normal','danger'].includes(options.intent))throw new Error('Unknown button intent: '+options.intent);
 if(id==='action-button'&&options.emphasis!==undefined&&!['primary','secondary','tertiary','ghost'].includes(options.emphasis))throw new Error('Unknown button emphasis: '+options.emphasis);
 if(buttonLike&&options.intent==='danger'&&(options.emphasis??variant)==='secondary')throw new Error('Danger requires primary, tertiary or ghost emphasis.');
 const stateList=Array.isArray(options.state)?options.state:[options.state];
 const loading=buttonLike&&(options.loading||stateList.includes('loading'));
 const unavailable=Boolean(options.disabled||stateList.includes('disabled')||loading);
 if(id==='button'&&options.icon!==undefined)slots.icon=String(options.icon);
 if(id==='button'&&options.iconOnly&&!String(options.label??options.attrs?.['aria-label']??options.text??'').trim())throw new Error('Icon-only button requires an accessible name.');
 if(id==='button'&&options.iconOnly&&options.icon===undefined&&options.iconName===undefined&&!slots.icon)throw new Error('Icon-only button requires an icon.');
 const formField=['field','choice-field','range-field'].includes(id)||newFormComponent&&['textarea','number-input'].includes(id)||inputChoiceComponent;
 const sharedRange=id==='range-field'&&(pack.schemaVersion===2||Object.entries(COMPONENT_LIBRARY[id].parts).every(([partId,part])=>component.parts[partId]?.selector===part.selector));
 if(sharedRange&&options.type!==undefined&&options.type!=='range')throw new Error('Range field requires native type=range.');
 const preciseRange=sharedRange&&variant==='with-input';
 const formChoice=['checkbox','radio','switch'].includes(id);
 const fieldGroup=newFormComponent&&id==='field-group';
 const describedForm=formField||formChoice||fieldGroup;
 if(options.error&&describedForm&&!preciseRange)variant='invalid';
 const invalid=describedForm&&(Boolean(options.error)||variant==='invalid'||stateList.includes('invalid'));
 const findPreviewPart=(node,part)=>node?.part===part?node:(node?.children??[]).map(child=>findPreviewPart(child,part)).find(Boolean);
 const error=options.error??slots.error??findPreviewPart(component.preview,'error')?.text;
 const hasError=invalid&&(typeof error==='string'?Boolean(error.trim()):error!==undefined);
 const hint=options.hint??slots.hint??findPreviewPart(component.preview,'hint')?.text;
 const hasHint=typeof hint==='string'?Boolean(hint.trim()):hint!==undefined;
 function visit(source,root=false,slotApplied=false,nodeDepth=0){
  if(nodeDepth>12)throw new Error('Component tree exceeds maximum depth 12.');
  if(typeof source==='string')return {tag:'span',text:source,attrs:{},children:[]};
  if(source?.component){
   const composed=model(pack,source.component,source.options??{},components,depth+1);
   if(source.part){if(!Object.hasOwn(component.parts,source.part))throw new Error('Unknown composition part: '+id+'.'+source.part);composed.attrs.class+=' '+component.parts[source.part].selector.slice(1);}
   return composed;
  }
  if(!source||typeof source!=='object'||Array.isArray(source))throw new Error('Expected a declarative component node.');
  let node=structuredClone(source);
  if(!tags.has(node.tag))throw new Error('Unsupported component tag: '+node.tag);
  if(node.part&&!Object.hasOwn(component.parts,node.part))throw new Error('Unknown component part: '+id+'.'+node.part);
  const part=node.part;
  if(!slotApplied&&part&&Object.hasOwn(slots,part)){
   delete node.iconName;
   const slot=slots[part];
   if(typeof slot==='string'){node.text=slot;delete node.children;}
   else if(Array.isArray(slot)||slot?.component){node.children=Array.isArray(slot)?slot:[slot];delete node.text;if(node.tag==='p'||/^h[1-6]$/.test(node.tag))node.tag='div';}
   else if(slot&&typeof slot==='object'){node={...slot,part};}
   else throw new Error('Expected text or declarative nodes in component slot '+part);
  }
  if(!tags.has(node.tag))throw new Error('Unsupported component tag: '+node.tag);
  if(root&&options.text!==undefined&&!['action-button','signature','list-item'].includes(id)&&!(id==='button'&&(options.icon!==undefined||options.iconName!==undefined||slots.icon!==undefined||options.iconOnly||loading))&&!(['tag','segmented-option'].includes(id)&&options.iconName!==undefined)){node.text=String(options.text);delete node.children;}
  const suppliedAttrs={...node.attrs,...(root&&!dialogLike?options.attrs:{})};
  if(id==='action-button'&&Object.hasOwn(suppliedAttrs,'src'))throw new Error('Unsupported component attribute: src');
  const attrs=attributes(suppliedAttrs);
  if(sharedFeedback){
   if(root&&id==='skeleton'){attrs['aria-hidden']='true';delete attrs.role;delete attrs.tabindex;}
   if(['toast','empty-state'].includes(id)&&['title','body'].includes(part))attrs.id=identifier+'-'+part;
   if(id==='progress'&&part==='label')attrs.for=identifier+'-progress';
   if(id==='progress'&&part==='control'){
    if(node.tag!=='progress')throw new Error('Progress requires a native progress element.');
    const normalized=findPreviewPart(preview,'control').attrs;
    Object.assign(attrs,normalized);if(normalized.value===undefined)delete attrs.value;
   }
  }
  if(sharedFileChoice){
   if(part==='label')attrs.for=identifier+'-files';
   if(['hint','error','status'].includes(part)){
    attrs.id=identifier+'-'+part;
    if(['hint','error'].includes(part)){if(findPreviewPart(preview,part).attrs.hidden)attrs.hidden=true;else delete attrs.hidden;}
   }
   if(part==='control'){
    if(node.tag!=='input')throw new Error('file-upload requires a native file input.');
    if(attrs.value!==undefined)throw new Error('File inputs cannot be prefilled.');
    attrs.type='file';attrs.id=identifier+'-files';
    const normalized=findPreviewPart(preview,'control').attrs;
    for(const name of ['accept','multiple']){if(normalized[name]!==undefined)attrs[name]=normalized[name];else delete attrs[name];}
    const described=new Set((attrs['aria-describedby']??'').split(/\s+/).filter(Boolean));
    for(const name of ['hint','error'])if(!findPreviewPart(preview,name).attrs.hidden)described.add(identifier+'-'+name);
    if(described.size)attrs['aria-describedby']=[...described].join(' ');
    if(!findPreviewPart(preview,'error').attrs.hidden)attrs['aria-invalid']='true';
   }
  }
  if(part)attrs.class=component.parts[part].selector.slice(1);
  if(root&&variant)attrs['data-variant']=variant;
  if(root&&buttonLike){
   if(options.size)attrs['data-size']=options.size;
   if(options.intent&&options.intent!=='normal')attrs['data-intent']=options.intent;
   if(id==='action-button'&&options.emphasis)attrs['data-emphasis']=options.emphasis;
   if(loading){attrs['aria-busy']='true';attrs['data-loading']='true';}
  }
  if(id==='action-button'&&part==='progress'&&!loading)attrs.hidden=true;
  if(id==='action-button'&&part==='icon'&&loading)attrs.hidden=true;
  if(id==='button'){
   if(root){
    const href=options.href??attrs.href;
    if(href!==undefined){node.tag='a';delete attrs.type;if(unavailable){delete attrs.href;attrs.role='link';attrs['aria-disabled']='true';attrs.tabindex='-1';}else attrs.href=safeURL(href);}
    if(options.icon!==undefined||options.iconName!==undefined||slots.icon!==undefined){attrs['data-has-icon']='true';}
    if(options.iconOnly){attrs['data-icon-only']='true';attrs['aria-label']=String(options.label??options.attrs?.['aria-label']??options.text);}
    if(loading){attrs['aria-busy']='true';attrs['data-loading']='true';}
   }
   if(part==='heading'&&(options.text!==undefined||options.label!==undefined))node.text=String(options.text??options.label);
   if(part==='heading'&&options.iconOnly)attrs.hidden=true;
   if(part==='icon'&&((options.icon===undefined&&options.iconName===undefined&&slots.icon===undefined)||loading))attrs.hidden=true;
   if(part==='progress'&&!loading)attrs.hidden=true;
  }
  if(id==='list-item'){
   if(root){
    const href=options.href??attrs.href;
    if(href!==undefined){node.tag='a';delete attrs.type;if(unavailable){delete attrs.href;attrs.role='link';attrs['aria-disabled']='true';attrs.tabindex='-1';}else attrs.href=safeURL(href);}
    if(!attrs['aria-label'])attrs['aria-labelledby']??=identifier+'-heading';
    const described=new Set((attrs['aria-describedby']??'').split(/\s+/).filter(Boolean));
    if((slots.description??findPreviewPart(component.preview,'description')?.text)!=='')described.add(identifier+'-description');
    if(Object.hasOwn(slots,'trailing')&&slots.trailing!=='')described.add(identifier+'-trailing');
    if(described.size)attrs['aria-describedby']=[...described].join(' ');
   }
   if(part==='heading')attrs.id=identifier+'-heading';
   if(part==='description'){attrs.id=identifier+'-description';if(slots.description==='')attrs.hidden=true;}
   if(part==='leading'){if(options.iconName!==undefined)node.iconName=options.iconName;else if(!Object.hasOwn(slots,'leading')||slots.leading==='')attrs.hidden=true;}
   if(part==='trailing'){attrs.id=identifier+'-trailing';if(!Object.hasOwn(slots,'trailing')||slots.trailing==='')attrs.hidden=true;}
  }
  if(root&&id==='link'&&options.href!==undefined)attrs.href=safeURL(options.href);
  if(id==='signature'){
   const identity=options.identity===undefined?null:options.identity==='fjordside'?FJORDSIDE_SIGNATURE:null;
   if(options.identity!==undefined&&!identity)throw new Error('Unknown signature identity: '+options.identity);
   if(root){
    node.tag='a';
    attrs.href=safeURL(options.href??identity?.href??attrs.href);
    if(identity)attrs['data-identity']='fjordside';
    if(unavailable){node.tag='span';delete attrs.href;attrs.role='link';attrs['aria-disabled']='true';attrs.tabindex='-1';}
   }
   if(part==='name')node.text=String(options.name??identity?.name??node.text);
   if(part==='logo'&&(options.logoSrc||identity)){
    let src=options.logoSrc;
    if(!src){
     const colors=resolveTokens(pack),background=colors[['quiet','compact'].includes(variant)?'color.background.canvas':'color.background.control'];
     const backgrounds=[background,colors['color.action.neutral.hover.surface'],colors['color.action.neutral.active.surface']];
     const tone=options.logoTone??['ink','paper'].sort((a,b)=>Math.min(...backgrounds.map(bg=>contrastRatio(a==='ink'?'#26221e':'#edeae3',bg)??0))-Math.min(...backgrounds.map(bg=>contrastRatio(b==='ink'?'#26221e':'#edeae3',bg)??0))).at(-1);
     if(!Object.hasOwn(identity.logos,tone))throw new Error('Unknown signature logo tone: '+tone);
     src=identity.logos[tone];
    }
    node.tag='img';attrs.src=safeURL(src,true);attrs.alt='';delete attrs['aria-hidden'];delete node.text;delete node.children;
   }
  }
  if(id==='image'&&part==='media'){
   attrs.src=safeURL(options.src??attrs.src??('data:image/svg+xml,'+encodeURIComponent(renderGraphic(pack,'focus',{resolved:true,idPrefix:'ds-image-example-focus'}))),true);
   if(options.alt!==undefined)attrs.alt=String(options.alt);
   if(options.src!==undefined&&options.alt===undefined)throw new Error('Image source requires an explicit alt text (empty for decoration).');
  }
  if(id==='image'&&part==='caption'&&options.caption!==undefined){node.text=String(options.caption);if(options.caption==='')attrs.hidden=true;}
  if(!root&&node.variant)attrs['data-variant']=node.variant;
  if(root&&options.state){const states=(Array.isArray(options.state)?options.state:[options.state]).map(state=>pack.schemaVersion===2?canonicalStateId(id,state):state);for(const state of states)if(!Object.hasOwn(component.states,state))throw new Error('Unknown component state: '+state);if(id!=='tree'){attrs['data-state']=states.join(' ');if(states.includes('selected'))attrs['aria-selected']='true';if(states.includes('pressed'))attrs['aria-pressed']='true';if(states.includes('expanded'))attrs['aria-expanded']='true';if(states.includes('loading'))attrs['aria-busy']='true';}}
  if(sharedRange){
   const readonly=Boolean(options.readOnly??options.readonly)||stateList.includes('readOnly');
   if(root&&preciseRange){if(invalid)attrs['data-state']=[...new Set((attrs['data-state']??'').split(/\s+/).filter(Boolean).concat('invalid'))].join(' ');if(readonly)attrs['data-readonly']='true';}
   if(part==='label')attrs.id=identifier+'-label';
   if(part==='control'||part==='number'){
    if(node.tag!=='input')throw new Error('Range field controls require native inputs.');
    attrs.type=part==='control'?'range':'number';
    attrs.id=identifier+(part==='number'?'-number':'-control');attrs['aria-labelledby']=identifier+'-label';
    if(part==='number'){delete attrs.name;if(readonly)attrs.readonly=true;}
    if(preciseRange&&readonly&&part==='control'){attrs.disabled=true;delete attrs.readonly;}
   }
  }
  if(root&&id==='list-item'&&(options.current!==undefined||stateList.includes('current'))){
   const current=options.current??true;attrs['aria-current']=String(current);
   const states=new Set((attrs['data-state']??'').split(/\s+/).filter(Boolean));if(current)states.add('current');else states.delete('current');
   if(states.size)attrs['data-state']=[...states].join(' ');else delete attrs['data-state'];
  }
  if(newFormComponent&&part==='control'&&id==='textarea'&&node.tag!=='textarea')throw new Error('textarea requires a native textarea control.');
  if(newFormComponent&&part==='control'&&id==='number-input'&&node.tag!=='input')throw new Error('number-input requires a native input control.');
  if(inputChoiceComponent&&part==='control'&&node.tag!=='input')throw new Error(id+' requires a native input control.');
  const nativeControl=['input','select','textarea'].includes(node.tag);
  if(nativeControl){
   for(const key of ['name','value','placeholder','type','min','max','step','rows','cols','minlength','maxlength','inputmode','autocomplete'])if(options[key]!==undefined)Object.assign(attrs,attributes({[key]:String(options[key])}));
   for(const key of ['disabled','checked','required'])if(options[key]!==undefined){attributes({[key]:options[key]});if(options[key])attrs[key]=true;else delete attrs[key];}
   const supportsReadOnly=node.tag==='textarea'||node.tag==='input'&&!['checkbox','radio','range','button','submit','reset','color'].includes(attrs.type);
   const readOnly=options.readOnly??options.readonly??(stateList.includes('readOnly')?true:undefined);
   if(supportsReadOnly&&readOnly!==undefined){attributes({readonly:readOnly});if(readOnly)attrs.readonly=true;else delete attrs.readonly;}
   if(root&&['input','select'].includes(id)){
    if(options.label!==undefined)attrs['aria-label']=String(options.label);
    else if(options.attrs?.['aria-labelledby'])delete attrs['aria-label'];
    if(options.error||variant==='invalid')attrs['aria-invalid']='true';
   }
   if(newFormComponent&&id==='number-input'&&part==='control'){
    if(options.type!==undefined&&options.type!=='number')throw new Error('number-input requires native type=number.');
    if(node.tag!=='input')throw new Error('number-input requires a native input control.');
    attrs.type='number';
   }
   if(inputChoiceComponent&&part==='control'){
    attrs.value=findPreviewPart(preview,'control').attrs.value;
    attrs.type=id==='date-picker'?'date':id==='time-picker'?'time':'text';
    if(id==='combobox'||id==='multiselect')Object.assign(attrs,{role:'combobox','aria-autocomplete':'list','aria-haspopup':'listbox','aria-expanded':'false','aria-controls':identifier+'-listbox'});
   }
  }
  if(sharedRange&&(part==='control'||part==='number')){attrs.type=part==='control'?'range':'number';if(part==='number')delete attrs.name;}
  if(node.tag==='button'){
   attrs.type??='button';
   if(options.disabled!==undefined){if(options.disabled)attrs.disabled=true;else delete attrs.disabled;}
   if(root&&loading)attrs.disabled=true;
  }
  if(id!=='tree'&&!(navigationComponent&&id==='tabs')&&(nativeControl||node.tag==='button')&&(Array.isArray(options.state)?options.state:[options.state]).includes('disabled'))attrs.disabled=true;
  if(root&&options.disabled)attrs['aria-disabled']='true';
  if(id==='action-button'&&part==='label'&&(options.label!==undefined||options.text!==undefined))node.text=String(options.label??options.text);
  if(id==='action-button'&&['icon','shortcut'].includes(part)&&(Object.hasOwn(options,'label')||Object.hasOwn(options,'text'))&&!Object.hasOwn(options,part)&&!Object.hasOwn(slots,part)&&!(part==='icon'&&(iconAsset||options.iconName!==undefined))){attrs.hidden=true;delete node.text;delete node.children;}
  if(id==='action-button'&&part==='shortcut'&&node.text===''&&!node.children?.length)attrs.hidden=true;
  if(root&&['button','action-button','tag','segmented-option'].includes(id)&&options.pressed!==undefined){
   attrs['aria-pressed']=String(Boolean(options.pressed));
   const states=new Set((attrs['data-state']??'').split(/\s+/).filter(Boolean));
   if(options.pressed)states.add('pressed');else states.delete('pressed');
   if(states.size)attrs['data-state']=[...states].join(' ');else delete attrs['data-state'];
  }
  if(root&&id==='tag'&&variant==='selected'&&options.pressed===undefined)attrs['aria-pressed']='true';
  if(root&&['toolbar','segmented-control'].includes(id)&&options.label!==undefined){attrs.role='group';attrs['aria-label']=String(options.label);}
  if(root&&id==='action-button'&&variant==='icon-only')attrs['aria-label']??=String(options.label??options.text??'Tilføj');
  if(root&&id==='action-button'&&options.shortcut)attrs['aria-keyshortcuts']??=String(options.shortcut);
  if(part==='value'&&id==='range-field'){attrs.for=identifier+'-control';if(options.value!==undefined)node.text=String(options.value);}
  if(describedForm){
   if(part==='label'){attrs.for=identifier+'-control';if(options.label!==undefined)node.text=String(options.label);}
   if(formChoice&&part==='label'){delete attrs.for;attrs.id=identifier+'-label';}
   if(fieldGroup&&part==='legend'){attrs.id=identifier+'-legend';if(options.label!==undefined)node.text=String(options.label);}
   if(part==='control'||sharedRange&&part==='number'||fieldGroup&&root){
    attrs.id=identifier+(sharedRange&&part==='number'?'-number':'-control');
    if(formChoice)attrs['aria-labelledby']=identifier+'-label';
    if(fieldGroup){attrs['aria-labelledby']=identifier+'-legend';if(options.disabled||stateList.includes('disabled'))attrs.disabled=true;}
    if(options.controlVariant){
     if(!['input','select'].includes(node.tag))throw new Error('Desktop field controls require a native input or select.');
     attrs['data-variant']=options.controlVariant;
    }
    const described=(attrs['aria-describedby']??'').split(/\s+/).filter(Boolean);if(component.parts.hint&&hasHint)described.push(identifier+'-hint');if(hasError)described.push(identifier+'-error');
    if(described.length)attrs['aria-describedby']=[...new Set(described)].join(' ');
    if(invalid)attrs['aria-invalid']='true';
   }
   if(part==='hint'){attrs.id=identifier+'-hint';if(options.hint!==undefined)node.text=String(options.hint);if(!hasHint)attrs.hidden=true;}
   if(part==='error'){attrs.id=identifier+'-error';if(options.error!==undefined)node.text=String(options.error);if(!hasError)attrs.hidden=true;}
  }
  if(overlayWithParts&&part==='title'){attrs.id=identifier+'-title';if(options.title!==undefined)node.text=String(options.title);}
  if(overlayWithParts&&part==='body'){attrs.id=identifier+'-body';if(options.body!==undefined){node.text=String(options.body);delete node.children;}}
  if(root&&sharedOverlay&&id==='popover'){attrs['aria-labelledby']=identifier+'-title';if(options.describeBody!==false)attrs['aria-describedby']=identifier+'-body';}
  if(id==='alert'&&root)attrs.role=options.role??(variant==='danger'?'alert':'status');
  if(id==='tooltip'&&root){attrs.role='tooltip';attrs.id=identifier+'-tooltip';}
  if(id==='switch'&&part==='control')attrs.role='switch';
  if(node.tag==='textarea'&&options.value!==undefined){node.text=String(options.value);delete attrs.value;}
  // Only a bounded, computed integer reaches this internal variable; public style attributes stay rejected.
  if(preciseRange&&part==='number')attrs.style='--ds-range-number-chars:'+rangeNumberCharacters(attrs);
  let children=(node.children??[]).map(child=>visit(child,false,false,nodeDepth+1));
  if(node.iconName!==undefined){if(node.tag!=='span')throw new Error('Declarative icons require a span container.');delete node.text;children=[iconModel(node.iconName,{size:id==='action-button'?'medium':'small'})];}
  if(options.iconName!==undefined&&part===(id==='menu-item'?'symbol':'icon')){delete node.text;children=[iconModel(options.iconName,{size:options.iconSize??(id==='menu-item'?'small':'medium')})];}
  if(id==='action-button'&&part==='icon'&&iconAsset){delete node.text;children=[{tag:'img',attrs:{class:'ds-action-button__asset',src:brandAssetDataURL(iconAsset),alt:''},children:[]}];}
  if(node.tag==='select'&&options.value!==undefined){
   const selectOptions=nodes=>{for(const child of nodes){if(child.tag==='option'){delete child.attrs.selected;if((child.attrs.value??child.text)===String(options.value))child.attrs.selected=true;}else if(child.tag==='optgroup')selectOptions(child.children??[]);}};
   selectOptions(children);
  }
  if(voidTags.has(node.tag)&&(node.text!==undefined||children.length))throw new Error('Native void control cannot have children.');
  return {tag:node.tag,attrs,text:node.text,children};
 }
 let preview=component.preview??COMPONENT_LIBRARY[canonicalComponentId(id)]?.preview;
 if(sharedRange)preview=normalizeRangeFieldPreview(preview,options,preciseRange);
 // Shared input-choice preview normalization.
 if(inputChoiceComponent)preview=normalizeInputChoicePreview(id,preview,options,identifier);
 // Shared feedback and file-choice preview normalization.
 if(sharedFeedback)preview=normalizeFeedbackPreview(id,preview,options,identifier);
 if(sharedFileChoice)preview=normalizeFileUploadPreview(preview,options,identifier);
 // Shared data-table preview normalization.
 const standardDataTable=id==='data-table'&&(pack.schemaVersion===2||Object.entries(COMPONENT_LIBRARY[id].parts).every(([partId,part])=>component.parts[partId]?.selector===part.selector));
 if(standardDataTable)preview=normalizeDataTablePreview(preview,options,identifier);
 // Shared data-grid preview normalization.
 if(sharedGrid)preview=normalizeDataGridPreview(preview,options,identifier);
 // Shared content preview normalization.
 if(standardContent&&id==='avatar'){
  const name=String(options.name??options.label??'Anna Larsen').trim();
  if(!name)throw new Error('Avatar requires a non-empty accessible name.');
  const graphemes=value=>typeof Intl.Segmenter==='function'?[...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(value)].map(segment=>segment.segment):Array.from(value);
  const words=name.split(/\s+/),initials=options.initials===undefined?[words[0],...(words.length>1?[words.at(-1)]:[])].map(word=>graphemes(word)[0]).join('').toLocaleUpperCase():graphemes(String(options.initials).trim()).slice(0,2).join('');
  preview={tag:'span',part:'root',attrs:{role:'img','aria-label':name,'data-avatar':'true'},children:[{tag:'span',part:'initials',attrs:{'aria-hidden':'true'},text:initials||'?'}]};
  if(options.src!==undefined&&String(options.src).trim())preview.children.push({tag:'img',part:'image',attrs:{src:safeURL(options.src,true),alt:'','aria-hidden':'true','data-avatar-image':'true',hidden:true}});
 }
 if(standardContent&&id==='avatar-group'){
  preview=structuredClone(preview);
  if(options.label!==undefined)preview.attrs['aria-label']=String(options.label);
  if(!String(preview.attrs['aria-label']??'').trim())throw new Error('Avatar group requires an accessible name.');
  {
   const items=options.items??[{name:'Anna Larsen'},{name:'Mikkel Holm'},{name:'Sara Østergaard'}];
   if(!Array.isArray(items))throw new Error('Avatar group items must be an array.');
   preview.children=items.map((item,index)=>{
    if(!item||typeof item!=='object'||Array.isArray(item)||!String(item.name??item.label??'').trim())throw new Error('Each avatar group item requires a name.');
    return {tag:'li',part:'item',children:[{component:'avatar',options:{...item,idPrefix:identifier+'-avatar-'+index}}]};
   });
  }
 }
 if(['tag','segmented-option'].includes(id)&&options.iconName!==undefined){
  preview=structuredClone(preview);
  preview.children=[{tag:'span',part:'icon',attrs:{'aria-hidden':'true'}},{tag:'span',part:'label',text:String(options.text??options.label??preview.text??'')}];
  delete preview.text;
 }
 // Shared form preview normalization.
 if(fieldGroup){
  preview=structuredClone(preview);
  let childIndex=0;
  const identify=node=>{if(node.component){node.options={...node.options,idPrefix:node.options?.idPrefix??identifier+'-field-'+(++childIndex)};}for(const child of node.children??[])identify(child);};
  const body=slots.body;
  if(body&&typeof body==='object'){slots.body=structuredClone(body);for(const node of Array.isArray(slots.body)?slots.body:[slots.body])identify(node);}
  else identify(preview);
 }
 // Shared navigation preview normalization.
 if(navigationComponent){preview=normalizeNavigationPreview(id,preview,options,identifier);if(id==='tabs'&&options.orientation!==undefined)variant=options.orientation==='vertical'?'vertical':'default';}
 // Shared overlay preview normalization.
 const tree=visit(preview,true);
 if(standardDataTable)delete tree.attrs['aria-selected'];
 if(navigationComponent&&id==='tabs'||sharedGrid)delete tree.attrs['aria-selected'];
 if(id==='tree'&&options.state){const item=tree.children?.[0],states=Array.isArray(options.state)?options.state:[options.state];if(item){item.attrs['data-state']=states.join(' ');for(const state of ['selected','expanded','disabled'])if(states.includes(state))item.attrs['aria-'+state]='true';if(states.includes('disabled'))for(const child of item.children?.[0]?.children??[])if(child.tag==='button'){if(child.attrs.class===component.parts.label.selector.slice(1))child.attrs.disabled=true;else child.attrs['aria-disabled']='false';}}}
 if(dialogLike){
  const supplied=attributes(options.attrs);delete tree.attrs.id;
  return {tag:'dialog',attrs:{class:'ds-dialog-host'+(id==='drawer'?' ds-drawer-host':''),id:identifier+'-host',...(!supplied['aria-label']?{'aria-labelledby':identifier+'-title'}:{}),...(options.describeBody!==false?{'aria-describedby':identifier+'-body'}:{}),...supplied,...(id==='drawer'?{'data-side':variant??'end'}:{}),...(options.open?{open:true}:{})},children:[tree]};
 }
 return tree;
}
function serialize(node){
 const attrs=Object.entries(node.attrs??{}).map(([key,value])=>value===true?' '+key:' '+key+'="'+escape(value)+'"').join('');
 return '<'+node.tag+attrs+'>'+(voidTags.has(node.tag)?'':(node.text===undefined?'':escape(node.text))+(node.children??[]).map(serialize).join('')+'</'+node.tag+'>');
}
/** Safe HTML from the same shared declarative implementation used by createComponent.
 * options: variant, state, idPrefix, text, slots, attrs and native control values.
 * button: size (small/medium/large), intent (normal/danger), href, iconName (Tabler), legacy icon, iconOnly,
 * label and loading. list-item accepts text/label, description, iconName, href and current;
 * its leading/trailing slots contain non-interactive content. action-button accepts size, intent, emphasis and loading independently
 * of its orientation variant. tag/segmented-option accept iconName and pressed.
 * avatar accepts name, src and initials; avatar-group accepts label and items.
 * Native avatars bind image fallbacks automatically; HTML uses mountAvatarFallbacks.
 * Four new button levels coexist with legacy recipes.
 * field/choice-field accept controlVariant: 'desktop' independently of validation state.
 * slots accept escaped text, declarative nodes, arrays or {component, options}.
 * Dialog returns a native dialog host: call showModal()/close() in the product.
 */
export function renderComponent(pack,id,options={}) {return serialize(model(pack,id,options,getComponents(pack)));}
/** Render many specimens from one validated theme snapshot. */
export function createComponentRenderer(pack){const snapshot=structuredClone(pack),components=getComponents(snapshot);return(id,options={})=>serialize(model(snapshot,id,options,components));}
/** Build native DOM without innerHTML. Attach product event handlers to the returned node. */
export function createComponent(pack,id,options={}, {document=globalThis.document}={}) {
 if(!document?.createElement)throw new Error('createComponent requires a DOM document.');
 return createNative(model(pack,id,options,getComponents(pack)),document);
}
/** Build a product screen from one validated theme snapshot. Recreate after theme edits. */
export function createComponentFactory(pack,{document=globalThis.document}={}) {
 if(!document?.createElement)throw new Error('createComponentFactory requires a DOM document.');
 const snapshot=structuredClone(pack),components=getComponents(snapshot);
 return (id,options={})=>createNative(model(snapshot,id,options,components),document);
}
function createNative(tree,document) {
 function create(node,svg=false){
  svg ||= node.tag==='svg';
  const element=svg&&document.createElementNS?document.createElementNS('http://www.w3.org/2000/svg',node.tag):document.createElement(node.tag);
  for(const [name,value]of Object.entries(node.attrs??{}))element.setAttribute(name,value===true?'':value);
  if(node.text!==undefined)element.appendChild(document.createTextNode(String(node.text)));
  for(const child of node.children??[])element.appendChild(create(child,svg));
  if(node.attrs?.value!==undefined&&'value' in element)element.value=node.attrs.value;
  if(node.attrs?.['data-avatar']==='true')mountAvatarFallbacks(element);
  return element;
 }
 return create(tree);
}

const avatarImageBindings=new WeakMap();
/** Bind HTML-rendered avatar images. Initials remain available while loading or after failure. */
export function mountAvatarFallbacks(root){
 const images=[...(root?.matches?.('[data-avatar-image]')?[root]:[]),...(root?.querySelectorAll?.('[data-avatar-image]')??[])],owned=[];
 for(const image of images){
  if(avatarImageBindings.has(image))continue;
  const initials=image.parentNode?.querySelector('.ds-avatar__initials');
  const hidden=(node,value)=>{if(!node)return;node.hidden=value;if(value)node.setAttribute('hidden','');else node.removeAttribute('hidden');};
  const ready=()=>{hidden(image,false);hidden(initials,true);},failed=()=>{hidden(image,true);hidden(initials,false);};
  const loaded=()=>image.naturalWidth===0?failed():ready();
  image.addEventListener('load',loaded);image.addEventListener('error',failed);
  avatarImageBindings.set(image,true);owned.push([image,loaded,failed]);
  if(image.complete&&image.naturalWidth>0)ready();else failed();
 }
 return {destroy(){for(const [image,loaded,failed]of owned){image.removeEventListener('load',loaded);image.removeEventListener('error',failed);avatarImageBindings.delete(image);}owned.length=0;}};
}

/** Controlled hierarchical list. Product callbacks own selection, expansion,
 * context menus and accepted moves; keyed updates keep native controls alive.
 * Row actions are independent of item.disabled (which blocks selection/drag).
 */
export function mountTree(pack,host,options={}, {document=globalThis.document}={}){
 if(!document?.createElement||!host?.appendChild)throw new Error('mountTree requires a DOM host and document.');
 const component=getComponents(pack).tree;if(!component)throw new Error('The theme does not provide the shared tree component.');
 const element=document.createElement('ul'),identifier=prefix(options),records=new Map(),listeners=[];
 let config={},flat=[],visible=[],focusedId=null,anchorId=null,dragIds=[],dropId=null,dropPosition=null,typeText='',typeAt=0,nodeSequence=0,destroyed=false;
 const part=(tag,name)=>{const node=document.createElement(tag);node.setAttribute('class',component.parts[name].selector.slice(1));return node;};
 const attr=(node,name,value)=>{if(value===null||value===undefined)node.removeAttribute(name);else node.setAttribute(name,String(value));};
 const hidden=(node,value)=>{node.hidden=Boolean(value);if(value)node.setAttribute('hidden','');else node.removeAttribute('hidden');};
 const setIcon=(node,name,fallback='')=>{node.textContent='';if(name!==undefined)node.appendChild(createIcon(name,{size:'small'},{document}));else node.textContent=String(fallback);};
 const listen=(node,type,handler)=>{node.addEventListener(type,handler);listeners.push([node,type,handler]);};
 const unlisten=node=>{for(let i=listeners.length-1;i>=0;i--)if(listeners[i][0]===node){node.removeEventListener(listeners[i][1],listeners[i][2]);listeners.splice(i,1);}};
 const selected=()=>new Set(config.selectedIds??[]),expanded=()=>new Set(config.expandedIds??[]);
 const navigable=record=>!record.item.disabled||record.item.children?.length||record.item.actions?.some(action=>!action.disabled);
 const rowFor=node=>{while(node&&node!==element){const id=node.getAttribute?.('data-tree-id');if(id&&records.has(id))return records.get(id);node=node.parentNode;}return null;};
 function applyStops(){for(const record of records.values()){const active=record.id===focusedId&&visible.includes(record)&&navigable(record);attr(record.li,'tabindex',active?'0':'-1');for(const [id,button]of record.actionNodes)attr(button,'tabindex',active&&!record.item.actions.find(action=>action.id===id)?.disabled?'0':'-1');}attr(element,'tabindex',visible.some(navigable)?null:'0');}
 function focus(record){if(!record||!visible.includes(record)||!navigable(record))return;focusedId=record.id;applyStops();record.li.focus();}
 function propose(record,event,{toggle=false,range=false,fromId=null}={}){
  if(record.item.disabled)return;
  const multi=config.multiSelect!==false,ids=selected();
  if(multi&&range){const candidates=visible.filter(record=>!record.item.disabled),anchor=[anchorId,...ids,fromId,record.id].find(id=>candidates.some(record=>record.id===id)),first=candidates.findIndex(record=>record.id===anchor),last=candidates.indexOf(record);if(last<0)return;anchorId=anchor;ids.clear();for(const candidate of candidates.slice(Math.min(first,last),Math.max(first,last)+1))ids.add(candidate.id);}
  else if(multi&&toggle){ids.has(record.id)?ids.delete(record.id):ids.add(record.id);anchorId=record.id;}
  else{ids.clear();ids.add(record.id);anchorId=record.id;}
  config.onSelect?.([...ids],{id:record.id,item:record.item,event,toggle:multi&&toggle,range:multi&&range});
 }
 function toggle(record,event,value=!expanded().has(record.id)){if(record.item.children?.length)config.onToggle?.(record.id,value,{item:record.item,event});}
 function context(record,event){event.preventDefault();config.onContextMenu?.(record.id,{item:record.item,event,selectedIds:[...selected()]});}
 function clearDrop(){dropId=null;dropPosition=null;for(const record of records.values()){attr(record.li,'data-drop-position',null);paint(record);}}
 function paint(record){const states=[...(selected().has(record.id)?['selected']:[]),...(expanded().has(record.id)&&record.item.children?.length?['expanded']:[]),...(record.item.disabled?['disabled']:[]),...(dropId===record.id?['drop-target']:[])];attr(record.li,'data-state',states.length?states.join(' '):null);}
 function dropAt(record,event){
  if(!dragIds.length||record.item.disabled)return null;
  if(dragIds.some(id=>id===record.id||record.ancestors.includes(id)))return null;
  const target=record.item.dropTarget===true?{inside:true}:record.item.dropTarget;if(!target||typeof target!=='object')return null;
  const rect=record.row.getBoundingClientRect(),fraction=rect.height?(event.clientY-rect.top)/rect.height:.5;
  return fraction<.25&&target.before?'before':fraction>.75&&target.after?'after':target.inside?'inside':fraction<.5&&target.before?'before':target.after?'after':target.before?'before':null;
 }
 function createRecord(id){
  const li=part('li','item'),row=part('div','row'),fold=part('button','toggle'),spacer=part('span','spacer'),label=part('button','label'),icon=part('span','icon'),name=part('span','name'),meta=part('span','meta'),badge=part('span','badge'),actions=part('span','actions'),group=part('ul','group');
  const record={id,li,row,fold,spacer,label,icon,name,meta,badge,actions,group,actionNodes:new Map()};records.set(id,record);
  attr(li,'role','treeitem');attr(li,'data-tree-id',id);attr(li,'id',identifier+'-item-'+(++nodeSequence));attr(group,'role','group');attr(fold,'type','button');attr(fold,'tabindex','-1');attr(fold,'aria-disabled','false');attr(label,'type','button');attr(label,'tabindex','-1');attr(icon,'aria-hidden','true');attr(spacer,'aria-hidden','true');
  attr(name,'id',li.getAttribute('id')+'-name');attr(meta,'id',li.getAttribute('id')+'-meta');attr(li,'aria-labelledby',name.getAttribute('id'));
  label.appendChild(icon);label.appendChild(name);for(const child of [fold,spacer,label,meta,badge,actions])row.appendChild(child);li.appendChild(row);li.appendChild(group);
  listen(label,'click',event=>{event.stopPropagation();focus(record);propose(record,event,{toggle:Boolean(event.ctrlKey||event.metaKey),range:Boolean(event.shiftKey)});});
  listen(row,'click',event=>{if(event.target===row||event.target===meta||event.target===badge||event.target===spacer){focus(record);propose(record,event,{toggle:Boolean(event.ctrlKey||event.metaKey),range:Boolean(event.shiftKey)});}});
  listen(fold,'click',event=>{event.stopPropagation();focus(record);toggle(record,event);});
  listen(row,'dragstart',event=>{
   if(record.item.disabled||!record.item.draggable){event.preventDefault();return;}
   const candidates=selected().has(record.id)?flat.filter(record=>selected().has(record.id)&&record.item.draggable&&!record.item.disabled):[record],ids=new Set(candidates.map(record=>record.id));dragIds=candidates.filter(record=>!record.ancestors.some(id=>ids.has(id))).map(record=>record.id);
   if(!dragIds.length){event.preventDefault();return;}event.stopPropagation();if(event.dataTransfer){event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('application/x-design-studio-tree',JSON.stringify({tree:identifier,ids:dragIds}));event.dataTransfer.setData('text/plain',dragIds.join('\n'));}
  });
  listen(row,'dragover',event=>{const position=dropAt(record,event);if(!position)return;event.preventDefault();event.stopPropagation();if(event.dataTransfer)event.dataTransfer.dropEffect='move';if(dropId!==record.id||dropPosition!==position){clearDrop();dropId=record.id;dropPosition=position;attr(li,'data-drop-position',position);paint(record);}});
  listen(row,'dragleave',event=>{if(!row.contains(event.relatedTarget)&&dropId===record.id)clearDrop();});
  listen(row,'drop',event=>{const position=dropAt(record,event);if(!position)return;event.preventDefault();event.stopPropagation();const ids=[...dragIds];dragIds=[];clearDrop();config.onMove?.(ids,record.id,{position,event});});
  listen(row,'dragend',()=>{dragIds=[];clearDrop();});return record;
 }
 function updateRecord(record,item,ancestors,index,size){
  record.item=item;record.ancestors=ancestors;record.parentId=ancestors.at(-1)??null;
  const branch=Boolean(item.children?.length),open=branch&&expanded().has(item.id);attr(record.li,'aria-level',ancestors.length+1);attr(record.li,'aria-posinset',index+1);attr(record.li,'aria-setsize',size);attr(record.li,'aria-selected',selected().has(item.id));attr(record.li,'aria-disabled',item.disabled?'true':null);attr(record.li,'aria-expanded',branch?String(open):null);
  hidden(record.fold,!branch);hidden(record.spacer,branch);hidden(record.group,!open);attr(record.fold,'aria-label',(open?'Luk ':'Åbn ')+item.label);setIcon(record.fold,open?'chevron-down':'chevron-right');record.name.textContent=item.label;setIcon(record.icon,item.iconName,item.icon??'');hidden(record.icon,item.iconName===undefined&&(item.icon===undefined||item.icon===''));record.meta.textContent=item.meta??'';hidden(record.meta,item.meta===undefined||item.meta==='');record.badge.textContent=item.badge??'';hidden(record.badge,item.badge===undefined||item.badge==='');attr(record.li,'aria-describedby',item.meta===undefined||item.meta===''?null:record.meta.getAttribute('id'));record.label.disabled=Boolean(item.disabled);attr(record.label,'aria-disabled',String(Boolean(item.disabled)));attr(record.row,'draggable',String(Boolean(item.draggable&&!item.disabled)));
  const wanted=new Set((item.actions??[]).map(action=>action.id));
  for(const [id,button]of record.actionNodes)if(!wanted.has(id)){unlisten(button);button.remove();record.actionNodes.delete(id);}
  let cursor=record.actions.firstChild;
  for(const action of item.actions??[]){let button=record.actionNodes.get(action.id);if(!button){button=part('button','action');attr(button,'type','button');record.actionNodes.set(action.id,button);listen(button,'click',event=>{event.stopPropagation();const current=record.item.actions?.find(action=>action.id===button.getAttribute('data-tree-action'));if(!current||current.disabled)return;config.onAction?.(record.id,current.id,{item:record.item,event});});}attr(button,'data-tree-action',action.id);attr(button,'aria-label',action.label);attr(button,'title',action.label);attr(button,'aria-pressed',action.pressed===undefined?null:String(Boolean(action.pressed)));attr(button,'aria-disabled',String(Boolean(action.disabled)));button.disabled=Boolean(action.disabled);setIcon(button,action.iconName,action.icon??action.label);if(button!==cursor)record.actions.insertBefore(button,cursor);cursor=button.nextSibling;}
  hidden(record.actions,!wanted.size);paint(record);
 }
 function validateItems(items){
  if(!Array.isArray(items))throw new Error('Tree items must be an array.');const seen=new Set();let count=0;
  const visit=(items,depth=0)=>{if(depth>64)throw new Error('Tree exceeds 64 levels.');for(const item of items){if(!item||typeof item.id!=='string'||!item.id||item.id.length>200||seen.has(item.id)||typeof item.label!=='string')throw new Error('Tree items need unique text ids and labels.');seen.add(item.id);if(item.iconName!==undefined)iconModel(item.iconName);if(++count>5000)throw new Error('Tree exceeds 5000 items.');for(const key of ['icon','meta','badge'])if(item[key]!==undefined&&!['string','number'].includes(typeof item[key]))throw new Error('Tree '+key+' must be text.');if(item.actions!==undefined&&!Array.isArray(item.actions))throw new Error('Tree actions must be an array.');const actions=new Set();for(const action of item.actions??[]){if(!action||typeof action.id!=='string'||!action.id||actions.has(action.id)||typeof action.label!=='string')throw new Error('Tree actions need unique ids and labels.');if(action.iconName!==undefined)iconModel(action.iconName);actions.add(action.id);}if(item.children!==undefined){if(!Array.isArray(item.children))throw new Error('Tree children must be an array.');visit(item.children,depth+1);}}};visit(items);return seen;
 }
 function update(next={}){
  if(destroyed)throw new Error('The tree has been destroyed.');
  const candidate={...config,...next},items=candidate.items??[],ids=validateItems(items);if(!Object.hasOwn(component.variants,candidate.variant??'default'))throw new Error('Unknown tree variant.');config=candidate;
  const previousActive=document.activeElement,hadTreeFocus=element.contains(previousActive),previousFocus=records.get(focusedId),known=new Set();flat=[];
  attr(element,'class',component.parts.root.selector.slice(1));attr(element,'role','tree');attr(element,'aria-label',config.label??'Hierarkisk liste');attr(element,'aria-multiselectable',String(config.multiSelect!==false));attr(element,'data-variant',config.variant??'default');
  function reconcile(parent,items,ancestors=[]){let cursor=parent.firstChild;const branches=[];for(const [index,item]of items.entries()){const record=records.get(item.id)??createRecord(item.id);known.add(item.id);updateRecord(record,item,ancestors,index,items.length);if(record.li!==cursor)parent.insertBefore(record.li,cursor);cursor=record.li.nextSibling;branches.push([record,item]);}while(cursor){const next=cursor.nextSibling;parent.removeChild(cursor);cursor=next;}for(const [record,item]of branches){flat.push(record);reconcile(record.group,item.children??[],[...ancestors,item.id]);}}
  reconcile(element,items);
  for(const [id,record]of records)if(!known.has(id)){for(const node of [record.row,record.fold,record.label,...record.actionNodes.values()])unlisten(node);record.li.remove();records.delete(id);}
  if(dragIds.some(id=>!known.has(id))){dragIds=[];clearDrop();}
  const open=expanded();visible=flat.filter(record=>record.ancestors.every(id=>open.has(id)));
  if(!records.has(focusedId)||!visible.includes(records.get(focusedId))||!navigable(records.get(focusedId))){focusedId=previousFocus?.ancestors.slice().reverse().find(id=>visible.includes(records.get(id))&&navigable(records.get(id)))??visible.find(record=>selected().has(record.id)&&navigable(record))?.id??visible.find(navigable)?.id??null;}
  if(!ids.has(anchorId))anchorId=null;applyStops();
  if(previousActive&&element.contains(previousActive)){const record=rowFor(previousActive);if(record&&!visible.includes(record))records.get(focusedId)?.li.focus();else if(document.activeElement!==previousActive)previousActive.focus?.({preventScroll:true});}
  else if(hadTreeFocus){if(focusedId)records.get(focusedId)?.li.focus();else element.focus();}
  return api;
 }
 listen(element,'focusin',event=>{const record=rowFor(event.target);if(record&&visible.includes(record)&&navigable(record)){focusedId=record.id;applyStops();}});
 listen(element,'contextmenu',event=>{const record=rowFor(event.target);if(record)context(record,event);});
 listen(element,'keydown',event=>{
  const record=rowFor(event.target);if(!record)return;
  if(event.key==='ContextMenu'||event.key==='F10'&&event.shiftKey){context(record,event);return;}
  if(event.target!==record.li)return;
  const candidates=visible.filter(navigable),index=candidates.indexOf(record);let target=null;
  if(event.key==='ArrowDown')target=candidates[Math.min(candidates.length-1,index+1)];else if(event.key==='ArrowUp')target=candidates[Math.max(0,index-1)];else if(event.key==='Home')target=candidates[0];else if(event.key==='End')target=candidates.at(-1);
  else if(event.key==='ArrowRight'){event.preventDefault();if(record.item.children?.length){if(!expanded().has(record.id))toggle(record,event,true);else target=candidates.find(child=>child.parentId===record.id);}if(target)focus(target);return;}
  else if(event.key==='ArrowLeft'){event.preventDefault();if(record.item.children?.length&&expanded().has(record.id))toggle(record,event,false);else focus(records.get(record.parentId));return;}
  else if(event.key===' '||event.key==='Enter'){event.preventDefault();propose(record,event,{toggle:event.key===' '||Boolean(event.ctrlKey||event.metaKey),range:Boolean(event.shiftKey)});return;}
  else if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='a'&&config.multiSelect!==false){event.preventDefault();config.onSelect?.(visible.filter(record=>!record.item.disabled).map(record=>record.id),{id:record.id,item:record.item,event,toggle:false,range:true});return;}
  else if(event.key.length===1&&!event.ctrlKey&&!event.metaKey&&!event.altKey){const now=Date.now();typeText=now-typeAt>700?event.key:typeText+event.key;typeAt=now;const needle=(typeText.split('').every(char=>char.toLocaleLowerCase()===typeText[0].toLocaleLowerCase())?typeText[0]:typeText).toLocaleLowerCase(),order=[...candidates.slice(index+1),...candidates.slice(0,index+1)];target=order.find(record=>record.item.label.toLocaleLowerCase().startsWith(needle));if(target)event.preventDefault();}
  if(target){event.preventDefault();const fromId=record.id;focus(target);if(event.shiftKey)propose(target,event,{range:true,fromId});}
 });
 const api={element,update,destroy(){if(destroyed)return;destroyed=true;for(const [node,type,handler]of listeners)node.removeEventListener(type,handler);listeners.length=0;records.clear();element.remove();}};
 update(options);host.appendChild(element);return api;
}


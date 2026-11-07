import {positionFloating} from './overlays.mjs';
import {createIcon} from './icons.mjs';

const kinds=new Set(['combobox','multiselect','date-picker','time-picker']);
const text=(value,fallback='')=>String(value??fallback);
const hidden=(node,value)=>{node.hidden=value;if(value)node.setAttribute('hidden','');else node.removeAttribute('hidden');};
const attr=(node,name,value)=>value==null?node.removeAttribute(name):node.setAttribute(name,String(value));
const disabled=node=>node.disabled||node.matches?.(':disabled')||node.getAttribute('disabled')!==null;
const initialItems=[{id:'anna',label:'Anna Larsen'},{id:'mikkel',label:'Mikkel Holm'},{id:'sara',label:'Sara Østergaard',disabled:true}];
function itemsOf(items){
 if(!Array.isArray(items))throw new Error('Input choices require an items array.');
 const ids=new Set();return items.map(item=>{
  if(!item||typeof item!=='object'||!text(item.id).trim()||ids.has(String(item.id))||!text(item.label).trim())throw new Error('Input choices require unique non-empty IDs and labels.');
  const value={id:String(item.id),label:String(item.label),disabled:Boolean(item.disabled)};ids.add(value.id);return value;
 });
}
function valuesOf(value,multiple){
 const values=multiple?(value??[]):value==null||value===''?[]:[value];
 if(!Array.isArray(values)||values.some(id=>!['string','number'].includes(typeof id)||!String(id).trim()))throw new Error('Selected choices require non-empty IDs.');
 return [...new Set(values.map(String))];
}
const matches=(item,query)=>item.label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
function validNativeValue(kind,value){
 if(value==='')return true;
 if(kind==='time-picker')return /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,3})?)?$/.test(value);
 const parts=/^(\d{4})-(\d{2})-(\d{2})$/.exec(value);if(!parts)return false;
 const [year,month,day]=parts.slice(1).map(Number),leap=year%4===0&&(year%100!==0||year%400===0);
 return year>0&&month>=1&&month<=12&&day>=1&&day<=[31,leap?29:28,31,30,31,30,31,31,30,31,30,31][month-1];
}

/** Shared escaped markup model; controllers bind the same stable native input. */
export function normalizeInputChoicePreview(kind,preview,options,identifier){
 if(!kinds.has(kind))return preview;
 if(options.text!==undefined)throw new Error('Input choices use label/value/items rather than root text.');
 if(kind==='date-picker'||kind==='time-picker'){
  const type=kind==='date-picker'?'date':'time';
  if(options.type!==undefined&&options.type!==type)throw new Error(kind+' requires native type='+type+'.');
  for(const key of ['value','min','max'])if(options[key]!=null&&!validNativeValue(kind,String(options[key])))throw new Error(kind+' '+key+' must use '+(type==='date'?'YYYY-MM-DD':'HH:mm[:ss[.sss]]')+'.');
  if(options.step!==undefined&&options.step!=='any'&&!(Number.isFinite(Number(options.step))&&Number(options.step)>0))throw new Error(kind+' step must be positive or any.');
  const copy=structuredClone(preview),control=copy.children.find(node=>node.part==='control');
  control.attrs={...control.attrs,type,value:text(options.value),...Object.fromEntries(['min','max','step'].filter(key=>options[key]!==undefined).map(key=>[key,String(options[key])]))};
  return copy;
 }
 const multiple=kind==='multiselect',items=itemsOf(options.items??initialItems),values=valuesOf(multiple?options.values:options.value,multiple),cache=new Map(items.map(item=>[item.id,item]));
 const states=Array.isArray(options.state)?options.state:[options.state];
 const query=text(options.query,multiple?'':cache.get(values[0])?.label??''),readOnly=Boolean(options.readOnly??options.readonly)||states.includes('readOnly'),unavailable=Boolean(options.disabled||states.includes('disabled')||readOnly);
 const actionsDisabled=unavailable?{disabled:true}:{},name=text(options.label,multiple?'Ansvarlige':'Ansvarlig');
 return {tag:'div',part:'root',attrs:{'data-input-choice':kind,'data-choice-items':JSON.stringify(items),'data-choice-values':JSON.stringify(values),...(options.loading?{'aria-busy':'true'}:{})},children:[
  {tag:'label',part:'label',attrs:{id:identifier+'-label'},text:name},
  ...(multiple?[{tag:'div',part:'selected',attrs:{'aria-label':'Valgte muligheder',...(!values.length?{hidden:true}:{})},children:values.map(value=>({tag:'span',part:'chip',attrs:{'data-choice-value':value},children:[{tag:'span',part:'chip-label',text:cache.get(value)?.label??value},{tag:'button',part:'remove',attrs:{type:'button','data-choice-remove':value,'aria-label':'Fjern '+(cache.get(value)?.label??value),...actionsDisabled},children:[{tag:'span',iconName:'x',attrs:{'aria-hidden':'true'}}]}]}))}]:[]),
  {tag:'div',part:'wrapper',children:[
   {tag:'input',part:'control',attrs:{type:'text',role:'combobox',autocomplete:'off','aria-autocomplete':'list','aria-expanded':'false','aria-haspopup':'listbox','aria-controls':identifier+'-listbox',value:query}},
   {tag:'button',part:'clear',attrs:{type:'button','data-choice-clear':'','aria-label':'Ryd '+name,...actionsDisabled,...(!query&&!values.length?{hidden:true}:{})},children:[{tag:'span',iconName:'x',attrs:{'aria-hidden':'true'}}]},
   {tag:'button',part:'toggle',attrs:{type:'button','data-choice-toggle':'','aria-label':'Vis muligheder for '+name,...actionsDisabled},children:[{tag:'span',iconName:'chevron-down',attrs:{'aria-hidden':'true'}}]},
  ]},
  {tag:'div',part:'listbox',attrs:{role:'listbox',id:identifier+'-listbox','aria-labelledby':identifier+'-label',hidden:true,...(multiple?{'aria-multiselectable':'true'}:{})},children:items.map((item,index)=>({tag:'div',part:'option',text:item.label,attrs:{role:'option',id:identifier+'-option-'+index,'data-choice-id':item.id,'aria-selected':String(values.includes(item.id)),...(item.disabled?{'aria-disabled':'true'}:{})}}))},
  {tag:'p',part:'hint',text:text(options.hint)},
  {tag:'p',part:'error',text:text(options.error,'Kontrollér valget.')},
  {tag:'p',part:'status',attrs:{role:'status','aria-live':'polite','aria-atomic':'true',...(!options.loading?{hidden:true}:{})},text:options.loading?'Henter muligheder…':''},
 ]};
}

function mountInputChoice(root,options,multiple){
 const kind=multiple?'multiselect':'combobox';
 if(root?.getAttribute?.('data-input-choice')!==kind)throw new Error('mount'+(multiple?'Multiselect':'Combobox')+' requires its shared component root.');
 const document=root.ownerDocument,find=part=>root.querySelector('.ds-'+kind+'__'+part),input=find('control'),listbox=find('listbox'),status=find('status'),clearButton=find('clear'),toggle=find('toggle'),selected=find('selected'),errorNode=find('error');
 if(!input||!listbox||!status||!clearButton||!toggle||multiple&&!selected)throw new Error('Input choice anatomy is incomplete.');
 let config={},items=itemsOf(JSON.parse(root.getAttribute('data-choice-items')??'[]')),values=valuesOf(JSON.parse(root.getAttribute('data-choice-values')??'[]'),true),query=input.value??input.getAttribute('value')??'',cache=new Map(items.map(item=>[item.id,item])),activeId=null,opened=false,destroyed=false,composing=false,requestId=0,stopPosition;
 for(const value of values)if(!cache.has(value)){const chip=multiple?[...selected.children].find(node=>node.getAttribute('data-choice-value')===value):null;cache.set(value,{id:value,label:chip?.querySelector('.ds-multiselect__chip-label')?.textContent??(!multiple?query:value),disabled:false});}
 const listeners=[],eventHost=document.addEventListener?document:document.body;
 const listen=(node,type,callback,capture=false)=>{node.addEventListener(type,callback,capture);listeners.push(()=>node.removeEventListener(type,callback,capture));};
 const readonly=()=>input.readOnly||input.getAttribute('readonly')!==null;
 const unavailable=()=>disabled(input)||readonly();
 const enabled=()=>items.filter(item=>!item.disabled&&matches(item,query));
 const setText=(node,value)=>{node.textContent=value;};
 const empty=node=>node.replaceChildren();
 const outputValue=()=>multiple?[...values]:values[0]??null;
 const nodeFor=id=>[...listbox.children].find(node=>node.getAttribute('data-choice-id')===id);
 function setActive(id){
  activeId=id;for(const node of listbox.children)attr(node,'data-active',node.getAttribute('data-choice-id')===id?'true':null);
  attr(input,'aria-activedescendant',opened&&id?nodeFor(id)?.getAttribute('id'):null);nodeFor(id)?.scrollIntoView?.({block:'nearest'});
 }
 function render(){
  const previousActive=activeId,visible=items.filter(item=>matches(item,query)),hadRemovalFocus=multiple&&selected.contains(document.activeElement);
  empty(listbox);
  for(const item of visible){
   const node=document.createElement('div');node.className='ds-'+kind+'__option';attr(node,'role','option');attr(node,'id',listbox.getAttribute('id')+'-option-'+items.indexOf(item));attr(node,'data-choice-id',item.id);attr(node,'aria-selected',String(values.includes(item.id)));if(item.disabled)attr(node,'aria-disabled','true');setText(node,item.label);listbox.append(node);
  }
  if(multiple){
   empty(selected);
   for(const value of values){
    const label=cache.get(value)?.label??value,chip=document.createElement('span'),name=document.createElement('span'),remove=document.createElement('button');
    chip.className='ds-multiselect__chip';attr(chip,'data-choice-value',value);name.className='ds-multiselect__chip-label';setText(name,label);remove.className='ds-multiselect__remove';attr(remove,'type','button');attr(remove,'data-choice-remove',value);attr(remove,'aria-label','Fjern '+label);if(unavailable())attr(remove,'disabled','');remove.append(createIcon('x',{size:'small'},{document}));chip.append(name,remove);selected.append(chip);
   }
   hidden(selected,!values.length);
   if(hadRemovalFocus)input.focus();
  }
  hidden(clearButton,!query&&!values.length);for(const button of [clearButton,toggle]){if(unavailable())attr(button,'disabled','');else attr(button,'disabled',null);}
  attr(root,'aria-disabled',disabled(input)?'true':null);
  const states=(root.getAttribute('data-state')??'').split(/\s+/).filter(state=>state&&state!=='disabled'&&state!=='readOnly');
  if(disabled(input))states.push('disabled');if(readonly())states.push('readOnly');attr(root,'data-state',states.length?states.join(' '):null);
  attr(root,'aria-busy',config.loading?'true':null);attr(input,'aria-busy',config.loading?'true':null);
  if(config.error!==undefined){setText(errorNode,text(config.error));hidden(errorNode,!config.error);attr(root,'data-variant',config.error?'invalid':'default');attr(input,'aria-invalid',config.error?'true':null);const descriptions=(input.getAttribute('aria-describedby')??'').split(/\s+/).filter(id=>id&&id!==errorNode.getAttribute('id'));if(config.error)descriptions.push(errorNode.getAttribute('id'));attr(input,'aria-describedby',descriptions.length?descriptions.join(' '):null);}
  const message=config.loading?'Henter muligheder…':config.error?text(config.error):opened?(visible.length?visible.length+' muligheder.':'Ingen muligheder.'):'';
  setText(status,message);hidden(status,!message);
  setActive(opened&&enabled().some(item=>item.id===previousActive)?previousActive:opened?enabled()[0]?.id??null:null);
 }
 function open(){
  if(destroyed||unavailable())return false;if(opened)return true;
  hidden(listbox,false);
  if(typeof listbox.showPopover==='function'){attr(listbox,'popover','manual');try{listbox.showPopover();}catch(error){hidden(listbox,true);throw error;}}
  opened=true;attr(input,'aria-expanded','true');stopPosition=positionFloating(input,listbox,'bottom');render();return true;
 }
 function close(){
  if(!opened)return;opened=false;stopPosition?.();stopPosition=null;
  if(typeof listbox.hidePopover==='function'&&listbox.getAttribute('popover')!==null)try{listbox.hidePopover();}catch{/* It may already be removed. */}
  hidden(listbox,true);attr(input,'aria-expanded','false');setActive(null);setText(status,'');hidden(status,true);
 }
 function change(next,reason,event){
  const previous=outputValue();values=next;root.setAttribute('data-choice-values',JSON.stringify(values));
  render();config.onChange?.(outputValue(),{previousValue:previous,reason,event,query,item:values.length?cache.get(values.at(-1)):null});
 }
 function queryChange(next,{notify=true}={}){
  query=next;input.value=query;requestId++;config.loading=false;render();
  if(notify)config.onQueryChange?.(query,{requestId});
 }
 function choose(id,event){
  const item=items.find(item=>item.id===id);if(!item||item.disabled||unavailable())return;
  if(multiple){change(values.includes(id)?values.filter(value=>value!==id):[...values,id],'select',event);if(destroyed)return;queryChange('');open();}
  else{query=item.label;input.value=query;requestId++;change([id],'select',event);close();}
  if(!destroyed)input.focus();
 }
 function clear(event){
  if(destroyed||unavailable())return false;query='';input.value='';requestId++;change([],'clear',event);if(destroyed)return true;config.onQueryChange?.('',{requestId});close();if(!destroyed)input.focus();return true;
 }
 function update(next={}){
  if(destroyed){if(next.requestId!==undefined)return false;throw new Error('Input choice controller has been destroyed.');}
  if(next.requestId!==undefined&&next.requestId!==requestId)return false;
  const nextItems=next.items===undefined?items:itemsOf(next.items),hasValue=Object.hasOwn(next,multiple?'values':'value'),nextValues=hasValue?valuesOf(multiple?next.values:next.value,multiple):values;
  config={...config,...next};items=nextItems;cache=new Map([...nextValues.filter(value=>cache.has(value)).map(value=>[value,cache.get(value)]),...items.map(item=>[item.id,item])]);values=nextValues;
  if(Object.hasOwn(next,'query')){query=text(next.query);input.value=query;requestId++;}
  else if(hasValue&&!multiple){query=cache.get(values[0])?.label??'';input.value=query;requestId++;}
  if(Object.hasOwn(next,'disabled')){if(next.disabled)attr(input,'disabled','');else attr(input,'disabled',null);}
  if(Object.hasOwn(next,'readOnly')||Object.hasOwn(next,'readonly')){if(next.readOnly??next.readonly)attr(input,'readonly','');else attr(input,'readonly',null);}
  root.setAttribute('data-choice-values',JSON.stringify(values));root.setAttribute('data-choice-items',JSON.stringify(items));render();if(unavailable())close();return true;
 }
 const acceptInput=event=>{if(unavailable())return;const next=input.value;if(composing||event.isComposing){query=next;return;}if(!multiple&&values.length){query=next;change([],'input',event);if(destroyed)return;}queryChange(next);open();};
 listen(input,'input',acceptInput);
 listen(input,'compositionstart',()=>{composing=true;});
 listen(input,'compositionend',event=>{composing=false;acceptInput(event);});
 listen(input,'keydown',event=>{
  if(composing||event.isComposing||event.altKey||event.ctrlKey||event.metaKey||unavailable())return;
  if(event.key==='Escape'&&opened){event.preventDefault();event.stopPropagation();close();return;}
  if(event.key==='Tab'){close();return;}
  if(event.key==='ArrowDown'||event.key==='ArrowUp'){
   event.preventDefault();const wasOpen=opened;open();const available=enabled();if(!available.length)return;
   const index=available.findIndex(item=>item.id===activeId),delta=event.key==='ArrowDown'?1:-1;
   setActive(available[!wasOpen?(delta>0?0:available.length-1):(index+delta+available.length)%available.length].id);return;
  }
  if(opened&&(event.key==='Home'||event.key==='End')){event.preventDefault();const available=enabled();setActive((event.key==='Home'?available[0]:available.at(-1))?.id??null);return;}
  if(opened&&event.key==='Enter'&&activeId){event.preventDefault();choose(activeId,event);}
 });
 listen(root,'pointerdown',event=>{if(listbox.contains(event.target)||toggle.contains(event.target))event.preventDefault();});
 listen(listbox,'pointermove',event=>{if(!opened)return;for(let node=event.target;node&&node!==listbox;node=node.parentNode){const id=node.getAttribute?.('data-choice-id');if(id!=null){if(items.some(item=>item.id===id&&!item.disabled))setActive(id);break;}}});
 listen(root,'click',event=>{
  for(let node=event.target;node&&node!==root;node=node.parentNode){
   const choice=node.getAttribute?.('data-choice-id'),removal=node.getAttribute?.('data-choice-remove');
   if(choice!=null){choose(choice,event);return;}
   if(removal!=null){if(!unavailable()){change(values.filter(value=>value!==removal),'remove',event);input.focus();}return;}
   if(node===clearButton){clear(event);return;}
   if(node===toggle){if(opened)close();else open();input.focus();return;}
  }
 });
 listen(eventHost,'pointerdown',event=>{if(!root.contains(event.target))close();});
 listen(eventHost,'focusin',event=>{if(!root.contains(event.target))close();});
 const controller={open,close,clear,update,get opened(){return opened;},get query(){return query;},get value(){return values[0]??null;},get values(){return [...values];},get requestId(){return requestId;},destroy(){if(destroyed)return;destroyed=true;close();for(const dispose of listeners.splice(0))dispose();}};
 update(options);return controller;
}
export const mountCombobox=(root,options={})=>mountInputChoice(root,options,false);
export const mountMultiselect=(root,options={})=>mountInputChoice(root,options,true);

const navigationIds=new Set(['tabs','accordion','breadcrumb','pagination']);
const text=(value,fallback)=>String(value??fallback??'');
const itemList=(items,fallback)=>{
 const result=items??fallback;
 if(!Array.isArray(result)||!result.length)throw new Error('Navigation items must be a non-empty array.');
 return result;
};
const label=value=>{const result=text(value);if(!result.trim())throw new Error('Navigation items require a non-empty label.');return result;};
const content=value=>typeof value==='string'||typeof value==='number'?[{tag:'p',text:String(value)}]:value===undefined?[]:Array.isArray(value)?value:[value];

/** Normalize product data into the shared declarative anatomy. Content follows
 * the same escaped text/declarative-node contract as component slots.
 */
export function normalizeNavigationPreview(id,preview,options,identifier){
 if(!navigationIds.has(id))return preview;
 if(options.text!==undefined)throw new Error('Navigation uses label/items rather than root text.');
 const states=(Array.isArray(options.state)?options.state:[options.state]).filter(Boolean);
 const sampleState=states.join(' '),sampleAttrs=sampleState?{'data-state':sampleState}:{};
 if(id==='tabs'){
  const orientation=options.orientation??(options.variant==='vertical'?'vertical':'horizontal');
  if(!['horizontal','vertical'].includes(orientation))throw new Error('Unknown tab orientation.');
  const items=itemList(options.items,[{id:'overview',label:'Overblik',content:'Et samlet overblik over indholdet.'},{id:'details',label:'Detaljer',content:'Supplerende oplysninger.'},{id:'history',label:'Historik',content:'Tidligere ændringer.'}]);
  const ids=new Set();
  for(const item of items){if(!item||typeof item!=='object'||!text(item.id).trim()||ids.has(String(item.id)))throw new Error('Tabs require unique, non-empty item IDs.');ids.add(String(item.id));label(item.label);}
  const requested=options.selectedId===undefined?null:String(options.selectedId);
  if(requested!==null&&!ids.has(requested))throw new Error('Unknown selected tab: '+requested);
  const enabled=item=>!options.disabled&&!item.disabled&&!(states.includes('disabled')&&item===items[0]);
  const selected=items.find(item=>String(item.id)===requested&&enabled(item))??items.find(enabled);
  return {tag:'div',part:'root',attrs:{'data-tabs':''},children:[
   {tag:'div',part:'list',attrs:{role:'tablist','aria-label':label(options.label??'Indholdsfaner'),'aria-orientation':orientation,...(!selected?{tabindex:'0','aria-disabled':'true'}:{})},children:items.map((item,index)=>({tag:'button',part:'tab',text:label(item.label),attrs:{type:'button',role:'tab',id:identifier+'-tab-'+index,'data-tab-id':String(item.id),'aria-controls':identifier+'-panel-'+index,'aria-selected':String(item===selected),tabindex:item===selected?'0':'-1',...(!enabled(item)?{disabled:true,'aria-disabled':'true'}:{}),...(index===0?sampleAttrs:{})}}))},
   ...items.map((item,index)=>({tag:'section',part:'panel',attrs:{id:identifier+'-panel-'+index,role:'tabpanel','aria-labelledby':identifier+'-tab-'+index,tabindex:'0',...(item!==selected?{hidden:true}:{})},children:content(item.content)})),
  ]};
 }
 if(id==='accordion'){
  if(options.disabled)throw new Error('Native disclosures do not support disabled; render unavailable information as static content.');
  const items=itemList(options.items,[{id:'details',label:'Flere oplysninger',content:'Indholdet kan foldes ud med mus eller tastatur.',open:true},{id:'help',label:'Hjælp til næste trin',content:'Produktet leverer oplysningerne.'}]);
  return {tag:'div',part:'root',...(options.label?{attrs:{role:'group','aria-label':label(options.label)}}:{}),children:items.map((item,index)=>{
   if(item.disabled)throw new Error('Native disclosures do not support disabled; render unavailable information as static content.');
   return {tag:'details',part:'item',attrs:{...(item.open||states.includes('expanded')?{open:true}:{})},children:[{tag:'summary',part:'summary',attrs:{id:identifier+'-summary-'+index,...(index===0?sampleAttrs:{})},text:label(item.label)},{tag:'div',part:'body',attrs:{'aria-labelledby':identifier+'-summary-'+index},children:content(item.content)}]};
  })};
 }
 const breadcrumb=id==='breadcrumb',items=itemList(options.items,breadcrumb?[{label:'Forside',href:'#forside'},{label:'Samlinger',href:'#samlinger'},{label:'Aktuel samling',current:true}]:[{label:'Forrige',disabled:true},{label:'1',href:'#side-1',current:true},{label:'2',href:'#side-2'},{label:'3',href:'#side-3'},{label:'Næste',href:'#side-2'}]);
 if(items.filter(item=>item.current).length>1)throw new Error('Navigation can have only one current item.');
 return {tag:'nav',part:'root',attrs:{'aria-label':label(options.label??(breadcrumb?'Brødkrummer':'Sidenavigation'))},children:[{tag:'ol',part:'list',children:items.map((item,index)=>{
  const disabled=Boolean(options.disabled||item.disabled||(states.includes('disabled')&&index===0)),hasLink=item.href!==undefined&&!disabled;
  const current=states.includes('current')?index===0:Boolean(item.current)||(breadcrumb&&index===items.length-1&&!items.some(entry=>entry.current));
  return {tag:'li',part:'item',children:[...(breadcrumb&&index>0?[{tag:'span',part:'separator',attrs:{'aria-hidden':'true'},text:'/'}]:[]),{tag:hasLink?'a':'span',part:'link',text:label(item.label),attrs:{...(hasLink?{href:String(item.href)}:{}),...(disabled?{'aria-disabled':'true'}:{}),...(current?{'aria-current':'page'}:{}),...(index===0?sampleAttrs:{})}}]};
 })}]};
}

/** Attach to stable tabs markup. Selection changes visibility without replacing
 * panels or their controls. onChange(id,{previousId,tab,panel,event}) lets the
 * product retain selection; call update after externally changing markup/state.
 */
export function mountTabs(host,options={}){
 if(!host?.querySelectorAll)throw new Error('mountTabs requires a DOM host.');
 const document=host.ownerDocument,list=[host,...host.querySelectorAll('[role]')].find(node=>node.getAttribute('role')==='tablist');
 if(!list)throw new Error('Tabs require a tablist.');
 let config={},pairs=[],selected=null,destroyed=false;
 const listeners=[];
 const listen=(type,fn)=>{list.addEventListener(type,fn);listeners.push([type,fn]);};
 const disabled=tab=>tab.disabled||tab.getAttribute('disabled')!==null||tab.getAttribute('aria-disabled')==='true';
 const hidden=(node,value)=>{node.hidden=value;if(value)node.setAttribute('hidden','');else node.removeAttribute('hidden');};
 const key=tab=>tab.getAttribute('data-tab-id')??tab.getAttribute('id');
 const enabled=()=>pairs.filter(({tab})=>!disabled(tab));
 const rove=tab=>{for(const pair of pairs)pair.tab.setAttribute('tabindex',pair.tab===tab?'0':'-1');};
 function apply(next,{event,focus=false,notify=false}={}){
  if(!next||disabled(next.tab))return false;
  const previous=selected,active=document?.activeElement,changed=previous?.tab!==next.tab;
  selected=next;rove(next.tab);
  for(const pair of pairs){pair.tab.setAttribute('aria-selected',String(pair===next));hidden(pair.panel,pair!==next);}
  if(focus||(changed&&previous?.panel.contains(active)))next.tab.focus();
  if(notify&&changed)config.onChange?.(key(next.tab),{previousId:previous?key(previous.tab):null,tab:next.tab,panel:next.panel,event});
  return true;
 }
 function update(next={}){
  if(destroyed)throw new Error('Tabs controller has been destroyed.');
  config={...config,...next};
  const orientation=config.orientation??list.getAttribute('aria-orientation')??'horizontal',activation=config.activation??'automatic';
  if(!['horizontal','vertical'].includes(orientation)||!['automatic','manual'].includes(activation))throw new Error('Unknown tab orientation or activation.');
  list.setAttribute('aria-orientation',orientation);config.orientation=orientation;config.activation=activation;
  for(let node=list.parentNode;node;node=node.parentNode){if(node.getAttribute?.('data-tabs')!=null){node.setAttribute('data-variant',orientation==='vertical'?'vertical':'default');break;}if(node===host)break;}
  const roles=[...host.querySelectorAll('[role]')],tabs=[...list.querySelectorAll('[role]')].filter(tab=>{
   if(tab.getAttribute('role')!=='tab')return false;
   for(let parent=tab.parentNode;parent&&parent!==list;parent=parent.parentNode)if(parent.getAttribute?.('role')==='tablist')return false;
   return true;
  });
  const keys=new Set(),panels=new Set(),domIds=new Set();
  pairs=tabs.map(tab=>{
   const panelId=tab.getAttribute('aria-controls'),tabId=tab.getAttribute('id'),matches=roles.filter(node=>node.getAttribute('role')==='tabpanel'&&node.getAttribute('id')===panelId),id=key(tab);
   if(!id||!tabId||!panelId||tabId===panelId||domIds.has(tabId)||domIds.has(panelId)||keys.has(id)||matches.length!==1||panels.has(matches[0])||matches[0].getAttribute('aria-labelledby')!==tabId)throw new Error('Tabs require unique IDs and reciprocal tab/panel relations.');
   keys.add(id);domIds.add(tabId);domIds.add(panelId);panels.add(matches[0]);return {tab,panel:matches[0]};
  });
  const requested=Object.hasOwn(next,'selectedId')?String(next.selectedId):selected?key(selected.tab):config.selectedId===undefined?null:String(config.selectedId);
  const current=enabled().find(pair=>key(pair.tab)===requested)??enabled().find(pair=>pair.tab.getAttribute('aria-selected')==='true')??enabled()[0];
  const focused=pairs.find(pair=>pair.tab===document?.activeElement);
  if(current){list.removeAttribute('tabindex');list.removeAttribute('aria-disabled');apply(current,{focus:Boolean(focused&&disabled(focused.tab))||document?.activeElement===list});}
  else{selected=null;list.setAttribute('tabindex','0');list.setAttribute('aria-disabled','true');for(const pair of pairs){pair.tab.setAttribute('aria-selected','false');pair.tab.setAttribute('tabindex','-1');hidden(pair.panel,true);}if(focused)list.focus();}
  return controller;
 }
 const pairAt=node=>{for(let target=node;target&&target!==list;target=target.parentNode){const pair=pairs.find(pair=>pair.tab===target);if(pair)return pair;}return null;};
 listen('click',event=>{const pair=pairAt(event.target);if(!pair)return;if(disabled(pair.tab)){event.preventDefault();return;}apply(pair,{event,focus:true,notify:true});});
 listen('focusin',event=>{const pair=pairAt(event.target);if(!pair||disabled(pair.tab))return;rove(pair.tab);if(config.activation==='automatic')apply(pair,{event,notify:true});});
 listen('keydown',event=>{
  if(event.defaultPrevented||event.isComposing||event.altKey||event.ctrlKey||event.metaKey)return;
  const pair=pairAt(event.target);if(!pair||disabled(pair.tab))return;
  if(event.key==='Tab'){if(selected)rove(selected.tab);return;}
  if(['Enter',' '].includes(event.key)){event.preventDefault();apply(pair,{event,notify:true});return;}
  const vertical=config.orientation==='vertical',direction=document?.defaultView?.getComputedStyle?.(list).direction??list.getAttribute('dir')??document?.documentElement?.getAttribute?.('dir')??'ltr';
  const forward=vertical?'ArrowDown':direction==='rtl'?'ArrowLeft':'ArrowRight',backward=vertical?'ArrowUp':direction==='rtl'?'ArrowRight':'ArrowLeft';
  const candidates=enabled(),index=candidates.indexOf(pair);
  const next=event.key==='Home'?candidates[0]:event.key==='End'?candidates.at(-1):event.key===forward?candidates[(index+1)%candidates.length]:event.key===backward?candidates[(index-1+candidates.length)%candidates.length]:null;
  if(next){event.preventDefault();rove(next.tab);next.tab.focus();}
 });
 const controller={update,get selectedId(){return selected?key(selected.tab):null;},destroy(){if(destroyed)return;destroyed=true;for(const [type,fn]of listeners)list.removeEventListener(type,fn);}};
 try{return update(options);}catch(error){controller.destroy();throw error;}
}

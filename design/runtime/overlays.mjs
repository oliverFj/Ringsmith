/** Shared modeless overlays and native dialog lifecycle. Product code owns
 * content, commands and state; these helpers own placement, dismissal and focus.
 */
let sequence=0;
const stacks=new WeakMap();
const stackFor=document=>{if(!stacks.has(document))stacks.set(document,[]);return stacks.get(document);};
const removeFromStack=(stack,entry)=>{const index=stack.indexOf(entry);if(index>=0)stack.splice(index,1);};
const closeNested=(stack,panel)=>{for(const child of [...stack].reverse())if(child.panel!==panel&&(panel.contains(child.panel)||panel.contains(child.trigger)))child.close({restoreFocus:false});};
function ownsLayerTarget(stack,panel,target){
 const panels=new Set([panel]);
 for(let pass=0;pass<stack.length;pass++){let changed=false;for(const entry of stack)if(!panels.has(entry.panel)&&[...panels].some(parent=>parent.contains(entry.trigger))){panels.add(entry.panel);changed=true;}if(!changed)break;}
 return [...panels].some(parent=>parent.contains(target));
}
const attr=(node,name,value)=>value==null?node.removeAttribute(name):node.setAttribute(name,String(value));
const disabled=node=>node.disabled||node.matches?.(':disabled')||node.getAttribute('disabled')!==null||node.getAttribute('aria-disabled')==='true';
const hide=(node,value)=>{node.hidden=value;if(value)node.setAttribute('hidden','');else node.removeAttribute('hidden');};
const id=node=>{if(!node.getAttribute('id'))node.setAttribute('id','ds-overlay-'+(++sequence));return node.getAttribute('id');};
const listen=(list,node,type,fn,options)=>{if(node?.addEventListener){node.addEventListener(type,fn,options);list.push(()=>node.removeEventListener(type,fn,options));}};
const clean=list=>{for(const dispose of list.splice(0))dispose();};
const snapshotAttrs=(node,names)=>{const values=names.map(name=>[name,node.getAttribute(name)]);return()=>values.forEach(([name,value])=>attr(node,name,value));};
const focusable=node=>['BUTTON','INPUT','SELECT','TEXTAREA','SUMMARY'].includes(node.tagName)||node.tagName==='A'&&node.getAttribute('href')!==null||node.getAttribute('tabindex')!==null;
function focusFirst(panel,initialFocus){
 const chosen=typeof initialFocus==='function'?initialFocus():initialFocus;
 if(chosen?.focus&&panel.contains(chosen)&&!disabled(chosen)){chosen.focus();return;}
 const candidates=[];
 function visit(node,hidden=false){hidden ||=node.hidden||node.getAttribute?.('hidden')!==null; if(!hidden&&focusable(node)&&!disabled(node)&&node.getAttribute('tabindex')!=='-1')candidates.push(node);for(const child of node.children??[])visit(child,hidden);}
 for(const child of panel.children??[])visit(child);
 (candidates[0]??panel).focus();
}

/** Placement is viewport-relative. Flip on the main axis and clamp both axes. */
export function floatingPlacement(anchor,panel,viewport,{placement='bottom',gap=8,padding=8}={}){
 if(!['top','bottom','left','right'].includes(placement))throw new Error('Unknown overlay placement.');
 const width=viewport.width,height=viewport.height,left=viewport.left??0,top=viewport.top??0;
 const fits={top:anchor.top-top-padding>=panel.height+gap,bottom:top+height-padding-anchor.bottom>=panel.height+gap,left:anchor.left-left-padding>=panel.width+gap,right:left+width-padding-anchor.right>=panel.width+gap};
 const opposite={top:'bottom',bottom:'top',left:'right',right:'left'};
 let side=placement;if(!fits[side]&&fits[opposite[side]])side=opposite[side];
 let x=anchor.left+(anchor.width-panel.width)/2,y=anchor.top+(anchor.height-panel.height)/2;
 if(side==='top')y=anchor.top-panel.height-gap;if(side==='bottom')y=anchor.bottom+gap;
 if(side==='left')x=anchor.left-panel.width-gap;if(side==='right')x=anchor.right+gap;
 return {left:Math.max(left+padding,Math.min(x,left+width-padding-panel.width)),top:Math.max(top+padding,Math.min(y,top+height-padding-panel.height)),placement:side};
}

export function positionFloating(trigger,panel,placement='bottom'){
 const view=trigger.ownerDocument?.defaultView??globalThis,listeners=[];
 const names=['position','inset','margin','left','top','--ds-overlay-available-width','--ds-overlay-available-height'];
 const original=names.map(name=>[name,panel.style.getPropertyValue?.(name)??panel.style[name]??'']);
 const set=(name,value)=>panel.style.setProperty?panel.style.setProperty(name,value):panel.style[name]=value;
 const update=()=>{
  const visual=view.visualViewport,viewport={width:visual?.width??view.innerWidth??1024,height:visual?.height??view.innerHeight??768,left:visual?.offsetLeft??0,top:visual?.offsetTop??0};
  set('--ds-overlay-available-width',Math.max(1,viewport.width-16)+'px');set('--ds-overlay-available-height',Math.max(1,viewport.height-16)+'px');
  const result=floatingPlacement(trigger.getBoundingClientRect(),panel.getBoundingClientRect(),viewport,{placement});
  set('position','fixed');set('inset','auto');set('margin','0');set('left',Math.round(result.left)+'px');set('top',Math.round(result.top)+'px');
  panel.setAttribute('data-placement',result.placement);
 };
 update();listen(listeners,view,'resize',update);listen(listeners,view,'scroll',update,true);
 listen(listeners,view.visualViewport,'resize',update);listen(listeners,view.visualViewport,'scroll',update);
 const observer=view.ResizeObserver?new view.ResizeObserver(update):null;observer?.observe(trigger);observer?.observe(panel);
 return()=>{clean(listeners);observer?.disconnect();for(const [name,value]of original){if(value)set(name,value);else if(panel.style.removeProperty)panel.style.removeProperty(name);else delete panel.style[name];}panel.removeAttribute('data-placement');};
}

function reveal(panel){
 hide(panel,false);
 // A native top-layer popover escapes scroll-container clipping without portals.
 if(typeof panel.showPopover==='function'){panel.setAttribute('popover','manual');try{panel.showPopover();}catch(error){hide(panel,true);throw error;}}
}
function conceal(panel){if(typeof panel.hidePopover==='function'&&panel.getAttribute('popover')!==null){try{panel.hidePopover();}catch{/* Already closed or removed. */}}hide(panel,true);}

/** Hover/focus tooltip, no interactive content. Escape suppresses reopening until
 * the next hover/focus entry. Moving onto the tip keeps it visible.
 */
export function mountTooltip(trigger,tooltip,{placement='top',delay=300,closeDelay=120}={}){
 if(!trigger?.ownerDocument||!tooltip?.style)throw new Error('mountTooltip requires a trigger and tooltip.');
 if(!Number.isFinite(delay)||delay<0||!Number.isFinite(closeDelay)||closeDelay<0)throw new Error('Tooltip delays must be nonnegative numbers.');
 const children=[];const walk=node=>{for(const child of node.children??[]){children.push(child);walk(child);}};walk(tooltip);
 if(children.some(focusable))throw new Error('A tooltip cannot contain interactive controls. Use a popover.');
 const restoreTrigger=snapshotAttrs(trigger,['aria-describedby']),restorePanel=snapshotAttrs(tooltip,['id','role','popover','hidden']);
 const listeners=[],document=trigger.ownerDocument,eventHost=document.addEventListener?document:document.body;
 const described=(trigger.getAttribute('aria-describedby')??'').split(/\s+/).filter(Boolean),identifier=id(tooltip);
 attr(trigger,'aria-describedby',[...new Set([...described,identifier])].join(' '));attr(tooltip,'role','tooltip');
 let opened=false,destroyed=false,hover=false,tipHover=false,focused=false,suppressed=false,timer=null,stopPosition;
 const stack=stackFor(document),entry={panel:tooltip,trigger,close};
 conceal(tooltip);
 const cancel=()=>{clearTimeout(timer);timer=null;};
 function close(){cancel();if(!opened)return;removeFromStack(stack,entry);stopPosition?.();stopPosition=null;conceal(tooltip);opened=false;}
 function open(){cancel();if(destroyed||suppressed||opened||disabled(trigger))return;reveal(tooltip);opened=true;stack.push(entry);stopPosition=positionFloating(trigger,tooltip,placement);}
 const schedule=wait=>{cancel();if(wait===0)open();else timer=setTimeout(open,wait);};
 const leave=()=>{cancel();if(!hover&&!tipHover&&!focused)timer=setTimeout(close,closeDelay);};
 listen(listeners,trigger,'pointerenter',()=>{hover=true;suppressed=false;schedule(delay);});
 listen(listeners,trigger,'pointerleave',()=>{hover=false;leave();});
 listen(listeners,tooltip,'pointerenter',()=>{tipHover=true;cancel();});
 listen(listeners,tooltip,'pointerleave',()=>{tipHover=false;leave();});
 listen(listeners,trigger,'focusin',()=>{focused=true;suppressed=false;open();});
 listen(listeners,trigger,'focusout',()=>{focused=false;leave();});
 listen(listeners,eventHost,'keydown',event=>{if(!event.defaultPrevented&&event.key==='Escape'&&opened&&stack.at(-1)===entry){event.preventDefault();event.stopPropagation();suppressed=true;close();}});
 return {open,close,get opened(){return opened;},destroy(){if(destroyed)return;close();destroyed=true;clean(listeners);restoreTrigger();restorePanel();}};
}

/** Non-modal interactive panel. Tab follows document order; focus leaving the
 * panel dismisses it. Escape and explicit close restore the trigger. */
export function mountPopover(trigger,panel,{placement='bottom',initialFocus,onOpenChange}={}){
 if(!trigger?.ownerDocument||!panel?.style)throw new Error('mountPopover requires a trigger and panel.');
 const document=trigger.ownerDocument,eventHost=document.addEventListener?document:document.body,listeners=[],active=[];
 const restoreTrigger=snapshotAttrs(trigger,['aria-controls','aria-expanded','aria-haspopup']),restorePanel=snapshotAttrs(panel,['id','role','tabindex','popover','hidden']);
 attr(trigger,'aria-controls',id(panel));attr(trigger,'aria-haspopup','dialog');attr(trigger,'aria-expanded','false');
 attr(panel,'role','dialog');attr(panel,'tabindex','-1');
 let opened=false,destroyed=false,stopPosition;
 const stack=stackFor(document),entry={panel,trigger,close};
 conceal(panel);
 function close({restoreFocus=true}={}){
  if(!opened)return;opened=false;closeNested(stack,panel);removeFromStack(stack,entry);clean(active);stopPosition?.();stopPosition=null;conceal(panel);attr(trigger,'aria-expanded','false');
  if(restoreFocus&&trigger.isConnected!==false)trigger.focus();onOpenChange?.(false);
 }
 function open(){
  if(destroyed||opened||disabled(trigger))return false;
  reveal(panel);opened=true;stack.push(entry);attr(trigger,'aria-expanded','true');stopPosition=positionFloating(trigger,panel,placement);focusFirst(panel,initialFocus);
  listen(active,eventHost,'pointerdown',event=>{if(!ownsLayerTarget(stack,panel,event.target)&&!trigger.contains(event.target))close({restoreFocus:false});});
  listen(active,eventHost,'focusin',event=>{if(!ownsLayerTarget(stack,panel,event.target)&&!trigger.contains(event.target))close({restoreFocus:false});});
  listen(active,eventHost,'keydown',event=>{if(!event.defaultPrevented&&event.key==='Escape'&&opened&&stack.at(-1)===entry){event.preventDefault();event.stopPropagation();close();}});
  onOpenChange?.(true);return true;
 }
 listen(listeners,trigger,'click',event=>{event.preventDefault();if(opened)close();else open();});
 listen(listeners,panel,'click',event=>{for(let node=event.target;node&&node!==panel;node=node.parentNode)if(node.getAttribute?.('data-ds-close')!==null){close();break;}});
 return {open,close,get opened(){return opened;},destroy(){if(destroyed)return;close({restoreFocus:panel.contains(document.activeElement)});destroyed=true;clean(listeners);restoreTrigger();restorePanel();}};
}

/** Native modal/non-modal dialog or drawer. No simulated modal fallback. Native
 * showModal provides inert siblings, focus containment and Escape cancellation.
 */
export function mountDialog(dialog,{trigger,modal=true,initialFocus,onOpenChange}={}){
 if(dialog?.tagName!=='DIALOG')throw new Error('mountDialog requires a native dialog element.');
 const document=dialog.ownerDocument,listeners=[],restoreTrigger=trigger?snapshotAttrs(trigger,['aria-controls','aria-haspopup']):()=>{};
 const restoreDialog=snapshotAttrs(dialog,['data-ds-managed-dialog']);attr(dialog,'data-ds-managed-dialog','true');
 if(trigger){attr(trigger,'aria-controls',id(dialog));attr(trigger,'aria-haspopup','dialog');}
 let destroyed=false,opener=null,opened=Boolean(dialog.open||dialog.getAttribute('open')!==null);
 const finish=()=>{if(!opened)return;opened=false;const stack=stackFor(document),active=document.activeElement,restore=modal||active===document.body||ownsLayerTarget(stack,dialog,active);closeNested(stack,dialog);if(restore&&opener?.isConnected!==false)opener?.focus?.();onOpenChange?.(false);};
 const close=(value='')=>{if(opened){dialog.close(String(value));finish();}};
 const open=()=>{
  if(destroyed||opened||trigger&&disabled(trigger))return false;
  const show=modal?'showModal':'show';if(typeof dialog[show]!=='function')throw new Error('Native dialog '+show+'() is required.');
  opener=trigger??document.activeElement;dialog[show]();opened=true;
  if(initialFocus)focusFirst(dialog,initialFocus);onOpenChange?.(true);return true;
 };
 if(trigger)listen(listeners,trigger,'click',event=>{event.preventDefault();open();});
 listen(listeners,dialog,'close',finish);
 listen(listeners,dialog,'keydown',event=>{const stack=stackFor(document),nested=stack.at(-1)?.panel;if(!modal&&!event.defaultPrevented&&event.key==='Escape'&&opened&&!(nested&&ownsLayerTarget(stack,dialog,nested))){event.preventDefault();event.stopPropagation();close();}});
 listen(listeners,dialog,'click',event=>{for(let node=event.target;node&&node!==dialog;node=node.parentNode)if(node.getAttribute?.('data-ds-close')!==null){close();break;}});
 return {open,close,get opened(){return opened;},destroy(){if(destroyed)return;close();destroyed=true;clean(listeners);restoreTrigger();restoreDialog();}};
}

/** A drawer is the same native lifecycle with its own side-panel anatomy. */
export const mountDrawer=(drawer,options)=>mountDialog(drawer,options);

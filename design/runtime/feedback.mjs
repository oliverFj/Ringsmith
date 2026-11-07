const part=(node,name)=>node?.part===name?node:(node?.children??[]).map(child=>part(child,name)).find(Boolean);
const text=(node,value)=>{node.text=String(value);delete node.children;};
const named=(value,label)=>{const result=String(value).trim();if(!result)throw new Error(label+' requires a non-empty label.');return result;};

/** Normalize only the shared anatomy; callers preserve custom format-1 roles. */
export function normalizeFeedbackPreview(id,source,options,identifier){
 const preview=structuredClone(source);preview.attrs??={};
 if(id==='spinner'){
  text(part(preview,'label'),named(options.label??'Indlæser indhold…','Spinner'));
  if(options.announce===false){delete preview.attrs.role;preview.attrs['aria-live']='off';}else Object.assign(preview.attrs,{role:'status','aria-live':'polite','aria-atomic':'true'});
 }
 if(id==='progress'){
  const maximum=options.max??100,value=options.value;
  if(!Number.isFinite(maximum)||maximum<=0)throw new Error('Progress max must be a positive finite number.');
  if(value!=null&&(!Number.isFinite(value)||value<0||value>maximum))throw new Error('Progress value must be between zero and max.');
  const label=part(preview,'label'),control=part(preview,'control'),display=part(preview,'value');
  text(label,named(options.label??'Forbereder indhold','Progress'));label.attrs={...label.attrs,for:identifier+'-progress'};
  control.attrs={...control.attrs,id:identifier+'-progress',max:String(maximum)};
  if(value==null)delete control.attrs.value;else control.attrs.value=String(value);
  if(options.valueText!==undefined)control.attrs['aria-valuetext']=String(options.valueText);
  const description=options.valueText??(value==null?'Arbejder…':Math.round(value/maximum*100)+' %');
  text(control,description);text(display,description);
 }
 if(id==='skeleton'){
  if(options.text!==undefined||options.slots?.root!==undefined)throw new Error('Skeleton is decorative and does not accept content.');
  preview.attrs['aria-hidden']='true';
 }
 if(id==='toast'||id==='empty-state'){
  const title=part(preview,'title'),body=part(preview,'body'),actions=part(preview,'actions');
  text(title,named(options.title??title.text,id));title.attrs={...title.attrs,id:identifier+'-title'};
  if(options.body!==undefined)text(body,options.body);
  body.attrs={...body.attrs,id:identifier+'-body'};
  const bodyValue=options.slots?.body??body.text;
  if(typeof bodyValue==='string'&&!bodyValue.trim())body.attrs.hidden=true;
  preview.attrs['aria-labelledby']=identifier+'-title';
  if(!body.attrs.hidden)preview.attrs['aria-describedby']=identifier+'-body';
  const content=options.slots?.actions??actions.children;
  actions.attrs={...actions.attrs,...(!content||Array.isArray(content)&&!content.length||typeof content==='string'&&!content.trim()?{hidden:true}:{})};
  if(id==='toast'){
   const close=part(preview,'close');close.attrs['aria-label']=named(options.closeLabel??'Luk meddelelsen','Toast close');
  }
 }
 return preview;
}

const setHidden=(node,value)=>{node.hidden=value;if(value)node.setAttribute('hidden','');else node.removeAttribute('hidden');};
const toastBindings=new WeakMap();
/** Bind one mounted toast. Product code owns placement and queues. No focus is moved. */
export function mountToast(root,{duration=5000,onClose,announce=true}={}){
 if(!root?.ownerDocument||!root.querySelector('.ds-toast__close')||!root.querySelector('.ds-toast__announcer'))throw new Error('mountToast requires the shared toast anatomy.');
 if(!Number.isFinite(duration)||duration<0)throw new Error('Toast duration must be a nonnegative finite number.');
 if(toastBindings.has(root))throw new Error('Toast is already mounted.');
 const document=root.ownerDocument,view=document.defaultView??globalThis;
 const schedule=(view.setTimeout??globalThis.setTimeout).bind(view),cancel=(view.clearTimeout??globalThis.clearTimeout).bind(view),now=()=>view.performance?.now?.()??Date.now();
 const closeButton=root.querySelector('.ds-toast__close'),announcer=root.querySelector('.ds-toast__announcer'),listeners=[],pauses=new Set();
 let remaining=duration,started=0,timer=null,announcementTimer=null,closed=false,destroyed=false;
 const listen=(node,type,fn)=>{if(node?.addEventListener){node.addEventListener(type,fn);listeners.push(()=>node.removeEventListener(type,fn));}};
 const hasActions=()=>{let found=false;const walk=node=>{if(node!==closeButton&&(['BUTTON','INPUT','SELECT','TEXTAREA'].includes(node.tagName)||node.tagName==='A'&&node.getAttribute('href')!==null||node.getAttribute('tabindex')!==null))found=true;for(const child of node.children??[])walk(child);};for(const child of root.children??[])walk(child);return found;};
 const stop=()=>{if(timer!==null){remaining=Math.max(0,remaining-(now()-started));cancel(timer);timer=null;}};
 const start=()=>{
  if(closed||destroyed||timer!==null||pauses.size||duration===0||hasActions())return;
  started=now();timer=schedule(()=>{timer=null;if(root.contains(document.activeElement)){pauses.add('focus');return;}if(hasActions())return;close('timeout');},remaining);
 };
 const pause=reason=>{pauses.add(reason);stop();},resume=reason=>{pauses.delete(reason);start();};
 function close(reason='dismissed'){
  if(closed||destroyed)return;closed=true;stop();cancel(announcementTimer);announcementTimer=null;announcer.textContent='';setHidden(root,true);onClose?.(reason);
 }
 listen(closeButton,'click',()=>close('dismissed'));
 listen(root,'pointerenter',()=>pause('hover'));listen(root,'pointerleave',()=>resume('hover'));
 listen(root,'focusin',()=>pause('focus'));listen(root,'focusout',event=>{if(!root.contains(event.relatedTarget))resume('focus');});
 const visibility=()=>document.hidden||document.visibilityState==='hidden'?pause('visibility'):resume('visibility');
 listen(document.addEventListener?document:document.body,'visibilitychange',visibility);
 if(root.contains(document.activeElement))pauses.add('focus');
 visibility();setHidden(root,false);
 if(announce){
  const message=[root.querySelector('.ds-toast__title')?.textContent,root.querySelector('.ds-toast__body')?.textContent].filter(Boolean).join('. ');
  announcer.textContent='';announcementTimer=schedule(()=>{announcementTimer=null;if(!closed&&!destroyed)announcer.textContent=message;},30);
 }else announcer.setAttribute('aria-live','off');
 const control={get closed(){return closed;},close,destroy(){if(destroyed)return;destroyed=true;stop();cancel(announcementTimer);for(const dispose of listeners)dispose();announcer.textContent='';toastBindings.delete(root);}};
 toastBindings.set(root,control);return control;
}

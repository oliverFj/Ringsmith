/** Attach to stable menu markup inside root. Triggers use aria-controls and
 * aria-haspopup="menu"; panels use role="menu". Supports a horizontal menubar,
 * standalone buttons and one submenu level. Product owns placement, commands
 * and checkbox/radio state (onAction receives the native item and event).
 * Remount after replacing markup; destroy removes listeners and closes panels.
 */
export function mountMenuControls(root, {onAction} = {}) {
 if(!root?.querySelectorAll)throw new Error('mountMenuControls requires a DOM root.');
 const document=root.ownerDocument, listeners=[], chain=[];
 const all=[...root.querySelectorAll('[role]')];
 const menus=all.filter(node=>node.getAttribute('role')==='menu');
 const bars=all.filter(node=>node.getAttribute('role')==='menubar');
 const itemRoles=new Set(['menuitem','menuitemcheckbox','menuitemradio']);
 const owner=node=>{for(let parent=node?.parentNode;parent&&root.contains(parent);parent=parent.parentNode)if(menus.includes(parent)||bars.includes(parent))return parent;return null;};
 const items=container=>all.filter(node=>itemRoles.has(node.getAttribute('role'))&&owner(node)===container&&!node.hidden&&!node.hasAttribute?.('hidden'));
 const triggers=[...root.querySelectorAll('[aria-controls]')].filter(node=>['menu','true'].includes(node.getAttribute('aria-haspopup')));
 const pairs=new Map(triggers.map(trigger=>[trigger,menus.find(menu=>menu.getAttribute('id')===trigger.getAttribute('aria-controls'))]).filter(([,menu])=>menu));
 const disabled=node=>node.disabled||node.getAttribute('disabled')!==null||node.getAttribute('aria-disabled')==='true';
 const listen=(node,type,fn)=>{node.addEventListener(type,fn);listeners.push([node,type,fn]);};
 const hidden=(node,value)=>{node.hidden=value;if(value)node.setAttribute('hidden','');else node.removeAttribute('hidden');};
 let destroyed=false,typeText='',typeAt=0,typeOwner=null;
 function barStop(item){const bar=owner(item);if(bars.includes(bar))for(const sibling of items(bar))sibling.setAttribute('tabindex',sibling===item?'0':'-1');}
 function focus(item){if(!item)return;barStop(item);item.focus();}
 function closeFrom(index=0,restore=false){
  const trigger=chain[index]?.trigger;
  for(const entry of chain.splice(index).reverse()){hidden(entry.menu,true);entry.trigger.setAttribute('aria-expanded','false');}
  typeText='';if(restore&&trigger?.isConnected!==false)focus(trigger);
 }
 function open(trigger,{last=false}={}){
  const menu=pairs.get(trigger);if(destroyed||!menu||disabled(trigger))return false;
  const parent=owner(trigger),parentIndex=chain.findIndex(entry=>entry.menu===parent);
  // One nested menu level; never create an inaccessible recursive chain.
  if(menus.includes(parent)&&(parentIndex<0||parentIndex>=1))return false;
  closeFrom(parentIndex+1);
  hidden(menu,false);trigger.setAttribute('aria-expanded','true');barStop(trigger);
  chain.push({trigger,menu});const candidates=items(menu);
  if(candidates.length)focus(last?candidates.at(-1):candidates[0]);else{menu.setAttribute('tabindex','-1');menu.focus();}
  return true;
 }
 function activate(item,event){
  if(disabled(item)){event.preventDefault();return;}
  if(pairs.has(item)){open(item);return;}
  // Close before dispatch: a command may open a dialog and move focus itself.
  closeFrom(0,true);onAction?.(item,event);
 }
 function moveBar(bar,current,delta,withMenu){
  const candidates=items(bar),index=candidates.indexOf(current),target=candidates[(index+delta+candidates.length)%candidates.length];
  closeFrom();focus(target);if(withMenu)open(target);
 }
 for(const menu of menus){hidden(menu,true);for(const item of items(menu)){item.setAttribute('tabindex','-1');if(item.getAttribute('disabled')!==null){item.removeAttribute('disabled');item.setAttribute('aria-disabled','true');}}}
 for(const trigger of pairs.keys())trigger.setAttribute('aria-expanded','false');
 for(const bar of bars){const candidates=items(bar),active=candidates.find(item=>item.getAttribute('tabindex')==='0')??candidates[0];if(active)barStop(active);}
 function nodeAt(target){for(let node=target;node&&node!==root;node=node.parentNode)if(pairs.has(node)||itemRoles.has(node.getAttribute?.('role'))||menus.includes(node))return node;return null;}
 listen(root,'click',event=>{
  const item=nodeAt(event.target);if(!item||menus.includes(item))return;
  if(disabled(item)){event.preventDefault();event.stopPropagation();return;}
  if(pairs.has(item)){event.preventDefault();if(chain.some(entry=>entry.trigger===item)){closeFrom(chain.findIndex(entry=>entry.trigger===item),true);}else open(item);}
  else if(owner(item)){activate(item,event);}
 });
 listen(root,'focusin',event=>{const item=nodeAt(event.target);if(item)barStop(item);});
 listen(root,'keydown',event=>{
  if(event.defaultPrevented||event.isComposing)return;
  const item=nodeAt(event.target);if(!item)return;
  const container=menus.includes(item)?item:owner(item),bar=bars.includes(container),menu=menus.includes(container);
  const key=event.key;
  if(key==='Tab'){if(chain.length){const trigger=chain[0].trigger;closeFrom();focus(trigger);}return;}
  if(key==='Escape'&&chain.length){event.preventDefault();event.stopPropagation();closeFrom(chain.length-1,true);return;}
  if(event.altKey||event.ctrlKey||event.metaKey)return;
  if(key==='Enter'||key===' '){if(!menus.includes(item)){event.preventDefault();if(pairs.has(item))open(item);else item.click();}return;}
  if(pairs.has(item)&&!menu&&(key==='ArrowDown'||key==='ArrowUp')){event.preventDefault();open(item,{last:key==='ArrowUp'});return;}
  const candidates=items(container),index=candidates.indexOf(item);
  if(bar&&(key==='ArrowRight'||key==='ArrowLeft')){event.preventDefault();moveBar(container,item,key==='ArrowRight'?1:-1,chain.length>0);return;}
  if(menu&&key==='ArrowRight'&&pairs.has(item)){event.preventDefault();open(item);return;}
  if(menu&&key==='ArrowLeft'&&chain.length>1){event.preventDefault();closeFrom(chain.length-1,true);return;}
  if(menu&&(key==='ArrowRight'||key==='ArrowLeft')){
   const top=chain[0]?.trigger,topBar=owner(top);if(bars.includes(topBar)){event.preventDefault();moveBar(topBar,top,key==='ArrowRight'?1:-1,true);}return;
  }
  let target;
  if(key==='Home')target=candidates[0];else if(key==='End')target=candidates.at(-1);
  else if(menu&&(key==='ArrowDown'||key==='ArrowUp'))target=candidates[(index+(key==='ArrowDown'?1:-1)+candidates.length)%candidates.length];
  else if((bar||menu)&&key.length===1){
   const now=Date.now();typeText=now-typeAt>700||typeOwner!==container?key:typeText+key;typeAt=now;typeOwner=container;
   const text=typeText.toLocaleLowerCase(),needle=[...text].every(char=>char===text[0])?text[0]:text;
   target=[...candidates.slice(index+1),...candidates.slice(0,index+1)].find(node=>(node.getAttribute('aria-label')??node.querySelector('.ds-menu-item__label')?.textContent??node.textContent).trim().toLocaleLowerCase().startsWith(needle));
  }
  if(target){event.preventDefault();if(bar)closeFrom();focus(target);}
 });
 const outside=event=>{if(chain.length&&!chain.some(({trigger,menu})=>trigger.contains(event.target)||menu.contains(event.target)))closeFrom();};
 const eventHost=document?.addEventListener?document:document?.body;
 if(eventHost){listen(eventHost,'pointerdown',outside);listen(eventHost,'focusin',outside);}
 return {open,close:()=>closeFrom(0,true),destroy(){if(destroyed)return;const restore=chain.some(({menu})=>menu.contains(document.activeElement));closeFrom(0,restore);destroyed=true;for(const [node,type,fn]of listeners)node.removeEventListener(type,fn);}};
}

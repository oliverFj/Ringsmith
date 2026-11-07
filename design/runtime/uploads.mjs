const findPart=(node,name)=>node?.part===name?node:(node?.children??[]).map(child=>findPart(child,name)).find(Boolean);
const setText=(node,value)=>{node.text=String(value);delete node.children;};

function policy(options={}){
 const accept=options.accept??'',multiple=options.multiple??false,maxSize=options.maxSize??Infinity,maxFiles=options.maxFiles??(multiple?Infinity:1);
 if(typeof accept!=='string')throw new Error('File accept must be a comma-separated string.');
 if(typeof multiple!=='boolean')throw new Error('File multiple must be a boolean.');
 if(maxSize!==Infinity&&(!Number.isFinite(maxSize)||maxSize<=0))throw new Error('File maxSize must be a positive byte count.');
 if(maxFiles!==Infinity&&(!Number.isInteger(maxFiles)||maxFiles<1))throw new Error('File maxFiles must be a positive integer.');
 const types=accept.split(',').map(value=>value.trim().toLowerCase()).filter(Boolean);
 for(const type of types)if(!/^\.[a-z0-9][a-z0-9._+-]*$/i.test(type)&&! /^[a-z0-9!#$&^_.+-]+\/(?:\*|[a-z0-9!#$&^_.+-]+)$/i.test(type))throw new Error('Unsupported file accept filter: '+type);
 return {accept:types.join(','),types,multiple,maxSize,maxFiles:multiple?maxFiles:Math.min(1,maxFiles)};
}

/** Validate metadata locally. This neither reads file contents nor uploads files. */
export function validateFileSelection(selection,options={}){
 const config=policy(options),files=Array.from(selection??[]),errors=[];
 if(files.length>config.maxFiles)errors.push({code:'max-files',message:'Vælg højst '+config.maxFiles+' '+(config.maxFiles===1?'fil.':'filer.')});
 for(const file of files){
  if(!file||typeof file.name!=='string'||!file.name||!Number.isFinite(file.size)||file.size<0){errors.push({code:'invalid-file',message:'Valget indeholder en ugyldig fil.'});continue;}
  const name=file.name.toLowerCase(),mime=String(file.type??'').toLowerCase();
  if(config.types.length&&!config.types.some(type=>type.startsWith('.')?name.endsWith(type):type.endsWith('/*')?mime.startsWith(type.slice(0,-1)):mime===type))errors.push({code:'accept',fileName:file.name,message:file.name+': Filtypen er ikke tilladt.'});
  if(file.size>config.maxSize)errors.push({code:'max-size',fileName:file.name,message:file.name+': Filen er større end '+config.maxSize+' bytes.'});
 }
 return {valid:errors.length===0,files,errors};
}

export function normalizeFileUploadPreview(source,options,identifier){
 if(options.value!==undefined)throw new Error('File inputs cannot be prefilled. Supply existing files to mountFileUpload.');
 if(options.type!==undefined&&options.type!=='file')throw new Error('file-upload requires native type=file.');
 if(options.drop!==undefined&&typeof options.drop!=='boolean')throw new Error('File drop must be a boolean.');
 const config=policy(options),preview=structuredClone(source),control=findPart(preview,'control'),label=findPart(preview,'label'),hint=findPart(preview,'hint'),error=findPart(preview,'error'),status=findPart(preview,'status');
 const name=String(options.label??label.text).trim();if(!name)throw new Error('File upload requires a non-empty label.');
 setText(label,name);label.attrs={...label.attrs,for:identifier+'-files'};
 if(options.hint!==undefined)setText(hint,options.hint);
 const hintContent=options.slots?.hint??hint.text,errorContent=options.slots?.error??options.error??'';
 hint.attrs={...hint.attrs,id:identifier+'-hint',...(typeof hintContent==='string'&&!hintContent.trim()?{hidden:true}:{})};
 setText(error,options.error??'');error.attrs={...error.attrs,id:identifier+'-error',...(typeof errorContent==='string'&&!errorContent.trim()?{hidden:true}:{})};
 status.attrs={...status.attrs,id:identifier+'-status'};
 control.attrs={...control.attrs,type:'file',id:identifier+'-files',...(config.accept?{accept:config.accept}:{}),...(config.multiple?{multiple:true}:{}),'aria-describedby':[...(!hint.attrs.hidden?[identifier+'-hint']:[]),...(!error.attrs.hidden?[identifier+'-error']:[])].join(' ')};
 if(!error.attrs.hidden)control.attrs['aria-invalid']='true';
 preview.attrs={...preview.attrs,'data-upload-accept':config.accept,'data-upload-multiple':String(config.multiple),'data-upload-drop':String(options.drop??options.variant==='drop')};
 if(!error.attrs.hidden)preview.attrs['aria-invalid']='true';
 if(config.maxSize!==Infinity)preview.attrs['data-upload-max-size']=String(config.maxSize);
 if(config.maxFiles!==Infinity)preview.attrs['data-upload-max-files']=String(config.maxFiles);
 return preview;
}

const hidden=(node,value)=>{node.hidden=value;if(value)node.setAttribute('hidden','');else node.removeAttribute('hidden');};
const bound=new WeakMap();
/** Local file selection. Accepted files are kept in memory, never sent remotely. */
export function mountFileUpload(root,options={}){
 const input=root?.querySelector?.('.ds-file-upload__control'),list=root?.querySelector?.('.ds-file-upload__list'),error=root?.querySelector?.('.ds-file-upload__error'),status=root?.querySelector?.('.ds-file-upload__status');
 if(!root?.ownerDocument||input?.tagName!=='INPUT'||input.getAttribute('type')!=='file'||!list||!error||!status)throw new Error('mountFileUpload requires the shared native file-upload anatomy.');
 if(bound.has(root))throw new Error('File upload is already mounted.');
 const fromAttribute=(name,fallback)=>root.getAttribute(name)===null?fallback:Number(root.getAttribute(name));
 const config=policy({accept:options.accept??input.getAttribute('accept')??'',multiple:options.multiple??(input.getAttribute('multiple')!==null),maxSize:options.maxSize??fromAttribute('data-upload-max-size',Infinity),maxFiles:options.maxFiles??fromAttribute('data-upload-max-files',Infinity)});
 const initial=validateFileSelection(options.files??[],config);if(!initial.valid)throw new Error('Initial file selection is invalid: '+initial.errors.map(issue=>issue.message).join(' '));
 const drop=options.drop??root.getAttribute('data-upload-drop')==='true';if(typeof drop!=='boolean')throw new Error('File drop must be a boolean.');
 const document=root.ownerDocument,listeners=[];let files=initial.files,destroyed=false;
 const disabled=()=>input.disabled||input.getAttribute('disabled')!==null||input.getAttribute('aria-disabled')==='true'||root.getAttribute('aria-disabled')==='true';
 const listen=(node,type,handler)=>{node.addEventListener(type,handler);listeners.push(()=>node.removeEventListener(type,handler));};
 const describeError=visible=>{
  const id=error.getAttribute('id'),ids=new Set((input.getAttribute('aria-describedby')??'').split(/\s+/).filter(Boolean));
  if(id){if(visible)ids.add(id);else ids.delete(id);}
  if(ids.size)input.setAttribute('aria-describedby',[...ids].join(' '));else input.removeAttribute('aria-describedby');
 };
 const showError=issues=>{error.textContent=issues.map(issue=>issue.message).join(' ');hidden(error,!issues.length);describeError(Boolean(issues.length));for(const node of [input,root])if(issues.length)node.setAttribute('aria-invalid','true');else node.removeAttribute('aria-invalid');};
 const paint=()=>{
  list.replaceChildren();
  files.forEach((file,index)=>{
   const item=document.createElement('li'),name=document.createElement('span'),remove=document.createElement('button');
   item.className='ds-file-upload__item';name.className='ds-file-upload__name';name.textContent=file.name;remove.className='ds-file-upload__remove';remove.setAttribute('type','button');remove.setAttribute('aria-label','Fjern '+file.name);remove.textContent='Fjern';
   if(disabled())remove.setAttribute('disabled','');
   remove.addEventListener('click',event=>{if(disabled())return;const nextIndex=Math.min(index,files.length-2);if(setFiles(files.filter((_,itemIndex)=>itemIndex!==index),{source:'remove',event})){const target=nextIndex>=0?list.children[nextIndex]?.querySelector('button'):input;target?.focus();}});
   item.append(name,remove);list.appendChild(item);
  });
 };
 function setFiles(selection,{source='programmatic',event}={}){
  if(destroyed||disabled())return false;
  const result=validateFileSelection(selection,config);
  if(!result.valid){showError(result.errors);options.onInvalid?.(result.errors,{source,event});return false;}
  files=result.files;if(source!=='input')input.value='';showError([]);paint();status.textContent=files.length===0?'Filvalget er ryddet.':files.length+' '+(files.length===1?'fil valgt.':'filer valgt.');
  options.onChange?.([...files],{source,event});return true;
 }
 if(config.accept)input.setAttribute('accept',config.accept);else input.removeAttribute('accept');
 if(config.multiple)input.setAttribute('multiple','');else input.removeAttribute('multiple');
 if(options.announce===false){status.setAttribute('aria-live','off');error.setAttribute('aria-live','off');}
 listen(input,'change',event=>{const selected=Array.from(input.files??[]);if(selected.length&&!setFiles(selected,{source:'input',event}))input.value='';});
 // Native cancel and an empty change event preserve the accepted selection.
 if(drop){
  const hasFiles=event=>Array.from(event.dataTransfer?.types??[]).includes('Files')||Boolean(event.dataTransfer?.files?.length);
  listen(root,'dragover',event=>{if(!hasFiles(event))return;event.preventDefault();if(!disabled()){root.setAttribute('data-drag-state','over');if(event.dataTransfer)event.dataTransfer.dropEffect='copy';}});
  listen(root,'dragleave',event=>{if(!root.contains(event.relatedTarget))root.removeAttribute('data-drag-state');});
  listen(root,'drop',event=>{if(!hasFiles(event))return;event.preventDefault();root.removeAttribute('data-drag-state');const selected=Array.from(event.dataTransfer?.files??[]);if(selected.length)setFiles(selected,{source:'drop',event});});
 }
 paint();
 const control={get files(){return [...files];},setFiles,clear(){return setFiles([],{source:'clear'});},remove(index){if(!Number.isInteger(index)||index<0||index>=files.length)return false;return setFiles(files.filter((_,itemIndex)=>itemIndex!==index),{source:'remove'});},destroy(){if(destroyed)return;destroyed=true;for(const dispose of listeners)dispose();bound.delete(root);root.removeAttribute('data-drag-state');}};
 bound.set(root,control);return control;
}

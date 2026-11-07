/** Editable tabular data. Native controls edit cells; one roving cell is the
 * grid's tab stop. Data is a working view; product callbacks own persistence.
 */
const defaultColumns=[{id:'name',label:'Projekt',editable:true},{id:'quantity',label:'Antal',type:'number',min:0,step:1,editable:true},{id:'status',label:'Status',type:'select',options:[{value:'Kladde',label:'Kladde'},{value:'Klar',label:'Klar'}],editable:true}];
const defaultRows=[{id:'one',label:'Projekt A',cells:{name:'Projekt A',quantity:4,status:'Kladde'}},{id:'two',label:'Projekt B',cells:{name:'Projekt B',quantity:2,status:'Klar'}}];
const text=value=>value==null?'':String(value);
const cloneRows=rows=>rows.map(row=>({...row,cells:{...row.cells}}));
const set=(node,name,value)=>value==null?node.removeAttribute(name):node.setAttribute(name,String(value));
const hidden=(node,value)=>{node.hidden=value;if(value)node.setAttribute('hidden','');else node.removeAttribute('hidden');};
const sameCell=(a,b)=>a?.rowId===b?.rowId&&a?.columnId===b?.columnId;
function checkedData(options){
 if(options.label!==undefined&&!text(options.label).trim())throw new Error('Grid label must not be empty.');
 const columns=options.columns??defaultColumns,rows=options.rows??defaultRows;
 if(!Array.isArray(columns)||!columns.length||!Array.isArray(rows))throw new Error('Data grid requires columns and rows.');
 const columnIds=new Set(),rowIds=new Set();
 for(const column of columns){
  if(!column||!text(column.id).trim()||columnIds.has(text(column.id))||!text(column.label).trim())throw new Error('Grid columns require unique IDs and labels.');
  columnIds.add(text(column.id));if(!['text','number','select','textarea'].includes(column.type??'text'))throw new Error('Unsupported grid editor type.');
  for(const key of ['min','max','step'])if(column[key]!==undefined&&(!Number.isFinite(Number(column[key]))||key==='step'&&Number(column[key])<=0))throw new Error('Invalid numeric grid constraint.');
  if(column.min!==undefined&&column.max!==undefined&&Number(column.min)>Number(column.max))throw new Error('Grid minimum exceeds maximum.');
  if(column.type==='select'){
   if(!Array.isArray(column.options)||!column.options.length||new Set(column.options.map(item=>text(item.value))).size!==column.options.length||column.options.some(item=>!text(item.label).trim()))throw new Error('Select editors require unique values and labels.');
  }
 }
 for(const row of rows){if(!row||!text(row.id).trim()||rowIds.has(text(row.id))||!row.cells||typeof row.cells!=='object'||Array.isArray(row.cells))throw new Error('Grid rows require unique IDs and a cells object.');rowIds.add(text(row.id));for(const column of columns)if(row.cells[column.id]!=null&&!['string','number','boolean'].includes(typeof row.cells[column.id]))throw new Error('Grid cell values must be text, numbers or booleans.');}
 return {columns:columns.map(column=>({...column,id:text(column.id)})),rows:cloneRows(rows).map(row=>({...row,id:text(row.id)}))};
}
const editable=(config,row,column)=>!config.disabled&&!config.readOnly&&!row.disabled&&!row.readOnly&&column.editable===true;

/** Same escaped declarative anatomy feeds renderComponent and native creation. */
export function normalizeDataGridPreview(preview,options,identifier){
 if(options.text!==undefined)throw new Error('Data grid uses label, columns and rows instead of root text.');
 const states=(Array.isArray(options.state)?options.state:[options.state]).filter(Boolean);options={...options,readOnly:options.readOnly||states.includes('readOnly')};
 const {columns,rows}=checkedData(options),active=options.activeCell??(rows.length?{rowId:rows[0].id,columnId:columns[0].id}:null);
 if(active&&(!rows.some(row=>row.id===text(active.rowId))||!columns.some(column=>column.id===text(active.columnId))))throw new Error('Unknown active grid cell.');
 const node={tag:'section',part:'root',attrs:{'data-data-grid':'','data-grid-prefix':identifier},children:[
  {tag:'p',part:'instructions',attrs:{id:identifier+'-instructions'},text:'Brug piletaster til at flytte fokus. Enter eller F2 redigerer. Escape annullerer. Shift og piletaster markerer flere celler.'},
  {tag:'div',part:'viewport',attrs:{'data-grid-viewport':''},children:[{tag:'table',part:'table',attrs:{role:'grid','aria-labelledby':identifier+'-caption','aria-describedby':identifier+'-instructions','aria-rowcount':String(rows.length+1),'aria-colcount':String(columns.length),'aria-multiselectable':'true',...(!rows.length?{tabindex:'0'}:{})},children:[
   {tag:'caption',part:'caption',attrs:{id:identifier+'-caption'},text:text(options.label??'Redigerbare oplysninger')},
   {tag:'thead',part:'head',children:[{tag:'tr',part:'header-row',attrs:{role:'row','aria-rowindex':'1'},children:columns.map((column,index)=>({tag:'th',part:'header',text:column.label,attrs:{role:'columnheader',scope:'col','aria-colindex':String(index+1),'data-grid-column':column.id}}))}]},
   {tag:'tbody',part:'body',attrs:{'data-grid-body':''},children:rows.map((row,rowIndex)=>({tag:'tr',part:'row',attrs:{role:'row','data-grid-row':row.id,'aria-rowindex':String(rowIndex+2),...(row.disabled?{'aria-disabled':'true'}:{})},children:columns.map((column,columnIndex)=>({tag:'td',part:'cell',text:text(row.cells[column.id]),attrs:{role:'gridcell','data-grid-column':column.id,'aria-colindex':String(columnIndex+1),'aria-readonly':String(!editable(options,row,column)),tabindex:row.id===active?.rowId&&column.id===active?.columnId?'0':'-1',...(row.disabled?{'aria-disabled':'true'}:{})}}))}))},
  ]}]},
  {tag:'p',part:'empty',attrs:{'data-grid-empty':'',...(rows.length?{hidden:true}:{})},text:'Der er ingen rækker at vise.'},
  {tag:'p',part:'error',attrs:{id:identifier+'-error',role:'alert',hidden:true,'data-grid-error':''},text:''},
  {tag:'p',part:'status',attrs:{role:'status','data-grid-status':'','aria-live':'polite','aria-atomic':'true'},text:rows.length+' rækker · '+columns.length+' kolonner'},
 ]};
 const first=node.children[1].children[0].children[2].children[0]?.children[0];if(first&&states.length){first.attrs['data-state']=states.join(' ');if(states.includes('selected'))first.attrs['aria-selected']='true';}
 if(states.includes('invalid')){node.children[3].attrs.hidden=false;node.children[3].text='Kontrollér værdien. Den afviste kladde bevares.';}
 return node;
}

/** Tab-separated text with quoted multiline fields, compatible with spreadsheets. */
export function serializeGridTSV(matrix){return matrix.map(row=>row.map(value=>{const cell=text(value);return !cell||/[\t\r\n"]/.test(cell)?'"'+cell.replaceAll('"','""')+'"':cell;}).join('\t')).join('\r\n');}
export function parseGridTSV(source){
 if(typeof source!=='string')throw new Error('Paste requires plain text.');
 const result=[],row=[];let value='',quoted=false,afterQuote=false;
 const field=()=>{row.push(value);value='';afterQuote=false;};const line=()=>{field();result.push(row.splice(0));};
 for(let i=0;i<source.length;i++){
  const char=source[i];
  if(quoted){if(char==='"'){if(source[i+1]==='"'){value+='"';i++;}else{quoted=false;afterQuote=true;}}else value+=char;continue;}
  if(char==='"'&&!value&&!afterQuote){quoted=true;continue;}
  if(char==='\t'){field();continue;}
  if(char==='\r'||char==='\n'){if(char==='\r'&&source[i+1]==='\n')i++;line();continue;}
  if(afterQuote)throw new Error('Ugyldig tekst efter et citeret felt.');value+=char;
 }
 if(quoted)throw new Error('Et citeret felt er ikke afsluttet.');
 if(value||afterQuote||row.length||!result.length)line();
 if(result.reduce((sum,row)=>sum+row.length,0)>10000)throw new Error('Indsæt højst 10.000 celler ad gangen.');
 if(result.some(row=>row.length!==result[0].length))throw new Error('De indsatte rækker har forskelligt antal kolonner.');
 return result;
}

/** Bind stable shared grid markup. update() reconciles keyed rows/cells. An
 * update removing the current edit target returns false and retains the draft.
 * validateCell is synchronous; onCommit runs after the view accepts a batch.
 */
export function mountDataGrid(host,options={}){
 const root=host?.getAttribute?.('data-data-grid')!==null&&host?.getAttribute?.('data-data-grid')!==undefined?host:host?.querySelector?.('[data-data-grid]');
 if(!root)throw new Error('mountDataGrid requires shared grid markup.');
 const document=root.ownerDocument,table=root.querySelector('[role="grid"]'),body=root.querySelector('[data-grid-body]'),head=root.querySelector('thead'),status=root.querySelector('[data-grid-status]'),error=root.querySelector('[data-grid-error]'),empty=root.querySelector('[data-grid-empty]');
 if(!table||!body||!head||!status||!error||!empty)throw new Error('Grid anatomy is incomplete.');
 const identifier=root.getAttribute('data-grid-prefix'),listeners=[],records=new Map();
 let config={columns:[],rows:[]},active=null,anchor=null,range=null,edit=null,destroyed=false;
 const listen=(type,handler)=>{root.addEventListener(type,handler);listeners.push([type,handler]);};
 const find=(rowId,columnId)=>records.get(rowId)?.cells.get(columnId);
 const point=cell=>({rowId:cell.rowId,columnId:cell.columnId});
 const coords=cell=>({row:config.rows.findIndex(row=>row.id===cell?.rowId),column:config.columns.findIndex(column=>column.id===cell?.columnId)});
 const rowFor=id=>config.rows.find(row=>row.id===id),columnFor=id=>config.columns.find(column=>column.id===id);
 const announce=message=>{status.textContent=message;};
 function showError(message){error.textContent=message;hidden(error,!message);if(edit){set(edit.input,'aria-invalid',message?'true':null);set(edit.input,'aria-describedby',message?identifier+'-error':null);}}
 function bounds(){if(!range)return null;const a=coords(range.start),b=coords(range.end);if(Math.min(a.row,a.column,b.row,b.column)<0)return null;return {top:Math.min(a.row,b.row),bottom:Math.max(a.row,b.row),left:Math.min(a.column,b.column),right:Math.max(a.column,b.column)};}
 function paint(){
  const selected=bounds();for(const [rowId,record]of records)for(const [columnId,cell]of record.cells){
   const pos=coords({rowId,columnId}),chosen=Boolean(selected&&pos.row>=selected.top&&pos.row<=selected.bottom&&pos.column>=selected.left&&pos.column<=selected.right);
   set(cell,'tabindex',sameCell(active,{rowId,columnId})&&!sameCell(edit,{rowId,columnId})?'0':'-1');set(cell,'aria-selected',chosen?'true':null);
  }
  if(config.rows.length)set(table,'tabindex',null);else set(table,'tabindex','0');
 }
 function move(next,{extend=false,focus=true,select=false}={}){
  if(!next||!find(next.rowId,next.columnId))return false;
  const previous=active;if(extend){anchor??=previous??next;range={start:{...anchor},end:{...next}};}else{anchor={...next};if(select)range={start:{...next},end:{...next}};}
  active={...next};paint();if(focus){const cell=find(next.rowId,next.columnId);cell.focus();cell.scrollIntoView?.({block:'nearest',inline:'nearest'});}
  if(!sameCell(previous,active))config.onActiveCellChange?.({...active});if(!destroyed&&(extend||select))config.onSelectionChange?.(selection());return true;
 }
 function clearSelection(){if(destroyed)return false;range=null;paint();config.onSelectionChange?.(null);return true;}
 function selection(){const area=bounds();return area?{start:{...range.start},end:{...range.end},...area}:null;}
 function locate(target){for(let node=target;node&&node!==root;node=node.parentNode)if(node.getAttribute?.('role')==='gridcell'){const row=node.parentNode?.getAttribute('data-grid-row'),column=node.getAttribute('data-grid-column');if(find(row,column)===node)return {rowId:row,columnId:column,node};}return null;}
 function mayEdit(cell){const row=rowFor(cell.rowId),column=columnFor(cell.columnId);return row&&column&&editable(config,row,column);}
 function coerce(raw,column){
  const value=text(raw);
  if(column.required&&!value.trim())throw new Error('Værdien skal udfyldes.');
  if(column.type==='number'&&value.trim()){
   if(!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(value.trim()))throw new Error('Skriv et gyldigt tal med punktum som decimaltegn.');
   const number=Number(value);if(!Number.isFinite(number))throw new Error('Skriv et gyldigt tal.');
   if(column.min!==undefined&&number<Number(column.min))throw new Error('Værdien skal mindst være '+column.min+'.');
   if(column.max!==undefined&&number>Number(column.max))throw new Error('Værdien må højst være '+column.max+'.');
   if(column.step!==undefined){const steps=(number-Number(column.min??0))/Number(column.step);if(Math.abs(steps-Math.round(steps))>1e-8)throw new Error('Værdien skal følge trinnet '+column.step+'.');}
   return number;
  }
  if(column.type==='select'&&value&&!column.options.some(option=>text(option.value)===value&&!option.disabled))throw new Error('Vælg en tilgængelig mulighed.');
  return value;
 }
 function proposed(changes){
  const nextRows=cloneRows(config.rows);
  for(const change of changes){if(!mayEdit(change))throw new Error('En af de valgte celler kan ikke redigeres.');const column=columnFor(change.columnId);change.value=coerce(change.value,column);change.previousValue=rowFor(change.rowId).cells[change.columnId];nextRows.find(row=>row.id===change.rowId).cells[change.columnId]=change.value;}
  for(const change of changes){const message=config.validateCell?.(change.value,{...change,row:nextRows.find(row=>row.id===change.rowId),column:columnFor(change.columnId),rows:cloneRows(nextRows)});if(message&&typeof message.then==='function')throw new Error('Valideringen skal være afsluttet synkront.');if(message===false||typeof message==='string'&&message)throw new Error(typeof message==='string'?message:'Værdien kan ikke anvendes.');}
  return nextRows;
 }
 function notify(changes,reason){try{config.onCommit?.(changes.map(change=>({...change})),{reason,rows:cloneRows(config.rows)});}catch(cause){showError('Ændringen er bevaret, men produktets handling fejlede: '+text(cause.message??cause));}}
 function finishEdit({restoreFocus=true}={}){if(!edit)return;const previous=edit;edit=null;set(previous.cell,'data-editing',null);set(previous.cell,'aria-invalid',null);previous.cell.textContent=text(rowFor(previous.rowId)?.cells[previous.columnId]);showError('');paint();if(restoreFocus)previous.cell.focus();}
 function commitEdit({restoreFocus=true}={}){
  if(destroyed)return false;
  if(!edit)return true;
  try{
   if(text(rowFor(edit.rowId)?.cells[edit.columnId])!==text(edit.original))throw new Error('Værdien er ændret udenfor cellen. Bevar din kladde, og annullér redigeringen før du fortsætter.');
   if(edit.input.validity?.valid===false)throw new Error(edit.input.validationMessage||'Skriv en gyldig værdi.');
   const changes=[{rowId:edit.rowId,columnId:edit.columnId,value:edit.input.value}],nextRows=proposed(changes);
   config.rows=nextRows;finishEdit({restoreFocus});paint();announce('Værdien er anvendt.');notify(changes,'edit');return true;
  }catch(cause){showError(text(cause.message??cause));return false;}
 }
 function cancelEdit({restoreFocus=true}={}){if(destroyed)return false;if(edit){finishEdit({restoreFocus});announce('Redigeringen er annulleret.');}return true;}
 function startEdit(cell=active,initialText){
  if(destroyed||!cell||!mayEdit(cell)){announce('Cellen kan ikke redigeres.');return false;}
  if(edit&&sameCell(edit,cell)){edit.input.focus();return true;}if(edit&&!commitEdit())return false;
  if(destroyed||!mayEdit(cell)||!find(cell.rowId,cell.columnId))return false;
  move(cell,{focus:false});if(destroyed||!mayEdit(cell)||!find(cell.rowId,cell.columnId))return false;
  const row=rowFor(cell.rowId),column=columnFor(cell.columnId),node=find(cell.rowId,cell.columnId),multiline=column.type==='textarea'||(column.type??'text')==='text'&&/[\r\n]/.test(text(row.cells[column.id])),input=document.createElement(column.type==='select'?'select':multiline?'textarea':'input');
  input.setAttribute('class','ds-data-grid__editor');input.setAttribute('aria-label',column.label+', '+text(row.label??row.id));
  if(column.type==='select'){
   const items=column.required?column.options:[{value:'',label:'Vælg en mulighed'},...column.options];
   for(const item of items){const option=document.createElement('option');option.setAttribute('value',text(item.value));option.textContent=item.label;if(item.disabled)option.setAttribute('disabled','');input.append(option);}
  }else if(!multiline){input.setAttribute('type','text');if(column.type==='number')input.setAttribute('inputmode','decimal');}
  if(column.required)input.setAttribute('required','');input.value=column.type==='select'?text(column.options.find(option=>initialText!==undefined&&!option.disabled&&option.label.toLocaleLowerCase().startsWith(initialText.toLocaleLowerCase()))?.value??row.cells[column.id]):initialText??text(row.cells[column.id]);
  edit={rowId:cell.rowId,columnId:cell.columnId,cell:node,input,multiline,original:row.cells[column.id]};node.replaceChildren(input);set(node,'data-editing','true');showError('');paint();input.focus();if(initialText===undefined)input.select?.();config.onDraftChange?.(draft());return true;
 }
 function draft(){return edit?{rowId:edit.rowId,columnId:edit.columnId,value:edit.input.value,original:edit.original,error:error.textContent}:null;}
 function copySelection(){const area=bounds()??(active?{top:coords(active).row,bottom:coords(active).row,left:coords(active).column,right:coords(active).column}:null);return area?serializeGridTSV(config.rows.slice(area.top,area.bottom+1).map(row=>config.columns.slice(area.left,area.right+1).map(column=>row.cells[column.id]))):'';}
 function paste(source){
  if(destroyed||edit||!active)return false;
  try{
   const matrix=parseGridTSV(source),origin=bounds()??{top:coords(active).row,left:coords(active).column};
   if(origin.top+matrix.length>config.rows.length||origin.left+matrix[0].length>config.columns.length)throw new Error('De indsatte celler går ud over det eksisterende område.');
   const changes=[];for(let r=0;r<matrix.length;r++)for(let c=0;c<matrix[r].length;c++)changes.push({rowId:config.rows[origin.top+r].id,columnId:config.columns[origin.left+c].id,value:matrix[r][c]});
   const nextRows=proposed(changes);config.rows=nextRows;for(const change of changes)find(change.rowId,change.columnId).textContent=text(change.value);
   range={start:{rowId:config.rows[origin.top].id,columnId:config.columns[origin.left].id},end:{rowId:config.rows[origin.top+matrix.length-1].id,columnId:config.columns[origin.left+matrix[0].length-1].id}};paint();showError('');announce(changes.length+' celler er anvendt.');notify(changes,'paste');return true;
  }catch(cause){showError(text(cause.message??cause));return false;}
 }
 function update(next={}){
  if(destroyed)throw new Error('Grid controller has been destroyed.');
  const candidate={...config,...next,...checkedData({...config,...next})};
  if(next.activeCell&&(!candidate.rows.some(row=>row.id===next.activeCell.rowId)||!candidate.columns.some(column=>column.id===next.activeCell.columnId)))throw new Error('Unknown active grid cell.');
  if(edit&&(!candidate.rows.some(row=>row.id===edit.rowId)||!candidate.columns.some(column=>column.id===edit.columnId))){showError('Afslut eller annullér kladden, før dens række eller kolonne fjernes.');return false;}
  if(edit){
   const shape=column=>JSON.stringify(['type','min','max','step','required','options'].map(key=>column[key]??null)),newColumn=candidate.columns.find(column=>column.id===edit.columnId),newRow=candidate.rows.find(row=>row.id===edit.rowId);
   if(shape(columnFor(edit.columnId))!==shape(newColumn)||!editable(candidate,newRow,newColumn)){showError('Afslut eller annullér kladden, før editorens opsætning ændres.');return false;}
  }
  const wasFocused=table.contains(document.activeElement),editingFocused=edit&&edit.input===document.activeElement,selectionState=editingFocused?{start:edit.input.selectionStart,end:edit.input.selectionEnd}:null,viewport=root.querySelector('[data-grid-viewport]'),scroll=editingFocused?{top:viewport.scrollTop,left:viewport.scrollLeft}:null,previous=coords(active),oldActive=active;config=candidate;
  const header=document.createElement('tr');header.className='ds-data-grid__header-row';set(header,'role','row');set(header,'aria-rowindex','1');
  for(const [index,column]of config.columns.entries()){const th=document.createElement('th');th.className='ds-data-grid__header';set(th,'role','columnheader');set(th,'scope','col');set(th,'aria-colindex',index+1);th.textContent=column.label;header.append(th);}head.replaceChildren(header);
  const rowIds=new Set(config.rows.map(row=>row.id)),columnIds=new Set(config.columns.map(column=>column.id));
  for(const [key,record]of records)if(!rowIds.has(key)){record.node.remove();records.delete(key);}
  for(const [rowIndex,row]of config.rows.entries()){
   let record=records.get(row.id);if(!record){record={node:document.createElement('tr'),cells:new Map()};record.node.className='ds-data-grid__row';set(record.node,'role','row');set(record.node,'data-grid-row',row.id);records.set(row.id,record);}
   set(record.node,'aria-rowindex',rowIndex+2);set(record.node,'aria-disabled',row.disabled?'true':null);
   for(const [key,cell]of record.cells)if(!columnIds.has(key)){cell.remove();record.cells.delete(key);}
   for(const [columnIndex,column]of config.columns.entries()){
    let cell=record.cells.get(column.id);if(!cell){cell=document.createElement('td');cell.className='ds-data-grid__cell';set(cell,'role','gridcell');set(cell,'data-grid-column',column.id);record.cells.set(column.id,cell);}
    set(cell,'aria-colindex',columnIndex+1);set(cell,'aria-readonly',String(!editable(config,row,column)));set(cell,'aria-disabled',row.disabled?'true':null);
    if(!sameCell(edit,{rowId:row.id,columnId:column.id}))cell.textContent=text(row.cells[column.id]);if(record.node.children[columnIndex]!==cell)record.node.insertBefore(cell,record.node.children[columnIndex]??null);
   }
   if(body.children[rowIndex]!==record.node)body.insertBefore(record.node,body.children[rowIndex]??null);
  }
  set(table,'aria-rowcount',config.rows.length+1);set(table,'aria-colcount',config.columns.length);table.querySelector('caption').textContent=config.label??'Redigerbare oplysninger';hidden(empty,config.rows.length>0);
  active=next.activeCell??oldActive;
  if(!active||!find(active.rowId,active.columnId))active=config.rows.length?{rowId:config.rows[Math.min(Math.max(previous.row,0),config.rows.length-1)].id,columnId:config.columns[Math.min(Math.max(previous.column,0),config.columns.length-1)].id}:null;
  if(!bounds())range=null;if(!edit)showError('');paint();
  if(wasFocused&&!edit){if(active)find(active.rowId,active.columnId).focus();else table.focus();}
  if(editingFocused&&edit){edit.input.focus({preventScroll:true});if(typeof selectionState.start==='number')try{edit.input.setSelectionRange?.(selectionState.start,selectionState.end);}catch{/* Number/select editors have no text range. */}viewport.scrollTop=scroll.top;viewport.scrollLeft=scroll.left;}
  if(edit&&text(rowFor(edit.rowId).cells[edit.columnId])!==text(edit.original))showError('Værdien er ændret udenfor cellen. Din kladde er bevaret.');
  return true;
 }
 for(const node of body.children){const rowId=node.getAttribute('data-grid-row');if(!rowId)continue;records.set(rowId,{node,cells:new Map([...node.children].map(cell=>[cell.getAttribute('data-grid-column'),cell]))});}
 listen('focusin',event=>{const cell=locate(event.target);if(cell&&!sameCell(active,cell)){active=point(cell);anchor={...active};paint();config.onActiveCellChange?.({...active});}});
 listen('input',event=>{if(edit&&event.target===edit.input)config.onDraftChange?.(draft());});
 listen('click',event=>{const cell=locate(event.target);if(!cell||event.target===edit?.input)return;if(edit&&sameCell(edit,cell)){edit.input.focus();return;}if(edit&&!commitEdit()){edit.input.focus();return;}move(point(cell),{extend:Boolean(event.shiftKey),select:!event.shiftKey});});
 listen('dblclick',event=>{const cell=locate(event.target);if(cell)startEdit(point(cell));});
 listen('keydown',event=>{
  if(event.defaultPrevented||event.isComposing)return;
  if(edit&&event.target===edit.input){
   if(event.key==='Escape'){event.preventDefault();event.stopPropagation();cancelEdit();return;}
   if(event.key==='Enter'&&!(edit.multiline&&event.shiftKey)){event.preventDefault();commitEdit();return;}
   if(event.key==='Tab'){const pos=coords(edit),delta=event.shiftKey?-1:1,index=pos.row*config.columns.length+pos.column+delta;if(!commitEdit()){event.preventDefault();return;}if(index>=0&&index<config.rows.length*config.columns.length){event.preventDefault();move({rowId:config.rows[Math.floor(index/config.columns.length)].id,columnId:config.columns[index%config.columns.length].id});}return;}
   return;
  }
  const cell=locate(event.target);if(!cell)return;const pos=coords(cell),mod=event.ctrlKey||event.metaKey;
  if(mod&&event.key.toLowerCase()==='a'){event.preventDefault();range={start:{rowId:config.rows[0].id,columnId:config.columns[0].id},end:{rowId:config.rows.at(-1).id,columnId:config.columns.at(-1).id}};paint();config.onSelectionChange?.(selection());return;}
  if(event.key==='Enter'||event.key==='F2'){event.preventDefault();startEdit(point(cell));return;}
  if(event.key==='Escape'){if(range){event.preventDefault();range=null;paint();config.onSelectionChange?.(null);}return;}
  if(event.key===' '){event.preventDefault();if(event.shiftKey)range={start:{rowId:cell.rowId,columnId:config.columns[0].id},end:{rowId:cell.rowId,columnId:config.columns.at(-1).id}};else if(mod)range={start:{rowId:config.rows[0].id,columnId:cell.columnId},end:{rowId:config.rows.at(-1).id,columnId:cell.columnId}};else range={start:point(cell),end:point(cell)};paint();config.onSelectionChange?.(selection());return;}
  let r=pos.row,c=pos.column,navigate=true;
  if(event.key==='ArrowLeft')c--;else if(event.key==='ArrowRight')c++;else if(event.key==='ArrowUp')r--;else if(event.key==='ArrowDown')r++;else if(event.key==='Home'){c=0;if(mod)r=0;}else if(event.key==='End'){c=config.columns.length-1;if(mod)r=config.rows.length-1;}else navigate=false;
  if(navigate){event.preventDefault();r=Math.max(0,Math.min(r,config.rows.length-1));c=Math.max(0,Math.min(c,config.columns.length-1));move({rowId:config.rows[r].id,columnId:config.columns[c].id},{extend:Boolean(event.shiftKey)});return;}
  if(event.key.length===1&&!mod&&!event.altKey&&mayEdit(cell)){event.preventDefault();startEdit(point(cell),event.key);}
 });
 listen('copy',event=>{if(edit||!locate(event.target)||!event.clipboardData?.setData)return;event.clipboardData.setData('text/plain',copySelection());event.preventDefault();announce('Markeringen er kopieret som tekst.');});
 listen('paste',event=>{if(edit||!locate(event.target)||!event.clipboardData?.getData)return;event.preventDefault();paste(event.clipboardData.getData('text/plain'));});
 listen('focusout',event=>{if(edit&&event.target===edit.input)Promise.resolve().then(()=>{if(!destroyed&&edit&&!root.contains(document.activeElement))commitEdit({restoreFocus:false});});});
 try{update(options);}catch(cause){for(const [type,handler]of listeners)root.removeEventListener(type,handler);throw cause;}
 return {update,startEdit,commitEdit,cancelEdit,paste,copySelection,clearSelection,get activeCell(){return active?{...active}:null;},get selection(){return selection();},get draft(){return draft();},get rows(){return cloneRows(config.rows);},destroy(){if(destroyed)return;destroyed=true;for(const [type,handler]of listeners)root.removeEventListener(type,handler);}};
}

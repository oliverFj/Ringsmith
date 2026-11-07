// Component meanings expressed as routes, branches, boundaries and destinations.
const c=role=>`var(--g-${role})`;
const line=(d,role='edge',width='var(--g-line-width)',extra='')=>`<path d="${d}" fill="none" stroke="${c(role)}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const flow=d=>line(d,'ground',17)+line(d,'subject',10)+line(d,'ink',1.1);
const dot=(x,y,r=8,role='counter')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c(role)}"/>`;
const ring=(x,y,r=18,role='ink')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c('ground')}" stroke="${c(role)}" stroke-width="var(--g-line-width)"/>`;
const plate=(x,y,w,h,role='plane',radius=14)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${c(role)}" stroke="${c('edge')}" stroke-width="var(--g-line-width)"/>`;
const text=(x,y,value,size=16,role='ink')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${c(role)}" font-family="ui-monospace,monospace">${value}</text>`;
const plus=(x,y)=>line(`M${x-9} ${y}h18M${x} ${y-9}v18`,'ink',2);
const person=(x,y)=>dot(x,y-17,14,'ink')+`<path d="M${x-24} ${y+29}v-9a24 24 0 0 1 48 0v9z" fill="${c('ink')}"/>`;
const writing=(x,y,width=160,count=3)=>Array.from({length:count},(_,i)=>line(`M${x} ${y+i*24}h${width-(i%2)*35}`,'ink',2)).join('');
const arrow=(x,y)=>line(`m${x-9} ${y-8} 9 8-9 8`,'ink',2);
const fan=(x1,y1,x2,y2)=>[-2,-1,0,1,2].map(i=>line(`M${x1} ${y1+i*15}C${x1+90} ${y1+i*15} ${x2-90} ${y2+i*25} ${x2} ${y2+i*25}`,'edge',1,'opacity=".45"')).join('');
const cellGrid=(x,y,cols,rows,w=65,h=42)=>Array.from({length:rows+1},(_,i)=>line(`M${x} ${y+i*h}h${cols*w}`)).join('')+Array.from({length:cols+1},(_,i)=>line(`M${x+i*w} ${y}v${rows*h}`)).join('');
const note=(key,name,purpose,body)=>({key,name,purpose,body});
function scene(label,{context='',routes='',content='',markers='',guides=''}={}){
 return {label,groups:[
  note('context','Sammenhæng','Tilbagetrukne felter og alternative baner viser den sammenhæng, motivet virker i.',context),
  note('routes','Betydningsbærende forløb',label,routes),
  note('content','Rollekendetegn','Indhold og genkendelige tegn præciserer, hvilken rolle forbindelsen har.',content),
  note('markers','Aktuelle knudepunkter','Fyldte, åbne og omkransede punkter skelner aktuelle forhold fra mulige destinationer.',markers),
  note('guides','Registrering','To små registreringsmærker holder de organiske baner i et præcist tegningsrum.',guides||line('M65 63h14M72 56v14M521 357h14M528 350v14','edge',1,'opacity=".45"'))
 ].filter(group=>group.body)};
}

const motifs={
 'list-item':()=>scene('Tre parallelle poster deler en fælles samling. Den aktuelle rute standser ved en fremhævet post med titel og beskrivelse.',{
  context:plate(191,76,303,72,'plane',12)+plate(191,171,303,78,'context',12)+plate(191,274,303,72,'plane',12),
  routes:line('M121 112V310M121 112H191M121 310H191','edge',2)+flow('M91 210H191'),
  content:line('M218 99h176M218 124h222M218 195h203M218 225h163M218 297h161M218 322h203','ink',2),
  markers:ring(121,112,7,'edge')+dot(121,210,9,'ink')+ring(121,310,7,'edge')+line('M192 185v50','subject',4)
 }),
 button:()=>scene('Et hovedspor samler sig i én tydelig handlingsflade. En udgående pil viser, at trykket sætter noget i gang.',{
  context:fan(85,206,300,206),routes:flow('M85 206C160 206 166 206 226 206'),
  content:plate(226,158,264,96,'subject',48)+line('M270 206h122','ground',3)+line('m414 194 13 12-13 12','ground',3),markers:dot(226,206,6,'ink')
 }),
 'action-button':()=>scene('En plusmarkering er handlingens centrum. Ikon, label og genvej forbindes i én rettet komposition.',{
  context:plate(110,143,380,130),routes:flow('M80 300C154 300 156 207 203 207'),
  content:ring(203,207,31,'subject')+plus(203,207)+writing(257,199,112,2)+plate(407,186,49,39,'ground',8)+text(418,212,'⌘'),markers:dot(80,300,6,'ink')
 }),
 toolbar:()=>scene('Tre selvstændige handlinger er bundet til samme fælles forløb. Den midterste får en tydelig aktiv markering.',{
  context:line('M94 294C162 310 421 310 507 294','edge',1),routes:flow('M105 279C172 294 428 294 495 279')+line('M176 281V221M300 291V221M424 281V221','ink',2),
  content:[176,300,424].map((x,i)=>plate(x-40,136,80,85,i===1?'context':'plane',18)).join('')+plus(176,177)+line('m286 180 11 11 24-30','ink',2)+line('M410 177h28','ink',2),markers:dot(300,291,8)
 }),
 link:()=>scene('To modsat vendte buer hægter sig sammen. Forbindelsen fortsætter som en åben destination frem for en knapflade.',{
  context:fan(87,270,513,140),routes:flow('M95 271C179 271 173 145 256 145H322C379 145 377 224 322 224H278C224 224 222 303 278 303H345C429 303 425 150 507 150'),
  content:arrow(507,150),markers:ring(95,271,12)+dot(507,150,5,'ink')
 }),
 menu:()=>scene('En udløser forgrener sig til tre kommandoer i en afgrænset menu. Den aktuelle kommando får sit eget knudepunkt.',{
  context:plate(211,98,289,230),routes:flow('M95 209H169Q187 209 187 190V147Q187 131 211 131H250')+line('M187 190V231Q187 247 211 247H250M187 190H250','ink',2),
  content:writing(278,132,158,1)+writing(278,190,125,1)+writing(278,248,152,1),markers:ring(95,209,21)+dot(250,131)+ring(250,190,6)+ring(250,247,6)
 }),
 menubar:()=>scene('En vandret kommandolinje åbner en nedadgående gren. Den åbne gren adskiller menulinjen fra almindelig sidenavigation.',{
  context:plate(91,101,419,61,'plane',12)+plate(230,185,227,145,'plane',12),routes:flow('M124 131H274Q296 131 296 156V205Q296 225 326 225H411')+line('M296 225V279H411','ink',2),
  content:writing(131,132,66,1)+writing(342,132,105,1)+writing(338,225,75,1)+writing(338,279,54,1),markers:dot(275,131,7)+ring(326,225,5)
 }),
 'menu-item':()=>scene('Ét kommandospor fremhæves mellem to nabospor. En kort pil viser underkommandoen uden at gøre hele menuen til motivet.',{
  context:line('M140 120H460M140 300H460','edge',2),routes:flow('M100 210C159 210 174 210 228 210H430'),
  content:ring(169,210,18,'subject')+plus(169,210)+arrow(465,210),markers:dot(100,210,6,'ink')
 }),
 input:()=>scene('Et roligt indtastningsspor har én synlig tekstmarkør og plads til mere indhold. Konturen holder feltet åbent.',{
  context:plate(109,156,384,108,'plane',22),routes:line('M144 218C210 218 224 218 304 218','subject',7),
  content:line('M320 184V235M313 184h14M313 235h14','ink',2)+line('M144 245H458','edge',1),markers:dot(144,218,5,'ink')
 }),
 textarea:()=>scene('Flere tekstlinjer samles i ét større skrivefelt. En ubrudt, blød vending fører læsningen fra linje til linje.',{
  context:plate(105,86,390,247,'plane',16),routes:flow('M142 136H413Q449 136 449 170T413 204H175Q139 204 139 238T175 272H320'),
  content:line('M343 250V290M337 250h12M337 290h12','ink',2)+line('m454 300 16-16m-5 16 5-5','edge',1),markers:dot(142,136,5,'ink')
 }),
 'number-input':()=>scene('En afgrænset talværdi forbindes til to retninger: forøgelse og formindskelse. De to handlinger deler samme værdi.',{
  context:plate(149,137,287,142,'plane',20),routes:flow('M117 211H204')+line('M339 211H386Q413 211 413 182V162M386 211Q413 211 413 240V260','ink',2),
  content:text(230,239,'42',64)+plus(413,160)+line('M404 263h18','ink',2),markers:ring(117,211,12)+dot(386,211,7)
 }),
 field:()=>scene('Label, indtastning og hjælpetekst er knyttet til samme lodrette relation. En enkelt aktiv knude hører til selve feltet.',{
  context:plate(169,160,330,91),routes:line('M104 111V299M104 111H154M104 205H169M104 299H154','ink',2)+flow('M201 205H392'),
  content:writing(169,111,172,1)+writing(169,299,236,1),markers:dot(104,205,7)+line('M408 184v41','ink',2)
 }),
 'field-group':()=>scene('Tre selvstændige felter forgrenes fra én fælles overskrift. Klammen viser gruppering uden at blande deres værdier.',{
  context:[130,210,290].map(y=>plate(212,y-23,276,47,'plane',11)).join(''),routes:flow('M114 100V210Q114 290 174 290H212')+line('M114 130H212M114 210H212','ink',2),
  content:writing(249,130,179,1)+writing(249,210,145,1)+writing(249,290,167,1)+writing(114,75,170,1),markers:[130,210,290].map(y=>dot(212,y,5,'ink')).join('')
 }),
 select:()=>scene('Et enkelt aktuelt valg ligger i en lukket ramme. En nedadvendt markering viser, at andre muligheder findes under feltet.',{
  context:plate(116,116,371,87),routes:flow('M151 159H348')+line('M422 201C422 238 364 245 302 245S192 269 192 302','edge',2),
  content:line('m409 151 12 12 12-12','ink',2)+writing(240,295,136,1)+writing(240,336,103,1),markers:dot(151,159,6,'ink')+ring(192,302,7)
 }),
 radio:()=>scene('To runde valgmuligheder står på adskilte grene. Kun den øverste har en fyldt kerne, så valget er entydigt.',{
  context:line('M97 211C130 211 127 136 177 136M97 211C130 211 127 286 177 286','edge',2),routes:flow('M97 211C130 211 127 136 177 136'),
  content:ring(200,136,29,'subject')+ring(200,286,29,'edge')+writing(260,136,168,1)+writing(260,286,168,1),markers:dot(200,136,14,'subject')+dot(97,211,5,'ink')
 }),
 switch:()=>scene('En kontinuerlig bane bøjer fra slukket til tændt. Den fyldte højre position og den tomme venstre viser to tilstande af samme kontakt.',{
  context:plate(143,149,314,123,'context',62),routes:flow('M205 211C259 162 339 162 395 211'),
  content:ring(205,211,37,'edge')+ring(395,211,37,'ink'),markers:dot(395,211,25,'subject')+line('M395 201v20','ground',2)
 }),
 'choice-field':()=>scene('En navngivet valgliste forbinder label, valgt værdi og hjælp. Nedadvendt pil viser et native valg; feltet har ingen tekstmarkør.',{
  context:plate(172,160,321,90),routes:flow('M120 109V205Q120 299 172 299H317')+line('M120 109H159M120 205H172','ink',2),
  content:writing(172,109,161,1)+writing(207,205,165,1)+line('m440 196 10 10 10-10','ink',2)+writing(172,299,186,1),markers:dot(120,205,7)
 }),
 'segmented-option':()=>scene('Én markeret strækning ligger mellem to afgrænsede nabostykker. Motivet viser et enkelt segment som del af en større helhed.',{
  context:plate(86,163,428,94,'plane',29)+line('M223 163v94M377 163v94','edge',1),routes:flow('M244 210H357'),
  content:line('M122 210h64M413 210h64','edge',2),markers:dot(300,210,9,'ink')
 }),
 'segmented-control':()=>scene('Tre ligeværdige spor deler samme ramme. Kun én rute er aktuel, og skillelinjer bevarer de enkelte valgs identitet.',{
  context:plate(82,157,436,106,'plane',26)+line('M227 157v106M373 157v106','edge',1),routes:flow('M110 210H199'),
  content:line('M255 210h90M400 210h90','ink',2),markers:dot(155,210,9,'ink')+ring(300,210,8,'edge')+ring(445,210,8,'edge')
 }),
 'range-field':()=>scene('En flydende skala har tydelige trin og én præcis aktuel position. Farven standser ved skyderen, mens den mulige strækning fortsætter.',{
  context:line('M99 222C191 222 191 178 301 178S409 222 501 222','edge',3),routes:flow('M99 222C191 222 191 178 301 178'),
  content:[99,166,233,301,369,436,501].map((x,i)=>line(`M${x} 271v${i===3?18:9}`,'edge',1)).join('')+text(282,116,'50'),markers:ring(301,178,22)+dot(301,178,10,'subject')
 }),
 combobox:()=>scene('En skrivbar søgegren åbner til filtrerede muligheder. Tekstmarkøren og søgeglasset adskiller feltet fra en almindelig valgliste.',{
  context:plate(107,82,385,79)+plate(207,190,285,146),routes:flow('M165 121H314')+line('M165 160V264Q165 288 208 288H246M165 220H246','ink',2),
  content:ring(139,121,12)+line('m148 130 9 9M331 102v37','ink',2)+writing(275,221,155,1)+writing(275,288,125,1),markers:dot(246,221,6)+ring(246,288,6,'edge')
 }),
 multiselect:()=>scene('To selvstændige valg samles i samme felt uden at smelte sammen. Fjerntegn og en fortsættende gren viser, at sættet kan ændres.',{
  context:plate(89,128,424,114,'plane',19),routes:flow('M135 293C135 261 191 274 191 230')+line('M191 263C237 263 335 269 335 230','ink',2),
  content:plate(116,153,142,62,'context',30)+plate(282,153,142,62,'context',30)+line('M139 184h59M305 184h59','ink',2)+line('m222 179 10 10m0-10-10 10M388 179l10 10m0-10-10 10','ink',2)+plus(466,184),markers:dot(191,263,7)+dot(135,293,5,'ink')
 }),
 'date-picker':()=>scene('En kalender ordner datoer i uger. Et organisk forløb standser præcis i den valgte datocelle.',{
  context:plate(158,78,300,266,'plane',18)+cellGrid(184,151,7,4,35,41),routes:flow('M89 287C132 287 119 212 184 212H306'),
  content:line('M158 127h300M222 63v32M391 63v32','ink',2)+text(183,115,'NOVEMBER',16),markers:dot(306,212,14,'subject')+dot(306,212,3,'ground')
 }),
 'time-picker':()=>scene('To visere deler samme centrum i en rund tidsflade. Den lange viser følger en tydelig bue frem mod det valgte tidspunkt.',{
  context:ring(300,210,122,'edge')+Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;return dot((300+Math.sin(a)*108).toFixed(2),(210-Math.cos(a)*108).toFixed(2),2,'ink');}).join(''),routes:flow('M300 210V130')+line('M300 210 358 250','ink',4),
  content:line('M210 292A122 122 0 0 0 403 274','subject',5),markers:dot(300,210,9,'counter')
 }),
 'file-upload':()=>scene('En fil føres ind over en tydelig modtagekant. Den opadrettede pil og dokumentets fold gør overførselens genstand og retning synlig.',{
  context:line('M114 257v61h372v-61','ink',3)+plate(222,79,156,158,'plane',8),routes:flow('M300 305V160'),
  content:line('m270 187 30-30 30 30M336 79v42h42','ink',2)+writing(244,146,48,1),markers:ring(300,305,13)+dot(300,160,5,'ink')
 }),
 spinner:()=>scene('Et ubrudt cirkulært forløb har et åbent mellemrum og en aktiv spids. Det viser igangværende aktivitet uden at antyde en bestemt procent.',{
  context:ring(300,210,114,'edge')+ring(300,210,72,'edge'),routes:flow('M300 115A95 95 0 1 1 208 186'),
  content:line('M300 70v16M300 334v16M160 210h16M424 210h16','edge',1),markers:dot(208,186,11,'counter')+dot(300,115,5,'ink')
 }),
 skeleton:()=>scene('Tre bløde, endnu ufyldte spor reserverer plads til indhold. En tilbagetrukket gennemløbslinje viser venten frem for færdige data.',{
  context:plate(105,94,390,231),routes:line('M139 158C211 158 215 158 279 158M139 212C248 212 285 212 425 212M139 267C238 267 251 267 363 267','context',19),
  content:line('M121 304C209 304 193 111 308 111S383 304 479 304','edge',1,'stroke-dasharray="3 7"'),markers:ring(308,111,7,'edge')
 }),
 toast:()=>scene('Et kort beskedspor løfter sig fri af et længere produktforløb. En lille statusknude og en lukmarkering understreger beskedens afgrænsede rolle.',{
  context:line('M84 325C187 325 159 286 296 286S402 325 517 325','edge',2),routes:flow('M116 322C116 255 156 236 156 202'),
  content:plate(120,140,365,118,'plane',25)+writing(220,184,173,2)+line('m446 165 12 12m0-12-12 12','ink',2),markers:ring(175,195,23,'subject')+line('m166 195 7 7 13-16','ink',2)
 }),
 'empty-state':()=>scene('En åben destination står uden indhold, men en venlig indgående rute viser en mulig første handling. Tomrummet får en aktiv betydning.',{
  context:ring(333,196,81,'edge')+line('M273 300h121M297 323h73','edge',2),routes:flow('M86 284C163 284 164 196 229 196H277'),
  content:plus(333,196)+line('M333 91v16M438 196h16M333 286v16','edge',1),markers:ring(86,284,11,'edge')
 }),
 'data-table':()=>scene('Værdier ligger på et fælles række- og kolonnenet. En ubrudt læserute fremhæver en hel række uden at gøre cellerne redigerbare.',{
  context:plate(101,98,399,236,'plane',10)+cellGrid(122,132,4,4,89,45),routes:flow('M79 245H478'),
  content:line('M122 132h356','ink',3)+Array.from({length:3},(_,i)=>writing(141+i*89,158,43,3)).join(''),markers:ring(168,245,9)+dot(346,245,7,'ink')
 }),
 'data-grid':()=>scene('Et præcist cellenet har én aktiv redigeringscelle med tekstmarkør. En lodret og en vandret rute angiver navigation i begge dimensioner.',{
  context:cellGrid(130,107,4,4,86,51),routes:flow('M88 235H345')+line('M345 74V307','subject',3),
  content:plate(302,209,86,51,'context',0)+line('M321 221v26','ink',2)+writing(149,136,39,1)+writing(407,289,37,1),markers:dot(345,235,5,'ink')+arrow(473,235)
 }),
 avatar:()=>scene('Ét menneske står som et selvstændigt knudepunkt. De omkringliggende feltlinjer peger på identitet frem for et fælles gruppetilhørsforhold.',{
  context:fan(100,245,506,176),routes:flow('M89 281C174 281 153 212 227 212'),
  content:ring(302,212,76,'subject')+person(302,207),markers:dot(455,184,7)+line('M302 113v16M302 295v16','edge',1)
 }),
 tabs:()=>scene('En aktiv fane forbinder sit navn direkte med det åbne indholdsfelt. Nabofanernes spor ender før indholdet og forbliver tydeligt adskilte.',{
  context:plate(104,163,391,160,'plane',12)+line('M111 117h92M362 117h108','edge',2),routes:flow('M250 117H313Q332 117 332 163V213'),
  content:writing(139,215,177,3)+line('M104 163h391','ink',1.5),markers:dot(332,213,8)+dot(281,117,5,'ink')
 }),
 breadcrumb:()=>scene('Tre destinationer forbindes som en læsbar sti. De tidligere led er åbne ringe, mens det aktuelle sted har en fyldt kerne.',{
  context:line('M115 272h370','edge',1),routes:flow('M125 205C197 205 197 205 270 205S365 205 467 205'),
  content:arrow(210,205)+arrow(363,205)+writing(91,258,65,1)+writing(237,258,66,1)+writing(432,258,66,1),markers:ring(125,205,22)+ring(280,205,22)+dot(467,205,24,'subject')+dot(467,205,4,'ground')
 }),
 pagination:()=>scene('Et afgrænset udsnit af en længere rækkefølge har én aktuel side. Tidligere og næste side vises gennem retninger og adskilte nummererede positioner.',{
  context:line('M96 214H504','edge',2),routes:flow('M200 214H302'),
  content:line('m111 200-14 14 14 14M489 200l14 14-14 14','ink',2),markers:ring(195,214,27,'edge')+ring(298,214,30,'subject')+ring(397,214,27,'edge')+text(187,221,'1')+text(290,221,'2')+text(389,221,'3')
 }),
 popover:()=>scene('Et lokalt indholdsfelt udspringer af et konkret anker. Den korte kurve gør popoverens tilhørsforhold synligt uden at skærme hele baggrunden.',{
  context:plate(236,91,267,171)+plate(98,283,132,48,'context',24),routes:flow('M164 284C164 238 201 245 236 213'),
  content:writing(267,133,177,3)+line('m474 111 11 11m0-11-11 11','ink',2),markers:dot(164,284,8)+ring(236,213,7)
 }),
 drawer:()=>scene('Et sidepanel træder ind fra kanten af en større flade. Produktets forløb fortsætter bagved, mens den lokale arbejdsgren åbnes i siden.',{
  context:plate(91,94,416,236,'plane',12)+writing(117,143,124,4)+plate(323,79,184,267,'context',8),routes:line('M99 291C166 291 164 255 287 255','edge',2)+flow('M287 255C333 255 333 291 386 291'),
  content:writing(350,129,101,5)+line('m471 98 13 13m0-13-13 13','ink',2),markers:dot(386,291,7,'ink')
 }),
 signature:()=>scene('Et personligt afsenderspor samler et monogram og et navnetræk. En kort afsluttende streg fastholder signaturen som kreditering.',{
  context:line('M113 303C210 324 382 324 490 303','edge',1),routes:flow('M102 278C186 278 163 176 219 176S225 272 280 272 291 154 347 154 342 242 391 242 418 198 473 198'),
  content:line('M244 325H478','ink',2),markers:ring(110,170,27,'subject')+text(94,179,'AB',20)+dot(473,198,7,'ink')
 }),
 navigation:()=>scene('Flere destinationer udspringer af den samme indgang. Kun den aktuelle gren får farve, så navigation viser sted frem for kommando.',{
  context:plate(100,79,136,266,'plane',18)+line('M139 210V288','ink',2),routes:flow('M139 120V210Q139 232 183 232H459')+line('M139 120H193M139 176H193M139 288H193','ink',2),
  content:arrow(456,232)+writing(269,178,155,1)+writing(269,288,155,1),markers:dot(193,232,8)+ring(193,120,5,'edge')+ring(193,176,5,'edge')+ring(193,288,5,'edge')
 }),
 text:()=>scene('Fire tekstlinjer danner et roligt læseforløb. Linjernes gentagelse og forskellige længder bærer betydningen uden indramning.',{
  routes:flow('M125 122H414')+line('M125 181H478M125 240H449M125 299H356','ink',3),
  context:line('M96 105v214','edge',1),markers:dot(125,122,6,'ink'),content:line('M125 333h53','edge',1)
 }),
 card:()=>scene('Relateret indhold holdes i én afgrænset ø. En kort rute fører fra overskrift til indhold og videre til en lokal handling.',{
  context:plate(154,80,291,270,'plane',21),routes:flow('M185 121H389Q419 121 419 153V293H371'),
  content:plate(185,158,205,86,'context',13)+writing(185,272,110,2),markers:dot(371,293,9)+dot(185,121,5,'ink')
 }),
 badge:()=>scene('En lille statusknude hæfter sig til et større indholdsspor. Fluebenet giver tilstanden et andet signal end farven alene.',{
  context:line('M115 213C208 213 229 213 314 213','ink',3)+line('M115 244h172','edge',2),routes:flow('M314 213H367'),
  content:plate(367,177,122,72,'context',36)+line('m400 213 12 12 23-28','ink',3),markers:dot(314,213,5,'ink')
 }),
 divider:()=>scene('To beslægtede tekststrømme holdes adskilt af én præcis grænse. En lille knude angiver skellet uden at tilføje endnu en ramme.',{
  context:writing(155,113,245,2)+writing(155,277,245,2),routes:flow('M110 209C226 209 374 209 490 209'),
  markers:dot(300,209,7,'ink'),content:line('M300 173v-12M300 246v12','edge',1)
 }),
 alert:()=>scene('Et tydeligt opmærksomhedspunkt åbner til en besked og en mulig opfølgning. En fast afgrænsning giver beskeden mere vægt end en flygtig meddelelse.',{
  context:plate(100,123,401,183,'plane',16),routes:flow('M151 100V251Q151 277 197 277H302'),
  content:ring(166,176,24,'subject')+text(160,184,'!',24)+writing(220,163,213,2)+line('M339 266h99','ink',2),markers:dot(302,277,7)+arrow(450,266)
 }),
 dialog:()=>scene('En central arbejdsgren træder frem over et tilbagetrukket produktforløb. Titel, indhold og afsluttende handlinger danner en tydelig lukket opgave.',{
  context:plate(80,76,442,279,'context',16)+line('M103 119h396M103 154h396M103 189h396','edge',1),routes:flow('M92 320C181 320 110 114 200 114H423'),
  content:plate(156,114,290,198,'plane',17)+writing(185,150,160,1)+writing(185,195,206,2)+plate(338,262,77,30,'subject',15)+line('M243 277h59','ink',2),markers:dot(423,114,7)+dot(377,277,4,'light')
 }),
 heading:()=>scene('Et stort tekstanslag starter et mindre læseforløb. Forskellen i vægt og størrelse gør overskriften til et tydeligt begyndelsespunkt.',{
  routes:flow('M111 141H478'),content:text(117,119,'Aa',64)+writing(111,219,312,3),
  context:line('M91 72v265','edge',1),markers:dot(111,141,6,'ink')
 }),
 label:()=>scene('En kort etiket navngiver et indholdsområde. En lokal forbindelse viser, hvilket område navnet gælder.',{
  context:plate(210,196,282,134),routes:flow('M139 145H259Q283 145 283 180V196'),
  content:writing(139,119,145,1)+writing(239,237,185,3),markers:dot(283,196,8)+ring(139,145,7)
 }),
 tag:()=>scene('To små kategoriformer hænger på hver sin gren. Hulmarkeringer og et diskret fjerntegn viser mærkater som selvstændige indholdsenheder.',{
  context:line('M107 303C225 334 372 334 491 303','edge',1),routes:flow('M121 127C206 127 127 227 210 227H264')+line('M210 227C270 227 279 146 340 146','ink',2),
  content:plate(210,190,159,74,'context',28)+plate(340,109,150,74,'plane',28)+line('M241 227h59M372 146h62','ink',2)+line('m335 221 11 11m0-11-11 11','ink',2),markers:ring(222,227,4)+ring(352,146,4)
 }),
 'instruction-note':()=>scene('Et lille informationspunkt fører til hjælpetekst tæt på opgaven. Ruten er tilbagetrukket og bærer støtte frem for alarm.',{
  context:line('M154 129h314','edge',2),routes:line('M130 166V255Q130 281 166 281H245','subject',4),
  content:ring(130,189,18,'edge')+text(126,195,'i',18)+writing(183,190,266,3),markers:dot(245,281,5,'ink')
 }),
 'metric-row':()=>scene('En stor værdi knyttes til sin label og et kort udviklingsforløb. Ét aktuelt datapunkt afslutter kurven.',{
  context:line('M307 284h181M307 284V136','edge',1),routes:flow('M324 255C348 255 342 216 369 216S385 234 413 198 443 181 475 151'),
  content:text(109,200,'42',79)+writing(113,249,126,2),markers:dot(475,151,10)+dot(475,151,3,'ink')
 }),
 inspector:()=>scene('Et valgt objekt forbindes til et separat egenskabspanel. Ruten krydser mellem objekt og detaljer og gør panelets kontekst tydelig.',{
  context:plate(80,100,252,223)+plate(376,77,145,269,'plane',12),routes:flow('M240 213C316 213 301 159 376 159'),
  content:plate(145,155,95,115,'context',10)+writing(401,118,85,1)+writing(401,163,75,3)+line('M401 284h83','ink',2),markers:dot(240,213,7)+ring(145,155,4)+ring(240,270,4)
 }),
 tooltip:()=>scene('En kompakt forklaring hænger tæt på sit fokuspunkt. Den korte peger viser tilknytningen og holder forklaringen ude af selve kontrollen.',{
  context:ring(300,282,42,'edge'),routes:flow('M300 240V213Q300 195 331 195'),
  content:plate(188,111,282,84,'plane',22)+writing(216,146,205,1)+writing(216,172,148,1)+plus(300,282),markers:dot(300,240,7)
 }),
 'brand-mark':()=>scene('Tre markante former samles i ét genkendeligt afsendertegn. Farven er bundet til en fælles identitet, ikke til en kontroltilstand.',{
  context:line('M99 327h403','edge',1),routes:flow('M139 279V169C139 109 250 109 250 169V279M250 279V169C250 109 361 109 361 169V279'),
  content:ring(417,237,42,'subject')+dot(417,237,22,'counter'),markers:dot(139,279,7,'ink')+dot(361,279,7,'ink')
 }),
 'scroll-area':()=>scene('Et længere indholdsforløb passerer gennem en afgrænset åbning. Det synlige udsnit og skyderens position viser scrolling uden at forveksle den med fremdrift.',{
  context:plate(145,85,309,260,'plane',17)+line('M434 112v207','edge',3),routes:flow('M164 130C246 130 246 184 333 184S246 237 164 237 246 290 333 290'),
  content:line('M434 159v66','subject',8)+line('M180 67h181M180 365h181','edge',1,'stroke-dasharray="3 6"'),markers:dot(434,191,4,'ink')
 }),
 tree:()=>scene('Et forløb forgrener sig gennem to niveauer. Knudernes placering og de sammenhængende grene gør over- og underordning synlig.',{
  context:line('M111 88V323','edge',1),routes:flow('M154 112V210Q154 236 204 236H274')+line('M154 158Q154 174 204 174H274M274 236V298H414M274 236Q313 236 314 236H414','ink',2),
  content:writing(299,174,131,1)+writing(433,236,55,1)+writing(433,298,55,1),markers:ring(154,112,15,'subject')+dot(274,174,6,'ink')+dot(274,236,8)+ring(414,236,6)+ring(414,298,6)
 }),
 stack:()=>scene('Tre selvstændige enheder følger én lodret rytme. Mellemrum og en ubrudt samlende gren viser stakken som en komposition.',{
  context:[114,210,306].map(y=>plate(191,y-30,270,60,'plane',15)).join(''),routes:flow('M139 114V306')+line('M139 114H191M139 210H191M139 306H191','ink',2),
  content:[114,210,306].map(y=>writing(224,y,179,1)).join(''),markers:[114,210,306].map(y=>dot(139,y,6,'ink')).join('')
 })
};

export function drawCatalog(motif){return Object.hasOwn(motifs,motif)?motifs[motif]():null;}

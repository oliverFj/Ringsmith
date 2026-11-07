import {drawCatalog,CATALOG_IDS} from './anatomy-catalog.mjs';

export const meta = {
  "id": "anatomy",
  "name": "Tegnets anatomi",
  "description": "Præcise konturer, aktive mellemrum og et enkelt tyngdepunkt. Klammer, målelinjer og forbindelser gør grafikkens betydning synlig.",
  "qualities": [
    "Skarp",
    "Ren",
    "Teknisk"
  ]
};

const C = {
  ground: 'var(--g-ground)', plane: 'var(--g-plane)', ink: 'var(--g-ink)',
  subject: 'var(--g-subject)', counter: 'var(--g-counter)', context: 'var(--g-context)',
  edge: 'var(--g-edge)', light: 'var(--g-light)', depth: 'var(--g-depth)',
  width: 'var(--g-line-width)'
};

const path = (d, {fill = 'none', stroke = C.ink, width = C.width, opacity = 1} = {}) =>
  `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round"/>`;
const segment = (x1, y1, x2, y2, {stroke = C.ink, width = 1, opacity = 1} = {}) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}" opacity="${opacity}" stroke-linecap="round"/>`;
const rect = (x, y, width, height, {fill = 'none', stroke = C.ink, lineWidth = C.width, opacity = 1} = {}) =>
  `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" stroke="${stroke}" stroke-width="${lineWidth}" opacity="${opacity}"/>`;
const circle = (cx, cy, r, {fill = 'none', stroke = 'none', width = C.width, opacity = 1} = {}) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" opacity="${opacity}"/>`;
const label = (x, y, value) =>
  `<text x="${x}" y="${y}" fill="${C.ink}" font-family="ui-monospace,monospace" font-size="9" letter-spacing="1.2">${value}</text>`;
const dimension = (x1, y1, x2, y2) => {
  const horizontal = y1 === y2;
  return segment(x1,y1,x2,y2)+
    (horizontal ? segment(x1,y1-7,x1,y1+7)+segment(x2,y2-7,x2,y2+7)
      : segment(x1-7,y1,x1+7,y1)+segment(x2-7,y2,x2+7,y2));
};

const motifs = {
  poster(group) {
    const grid = Array.from({length: 11}, (_,i) => segment(50+i*50,0,50+i*50,420,{stroke:C.edge,width:.7,opacity:.25})).join('')+
      Array.from({length: 9}, (_,i) => segment(0,i*50,600,i*50,{stroke:C.edge,width:.7,opacity:.25})).join('');
    return {
      label: 'En præcis rumlig konstruktion leder blikket mod en farvet ring. Målelinjer viser forholdet mellem ramme og fokus.',
      body: group('construction','Konstruktionsnet','Et tilbagetrukket koordinatnet viser det fælles tegningsrum.',grid)+
        group('structure','Rumlig ramme','Konturer og diagonaler beskriver det ydre rum og dets indre felt.',
          rect(128,102,342,218)+path('M128 102 300 36 470 102M300 36V256L128 320M300 256 470 320',{width:1})+
          rect(215,137,170,147,{fill:C.ground})+path('M215 284 300 251 385 284M300 251V137',{width:1}))+
        group('subject','Tyngdepunkt','En enkelt ring er den aktive form, som strukturen giver plads.',
          circle(300,211,50,{fill:C.subject})+circle(300,211,20,{fill:C.ground}))+
        group('annotations','Mål og betegnelser','Måleklammer og fritstående labels forklarer konstruktionens hensigt.',
          dimension(80,102,80,320)+dimension(128,355,470,355)+label(134,383,'01 / INTENTION → FORM')+label(374,46,'PLADS TIL HENSIGTEN'))
    };
  },

  focus(group) {
    return {
      label: 'Et isoleret tyngdepunkt får plads i en præcis ramme. Hjørnemarkører og mål understøtter ét klart centrum.',
      body: group('field','Afgrænset felt','En enkel ramme giver tyngdepunktet et aktivt mellemrum.',
        rect(200,105,200,200,{fill:C.plane})+path('M180 145V85H240M360 85H420V145M420 265V325H360M240 325H180V265',{stroke:C.edge,width:1}))+
        group('subject','Fokus','En farvet ring er det eneste visuelle tyngdepunkt.',
          circle(300,205,54,{fill:C.subject})+circle(300,205,22,{fill:C.plane}))+
        group('guides','Centrering og mål','Små centreringsspor og ét mål viser et overvejet forhold.',
          segment(300,85,300,105,{stroke:C.edge})+segment(300,305,300,325,{stroke:C.edge})+
          segment(180,205,200,205,{stroke:C.edge})+segment(400,205,420,205,{stroke:C.edge})+
          dimension(200,352,400,352))
    };
  },

  relation(group) {
    return {
      label: 'To selvstændige felter mødes i et afgrænset fælles areal. En klamme viser deres samlede relation.',
      body: group('first-field','Første felt','Det første felt bevarer sin egen udstrækning.',rect(125,85,205,190,{fill:C.context}))+
        group('second-field','Andet felt','Det andet felt forskydes, så deres fælles område bliver en bestemt form.',rect(270,145,205,190,{fill:C.plane}))+
        group('intersection','Fælles areal','Et synligt fælles areal forklarer relationen gennem både flade og kontur.',
          rect(270,145,60,130,{fill:C.subject}))+
        group('connection','Fælles klamme','Klammen samler felterne, mens et enkelt punkt angiver deres fælles forhold.',
          path('M125 353V368H475V353M300 368V385',{width:1})+circle(300,389,4,{fill:C.subject}))
    };
  },

  rhythm(group) {
    return {
      label: 'Fire ens moduler gentager en rolig A–B-rytme. Faste intervaller og skift mellem fuld og åben form bærer gentagelsen.',
      body: group('repeated-frames','Gentagne moduler','Fire lige store rammer etablerer gentagelsen med samme vægt og afstand.',
        [105,215,325,435].map(x=>rect(x,120,60,145,{fill:C.plane})).join(''))+
        group('cadence','A–B-rytme','To ens fyldte indsatser gentages i de ulige moduler; de lige forbliver åbne.',
          rect(115,130,40,125,{fill:C.subject,stroke:'none'})+rect(335,130,40,125,{fill:C.subject,stroke:'none'})+
          rect(225,130,40,125,{stroke:C.edge,lineWidth:1})+rect(445,130,40,125,{stroke:C.edge,lineWidth:1}))+
        group('intervals','Faste intervaller','En fælles grundlinje og lige lange mål viser rytmens regelmæssighed.',
          segment(92,285,508,285)+dimension(135,316,245,316)+dimension(245,316,355,316)+dimension(355,316,465,316))
    };
  },

  accordion(group) {
    return {
      label: 'En accordion med to lukkede felter og et åbent midterfelt. Højre- og nedadvendte chevrons skelner tilstandene.',
      body: group('collapsed-first','Øverste lukkede felt','Den lukkede række har højrevendt chevron og en kort titel.',
        rect(115,85,370,60)+path('M148 105 157 114 148 123')+segment(197,114,367,114))+
        group('expanded','Åbent felt','Det åbne felt rummer overskrift og indhold samt en entydig nedadvendt chevron.',
          rect(115,165,370,125,{fill:C.context})+path('M145 207 154 216 163 207')+
          segment(197,200,367,200)+segment(197,226,434,226)+segment(197,247,392,247))+
        group('active-edge','Åbningens accent','En smal kant binder farven til den aktuelle åbning.',rect(111,165,7,125,{fill:C.subject,stroke:'none'}))+
        group('collapsed-last','Nederste lukkede felt','Den lukkede række gentager den første rækkes signal.',
          rect(115,310,370,50)+path('M148 326 157 335 148 344')+segment(197,335,367,335))+
        group('extent','Indholdets udstrækning','En diskret måleklamme viser, hvor meget indhold der er åbnet.',dimension(523,165,523,290))
    };
  },

  'avatar-group'(group) {
    const person = (x,top,filled) => rect(x-60,top,120,275-top,{fill:filled?C.context:'none'})+
      circle(x,top+55,20,{fill:filled?C.subject:'none',stroke:filled?'none':C.ink})+
      path(`M${x-31} ${top+112}a31 31 0 0 1 62 0`);
    return {
      label: 'Tre personer bevarer hver deres ramme og samles af én præcis klamme. Midterpersonen fremhæves uden at skjule de andre.',
      body: group('person-left','Venstre person','Et selvstændigt portræt med hoved, skuldre og egen ramme.',person(172,115,false))+
        group('person-center','Midterperson','Et fremhævet, højere portræt med samme grundgeometri.',person(300,85,true))+
        group('person-right','Højre person','Et ligeværdigt sideportræt med samme afstand som på venstre side.',person(428,115,false))+
        group('shared-bracket','Fælles klamme','En klamme og et samlet punkt gør fællesskabet konkret.',
          path('M112 300V318H488V300M300 318V350',{width:1})+circle(300,355,5,{fill:C.subject}))
    };
  },

  progress(group) {
    return {
      label: 'Fire lige store trin følger én rute. Tre er passeret; det tredje er aktuelt, og det sidste står åbent.',
      body: group('stages','Fire ens trin','Ens modulstørrelse viser et trinforløb frem for en voksende datamængde.',
        [125,225,325,425].map(x=>rect(x,145,60,100,{fill:C.plane})).join(''))+
        group('route','Fremdriftens rute','Den udfyldte rute slutter præcis ved det aktuelle trin; resten står åbent.',
          segment(155,284,355,284,{stroke:C.subject,width:3})+segment(355,284,455,284,{stroke:C.edge}))+
        group('completed','Passerede trin','De to første trin er tonede og har små afsluttende markører.',
          rect(132,152,46,86,{fill:C.context,stroke:'none'})+rect(232,152,46,86,{fill:C.context,stroke:'none'})+
          circle(155,284,4,{fill:C.ink})+circle(255,284,4,{fill:C.ink}))+
        group('current','Aktuelt trin','Det tredje trin bærer accenten; samme accent afslutter den passerede rute.',
          rect(332,152,46,86,{fill:C.subject,stroke:'none'})+circle(355,284,6,{fill:C.subject}))+
        group('remaining','Åben destination','Et åbent trin og en kontureret slutknude viser det næste.',
          circle(455,284,6,{fill:C.ground,stroke:C.ink}))+
        group('guides','Trin og interval','Lodrette ledere forbinder modulerne til ruten og et enkelt fælles mål.',
          [155,255,355,455].map(x=>segment(x,245,x,273,{stroke:C.edge})).join('')+dimension(155,325,455,325))
    };
  },

  image(group) {
    return {
      label: 'Et billedfelt med sol og sammenhængende landskab. En præcis ramme holder motivet samlet.',
      body: group('frame','Billedramme','En enkelt kontur afgrænser hele billedets areal.',rect(135,80,330,205,{fill:C.plane}))+
        group('landscape','Landskab','En kontrolleret linjerytme og en rolig flade skaber billedets landskab.',
          path('M135 240 235 170 310 210 370 141 465 215V285H135Z',{fill:C.context,stroke:'none'})+
          path('M135 240 235 170 310 210 370 141 465 215',{width:1}))+
        group('sun','Sol','En enkelt farvet skive er motivets visuelle tyngdepunkt.',circle(216,136,22,{fill:C.subject}))+
        group('registration','Billedets hjørner','To beskedne hjørnespor fremhæver beskæringen uden at tilføje en ekstra ramme.',
          path('M119 112V64H167M433 301H481V253',{stroke:C.edge,width:1}))
    };
  },

  caption(group) {
    return {
      label: 'En billedtekst er fysisk forbundet med billedets nederste kant. Knæklederen ender direkte i tekstblokkens første linje.',
      body: group('frame','Billedramme','En præcis billedramme ejer det tilhørende anker.',rect(135,80,330,205,{fill:C.plane}))+
        group('landscape','Billedmotiv','Landskab og sol giver billedfeltet et genkendeligt indhold.',
          path('M135 240 235 170 310 210 370 141 465 215V285H135Z',{fill:C.context,stroke:'none'})+
          path('M135 240 235 170 310 210 370 141 465 215',{width:1})+circle(216,136,22,{fill:C.subject}))+
        group('connector','Billedtekstens forbindelse','Et markeret anker og en knækleder forbinder billedet direkte med tekstens begyndelse.',
          path('M300 285V326H350',{width:1})+circle(300,285,4,{fill:C.subject}))+
        group('caption-lines','Billedtekst','Tekstblokken begynder præcis der, hvor lederen ender.',
          segment(350,326,465,326,{width:2})+segment(350,347,430,347,{width:1.2}))
    };
  },

  checkbox(group) {
    return {
      label: 'To lige store afkrydsningsfelter med tilhørende tekst. Det øverste er markeret med et tydeligt flueben; det nederste står tomt.',
      body: group('checked','Markeret felt','Et indrammet kvadrat med indsat pigment og et lyst flueben viser det aktive valg.',
          rect(145,100,60,60,{fill:C.plane})+rect(152,107,46,46,{fill:C.subject,stroke:'none'})+
          path('M162 129 172 140 188 119',{stroke:C.light,width:3}))+
        group('unchecked','Umarkeret felt','Samme kvadratiske geometri bevares uden pigment eller flueben.',rect(145,240,60,60,{fill:C.plane}))+
        group('labels','Tilhørende tekst','Korte tekststreger og ens indbyrdes placering binder hver label til sit felt.',
          segment(240,121,440,121)+segment(240,144,385,144)+segment(240,261,440,261)+segment(240,284,385,284))
    };
  }
};

export function draw(motif, {prefix = 'anatomy'} = {}) {
  const render = motifs[motif];
  if (!render&&!CATALOG_IDS.includes(motif)) throw new RangeError(`Ukendt motiv i Tegnets anatomi: ${motif}`);
  const safePrefix = String(prefix).replace(/[^a-zA-Z0-9_-]/g, '-') || 'anatomy';
  const parts = [];
  const group = (key, name, purpose, content) => {
    parts.push({key,name,purpose});
    return `<g id="${safePrefix}-${key}" data-part="${key}">${content}</g>`;
  };
  const result = render?render(group):drawCatalog(motif,group);
  return {...result, viewBox:'0 0 600 420', parts};
}

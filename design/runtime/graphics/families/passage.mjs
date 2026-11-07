import { drawCatalog } from './passage-catalog.mjs';

export const meta = {
  "id": "passage",
  "name": "Passage",
  "description": "Udskårne flader og aktive åbninger gør adgang, indhold og sammenhæng håndgribelige. En solid, arkitektonisk billedgrammatik med en legende modfarve.",
  "qualities": [
    "Solid",
    "Autoritativ",
    "Legende"
  ]
};

const paint = role => `var(--g-${role})`;
const path = (d, role = 'subject', extra = '') => `<path d="${d}" fill="${paint(role)}" ${extra}/>`;
const line = (d, role = 'edge', width = 'var(--g-line-width)', extra = '') => `<path d="${d}" fill="none" stroke="${paint(role)}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const circle = (cx, cy, r, role = 'subject', extra = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${paint(role)}" ${extra}/>`;
const rect = (x, y, width, height, role = 'plane', extra = '') => `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${paint(role)}" ${extra}/>`;
const part = (key, name, purpose, body) => ({ key, name, purpose, body });
const registration = (x, y) => line(`M${x - 8} ${y}h16M${x} ${y - 8}v16`, 'edge', '1', 'opacity=".55"');
const frame = (outer, opening, role = 'subject') => path(`${outer} ${opening}`, role, 'fill-rule="evenodd"');
const personCutout = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">${circle(0, -22, 20, 'ground')}${path('M-34 41V27a34 34 0 0 1 68 0v14z', 'ground')}</g>`;

function poster() {
  const front = 'M122 91H362V330H122z';
  const arch = 'M180 330V210a62 62 0 0 1 124 0v120z';
  return {
    label: 'En massiv port med en udskåret åbning afslører et indre rum. En ubrudt vej fører gennem åbningen.',
    groups: [
      part('floor', 'Grundplan', 'Forankrer de opretstående planer og gør adgangsvejen læselig.',
        line('M36 335h520M45 349h497M72 363h444', 'edge', '1', 'opacity=".5"') +
        path('M122 330h240l111 36H187z', 'depth', 'opacity="var(--g-depth-opacity)"')),
      part('rear-planes', 'Bagplaner', 'To forskudte materialeflader viser, at porten har dybde.',
        rect(168, 61, 240, 269, 'context') + rect(150, 75, 240, 255, 'counter')),
      part('inner-room', 'Indre rum', 'Det udskårne hul afslører et selvstændigt rum bag forgrunden.',
        path(arch, 'context') + path('M206 330V210a36 36 0 0 1 72 0v120z', 'ground')),
      part('threshold', 'Portens forgrund', 'Den tunge silhuet og det aktive hulrum bærer familiens grundidé.',
        frame(front, arch) + line(front + 'M180 330V210a62 62 0 0 1 124 0v120', 'ink')),
      part('route', 'Adgangsvej', 'En tydelig vej fortsætter fra åbningen ud på det fælles grundplan.',
        path('M206 330h72l62 35h-84z') + line('M242 283v77h74', 'ink') + circle(316, 360, 6, 'counter')),
      part('guides', 'Konstruktionsspor', 'Diskrete mål og registreringer understøtter det arkitektoniske udtryk.',
        line('M408 61v269M418 75v255M130 79h260M89 91v239', 'edge', '1', 'opacity=".5"') +
        registration(58, 53) + registration(540, 333))
    ]
  };
}

function focus() {
  return {
    label: 'En enkelt cirkel får et afgrænset rum i en tung, udskåret ramme. Åbningen samler opmærksomheden.',
    groups: [
      part('rear-plane', 'Bagplan', 'En rolig materialeforskydning giver forgrunden fysisk vægt.', rect(151, 72, 312, 266, 'context')),
      part('inner-field', 'Indre felt', 'En selvstændig farve omslutter det centrale motiv.', circle(286, 215, 96, 'counter')),
      part('frame', 'Udskåret ramme', 'Det tunge rektangel gør tomrummet omkring motivet aktivt.',
        frame('M120 92H432V338H120z', 'M382 215a96 96 0 1 1-192 0a96 96 0 1 1 192 0z') + line('M120 92H432V338H120z', 'ink')),
      part('subject', 'Tyngdepunkt', 'En enkelt samlet form bevarer et klart visuelt fokus.',
        circle(286, 215, 61, 'ground') + circle(286, 215, 34, 'ink')),
      part('guides', 'Optiske mål', 'Et par korte mållinjer viser rummets kontrollerede proportioner.',
        line('M120 365h312M120 359v12M432 359v12M97 92v246', 'edge', '1', 'opacity=".65"') + registration(489, 91))
    ]
  };
}

function relation() {
  return {
    label: 'To selvstændige plader har komplementære udskæringer. Deres fælles åbning giver en forbindelse plads.',
    groups: [
      part('rear-plane', 'Fælles bagplan', 'Et roligt bagplan binder delene sammen uden at gøre dem identiske.', rect(102, 112, 422, 222, 'context')),
      part('left-form', 'Første modform', 'Den ene halvdel afgiver plads til det fælles rum.',
        path('M82 91H290V137a73 73 0 0 0 0 146v47H82z') + line('M82 91H290V137a73 73 0 0 0 0 146v47H82z', 'ink')),
      part('right-form', 'Anden modform', 'Den anden halvdel danner en komplementær åbning.',
        path('M310 91H518V330H310V283a73 73 0 0 0 0-146z', 'counter') + line('M310 91H518V330H310V283a73 73 0 0 0 0-146z', 'ink')),
      part('connection', 'Fælles forbindelse', 'To selvstændige punkter deler en ubrudt vej gennem modformernes åbning.',
        line('M248 210H352', 'ink', '2') + circle(248, 210, 8, 'subject') + circle(352, 210, 8, 'counter')),
      part('guides', 'Fælles grundlinje', 'Et fælles mål beskriver helheden frem for at indramme hver del igen.',
        line('M82 358H518M82 351v14M518 351v14', 'edge', '1', 'opacity=".65"'))
    ]
  };
}

function rhythm() {
  const positions = [80, 194, 308, 422];
  const arches = positions.map((x, i) => {
    const top = i % 2 ? 111 : 134;
    const shape = `M${x} 305V${top + 43}a43 43 0 0 1 86 0V305z M${x + 22} 305V${top + 43}a21 21 0 0 1 42 0V305z`;
    return part(`beat-${i + 1}`, `Gentagelse ${i + 1}`, 'En genkendelig åbning gentages med et kontrolleret skift i højde og pigment.',
      path(shape, i % 2 ? 'subject' : 'counter', 'fill-rule="evenodd"'));
  });
  return {
    label: 'Fire udskårne buer gentager samme åbning. Et skiftevis løft i højden skaber en rolig, bevidst rytme.',
    groups: [
      part('base', 'Fælles sokkel', 'Holder gentagelserne sammen som én komposition.', rect(80, 305, 428, 21, 'context') + line('M80 305H508', 'ink')),
      ...arches,
      part('intervals', 'Mellemrum', 'Ens intervaller fremhæver gentagelsen uden at gøre den til et datadiagram.',
        line('M80 351h86M194 351h86M308 351h86M422 351h86', 'edge', '1', 'opacity=".6"'))
    ]
  };
}

function accordion() {
  return {
    label: 'En åben overskrift afslører indhold gennem et indrammet hulrum. To smallere, lukkede rækker bliver nedenunder.',
    groups: [
      part('rear-planes', 'Skjulte lag', 'Forskudte bagplaner giver indtrykket af indhold bag overskriften.',
        rect(130, 77, 340, 217, 'context') + rect(114, 91, 340, 203, 'counter')),
      part('opening', 'Åben indholdsramme', 'Udskæringen giver indholdet et synligt sted at træde frem.',
        frame('M100 101H440V294H100z', 'M142 170H399V264H142z')),
      part('content', 'Afsløret indhold', 'Tre korte linjer beskriver det indhold, som folden giver adgang til.',
        rect(142, 170, 257, 94, 'ground') + line('M166 190H362M166 213H312M166 237H336', 'edge', '2')),
      part('header', 'Åben overskrift', 'En nedadrettet markør peger på det indhold, der faktisk er åbnet.',
        rect(100, 101, 340, 51, 'ink') + line('m385 119 12 12 12-12', 'ground', '3')),
      part('closed-rows', 'Lukkede rækker', 'To højrevendte markører skelner de lukkede rækker fra den åbne.',
        line('M145 316H432M145 347H432', 'ink', '1.8') + line('m119 310 7 6-7 6m0 19 7 6-7 6', 'ink', '1.8')),
      part('guides', 'Registrering', 'En enkel markering afstemmer motivets konstruktive karakter.', registration(502, 102))
    ]
  };
}

function avatarGroup() {
  const xs = [76, 234, 392];
  return {
    label: 'Tre personudskæringer med ens mellemrum deler en samlet sokkel. Den højere midte giver kompositionen et tyngdepunkt.',
    groups: [
      part('base', 'Fælles sokkel', 'En samlet fysisk base gør de tre individer til én gruppe.', rect(76, 318, 448, 22, 'context')),
      ...xs.map((x, i) => part(`person-${i + 1}`, `Person ${i + 1}`, 'En selvstændig silhuet bevarer sin egen plads i den fælles struktur.',
        rect(x, i === 1 ? 100 : 136, 132, i === 1 ? 218 : 182, i === 1 ? 'subject' : 'counter') + personCutout(x + 66, i === 1 ? 181 : 217, 1.08))),
      part('connection', 'Gruppens grundlinje', 'En ubrudt linje og fælles mål holder personerne sammen.',
        line('M76 318H524', 'ink', '1.8') + line('M76 361H524M142 348v13M300 348v13M458 348v13', 'edge', '1', 'opacity=".65"'))
    ]
  };
}

function progress() {
  const xs = [79, 195, 311, 427];
  return {
    label: 'Fire lige store etaper følger en fælles rute. De første tre er udfyldt, den sidste står åben og venter.',
    groups: [
      part('route', 'Etapernes forbindelse', 'En ubrudt forbindelse viser rækkefølgen uafhængigt af farve.',
        line('M123 112H471', 'ink', '2') + line('m461 105 10 7-10 7', 'ink', '2')),
      ...xs.map((x, i) => part(`stage-${i + 1}`, `Etape ${i + 1}`, i < 3 ? 'En udfyldt etape viser gennemført fremdrift.' : 'En åben kontur viser den ventende destination.',
        (i < 3 ? rect(x, 148, 88, 137, i === 2 ? 'subject' : 'counter') : rect(x, 148, 88, 137, 'ground', 'stroke="var(--g-edge)" stroke-width="var(--g-line-width)"')) +
        (i < 3 ? path(`M${x + 24} 285V214a20 20 0 0 1 40 0v71z`, 'ground') : line(`M${x + 24} 285V214a20 20 0 0 1 40 0v71`, 'edge')) +
        circle(x + 44, 112, i < 3 ? 5 : 7, i < 3 ? 'ink' : 'ground', i < 3 ? '' : 'stroke="var(--g-ink)" stroke-width="2"'))),
      part('base', 'Fælles mål', 'Den fælles bundlinje understøtter, at alle etaper måles som lige store enheder.',
        line('M70 285H524', 'ink', '1.8') + line('M79 319H399M427 319H515', 'edge', '1', 'opacity=".65"'))
    ]
  };
}

function imageParts(withCaption = false) {
  const y = withCaption ? 62 : 91;
  const bottom = y + 222;
  const groups = [
    part('rear-plane', 'Bagplan', 'Et forskudt materialeplan giver billedrammen fysisk nærvær.', rect(144, y - 14, 340, 236, 'context')),
    part('landscape', 'Billedindhold', 'En horisont og en sol skelner motivet fra en tom komponentflade.',
      rect(147, y + 24, 270, 174, 'ground') + circle(368, y + 69, 28, 'counter') +
      path(`M147 ${y + 176}l82-80 78 80 55-49 55 49v22H147z`, 'context') +
      path(`M278 ${y + 198}l69-79 70 79z`, 'ink')),
    part('frame', 'Udskåret billedramme', 'En tydelig åbning adskiller selve billedet fra omgivelserne.',
      frame(`M118 ${y}H446V${bottom}H118z`, `M147 ${y + 24}H417V${y + 198}H147z`) +
      line(`M118 ${y}H446V${bottom}H118z`, 'ink'))
  ];
  if (withCaption) {
    groups.push(
      part('caption-link', 'Billedtekstens anker', 'Et faktisk fæstnet forbindelsespunkt gør tekstens tilhørighed entydig.',
        line(`M282 ${bottom}v37h88`, 'ink', '1.8') + circle(282, bottom, 5, 'counter')),
      part('caption', 'Tilhørende billedtekst', 'To rolige linjer står som tekst, der er knyttet til billedet.',
        line('M143 349H429M143 373H354', 'edge', '2'))
    );
  } else {
    groups.push(part('guides', 'Billedets fod', 'En diskret bundmarkering forankrer rammen.',
      line(`M118 ${bottom + 30}H446`, 'edge', '1', 'opacity=".65"') + registration(493, 102)));
  }
  return groups;
}

function image() {
  return { label: 'Et landskab ses gennem en solid, udskåret billedramme med et forskudt bagplan.', groups: imageParts() };
}

function caption() {
  return { label: 'Et indrammet landskab har et tydeligt ankerpunkt til en billedtekst nedenunder.', groups: imageParts(true) };
}

function checkbox() {
  return {
    label: 'Et flueben ligger i en tydelig indfældning. Et åbent felt nedenunder viser den alternative, umarkerede tilstand.',
    groups: [
      part('rear-plane', 'Felternes bagplaner', 'Samme beskedne forskydning understøtter, at begge felter er den samme indfældede kontrolform.',
        rect(135, 84, 122, 122, 'context') + rect(135, 255, 122, 122, 'context')),
      part('selected-field', 'Markeret indfældning', 'Et hulrum i forgrunden giver afkrydsningen et afgrænset sted.',
        rect(146, 120, 74, 74, 'counter') + frame('M122 96H244V218H122z', 'M146 120H220V194H146z') + line('M122 96H244V218H122z', 'ink')),
      part('check', 'Afkrydsning', 'Det genkendelige flueben bærer valgets betydning.', line('m159 154 18 21 29-38', 'ink', '5')),
      part('unselected-field', 'Umærket indfældning', 'En tom udskæring skelner den alternative tilstand uden at kræve farve.',
        frame('M122 267H244V389H122z', 'M146 291H220V365H146z', 'context') + line('M122 267H244V389H122z', 'edge')),
      part('labels', 'Tilhørende tekst', 'Korte tekstspor gør motivets feltrelation genkendelig.',
        line('M282 138H472M282 175H419', 'ink', '2') + line('M282 328H472', 'edge', '1.8'))
    ]
  };
}

const motifs = { poster, focus, relation, rhythm, accordion, 'avatar-group': avatarGroup, progress, image, caption, checkbox };

export function draw(motif, { prefix } = {}) {
  if (!Object.hasOwn(motifs, motif)) return drawCatalog(motif, { prefix });
  const result = motifs[motif](prefix);
  return {
    body: result.groups.map(({ key, body }) => `<g data-part="${key}">${body}</g>`).join(''),
    viewBox: '0 0 600 420',
    label: result.label,
    parts: result.groups.map(({ key, name, purpose }) => ({ key, name, purpose }))
  };
}

import {drawCatalog} from './fieldlines-catalog.mjs';

export const meta = {
  "id": "fieldlines",
  "name": "Feltlinjer",
  "description": "Præcise kurver og meningsfulde knudepunkter forbinder kilder, beslutninger og destinationer. Et organisk og matematisk billedsprog med én tydelig rute.",
  "qualities": [
    "Organisk",
    "Matematisk",
    "Flydende"
  ]
};

const paint = role => `var(--g-${role})`;
const path = (d, role = 'subject', extra = '') => `<path d="${d}" fill="${paint(role)}" ${extra}/>`;
const line = (d, role = 'edge', width = 'var(--g-line-width)', extra = '') => `<path d="${d}" fill="none" stroke="${paint(role)}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const circle = (cx, cy, r, role = 'subject', extra = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${paint(role)}" ${extra}/>`;
const rect = (x, y, width, height, role = 'plane', extra = '') => `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${paint(role)}" ${extra}/>`;
const part = (key, name, purpose, body) => ({ key, name, purpose, body });
const registration = (x, y) => line(`M${x - 8} ${y}h16M${x} ${y - 8}v16`, 'edge', '1', 'opacity=".55"');
const outlinedCircle = (x, y, r, role = 'ink', width = 'var(--g-line-width)', extra = '') => circle(x, y, r, 'ground', `stroke="${paint(role)}" stroke-width="${width}" ${extra}`);
const person = (x, y, scale = 1, role = 'ink') => `<g transform="translate(${x} ${y}) scale(${scale})">${circle(0, -13, 10, role)}${path('M-18 15a18 18 0 0 1 36 0v7h-36z', role)}</g>`;

function poster() {
  const active = 'M30 268C141 268 151 230 262 230s115-58 310-58';
  return {
    label: 'Otte organiske baner samles omkring et knudepunkt. Et tydeligt hovedspor forbinder dem med en fælles destination.',
    groups: [
      part('field', 'Ledsagende feltlinjer', 'Faneformede kurver skaber en matematisk disciplineret, organisk omgivelse.',
        Array.from({ length: 8 }, (_, i) => line(`M30 ${88 + i * 30}C152 ${88 + i * 30} 119 ${332 - i * 17} 262 ${332 - i * 17}S364 ${76 + i * 24} 572 ${76 + i * 24}`, 'edge', '1.5', `opacity="${.30 + i * .045}"`)).join('')),
      part('route', 'Fælles retning', 'Et ubrudt hovedspor får visuel vægt blandt de mange mulige forløb.',
        line(active, 'ground', '22') + line(active, 'subject', '14') + line(active, 'ink', '1.3')),
      part('decision', 'Samlende knude', 'Et klart knudepunkt giver de mange baner et fælles tyngdepunkt.',
        circle(262, 230, 62, 'context') + circle(262, 230, 47, 'ground') + circle(262, 230, 29, 'counter') + circle(262, 230, 5, 'ink')),
      part('destination', 'Rutens destination', 'En særskilt destinationsmarkør er faktisk placeret på hovedsporet.',
        outlinedCircle(495, 176.9, 13, 'ink', '1.5') + circle(495, 176.9, 6, 'subject')),
      part('guides', 'Konstruktionsspor', 'Tilbagetrukne hjælpelinjer understøtter kurvernes præcision.',
        line('M262 147v-32h77M344 115h51M262 314v31h90', 'edge', '1', 'opacity=".55"') +
        registration(56, 59) + registration(542, 355))
    ]
  };
}

function focus() {
  const active = 'M45 292C152 292 172 210 300 210s147-76 255-76';
  return {
    label: 'Et flydende forløb samles i ét klart knudepunkt. Koncentriske markeringer afgrænser fokus uden at afbryde forbindelsen.',
    groups: [
      part('field', 'Omgivende forløb', 'Tre afstemte kurver skaber plads omkring det vigtige punkt.',
        line('M45 151C172 151 164 292 300 292s123-117 255-117', 'edge', '1.5', 'opacity=".5"') +
        line('M45 177C172 177 164 270 300 270s123-74 255-74', 'edge', '1.5', 'opacity=".6"') +
        line('M45 203C172 203 164 248 300 248s123-31 255-31', 'edge', '1.5', 'opacity=".7"')),
      part('route', 'Opmærksomhedens vej', 'Et klart spor leder ind til fokus og videre derfra.', line(active, 'subject', '10') + line(active, 'ink', '1.2')),
      part('focus-ring', 'Fokusets afgrænsning', 'En rolig ring giver det centrale motiv et selvstændigt felt.',
        circle(300, 210, 84, 'ground') + outlinedCircle(300, 210, 84, 'edge', '1.5') + outlinedCircle(300, 210, 67, 'edge', '1', 'opacity=".5"')),
      part('subject', 'Fokuspunkt', 'Ét fyldt punkt er motivets klare tyngdepunkt.', circle(300, 210, 39, 'counter') + circle(300, 210, 7, 'ink')),
      part('guides', 'Optisk registrering', 'Korte markeringer gør skala og centrum mærkbare uden ekstra rammer.',
        line('M300 107v-18M300 313v18M197 210h-18M403 210h18', 'edge', '1', 'opacity=".55"'))
    ]
  };
}

function relation() {
  return {
    label: 'To selvstændige knuder forbindes af to komplementære kurver. Relationens fælles rum opstår mellem dem.',
    groups: [
      part('outbound', 'Første forbindelse', 'Et præcist, organisk forløb forbinder de to enheder.',
        line('M112 211C192 83 408 83 488 211', 'subject', '11') + line('M112 211C192 83 408 83 488 211', 'ink', '1.1')),
      part('return', 'Komplementær forbindelse', 'Den anden bane gør mødet gensidigt og afgrænser et fælles rum.',
        line('M112 211C192 339 408 339 488 211', 'counter', '11') + line('M112 211C192 339 408 339 488 211', 'ink', '1.1')),
      part('source', 'Første enhed', 'En selvstændig, afgrænset enhed forbliver genkendelig i relationen.',
        outlinedCircle(112, 211, 27, 'ink', '1.5') + circle(112, 211, 10, 'subject')),
      part('destination', 'Anden enhed', 'Den anden enhed har samme vægt og samme adgang til forbindelsen.',
        outlinedCircle(488, 211, 27, 'ink', '1.5') + circle(488, 211, 10, 'counter')),
      part('shared-space', 'Fælles rum', 'Et lille kryds og to korte forbindelsesstreger afmærker midten som en relation, ikke en tredje person.',
        line('M286 211h28M300 197v28', 'edge', '1.5') + line('M300 151v18M300 253v18', 'edge', '1', 'opacity=".5"'))
    ]
  };
}

function rhythm() {
  const wave = 'M48 248C90 248 90 128 132 128S174 248 216 248S258 128 300 128S342 248 384 248S426 128 468 128S510 248 552 248';
  return {
    label: 'En kurve gentager tre jævne bølger. Parallelle ledsagespor og afstemte knudepunkter gør rytmen synlig.',
    groups: [
      part('echo-1', 'Første ledsagespor', 'En parallel gentagelse tilfører rytmen dybde uden at ændre dens takt.', `<g transform="translate(0 20)">${line(wave, 'edge', '1.5', 'opacity=".65"')}</g>`),
      part('echo-2', 'Andet ledsagespor', 'Endnu et kontrolleret interval gør gentagelsen til et samlet felt.', `<g transform="translate(0 40)">${line(wave, 'edge', '1.5', 'opacity=".4"')}</g>`),
      part('rhythm', 'Bærende bølge', 'En ubrudt kurve viser gentagelse som forløb frem for søjler.', line(wave, 'subject', '5')),
      part('beats', 'Rytmens punkter', 'Tre ligeværdige knuder gør de tilbagevendende højdepunkter aflæselige.',
        circle(132, 128, 6, 'ink') + circle(300, 128, 6, 'ink') + circle(468, 128, 6, 'ink')),
      part('intervals', 'Intervalmål', 'Et enkelt mål viser, at gentagelsen er bevidst afstemt.',
        line('M132 332H468M132 325v14M300 325v14M468 325v14', 'edge', '1', 'opacity=".6"'))
    ]
  };
}

function accordion() {
  return {
    label: 'En hovedrække folder sig ud i tre forbundne indholdslinjer. Alle grene sidder på den samme ubrudte stamme.',
    groups: [
      part('header', 'Åben hovedrække', 'En markør og en stærk linje viser den overskrift, der er udfoldet.',
        circle(122, 101, 28, 'context') + line('m112 97 10 10 10-10', 'ink', '2.5') + line('M164 101H451', 'subject', '20')),
      part('stem', 'Ubrudt stamme', 'Alle tre indholdslinjer har samme fysiske oprindelse.', line('M122 116V276', 'subject', '5')),
      part('branch-1', 'Første indholdsgren', 'En selvstændig gren forbinder første indhold med hovedrækken.',
        line('M122 170H217', 'subject', '5') + circle(217, 170, 7, 'counter') + line('M240 170H451', 'edge', '2')),
      part('branch-2', 'Anden indholdsgren', 'Den midterste gren fortsætter den samme forgreningslogik.',
        line('M122 218H217', 'subject', '5') + circle(217, 218, 7, 'counter') + line('M240 218H478', 'edge', '2')),
      part('branch-3', 'Tredje indholdsgren', 'Stammen rundes ind i den sidste gren uden et løst stykke linje.',
        line('M122 276q0 20 20 20H217', 'subject', '5') + circle(217, 296, 7, 'counter') + line('M240 296H416', 'edge', '2')),
      part('guides', 'Sekundært konstruktionsspor', 'En diskret hjælpelinje står fri af indholdsgrenenes ender.',
        line('M89 74V325', 'edge', '1', 'opacity=".4"'))
    ]
  };
}

function avatarGroup() {
  const route = 'M132 183C168 183 224 271 300 271s132-88 168-88';
  return {
    label: 'Tre personmarkører har hver deres plads på én ubrudt forbindelseskurve.',
    groups: [
      part('relation', 'Gruppens relation', 'Et ubrudt bånd gør personernes fællesskab synligt.', line(route, 'counter', '18') + line(route, 'ink', '1.5')),
      part('person-1', 'Første person', 'En selvstændig personmarkør bevarer sin egen identitet.', circle(132, 163, 49, 'context') + person(132, 160, 1.25)),
      part('person-2', 'Midterste person', 'En tydelig personmarkør ligger på gruppens fælles forbindelsespunkt.', circle(300, 224, 56, 'subject') + person(300, 220, 1.5, 'ground')),
      part('person-3', 'Tredje person', 'Den sidste person har samme vægt og samme forbindelse som den første.', circle(468, 163, 49, 'context') + person(468, 160, 1.25)),
      part('nodes', 'Relationspunkter', 'To diskrete knuder viser, hvor personerne bliver del af den fælles kurve.', circle(201, 227, 5, 'counter') + circle(399, 227, 5, 'counter'))
    ]
  };
}

function progress() {
  const full = 'M90 282H184Q230 282 230 236V172Q230 126 276 126H510';
  const done = 'M90 282H184Q230 282 230 236V172Q230 126 276 126H366';
  return {
    label: 'En tydelig rute passerer to milepæle og slutter ved den aktuelle knude. Den resterende bane fører videre til en åben destination.',
    groups: [
      part('remaining-route', 'Ventende bane', 'Samme bevidste banebredde viser den endnu ikke gennemførte del af forløbet.', line(full, 'context', '18') + line(full, 'edge', '1.2')),
      part('completed-route', 'Gennemført bane', 'Den fyldte rute afsluttes nøjagtigt ved den senest nåede markør.', line(done, 'subject', '18')),
      part('milestones', 'Passerede milepæle', 'To mindre punkter viser passerede skridt og forveksles ikke med den aktuelle position.', circle(123, 282, 5, 'ink') + circle(230, 210, 5, 'ink')),
      part('current-node', 'Aktuel position', 'En markant knude står på den udfyldte rutes faktiske slutpunkt.', circle(366, 126, 12, 'counter', 'stroke="var(--g-ground)" stroke-width="4"') + circle(366, 126, 3, 'ink')),
      part('destination', 'Åben destination', 'En tom markør viser, at der stadig er et mål længere fremme.', outlinedCircle(510, 126, 20, 'ink', '2.5')),
      part('guides', 'Forløbets mål', 'Diskrete lodrette spor giver milepælene plads uden at ligne ekstra data.',
        line('M123 306v22M366 154v174M510 154v174M90 328H534', 'edge', '1', 'opacity=".5"'))
    ]
  };
}

function landscapeParts(withCaption, prefix) {
  const top = withCaption ? 65 : 82;
  const bottom = top + 226;
  const clip = `${prefix || 'fieldlines'}-landscape`;
  const silhouette = `M112 ${top}H488V${bottom}H112z`;
  const defs = `<defs><clipPath id="${clip}"><rect x="113" y="${top + 1}" width="374" height="224"/></clipPath></defs>`;
  const groups = [
    part('frame', 'Billedets afgrænsning', 'En let ramme giver landskabets linjer en præcis lokal sammenhæng.',
      rect(112, top, 376, 226, 'plane') + line(silhouette, 'edge', '1.7')),
    part('landscape', 'Landskabsforløb', 'Kontinuerlige kurver antyder et landskab med dybde, ikke endnu en brugerflade.',
      `<g clip-path="url(#${clip})">` +
      line(`M112 ${top + 155}C180 ${top + 155} 185 ${top + 85} 250 ${top + 85}S354 ${top + 199} 423 ${top + 199}s53-79 83-79`, 'subject', '11') +
      line(`M112 ${top + 178}C180 ${top + 178} 185 ${top + 108} 250 ${top + 108}S354 ${top + 222} 423 ${top + 222}s53-79 83-79`, 'edge', '1.4', 'opacity=".65"') +
      line(`M112 ${top + 201}C180 ${top + 201} 185 ${top + 131} 250 ${top + 131}S354 ${top + 245} 423 ${top + 245}s53-79 83-79`, 'edge', '1.4', 'opacity=".4"') + '</g>'),
    part('sun', 'Landskabets tyngdepunkt', 'En afgrænset solmarkør gør motivet genkendeligt som billede.',
      outlinedCircle(389, top + 60, 34, 'edge', '1', 'opacity=".55"') + circle(389, top + 60, 26, 'counter'))
  ];
  if (withCaption) {
    groups.push(
      part('caption-link', 'Billedtekstens forbindelse', 'Et faktisk ankerpunkt knytter den tilhørende tekst til billedet.',
        circle(300, bottom, 5, 'subject') + line(`M300 ${bottom}v29q0 10 10 10h75`, 'subject', '2.5')),
      part('caption', 'Billedtekst', 'To rolige tekstlinjer understøtter sammenhængen uden at ligne endnu et forløb.',
        line('M145 356H455M145 379H370', 'edge', '1.8'))
    );
  } else {
    groups.push(part('guides', 'Registrering', 'En enkelt optisk markering fastholder familiens præcise håndværk.', registration(518, 82)));
  }
  return { defs, groups };
}

function image(prefix) {
  return { label: 'Et let indrammet billede rummer en sol og tre sammenhængende landskabskurver.', ...landscapeParts(false, prefix) };
}

function caption(prefix) {
  return { label: 'Et landskab har et tydeligt forbindelsespunkt til to billedtekstlinjer nedenunder.', ...landscapeParts(true, prefix) };
}

function checkbox() {
  return {
    label: 'Et sammenhængende flueben ender i en tydelig knude inde i det markerede felt. Det tomme felt nedenunder viser det alternative valg.',
    groups: [
      part('selected-field', 'Markeret felt', 'Et roligt, afgrænset felt giver det valgte tegn plads.',
        rect(113, 96, 112, 112, 'plane', 'rx="13"') + line('M126 96h86q13 0 13 13v86q0 13-13 13h-86q-13 0-13-13v-86q0-13 13-13z', 'edge', '1.8')),
      part('check-route', 'Afkrydsningens forløb', 'En præcis knækket linje bærer den genkendelige afkrydsningsbetydning.',
        line('m138 151 24 28 41-55', 'subject', '7') + circle(203, 124, 5, 'counter')),
      part('unselected-field', 'Umærket felt', 'En tom form viser den alternative tilstand gennem geometri.',
        rect(113, 265, 112, 112, 'plane', 'rx="13" stroke="var(--g-edge)" stroke-width="1.8"')),
      part('labels', 'Tilhørende tekstspor', 'Tekstspor knytter valgsymbolerne til deres indhold.',
        line('M269 127H478M269 170H418', 'ink', '2') + line('M269 321H478', 'edge', '1.8')),
      part('guides', 'Feltets konstruktionsspor', 'Et diskret hjørnemål holder materialet let og teknisk præcist.',
        line('M94 96v112M87 96h14M87 208h14', 'edge', '1', 'opacity=".4"'))
    ]
  };
}

const motifs = { poster, focus, relation, rhythm, accordion, 'avatar-group': avatarGroup, progress, image, caption, checkbox };

export function draw(motif, { prefix } = {}) {
  const result = Object.hasOwn(motifs,motif)?motifs[motif](prefix):drawCatalog(motif);
  if (!result) throw new RangeError(`Ukendt Feltlinjer-motiv: ${motif}`);
  return {
    body: (result.defs || '') + result.groups.map(({ key, body }) => `<g data-part="${key}">${body}</g>`).join(''),
    viewBox: '0 0 600 420',
    label: result.label,
    parts: result.groups.map(({ key, name, purpose }) => ({ key, name, purpose }))
  };
}

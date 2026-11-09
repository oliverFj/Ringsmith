const hafner={label:'C.HAFNER',url:'https://www.c-hafner.de/technologien-werkstoffe/werkstoffe/legierungen-fuer-schmuck-uhren-dekorative-anwendungen.html'};
const berolina={label:'Berolina',url:'https://www.berolina.biz/wp-content/uploads/Berolina_Datenblatt_Walzdraht.pdf'};
// Representative supplier alloys, not densities inferred from fineness alone.
// Values are g/cm³; the calculator works from the unscaled finished volume.
export const materials=[
  {id:'silver925',label:'Sterlingsølv · 925',density:10.4,source:berolina},
  {id:'silver999',label:'Finsølv · 999',density:10.5,source:hafner},
  {id:'gold8',label:'Gult guld · 8 kt / 333',density:10.9,source:hafner},
  {id:'gold9',label:'Gult guld · 9 kt / 375',density:11.2,source:hafner},
  {id:'gold14',label:'Gult guld · 14 kt / 585',density:13.3,source:hafner},
  {id:'gold18',label:'Gult guld · 18 kt / 750',density:15.5,source:berolina},
  {id:'gold22',label:'Gult guld · 22 kt / 916',density:17.6,source:hafner},
  {id:'white14',label:'Hvidguld · 14 kt / 585',density:14.5,source:hafner},
  {id:'rose14',label:'Roséguld · 14 kt / 585',density:13.2,source:hafner},
  {id:'platinum950',label:'Platin · 950',density:20.2,source:hafner},
  {id:'palladium950',label:'Palladium · 950',density:11.7,source:hafner},
  {id:'titanium2',label:'Titan · Grade 2',density:4.51,source:{label:'Smiths Metal Centres',url:'https://www.smithmetal.com/cp-grade-2.htm'}},
  {id:'steel316l',label:'Rustfrit stål · 316L',density:8,source:{label:'thyssenkrupp',url:'https://www.thyssenkrupp-materials.co.uk/stainless-steel-316l-14404.html'}},
];
export const densityLimits={min:0.01,max:30};
export const validDensity=value=>Number.isFinite(value)&&value>=densityLimits.min&&value<=densityLimits.max;
export function weightInGrams(volume,density) {
  return Number.isFinite(volume)&&volume>=0&&validDensity(density)?volume*density/1000:null;
}

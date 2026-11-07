# Ringsmith

Et lokalt værksted til parametriske smykkeringe. Form en almindelig ring eller en udhulet signetring, tilføj et motiv, og eksportér til OBJ eller 3MF i millimeter.

## Brug programmet

[Hent den færdige udgave fra Releases](https://github.com/oliverFj/Ringsmith/releases/latest), pak ZIP-filen ud, og åbn `Ringsmith.html` i en browser. Programmet fungerer offline og behandler motiver lokalt.

- Skydere og præcis talindtastning til størrelse, profil og udhuling.
- Flad, rund signetflade med afrundet kant og åbne baner langs indersiden.
- SVG, PNG, JPG og WebP som gravering eller relief.
- Støbetillæg skalerer den færdige eksport, mens designmålene bevares.
- Baggrundsberegning holder felterne responsive, mens modellen opdateres.

Udviklingsudgave: kontrollér mål, gods, motiv og printbarhed i sliceren før produktion. Programmet placerer ikke printstøtter.

## Udvikling

Kræver Node.js 20 eller nyere.

```sh
npm ci
npm test
npm run build
```

Åbn derefter den genererede `index.html` direkte i browseren. Ingen udviklingsserver er nødvendig. Redigér `src/`; HTML-filen genereres af buildet.

Projektet indeholder sin lokale Design Studio-runtime og sit tema. Almindelige builds kræver ikke en separat Design Studio-installation. `design/design.css` og `design/runtime/` opdateres gennem Design Studios sync-værktøj.

## Licenser

Tredjepartslicenser er indlejret i den færdige HTML-fil. Fontlicenser findes også i `design/assets/`. Projektets egen kode har endnu ingen valgt open source-licens.

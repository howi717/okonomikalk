# SmartKalk økonomiportal v7

Endringer i v7:
- Egen `salary-data.js`.
- Yrkeslønn velger ikke automatisk første treff.
- Treffliste viser yrkestittel først.
- Årslønn vises først etter at brukeren velger et konkret yrke.
- Søket matcher start på yrke/alias/ord og unngår at "for" matcher "sjåfør".
- Lagt inn blant annet frisør, drosjesjåfør, taxisjåfør, bilmekaniker, bilselger, birøkter og forsikringsselger.
- Timespris viser "Omsetning for å nå ønsket inntekt".


## v8 endringer

- `salary-data.js` er oppdatert og inkludert direkte i prosjektet.
- Lønnstabellen inneholder 443 yrker.
- Yrkeslønn-søket bruker den nye lønnstabellen.
- Tallene er veiledende eksempel-/estimatdata og bør kvalitetssikres mot SSB/Fagbladet før kommersiell lansering.


## v9 endringer

- Rettet feil i yrkeslønn:
  `salary-data.js` bruker `salaryYearly`, mens appen leste `salary`.
- Årslønn vises nå korrekt fra `salaryYearly`.


## v10 endringer

- Rettet JavaScript-feil fra v9 som stoppet hele appen.
- Yrkeslønn leser nå `salaryYearly` via trygg hjelpefunksjon.
- Hovedfanene Kalkulatorer og Budsjett virker igjen.


## v11 endringer

- Tabeller er gjort smalere.
- Tallkolonner bruker mindre plass.
- Første tekstkolonne får bedre plass.
- Tabelloverskrifter brytes bedre og forsvinner ikke ut av visningen.
- Mobilvisning er justert med mindre padding og smalere minimumsbredde.


## v12 endringer

- Budsjett privat-tabellen er gjort mer kompakt.
- Kolonneoverskriften “Beløp per måned” er endret til “Beløp”.
- Mindre plass mellom kategori og “Inntekt/Utgift”.
- Smalere typekolonne.
- Beløpsfeltet er gjort smalere og høyrejustert.


## v13 endringer

- Fjernet de to knappene/boksene i toppen på forsiden:
  - Kalkulatorer
  - Budsjett privat
- De større informasjonsboksene under står igjen som hovedinngang.


## v14 endringer

- Google AdSense-plassholderne på åpningssiden er flyttet fra under innholdet.
- Forsiden har nå én stående annonseplass på venstre side og én stående annonseplass på høyre side.
- Sideannonser skjules automatisk på smalere skjermer for å unngå overlapp.

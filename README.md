# SmartKalk økonomiportal v15

Dette er en betalingsklar prototype.

## Innhold

- `public/` – frontend
- `server.js` – Node/Express-backend
- `package.json`
- `.env.example`
- `PAYMENT_SETUP.md`

## Premium-betaling

Premium for selvstendig næringsdrivende koster 199 kr.

Flyt:

1. Bruker klikker “Kjøp Premium 199 kr”
2. Backend oppretter Stripe Checkout Session
3. Bruker betaler hos Stripe
4. Stripe sender brukeren tilbake med `session_id`
5. Frontend kaller `/api/verify-session`
6. Backend verifiserer betaling hos Stripe
7. Premium åpnes i nettleseren

## Start lokalt

```bash
npm install
copy .env.example .env
npm run dev
```

Åpne:

```text
http://localhost:3000
```

Se `PAYMENT_SETUP.md` for mer.


## v15-narrow endringer

- Hovedinnholdet er gjort smalere.
- Forsideboksene er gjort smalere.
- Panel-padding er litt redusert.
- Sideannonser på forsiden har bedre plass på store skjermer.
- Sideannonser skjules fortsatt på mindre skjermer.


## v15-sideads endringer

- Sideannonser er nå lagt eksplisitt inn i `public/index.html`.
- Én stående Google Ads-holder vises til venstre på forsiden.
- Én stående Google Ads-holder vises til høyre på forsiden.
- De skjules automatisk på skjermer under 1320 px bredde.


## v15-sideads-allpages endringer

- Google Ads-plassholdere er flyttet til sidene også på:
  - Kalkulatorer
  - Budsjett privat
- De brede annonseboksene under overskriften er fjernet fra disse sidene.
- Sideannonser vises bare på aktiv hovedside og skjules på smalere skjermer.

## v49 microsites / landingssider

Kirurgisk tillegg basert på okonomikalk-v48-kompakt-forside:

- /timespris-test/
- /skattebuffer-test/
- /fradrag-enk-test/
- /budsjett-test/
- /lanekostnad-test/

Eksisterende forside, overskrifter, kalkulatorer, premium og prosjektstruktur er ikke endret.
Kun nye microsite-filer er lagt til:
- public/microsite.css
- public/microsite.js
- fem nye mapper med index.html

## v50 microsites

Kirurgisk endring fra v49:
- Alle fem microsites har nå 8 spørsmål.
- Fradragssiden er delt opp i:
  Programvare, Verktøy / utstyr, Leie lokaler, Reise kostnader, Markedsføring, Pensjon, Forsikring, Sykepenger.
- CTA for fradrag sier nå: “Få full fradragsoversikt og dokumentasjonsliste i Økonomikalk”.
- Alle CTA-knapper leder nå til forsiden `/`.
- Ingen AdSense er lagt til eller endret.

## v51 microsites teaser

Kirurgisk endring fra v50:
- Microsites gir ikke lenger full gratis beregning.
- Etter spørsmålene vises kun kort oppsummering/teaser.
- CTA sier at brukeren må sjekke resultat og justere tallene i Økonomikalk.
- Alle CTA-knapper leder til forsiden `/`.
- Ingen AdSense er lagt til eller endret.

## v52 microsites teaser clean

Kirurgisk endring fra v51:
- Fjernet synlig tekst “Landingsside” fra de fem microsidene.
- Ingen andre endringer.

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

# SmartKalk v15 – Stripe Premium

Dette er første betalingsklare versjon.

## Hva er nytt i v15

- Frontend ligger i `/public`
- Node/Express-backend er lagt til
- Stripe Checkout for Premium 199 kr
- Stripe webhook-endepunkt
- Verifisering av betalt Stripe-session
- Premium åpnes lokalt etter vellykket betaling

## Lokal test

1. Installer Node.js 20+
2. Pakk ut prosjektet
3. Åpne terminal i prosjektmappen
4. Kjør:

```bash
npm install
copy .env.example .env
npm run dev
```

På Mac/Linux:

```bash
cp .env.example .env
npm run dev
```

5. Åpne:

```text
http://localhost:3000
```

## Stripe-test

Du må fylle inn `STRIPE_SECRET_KEY` i `.env`.

For webhook lokalt:

```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

Kopier `whsec_...` til `STRIPE_WEBHOOK_SECRET`.

Stripe testkort:

```text
4242 4242 4242 4242
```

## Viktig om sikkerhet

Denne v15 bruker lokal premium-token etter betalt Stripe-session. Det er nok for prototype/tidlig MVP.

For full produksjon bør neste versjon ha:

- innlogging
- database
- lagret kjøp per bruker
- premium-status fra backend
- ikke bare localStorage
- mulighet for å gjenopprette kjøp på ny enhet

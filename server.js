import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = process.env.PORT || 3000;
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

const PREMIUM_TOKEN_SECRET =
  process.env.PREMIUM_TOKEN_SECRET || "change-this-secret-before-production";

const SITE_LOCK_ENABLED = process.env.SITE_LOCK_ENABLED === "true";
const SITE_LOCK_USER = process.env.SITE_LOCK_USER || "";
const SITE_LOCK_PASSWORD = process.env.SITE_LOCK_PASSWORD || "";

const PRODUCT_KEY = "okonomikalk_naering_299";
const PRICE_AMOUNT_NOK = 29900;

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

function makePremiumToken(value) {
  return crypto
    .createHmac("sha256", PREMIUM_TOKEN_SECRET)
    .update(String(value))
    .digest("hex");
}

function makeLicenseCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let raw = "";

  for (let i = 0; i < 8; i += 1) {
    raw += alphabet[crypto.randomInt(0, alphabet.length)];
  }

  return `OK-${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
}

function normalizeLicenseCode(code) {
  return String(code || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9-]/g, "");
}

function isValidLicenseFormat(code) {
  return /^OK-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code);
}

function siteLock(req, res, next) {
  if (!SITE_LOCK_ENABLED) return next();

  // Stripe webhook må slippe gjennom hvis webhook brukes.
  if (req.path === "/api/stripe-webhook") return next();

  const auth = req.headers.authorization || "";
  const [scheme, encoded] = auth.split(" ");

  if (scheme === "Basic" && encoded) {
    const [user, pass] = Buffer.from(encoded, "base64").toString().split(":");

    if (user === SITE_LOCK_USER && pass === SITE_LOCK_PASSWORD) {
      return next();
    }
  }

  res.setHeader("WWW-Authenticate", 'Basic realm="OkonomiKalk test"');
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  return res.status(401).send("ØkonomiKalk er under testing.");
}

// Stripe webhook må ligge før express.json().
app.post(
  "/api/stripe-webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    if (!stripe || !STRIPE_WEBHOOK_SECRET) {
      return res.status(500).send("Stripe webhook is not configured.");
    }

    let event;

    try {
      const signature = req.headers["stripe-signature"];
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      console.error("Webhook signature verification failed:", error.message);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      console.log("ØkonomiKalk purchase completed:", {
        sessionId: session.id,
        customerEmail: session.customer_details?.email,
        amountTotal: session.amount_total,
        currency: session.currency,
        licenseCode: session.metadata?.license_code,
      });
    }

    res.json({ received: true });
  }
);

// Midlertidig lås for hele siden mens testing pågår.
app.use(siteLock);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/create-checkout-session", async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({
        error: "Stripe is not configured. Set STRIPE_SECRET_KEY.",
      });
    }

    const licenseCode = makeLicenseCode();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      allow_promotion_codes: false,
      billing_address_collection: "auto",

      branding_settings: {
        display_name: "ØkonomiKalk",
      },

      line_items: [
        {
          price_data: {
            currency: "nok",
            product_data: {
              name: "ØkonomiKalk Næring",
              description:
                "Engangstilgang til næringsverktøy: skatt, fradrag, timespris, faktura, budsjetter og kjørebok.",
            },
            unit_amount: PRICE_AMOUNT_NOK,
          },
          quantity: 1,
        },
      ],

      success_url: `${PUBLIC_URL}/?session_id={CHECKOUT_SESSION_ID}#kalkulatorer`,
      cancel_url: `${PUBLIC_URL}/?payment_cancelled=1#hjem`,

      metadata: {
        product: PRODUCT_KEY,
        license_code: licenseCode,
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Create checkout session error:", error);
    res.status(500).json({ error: "Could not create checkout session." });
  }
});

app.get("/api/verify-session", async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured." });
    }

    const sessionId = req.query.session_id;

    if (!sessionId) {
      return res.status(400).json({ error: "Missing session_id." });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (
      session.payment_status === "paid" &&
      session.metadata?.product === PRODUCT_KEY
    ) {
      const licenseCode =
        session.metadata?.license_code || makeLicenseCode();

      return res.json({
        premium: true,
        token: makePremiumToken(session.id),
        licenseCode,
      });
    }

    return res.status(402).json({ premium: false });
  } catch (error) {
    console.error("Verify session error:", error);
    res.status(500).json({ error: "Could not verify session." });
  }
});

app.post("/api/verify-license", async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured." });
    }

    const licenseCode = normalizeLicenseCode(req.body?.licenseCode);

    if (!isValidLicenseFormat(licenseCode)) {
      return res.status(400).json({
        premium: false,
        error: "Ugyldig lisenskodeformat.",
      });
    }

    let startingAfter = undefined;
    let pagesChecked = 0;
    const maxPages = 30;

    while (pagesChecked < maxPages) {
      const page = await stripe.checkout.sessions.list({
        limit: 100,
        ...(startingAfter ? { starting_after: startingAfter } : {}),
      });

      const match = page.data.find(
        (session) =>
          session.payment_status === "paid" &&
          session.metadata?.product === PRODUCT_KEY &&
          normalizeLicenseCode(session.metadata?.license_code) === licenseCode
      );

      if (match) {
        return res.json({
          premium: true,
          token: makePremiumToken(`license:${licenseCode}`),
          licenseCode,
        });
      }

      if (!page.has_more || page.data.length === 0) break;

      startingAfter = page.data[page.data.length - 1].id;
      pagesChecked += 1;
    }

    return res.status(404).json({
      premium: false,
      error: "Lisenskoden ble ikke funnet.",
    });
  } catch (error) {
    console.error("Verify license error:", error);
    res.status(500).json({ error: "Could not verify license." });
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    app: "okonomikalk",
    version: "v46",
    siteLock: SITE_LOCK_ENABLED,
    price: 299,
  });
});

app.listen(PORT, () => {
  console.log(`ØkonomiKalk v46 running on ${PUBLIC_URL}`);
  console.log(`Site lock enabled: ${SITE_LOCK_ENABLED}`);
});
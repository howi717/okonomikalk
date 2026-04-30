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

const SITE_LOCK_ENABLED = process.env.SITE_LOCK_ENABLED === "true";
const SITE_LOCK_USER = process.env.SITE_LOCK_USER || "";
const SITE_LOCK_PASSWORD = process.env.SITE_LOCK_PASSWORD || "";

function siteLock(req, res, next) {
  if (!SITE_LOCK_ENABLED) return next();
  if (req.path === "/api/stripe-webhook") return next();

  const auth = req.headers.authorization || "";
  const [scheme, encoded] = auth.split(" ");

  if (scheme === "Basic" && encoded) {
    const [user, pass] = Buffer.from(encoded, "base64").toString().split(":");
    if (user === SITE_LOCK_USER && pass === SITE_LOCK_PASSWORD) return next();
  }

  res.setHeader("WWW-Authenticate", 'Basic realm="OkonomiKalk test"');
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  return res.status(401).send("ØkonomiKalk er under testing.");
}

app.use(siteLock);

const PORT = process.env.PORT || 3000;
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
const PREMIUM_TOKEN_SECRET = process.env.PREMIUM_TOKEN_SECRET || "change-this-secret-before-production";

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

function signValue(value) {
  return crypto
    .createHmac("sha256", PREMIUM_TOKEN_SECRET)
    .update(String(value))
    .digest("hex");
}

function makePremiumToken(value) {
  return signValue(value);
}

function base64UrlEncode(value) {
  return Buffer.from(String(value), "utf8").toString("base64url");
}

function base64UrlDecode(value) {
  return Buffer.from(String(value), "base64url").toString("utf8");
}

function makeLicenseCode(sessionId) {
  const payload = JSON.stringify({
    v: 1,
    product: "okonomikalk_naering_199",
    sessionId: String(sessionId),
    issuedAt: new Date().toISOString()
  });
  const encodedPayload = base64UrlEncode(payload);
  const signature = signValue(encodedPayload).slice(0, 32);
  return `OK1.${encodedPayload}.${signature}`;
}

function verifyLicenseCode(code) {
  const normalized = String(code || "").trim();
  const parts = normalized.split(".");
  if (parts.length !== 3 || parts[0] !== "OK1") return null;

  const [, encodedPayload, signature] = parts;
  const expected = signValue(encodedPayload).slice(0, 32);
  if (signature !== expected) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (payload.product !== "okonomikalk_naering_199") return null;
    if (!payload.sessionId) return null;
    return payload;
  } catch {
    return null;
  }
}

// Stripe webhook must use raw body.
app.post("/api/stripe-webhook", express.raw({ type: "application/json" }), async (req, res) => {
  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    return res.status(500).send("Stripe webhook is not configured.");
  }

  let event;

  try {
    const signature = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(req.body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error("Webhook signature verification failed:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("Premium purchase completed:", {
      sessionId: session.id,
      customerEmail: session.customer_details?.email,
      amountTotal: session.amount_total,
      currency: session.currency
    });

    // Minimal v15:
    // We verify paid sessions on the frontend success redirect via /api/verify-session.
    // Later you can store purchases in a database here.
  }

  res.json({ received: true });
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/create-checkout-session", async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured. Set STRIPE_SECRET_KEY in .env." });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      allow_promotion_codes: false,
      billing_address_collection: "auto",
      line_items: [
        {
          price_data: {
            currency: "nok",
            product_data: {
              name: "ØkonomiKalk Næring",
              description: "Engangstilgang til næringsverktøy: skatteberegning, fradrag, timespris, faktura, rapport og PDF."
            },
            unit_amount: 19900
          },
          quantity: 1
        }
      ],
      success_url: `${PUBLIC_URL}/?session_id={CHECKOUT_SESSION_ID}#kalkulatorer`,
      cancel_url: `${PUBLIC_URL}/#kalkulatorer`,
      metadata: {
        product: "okonomikalk_naering_199"
      }
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

    if (session.payment_status === "paid" && session.metadata?.product === "okonomikalk_naering_199") {
      const licenseCode = makeLicenseCode(session.id);
      return res.json({
        premium: true,
        token: makePremiumToken(session.id),
        licenseCode
      });
    }

    res.status(402).json({ premium: false });
  } catch (error) {
    console.error("Verify session error:", error);
    res.status(500).json({ error: "Could not verify session." });
  }
});


app.post("/api/verify-license", (req, res) => {
  const licenseCode = req.body?.licenseCode;
  const license = verifyLicenseCode(licenseCode);

  if (!license) {
    return res.status(401).json({ ok: false, error: "Ugyldig lisenskode." });
  }

  return res.json({
    ok: true,
    premium: true,
    token: makePremiumToken(`${license.sessionId}:${license.issuedAt}`)
  });
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, app: "okonomikalk", version: "v34" });
});

app.listen(PORT, () => {
  console.log(`ØkonomiKalk v34 running on ${PUBLIC_URL}`);
});

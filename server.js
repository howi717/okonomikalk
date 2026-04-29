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
const PREMIUM_TOKEN_SECRET = process.env.PREMIUM_TOKEN_SECRET || "change-this-secret-before-production";

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

function makePremiumToken(sessionId) {
  return crypto
    .createHmac("sha256", PREMIUM_TOKEN_SECRET)
    .update(String(sessionId))
    .digest("hex");
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
              name: "SmartKalk Premium",
              description: "Engangstilgang til skatteberegning for selvstendig næringsdrivende, rapport, CSV og timespris."
            },
            unit_amount: 19900
          },
          quantity: 1
        }
      ],
      success_url: `${PUBLIC_URL}/?session_id={CHECKOUT_SESSION_ID}#kalkulatorer`,
      cancel_url: `${PUBLIC_URL}/#kalkulatorer`,
      metadata: {
        product: "smartkalk_premium_199"
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

    if (session.payment_status === "paid" && session.metadata?.product === "smartkalk_premium_199") {
      return res.json({
        premium: true,
        token: makePremiumToken(session.id)
      });
    }

    res.status(402).json({ premium: false });
  } catch (error) {
    console.error("Verify session error:", error);
    res.status(500).json({ error: "Could not verify session." });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, app: "smartkalk", version: "v15" });
});

app.listen(PORT, () => {
  console.log(`SmartKalk v15 running on ${PUBLIC_URL}`);
});

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@17.7.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const STRIPE_PRODUCTS: Record<string, { name: string; description: string }> = {
  "ask-an-aussie-30": { name: "Ask an Aussie — 30 min", description: "30 minute phone/video consultation" },
  "ask-an-aussie-60": { name: "Ask an Aussie — 60 min", description: "60 minute phone/video consultation" },
  "get-hired-review": { name: "Get Hired — Resume Review", description: "Resume review and rewrite to Australian standards" },
  "get-hired-full": { name: "Get Hired — Full Package", description: "Resume rewrite + job strategy + cover letter" },
  "mock-interview": { name: "Mock Interview + Feedback", description: "45-60 min mock interview with written feedback" },
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");

    if (!STRIPE_SECRET_KEY) {
      return new Response(
        JSON.stringify({ error: "Stripe not configured. Payment links will be sent manually." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-12-18.acacia" });
    const { price_cents, product_key, user_email, booking_id, success_url, cancel_url } = await req.json();

    const product = STRIPE_PRODUCTS[product_key];
    if (!product) {
      return new Response(
        JSON.stringify({ error: "Invalid product" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "aud",
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: price_cents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: user_email,
      success_url: success_url,
      cancel_url: cancel_url,
      metadata: {
        booking_id: booking_id,
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create checkout session" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const { email, fullName } = body;

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Missing email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const redirectTo = `${req.headers.get("origin") || "https://ozwelcome.com"}/auth/callback`;

    // Generate the email confirmation link
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "signup",
      email,
      options: {
        redirectTo,
      },
    });

    if (error || !data) {
      console.error("Generate link error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to generate verification link", details: error?.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const actionLink = (data as any).properties?.action_link || (data as any).action_link;

    if (!actionLink) {
      return new Response(
        JSON.stringify({ error: "No action link generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send verification email via Resend
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "OzWelcome <noreply@ozwelcome.com>",
        to: [email],
        subject: "Verify your OzWelcome account",
        html: `
          <div style="font-family: 'Source Sans 3', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf8f5; padding: 32px; border-radius: 12px;">
            <div style="background: #e8922a; padding: 20px 24px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">OZWelcome</h1>
              <p style="color: rgba(255,255,255,0.85); margin: 4px 0 0;">Verify Your Email</p>
            </div>
            <div style="background: white; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e8e0d2;">
              <p style="color: #56493e; font-size: 16px;">Hi ${fullName || "there"},</p>
              <p style="color: #56493e; font-size: 16px;">Thanks for signing up! Please verify your email address by clicking the button below:</p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${actionLink}" style="display: inline-block; background: #e8922a; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Verify Email Address</a>
              </div>
              <p style="color: #9a8368; font-size: 14px; text-align: center;">Or copy and paste this link into your browser:</p>
              <p style="color: #9a8368; font-size: 12px; text-align: center; word-break: break-all;">${actionLink}</p>
              <p style="color: #9a8368; font-size: 14px; margin-top: 24px;">If you didn't create this account, you can safely ignore this email.</p>
            </div>
          </div>
        `,
      }),
    });

    if (!resendResponse.ok) {
      const responseText = await resendResponse.text();
      console.error("Resend error:", responseText);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: responseText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

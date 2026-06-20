import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface NotifyPayload {
  type: 'signup' | 'booking' | 'reschedule';
  user_name: string;
  user_email: string;
  user_phone?: string;
  service_name?: string;
  service_id?: string;
  booked_date?: string;
  booked_time?: string;
  preferred_date?: string;
  preferred_time?: string;
  duration_minutes?: number;
  price_cents?: number;
  booking_id?: string;
  resume_file_name?: string;
  notes?: string;
  package_name?: string;
  reason?: string;
}

Deno.serve(async (req: Request) => {
  console.log("FUNCTION ENTERED");
  console.log("Request method:", req.method);
  console.log("Request URL:", req.url);

  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS preflight");
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "chandantcs@gmail.com";
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");

  console.log("ENV CHECK:", {
    hasResendKey: !!RESEND_API_KEY,
    resendKeyLength: RESEND_API_KEY?.length || 0,
    adminEmail: ADMIN_EMAIL,
    hasSupabaseUrl: !!SUPABASE_URL,
    supabaseUrl: SUPABASE_URL,
  });

  let payload: NotifyPayload;

  try {
    const rawBody = await req.text();
    console.log("Raw request body length:", rawBody.length);
    console.log("Raw request body:", rawBody);

    if (!rawBody) {
      console.error("Empty request body received");
      return new Response(
        JSON.stringify({ error: "Empty request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    payload = JSON.parse(rawBody);
    console.log("Payload parsed successfully:", JSON.stringify(payload, null, 2));
  } catch (parseError) {
    console.error("JSON parse error:", parseError);
    return new Response(
      JSON.stringify({ error: "Invalid JSON in request body", details: String(parseError) }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured in secrets");
    return new Response(
      JSON.stringify({ error: "RESEND_API_KEY not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { subject, htmlBody } = buildEmail(payload, ADMIN_EMAIL, SUPABASE_URL);
    console.log("Email built. Sending to:", ADMIN_EMAIL, "Subject:", subject);

    const resendRequestBody = {
      from: "OzWelcome <onboarding@resend.dev>",
      to: [ADMIN_EMAIL],
      subject,
      html: htmlBody,
    };
    console.log("Resend request body:", JSON.stringify(resendRequestBody, null, 2));

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resendRequestBody),
    });

    console.log("Resend response status:", resendResponse.status);
    console.log("Resend response headers:", Object.fromEntries(resendResponse.headers.entries()));

    const responseText = await resendResponse.text();
    console.log("Resend response body:", responseText);

    if (!resendResponse.ok) {
      console.error("Resend API returned error:", resendResponse.status, responseText);
      return new Response(
        JSON.stringify({ error: "Failed to send email", status: resendResponse.status, details: responseText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result: any = null;
    try {
      result = JSON.parse(responseText);
    } catch {
      // responseText may not be JSON
    }

    console.log("Email sent successfully. Message ID:", result?.id);

    return new Response(
      JSON.stringify({ success: true, message_id: result?.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    console.error("Error stack:", error?.stack);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildEmail(payload: NotifyPayload, _adminEmail: string, supabaseUrl: string | undefined): { subject: string; htmlBody: string } {
  if (payload.type === 'signup') {
    return {
      subject: `New User Registration: ${payload.user_name}`,
      htmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf8f5; padding: 32px; border-radius: 12px;">
          <div style="background: #e8922a; padding: 20px 24px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">OZWelcome</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 4px 0 0;">New User Registration</p>
          </div>
          <div style="background: white; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e8e0d2;">
            <p style="color: #56493e; font-size: 16px;">A new user has registered on OzWelcome:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #9a8368; font-size: 14px;">Name</td><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #1c3c2d; font-weight: 600;">${payload.user_name}</td></tr>
              <tr><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #9a8368; font-size: 14px;">Email</td><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #1c3c2d; font-weight: 600;">${payload.user_email}</td></tr>
              <tr><td style="padding: 8px 12px; color: #9a8368; font-size: 14px;">Time</td><td style="padding: 8px 12px; color: #1c3c2d; font-weight: 600;">${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}</td></tr>
            </table>
          </div>
        </div>
      `,
    };
  }

  if (payload.type === 'booking') {
    const base = supabaseUrl || "";
    const confirmUrl = `${base}/functions/v1/booking-action?action=confirm&booking_id=${payload.booking_id}`;
    const rescheduleUrl = `${base}/functions/v1/booking-action?action=reschedule&booking_id=${payload.booking_id}`;
    const resumeDownloadUrl = payload.booking_id
      ? `${base}/functions/v1/booking-action?action=download-resume&booking_id=${payload.booking_id}`
      : null;

    const resumeRow = payload.resume_file_name && resumeDownloadUrl
      ? `<tr><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #9a8368; font-size: 14px;">Resume</td><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #1c3c2d; font-weight: 600;"><a href="${resumeDownloadUrl}" style="color: #e8922a; text-decoration: underline;">${payload.resume_file_name}</a></td></tr>`
      : '';
    const phoneRow = payload.user_phone
      ? `<tr><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #9a8368; font-size: 14px;">Phone</td><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #1c3c2d; font-weight: 600;">${payload.user_phone}</td></tr>`
      : '';
    const notesRow = payload.notes
      ? `<tr><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #9a8368; font-size: 14px;">Notes</td><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #1c3c2d; font-weight: 600;">${payload.notes}</td></tr>`
      : '';
    const packageRow = payload.package_name
      ? `<tr><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #9a8368; font-size: 14px;">Package</td><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #1c3c2d; font-weight: 600;">${payload.package_name}</td></tr>`
      : '';
    const durationRow = payload.duration_minutes && payload.duration_minutes > 0
      ? `<tr><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #9a8368; font-size: 14px;">Duration</td><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #1c3c2d; font-weight: 600;">${payload.duration_minutes} minutes</td></tr>`
      : '';

    return {
      subject: `New Booking: ${payload.service_name} by ${payload.user_name}`,
      htmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf8f5; padding: 32px; border-radius: 12px;">
          <div style="background: #2d6f4e; padding: 20px 24px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Booking</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 4px 0 0;">${payload.service_name}</p>
          </div>
          <div style="background: white; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e8e0d2;">
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #9a8368; font-size: 14px;">User</td><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #1c3c2d; font-weight: 600;">${payload.user_name}</td></tr>
              <tr><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #9a8368; font-size: 14px;">Email</td><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #1c3c2d; font-weight: 600;">${payload.user_email}</td></tr>
              ${phoneRow}
              <tr><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #9a8368; font-size: 14px;">Service</td><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #1c3c2d; font-weight: 600;">${payload.service_name}</td></tr>
              ${packageRow}
              ${durationRow}
              <tr><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #9a8368; font-size: 14px;">Date</td><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #1c3c2d; font-weight: 600;">${payload.booked_date}</td></tr>
              <tr><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #9a8368; font-size: 14px;">Time</td><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #1c3c2d; font-weight: 600;">${payload.booked_time} (AEST)</td></tr>
              <tr><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #9a8368; font-size: 14px;">Price</td><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #1c3c2d; font-weight: 600;">$${payload.price_cents ? (payload.price_cents / 100).toFixed(0) : 'N/A'}</td></tr>
              ${resumeRow}
              ${notesRow}
            </table>
            <div style="text-align: center; margin-top: 24px;">
              <a href="${confirmUrl}" style="display: inline-block; background: #2d6f4e; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 0 8px;">CONFIRM BOOKING</a>
              <a href="${rescheduleUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 0 8px;">PROPOSE NEW TIME</a>
            </div>
          </div>
        </div>
      `,
    };
  }

  if (payload.type === 'reschedule') {
    const base = supabaseUrl || "";
    const confirmUrl = `${base}/functions/v1/booking-action?action=confirm&booking_id=${payload.booking_id}`;

    return {
      subject: `Reschedule Request: ${payload.service_name} by ${payload.user_name}`,
      htmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf8f5; padding: 32px; border-radius: 12px;">
          <div style="background: #2563eb; padding: 20px 24px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Reschedule Request</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 4px 0 0;">${payload.service_name}</p>
          </div>
          <div style="background: white; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e8e0d2;">
            <p style="color: #56493e; font-size: 16px; margin-bottom: 16px;">A user has requested to reschedule their booking:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #9a8368; font-size: 14px;">User</td><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #1c3c2d; font-weight: 600;">${payload.user_name}</td></tr>
              <tr><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #9a8368; font-size: 14px;">Email</td><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #1c3c2d; font-weight: 600;">${payload.user_email}</td></tr>
              <tr><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #9a8368; font-size: 14px;">Service</td><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #1c3c2d; font-weight: 600;">${payload.service_name}</td></tr>
              <tr><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #9a8368; font-size: 14px;">Current Date</td><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #1c3c2d; font-weight: 600;">${payload.booked_date}</td></tr>
              <tr><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #9a8368; font-size: 14px;">Current Time</td><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #1c3c2d; font-weight: 600;">${payload.booked_time} (AEST)</td></tr>
              <tr><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #9a8368; font-size: 14px;">Preferred Date</td><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #2563eb; font-weight: 600;">${payload.preferred_date}</td></tr>
              <tr><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #9a8368; font-size: 14px;">Preferred Time</td><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #2563eb; font-weight: 600;">${payload.preferred_time} (AEST)</td></tr>
              <tr><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #9a8368; font-size: 14px;">Reason</td><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #1c3c2d; font-weight: 600;">${payload.reason || 'Not provided'}</td></tr>
            </table>
            <div style="text-align: center; margin-top: 24px;">
              <a href="${confirmUrl}" style="display: inline-block; background: #2d6f4e; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 0 8px;">CONFIRM BOOKING</a>
            </div>
          </div>
        </div>
      `,
    };
  }

  throw new Error(`Invalid notification type: ${(payload as any).type}`);
}

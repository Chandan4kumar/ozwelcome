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

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    const bookingId = url.searchParams.get("booking_id");

    if (!action || !bookingId) {
      return new Response(
        JSON.stringify({ error: "Missing action or booking_id parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action !== "confirm" && action !== "reschedule" && action !== "download-resume") {
      return new Response(
        JSON.stringify({ error: "Invalid action. Use 'confirm', 'reschedule', or 'download-resume'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    if (action === "confirm") {
      const { data: booking, error: fetchError } = await supabase
        .from("bookings")
        .select("*, profiles(email, full_name)")
        .eq("id", bookingId)
        .maybeSingle();

      if (fetchError || !booking) {
        return new Response(
          JSON.stringify({ error: "Booking not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error: updateError } = await supabase
        .from("bookings")
        .update({ status: "confirmed" })
        .eq("id", bookingId);

      if (updateError) {
        return new Response(
          JSON.stringify({ error: "Failed to update booking" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Send confirmation email to user
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      if (RESEND_API_KEY && booking.profiles) {
        const formattedDate = new Date(booking.booked_date).toLocaleDateString("en-AU", {
          weekday: "long", month: "long", day: "numeric",
        });

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "OzWelcome <noreply@ozwelcome.com>",
            to: [booking.profiles.email],
            subject: `Your ${booking.service_name} Booking is Confirmed!`,
            html: `
              <div style="font-family: 'Source Sans 3', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf8f5; padding: 32px; border-radius: 12px;">
                <div style="background: #2d6f4e; padding: 20px 24px; border-radius: 8px 8px 0 0; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">Booking Confirmed!</h1>
                </div>
                <div style="background: white; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e8e0d2;">
                  <p style="color: #56493e; font-size: 16px;">Hi ${booking.profiles.full_name},</p>
                  <p style="color: #56493e; font-size: 16px;">Your booking has been confirmed:</p>
                  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                    <tr><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #9a8368; font-size: 14px;">Service</td><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #1c3c2d; font-weight: 600;">${booking.service_name}</td></tr>
                    <tr><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #9a8368; font-size: 14px;">Date</td><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #1c3c2d; font-weight: 600;">${formattedDate}</td></tr>
                    <tr><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #9a8368; font-size: 14px;">Time</td><td style="padding: 8px 12px; border-bottom: 1px solid #f3efe7; color: #1c3c2d; font-weight: 600;">${booking.booked_time} (AEST)</td></tr>
                  </table>
                  <p style="color: #56493e; font-size: 14px;">You'll receive a meeting link or phone call details closer to the date. See you then!</p>
                </div>
              </div>
            `,
          }),
        });
      }

      return new Response(
        `<html><body style="font-family: 'Source Sans 3', Arial, sans-serif; text-align: center; padding: 60px 20px; background: #faf8f5;">
          <div style="max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; border: 1px solid #e8e0d2;">
            <div style="width: 64px; height: 64px; background: #d9edde; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
              <span style="font-size: 32px; color: #2d6f4e;">&#10003;</span>
            </div>
            <h1 style="color: #1c3c2d; margin: 0 0 12px;">Booking Confirmed!</h1>
            <p style="color: #9a8368; font-size: 16px;">The booking for ${booking.service_name} has been confirmed. A confirmation email has been sent to the user.</p>
          </div>
        </body></html>`,
        { status: 200, headers: { ...corsHeaders, "Content-Type": "text/html" } }
      );
    }

    if (action === "reschedule") {
      const { data: booking, error: fetchError } = await supabase
        .from("bookings")
        .select("*, profiles(email, full_name)")
        .eq("id", bookingId)
        .maybeSingle();

      if (fetchError || !booking) {
        return new Response(
          JSON.stringify({ error: "Booking not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error: updateError } = await supabase
        .from("bookings")
        .update({ status: "rescheduled" })
        .eq("id", bookingId);

      if (updateError) {
        return new Response(
          JSON.stringify({ error: "Failed to update booking" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Notify user about reschedule request
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      if (RESEND_API_KEY && booking.profiles) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "OzWelcome <noreply@ozwelcome.com>",
            to: [booking.profiles.email],
            subject: `Reschedule Requested: ${booking.service_name}`,
            html: `
              <div style="font-family: 'Source Sans 3', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf8f5; padding: 32px; border-radius: 12px;">
                <div style="background: #2563eb; padding: 20px 24px; border-radius: 8px 8px 0 0; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">Reschedule Requested</h1>
                </div>
                <div style="background: white; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e8e0d2;">
                  <p style="color: #56493e; font-size: 16px;">Hi ${booking.profiles.full_name},</p>
                  <p style="color: #56493e; font-size: 16px;">A new time has been proposed for your ${booking.service_name} booking. We'll follow up with new time options shortly.</p>
                  <p style="color: #9a8368; font-size: 14px;">You can also log in to your dashboard to request a specific new time.</p>
                </div>
              </div>
            `,
          }),
        });
      }

      return new Response(
        `<html><body style="font-family: 'Source Sans 3', Arial, sans-serif; text-align: center; padding: 60px 20px; background: #faf8f5;">
          <div style="max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; border: 1px solid #e8e0d2;">
            <div style="width: 64px; height: 64px; background: #dbeefe; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
              <span style="font-size: 32px; color: #2563eb;">&#128338;</span>
            </div>
            <h1 style="color: #1c3c2d; margin: 0 0 12px;">Reschedule Initiated</h1>
            <p style="color: #9a8368; font-size: 16px;">The booking for ${booking.service_name} has been marked for reschedule. The user has been notified and will receive new time options.</p>
          </div>
        </body></html>`,
        { status: 200, headers: { ...corsHeaders, "Content-Type": "text/html" } }
      );
    }

    if (action === "download-resume") {
      const { data: booking, error: fetchError } = await supabase
        .from("bookings")
        .select("resume_file_path, resume_file_name, service_name")
        .eq("id", bookingId)
        .maybeSingle();

      if (fetchError || !booking) {
        return new Response(
          JSON.stringify({ error: "Booking not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!booking.resume_file_path) {
        return new Response(
          JSON.stringify({ error: "No resume attached to this booking" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: fileData, error: downloadError } = await supabase.storage
        .from("resumes")
        .download(booking.resume_file_path);

      if (downloadError || !fileData) {
        return new Response(
          JSON.stringify({ error: "Failed to download resume" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const contentType = booking.resume_file_name?.endsWith(".pdf")
        ? "application/pdf"
        : booking.resume_file_name?.endsWith(".doc")
          ? "application/msword"
          : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

      return new Response(fileData, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${booking.resume_file_name || "resume"}"`,
        },
      });
    }

    return new Response(
      JSON.stringify({ error: "Unhandled action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

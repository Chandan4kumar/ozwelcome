import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

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
    const serviceId = url.searchParams.get('service_id');
    const date = url.searchParams.get('date');

    if (!serviceId || !date) {
      return new Response(
        JSON.stringify({ error: "Missing service_id or date parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all bookings for this service and date that are not cancelled
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('booked_time, duration_minutes')
      .eq('service_id', serviceId)
      .eq('booked_date', date)
      .in('status', ['pending', 'confirmed']);

    if (error) {
      return new Response(
        JSON.stringify({ error: "Failed to check availability" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For services that require time slots (ask-an-aussie and mock-interview)
    // Map booked slots to their time ranges
    const bookedSlots: string[] = [];

    if (bookings && bookings.length > 0) {
      // For simplicity, mark the exact booked time slots as unavailable
      // Each time slot is 30 min, so a 60 min session blocks 2 slots
      for (const booking of bookings) {
        const time = booking.booked_time;
        const duration = booking.duration_minutes || 30;

        bookedSlots.push(time);

        // If duration is 60 min, also block the next slot
        if (duration >= 60) {
          // Calculate next slot (30 mins later)
          const [hours, mins] = time.match(/(\d+):(\d+)/)?.slice(1) || [];
          const hour = parseInt(hours);
          const minute = parseInt(mins);
          const isAM = time.includes('AM');

          let totalMins = (isAM ? hour : hour + 12) * 60 + minute;
          totalMins += 30;

          const newHour = Math.floor(totalMins / 60) % 24;
          const newMin = totalMins % 60;
          const newIsAM = newHour < 12;

          const displayHour = newHour === 0 ? 12 : newHour > 12 ? newHour - 12 : newHour;
          const nextSlot = `${displayHour}:${newMin.toString().padStart(2, '0')} ${newIsAM ? 'AM' : 'PM'}`;

          bookedSlots.push(nextSlot);
        }
      }
    }

    return new Response(
      JSON.stringify({ booked_slots: bookedSlots }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

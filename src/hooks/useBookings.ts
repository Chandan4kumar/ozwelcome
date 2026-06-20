import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Booking {
  id: string;
  user_id: string;
  service_id: string;
  service_name: string;
  status: 'pending' | 'confirmed' | 'rescheduled' | 'cancelled' | 'completed';
  booked_date: string;
  booked_time: string;
  duration_minutes: number;
  price_cents: number;
  created_at: string;
  notes: string | null;
  resume_file_path: string | null;
  resume_file_name: string | null;
}

export interface RescheduleRequest {
  id: string;
  booking_id: string;
  user_id: string;
  preferred_date: string;
  preferred_time: string;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export function useBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    if (!user) {
      setBookings([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBookings(data as Booking[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const createBooking = async (booking: Omit<Booking, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return { error: 'Not authenticated' };

    // Check for slot conflicts before creating booking
    const { data: existingBookings, error: checkError } = await supabase
      .from('bookings')
      .select('id, booked_time')
      .eq('service_id', booking.service_id)
      .eq('booked_date', booking.booked_date)
      .eq('booked_time', booking.booked_time)
      .in('status', ['pending', 'confirmed']);

    if (checkError) {
      return { error: checkError.message };
    }

    if (existingBookings && existingBookings.length > 0) {
      return { error: 'This time slot is no longer available. Please select another time.' };
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert({ ...booking, user_id: user.id })
      .select()
      .maybeSingle();

    if (!error && data) {
      setBookings(prev => [data as Booking, ...prev]);
    }

    return { data, error: error?.message ?? null };
  };

  const cancelBooking = async (bookingId: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (!error) {
      setBookings(prev =>
        prev.map(b => (b.id === bookingId ? { ...b, status: 'cancelled' as const } : b))
      );
    }

    return { error: error?.message ?? null };
  };

  const requestReschedule = async (
    bookingId: string,
    preferredDate: string,
    preferredTime: string,
    reason?: string
  ) => {
    // Insert the reschedule request
    const { data: requestData, error: requestError } = await supabase
      .from('reschedule_requests')
      .insert({
        booking_id: bookingId,
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        reason: reason || null,
      })
      .select()
      .maybeSingle();

    if (requestError) {
      return { error: requestError.message ?? null, data: null };
    }

    // Update the booking status to rescheduled
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'rescheduled' as const })
      .eq('id', bookingId);

    if (!updateError) {
      setBookings(prev =>
        prev.map(b => (b.id === bookingId ? { ...b, status: 'rescheduled' as const } : b))
      );
    }

    return { data: requestData as RescheduleRequest | null, error: updateError?.message ?? null };
  };

  return { bookings, loading, createBooking, cancelBooking, requestReschedule, refetch: fetchBookings };
}

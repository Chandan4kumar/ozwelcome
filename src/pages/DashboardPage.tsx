import { useState, useMemo, useRef } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBookings } from '../hooks/useBookings';
import { supabase } from '../lib/supabase';
import {
  Phone, FileText, Mic, Calendar, Clock, ArrowRight,
  AlertCircle, XCircle, RefreshCw, CheckCircle2, Hourglass,
  MapPin, Loader2, CreditCard, X, File as FileIcon,
  Send
} from 'lucide-react';

const SERVICE_ICONS: Record<string, typeof Phone> = {
  'ask-an-aussie': Phone,
  'get-hired': FileText,
  'mock-interview': Mic,
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Hourglass }> = {
  pending: { label: 'Pending', color: 'bg-ochre-100 text-ochre-700 border-ochre-200', icon: Hourglass },
  confirmed: { label: 'Confirmed', color: 'bg-eucalyptus-100 text-eucalyptus-700 border-eucalyptus-200', icon: CheckCircle2 },
  rescheduled: { label: 'Reschedule Requested', color: 'bg-sky-100 text-sky-700 border-sky-200', icon: RefreshCw },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
  completed: { label: 'Completed', color: 'bg-sand-100 text-sand-700 border-sand-200', icon: CheckCircle2 },
};

const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
  '5:00 PM',
];

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { bookings, loading: bookingsLoading, cancelBooking, requestReschedule } = useBookings();
  const [searchParams] = useSearchParams();
  const paymentStatus = searchParams.get('payment');
  const showPaymentBanner = paymentStatus === 'success' || paymentStatus === 'cancelled';

  // Reschedule modal state
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [submittingReschedule, setSubmittingReschedule] = useState(false);
  const [rescheduleError, setRescheduleError] = useState('');

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const minDate = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const openRescheduleModal = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setPreferredDate('');
    setPreferredTime('');
    setRescheduleReason('');
    setRescheduleError('');
    setRescheduleModalOpen(true);
  };

  const closeRescheduleModal = () => {
    setRescheduleModalOpen(false);
    setSelectedBookingId(null);
    setRescheduleError('');
  };

  const handleRescheduleSubmit = async () => {
    if (!selectedBookingId || !preferredDate || !preferredTime) return;

    setSubmittingReschedule(true);
    setRescheduleError('');

    const { error } = await requestReschedule(
      selectedBookingId,
      preferredDate,
      preferredTime,
      rescheduleReason || undefined
    );

    if (error) {
      setRescheduleError(error);
      showToast('Failed to submit reschedule request. Please try again.', 'error');
      setSubmittingReschedule(false);
      return;
    }

    // Notify admin about the reschedule request
    const booking = bookings.find(b => b.id === selectedBookingId);
    if (booking && user) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const { data: profileData } = await supabase
          .from('profiles')
          .select('phone')
          .eq('id', user.id)
          .maybeSingle();

        const notifyRes = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-admin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
            'Apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            type: 'reschedule',
            user_name: user.user_metadata?.full_name || user.email,
            user_email: user.email,
            user_phone: profileData?.phone || null,
            service_name: booking.service_name,
            service_id: booking.service_id,
            booked_date: booking.booked_date,
            booked_time: booking.booked_time,
            preferred_date: preferredDate,
            preferred_time: preferredTime,
            duration_minutes: booking.duration_minutes,
            price_cents: booking.price_cents,
            booking_id: booking.id,
            resume_file_name: booking.resume_file_name,
            reason: rescheduleReason || null,
          }),
        });

        console.log('notify-admin response status:', notifyRes.status);
        const notifyBody = await notifyRes.text();
        console.log('notify-admin response body:', notifyBody);

        if (!notifyRes.ok) {
          console.error('Notify admin failed:', notifyRes.status, notifyBody);
          showToast('Reschedule saved, but admin notification failed. Please contact support.', 'error');
        }
      } catch (err) {
        console.error('Notify admin error:', err);
        showToast('Reschedule saved, but admin notification failed. Please contact support.', 'error');
      }
    }

    showToast('Your reschedule request has been submitted.', 'success');
    setSubmittingReschedule(false);
    closeRescheduleModal();
  };

  if (authLoading || bookingsLoading) {
    return (
      <div className="pt-16 min-h-screen bg-sand-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-ochre-500 animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const activeBookings = bookings.filter(b => b.status !== 'cancelled' && b.status !== 'completed');
  const pastBookings = bookings.filter(b => b.status === 'cancelled' || b.status === 'completed');

  return (
    <div className="pt-16 min-h-screen bg-sand-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all animate-fade-in ${
          toast.type === 'success'
            ? 'bg-eucalyptus-50 border-eucalyptus-200 text-eucalyptus-800'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-sand-200">
        <div className="section-container py-8">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="w-6 h-6 text-ochre-500" />
            <h1 className="font-display text-2xl font-bold text-sand-900">My Dashboard</h1>
          </div>
          <p className="text-sand-600">
            Welcome back, <span className="font-semibold text-sand-800">{user.user_metadata?.full_name || user.email}</span>
          </p>
        </div>
      </div>

      <div className="section-container py-8">
        {/* Payment Banner */}
        {showPaymentBanner && (
          <div className={`mb-6 flex items-center gap-3 px-5 py-4 rounded-xl border ${
            paymentStatus === 'success'
              ? 'bg-eucalyptus-50 border-eucalyptus-200 text-eucalyptus-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {paymentStatus === 'success' ? (
              <>
                <CreditCard className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">Payment received! Your booking is being confirmed.</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">Payment was cancelled. You can retry from your booking.</span>
              </>
            )}
            <Link to="/dashboard" className="ml-auto"><X className="w-4 h-4 opacity-50 hover:opacity-100" /></Link>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { id: 'ask-an-aussie', icon: Phone, title: 'Ask an Aussie', desc: 'Book a consultation' },
            { id: 'get-hired', icon: FileText, title: 'Get Hired', desc: 'Resume & job strategy' },
            { id: 'mock-interview', icon: Mic, title: 'Mock Interview', desc: 'Practice interview' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.id}
                to={`/book/${s.id}`}
                className="card p-5 flex items-center gap-4 group"
              >
                <div className="w-12 h-12 bg-ochre-100 rounded-xl flex items-center justify-center group-hover:bg-ochre-200 transition-colors">
                  <Icon className="w-6 h-6 text-ochre-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sand-900">{s.title}</div>
                  <div className="text-sm text-sand-500">{s.desc}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-sand-400 group-hover:text-ochre-500 transition-colors" />
              </Link>
            );
          })}
        </div>

        {/* Active Bookings */}
        <div className="mb-10">
          <h2 className="font-display text-xl font-bold text-sand-900 mb-4">Active Bookings</h2>
          {activeBookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-sand-200 p-8 text-center">
              <Calendar className="w-12 h-12 text-sand-300 mx-auto mb-3" />
              <p className="text-sand-600 mb-4">No active bookings yet.</p>
              <Link to="/services" className="btn-primary">Browse Services</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {activeBookings.map((booking) => {
                const Icon = SERVICE_ICONS[booking.service_id] || Phone;
                const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
                const StatusIcon = status.icon;
                const formattedDate = new Date(booking.booked_date).toLocaleDateString('en-AU', {
                  weekday: 'long', month: 'long', day: 'numeric',
                });

                return (
                  <div key={booking.id} className="bg-white rounded-2xl border border-sand-200 p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="w-12 h-12 bg-ochre-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-ochre-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sand-900">{booking.service_name}</h3>
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${status.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-sand-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" /> {formattedDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {booking.booked_time} (AEST)
                          </span>
                          {booking.duration_minutes > 0 && (
                            <span>{booking.duration_minutes} min</span>
                          )}
                          <span className="font-semibold text-ochre-600">
                            ${(booking.price_cents / 100).toFixed(0)}
                          </span>
                        </div>
                        {booking.notes && (
                          <p className="text-sm text-sand-500 mt-2 italic">"{booking.notes}"</p>
                        )}
                        {booking.resume_file_name && (
                          <div className="flex items-center gap-1.5 text-sm text-eucalyptus-600 mt-2">
                            <FileIcon className="w-3.5 h-3.5" />
                            <span>Resume: {booking.resume_file_name}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 sm:flex-col">
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => openRescheduleModal(booking.id)}
                            className="text-sm px-3 py-1.5 rounded-lg border border-sky-200 text-sky-700 hover:bg-sky-50 transition-colors flex items-center gap-1"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Reschedule
                          </button>
                        )}
                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                          <button
                            onClick={() => cancelBooking(booking.id)}
                            className="text-sm px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Past Bookings */}
        {pastBookings.length > 0 && (
          <div>
            <h2 className="font-display text-xl font-bold text-sand-900 mb-4">Past Bookings</h2>
            <div className="space-y-3">
              {pastBookings.map((booking) => {
                const Icon = SERVICE_ICONS[booking.service_id] || Phone;
                const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
                const StatusIcon = status.icon;

                return (
                  <div key={booking.id} className="bg-white rounded-xl border border-sand-200 p-4 opacity-70">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-sand-400" />
                      <div className="flex-1">
                        <span className="font-medium text-sand-700 text-sm">{booking.service_name}</span>
                        <span className="text-sand-400 text-sm ml-2">
                          {new Date(booking.booked_date).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${status.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-sand-200 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold text-sand-900">Request Reschedule</h2>
                <button
                  onClick={closeRescheduleModal}
                  className="p-2 hover:bg-sand-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-sand-500" />
                </button>
              </div>

              {rescheduleError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {rescheduleError}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-sand-700 mb-1.5">
                    <Calendar className="w-4 h-4 inline mr-1" /> Preferred Date
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    min={minDate}
                    onChange={e => setPreferredDate(e.target.value)}
                    className="input-field w-full"
                    required
                  />
                  {preferredDate && preferredDate < minDate && (
                    <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Please select a future date.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-sand-700 mb-1.5">
                    <Clock className="w-4 h-4 inline mr-1" /> Preferred Time
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {TIME_SLOTS.map((time) => (
                      <button
                        key={time}
                        onClick={() => setPreferredTime(time)}
                        className={`p-2 rounded-lg border-2 text-sm font-medium transition-all ${
                          preferredTime === time
                            ? 'border-ochre-500 bg-ochre-50 text-ochre-700'
                            : 'border-sand-200 bg-white text-sand-700 hover:border-sand-300'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-sand-700 mb-1.5">
                    Reason (optional)
                  </label>
                  <textarea
                    value={rescheduleReason}
                    onChange={e => setRescheduleReason(e.target.value)}
                    className="input-field min-h-[80px] resize-none w-full"
                    placeholder="Tell us why you need to reschedule..."
                    maxLength={500}
                  />
                  <div className="text-xs text-sand-400 mt-1 text-right">
                    {rescheduleReason.length}/500
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeRescheduleModal}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRescheduleSubmit}
                  disabled={submittingReschedule || !preferredDate || !preferredTime || preferredDate < minDate}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingReschedule ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                  ) : (
                    <><Send className="w-4 h-4 mr-2" /> Submit Request</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

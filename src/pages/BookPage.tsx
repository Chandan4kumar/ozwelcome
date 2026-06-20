import { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBookings } from '../hooks/useBookings';
import { supabase } from '../lib/supabase';
import {
  Calendar, Clock, ArrowRight, ArrowLeft, CheckCircle2,
  AlertCircle, Phone, FileText, Mic, CreditCard,
  Upload, X, File, Loader2
} from 'lucide-react';

const SERVICE_CONFIG: Record<string, {
  icon: typeof Phone;
  title: string;
  pricing: { duration: string; price: number; priceCents: number; durationMin: number }[];
  allowResumeUpload?: boolean;
}> = {
  'ask-an-aussie': {
    icon: Phone,
    title: 'Ask an Aussie',
    pricing: [
      { duration: '30 min', price: 49, priceCents: 4900, durationMin: 30 },
      { duration: '60 min', price: 89, priceCents: 8900, durationMin: 60 },
    ],
  },
  'get-hired': {
    icon: FileText,
    title: 'Get Hired',
    pricing: [
      { duration: 'Resume Review', price: 99, priceCents: 9900, durationMin: 0 },
      { duration: 'Full Package', price: 149, priceCents: 14900, durationMin: 0 },
    ],
    allowResumeUpload: true,
  },
  'mock-interview': {
    icon: Mic,
    title: 'Mock Interview',
    pricing: [
      { duration: 'Mock Interview + Feedback', price: 79, priceCents: 7900, durationMin: 60 },
    ],
  },
};

const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
  '5:00 PM',
];

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

function getNextWeekdays(): Date[] {
  const days: Date[] = [];
  const today = new Date();
  const current = new Date(today);
  current.setDate(current.getDate() + 1);

  while (days.length < 10) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      days.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }
  return days;
}

export default function BookPage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const { user } = useAuth();
  const { createBooking } = useBookings();
  const service = serviceId ? SERVICE_CONFIG[serviceId] : undefined;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [selectedPricing, setSelectedPricing] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [error, setError] = useState('');

  // Resume upload state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState('');
  const [uploading, setUploading] = useState(false);

  // Slot availability state
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [checkingSlots, setCheckingSlots] = useState(false);

  const availableDays = useMemo(() => getNextWeekdays(), []);

  // Fetch booked slots when date changes
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!selectedDate) {
        setBookedSlots([]);
        return;
      }

      setCheckingSlots(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-availability?service_id=${serviceId}&date=${selectedDate}`,
          {
            headers: { 'Apikey': import.meta.env.VITE_SUPABASE_ANON_KEY },
          }
        );
        const data = await res.json();
        if (data.booked_slots) {
          setBookedSlots(data.booked_slots);
        }
      } catch (err) {
        console.error('Failed to fetch booked slots:', err);
      }
      setCheckingSlots(false);
    };

    fetchBookedSlots();
  }, [selectedDate, serviceId]);

  // Reset selected time if it becomes unavailable
  useEffect(() => {
    if (selectedTime && bookedSlots.includes(selectedTime)) {
      setSelectedTime('');
    }
  }, [bookedSlots, selectedTime]);

  if (!service) return <Navigate to="/services" replace />;

  const Icon = service.icon;
  const pricing = service.pricing[selectedPricing];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-AU', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResumeError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setResumeError('Please upload a PDF or Word document (.pdf, .doc, .docx)');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setResumeError('File must be under 2MB');
      return;
    }

    setResumeFile(file);
  };

  const uploadResume = async (userId: string): Promise<{ path: string; fileName: string } | null> => {
    if (!resumeFile) return null;

    const ext = resumeFile.name.split('.').pop();
    const filePath = `${userId}/${Date.now()}-resume.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, resumeFile, {
        contentType: resumeFile.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Resume upload error:', uploadError);
      return null;
    }

    return { path: filePath, fileName: resumeFile.name };
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    setError('');

    // Upload resume first if applicable
    let resumeFilePath: string | null = null;
    let resumeFileName: string | null = null;

    if (service.allowResumeUpload && resumeFile) {
      setUploading(true);
      const uploadResult = await uploadResume(user.id);
      if (uploadResult) {
        resumeFilePath = uploadResult.path;
        resumeFileName = uploadResult.fileName;
      }
      setUploading(false);
    }

    const { data, error } = await createBooking({
      service_id: serviceId!,
      service_name: service.title,
      status: 'pending',
      booked_date: selectedDate,
      booked_time: selectedTime,
      duration_minutes: pricing.durationMin,
      price_cents: pricing.priceCents,
      notes: notes || null,
      resume_file_path: resumeFilePath,
      resume_file_name: resumeFileName,
    } as any);

    if (error) {
      setError(error);
      setSubmitting(false);
    } else {
      // Notify admin about new booking
      try {
        const { data: { session } } = await supabase.auth.getSession();

        // Get user phone from profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('phone')
          .eq('id', user.id)
          .maybeSingle();

        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-admin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
            'Apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            type: 'booking',
            user_name: user.user_metadata?.full_name || user.email,
            user_email: user.email,
            user_phone: profileData?.phone || null,
            service_name: service.title,
            service_id: serviceId,
            booked_date: selectedDate,
            booked_time: selectedTime,
            duration_minutes: pricing.durationMin,
            price_cents: pricing.priceCents,
            booking_id: data?.id,
            resume_file_name: resumeFileName,
            notes: notes || null,
            package_name: pricing.duration,
          }),
        });
      } catch {
        // Notification failure shouldn't block the booking
      }

      // Try Stripe checkout
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const checkoutRes = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
            'Apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            price_cents: pricing.priceCents,
            product_key: serviceId === 'ask-an-aussie'
              ? `ask-an-aussie-${pricing.durationMin}`
              : serviceId === 'get-hired'
                ? (selectedPricing === 0 ? 'get-hired-review' : 'get-hired-full')
                : 'mock-interview',
            user_email: user.email,
            booking_id: data?.id,
            success_url: `${window.location.origin}/dashboard?payment=success`,
            cancel_url: `${window.location.origin}/dashboard?payment=cancelled`,
          }),
        });

        const checkoutData = await checkoutRes.json();
        if (checkoutData.url) {
          window.location.href = checkoutData.url;
          return;
        }
      } catch {
        // Stripe not configured — booking still confirmed, payment handled manually
      }

      setBookingComplete(true);
      setSubmitting(false);
    }
  };

  if (bookingComplete) {
    return (
      <div className="pt-16 min-h-screen bg-gradient-to-br from-sand-50 to-white flex items-center justify-center py-12">
        <div className="w-full max-w-lg px-4 text-center">
          <div className="bg-white rounded-2xl shadow-lg border border-sand-200 p-10">
            <div className="w-20 h-20 bg-eucalyptus-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-eucalyptus-600" />
            </div>
            <h2 className="font-display text-3xl font-bold text-sand-900 mb-3">Booking Confirmed!</h2>
            <p className="text-sand-600 mb-2">
              Your <strong>{service.title}</strong> session has been booked.
            </p>
            <p className="text-sand-500 text-sm mb-6">
              {formatDate(selectedDate)} at {selectedTime} ({pricing.duration}) — ${pricing.price}
            </p>
            {resumeFile && (
              <p className="text-eucalyptus-600 text-sm mb-4 flex items-center justify-center gap-1">
                <File className="w-4 h-4" /> Resume uploaded: {resumeFile.name}
              </p>
            )}
            <p className="text-sand-500 text-sm mb-8">
              We'll send you a confirmation email shortly. You can manage your booking from the dashboard.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
              <Link to="/" className="btn-outline">Back to Home</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-16 min-h-screen bg-gradient-to-br from-sand-50 to-white flex items-center justify-center py-12">
        <div className="w-full max-w-md px-4 text-center">
          <div className="bg-white rounded-2xl shadow-lg border border-sand-200 p-8">
            <Icon className="w-12 h-12 text-ochre-500 mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-sand-900 mb-3">Sign In to Book</h2>
            <p className="text-sand-600 mb-6">Create an account or sign in to book your {service.title} session.</p>
            <div className="flex gap-4 justify-center">
              <Link to="/signup" className="btn-primary">Create Account</Link>
              <Link to="/login" className="btn-outline">Sign In</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-sand-50">
      {/* Header */}
      <div className="bg-white border-b border-sand-200 py-6">
        <div className="section-container">
          <Link to={`/services/${serviceId}`} className="text-sand-500 hover:text-sand-700 text-sm inline-flex items-center gap-1 mb-3 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Back to {service.title}
          </Link>
          <div className="flex items-center gap-3">
            <Icon className="w-8 h-8 text-ochre-500" />
            <div>
              <h1 className="font-display text-2xl font-bold text-sand-900">Book: {service.title}</h1>
              <p className="text-sand-500 text-sm">Complete your booking in 3 easy steps</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-sand-200">
        <div className="section-container py-4">
          <div className="flex items-center gap-4">
            {[
              { num: 1, label: 'Select Package' },
              { num: 2, label: 'Choose Time' },
              { num: 3, label: 'Confirm' },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step >= s.num ? 'bg-ochre-500 text-white' : 'bg-sand-200 text-sand-500'
                }`}>
                  {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${
                  step >= s.num ? 'text-sand-900' : 'text-sand-400'
                }`}>{s.label}</span>
                {i < 2 && <div className={`w-8 sm:w-16 h-0.5 ${step > s.num ? 'bg-ochre-500' : 'bg-sand-200'}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section-container py-10">
        <div className="max-w-2xl mx-auto">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Step 1: Select Package */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="font-display text-xl font-bold text-sand-900 mb-4">Select Your Package</h2>
              <div className="space-y-3">
                {service.pricing.map((plan, i) => (
                  <button
                    key={plan.duration}
                    onClick={() => setSelectedPricing(i)}
                    className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                      selectedPricing === i
                        ? 'border-ochre-500 bg-ochre-50 shadow-md'
                        : 'border-sand-200 bg-white hover:border-sand-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sand-900">{plan.duration}</div>
                        {plan.durationMin > 0 && (
                          <div className="text-sm text-sand-500">{plan.durationMin} minute session</div>
                        )}
                      </div>
                      <div className="font-display text-2xl font-bold text-ochre-600">${plan.price}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Resume Upload for Get Hired */}
              {service.allowResumeUpload && (
                <div className="mt-8">
                  <h3 className="font-display text-lg font-bold text-sand-900 mb-2">Upload Your Resume</h3>
                  <p className="text-sand-600 text-sm mb-4">
                    Upload your current resume so we can review it. Accepted formats: PDF, DOC, DOCX (max 2MB).
                  </p>

                  {resumeFile ? (
                    <div className="flex items-center gap-3 bg-eucalyptus-50 border border-eucalyptus-200 rounded-xl p-4">
                      <File className="w-8 h-8 text-eucalyptus-600" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sand-900 text-sm truncate">{resumeFile.name}</div>
                        <div className="text-sand-500 text-xs">{(resumeFile.size / 1024).toFixed(0)} KB</div>
                      </div>
                      <button
                        onClick={() => { setResumeFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                        className="p-1.5 hover:bg-eucalyptus-100 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-sand-500" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-sand-300 rounded-xl p-8 text-center cursor-pointer hover:border-ochre-400 hover:bg-ochre-50/30 transition-all"
                    >
                      <Upload className="w-8 h-8 text-sand-400 mx-auto mb-3" />
                      <p className="text-sand-700 font-medium mb-1">Click to upload your resume</p>
                      <p className="text-sand-500 text-sm">PDF, DOC, or DOCX up to 2MB</p>
                    </div>
                  )}

                  {resumeError && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {resumeError}
                    </p>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              )}

              <button onClick={() => setStep(2)} className="btn-primary mt-6">
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          )}

          {/* Step 2: Choose Date & Time */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="font-display text-xl font-bold text-sand-900 mb-4">Choose Date & Time</h2>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-sand-700 mb-3">
                  <Calendar className="w-4 h-4 inline mr-1" /> Select a Date
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {availableDays.map((day) => {
                    const dateStr = day.toISOString().split('T')[0];
                    const isSelected = selectedDate === dateStr;
                    return (
                      <button
                        key={dateStr}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          isSelected
                            ? 'border-ochre-500 bg-ochre-50'
                            : 'border-sand-200 bg-white hover:border-sand-300'
                        }`}
                      >
                        <div className="text-xs text-sand-500">
                          {day.toLocaleDateString('en-AU', { weekday: 'short' })}
                        </div>
                        <div className="font-bold text-sand-900">
                          {day.getDate()}
                        </div>
                        <div className="text-xs text-sand-500">
                          {day.toLocaleDateString('en-AU', { month: 'short' })}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedDate && (
                <div className="mb-6 animate-fade-in">
                  <label className="block text-sm font-semibold text-sand-700 mb-3">
                    <Clock className="w-4 h-4 inline mr-1" /> Select a Time (AEST)
                  </label>
                  {checkingSlots && (
                    <div className="flex items-center gap-2 text-sand-500 text-sm mb-3">
                      <Loader2 className="w-4 h-4 animate-spin" /> Checking availability...
                    </div>
                  )}
                  {bookedSlots.length > 0 && (
                    <p className="text-xs text-sand-500 mb-3">
                      {bookedSlots.length} slot{bookedSlots.length > 1 ? 's' : ''} already booked for this date
                    </p>
                  )}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {TIME_SLOTS.map((time) => {
                      const isBooked = bookedSlots.includes(time);
                      return (
                        <button
                          key={time}
                          onClick={() => !isBooked && setSelectedTime(time)}
                          disabled={isBooked}
                          className={`p-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                            isBooked
                              ? 'border-sand-200 bg-sand-100 text-sand-400 cursor-not-allowed line-through'
                              : selectedTime === time
                                ? 'border-ochre-500 bg-ochre-50 text-ochre-700'
                                : 'border-sand-200 bg-white text-sand-700 hover:border-sand-300'
                          }`}
                          title={isBooked ? 'This slot is already booked' : undefined}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-4 mt-6">
                <button onClick={() => setStep(1)} className="btn-outline">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!selectedDate || !selectedTime}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h2 className="font-display text-xl font-bold text-sand-900 mb-4">Confirm Your Booking</h2>

              <div className="bg-white rounded-2xl border border-sand-200 p-6 mb-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-sand-100">
                    <span className="text-sand-600">Service</span>
                    <span className="font-semibold text-sand-900">{service.title}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-sand-100">
                    <span className="text-sand-600">Package</span>
                    <span className="font-semibold text-sand-900">{pricing.duration}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-sand-100">
                    <span className="text-sand-600">Date</span>
                    <span className="font-semibold text-sand-900">{formatDate(selectedDate)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-sand-100">
                    <span className="text-sand-600">Time</span>
                    <span className="font-semibold text-sand-900">{selectedTime} (AEST)</span>
                  </div>
                  {resumeFile && (
                    <div className="flex justify-between items-center pb-3 border-b border-sand-100">
                      <span className="text-sand-600">Resume</span>
                      <span className="font-semibold text-eucalyptus-600 flex items-center gap-1">
                        <File className="w-4 h-4" /> {resumeFile.name}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sand-600">Total</span>
                    <span className="font-display text-2xl font-bold text-ochre-600">${pricing.price}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-sand-700 mb-1.5">
                  Additional Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="input-field min-h-[80px] resize-none"
                  placeholder="Any specific topics or questions you'd like to cover?"
                />
              </div>

              <div className="bg-ochre-50 rounded-xl p-4 border border-ochre-200 mb-6">
                <div className="flex items-start gap-2">
                  <CreditCard className="w-5 h-5 text-ochre-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-ochre-800">
                    <strong>Payment:</strong> You'll receive a payment link via email after booking confirmation. Your session is confirmed once payment is received.
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="btn-outline">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading resume...' : submitting ? 'Submitting...' : <><CheckCircle2 className="w-4 h-4 mr-2" /> Confirm Booking</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { Link, useParams, Navigate, useNavigate } from 'react-router-dom';
import { Phone, FileText, Mic, ArrowRight, CheckCircle2, Clock, Shield, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SERVICE_DATA: Record<string, {
  icon: typeof Phone;
  title: string;
  subtitle: string;
  tagline: string;
  description: string;
  features: string[];
  pricing: { duration: string; price: number; priceCents: number; durationMin: number }[];
  color: string;
  bgGradient: string;
  extraSection?: { title: string; items: string[] };
}> = {
  'ask-an-aussie': {
    icon: Phone,
    title: 'Ask an Aussie',
    subtitle: 'Phone/Video Consultation',
    tagline: 'Got questions? Get real answers from someone who\'s lived it.',
    description: 'A personal phone or video call with someone who has 14 years of Australian life experience. Ask about banking, renting, schools, Medicare, TFN, culture, suburbs — anything that\'s on your mind. No question is too basic.',
    features: [
      '30 or 60 minute session via phone or video',
      '14 years of Australian life experience',
      'Worked at NAB, Telstra, NSW Government, ING, IDP + more',
      'Ask about anything: banking, renting, schools, Medicare, culture',
      'Practical, honest advice — not textbook theory',
      'Follow-up notes sent after the call',
    ],
    pricing: [
      { duration: '30 min', price: 49, priceCents: 4900, durationMin: 30 },
      { duration: '60 min', price: 89, priceCents: 8900, durationMin: 60 },
    ],
    color: 'ochre',
    bgGradient: 'from-ochre-500 to-ochre-600',
    extraSection: {
      title: 'Popular Topics People Ask About',
      items: [
        'How do I open a bank account? Which bank?',
        'How does Medicare work? Do I need private health insurance?',
        'What\'s a TFN and why do I need one immediately?',
        'How does superannuation work?',
        'Which suburbs are good for families / singles / students?',
        'How do rental inspections work? What\'s a bond?',
        'What\'s the cost of living really like in Sydney vs Melbourne?',
        'How do I register with a GP?',
        'What should I know about Australian workplace culture?',
        'How do I get my driver\'s licence converted?',
      ],
    },
  },
  'get-hired': {
    icon: FileText,
    title: 'Get Hired',
    subtitle: 'Resume + Job Application Strategy',
    tagline: 'Your resume is probably wrong for Australia. Let\'s fix that.',
    description: 'Resume review and rewrite to Australian standards, job application strategy covering SEEK, LinkedIn, and Indeed, cover letter guidance, and insider knowledge on how hiring really works in Australia — recruiter culture, phone screens, and panel interviews.',
    features: [
      'Resume review and rewrite to Australian standards',
      'Job application strategy: SEEK, LinkedIn, Indeed, referrals',
      'Cover letter guidance and templates',
      'How hiring works: recruiter culture, phone screens, panels',
      'Skills-based format: 2-page max, no photo, no DOB',
      'Referral approach strategy — how to get introduced',
    ],
    pricing: [
      { duration: 'Resume Review', price: 99, priceCents: 9900, durationMin: 0 },
      { duration: 'Full Package', price: 149, priceCents: 14900, durationMin: 0 },
    ],
    color: 'eucalyptus',
    bgGradient: 'from-eucalyptus-600 to-eucalyptus-700',
    extraSection: {
      title: 'What\'s Wrong With Most Migrant Resumes',
      items: [
        'Too long — Australian resumes are 2 pages max',
        'Photo and personal details (DOB, marital status) — remove them',
        'Duties-based instead of achievements-based',
        'No Australian context or local keywords',
        'Missing key sections Australian recruiters expect',
        'Cover letters that don\'t match Australian expectations',
      ],
    },
  },
  'mock-interview': {
    icon: Mic,
    title: 'Mock Interview',
    subtitle: 'Australian-Style Practice',
    tagline: 'Practice the way Australians actually interview.',
    description: 'A full mock interview in Australian style with STAR method coaching, behavioral questions, and a debrief session. Your interviewer has given and taken 100+ interviews in Australia. Includes written feedback report within 24 hours.',
    features: [
      '45-60 minute mock interview session',
      'Australian behavioral/STAR method format',
      'Interviewer with 100+ interviews experience',
      'Casual tone, culture-fit focus (just like real interviews)',
      'Debrief session immediately after the interview',
      'Written feedback report within 24 hours',
    ],
    pricing: [
      { duration: 'Mock Interview + Feedback', price: 79, priceCents: 7900, durationMin: 60 },
    ],
    color: 'sky',
    bgGradient: 'from-sky-600 to-sky-700',
    extraSection: {
      title: 'How Australian Interviews Are Different',
      items: [
        'Very casual tone — "Tell me about yourself" over coffee is normal',
        'Behavioral questions dominate: "Tell me about a time when..."',
        'STAR method expected: Situation, Task, Action, Result',
        'Culture-fit questions are as important as technical ones',
        'Panel interviews are common in government and large companies',
        'First-name basis — even with senior leaders',
        '"She\'ll be right" attitude — don\'t overthink, be genuine',
      ],
    },
  },
};

export default function ServiceDetailPage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const service = serviceId ? SERVICE_DATA[serviceId] : undefined;

  if (!service) {
    return <Navigate to="/services" replace />;
  }

  const Icon = service.icon;

  const handleBookNow = () => {
    const destination = `/book/${serviceId}`;
    if (user) {
      navigate(destination);
    } else {
      sessionStorage.setItem('postAuthRedirect', destination);
      navigate('/login');
    }
  };

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className={`py-16 bg-gradient-to-br ${service.bgGradient} text-white`}>
        <div className="section-container">
          <div className="max-w-3xl">
            <Link to="/services" className="text-white/70 hover:text-white text-sm mb-4 inline-flex items-center gap-1 transition-colors">
              <ArrowRight className="w-3 h-3 rotate-180" /> Back to Services
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <Icon className="w-10 h-10" />
              <span className="text-white/80 font-semibold">{service.subtitle}</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">{service.title}</h1>
            <p className="text-xl text-white/90 leading-relaxed">{service.tagline}</p>
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <h2 className="font-display text-2xl font-bold text-sand-900 mb-4">What You Get</h2>
              <p className="text-sand-600 leading-relaxed mb-8">{service.description}</p>

              <div className="space-y-3 mb-10">
                {service.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-eucalyptus-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sand-700">{feature}</span>
                  </div>
                ))}
              </div>

              {service.extraSection && (
                <>
                  <h2 className="font-display text-2xl font-bold text-sand-900 mb-4">
                    {service.extraSection.title}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
                    {service.extraSection.items.map((item) => (
                      <div key={item} className="flex items-start gap-2 p-3 bg-sand-50 rounded-lg border border-sand-200">
                        <span className="text-ochre-500 mt-0.5">•</span>
                        <span className="text-sand-700 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Pricing Card */}
                <div className="bg-sand-50 rounded-2xl p-6 border border-sand-200">
                  <h3 className="font-display text-xl font-bold text-sand-900 mb-4">Pricing</h3>
                  <div className="space-y-3">
                    {service.pricing.map((plan) => (
                      <div key={plan.duration} className="bg-white rounded-xl p-4 border border-sand-200">
                        <div className="text-sm text-sand-500 mb-1">{plan.duration}</div>
                        <div className="font-display text-3xl font-bold text-sand-900">${plan.price}</div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleBookNow}
                    className="btn-primary w-full mt-6 text-center"
                  >
                    Book Now <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>

                {/* Credentials */}
                <div className="bg-white rounded-2xl p-6 border border-sand-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-ochre-500" />
                    <h3 className="font-display text-lg font-bold text-sand-900">Your Guide</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-sand-600">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-eucalyptus-500" /> 14 years in Australia</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-eucalyptus-500" /> NAB, Telstra, NSW Govt, ING, IDP</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-eucalyptus-500" /> 100+ interviews given & taken</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-eucalyptus-500" /> Corporate + Government sectors</li>
                  </ul>
                </div>

                {/* Availability */}
                <div className="bg-white rounded-2xl p-6 border border-sand-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-ochre-500" />
                    <h3 className="font-display text-lg font-bold text-sand-900">Availability</h3>
                  </div>
                  <p className="text-sm text-sand-600">Sessions available within 2-3 business days. Pick a time that works for you.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-sand-50">
        <div className="section-container">
          <h2 className="font-display text-2xl font-bold text-sand-900 mb-8 text-center">
            What Others Say About {service.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { name: 'Priya M.', from: 'India', text: 'This service completely changed my approach. I went from zero callbacks to three interviews in two weeks.' },
              { name: 'Marcus L.', from: 'Philippines', text: 'Worth every cent. The practical advice saved me weeks of trial and error.' },
            ].map((t) => (
              <div key={t.name} className="bg-white rounded-xl p-6 border border-sand-200">
                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-ochre-400 fill-ochre-400" />)}
                </div>
                <p className="text-sand-700 italic mb-4">"{t.text}"</p>
                <div className="text-sm font-semibold text-sand-900">{t.name} <span className="text-sand-500 font-normal">from {t.from}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

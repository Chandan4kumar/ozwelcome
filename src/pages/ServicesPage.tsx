import { Link } from 'react-router-dom';
import { Phone, FileText, Mic, ArrowRight, CheckCircle2, Clock, Shield } from 'lucide-react';

const SERVICES = [
  {
    id: 'ask-an-aussie',
    icon: Phone,
    title: 'Ask an Aussie',
    subtitle: 'Phone/Video Consultation',
    tagline: 'Got questions? Get real answers from someone who\'s lived it.',
    description: 'A personal phone or video call with someone who has 14 years of Australian life experience. Ask about banking, renting, schools, Medicare, TFN, culture, suburbs — anything that\'s on your mind.',
    features: [
      '30 or 60 minute session',
      '14 years of Australian experience',
      'Worked at NAB, Telstra, NSW Govt, ING, IDP + more',
      'Ask about anything — no question too basic',
      'Practical, honest advice (not textbook theory)',
      'Follow-up notes after the call',
    ],
    pricing: [
      { duration: '30 min', price: 49 },
      { duration: '60 min', price: 89 },
    ],
    color: 'ochre',
    bgGradient: 'from-ochre-500 to-ochre-600',
  },
  {
    id: 'get-hired',
    icon: FileText,
    title: 'Get Hired',
    subtitle: 'Resume + Job Application Strategy',
    tagline: 'Your resume is probably wrong for Australia. Let\'s fix that.',
    description: 'Resume review and rewrite to Australian standards, job application strategy covering SEEK, LinkedIn, and Indeed, cover letter guidance, and insider knowledge on how hiring really works in Australia — recruiter culture, phone screens, and panel interviews.',
    features: [
      'Resume review and rewrite to Australian standards',
      'Job application strategy (SEEK, LinkedIn, Indeed)',
      'Cover letter guidance and templates',
      'How hiring works: recruiter culture, phone screens, panels',
      'Referral approach strategy',
      'Skills-based format: 2-page max, no photo, no DOB',
    ],
    pricing: [
      { duration: 'Resume Review', price: 99 },
      { duration: 'Full Package', price: 149 },
    ],
    color: 'eucalyptus',
    bgGradient: 'from-eucalyptus-600 to-eucalyptus-700',
  },
  {
    id: 'mock-interview',
    icon: Mic,
    title: 'Mock Interview',
    subtitle: 'Australian-Style Practice',
    tagline: 'Practice the way Australians actually interview.',
    description: 'A full mock interview in Australian style with STAR method coaching, behavioral questions, and a debrief session. Your interviewer has given and taken 100+ interviews in Australia. Includes written feedback after the session.',
    features: [
      '45-60 minute mock interview',
      'Australian behavioral/STAR method format',
      'Interviewer with 100+ interviews experience',
      'Casual tone, culture-fit focus (just like real interviews)',
      'Debrief session immediately after',
      'Written feedback report within 24 hours',
    ],
    pricing: [
      { duration: 'Mock Interview + Feedback', price: 79 },
    ],
    color: 'sky',
    bgGradient: 'from-sky-600 to-sky-700',
  },
];

export default function ServicesPage() {
  return (
    <div className="pt-16">
      {/* Header */}
      <section className="py-16 bg-gradient-to-br from-sand-50 to-white">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-sand-900 mb-4">
              Our Services
            </h1>
            <p className="text-lg text-sand-600 leading-relaxed">
              Three services designed to cover the practical side of moving to Australia — the things migration agents don't help with.
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-white">
        <div className="section-container space-y-20">
          {SERVICES.map((service, idx) => {
            const Icon = service.icon;
            const isEven = idx % 2 === 0;

            return (
              <div
                key={service.id}
                id={service.id}
                className={`flex flex-col lg:flex-row gap-10 items-start ${
                  !isEven ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Info Side */}
                <div className="flex-1">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold mb-4 ${
                    service.color === 'ochre' ? 'bg-ochre-50 text-ochre-700' :
                    service.color === 'eucalyptus' ? 'bg-eucalyptus-50 text-eucalyptus-700' :
                    'bg-sky-50 text-sky-700'
                  }`}>
                    <Icon className="w-4 h-4" />
                    {service.subtitle}
                  </div>
                  <h2 className="font-display text-3xl font-bold text-sand-900 mb-3">{service.title}</h2>
                  <p className="text-lg text-ochre-600 font-medium mb-4">{service.tagline}</p>
                  <p className="text-sand-600 leading-relaxed mb-6">{service.description}</p>

                  <div className="space-y-3 mb-8">
                    {service.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-eucalyptus-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sand-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Pricing */}
                  <div className="flex flex-wrap gap-4 mb-6">
                    {service.pricing.map((plan) => (
                      <div key={plan.duration} className="bg-sand-50 rounded-xl p-4 border border-sand-200 min-w-[160px]">
                        <div className="text-sm text-sand-500 mb-1">{plan.duration}</div>
                        <div className="font-display text-2xl font-bold text-sand-900">${plan.price}</div>
                      </div>
                    ))}
                  </div>

                  <Link
                    to={`/book/${service.id}`}
                    className="btn-primary"
                  >
                    Book Now <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>

                {/* Visual Side */}
                <div className="flex-1 w-full">
                  <div className={`${service.bgGradient} rounded-2xl p-8 text-white shadow-xl`}>
                    <div className="flex items-center gap-3 mb-6">
                      <Icon className="w-8 h-8" />
                      <h3 className="font-display text-2xl font-bold">{service.title}</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4" />
                          <span className="font-semibold text-sm">Credentials</span>
                        </div>
                        <p className="text-white/80 text-sm">14 years in Australia, NAB, Telstra, NSW Govt, ING, IDP + more</p>
                      </div>

                      <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4" />
                          <span className="font-semibold text-sm">Availability</span>
                        </div>
                        <p className="text-white/80 text-sm">Sessions available within 2-3 business days</p>
                      </div>

                      <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="font-semibold text-sm">What's Included</span>
                        </div>
                        <ul className="text-white/80 text-sm space-y-1">
                          {service.features.slice(0, 4).map((f) => (
                            <li key={f}>{f}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

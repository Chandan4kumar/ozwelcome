import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone, FileText, Mic, ChevronRight, ChevronLeft,
  Briefcase, MessageSquare, FileCheck, DollarSign, Home,
  CreditCard, Users, Coffee, MapPin, Star,
  ArrowRight, Shield, Heart, Globe, Languages, Building2
} from 'lucide-react';

const HERO_IMAGES = [
  {
    url: 'https://images.pexels.com/photos/1878293/pexels-photo-1878293.jpeg?auto=compress&cs=tinysrgb&w=1920',
    alt: 'Sydney Harbour Bridge and Opera House',
  },
  {
    url: 'https://images.pexels.com/photos/3573382/pexels-photo-3573382.jpeg?auto=compress&cs=tinysrgb&w=1920',
    alt: 'Melbourne CBD skyline',
  },
  {
    url: 'https://images.pexels.com/photos/3601425/pexels-photo-3601425.jpeg?auto=compress&cs=tinysrgb&w=1920',
    alt: 'Australian beach lifestyle',
  },
];

const SERVICES = [
  {
    id: 'ask-an-aussie',
    icon: Phone,
    title: 'Ask an Aussie',
    subtitle: 'Phone/Video Consultation',
    description: '30 or 60 min call in English, Hindi, or Punjabi. Ask about banking, renting, schools, Medicare, culture — anything about settling in Australia.',
    price: 'From $49',
    color: 'ochre',
  },
  {
    id: 'get-hired',
    icon: FileText,
    title: 'Get Hired',
    subtitle: 'Resume + Job Strategy',
    description: 'Resume rewrite to Australian standards, job application strategy, and cover letter guidance. Upload your existing resume and get an Aussie-ready version back.',
    price: 'From $99',
    color: 'eucalyptus',
  },
  {
    id: 'mock-interview',
    icon: Mic,
    title: 'Mock Interview',
    subtitle: 'Australian-Style Practice',
    description: 'Full mock interview with STAR method coaching and behavioural questions. Practice in English, Hindi, or Punjabi — get comfortable before the real thing.',
    price: 'From $79',
    color: 'sky',
  },
];

const AUSTRALIA_DIFFERENCES = [
  {
    icon: Briefcase,
    title: 'Job Hunting',
    description: 'LinkedIn + SEEK + referral culture. In India, Naukri and references work. Here, it\'s a different game — networking coffees open more doors than 100 applications.',
  },
  {
    icon: MessageSquare,
    title: 'Interview Style',
    description: 'Behavioural/STAR method, casual tone, culture-fit heavy. They want to know you\'ll fit the team, not just do the job. Very different from Indian interview style.',
  },
  {
    icon: FileCheck,
    title: 'Resume Format',
    description: '2-page max, no photo, no DOB, no father\'s name. Australian resumes are completely different from Indian CVs — and getting it wrong costs you interviews.',
  },
  {
    icon: DollarSign,
    title: 'Cost of Living',
    description: 'Sydney/Melbourne rent is $2,000-3,500/mo. That\'s not a typo. Regional cities are cheaper ($1,200-2,000/mo). Plan your budget before you land.',
  },
  {
    icon: Home,
    title: 'Renting',
    description: 'Rental inspections, references, bond (4 weeks rent), and rental bidding wars. No broker, no advance rent — but the competition is fierce.',
  },
  {
    icon: CreditCard,
    title: 'First Week Must-Dos',
    description: 'TFN, Medicare, Superannuation, bank account. Miss these in your first week and you\'ll pay more tax and lose benefits. Nobody tells you this at the airport.',
  },
  {
    icon: Users,
    title: 'Workplace Culture',
    description: 'Flat hierarchy, first-name basis even with CEOs, "she\'ll be right" attitude. No sir/ma\'am — just first names. It feels informal, but it\'s professional.',
  },
  {
    icon: Coffee,
    title: 'Networking',
    description: 'Coffees matter more than applications. A 15-minute coffee chat can open doors that 100 online applications can\'t. This is not how it works back home.',
  },
];

const FAQS = [
  {
    q: 'How is this different from a migration agent?',
    a: 'Migration agents handle visas and legal paperwork — most have hardly ever visited Australia themselves. We handle everything else — the practical, cultural, and professional side of actually living here. Our guide has been living in Australia for 12 years and has made every mistake so you don\'t have to.',
  },
  {
    q: 'Who will I be speaking with?',
    a: 'Someone just like you — an Indian who came to Australia 14 years ago with $2,000 and a lot of dreams. They speak English, Hindi, and Punjabi. They\'ve worked at NAB, Telstra, NSW Government, ING, IDP and 10+ major companies. They\'ve given and taken 100+ interviews and understand every mistake we make when we first arrive.',
  },
  {
    q: 'Can I ask about anything during the consultation?',
    a: 'Absolutely. Banking, renting, schools, Medicare, TFN, culture, suburbs, job hunting, workplace norms — anything about Australian life. No question is too basic. We remember what it was like when we first landed.',
  },
  {
    q: 'Can I speak in Hindi or Punjabi?',
    a: 'Yes. Your guide speaks English, Hindi, and Punjabi. You can switch between languages during the session — whatever makes you comfortable.',
  },
  {
    q: 'How quickly can I book a session?',
    a: 'Most sessions are available within 2-3 business days. You can pick a time slot that works for you during the booking process.',
  },
  {
    q: 'Do you help with visa applications?',
    a: 'We focus on the practical side of settling in Australia, not visa applications. For visa help, consult a registered migration agent. But for everything that happens after you land — that\'s us.',
  },
];

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % HERO_IMAGES.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length);

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center">
        {HERO_IMAGES.map((img, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              i === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={img.url}
              alt={img.alt}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-sand-900/85 via-sand-900/60 to-transparent" />

        <div className="relative z-10 section-container w-full">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-6 animate-fade-in">
              <MapPin className="w-5 h-5 text-ochre-400" />
              <span className="text-ochre-300 font-semibold text-sm tracking-wider uppercase">For Indians Moving to Australia</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 animate-slide-up">
              Came with $2,000 and Dreams.{' '}
              <span className="text-ochre-400">Now I Help People Like You.</span>
            </h1>
            <p className="text-lg sm:text-xl text-sand-200 mb-4 leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
              14 years ago, I landed in Australia with $2,000 in my pocket and no idea what to expect.
              I made every mistake so you don't have to.
            </p>
            <p className="text-base text-sand-300 mb-8 leading-relaxed animate-slide-up" style={{ animationDelay: '0.3s' }}>
              Not an agent who's never been here. A fellow Indian who's lived it — 12 years and counting. English, Hindi, Punjabi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <Link to="/services" className="btn-primary text-lg px-8 py-4">
                Explore Services <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/book/ask-an-aussie" className="btn-outline border-white text-white hover:bg-white/10 text-lg px-8 py-4">
                Book a Consultation
              </Link>
            </div>
          </div>
        </div>

        {/* Carousel Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i === currentSlide ? 'bg-ochre-400 w-8' : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Trust / Guide Story Section */}
      <section className="py-20 bg-white">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-ochre-50 text-ochre-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Shield className="w-4 h-4" />
                Your Guide — Not an Agent. A Fellow Indian.
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-sand-900 mb-6">
                I'm Not a Migration Agent. I'm Someone Who's Actually Lived It.
              </h2>
            </div>

            <div className="bg-sand-50 rounded-2xl border border-sand-200 p-8 sm:p-10 mb-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-ochre-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-display text-2xl font-bold">G</span>
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-sand-900">Your Guide's Story</h3>
                  <p className="text-sand-500 text-sm">14 years in Australia. Hindi, English, Punjabi.</p>
                </div>
              </div>
              <div className="space-y-4 text-sand-700 leading-relaxed">
                <p>
                  14 years ago, I landed in Australia with <strong className="text-sand-900">$2,000 in my pocket</strong> and a head full of dreams — just like you. I didn't know anyone. I didn't know how renting worked. I didn't know what a TFN was. I made every mistake in the book — wrong resume format, wrong interview style, wrong suburb, wrong bank account.
                </p>
                <p>
                  The agents back in India who sent me here? They'd hardly ever visited Australia themselves. They could file paperwork, but they couldn't tell me what happens <em>after</em> you land. How do you rent an apartment? How do you write an Australian resume? What do you say in an interview when they ask "Tell me about a time when..."?
                </p>
                <p>
                  Over the last <strong className="text-sand-900">12 years living in Australia</strong>, I've worked at <strong className="text-sand-900">NAB, Telstra, NSW Government, ING, IDP</strong> and 10+ major companies. I've given and taken over 100 interviews. I've worked across corporate, government, and education sectors. I understand every mistake we make when we first arrive — because I made them all.
                </p>
                <p className="font-semibold text-sand-900">
                  Now I help people like you skip the mistakes and settle in faster. In English, Hindi, or Punjabi — whatever works for you.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { value: '14+', label: 'Years Since Landing' },
                { value: '12+', label: 'Years Living in Australia' },
                { value: '10+', label: 'Major Companies' },
                { value: '3', label: 'Languages Spoken' },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-4 bg-white rounded-xl border border-sand-200">
                  <div className="font-display text-3xl font-bold text-ochre-500">{stat.value}</div>
                  <div className="text-sm text-sand-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Us vs Agents Section */}
      <section className="py-20 bg-sand-50">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-sand-900 mb-4">
                Why This Is Different from a Migration Agent
              </h2>
              <p className="text-lg text-sand-600 max-w-2xl mx-auto">
                Agents get you here. We help you survive and thrive once you arrive.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl border border-sand-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-red-500" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-sand-900">Typical Migration Agent</h3>
                </div>
                <ul className="space-y-3">
                  {[
                    'Handles visa paperwork and legal requirements',
                    'Often has hardly ever visited Australia',
                    'Doesn\'t know what happens after you land',
                    'Can\'t help with jobs, renting, or culture',
                    'Process ends once visa is approved',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sand-600">
                      <span className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-red-500 text-xs font-bold">X</span>
                      </span>
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-2xl border-2 border-eucalyptus-300 p-8 shadow-md">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-eucalyptus-100 rounded-lg flex items-center justify-center">
                    <Heart className="w-5 h-5 text-eucalyptus-600" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-sand-900">Your Guide at OzWelcome</h3>
                </div>
                <ul className="space-y-3">
                  {[
                    'Actually living in Australia for 12+ years',
                    'Came from India — knows exactly what you\'re going through',
                    'Speaks English, Hindi, and Punjabi',
                    'Has worked at NAB, Telstra, NSW Govt, ING, IDP',
                    'Helps with jobs, renting, culture, interviews — the real stuff',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sand-700">
                      <span className="w-5 h-5 bg-eucalyptus-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-eucalyptus-600 text-xs font-bold">&#10003;</span>
                      </span>
                      <span className="text-sm font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="section-container">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-sand-900 mb-4">
              How We Help You Settle In
            </h2>
            <p className="text-lg text-sand-600 max-w-2xl mx-auto">
              Three services designed for Indians moving to Australia. The things nobody back home tells you about.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SERVICES.map((service) => {
              const Icon = service.icon;
              const colorClasses = {
                ochre: 'bg-ochre-50 text-ochre-600 border-ochre-200',
                eucalyptus: 'bg-eucalyptus-50 text-eucalyptus-600 border-eucalyptus-200',
                sky: 'bg-sky-50 text-sky-600 border-sky-200',
              }[service.color];
              const iconBg = {
                ochre: 'bg-ochre-500',
                eucalyptus: 'bg-eucalyptus-600',
                sky: 'bg-sky-600',
              }[service.color];

              return (
                <Link
                  key={service.id}
                  to={`/services/${service.id}`}
                  className="card group p-8 flex flex-col"
                >
                  <div className={`w-14 h-14 ${iconBg} rounded-xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border mb-3 w-fit ${colorClasses}`}>
                    {service.subtitle}
                  </span>
                  <h3 className="font-display text-2xl font-bold text-sand-900 mb-3">{service.title}</h3>
                  <p className="text-sand-600 leading-relaxed flex-1 mb-6">{service.description}</p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-sand-100">
                    <span className="font-display text-xl font-bold text-ochre-600">{service.price}</span>
                    <span className="text-ochre-500 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                      Learn More <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Australia is Different */}
      <section className="py-20 bg-sand-50">
        <div className="section-container">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-sand-900 mb-4">
              Australia is Not What You Expect
            </h2>
            <p className="text-lg text-sand-600 max-w-2xl mx-auto">
              Things that catch every Indian migrant off guard. Knowing these ahead of time can save you months of frustration and thousands of dollars.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {AUSTRALIA_DIFFERENCES.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="p-6 rounded-xl bg-white border border-sand-200 hover:border-ochre-300 hover:bg-ochre-50/30 transition-all duration-300 group">
                  <div className="w-11 h-11 bg-ochre-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-ochre-200 transition-colors">
                    <Icon className="w-5 h-5 text-ochre-600" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-sand-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-sand-600 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Languages Section */}
      <section className="py-16 bg-white border-y border-sand-200">
        <div className="section-container">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
            <div className="flex items-center gap-3">
              <Languages className="w-8 h-8 text-ochre-500" />
              <div>
                <div className="font-display text-lg font-bold text-sand-900">Speak in Your Language</div>
                <div className="text-sand-500 text-sm">English, Hindi, Punjabi</div>
              </div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-sand-200" />
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-eucalyptus-600" />
              <div>
                <div className="font-display text-lg font-bold text-sand-900">Real Australian Experience</div>
                <div className="text-sand-500 text-sm">12+ years living and working here</div>
              </div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-sand-200" />
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-500" />
              <div>
                <div className="font-display text-lg font-bold text-sand-900">Made Every Mistake</div>
                <div className="text-sand-500 text-sm">So you don't have to</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-sand-50">
        <div className="section-container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-sand-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-sand-600">
                Common questions from Indians planning their move to Australia.
              </p>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-sand-200 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-sand-50 transition-colors"
                  >
                    <span className="font-semibold text-sand-900 pr-4">{faq.q}</span>
                    <ChevronRight
                      className={`w-5 h-5 text-sand-400 flex-shrink-0 transition-transform duration-200 ${
                        openFaq === i ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 text-sand-600 leading-relaxed animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="section-container">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-sand-900 mb-4">
              What People Say
            </h2>
            <p className="text-lg text-sand-600">
              Real stories from Indians who've made Australia home.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Rahul S.',
                from: 'Delhi, India',
                text: 'The mock interview completely changed how I approach job applications here. I went from zero callbacks to three interviews in two weeks after the resume rewrite. Best $99 I ever spent.',
                rating: 5,
              },
              {
                name: 'Simran K.',
                from: 'Chandigarh, India',
                text: 'I had no idea how different renting in Australia would be. The consultation saved me from so many mistakes — bond, inspections, references. And I could ask questions in Punjabi!',
                rating: 5,
              },
              {
                name: 'Amit P.',
                from: 'Mumbai, India',
                text: 'The resume rewrite was a game changer. My Indian CV had photo, DOB, father\'s name — all wrong for Australia. Two weeks after the rewrite, I got my first interview call.',
                rating: 5,
              },
            ].map((testimonial) => (
              <div key={testimonial.name} className="card p-8">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-ochre-400 fill-ochre-400" />
                  ))}
                </div>
                <p className="text-sand-700 leading-relaxed mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-eucalyptus-100 rounded-full flex items-center justify-center">
                    <span className="text-eucalyptus-700 font-bold text-sm">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-sand-900 text-sm">{testimonial.name}</div>
                    <div className="text-sand-500 text-xs">From {testimonial.from}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-ochre-600 to-ochre-700">
        <div className="section-container text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
            Don't Learn the Hard Way. Learn from Someone Who Did.
          </h2>
          <p className="text-lg text-ochre-100 max-w-2xl mx-auto mb-8">
            I made every mistake so you don't have to. Get guidance from a fellow Indian who's been living in Australia for 12 years.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/services" className="inline-flex items-center justify-center px-8 py-4 bg-white text-ochre-700 font-bold rounded-lg hover:bg-ochre-50 transition-colors shadow-lg text-lg">
              View Our Services <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-colors text-lg">
              Log In / Sign Up
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

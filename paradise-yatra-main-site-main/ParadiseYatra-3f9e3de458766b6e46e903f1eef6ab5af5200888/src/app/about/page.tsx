"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion, type Transition } from "framer-motion";
import { LazyHeader } from "@/components/lazy-components";
import { ChevronRight, Phone, Mail } from "lucide-react";
import Image from "next/image";
import PerformanceMonitor from "@/components/ui/PerformanceMonitor";

const LeadCaptureForm = dynamic(() => import("@/components/LeadCaptureForm"), {
  ssr: false,
});

const missionStates = [
  {
    label: "Personalized Itineraries",
    subtitle: "Every trip is designed around your pace, interests, and budget.",
    intro:
      "At Paradise Yatra, we do not believe in one-size-fits-all travel. We begin by understanding your travel style, priorities, and budget before designing the journey.",
    detail:
      "From honeymoons and family holidays to group adventures and spiritual tours, each itinerary is crafted to feel truly personal.",
    points: [
      { title: "Built Around You", text: "We design routes around your interests, not generic templates." },
      { title: "Flexible Plans", text: "Duration, pace, and activities are tailored to your comfort." },
      { title: "Curated Stays", text: "Handpicked hotels and transport for smoother travel." },
      { title: "Meaningful Days", text: "Each day is planned to create memorable experiences." },
    ],
  },
  {
    label: "Transparent Planning",
    subtitle: "Clear packages, clear timelines, clear expectations.",
    intro:
      "Holiday planning should feel exciting, not overwhelming. We keep every step clear, structured, and easy to understand from day one.",
    detail:
      "Before you book, you know exactly what is included, what is optional, and how your trip days are organized.",
    points: [
      {
        title: "No Hidden Surprises",
        text: "Clear inclusions and exclusions shared upfront.",
      },
      {
        title: "Day-wise Visibility",
        text: "Practical itineraries so you can visualize the journey before travel.",
      },
      {
        title: "Budget Clarity",
        text: "Recommendations that balance quality experiences with your budget goals.",
      },
      {
        title: "Confident Decisions",
        text: "Straight answers and clear communication at every stage.",
      },
    ],
  },
  {
    label: "Reliable Support",
    subtitle: "Strong assistance before, during, and after your trip.",
    intro:
      "Great journeys depend on dependable support. Our team stays connected from your first inquiry to your safe return home.",
    detail:
      "From booking support to on-ground coordination, we are available when it matters most.",
    points: [
      { title: "Responsive Team", text: "Quick help through calls, chat, and updates." },
      { title: "Local Coordination", text: "Trusted ground teams for smooth day-to-day execution." },
      { title: "Reliable Vendors", text: "Verified hotels, vehicles, and activity partners." },
      { title: "Travel Peace", text: "Confidence that support is always within reach." },
    ],
  },
  {
    label: "Authentic Experiences",
    subtitle: "Travel deeper with culture, food, and local stories.",
    intro:
      "We believe travel is more than ticking places off a list. It is about local life, regional culture, and moments that feel real.",
    detail:
      "Our itineraries blend popular highlights with authentic experiences that connect you to the destination.",
    points: [
      { title: "Local Culture", text: "Experiences rooted in local heritage and traditions." },
      { title: "Regional Flavors", text: "Food recommendations that showcase authentic local cuisine." },
      { title: "Hidden Gems", text: "Less crowded spots beyond the standard tourist route." },
      { title: "Responsible Choices", text: "Travel that respects places, people, and communities." },
    ],
  },
  {
    label: "Built on Trust",
    subtitle: "Long-term traveler relationships are at the heart of our brand.",
    intro:
      "Trust is earned through consistency. At Paradise Yatra, we focus on honest guidance, dependable execution, and genuine care in every interaction.",
    detail:
      "Our strongest growth comes from repeat travelers and referrals who trust how we plan, support, and deliver.",
    points: [
      { title: "Honest Advice", text: "Recommendations made for traveler benefit, not upselling." },
      { title: "Consistent Quality", text: "A dependable service standard across trips and destinations." },
      { title: "Clear Communication", text: "Regular updates before, during, and after travel." },
      { title: "Long-term Relationships", text: "We aim to be your trusted travel partner, trip after trip." },
    ],
  },
];

const AboutPage = memo(() => {
  const prefersReducedMotion = useReducedMotion();
  const [activeMissionIndex, setActiveMissionIndex] = useState(1);
  const activeMission = missionStates[activeMissionIndex];
  const [showLeadCaptureForm, setShowLeadCaptureForm] = useState(false);
  const lifeSectionRef = useRef<HTMLElement | null>(null);
  const [playLifeVideos, setPlayLifeVideos] = useState(false);
  const [loadLifeVideos, setLoadLifeVideos] = useState(false);

  const pageVariants = useMemo(
    () => ({
      initial: { opacity: prefersReducedMotion ? 1 : 0 },
      animate: { opacity: 1 },
      transition: {
        duration: prefersReducedMotion ? 0 : 0.5,
        ease: "easeInOut" as const,
      } satisfies Transition,
    }),
    [prefersReducedMotion]
  );

  useEffect(() => {
    const section = lifeSectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoadLifeVideos(true);
        }
        setPlayLifeVideos(entry.isIntersecting);
      },
      { threshold: 0.35, rootMargin: "250px 0px" }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const section = lifeSectionRef.current;
    if (!section) return;
    const videos = Array.from(section.querySelectorAll<HTMLVideoElement>("video[data-life-reel='true']"));
    videos.forEach((video) => {
      if (playLifeVideos) {
        void video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [playLifeVideos]);

  return (
    <motion.div
      initial={pageVariants.initial}
      animate={pageVariants.animate}
      transition={pageVariants.transition}
      className="min-h-screen bg-background overflow-x-hidden w-full"
      role="main"
      aria-label="About Paradise Yatra - Our Story and Mission"
    >
      <LazyHeader />

      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/About/Hero/Untitled design.png"
            alt="Paradise Yatra hero"
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-[1220px] px-4 md:px-8 text-center flex flex-col items-center mt-20">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-unbounded flex flex-col gap-2 text-[48px] leading-[1.1] font-extrabold tracking-tight text-white drop-shadow-lg sm:text-[64px] md:text-[88px]"
          >
            <span>Crafted For</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-emerald-300 drop-shadow-sm">Curious Travelers</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mt-6 max-w-2xl text-[16px] leading-[1.6] !text-white !opacity-100 font-semibold drop-shadow-md md:text-[20px] bg-black/40 backdrop-blur-md p-5 rounded-2xl border border-white/20"
          >
            Paradise Yatra is a modern travel company that helps explorers discover extraordinary destinations with
            curated itineraries, expert planning, and reliable on-ground support from start to finish.
          </motion.p>
          
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            type="button"
            onClick={() => setShowLeadCaptureForm(true)}
            className="mt-10 inline-flex cursor-pointer items-center gap-3 rounded-full bg-white px-8 py-4 text-base font-bold text-[#000945] shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all hover:scale-105 hover:bg-blue-50 hover:shadow-[0_8px_40px_rgba(21,93,252,0.3)]"
          >
            Start Planning Your Journey
            <ChevronRight className="h-5 w-5 text-[#155dfc]" />
          </motion.button>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-800">Scroll to explore</span>
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="h-10 w-6 rounded-full border-2 border-slate-800 flex justify-center p-1"
          >
            <div className="h-2 w-2 rounded-full bg-slate-800" />
          </motion.div>
        </motion.div>
      </section>

      {/* Core Values / Missions Section */}
      <section className="bg-slate-50 py-20 md:py-32 relative">
        <div className="mx-auto max-w-[1220px] px-4 md:px-8 relative z-10">
          <div className="text-center mb-16 md:mb-24">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-unbounded text-[36px] font-extrabold tracking-tight text-[#000945] md:text-[52px]"
            >
              Our Core <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">Values</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-[18px] text-slate-600 max-w-2xl mx-auto"
            >
              We believe in creating journeys that matter, built on a foundation of trust, authenticity, and personalized care.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {missionStates.map((state, index) => (
              <motion.div
                key={state.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`group relative overflow-hidden rounded-3xl bg-white p-8 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-1 ${index === 0 || index === 3 || index === 4 ? 'lg:col-span-2' : ''}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative z-10 flex flex-col h-full">
                  <h3 className="text-[24px] font-bold text-[#000945]">{state.label}</h3>
                  <p className="mt-3 text-[16px] font-medium text-blue-600">{state.subtitle}</p>
                  <p className="mt-4 text-[15px] leading-relaxed text-slate-600">{state.intro}</p>
                  
                  <div className="mt-8 pt-6 border-t border-slate-100 flex-grow">
                    <ul className="space-y-4">
                      {state.points.slice(0, 2).map((point) => (
                        <li key={point.title} className="flex gap-3">
                          <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-[14px] text-slate-700">
                            <strong className="font-semibold text-slate-900">{point.title}:</strong> {point.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Life At Paradise Yatra Section */}
      <section ref={lifeSectionRef} className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-[1220px] px-4 md:px-8">
          <div className="mb-12 md:mb-16 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-unbounded text-[36px] font-extrabold tracking-tight text-[#000945] md:text-[52px]"
            >
              Life At Paradise Yatra
            </motion.h2>
            <p className="mt-4 text-[18px] text-slate-600 max-w-2xl mx-auto">
              Every frame here is a glimpse of the energy, creativity, and teamwork behind our journeys.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Column 1 */}
            <div className="flex flex-col gap-4 md:gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden rounded-3xl aspect-[4/5] bg-slate-100"
              >
                <Image
                  src="/About/Life At Paradise Yatra/Image 1.jpeg"
                  alt="Team collaborating"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="group relative overflow-hidden rounded-3xl aspect-square bg-slate-100"
              >
                <video
                  data-life-reel="true"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  muted
                  loop
                  playsInline
                  preload={loadLifeVideos ? "metadata" : "none"}
                >
                  {loadLifeVideos && <source src="/About/Life At Paradise Yatra/Reel 1.mp4" type="video/mp4" />}
                </video>
              </motion.div>
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-4 md:gap-6 md:mt-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="group relative overflow-hidden rounded-3xl aspect-square bg-slate-100"
              >
                <video
                  data-life-reel="true"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  muted
                  loop
                  playsInline
                  preload={loadLifeVideos ? "metadata" : "none"}
                >
                  {loadLifeVideos && <source src="/About/Life At Paradise Yatra/Reel 2.mp4" type="video/mp4" />}
                </video>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="group relative overflow-hidden rounded-3xl aspect-[4/5] bg-slate-100"
              >
                <Image
                  src="/About/Life At Paradise Yatra/Image 2.jpg"
                  alt="Field experience"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </motion.div>
            </div>

            {/* Column 3 */}
            <div className="flex flex-col gap-4 md:gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="group relative overflow-hidden rounded-3xl aspect-[4/5] bg-slate-100"
              >
                <Image
                  src="/About/Life At Paradise Yatra/Image 3.jpg"
                  alt="Travel moments"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="group relative overflow-hidden rounded-3xl aspect-square bg-blue-600 flex items-center justify-center p-8 text-center"
              >
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
                <h3 className="relative z-10 text-[24px] md:text-[32px] font-bold text-white leading-tight">
                  More than just a team, we are a family of explorers.
                </h3>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* The Vision Behind Paradise Yatra Section */}
      <section className="relative overflow-hidden bg-slate-50 py-20 md:py-32">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute right-0 bottom-20 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl" />

        <div className="relative mx-auto max-w-[1220px] px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
            
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="relative z-10 rounded-3xl overflow-hidden aspect-[4/5] lg:max-w-md ml-auto lg:ml-0 shadow-2xl">
                <Image
                  src="/Male Profile (1).png"
                  alt="Dikshant Sharma - Founder, Paradise Yatra"
                  fill
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8 text-white">
                  <p className="text-[14px] font-bold uppercase tracking-[0.2em] text-blue-300 mb-2">
                    Founder & CEO
                  </p>
                  <p className="text-[36px] font-extrabold tracking-tight">
                    Dikshant Sharma
                  </p>
                </div>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="absolute -bottom-12 -left-6 lg:left-auto lg:-right-12 z-20 bg-white p-8 rounded-3xl shadow-xl max-w-[280px]"
              >
                <div className="flex gap-2 text-yellow-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-700 italic font-medium leading-relaxed">
                  "Our goal is simple: make every journey meaningful, and every traveler feel taken care of."
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:pl-16"
            >
              <h2 className="font-unbounded text-[36px] font-extrabold tracking-tight text-[#000945] md:text-[48px] mb-8">
                The Vision
              </h2>
              
              <div className="space-y-6 text-[18px] text-slate-600 leading-relaxed">
                <p>
                  Dikshant Sharma built Paradise Yatra with one clear promise: travel should feel personal, seamless,
                  and unforgettable. 
                </p>
                <p>
                  From early route planning to scaling a trusted travel brand, his leadership combines
                  local insight with world-class service standards. Every itinerary is a reflection of this commitment to quality.
                </p>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-6 pt-10 border-t border-slate-200">
                <div>
                  <p className="text-[36px] font-extrabold text-[#155dfc]">10+</p>
                  <p className="text-[14px] font-bold uppercase tracking-wider text-slate-500 mt-1">Years</p>
                </div>
                <div>
                  <p className="text-[36px] font-extrabold text-[#155dfc]">25+</p>
                  <p className="text-[14px] font-bold uppercase tracking-wider text-slate-500 mt-1">Places</p>
                </div>
                <div>
                  <p className="text-[36px] font-extrabold text-[#155dfc]">1k+</p>
                  <p className="text-[14px] font-bold uppercase tracking-wider text-slate-500 mt-1">Clients</p>
                </div>
              </div>

              <div className="mt-12">
                <a
                  href="mailto:dikshant@paradiseyatra.com"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#000945] px-8 py-4 text-[16px] font-bold text-white transition-all hover:bg-[#155dfc] hover:shadow-lg hover:shadow-blue-500/30"
                >
                  Connect with the Founder
                  <ChevronRight className="h-5 w-5" />
                </a>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-[1220px] px-4 md:px-8">
          <div className="mb-12 md:mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-unbounded text-[36px] font-extrabold tracking-tight text-[#000945] md:text-[52px]"
            >
              Meet Us <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">At</span>
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 space-y-8"
            >
              <div className="rounded-3xl bg-slate-50 p-8 md:p-10 transition-transform hover:scale-[1.02]">
                <h3 className="text-[28px] font-bold text-[#000945]">Our Office</h3>
                <p className="mt-4 text-[16px] leading-relaxed text-slate-600">
                  108, Tagore Villa, Chakrata Road, <br/>Dehradun, Uttarakhand - 248001
                </p>

                <div className="mt-8 space-y-4">
                  <a
                    href="tel:+918979396413"
                    className="flex items-center gap-4 text-slate-700 transition-colors hover:text-[#155dfc] group"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-[#155dfc] group-hover:bg-[#155dfc] group-hover:text-white transition-colors">
                      <Phone className="h-5 w-5" />
                    </div>
                    <span className="text-[18px] font-semibold">+91 8979396413</span>
                  </a>
                  <a
                    href="mailto:info@paradiseyatra.com"
                    className="flex items-center gap-4 text-slate-700 transition-colors hover:text-[#155dfc] group"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      <Mail className="h-5 w-5" />
                    </div>
                    <span className="text-[18px] font-semibold">info@paradiseyatra.com</span>
                  </a>
                </div>
              </div>

              <div className="rounded-3xl bg-[#000945] p-8 md:p-10 text-white transition-transform hover:scale-[1.02] relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
                <h4 className="text-[28px] font-bold">Business Hours</h4>
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between items-center border-b border-white/20 pb-3">
                    <span className="text-white/80">Mon - Sat</span>
                    <span className="font-semibold">10:00 AM - 6:30 PM</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-white/80">Sunday</span>
                    <span className="font-semibold text-emerald-400">Closed</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-7"
            >
              <div className="h-full min-h-[400px] overflow-hidden rounded-3xl bg-slate-100 shadow-lg relative group">
                <div className="absolute inset-0 bg-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"></div>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1388.6582464962262!2d78.03477118988253!3d30.327473883386677!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39092a19318db8c3%3A0xd8c55020cab7d0c4!2sParadise%20Yatra!5e0!3m2!1sen!2sin!4v1772634410746!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 h-full w-full object-cover"
                  title="Paradise Yatra Office Location"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <PerformanceMonitor showInProduction={false} />

      {showLeadCaptureForm && (
        <LeadCaptureForm
          isOpen={showLeadCaptureForm}
          onClose={() => setShowLeadCaptureForm(false)}
        />
      )}
    </motion.div>
  );
});

AboutPage.displayName = "AboutPage";

export default AboutPage;

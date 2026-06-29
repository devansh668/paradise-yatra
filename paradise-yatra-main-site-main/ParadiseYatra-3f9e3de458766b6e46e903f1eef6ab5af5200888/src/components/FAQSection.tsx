"use client";

import React, { useState, useEffect } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface FAQItemProps {
    question: string;
    answer: string;
    isOpen: boolean;
    onClick: () => void;
}

const FAQItem = ({ question, answer, isOpen, onClick }: FAQItemProps) => {
    return (
        <div 
            className={`mb-4 overflow-hidden transition-all duration-300 rounded-2xl border ${
                isOpen 
                    ? "bg-[#f8faff] border-[#155dfc]/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)]" 
                    : "bg-white border-slate-200 hover:border-[#155dfc]/30 hover:shadow-md hover:-translate-y-0.5"
            }`}
        >
            <button
                onClick={onClick}
                className="w-full text-left px-6 py-5 flex items-center justify-between cursor-pointer group"
            >
                <span className={`font-bold transition-colors text-[16px] md:text-[18px] pr-6 ${
                    isOpen ? "text-[#155dfc]" : "text-[#000945] group-hover:text-[#155dfc]"
                }`}>
                    {question}
                </span>
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isOpen 
                        ? "bg-[#155dfc] text-white rotate-180 shadow-md shadow-[#155dfc]/30" 
                        : "bg-slate-50 text-slate-500 border border-slate-200 group-hover:bg-[#EFF6FF] group-hover:text-[#155dfc] group-hover:border-[#155dfc]/30"
                }`}>
                    {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <div className="px-6 pb-6 text-slate-600 text-[15px] md:text-[16px] leading-relaxed font-medium">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

interface FAQSectionProps {
    destination?: string;
    tourType?: string;
    faqs?: { question: string; answer: string }[];
}

const defaultFaqs = [
    {
        question: "How long can I stay?",
        answer: "We offer flexible tour durations ranging from 2-day weekend getaways to 15-day comprehensive expeditions. You can customize your stay based on your preferences and travel goals."
    },
    {
        question: "Can I book from this site?",
        answer: "Yes, you can browse all our curated packages and initiate a booking directly through our secure platform. Our travel experts will then reach out to finalize the details and booking formalities."
    },
    {
        question: "Are the prices the same?",
        answer: "We guarantee the best market rates. The prices shown are transparent with no hidden charges, though seasonal variations and dynamic pricing may apply based on your confirmed travel dates."
    },
    {
        question: "What's included?",
        answer: "Most packages include handpicked hotel stays, private cab transfers, daily breakfast, and dedicated 24/7 local expert support throughout your journey to ensure a hassle-free experience."
    },
    {
        question: "Need to cancel?",
        answer: "We offer a flexible cancellation policy. Cancellations made 30 days prior to travel are eligible for a full refund (minus processing fees). Please check specific package terms for details."
    }
];

export default function FAQSection({ destination, tourType, faqs: faqsOverride }: FAQSectionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0); // Open first FAQ by default
    const [faqs, setFaqs] = useState(defaultFaqs);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (faqsOverride && faqsOverride.length > 0) {
            setFaqs(faqsOverride);
            setOpenIndex(0);
            setLoaded(true);
            return;
        }

        if (destination && tourType) {
            fetchDestinationFAQs();
        } else {
            setFaqs(defaultFaqs);
            setOpenIndex(0);
            setLoaded(true);
        }
    }, [destination, tourType, faqsOverride]);

    const fetchDestinationFAQs = async () => {
        try {
            const normalizedDestination = destination!.replace(/-/g, ' ');
            const response = await fetch(
                `/api/destination-faqs?destination=${encodeURIComponent(normalizedDestination)}&tourType=${tourType}`
            );

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.destinationFaq && data.destinationFaq.isActive && data.destinationFaq.faqs?.length > 0) {
                    const sortedFaqs = data.destinationFaq.faqs
                        .sort((a: any, b: any) => a.order - b.order)
                        .map((f: any) => ({ question: f.question, answer: f.answer }));
                    setFaqs(sortedFaqs);
                } else {
                    setFaqs(defaultFaqs);
                }
            } else {
                setFaqs(defaultFaqs);
            }
        } catch (err) {
            console.error('Error fetching destination FAQs:', err);
            setFaqs(defaultFaqs);
        } finally {
            setLoaded(true);
        }
    };

    return (
        <section className="bg-gradient-to-b from-white to-slate-50 py-16 md:py-24 px-4 md:px-8 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#155dfc]/5 rounded-full blur-3xl"></div>
                <div className="absolute top-40 -left-40 w-96 h-96 bg-[#000945]/5 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-20 items-center relative z-10">
                {/* Left Column: FAQ Content */}
                <div className="w-full lg:w-1/2">
                    <div className="mb-10 text-center lg:text-left">
                        <span className="inline-block py-1 px-3 rounded-full bg-[#EFF6FF] text-[#155dfc] text-sm font-bold tracking-wider uppercase mb-4 border border-[#155dfc]/10">
                            Clear Your Doubts
                        </span>
                        <h2 className="text-[32px] md:text-[46px] font-extrabold text-[#000945] leading-[1.15] mb-4 tracking-tight">
                            Got Questions? We Have Answers.
                        </h2>
                        <p className="text-slate-600 text-lg">
                            Find everything you need to know about our seamless booking process, package details, and unforgettable travel experiences.
                        </p>
                    </div>

                    <div className="max-w-xl mx-auto lg:mx-0">
                        {faqs.map((faq, index) => (
                            <FAQItem
                                key={index}
                                question={faq.question}
                                answer={faq.answer}
                                isOpen={openIndex === index}
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            />
                        ))}
                    </div>
                </div>

                {/* Right Column: Image */}
                <div className="hidden lg:block w-full lg:w-1/2 relative">
                    <div className="relative h-[650px] w-full rounded-[24px] overflow-hidden shadow-[0_20px_50px_rgba(0,9,69,0.15)] group">
                        <Image
                            src="/Destination Pages/Faq/Image.webp"
                            alt="FAQ Illustration"
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {/* Elegant gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#000945]/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    {/* Decorative floating card */}
                    <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.1)] border border-slate-100 max-w-[240px] animate-bounce" style={{ animationDuration: '3s' }}>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-12 h-12 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#155dfc]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                            </div>
                            <div>
                                <p className="text-[#000945] font-bold leading-tight">24/7 Support</p>
                                <p className="text-slate-500 text-sm">Always here to help</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

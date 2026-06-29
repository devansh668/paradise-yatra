"use client";

import { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import CarouselArrows from "./ui/CarouselArrows";

interface Testimonial {
    id: number;
    destination: string;
    video: string;
    quote: string;
    name: string;
    rating: number;
}

const TESTIMONIALS: Testimonial[] = [
    {
        id: 1,
        destination: "Goa",
        video: "/Home/Memories by travellers/Video Testimonial 1.mp4",
        quote: "Absolutely phenomenal experience! Everything was perfectly arranged.",
        name: "Rahul Sharma",
        rating: 5,
    },
    {
        id: 2,
        destination: "Gujarat",
        video: "/Home/Memories by travellers/Video Testimonial 2.mp4",
        quote: "A trip we will remember forever. Highly recommended!",
        name: "Roobal & Anjali",
        rating: 5,
    },
    {
        id: 3,
        destination: "Kerala",
        video: "/Home/Memories by travellers/Video Testimonial 3.mp4",
        quote: "The backwaters were magical. Thank you Paradise Yatra!",
        name: "Vikram Singh",
        rating: 5,
    },
    {
        id: 4,
        destination: "Sikkim",
        video: "/Home/Memories by travellers/Video Testimonial 4.mp4",
        quote: "Amazing hospitality and breathtaking views.",
        name: "Pranav & Anjali",
        rating: 5,
    },
    {
        id: 5,
        destination: "Shimla",
        video: "/Home/Memories by travellers/Video Testimonial 5.mp4",
        quote: "Perfect family getaway with zero hassle. 10/10!",
        name: "The Kapoor Family",
        rating: 5,
    },
];

const TestimonialsSection = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const carouselRef = useRef<HTMLDivElement>(null);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [isInView, setIsInView] = useState(false);
    const [hasEnteredView, setHasEnteredView] = useState(false);

    const updateScrollState = () => {
        if (carouselRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
        }
    };

    useEffect(() => {
        const carousel = carouselRef.current;
        if (carousel) {
            carousel.addEventListener("scroll", updateScrollState);
            window.addEventListener("resize", updateScrollState);
            updateScrollState();

            return () => {
                carousel.removeEventListener("scroll", updateScrollState);
                window.removeEventListener("resize", updateScrollState);
            };
        }
    }, []);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                const visible = entry.isIntersecting;
                setIsInView(visible);
                if (visible) setHasEnteredView(true);
            },
            { threshold: 0.35, rootMargin: "150px 0px" }
        );

        observer.observe(section);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!hasEnteredView) return;

        videoRefs.current.forEach((video) => {
            if (!video) return;
            if (isInView) {
                const playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(() => {
                        // Playback may fail until browser confirms auto-play policy.
                    });
                }
            } else {
                video.pause();
            }
        });
    }, [isInView, hasEnteredView]);

    const scrollByStep = (direction: number) => {
        if (carouselRef.current) {
            const card = carouselRef.current.querySelector(".flex-shrink-0");
            const gap = 24;
            const cardWidth = card ? card.getBoundingClientRect().width : 280;
            const step = cardWidth + gap;

            carouselRef.current.scrollBy({
                left: direction * step,
                behavior: "smooth",
            });
        }
    };

    return (
        <section
            ref={sectionRef}
            className="py-8 md:py-10 px-4 md:px-8 overflow-hidden relative"
            style={{
                backgroundImage: "url('/Home/Hero/Pick Your Style Background.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Header Area */}
            <div className="relative z-10 max-w-6xl mx-auto w-full text-center mb-12 px-4">
                <div className="inline-flex items-center gap-3 mb-6">
                    <span className="h-px w-6 md:w-10 bg-blue-400/60"></span>
                    <span className="text-blue-400 text-[10px] md:text-xs font-black uppercase tracking-[0.3em]">
                        Voices of Our Travelers
                    </span>
                    <span className="h-px w-6 md:w-10 bg-blue-400/60"></span>
                </div>

                <h2 className="!text-xl md:!text-3xl !font-unbounded !font-black tracking-tight text-white mb-6 drop-shadow-2xl leading-[1.1]">
                    Moments Shared <br className="md:hidden" /> by Travelers{" "}
                    <span className="relative inline-block ml-1">
                        <span className="relative z-10 text-rose-500">❤️</span>
                        <span className="absolute inset-0 blur-2xl bg-rose-500/40 -z-10"></span>
                    </span>
                </h2>

                <p className="max-w-2xl mx-auto !text-white/70 !text-sm md:!text-base font-medium leading-relaxed mb-10">
                    Witness the joy and unforgettable memories created by our guests. Real stories, real emotions, and timeless journeys captured through their lenses.
                </p>

                {/* Metrics / Trust Signals (Keep commented for now or style subtly if needed) */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                    {/* Trust signals could go here */}
                </div>
            </div>

            {/* Carousel */}
            <div className="relative z-10 max-w-6xl mx-auto w-full group/carousel">
                <CarouselArrows
                    onPrevious={() => scrollByStep(-1)}
                    onNext={() => scrollByStep(1)}
                    canScrollLeft={canScrollLeft}
                    canScrollRight={canScrollRight}
                />

                <div
                    ref={carouselRef}
                    className="flex overflow-x-auto scrollbar-hide gap-6 pb-8 px-4 snap-x snap-mandatory scroll-smooth"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {TESTIMONIALS.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="flex-shrink-0 w-[240px] md:w-[280px]  snap-center flex flex-col items-center"
                        >
                            <div className="relative h-[400px] md:h-[480px] w-full rounded-lg overflow-hidden shadow-xl cursor-pointer border-2 border-dashed border-white" style={{ isolation: 'isolate', WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}>
                                <video
                                    ref={(el) => { videoRefs.current[testimonial.id - 1] = el; }}
                                    src={hasEnteredView ? testimonial.video : undefined}
                                    muted
                                    loop
                                    playsInline
                                    preload={hasEnteredView ? "metadata" : "none"}
                                    className="absolute inset-0 w-full h-full object-cover rounded-[inherit] z-0"
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 z-10"></div>
                            </div>

                            {/* Review Content */}
                            <div className="mt-5 flex flex-col items-center text-center">
                                <div className="flex items-center gap-1 mb-3">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <p className="!text-white text-sm italic font-medium leading-relaxed mb-3 px-2 line-clamp-3">
                                    "{testimonial.quote}"
                                </p>
                                <h4 className="text-white font-bold text-[15px] tracking-wide">
                                    {testimonial.name}
                                </h4>
                                <span className="text-blue-400 text-xs font-semibold uppercase tracking-widest mt-1.5">
                                    Traveled to {testimonial.destination}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;

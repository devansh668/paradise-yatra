"use client";

import { Search, Mountain, Sparkles, Compass } from "lucide-react";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getDestinationWebp } from "@/lib/utils";
import SearchSuggestions from "./SearchSuggestions";

interface FeaturedDestinationCard {
  name: string;
  image: string | null;
  size: "normal" | "tall";
  href: string;
}

const slugifyLocation = (value: string) => value.toLowerCase().replace(/\s+/g, "-");

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [shouldShowVideo, setShouldShowVideo] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [animatePlaceholder, setAnimatePlaceholder] = useState(true);
  const [featuredDestinations, setFeaturedDestinations] = useState<FeaturedDestinationCard[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 640px)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection;

    const update = () => {
      const isMobile = mobileQuery.matches;
      const allowVideo = !motionQuery.matches && !connection?.saveData;
      const allowTyping = !motionQuery.matches && !connection?.saveData;
      setShouldShowVideo(allowVideo);
      setAnimatePlaceholder(allowTyping);
    };

    update();
    const addListener = (query: MediaQueryList, handler: () => void) => {
      if (query.addEventListener) {
        query.addEventListener("change", handler);
      } else {
        query.addListener(handler);
      }
    };
    const removeListener = (query: MediaQueryList, handler: () => void) => {
      if (query.removeEventListener) {
        query.removeEventListener("change", handler);
      } else {
        query.removeListener(handler);
      }
    };

    addListener(motionQuery, update);
    addListener(mobileQuery, update);

    return () => {
      removeListener(motionQuery, update);
      removeListener(mobileQuery, update);
    };
  }, []);

  useEffect(() => {
    if (!shouldShowVideo) {
      setVideoSrc(null);
      return;
    }

    let cancelled = false;
    const loadVideo = () => {
      if (!cancelled) {
        setVideoSrc("/Home/Hero/Hero%20Background.mp4");
      }
    };

    if ("requestIdleCallback" in window) {
      const id = (window as Window & { requestIdleCallback: Function }).requestIdleCallback(
        loadVideo,
        { timeout: 2000 }
      );
      return () => {
        cancelled = true;
        (window as Window & { cancelIdleCallback: Function }).cancelIdleCallback(id);
      };
    }

    const timeoutId = setTimeout(loadVideo, 1200);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [shouldShowVideo]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const backgroundImage = new window.Image();
    backgroundImage.src = "/Home/Seach Lightbox/Background.jpg";
  }, []);

  useEffect(() => {
    let isMounted = true;

    const buildFeaturedDestinations = async () => {
      try {
        const [indiaResponse, internationalResponse] = await Promise.all([
          fetch("/api/all-packages?tourType=india&limit=200&isActive=true&minimal=true", { cache: "no-store" }),
          fetch("/api/all-packages?tourType=international&limit=200&isActive=true&minimal=true", { cache: "no-store" }),
        ]);

        const indiaPackages = indiaResponse.ok ? ((await indiaResponse.json()).packages || []) : [];
        const internationalPackages = internationalResponse.ok ? ((await internationalResponse.json()).packages || []) : [];

        const mapPackagesToCards = (
          packages: any[],
          key: "state" | "country",
          tourType: "india" | "international"
        ) => {
          const uniqueCards = new Map<string, FeaturedDestinationCard>();

          packages.forEach((pkg: any) => {
            const locationName = typeof pkg[key] === "string" ? pkg[key].trim() : "";
            if (!locationName || uniqueCards.has(locationName)) return;

            const image = getDestinationWebp(locationName);
            if (!image) return;

            uniqueCards.set(locationName, {
              name: locationName,
              image,
              size: "normal",
              href: `/package/${tourType}/${slugifyLocation(locationName)}`,
            });
          });

          return Array.from(uniqueCards.values());
        };

        const indiaCards = mapPackagesToCards(indiaPackages, "state", "india");
        const internationalCards = mapPackagesToCards(internationalPackages, "country", "international");

        const mixedCards: FeaturedDestinationCard[] = [];
        const maxCards = Math.min(10, indiaCards.length + internationalCards.length);

        for (let i = 0; mixedCards.length < maxCards; i += 1) {
          if (i < indiaCards.length) mixedCards.push(indiaCards[i]);
          if (mixedCards.length >= maxCards) break;
          if (i < internationalCards.length) mixedCards.push(internationalCards[i]);
        }

        const sizedCards = mixedCards.map((card) => ({
          ...card,
          size: "normal" as const,
        }));

        if (isMounted) {
          setFeaturedDestinations(sizedCards);
        }
      } catch (error) {
        console.error("Error preloading featured destinations:", error);
      }
    };

    buildFeaturedDestinations();

    return () => {
      isMounted = false;
    };
  }, []);

  const heroTypingTargets = featuredDestinations.length > 0
    ? featuredDestinations.map((destination) => destination.name)
    : ["Ladakh", "Kerala", "Kashmir", "Himachal Pradesh"];

  useEffect(() => {
    if (!animatePlaceholder || searchQuery.trim() || heroTypingTargets.length === 0) {
      setTypingText("");
      setIsDeleting(false);
      setCurrentTextIndex(0);
      return;
    }

    const currentText = heroTypingTargets[currentTextIndex % heroTypingTargets.length];
    let timer: number;

    if (!isDeleting && typingText.length < currentText.length) {
      timer = window.setTimeout(() => {
        setTypingText(currentText.slice(0, typingText.length + 1));
      }, 58);
    } else if (!isDeleting && typingText.length === currentText.length) {
      timer = window.setTimeout(() => {
        setIsDeleting(true);
      }, 700);
    } else if (isDeleting && typingText.length > 0) {
      timer = window.setTimeout(() => {
        setTypingText(currentText.slice(0, typingText.length - 1));
      }, 26);
    } else {
      timer = window.setTimeout(() => {
        setIsDeleting(false);
        setCurrentTextIndex((prev) => (prev + 1) % heroTypingTargets.length);
      }, 24);
    }

    return () => window.clearTimeout(timer);
  }, [animatePlaceholder, searchQuery, heroTypingTargets, currentTextIndex, isDeleting, typingText]);

  const handleSearchSelect = (suggestion: {
    slug: string;
    category?: string;
    type?: string;
  }) => {
    setSearchQuery("");
    setIsSearchOpen(false);

    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }

    if (
      suggestion.category === "destination" ||
      suggestion.type === "destination"
    ) {
      router.push(`/destinations/${suggestion.slug}`);
    } else if (suggestion.category === "holiday-type") {
      router.push(`/holiday-types/${suggestion.slug}`);
    } else if (suggestion.category === "fixed-departure") {
      router.push(`/fixed-departures/${suggestion.slug}`);
    } else {
      router.push(`/package/${suggestion.slug}`);
    }
  };

  const handleSearchClose = () => {
    setIsSearchOpen(false);
  };

  const BACKGROUND_IMAGES = [
    "https://images.unsplash.com/photo-1506929562872-bb421503ef21?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1548013146-72479768bada?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1513326738677-b964603b136d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1504150558240-0b4fd8946624?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
  ];

  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  useEffect(() => {
    const bgTimer = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 5000); // Change every 5 seconds
    return () => clearInterval(bgTimer);
  }, []);

  return (
    <div className="relative min-h-[100dvh] flex flex-col font-plus-jakarta-sans">
      {/* Hero background with image slider */}
      <div className="absolute inset-0 bg-slate-900 overflow-hidden">
        {BACKGROUND_IMAGES.map((src, index) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
              index === currentBgIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={src}
              alt={`Travel destination ${index + 1}`}
              fill
              priority={index === 0}
              className="object-cover object-center md:object-[center_20%]"
            />
          </div>
        ))}
      </div>

      {/* Hero content */}
      <main className="relative z-10 flex flex-col flex-1 items-center justify-end pb-0 text-center min-h-[90dvh] md:min-h-[110vh] pt-100 md:pt-86">
        <div className="mb-auto"></div>
        <h1 className="max-w-4xl !text-2xl !font-unbounded !font-bold leading-tight tracking-tight md:!text-4xl text-white px-4 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
          Because Travel Should Feel Effortless
        </h1>
        <p className="mt-3 max-w-3xl font-medium !text-white/90 text-md md:text-lg px-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          Discover amazing destinations and create unforgettable memories.
        </p>
        <div className="mt-6 w-full relative">
          {/* Search bar overlapping hero and panel */}
          <div className="relative z-20 mx-auto max-w-3xl px-6">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full min-h-[52px] flex items-center gap-3 rounded-full bg-white px-6 py-3 text-gray-800 border-4 border-blue-500/90 shadow-[0_0_40px_10px_rgba(59,130,246,0.45)] hover:shadow-[0_0_50px_15px_rgba(59,130,246,0.55)] transition-all duration-300 group cursor-pointer"
            >
              <Search className="w-6 h-6 text-[#212B40] group-hover:scale-110 transition-transform duration-300" />
              <div className="flex-1 text-left min-h-[1.25rem]">
                <span className="flex items-center truncate !text-sm text-[#212B40] font-semibold opacity-80">
                  <span className="truncate">{typingText}</span>
                  {animatePlaceholder && !searchQuery && (
                    <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse rounded-full bg-[#212B40]" />
                  )}
                </span>
              </div>
              <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full">
                <span className="text-xs font-bold text-blue-600">Search Destinations</span>
              </div>
            </button>

            {isSearchOpen && (
              <SearchSuggestions
                query={searchQuery}
                onQueryChange={setSearchQuery}
                onSelect={handleSearchSelect}
                isOpen={isSearchOpen}
                onClose={handleSearchClose}
                variant="hero"
                featuredDestinations={featuredDestinations}
              />
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default HeroSection;

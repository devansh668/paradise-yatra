"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Filter, Check, ChevronLeft, ChevronRight, SearchX } from 'lucide-react';
import Image from 'next/image';
import { getImageUrl, getPackagePriceLabel } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Header from '@/components/Header';
import PackageCard from '@/components/ui/PackageCard';
import HorizontalPackageCard from '@/components/ui/HorizontalPackageCard';
import SearchFilterSidebar from '@/components/ui/SearchFilterSidebar';
import { useAuth } from '@/context/AuthContext';
import LoginAlertModal from '@/components/LoginAlertModal';
import CarouselArrows from '@/components/ui/CarouselArrows';
import WhyParadiseDifference from '@/components/WhyParadiseDifference';
import FAQSection from '@/components/FAQSection';

// Helper to format duration display
const formatDurationDisplay = (duration: string) => {
    if (!duration) return 'N/A';
    return duration;
};

// Pagination Component
interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

const Pagination = ({ currentPage, totalPages, onPageChange, className = "" }: PaginationProps) => {
    if (totalPages <= 1) return null;

    const handlePageChange = (page: number) => {
        onPageChange(page);
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <div className={`flex items-center justify-end space-x-2 ${className}`}>
            <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="!text-[12px] !font-bold text-[#314594] border-[#dfe1df] rounded-[6px] transition-all !shadow-none whitespace-nowrap disabled:opacity-30 h-9 px-4 hover:!bg-[#314594] hover:!text-white"
            >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
            </Button>

            <div className="flex items-center space-x-1">
                {getPageNumbers().map((page, index) => (
                    <div key={index}>
                        {page === '...' ? (
                            <span className="px-2 text-slate-400 font-bold">...</span>
                        ) : (
                            <Button
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(page as number)}
                                className={`w-9 h-9 !p-0 !text-[12px] !font-bold rounded-[6px] transition-all !shadow-none ${currentPage === page
                                    ? '!bg-[#314594] !text-white border-transparent'
                                    : '!bg-white !text-[#000945] border-[#dfe1df] hover:bg-slate-50'
                                    }`}
                            >
                                {page}
                            </Button>
                        )}
                    </div>
                ))}
            </div>

            <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="!text-[12px] !font-bold text-[#314594] border-[#dfe1df] rounded-[6px] transition-all !shadow-none whitespace-nowrap disabled:opacity-30 h-9 px-4 hover:!bg-[#314594] hover:!text-white"
            >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
        </div>
    );
};

const PackagesLoadingSkeleton = () => (
    <div className="flex flex-col lg:flex-row gap-0 lg:gap-8">
        <aside className="hidden lg:block lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-32 mt-0.5 border border-slate-100 h-[600px] animate-pulse"></div>
        </aside>
        <div className="flex-1">
            <div className="grid gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden h-64 animate-pulse border border-slate-100"></div>
                ))}
            </div>
        </div>
    </div>
);

interface DedicatedPackagesPageClientProps {
    tourType: 'india' | 'international';
    state?: string;
    country?: string;
}

export default function DedicatedPackagesPageClient({ tourType, state, country }: DedicatedPackagesPageClientProps) {
    const [allItems, setAllItems] = useState<any[]>([]);
    const [filteredItems, setFilteredItems] = useState<any[]>([]);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    
    // Dynamic content
    const [dynamicOverview, setDynamicOverview] = useState<string | null>(null);
    const [dynamicTitle, setDynamicTitle] = useState<string | null>(null);
    const [dynamicImage, setDynamicImage] = useState<string | null>(null);

    // Carousel state for suggestions
    const carouselRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    // Filter states
    const [durationFilter, setDurationFilter] = useState<string>('all');
    const [priceFilter, setPriceFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('recommended');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // Wishlist functionality
    const { user, toggleWishlist: contextToggleWishlist, isInWishlist } = useAuth();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const handleWishlistToggle = (e: React.MouseEvent, pkgId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            setIsLoginModalOpen(true);
            return;
        }

        contextToggleWishlist(pkgId);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Build query string
                const params = new URLSearchParams();
                params.append('tourType', tourType);
                params.append('isActive', 'true');
                params.append('limit', '100');
                if (state) params.append('state', state);
                if (country) params.append('country', country);

                // Fetch filtered packages from all-packages
                const packagesResponse = await fetch(`/api/all-packages?${params.toString()}`, { cache: 'no-store' });
                if (!packagesResponse.ok) throw new Error('Failed to fetch packages');

                const packagesData = await packagesResponse.json();
                const packages = packagesData.packages || [];

                setAllItems(packages);
                setFilteredItems(packages);

                // Fetch suggestions from the same source as /package/[slug]
                const suggestionsResponse = await fetch(`/api/all-packages?limit=24&isActive=true`, { cache: 'no-store' });
                if (suggestionsResponse.ok) {
                    const suggestionsData = await suggestionsResponse.json();
                    const suggestionsArray = Array.isArray(suggestionsData)
                        ? suggestionsData
                        : Array.isArray(suggestionsData?.packages)
                            ? suggestionsData.packages
                            : [];

                    const currentPackageIds = new Set(
                        packages.map((pkg: any) => pkg?._id).filter(Boolean)
                    );

                    setSuggestions(
                        suggestionsArray
                            .filter((pkg: any) => pkg?.isActive !== false && !currentPackageIds.has(pkg?._id))
                            .slice(0, 9)
                    );
                }

                // Fetch dynamic overview
                try {
                    const contentKey = (state || country || 'travel').toLowerCase().replace(/\s+/g, '-');
                    const contentResponse = await fetch(`/api/page-content/${contentKey}`);
                    if (contentResponse.ok) {
                        const contentData = await contentResponse.json();
                        if (contentData.success && contentData.data) {
                            setDynamicOverview(contentData.data.content);
                            if (contentData.data.image) setDynamicImage(contentData.data.image);
                            if (contentData.data.title) setDynamicTitle(contentData.data.title);
                        }
                    }
                } catch (e) {
                    console.error("Failed to fetch dynamic content", e);
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching packages:', error);
                setError('Failed to load packages');
                setLoading(false);
            }
        };

        fetchData();
    }, [tourType, state, country]);

    // Filter items based on selected filters
    useEffect(() => {
        let filtered = [...allItems];

        // Filter by duration
        if (durationFilter !== 'all') {
            const extractDays = (duration: string): number => {
                if (!duration) return 0;
                const match = duration.match(/(\d+)\s*(?:Days?|D)/i);
                if (match) return parseInt(match[1], 10);
                const firstNumber = duration.match(/\d+/);
                return firstNumber ? parseInt(firstNumber[0], 10) : 0;
            };

            filtered = filtered.filter(item => {
                const days = extractDays(item.duration || '');
                switch (durationFilter) {
                    case '1-3': return days >= 1 && days <= 3;
                    case '4-6': return days >= 4 && days <= 6;
                    case '7-9': return days >= 7 && days <= 9;
                    case '10-12': return days >= 10 && days <= 12;
                    case '13+': return days >= 13;
                    default: return true;
                }
            });
        }

        // Filter by price
        if (priceFilter !== 'all') {
            filtered = filtered.filter(item => {
                const price = item.price;
                switch (priceFilter) {
                    case '0-10000': return price >= 0 && price <= 10000;
                    case '10000-20000': return price > 10000 && price <= 20000;
                    case '20000-35000': return price > 20000 && price <= 35000;
                    case '35000-50000': return price > 35000 && price <= 50000;
                    case '50000+': return price > 50000;
                    default: return true;
                }
            });
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'price-asc': return (a.price || 0) - (b.price || 0);
                case 'price-desc': return (b.price || 0) - (a.price || 0);
                case 'duration-asc': return (a.duration || '').localeCompare(b.duration || '');
                default: return 0;
            }
        });

        setFilteredItems(filtered);
        setCurrentPage(1);
    }, [allItems, durationFilter, priceFilter, sortBy]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    // Carousel scroll handling for suggestions
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
            setTimeout(updateScrollState, 500);
            return () => {
                carousel.removeEventListener("scroll", updateScrollState);
                window.removeEventListener("resize", updateScrollState);
            };
        }
    }, [suggestions]);

    const scrollByStep = (direction: number) => {
        if (carouselRef.current) {
            const card = carouselRef.current.querySelector("article");
            const gap = 24;
            const cardWidth = card ? card.getBoundingClientRect().width : 290;
            const step = cardWidth + gap;
            carouselRef.current.scrollBy({ left: direction * step, behavior: "smooth" });
        }
    };

    const locationLabel = state || country || 'Travel';
    const formattedLocation = (locationLabel.charAt(0).toUpperCase() + locationLabel.slice(1))
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    const tourTypeLabel = 'Tour';

    const destinationDescriptions: Record<string, string> = {
        'kerala': 'Known as "God\'s Own Country", Kerala is famous for its serene backwaters, lush tea gardens, pristine beaches, and rich cultural heritage. Experience the perfect blend of nature and tradition as you explore the tranquil networks of canals in Alleppey, the misty hills of Munnar, and the pristine shores of Varkala. From ancient Ayurvedic therapies that rejuvenate the soul to delectable local cuisine infused with fresh spices, Kerala offers a truly transformative escape.',
        'goa': 'Goa is India\'s pocket-sized paradise, renowned for its golden beaches, vibrant nightlife, Portuguese colonial architecture, and delicious seafood. Beyond the lively parties and stunning coastlines, you can explore centuries-old cathedrals, winding spice plantations, and quaint villages that reflect a unique blend of Indian and Portuguese heritage. Whether you seek thrilling water sports, tranquil yoga retreats, or romantic sunset cruises, Goa promises an unforgettable coastal getaway.',
        'rajasthan': 'The Land of Kings, Rajasthan offers a royal experience with its magnificent palaces, historic forts, colorful culture, and the vast Thar Desert. Wander through the pink hues of Jaipur, marvel at the blue city of Jodhpur, and take a serene boat ride on the romantic lakes of Udaipur. With its grand heritage hotels, vibrant bazaars, and traditional folk music, Rajasthan immerses you in the majestic history and enduring charm of India\'s royal past.',
        'kashmir': 'Often referred to as "Paradise on Earth", Kashmir captivates visitors with its snow-capped mountains, beautiful Dal Lake, and blooming Mughal gardens. Drift along the calm waters in a traditional Shikara, glide down the world-class ski slopes of Gulmarg, and wander through lush meadows bursting with colorful wildflowers. The warm hospitality, exquisite handicrafts, and rich culinary traditions make a journey to Kashmir a truly magical and romantic experience.',
        'himachal-pradesh': 'Nestled in the Himalayas, Himachal Pradesh is a haven for nature lovers and adventure enthusiasts, featuring picturesque hill stations and breathtaking landscapes. Whether you are trekking through the stunning valleys of Manali, exploring the colonial charm of Shimla, or finding spiritual peace in Dharamshala, the state offers diverse experiences. With its crisp mountain air, gushing rivers, and serene monasteries, Himachal is the ultimate destination to unwind and connect with nature.',
        'uttarakhand': 'The "Land of Gods", Uttarakhand is famous for its sacred pilgrimage sites, majestic Himalayan peaks, and thrilling adventure sports in Rishikesh. Discover the spiritual aura of Haridwar, embark on the legendary Char Dham yatra, or challenge yourself with white-water rafting and jungle safaris in Jim Corbett National Park. From lush green valleys to snow-covered peaks, Uttarakhand offers both spiritual awakening and heart-pounding adventures.',
        'sikkim': 'A hidden gem in the Northeast, Sikkim boasts stunning views of Mt. Kanchenjunga, serene monasteries, and diverse flora and fauna. Explore the vibrant capital city of Gangtok, drive through the breathtaking high-altitude mountain passes, and immerse yourself in the peaceful ambiance of ancient Buddhist shrines. Known for its organic farming, pristine lakes, and warm local hospitality, Sikkim is a paradise for travelers seeking tranquility and untouched natural beauty.',
        'andaman-and-nicobar-island': 'A tropical paradise offering crystal-clear waters, white sandy beaches, colorful coral reefs, and exciting water sports. Dive into the vibrant underwater world with scuba diving and snorkeling adventures, or simply relax on the sun-kissed shores of Radhanagar Beach. With its fascinating history, dense tropical forests, and secluded island resorts, the Andamans provide the perfect backdrop for romantic honeymoons and thrilling family vacations.',
        'ladakh': 'The Land of High Passes, Ladakh is famous for its stark, breathtaking landscapes, ancient Buddhist monasteries, and thrilling mountain roads. Experience the surreal beauty of the azure Pangong Lake, cross the world\'s highest motorable passes, and marvel at the stark contrast of snow-capped peaks against the desert valleys. The rich Tibetan-Buddhist culture and untamed natural beauty make Ladakh a dream destination for adventurers and spiritual seekers alike.',
        'tamil-nadu': 'Rich in Dravidian culture, Tamil Nadu is known for its magnificent temples, classical arts, hill stations like Ooty, and diverse culinary heritage. Marvel at the towering gopurams of Madurai, stroll through the French colonial streets of Pondicherry, and relax in the cool, misty climate of the Nilgiri Hills. From golden beaches along the Coromandel Coast to ancient stone carvings in Mahabalipuram, Tamil Nadu offers a deep and rewarding cultural immersion.',
        'dubai': 'A city of superlatives, Dubai offers futuristic architecture, luxury shopping, desert safaris, and world-class entertainment. Stand at the top of the Burj Khalifa, explore the massive indoor theme parks, and shop for gold in the traditional souks. Beyond the glitz and glamour, experience the magic of an Arabian night with thrilling dune bashing, camel rides, and dining under the stars in the vast, mystical desert.',
        'thailand': 'The Land of Smiles features pristine beaches, ornate temples, vibrant street life, and world-renowned cuisine. Discover the bustling night markets of Bangkok, explore the historic ruins of Ayutthaya, and relax on the stunning, limestone-fringed islands of Phuket and Krabi. With its incredibly affordable luxury, warm tropical climate, and deeply spiritual Buddhist culture, Thailand remains a favorite getaway for travelers around the globe.',
        'malaysia': 'A melting pot of cultures, Malaysia offers a mix of modern cities, colonial architecture, lush rainforests, and beautiful islands. Admire the iconic Petronas Twin Towers in Kuala Lumpur, explore the historic streets of Penang, and dive into the crystal-clear waters of Langkawi. The country\'s rich multicultural heritage translates into an incredible culinary scene, vibrant festivals, and diverse landscapes ranging from cool tea highlands to ancient jungles.',
        'maldives': 'The ultimate tropical getaway, the Maldives is famous for its luxurious overwater bungalows, crystal-clear lagoons, and vibrant marine life. Spend your days snorkeling alongside manta rays and sea turtles, enjoying private beachside dining, and relaxing in world-class spas floating above the ocean. With its secluded resorts, powdery white sand, and endless turquoise horizons, the Maldives offers unparalleled luxury and romance.',
        'singapore': 'A dynamic city-state known for its stunning skyline, lush green spaces, diverse food scene, and world-class attractions. Marvel at the futuristic Supertrees in Gardens by the Bay, enjoy family-friendly thrills at Universal Studios Sentosa, and savor Michelin-starred street food in the bustling hawker centers. Clean, safe, and incredibly efficient, Singapore flawlessly blends ultra-modern innovation with a rich tapestry of Asian cultures.',
        'indonesia': 'An archipelago of thousands of islands, offering diverse experiences from the cultural hub of Bali to the volcanic landscapes of Java. Explore the iconic terraced rice paddies of Ubud, surf the world-class waves of the coastline, and witness breathtaking sunrises over ancient temples. With its rich spiritual traditions, vibrant arts scene, and incredible biodiversity, Indonesia provides a deeply enriching and adventurous travel experience.'
    };

    const locationKey = locationLabel.toLowerCase().replace(/\s+/g, '-');
    const overviewDescription = dynamicOverview || destinationDescriptions[locationKey] || `Discover the exceptional beauty and rich cultural charm of ${formattedLocation}. Immerse yourself in the authentic local culture, explore awe-inspiring landscapes, and indulge in culinary delights that tell the story of the region. Whether you are seeking thrilling adventures, peaceful relaxation, or a deep dive into history, this destination has something incredible to offer. Let us help you create unforgettable memories on a meticulously curated journey tailored specifically to your unique travel desires.`;
    const finalTitle = dynamicTitle || `Overview of ${formattedLocation}`;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-plus-jakarta-sans">
            <Header />

            <main className="flex-grow pt-0 bg-white">

                {/* Hero Section */}
                <section className="relative flex flex-col md:flex-row w-full md:h-[496px] md:overflow-hidden items-center justify-center bg-white md:bg-transparent">
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="md:hidden w-full px-4 pt-6 pb-2 bg-white text-left z-10 flex-shrink-0"
                    >
                        <h1 className="!text-[32px] !font-black text-slate-900 font-plus-jakarta-sans tracking-tight leading-tight">
                            {tourTypeLabel} Packages in <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#155dfc] to-[#000945]">{formattedLocation}</span>
                        </h1>
                    </motion.div>

                    {/* Image Container */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        className="relative w-full h-[230.4px] md:absolute md:inset-0 md:h-auto flex-shrink-0"
                    >
                        <Image
                            src={dynamicImage || ((state?.toLowerCase().replace(/-/g, ' ').includes('sikkim') ||
                                state?.toLowerCase().replace(/-/g, ' ').includes('gangtok') ||
                                state?.toLowerCase().replace(/-/g, ' ').includes('kalimpong') ||
                                formattedLocation.toLowerCase().includes('sikkim') ||
                                formattedLocation.toLowerCase().includes('gangtok') ||
                                formattedLocation.toLowerCase().includes('kalimpong'))
                                ? '/Destination%20Pages/Sikkim.webp'
                                : (state?.toLowerCase().replace(/-/g, ' ').includes('andaman') ||
                                    formattedLocation.toLowerCase().includes('andaman'))
                                    ? '/Destination%20Pages/Andaman%20and%20Nicobar%20Island.webp'
                                    : (state?.toLowerCase().replace(/-/g, ' ').includes('kashmir') ||
                                        state?.toLowerCase().replace(/-/g, ' ').includes('jammu') ||
                                        formattedLocation.toLowerCase().includes('kashmir') ||
                                        formattedLocation.toLowerCase().includes('jammu'))
                                        ? '/Destination%20Pages/Jammu%20and%20Kashmir.webp'
                                        : (state?.toLowerCase().replace(/-/g, ' ').includes('rajasthan') ||
                                            state?.toLowerCase().replace(/-/g, ' ').includes('jaipur') ||
                                            state?.toLowerCase().replace(/-/g, ' ').includes('udaipur') ||
                                            state?.toLowerCase().replace(/-/g, ' ').includes('jodhpur') ||
                                            state?.toLowerCase().replace(/-/g, ' ').includes('jaisalmer') ||
                                            formattedLocation.toLowerCase().includes('rajasthan') ||
                                            formattedLocation.toLowerCase().includes('jaipur') ||
                                            formattedLocation.toLowerCase().includes('udaipur') ||
                                            formattedLocation.toLowerCase().includes('jodhpur') ||
                                            formattedLocation.toLowerCase().includes('jaisalmer'))
                                            ? '/Destination%20Pages/Rajasthan.webp'
                                            : (state?.toLowerCase().replace(/-/g, ' ').includes('uttarakhand') ||
                                                state?.toLowerCase().replace(/-/g, ' ').includes('nainital') ||
                                                state?.toLowerCase().replace(/-/g, ' ').includes('rishikesh') ||
                                                state?.toLowerCase().replace(/-/g, ' ').includes('mussoorie') ||
                                                state?.toLowerCase().replace(/-/g, ' ').includes('dehradun') ||
                                                state?.toLowerCase().replace(/-/g, ' ').includes('haridwar') ||
                                                formattedLocation.toLowerCase().includes('uttarakhand') ||
                                                formattedLocation.toLowerCase().includes('nainital') ||
                                                formattedLocation.toLowerCase().includes('rishikesh') ||
                                                formattedLocation.toLowerCase().includes('mussoorie') ||
                                                formattedLocation.toLowerCase().includes('dehradun') ||
                                                formattedLocation.toLowerCase().includes('haridwar'))
                                                ? '/Destination%20Pages/Uttarakhand.webp'
                                                : (state?.toLowerCase().replace(/-/g, ' ').includes('goa') ||
                                                    state?.toLowerCase().replace(/-/g, ' ').includes('panjim') ||
                                                    formattedLocation.toLowerCase().includes('goa') ||
                                                    formattedLocation.toLowerCase().includes('panjim'))
                                                    ? '/Destination%20Pages/Goa.webp'
                                                    : (state?.toLowerCase().replace(/-/g, ' ').includes('kerala') ||
                                                        state?.toLowerCase().replace(/-/g, ' ').includes('kochi') ||
                                                        state?.toLowerCase().replace(/-/g, ' ').includes('munnar') ||
                                                        state?.toLowerCase().replace(/-/g, ' ').includes('alleppey') ||
                                                        formattedLocation.toLowerCase().includes('kerala') ||
                                                        formattedLocation.toLowerCase().includes('kochi') ||
                                                        formattedLocation.toLowerCase().includes('munnar') ||
                                                        formattedLocation.toLowerCase().includes('alleppey'))
                                                        ? '/Destination%20Pages/Kerala.webp'
                                                        : (state?.toLowerCase().replace(/-/g, ' ').includes('himachal') ||
                                                            state?.toLowerCase().replace(/-/g, ' ').includes('shimla') ||
                                                            state?.toLowerCase().replace(/-/g, ' ').includes('manali') ||
                                                            formattedLocation.toLowerCase().includes('himachal') ||
                                                            formattedLocation.toLowerCase().includes('shimla') ||
                                                            formattedLocation.toLowerCase().includes('manali'))
                                                            ? '/Destination%20Pages/Himachal%20Pradesh.webp'
                                                            : (state?.toLowerCase().replace(/-/g, ' ').includes('ladakh') ||
                                                                state?.toLowerCase().replace(/-/g, ' ').includes('leh') ||
                                                                state?.toLowerCase().replace(/-/g, ' ').includes('nubra') ||
                                                                state?.toLowerCase().replace(/-/g, ' ').includes('zanskar') ||
                                                                formattedLocation.toLowerCase().includes('ladakh') ||
                                                                formattedLocation.toLowerCase().includes('leh') ||
                                                                formattedLocation.toLowerCase().includes('nubra') ||
                                                                formattedLocation.toLowerCase().includes('zanskar'))
                                                                ? '/Destination%20Pages/Ladakh.webp'
                                                                : (state?.toLowerCase().replace(/-/g, ' ').includes('tamil nadu') ||
                                                                    state?.toLowerCase().replace(/-/g, ' ').includes('ooty') ||
                                                                    state?.toLowerCase().replace(/-/g, ' ').includes('chennai') ||
                                                                    state?.toLowerCase().replace(/-/g, ' ').includes('madurai') ||
                                                                    state?.toLowerCase().replace(/-/g, ' ').includes('kanyakumari') ||
                                                                    formattedLocation.toLowerCase().includes('tamil nadu') ||
                                                                    formattedLocation.toLowerCase().includes('ooty') ||
                                                                    formattedLocation.toLowerCase().includes('chennai') ||
                                                                    formattedLocation.toLowerCase().includes('madurai') ||
                                                                    formattedLocation.toLowerCase().includes('kanyakumari'))
                                                                    ? '/Destination Pages/Tamil Nadu.webp'
                                                                    : (state?.toLowerCase().replace(/-/g, ' ').includes('thailand') ||
                                                                        formattedLocation.toLowerCase().includes('thailand'))
                                                                        ? '/Destination%20Pages/Thailand.webp'
                                                                        : (state?.toLowerCase().replace(/-/g, ' ').includes('malaysia') ||
                                                                            formattedLocation.toLowerCase().includes('malaysia'))
                                                                            ? '/Destination%20Pages/Malaysia.webp'
                                                                            : (state?.toLowerCase().replace(/-/g, ' ').includes('egypt') ||
                                                                                formattedLocation.toLowerCase().includes('egypt'))
                                                                                ? '/Destination%20Pages/Egypt.webp'
                                                                                : (state?.toLowerCase().replace(/-/g, ' ').includes('indonesia') ||
                                                                                    formattedLocation.toLowerCase().includes('indonesia'))
                                                                                    ? '/Destination%20Pages/Indonesia.webp'
                                                                                    : (state?.toLowerCase().replace(/-/g, ' ').includes('kenya') ||
                                                                                        formattedLocation.toLowerCase().includes('kenya'))
                                                                                        ? '/Destination%20Pages/Kenya.webp'
                                                                                        : (state?.toLowerCase().replace(/-/g, ' ').includes('maldives') ||
                                                                                            formattedLocation.toLowerCase().includes('maldives'))
                                                                                            ? '/Destination%20Pages/Maldives.webp'
                                                                                            : (state?.toLowerCase().replace(/-/g, ' ').includes('singapore') ||
                                                                                                formattedLocation.toLowerCase().includes('singapore'))
                                                                                                ? '/Destination%20Pages/Singapore.webp'
                                                                                                : (state?.toLowerCase().replace(/-/g, ' ').includes('united arab emirates') ||
                                                                                                    state?.toLowerCase().replace(/-/g, ' ').includes('dubai') ||
                                                                                                    state?.toLowerCase().replace(/-/g, ' ').includes('uae') ||
                                                                                                    formattedLocation.toLowerCase().includes('united arab emirates') ||
                                                                                                    formattedLocation.toLowerCase().includes('dubai') ||
                                                                                                    formattedLocation.toLowerCase().includes('uae'))
                                                                                                    ? '/Destination%20Pages/United%20Arab%20Emirates.webp'
                                                                                                    : "https://images.unsplash.com/photo-1544735716-a9ff2824d7c1?q=80&w=2070&auto=format&fit=crop")}
                            alt={`${formattedLocation} Tourism`}
                            fill
                            className="object-cover transition-transform duration-1000 hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 100vw"
                            fetchPriority="high"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#000945]/90 via-[#000945]/40 to-transparent mix-blend-multiply" />
                    </motion.div>

                    {/* Centered Hub (Hidden on mobile since highlights are hidden) */}
                    <div className="hidden md:block max-w-6xl w-full mx-auto px-4 md:px-8 relative z-30">
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="flex flex-col items-center max-w-5xl mx-auto w-full"
                        >
                            <Card className="bg-white/80 backdrop-blur-xl rounded-[20px] shadow-2xl border border-white/40 overflow-hidden w-full md:h-[160px] flex items-center transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,9,69,0.3)] hover:bg-white/90">
                                <CardContent className="p-0 md:p-8 w-full h-full flex flex-col justify-center items-center">
                                    {/* Desktop Heading */}
                                    <h2 className="hidden md:block !text-xl md:!text-[48px] !font-black text-slate-900 mb-6 text-center font-plus-jakarta-sans tracking-tight leading-tight drop-shadow-sm">
                                        {tourTypeLabel} Packages in <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#155dfc] to-[#000945]">{formattedLocation}</span>
                                    </h2>

                                    <div className="hidden md:flex flex-nowrap items-center justify-center gap-x-6 lg:gap-x-12 w-full px-2 md:px-4 overflow-x-auto no-scrollbar">
                                        {[
                                            { text: 'Best pricing' },
                                            { text: 'Private cab included' },
                                            { text: 'Handpicked hotels' },
                                            { text: 'Local expert support' }
                                        ].map((highlight, idx) => (
                                            <motion.div 
                                                key={idx}
                                                whileHover={{ scale: 1.05 }}
                                                className="flex items-center gap-3 group flex-shrink-0 cursor-pointer"
                                            >
                                                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-50/80 text-[#155dfc] border border-blue-100/50 flex-shrink-0 shadow-sm transition-colors group-hover:bg-[#155dfc] group-hover:text-white">
                                                    <Check className="w-4 h-4 stroke-[2.5]" />
                                                </div>
                                                <span className="text-slate-800 font-bold text-[12px] md:text-[15px] tracking-tight whitespace-nowrap group-hover:text-[#155dfc] transition-colors">{highlight.text}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </section>

                {/* Main Content Area */}
                <section className="py-8 md:py-16 px-4 md:px-8 bg-gradient-to-br from-[#e8f1fc] via-[#f4f7fc] to-[#eef2f9] relative">
                    {/* Premium Dot Pattern Background */}
                    <div className="absolute inset-0 bg-[radial-gradient(#b8c9e0_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none"></div>
                    
                    <div className="max-w-6xl mx-auto relative z-10">
                        {/* Destination Overview Section */}
                        <div className="mb-10 text-left bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-[20px] shadow-sm border border-slate-100/50">
                            <h2 className="!text-[24px] md:!text-[32px] !font-bold text-[#000945] mb-4">
                                {finalTitle}
                            </h2>
                            <p className="text-slate-600 text-base md:text-lg leading-relaxed font-medium">
                                {overviewDescription}
                            </p>
                        </div>

                <div className="mb-6 text-left">
                    <h2 className="!text-[24px] md:!text-[36px] !font-bold text-[#000945] mb-2">
                        Handpicked Curated Journeys
                    </h2>
                </div>
                {loading ? (
                    <PackagesLoadingSkeleton />
                ) : (
                    <div className="flex flex-col lg:flex-row gap-0 lg:gap-8">

                        {/* Sidebar Filters */}
                        <aside className="hidden lg:block lg:w-80 flex-shrink-0">
                            <div className="lg:sticky lg:top-32 lg:mt-0.5">

                                <Card className="hidden lg:block border border-[#dfe1df] shadow-[0_10px_30px_-15px_rgba(0,9,69,0.1)] overflow-hidden p-0 bg-white rounded-[24px]">
                                    <SearchFilterSidebar
                                        durationFilter={durationFilter}
                                        setDurationFilter={setDurationFilter}
                                        priceFilter={priceFilter}
                                        setPriceFilter={setPriceFilter}
                                        onClearFilters={() => {
                                            setDurationFilter('all');
                                            setPriceFilter('all');
                                            setSortBy('recommended');
                                        }}
                                    />
                                </Card>
                            </div>
                        </aside>

                        {/* Package Content */}
                        <div className="flex-1">
                            <div className="flex items-center justify-between lg:justify-end gap-3 mb-6 md:mb-8">
                                <button
                                    onClick={() => setIsFiltersOpen(true)}
                                    className="lg:hidden flex items-center justify-center h-9 rounded-[6px] border border-slate-200 bg-white text-slate-900 font-medium text-xs px-6 shadow-none"
                                    style={{ boxShadow: 'none' }}
                                >
                                    <Filter className="mr-2 h-3.5 w-3.5 text-slate-500" />
                                    Filters
                                </button>

                                <div className="flex items-center gap-2 sm:gap-3">
                                    <span className="hidden sm:inline text-sm font-medium text-slate-500">Sort by:</span>
                                    <Select
                                        value={sortBy}
                                        onValueChange={setSortBy}
                                    >
                                        <SelectTrigger
                                            className="w-[140px] bg-white border-slate-200 font-medium text-slate-900 rounded-[6px] h-9 text-xs px-4 shadow-none !shadow-none"
                                            style={{ boxShadow: 'none' }}
                                        >
                                            <SelectValue placeholder="Recommended" />
                                        </SelectTrigger>
                                        <SelectContent className="!rounded-[6px] border-slate-100 shadow-xl">
                                            <SelectItem value="recommended">Recommended</SelectItem>
                                            <SelectItem value="price-asc">Price: Low to High</SelectItem>
                                            <SelectItem value="price-desc">Price: High to Low</SelectItem>
                                            <SelectItem value="duration-asc">Duration</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {filteredItems.length > 0 ? (
                                <div className="space-y-6">
                                    {paginatedItems.map((item) => (
                                        <HorizontalPackageCard
                                            key={item._id}
                                            id={item._id}
                                            title={item.name}
                                            destination={item.location}
                                            duration={item.duration}
                                            description={item.shortDescription || item.description}
                                            price={item.price}
                                            priceLabel={getPackagePriceLabel(item.priceType)}
                                            image={item.image}
                                            images={item.images || item.gallery}
                                            imageAlt={item.imageAlt || item.name}
                                            detailUrl={`/package/${item.slug || item._id}`}
                                            isInWishlist={isInWishlist(item._id)}
                                            onWishlistToggle={handleWishlistToggle}
                                        />
                                    ))}

                                    {totalPages > 1 && (
                                        <div className="mt-12">
                                            <Pagination
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                onPageChange={setCurrentPage}
                                                className="mt-6"
                                            />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-white rounded-[6px] border border-[#dfe1df] shadow-none">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-5">
                                        <SearchX className="w-8 h-8 text-[#000945] opacity-20" />
                                    </div>
                                    <h3 className="!text-xl !font-bold text-[#000945] mb-2">No packages found</h3>
                                    <p className="!text-[#000945]/70 !text-sm font-medium max-w-sm mx-auto mb-8">
                                        We couldn't find any packages for {formattedLocation} matching your filters.
                                    </p>
                                    <Button
                                        onClick={() => {
                                            setDurationFilter('all');
                                            setPriceFilter('all');
                                            setSortBy('recommended');
                                        }}
                                        className="!bg-white !text-[#155dfc] font-bold py-2 px-8 rounded-[6px] h-auto text-sm transition-all !border !border-[#dfe1df] !shadow-none hover:bg-slate-50 !cursor-pointer"
                                    >
                                        Clear All Filters
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>

                <WhyParadiseDifference />
                <FAQSection destination={state || country} tourType={tourType} />

                {suggestions.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-b from-white to-slate-50 px-4 py-12 text-gray-900 md:px-8 relative z-20 border-t border-slate-100"
                    >
                        <div className="mx-auto flex max-w-6xl flex-col gap-6 relative z-10">
                            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between mb-2">
                                <div className="flex flex-col gap-1">
                                    <h3 className="!text-[24px] md:!text-[36px] !font-bold !text-[#000945] !leading-tight tracking-tight">
                                        You Might Also Like
                                    </h3>
                                    <p className="!text-sm !text-slate-500 md:!text-base !max-w-2xl !font-medium">
                                        Explore more amazing packages and create unforgettable memories
                                    </p>
                                </div>
                            </div>

                            <div className="relative -mx-4 px-4 md:mx-0 md:px-0 group/carousel">
                                <CarouselArrows
                                    onPrevious={() => scrollByStep(-1)}
                                    onNext={() => scrollByStep(1)}
                                    canScrollLeft={canScrollLeft}
                                    canScrollRight={canScrollRight}
                                />
                                <div
                                    ref={carouselRef}
                                    className="flex gap-6 overflow-x-auto scroll-smooth pb-8 pt-2 scrollbar-hide px-2"
                                    style={{
                                        scrollbarWidth: "none",
                                        msOverflowStyle: "none",
                                        scrollSnapType: "x mandatory",
                                    }}
                                >
                                    {suggestions.map((pkg, index) => (
                                        <PackageCard
                                            key={`${pkg._id}-${index}`}
                                            id={pkg._id}
                                            destination={pkg.location}
                                            duration={pkg.duration}
                                            title={pkg.name}
                                            price={pkg.price || 0}
                                            image={getImageUrl(pkg.image) || `https://picsum.photos/800/500?random=${index + 50}`}
                                            imageAlt={pkg.imageAlt || pkg.name}
                                            slug={pkg.slug || pkg._id}
                                            hrefPrefix="/package"
                                            themeColor="#005beb"
                                            priceLabel={getPackagePriceLabel(pkg.priceType)}
                                            isInWishlist={isInWishlist(pkg._id)}
                                            onWishlistToggle={handleWishlistToggle}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.section>
                )}
            </main>

            {/* Mobile Filter Dialog */}
            <Dialog open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <DialogContent className="max-w-md max-h-[90vh] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="p-8 pb-4">
                        <DialogTitle className="!text-xl !font-bold !text-[#000945]">Filters</DialogTitle>
                    </DialogHeader>
                    <div className="flex-grow overflow-y-auto px-0">
                        <div className="p-8 pt-0">
                            <SearchFilterSidebar
                                durationFilter={durationFilter}
                                setDurationFilter={setDurationFilter}
                                priceFilter={priceFilter}
                                setPriceFilter={setPriceFilter}
                                onClearFilters={() => {
                                    setDurationFilter('all');
                                    setPriceFilter('all');
                                    setSortBy('recommended');
                                }}
                                onApply={() => setIsFiltersOpen(false)}
                            />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <LoginAlertModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} theme="blue" />
        </div>
    );
}

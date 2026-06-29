"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Calendar, MapPin, Users, Clock, ArrowRight, Star,
    CheckCircle2, ShieldCheck, Zap, Search, Filter,
    TrendingUp, X, SlidersHorizontal, Ticket, Plane, Heart
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import LoginAlertModal from '@/components/LoginAlertModal';

interface Departure {
    _id: string;
    title: string;
    slug: string;
    subtitle?: string;
    destination: string;
    departureDate: string;
    returnDate: string;
    duration: string;
    price: number;
    originalPrice?: number | null;
    availableSeats: number;
    totalSeats: number;
    image: string;
    tag: string;
    typeColor?: string;
    rating?: number;
    reviews?: number;
    location?: string;
    transport?: string;
    hotel?: string;
    meals?: string;
    nextDeparture?: string;
    shortDescription: string;
}

interface FixedDeparturesClientProps {
    departures: Departure[];
}

const stripHtmlTags = (value: string = "") =>
    value
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, "\"")
        .replace(/&#39;/gi, "'")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/\s+/g, " ")
        .trim();

export default function FixedDeparturesClient({ departures }: FixedDeparturesClientProps) {
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPrice, setSelectedPrice] = useState('all');
    const [selectedDuration, setSelectedDuration] = useState('all');
    const [sortBy, setSortBy] = useState('default');
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Image error handling component
    const DepartureImage = ({ src, alt }: { src: string, alt: string }) => {
        const [imgSrc, setImgSrc] = useState(src || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80');
        
        useEffect(() => {
            setImgSrc(src || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80');
        }, [src]);

        return (
            <img
                src={imgSrc}
                alt={alt}
                onError={() => setImgSrc('https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')}
                className="absolute inset-0 w-full h-full object-cover text-transparent group-hover:scale-105 transition-transform duration-700"
            />
        );
    };

    // Wishlist states
    const { user } = useAuth();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const handleWishlistToggle = (e: any, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        // Placeholder for future implementation
    };

    const isInWishlist = (id: string) => false;

    // Extract unique categories from departures, excluding "Fixed Departure"
    const categories = ['All Departures', ...Array.from(new Set(departures.map(d => d.tag).filter(t => t && t !== 'Fixed Departure')))];

    // Restore filters from sessionStorage on mount
    useEffect(() => {
        const savedFilter = sessionStorage.getItem('fd_filter');
        const savedPrice = sessionStorage.getItem('fd_price');
        const savedDuration = sessionStorage.getItem('fd_duration');
        const savedSort = sessionStorage.getItem('fd_sort');
        const savedSearch = sessionStorage.getItem('fd_search');

        if (savedFilter) setFilter(savedFilter);
        if (savedPrice) setSelectedPrice(savedPrice);
        if (savedDuration) setSelectedDuration(savedDuration);
        if (savedSort) setSortBy(savedSort);
        if (savedSearch) setSearchQuery(savedSearch);

        // Robust scroll to top on mount
        if (typeof window !== 'undefined') {
            window.scrollTo(0, 0);
            requestAnimationFrame(() => window.scrollTo(0, 0));
        }

        setIsMounted(true);
    }, []);

    // Save filters to sessionStorage whenever they change
    useEffect(() => {
        if (!isMounted) return;
        sessionStorage.setItem('fd_filter', filter);
        sessionStorage.setItem('fd_price', selectedPrice);
        sessionStorage.setItem('fd_duration', selectedDuration);
        sessionStorage.setItem('fd_sort', sortBy);
        sessionStorage.setItem('fd_search', searchQuery);
    }, [filter, selectedPrice, selectedDuration, sortBy, searchQuery, isMounted]);

    const filteredDepartures = departures.filter(item => {
        const matchesCategory = filter === 'all' ||
            item.tag.toLowerCase() === filter.toLowerCase();

        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.destination.toLowerCase().includes(searchQuery.toLowerCase());

        // Price Filter Logic
        let matchesPrice = true;
        if (selectedPrice === 'under_15k') matchesPrice = item.price < 15000;
        else if (selectedPrice === '15k_25k') matchesPrice = item.price >= 15000 && item.price <= 25000;
        else if (selectedPrice === 'above_25k') matchesPrice = item.price > 25000;

        // Duration Filter Logic
        let matchesDuration = true;
        const days = parseInt(item.duration.split('/')[1]?.trim() || item.duration) || 0;
        if (selectedDuration === 'short') matchesDuration = days <= 5;
        else if (selectedDuration === 'medium') matchesDuration = days > 5 && days <= 10;
        else if (selectedDuration === 'long') matchesDuration = days > 10;

        return matchesCategory && matchesSearch && matchesPrice && matchesDuration;
    }).sort((a, b) => {
        if (sortBy === 'price_low') return a.price - b.price;
        if (sortBy === 'price_high') return b.price - a.price;
        if (sortBy === 'duration_short') {
            const daysA = parseInt(a.duration.split('/')[1]?.trim() || a.duration) || 0;
            const daysB = parseInt(b.duration.split('/')[1]?.trim() || b.duration) || 0;
            return daysA - daysB;
        }
        return 0;
    });

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    const clearFilters = () => {
        setFilter('all');
        setSelectedPrice('all');
        setSelectedDuration('all');
        setSearchQuery('');
        setSortBy('default');

        sessionStorage.removeItem('fd_filter');
        sessionStorage.removeItem('fd_price');
        sessionStorage.removeItem('fd_duration');
        sessionStorage.removeItem('fd_sort');
        sessionStorage.removeItem('fd_search');
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    const topFilterBar = (isMobile: boolean, hideSearch = false) => (
        <div className={`flex ${isMobile ? 'flex-col space-y-6' : 'flex-row items-center justify-between gap-6 w-full'}`}>
            {/* Search Input */}
            {!hideSearch && (
                <div className={`${isMobile ? 'w-full' : 'flex-1 max-w-sm'} relative group`}>
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 !text-slate-400 group-focus-within:!text-blue-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search destination..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all !font-bold !text-slate-900 !text-sm shadow-sm"
                    />
                </div>
            )}

            <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'flex-row items-center gap-4 flex-wrap'}`}>
                {/* Price Filter */}
                <select
                    value={selectedPrice}
                    onChange={(e) => {
                        setSelectedPrice(e.target.value);
                        if (isMobile) setIsMobileFilterOpen(false);
                    }}
                    className="py-3 px-4 bg-white border border-slate-200 rounded-xl !font-bold !text-sm !text-slate-700 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none cursor-pointer"
                >
                    <option value="all">Any Price</option>
                    <option value="under_15k">Under ₹15,000</option>
                    <option value="15k_25k">₹15,000 - ₹25,000</option>
                    <option value="above_25k">Above ₹25,000</option>
                </select>

                {/* Duration Filter */}
                <select
                    value={selectedDuration}
                    onChange={(e) => {
                        setSelectedDuration(e.target.value);
                        if (isMobile) setIsMobileFilterOpen(false);
                    }}
                    className="py-3 px-4 bg-white border border-slate-200 rounded-xl !font-bold !text-sm !text-slate-700 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none cursor-pointer"
                >
                    <option value="all">Any Duration</option>
                    <option value="short">Short (1-5 Days)</option>
                    <option value="medium">Medium (6-10 Days)</option>
                    <option value="long">Long (11+ Days)</option>
                </select>

                {/* Sort Filter */}
                <div className={`flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm ${isMobile ? 'w-full' : ''}`}>
                    <Filter className="w-4 h-4 !text-slate-400" />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 !font-bold !text-sm !text-slate-700 outline-none cursor-pointer w-full"
                    >
                        <option value="default">Sort: Recommended</option>
                        <option value="price_low">Price: Low to High</option>
                        <option value="price_high">Price: High to Low</option>
                        <option value="duration_short">Duration: Shortest First</option>
                    </select>
                </div>

                {/* Reset Button */}
                {(filter !== 'all' || selectedPrice !== 'all' || selectedDuration !== 'all' || searchQuery !== '') && (
                    <button
                        onClick={clearFilters}
                        className="py-3 px-4 bg-red-50 !text-red-600 border border-red-100 rounded-xl !font-bold !text-sm hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                    >
                        <X className="w-4 h-4" />
                        <span className={isMobile ? 'inline' : 'hidden md:inline'}>Clear</span>
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="font-plus-jakarta-sans bg-slate-50 min-h-screen"
        >
            <Header />

            {/* Vibrant Interactive Hero */}
            <section className="relative min-h-[400px] md:min-h-[500px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-950 via-blue-900 to-indigo-900 pt-20">
                {/* Dynamic Background Patterns */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="absolute w-[800px] h-[800px] bg-blue-500/20 blur-[120px] rounded-full top-[-200px] left-[-200px] animate-pulse" />
                    <div className="absolute w-[600px] h-[600px] bg-purple-500/20 blur-[100px] rounded-full bottom-[-100px] right-[-100px]" style={{ animationDuration: '4s' }} />
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff22_1px,transparent_1px)] [background-size:24px_24px] opacity-30"></div>
                </div>

                <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10 w-full text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-6 flex flex-col items-center"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md shadow-2xl">
                            <Ticket className="w-4 h-4 text-blue-300" />
                            <span className="text-[12px] font-black uppercase tracking-[0.2em] text-white">Curated Group Journeys</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight max-w-4xl mx-auto drop-shadow-2xl">
                            The World is Waiting. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-200 to-blue-300">
                                Your Seat is Reserved.
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-blue-100/90 font-medium leading-relaxed max-w-2xl mx-auto">
                            Experience premium group travel with guaranteed departure dates. Lock in your adventure, pack your bags, and leave the planning to us.
                        </p>
                    </motion.div>

                    {/* Premium Stats Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="flex flex-wrap justify-center gap-4 md:gap-12 pt-8"
                    >
                        {[
                            { label: 'Confirmed Batches', count: '45+', icon: CheckCircle2 },
                            { label: 'Happy Travelers', count: '1,000+', icon: Users },
                            { label: 'Expert Guides', count: '100%', icon: ShieldCheck },
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md mb-1">
                                    <stat.icon className="w-5 h-5 text-blue-300" />
                                </div>
                                <div className="text-white font-black text-2xl tracking-tight">{stat.count}</div>
                                <div className="text-[10px] text-blue-200 uppercase font-bold tracking-[0.2em]">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Main Content Area */}
            <main id="departures-list" className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-16 -mt-10 relative z-20">
                
                {/* Top Filter Bar (Desktop) */}
                <div className="hidden lg:block bg-white/80 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-4 mb-12 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                    {topFilterBar(false)}
                </div>

                {/* Mobile Search & Filter Trigger */}
                <div className="lg:hidden space-y-4 mb-8">
                    <div className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{filteredDepartures.length} Departures</p>
                            <h2 className="text-lg font-black text-slate-900">Explore Tours</h2>
                        </div>
                        <button
                            onClick={() => setIsMobileFilterOpen(true)}
                            className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            Filters
                        </button>
                    </div>
                </div>

                {/* Mobile Filter Modal */}
                <AnimatePresence>
                    {isMobileFilterOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsMobileFilterOpen(false)}
                                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] lg:hidden"
                            />
                            <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="fixed inset-x-0 bottom-0 bg-slate-50 rounded-t-[2.5rem] z-[101] lg:hidden max-h-[90vh] overflow-y-auto"
                            >
                                <div className="sticky top-0 bg-white/90 backdrop-blur-xl px-6 py-5 border-b border-slate-100 flex items-center justify-between z-10 shadow-sm">
                                    <h2 className="text-xl font-black text-slate-900">Filters</h2>
                                    <button
                                        onClick={() => setIsMobileFilterOpen(false)}
                                        className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="p-6">
                                    {topFilterBar(true)}
                                </div>
                                <div className="p-6 pt-0 sticky bottom-0 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent">
                                    <button
                                        onClick={() => setIsMobileFilterOpen(false)}
                                        className="w-full py-4 bg-blue-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-600/20"
                                    >
                                        Show {filteredDepartures.length} Results
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Departures Ticket List */}
                <div>
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-6"
                    >
                        <AnimatePresence mode='popLayout'>
                            {filteredDepartures.map((item) => (
                                <motion.div
                                    key={item._id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4 }}
                                    className="group relative"
                                >
                                    <Link href={`/fixed-departures/${item.slug}`}>
                                        {/* Ticket Container */}
                                        <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden border border-slate-100 group-hover:border-indigo-100">
                                            
                                            {/* Left: Image Area */}
                                            <div className="relative w-full md:w-[320px] h-64 md:h-auto flex-shrink-0 bg-slate-200 overflow-hidden">
                                                <DepartureImage
                                                    src={item.image}
                                                    alt={item.title}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                                                
                                                {/* Location Tag */}
                                                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest text-indigo-700 flex items-center gap-1.5 shadow-sm">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    {item.destination}
                                                </div>

                                                
                                                <div
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={(e) => handleWishlistToggle(e, item._id)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            handleWishlistToggle(e as any, item._id);
                                                        }
                                                    }}
                                                    className="absolute top-4 right-4 z-20 p-2.5 bg-white/20 backdrop-blur-md rounded-full shadow-sm hover:bg-white transition-all group/wishlist border border-white/30 cursor-pointer"
                                                >
                                                    <Heart
                                                        className={`w-4 h-4 transition-colors ${isInWishlist(item._id)
                                                            ? 'fill-red-500 text-red-500'
                                                            : 'text-white group-hover/wishlist:text-red-500'
                                                            }`}
                                                    />
                                                </div>
                                                
                                                <div className="absolute bottom-4 left-4 right-4">
                                                    <h3 className="text-xl md:text-2xl font-black text-white leading-tight drop-shadow-md">
                                                        {item.title}
                                                    </h3>
                                                </div>
                                            </div>

                                            {/* Middle: Details Area */}
                                            <div className="flex-1 p-6 md:p-8 flex flex-col justify-between bg-white relative">
                                                <div className="space-y-6">


                                                    <p className="text-slate-500 font-medium text-sm leading-relaxed line-clamp-2">
                                                        {stripHtmlTags(item.subtitle || item.shortDescription)}
                                                    </p>

                                                    <div className="flex flex-wrap gap-3">
                                                        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                            <Clock className="w-4 h-4 text-slate-400" />
                                                            <span className="text-xs font-bold text-slate-700">{item.duration}</span>
                                                        </div>
                                                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${item.availableSeats < 10 ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-700'}`}>
                                                            <Users className="w-4 h-4" />
                                                            <span className="text-xs font-bold">{item.availableSeats} Seats Left</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Dashed Divider with Cutouts */}
                                            <div className="hidden md:flex flex-col items-center justify-center relative bg-white w-8">
                                                <div className="absolute top-[-10px] w-6 h-6 bg-slate-50 rounded-full border border-slate-100 border-t-0 border-l-0 -rotate-45 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.02)]"></div>
                                                <div className="h-full w-[2px] border-l-2 border-dashed border-slate-200"></div>
                                                <div className="absolute bottom-[-10px] w-6 h-6 bg-slate-50 rounded-full border border-slate-100 border-b-0 border-r-0 -rotate-45 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.02)]"></div>
                                            </div>

                                            {/* Mobile Divider */}
                                            <div className="md:hidden flex items-center justify-center relative bg-white h-8 w-full">
                                                <div className="absolute left-[-10px] w-6 h-6 bg-slate-50 rounded-full border border-slate-100 border-l-0 border-b-0 rotate-45"></div>
                                                <div className="w-full h-[2px] border-t-2 border-dashed border-slate-200"></div>
                                                <div className="absolute right-[-10px] w-6 h-6 bg-slate-50 rounded-full border border-slate-100 border-r-0 border-t-0 rotate-45"></div>
                                            </div>

                                            {/* Right: Pricing & Action */}
                                            <div className="p-6 md:p-8 md:w-[280px] flex flex-col justify-center bg-slate-50/50 group-hover:bg-indigo-50/30 transition-colors">
                                                <div className="flex flex-row md:flex-col items-center md:items-start justify-between md:justify-center gap-4">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Per Person From</p>
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-3xl font-black text-slate-900 tracking-tight">₹{item.price.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                    <div className="w-full flex md:justify-start justify-end">
                                                        <div className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 group-hover:bg-indigo-700 hover:scale-105 transition-all">
                                                            Book Now
                                                            <ArrowRight className="w-4 h-4" />
                                                        </div>
                                                    </div>
                                                </div>
                                                

                                            </div>

                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {filteredDepartures.length === 0 && (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm"
                        >
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2">No departures found</h3>
                            <p className="text-slate-500 font-medium">Try adjusting your filters or searching for a different destination.</p>
                            <button 
                                onClick={clearFilters}
                                className="mt-6 px-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-colors"
                            >
                                Clear All Filters
                            </button>
                        </motion.div>
                    )}
                </div>
            </main>

            {/* Support Section */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="bg-white py-12 md:py-24 border-t border-slate-100 mt-12"
            >
                <div className="max-w-6xl mx-auto px-4 md:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            {
                                title: "Expert Guidance",
                                desc: "Every tour is led by our gold-certified tour managers.",
                                icon: ShieldCheck
                            },
                            {
                                title: "Guaranteed Dates",
                                desc: "Once you book, we go. No last minute cancellations.",
                                icon: CheckCircle2
                            },
                            {
                                title: "Best Value",
                                desc: "Group benefits passed directly to you. Premium stays for less.",
                                icon: Star
                            }
                        ].map((feature, i) => (
                            <div key={i} className="flex gap-6 group cursor-default">
                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 flex-shrink-0 group-hover:scale-110 group-hover:bg-blue-50 transition-all duration-300">
                                    <feature.icon className="w-7 h-7 text-indigo-500" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-slate-900 mb-2">{feature.title}</h4>
                                    <p className="text-slate-500 font-medium text-sm leading-relaxed">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.section>

            <LoginAlertModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} theme="blue" />
        </motion.div>
    );
}

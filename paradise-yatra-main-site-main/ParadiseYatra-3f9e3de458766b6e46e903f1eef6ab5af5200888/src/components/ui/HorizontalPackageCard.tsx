"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, Heart, ArrowRight, Hotel, Utensils, Car, Camera, ChevronLeft, ChevronRight } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import React, { useState } from "react";

interface HorizontalPackageCardProps {
    id: string;
    title: string;
    destination: string;
    duration: string;
    description: string;
    price: number;
    priceLabel?: string;
    image?: string;
    images?: string[];
    imageAlt?: string;
    detailUrl: string;
    isInWishlist: boolean;
    onWishlistToggle: (e: React.MouseEvent, pkgId: string) => void;
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

const formatDurationDisplay = (duration: string) => {
    if (!duration) return "";
    const nightsDaysMatch = duration.match(/^\s*(\d+)\s*N\s*\/\s*(\d+)\s*D\s*$/i);
    if (nightsDaysMatch) {
        const nights = nightsDaysMatch[1];
        const days = nightsDaysMatch[2];
        return `${nights}N/${days}D`;
    }
    return duration;
};

const HorizontalPackageCard: React.FC<HorizontalPackageCardProps> = ({
    id,
    title,
    destination,
    duration,
    description,
    price,
    priceLabel = "Starting From",
    image,
    images = [],
    imageAlt,
    detailUrl,
    isInWishlist,
    onWishlistToggle,
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const plainDescription = stripHtmlTags(description);
    const unitLabel = /couple/i.test(priceLabel) ? "per couple" : "per person";
    const altText = imageAlt?.trim() || title || destination || "Package image";

    const allImages = images && images.length > 0 ? images : image ? [image] : [];

    const handlePrevImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
    };

    const handleNextImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
    };

    const optimizedImageUrl = getImageUrl(allImages[currentImageIndex], {
        width: "auto",
        height: 640,
        crop: "fill",
        gravity: "auto",
        quality: "good",
    });

    return (
        <div className="group relative bg-white rounded-[20px] border border-[#dfe1df] transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,9,69,0.15)] hover:-translate-y-1 overflow-hidden h-auto sm:h-64 flex flex-col sm:flex-row">
            {/* Image Placeholder or Optimized Image */}
            <div className="relative w-full h-48 sm:w-2/5 sm:h-full overflow-hidden shrink-0 group/slider">
                {optimizedImageUrl ? (
                    <>
                        <Image
                            key={currentImageIndex} // force re-render for smooth transition or just let it swap src
                            src={optimizedImageUrl}
                            alt={altText}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            unoptimized={true}
                        />
                        {/* Slider Controls */}
                        {allImages.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrevImage}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 hover:bg-white text-slate-800 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity z-10 shadow-md"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleNextImage}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 hover:bg-white text-slate-800 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity z-10 shadow-md"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                                
                                {/* Pagination Dots */}
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                                    {allImages.map((_, idx) => (
                                        <div 
                                            key={idx} 
                                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-slate-200" />
                    </div>
                )}


                {/* Wishlist Button */}
                <button
                    onClick={(e) => onWishlistToggle(e, id)}
                    className="absolute top-3 right-3 z-40 p-2 rounded-full bg-white/90 backdrop-blur-md border border-white/50 hover:bg-white transition-all shadow-sm cursor-pointer"
                >
                    <Heart
                        className="w-3.5 h-3.5 transition-all duration-300"
                        strokeWidth={2.5}
                        style={{
                            color: "#005beb",
                            fill: isInWishlist ? "#005beb" : "none",
                        }}
                    />
                </button>
            </div>

            {/* Content Section */}
            <div className="flex-1 p-5 sm:pb-5 flex flex-col justify-between min-w-0">
                <div className="block">
                    <div className="inline-flex items-center bg-[#EFF6FF] text-[#314594] text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-1.5">
                        {formatDurationDisplay(duration)}
                    </div>

                    <Link href={detailUrl} className="block group/title">
                        <h3 className="!text-lg sm:!text-[20px] !font-bold text-[#000945] leading-tight mb-1 transition-colors line-clamp-1 group-hover/title:underline">
                            {title}
                        </h3>
                    </Link>

                    <p className="!text-[14px] !text-[#000945] font-normal leading-snug line-clamp-2 mb-3">
                        {plainDescription}
                    </p>

                    <div className="flex items-center space-x-4 mb-3 sm:mb-1">
                        <div className="flex items-center text-[#000945] transition-colors" title="Hotel Included">
                            <Hotel className="w-4 h-4" />
                        </div>
                        <div className="flex items-center text-[#000945] transition-colors" title="Meals Included">
                            <Utensils className="w-4 h-4" />
                        </div>
                        <div className="flex items-center text-[#000945] transition-colors" title="Transfers Included">
                            <Car className="w-4 h-4" />
                        </div>
                        <div className="flex items-center text-[#000945] transition-colors" title="Sightseeing Included">
                            <Camera className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] text-[#000945] font-medium border-l border-slate-200 pl-3">+2 more</span>
                    </div>
                </div>

                <div className="flex items-end justify-between pt-4 border-t border-dashed border-slate-200">
                    <div>
                        <p className="text-[12px] text-[#000945] mb-0.5">from</p>
                        <div className="flex items-baseline">
                            <span className="text-xl font-bold text-[#155dfc]">₹ {(price || 0).toLocaleString()}</span>
                            <span className="text-[10px] text-[#000945] ml-1 font-medium italic">{unitLabel}</span>
                        </div>
                    </div>

                    <Link
                        href={detailUrl}
                        className="bg-gradient-to-r from-[#155dfc] to-[#000945] hover:opacity-90 text-white text-[12px] font-bold py-2.5 px-6 rounded-[10px] transition-all duration-300 flex items-center gap-2 group/btn shadow-md shadow-[#155dfc]/30"
                    >
                        View Details
                        <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HorizontalPackageCard;
